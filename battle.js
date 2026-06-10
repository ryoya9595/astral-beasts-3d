/* ============================================
   ASTRAL BEASTS WORLD — battle engine & UI screens
   (DOM layer; the overworld lives in world.js)
   ============================================ */
'use strict';

// ---------- helpers ----------
const $id=(s)=>document.getElementById(s);
const app=$id('app');
const ri=(a,b)=>a+Math.floor(Math.random()*(b-a+1));
const wait=(ms)=>new Promise(r=>setTimeout(r,ms));
const esc=(s)=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));

var G=null; // global game state (assigned in main.js)

let AC=null;
function beep(freq=520,dur=.06,type='square',vol=.04){
  try{
    AC=AC||new (window.AudioContext||window.webkitAudioContext)();
    const o=AC.createOscillator(),g=AC.createGain();
    o.type=type;o.frequency.value=freq;g.gain.value=vol;
    o.connect(g);g.connect(AC.destination);
    o.start();g.gain.exponentialRampToValueAtTime(.0001,AC.currentTime+dur);
    o.stop(AC.currentTime+dur+.02);
  }catch(e){}
}

// ---------- BGM (フリー音楽素材 魔王魂 https://maou.audio/) ----------
const BGM=(()=>{
  const SRC={village:'audio/village01.mp3', field:'audio/field05.mp3', battle:'audio/battle32.mp3'};
  const pool={}; let cur=null, zoneTrack='village', unlocked=false;
  function el(k){
    if(!pool[k]){ pool[k]=new Audio(SRC[k]); pool[k].loop=true; pool[k].volume=.35; pool[k].preload='auto'; }
    return pool[k];
  }
  return {
    unlock(){ // 初回のユーザー操作内で全トラックを解錠（iOS対策）
      if(unlocked) return; unlocked=true;
      Object.keys(SRC).forEach(k=>{
        const a=el(k); a.muted=true;
        a.play().then(()=>{ a.pause(); a.currentTime=0; a.muted=false; }).catch(()=>{ a.muted=false; });
      });
    },
    play(k){
      if(cur===k) return;
      if(cur&&pool[cur]) pool[cur].pause();
      cur=k;
      const a=el(k); a.currentTime=0;
      a.play().catch(()=>{});
    },
    zone(k){ zoneTrack=k||zoneTrack; this.play(zoneTrack); },
    toZone(){ this.play(zoneTrack); },
  };
})();

// ---------- ui layers ----------
function uiOpen(){ $id('app').classList.add('active'); $id('world').classList.remove('active'); if(typeof World!=='undefined') World.pause(); }
function uiClose(){ $id('app').classList.remove('active'); app.innerHTML=''; $id('world').classList.add('active'); if(typeof World!=='undefined') World.resume(); BGM.toZone(); }

