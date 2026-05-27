import { useState, useEffect, useRef } from "react";

const C = {
  bg:"#0e1320", bg2:"#151b2e", card:"#1b2238", cardHi:"#222a44",
  border:"#2c3552", borderHi:"#3d4870",
  cream:"#eef1fa", text:"#bcc4dd", muted:"#7682a3", faint:"#525d7d",
  pink:"#ff6b9d", green:"#4ade9b", blue:"#52a9ff",
  gold:"#ffc857", purple:"#a78bfa", orange:"#fb923c",
};
const TODAY = new Date().toISOString().split("T")[0];
const uid = () => Math.random().toString(36).slice(2,9);

// ใช้ localStorage จริง สำหรับ PWA
const LS = {
  get:(k,fb)=>{ try{ const v=localStorage.getItem(k); return v!==null?JSON.parse(v):fb; }catch{ return fb; } },
  set:(k,v)=>{ try{ localStorage.setItem(k,JSON.stringify(v)); }catch{} },
};

const GOALS = { kcal:1600, protein:145, carb:140, fat:50 };
const WEIGHT_MILESTONES = [
  {date:"2026-08-01",weight:65,label:"🎯 ส.ค. 65 กก."},
  {date:"2026-11-08",weight:58,label:"🏅 แข่ง 8 พ.ย."},
  {date:"2026-12-01",weight:48,label:"🎯 ธ.ค. 48 กก."},
];

const DAY_PLANS = {
  1:{label:"วันที่ 1",sub:"Stairmaster + วิ่ง 3 กม. + มวย",color:"#52a9ff",type:"run",
    items:[
      {id:"s1",ic:"🪜",title:"Stairmaster 45 นาที",detail:"Zone 2 · HR 119–139 · ระดับ 6–8",hr:"119–139"},
      {id:"r1",ic:"🏃",title:"วิ่ง 3 กม. Zone 2",detail:"HR 119–139 · speed 7–7.5",hr:"119–139",km:"3",speed:"7–7.5"},
      {id:"m1",ic:"🥊",title:"มวยไทย Project H",detail:"คลาสปกติ · Zone 2–4",hr:"119–178"},
    ]},
  2:{label:"วันที่ 2",sub:"Stairmaster + เวท Glute & Leg + มวย",color:"#4ade9b",type:"weight",
    items:[
      {id:"s2",ic:"🪜",title:"Stairmaster 45 นาที",detail:"Zone 2 · HR 119–139 · ระดับ 6–8",hr:"119–139"},
      {id:"m2",ic:"🥊",title:"มวยไทย Project H",detail:"คลาสปกติ",hr:"119–178"},
    ],
    weight:{title:"เวท A — Glute & Leg",focus:"ขา ก้น สะโพก",exercises:[
      {id:"ht",name:"Hip Thrust Machine",sets:4,reps:12,note:"บีบก้นค้างข้างบน 1 วิ"},
      {id:"ck",name:"Cable Kickback",sets:3,reps:15,note:"ขาละ ตึงก้นตลอด"},
      {id:"lp",name:"Leg Press (Sumo wide)",sets:4,reps:12,note:"เท้ากว้าง เน้น inner thigh"},
      {id:"ha",name:"Hip Abduction Machine",sets:3,reps:20,note:"ช่วยให้สะโพกกว้าง"},
      {id:"lc",name:"Leg Curl Machine",sets:3,reps:12,note:"คุม eccentric ช้าๆ"},
      {id:"cp",name:"Cable Pull-Through",sets:3,reps:15,note:"hinge สะโพก ไม่ใช่หลัง"},
    ]},
    optRun:{id:"or2",title:"วิ่งเบา 1–1.5 กม. (optional)",detail:"Zone 1 · speed 6 · ถ้าขาล้าข้ามได้"}},
  3:{label:"วันที่ 3",sub:"Stairmaster + วิ่ง 3 กม. + มวย",color:"#52a9ff",type:"run",
    items:[
      {id:"s3",ic:"🪜",title:"Stairmaster 45 นาที",detail:"Zone 2 · HR 119–139 · ระดับ 6–8",hr:"119–139"},
      {id:"r3",ic:"🏃",title:"วิ่ง 3 กม. Zone 2",detail:"HR 119–139 · speed 7–7.5",hr:"119–139",km:"3",speed:"7–7.5"},
      {id:"m3",ic:"🥊",title:"มวยไทย Project H",detail:"คลาสปกติ",hr:"119–178"},
    ]},
  4:{label:"วันที่ 4",sub:"Stairmaster + เวท Core & Waist + มวย",color:"#4ade9b",type:"weight",
    items:[
      {id:"s4",ic:"🪜",title:"Stairmaster 45 นาที",detail:"Zone 2 · HR 119–139 · ระดับ 6–8",hr:"119–139"},
      {id:"m4",ic:"🥊",title:"มวยไทย Project H",detail:"คลาสปกติ",hr:"119–178"},
    ],
    weight:{title:"เวท B — Core + Waist + Upper",focus:"แกน เอว หลัง",exercises:[
      {id:"wc",name:"Cable Woodchop",sets:3,reps:15,note:"หมุนลำตัว ไม่ใช่แขน"},
      {id:"pp",name:"Pallof Press",sets:3,reps:12,note:"ต้านการหมุน เสริม core"},
      {id:"hl",name:"Hanging Leg Raise",sets:3,reps:12,note:"งอเข่าได้ถ้ายังไม่แข็งแรง"},
      {id:"cc",name:"Cable Crunch",sets:3,reps:15,note:"โค้งลงจาก cable ไม่ใช่ดึง"},
      {id:"lt",name:"Lat Pulldown",sets:3,reps:12,note:"ดึงลงหน้าอก"},
      {id:"sr",name:"Seated Cable Row",sets:3,reps:12,note:"บีบหลังทุกครั้ง"},
    ]},
    optRun:{id:"or4",title:"วิ่งเบา 1–1.5 กม. (optional)",detail:"Zone 1 · speed 6 · ถ้าขาล้าข้ามได้"}},
  5:{label:"วันที่ 5",sub:"Stairmaster + วิ่ง 3 กม. + มวย",color:"#52a9ff",type:"run",
    items:[
      {id:"s5",ic:"🪜",title:"Stairmaster 45 นาที",detail:"Zone 2 · HR 119–139 · ระดับ 6–8",hr:"119–139"},
      {id:"r5",ic:"🏃",title:"วิ่ง 3 กม. Zone 2",detail:"HR 119–139 · speed 7–7.5",hr:"119–139",km:"3",speed:"7–7.5"},
      {id:"m5",ic:"🥊",title:"มวยไทย Project H",detail:"คลาสปกติ",hr:"119–178"},
    ]},
  6:{label:"วันที่ 6",sub:"Long run + Stairmaster 30 นาที + มวย",color:"#ffc857",type:"longrun",
    items:[
      {id:"lr6",ic:"🏃‍♀️",title:"Long run Zone 2",detail:"เริ่ม 4 กม. เพิ่มสัปดาห์ละ 0.5 กม. · HR 119–139 · speed 6.5–7",hr:"119–139",km:"4+",speed:"6.5–7"},
      {id:"s6",ic:"🪜",title:"Stairmaster 30 นาที",detail:"Zone 2 · เบาลง · ระดับ 5–7",hr:"119–139"},
      {id:"m6",ic:"🥊",title:"มวยไทย Project H",detail:"บอกโค้ชถ้าขาล้ามาก",hr:"119–178"},
    ]},
  7:{label:"วันที่ 7",sub:"Active Recovery · ทุกอย่างเบา",color:"#a78bfa",type:"recovery",
    items:[
      {id:"s7",ic:"🪜",title:"Stairmaster 30 นาที เบา",detail:"Zone 1–2 · HR ไม่เกิน 130 · ระดับ 4–5",hr:"99–130"},
      {id:"r7",ic:"🏃",title:"วิ่งเบา 1.5 กม.",detail:"Zone 1 · speed 6 · แค่ขยับขา",hr:"99–119",km:"1.5",speed:"6"},
      {id:"m7",ic:"🥊",title:"มวยไทย Project H",detail:"คลาสปกติ",hr:"119–158"},
      {id:"st7",ic:"🧘",title:"ยืดเส้น + foam roll 15 นาที",detail:"เน้นขา น่อง สะโพก IT band"},
    ]},
  8:{label:"วันเวร 🏥",sub:"ไม่มีมวย · Stairmaster + วิ่ง",color:"#ff6b9d",type:"oncall",
    items:[
      {id:"s8",ic:"🪜",title:"Stairmaster 45 นาที",detail:"Zone 2 · HR 119–139 · ทดแทน calorie จากมวย",hr:"119–139"},
      {id:"r8",ic:"🏃",title:"วิ่ง 3 กม. Zone 2",detail:"HR 119–139 · speed 7",hr:"119–139",km:"3",speed:"7"},
      {id:"st8",ic:"🧘",title:"ยืดเส้น + foam roll 20 นาที",detail:"ร่างกายได้พักจากมวย"},
    ]},
};

