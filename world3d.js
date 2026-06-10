/* ============================================
   ASTRAL BEASTS 3D — low-poly overworld engine
   (battle/dialog/menus are the DOM layer in battle.js)
   ============================================ */
import * as THREE from 'three';

// ---------- zone data ----------
const ZONES = {
  village: {
    name:'ミドリバ村', w:40, d:40, ground:0x7cb35e, sky:0xbfe3ff,
    spawn:{x:0,z:12},
    paths:[{x:0,z:0,w:3,d:40},{x:0,z:0,w:28,d:3}],
    buildings:[
      {x:-10,z:-9, w:7,d:6,h:3.4, roof:0x4db6ac, label:'モリノ研究所', door:{action:'lab'}, mark:'◎'},
      {x:10,z:-9, w:6,d:5,h:3, roof:0xe57373, label:'みんなの いえ', door:{action:'say', lines:['ドアには カギが かかっている。','（るすのようだ…）']}},
      {x:10,z:7, w:6,d:5,h:3, roof:0xf06292, label:'モンスターセンター', door:{action:'center'}, mark:'♥'},
    ],
    flowers:[[-6,8],[6,14],[-14,2],[15,-2],[-4,-14]],
    npcs:[
      {id:'mid_mom', x:-4,z:5, color:0xffcc80, type:'talk',
       lines:['そとの くさむらには やせいの ビーストがいるわ。','あいぼうが いれば あんしんね！']},
      {id:'mid_kid', x:4,z:1, color:0xa5d6a7, type:'talk',
       lines:['モリノはかせの けんきゅうじょは ひだりの たてものだよ！','みどりの やねが めじるし！']},
      {id:'gate', x:0,z:-16.6, color:0x90a4ae, type:'blocker',
       need:{flag:'starterDone'}, goneFlag:'village_gate',
       lockedLines:['まって！ あいぼうの ビーストも いないのに','くさむらに はいるのは きけんだよ！','モリノはかせの けんきゅうじょに いってごらん！'],
       openLines:['あいぼうが できたんだね！ 1ばん街道は このさき まっすぐだよ！']},
    ],
    fences:[{x:-11,z:-17.5,w:18,d:.5},{x:11,z:-17.5,w:18,d:.5}],
    exits:[{x:0,z:-19.3,w:4,d:1.6, to:'route1', tx:0, tz:31}],
    treeRing:true,
  },
  route1: {
    name:'1ばん街道', w:30, d:70, ground:0x79b558, sky:0xbfe3ff,
    spawn:{x:0,z:31},
    paths:[{x:0,z:0,w:3,d:70}],
    grass:[{x:-7,z:18,w:11,d:10},{x:7.5,z:2,w:10,d:9},{x:-6.5,z:-13,w:10,d:8},{x:6.5,z:-25,w:10,d:7}],
    enc:{locId:'route1', rate:.085},
    npcs:[
      {id:'r1_t0', x:4.5,z:12, color:0xef9a9a, type:'trainer', locId:'route1', ti:0, flag:'tr3d_r1_0'},
      {id:'r1_t1', x:-4.5,z:-6, color:0x90caf9, type:'trainer', locId:'route1', ti:1, flag:'tr3d_r1_1'},
      {id:'r1_sign', x:2.2,z:26, color:0xbcaaa4, type:'talk',
       lines:['「きた：コハルタウン　みなみ：ミドリバ村」','よこに ちいさく「くさむらに ちゅうい！」と かいてある。']},
    ],
    fences:[{x:-9,z:26,w:12,d:.5},{x:9,z:26,w:12,d:.5}],
    exits:[
      {x:0,z:33.8,w:4,d:1.8, to:'village', tx:0, tz:-15},
      {x:0,z:-33.8,w:4,d:1.8, to:'koharu', tx:0, tz:15},
    ],
    treeRing:true, scatterTrees:14,
  },
  koharu: {
    name:'コハルタウン', w:40, d:40, ground:0x84bd66, sky:0xcfe9ff,
    spawn:{x:0,z:15},
    paths:[{x:0,z:0,w:3,d:40},{x:0,z:2,w:30,d:3}],
    buildings:[
      {x:-11,z:-2, w:6,d:5,h:3, roof:0xf06292, label:'モンスターセンター', door:{action:'center'}, mark:'♥'},
      {x:11,z:-2, w:6,d:5,h:3, roof:0x64b5f6, label:'ショップ', door:{action:'shop'}, mark:'＄'},
      {x:0,z:-12, w:10,d:7,h:4.2, roof:0xffb74d, label:'守人ハルトの どうじょう', door:{action:'gym'}, mark:'◆'},
    ],
    flowers:[[-5,9],[5,9],[-15,-9],[15,-9]],
    npcs:[
      {id:'koh_old', x:6,z:6, color:0xbcaaa4, type:'talk',
       lines:['モンスターセンターでは ビーストを むりょうで かいふくしてくれるんじゃ。','どうじょうの 守人ハルトは ノーマルタイプの つかいてじゃよ。']},
      {id:'koh_wall', x:0,z:-17.2, color:0xffe082, type:'talk',
       lines:['この さきは 2ばん海岸道路…なんだけど、','3Dデモばんは ここまで！ つづきの ぼうけんは 2Dばんで あそんでね！','（はじまりの聖印 ゲットまで あそべるよ）']},
    ],
    fences:[{x:-11,z:-18,w:18,d:.5},{x:11,z:-18,w:18,d:.5}],
    exits:[{x:0,z:18.8,w:4,d:1.8, to:'route1', tx:0, tz:-31}],
    treeRing:true,
  },
  lab: {
    name:'モリノ研究所', indoor:true, w:16, d:13, ground:0xe8d8b0, sky:0x2a2444,
    spawn:{x:0,z:4},
    npcs:[
      {id:'prof', x:0,z:-3.5, color:0xe0e0e0, hair:0xdddddd, type:'story', event:'professor'},
    ],
    pedestals:[{x:-3,z:-4.5,c:0xff7043},{x:0,z:-5.2,c:0x66bb6a},{x:3,z:-4.5,c:0x42a5f5}],
    exits:[{x:0,z:5.9,w:3,d:1.2, to:'village', tx:-10, tz:-4.4}],
  },
  gym: {
    name:'ハルトの どうじょう', indoor:true, w:13, d:20, ground:0xd8c8a0, sky:0x2a2444,
    spawn:{x:0,z:8},
    carpet:{x:0,z:0,w:3,d:18,c:0xc0392b},
    npcs:[
      {id:'leader', x:0,z:-7.5, color:0xffd76a, type:'gymleader', gymTown:'koharu'},
    ],
    exits:[{x:0,z:9.4,w:3,d:1.2, to:'koharu', tx:0, tz:-7.2}],
  },
};