// ---------- sprites (procedural SVG / グラデ・オーラ・つや目つき) ----------
function mixHex(hex,mixWith,t){
  const a=parseInt(hex.slice(1),16), b=parseInt(mixWith.slice(1),16);
  const ch=(sa,sb)=>Math.round(sa+(sb-sa)*t);
  const r=ch((a>>16)&255,(b>>16)&255), g=ch((a>>8)&255,(b>>8)&255), bl=ch(a&255,b&255);
  return '#'+((1<<24)+(r<<16)+(g<<8)+bl).toString(16).slice(1);
}
let _sprN=0;
function spriteSVG(spId, cls=''){
  const sp=DEX[spId].sprite;
  const {c1,c2,shape,acc}=sp, sz=sp.size||1;
  const id='sg'+(++_sprN);
  const hi=mixHex(c1,'#ffffff',.5), lo=mixHex(c2,'#000000',.12);
  const belly=mixHex(c1,'#ffffff',.62);
  const glowC={fire:'#ffb380',grass:'#b2e8a0',water:'#a8dcff',electric:'#fff2a8',earth:'#d8c0a8',wind:'#c2f2f8',light:'#fff5c0',dark:'#cdb8f0',legend:'#ffe9a8'}[acc]||mixHex(c1,'#ffffff',.5);
  const G=`url(#${id})`;
  const defs=`<defs>
    <radialGradient id="${id}" cx="38%" cy="30%" r="85%">
      <stop offset="0%" stop-color="${hi}"/>
      <stop offset="55%" stop-color="${c1}"/>
      <stop offset="100%" stop-color="${lo}"/>
    </radialGradient>
    <radialGradient id="${id}b" cx="50%" cy="45%" r="55%">
      <stop offset="0%" stop-color="${glowC}" stop-opacity=".5"/>
      <stop offset="100%" stop-color="${glowC}" stop-opacity="0"/>
    </radialGradient>
  </defs>`;
  const aura=`<circle cx="50" cy="52" r="45" fill="url(#${id}b)"/>`;
  const ground=`<ellipse cx="50" cy="91" rx="25" ry="5.5" fill="#000" opacity=".16"/>`;
  const eye=(x,y,r=5)=>`<ellipse cx="${x}" cy="${y}" rx="${r}" ry="${r*1.12}" fill="#fff"/>
    <ellipse cx="${x+.8}" cy="${y+.9}" rx="${r*.6}" ry="${r*.7}" fill="#2b2140"/>
    <circle cx="${x-1.3}" cy="${y-1.5}" r="${r*.3}" fill="#fff"/>
    <circle cx="${x+1.9}" cy="${y+2.2}" r="${r*.15}" fill="#fff" opacity=".85"/>`;
  const blush=(x,y)=>`<ellipse cx="${x}" cy="${y}" rx="3.4" ry="2.1" fill="#ff8aa0" opacity=".6"/>`;
  const smile=(x,y,w=9)=>`<path d="M${x-w/2} ${y} q${w/2} ${w*.62} ${w} 0" stroke="#2b2140" stroke-width="2" fill="none" stroke-linecap="round"/>`;
  let body='';
  if(shape==='round'){
    body=`<ellipse cx="50" cy="58" rx="29" ry="26" fill="${G}" stroke="${c2}" stroke-width="2.5"/>
      <ellipse cx="50" cy="66" rx="16" ry="12" fill="${belly}" opacity=".9"/>
      <ellipse cx="38" cy="82" rx="7" ry="4" fill="${c2}"/><ellipse cx="62" cy="82" rx="7" ry="4" fill="${c2}"/>
      ${eye(40,52)}${eye(60,52)}${blush(33,61)}${blush(67,61)}
      ${smile(50,62)}`;
  }else if(shape==='beast'){
    body=`<ellipse cx="52" cy="68" rx="24" ry="17" fill="${G}" stroke="${c2}" stroke-width="2.5"/>
      <ellipse cx="52" cy="74" rx="13" ry="9" fill="${belly}" opacity=".9"/>
      <path d="M74 66 q14 -4 12 -16" stroke="${c2}" stroke-width="5" fill="none" stroke-linecap="round"/>
      <circle cx="42" cy="42" r="18" fill="${G}" stroke="${c2}" stroke-width="2.5"/>
      <path d="M30 30 l-3 -13 l11 7 z" fill="${c2}"/><path d="M52 28 l5 -12 l4 13 z" fill="${c2}"/>
      <path d="M31 29 l-1 -7 l6 4 z" fill="${belly}" opacity=".7"/>
      <ellipse cx="38" cy="83" rx="6" ry="3.5" fill="${c2}"/><ellipse cx="60" cy="83" rx="6" ry="3.5" fill="${c2}"/>
      ${eye(36,40,4.6)}${eye(50,40,4.6)}${blush(30,48)}
      ${smile(43,49,7)}`;
  }else if(shape==='tall'){
    body=`<ellipse cx="50" cy="64" rx="21" ry="24" fill="${G}" stroke="${c2}" stroke-width="2.5"/>
      <circle cx="50" cy="31" r="16" fill="${G}" stroke="${c2}" stroke-width="2.5"/>
      <path d="M37 22 l-4 -11 l10 6 z" fill="${c2}"/><path d="M57 17 l10 -6 l-4 11 z" fill="${c2}"/>
      <ellipse cx="27" cy="62" rx="6" ry="11" fill="${G}" stroke="${c2}" stroke-width="2" transform="rotate(18 27 62)"/>
      <ellipse cx="73" cy="62" rx="6" ry="11" fill="${G}" stroke="${c2}" stroke-width="2" transform="rotate(-18 73 62)"/>
      <ellipse cx="40" cy="88" rx="7" ry="4" fill="${c2}"/><ellipse cx="60" cy="88" rx="7" ry="4" fill="${c2}"/>
      <ellipse cx="50" cy="66" rx="12" ry="15" fill="${belly}" opacity=".85"/>
      ${eye(44,29,4.6)}${eye(56,29,4.6)}
      ${smile(50,37,8)}`;
  }else if(shape==='bird'){
    body=`<ellipse cx="50" cy="60" rx="23" ry="19" fill="${G}" stroke="${c2}" stroke-width="2.5"/>
      <ellipse cx="48" cy="67" rx="12" ry="8" fill="${belly}" opacity=".9"/>
      <ellipse cx="64" cy="60" rx="10" ry="14" fill="${c2}" opacity=".85" transform="rotate(-20 64 60)"/>
      <path d="M62 50 q6 4 4 12" stroke="${mixHex(c2,'#ffffff',.4)}" stroke-width="2" fill="none" stroke-linecap="round" transform="rotate(-20 64 60)"/>
      <circle cx="42" cy="38" r="14" fill="${G}" stroke="${c2}" stroke-width="2.5"/>
      <path d="M28 38 l-9 4 l9 4 z" fill="#ffb300" stroke="#e65100" stroke-width="1.5"/>
      <path d="M70 72 l12 6 M70 76 l9 8" stroke="${c2}" stroke-width="3" stroke-linecap="round"/>
      <path d="M40 79 l0 6 m4 -6 l0 6" stroke="#ffb300" stroke-width="2.5" stroke-linecap="round"/>
      ${eye(40,36,4.8)}${blush(48,44)}`;
  }else if(shape==='bug'){
    body=`<ellipse cx="50" cy="64" rx="19" ry="15" fill="${G}" stroke="${c2}" stroke-width="2.5"/>
      <path d="M37 60 q-12 6 -8 14 M63 60 q12 6 8 14" stroke="${c2}" stroke-width="3" fill="none" stroke-linecap="round"/>
      <circle cx="50" cy="42" r="13" fill="${G}" stroke="${c2}" stroke-width="2.5"/>
      <path d="M43 31 q-4 -8 -10 -8 M57 31 q4 -8 10 -8" stroke="${c2}" stroke-width="2.5" fill="none" stroke-linecap="round"/>
      <circle cx="33" cy="23" r="3" fill="${c2}"/><circle cx="67" cy="23" r="3" fill="${c2}"/>
      <ellipse cx="32" cy="56" rx="9" ry="14" fill="#fff" opacity=".5" transform="rotate(20 32 56)"/>
      <ellipse cx="68" cy="56" rx="9" ry="14" fill="#fff" opacity=".5" transform="rotate(-20 68 56)"/>
      <ellipse cx="50" cy="69" rx="9" ry="6" fill="${belly}" opacity=".85"/>
      ${eye(45,41,4.4)}${eye(56,41,4.4)}
      ${smile(50,48,6)}`;
  }else if(shape==='rock'){
    body=`<path d="M50 22 L76 36 L82 62 L66 84 L34 84 L18 62 L24 36 Z" fill="${G}" stroke="${c2}" stroke-width="3" stroke-linejoin="round"/>
      <path d="M50 22 L76 36 L62 42 L38 38 Z" fill="${hi}" opacity=".45"/>
      <path d="M34 40 l8 -6 M62 36 l8 8 M28 64 l8 6" stroke="${c2}" stroke-width="2.5" stroke-linecap="round"/>
      ${eye(42,54,5.4)}${eye(60,54,5.4)}
      ${smile(51,66,9)}`;
  }else if(shape==='jelly'){
    body=`<path d="M22 60 a28 27 0 0 1 56 0 l0 4 l-56 0 z" fill="${G}" stroke="${c2}" stroke-width="2.5"/>
      <path d="M28 64 q-2 12 4 20 M42 64 q-1 14 2 22 M58 64 q1 14 -2 22 M72 64 q2 12 -4 20"
        stroke="${c1}" stroke-width="4.5" fill="none" stroke-linecap="round" opacity=".95"/>
      <ellipse cx="40" cy="42" rx="9" ry="11" fill="#fff" opacity=".45"/>
      <circle cx="58" cy="38" r="3" fill="#fff" opacity=".5"/>
      <circle cx="64" cy="46" r="2" fill="#fff" opacity=".4"/>
      ${eye(42,50)}${eye(60,50)}${blush(34,57)}${blush(68,57)}
      ${smile(51,59,8)}`;
  }else if(shape==='star'){
    body=`<path d="M50 16 L60 40 L86 42 L66 58 L73 84 L50 69 L27 84 L34 58 L14 42 L40 40 Z"
        fill="${G}" stroke="${c2}" stroke-width="2.5" stroke-linejoin="round"/>
      <path d="M50 16 L60 40 L50 44 L40 40 Z" fill="${hi}" opacity=".5"/>
      ${eye(43,49,4.8)}${eye(58,49,4.8)}${blush(36,57)}${blush(65,57)}
      ${smile(50,59,8)}`;
  }
  let accent='';
  const ax=50, ay=shape==='beast'?24:shape==='bird'?26:shape==='tall'?12:shape==='rock'?16:24;
  if(acc==='fire') accent=`<path d="M${ax} ${ay+8} q-7 -3 -4 -11 q2 4 5 4 q-1 -7 5 -10 q-1 6 3 8 q3 -2 3 -6 q5 8 -2 14 q-5 3 -10 1z" fill="#ffca28" stroke="#e65100" stroke-width="1.6"/><circle cx="${ax}" cy="${ay}" r="2" fill="#fff8d0" opacity=".9"/>`;
  if(acc==='grass') accent=`<path d="M${ax} ${ay+8} q-12 -4 -10 -14 q9 1 12 10 q2 -10 12 -12 q1 11 -10 16z" fill="#7cb342" stroke="#33691e" stroke-width="1.6"/><path d="M${ax-6} ${ay} q4 3 6 7" stroke="#33691e" stroke-width="1" fill="none" opacity=".6"/>`;
  if(acc==='water') accent=`<path d="M${ax} ${ay-4} q7 9 0 14 q-7 -5 0 -14z" fill="#81d4fa" stroke="#0277bd" stroke-width="1.6"/><circle cx="${ax-2}" cy="${ay+3}" r="1.4" fill="#fff" opacity=".9"/>`;
  if(acc==='electric') accent=`<path d="M${ax+2} ${ay-6} l-7 11 l5 1 l-4 9 l9 -12 l-5 -1 l4 -8z" fill="#ffeb3b" stroke="#f57f17" stroke-width="1.4"/>`;
  if(acc==='earth') accent=`<path d="M${ax-10} ${ay+8} l5 -9 l5 9z M${ax+1} ${ay+8} l5 -7 l5 7z" fill="#795548" stroke="#3e2723" stroke-width="1.4"/>`;
  if(acc==='wind') accent=`<path d="M${ax-10} ${ay+2} q10 -10 18 0 q-6 8 -12 3" fill="none" stroke="#b2ebf2" stroke-width="3" stroke-linecap="round"/>`;
  if(acc==='light') accent=`<path d="M${ax} ${ay-7} l2.5 6 l6.5 .8 l-5 4.4 l1.6 6.6 l-5.6 -3.6 l-5.6 3.6 l1.6 -6.6 l-5 -4.4 l6.5 -.8z" fill="#fff59d" stroke="#c08a00" stroke-width="1.4"/><circle cx="${ax+9}" cy="${ay-4}" r="1.5" fill="#fff" opacity=".9"/>`;
  if(acc==='dark') accent=`<path d="M${ax+4} ${ay-6} a8 8 0 1 0 6 13 a6.5 6.5 0 0 1 -6 -13z" fill="#d1c4e9" stroke="#311b92" stroke-width="1.4"/>`;
  if(acc==='legend') accent=`<ellipse cx="50" cy="50" rx="40" ry="14" fill="none" stroke="#ffd76a" stroke-width="2.5" opacity=".85" transform="rotate(-18 50 50)"/>
    <path d="M50 4 l2.5 6 l6.5 .8 l-5 4.4 l1.6 6.6 l-5.6 -3.6 l-5.6 3.6 l1.6 -6.6 l-5 -4.4 l6.5 -.8z" fill="#ffd76a" stroke="#c08a00" stroke-width="1.4"/>`;
  return `<svg class="mon-sprite ${cls}" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    ${defs}${aura}${ground}
    <g transform="translate(50,52) scale(${sz}) translate(-50,-52)">${body}${accent}</g></svg>`;
}
function typeChips(spId){
  return DEX[spId].t.map(t=>`<span class="type-chip" style="background:${TYPES[t].c}">${TYPES[t].n}</span>`).join('');
}