function Ring({value,max,size=80,stroke=10,color,label,sub}){
  const r=(size-stroke)/2,circ=2*Math.PI*r,pct=Math.max(0,Math.min(1,max>0?value/max:0)),over=value>max;
  return(
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:5}}>
      <div style={{position:"relative",width:size,height:size}}>
        <svg width={size} height={size} style={{transform:"rotate(-90deg)"}}>
          <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={C.border} strokeWidth={stroke}/>
          <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={over?C.pink:color} strokeWidth={stroke}
            strokeDasharray={circ} strokeDashoffset={circ*(1-pct)} strokeLinecap="round"
            style={{transition:"stroke-dashoffset 0.6s ease"}}/>
        </svg>
        <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}>
          <span style={{fontSize:size*0.2,fontWeight:800,color:over?C.pink:C.cream,lineHeight:1}}>{Math.round(value)}</span>
          {max&&<span style={{fontSize:7.5,color:C.faint,fontWeight:700}}>/{max}</span>}
        </div>
      </div>
      <div style={{textAlign:"center"}}>
        <div style={{fontSize:10,fontWeight:800,color:over?C.pink:color}}>{label}</div>
        {sub&&<div style={{fontSize:9,color:C.faint,fontWeight:600}}>{sub}</div>}
      </div>
    </div>
  );
}