// ---------- engine ----------
const container=document.getElementById('world');
const renderer=new THREE.WebGLRenderer({antialias:true});
renderer.shadowMap.enabled=true;
renderer.shadowMap.type=THREE.PCFSoftShadowMap;
container.appendChild(renderer.domElement);

const camera=new THREE.PerspectiveCamera(46, 1, .1, 200);
let scene=null, zone=null, zoneId=null;
let player=null, playerParts=null;
let npcObjs=[]; let colliders=[]; let triggersDone=new Set();
let paused=true, held={x:0,z:0}, facing=0, clock=new THREE.Clock();
let grassDist=0;

function resize(){
  const w=container.clientWidth||320, h=container.clientHeight||320;
  renderer.setSize(w,h,false);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio,2));
  camera.aspect=w/h; camera.updateProjectionMatrix();
}
new ResizeObserver(resize).observe(container);

const M=(c)=>new THREE.MeshLambertMaterial({color:c});
function box(w,h,d,c,x,y,z,parent){
  const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),M(c));
  m.position.set(x,y,z); m.castShadow=true; m.receiveShadow=true;
  (parent||scene).add(m); return m;
}

// ---- chibi character ----
function makeChibi(opt={}){
  const g=new THREE.Group();
  const shirt=opt.color??0xe05a47, skin=0xffd9b3, hair=opt.hair??0x5a4632;
  const legL=box(.22,.45,.26,0x3a3160, -.16,.22,0, g);
  const legR=box(.22,.45,.26,0x3a3160, .16,.22,0, g);
  box(.7,.65,.5, shirt, 0,.78,0, g);
  box(.2,.4,.3, shirt, -.45,.85,0, g);
  box(.2,.4,.3, shirt, .45,.85,0, g);
  box(.62,.6,.58, skin, 0,1.45,0, g);
  box(.66,.22,.62, hair, 0,1.74,0, g);
  box(.66,.18,.2, hair, 0,1.6,-.24, g);
  if(opt.cap){
    box(.7,.16,.66, 0xd8344a, 0,1.84,0, g);
    box(.7,.1,.3, 0xd8344a, 0,1.8,.4, g);
  }
  // eyes
  const e1=box(.07,.1,.04,0x1a1530,-.14,1.48,.3,g);
  const e2=box(.07,.1,.04,0x1a1530,.14,1.48,.3,g);
  e1.castShadow=e2.castShadow=false;
  return {g, legL, legR};
}
function makeTree(scale=1){
  const g=new THREE.Group();
  const trunk=new THREE.Mesh(new THREE.CylinderGeometry(.22*scale,.3*scale,1.1*scale,6),M(0x7a5230));
  trunk.position.y=.55*scale; trunk.castShadow=true; g.add(trunk);
  const c1=new THREE.Mesh(new THREE.ConeGeometry(1.3*scale,1.8*scale,7),M(0x2e7d32));
  c1.position.y=1.8*scale; c1.castShadow=true; g.add(c1);
  const c2=new THREE.Mesh(new THREE.ConeGeometry(.95*scale,1.4*scale,7),M(0x388e3c));
  c2.position.y=2.8*scale; c2.castShadow=true; g.add(c2);
  return g;
}
function seeded(n){ let s=n*9301+49297; return ()=>{ s=(s*9301+49297)%233280; return s/233280; }; }

