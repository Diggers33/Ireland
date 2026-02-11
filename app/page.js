"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import { supabase } from "./supabase";

// ============================================================
// DEFAULT DATA
// ============================================================
const defaultTournaments = [
  { id: "t1", name: "Flogas Irish Girls' Amateur Open", dates: "May 1–3", start: [4,1], end: [4,3], province: "National", type: "tournament", hotel: "pending", flights: "pending", car: "pending", notes: "" },
  { id: "t2", name: "Flogas Irish Women's Amateur Open", dates: "May 15–17", start: [4,15], end: [4,17], province: "National", type: "tournament", hotel: "pending", flights: "pending", car: "pending", notes: "" },
  { id: "t3", name: "Leinster Girls' U18 Open Trophy", dates: "Jun 22", start: [5,22], end: [5,22], province: "Leinster", type: "tournament", hotel: "pending", flights: "pending", car: "pending", notes: "" },
  { id: "t4", name: "Ulster U18 Girls' Amateur Open", dates: "Jun 24–26", start: [5,24], end: [5,26], province: "Ulster", type: "tournament", hotel: "pending", flights: "pending", car: "pending", notes: "" },
  { id: "t5", name: "Connacht U18 Girls' Open", dates: "Jul 9–10", start: [6,9], end: [6,10], province: "Connacht", type: "tournament", hotel: "pending", flights: "pending", car: "pending", notes: "" },
  { id: "t6", name: "Munster U18 Girls' Amateur Open", dates: "Jul 15–17", start: [6,15], end: [6,17], province: "Munster", type: "tournament", hotel: "pending", flights: "pending", car: "pending", notes: "" },
  { id: "t7", name: "AIG Women's & Girls' Amateur Close", dates: "Jul 28–31", start: [6,28], end: [6,31], province: "National", type: "tournament", hotel: "pending", flights: "pending", car: "pending", notes: "" },
  { id: "t8", name: "Interprovincial Matches – U18", dates: "Aug 6–7", start: [7,6], end: [7,7], province: "National", type: "tournament", hotel: "pending", flights: "pending", car: "pending", notes: "" },
  { id: "t9", name: "Munster Junior Close Event", dates: "Aug 21", start: [7,21], end: [7,21], province: "Munster", type: "tournament", hotel: "pending", flights: "pending", car: "pending", notes: "" },
];

const defaultBookings = [
  { id: "b1", name: "Airbnb", dates: "Apr 3–6", start: [3,3], end: [3,6], platform: "Airbnb", type: "booking" },
  { id: "b2", name: "Booking.com", dates: "May 24–28", start: [4,24], end: [4,28], platform: "Booking", type: "booking" },
  { id: "b3", name: "Booking.com", dates: "Jun 4–7", start: [5,4], end: [5,7], platform: "Booking", type: "booking" },
  { id: "b4", name: "Vrbo", dates: "Jun 22 – Jul 6", start: [5,22], end: [6,6], platform: "Vrbo", type: "booking" },
  { id: "b5", name: "Booking.com", dates: "Jul 10–13", start: [6,10], end: [6,13], platform: "Booking", type: "booking" },
  { id: "b6", name: "Booking.com", dates: "Jul 16–23", start: [6,16], end: [6,23], platform: "Booking", type: "booking" },
  { id: "b7", name: "Vrbo", dates: "Jul 23–30", start: [6,23], end: [6,30], platform: "Vrbo", type: "booking" },
  { id: "b8", name: "Airbnb", dates: "Aug 6–9", start: [7,6], end: [7,9], platform: "Airbnb", type: "booking" },
  { id: "b9", name: "Airbnb", dates: "Aug 11–24", start: [7,11], end: [7,24], platform: "Airbnb", type: "booking" },
  { id: "b10", name: "Booking.com", dates: "Sep 15–18", start: [8,15], end: [8,18], platform: "Booking", type: "booking" },
  { id: "b11", name: "Booking.com", dates: "Sep 23–25", start: [8,23], end: [8,25], platform: "Booking", type: "booking" },
  { id: "b12", name: "Booking.com", dates: "Sep 25–28", start: [8,25], end: [8,28], platform: "Booking", type: "booking" },
  { id: "b13", name: "Booking.com", dates: "Oct 22–25", start: [9,22], end: [9,25], platform: "Booking", type: "booking" },
];

// ============================================================
// CONSTANTS
// ============================================================
const provinceColors = {
  National: { bar: "#4f46e5", light: "#eef2ff" },
  Leinster: { bar: "#16a34a", light: "#f0fdf4" },
  Ulster: { bar: "#dc2626", light: "#fef2f2" },
  Connacht: { bar: "#d97706", light: "#fffbeb" },
  Munster: { bar: "#0284c7", light: "#f0f9ff" },
};
const platformColors = {
  Airbnb: { bar: "#e11d48", light: "#fff1f2" },
  Booking: { bar: "#1d4ed8", light: "#eff6ff" },
  Vrbo: { bar: "#7c3aed", light: "#f5f3ff" },
};
const statusCycle = ["pending", "booked", "na"];
const statusDisplay = {
  pending: { icon: "⏳", color: "#f59e0b", bg: "#fffbeb", border: "#fde68a", label: "Pending" },
  booked: { icon: "✅", color: "#16a34a", bg: "#f0fdf4", border: "#bbf7d0", label: "Booked" },
  na: { icon: "—", color: "#94a3b8", bg: "#f8fafc", border: "#e2e8f0", label: "N/A" },
};
const monthNameMap = {0:"Jan",1:"Feb",2:"Mar",3:"Apr",4:"May",5:"Jun",6:"Jul",7:"Aug",8:"Sep",9:"Oct",10:"Nov",11:"Dec"};