export default function Tracker(){
  const [tab,setTab] = useState("today");
  const [date,setDate] = useState(TODAY);
  const [logs,setLogs] = useState(()=>LS.get("mt_logs",{}));
  const [dayChoice,setDayChoice] = useState(()=>LS.get("mt_daychoice",{}));
  const [weightHistory,setWeightHistory] = useState(()=>LS.get("mt_weights",[{date:TODAY,weight:75.4}]));
  const [foodMessages,setFoodMessages] = useState(()=>LS.get("mt_food_msgs",{}));
  const [allNutr,setAllNutr] = useState(()=>LS.get("mt_nutrition",{}));
  const [garminLogs,setGarminLogs] = useState(()=>LS.get("mt_garmin",{}));

  useEffect(()=>LS.set("mt_logs",logs),[logs]);
  useEffect(()=>LS.set("mt_daychoice",dayChoice),[dayChoice]);
  useEffect(()=>LS.set("mt_weights",weightHistory),[weightHistory]);
  useEffect(()=>LS.set("mt_food_msgs",foodMessages),[foodMessages]);
  useEffect(()=>LS.set("mt_nutrition",allNutr),[allNutr]);
  useEffect(()=>LS.set("mt_garmin",garminLogs),[garminLogs]);

  const day = logs[date]||{checked:{},runs:[],notes:""};
  const patch = fn=>setLogs(p=>({...p,[date]:fn(p[date]||{checked:{},runs:[],notes:""})}));
  const todayMsgs = foodMessages[date]||[];
  const setTodayMsgs = fn=>setFoodMessages(p=>({...p,[date]:typeof fn==="function"?fn(p[date]||[]):fn}));
  const todayNutr = allNutr[date]||{kcal:0,protein:0,carb:0,fat:0};
  const setTodayNutr = v=>setAllNutr(p=>({...p,[date]:v}));

  const sortedW=[...weightHistory].sort((a,b)=>b.date.localeCompare(a.date));
  const latestW=sortedW[0]?.weight||75.4;
  const pctTo65=Math.max(0,Math.min(100,((75.4-latestW)/(75.4-65))*100));
  const daysToRace=Math.max(0,Math.round((new Date("2026-11-08").getTime()-Date.now())/86400000));
  const plan=dayChoice[date]?DAY_PLANS[dayChoice[date]]:null;
  const pc=plan?.color||C.blue;

  const inp={background:C.bg2,border:`1.5px solid ${C.borderHi}`,borderRadius:13,color:C.cream,padding:"11px 14px",fontSize:14,width:"100%",outline:"none",fontFamily:"Nunito,sans-serif",fontWeight:700};
  const card={background:C.card,border:`1px solid ${C.border}`,borderRadius:20,padding:16,marginBottom:12};
  const lbl={fontSize:11,color:C.muted,fontWeight:800,marginBottom:6,display:"block"};

  return(
    <div style={{minHeight:"100vh",background:C.bg,color:C.text,fontFamily:"Nunito,sans-serif",fontWeight:600,paddingBottom:80,WebkitTapHighlightColor:"transparent"}}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Nunito:wght@600;700;800;900&display=swap');*{box-sizing:border-box;-webkit-tap-highlight-color:transparent}button:active{transform:scale(.96)}input[type=date]::-webkit-calendar-picker-indicator{filter:invert(.6) brightness(1.4)}::-webkit-scrollbar{width:0}`}</style>

      {/* HEADER */}
      <div style={{background:C.bg2,borderBottom:`1px solid ${C.border}`,padding:"env(safe-area-inset-top, 18px) 16px 14px",paddingTop:`max(env(safe-area-inset-top),18px)`}}>
        <div style={{maxWidth:480,margin:"0 auto"}}>
          <div style={{fontSize:10,letterSpacing:1.5,color:C.muted,fontWeight:800,marginBottom:2}}>🏃 MARATHON TRACKER · 8 พ.ย. 2026</div>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-end"}}>
            <div style={{fontSize:34,fontWeight:900,color:C.cream,lineHeight:1}}>{latestW.toFixed(1)}<span style={{fontSize:14,color:C.muted}}> กก.</span></div>
            <div style={{textAlign:"right"}}>
              <div style={{fontSize:10,color:C.muted}}>เหลืออีก</div>
              <div style={{fontSize:24,fontWeight:900,color:pc,lineHeight:1}}>{daysToRace}<span style={{fontSize:11,color:C.muted}}> วัน</span></div>
            </div>
          </div>
          <div style={{marginTop:8,background:C.border,borderRadius:6,height:6,overflow:"hidden"}}>
            <div style={{width:`${pctTo65}%`,height:"100%",background:`linear-gradient(90deg,${C.pink},${C.gold})`,transition:"width .8s ease"}}/>
          </div>
          <div style={{display:"flex",justifyContent:"space-between",fontSize:9,color:C.faint,marginTop:3,fontWeight:700}}>
            <span>75.4 กก.</span><span style={{color:C.gold}}>→ 65 กก. (ส.ค.)</span><span>48 กก. (ธ.ค.)</span>
          </div>
        </div>
      </div>

      {/* NAV */}
      <div style={{display:"flex",background:C.bg,borderBottom:`1px solid ${C.border}`,position:"sticky",top:0,zIndex:30,maxWidth:480,margin:"0 auto",padding:"6px 8px",gap:4}}>
        {[["today","วันนี้","📊"],["calendar","ปฏิทิน","📅"],["food","อาหาร","🍱"],["progress","Progress","📈"]].map(([id,lb,ic])=>(
          <button key={id} onClick={()=>setTab(id)} style={{flex:1,padding:"8px 2px",borderRadius:12,background:tab===id?`${pc}22`:"transparent",border:tab===id?`1.5px solid ${pc}66`:"1.5px solid transparent",cursor:"pointer",fontFamily:"Nunito,sans-serif",fontSize:10,fontWeight:tab===id?800:600,color:tab===id?pc:C.faint,display:"flex",flexDirection:"column",alignItems:"center",gap:1}}>
            <span style={{fontSize:14}}>{ic}</span>{lb}
          </button>
        ))}
      </div>

      <div style={{maxWidth:480,margin:"0 auto",padding:"0 14px"}}>
        <div style={{display:"flex",gap:8,alignItems:"center",margin:"12px 0 4px"}}>
          <input type="date" value={date} onChange={e=>setDate(e.target.value)} style={{...inp,flex:1,fontSize:12,padding:"9px 12px"}}/>
          {date!==TODAY&&<button onClick={()=>setDate(TODAY)} style={{padding:"9px 14px",borderRadius:12,background:"transparent",border:`1.5px solid ${pc}`,color:pc,fontSize:12,fontWeight:800,cursor:"pointer",fontFamily:"Nunito,sans-serif",whiteSpace:"nowrap"}}>วันนี้</button>}
        </div>

        {tab==="today"&&<TodayTab day={day} patch={patch} date={date} plan={plan} dayChoice={dayChoice} setDayChoice={setDayChoice} weightHistory={weightHistory} setWeightHistory={setWeightHistory} card={card} lbl={lbl} inp={inp} pc={pc}/>}
        {tab==="calendar"&&<CalendarTab date={date} setDate={setDate} logs={logs} dayChoice={dayChoice} card={card}/>}
        {tab==="food"&&<FoodTab messages={todayMsgs} setMessages={setTodayMsgs} nutr={todayNutr} setNutr={setTodayNutr} date={date} card={card} lbl={lbl} inp={inp} garminLogs={garminLogs} setGarminLogs={setGarminLogs} allNutr={allNutr}/>}
        {tab==="progress"&&<ProgressTab weightHistory={weightHistory} setWeightHistory={setWeightHistory} logs={logs} latestW={latestW} pctTo65={pctTo65} card={card} lbl={lbl} garminLogs={garminLogs} allNutr={allNutr}/>}
      </div>
    </div>
  );
}

