import { google } from "googleapis";
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

// Get Gmail client with stored tokens
async function getGmailClient() {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("schedule_data")
    .select("value")
    .eq("key", "gmail_tokens")
    .single();

  if (error || !data?.value) return null;

  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.NEXT_PUBLIC_APP_URL + "/api/auth/gmail/callback"
  );

  oauth2Client.setCredentials(data.value);

  // Handle token refresh
  oauth2Client.on("tokens", async (tokens) => {
    const merged = { ...data.value, ...tokens };
    const sb = getSupabase();
    await sb
      .from("schedule_data")
      .upsert({ key: "gmail_tokens", value: merged }, { onConflict: "key" });
  });

  return google.gmail({ version: "v1", auth: oauth2Client });
}

// Extract text from email parts
function extractBody(payload) {
  if (!payload) return "";

  // Simple body
  if (payload.body?.data) {
    return Buffer.from(payload.body.data, "base64url").toString("utf-8");
  }

  // Multipart — prefer text/plain, fall back to text/html
  if (payload.parts) {
    const textPart = payload.parts.find(p => p.mimeType === "text/plain");
    if (textPart?.body?.data) {
      return Buffer.from(textPart.body.data, "base64url").toString("utf-8");
    }
    const htmlPart = payload.parts.find(p => p.mimeType === "text/html");
    if (htmlPart?.body?.data) {
      const html = Buffer.from(htmlPart.body.data, "base64url").toString("utf-8");
      // Strip HTML tags for plain text
      return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
    }
    // Nested multipart
    for (const part of payload.parts) {
      const nested = extractBody(part);
      if (nested) return nested;
    }
  }
  return "";
}

// Parse email with Claude API
async function parseBookingEmail(subject, body, fromEmail) {
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1000,
      messages: [{
        role: "user",
        content: `Parse this booking confirmation email and extract structured data. Return ONLY valid JSON, no other text.

From: ${fromEmail}
Subject: ${subject}

Body (first 3000 chars):
${body.substring(0, 3000)}

Return JSON in this exact format:
{
  "is_booking_confirmation": true/false,
  "type": "flight" or "hotel",
  "provider": "Ryanair" or "Aer Lingus" or "Vueling" or "Booking.com" or hotel name,
  "confirmation_code": "ABC123" or null,
  "details": {
    "from": "departure city/airport" or null,
    "to": "arrival city/airport" or null,
    "outbound_date": "YYYY-MM-DD" or null,
    "outbound_time": "HH:MM" or null,
    "outbound_flight": "FR1234" or null,
    "return_date": "YYYY-MM-DD" or null,
    "return_time": "HH:MM" or null,
    "return_flight": "FR5678" or null,
    "hotel_name": "Hotel Name" or null,
    "check_in": "YYYY-MM-DD" or null,
    "check_out": "YYYY-MM-DD" or null,
    "location": "city/area" or null,
    "guests": number or null,
    "total_price": "€123.45" or null
  },
  "summary": "One line summary e.g. 'Ryanair BCN→DUB Jul 14, 08:30 (FR1234)'"
}

If this is NOT a booking confirmation (e.g. marketing email, newsletter), set is_booking_confirmation to false and leave other fields null.`
      }]
    }),
  });

  const data = await response.json();

  try {
    const text = data.content?.[0]?.text?.trim() || "";
    const clean = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    return JSON.parse(clean);
  } catch (e) {
    console.error("Failed to parse Claude response:", e);
    return { is_booking_confirmation: false };
  }
}

// Match a booking to the nearest tournament
function matchToTournament(booking, tournaments) {
  if (!booking.details) return null;

  // Get the relevant date from the booking
  let bookingDate = null;
  if (booking.type === "flight" && booking.details.outbound_date) {
    bookingDate = new Date(booking.details.outbound_date);
  } else if (booking.type === "hotel" && booking.details.check_in) {
    bookingDate = new Date(booking.details.check_in);
  }
  if (!bookingDate || isNaN(bookingDate)) return null;

  // Find closest tournament within 3 days
  let bestMatch = null;
  let bestDist = Infinity;

  for (const t of tournaments) {
    const tStart = new Date(2026, t.start[0], t.start[1]);
    const tEnd = new Date(2026, t.end[0], t.end[1]);

    // Check if booking date is within 3 days before tournament start to tournament end
    const daysBefore = (tStart - bookingDate) / (1000 * 60 * 60 * 24);
    const daysAfter = (bookingDate - tEnd) / (1000 * 60 * 60 * 24);

    if (daysBefore >= -1 && daysBefore <= 3) {
      // Booking is 0-3 days before tournament start (or 1 day after start)
      if (daysBefore < bestDist) {
        bestDist = daysBefore;
        bestMatch = t.id;
      }
    } else if (bookingDate >= tStart && bookingDate <= tEnd) {
      // Booking is during tournament
      bestMatch = t.id;
      bestDist = 0;
    }
  }

  return bestMatch;
}

