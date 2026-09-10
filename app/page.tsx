'use client';
import { createSpinProfile, spinProgress, createFoodSelector, stopFraction } from '@/lib/case-mechanics';
import { foods, type Food } from '@/lib/foods';
import { fridayFoods } from '@/lib/friday-foods';
import { useGlobalSpinCount } from '@/hooks/use-global-spin-count';
import { CaseAudio } from '@/lib/case-audio';
import { flushSync } from 'react-dom';
import { memo, useEffect, useMemo, useRef, useState } from 'react';
import { ArrowUpRight, AudioLines, Volume2, VolumeX, Sparkles, Star, Leaf } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';

// Neo tìm quán quanh 52 Lê Đại Hành, Hai Bà Trưng, Hà Nội (~1-2 km).
const SEARCH_ANCHOR_LABEL = '52 Lê Đại Hành, Hai Bà Trưng, Hà Nội';
const SEARCH_ANCHOR_LATLNG = '21.0169,105.8456';
const SEARCH_ANCHOR_ZOOM = '16z';
function findNearbyUrl(subject: string) {
 const phrase = `${subject} gần ${SEARCH_ANCHOR_LABEL}`;
 return `https://www.google.com/maps/search/${encodeURIComponent(phrase)}/@${SEARCH_ANCHOR_LATLNG},${SEARCH_ANCHOR_ZOOM}`;
}

// Two spin purposes. Everyday single-serve lunch, and a nicer Friday sit-down
// lunch (200k-400k / người) at real restaurants near 52 Lê Đại Hành — see
// lib/friday-foods.
const modes = {
 lunch: {
  title: 'Mở hòm ăn trưa', tab: 'Ăn trưa',
  budgetLabel: 'Mức chi thường ngày', unit: 'nghìn / bữa', meanUnit: 'bữa',
  presets: ['35', '50', '75', '100', '150'], fallback: 50, min: 30, max: 180,
 },
 friday: {
  title: 'Mở hòm ăn trưa thứ 6', tab: 'Ăn trưa thứ 6',
  budgetLabel: 'Mức chi mỗi người', unit: 'nghìn / người', meanUnit: 'người',
  presets: ['200', '250', '300', '350', '400'], fallback: 300, min: 200, max: 400,
 },
} as const;
type Mode = keyof typeof modes;