function TodayTab({day,patch,date,plan,dayChoice,setDayChoice,weightHistory,setWeightHistory,card,lbl,inp,pc}){
  const [logModal,setLogModal]=useState(false);
  const allIds=[...(plan?.items||[]).map(i=>i.id),...(plan?.weight?.exercises||[]).map(e=>e.id),...(plan?.optRun?[plan.optRun.id]:[])];
  const done=allIds.filter(id=>day.checked?.[id]).length;
  const pct=allIds.length>0?Math.round((done/allIds.length)*100):0;
  const stars=[done>0,pct>=60,!!weightHistory.find(w=>w.date===date),(day.notes||"").length>0].filter(Boolean).length;
  const [wv,setWv]=useState("");
  const exW=weightHistory.find(w=>w.date===date);
  const saveW=()=>{const w=parseFloat(wv);if(w>=30&&w<=200){setWeightHistory(p=>[...p.filter(x=>x.date!==date),{date,weight:w}].sort((a,b)=>a.date.localeCompare(b.date)));setWv("");}};
  const selectDay=n=>{setDayChoice(p=>({...p,[date]:n}));patch(d=>({...d,checked:{}}));};

  const dayBtn=(n,col,label,short)=>{
    const sel=dayChoice[date]===n;
    return <div key={n} onClick={()=>selectDay(n)} style={{padding:"8px 4px",borderRadius:11,textAlign:"center",cursor:"pointer",background:sel?`${col}30`:"transparent",border:`1.5px solid ${sel?col:C.border}`,transition:"all .15s"}}>
      <div style={{fontSize:14,fontWeight:900,color:sel?col:C.muted}}>{label}</div>
      <div style={{fontSize:8,color:sel?col:C.faint,fontWeight:700,marginTop:1,lineHeight:1.3}}>{short}</div>
    </div>;
  };

  return <>
    <div style={{...card,background:`linear-gradient(135deg,${C.gold}15,${C.purple}10)`,borderColor:`${C.gold}44`,marginTop:12}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div><div style={{fontSize:10,color:C.gold,fontWeight:800,marginBottom:4}}>⭐ วันนี้</div><div style={{fontSize:20,letterSpacing:3}}>{[1,2,3,4].map(i=>i<=stars?"⭐":"⚪")}</div></div>
        <div style={{textAlign:"right"}}><div style={{fontSize:26,fontWeight:900,color:stars===4?C.gold:C.cream,lineHeight:1}}>{pct}<span style={{fontSize:12,color:C.faint}}>%</span></div><div style={{fontSize:9,color:C.faint}}>เสร็จแล้ว</div></div>
      </div>
      {stars===4&&<div style={{fontSize:11,color:C.gold,fontWeight:800,textAlign:"center",marginTop:6}}>🎉 วันนี้ครบสมบูรณ์!</div>}
    </div>

    <div style={card}><span style={lbl}>⚖️ น้ำหนักวันนี้</span>
      <div style={{display:"flex",gap:8,alignItems:"center"}}>
        {exW&&<div style={{fontSize:26,fontWeight:900,color:C.cream,lineHeight:1,flexShrink:0}}>{exW.weight}<span style={{fontSize:12,color:C.muted}}> กก.</span></div>}
        <input style={{...inp,flex:1,padding:"10px 12px"}} type="number" step="0.1" placeholder={exW?`แก้ไข (${exW.weight})`:"กรอก กก."} value={wv} onChange={e=>setWv(e.target.value)} onKeyDown={e=>e.key==="Enter"&&saveW()}/>
        <button onClick={saveW} style={{padding:"10px 14px",borderRadius:12,background:"transparent",border:`1.5px solid ${C.green}`,color:C.green,fontWeight:800,cursor:"pointer",fontFamily:"Nunito,sans-serif",fontSize:13,flexShrink:0}}>บันทึก</button>
      </div>
    </div>

    <div style={card}><span style={lbl}>📅 วันนี้ทำตารางวันไหน?</span>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:6,marginBottom:8}}>
        {dayBtn(1,"#52a9ff","1","วิ่ง")}
        {dayBtn(2,"#4ade9b","2","เวท A")}
        {dayBtn(3,"#52a9ff","3","วิ่ง")}
        {dayBtn(4,"#4ade9b","4","เวท B")}
        {dayBtn(5,"#52a9ff","5","วิ่ง")}
        {dayBtn(6,"#ffc857","6","Long")}
        {dayBtn(7,"#a78bfa","7","พัก")}
        {dayBtn(8,"#ff6b9d","🏥","เวร")}
      </div>
      {plan&&<div style={{fontSize:11,color:plan.color,fontWeight:800,padding:"6px 10px",background:`${plan.color}18`,borderRadius:10}}>{plan.label} · {plan.sub}</div>}
    </div>

    {!plan&&<div style={{...card,textAlign:"center",padding:"28px 16px"}}><div style={{fontSize:32,marginBottom:8}}>👆</div><div style={{fontSize:13,fontWeight:800,color:C.cream}}>เลือกตารางวันนี้ก่อนเลย</div><div style={{fontSize:11,color:C.muted,marginTop:4}}>กดตัวเลขด้านบน</div></div>}

    {plan&&<div style={{...card,borderColor:`${plan.color}44`}}>
      <div style={{fontSize:13,fontWeight:900,color:plan.color,marginBottom:10}}>{plan.label}</div>
      {plan.items.map(item=>{
        const dn=!!day.checked?.[item.id];
        return <div key={item.id} onClick={()=>patch(d=>({...d,checked:{...(d.checked||{}),[item.id]:!d.checked?.[item.id]}}))}
          style={{display:"flex",gap:10,padding:"10px 0",cursor:"pointer",borderBottom:`1px solid ${C.border}`,alignItems:"flex-start"}}>
          <div style={{width:22,height:22,borderRadius:7,flexShrink:0,marginTop:1,border:`2px solid ${dn?plan.color:C.borderHi}`,background:dn?plan.color:"transparent",display:"flex",alignItems:"center",justifyContent:"center",color:C.bg,fontSize:13,fontWeight:900,transition:"all .15s"}}>{dn?"✓":""}</div>
          <div style={{flex:1}}>
            <div style={{fontSize:14,marginBottom:2}}>{item.ic} <span style={{color:dn?C.faint:C.cream,fontWeight:700,textDecoration:dn?"line-through":"none"}}>{item.title}</span></div>
            {!dn&&<div style={{fontSize:11,color:C.muted,fontWeight:600,lineHeight:1.5}}>{item.detail}</div>}
            {!dn&&item.hr&&<div style={{fontSize:10,color:plan.color,marginTop:2,fontWeight:800}}>💓 {item.hr} bpm{item.km?` · 📏 ${item.km} กม.`:""}{ item.speed?` · speed ${item.speed}`:""}</div>}
          </div>
        </div>;
      })}

      {plan.weight&&<>
        <div style={{fontSize:12,fontWeight:900,color:C.green,margin:"12px 0 8px"}}>🏋️ {plan.weight.title}</div>
        {plan.weight.exercises.map(ex=>{
          const dn=!!day.checked?.[ex.id];
          return <div key={ex.id} onClick={()=>patch(d=>({...d,checked:{...(d.checked||{}),[ex.id]:!d.checked?.[ex.id]}}))}
            style={{display:"flex",gap:10,padding:"8px 0",cursor:"pointer",borderBottom:`1px solid ${C.border}`,alignItems:"flex-start"}}>
            <div style={{width:20,height:20,borderRadius:6,flexShrink:0,marginTop:1,border:`2px solid ${dn?C.green:C.borderHi}`,background:dn?C.green:"transparent",display:"flex",alignItems:"center",justifyContent:"center",color:C.bg,fontSize:11,fontWeight:900}}>{dn?"✓":""}</div>
            <div style={{flex:1}}>
              <div style={{fontSize:12,color:dn?C.faint:C.cream,fontWeight:700,textDecoration:dn?"line-through":"none"}}>🔧 {ex.name} <span style={{color:C.faint}}>· {ex.sets}×{ex.reps}</span></div>
              {!dn&&<div style={{fontSize:10,color:C.gold,marginTop:2,fontWeight:700}}>💡 {ex.note}</div>}
            </div>
          </div>;
        })}
        <div style={{fontSize:11,color:C.muted,fontWeight:700,padding:"7px 0"}}>✅ {plan.weight.exercises.filter(e=>day.checked?.[e.id]).length}/{plan.weight.exercises.length} ท่า</div>
      </>}

      {plan.optRun&&(()=>{const dn=!!day.checked?.[plan.optRun.id];return(
        <div onClick={()=>patch(d=>({...d,checked:{...(d.checked||{}),[plan.optRun.id]:!d.checked?.[plan.optRun.id]}}))}
          style={{display:"flex",gap:10,padding:"10px 0",cursor:"pointer",borderTop:`1px solid ${C.border}`,alignItems:"flex-start"}}>
          <div style={{width:22,height:22,borderRadius:7,flexShrink:0,marginTop:1,border:`2px solid ${dn?C.purple:C.borderHi}`,background:dn?C.purple:"transparent",display:"flex",alignItems:"center",justifyContent:"center",color:C.bg,fontSize:13,fontWeight:900}}>{dn?"✓":""}</div>
          <div style={{flex:1}}>
            <div style={{fontSize:12,color:dn?C.faint:C.cream,fontWeight:700,textDecoration:dn?"line-through":"none"}}>🏃 {plan.optRun.title}</div>
            {!dn&&<div style={{fontSize:11,color:C.muted,marginTop:2}}>{plan.optRun.detail}</div>}
          </div>
        </div>
      );})()}

      {(plan.type==="run"||plan.type==="longrun"||plan.type==="oncall")&&(
        <button onClick={()=>setLogModal(true)} style={{width:"100%",marginTop:10,padding:"11px",borderRadius:13,background:"transparent",border:`1.5px solid ${plan.color}`,color:plan.color,fontWeight:800,cursor:"pointer",fontFamily:"Nunito,sans-serif",fontSize:13}}>📊 บันทึกผลการวิ่ง</button>
      )}
      {day.runs?.length>0&&<div style={{marginTop:8,padding:"9px 12px",background:C.bg2,borderRadius:10,fontSize:12,color:C.muted,fontWeight:700}}>✅ {day.runs[0].km} กม. {day.runs[0].hr?`· HR ${day.runs[0].hr}`:""}</div>}
    </div>}

    <div style={card}><span style={lbl}>📝 โน้ตวันนี้</span>
      <textarea value={day.notes||""} onChange={e=>patch(d=>({...d,notes:e.target.value}))} placeholder="รู้สึกยังไง ร่างกายเป็นยังไง..." style={{...inp,minHeight:60,resize:"none"}}/>
    </div>

    {logModal&&<div style={{position:"fixed",inset:0,background:"rgba(6,9,18,.92)",zIndex:100,display:"flex",alignItems:"flex-end",justifyContent:"center"}} onClick={e=>e.target===e.currentTarget&&setLogModal(false)}>
      <div style={{background:C.bg2,borderRadius:"20px 20px 0 0",border:`1px solid ${C.borderHi}`,width:"100%",maxWidth:480,padding:20,paddingBottom:"max(20px,env(safe-area-inset-bottom))"}}>
        <div style={{display:"flex",justifyContent:"space-between",marginBottom:14}}>
          <span style={{fontSize:16,fontWeight:900,color:C.cream}}>📊 บันทึกผลวิ่ง</span>
          <span onClick={()=>setLogModal(false)} style={{cursor:"pointer",color:C.muted,fontSize:22,fontWeight:800,width:32,height:32,display:"flex",alignItems:"center",justifyContent:"center",borderRadius:"50%",background:C.card}}>×</span>
        </div>
        <RunLogForm patch={patch} close={()=>setLogModal(false)} inp={inp} lbl={lbl}/>
      </div>
    </div>}
  </>;
}