export async function POST(request) {
  try {
    const gmail = await getGmailClient();
    if (!gmail) {
      return NextResponse.json({ error: "Gmail not connected", needsAuth: true }, { status: 401 });
    }

    const supabase = getSupabase();

    // Get current schedule data
    const { data: scheduleRow } = await supabase
      .from("schedule_data")
      .select("value")
      .eq("key", "schedule")
      .single();

    const schedule = scheduleRow?.value || {};
    const tournaments = schedule.tournaments || [];

    // Get last check timestamp
    const { data: lastCheckRow } = await supabase
      .from("schedule_data")
      .select("value")
      .eq("key", "last_email_check")
      .single();

    const lastCheck = lastCheckRow?.value?.timestamp || null;

    // Search for booking emails from the last 30 days (or since last check)
    const senders = [
      "ryanair.com",
      "aerlingus.com",
      "vueling.com",
      "booking.com",
      "hotels.com",
      "hotel",
      "reservation",
      "booking confirmation",
    ];

    // Build search query
    const afterDate = lastCheck
      ? new Date(new Date(lastCheck).getTime() - 86400000).toISOString().split("T")[0].replace(/-/g, "/")
      : new Date(Date.now() - 30 * 86400000).toISOString().split("T")[0].replace(/-/g, "/");

    const query = `after:${afterDate} subject:(booking OR confirmation OR reservation OR itinerary OR "flight confirmation" OR "hotel reservation") {from:ryanair.com from:aerlingus.com from:vueling.com from:booking.com from:hotels.com from:noreply}`;

    const res = await gmail.users.messages.list({
      userId: "me",
      q: query,
      maxResults: 20,
    });

    const messageIds = res.data.messages || [];
    const results = [];
    const processedIds = schedule.processedEmailIds || [];

    for (const msg of messageIds) {
      // Skip already processed
      if (processedIds.includes(msg.id)) continue;

      const full = await gmail.users.messages.get({
        userId: "me",
        id: msg.id,
        format: "full",
      });

      const headers = full.data.payload?.headers || [];
      const subject = headers.find(h => h.name.toLowerCase() === "subject")?.value || "";
      const from = headers.find(h => h.name.toLowerCase() === "from")?.value || "";
      const date = headers.find(h => h.name.toLowerCase() === "date")?.value || "";

      const body = extractBody(full.data.payload);
      if (!body) continue;

      // Parse with Claude
      const parsed = await parseBookingEmail(subject, body, from);

      if (parsed.is_booking_confirmation) {
        const matchedTournament = matchToTournament(parsed, tournaments);
        results.push({
          emailId: msg.id,
          date,
          subject,
          from,
          ...parsed,
          matchedTournament,
        });
      }

      // Track as processed regardless
      processedIds.push(msg.id);
    }

    // Update tournaments with matched bookings
    let updated = false;
    for (const result of results) {
      if (!result.matchedTournament) continue;

      const tIdx = tournaments.findIndex(t => t.id === result.matchedTournament);
      if (tIdx === -1) continue;

      const t = tournaments[tIdx];

      if (result.type === "flight") {
        t.flights = "booked";
        t.flightDetails = {
          provider: result.provider,
          confirmation: result.confirmation_code,
          summary: result.summary,
          outbound: result.details.outbound_date ? {
            date: result.details.outbound_date,
            time: result.details.outbound_time,
            flight: result.details.outbound_flight,
            from: result.details.from,
            to: result.details.to,
          } : null,
          return: result.details.return_date ? {
            date: result.details.return_date,
            time: result.details.return_time,
            flight: result.details.return_flight,
          } : null,
          price: result.details.total_price,
        };
        updated = true;
      } else if (result.type === "hotel") {
        t.hotel = "booked";
        t.hotelDetails = {
          name: result.details.hotel_name || result.provider,
          confirmation: result.confirmation_code,
          summary: result.summary,
          checkIn: result.details.check_in,
          checkOut: result.details.check_out,
          location: result.details.location,
          price: result.details.total_price,
        };
        updated = true;
      }

      tournaments[tIdx] = t;
    }

    // Save updated schedule and processed IDs
    if (updated || results.length > 0) {
      schedule.tournaments = tournaments;
      schedule.processedEmailIds = processedIds;
      await supabase
        .from("schedule_data")
        .upsert({ key: "schedule", value: schedule }, { onConflict: "key" });
    }

    // Save last check timestamp
    await supabase
      .from("schedule_data")
      .upsert({ key: "last_email_check", value: { timestamp: new Date().toISOString() } }, { onConflict: "key" });

    return NextResponse.json({
      found: results.length,
      matched: results.filter(r => r.matchedTournament).length,
      results: results.map(r => ({
        summary: r.summary,
        type: r.type,
        provider: r.provider,
        matchedTournament: r.matchedTournament,
        confirmation: r.confirmation_code,
      })),
      totalEmailsScanned: messageIds.length,
    });
  } catch (error) {
    console.error("Check emails error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