// ---------- monster instances ----------
const maxHP=(m)=>Math.floor(DEX[m.sp].b.hp*m.lv/25)+m.lv+12;
const atkOf=(m)=>Math.floor(DEX[m.sp].b.atk*m.lv/50)+5;
const defOf=(m)=>Math.floor(DEX[m.sp].b.def*m.lv/50)+5;
const spdOf=(m)=>Math.floor(DEX[m.sp].b.spd*m.lv/50)+5;
const expNext=(lv)=>5*lv*lv;
function movesAt(spId,lv){
  return DEX[spId].learn.filter(e=>e[0]<=lv).map(e=>e[1])
    .filter((v,i,a)=>a.indexOf(v)===i).slice(-4);
}
function mkMon(sp,lv){
  const m={sp,lv,exp:0,moves:movesAt(sp,lv)};
  m.hp=maxHP(m);
  return m;
}
function healParty(){ G.party.forEach(m=>{m.hp=maxHP(m);}); }
function firstAlive(){ return G.party.findIndex(m=>m.hp>0); }

// ---------- save ----------
const SAVE_KEY='astral_3d_save_v1';
function save(){ try{localStorage.setItem(SAVE_KEY,JSON.stringify(G));}catch(e){} }
function loadSave(){ try{const s=localStorage.getItem(SAVE_KEY); return s?JSON.parse(s):null;}catch(e){return null;} }