// ---- zone construction ----
function buildZone(id){
  zoneId=id; zone=ZONES[id];
  scene=new THREE.Scene();
  scene.background=new THREE.Color(zone.sky);
  if(!zone.indoor) scene.fog=new THREE.Fog(zone.sky, 28, 75);
  npcObjs=[]; colliders=[]; triggersDone=new Set(); grassDist=0;

  // lights
  scene.add(new THREE.HemisphereLight(0xffffff, 0x6a8a5a, zone.indoor?.9:1.0));
  const sun=new THREE.DirectionalLight(0xfff2cc, zone.indoor?.7:1.1);
  sun.position.set(14,24,10);
  sun.castShadow=true;
  sun.shadow.mapSize.set(1024,1024);
  const S=Math.max(zone.w,zone.d)/2+4;
  sun.shadow.camera.left=-S; sun.shadow.camera.right=S;
  sun.shadow.camera.top=S; sun.shadow.camera.bottom=-S;
  sun.shadow.camera.far=80;
  scene.add(sun);

  // ground
  const gr=new THREE.Mesh(new THREE.BoxGeometry(zone.w,1,zone.d), M(zone.ground));
  gr.position.y=-.5; gr.receiveShadow=true; scene.add(gr);
  (zone.paths||[]).forEach(p=>{
    const m=new THREE.Mesh(new THREE.BoxGeometry(p.w,.06,p.d),M(0xe3cd8a));
    m.position.set(p.x,.03,p.z); m.receiveShadow=true; scene.add(m);
  });
  if(zone.carpet){
    const c=zone.carpet;
    const m=new THREE.Mesh(new THREE.BoxGeometry(c.w,.06,c.d),M(c.c));
    m.position.set(c.x,.03,c.z); m.receiveShadow=true; scene.add(m);
  }
  // walls (indoor) / bounds
  if(zone.indoor){
    const wallC=0x6a5a8a, h=3;
    box(zone.w,h,.6,wallC, 0,h/2,-zone.d/2);
    box(zone.w,h,.6,wallC, 0,h/2, zone.d/2);
    box(.6,h,zone.d,wallC, -zone.w/2,h/2,0);
    box(.6,h,zone.d,wallC, zone.w/2,h/2,0);
  }
  // buildings
  (zone.buildings||[]).forEach(b=>{
    const g=new THREE.Group();
    const wall=box(b.w,b.h,b.d,0xf3e9d2, 0,b.h/2,0, g);
    const roof=new THREE.Mesh(new THREE.ConeGeometry(Math.max(b.w,b.d)*.78, b.h*.7, 4), M(b.roof));
    roof.position.y=b.h+b.h*.34; roof.rotation.y=Math.PI/4;
    roof.scale.set(b.w/Math.max(b.w,b.d),1,b.d/Math.max(b.w,b.d));
    roof.castShadow=true; g.add(roof);
    box(1.1,1.9,.3,0x6a4a2a, 0,.95,b.d/2+.05, g); // door
    box(1,1,.2,0x9ad0ff, -b.w/4,b.h*.55,b.d/2+.05, g); // windows
    box(1,1,.2,0x9ad0ff, b.w/4,b.h*.55,b.d/2+.05, g);
    g.position.set(b.x,0,b.z);
    scene.add(g);
    colliders.push({minx:b.x-b.w/2-.2,maxx:b.x+b.w/2+.2,minz:b.z-b.d/2-.2,maxz:b.z+b.d/2+.2});
    b._trigger={x:b.x, z:b.z+b.d/2+1.1, w:1.8, d:1.6};
  });
  // fences
  (zone.fences||[]).forEach(f=>{
    const m=box(f.w,1,.3,0xa8754a, f.x,.5,f.z);
    for(let i=0;i<Math.floor(f.w/2);i++) box(.18,1.2,.34,0x8a5a36, f.x-f.w/2+1+i*2,.6,f.z);
    colliders.push({minx:f.x-f.w/2,maxx:f.x+f.w/2,minz:f.z-.4,maxz:f.z+.4});
  });
  // trees
  const rnd=seeded(id.length*77+zone.w);
  if(zone.treeRing){
    for(let x=-zone.w/2+1.5;x<zone.w/2;x+=3.2){
      [[x,-zone.d/2+1.5],[x,zone.d/2-1.5]].forEach(([tx,tz])=>{
        if(Math.abs(tx)<2.6) return; // gaps for exits
        const t=makeTree(.9+rnd()*.5); t.position.set(tx+rnd()*.8-.4,0,tz); scene.add(t);
        colliders.push({minx:tx-.7,maxx:tx+.7,minz:tz-.7,maxz:tz+.7});
      });
    }
    for(let z=-zone.d/2+3;z<zone.d/2-2;z+=3.4){
      [[-zone.w/2+1.5,z],[zone.w/2-1.5,z]].forEach(([tx,tz])=>{
        const t=makeTree(.9+rnd()*.5); t.position.set(tx,0,tz+rnd()*.8-.4); scene.add(t);
        colliders.push({minx:tx-.7,maxx:tx+.7,minz:tz-.7,maxz:tz+.7});
      });
    }
  }
  for(let i=0;i<(zone.scatterTrees||0);i++){
    const tx=(rnd()*2-1)*(zone.w/2-4), tz=(rnd()*2-1)*(zone.d/2-6);
    if(Math.abs(tx)<3) continue;
    if((zone.grass||[]).some(g=>Math.abs(tx-g.x)<g.w/2+1&&Math.abs(tz-g.z)<g.d/2+1)) continue;
    const t=makeTree(.8+rnd()*.6); t.position.set(tx,0,tz); scene.add(t);
    colliders.push({minx:tx-.7,maxx:tx+.7,minz:tz-.7,maxz:tz+.7});
  }
  // tall grass (instanced tufts)
  (zone.grass||[]).forEach(gz=>{
    const count=Math.floor(gz.w*gz.d*1.4);
    const inst=new THREE.InstancedMesh(new THREE.ConeGeometry(.16,.75,5), M(0x4c8a35), count);
    const dummy=new THREE.Object3D();
    const r2=seeded(Math.floor(gz.x*7+gz.z*13+99));
    for(let i=0;i<count;i++){
      dummy.position.set(gz.x+(r2()*2-1)*gz.w/2, .37, gz.z+(r2()*2-1)*gz.d/2);
      dummy.rotation.y=r2()*6.28;
      dummy.updateMatrix();
      inst.setMatrixAt(i,dummy.matrix);
    }
    inst.castShadow=true;
    scene.add(inst);
  });
  // flowers
  (zone.flowers||[]).forEach(([fx,fz])=>{
    const f=new THREE.Mesh(new THREE.SphereGeometry(.16,6,5),M(0xff8aa0));
    f.position.set(fx,.3,fz); scene.add(f);
    const st=new THREE.Mesh(new THREE.CylinderGeometry(.04,.04,.3,4),M(0x4c8a35));
    st.position.set(fx,.15,fz); scene.add(st);
  });
  // pedestals (lab)
  (zone.pedestals||[]).forEach(p=>{
    box(.8,.8,.8,0xd8c49a, p.x,.4,p.z);
    const orb=new THREE.Mesh(new THREE.SphereGeometry(.28,10,8),
      new THREE.MeshLambertMaterial({color:p.c, emissive:p.c, emissiveIntensity:.45}));
    orb.position.set(p.x,1.1,p.z); scene.add(orb);
    colliders.push({minx:p.x-.5,maxx:p.x+.5,minz:p.z-.5,maxz:p.z+.5});
  });
  // npcs
  (zone.npcs||[]).forEach(n=>{
    if(n.goneFlag&&G.flags[n.goneFlag]) return;
    if(n.hideFlag&&G.flags[n.hideFlag]) return;
    const c=makeChibi({color:n.color, hair:n.hair});
    c.g.position.set(n.x,0,n.z);
    c.g.rotation.y=Math.PI; // face south (camera side)
    scene.add(c.g);
    npcObjs.push({n, obj:c.g});
    colliders.push({minx:n.x-.5,maxx:n.x+.5,minz:n.z-.5,maxz:n.z+.5, npcId:n.id});
  });
  // player
  playerParts=makeChibi({cap:true});
  player=playerParts.g;
  scene.add(player);
}