function RunLogForm({patch,close,inp,lbl}){
  const [km,setKm]=useState(""); const [hr,setHr]=useState(""); const [note,setNote]=useState("");
  return <div style={{display:"flex",flexDirection:"column",gap:10}}>
    <div><span style={lbl}>ระยะ (กม.)</span><input style={inp} type="number" step="0.01" placeholder="3.0" value={km} onChange={e=>setKm(e.target.value)}/></div>
    <div><span style={lbl}>HR เฉลี่ย (bpm)</span><input style={inp} type="number" placeholder="130" value={hr} onChange={e=>setHr(e.target.value)}/></div>
    <div><span style={lbl}>โน้ต</span><input style={inp} placeholder="รู้สึกยังไง..." value={note} onChange={e=>setNote(e.target.value)}/></div>
    <button onClick={()=>{patch(d=>({...d,runs:[{id:uid(),km,hr:hr?+hr:null,note}]}));close();}} style={{padding:"12px",borderRadius:13,background:C.blue,border:"none",color:C.bg,fontWeight:900,cursor:"pointer",fontFamily:"Nunito,sans-serif",fontSize:14}}>💾 บันทึก</button>
  </div>;
}

function CalendarTab({date,setDate,logs,dayChoice,card}){
  const [y,setY]=useState(()=>parseInt(date.slice(0,4)));
  const [m,setM]=useState(()=>parseInt(date.slice(5,7)));
  const firstDay=new Date(y,m-1,1).getDay();
  const dim=new Date(y,m,0).getDate();
  const mnames=["ม.ค.","ก.พ.","มี.ค.","เม.ย.","พ.ค.","มิ.ย.","ก.ค.","ส.ค.","ก.ย.","ต.ค.","พ.ย.","ธ.ค."];
  return <>
    <div style={{...card,marginTop:12}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
        <button onClick={()=>m===1?(setY(y=>y-1),setM(12)):setM(m=>m-1)} style={{background:"transparent",border:`1.5px solid ${C.border}`,color:C.cream,width:32,height:32,borderRadius:"50%",fontSize:18,cursor:"pointer",fontWeight:900}}>‹</button>
        <div style={{fontSize:15,fontWeight:900,color:C.cream}}>{mnames[m-1]} {y}</div>
        <button onClick={()=>m===12?(setY(y=>y+1),setM(1)):setM(m=>m+1)} style={{background:"transparent",border:`1.5px solid ${C.border}`,color:C.cream,width:32,height:32,borderRadius:"50%",fontSize:18,cursor:"pointer",fontWeight:900}}>›</button>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:2,marginBottom:4}}>
        {["อา","จ","อ","พ","พฤ","ศ","ส"].map((d,i)=><div key={i} style={{textAlign:"center",fontSize:9,color:C.faint,fontWeight:800,padding:"2px 0"}}>{d}</div>)}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:2}}>
        {Array.from({length:firstDay}).map((_,i)=><div key={`e${i}`}/>)}
        {Array.from({length:dim},(_,i)=>i+1).map(d=>{
          const ds=`${y}-${String(m).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
          const dn=dayChoice[ds]; const p=dn?DAY_PLANS[dn]:null;
          const col=p?.color||C.faint;
          const isSel=ds===date,isT=ds===TODAY,hasLog=!!logs[ds];
          return <div key={d} onClick={()=>setDate(ds)} style={{aspectRatio:"1",borderRadius:8,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",cursor:"pointer",background:isSel?`${col}33`:isT?`${col}18`:"transparent",border:`1.5px solid ${isSel?col:isT?col+"66":C.border}`}}>
            <div style={{fontSize:10,fontWeight:800,color:isSel||isT?col:C.muted}}>{d}</div>
            {dn&&<div style={{fontSize:7,color:col,fontWeight:800}}>D{dn}</div>}
            {hasLog&&<div style={{width:3,height:3,borderRadius:"50%",background:C.green,marginTop:1}}/>}
          </div>;
        })}
      </div>
    </div>
    {dayChoice[date]&&(()=>{const p=DAY_PLANS[dayChoice[date]];return(
      <div style={{...card,borderColor:`${p.color}44`}}>
        <div style={{fontSize:13,fontWeight:900,color:p.color,marginBottom:6}}>{p.label}</div>
        {p.items.map(item=><div key={item.id} style={{fontSize:12,color:C.text,padding:"3px 0"}}>{item.ic} {item.title}</div>)}
        {p.weight&&<div style={{fontSize:12,color:C.green,padding:"3px 0"}}>🏋️ {p.weight.title}</div>}
      </div>
    );})()}
  </>;
}

function FoodTab({messages,setMessages,nutr,setNutr,date,card,lbl,inp,garminLogs,setGarminLogs,allNutr}){
  const [input,setInput]=useState("");
  const [loading,setLoading]=useState(false);
  const [pendingNutr,setPendingNutr]=useState(null);
  const [garminV,setGarminV]=useState((garminLogs||{})[date]?.toString()||"");
  const bottomRef=useRef(null);

  useEffect(()=>{setGarminV((garminLogs||{})[date]?.toString()||"");},[date,garminLogs]);
  useEffect(()=>{bottomRef.current?.scrollIntoView({behavior:"smooth"})},[messages,loading]);

  const garmin=parseFloat(garminV)||0;
  const deficit=garmin>0&&nutr.kcal>0?garmin-nutr.kcal:null;
  const macros=[
    {key:"protein",label:"โปรตีน 🥩",val:nutr.protein||0,goal:GOALS.protein,color:C.pink,unit:"g"},
    {key:"carb",label:"คาร์บ 🍚",val:nutr.carb||0,goal:GOALS.carb,color:C.green,unit:"g"},
    {key:"fat",label:"ไขมัน 🫒",val:nutr.fat||0,goal:GOALS.fat,color:C.blue,unit:"g"},
  ];

  const SYSTEM=`คุณคือโค้ชโภชนาการ track อาหารวันที่ ${date}
ผู้ใช้: หญิง อายุ 22 สูง 159 ซม. น้ำหนัก ~75 กก. เป้า 65 กก.
เป้าวัน: kcal 1600 · protein 145g · carb 140g · fat 50g
ออกกำลังกาย: Stairmaster + วิ่ง + เวท + มวยไทย

ตอบเป็น 2 ส่วนคั่นด้วย |||JSON|||
ส่วน 1: ภาษาไทย สั้น มิตร emoji ประเมิน + สะสมทั้งวัน + แนะนำมื้อถัดไป
ถ้าจะ update ยอดสะสม ถามก่อน "อัพเดทวงกลมเลยมั้ย? 🔄"
ส่วน 2: JSON {"kcal":n,"protein":n,"carb":n,"fat":n} หรือ null`;

  const send=async()=>{
    if(!input.trim()||loading)return;
    const userMsg={role:"user",content:input.trim(),time:new Date().toTimeString().slice(0,5)};
    const newMsgs=[...messages,userMsg];
    setMessages(newMsgs);setInput("");setLoading(true);
    try{
      const res=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:800,system:SYSTEM,messages:newMsgs.map(m=>({role:m.role,content:m.content}))})});
      const data=await res.json();
      const raw=(data.content||[]).map(c=>c.text||"").join("");
      const parts=raw.split("|||JSON|||");
      const text=parts[0].trim();
      const json=parts[1]?.trim();
      if(json&&json!=="null"){try{const n=JSON.parse(json.match(/\{[\s\S]*\}/)?.[0]||"{}");if(n.kcal!==undefined)setPendingNutr({kcal:Math.round(n.kcal||0),protein:+((n.protein||0)).toFixed(1),carb:+((n.carb||0)).toFixed(1),fat:+((n.fat||0)).toFixed(1)});}catch(_){}}
      setMessages(p=>[...p,{role:"assistant",content:text,time:new Date().toTimeString().slice(0,5)}]);
    }catch{setMessages(p=>[...p,{role:"assistant",content:"⚠️ เชื่อมต่อไม่ได้ ลองใหม่",time:new Date().toTimeString().slice(0,5)}]);}
    finally{setLoading(false);}
  };

  return <div style={{display:"flex",flexDirection:"column",marginTop:12}}>
    {pendingNutr&&<div style={{position:"fixed",inset:0,background:"rgba(6,9,18,.92)",zIndex:200,display:"flex",alignItems:"center",justifyContent:"center",padding:16}}>
      <div style={{background:C.bg2,border:`1px solid ${C.borderHi}`,borderRadius:20,padding:20,maxWidth:340,width:"100%"}}>
        <div style={{fontSize:15,fontWeight:900,color:C.cream,marginBottom:8}}>🔄 อัพเดทวงกลมมั้ย?</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:7,marginBottom:14}}>
          {[["แคล",pendingNutr.kcal,"kcal",C.gold],["โปรตีน",pendingNutr.protein,"g",C.pink],["คาร์บ",pendingNutr.carb,"g",C.green],["ไขมัน",pendingNutr.fat,"g",C.blue]].map(([l,v,u,c])=>(
            <div key={l} style={{background:C.card,borderRadius:11,padding:"10px",textAlign:"center"}}>
              <div style={{fontSize:18,fontWeight:900,color:c}}>{v}<span style={{fontSize:10}}>{u}</span></div>
              <div style={{fontSize:10,color:C.faint,fontWeight:700}}>{l}</div>
            </div>
          ))}
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
          <button onClick={()=>setPendingNutr(null)} style={{padding:"11px",borderRadius:12,background:"transparent",border:`1.5px solid ${C.border}`,color:C.muted,fontWeight:800,cursor:"pointer",fontFamily:"Nunito,sans-serif"}}>ยกเลิก</button>
          <button onClick={()=>{setNutr(pendingNutr);setPendingNutr(null);}} style={{padding:"11px",borderRadius:12,background:C.green,border:"none",color:C.bg,fontWeight:900,cursor:"pointer",fontFamily:"Nunito,sans-serif"}}>✓ อัพเดทเลย</button>
        </div>
      </div>
    </div>}

    <div style={{...card,background:`linear-gradient(155deg,${C.cardHi},${C.card})`}}>
      <div style={{fontSize:11,color:C.gold,fontWeight:800,marginBottom:12}}>🍽️ สารอาหารวันนี้</div>
      <div style={{display:"flex",alignItems:"center",gap:14,marginBottom:14}}>
        <Ring value={nutr.kcal||0} max={GOALS.kcal} color={C.gold} label="แคล" sub={`เหลือ ${Math.max(0,GOALS.kcal-(nutr.kcal||0))}`} size={86} stroke={10}/>
        <div style={{flex:1,display:"flex",flexDirection:"column",gap:9}}>
          {macros.map(m=>{
            const pct=Math.min(100,(m.val/m.goal)*100);
            return <div key={m.key}>
              <div style={{display:"flex",justifyContent:"space-between",fontSize:11,fontWeight:700,marginBottom:3}}>
                <span style={{color:m.color}}>{m.label}</span>
                <span style={{color:C.cream}}>{m.val}<span style={{color:C.faint,fontSize:10}}>/{m.goal}{m.unit}</span></span>
              </div>
              <div style={{background:C.border,borderRadius:6,height:8,overflow:"hidden"}}>
                <div style={{width:`${pct}%`,height:"100%",background:m.color,borderRadius:6,transition:"width .5s ease"}}/>
              </div>
              <div style={{fontSize:9,color:C.faint,marginTop:2}}>เหลือ {Math.max(0,Math.round(m.goal-m.val))}{m.unit}</div>
            </div>;
          })}
        </div>
      </div>
      <div style={{padding:"8px 12px",background:C.bg2,borderRadius:11,fontSize:12,color:C.text}}>
        {(nutr.kcal||0)===0?<span style={{color:C.faint}}>ยังไม่มีรายการ · บอกนายว่ากินอะไรได้เลย 👇</span>
          :GOALS.kcal-(nutr.kcal||0)>0?<>เหลืออีก <b style={{color:C.gold}}>{GOALS.kcal-(nutr.kcal||0)} kcal</b> · โปรตีนอีก <b style={{color:C.pink}}>{Math.max(0,Math.round(GOALS.protein-(nutr.protein||0)))}g</b></>
          :<span style={{color:C.pink}}>⚠️ เกินเป้า {Math.abs(GOALS.kcal-(nutr.kcal||0))} kcal</span>}
      </div>
    </div>

    <div style={card}><span style={lbl}>⌚ Garmin Calorie เผาวันนี้</span>
      <div style={{display:"flex",gap:8,marginBottom:garmin>0?10:0}}>
        <input style={{...inp,flex:1,padding:"10px 12px"}} type="number" placeholder="กรอก kcal จาก Garmin" value={garminV}
          onChange={e=>{setGarminV(e.target.value);setGarminLogs(p=>({...p,[date]:parseFloat(e.target.value)||0}));}}/>
        {garmin>0&&<div style={{fontSize:11,color:C.gold,fontWeight:800,flexShrink:0,display:"flex",alignItems:"center"}}>{garmin} kcal</div>}
      </div>
      {garmin>0&&<div style={{background:C.bg2,borderRadius:11,padding:"10px 12px",fontSize:12,lineHeight:1.9}}>
        <div style={{color:C.muted,fontSize:10,fontWeight:700,marginBottom:3}}>💡 Garmin คลาดเคลื่อน ±10–15%</div>
        <div style={{display:"flex",justifyContent:"space-between"}}><span>เผาจริง (range)</span><span style={{color:C.cream,fontWeight:800}}>{Math.round(garmin*0.9)}–{Math.round(garmin*1.15)} kcal</span></div>
        <div style={{display:"flex",justifyContent:"space-between"}}><span>กินวันนี้</span><span style={{color:C.cream,fontWeight:800}}>{nutr.kcal||0} kcal</span></div>
        <div style={{display:"flex",justifyContent:"space-between",borderTop:`1px solid ${C.border}`,marginTop:5,paddingTop:5}}>
          <span style={{fontWeight:800}}>Deficit วันนี้</span>
          <span style={{fontWeight:900,color:deficit>0?C.green:C.pink}}>{deficit>0?"+":""}{deficit} kcal {deficit>300?"🔥":deficit>0?"✓":"⚠️"}</span>
        </div>
      </div>}
    </div>

    <div style={{...card,padding:"10px 14px",background:`${C.purple}15`,borderColor:`${C.purple}44`}}>
      <div style={{fontSize:11,color:C.purple,fontWeight:800,marginBottom:2}}>💬 บอกว่ากินอะไรวันนี้</div>
      <div style={{fontSize:11,color:C.muted,fontWeight:600}}>เช่น "กินข้าวกล้อง 1 ทัพพี อกไก่ 150g" · นายจะถามก่อนอัพเดทวงกลม ✨</div>
    </div>

    <div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:12,minHeight:120}}>
      {messages.length===0&&<div style={{textAlign:"center",padding:"24px 16px",color:C.faint}}><div style={{fontSize:32,marginBottom:8}}>🥗</div><div style={{fontSize:13,fontWeight:700}}>บอกนายว่ากินอะไรบ้าง</div></div>}
      {messages.map((msg,i)=>(
        <div key={i} style={{display:"flex",flexDirection:"column",alignItems:msg.role==="user"?"flex-end":"flex-start"}}>
          <div style={{maxWidth:"85%",padding:"10px 14px",borderRadius:msg.role==="user"?"18px 18px 4px 18px":"18px 18px 18px 4px",background:msg.role==="user"?`${C.blue}28`:C.card,border:`1px solid ${msg.role==="user"?C.blue+"44":C.border}`,fontSize:13,color:C.cream,lineHeight:1.75,fontWeight:600,whiteSpace:"pre-wrap"}}>{msg.content}</div>
          <div style={{fontSize:9,color:C.faint,marginTop:2,padding:"0 4px",fontWeight:700}}>{msg.time}</div>
        </div>
      ))}
      {loading&&<div style={{display:"flex"}}><div style={{padding:"10px 16px",borderRadius:"18px 18px 18px 4px",background:C.card,border:`1px solid ${C.border}`,fontSize:18,color:C.muted,letterSpacing:4}}>···</div></div>}
      <div ref={bottomRef}/>
    </div>

    <div style={{position:"sticky",bottom:0,background:C.bg,paddingTop:8,paddingBottom:`max(8px,env(safe-area-inset-bottom))`}}>
      <div style={{display:"flex",gap:8}}>
        <input style={{...inp,flex:1}} value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();send();}}} placeholder="บอกว่ากินอะไร หรือถามอะไรก็ได้..."/>
        <button onClick={send} disabled={loading||!input.trim()} style={{padding:"11px 16px",borderRadius:13,background:C.purple,border:"none",color:C.bg,fontWeight:900,cursor:"pointer",fontFamily:"Nunito,sans-serif",fontSize:16,opacity:loading||!input.trim()?.5:1,flexShrink:0}}>↑</button>
      </div>
      {messages.length>0&&<button onClick={()=>{setMessages([]);setNutr({kcal:0,protein:0,carb:0,fat:0});}} style={{background:"transparent",border:"none",color:C.faint,fontSize:11,fontWeight:700,cursor:"pointer",padding:"5px 4px"}}>🗑️ ล้างวันนี้</button>}
    </div>
  </div>;
}

function ProgressTab({weightHistory,setWeightHistory,logs,latestW,pctTo65,card,lbl,garminLogs,allNutr}){
  const sorted=[...weightHistory].sort((a,b)=>a.date.localeCompare(b.date));
  const recent7=sorted.slice(-7);
  const allRuns=Object.values(logs).filter(l=>l.runs?.length>0).flatMap(l=>l.runs.map(r=>({...r,date:l.date})));
  const totalKm=allRuns.reduce((s,r)=>s+(parseFloat(r.km)||0),0);
  const last7=Array.from({length:7},(_,i)=>{const d=new Date();d.setDate(d.getDate()-i);return d.toISOString().split("T")[0];}).reverse();
  const weeklyData=last7.map(d=>({date:d,garmin:(garminLogs||{})[d]||0,eaten:(allNutr||{})[d]?.kcal||0})).map(d=>({...d,deficit:d.garmin>0&&d.eaten>0?d.garmin-d.eaten:null}));
  const totalDef=weeklyData.reduce((s,d)=>s+(d.deficit||0),0);
  const daysLog=weeklyData.filter(d=>d.deficit!==null).length;
  const fatG=totalDef>0?(totalDef/7700*1000).toFixed(0):0;

  return <>
    <div style={{...card,marginTop:12}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",marginBottom:8}}>
        <div style={{fontSize:34,fontWeight:900,color:C.cream,lineHeight:1}}>{latestW.toFixed(1)}<span style={{fontSize:13,color:C.muted}}> กก.</span></div>
        <div style={{fontSize:26,fontWeight:900,color:C.gold}}>{pctTo65.toFixed(0)}%</div>
      </div>
      <div style={{display:"flex",justifyContent:"space-between",fontSize:9,color:C.faint,marginBottom:4,fontWeight:700}}>
        <span>75.4 กก.</span><span style={{color:C.gold}}>{(75.4-latestW).toFixed(1)} กก. ลงแล้ว</span><span style={{color:C.green}}>65 กก.</span>
      </div>
      <div style={{background:C.border,borderRadius:8,height:10,overflow:"hidden"}}>
        <div style={{width:`${pctTo65}%`,height:"100%",background:`linear-gradient(90deg,${C.pink},${C.gold},${C.green})`,transition:"width .8s ease"}}/>
      </div>
    </div>

    <div style={{...card,background:`linear-gradient(135deg,${C.green}15,${C.blue}10)`,borderColor:`${C.green}44`}}>
      <div style={{fontSize:11,color:C.green,fontWeight:800,letterSpacing:.5,marginBottom:10}}>🔥 Total Deficit สัปดาห์นี้</div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-end",marginBottom:12}}>
        <div>
          <div style={{fontSize:32,fontWeight:900,color:totalDef>0?C.green:C.pink,lineHeight:1}}>{totalDef>0?"+":""}{totalDef.toLocaleString()}</div>
          <div style={{fontSize:10,color:C.muted,fontWeight:700}}>{daysLog}/7 วันที่บันทึก Garmin</div>
        </div>
        <div style={{textAlign:"right"}}>
          <div style={{fontSize:20,fontWeight:900,color:C.gold}}>{fatG}<span style={{fontSize:11,color:C.muted}}> g</span></div>
          <div style={{fontSize:9,color:C.faint,fontWeight:700}}>ไขมันที่เผา (ประมาณ)</div>
        </div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:4}}>
        {weeklyData.map((d,i)=>{
          const pct=d.deficit!==null?Math.max(0,Math.min(100,(d.deficit/800)*100)):0;
          const isT=d.date===TODAY;
          return <div key={i} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:2}}>
            <div style={{width:"100%",height:36,background:C.bg2,borderRadius:5,overflow:"hidden",display:"flex",alignItems:"flex-end"}}>
              <div style={{width:"100%",height:`${pct}%`,minHeight:d.deficit!==null?2:0,background:d.deficit>400?C.green:d.deficit>0?C.gold:C.faint,borderRadius:4,transition:"height .5s"}}/>
            </div>
            <div style={{fontSize:8,color:isT?C.cream:C.faint,fontWeight:isT?900:600}}>{d.date.slice(8)}</div>
            {d.deficit!==null&&<div style={{fontSize:7.5,color:d.deficit>0?C.green:C.pink,fontWeight:800}}>{d.deficit>0?"+":""}{d.deficit}</div>}
          </div>;
        })}
      </div>
      {daysLog===0&&<div style={{fontSize:11,color:C.faint,textAlign:"center",marginTop:8}}>กรอก Garmin kcal ในหน้าอาหาร 👆</div>}
    </div>

    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:12}}>
      {[["🏃 วิ่งรวม",`${totalKm.toFixed(1)} กม.`,C.blue],["บันทึกวิ่ง",`${allRuns.length} ครั้ง`,C.green]].map(([l,v,c])=>(
        <div key={l} style={{background:C.card,borderRadius:14,padding:"12px 10px",textAlign:"center",border:`1px solid ${C.border}`}}>
          <div style={{fontSize:16,fontWeight:900,color:c}}>{v}</div>
          <div style={{fontSize:9.5,color:C.faint,fontWeight:700,marginTop:2}}>{l}</div>
        </div>
      ))}
    </div>

    {sorted.length>=2&&<div style={card}><span style={lbl}>📈 กราฟน้ำหนัก</span><WChart data={sorted}/></div>}

    {recent7.length>0&&<div style={card}><span style={lbl}>7 วันล่าสุด</span>
      {recent7.slice().reverse().map((w,i)=>(
        <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"7px 0",borderBottom:`1px solid ${C.border}`}}>
          <div style={{fontSize:12,color:C.muted,fontWeight:700}}>{w.date}</div>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <div style={{fontSize:14,fontWeight:900,color:C.cream}}>{w.weight} กก.</div>
            <button onClick={()=>setWeightHistory(p=>p.filter(x=>x.date!==w.date))} style={{background:"transparent",border:"none",color:C.pink,cursor:"pointer",fontSize:13,padding:"2px 5px"}}>×</button>
          </div>
        </div>
      ))}
    </div>}

    <div style={card}><span style={lbl}>🎯 Milestones</span>
      {WEIGHT_MILESTONES.map((m,i)=>{
        const reached=latestW<=m.weight;
        return <div key={i} style={{display:"flex",alignItems:"center",gap:10,padding:"9px 0",borderBottom:`1px solid ${C.border}`}}>
          <div style={{fontSize:18,opacity:reached?1:.3}}>{reached?"✅":"⭕"}</div>
          <div style={{flex:1}}>
            <div style={{fontSize:12,fontWeight:800,color:reached?C.green:C.cream}}>{m.label}</div>
            <div style={{fontSize:10,color:C.faint,fontWeight:600,marginTop:1}}>{m.date} · เป้า {m.weight} กก.</div>
          </div>
          {!reached&&<div style={{fontSize:11,fontWeight:800,color:C.muted}}>{(latestW-m.weight).toFixed(1)} กก.</div>}
        </div>;
      })}
    </div>
  </>;
}

function WChart({data}){
  const W=320,H=90,p=10,ws=data.map(d=>d.weight),mn=Math.min(...ws)-1,mx=Math.max(...ws)+1;
  const xs=i=>p+(i/(data.length-1))*(W-p*2);
  const ys=w=>p+((mx-w)/(mx-mn))*(H-p*2);
  const ln=data.map((d,i)=>`${xs(i)},${ys(d.weight)}`).join(" ");
  const gY=ys(65);
  return <svg viewBox={`0 0 ${W} ${H}`} style={{width:"100%"}}>
    <defs><linearGradient id="wg" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor={C.blue} stopOpacity=".3"/><stop offset="100%" stopColor={C.blue} stopOpacity="0"/></linearGradient></defs>
    <polygon points={`${xs(0)},${H-p} ${ln} ${xs(data.length-1)},${H-p}`} fill="url(#wg)"/>
    {gY>p&&gY<H-p&&<><line x1={p} x2={W-p} y1={gY} y2={gY} stroke={C.green} strokeWidth="1.5" strokeDasharray="5,4" opacity=".7"/>
    <text x={W-p} y={gY-4} fontSize="8" fill={C.green} textAnchor="end" fontWeight="700">65 กก.</text></>}
    <polyline points={ln} fill="none" stroke={C.blue} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round"/>
    {data.map((d,i)=><circle key={i} cx={xs(i)} cy={ys(d.weight)} r="3" fill={C.blue}/>)}
  </svg>;
}