// ---------- dialog ----------
const dlgbox=$id('dlgbox'), dlgText=$id('dlg-text'), dlgChoices=$id('dlg-choices'), dlgArrow=$id('dlg-arrow');
function say(...lines){
  return new Promise(resolve=>{
    let i=0,typing=false,full='',timer=null;
    dlgbox.classList.remove('hidden');
    dlgChoices.innerHTML=''; dlgArrow.style.display='block';
    const typeLine=(text)=>{
      full=text;typing=true;dlgText.textContent='';
      let j=0;
      if(timer)clearInterval(timer);
      const t=setInterval(()=>{
        if(timer!==t){clearInterval(t);return;}
        if(!typing){clearInterval(t);dlgText.textContent=full;return;}
        dlgText.textContent=full.slice(0,++j);
        if(j>=full.length){typing=false;clearInterval(t);}
      },16);
      timer=t;
    };
    const next=()=>{
      if(i>=lines.length){dlgbox.classList.add('hidden');dlgbox.onclick=null;window._dlgAdvance=null;resolve();return;}
      beep(660,.03,'square',.02);
      typeLine(lines[i++]);
    };
    const adv=()=>{ if(typing){typing=false;} else next(); };
    dlgbox.onclick=adv;
    window._dlgAdvance=adv; // A button hooks here
    next();
  });
}
function choose(opts){
  return new Promise(resolve=>{
    dlgbox.classList.remove('hidden');
    dlgArrow.style.display='none';
    dlgChoices.innerHTML='';
    dlgbox.onclick=null; window._dlgAdvance=null;
    opts.forEach((o,i)=>{
      const b=document.createElement('button');
      b.textContent=o;
      b.onclick=(e)=>{e.stopPropagation();beep(880,.05);dlgChoices.innerHTML='';
        dlgbox.classList.add('hidden');resolve(i);};
      dlgChoices.appendChild(b);
    });
  });
}
async function ask(text,opts){
  dlgText.textContent=text;
  return await choose(opts);
}