const tiers=['QUỐC DÂN','HIẾM','CỰC PHẨM','TỐI MẬT','★ ĐẶC BIỆT'];
const colors=['#4b69ff','#8847ff','#d32ce6','#eb4b4b','#e4ae39'];
function FoodImage({food}:{food:Food}){
 const common=food.image>=120,lunch=food.image>=72&&!common,expanded=food.image>=36;
 const index=common?(food.image-120)%12:lunch?(food.image-72)%12:expanded?(food.image-36)%12:food.image%4;
 const atlas=common?`food-common-${Math.floor((food.image-120)/12)}`:lunch?`food-lunch-${Math.floor((food.image-72)/12)}`:expanded?`food-expanded-${Math.floor((food.image-36)/12)}`:`food-hd-${Math.floor(food.image/4)}`;
 return <div role="img" aria-label={food.name} className="food-image" style={{clipPath:common?"inset(0 0 4% 0)":lunch?"inset(0 0 7% 0)":undefined,backgroundImage:`url(${basePath}/${atlas}.webp)`,backgroundSize:expanded?'400% 300%':'200% 200%',backgroundPosition:expanded?`${index%4/3*100}% ${(common?[0,50,100]:[0,46,92])[Math.floor(index/4)]}%`:`${index%2*100}% ${Math.floor(index/2)*100}%`}}/>
}
function MysteryArt(){return <div className="mystery-art" role="img" aria-label="Món bí ẩn hạng vàng">
 <div className="mystery-rays"/>
 <svg className="mystery-emblem" viewBox="0 0 240 150" aria-hidden="true">
  <path className="gold-orbit" d="M120 5 174 27 193 75 174 123 120 145 66 123 47 75 66 27Z"/>
  <path fill="#b27a16" d="m120 10 16 38 44-18-18 38 55 7-55 14 18 34-44-16-16 33-16-33-44 16 18-34-55-14 55-7-18-38 44 18Z"/>
  <path fill="#ffe59a" d="m120 18 13 41 38-21-23 35 49 2-49 10 23 31-38-18-13 34-13-34-38 18 23-31-49-10 49-2-23-35 38 21Z"/>
  <path fill="#372414" stroke="#eac366" strokeWidth="2" d="m120 34 35 20 0 42-35 20-35-20V54Z"/>
  <path fill="#fff3ba" d="M104 61c0-22 36-24 36-2 0 10-12 13-13 20v4h-13v-6c0-9 12-12 12-18 0-8-11-7-11 2zm10 28h13v13h-13z"/>
  <path fill="#fff5ce" d="m34 29 3 7 8 2-8 3-3 8-2-8-8-3 8-2zm164 66 3 9 10 2-10 3-3 10-3-10-9-3 9-2zM186 19l3 3-3 3-3-3zM52 117l3 3-3 3-3-3z"/>
 </svg>
 <div className="mystery-sheen"/>
</div>}
function CaseTile(){return <div className="case-tile" role="img" aria-label="Hòm quà bí ẩn">
 <svg viewBox="0 0 160 160" aria-hidden="true">
  <defs><linearGradient id="crateBody" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#38434f"/><stop offset="1" stopColor="#1b232b"/></linearGradient></defs>
  <rect className="crate-glow" x="20" y="46" width="120" height="98" rx="7"/>
  <rect x="24" y="50" width="112" height="90" rx="5" fill="url(#crateBody)" stroke="#ffffff2e"/>
  <path d="M24 78h112" stroke="#ffffff22" strokeWidth="2"/>
  <path d="M24 66V56a6 6 0 0 1 6-6h9M136 66V56a6 6 0 0 0-6-6h-9M24 124v10a6 6 0 0 0 6 6h9M136 124v10a6 6 0 0 1-6 6h-9" fill="none" stroke="#cfe08b" strokeWidth="3"/>
  <rect x="70" y="50" width="20" height="90" fill="#d2f65b" opacity=".9"/>
  <rect x="24" y="81" width="112" height="18" fill="#d2f65b" opacity=".9"/>
  <path d="M80 68 101 89 80 110 59 89Z" fill="#1b2a10" stroke="#eaffa6" strokeWidth="2"/>
  <text x="80" y="99" textAnchor="middle" fontSize="28" fontWeight="800" fill="#d2f65b">?</text>
  <path d="M80 50c-7-13-27-12-25 1 1 8 17 6 25-1Zm0 0c7-13 27-12 25 1-1 8-17 6-25-1Z" fill="#d2f65b"/>
  <circle cx="80" cy="48" r="5" fill="#eaffa6"/>
 </svg>
 <span className="case-shine" aria-hidden="true"/>
</div>}
const Card=memo(function Card({food,small=false,slot,box=false,showVenue=false}:{food:Food;small?:boolean;slot?:number;box?:boolean;showVenue?:boolean}){const mystery=!small&&!box&&food.rarity===4;return <div className={`food-card ${small?'small':''} ${mystery?'mystery-card':''} ${box?'case-tile-card':''}`} data-slot-id={slot} data-food-id={food.image} style={{'--rarity':colors[food.rarity],...(slot===undefined?{}:{position:'absolute',left:slot*254})} as React.CSSProperties}><span className="tier">{tiers[food.rarity]}</span>{box?<CaseTile/>:mystery?<MysteryArt/>:<FoodImage food={food}/>}<div className="card-copy"><strong>{box?'HÒM BÍ ẨN':mystery?'★ MÓN BÍ ẨN':food.name}</strong><span>{showVenue?food.sub:small?`~${food.price}.000đ`:food.sub}</span></div></div>});