function removeNpc(id){
  const i=npcObjs.findIndex(o=>o.n.id===id);
  if(i>=0){ scene.remove(npcObjs[i].obj); npcObjs.splice(i,1); }
  colliders=colliders.filter(c=>c.npcId!==id);
}

function showZoneName(){
  const el=document.getElementById('zone-name');
  el.textContent=zone.name;
  el.classList.add('show');
  clearTimeout(el._t);
  el._t=setTimeout(()=>el.classList.remove('show'),2200);
}

function load(id,x,z){
  buildZone(id);
  G.map=id;
  G.x=(x!==undefined)?x:zone.spawn.x;
  G.y=(z!==undefined)?z:zone.spawn.z;
  player.position.set(G.x,0,G.y);
  facing=Math.PI;
  camera.position.set(G.x, 9, G.y+9);
  document.getElementById('world').classList.add('active');
  resize();
  showZoneName();
  save();
}

// ---------- gameplay ----------
function canInput(){
  return !paused && dlgbox.classList.contains('hidden')
    && !document.getElementById('app').classList.contains('active');
}
function collide(nx,nz){
  const r=.45;
  if(Math.abs(nx)>zone.w/2-1) return true;
  if(Math.abs(nz)>zone.d/2-1 && !(zone.exits||[]).some(e=>Math.abs(nx-e.x)<e.w/2)) return true;
  return colliders.some(c=>nx>c.minx-r&&nx<c.maxx+r&&nz>c.minz-r&&nz<c.maxz+r);
}
function rectHit(t,x,z){ return Math.abs(x-t.x)<t.w/2 && Math.abs(z-t.z)<t.d/2; }

