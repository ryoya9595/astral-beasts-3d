/* ============================================
   ASTRAL BEASTS 3D — demo story & boot
   範囲：ゲーム開始 〜 最初のどうじょう（守人ハルト）クリアまで
   ============================================ */
'use strict';

window.EVENTS={};

const L=(id)=>LOCS.find(l=>l.id===id);
const RIVAL_PICK={hinokobi:'upashio', hanamoru:'hinokobi', upashio:'hanamoru'};

function newState(){
  return {name:'', party:[], box:[], money:3000,
    items:{kizu:3}, badges:[], flags:{},
    map:'village', x:0, y:12,
    respawn:{map:'village', x:0, y:12}, starter:null};
}

// ---------- title ----------
function renderTitle(){
  uiOpen();
  const hasSave=!!loadSave();
  app.innerHTML=`<div id="title-screen">
    <div id="title-beast">${spriteSVG('astraleon')}</div>
    <div id="title-logo">アストラル<br>ビースト<span style="font-size:18px"> 3D</span></div>
    <div id="title-sub">〜 はじまりの章（デモ版） 〜</div>
    <div class="muted" style="font-size:11px">最初の守人に かつまで あそべるよ</div>
    <div style="height:8px"></div>
    ${hasSave?'<button class="btn" id="bt-continue">つづきから</button>':''}
    <button class="btn" id="bt-new">はじめから</button>
    <div class="muted press" style="margin-top:10px">- PRESS BUTTON -</div>
    <div class="muted" style="font-size:10px; margin-top:14px">BGM：フリー音楽素材 魔王魂</div>
  </div>`;
  if(hasSave) $id('bt-continue').onclick=()=>{
    BGM.unlock();
    G=loadSave(); beep(880,.08);
    uiClose(); World.load(G.map,G.x,G.y);
  };
  $id('bt-new').onclick=()=>{ BGM.unlock(); beep(880,.08); startNewGame(); };
}

async function startNewGame(){
  G=newState();
  app.innerHTML=`<div class="screen-pad" style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;">
    <div style="width:110px;height:110px">${spriteSVG('hotarupo')}</div>
  </div>`;
  await say(
    'やあ！ モンスターの せかいへ ようこそ！',
    'わたしは モリノ。モンスターはかせと よばれておる。',
    'まずは きみの なまえを おしえてくれんか？');
  app.innerHTML=`<div class="screen-pad" style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;gap:14px;">
    <div>きみの なまえは？</div>
    <input id="name-input" maxlength="8" placeholder="なまえ">
    <button class="btn" id="name-ok" style="width:240px;text-align:center">けってい</button>
  </div>`;
  await new Promise(res=>{
    $id('name-ok').onclick=()=>{
      const v=$id('name-input').value.trim();
      if(!v){ $id('name-input').placeholder='なまえを いれてね！'; return; }
      G.name=v.slice(0,8); beep(880,.08); res();
    };
  });
  await say(`${G.name}！ いい なまえじゃ！`,
    'きみは きょうから ビーストトレーナーとして 旅にでる。',
    'まずは ミドリバ村の けんきゅうじょ（みどりの やね）に きなさい。あいぼうを わたそう！',
    '（じゅうじキーか WASDで あるく／Aボタンか Zキーで はなしかける）');
  save();
  uiClose();
  World.load('village',0,12);
}

