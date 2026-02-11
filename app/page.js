"use client";
import { useState, useRef, useEffect } from "react";
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
// DESIGN SYSTEM TOKENS
// ============================================================
const colors = {
  slate: { 50: "#f8fafc", 100: "#f1f5f9", 200: "#e2e8f0", 300: "#cbd5e1", 400: "#94a3b8", 500: "#64748b", 600: "#475569", 700: "#334155", 800: "#1e293b", 900: "#0f172a" },
  indigo: { 50: "#eef2ff", 100: "#e0e7ff", 500: "#6366f1", 600: "#4f46e5", 700: "#4338ca" },
  emerald: { 50: "#ecfdf5", 100: "#d1fae5", 500: "#10b981", 600: "#059669" },
  amber: { 50: "#fffbeb", 100: "#fef3c7", 500: "#f59e0b", 600: "#d97706" },
  red: { 50: "#fef2f2", 100: "#fee2e2", 500: "#ef4444", 600: "#dc2626" },
  blue: { 50: "#eff6ff", 100: "#dbeafe", 500: "#3b82f6", 600: "#2563eb" },
  purple: { 50: "#faf5ff", 100: "#f3e8ff", 500: "#a855f7", 600: "#9333ea" },
  rose: { 50: "#fff1f2", 100: "#ffe4e6", 500: "#f43f5e", 600: "#e11d48" },
};

const provinceColors = {
  National: { bar: colors.indigo[500], bg: colors.indigo[50], border: colors.indigo[100], text: colors.indigo[700] },
  Leinster: { bar: colors.emerald[500], bg: colors.emerald[50], border: colors.emerald[100], text: colors.emerald[600] },
  Ulster: { bar: colors.red[500], bg: colors.red[50], border: colors.red[100], text: colors.red[600] },
  Connacht: { bar: colors.amber[500], bg: colors.amber[50], border: colors.amber[100], text: colors.amber[600] },
  Munster: { bar: colors.blue[500], bg: colors.blue[50], border: colors.blue[100], text: colors.blue[600] },
};

const platformColors = {
  Airbnb: { bar: colors.rose[500], bg: colors.rose[50], border: colors.rose[100], text: colors.rose[600] },
  Booking: { bar: colors.blue[500], bg: colors.blue[50], border: colors.blue[100], text: colors.blue[600] },
  Vrbo: { bar: colors.purple[500], bg: colors.purple[50], border: colors.purple[100], text: colors.purple[600] },
};

const statusCycle = ["pending", "booked", "na"];
const statusConfig = {
  pending: { icon: "⏱", label: "Pending", color: colors.amber[600], bg: colors.amber[50], border: colors.amber[100] },
  booked: { icon: "✓", label: "Booked", color: colors.emerald[600], bg: colors.emerald[50], border: colors.emerald[100] },
  na: { icon: "—", label: "N/A", color: colors.slate[500], bg: colors.slate[50], border: colors.slate[200] },
};

const monthNameMap = {0:"Jan",1:"Feb",2:"Mar",3:"Apr",4:"May",5:"Jun",6:"Jul",7:"Aug",8:"Sep",9:"Oct",10:"Nov",11:"Dec"};

// ============================================================
// DATE HELPERS
// ============================================================
function buildDays() {
  const days = []; const mNames=["Apr","May","Jun","Jul","Aug","Sep","Oct"]; const mIdx=[3,4,5,6,7,8,9]; const mDays=[30,31,30,31,31,30,31];
  let index=0;
  for(let m=0;m<7;m++){for(let d=1;d<=mDays[m];d++){const date=new Date(2026,mIdx[m],d);const dow=date.getDay();days.push({index,day:d,month:mIdx[m],monthName:mNames[m],isMonday:dow===1,isWeekend:dow===0||dow===6});index++;}}
  return days;
}
const allDays=buildDays(); const totalDays=allDays.length;
function dayIndex(month,day){return allDays.findIndex(d=>d.month===month&&d.day===day);}
function todayIndex(){const n=new Date();return allDays.findIndex(d=>d.month===n.getMonth()&&d.day===n.getDate());}
function getMonthSpans(){const spans=[];let cur=null;for(const d of allDays){if(!cur||cur.monthName!==d.monthName){if(cur)spans.push(cur);cur={monthName:d.monthName,start:d.index,end:d.index};}else cur.end=d.index;}if(cur)spans.push(cur);return spans;}
function buildWeeks(){const wks=[];let i=0;while(i<allDays.length&&!allDays[i].isMonday)i++;if(i>0)wks.push({start:0,end:i-1,label:`${allDays[0].day}`,monthName:allDays[0].monthName});while(i<allDays.length){const s=i;const e=Math.min(i+6,allDays.length-1);wks.push({start:s,end:e,label:`${allDays[s].day}`,monthName:allDays[s].monthName});i+=7;}return wks;}
function buildOccupancy(bks){const o=new Array(totalDays).fill(false);for(const b of bks){const si=dayIndex(b.start[0],b.start[1]);const ei=dayIndex(b.end[0],b.end[1]);if(si>=0&&ei>=0)for(let i=si;i<=ei;i++)o[i]=true;}return o;}
function buildOccSpans(occ){const s=[];let i=0;while(i<occ.length){const b=occ[i];const st=i;while(i<occ.length&&occ[i]===b)i++;s.push({start:st,end:i-1,booked:b});}return s;}
function formatDateLabel(s,e){const sm=monthNameMap[s[0]];const em=monthNameMap[e[0]];if(s[0]===e[0]&&s[1]===e[1])return`${sm} ${s[1]}`;if(s[0]===e[0])return`${sm} ${s[1]}–${e[1]}`;return`${sm} ${s[1]} – ${em} ${e[1]}`;}
function parseDate(str){if(!str)return null;const p=str.split("-");if(p.length!==3)return null;const m=parseInt(p[1])-1,d=parseInt(p[2]);if(isNaN(m)||isNaN(d))return null;return[m,d];}

// ============================================================
// PERSISTENCE
// ============================================================
const SUPABASE_TABLE="schedule_data"; const LOCAL_KEY="ireland-schedule-2026";
async function loadData(){if(supabase){try{const{data,error}=await supabase.from(SUPABASE_TABLE).select("value").eq("key","schedule").single();if(!error&&data?.value)return data.value;}catch(e){}}try{const r=localStorage.getItem(LOCAL_KEY);if(r)return JSON.parse(r);}catch(e){}return null;}
async function saveData(payload){try{localStorage.setItem(LOCAL_KEY,JSON.stringify(payload));}catch(e){}if(supabase){try{await supabase.from(SUPABASE_TABLE).upsert({key:"schedule",value:payload},{onConflict:"key"});}catch(e){}}}