// ============================================================
// DATE GRID HELPERS
// ============================================================
function buildDays() {
  const days = [];
  const mNames = ["Apr","May","Jun","Jul","Aug","Sep","Oct"];
  const mIdx = [3,4,5,6,7,8,9];
  const mDays = [30,31,30,31,31,30,31];
  let index = 0;
  for (let m = 0; m < 7; m++) {
    for (let d = 1; d <= mDays[m]; d++) {
      const date = new Date(2025, mIdx[m], d);
      const dow = date.getDay();
      days.push({ index, day: d, month: mIdx[m], monthName: mNames[m], isMonday: dow === 1, isWeekend: dow === 0 || dow === 6 });
      index++;
    }
  }
  return days;
}
const allDays = buildDays();
const totalDays = allDays.length;

function dayIndex(month, day) { return allDays.findIndex(d => d.month === month && d.day === day); }
function todayIndex() { const n = new Date(); return allDays.findIndex(d => d.month === n.getMonth() && d.day === n.getDate()); }

function getMonthSpans() {
  const spans = []; let cur = null;
  for (const d of allDays) {
    if (!cur || cur.monthName !== d.monthName) { if (cur) spans.push(cur); cur = { monthName: d.monthName, start: d.index, end: d.index }; } else cur.end = d.index;
  }
  if (cur) spans.push(cur); return spans;
}

function buildWeeks() {
  const weeks = []; let i = 0;
  while (i < allDays.length && !allDays[i].isMonday) i++;
  if (i > 0) weeks.push({ start: 0, end: i - 1, label: `${allDays[0].day}`, monthName: allDays[0].monthName });
  while (i < allDays.length) {
    const start = i; const end = Math.min(i + 6, allDays.length - 1);
    weeks.push({ start, end, label: `${allDays[start].day}`, monthName: allDays[start].monthName });
    i += 7;
  }
  return weeks;
}

function buildOccupancy(bks) {
  const occ = new Array(totalDays).fill(false);
  for (const b of bks) {
    const si = dayIndex(b.start[0], b.start[1]); const ei = dayIndex(b.end[0], b.end[1]);
    if (si >= 0 && ei >= 0) for (let i2 = si; i2 <= ei; i2++) occ[i2] = true;
  }
  return occ;
}
function buildOccupancySpans(occ) {
  const spans = []; let i = 0;
  while (i < occ.length) { const booked = occ[i]; const start = i; while (i < occ.length && occ[i] === booked) i++; spans.push({ start, end: i - 1, booked }); }
  return spans;
}

function formatDateLabel(start, end) {
  const sm = monthNameMap[start[0]]; const em = monthNameMap[end[0]];
  if (start[0] === end[0] && start[1] === end[1]) return `${sm} ${start[1]}`;
  if (start[0] === end[0]) return `${sm} ${start[1]}–${end[1]}`;
  return `${sm} ${start[1]} – ${em} ${end[1]}`;
}
function parseDate(str) {
  if (!str) return null;
  const p = str.split("-"); if (p.length !== 3) return null;
  const y = parseInt(p[0]), m = parseInt(p[1]) - 1, d = parseInt(p[2]);
  if (isNaN(y) || isNaN(m) || isNaN(d)) return null;
  return [m, d];
}

// ============================================================
// PERSISTENCE: Supabase with localStorage fallback
// ============================================================
const SUPABASE_TABLE = "schedule_data";
const LOCAL_KEY = "ireland-schedule-2025";

async function loadData() {
  // Try Supabase first
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from(SUPABASE_TABLE)
        .select("value")
        .eq("key", "schedule")
        .single();
      if (!error && data?.value) return data.value;
    } catch (e) {
      console.warn("Supabase load failed, falling back to localStorage", e);
    }
  }
  // Fallback to localStorage
  try {
    const raw = localStorage.getItem(LOCAL_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return null;
}

async function saveData(payload) {
  // Always save to localStorage as cache
  try { localStorage.setItem(LOCAL_KEY, JSON.stringify(payload)); } catch (e) {}
  // Save to Supabase
  if (supabase) {
    try {
      await supabase
        .from(SUPABASE_TABLE)
        .upsert({ key: "schedule", value: payload }, { onConflict: "key" });
    } catch (e) {
      console.warn("Supabase save failed", e);
    }
  }
}

// ============================================================
// FORM COMPONENTS
// ============================================================
const labelStyle = { fontSize: 11, fontWeight: 600, color: "#64748b", display: "block", marginBottom: 4 };
const inputStyle = { width: "100%", padding: "7px 10px", fontSize: 13, border: "1px solid #e2e8f0", borderRadius: 6, background: "#fafbfc", color: "#1e293b", outline: "none", boxSizing: "border-box" };
const btnStyle = { padding: "7px 16px", fontSize: 12, fontWeight: 600, border: "none", borderRadius: 6, cursor: "pointer" };

function AddTournamentForm({ onAdd, onClose }) {
  const [name, setName] = useState(""); const [sd, setSd] = useState(""); const [ed, setEd] = useState(""); const [prov, setProv] = useState("National");
  const submit = () => { const s = parseDate(sd), e = parseDate(ed || sd); if (!name.trim() || !s || !e) return; onAdd({ id: "t_"+Date.now(), name: name.trim(), dates: formatDateLabel(s,e), start: s, end: e, province: prov, type: "tournament", hotel: "pending", flights: "pending", car: "pending", notes: "" }); onClose(); };
  return (
    <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10, padding: 20, marginBottom: 16, boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }}>
      <div style={{ fontSize: 14, fontWeight: 700, color: "#0f172a", marginBottom: 12 }}>Add Tournament</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr auto", gap: 10, alignItems: "end" }}>
        <div><label style={labelStyle}>Name</label><input value={name} onChange={e=>setName(e.target.value)} placeholder="Tournament name" style={inputStyle} /></div>
        <div><label style={labelStyle}>Start Date</label><input type="date" value={sd} onChange={e=>setSd(e.target.value)} style={inputStyle} /></div>
        <div><label style={labelStyle}>End Date</label><input type="date" value={ed||sd} onChange={e=>setEd(e.target.value)} style={inputStyle} /></div>
        <div><label style={labelStyle}>Province</label><select value={prov} onChange={e=>setProv(e.target.value)} style={inputStyle}>{Object.keys(provinceColors).map(p=><option key={p} value={p}>{p}</option>)}</select></div>
      </div>
      <div style={{ display: "flex", gap: 8, marginTop: 12, justifyContent: "flex-end" }}>
        <button onClick={onClose} style={{ ...btnStyle, background: "#f1f5f9", color: "#475569" }}>Cancel</button>
        <button onClick={submit} style={{ ...btnStyle, background: "#4f46e5", color: "#fff" }}>Add Tournament</button>
      </div>
    </div>
  );
}

