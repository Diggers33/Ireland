import { google } from "googleapis";
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");

  if (!code) {
    return NextResponse.json({ error: "No code provided" }, { status: 400 });
  }

  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.NEXT_PUBLIC_APP_URL + "/api/auth/gmail/callback"
  );

  try {
    const { tokens } = await oauth2Client.getToken(code);

    // Store tokens in Supabase
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );

    await supabase
      .from("schedule_data")
      .upsert({ key: "gmail_tokens", value: tokens }, { onConflict: "key" });

    // Redirect back to app
    return NextResponse.redirect(process.env.NEXT_PUBLIC_APP_URL + "/?gmail=connected");
  } catch (error) {
    console.error("Gmail auth error:", error);
    return NextResponse.redirect(process.env.NEXT_PUBLIC_APP_URL + "/?gmail=error");
  }
}