// ============================================================
// FORM COMPONENTS
// ============================================================
function AddTournamentForm({onAdd,onClose}){
  const[name,setName]=useState("");const[sd,setSd]=useState("");const[ed,setEd]=useState("");const[prov,setProv]=useState("National");
  const submit=()=>{const s=parseDate(sd),e=parseDate(ed||sd);if(!name.trim()||!s||!e)return;onAdd({id:"t_"+Date.now(),name:name.trim(),dates:formatDateLabel(s,e),start:s,end:e,province:prov,type:"tournament",hotel:"pending",flights:"pending",car:"pending",notes:""});onClose();};
  return(
    <div style={{background:"#fff",border:`1px solid ${colors.slate[200]}`,borderRadius:12,padding:24,marginBottom:20,boxShadow:"0 4px 16px rgba(0,0,0,0.06)"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
        <h3 style={{fontSize:16,fontWeight:600,color:colors.slate[900],margin:0}}>Add Tournament</h3>
        <button onClick={onClose} style={{background:"none",border:"none",cursor:"pointer",fontSize:18,color:colors.slate[400],padding:4,lineHeight:1}}>✕</button>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"2fr 1fr 1fr 1fr",gap:16,alignItems:"end"}}>
        <div><label style={formLabel}>Tournament Name</label><input value={name} onChange={e=>setName(e.target.value)} placeholder="e.g. Irish Amateur Open" style={formInput}/></div>
        <div><label style={formLabel}>Start Date</label><input type="date" value={sd} onChange={e=>setSd(e.target.value)} style={formInput}/></div>
        <div><label style={formLabel}>End Date</label><input type="date" value={ed||sd} onChange={e=>setEd(e.target.value)} style={formInput}/></div>
        <div><label style={formLabel}>Province</label><select value={prov} onChange={e=>setProv(e.target.value)} style={formInput}>{Object.keys(provinceColors).map(p=><option key={p}>{p}</option>)}</select></div>
      </div>
      <div style={{display:"flex",gap:8,marginTop:16,justifyContent:"flex-end"}}>
        <button onClick={onClose} style={{...btn,background:colors.slate[100],color:colors.slate[600]}}>Cancel</button>
        <button onClick={submit} style={{...btn,background:colors.indigo[500],color:"#fff"}}>Add Tournament</button>
      </div>
    </div>
  );
}

function AddBookingForm({onAdd,onClose}){
  const[plat,setPlat]=useState("Airbnb");const[sd,setSd]=useState("");const[ed,setEd]=useState("");
  const submit=()=>{const s=parseDate(sd),e=parseDate(ed);if(!s||!e)return;onAdd({id:"b_"+Date.now(),name:plat,dates:formatDateLabel(s,e),start:s,end:e,platform:plat,type:"booking"});onClose();};
  return(
    <div style={{background:"#fff",border:`1px solid ${colors.slate[200]}`,borderRadius:12,padding:24,marginBottom:20,boxShadow:"0 4px 16px rgba(0,0,0,0.06)"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
        <h3 style={{fontSize:16,fontWeight:600,color:colors.slate[900],margin:0}}>Add Booking</h3>
        <button onClick={onClose} style={{background:"none",border:"none",cursor:"pointer",fontSize:18,color:colors.slate[400],padding:4,lineHeight:1}}>✕</button>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:16,alignItems:"end"}}>
        <div><label style={formLabel}>Platform</label><select value={plat} onChange={e=>setPlat(e.target.value)} style={formInput}>{Object.keys(platformColors).map(p=><option key={p}>{p}</option>)}</select></div>
        <div><label style={formLabel}>Check-in</label><input type="date" value={sd} onChange={e=>setSd(e.target.value)} style={formInput}/></div>
        <div><label style={formLabel}>Check-out</label><input type="date" value={ed} onChange={e=>setEd(e.target.value)} style={formInput}/></div>
      </div>
      <div style={{display:"flex",gap:8,marginTop:16,justifyContent:"flex-end"}}>
        <button onClick={onClose} style={{...btn,background:colors.slate[100],color:colors.slate[600]}}>Cancel</button>
        <button onClick={submit} style={{...btn,background:colors.indigo[500],color:"#fff"}}>Add Booking</button>
      </div>
    </div>
  );
}

const formLabel={fontSize:12,fontWeight:600,color:colors.slate[500],display:"block",marginBottom:6,letterSpacing:"0.05em",textTransform:"uppercase"};
const formInput={width:"100%",padding:"10px 14px",fontSize:14,border:`1px solid ${colors.slate[200]}`,borderRadius:8,background:"#fff",color:colors.slate[900],outline:"none",boxSizing:"border-box",transition:"border-color 0.15s"};
const btn={padding:"10px 20px",fontSize:13,fontWeight:600,border:"none",borderRadius:8,cursor:"pointer",transition:"all 0.15s"};

// ============================================================
// MAIN
// ============================================================
const LABEL_W=280; const ROW_H=80; const SECTION_H=44; const OCCUPANCY_H=28;