async function flashBattle(){
  const f=document.getElementById('battle-flash');
  for(let i=0;i<3;i++){
    f.style.opacity=.9; await wait(70);
    f.style.opacity=0; await wait(70);
  }
}
async function triggerEncounter(){
  paused=true;
  await flashBattle();
  const loc=LOCS.find(l=>l.id===zone.enc.locId);
  const tbl=loc.wild.table, total=tbl.reduce((s,e)=>s+e[1],0);
  let r=Math.random()*total, sp=tbl[0][0];
  for(const [s,w] of tbl){ r-=w; if(r<=0){ sp=s; break; } }
  const lv=ri(loc.wild.lv[0],loc.wild.lv[1]);
  const res=await battle({mons:[mkMon(sp,lv)],kind:'wild',canCatch:true});
  if(res==='lose'){ await handleLoss(); return; }
  paused=false;
}

function needMet(need){
  if(!need) return true;
  if(need.badges!==undefined && G.badges.length<need.badges) return false;
  if(need.flag && !G.flags[need.flag]) return false;
  return true;
}
async function handleNPC(o){
  const n=o.n;
  paused=true;
  // face each other
  o.obj.lookAt(player.position.x,0,player.position.z);
  try{
    if(n.type==='talk'){ await say(...n.lines); }
    else if(n.type==='blocker'){
      if(!needMet(n.need)){ await say(...(n.lockedLines||['とおれないよ。'])); }
      else{
        await say(...(n.openLines||['とおっていいよ！']));
        G.flags[n.goneFlag]=true; removeNpc(n.id); save();
      }
    }
    else if(n.type==='trainer'){
      const d=LOCS.find(l=>l.id===n.locId).trainers[n.ti];
      if(G.flags[n.flag]){ await say(`${d.n}「${d.win||'つよいなあ…'}」`); }
      else{
        if(d.talk) await say(`${d.n}「${d.talk}」`);
        const r=await trainerBattleData(d);
        if(r==='lose'){ await handleLoss(); return; }
        if(r==='win'){ G.flags[n.flag]=true; save(); }
      }
    }
    else if(n.type==='gymleader'){ await window.EVENTS.gym(n.gymTown); }
    else if(n.type==='story'){ await window.EVENTS[n.event](n); }
  } finally {
    if(!document.getElementById('app').classList.contains('active')) paused=false;
  }
}
async function doorAction(b){
  paused=true;
  try{
    const a=b.door.action;
    if(a==='say'){ await say(...b.door.lines); }
    else if(a==='center'){
      await say('モンスターセンターへ ようこそ！','ビーストたちを おあずかりしますね。');
      healParty(); beep(990,.15,'triangle',.06);
      G.respawn={map:zoneId, x:b._trigger.x, y:b._trigger.z+1};
      save();
      await say('おまたせしました！ みんな げんきいっぱいです！');
    }
    else if(a==='shop'){ renderShop(()=>{ uiClose(); }); return; }
    else if(a==='lab'){ load('lab'); return; }
    else if(a==='gym'){ load('gym'); return; }
  } finally {
    if(!document.getElementById('app').classList.contains('active')) paused=false;
  }
}
async function interact(){
  if(!canInput()) return;
  // nearest npc in front-ish
  let best=null, bd=2.2;
  npcObjs.forEach(o=>{
    const dx=o.n.x-player.position.x, dz=o.n.z-player.position.z;
    const dist=Math.hypot(dx,dz);
    if(dist<bd){ best=o; bd=dist; }
  });
  if(best){ await handleNPC(best); }
}