// ---------- battle ----------
const battleState={};
function hpClass(r){return r<.25?'low':r<.55?'mid':'';}
function cardHTML(m,isAlly){
  const mx=maxHP(m),r=m.hp/mx;
  return `<div class="nm"><b>${esc(DEX[m.sp].n)}</b><span>Lv${m.lv}</span></div>
    <div>${typeChips(m.sp)}</div>
    <div class="hp-outer"><div class="hp-inner ${hpClass(r)}" style="width:${Math.max(0,r*100)}%"></div></div>
    ${isAlly?`<div class="hp-num">${Math.max(0,m.hp)} / ${mx}</div>
    <div class="exp-outer"><div class="exp-inner" style="width:${Math.min(100,m.exp/expNext(m.lv)*100)}%"></div></div>`:''}`;
}
function refreshCards(){
  const B=battleState;
  $id('e-card').innerHTML=cardHTML(B.enemy,false);
  $id('p-card').innerHTML=cardHTML(B.ally,true);
}
function setSprites(){
  const B=battleState;
  $id('e-spr').innerHTML=spriteSVG(B.enemy.sp,'enemy-sprite');
  $id('p-spr').innerHTML=spriteSVG(B.ally.sp,'ally-sprite');
}
function bmsg(text){
  return new Promise(resolve=>{
    const el=$id('battle-msg');
    $id('battle-cmds').innerHTML='';
    let j=0,typing=true;
    el.textContent='';
    const t=setInterval(()=>{
      if(!typing){clearInterval(t);el.textContent=text;return;}
      el.textContent=text.slice(0,++j);
      if(j>=text.length){typing=false;clearInterval(t);}
    },14);
    const ui=$id('battle-ui');
    const adv=()=>{ if(typing){typing=false;} else {ui.onclick=null;window._dlgAdvance=null;resolve();} };
    ui.onclick=adv;
    window._dlgAdvance=adv;
  });
}
function flash(id,ally){
  const sv=$id(id).querySelector('svg');
  if(!sv)return;
  sv.classList.add(ally?'ally-shake':'shake');
  setTimeout(()=>sv.classList.remove(ally?'ally-shake':'shake'),380);
}
function calcDmg(att,def,mv){
  let eff=1;
  DEX[def.sp].t.forEach(tt=>{const c=CHART[mv.t];eff*=(c&&tt in c)?c[tt]:1;});
  if(eff===0)return{dmg:0,eff:0,crit:false};
  const base=Math.floor((Math.floor(2*att.lv/5)+2)*mv.p*atkOf(att)/Math.max(1,defOf(def))/50)+2;
  const stab=DEX[att.sp].t.includes(mv.t)?1.5:1;
  const crit=Math.random()<1/16;
  const rand=.85+Math.random()*.15;
  return{dmg:Math.max(1,Math.floor(base*eff*stab*(crit?1.5:1)*rand)),eff,crit};
}
async function doAttack(att,def,mvId,attAlly){
  const mv=MOVES[mvId];
  await bmsg(`${DEX[att.sp].n}の ${mv.n}！`);
  if(Math.random()*100>mv.a){await bmsg('しかし はずれてしまった！');return;}
  const r=calcDmg(att,def,mv);
  if(r.eff===0){await bmsg('こうかが ない みたいだ…');return;}
  beep(attAlly?300:220,.08,'sawtooth',.05);
  flash(attAlly?'e-spr':'p-spr',!attAlly);
  def.hp=Math.max(0,def.hp-r.dmg);
  refreshCards();
  if(r.crit)await bmsg('きゅうしょに あたった！');
  if(r.eff>1)await bmsg('こうかは ばつぐんだ！');
  else if(r.eff<1)await bmsg('こうかは いまひとつの ようだ…');
}
function aiMove(en,target){
  const opts=en.moves.map(id=>{
    let eff=1;DEX[target.sp].t.forEach(tt=>{const c=CHART[MOVES[id].t];eff*=(c&&tt in c)?c[tt]:1;});
    return{id,w:MOVES[id].p*eff+1};
  });
  if(Math.random()<.3)return opts[ri(0,opts.length-1)].id;
  opts.sort((a,b)=>b.w-a.w);
  return opts[0].id;
}
async function gainExpFlow(mon,amt){
  mon.exp+=amt;
  await bmsg(`${DEX[mon.sp].n}は けいけんち ${amt}を もらった！`);
  while(mon.exp>=expNext(mon.lv)){
    mon.exp-=expNext(mon.lv);
    mon.lv++;
    mon.hp=Math.min(maxHP(mon),mon.hp+Math.floor(maxHP(mon)/12)+2);
    refreshCards();
    beep(990,.1,'square',.05);
    await bmsg(`${DEX[mon.sp].n}は レベル${mon.lv}に あがった！`);
    for(const [l,mid] of DEX[mon.sp].learn){
      if(l===mon.lv&&!mon.moves.includes(mid)){
        if(mon.moves.length<4){mon.moves.push(mid);await bmsg(`${DEX[mon.sp].n}は ${MOVES[mid].n}を おぼえた！`);}
        else{const old=mon.moves.shift();mon.moves.push(mid);
          await bmsg(`${DEX[mon.sp].n}は ${MOVES[old].n}を わすれて ${MOVES[mid].n}を おぼえた！`);}
      }
    }
    const ev=DEX[mon.sp].evo;
    if(ev&&mon.lv>=ev.lv){
      await bmsg(`おや…！？ ${DEX[mon.sp].n}の ようすが…！`);
      const oldN=DEX[mon.sp].n;
      mon.sp=ev.to;
      if(battleState.ally===mon)setSprites();
      refreshCards();
      beep(1240,.18,'triangle',.06);
      await bmsg(`${oldN}は ${DEX[mon.sp].n}に しんかした！`);
      for(const [l,mid] of DEX[mon.sp].learn){
        if(l<=mon.lv&&!mon.moves.includes(mid)&&mon.moves.length<4){mon.moves.push(mid);}
      }
    }
  }
}
function partyPickHTML(filter){
  return G.party.map((m,i)=>{
    const dis=filter(m,i);
    return `<button class="btn" data-i="${i}" ${dis?'disabled':''}>
      ${esc(DEX[m.sp].n)} Lv${m.lv}　HP ${Math.max(0,m.hp)}/${maxHP(m)} ${m.hp<=0?'（ひんし）':''}</button>`;
  }).join('');
}
function pickFromParty(filter,allowCancel=true){
  return new Promise(resolve=>{
    const c=$id('battle-cmds');
    c.innerHTML=partyPickHTML(filter)+(allowCancel?`<button class="btn small" data-i="-1">もどる</button>`:'');
    c.querySelectorAll('button').forEach(b=>{
      b.onclick=()=>{resolve(+b.dataset.i);};
    });
  });
}
function battleBagPick(){
  return new Promise(resolve=>{
    const c=$id('battle-cmds');
    const usable=Object.keys(G.items).filter(k=>G.items[k]>0&&
      (ITEMS[k].kind!=='orb'||battleState.canCatch));
    c.innerHTML=(usable.length?usable.map(k=>
      `<button class="btn" data-k="${k}">${ITEMS[k].n} ×${G.items[k]} <span class="muted">${ITEMS[k].desc}</span></button>`).join('')
      :`<div style="padding:6px">つかえる どうぐが ない…</div>`)
      +`<button class="btn small" data-k="">もどる</button>`;
    c.querySelectorAll('button').forEach(b=>{
      b.onclick=()=>resolve(b.dataset.k||null);
    });
  });
}
async function tryCatch(orbKey){
  const B=battleState,en=B.enemy;
  G.items[orbKey]--;
  await bmsg(`${G.name}は ${ITEMS[orbKey].n}を なげた！`);
  const M=maxHP(en);
  const rate=Math.min(.95,((3*M-2*en.hp)/(3*M))*(DEX[en.sp].catch/255)*ITEMS[orbKey].rate);
  let shakes=0;
  for(let i=0;i<3;i++){
    await wait(450);beep(420,.05);
    await bmsg('…ゆれている…');
    if(Math.random()>Math.pow(rate,1/3))break;
    shakes++;
  }
  if(shakes>=3){
    beep(1180,.25,'triangle',.07);
    await bmsg(`やった！ ${DEX[en.sp].n}を つかまえた！`);
    const caught={sp:en.sp,lv:en.lv,exp:0,hp:en.hp,moves:[...en.moves]};
    if(G.party.length<6){G.party.push(caught);await bmsg(`${DEX[en.sp].n}は てもちに くわわった！`);}
    else{G.box.push(caught);await bmsg(`てもちが いっぱいなので ボックスに おくられた！`);}
    return true;
  }
  await bmsg('ああっ！ でてきてしまった！');
  return false;
}

