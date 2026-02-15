"use client";
import { useState, useRef, useEffect } from "react";
import { supabase } from "./supabase";

// ============================================================
// DEFAULT DATA — now includes venue and priority
// ============================================================
const defaultTournaments = [
  { id: "t1", name: "Flogas Irish Girls' Amateur Open", dates: "May 1–3", start: [4,1], end: [4,3], province: "National", type: "tournament", hotel: "pending", flights: "pending", car: "pending", notes: "", venue: "", priority: false },
  { id: "t2", name: "Flogas Irish Women's Amateur Open", dates: "May 15–17", start: [4,15], end: [4,17], province: "National", type: "tournament", hotel: "pending", flights: "pending", car: "pending", notes: "", venue: "", priority: false },
  { id: "t3", name: "Leinster Girls' U18 Open Trophy", dates: "Jun 22", start: [5,22], end: [5,22], province: "Leinster", type: "tournament", hotel: "pending", flights: "pending", car: "pending", notes: "", venue: "", priority: false },
  { id: "t4", name: "Ulster U18 Girls' Amateur Open", dates: "Jun 24–26", start: [5,24], end: [5,26], province: "Ulster", type: "tournament", hotel: "pending", flights: "pending", car: "pending", notes: "", venue: "", priority: false },
  { id: "t5", name: "Connacht U18 Girls' Open", dates: "Jul 9–10", start: [6,9], end: [6,10], province: "Connacht", type: "tournament", hotel: "pending", flights: "pending", car: "pending", notes: "", venue: "", priority: false },
  { id: "t6", name: "Munster U18 Girls' Amateur Open", dates: "Jul 15–17", start: [6,15], end: [6,17], province: "Munster", type: "tournament", hotel: "pending", flights: "pending", car: "pending", notes: "", venue: "", priority: false },
  { id: "t7", name: "AIG Women's & Girls' Amateur Close", dates: "Jul 28–31", start: [6,28], end: [6,31], province: "National", type: "tournament", hotel: "pending", flights: "pending", car: "pending", notes: "", venue: "", priority: false },
  { id: "t8", name: "Interprovincial Matches – U18", dates: "Aug 6–7", start: [7,6], end: [7,7], province: "National", type: "tournament", hotel: "pending", flights: "pending", car: "pending", notes: "", venue: "", priority: false },
  { id: "t9", name: "Munster Junior Close Event", dates: "Aug 21", start: [7,21], end: [7,21], province: "Munster", type: "tournament", hotel: "pending", flights: "pending", car: "pending", notes: "", venue: "", priority: false },
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
// DESIGN TOKENS
// ============================================================
const C = {
  s: { 50:"#f8fafc",100:"#f1f5f9",200:"#e2e8f0",300:"#cbd5e1",400:"#94a3b8",500:"#64748b",600:"#475569",700:"#334155",800:"#1e293b",900:"#0f172a" },
  i: { 50:"#eef2ff",100:"#e0e7ff",500:"#6366f1",600:"#4f46e5",700:"#4338ca" },
  e: { 50:"#ecfdf5",100:"#d1fae5",500:"#10b981",600:"#059669" },
  a: { 50:"#fffbeb",100:"#fef3c7",500:"#f59e0b",600:"#d97706" },
  r: { 50:"#fef2f2",100:"#fee2e2",500:"#ef4444",600:"#dc2626" },
  b: { 50:"#eff6ff",100:"#dbeafe",500:"#3b82f6",600:"#2563eb" },
  p: { 50:"#faf5ff",100:"#f3e8ff",500:"#a855f7",600:"#9333ea" },
  ro: { 50:"#fff1f2",100:"#ffe4e6",500:"#f43f5e",600:"#e11d48" },
};

const provC = {
  National: { bar:C.i[500],bg:C.i[50],border:C.i[100],text:C.i[700] },
  Leinster: { bar:C.e[500],bg:C.e[50],border:C.e[100],text:C.e[600] },
  Ulster: { bar:C.r[500],bg:C.r[50],border:C.r[100],text:C.r[600] },
  Connacht: { bar:C.a[500],bg:C.a[50],border:C.a[100],text:C.a[600] },
  Munster: { bar:C.b[500],bg:C.b[50],border:C.b[100],text:C.b[600] },
};
const platC = {
  Airbnb: { bar:C.ro[500],bg:C.ro[50],border:C.ro[100],text:C.ro[600] },
  Booking: { bar:C.b[500],bg:C.b[50],border:C.b[100],text:C.b[600] },
  Vrbo: { bar:C.p[500],bg:C.p[50],border:C.p[100],text:C.p[600] },
};
const statusCycle=["pending","booked","na"];
const stCfg = {
  pending: { icon:"⏱",label:"Pending",color:C.a[600],bg:C.a[50],border:C.a[100] },
  booked: { icon:"✓",label:"Booked",color:C.e[600],bg:C.e[50],border:C.e[100] },
  na: { icon:"—",label:"N/A",color:C.s[500],bg:C.s[50],border:C.s[200] },
};
const mMap={0:"Jan",1:"Feb",2:"Mar",3:"Apr",4:"May",5:"Jun",6:"Jul",7:"Aug",8:"Sep",9:"Oct",10:"Nov",11:"Dec"};

// ============================================================
// DATE HELPERS
// ============================================================
function buildDays(){const d=[];const mn=["Apr","May","Jun","Jul","Aug","Sep","Oct"];const mi=[3,4,5,6,7,8,9];const md=[30,31,30,31,31,30,31];let ix=0;for(let m=0;m<7;m++){for(let dd=1;dd<=md[m];dd++){const dt=new Date(2026,mi[m],dd);const dw=dt.getDay();d.push({index:ix,day:dd,month:mi[m],monthName:mn[m],isMonday:dw===1,isWeekend:dw===0||dw===6});ix++;}}return d;}
const allDays=buildDays();const totalDays=allDays.length;
function dIdx(m,d){return allDays.findIndex(x=>x.month===m&&x.day===d);}
function todayIdx(){const n=new Date();return allDays.findIndex(d=>d.month===n.getMonth()&&d.day===n.getDate());}
function monthSpans(){const s=[];let c=null;for(const d of allDays){if(!c||c.mn!==d.monthName){if(c)s.push(c);c={mn:d.monthName,s:d.index,e:d.index};}else c.e=d.index;}if(c)s.push(c);return s;}
function buildWeeks(){const w=[];let i=0;while(i<allDays.length&&!allDays[i].isMonday)i++;if(i>0)w.push({s:0,e:i-1,l:`${allDays[0].day}`,mn:allDays[0].monthName});while(i<allDays.length){const st=i;const e=Math.min(i+6,allDays.length-1);w.push({s:st,e,l:`${allDays[st].day}`,mn:allDays[st].monthName});i+=7;}return w;}
function buildOcc(bks){const o=new Array(totalDays).fill(false);for(const b of bks){const si=dIdx(b.start[0],b.start[1]);const ei=dIdx(b.end[0],b.end[1]);if(si>=0&&ei>=0)for(let i=si;i<=ei;i++)o[i]=true;}return o;}
function buildOccSpans(occ){const s=[];let i=0;while(i<occ.length){const b=occ[i];const st=i;while(i<occ.length&&occ[i]===b)i++;s.push({s:st,e:i-1,booked:b});}return s;}
function fmtDate(s,e){const sm=mMap[s[0]];const em=mMap[e[0]];if(s[0]===e[0]&&s[1]===e[1])return`${sm} ${s[1]}`;if(s[0]===e[0])return`${sm} ${s[1]}–${e[1]}`;return`${sm} ${s[1]} – ${em} ${e[1]}`;}
function parseD(str){if(!str)return null;const p=str.split("-");if(p.length!==3)return null;const m=parseInt(p[1])-1,d=parseInt(p[2]);if(isNaN(m)||isNaN(d))return null;return[m,d];}

// ============================================================
// PERSISTENCE
// ============================================================
const TBL="schedule_data";const LK="ireland-schedule-2026";
async function load(){if(supabase){try{const{data,error}=await supabase.from(TBL).select("value").eq("key","schedule").single();if(!error&&data?.value)return data.value;}catch(e){}}try{const r=localStorage.getItem(LK);if(r)return JSON.parse(r);}catch(e){}return null;}
async function save(pl){try{localStorage.setItem(LK,JSON.stringify(pl));}catch(e){}if(supabase){try{await supabase.from(TBL).upsert({key:"schedule",value:pl},{onConflict:"key"});}catch(e){}}}

// ============================================================
// SHARED STYLES
// ============================================================
const fLabel={fontSize:11,fontWeight:600,color:C.s[500],display:"block",marginBottom:4,letterSpacing:"0.05em",textTransform:"uppercase"};
const fInput={width:"100%",padding:"8px 12px",fontSize:13,border:`1px solid ${C.s[200]}`,borderRadius:8,background:"#fff",color:C.s[900],outline:"none",boxSizing:"border-box"};
const btnS={padding:"8px 16px",fontSize:12,fontWeight:600,border:"none",borderRadius:8,cursor:"pointer"};

// ============================================================
// FORMS
// ============================================================
function AddTForm({onAdd,onClose}){
  const[n,sN]=useState("");const[sd,sSd]=useState("");const[ed,sEd]=useState("");const[pr,sPr]=useState("National");const[v,sV]=useState("");
  const go=()=>{const s=parseD(sd),e=parseD(ed||sd);if(!n.trim()||!s||!e)return;onAdd({id:"t_"+Date.now(),name:n.trim(),dates:fmtDate(s,e),start:s,end:e,province:pr,type:"tournament",hotel:"pending",flights:"pending",car:"pending",notes:"",venue:v,priority:false});onClose();};
  return(
    <div style={{background:"#fff",border:`1px solid ${C.s[200]}`,borderRadius:12,padding:20,marginBottom:16,boxShadow:"0 4px 16px rgba(0,0,0,0.06)"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
        <h3 style={{fontSize:15,fontWeight:600,color:C.s[900],margin:0}}>Add Tournament</h3>
        <button onClick={onClose} style={{background:"none",border:"none",cursor:"pointer",fontSize:16,color:C.s[400]}}>✕</button>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))",gap:12}}>
        <div style={{gridColumn:"1 / -1",maxWidth:400}}><label style={fLabel}>Name</label><input value={n} onChange={e=>sN(e.target.value)} placeholder="Tournament name" style={fInput}/></div>
        <div><label style={fLabel}>Venue / Location</label><input value={v} onChange={e=>sV(e.target.value)} placeholder="e.g. Royal Dublin GC" style={fInput}/></div>
        <div><label style={fLabel}>Start</label><input type="date" value={sd} onChange={e=>sSd(e.target.value)} style={fInput}/></div>
        <div><label style={fLabel}>End</label><input type="date" value={ed||sd} onChange={e=>sEd(e.target.value)} style={fInput}/></div>
        <div><label style={fLabel}>Province</label><select value={pr} onChange={e=>sPr(e.target.value)} style={fInput}>{Object.keys(provC).map(p=><option key={p}>{p}</option>)}</select></div>
      </div>
      <div style={{display:"flex",gap:8,marginTop:12,justifyContent:"flex-end"}}>
        <button onClick={onClose} style={{...btnS,background:C.s[100],color:C.s[600]}}>Cancel</button>
        <button onClick={go} style={{...btnS,background:C.i[500],color:"#fff"}}>Add</button>
      </div>
    </div>
  );
}
function AddBForm({onAdd,onClose}){
  const[pl,sPl]=useState("Airbnb");const[sd,sSd]=useState("");const[ed,sEd]=useState("");
  const go=()=>{const s=parseD(sd),e=parseD(ed);if(!s||!e)return;onAdd({id:"b_"+Date.now(),name:pl,dates:fmtDate(s,e),start:s,end:e,platform:pl,type:"booking"});onClose();};
  return(
    <div style={{background:"#fff",border:`1px solid ${C.s[200]}`,borderRadius:12,padding:20,marginBottom:16,boxShadow:"0 4px 16px rgba(0,0,0,0.06)"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
        <h3 style={{fontSize:15,fontWeight:600,color:C.s[900],margin:0}}>Add Booking</h3>
        <button onClick={onClose} style={{background:"none",border:"none",cursor:"pointer",fontSize:16,color:C.s[400]}}>✕</button>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))",gap:12}}>
        <div><label style={fLabel}>Platform</label><select value={pl} onChange={e=>sPl(e.target.value)} style={fInput}>{Object.keys(platC).map(p=><option key={p}>{p}</option>)}</select></div>
        <div><label style={fLabel}>Check-in</label><input type="date" value={sd} onChange={e=>sSd(e.target.value)} style={fInput}/></div>
        <div><label style={fLabel}>Check-out</label><input type="date" value={ed} onChange={e=>sEd(e.target.value)} style={fInput}/></div>
      </div>
      <div style={{display:"flex",gap:8,marginTop:12,justifyContent:"flex-end"}}>
        <button onClick={onClose} style={{...btnS,background:C.s[100],color:C.s[600]}}>Cancel</button>
        <button onClick={go} style={{...btnS,background:C.i[500],color:"#fff"}}>Add</button>
      </div>
    </div>
  );
}

// ============================================================
// MAIN
// ============================================================
const LW=280;const RH=48;const SH=36;const OH=24;

export default function Home(){
  const[ts,setTs]=useState(defaultTournaments);
  const[bs,setBs]=useState(defaultBookings);
  const[hov,setHov]=useState(null);
  const[view,setView]=useState("logistics");
  const[res,setRes]=useState("day");
  const[showAT,setShowAT]=useState(false);
  const[showAB,setShowAB]=useState(false);
  const[loaded,setLoaded]=useState(false);
  const[saving,setSaving]=useState(false);
  const[checkEmail,setCheckEmail]=useState(false);
  const[emailRes,setEmailRes]=useState(null);
  const[gmail,setGmail]=useState(false);
  const[tOpen,setTOpen]=useState(true);
  const[bOpen,setBOpen]=useState(true);
  const[filter,setFilter]=useState("all");
  const[dragId,setDragId]=useState(null);
  const[isMobile,setIsMobile]=useState(false);
  const[expandedId,setExpandedId]=useState(null);
  const[editItem,setEditItem]=useState(null); // {id, type} for edit popup
  const[barDrag,setBarDrag]=useState(null); // {id, type, mode:'move'|'resizeL'|'resizeR', origStart, origEnd, startX}

  const sRef=useRef(null);const isDrag=useRef(false);const dStartX=useRef(0);const dScrollL=useRef(0);
  const saveTO=useRef(null);const isRemote=useRef(false);const lastHash=useRef("");
  const barDragRef=useRef(null); // keep sync copy for mousemove
  const tI=todayIdx();

  // Detect mobile
  useEffect(()=>{const c=()=>setIsMobile(window.innerWidth<768);c();window.addEventListener("resize",c);return()=>window.removeEventListener("resize",c);},[]);

  // Drag scroll (disabled when bar-dragging)
  const mDown=(e)=>{if(!sRef.current||barDragRef.current)return;isDrag.current=true;dStartX.current=e.pageX-sRef.current.offsetLeft;dScrollL.current=sRef.current.scrollLeft;sRef.current.style.cursor="grabbing";};
  const mMove=(e)=>{if(!isDrag.current||!sRef.current||barDragRef.current)return;e.preventDefault();sRef.current.scrollLeft=dScrollL.current-(e.pageX-sRef.current.offsetLeft-dStartX.current)*1.5;};
  const mUp=()=>{isDrag.current=false;if(sRef.current&&!barDragRef.current)sRef.current.style.cursor="grab";};

  // Load
  useEffect(()=>{
    load().then(d=>{if(d){if(d.tournaments?.length)setTs(d.tournaments.map(t=>({...t,venue:t.venue||"",priority:t.priority||false})));if(d.bookings?.length)setBs(d.bookings);}setLoaded(true);});
    if(supabase)supabase.from("schedule_data").select("value").eq("key","gmail_tokens").single().then(({data})=>{if(data?.value)setGmail(true);});
    if(typeof window!=="undefined"){const p=new URLSearchParams(window.location.search);if(p.get("gmail")==="connected"){setGmail(true);window.history.replaceState({},"","/");}}
  },[]);

  // Save
  useEffect(()=>{
    if(!loaded)return;if(isRemote.current){isRemote.current=false;return;}
    const h=JSON.stringify({tournaments:ts,bookings:bs});if(h===lastHash.current)return;
    if(saveTO.current)clearTimeout(saveTO.current);
    saveTO.current=setTimeout(async()=>{setSaving(true);lastHash.current=h;await save({tournaments:ts,bookings:bs});setSaving(false);},500);
    return()=>{if(saveTO.current)clearTimeout(saveTO.current);};
  },[ts,bs,loaded]);

  // Realtime
  useEffect(()=>{
    if(!supabase)return;
    const ch=supabase.channel("sc").on("postgres_changes",{event:"*",schema:"public",table:TBL,filter:"key=eq.schedule"},(pl)=>{
      const v=pl.new?.value;if(!v)return;const h=JSON.stringify(v);if(h===lastHash.current)return;
      isRemote.current=true;lastHash.current=h;if(v.tournaments)setTs(v.tournaments);setTimeout(()=>{isRemote.current=true;},0);if(v.bookings)setBs(v.bookings);
    }).subscribe();
    return()=>{supabase.removeChannel(ch);};
  },[]);

  // Check emails
  const doCheckEmail=async()=>{
    setCheckEmail(true);setEmailRes(null);
    try{const r=await fetch("/api/check-emails",{method:"POST"});const d=await r.json();if(d.needsAuth){window.location.href="/api/auth/gmail";return;}setEmailRes(d);
    if(d.matched>0){const f=await load();if(f?.tournaments){isRemote.current=true;lastHash.current=JSON.stringify(f);setTs(f.tournaments);}}}catch(e){setEmailRes({error:e.message});}finally{setCheckEmail(false);}
  };

  // Timeline calcs
  const uW=res==="day"?14:res==="week"?28:80;
  const mSpans=monthSpans();const wks=buildWeeks();
  function d2px(di){if(res==="day")return di*uW;if(res==="week"){for(const w of wks){if(di>=w.s&&di<=w.e)return(wks.indexOf(w)+(di-w.s)/(w.e-w.s+1))*uW;}return 0;}for(const m of mSpans){if(di>=m.s&&di<=m.e)return(mSpans.indexOf(m)+(di-m.s)/(m.e-m.s+1))*uW;}return 0;}
  function dur2px(s,e){return d2px(e+1)-d2px(s);}
  const cW=res==="day"?totalDays*uW:res==="week"?wks.length*uW:mSpans.length*uW;
  useEffect(()=>{if(sRef.current&&tI>=0)sRef.current.scrollLeft=Math.max(0,d2px(tI)-300);},[view,res]);

  // Pixel to day index (inverse of d2px)
  function px2dIdx(px){
    if(res==="day")return Math.round(px/uW);
    if(res==="week"){const wi=px/uW;const wIdx=Math.floor(wi);if(wIdx<0||wIdx>=wks.length)return 0;const w=wks[wIdx];const frac=wi-wIdx;return w.s+Math.round(frac*(w.e-w.s+1));}
    const mi=px/uW;const mIdx=Math.floor(mi);if(mIdx<0||mIdx>=mSpans.length)return 0;const m=mSpans[mIdx];const frac=mi-mIdx;return m.s+Math.round(frac*(m.e-m.s+1));
  }
  function dIdxToDate(di){const d=allDays[Math.max(0,Math.min(di,allDays.length-1))];return d?[d.month,d.day]:null;}

  // Bar drag/resize handlers
  const barHandleDown=(e,id,type,mode)=>{
    e.stopPropagation();e.preventDefault();
    const item=type==="tournament"?ts.find(t=>t.id===id):bs.find(b=>b.id===id);if(!item)return;
    const chartEl=sRef.current;if(!chartEl)return;
    const rect=chartEl.getBoundingClientRect();
    const scrollX=chartEl.scrollLeft;
    const startPx=e.clientX-rect.left+scrollX;
    const bd={id,type,mode,origStart:[...item.start],origEnd:[...item.end],startPx,
      origSi:dIdx(item.start[0],item.start[1]),origEi:dIdx(item.end[0],item.end[1])};
    setBarDrag(bd);barDragRef.current=bd;
    setEditItem(null);
  };

  useEffect(()=>{
    if(!barDrag)return;
    const chartEl=sRef.current;if(!chartEl)return;
    const rect=chartEl.getBoundingClientRect();

    const onMove=(e)=>{
      const bd=barDragRef.current;if(!bd)return;
      const scrollX=chartEl.scrollLeft;
      const curPx=e.clientX-rect.left+scrollX;
      const deltaDays=px2dIdx(curPx)-px2dIdx(bd.startPx);
      if(deltaDays===0)return;

      const update=(item)=>{
        let newSi=bd.origSi,newEi=bd.origEi;
        if(bd.mode==="move"){newSi+=deltaDays;newEi+=deltaDays;}
        else if(bd.mode==="resizeL"){newSi+=deltaDays;if(newSi>newEi)newSi=newEi;}
        else if(bd.mode==="resizeR"){newEi+=deltaDays;if(newEi<newSi)newEi=newSi;}
        newSi=Math.max(0,Math.min(newSi,allDays.length-1));
        newEi=Math.max(0,Math.min(newEi,allDays.length-1));
        const ns=dIdxToDate(newSi);const ne=dIdxToDate(newEi);
        if(!ns||!ne)return item;
        return{...item,start:ns,end:ne,dates:fmtDate(ns,ne)};
      };

      if(bd.type==="tournament")setTs(p=>p.map(t=>t.id===bd.id?update(t):t));
      else setBs(p=>p.map(b=>b.id===bd.id?update(b):b));
    };

    const onUp=()=>{setBarDrag(null);barDragRef.current=null;};
    window.addEventListener("mousemove",onMove);
    window.addEventListener("mouseup",onUp);
    return()=>{window.removeEventListener("mousemove",onMove);window.removeEventListener("mouseup",onUp);};
  },[barDrag]);

  // Bar cursor helper — detect edge vs middle
  const barCursor=(e,barLeft,barWidth)=>{
    const rect=e.currentTarget.getBoundingClientRect();
    const x=e.clientX-rect.left;
    if(x<8)return"resizeL";if(x>rect.width-8)return"resizeR";return"move";
  };
  const cursorStyle=(mode)=>mode==="resizeL"||mode==="resizeR"?"ew-resize":"grab";

  // Edit popup for click on bar
  const handleBarClick=(e,id,type)=>{
    if(barDragRef.current)return; // was dragging
    e.stopPropagation();
    setEditItem(editItem?.id===id?null:{id,type});
  };
  const deleteItem=(id,type)=>{
    if(type==="tournament")setTs(p=>p.filter(t=>t.id!==id));
    else setBs(p=>p.filter(b=>b.id!==id));
    setEditItem(null);
  };

  const occ=buildOcc(bs);const occSp=buildOccSpans(occ);
  const bDays=occ.filter(Boolean).length;const oRate=Math.round((bDays/totalDays)*100);
  const sortT=[...ts].sort((a,b)=>{if(a.priority!==b.priority)return a.priority?-1:1;return a.start[0]!==b.start[0]?a.start[0]-b.start[0]:a.start[1]-b.start[1];});
  const sortB=[...bs].sort((a,b)=>a.start[0]!==b.start[0]?a.start[0]-b.start[0]:a.start[1]-b.start[1]);

  const toggleSt=(id,f)=>setTs(p=>p.map(t=>t.id!==id?t:{...t,[f]:statusCycle[(statusCycle.indexOf(t[f])+1)%3]}));
  const updNote=(id,v)=>setTs(p=>p.map(t=>t.id===id?{...t,notes:v}:t));
  const updVenue=(id,v)=>setTs(p=>p.map(t=>t.id===id?{...t,venue:v}:t));
  const togglePri=(id)=>setTs(p=>p.map(t=>t.id===id?{...t,priority:!t.priority}:t));

  const pendC=ts.reduce((s,t)=>s+(t.hotel==="pending"?1:0)+(t.flights==="pending"?1:0)+(t.car==="pending"?1:0),0);
  const bookC=ts.reduce((s,t)=>s+(t.hotel==="booked"?1:0)+(t.flights==="booked"?1:0)+(t.car==="booked"?1:0),0);
  const filtT=filter==="all"?sortT:filter==="pending"?sortT.filter(t=>t.hotel==="pending"||t.flights==="pending"||t.car==="pending"):filter==="priority"?sortT.filter(t=>t.priority):sortT.filter(t=>t.hotel==="booked"||t.flights==="booked"||t.car==="booked");

  // Drag reorder
  const handleDragStart=(e,id)=>{setDragId(id);e.dataTransfer.effectAllowed="move";};
  const handleDragOver=(e)=>{e.preventDefault();e.dataTransfer.dropEffect="move";};
  const handleDrop=(e,targetId)=>{
    e.preventDefault();if(!dragId||dragId===targetId)return;
    setTs(prev=>{const items=[...prev];const fromIdx=items.findIndex(t=>t.id===dragId);const toIdx=items.findIndex(t=>t.id===targetId);if(fromIdx<0||toIdx<0)return prev;const[item]=items.splice(fromIdx,1);items.splice(toIdx,0,item);return items;});
    setDragId(null);
  };

  const StPill=({status,onClick,small})=>{const c=stCfg[status];return(
    <button onClick={onClick} style={{display:"inline-flex",alignItems:"center",gap:small?3:5,padding:small?"4px 8px":"5px 12px",borderRadius:16,background:c.bg,border:`1px solid ${c.border}`,cursor:"pointer",fontSize:small?10:12,fontWeight:600,color:c.color,lineHeight:1}}>
      <span style={{fontSize:small?10:12}}>{c.icon}</span>{!small&&c.label}
    </button>
  );};

  // ============================================================
  // RENDER
  // ============================================================
  return(
    <div style={{fontFamily:"'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif",background:C.s[50],color:C.s[900],minHeight:"100vh",padding:isMobile?"16px 12px":"32px 24px"}}>
      <div style={{maxWidth:1600,margin:"0 auto"}}>

        {/* HEADER */}
        <div style={{marginBottom:isMobile?16:28}}>
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6,flexWrap:"wrap"}}>
            <span style={{fontSize:10,fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase",color:C.i[500],background:C.i[50],padding:"3px 10px",borderRadius:16,border:`1px solid ${C.i[100]}`}}>2026 Season</span>
            {saving&&<span style={{fontSize:10,color:C.a[600],background:C.a[50],padding:"3px 8px",borderRadius:16,border:`1px solid ${C.a[100]}`}}>Saving...</span>}
            {!saving&&loaded&&supabase&&<span style={{fontSize:10,color:C.e[600],background:C.e[50],padding:"3px 8px",borderRadius:16,border:`1px solid ${C.e[100]}`}}>● Synced</span>}
          </div>
          <h1 style={{fontSize:isMobile?24:32,fontWeight:700,margin:"0 0 6px",color:C.s[900],letterSpacing:"-0.02em"}}>Tournaments & Bookings</h1>
          <div style={{display:"flex",gap:isMobile?12:20,fontSize:isMobile?12:13,color:C.s[500],flexWrap:"wrap"}}>
            <span><strong style={{color:C.s[700],fontSize:isMobile?16:18}}>{sortT.length}</strong> tournaments</span>
            <span><strong style={{color:C.s[700],fontSize:isMobile?16:18}}>{sortB.length}</strong> bookings</span>
            <span><strong style={{color:C.s[700],fontSize:isMobile?16:18}}>{bDays}</strong> nights ({oRate}%)</span>
          </div>
        </div>

        {/* NAV */}
        <div style={{background:"#fff",borderRadius:12,boxShadow:"0 2px 12px rgba(148,163,184,0.1)",padding:isMobile?"10px 12px":"12px 20px",marginBottom:16,display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
          {[{k:"gantt",l:"📊 Timeline"},{k:"logistics",l:"📋 Logistics"}].map(v=>(
            <button key={v.k} onClick={()=>setView(v.k)} style={{background:view===v.k?C.i[500]:"transparent",color:view===v.k?"#fff":C.s[600],border:"none",padding:isMobile?"8px 14px":"8px 18px",borderRadius:8,cursor:"pointer",fontSize:13,fontWeight:600,boxShadow:view===v.k?"0 2px 8px rgba(99,102,241,0.3)":"none"}}>
              {v.l}{v.k==="logistics"&&pendC>0&&<span style={{marginLeft:4,background:view===v.k?"rgba(255,255,255,0.25)":C.a[50],color:view===v.k?"#fff":C.a[600],padding:"1px 6px",borderRadius:8,fontSize:10,fontWeight:700}}>{pendC}</span>}
            </button>
          ))}
          {view==="gantt"&&!isMobile&&(
            <div style={{display:"flex",gap:2,marginLeft:6,background:C.s[100],borderRadius:6,padding:2}}>
              {["day","week","month"].map(r=>(<button key={r} onClick={()=>setRes(r)} style={{background:res===r?"#fff":"transparent",color:res===r?C.s[900]:C.s[500],border:"none",padding:"5px 12px",borderRadius:5,cursor:"pointer",fontSize:12,fontWeight:600,boxShadow:res===r?"0 1px 3px rgba(0,0,0,0.08)":"none"}}>{r.charAt(0).toUpperCase()+r.slice(1)}</button>))}
            </div>
          )}
          <div style={{flex:1}}/>
          {view==="logistics"&&(
            <button onClick={gmail?doCheckEmail:()=>{window.location.href="/api/auth/gmail";}} disabled={checkEmail} style={{...btnS,background:checkEmail?C.s[100]:"#fff",color:checkEmail?C.s[400]:C.a[600],border:`1px solid ${C.a[100]}`,cursor:checkEmail?"wait":"pointer",fontSize:11}}>
              {checkEmail?"⏳ Checking...":gmail?"📧 Check Emails":"📧 Connect Gmail"}
            </button>
          )}
          {!isMobile&&<>
            <button onClick={()=>{setShowAT(true);setShowAB(false);}} style={{...btnS,background:"#fff",color:C.i[500],border:`1px solid ${C.i[100]}`,fontSize:11}}>+ Tournament</button>
            <button onClick={()=>{setShowAB(true);setShowAT(false);}} style={{...btnS,background:"#fff",color:C.b[500],border:`1px solid ${C.b[100]}`,fontSize:11}}>+ Booking</button>
          </>}
        </div>

        {showAT&&<AddTForm onAdd={t=>setTs(p=>[...p,t])} onClose={()=>setShowAT(false)}/>}
        {showAB&&<AddBForm onAdd={b=>setBs(p=>[...p,b])} onClose={()=>setShowAB(false)}/>}

        {/* Email result */}
        {emailRes&&(
          <div style={{background:emailRes.error?C.r[50]:C.e[50],border:`1px solid ${emailRes.error?C.r[100]:C.e[100]}`,borderRadius:10,padding:"10px 16px",marginBottom:16,display:"flex",alignItems:"center",gap:10,fontSize:12}}>
            <span>{emailRes.error?"❌":"📧"}</span>
            <span style={{flex:1,color:emailRes.error?C.r[600]:C.e[600]}}>{emailRes.error?`Error: ${emailRes.error}`:`Found ${emailRes.found} booking${emailRes.found!==1?"s":""}, matched ${emailRes.matched}`}</span>
            <button onClick={()=>setEmailRes(null)} style={{background:"none",border:"none",cursor:"pointer",color:C.s[400]}}>✕</button>
          </div>
        )}

        {/* ===== LOGISTICS ===== */}
        {view==="logistics"&&(
          <div style={{background:"#fff",borderRadius:12,boxShadow:"0 2px 12px rgba(148,163,184,0.1)",overflow:"hidden"}}>
            {/* Filter + stats */}
            <div style={{display:"flex",alignItems:"center",gap:12,padding:isMobile?"10px 12px":"12px 20px",borderBottom:`1px solid ${C.s[100]}`,flexWrap:"wrap"}}>
              <div style={{display:"flex",gap:4}}>
                {[{k:"all",l:"All"},{k:"priority",l:"🔥 Priority"},{k:"pending",l:"Pending"},{k:"booked",l:"Booked"}].map(f=>(
                  <button key={f.k} onClick={()=>setFilter(f.k)} style={{padding:"5px 12px",borderRadius:6,fontSize:11,fontWeight:600,cursor:"pointer",border:`1px solid ${filter===f.k?C.i[100]:C.s[200]}`,background:filter===f.k?C.i[50]:"#fff",color:filter===f.k?C.i[500]:C.s[500]}}>{f.l}</button>
                ))}
              </div>
              {!isMobile&&<>
                <div style={{flex:1}}/>
                <div style={{display:"flex",gap:16,alignItems:"center"}}>
                  <div style={{textAlign:"center"}}><div style={{fontSize:20,fontWeight:700,color:C.e[500]}}>{bookC}</div><div style={{fontSize:10,color:C.s[500],fontWeight:600,textTransform:"uppercase",letterSpacing:"0.05em"}}>Booked</div></div>
                  <div style={{width:1,height:32,background:C.s[200]}}/>
                  <div style={{textAlign:"center"}}><div style={{fontSize:20,fontWeight:700,color:C.a[500]}}>{pendC}</div><div style={{fontSize:10,color:C.s[500],fontWeight:600,textTransform:"uppercase",letterSpacing:"0.05em"}}>Pending</div></div>
                </div>
              </>}
            </div>

            {/* Table — desktop */}
            {!isMobile&&<>
              <div style={{display:"grid",gridTemplateColumns:"28px 1fr 100px 100px 100px 80px 160px",padding:"10px 20px",background:C.s[50],borderBottom:`1px solid ${C.s[200]}`,fontSize:10,fontWeight:700,color:C.s[500],letterSpacing:"0.08em",textTransform:"uppercase"}}>
                <span></span><span>Tournament</span><span>Dates</span><span style={{textAlign:"center"}}>🏨 Hotel</span><span style={{textAlign:"center"}}>✈️ Flights</span><span style={{textAlign:"center"}}>🚗 Car</span><span>Venue / Notes</span>
              </div>
              {filtT.map(t=>{
                const pc=provC[t.province];const h=hov===t.id;const det=t.hotelDetails||t.flightDetails;
                return(
                  <div key={t.id} draggable onDragStart={e=>handleDragStart(e,t.id)} onDragOver={handleDragOver} onDrop={e=>handleDrop(e,t.id)}
                    style={{borderBottom:`1px solid ${det?"transparent":C.s[100]}`,background:dragId===t.id?C.i[50]:h?`${C.s[50]}80`:t.priority?`${C.a[50]}60`:"transparent",transition:"background 0.15s"}}>
                    <div onMouseEnter={()=>setHov(t.id)} onMouseLeave={()=>setHov(null)}
                      style={{display:"grid",gridTemplateColumns:"28px 1fr 100px 100px 100px 80px 160px",padding:"8px 20px",alignItems:"center",cursor:"grab"}}>
                      {/* Priority flag */}
                      <button onClick={()=>togglePri(t.id)} title={t.priority?"Remove priority":"Mark as book next"} style={{background:"none",border:"none",cursor:"pointer",fontSize:14,padding:0,lineHeight:1,opacity:t.priority?1:0.25,transition:"opacity 0.15s",filter:t.priority?"none":"grayscale(1)"}}>🔥</button>
                      {/* Name + venue */}
                      <div style={{display:"flex",alignItems:"center",gap:10,minWidth:0}}>
                        <div style={{width:4,height:28,borderRadius:4,background:pc.bar,flexShrink:0}}/>
                        <div style={{minWidth:0}}>
                          <div style={{fontSize:13,fontWeight:600,color:C.s[900],whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{t.name}</div>
                          <div style={{display:"flex",gap:6,alignItems:"center",marginTop:2}}>
                            <span style={{fontSize:9,fontWeight:700,letterSpacing:"0.06em",textTransform:"uppercase",color:pc.text,background:pc.bg,padding:"1px 6px",borderRadius:4,border:`1px solid ${pc.border}`}}>{t.province}</span>
                            {t.venue&&<span style={{fontSize:11,color:C.s[400],whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>📍 {t.venue}</span>}
                          </div>
                        </div>
                      </div>
                      <div><div style={{fontSize:13,fontWeight:500,color:C.s[700]}}>{t.dates}</div><div style={{fontSize:11,color:C.s[400]}}>2026</div></div>
                      <div style={{display:"flex",justifyContent:"center"}}><StPill status={t.hotel} onClick={()=>toggleSt(t.id,"hotel")}/></div>
                      <div style={{display:"flex",justifyContent:"center"}}><StPill status={t.flights} onClick={()=>toggleSt(t.id,"flights")}/></div>
                      <div style={{display:"flex",justifyContent:"center"}}><StPill status={t.car} onClick={()=>toggleSt(t.id,"car")}/></div>
                      <div style={{display:"flex",gap:4}}>
                        <input type="text" value={t.venue} onChange={e=>updVenue(t.id,e.target.value)} placeholder="Venue..." style={{fontSize:11,color:C.s[600],border:`1px solid ${C.s[200]}`,borderRadius:6,padding:"5px 8px",background:C.s[50],outline:"none",width:"50%"}} onFocus={e=>e.target.style.borderColor=C.i[500]} onBlur={e=>e.target.style.borderColor=C.s[200]}/>
                        <input type="text" value={t.notes} onChange={e=>updNote(t.id,e.target.value)} placeholder="Notes..." style={{fontSize:11,color:C.s[600],border:`1px solid ${C.s[200]}`,borderRadius:6,padding:"5px 8px",background:C.s[50],outline:"none",width:"50%"}} onFocus={e=>e.target.style.borderColor=C.i[500]} onBlur={e=>e.target.style.borderColor=C.s[200]}/>
                      </div>
                    </div>
                    {det&&(
                      <div style={{padding:"2px 20px 8px 48px",borderBottom:`1px solid ${C.s[100]}`,display:"flex",gap:8,flexWrap:"wrap"}}>
                        {t.flightDetails&&<div style={{fontSize:11,background:C.b[50],border:`1px solid ${C.b[100]}`,borderRadius:6,padding:"4px 10px",color:C.b[600],display:"flex",gap:6,alignItems:"center"}}><span>✈️</span><span style={{fontWeight:600}}>{t.flightDetails.provider}</span>{t.flightDetails.confirmation&&<span style={{fontFamily:"monospace",fontSize:10,background:C.b[100],padding:"1px 4px",borderRadius:3}}>{t.flightDetails.confirmation}</span>}<span>{t.flightDetails.summary||""}</span></div>}
                        {t.hotelDetails&&<div style={{fontSize:11,background:C.p[50],border:`1px solid ${C.p[100]}`,borderRadius:6,padding:"4px 10px",color:C.p[600],display:"flex",gap:6,alignItems:"center"}}><span>🏨</span><span style={{fontWeight:600}}>{t.hotelDetails.name}</span>{t.hotelDetails.confirmation&&<span style={{fontFamily:"monospace",fontSize:10,background:C.p[100],padding:"1px 4px",borderRadius:3}}>{t.hotelDetails.confirmation}</span>}</div>}
                      </div>
                    )}
                  </div>
                );
              })}
            </>}

            {/* Mobile logistics — card layout */}
            {isMobile&&filtT.map(t=>{
              const pc=provC[t.province];const exp=expandedId===t.id;
              return(
                <div key={t.id} style={{borderBottom:`1px solid ${C.s[100]}`,background:t.priority?`${C.a[50]}60`:"transparent"}}>
                  <div onClick={()=>setExpandedId(exp?null:t.id)} style={{padding:"12px 16px",display:"flex",alignItems:"center",gap:10,cursor:"pointer"}}>
                    <button onClick={e=>{e.stopPropagation();togglePri(t.id);}} style={{background:"none",border:"none",cursor:"pointer",fontSize:14,padding:0,opacity:t.priority?1:0.2}}>🔥</button>
                    <div style={{width:4,height:32,borderRadius:4,background:pc.bar,flexShrink:0}}/>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontSize:14,fontWeight:600,color:C.s[900],marginBottom:3}}>{t.name}</div>
                      <div style={{display:"flex",gap:6,alignItems:"center",flexWrap:"wrap"}}>
                        <span style={{fontSize:9,fontWeight:700,textTransform:"uppercase",color:pc.text,background:pc.bg,padding:"1px 6px",borderRadius:4}}>{t.province}</span>
                        <span style={{fontSize:12,color:C.s[500]}}>{t.dates} 2026</span>
                        {t.venue&&<span style={{fontSize:11,color:C.s[400]}}>📍 {t.venue}</span>}
                      </div>
                    </div>
                    <div style={{display:"flex",gap:3}}>
                      {["hotel","flights","car"].map(f=><StPill key={f} status={t[f]} onClick={e=>{e.stopPropagation();toggleSt(t.id,f);}} small/>)}
                    </div>
                  </div>
                  {exp&&(
                    <div style={{padding:"0 16px 12px 44px",display:"flex",flexDirection:"column",gap:8}}>
                      <div style={{display:"flex",gap:6}}>
                        <input type="text" value={t.venue} onChange={e=>updVenue(t.id,e.target.value)} placeholder="Venue..." style={{...fInput,fontSize:12,padding:"6px 10px",flex:1}}/>
                        <input type="text" value={t.notes} onChange={e=>updNote(t.id,e.target.value)} placeholder="Notes..." style={{...fInput,fontSize:12,padding:"6px 10px",flex:1}}/>
                      </div>
                      <div style={{display:"flex",gap:4,flexWrap:"wrap"}}>
                        {["hotel","flights","car"].map(f=>(
                          <button key={f} onClick={()=>toggleSt(t.id,f)} style={{...btnS,fontSize:11,padding:"6px 12px",background:stCfg[t[f]].bg,color:stCfg[t[f]].color,border:`1px solid ${stCfg[t[f]].border}`}}>
                            {f==="hotel"?"🏨":f==="flights"?"✈️":"🚗"} {stCfg[t[f]].label}
                          </button>
                        ))}
                      </div>
                      {t.venue&&<a href={`https://maps.google.com/?q=${encodeURIComponent(t.venue+", Ireland")}`} target="_blank" rel="noopener" style={{fontSize:12,color:C.i[500],fontWeight:600}}>📍 Open in Maps</a>}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* ===== GANTT ===== */}
        {view==="gantt"&&(
          <div style={{background:"#fff",borderRadius:12,boxShadow:"0 2px 12px rgba(148,163,184,0.1)",overflow:"hidden"}}>
            {isMobile?(
              /* Mobile: simple list with mini bars */
              <div>
                <div onClick={()=>setTOpen(!tOpen)} style={{padding:"10px 16px",fontSize:13,fontWeight:700,color:C.s[700],background:C.s[50],borderBottom:`1px solid ${C.s[200]}`,display:"flex",gap:8,alignItems:"center",cursor:"pointer"}}>
                  <span style={{fontSize:10,transform:tOpen?"rotate(90deg)":"rotate(0deg)",transition:"transform 0.2s"}}>▶</span>🏆 Tournaments <span style={{fontSize:11,color:C.s[400],background:C.s[100],padding:"1px 6px",borderRadius:8}}>{sortT.length}</span>
                </div>
                {tOpen&&sortT.map(t=>{const pc=provC[t.province];const si=dIdx(t.start[0],t.start[1]);const ei=dIdx(t.end[0],t.end[1]);const pct=si>=0?`${(si/totalDays*100).toFixed(1)}%`:"0%";const wPct=si>=0&&ei>=0?`${Math.max(((ei-si+1)/totalDays*100),1).toFixed(1)}%`:"1%";
                  return(<div key={t.id} style={{padding:"8px 16px",borderBottom:`1px solid ${C.s[100]}`,display:"flex",alignItems:"center",gap:10}}>
                    <div style={{width:4,height:24,borderRadius:4,background:pc.bar,flexShrink:0}}/>
                    <div style={{flex:1,minWidth:0}}><div style={{fontSize:12,fontWeight:600,color:C.s[800],whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{t.name}</div><div style={{fontSize:10,color:C.s[400]}}>{t.dates}</div></div>
                    <div style={{width:100,height:8,background:C.s[100],borderRadius:4,position:"relative",flexShrink:0}}><div style={{position:"absolute",left:pct,width:wPct,height:"100%",background:pc.bar,borderRadius:4}}/></div>
                  </div>);
                })}
                <div onClick={()=>setBOpen(!bOpen)} style={{padding:"10px 16px",fontSize:13,fontWeight:700,color:C.s[700],background:C.s[50],borderBottom:`1px solid ${C.s[200]}`,borderTop:`1px solid ${C.s[200]}`,display:"flex",gap:8,alignItems:"center",cursor:"pointer"}}>
                  <span style={{fontSize:10,transform:bOpen?"rotate(90deg)":"rotate(0deg)",transition:"transform 0.2s"}}>▶</span>🏠 Bookings <span style={{fontSize:11,color:C.s[400],background:C.s[100],padding:"1px 6px",borderRadius:8}}>{sortB.length}</span>
                </div>
                {bOpen&&sortB.map(b=>{const pc2=platC[b.platform];const si=dIdx(b.start[0],b.start[1]);const ei=dIdx(b.end[0],b.end[1]);const pct=si>=0?`${(si/totalDays*100).toFixed(1)}%`:"0%";const wPct=si>=0&&ei>=0?`${Math.max(((ei-si+1)/totalDays*100),1).toFixed(1)}%`:"1%";
                  return(<div key={b.id} style={{padding:"8px 16px",borderBottom:`1px solid ${C.s[100]}`,display:"flex",alignItems:"center",gap:10}}>
                    <div style={{width:4,height:24,borderRadius:4,background:pc2.bar,flexShrink:0}}/>
                    <div style={{flex:1,minWidth:0}}><div style={{fontSize:12,fontWeight:600,color:C.s[800]}}>{b.platform}</div><div style={{fontSize:10,color:C.s[400]}}>{b.dates}</div></div>
                    <div style={{width:100,height:8,background:C.s[100],borderRadius:4,position:"relative",flexShrink:0}}><div style={{position:"absolute",left:pct,width:wPct,height:"100%",background:pc2.bar,borderRadius:4}}/></div>
                  </div>);
                })}
              </div>
            ):(
              /* Desktop: full Gantt */
              <div style={{display:"flex"}}>
                <div style={{width:LW,flexShrink:0,borderRight:`1px solid ${C.s[200]}`,zIndex:10,background:"#fff"}}>
                  <div style={{height:28,borderBottom:`1px solid ${C.s[200]}`}}/>
                  <div style={{height:22,borderBottom:`1px solid ${C.s[200]}`}}/>
                  <div onClick={()=>setTOpen(!tOpen)} style={{height:SH,display:"flex",alignItems:"center",paddingLeft:16,gap:8,fontSize:12,fontWeight:700,color:C.s[700],background:C.s[50],borderBottom:`1px solid ${C.s[200]}`,cursor:"pointer"}}>
                    <span style={{fontSize:9,transform:tOpen?"rotate(90deg)":"rotate(0deg)",transition:"transform 0.2s"}}>▶</span>🏆 Tournaments <span style={{fontSize:10,color:C.s[400],background:C.s[100],padding:"1px 6px",borderRadius:8}}>{sortT.length}</span>
                  </div>
                  {tOpen&&sortT.map(r=>{const h2=hov===r.id;const pc=provC[r.province];return(
                    <div key={r.id} onMouseEnter={()=>setHov(r.id)} onMouseLeave={()=>setHov(null)} style={{height:RH,display:"flex",alignItems:"center",paddingLeft:12,paddingRight:8,gap:10,borderBottom:`1px solid ${C.s[100]}`,background:h2?`${C.s[50]}80`:r.priority?`${C.a[50]}40`:"transparent",cursor:"pointer",transition:"background 0.15s"}}>
                      {r.priority&&<span style={{fontSize:10}}>🔥</span>}
                      <div style={{width:4,height:24,borderRadius:4,background:pc.bar,flexShrink:0}}/>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{fontSize:12,fontWeight:h2?700:600,color:h2?C.s[900]:C.s[700],whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",marginBottom:2}}>{r.name}</div>
                        <span style={{fontSize:8,fontWeight:700,letterSpacing:"0.06em",textTransform:"uppercase",color:pc.text,background:pc.bg,padding:"1px 6px",borderRadius:3,border:`1px solid ${pc.border}`}}>{r.province}</span>
                      </div>
                    </div>
                  );})}
                  <div onClick={()=>setBOpen(!bOpen)} style={{height:SH,display:"flex",alignItems:"center",paddingLeft:16,gap:8,fontSize:12,fontWeight:700,color:C.s[700],background:C.s[50],borderBottom:`1px solid ${C.s[200]}`,borderTop:`1px solid ${C.s[200]}`,cursor:"pointer"}}>
                    <span style={{fontSize:9,transform:bOpen?"rotate(90deg)":"rotate(0deg)",transition:"transform 0.2s"}}>▶</span>🏠 Bookings <span style={{fontSize:10,color:C.s[400],background:C.s[100],padding:"1px 6px",borderRadius:8}}>{sortB.length}</span>
                  </div>
                  {bOpen&&<>
                    <div style={{height:OH,display:"flex",alignItems:"center",paddingLeft:24,fontSize:10,fontWeight:600,color:C.s[400],borderBottom:`1px solid ${C.s[100]}`,background:C.s[50]}}>Availability</div>
                    {sortB.map(r=>{const h2=hov===r.id;const pc2=platC[r.platform];return(
                      <div key={r.id} onMouseEnter={()=>setHov(r.id)} onMouseLeave={()=>setHov(null)} style={{height:RH,display:"flex",alignItems:"center",paddingLeft:12,paddingRight:8,gap:10,borderBottom:`1px solid ${C.s[100]}`,background:h2?`${C.s[50]}80`:"transparent",cursor:"pointer",transition:"background 0.15s"}}>
                        <div style={{width:4,height:24,borderRadius:4,background:pc2.bar,flexShrink:0}}/>
                        <div style={{flex:1,minWidth:0}}><div style={{fontSize:12,fontWeight:h2?700:600,color:h2?C.s[900]:C.s[700],marginBottom:2}}>{r.platform}</div><span style={{fontSize:10,color:C.s[400],fontFamily:"monospace"}}>{r.dates}</span></div>
                      </div>
                    );})}
                  </>}
                </div>

                {/* Chart */}
                <div ref={sRef} style={{flex:1,overflowX:"auto",overflowY:"hidden",cursor:"grab"}} onMouseDown={mDown} onMouseMove={mMove} onMouseUp={mUp} onMouseLeave={mUp} onClick={()=>setEditItem(null)}>
                  <div style={{width:cW,position:"relative"}}>
                    {/* Headers */}
                    {res==="day"?(<>
                      <div style={{height:28,position:"relative",borderBottom:`1px solid ${C.s[200]}`}}>{mSpans.map((m,i)=>(<div key={m.mn} style={{position:"absolute",left:m.s*uW,width:(m.e-m.s+1)*uW,height:"100%",display:"flex",alignItems:"center",paddingLeft:6,fontSize:11,fontWeight:700,color:C.s[700],letterSpacing:"0.05em",textTransform:"uppercase",borderLeft:i>0?`1px solid ${C.s[200]}`:"none"}}>{m.mn}</div>))}</div>
                      <div style={{height:22,position:"relative",borderBottom:`1px solid ${C.s[200]}`}}>{allDays.filter(d=>d.isMonday).map(d=>(<div key={d.index} style={{position:"absolute",left:d.index*uW,width:uW*2,height:"100%",display:"flex",alignItems:"center",paddingLeft:2,fontSize:8,color:C.s[400],fontWeight:500}}>{d.day}</div>))}</div>
                    </>):res==="week"?(<>
                      <div style={{height:28,position:"relative",borderBottom:`1px solid ${C.s[200]}`}}>{mSpans.map((m,i)=>{const sw=wks.findIndex(w=>w.s<=m.s&&w.e>=m.s);const ew=wks.findIndex(w=>w.s<=m.e&&w.e>=m.e);return(<div key={m.mn} style={{position:"absolute",left:sw*uW,width:(ew-sw+1)*uW,height:"100%",display:"flex",alignItems:"center",paddingLeft:6,fontSize:11,fontWeight:700,color:C.s[700],letterSpacing:"0.05em",textTransform:"uppercase",borderLeft:i>0?`1px solid ${C.s[200]}`:"none",overflow:"hidden"}}>{m.mn}</div>);})}</div>
                      <div style={{height:22,position:"relative",borderBottom:`1px solid ${C.s[200]}`}}>{wks.map((w,i)=>(<div key={i} style={{position:"absolute",left:i*uW,width:uW,height:"100%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:8,color:C.s[400],fontWeight:500,borderLeft:`1px solid ${C.s[100]}`}}>{w.l}</div>))}</div>
                    </>):(<>
                      <div style={{height:28,position:"relative",borderBottom:`1px solid ${C.s[200]}`}}>{mSpans.map((m,i)=>(<div key={m.mn} style={{position:"absolute",left:i*uW,width:uW,height:"100%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:700,color:C.s[700],textTransform:"uppercase",borderLeft:i>0?`1px solid ${C.s[200]}`:"none"}}>{m.mn}</div>))}</div>
                      <div style={{height:22,borderBottom:`1px solid ${C.s[200]}`}}/>
                    </>)}

                    {/* Tournament section row */}
                    <div style={{height:SH,background:C.s[50],borderBottom:`1px solid ${C.s[200]}`}}/>
                    {tOpen&&sortT.map(r=>{const si=dIdx(r.start[0],r.start[1]);const ei=dIdx(r.end[0],r.end[1]);if(si<0||ei<0)return null;const h2=hov===r.id;const pc=provC[r.province];const l=d2px(si);const w=Math.max(dur2px(si,ei),res==="month"?8:uW-2);const isDragging=barDrag?.id===r.id;
                      return(<div key={r.id} onMouseEnter={()=>!barDrag&&setHov(r.id)} onMouseLeave={()=>!barDrag&&setHov(null)} style={{height:RH,position:"relative",borderBottom:`1px solid ${C.s[100]}`,background:h2?`${C.s[50]}80`:r.priority?`${C.a[50]}40`:"transparent",transition:isDragging?"none":"background 0.15s"}}>
                        {res==="day"&&allDays.filter(d=>d.isWeekend).map(d=>(<div key={`w${d.index}`} style={{position:"absolute",left:d.index*uW,top:0,width:uW,height:RH,background:"rgba(0,0,0,0.015)"}}/>))}
                        {tI>=0&&<div style={{position:"absolute",left:d2px(tI)+(res==="day"?uW/2:0),top:0,width:2,height:RH,background:C.r[500],opacity:0.2,zIndex:5}}/>}
                        {/* Draggable bar */}
                        <div
                          onMouseDown={e=>{const mode=barCursor(e,l,w);barHandleDown(e,r.id,"tournament",mode);}}
                          onMouseMove={e=>{if(!barDrag){const mode=barCursor(e,l,w);e.currentTarget.style.cursor=cursorStyle(mode);}}}
                          onClick={e=>handleBarClick(e,r.id,"tournament")}
                          style={{position:"absolute",left:l,width:w,top:8,height:32,background:pc.bar,borderRadius:6,zIndex:10,
                            boxShadow:isDragging?`0 6px 20px ${pc.bar}40`:h2?`0 3px 10px ${pc.bar}30`:`0 1px 3px ${pc.bar}15`,
                            opacity:isDragging?0.85:1,cursor:"grab",userSelect:"none",
                            display:"flex",alignItems:"center",justifyContent:"center"}}>
                          {/* Resize handles visual */}
                          <div style={{position:"absolute",left:2,top:"50%",transform:"translateY(-50%)",width:3,height:14,borderRadius:2,background:"rgba(255,255,255,0.5)"}}/>
                          <div style={{position:"absolute",right:2,top:"50%",transform:"translateY(-50%)",width:3,height:14,borderRadius:2,background:"rgba(255,255,255,0.5)"}}/>
                          {w>60&&<span style={{fontSize:9,fontWeight:700,color:"rgba(255,255,255,0.9)",whiteSpace:"nowrap",padding:"0 10px"}}>{r.dates}</span>}
                        </div>
                        {/* Edit popup */}
                        {editItem?.id===r.id&&<div style={{position:"absolute",left:Math.min(l,cW-240),top:RH-2,background:"#fff",border:`1px solid ${C.s[200]}`,borderRadius:10,padding:12,boxShadow:"0 8px 30px rgba(0,0,0,0.15)",zIndex:30,width:220}} onClick={e=>e.stopPropagation()}>
                          <div style={{fontSize:12,fontWeight:700,color:C.s[900],marginBottom:8}}>{r.name}</div>
                          <div style={{fontSize:11,color:C.s[500],marginBottom:4}}>{r.dates} 2026</div>
                          <div style={{fontSize:11,color:C.s[500],marginBottom:8}}>📍 {r.venue||"No venue set"}</div>
                          <div style={{fontSize:10,color:C.s[400],marginBottom:8}}>Drag edges to resize • Drag middle to move</div>
                          <div style={{display:"flex",gap:6}}>
                            <button onClick={()=>togglePri(r.id)} style={{...btnS,fontSize:10,padding:"4px 10px",background:r.priority?C.a[50]:"#fff",color:r.priority?C.a[600]:C.s[500],border:`1px solid ${r.priority?C.a[100]:C.s[200]}`}}>{r.priority?"★ Priority":"☆ Set Priority"}</button>
                            <button onClick={()=>deleteItem(r.id,"tournament")} style={{...btnS,fontSize:10,padding:"4px 10px",background:C.r[50],color:C.r[600],border:`1px solid ${C.r[100]}`}}>Delete</button>
                            <button onClick={()=>setEditItem(null)} style={{...btnS,fontSize:10,padding:"4px 10px",background:C.s[50],color:C.s[500],border:`1px solid ${C.s[200]}`}}>Close</button>
                          </div>
                        </div>}
                        {h2&&!editItem&&!barDrag&&<div style={{position:"absolute",left:Math.min(l+w+10,cW-260),top:"50%",transform:"translateY(-50%)",background:"#fff",border:`1px solid ${C.s[200]}`,borderRadius:8,padding:"6px 12px",boxShadow:"0 6px 20px rgba(0,0,0,0.1)",zIndex:20,whiteSpace:"nowrap",fontSize:12,color:C.s[600],display:"flex",gap:8,alignItems:"center",pointerEvents:"none"}}><span style={{fontWeight:700,color:C.s[900]}}>{r.name}</span><span>{r.dates}</span>{r.venue&&<span style={{color:C.s[400]}}>📍 {r.venue}</span>}</div>}
                      </div>);
                    })}

                    {/* Bookings section */}
                    <div style={{height:SH,background:C.s[50],borderBottom:`1px solid ${C.s[200]}`,borderTop:`1px solid ${C.s[200]}`}}/>
                    {bOpen&&<>
                      <div style={{height:OH,position:"relative",borderBottom:`1px solid ${C.s[100]}`,background:C.s[50]}}>
                        {occSp.map((sp,si)=>{const l=d2px(sp.s);const w=dur2px(sp.s,sp.e);const n=sp.e-sp.s+1;return(<div key={si} style={{position:"absolute",left:l,width:w,top:4,bottom:4,background:sp.booked?C.r[500]:C.e[500],borderRadius:3,opacity:0.6,display:"flex",alignItems:"center",justifyContent:"center",overflow:"hidden"}}>{w>24&&<span style={{fontSize:8,fontWeight:700,color:"#fff"}}>{n}d</span>}</div>);})}
                        {sortB.map((b,bi)=>{const bEnd=dIdx(b.end[0],b.end[1]);return sortB.filter((b2,b2i)=>b2i!==bi&&dIdx(b2.start[0],b2.start[1])===bEnd).map(b2=>{const px=d2px(bEnd)+(res==="day"?uW/2:0);return<div key={`o${b.id}${b2.id}`} style={{position:"absolute",left:px-5,top:0,bottom:0,width:10,background:`repeating-linear-gradient(45deg,${C.a[500]},${C.a[500]} 2px,transparent 2px,transparent 4px)`,opacity:0.7,zIndex:8,borderRadius:2}} title="Same-day turnover"/>;});})}
                      </div>
                      {sortB.map((r,ri)=>{const si=dIdx(r.start[0],r.start[1]);const ei=dIdx(r.end[0],r.end[1]);if(si<0||ei<0)return null;const h2=hov===r.id;const pc2=platC[r.platform];const l=d2px(si);const w=Math.max(dur2px(si,ei),res==="month"?8:uW-2);const isDragging=barDrag?.id===r.id;
                        const oprev=sortB.some((b2,b2i)=>b2i!==ri&&dIdx(b2.end[0],b2.end[1])===si);const onext=sortB.some((b2,b2i)=>b2i!==ri&&dIdx(b2.start[0],b2.start[1])===ei);
                        return(<div key={r.id} onMouseEnter={()=>!barDrag&&setHov(r.id)} onMouseLeave={()=>!barDrag&&setHov(null)} style={{height:RH,position:"relative",borderBottom:`1px solid ${C.s[100]}`,background:h2?`${C.s[50]}80`:"transparent",transition:isDragging?"none":"background 0.15s"}}>
                          {res==="day"&&allDays.filter(d=>d.isWeekend).map(d=>(<div key={`w${d.index}`} style={{position:"absolute",left:d.index*uW,top:0,width:uW,height:RH,background:"rgba(0,0,0,0.015)"}}/>))}
                          {tI>=0&&<div style={{position:"absolute",left:d2px(tI)+(res==="day"?uW/2:0),top:0,width:2,height:RH,background:C.r[500],opacity:0.2,zIndex:5}}/>}
                          {/* Draggable bar */}
                          <div
                            onMouseDown={e=>{const mode=barCursor(e,l,w);barHandleDown(e,r.id,"booking",mode);}}
                            onMouseMove={e=>{if(!barDrag){const mode=barCursor(e,l,w);e.currentTarget.style.cursor=cursorStyle(mode);}}}
                            onClick={e=>handleBarClick(e,r.id,"booking")}
                            style={{position:"absolute",left:l,width:w,top:8,height:32,background:pc2.bar,borderRadius:6,zIndex:10,
                              boxShadow:isDragging?`0 6px 20px ${pc2.bar}40`:h2?`0 3px 10px ${pc2.bar}30`:`0 1px 3px ${pc2.bar}15`,
                              opacity:isDragging?0.85:1,cursor:"grab",userSelect:"none",
                              display:"flex",alignItems:"center",justifyContent:"center"}}>
                            <div style={{position:"absolute",left:2,top:"50%",transform:"translateY(-50%)",width:3,height:14,borderRadius:2,background:"rgba(255,255,255,0.5)"}}/>
                            <div style={{position:"absolute",right:2,top:"50%",transform:"translateY(-50%)",width:3,height:14,borderRadius:2,background:"rgba(255,255,255,0.5)"}}/>
                            {w>60&&<span style={{fontSize:9,fontWeight:700,color:"rgba(255,255,255,0.9)",whiteSpace:"nowrap",padding:"0 10px"}}>{r.dates}</span>}
                          </div>
                          {oprev&&<div style={{position:"absolute",left:l-1,top:8,width:5,height:32,background:C.a[500],borderRadius:"3px 0 0 3px",zIndex:11,opacity:0.8}}/>}
                          {onext&&<div style={{position:"absolute",left:l+w-6,top:8,width:5,height:32,background:C.a[500],borderRadius:"0 3px 3px 0",zIndex:11,opacity:0.8}}/>}
                          {/* Edit popup */}
                          {editItem?.id===r.id&&<div style={{position:"absolute",left:Math.min(l,cW-220),top:RH-2,background:"#fff",border:`1px solid ${C.s[200]}`,borderRadius:10,padding:12,boxShadow:"0 8px 30px rgba(0,0,0,0.15)",zIndex:30,width:200}} onClick={e=>e.stopPropagation()}>
                            <div style={{fontSize:12,fontWeight:700,color:C.s[900],marginBottom:4}}>{r.platform}</div>
                            <div style={{fontSize:11,color:C.s[500],marginBottom:8}}>{r.dates} 2026</div>
                            <div style={{fontSize:10,color:C.s[400],marginBottom:8}}>Drag edges to resize • Drag middle to move</div>
                            <div style={{display:"flex",gap:6}}>
                              <button onClick={()=>deleteItem(r.id,"booking")} style={{...btnS,fontSize:10,padding:"4px 10px",background:C.r[50],color:C.r[600],border:`1px solid ${C.r[100]}`}}>Delete</button>
                              <button onClick={()=>setEditItem(null)} style={{...btnS,fontSize:10,padding:"4px 10px",background:C.s[50],color:C.s[500],border:`1px solid ${C.s[200]}`}}>Close</button>
                            </div>
                          </div>}
                          {h2&&!editItem&&!barDrag&&<div style={{position:"absolute",left:Math.min(l+w+10,cW-220),top:"50%",transform:"translateY(-50%)",background:"#fff",border:`1px solid ${C.s[200]}`,borderRadius:8,padding:"6px 12px",boxShadow:"0 6px 20px rgba(0,0,0,0.1)",zIndex:20,whiteSpace:"nowrap",fontSize:12,color:C.s[600],display:"flex",gap:8,alignItems:"center",pointerEvents:"none"}}><span style={{fontWeight:700,color:C.s[900]}}>{r.platform}</span><span>{r.dates}</span>{(oprev||onext)&&<span style={{fontSize:10,fontWeight:700,color:C.a[600],background:C.a[50],padding:"1px 6px",borderRadius:4}}>⚠ Turnover</span>}</div>}
                        </div>);
                      })}
                    </>}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* LEGEND */}
        {!isMobile&&<div style={{display:"flex",flexWrap:"wrap",gap:14,marginTop:16,padding:"0 4px",alignItems:"center"}}>
          <span style={{fontSize:11,fontWeight:700,color:C.s[500]}}>Tournaments:</span>
          {Object.entries(provC).map(([n,c])=><div key={n} style={{display:"flex",alignItems:"center",gap:4}}><div style={{width:10,height:4,borderRadius:2,background:c.bar}}/><span style={{fontSize:11,color:C.s[500]}}>{n}</span></div>)}
          <div style={{width:1,height:14,background:C.s[200]}}/>
          <span style={{fontSize:11,fontWeight:700,color:C.s[500]}}>Bookings:</span>
          {Object.entries(platC).map(([n,c])=><div key={n} style={{display:"flex",alignItems:"center",gap:4}}><div style={{width:10,height:4,borderRadius:2,background:c.bar}}/><span style={{fontSize:11,color:C.s[500]}}>{n}</span></div>)}
          <div style={{width:1,height:14,background:C.s[200]}}/>
          <span style={{fontSize:11,fontWeight:700,color:C.s[500]}}>🔥 = Book next</span>
        </div>}
      </div>
    </div>
  );
}