export default function Home(){
  const[tournaments,setTournaments]=useState(defaultTournaments);
  const[rentalBookings,setRentalBookings]=useState(defaultBookings);
  const[hoveredId,setHoveredId]=useState(null);
  const[view,setView]=useState("gantt");
  const[resolution,setResolution]=useState("day");
  const[showAddT,setShowAddT]=useState(false);
  const[showAddB,setShowAddB]=useState(false);
  const[loaded,setLoaded]=useState(false);
  const[saving,setSaving]=useState(false);
  const[checkingEmail,setCheckingEmail]=useState(false);
  const[emailResult,setEmailResult]=useState(null);
  const[gmailConnected,setGmailConnected]=useState(false);
  const[tournamentsOpen,setTournamentsOpen]=useState(true);
  const[bookingsOpen,setBookingsOpen]=useState(true);
  const[logisticsFilter,setLogisticsFilter]=useState("all");

  const scrollRef=useRef(null);
  const isDragging=useRef(false);
  const dragStartX=useRef(0);
  const dragScrollLeft=useRef(0);
  const saveTimeout=useRef(null);
  const isRemoteUpdate=useRef(false);
  const lastSaveHash=useRef("");
  const tIdx=todayIndex();

  const handleMouseDown=(e)=>{if(!scrollRef.current)return;isDragging.current=true;dragStartX.current=e.pageX-scrollRef.current.offsetLeft;dragScrollLeft.current=scrollRef.current.scrollLeft;scrollRef.current.style.cursor="grabbing";scrollRef.current.style.userSelect="none";};
  const handleMouseMove=(e)=>{if(!isDragging.current||!scrollRef.current)return;e.preventDefault();scrollRef.current.scrollLeft=dragScrollLeft.current-(e.pageX-scrollRef.current.offsetLeft-dragStartX.current)*1.5;};
  const handleMouseUp=()=>{isDragging.current=false;if(scrollRef.current){scrollRef.current.style.cursor="grab";scrollRef.current.style.userSelect="";}};

  useEffect(()=>{
    loadData().then(data=>{if(data){if(data.tournaments?.length)setTournaments(data.tournaments);if(data.bookings?.length)setRentalBookings(data.bookings);}setLoaded(true);});
    if(supabase){supabase.from("schedule_data").select("value").eq("key","gmail_tokens").single().then(({data})=>{if(data?.value)setGmailConnected(true);});}
    if(typeof window!=="undefined"){const p=new URLSearchParams(window.location.search);if(p.get("gmail")==="connected"){setGmailConnected(true);window.history.replaceState({},"","/");}}
  },[]);

  useEffect(()=>{
    if(!loaded)return;if(isRemoteUpdate.current){isRemoteUpdate.current=false;return;}
    const hash=JSON.stringify({tournaments,bookings:rentalBookings});if(hash===lastSaveHash.current)return;
    if(saveTimeout.current)clearTimeout(saveTimeout.current);
    saveTimeout.current=setTimeout(async()=>{setSaving(true);lastSaveHash.current=hash;await saveData({tournaments,bookings:rentalBookings});setSaving(false);},500);
    return()=>{if(saveTimeout.current)clearTimeout(saveTimeout.current);};
  },[tournaments,rentalBookings,loaded]);

  useEffect(()=>{
    if(!supabase)return;
    const channel=supabase.channel("schedule-changes").on("postgres_changes",{event:"*",schema:"public",table:SUPABASE_TABLE,filter:"key=eq.schedule"},(payload)=>{
      const val=payload.new?.value;if(!val)return;const hash=JSON.stringify(val);if(hash===lastSaveHash.current)return;
      isRemoteUpdate.current=true;lastSaveHash.current=hash;if(val.tournaments)setTournaments(val.tournaments);setTimeout(()=>{isRemoteUpdate.current=true;},0);if(val.bookings)setRentalBookings(val.bookings);
    }).subscribe();
    return()=>{supabase.removeChannel(channel);};
  },[]);

  const handleCheckEmails=async()=>{
    setCheckingEmail(true);setEmailResult(null);
    try{const res=await fetch("/api/check-emails",{method:"POST"});const data=await res.json();if(data.needsAuth){window.location.href="/api/auth/gmail";return;}setEmailResult(data);
    if(data.matched>0){const fresh=await loadData();if(fresh?.tournaments){isRemoteUpdate.current=true;lastSaveHash.current=JSON.stringify(fresh);setTournaments(fresh.tournaments);}}}catch(e){setEmailResult({error:e.message});}finally{setCheckingEmail(false);}
  };

  const unitW=resolution==="day"?14:resolution==="week"?28:80;
  const monthSpans=getMonthSpans(); const weeks=buildWeeks();

  function dayToPx(di){
    if(resolution==="day")return di*unitW;
    if(resolution==="week"){for(const w of weeks){if(di>=w.start&&di<=w.end)return(weeks.indexOf(w)+(di-w.start)/(w.end-w.start+1))*unitW;}return 0;}
    for(const ms of monthSpans){if(di>=ms.start&&di<=ms.end)return(monthSpans.indexOf(ms)+(di-ms.start)/(ms.end-ms.start+1))*unitW;}return 0;
  }
  function durationToPx(s,e){return dayToPx(e+1)-dayToPx(s);}
  const chartWidth=resolution==="day"?totalDays*unitW:resolution==="week"?weeks.length*unitW:monthSpans.length*unitW;

  useEffect(()=>{if(scrollRef.current&&tIdx>=0)scrollRef.current.scrollLeft=Math.max(0,dayToPx(tIdx)-300);},[view,resolution]);

  const occupancy=buildOccupancy(rentalBookings);const occSpans=buildOccSpans(occupancy);
  const bookedDays=occupancy.filter(Boolean).length;const occRate=Math.round((bookedDays/totalDays)*100);
  const sortedT=[...tournaments].sort((a,b)=>a.start[0]!==b.start[0]?a.start[0]-b.start[0]:a.start[1]-b.start[1]);
  const sortedB=[...rentalBookings].sort((a,b)=>a.start[0]!==b.start[0]?a.start[0]-b.start[0]:a.start[1]-b.start[1]);

  const toggleStatus=(id,f)=>setTournaments(p=>p.map(t=>t.id!==id?t:{...t,[f]:statusCycle[(statusCycle.indexOf(t[f])+1)%3]}));
  const updateNotes=(id,v)=>setTournaments(p=>p.map(t=>t.id===id?{...t,notes:v}:t));
  const deleteT=id=>setTournaments(p=>p.filter(t=>t.id!==id));
  const deleteB=id=>setRentalBookings(p=>p.filter(b=>b.id!==id));

  const pendingCount=tournaments.reduce((s,t)=>s+(t.hotel==="pending"?1:0)+(t.flights==="pending"?1:0)+(t.car==="pending"?1:0),0);
  const bookedCount=tournaments.reduce((s,t)=>s+(t.hotel==="booked"?1:0)+(t.flights==="booked"?1:0)+(t.car==="booked"?1:0),0);

  const filteredT=logisticsFilter==="all"?sortedT:logisticsFilter==="pending"?sortedT.filter(t=>t.hotel==="pending"||t.flights==="pending"||t.car==="pending"):sortedT.filter(t=>t.hotel==="booked"||t.flights==="booked"||t.car==="booked");

  // Status pill
  const StatusPill=({status,onClick})=>{const c=statusConfig[status];return(
    <button onClick={onClick} style={{display:"inline-flex",alignItems:"center",gap:5,padding:"6px 14px",borderRadius:20,background:c.bg,border:`1px solid ${c.border}`,cursor:"pointer",fontSize:12,fontWeight:600,color:c.color,transition:"all 0.15s",lineHeight:1}}>
      <span style={{fontSize:13}}>{c.icon}</span>{c.label}
    </button>
  );};

  // ============================================================
  // RENDER
  // ============================================================
  return(
    <div style={{fontFamily:"'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif",background:colors.slate[50],color:colors.slate[900],minHeight:"100vh",padding:"32px 24px"}}>
      <div style={{maxWidth:1600,margin:"0 auto"}}>

        {/* ---- HEADER ---- */}
        <div style={{marginBottom:32}}>
          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:8}}>
            <span style={{fontSize:11,fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase",color:colors.indigo[500],background:colors.indigo[50],padding:"4px 12px",borderRadius:20,border:`1px solid ${colors.indigo[100]}`}}>2026 Season</span>
            {saving&&<span style={{fontSize:11,color:colors.amber[600],background:colors.amber[50],padding:"4px 10px",borderRadius:20,border:`1px solid ${colors.amber[100]}`}}>Saving...</span>}
            {!saving&&loaded&&supabase&&<span style={{fontSize:11,color:colors.emerald[600],background:colors.emerald[50],padding:"4px 10px",borderRadius:20,border:`1px solid ${colors.emerald[100]}`}}>● Synced</span>}
            {!supabase&&loaded&&<span style={{fontSize:11,color:colors.amber[600],background:colors.amber[50],padding:"4px 10px",borderRadius:20,border:`1px solid ${colors.amber[100]}`}}>Local only</span>}
          </div>
          <h1 style={{fontSize:36,fontWeight:700,margin:"0 0 8px",color:colors.slate[900],letterSpacing:"-0.02em"}}>Tournaments & Bookings</h1>
          <div style={{display:"flex",gap:24,fontSize:14,color:colors.slate[500]}}>
            <span><strong style={{color:colors.slate[700],fontSize:20}}>{sortedT.length}</strong> tournaments</span>
            <span><strong style={{color:colors.slate[700],fontSize:20}}>{sortedB.length}</strong> bookings</span>
            <span><strong style={{color:colors.slate[700],fontSize:20}}>{bookedDays}</strong> nights ({occRate}%)</span>
          </div>
        </div>

        {/* ---- NAV CARD ---- */}
        <div style={{background:"#fff",borderRadius:16,boxShadow:"0 4px 24px rgba(148,163,184,0.12)",padding:"16px 24px",marginBottom:24,display:"flex",alignItems:"center",gap:12,flexWrap:"wrap"}}>
          {/* Tabs */}
          {[{key:"gantt",label:"📊 Timeline"},{key:"logistics",label:"📋 Logistics"}].map(v=>(
            <button key={v.key} onClick={()=>setView(v.key)} style={{
              background:view===v.key?colors.indigo[500]:"transparent",
              color:view===v.key?"#fff":colors.slate[600],
              border:"none",padding:"10px 20px",borderRadius:10,cursor:"pointer",fontSize:14,fontWeight:600,
              transition:"all 0.15s",
              boxShadow:view===v.key?"0 2px 8px rgba(99,102,241,0.3)":"none",
            }}>{v.label}
              {v.key==="logistics"&&pendingCount>0&&<span style={{marginLeft:6,background:view===v.key?"rgba(255,255,255,0.25)":colors.amber[50],color:view===v.key?"#fff":colors.amber[600],padding:"2px 8px",borderRadius:10,fontSize:11,fontWeight:700}}>{pendingCount}</span>}
            </button>
          ))}

          {/* Resolution toggle */}
          {view==="gantt"&&(
            <div style={{display:"flex",gap:2,marginLeft:8,background:colors.slate[100],borderRadius:8,padding:3}}>
              {["day","week","month"].map(r=>(
                <button key={r} onClick={()=>setResolution(r)} style={{background:resolution===r?"#fff":"transparent",color:resolution===r?colors.slate[900]:colors.slate[500],border:"none",padding:"6px 16px",borderRadius:6,cursor:"pointer",fontSize:13,fontWeight:600,boxShadow:resolution===r?"0 1px 3px rgba(0,0,0,0.08)":"none",transition:"all 0.15s"}}>{r.charAt(0).toUpperCase()+r.slice(1)}</button>
              ))}
            </div>
          )}

          <div style={{flex:1}}/>

          {/* Gmail button */}
          {view==="logistics"&&(
            <button onClick={gmailConnected?handleCheckEmails:()=>{window.location.href="/api/auth/gmail";}} disabled={checkingEmail} style={{
              ...btn,background:checkingEmail?colors.slate[100]:"#fff",color:checkingEmail?colors.slate[400]:colors.amber[600],
              border:`1px solid ${colors.amber[100]}`,cursor:checkingEmail?"wait":"pointer",display:"flex",alignItems:"center",gap:6,
            }}>{checkingEmail?"⏳ Checking...":gmailConnected?"📧 Check Emails":"📧 Connect Gmail"}</button>
          )}

          <button onClick={()=>{setShowAddT(true);setShowAddB(false);}} style={{...btn,background:"#fff",color:colors.indigo[500],border:`1px solid ${colors.indigo[100]}`}}>+ Tournament</button>
          <button onClick={()=>{setShowAddB(true);setShowAddT(false);}} style={{...btn,background:"#fff",color:colors.blue[500],border:`1px solid ${colors.blue[100]}`}}>+ Booking</button>
        </div>

        {/* Forms */}
        {showAddT&&<AddTournamentForm onAdd={t=>setTournaments(p=>[...p,t])} onClose={()=>setShowAddT(false)}/>}
        {showAddB&&<AddBookingForm onAdd={b=>setRentalBookings(p=>[...p,b])} onClose={()=>setShowAddB(false)}/>}

        {/* Email results */}
        {emailResult&&(
          <div style={{background:emailResult.error?colors.red[50]:colors.emerald[50],border:`1px solid ${emailResult.error?colors.red[100]:colors.emerald[100]}`,borderRadius:12,padding:"14px 20px",marginBottom:20,display:"flex",alignItems:"center",gap:12}}>
            <span style={{fontSize:18}}>{emailResult.error?"❌":"📧"}</span>
            <div style={{flex:1,fontSize:13,color:emailResult.error?colors.red[600]:colors.emerald[600]}}>
              {emailResult.error?`Error: ${emailResult.error}`:`Scanned ${emailResult.totalEmailsScanned} emails — found ${emailResult.found} booking${emailResult.found!==1?"s":""}, matched ${emailResult.matched} to tournaments`}
              {emailResult.results?.length>0&&(<div style={{marginTop:8,display:"flex",flexWrap:"wrap",gap:6}}>{emailResult.results.map((r,i)=>(<span key={i} style={{fontSize:11,background:"#fff",border:`1px solid ${colors.slate[200]}`,borderRadius:6,padding:"3px 10px",color:colors.slate[600]}}>{r.type==="flight"?"✈️":"🏨"} {r.summary||r.provider} {r.matchedTournament?"→ matched":"→ unmatched"}</span>))}</div>)}
            </div>
            <button onClick={()=>setEmailResult(null)} style={{background:"none",border:"none",cursor:"pointer",fontSize:16,color:colors.slate[400]}}>✕</button>
          </div>
        )}

        {/* ===== LOGISTICS VIEW ===== */}
        {view==="logistics"&&(
          <div style={{background:"#fff",borderRadius:16,boxShadow:"0 4px 24px rgba(148,163,184,0.12)",overflow:"hidden"}}>
            {/* Filter bar */}
            <div style={{display:"flex",alignItems:"center",gap:16,padding:"16px 24px",borderBottom:`1px solid ${colors.slate[100]}`}}>
              <div style={{display:"flex",gap:6}}>
                {[{key:"all",label:"All"},{key:"pending",label:"Pending"},{key:"booked",label:"Booked"}].map(f=>(
                  <button key={f.key} onClick={()=>setLogisticsFilter(f.key)} style={{padding:"6px 16px",borderRadius:8,fontSize:12,fontWeight:600,cursor:"pointer",border:`1px solid ${logisticsFilter===f.key?colors.indigo[100]:colors.slate[200]}`,background:logisticsFilter===f.key?colors.indigo[50]:"#fff",color:logisticsFilter===f.key?colors.indigo[500]:colors.slate[500],transition:"all 0.15s"}}>{f.label}</button>
                ))}
              </div>
              <div style={{flex:1}}/>
              <div style={{display:"flex",gap:20,alignItems:"center"}}>
                <div style={{textAlign:"center"}}><div style={{fontSize:24,fontWeight:700,color:colors.emerald[500]}}>{bookedCount}</div><div style={{fontSize:11,color:colors.slate[500],fontWeight:600,textTransform:"uppercase",letterSpacing:"0.05em"}}>Booked</div></div>
                <div style={{width:1,height:40,background:colors.slate[200]}}/>
                <div style={{textAlign:"center"}}><div style={{fontSize:24,fontWeight:700,color:colors.amber[500]}}>{pendingCount}</div><div style={{fontSize:11,color:colors.slate[500],fontWeight:600,textTransform:"uppercase",letterSpacing:"0.05em"}}>Pending</div></div>
                <div style={{width:1,height:40,background:colors.slate[200]}}/>
                <div style={{textAlign:"center"}}><div style={{fontSize:24,fontWeight:700,color:colors.slate[700]}}>{Math.round(bookedCount/(bookedCount+pendingCount||1)*100)}%</div><div style={{fontSize:11,color:colors.slate[500],fontWeight:600,textTransform:"uppercase",letterSpacing:"0.05em"}}>Complete</div></div>
              </div>
            </div>

            {/* Table header */}
            <div style={{display:"grid",gridTemplateColumns:"1fr 120px 120px 120px 100px 180px",padding:"12px 24px",background:colors.slate[50],borderBottom:`1px solid ${colors.slate[200]}`,fontSize:11,fontWeight:700,color:colors.slate[500],letterSpacing:"0.08em",textTransform:"uppercase"}}>
              <span>Tournament</span><span>Dates</span><span style={{textAlign:"center"}}>🏨 Hotel</span><span style={{textAlign:"center"}}>✈️ Flights</span><span style={{textAlign:"center"}}>🚗 Car</span><span>Notes</span>
            </div>

            {/* Rows */}
            {filteredT.map(t=>{
              const pc=provinceColors[t.province];const hov=hoveredId===t.id;const hasDetails=t.hotelDetails||t.flightDetails;
              return(
                <div key={t.id}>
                  <div onMouseEnter={()=>setHoveredId(t.id)} onMouseLeave={()=>setHoveredId(null)}
                    style={{display:"grid",gridTemplateColumns:"1fr 120px 120px 120px 100px 180px",padding:"16px 24px",borderBottom:hasDetails?"none":`1px solid ${colors.slate[100]}`,background:hov?`${colors.slate[50]}80`:"transparent",alignItems:"center",transition:"background 0.15s",cursor:"default"}}>
                    {/* Tournament name with accent bar */}
                    <div style={{display:"flex",alignItems:"flex-start",gap:14}}>
                      <div style={{width:4,height:48,borderRadius:4,background:pc.bar,flexShrink:0,marginTop:2}}/>
                      <div>
                        <div style={{fontSize:15,fontWeight:600,color:colors.slate[900],marginBottom:6,lineHeight:1.3}}>{t.name}</div>
                        <span style={{fontSize:10,fontWeight:700,letterSpacing:"0.08em",textTransform:"uppercase",color:pc.text,background:pc.bg,padding:"3px 10px",borderRadius:6,border:`1px solid ${pc.border}`}}>{t.province}</span>
                      </div>
                    </div>
                    {/* Dates */}
                    <div>
                      <div style={{fontSize:14,fontWeight:600,color:colors.slate[700]}}>{t.dates}</div>
                      <div style={{fontSize:12,color:colors.slate[400],marginTop:2}}>2026</div>
                    </div>
                    <div style={{display:"flex",justifyContent:"center"}}><StatusPill status={t.hotel} onClick={()=>toggleStatus(t.id,"hotel")}/></div>
                    <div style={{display:"flex",justifyContent:"center"}}><StatusPill status={t.flights} onClick={()=>toggleStatus(t.id,"flights")}/></div>
                    <div style={{display:"flex",justifyContent:"center"}}><StatusPill status={t.car} onClick={()=>toggleStatus(t.id,"car")}/></div>
                    <input type="text" value={t.notes} onChange={e=>updateNotes(t.id,e.target.value)} placeholder="Add note..."
                      style={{fontSize:13,color:colors.slate[600],border:`1px solid ${colors.slate[200]}`,borderRadius:8,padding:"8px 12px",background:colors.slate[50],outline:"none",width:"100%",transition:"border-color 0.15s"}}
                      onFocus={e=>e.target.style.borderColor=colors.indigo[500]} onBlur={e=>e.target.style.borderColor=colors.slate[200]}/>
                  </div>
                  {/* Booking details row */}
                  {hasDetails&&(
                    <div style={{padding:"4px 24px 16px 42px",borderBottom:`1px solid ${colors.slate[100]}`,display:"flex",gap:10,flexWrap:"wrap"}}>
                      {t.flightDetails&&(
                        <div style={{fontSize:12,background:colors.blue[50],border:`1px solid ${colors.blue[100]}`,borderRadius:8,padding:"6px 14px",color:colors.blue[600],display:"flex",gap:8,alignItems:"center"}}>
                          <span>✈️</span><span style={{fontWeight:600}}>{t.flightDetails.provider}</span>
                          {t.flightDetails.confirmation&&<span style={{fontFamily:"monospace",fontSize:11,background:colors.blue[100],padding:"2px 6px",borderRadius:4}}>{t.flightDetails.confirmation}</span>}
                          <span>{t.flightDetails.summary||""}</span>
                          {t.flightDetails.price&&<span style={{fontWeight:600}}>{t.flightDetails.price}</span>}
                        </div>
                      )}
                      {t.hotelDetails&&(
                        <div style={{fontSize:12,background:colors.purple[50],border:`1px solid ${colors.purple[100]}`,borderRadius:8,padding:"6px 14px",color:colors.purple[600],display:"flex",gap:8,alignItems:"center"}}>
                          <span>🏨</span><span style={{fontWeight:600}}>{t.hotelDetails.name}</span>
                          {t.hotelDetails.confirmation&&<span style={{fontFamily:"monospace",fontSize:11,background:colors.purple[100],padding:"2px 6px",borderRadius:4}}>{t.hotelDetails.confirmation}</span>}
                          {t.hotelDetails.checkIn&&<span>{t.hotelDetails.checkIn} → {t.hotelDetails.checkOut}</span>}
                          {t.hotelDetails.price&&<span style={{fontWeight:600}}>{t.hotelDetails.price}</span>}
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
        {view==="gantt"&&(
          <div style={{background:"#fff",borderRadius:16,boxShadow:"0 4px 24px rgba(148,163,184,0.12)",overflow:"hidden"}}>
            <div style={{display:"flex"}}>
              {/* Fixed labels */}
              <div style={{width:LABEL_W,flexShrink:0,borderRight:`1px solid ${colors.slate[200]}`,zIndex:10,background:"#fff"}}>
                <div style={{height:28,borderBottom:`1px solid ${colors.slate[200]}`}}/>
                <div style={{height:22,borderBottom:`1px solid ${colors.slate[200]}`}}/>
                {/* Tournament section header */}
                <div onClick={()=>setTournamentsOpen(!tournamentsOpen)} style={{height:SECTION_H,display:"flex",alignItems:"center",paddingLeft:20,gap:10,fontSize:13,fontWeight:700,color:colors.slate[700],background:colors.slate[50],borderBottom:`1px solid ${colors.slate[200]}`,cursor:"pointer"}}>
                  <span style={{fontSize:10,transition:"transform 0.2s",transform:tournamentsOpen?"rotate(90deg)":"rotate(0deg)"}}>▶</span>
                  <span>🏆 Tournaments</span>
                  <span style={{fontSize:11,fontWeight:600,color:colors.slate[400],background:colors.slate[100],padding:"2px 8px",borderRadius:10}}>{sortedT.length}</span>
                </div>
                {tournamentsOpen&&sortedT.map(row=>{
                  const hov=hoveredId===row.id;const pc=provinceColors[row.province];
                  return(
                    <div key={row.id} onMouseEnter={()=>setHoveredId(row.id)} onMouseLeave={()=>setHoveredId(null)}
                      style={{height:ROW_H,display:"flex",alignItems:"center",paddingLeft:16,paddingRight:10,gap:12,borderBottom:`1px solid ${colors.slate[100]}`,background:hov?`${colors.slate[50]}80`:"transparent",cursor:"pointer",transition:"background 0.15s"}}>
                      <div style={{width:4,height:40,borderRadius:4,background:pc.bar,flexShrink:0}}/>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{fontSize:13,fontWeight:hov?700:600,color:hov?colors.slate[900]:colors.slate[700],whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",marginBottom:4}}>{row.name}</div>
                        <span style={{fontSize:9,fontWeight:700,letterSpacing:"0.08em",textTransform:"uppercase",color:pc.text,background:pc.bg,padding:"2px 8px",borderRadius:4,border:`1px solid ${pc.border}`}}>{row.province}</span>
                      </div>
                    </div>
                  );
                })}
                {/* Bookings section header */}
                <div onClick={()=>setBookingsOpen(!bookingsOpen)} style={{height:SECTION_H,display:"flex",alignItems:"center",paddingLeft:20,gap:10,fontSize:13,fontWeight:700,color:colors.slate[700],background:colors.slate[50],borderBottom:`1px solid ${colors.slate[200]}`,borderTop:`1px solid ${colors.slate[200]}`,cursor:"pointer"}}>
                  <span style={{fontSize:10,transition:"transform 0.2s",transform:bookingsOpen?"rotate(90deg)":"rotate(0deg)"}}>▶</span>
                  <span>🏠 Bookings</span>
                  <span style={{fontSize:11,fontWeight:600,color:colors.slate[400],background:colors.slate[100],padding:"2px 8px",borderRadius:10}}>{sortedB.length}</span>
                </div>
                {bookingsOpen&&<>
                  <div style={{height:OCCUPANCY_H,display:"flex",alignItems:"center",paddingLeft:28,fontSize:11,fontWeight:600,color:colors.slate[400],borderBottom:`1px solid ${colors.slate[100]}`,background:colors.slate[50]}}>Availability</div>
                  {sortedB.map(row=>{
                    const hov=hoveredId===row.id;const pc2=platformColors[row.platform];
                    return(
                      <div key={row.id} onMouseEnter={()=>setHoveredId(row.id)} onMouseLeave={()=>setHoveredId(null)}
                        style={{height:ROW_H,display:"flex",alignItems:"center",paddingLeft:16,paddingRight:10,gap:12,borderBottom:`1px solid ${colors.slate[100]}`,background:hov?`${colors.slate[50]}80`:"transparent",cursor:"pointer",transition:"background 0.15s"}}>
                        <div style={{width:4,height:40,borderRadius:4,background:pc2.bar,flexShrink:0}}/>
                        <div style={{flex:1,minWidth:0}}>
                          <div style={{fontSize:13,fontWeight:hov?700:600,color:hov?colors.slate[900]:colors.slate[700],marginBottom:4}}>{row.platform}</div>
                          <span style={{fontSize:11,color:colors.slate[400],fontFamily:"monospace"}}>{row.dates}</span>
                        </div>
                      </div>
                    );
                  })}
                </>}
              </div>

              {/* Scrollable chart */}
              <div ref={scrollRef} style={{flex:1,overflowX:"auto",overflowY:"hidden",cursor:"grab"}} onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}>
                <div style={{width:chartWidth,position:"relative"}}>
                  {/* Chart headers */}
                  {resolution==="day"?(<>
                    <div style={{height:28,position:"relative",borderBottom:`1px solid ${colors.slate[200]}`}}>
                      {monthSpans.map((ms,i)=>(<div key={ms.monthName} style={{position:"absolute",left:ms.start*unitW,width:(ms.end-ms.start+1)*unitW,height:"100%",display:"flex",alignItems:"center",paddingLeft:8,fontSize:12,fontWeight:700,color:colors.slate[700],letterSpacing:"0.05em",textTransform:"uppercase",borderLeft:i>0?`1px solid ${colors.slate[200]}`:"none"}}>{ms.monthName}</div>))}
                    </div>
                    <div style={{height:22,position:"relative",borderBottom:`1px solid ${colors.slate[200]}`}}>
                      {allDays.filter(d=>d.isMonday).map(d=>(<div key={d.index} style={{position:"absolute",left:d.index*unitW,width:unitW*2,height:"100%",display:"flex",alignItems:"center",paddingLeft:2,fontSize:9,color:colors.slate[400],fontWeight:500}}>{d.day}</div>))}
                    </div>
                  </>):resolution==="week"?(<>
                    <div style={{height:28,position:"relative",borderBottom:`1px solid ${colors.slate[200]}`}}>
                      {monthSpans.map((ms,i)=>{const sw=weeks.findIndex(w=>w.start<=ms.start&&w.end>=ms.start);const ew=weeks.findIndex(w=>w.start<=ms.end&&w.end>=ms.end);return(<div key={ms.monthName} style={{position:"absolute",left:sw*unitW,width:(ew-sw+1)*unitW,height:"100%",display:"flex",alignItems:"center",paddingLeft:8,fontSize:12,fontWeight:700,color:colors.slate[700],letterSpacing:"0.05em",textTransform:"uppercase",borderLeft:i>0?`1px solid ${colors.slate[200]}`:"none",overflow:"hidden"}}>{ms.monthName}</div>);})}
                    </div>
                    <div style={{height:22,position:"relative",borderBottom:`1px solid ${colors.slate[200]}`}}>
                      {weeks.map((w,i)=>(<div key={i} style={{position:"absolute",left:i*unitW,width:unitW,height:"100%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,color:colors.slate[400],fontWeight:500,borderLeft:`1px solid ${colors.slate[100]}`}}>{w.label}</div>))}
                    </div>
                  </>):(<>
                    <div style={{height:28,position:"relative",borderBottom:`1px solid ${colors.slate[200]}`}}>
                      {monthSpans.map((ms,i)=>(<div key={ms.monthName} style={{position:"absolute",left:i*unitW,width:unitW,height:"100%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:700,color:colors.slate[700],letterSpacing:"0.05em",textTransform:"uppercase",borderLeft:i>0?`1px solid ${colors.slate[200]}`:"none"}}>{ms.monthName}</div>))}
                    </div>
                    <div style={{height:22,borderBottom:`1px solid ${colors.slate[200]}`}}/>
                  </>)}

                  {/* Tournament section header row */}
                  <div style={{height:SECTION_H,background:colors.slate[50],borderBottom:`1px solid ${colors.slate[200]}`,position:"relative"}}/>

                  {/* Tournament bars */}
                  {tournamentsOpen&&sortedT.map(row=>{
                    const si=dayIndex(row.start[0],row.start[1]);const ei=dayIndex(row.end[0],row.end[1]);if(si<0||ei<0)return null;
                    const dur=ei-si+1;const hov=hoveredId===row.id;const pc=provinceColors[row.province];
                    const left=dayToPx(si);const w=Math.max(durationToPx(si,ei),resolution==="month"?8:unitW-2);
                    return(
                      <div key={row.id} onMouseEnter={()=>setHoveredId(row.id)} onMouseLeave={()=>setHoveredId(null)} style={{height:ROW_H,position:"relative",borderBottom:`1px solid ${colors.slate[100]}`,background:hov?`${colors.slate[50]}80`:"transparent",transition:"background 0.15s"}}>
                        {/* Grid lines */}
                        {resolution==="day"&&allDays.filter(d=>d.isWeekend).map(d=>(<div key={`we-${d.index}`} style={{position:"absolute",left:d.index*unitW,top:0,width:unitW,height:ROW_H,background:"rgba(0,0,0,0.015)"}}/>))}
                        {tIdx>=0&&<div style={{position:"absolute",left:dayToPx(tIdx)+(resolution==="day"?unitW/2:0),top:0,width:2,height:ROW_H,background:colors.red[500],opacity:0.2,zIndex:5}}/>}
                        {/* Bar */}
                        <div style={{position:"absolute",left:left+2,width:w-4,top:20,height:32,background:pc.bar,borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center",zIndex:10,transition:"all 0.15s",boxShadow:hov?`0 4px 12px ${pc.bar}30`:`0 1px 3px ${pc.bar}15`,overflow:"hidden"}}>
                          {w>40&&<span style={{fontSize:11,fontWeight:700,color:"#fff",whiteSpace:"nowrap",padding:"0 8px"}}>{row.dates}</span>}
                        </div>
                        {hov&&(<div style={{position:"absolute",left:Math.min(left+w+12,chartWidth-280),top:"50%",transform:"translateY(-50%)",background:"#fff",border:`1px solid ${colors.slate[200]}`,borderRadius:10,padding:"8px 14px",boxShadow:"0 8px 24px rgba(0,0,0,0.12)",zIndex:20,whiteSpace:"nowrap",fontSize:13,color:colors.slate[600],display:"flex",gap:10,alignItems:"center"}}>
                          <span style={{fontWeight:700,color:colors.slate[900]}}>{row.name}</span>
                          <span>{row.dates}</span>
                          <span style={{fontSize:10,fontWeight:700,color:pc.text,background:pc.bg,padding:"2px 8px",borderRadius:4}}>{row.province}</span>
                        </div>)}
                      </div>
                    );
                  })}

                  {/* Bookings section header row */}
                  <div style={{height:SECTION_H,background:colors.slate[50],borderBottom:`1px solid ${colors.slate[200]}`,borderTop:`1px solid ${colors.slate[200]}`,position:"relative"}}/>

                  {/* Occupancy row */}
                  {bookingsOpen&&<>
                    <div style={{height:OCCUPANCY_H,position:"relative",borderBottom:`1px solid ${colors.slate[100]}`,background:colors.slate[50]}}>
                      {occSpans.map((span,si)=>{const left=dayToPx(span.start);const w=durationToPx(span.start,span.end);const sd2=span.end-span.start+1;
                        return(<div key={si} style={{position:"absolute",left,width:w,top:4,bottom:4,background:span.booked?colors.red[500]:colors.emerald[500],borderRadius:4,opacity:0.6,display:"flex",alignItems:"center",justifyContent:"center",overflow:"hidden"}}>{w>28&&<span style={{fontSize:9,fontWeight:700,color:"#fff"}}>{sd2}d</span>}</div>);
                      })}
                    </div>

                    {/* Booking bars */}
                    {sortedB.map(row=>{
                      const si=dayIndex(row.start[0],row.start[1]);const ei=dayIndex(row.end[0],row.end[1]);if(si<0||ei<0)return null;
                      const dur=ei-si+1;const hov=hoveredId===row.id;const pc2=platformColors[row.platform];
                      const left=dayToPx(si);const w=Math.max(durationToPx(si,ei),resolution==="month"?8:unitW-2);
                      return(
                        <div key={row.id} onMouseEnter={()=>setHoveredId(row.id)} onMouseLeave={()=>setHoveredId(null)} style={{height:ROW_H,position:"relative",borderBottom:`1px solid ${colors.slate[100]}`,background:hov?`${colors.slate[50]}80`:"transparent",transition:"background 0.15s"}}>
                          {resolution==="day"&&allDays.filter(d=>d.isWeekend).map(d=>(<div key={`we-${d.index}`} style={{position:"absolute",left:d.index*unitW,top:0,width:unitW,height:ROW_H,background:"rgba(0,0,0,0.015)"}}/>))}
                          {tIdx>=0&&<div style={{position:"absolute",left:dayToPx(tIdx)+(resolution==="day"?unitW/2:0),top:0,width:2,height:ROW_H,background:colors.red[500],opacity:0.2,zIndex:5}}/>}
                          <div style={{position:"absolute",left:left+2,width:w-4,top:20,height:32,background:pc2.bar,borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center",zIndex:10,transition:"all 0.15s",boxShadow:hov?`0 4px 12px ${pc2.bar}30`:`0 1px 3px ${pc2.bar}15`,overflow:"hidden"}}>
                            {w>40&&<span style={{fontSize:11,fontWeight:700,color:"#fff",whiteSpace:"nowrap",padding:"0 8px"}}>{row.dates}</span>}
                          </div>
                          {hov&&(<div style={{position:"absolute",left:Math.min(left+w+12,chartWidth-240),top:"50%",transform:"translateY(-50%)",background:"#fff",border:`1px solid ${colors.slate[200]}`,borderRadius:10,padding:"8px 14px",boxShadow:"0 8px 24px rgba(0,0,0,0.12)",zIndex:20,whiteSpace:"nowrap",fontSize:13,color:colors.slate[600],display:"flex",gap:10,alignItems:"center"}}>
                            <span style={{fontWeight:700,color:colors.slate[900]}}>{row.platform}</span>
                            <span>{row.dates}</span>
                            <span style={{fontSize:10,fontWeight:700,color:pc2.text,background:pc2.bg,padding:"2px 8px",borderRadius:4}}>{row.platform}</span>
                          </div>)}
                        </div>
                      );
                    })}
                  </>}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ---- LEGEND ---- */}
        <div style={{display:"flex",flexWrap:"wrap",gap:16,marginTop:20,padding:"0 4px",alignItems:"center"}}>
          <span style={{fontSize:12,fontWeight:700,color:colors.slate[500]}}>Tournaments:</span>
          {Object.entries(provinceColors).map(([n,c])=><div key={n} style={{display:"flex",alignItems:"center",gap:6}}><div style={{width:12,height:4,borderRadius:2,background:c.bar}}/><span style={{fontSize:12,color:colors.slate[500]}}>{n}</span></div>)}
          <div style={{width:1,height:16,background:colors.slate[200]}}/>
          <span style={{fontSize:12,fontWeight:700,color:colors.slate[500]}}>Bookings:</span>
          {Object.entries(platformColors).map(([n,c])=><div key={n} style={{display:"flex",alignItems:"center",gap:6}}><div style={{width:12,height:4,borderRadius:2,background:c.bar}}/><span style={{fontSize:12,color:colors.slate[500]}}>{n}</span></div>)}
          <div style={{width:1,height:16,background:colors.slate[200]}}/>
          <span style={{fontSize:12,fontWeight:700,color:colors.slate[500]}}>Availability:</span>
          <div style={{display:"flex",alignItems:"center",gap:6}}><div style={{width:12,height:4,borderRadius:2,background:colors.emerald[500]}}/><span style={{fontSize:12,color:colors.slate[500]}}>Vacant</span></div>
          <div style={{display:"flex",alignItems:"center",gap:6}}><div style={{width:12,height:4,borderRadius:2,background:colors.red[500]}}/><span style={{fontSize:12,color:colors.slate[500]}}>Booked</span></div>
        </div>
      </div>
    </div>
  );
}