async function battle(cfg){
  uiOpen();
  BGM.play('battle');
  const B=battleState;
  B.enemyParty=cfg.mons;B.ei=0;
  B.enemy=cfg.mons[0];
  B.pi=firstAlive();B.ally=G.party[B.pi];
  B.canCatch=!!cfg.canCatch;
  app.innerHTML=`<div id="battle">
    <div class="battle-field">
      <div class="combatant enemy"><div class="info-card" id="e-card"></div><div id="e-spr"></div></div>
      <div class="combatant ally"><div id="p-spr"></div><div class="info-card" id="p-card"></div></div>
    </div>
    <div id="battle-ui"><div id="battle-msg"></div><div class="cmd-grid" id="battle-cmds"></div></div>
  </div>`;
  setSprites();refreshCards();
  if(cfg.kind==='trainer'){
    await bmsg(`${cfg.name}が しょうぶを しかけてきた！`);
    if(cfg.pre)await bmsg(`${cfg.name}「${cfg.pre}」`);
    await bmsg(`${cfg.name}は ${DEX[B.enemy.sp].n}を くりだした！`);
  }else if(cfg.legendary){
    await bmsg(`でんせつの せいじゅう ${DEX[B.enemy.sp].n}が めをさました！`);
  }else{
    await bmsg(`あっ！ やせいの ${DEX[B.enemy.sp].n}が とびだしてきた！`);
  }
  await bmsg(`ゆけっ！ ${DEX[B.ally.sp].n}！`);

  while(true){
    const cmd=await new Promise(resolve=>{
      const c=$id('battle-cmds');
      $id('battle-msg').textContent=`${DEX[B.ally.sp].n}は どうする？`;
      c.innerHTML=`
        <button class="btn" data-a="fight">たたかう</button>
        <button class="btn" data-a="bag">バッグ</button>
        <button class="btn" data-a="party">モンスター</button>
        <button class="btn" data-a="run" ${cfg.kind==='trainer'?'disabled':''}>にげる</button>`;
      c.querySelectorAll('button').forEach(b=>{
        b.onclick=async()=>{
          const a=b.dataset.a;
          if(a==='fight'){
            c.innerHTML=B.ally.moves.map(id=>{
              const mv=MOVES[id];
              return `<button class="btn move-btn" data-m="${id}"><span>${mv.n}</span>
                <span class="mv-meta">${TYPES[mv.t].n}/${mv.p}</span></button>`;
            }).join('')+`<button class="btn small" data-m="">もどる</button>`;
            c.querySelectorAll('button').forEach(mb=>{
              mb.onclick=()=>{if(!mb.dataset.m){resolve({redo:true});}else resolve({move:mb.dataset.m});};
            });
          }else if(a==='bag'){
            const k=await battleBagPick();
            if(!k){resolve({redo:true});return;}
            resolve({item:k});
          }else if(a==='party'){
            const i=await pickFromParty((m,i)=>m.hp<=0||i===B.pi);
            if(i<0){resolve({redo:true});return;}
            resolve({switch:i});
          }else if(a==='run'){
            resolve({run:true});
          }
        };
      });
    });
    if(cmd.redo)continue;

    let playerActed=false;
    if(cmd.run){
      const p=Math.max(.3,Math.min(.95,.55+(spdOf(B.ally)-spdOf(B.enemy))/100));
      if(Math.random()<p){await bmsg('うまく にげきれた！');uiClose();return 'run';}
      await bmsg('にげられなかった！');
      playerActed=true;
    }
    if(cmd.item){
      const it=ITEMS[cmd.item];
      if(it.kind==='orb'){
        if(cfg.kind==='trainer'){await bmsg('ひとの モンスターに なげるなんて とんでもない！');continue;}
        if(await tryCatch(cmd.item)){save();uiClose();return 'caught';}
        playerActed=true;
      }else if(it.kind==='heal'){
        const i=await pickFromParty(m=>m.hp<=0||m.hp>=maxHP(m));
        if(i<0)continue;
        const t=G.party[i];
        G.items[cmd.item]--;
        t.hp=Math.min(maxHP(t),t.hp+it.amt);
        refreshCards();beep(900,.1,'triangle',.05);
        await bmsg(`${DEX[t.sp].n}の HPが かいふくした！`);
        playerActed=true;
      }else if(it.kind==='revive'){
        const i=await pickFromParty(m=>m.hp>0);
        if(i<0)continue;
        const t=G.party[i];
        G.items[cmd.item]--;
        t.hp=Math.floor(maxHP(t)/2);
        refreshCards();beep(900,.1,'triangle',.05);
        await bmsg(`${DEX[t.sp].n}は げんきを とりもどした！`);
        playerActed=true;
      }
    }
    if(cmd.switch!==undefined){
      await bmsg(`もどれ！ ${DEX[B.ally.sp].n}！`);
      B.pi=cmd.switch;B.ally=G.party[B.pi];
      setSprites();refreshCards();
      await bmsg(`ゆけっ！ ${DEX[B.ally.sp].n}！`);
      playerActed=true;
    }

    const enMove=aiMove(B.enemy,B.ally);
    if(cmd.move){
      const pFirst=spdOf(B.ally)>=spdOf(B.enemy);
      const order=pFirst?['p','e']:['e','p'];
      for(const who of order){
        if(who==='p'){
          if(B.ally.hp<=0)continue;
          await doAttack(B.ally,B.enemy,cmd.move,true);
          if(B.enemy.hp<=0)break;
        }else{
          if(B.enemy.hp<=0)continue;
          await doAttack(B.enemy,B.ally,enMove,false);
          if(B.ally.hp<=0)break;
        }
      }
    }else if(playerActed){
      if(B.enemy.hp>0)await doAttack(B.enemy,B.ally,enMove,false);
    }

    if(B.enemy.hp<=0){
      const sv=$id('e-spr').querySelector('svg');if(sv)sv.classList.add('faint');
      beep(160,.25,'sawtooth',.06);
      await bmsg(`${cfg.kind==='trainer'?cfg.name+'の ':''}${DEX[B.enemy.sp].n}は たおれた！`);
      const exp=Math.floor(DEX[B.enemy.sp].exp*B.enemy.lv/5)+1;
      if(B.ally.hp>0)await gainExpFlow(B.ally,exp);
      B.ei++;
      if(B.ei<B.enemyParty.length){
        B.enemy=B.enemyParty[B.ei];
        await bmsg(`${cfg.name}は ${DEX[B.enemy.sp].n}を くりだした！`);
        setSprites();refreshCards();
        continue;
      }
      if(cfg.kind==='trainer'){
        await bmsg(`${cfg.name}との しょうぶに かった！`);
        if(cfg.win)await bmsg(`${cfg.name}「${cfg.win}」`);
        if(cfg.money){G.money+=cfg.money;await bmsg(`しょうきんとして ${cfg.money}ゴールドを てにいれた！`);}
      }
      save();
      uiClose();
      return 'win';
    }
    if(B.ally.hp<=0){
      const sv=$id('p-spr').querySelector('svg');if(sv)sv.classList.add('faint');
      beep(160,.25,'sawtooth',.06);
      await bmsg(`${DEX[B.ally.sp].n}は たおれた！`);
      if(firstAlive()<0){uiClose();return 'lose';}
      const i=await pickFromParty(m=>m.hp<=0,false);
      B.pi=i;B.ally=G.party[B.pi];
      setSprites();refreshCards();
      await bmsg(`ゆけっ！ ${DEX[B.ally.sp].n}！`);
    }
  }
}