function AddBookingForm({ onAdd, onClose }) {
  const [plat, setPlat] = useState("Airbnb"); const [sd, setSd] = useState(""); const [ed, setEd] = useState("");
  const submit = () => { const s = parseDate(sd), e = parseDate(ed); if (!s || !e) return; onAdd({ id: "b_"+Date.now(), name: plat, dates: formatDateLabel(s,e), start: s, end: e, platform: plat, type: "booking" }); onClose(); };
  return (
    <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10, padding: 20, marginBottom: 16, boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }}>
      <div style={{ fontSize: 14, fontWeight: 700, color: "#0f172a", marginBottom: 12 }}>Add Booking</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, alignItems: "end" }}>
        <div><label style={labelStyle}>Platform</label><select value={plat} onChange={e=>setPlat(e.target.value)} style={inputStyle}>{Object.keys(platformColors).map(p=><option key={p} value={p}>{p}</option>)}</select></div>
        <div><label style={labelStyle}>Check-in</label><input type="date" value={sd} onChange={e=>setSd(e.target.value)} style={inputStyle} /></div>
        <div><label style={labelStyle}>Check-out</label><input type="date" value={ed} onChange={e=>setEd(e.target.value)} style={inputStyle} /></div>
      </div>
      <div style={{ display: "flex", gap: 8, marginTop: 12, justifyContent: "flex-end" }}>
        <button onClick={onClose} style={{ ...btnStyle, background: "#f1f5f9", color: "#475569" }}>Cancel</button>
        <button onClick={submit} style={{ ...btnStyle, background: "#4f46e5", color: "#fff" }}>Add Booking</button>
      </div>
    </div>
  );
}

// ============================================================
// MAIN COMPONENT
// ============================================================
const LABEL_W = 240;
const ROW_H = 38;
const SECTION_H = 28;
const OCCUPANCY_H = 20;