// ---------- professor / starter ----------
window.EVENTS.professor=async function(){
  if(G.flags.starterDone){
    await say('はかせ「おお ' + G.name + '！ 旅は どうじゃな？」',
      G.badges.length>0
        ?'はかせ「はじまりの聖印を とったのか！ たいしたもんじゃ！」'
        :'はかせ「きたの 1ばん街道を ぬけて コハルタウンの 守人ハルトに いどむのじゃ！」');
    return;
  }
  await say('はかせ「おお、' + G.name + '！ まっておったぞ！」',
    'はかせ「だいの うえに 3つの オーブが あるじゃろう。」',
    'はかせ「なかに ビーストが ねむっておる。すきな こを えらぶのじゃ！」');
  const picks=['hinokobi','hanamoru','upashio'];
  uiOpen();
  app.innerHTML=`<div class="screen-pad">
    <h1 class="screen-title">モリノ研究所</h1>
    <div>はかせ「すきな こを えらぶといい！」</div>
    <div class="starter-row">
      ${picks.map(p=>`<div class="starter-card" data-sp="${p}">
        ${spriteSVG(p)}<div>${typeChips(p)}</div><div class="nm">${DEX[p].n}</div>
      </div>`).join('')}
    </div>
    <div class="muted" style="margin-top:12px">タップして えらんでね</div>
  </div>`;
  const sp=await new Promise(res=>{
    let busy=false;
    app.querySelectorAll('.starter-card').forEach(c=>{
      c.onclick=async()=>{
        if(busy) return;
        busy=true;
        const s=c.dataset.sp;
        await say(`${DEX[s].n}（${TYPES[DEX[s].t[0]].n}タイプ）`, DEX[s].desc);
        const ok=await ask(`${DEX[s].n}に きめる？`,['はい！','ほかのこも みる']);
        busy=false;
        if(ok===0) res(s);
      };
    });
  });
  G.starter=sp;
  G.party=[mkMon(sp,5)];
  beep(1240,.2,'triangle',.07);
  await say(`${G.name}は ${DEX[sp].n}を あいぼうに えらんだ！`);
  const rsp=RIVAL_PICK[sp];
  G.flags.rivalInLab=true;
  World.refreshNpcs();
  await say('そのとき、けんきゅうじょの ドアが いきおいよく あいた！',
    'ソラ「おっす はかせ！ …って ' + G.name + '、おまえ もう えらんだのか！」',
    'ソラは きみの おさななじみで ライバルだ。',
    `ソラ「じゃあ おれは こいつだ！ ${DEX[rsp].n}、いくぜ！」`,
    'ソラ「なあ ' + G.name + '！ さっそく しょうぶしようぜ！」');
  const r=await battle({mons:[mkMon(rsp,5)], kind:'trainer',
    name:'ライバルの ソラ', money:500,
    pre:'いくぜ！ さいしょの しょうぶだ！',
    win:'うわー まけた！ でも つぎは まけないからな！'});
  healParty();
  if(r==='lose'){
    G.money=Math.max(500,G.money);
    await say('ソラ「へへっ、おれの かち！ でも おまえも わるくなかったぜ」');
  }
  await say('はかせが ビーストを かいふくしてくれた。');
  G.items.kizu=(G.items.kizu||0)+2;
  G.items.orb=(G.items.orb||0)+5;
  await say('はかせ「これを もっていきなさい。キズぐすり×2と キャプトオーブ×5じゃ」',
    'はかせ「やせいの ビーストは くさむらに かくれておる。オーブで なかまに できるぞ」',
    'ソラ「おれは さきに いくぜ！ また どこかで しょうぶだ！」');
  G.flags.rivalInLab=false;
  World.refreshNpcs();
  await say('ソラは いきおいよく かけだしていった。',
    'はかせ「むらの きたから 1ばん街道を ぬけて コハルタウンを めざすのじゃ！」');
  G.flags.starterDone=true;
  save();
  uiClose();
};

// ---------- rival in town ----------
window.EVENTS.rivalChat=async function(){
  if(G.badges.length>0){
    await say('ソラ「おっ、はじまりの聖印 とったのか！ やるじゃん！」',
      'ソラ「おまえとの ほんきの しょうぶは…2Dワールドばんの せかいで まってるぜ！」');
  }else{
    await say('ソラ「よう ' + G.name + '！ おそかったな！」',
      'ソラ「おれは もう 守人ハルトに かったぜ。この どうじょうだ」',
      'ソラ「おまえも ちょうせんしてみろよ！ みててやるからさ！」');
  }
};

// ---------- gym & demo clear ----------
window.EVENTS.gym=async function(town){
  const g=L(town).gym;
  if(G.badges.includes(g.badge)){
    await say(`${g.leader}「きみの 旅は まだまだ つづく。…せいしきばんの 2Dばんでな！ はっはっは！」`);
    return;
  }
  await say(`${g.leader}が しずかに たちあがった。`);
  const c=await ask(`${g.leader}に しょうぶを いどむ？`,['いどむ！','やめておく']);
  if(c!==0) return;
  const r=await trainerBattleData({n:g.leader, mons:g.mons, money:g.money, pre:g.pre, win:g.win});
  if(r==='lose'){ await handleLoss(); return; }
  if(r!=='win') return;
  G.badges.push(g.badge);
  beep(1320,.3,'triangle',.08);
  await say(`✨ ${g.badge}を てにいれた！`);
  save();
  await say('ハルト「みごとだ！ きみの 旅は はじまったばかり…」',
    'ハルト「…と いいたいところだが、3Dデモばんは ここで おしまい！」',
    'ハルト「あそんでくれて ありがとう！」');
  renderDemoClear();
};

function renderDemoClear(){
  uiOpen();
  app.innerHTML=`<div id="hof">
    <h1>デモクリア！</h1>
    <div class="muted">THANK YOU FOR PLAYING</div>
    <div style="height:10px"></div>
    <div class="hof-party">${G.party.map(m=>spriteSVG(m.sp)).join('')}</div>
    <div style="margin-top:8px">${G.party.map(m=>`${DEX[m.sp].n} Lv${m.lv}`).join(' ／ ')}</div>
    <div style="height:14px"></div>
    <div>はじまりの聖印 ゲット！　${esc(G.name)}</div>
    <div class="muted" style="margin-top:16px; line-height:2">
      ぼうけんの つづき（守人8人・ヴォイド団・<br>でんせつ・リーグ・チャンピオン）は<br>
      2Dワールドばんで あそべるよ！<br><br>
      ASTRAL BEASTS 3D — DEMO
    </div>
    <div style="height:14px"></div>
    <button class="btn" id="hof-ok" style="width:220px;text-align:center">むらに もどって あそぶ</button>
  </div>`;
  $id('hof-ok').onclick=()=>{ beep(880,.08); uiClose(); };
}

// ---------- boot ----------
window.addEventListener('load',()=>{ renderTitle(); });