async function handleLoss(){
  await say('めのまえが まっくらに なった…',
    `${G.name}は あわてて ひきかえした…`);
  G.money=Math.floor(G.money/2);
  healParty();
  G.map=G.respawn.map;G.x=G.respawn.x;G.y=G.respawn.y;G.dir='down';
  save();
  World.load(G.map,G.x,G.y);
}

async function trainerBattleData(t,opts={}){
  const mons=t.mons.map(([sp,lv])=>mkMon(sp,lv));
  return await battle({mons,kind:'trainer',name:t.n||t.leader,pre:t.pre,win:t.win,money:t.money,...opts});
}

// ---------- field menus (DOM overlays) ----------
function header(title){
  return `<h1 class="screen-title">${esc(title)}</h1>
  <div class="row" style="justify-content:space-between; margin-bottom:10px;">
    <span class="muted">${esc(G.name)}　<span class="gold">${G.money}G</span></span>
    <span class="badge-icons gold">${'◆'.repeat(G.badges.length)}<span class="muted">${'◇'.repeat(Math.max(0,8-G.badges.length))}</span></span>
  </div>`;
}
function renderParty(onBack){
  uiOpen();
  let html=`<div class="screen-pad">${header('てもちモンスター')}`;
  G.party.forEach((m,i)=>{
    const mx=maxHP(m),r=m.hp/mx;
    html+=`<div class="party-card ${m.hp<=0?'fainted':''}">
      <div class="sp">${spriteSVG(m.sp)}</div>
      <div class="info">
        <b>${DEX[m.sp].n}</b> Lv${m.lv}　${typeChips(m.sp)}
        <div class="hp-outer"><div class="hp-inner ${hpClass(r)}" style="width:${Math.max(0,r*100)}%"></div></div>
        <div class="muted">HP ${Math.max(0,m.hp)}/${mx}　こうげき${atkOf(m)} ぼうぎょ${defOf(m)} すばやさ${spdOf(m)}</div>
        <div class="muted">わざ：${m.moves.map(id=>MOVES[id].n).join('／')}</div>
      </div>
      ${i>0?`<button class="btn small" data-top="${i}">先頭に</button>`:''}
    </div>`;
  });
  html+=`<button class="btn" id="back">もどる</button></div>`;
  app.innerHTML=html;
  app.querySelectorAll('[data-top]').forEach(b=>{
    b.onclick=()=>{const i=+b.dataset.top;
      G.party.unshift(G.party.splice(i,1)[0]);save();renderParty(onBack);};
  });
  $id('back').onclick=onBack;
}
async function fieldBagUse(){
  return new Promise(resolve=>{
    let html=`<div class="screen-pad">${header('バッグ')}`;
    const keys=Object.keys(G.items).filter(k=>G.items[k]>0);
    if(!keys.length)html+=`<div class="muted">どうぐを なにも もっていない…</div>`;
    keys.forEach(k=>{
      const it=ITEMS[k];
      html+=`<div class="shop-row"><span>${it.n} ×${G.items[k]}<br><span class="muted">${it.desc}</span></span>
        ${it.kind!=='orb'?`<button class="btn small" data-use="${k}">つかう</button>`:'<span class="muted">せんとうよう</span>'}</div>`;
    });
    html+=`<div style="height:10px"></div><button class="btn" id="back">もどる</button></div>`;
    app.innerHTML=html;
    app.querySelectorAll('[data-use]').forEach(b=>{
      b.onclick=async()=>{
        const k=b.dataset.use,it=ITEMS[k];
        const valid=(m)=>it.kind==='heal'?(m.hp>0&&m.hp<maxHP(m)):m.hp<=0;
        const cands=G.party.map((m,i)=>({m,i})).filter(o=>valid(o.m));
        if(!cands.length){await say('つかえる あいてが いない！');return;}
        const pick=await choose([...cands.map(o=>`${DEX[o.m.sp].n} HP${Math.max(0,o.m.hp)}/${maxHP(o.m)}`),'やめる']);
        if(pick>=cands.length)return;
        const t=cands[pick].m;
        G.items[k]--;
        if(it.kind==='heal')t.hp=Math.min(maxHP(t),t.hp+it.amt);
        else t.hp=Math.floor(maxHP(t)/2);
        beep(900,.1,'triangle',.05);save();
        await say(`${DEX[t.sp].n}は げんきに なった！`);
        resolve(await fieldBagUse());
      };
    });
    $id('back').onclick=()=>resolve();
  });
}
async function renderBag(onBack){
  uiOpen();
  await fieldBagUse();
  onBack();
}
function renderShop(onBack){
  uiOpen();
  const stock=shopStock(G.badges.length);
  let html=`<div class="screen-pad">${header('ショップ')}
    <div class="muted" style="margin-bottom:8px">てんいん「いらっしゃいませ！」</div>`;
  stock.forEach(k=>{
    const it=ITEMS[k];
    html+=`<div class="shop-row">
      <span>${it.n}<br><span class="muted">${it.desc}</span></span>
      <span class="gold">${it.price}G</span>
      <button class="btn small" data-buy="${k}">かう</button></div>`;
  });
  html+=`<div style="height:10px"></div><button class="btn" id="back">おみせを でる</button></div>`;
  app.innerHTML=html;
  app.querySelectorAll('[data-buy]').forEach(b=>{
    b.onclick=async()=>{
      const k=b.dataset.buy,it=ITEMS[k];
      if(G.money<it.price){await say('おかねが たりない…！');return;}
      G.money-=it.price;
      G.items[k]=(G.items[k]||0)+1;
      beep(1100,.07);save();
      renderShop(onBack);
    };
  });
  $id('back').onclick=onBack;
}
function renderBox(onBack){
  uiOpen();
  let html=`<div class="screen-pad">${header('モンスターボックス')}
    <div class="muted" style="margin-bottom:8px">あずけている：${G.box.length}ひき</div>`;
  if(!G.box.length)html+=`<div class="muted">ボックスは からっぽだ。</div>`;
  G.box.forEach((m,i)=>{
    html+=`<div class="party-card">
      <div class="sp">${spriteSVG(m.sp)}</div>
      <div class="info"><b>${DEX[m.sp].n}</b> Lv${m.lv}　${typeChips(m.sp)}</div>
      <button class="btn small" data-take="${i}">${G.party.length<6?'てもちへ':'いれかえ'}</button>
    </div>`;
  });
  html+=`<button class="btn" id="back">もどる</button></div>`;
  app.innerHTML=html;
  app.querySelectorAll('[data-take]').forEach(b=>{
    b.onclick=async()=>{
      const i=+b.dataset.take,m=G.box[i];
      if(G.party.length<6){
        G.box.splice(i,1);G.party.push(m);
        await say(`${DEX[m.sp].n}を てもちに くわえた！`);
      }else{
        const pick=await choose([...G.party.map(p=>`${DEX[p.sp].n} Lv${p.lv}`),'やめる']);
        if(pick>=G.party.length)return renderBox(onBack);
        const out=G.party[pick];
        G.party[pick]=m;G.box[i]=out;
        await say(`${DEX[out.sp].n}と ${DEX[m.sp].n}を いれかえた！`);
      }
      save();renderBox(onBack);
    };
  });
  $id('back').onclick=onBack;
}