export default function Home(){
 const {count:globalSpins,enabled:counterEnabled,recordSpin}=useGlobalSpinCount();
 const [githubStars,setGithubStars]=useState<number|null>(null);
 const [mode,setMode]=useState<Mode>('lunch');
 const cfg=modes[mode];
 const pool=mode==='friday'?fridayFoods:foods;
 const [budget,setBudget]=useState('50'),[custom,setCustom]=useState('50'),[veg,setVeg]=useState(false),[sound,setSound]=useState(true),[spinning,setSpinning]=useState(false),[result,setResult]=useState<Food|null>(null),[revealed,setRevealed]=useState(false);
 const [reel,setReel]=useState(()=>foods.slice(0,12).map((food,id)=>({food,id}))),[moving,setMoving]=useState(false);
 const busy=useRef(false),viewport=useRef<HTMLDivElement>(null);
 useEffect(()=>{const context=(document as Document & {modelContext?:{registerTool:(tool:unknown,options:unknown)=>void}}).modelContext;if(!context)return;const lifecycle=new AbortController();const expose=(list:Food[])=>list.map(({name,price,veg})=>({name,approximatePriceVND:price*1000,vegetarian:!!veg}));try{context.registerTool({name:'list_lunch_items',description:'Read all everyday single-serve lunch options with approximate per-person prices and vegetarian status.',inputSchema:{type:'object',properties:{},additionalProperties:false},annotations:{readOnlyHint:true},execute:(input:unknown)=>{if(!input||typeof input!=='object'||Object.keys(input).length)throw new Error('Expected an empty object');return expose(foods)}},{signal:lifecycle.signal});context.registerTool({name:'list_friday_lunch_items',description:'Read the nicer Friday sit-down lunch options (200k-400k per person) at restaurants near 52 Lê Đại Hành, with the venue, approximate per-person price and vegetarian status.',inputSchema:{type:'object',properties:{},additionalProperties:false},annotations:{readOnlyHint:true},execute:(input:unknown)=>{if(!input||typeof input!=='object'||Object.keys(input).length)throw new Error('Expected an empty object');return fridayFoods.map(({name,sub,price,veg})=>({name,venue:sub,approximatePriceVND:price*1000,vegetarian:!!veg}))}},{signal:lifecycle.signal})}catch{}return ()=>lifecycle.abort()},[]);
 useEffect(()=>{let live=true;const key='truanayangi-github-stars';try{const cached=JSON.parse(localStorage.getItem(key)||'null');if(cached&&Number.isInteger(cached.count)&&Date.now()-cached.savedAt<900_000){setGithubStars(cached.count);return}}catch{}fetch('https://api.github.com/repos/vuducdung1308/truanayangi').then(response=>response.ok?response.json():Promise.reject()).then((data:unknown)=>{if(!data||typeof data!=='object'||!('stargazers_count' in data)||!Number.isInteger(data.stargazers_count))return;const count=data.stargazers_count as number;if(!live)return;setGithubStars(count);try{localStorage.setItem(key,JSON.stringify({count,savedAt:Date.now()}))}catch{}}).catch(()=>{});return()=>{live=false}},[]);
 const target=budget==='custom'?Number(custom):Number(budget);
 const validTarget=Number.isInteger(target)&&target>=cfg.min&&target<=cfg.max;
 const selector=useMemo(()=>{
  const prices=pool.map(f=>f.price),lo=Math.min(...prices),hi=Math.max(...prices);
  const wanted=validTarget?target:cfg.fallback;
  return createFoodSelector(pool,Math.min(hi,Math.max(lo,wanted)));
 },[pool,target,validTarget,cfg.fallback]);
 const eligible=useMemo(()=>pool.filter(f=>!veg||f.veg),[pool,veg]);
 const filteredMean=selector.meanFor(eligible);

 const audio=useRef<CaseAudio|null>(null);
 useEffect(()=>{
  const engine=new CaseAudio(basePath);audio.current=engine;engine.preload();
  const hide=()=>{if(document.hidden)engine.pause();else engine.recover()};
  document.addEventListener('visibilitychange',hide);
  return ()=>{document.removeEventListener('visibilitychange',hide);engine.dispose();audio.current=null};
 },[]);
 const [visibleStart,setVisibleStart]=useState(0);
 const inventoryCards=useMemo(()=>[...eligible].sort((a,b)=>a.rarity-b.rarity||a.price-b.price||a.name.localeCompare(b.name,'vi')).map(f=><Card food={f} small showVenue={mode==='friday'} key={f.name}/>),[eligible,mode]);

 const track=useRef<HTMLDivElement>(null);
 const position=useRef(-400);
 const frame=useRef(0);
 useEffect(()=>()=>{cancelAnimationFrame(frame.current)},[]);
 function switchMode(next:Mode){
  if(busy.current||spinning||next===mode)return;
  cancelAnimationFrame(frame.current);
  setMode(next);
  const fallback=String(modes[next].fallback);
  setBudget(fallback);setCustom(fallback);
  setResult(null);setRevealed(false);
  setReel((next==='friday'?fridayFoods:foods).slice(0,12).map((food,id)=>({food,id})));
  setVisibleStart(0);
  position.current=-400;
  if(track.current)track.current.style.transform='translate3d(-400px,0,0)';
 }
 function open(){
  if(busy.current||!validTarget||!eligible.length||!track.current||!viewport.current)return;
  audio.current?.unlock();
  busy.current=true;
  const winner=selector.choose(eligible);
  const spinId=crypto.randomUUID();
  const step=254,tileWidth=240,width=viewport.current.clientWidth;
  const start=position.current;
  const center=Math.floor((width/2-start)/step);
  const profile=createSpinProfile();
  const target=center+profile.tiles;
  const end=width/2-tileWidth*stopFraction()-target*step;
  // Keep visible cards at permanent world coordinates. Generate new cards
  // offscreen to the right; the track only travels left, without a reset.
  const rightEdge=Math.ceil((width-start)/step)+1;
  const items=reel.filter(item=>item.id>=center-Math.ceil(width/step)-2&&item.id<=rightEdge);
  const last=Math.max(...items.map(item=>item.id));
  const recent:Food[]=[];
  for(let id=last+1;id<=target+4;id++){
   const alternatives=eligible.filter(food=>!recent.includes(food));
   const food=id===target?winner:selector.choose(alternatives.length?alternatives:eligible);
   items.push({id,food});recent.push(food);if(recent.length>8)recent.shift();
  }
  flushSync(()=>{setReel(items);setSpinning(true);setMoving(true);setResult(null)});
  audio.current?.play('csgo_ui_crate_open');
  const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const duration=reduced?150:profile.durationMs;
  const started=performance.now();
  let renderedStart=visibleStart;
  let lastCell=Math.floor((start-width/2)/step);
  const animate=(now:number)=>{
   const progress=Math.max(0,Math.min(1,(now-started)/duration));
   const next=start+(end-start)*spinProgress(progress,profile.friction);
   position.current=next;
   // Only mount a viewport-sized strip, with 4 cards of overscan on either side.
   // Absolute slot coordinates and transform never reset when the window advances.
   const firstVisible=Math.max(0,Math.floor(-next/step));
   if(firstVisible-renderedStart>=4||firstVisible<renderedStart){renderedStart=Math.max(0,firstVisible-2);setVisibleStart(renderedStart)}
   if(track.current)track.current.style.transform=`translate3d(${next}px,0,0)`;
   // Tick when a card actually crosses the pointer, including on slow devices.
   const cell=Math.floor((next-width/2)/step);
   if(cell!==lastCell){audio.current?.play('csgo_ui_crate_item_scroll');lastCell=cell}
   if(progress<1){frame.current=requestAnimationFrame(animate);return}
   void recordSpin(spinId);
   busy.current=false;setSpinning(false);setMoving(false);setResult(winner);setRevealed(true);
   audio.current?.play((['item_reveal3_rare','item_reveal4_mythical','item_reveal5_legendary','item_reveal6_ancient','item_reveal6_ancient'] as const)[winner.rarity]);
  };
  frame.current=requestAnimationFrame(animate);
 }

 return <div className="site-shell">
 <header><a href={`${basePath}/`} className="brand">Trưa nay ăn gì 😞</a><div className="header-actions"><button className="sound-button" onClick={()=>{audio.current?.setMuted(sound);setSound(!sound)}} aria-label={sound?'Tắt âm thanh':'Bật âm thanh'}>{sound?<Volume2 size={18}/>:<VolumeX size={18}/>}<span>Âm thanh {sound?'bật':'tắt'}</span></button><a className="github-button" href="https://github.com/vuducdung1308/truanayangi" target="_blank" rel="noreferrer" aria-label={`Mở mã nguồn trên GitHub, ${githubStars??'chưa tải'} sao`}><svg className="github-mark" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 2C6.48 2 2 6.58 2 12.23c0 4.52 2.87 8.35 6.84 9.71.5.1.68-.22.68-.49v-1.91c-2.78.62-3.37-1.21-3.37-1.21-.45-1.18-1.11-1.49-1.11-1.49-.91-.64.07-.62.07-.62 1 .08 1.53 1.06 1.53 1.06.9 1.57 2.35 1.12 2.92.86.09-.66.35-1.12.64-1.37-2.22-.26-4.56-1.14-4.56-5.06 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.3.1-2.71 0 0 .84-.28 2.75 1.05A9.3 9.3 0 0 1 12 6.96a9.3 9.3 0 0 1 2.5.35c1.91-1.33 2.75-1.05 2.75-1.05.55 1.41.2 2.45.1 2.71.64.72 1.03 1.63 1.03 2.75 0 3.93-2.34 4.79-4.57 5.05.36.32.68.94.68 1.89v2.8c0 .27.18.59.69.49A10.25 10.25 0 0 0 22 12.23C22 6.58 17.52 2 12 2Z"/></svg><span className="github-label">GitHub</span><span className="github-stars"><Star size={13} fill="currentColor"/>{githubStars===null?'—':new Intl.NumberFormat('vi-VN').format(githubStars)}</span></a></div></header>
 <main><div className="mode-tabs" role="tablist" aria-label="Mục đích quay">{(Object.keys(modes) as Mode[]).map(m=><button key={m} role="tab" aria-selected={mode===m} className={`mode-tab ${mode===m?'active':''}`} disabled={spinning} onClick={()=>switchMode(m)}>{modes[m].tab}</button>)}</div>
 <div className="intro"><h1>{cfg.title}</h1></div>
 {counterEnabled&&<p className="global-counter" title="Tổng số lượt quay hoàn tất của mọi người, tính từ khi bật bộ đếm">Anh chị em đã mở <strong>{globalSpins===null?'—':new Intl.NumberFormat('vi-VN').format(globalSpins)}</strong> hòm</p>}
 <section className="case-panel" aria-label="Mở hòm món ăn">
 <div className={`reel-window ${moving?'is-spinning':''} `} ref={viewport}><div className="selector-line"/><div className="reel-track" ref={track}>{reel.filter(({id})=>id>=visibleStart&&id<visibleStart+12).map(({food,id})=><Card key={id} food={food} slot={id} box/>)}</div><div className="reel-fade left"/><div className="reel-fade right"/></div></section>
 <div className="control-bar"><div className="filters"><div className="budget"><label id="budget-label">{cfg.budgetLabel}</label><Select value={budget} onValueChange={v=>setBudget(v??String(cfg.fallback))} disabled={spinning}><SelectTrigger aria-labelledby="budget-label"><SelectValue>{budget==='custom'?'Tuỳ chỉnh':`${budget}.000đ`}</SelectValue></SelectTrigger><SelectContent>{cfg.presets.map(v=><SelectItem key={v} value={v}>{v}.000đ</SelectItem>)}<SelectItem value="custom">Tuỳ chỉnh</SelectItem></SelectContent></Select>{budget==='custom'&&<div className="custom-spend"><input aria-label="Mức chi tuỳ chỉnh (nghìn đồng)" aria-invalid={!validTarget} type="number" inputMode="numeric" min={cfg.min} max={cfg.max} step="1" value={custom} disabled={spinning} onChange={e=>setCustom(e.target.value)}/><span>{cfg.unit}</span></div>}{!validTarget&&<small className="spend-note" role="alert">Nhập từ {cfg.min} đến {cfg.max} nghìn.</small>}{veg&&validTarget&&<small className="spend-note">Pool chay: trung bình ~{Math.round(filteredMean)}.000đ / {cfg.meanUnit}</small>}</div><label className="veg"><Switch checked={veg} onCheckedChange={setVeg} disabled={spinning} aria-label="Chỉ ăn chay"/><span><Leaf size={15}/> Ăn chay</span></label></div><div className="open-wrap"><button className="open-button" disabled={spinning||!validTarget||!eligible.length} onClick={open}>{spinning?<AudioLines size={22}/>:<Sparkles size={21}/>} {spinning?'ĐANG MỞ HÒM…':result?'MỞ LẠI':'MỞ HÒM'} <span>↗</span></button></div></div>
 <Dialog open={revealed} onOpenChange={setRevealed}><DialogContent className="winner-dialog" showCloseButton={false}>{result&&<><span className="winner-label">VẬT PHẨM MỚI</span><DialogTitle className="winner-title">{result.name}</DialogTitle><DialogDescription className="winner-description">{mode==='friday'?`${result.sub} · `:'Giá tham khảo · '}~{result.price}.000đ / người</DialogDescription><div className="winner-art" style={{'--rarity':colors[result.rarity]} as React.CSSProperties}><FoodImage food={result}/></div><div className="winner-actions"><a className="find-button" href={findNearbyUrl(mode==='friday'?`${result.name} ${result.sub.replace(/\s*•\s*/g,' ')}`:result.name)} target="_blank" rel="noreferrer">TÌM QUÁN <ArrowUpRight size={16}/></a><button onClick={()=>setRevealed(false)}>TIẾP TỤC</button></div></>}</DialogContent></Dialog>

 <section className="inventory"><div className="section-heading"><div><span className="eyebrow">TRONG HÒM CÓ GÌ?</span><h2>Vật phẩm trong hòm <span>{eligible.length.toString().padStart(2,'0')}</span></h2></div><div className="rarity-legend">{tiers.map((t,i)=><span key={t}><i style={{background:colors[i]}}/>{t}</span>)}</div></div><div className="inventory-grid">{inventoryCards}</div></section>

 <footer><span>truanayangi.</span><span>Fan-made · SFX: Valve / <a href="https://github.com/sourcesounds/csgo" target="_blank" rel="noreferrer">SourceSounds</a></span></footer>
 </main></div>
}