// ---------- loop ----------
let lastTriggerKey=null;
function tick(){
  requestAnimationFrame(tick);
  const dt=Math.min(clock.getDelta(),.05);
  if(scene&&player){
    const moving=(held.x||held.z)&&canInput();
    if(moving){
      const len=Math.hypot(held.x,held.z)||1;
      const sp=5.2*dt;
      const dx=held.x/len*sp, dz=held.z/len*sp;
      let nx=player.position.x+dx, nz=player.position.z+dz;
      if(!collide(nx,player.position.z)) player.position.x=nx;
      if(!collide(player.position.x,nz)) player.position.z=nz;
      facing=Math.atan2(held.x,held.z);
      G.x=player.position.x; G.y=player.position.z;
      // grass encounters
      if(zone.enc&&(zone.grass||[]).some(g=>rectHit({x:g.x,z:g.z,w:g.w,d:g.d},G.x,G.y))){
        grassDist+=sp;
        if(grassDist>1.4){
          grassDist=0;
          if(Math.random()<zone.enc.rate){ triggerEncounter(); }
        }
      }
      // exits
      for(const e of (zone.exits||[])){
        if(rectHit(e,G.x,G.y)){ load(e.to,e.tx,e.tz); return; }
      }
      // door triggers
      for(const b of (zone.buildings||[])){
        const key=zoneId+b.label;
        if(b._trigger&&rectHit(b._trigger,G.x,G.y)){
          if(lastTriggerKey!==key){
            lastTriggerKey=key;
            player.position.z=b._trigger.z+1.2; G.y=player.position.z;
            doorAction(b);
          }
          break;
        } else if(lastTriggerKey===key) lastTriggerKey=null;
      }
    }
    // facing & walk anim
    const targetRot=facing;
    let dr=targetRot-player.rotation.y;
    while(dr>Math.PI)dr-=2*Math.PI; while(dr<-Math.PI)dr+=2*Math.PI;
    player.rotation.y+=dr*.3;
    const t=performance.now()/1000;
    const swing=moving?Math.sin(t*11)*.5:0;
    playerParts.legL.rotation.x=swing;
    playerParts.legR.rotation.x=-swing;
    // camera follow
    const camT=new THREE.Vector3(player.position.x, 12.5, player.position.z+12.5);
    camera.position.lerp(camT,.12);
    camera.lookAt(player.position.x, 1.1, player.position.z-1.5);
    renderer.render(scene,camera);
  }
}
tick();