export default function Home() {
  const [tournaments, setTournaments] = useState(defaultTournaments);
  const [rentalBookings, setRentalBookings] = useState(defaultBookings);
  const [hoveredId, setHoveredId] = useState(null);
  const [view, setView] = useState("gantt");
  const [resolution, setResolution] = useState("day");
  const [showAddT, setShowAddT] = useState(false);
  const [showAddB, setShowAddB] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [checkingEmail, setCheckingEmail] = useState(false);
  const [emailResult, setEmailResult] = useState(null);
  const [gmailConnected, setGmailConnected] = useState(false);

  const scrollRef = useRef(null);
  const isDragging = useRef(false);
  const dragStartX = useRef(0);
  const dragScrollLeft = useRef(0);
  const saveTimeout = useRef(null);
  const isRemoteUpdate = useRef(false);
  const lastSaveHash = useRef("");
  const tIdx = todayIndex();

  // Drag to scroll
  const handleMouseDown = (e) => {
    if (!scrollRef.current) return;
    isDragging.current = true;
    dragStartX.current = e.pageX - scrollRef.current.offsetLeft;
    dragScrollLeft.current = scrollRef.current.scrollLeft;
    scrollRef.current.style.cursor = "grabbing";
    scrollRef.current.style.userSelect = "none";
  };
  const handleMouseMove = (e) => {
    if (!isDragging.current || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    scrollRef.current.scrollLeft = dragScrollLeft.current - (x - dragStartX.current) * 1.5;
  };
  const handleMouseUp = () => {
    isDragging.current = false;
    if (scrollRef.current) { scrollRef.current.style.cursor = "grab"; scrollRef.current.style.userSelect = ""; }
  };

  // Load on mount
  useEffect(() => {
    loadData().then(data => {
      if (data) {
        if (data.tournaments?.length) setTournaments(data.tournaments);
        if (data.bookings?.length) setRentalBookings(data.bookings);
      }
      setLoaded(true);
    });
    // Check if Gmail is connected
    if (supabase) {
      supabase.from("schedule_data").select("value").eq("key", "gmail_tokens").single()
        .then(({ data }) => { if (data?.value) setGmailConnected(true); });
    }
    // Check URL for gmail connect result
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("gmail") === "connected") {
        setGmailConnected(true);
        window.history.replaceState({}, "", "/");
      }
    }
  }, []);

  // Check emails handler
  const handleCheckEmails = async () => {
    setCheckingEmail(true);
    setEmailResult(null);
    try {
      const res = await fetch("/api/check-emails", { method: "POST" });
      const data = await res.json();
      if (data.needsAuth) {
        window.location.href = "/api/auth/gmail";
        return;
      }
      setEmailResult(data);
      // Reload data from Supabase if bookings were matched
      if (data.matched > 0) {
        const fresh = await loadData();
        if (fresh?.tournaments) {
          isRemoteUpdate.current = true;
          lastSaveHash.current = JSON.stringify(fresh);
          setTournaments(fresh.tournaments);
        }
      }
    } catch (e) {
      setEmailResult({ error: e.message });
    } finally {
      setCheckingEmail(false);
    }
  };

  // Debounced save — skip if triggered by remote update
  useEffect(() => {
    if (!loaded) return;
    if (isRemoteUpdate.current) {
      isRemoteUpdate.current = false;
      return;
    }
    const hash = JSON.stringify({ tournaments, bookings: rentalBookings });
    if (hash === lastSaveHash.current) return;
    if (saveTimeout.current) clearTimeout(saveTimeout.current);
    saveTimeout.current = setTimeout(async () => {
      setSaving(true);
      lastSaveHash.current = hash;
      await saveData({ tournaments, bookings: rentalBookings });
      setSaving(false);
    }, 500);
    return () => { if (saveTimeout.current) clearTimeout(saveTimeout.current); };
  }, [tournaments, rentalBookings, loaded]);

  // Supabase real-time subscription
  useEffect(() => {
    if (!supabase) return;
    const channel = supabase
      .channel("schedule-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: SUPABASE_TABLE, filter: "key=eq.schedule" },
        (payload) => {
          const val = payload.new?.value;
          if (!val) return;
          const hash = JSON.stringify(val);
          if (hash === lastSaveHash.current) return; // ignore our own save echoing back
          isRemoteUpdate.current = true;
          lastSaveHash.current = hash;
          if (val.tournaments) setTournaments(val.tournaments);
          // Need to keep flag true through both updates
          setTimeout(() => { isRemoteUpdate.current = true; }, 0);
          if (val.bookings) setRentalBookings(val.bookings);
        }
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  // Resolution config
  const unitW = resolution === "day" ? 14 : resolution === "week" ? 28 : 80;
  const monthSpans = getMonthSpans();
  const weeks = buildWeeks();

  function dayToPx(di) {
    if (resolution === "day") return di * unitW;
    if (resolution === "week") {
      for (const w of weeks) {
        if (di >= w.start && di <= w.end) {
          return (weeks.indexOf(w) + (di - w.start) / (w.end - w.start + 1)) * unitW;
        }
      }
      return 0;
    }
    for (const ms of monthSpans) {
      if (di >= ms.start && di <= ms.end) {
        return (monthSpans.indexOf(ms) + (di - ms.start) / (ms.end - ms.start + 1)) * unitW;
      }
    }
    return 0;
  }
  function durationToPx(s, e) { return dayToPx(e + 1) - dayToPx(s); }

  const chartWidth = resolution === "day" ? totalDays * unitW : resolution === "week" ? weeks.length * unitW : monthSpans.length * unitW;

  useEffect(() => {
    if (scrollRef.current && tIdx >= 0) scrollRef.current.scrollLeft = Math.max(0, dayToPx(tIdx) - 300);
  }, [view, resolution]);

  const occupancy = buildOccupancy(rentalBookings);
  const occSpans = buildOccupancySpans(occupancy);
  const bookedDays = occupancy.filter(Boolean).length;
  const occRate = Math.round((bookedDays / totalDays) * 100);

  const sortedT = [...tournaments].sort((a, b) => a.start[0] !== b.start[0] ? a.start[0] - b.start[0] : a.start[1] - b.start[1]);
  const sortedB = [...rentalBookings].sort((a, b) => a.start[0] !== b.start[0] ? a.start[0] - b.start[0] : a.start[1] - b.start[1]);

  const toggleStatus = (id, f) => setTournaments(p => p.map(t => t.id !== id ? t : { ...t, [f]: statusCycle[(statusCycle.indexOf(t[f]) + 1) % 3] }));
  const updateNotes = (id, v) => setTournaments(p => p.map(t => t.id === id ? { ...t, notes: v } : t));
  const deleteT = id => setTournaments(p => p.filter(t => t.id !== id));
  const deleteB = id => setRentalBookings(p => p.filter(b => b.id !== id));

  const pendingCount = tournaments.reduce((s, t) => s + (t.hotel === "pending" ? 1 : 0) + (t.flights === "pending" ? 1 : 0) + (t.car === "pending" ? 1 : 0), 0);
  const bookedCount = tournaments.reduce((s, t) => s + (t.hotel === "booked" ? 1 : 0) + (t.flights === "booked" ? 1 : 0) + (t.car === "booked" ? 1 : 0), 0);

  const allRows = [
    { type: "section", label: "🏌️ Tournaments", section: "tournaments" },
    ...sortedT,
    { type: "section", label: "🏠 Rental Bookings", section: "bookings" },
    { type: "occupancy" },
    ...sortedB,
  ];

  const StatusPill = ({ status, onClick }) => {
    const s = statusDisplay[status];
    return (
      <button onClick={onClick} style={{ display: "flex", alignItems: "center", gap: 3, padding: "2px 7px", borderRadius: 4, background: s.bg, border: `1px solid ${s.border}`, cursor: "pointer", fontSize: 10, fontWeight: 600, color: s.color, lineHeight: 1.4 }}>
        <span style={{ fontSize: 11 }}>{s.icon}</span><span>{s.label}</span>
      </button>
    );
  };

  // ---- Chart header rendering ----
  const renderChartHeaders = () => {
    if (resolution === "day") {
      return (<>
        <div style={{ height: 28, position: "relative", borderBottom: "1px solid #e2e8f0" }}>
          {monthSpans.map((ms, i) => (<div key={ms.monthName} style={{ position: "absolute", left: ms.start * unitW, width: (ms.end - ms.start + 1) * unitW, height: "100%", display: "flex", alignItems: "center", paddingLeft: 6, fontSize: 11, fontWeight: 700, color: "#334155", letterSpacing: 1, textTransform: "uppercase", borderLeft: i > 0 ? "1px solid #e2e8f0" : "none" }}>{ms.monthName}</div>))}
        </div>
        <div style={{ height: 22, position: "relative", borderBottom: "1px solid #e2e8f0" }}>
          {allDays.filter(d => d.isMonday).map(d => (<div key={d.index} style={{ position: "absolute", left: d.index * unitW, width: unitW * 2, height: "100%", display: "flex", alignItems: "center", paddingLeft: 2, fontSize: 9, color: "#94a3b8", fontWeight: 500 }}>{d.day}</div>))}
        </div>
      </>);
    }
    if (resolution === "week") {
      return (<>
        <div style={{ height: 28, position: "relative", borderBottom: "1px solid #e2e8f0" }}>
          {monthSpans.map((ms, i) => {
            const sw = weeks.findIndex(w => w.start <= ms.start && w.end >= ms.start);
            const ew = weeks.findIndex(w => w.start <= ms.end && w.end >= ms.end);
            return (<div key={ms.monthName} style={{ position: "absolute", left: sw * unitW, width: (ew - sw + 1) * unitW, height: "100%", display: "flex", alignItems: "center", paddingLeft: 6, fontSize: 11, fontWeight: 700, color: "#334155", letterSpacing: 1, textTransform: "uppercase", borderLeft: i > 0 ? "1px solid #e2e8f0" : "none", overflow: "hidden" }}>{ms.monthName}</div>);
          })}
        </div>
        <div style={{ height: 22, position: "relative", borderBottom: "1px solid #e2e8f0" }}>
          {weeks.map((w, i) => (<div key={i} style={{ position: "absolute", left: i * unitW, width: unitW, height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, color: "#94a3b8", fontWeight: 500, borderLeft: "1px solid #f1f5f9" }}>{w.label}</div>))}
        </div>
      </>);
    }
    return (<>
      <div style={{ height: 28, position: "relative", borderBottom: "1px solid #e2e8f0" }}>
        {monthSpans.map((ms, i) => (<div key={ms.monthName} style={{ position: "absolute", left: i * unitW, width: unitW, height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: "#334155", letterSpacing: 1, textTransform: "uppercase", borderLeft: i > 0 ? "1px solid #e2e8f0" : "none" }}>{ms.monthName}</div>))}
      </div>
      <div style={{ height: 22, borderBottom: "1px solid #e2e8f0" }} />
    </>);
  };

  // ---- Grid lines ----
  const renderGridLines = (h) => {
    const lines = [];
    if (resolution === "day") {
      allDays.filter(d => d.isWeekend).forEach(d => lines.push(<div key={`we-${d.index}`} style={{ position: "absolute", left: d.index * unitW, top: 0, width: unitW, height: h, background: "rgba(0,0,0,0.015)" }} />));
      monthSpans.slice(1).forEach(ms => lines.push(<div key={`ml-${ms.monthName}`} style={{ position: "absolute", left: ms.start * unitW, top: 0, width: 1, height: h, background: "#f1f5f9" }} />));
    } else if (resolution === "week") {
      weeks.forEach((w, i) => { if (i > 0) lines.push(<div key={`wl-${i}`} style={{ position: "absolute", left: i * unitW, top: 0, width: 1, height: h, background: "#f1f5f9" }} />); });
      let pm = weeks[0]?.monthName;
      weeks.forEach((w, i) => { if (w.monthName !== pm) { lines.push(<div key={`wml-${i}`} style={{ position: "absolute", left: i * unitW, top: 0, width: 1, height: h, background: "#e2e8f0" }} />); pm = w.monthName; } });
    } else {
      monthSpans.forEach((ms, i) => { if (i > 0) lines.push(<div key={`ml-${i}`} style={{ position: "absolute", left: i * unitW, top: 0, width: 1, height: h, background: "#e2e8f0" }} />); });
    }
    if (tIdx >= 0) {
      const px = dayToPx(tIdx) + (resolution === "day" ? unitW / 2 : 0);
      lines.push(<div key="today" style={{ position: "absolute", left: px, top: 0, width: 2, height: h, background: "#ef4444", opacity: 0.3, zIndex: 5 }} />);
    }
    return lines;
  };

  // ============================================================
  // RENDER
  // ============================================================
  return (
    <div style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", background: "#f8f9fb", color: "#1e293b", minHeight: "100vh", padding: "32px 20px" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        {/* Header */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <div style={{ fontSize: 11, letterSpacing: 3, textTransform: "uppercase", color: "#4f46e5", fontWeight: 600 }}>2025 Season</div>
            {saving && <div style={{ fontSize: 10, color: "#94a3b8", background: "#f1f5f9", padding: "2px 8px", borderRadius: 4 }}>Saving...</div>}
            {!saving && loaded && supabase && <div style={{ fontSize: 10, color: "#16a34a", background: "#f0fdf4", padding: "2px 8px", borderRadius: 4 }}>● Synced</div>}
            {!supabase && loaded && <div style={{ fontSize: 10, color: "#f59e0b", background: "#fffbeb", padding: "2px 8px", borderRadius: 4 }}>Local only</div>}
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 700, margin: "0 0 4px", color: "#0f172a" }}>Tournaments & Bookings</h1>
          <p style={{ fontSize: 14, color: "#94a3b8", margin: 0 }}>{sortedT.length} tournaments · {sortedB.length} rental bookings · {bookedDays} nights booked ({occRate}%)</p>
        </div>

        {/* Controls */}
        <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap", alignItems: "center" }}>
          {[{ key: "gantt", label: "📊 Timeline" }, { key: "logistics", label: `📋 Logistics ${pendingCount > 0 ? `(${pendingCount} pending)` : "✓"}` }].map(v => (
            <button key={v.key} onClick={() => setView(v.key)} style={{ background: view === v.key ? "#4f46e5" : "#fff", color: view === v.key ? "#fff" : "#475569", border: `1px solid ${view === v.key ? "#4f46e5" : "#e2e8f0"}`, padding: "8px 16px", borderRadius: 8, cursor: "pointer", fontSize: 13, fontWeight: 600 }}>{v.label}</button>
          ))}
          {view === "gantt" && (
            <div style={{ display: "flex", gap: 2, marginLeft: 8, background: "#f1f5f9", borderRadius: 6, padding: 2 }}>
              {["day", "week", "month"].map(r => (
                <button key={r} onClick={() => setResolution(r)} style={{ background: resolution === r ? "#fff" : "transparent", color: resolution === r ? "#0f172a" : "#64748b", border: "none", padding: "5px 12px", borderRadius: 4, cursor: "pointer", fontSize: 12, fontWeight: 600, boxShadow: resolution === r ? "0 1px 3px rgba(0,0,0,0.1)" : "none" }}>{r.charAt(0).toUpperCase() + r.slice(1)}</button>
              ))}
            </div>
          )}
          <div style={{ flex: 1 }} />
          {view === "logistics" && (
            <button onClick={gmailConnected ? handleCheckEmails : () => { window.location.href = "/api/auth/gmail"; }} disabled={checkingEmail} style={{
              background: checkingEmail ? "#f1f5f9" : "#fff",
              color: checkingEmail ? "#94a3b8" : "#d97706",
              border: "1px solid #fde68a",
              padding: "8px 14px", borderRadius: 8, cursor: checkingEmail ? "wait" : "pointer",
              fontSize: 12, fontWeight: 600,
              display: "flex", alignItems: "center", gap: 6,
            }}>
              {checkingEmail ? "⏳ Checking..." : gmailConnected ? "📧 Check Emails" : "📧 Connect Gmail"}
            </button>
          )}
          <button onClick={() => { setShowAddT(true); setShowAddB(false); }} style={{ background: "#fff", color: "#4f46e5", border: "1px solid #c7d2fe", padding: "8px 14px", borderRadius: 8, cursor: "pointer", fontSize: 12, fontWeight: 600 }}>+ Tournament</button>
          <button onClick={() => { setShowAddB(true); setShowAddT(false); }} style={{ background: "#fff", color: "#0284c7", border: "1px solid #bae6fd", padding: "8px 14px", borderRadius: 8, cursor: "pointer", fontSize: 12, fontWeight: 600 }}>+ Booking</button>
        </div>

        {showAddT && <AddTournamentForm onAdd={t => setTournaments(p => [...p, t])} onClose={() => setShowAddT(false)} />}
        {showAddB && <AddBookingForm onAdd={b => setRentalBookings(p => [...p, b])} onClose={() => setShowAddB(false)} />}

        {/* Email check results */}
        {emailResult && (
          <div style={{ background: emailResult.error ? "#fef2f2" : "#f0fdf4", border: `1px solid ${emailResult.error ? "#fecaca" : "#bbf7d0"}`, borderRadius: 10, padding: "12px 16px", marginBottom: 16, display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 16 }}>{emailResult.error ? "❌" : "📧"}</span>
            <div style={{ flex: 1 }}>
              {emailResult.error ? (
                <span style={{ fontSize: 13, color: "#dc2626" }}>Error: {emailResult.error}</span>
              ) : (
                <span style={{ fontSize: 13, color: "#16a34a" }}>
                  Scanned {emailResult.totalEmailsScanned} emails — found {emailResult.found} booking{emailResult.found !== 1 ? "s" : ""}, matched {emailResult.matched} to tournaments
                </span>
              )}
              {emailResult.results?.length > 0 && (
                <div style={{ marginTop: 6, display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {emailResult.results.map((r, i) => (
                    <span key={i} style={{ fontSize: 11, background: "#fff", border: "1px solid #e2e8f0", borderRadius: 4, padding: "2px 8px", color: "#475569" }}>
                      {r.type === "flight" ? "✈️" : "🏨"} {r.summary || r.provider} {r.matchedTournament ? "→ matched" : "→ unmatched"}
                    </span>
                  ))}
                </div>
              )}
            </div>
            <button onClick={() => setEmailResult(null)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 14, color: "#94a3b8" }}>✕</button>
          </div>
        )}

        {/* ===== LOGISTICS VIEW ===== */}
        {view === "logistics" && (
          <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e2e8f0", boxShadow: "0 1px 3px rgba(0,0,0,0.04)", overflow: "hidden" }}>
            <div style={{ display: "flex", gap: 24, padding: "14px 20px", background: "#f8fafc", borderBottom: "1px solid #e2e8f0", flexWrap: "wrap" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}><span style={{ fontSize: 18 }}>✅</span><span style={{ fontSize: 13, fontWeight: 600, color: "#16a34a" }}>{bookedCount} booked</span></div>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}><span style={{ fontSize: 18 }}>⏳</span><span style={{ fontSize: 13, fontWeight: 600, color: "#f59e0b" }}>{pendingCount} pending</span></div>
              <div style={{ fontSize: 12, color: "#94a3b8", marginLeft: "auto", alignSelf: "center" }}>Click status to cycle: Pending → Booked → N/A</div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 100px 90px 90px 90px 140px 36px", padding: "10px 20px", borderBottom: "1px solid #e2e8f0", fontSize: 11, fontWeight: 700, color: "#64748b", letterSpacing: 0.5, textTransform: "uppercase" }}>
              <span>Tournament</span><span>Dates</span><span style={{ textAlign: "center" }}>🏨 Hotel</span><span style={{ textAlign: "center" }}>✈️ Flights</span><span style={{ textAlign: "center" }}>🚗 Car</span><span>Notes</span><span></span>
            </div>
            {sortedT.map(t => {
              const c = provinceColors[t.province]; const hov = hoveredId === t.id; const pend = t.hotel === "pending" || t.flights === "pending" || t.car === "pending";
              const hasDetails = t.hotelDetails || t.flightDetails;
              return (
                <div key={t.id}>
                  <div onMouseEnter={() => setHoveredId(t.id)} onMouseLeave={() => setHoveredId(null)} style={{ display: "grid", gridTemplateColumns: "1fr 100px 90px 90px 90px 140px 36px", padding: "10px 20px", borderBottom: hasDetails ? "none" : "1px solid #f1f5f9", background: hov ? "#f8fafc" : pend ? "#fffbf5" : "transparent", alignItems: "center" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
                      <div style={{ width: 8, height: 8, borderRadius: "50%", background: c.bar, flexShrink: 0 }} />
                      <span style={{ fontSize: 13, fontWeight: 600, color: "#1e293b", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.name}</span>
                      <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", color: c.bar, background: c.light, padding: "1px 5px", borderRadius: 3, flexShrink: 0 }}>{t.province}</span>
                    </div>
                    <span style={{ fontSize: 12, color: "#64748b", fontFamily: "monospace" }}>{t.dates}</span>
                    <div style={{ display: "flex", justifyContent: "center" }}><StatusPill status={t.hotel} onClick={() => toggleStatus(t.id, "hotel")} /></div>
                    <div style={{ display: "flex", justifyContent: "center" }}><StatusPill status={t.flights} onClick={() => toggleStatus(t.id, "flights")} /></div>
                    <div style={{ display: "flex", justifyContent: "center" }}><StatusPill status={t.car} onClick={() => toggleStatus(t.id, "car")} /></div>
                    <input type="text" value={t.notes} onChange={e => updateNotes(t.id, e.target.value)} placeholder="Add note..." style={{ fontSize: 12, color: "#475569", border: "1px solid #e2e8f0", borderRadius: 4, padding: "4px 8px", background: "#fafbfc", outline: "none", width: "100%" }} onFocus={e => e.target.style.borderColor = "#4f46e5"} onBlur={e => e.target.style.borderColor = "#e2e8f0"} />
                    <button onClick={() => deleteT(t.id)} title="Delete" style={{ background: "none", border: "none", cursor: "pointer", fontSize: 14, color: "#cbd5e1", padding: 4 }}>✕</button>
                  </div>
                  {/* Booking details row */}
                  {hasDetails && (
                    <div style={{ padding: "4px 20px 10px 36px", borderBottom: "1px solid #f1f5f9", display: "flex", gap: 12, flexWrap: "wrap" }}>
                      {t.flightDetails && (
                        <div style={{ fontSize: 11, background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 6, padding: "4px 10px", color: "#1e40af", display: "flex", gap: 6, alignItems: "center" }}>
                          <span>✈️</span>
                          <span style={{ fontWeight: 600 }}>{t.flightDetails.provider}</span>
                          {t.flightDetails.confirmation && <span style={{ fontFamily: "monospace", fontSize: 10, background: "#dbeafe", padding: "1px 4px", borderRadius: 3 }}>{t.flightDetails.confirmation}</span>}
                          <span>{t.flightDetails.summary || (t.flightDetails.outbound ? `${t.flightDetails.outbound.from}→${t.flightDetails.outbound.to} ${t.flightDetails.outbound.date}` : "")}</span>
                          {t.flightDetails.price && <span style={{ fontWeight: 600 }}>{t.flightDetails.price}</span>}
                        </div>
                      )}
                      {t.hotelDetails && (
                        <div style={{ fontSize: 11, background: "#faf5ff", border: "1px solid #e9d5ff", borderRadius: 6, padding: "4px 10px", color: "#6b21a8", display: "flex", gap: 6, alignItems: "center" }}>
                          <span>🏨</span>
                          <span style={{ fontWeight: 600 }}>{t.hotelDetails.name}</span>
                          {t.hotelDetails.confirmation && <span style={{ fontFamily: "monospace", fontSize: 10, background: "#f3e8ff", padding: "1px 4px", borderRadius: 3 }}>{t.hotelDetails.confirmation}</span>}
                          {t.hotelDetails.checkIn && <span>{t.hotelDetails.checkIn} → {t.hotelDetails.checkOut}</span>}
                          {t.hotelDetails.price && <span style={{ fontWeight: 600 }}>{t.hotelDetails.price}</span>}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* ===== GANTT VIEW ===== */}
        {view === "gantt" && (
          <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e2e8f0", boxShadow: "0 1px 3px rgba(0,0,0,0.04)", overflow: "hidden" }}>
            <div style={{ display: "flex" }}>
              {/* Fixed labels */}
              <div style={{ width: LABEL_W, flexShrink: 0, borderRight: "1px solid #e2e8f0", zIndex: 10, background: "#fff" }}>
                <div style={{ height: 28, borderBottom: "1px solid #e2e8f0" }} />
                <div style={{ height: 22, borderBottom: "1px solid #e2e8f0" }} />
                {allRows.map((row, i) => {
                  if (row.type === "section") return <div key={row.label} style={{ height: SECTION_H, display: "flex", alignItems: "center", paddingLeft: 12, fontSize: 12, fontWeight: 700, color: "#334155", background: "#f8fafc", borderBottom: "1px solid #e2e8f0", borderTop: i > 0 ? "1px solid #e2e8f0" : "none" }}>{row.label}</div>;
                  if (row.type === "occupancy") return <div key="occ-label" style={{ height: OCCUPANCY_H, display: "flex", alignItems: "center", paddingLeft: 20, fontSize: 10, fontWeight: 600, color: "#64748b", borderBottom: "1px solid #f1f5f9", background: "#fafbfc" }}>Availability</div>;
                  const hov = hoveredId === row.id;
                  const dot = row.type === "tournament" ? (provinceColors[row.province]?.bar || "#888") : (platformColors[row.platform]?.bar || "#888");
                  const isT = row.type === "tournament";
                  return (
                    <div key={row.id} onMouseEnter={() => setHoveredId(row.id)} onMouseLeave={() => setHoveredId(null)} style={{ height: ROW_H, display: "flex", alignItems: "center", paddingLeft: 12, paddingRight: 6, gap: 6, borderBottom: "1px solid #f1f5f9", background: hov ? "#f8fafc" : "transparent", cursor: "pointer" }}>
                      <div style={{ width: 7, height: 7, borderRadius: "50%", background: dot, flexShrink: 0 }} />
                      <span style={{ fontSize: 12, fontWeight: hov ? 600 : 500, color: hov ? "#0f172a" : "#475569", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", flex: 1 }}>{row.type === "booking" ? row.platform : row.name}</span>
                      {isT && <div style={{ display: "flex", gap: 2, flexShrink: 0 }}>{["hotel", "flights", "car"].map(f => { const s = statusDisplay[row[f]]; return <span key={f} title={`${f}: ${s.label}`} style={{ fontSize: 9, width: 14, height: 14, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 3, background: s.bg, border: `1px solid ${s.border}` }}>{s.icon}</span>; })}</div>}
                      {!isT && <span style={{ fontSize: 10, color: "#94a3b8", fontFamily: "monospace", flexShrink: 0 }}>{row.dates}</span>}
                    </div>
                  );
                })}
              </div>

              {/* Scrollable chart */}
              <div ref={scrollRef} style={{ flex: 1, overflowX: "auto", overflowY: "hidden", cursor: "grab" }} onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}>
                <div style={{ width: chartWidth, position: "relative" }}>
                  {renderChartHeaders()}
                  {allRows.map((row, ri) => {
                    if (row.type === "section") return (
                      <div key={row.label} style={{ height: SECTION_H, background: "#f8fafc", borderBottom: "1px solid #e2e8f0", borderTop: ri > 0 ? "1px solid #e2e8f0" : "none", position: "relative" }}>{renderGridLines(SECTION_H)}</div>
                    );
                    if (row.type === "occupancy") return (
                      <div key="occ-row" style={{ height: OCCUPANCY_H, position: "relative", borderBottom: "1px solid #f1f5f9", background: "#fafbfc" }}>
                        {occSpans.map((span, si) => {
                          const left = dayToPx(span.start); const w = durationToPx(span.start, span.end); const sd2 = span.end - span.start + 1;
                          return (<div key={si} style={{ position: "absolute", left, width: w, top: 3, bottom: 3, background: span.booked ? "linear-gradient(135deg,#ef4444,#dc2626)" : "linear-gradient(135deg,#22c55e,#16a34a)", borderRadius: 3, opacity: 0.75, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>{w > 24 && <span style={{ fontSize: 9, fontWeight: 700, color: "#fff", textShadow: "0 1px 2px rgba(0,0,0,0.3)" }}>{sd2}d</span>}</div>);
                        })}
                        {renderGridLines(OCCUPANCY_H)}
                      </div>
                    );
                    const si2 = dayIndex(row.start[0], row.start[1]); const ei2 = dayIndex(row.end[0], row.end[1]);
                    if (si2 < 0 || ei2 < 0) return null;
                    const dur = ei2 - si2 + 1; const hov = hoveredId === row.id;
                    const barColor = row.type === "tournament" ? (provinceColors[row.province]?.bar || "#888") : (platformColors[row.platform]?.bar || "#888");
                    const barLight = row.type === "tournament" ? (provinceColors[row.province]?.light || "#f5f5f5") : (platformColors[row.platform]?.light || "#f5f5f5");
                    const left = dayToPx(si2); const w = Math.max(durationToPx(si2, ei2), resolution === "month" ? 6 : unitW - 2);
                    return (
                      <div key={row.id} onMouseEnter={() => setHoveredId(row.id)} onMouseLeave={() => setHoveredId(null)} style={{ height: ROW_H, position: "relative", borderBottom: "1px solid #f1f5f9", background: hov ? "#f8fafc" : "transparent", cursor: "pointer" }}>
                        {renderGridLines(ROW_H)}
                        <div style={{ position: "absolute", left: left + 1, width: w - 2, top: 6, bottom: 6, background: hov ? barColor : `${barColor}cc`, borderRadius: 4, display: "flex", alignItems: "center", justifyContent: "center", zIndex: 10, transition: "all 0.12s", boxShadow: hov ? `0 2px 8px ${barColor}40` : `0 1px 2px ${barColor}15`, overflow: "hidden" }}>
                          {w > 30 && <span style={{ fontSize: 10, fontWeight: 700, color: "#fff", textShadow: "0 1px 2px rgba(0,0,0,0.2)", whiteSpace: "nowrap" }}>{dur}d</span>}
                        </div>
                        {hov && (
                          <div style={{ position: "absolute", left: Math.min(left + w + 8, chartWidth - 240), top: "50%", transform: "translateY(-50%)", background: "#fff", border: "1px solid #e2e8f0", borderRadius: 6, padding: "5px 10px", boxShadow: "0 4px 12px rgba(0,0,0,0.1)", zIndex: 20, whiteSpace: "nowrap", fontSize: 12, color: "#475569", display: "flex", gap: 8, alignItems: "center" }}>
                            <span style={{ fontWeight: 600, color: "#0f172a" }}>{row.type === "tournament" ? row.name : row.platform}</span>
                            <span>{row.dates}</span>
                            <span style={{ fontSize: 10, fontWeight: 700, color: barColor, background: barLight, padding: "1px 6px", borderRadius: 3 }}>{row.type === "tournament" ? row.province : row.platform}</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Legend */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: 16, padding: "0 4px", alignItems: "center" }}>
          <span style={{ fontSize: 11, fontWeight: 600, color: "#64748b" }}>Tournaments:</span>
          {Object.entries(provinceColors).map(([n, c]) => <div key={n} style={{ display: "flex", alignItems: "center", gap: 4 }}><div style={{ width: 8, height: 8, borderRadius: 2, background: c.bar }} /><span style={{ fontSize: 11, color: "#64748b" }}>{n}</span></div>)}
          <span style={{ fontSize: 11, color: "#cbd5e1", margin: "0 4px" }}>|</span>
          <span style={{ fontSize: 11, fontWeight: 600, color: "#64748b" }}>Bookings:</span>
          {Object.entries(platformColors).map(([n, c]) => <div key={n} style={{ display: "flex", alignItems: "center", gap: 4 }}><div style={{ width: 8, height: 8, borderRadius: 2, background: c.bar }} /><span style={{ fontSize: 11, color: "#64748b" }}>{n}</span></div>)}
          <span style={{ fontSize: 11, color: "#cbd5e1", margin: "0 4px" }}>|</span>
          <span style={{ fontSize: 11, fontWeight: 600, color: "#64748b" }}>Availability:</span>
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}><div style={{ width: 8, height: 8, borderRadius: 2, background: "#22c55e" }} /><span style={{ fontSize: 11, color: "#64748b" }}>Vacant</span></div>
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}><div style={{ width: 8, height: 8, borderRadius: 2, background: "#ef4444" }} /><span style={{ fontSize: 11, color: "#64748b" }}>Booked</span></div>
        </div>
      </div>
    </div>
  );
}