// ---------- input ----------
const keys=new Set();
const DIRV={up:[0,-1],down:[0,1],left:[-1,0],right:[1,0]};
function updateHeld(){
  held={x:0,z:0};
  keys.forEach(d=>{ held.x+=DIRV[d][0]; held.z+=DIRV[d][1]; });
}
const KEYMAP={ArrowUp:'up',ArrowDown:'down',ArrowLeft:'left',ArrowRight:'right',w:'up',s:'down',a:'left',d:'right'};
document.addEventListener('keydown',e=>{
  if(KEYMAP[e.key]){ keys.add(KEYMAP[e.key]); updateHeld(); e.preventDefault(); }
  else if(e.key==='z'||e.key==='Enter'){
    if(window._dlgAdvance){ window._dlgAdvance(); } else interact();
    e.preventDefault();
  }
  else if(e.key==='x'||e.key==='Escape'){ openMenu(); }
});
document.addEventListener('keyup',e=>{
  if(KEYMAP[e.key]){ keys.delete(KEYMAP[e.key]); updateHeld(); }
});
document.querySelectorAll('#dpad .pk').forEach(b=>{
  const d=b.dataset.d;
  const down=(e)=>{ e.preventDefault(); keys.add(d); updateHeld(); };
  const up=(e)=>{ e.preventDefault(); keys.delete(d); updateHeld(); };
  b.addEventListener('touchstart',down,{passive:false});
  b.addEventListener('touchend',up); b.addEventListener('touchcancel',up);
  b.addEventListener('mousedown',down);
  b.addEventListener('mouseup',up); b.addEventListener('mouseleave',up);
});
document.getElementById('btn-a').addEventListener('click',()=>{
  if(window._dlgAdvance){ window._dlgAdvance(); } else interact();
});
document.getElementById('btn-menu').addEventListener('click',()=>openMenu());

async function openMenu(){
  if(!canInput()) return;
  paused=true;
  const c=await ask('メニュー',['モンスター','バッグ','セーブして つづける','とじる']);
  if(c===0){ renderParty(()=>{ uiClose(); }); return; }
  if(c===1){ await renderBag(()=>{ uiClose(); }); return; }
  if(c===2){ save(); await say('レポートに かきのこした！'); }
  paused=false;
}

window.World={
  load,
  pause(){ paused=true; },
  resume(){ paused=false; },
  interact,
  setHeld(d){ keys.clear(); if(d) keys.add(d); updateHeld(); },
  debug(){ return {paused, zoneId, pos:[G.x,G.y], canInput:canInput()}; },
};
