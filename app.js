(() => {
  'use strict';
  const TOPICS = window.INTERVIEWOS_CURRICULUM || [];
  const DEEP = window.INTERVIEWOS_DEEP_DIVES || {};
  const STORE_KEY = 'interviewos-v1';
  const groups = ['JavaScript','React','Next.js','Web Platform','System Design','DSA'];
  const palette = {'JavaScript':'amber','React':'cyan','Next.js':'violet','Web Platform':'pink','System Design':'indigo','DSA':'emerald'};
  const initial = () => ({progress:{},notes:{},quiz:{},studyLog:[],daily:{enabled:false,time:'20:00',lastFired:''},reminders:[],activity:[]});
  let state = initial();
  let activeCategory = 'All topics';
  let searchValue = '';
  let toastTimer;
  let drawerOpen = false;
  const app = document.getElementById('app');

  const glyphs = {
    'dashboard':'<rect x="3" y="3" width="7" height="9" rx="1.5"/><rect x="14" y="3" width="7" height="5" rx="1.5"/><rect x="14" y="12" width="7" height="9" rx="1.5"/><rect x="3" y="16" width="7" height="5" rx="1.5"/>',
    'book':'<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z"/>',
    'chart':'<path d="M3 3v18h18"/><path d="m7 16 4-5 4 2 5-7"/>',
    'bell':'<path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"/><path d="M10 21h4"/>',
    'spark':'<path d="m12 3 1.8 6.2L20 11l-6.2 1.8L12 19l-1.8-6.2L4 11l6.2-1.8L12 3Z"/><path d="M19 19h3m-1.5-1.5v3"/>',
    'chevron':'<path d="m9 18 6-6-6-6"/>',
    'arrow':'<path d="M5 12h14m-6-6 6 6-6 6"/>',
    'left':'<path d="m15 18-6-6 6-6"/>',
    'search':'<circle cx="11" cy="11" r="7"/><path d="m16 16 5 5"/>',
    'clock':'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    'check':'<path d="m5 12 4 4L19 6"/>',
    'check-circle':'<circle cx="12" cy="12" r="9"/><path d="m8 12 3 3 5-6"/>',
    'circle':'<circle cx="12" cy="12" r="9"/>',
    'target':'<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>',
    'flame':'<path d="M12 22c4.5 0 7-3 7-7 0-3-2-5-3-6-.3 2-1.5 3-2.5 3C13 7 11 5 9 3c.5 5-4 7-4 12 0 4 2.5 7 7 7Z"/>',
    'bolt':'<path d="m13 2-9 12h7l-1 8 10-13h-7l0-7Z"/>',
    'code':'<path d="m8 17-5-5 5-5m8 0 5 5-5 5m-3-13-2 16"/>',
    'menu':'<path d="M4 7h16M4 12h16M4 17h16"/>',
    'close':'<path d="M6 6l12 12M18 6 6 18"/>',
    'calendar':'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 3v4m10-4v4M3 10h18"/>',
    'layers':'<rect x="3" y="3" width="18" height="18" rx="3"/><path d="M7 8h10M7 12h10M7 16h6"/>',
    'info':'<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/>',
    'download':'<path d="M12 3v12m-4-4 4 4 4-4M4 17v4h16v-4"/>',
    'upload':'<path d="M12 16V4m-4 4 4-4 4 4M4 17v4h16v-4"/>',
    'trash':'<path d="M3 6h18M8 6V4h8v2M6 6l1 15h10l1-15M10 10v7m4-7v7"/>',
    'repeat':'<path d="M17 2l4 4-4 4M3 11V8a2 2 0 0 1 2-2h16M7 22l-4-4 4-4m14-1v3a2 2 0 0 1-2 2H3"/>',
    'edit':'<path d="M12 20h9M16 4l4 4-11 11-4 1 1-4L17 5a2.1 2.1 0 0 1 3 3"/>',
    'puzzle':'<path d="M8 3H3v6a2 2 0 1 1 0 4v8h7v-4a2 2 0 1 1 4 0v4h7v-7h-4a2 2 0 1 1 0-4h4V3h-7a2 2 0 1 1-4 0H8Z"/>',
    'checklist':'<path d="m4 6 2 2 3-3M12 7h9m-17 6 2 2 3-3m3 1h9m-17 6 2 2 3-3m3 1h9"/>',
    'shield':'<path d="m12 2 9 4v6c0 5-4 8-9 10-5-2-9-5-9-10V6l9-4Z"/><path d="m8 12 3 3 5-5"/>',
    'sun':'<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2m10-10h-2M4 12H2m17-7-1.5 1.5M6.5 17.5 5 19m14 0-1.5-1.5M6.5 6.5 5 5"/>',
    'play':'<path d="m8 5 12 7-12 7V5Z"/>',
    'external':'<path d="M14 4h6v6m0-6-9 9M20 14v6H4V4h6"/>',
    'save':'<path d="M4 3h14l3 3v15H3V3h1Zm3 0v6h10V3M7 21v-8h10v8"/>',
    'trend':'<path d="M3 17l6-6 4 4 8-8m-7 0h7v7"/>'
  };
  function icon(name,size=19){return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${glyphs[name]||glyphs.circle}</svg>`;}
  function esc(v){return String(v == null ? '' : v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
  function read(){try{const saved=JSON.parse(localStorage.getItem(STORE_KEY)||'null');if(saved&&typeof saved==='object')state={...initial(),...saved,progress:saved.progress||{},notes:saved.notes||{},quiz:saved.quiz||{},studyLog:Array.isArray(saved.studyLog)?saved.studyLog:[],reminders:Array.isArray(saved.reminders)?saved.reminders:[],daily:{...initial().daily,...(saved.daily||{})}};}catch(e){console.warn('Could not read saved data',e);}}
  function save(){try{localStorage.setItem(STORE_KEY,JSON.stringify(state));}catch(e){console.warn('Storage unavailable',e);}}
  function localDate(d=new Date()){return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;}
  function fullDate(d=new Date()){return new Intl.DateTimeFormat('en-IN',{weekday:'long',day:'numeric',month:'long',year:'numeric'}).format(d);}
  function shortDate(s){return new Date(s+'T12:00:00').toLocaleDateString('en-IN',{day:'numeric',month:'short'});}
  function progressOf(id){return state.progress[id] || {status:'not-started',confidence:'',lastStudied:''};}
  function completeCount(){return TOPICS.filter(t=>progressOf(t.id).status==='completed').length;}
  function startedCount(){return TOPICS.filter(t=>progressOf(t.id).status==='in-progress').length;}
  function percent(n,of=TOPICS.length){return of ? Math.round(n/of*100) : 0;}
  function streak(){const days=new Set(state.studyLog.map(x=>x.day).filter(Boolean));let d=new Date();if(!days.has(localDate(d)))d.setDate(d.getDate()-1);let count=0;while(days.has(localDate(d))){count++;d.setDate(d.getDate()-1);}return count;}
  function recentActivity(){return [...(state.activity||[])].reverse().slice(0,5);}
  function nextLesson(){const recently=[...TOPICS].filter(t=>progressOf(t.id).status==='in-progress').sort((a,b)=>(progressOf(b.id).lastStudied||'').localeCompare(progressOf(a.id).lastStudied||''));return recently[0]||TOPICS.find(t=>progressOf(t.id).status!=='completed')||TOPICS[0];}
  function track(type,id,detail=''){const lesson=TOPICS.find(t=>t.id===id);state.activity=[...(state.activity||[]),{type,title:lesson?.title||'Study session',detail,at:new Date().toISOString()}].slice(-60);}
  function setTopicStatus(id,status){const prev=progressOf(id);state.progress[id]={...prev,status,lastStudied:new Date().toISOString()};state.studyLog.push({day:localDate(),topicId:id,at:new Date().toISOString()});if(state.studyLog.length>500)state.studyLog=state.studyLog.slice(-500);track('topic',id,status==='completed'?'Topic completed':'Study started');save();render();toast(status==='completed'?'Nice work — topic completed!':'Study session started');}
  function setConfidence(id,v){state.progress[id]={...progressOf(id),confidence:v,lastStudied:new Date().toISOString()};track('confidence',id,`Confidence: ${v}`);save();render();toast('Confidence updated');}
  function route(){const p=(location.hash||'#/dashboard').replace(/^#\/?/,'').split('/');return {page:p[0]||'dashboard',id:p[1]||''};}
  function go(path){drawerOpen=false;location.hash='#/'+path; if(route().page===path)render(); window.scrollTo({top:0,behavior:'instant'});}
  function navItem(slug,label,glyph,routePage){const current=route().page;const on=(current===slug)||(slug==='topics'&&current==='topic');return `<button class="nav-item ${on?'is-active':''}" data-go="${slug}" aria-current="${on?'page':'false'}">${icon(glyph,19)}<span>${label}</span>${on?'<span class="nav-active-dot"></span>':''}</button>`;}
  function shell(pageHtml, title, subtitle, page='dashboard'){
    const currentPage=route().page;
    app.innerHTML=`<div class="app-layout">
      <div class="mobile-scrim ${drawerOpen?'visible':''}" data-close-drawer></div>
      <aside class="sidebar ${drawerOpen?'open':''}">
        <div class="brand"><span class="brand-symbol">${icon('layers',22)}</span><span>interview<span class="brand-accent">OS</span><small>YOUR LEARNING WORKSPACE</small></span></div>
        <div class="sidebar-section-label">WORKSPACE</div>
        <nav class="nav-list" aria-label="Main navigation">
          ${navItem('dashboard','Dashboard','dashboard')}
          ${navItem('topics','Explore topics','book')}
          ${navItem('tracker','Progress tracker','chart')}
          ${navItem('reminders','Reminders','bell')}
        </nav>
        <div class="sidebar-section-label second-label">YOUR LEARNING PATH</div>
        <div class="category-links">${groups.map(g=>`<button data-category-link="${esc(g)}"><span class="category-bullet ${palette[g]}"></span><span>${esc(g)}</span><span class="mini-count">${TOPICS.filter(t=>t.category===g).length}</span></button>`).join('')}</div>
        <div class="sidebar-bottom">
          <div class="sidebar-promo"><span class="promo-icon">${icon('spark',18)}</span><strong>Small steps. Big progress.</strong><p>Learn one concept deeply, every day.</p><button data-go="topics">Continue learning ${icon('arrow',15)}</button></div>
          <div class="sidebar-footer">${icon('shield',14)} Your progress stays in this browser</div>
        </div>
      </aside>
      <div class="main-column">
        <header class="topbar"><button class="mobile-menu icon-button" data-menu aria-label="Open menu">${icon('menu',22)}</button><div class="crumb"><span>Workspace</span>${icon('chevron',14)}<b>${esc(title)}</b></div><div class="top-actions"><span class="top-date">${icon('calendar',16)} ${new Intl.DateTimeFormat('en-IN',{day:'numeric',month:'short',year:'numeric'}).format(new Date())}</span><button class="avatar" aria-label="Your personal workspace">YOU</button></div></header>
        <main id="main-content" class="content-area">${pageHtml}</main>
      </div>
      <div class="toast-container" id="toast-container" role="status" aria-live="polite"></div>
    </div>`;
    document.title=`${title} · InterviewOS`;
    if(currentPage==='topics')filterCards();
  }
  function sectionHeading(kicker,title,desc='',action=''){return `<div class="section-header"><div><div class="eyebrow">${esc(kicker)}</div><h2>${esc(title)}</h2>${desc?`<p class="section-description">${esc(desc)}</p>`:''}</div>${action}</div>`;}
  function topicIcon(category){return category==='JavaScript'?'JS':category==='React'?'⚛':category==='Next.js'?'N':category==='DSA'?'{}':category==='System Design'?'◇':'⌘';}
  function pillStatus(p){return p.status==='completed'?'<span class="status-pill completed">'+icon('check',13)+' Completed</span>':p.status==='in-progress'?'<span class="status-pill in-progress">In progress</span>':'<span class="status-pill not-started">Not started</span>';}
  function topicCard(t,compact=false){const p=progressOf(t.id);const klass=palette[t.category];return `<button class="topic-card ${compact?'compact':''}" data-go="topic/${t.id}" data-search="${esc((t.title+' '+t.summary+' '+t.category).toLowerCase())}" data-group="${esc(t.category)}">
      <div class="topic-card-top"><span class="topic-mark ${klass}">${topicIcon(t.category)}</span>${pillStatus(p)}</div><div class="topic-card-body"><div class="topic-card-category">${esc(t.category)} <span class="dot-sep">•</span> ${esc(t.level)}</div><h3>${esc(t.title)}</h3><p>${esc(t.summary)}</p>${DEEP[t.id]?`<span class="in-depth-label">${icon('book',14)} Full guide · ${DEEP[t.id].chapters.length} chapters · interactive diagram</span>`:''}</div><div class="topic-card-footer"><span>${icon('clock',15)} ${t.minutes} min read & practice</span><span class="card-arrow">${icon('arrow',17)}</span></div>
    </button>`;}
  function focusCard(t){return `<div class="focus-panel"><div class="focus-panel-content"><span class="focus-overline">${icon('spark',16)} RECOMMENDED NEXT</span><span class="focus-type">${esc(t.category)} · ${esc(t.level)}</span><h3>${esc(t.title)}</h3><p>${esc(t.summary)}</p><button class="btn btn-light" data-go="topic/${t.id}">${progressOf(t.id).status==='in-progress'?'Resume lesson':'Start learning'} ${icon('arrow',16)}</button></div><div class="focus-art" aria-hidden="true"><div class="orb orb-one"></div><div class="orb orb-two"></div><div class="focus-code"><span>function grow() {</span><span>&nbsp; learn();</span><span>&nbsp; practice();</span><span>&nbsp; repeat();</span><span>}</span><i></i></div></div></div>`;}
  function lastSevenDays(){const days=[];for(let i=6;i>=0;i--){const d=new Date();d.setDate(d.getDate()-i);days.push({day:localDate(d),label:new Intl.DateTimeFormat('en-IN',{weekday:'short'}).format(d).slice(0,2),count:state.studyLog.filter(v=>v.day===localDate(d)).length});}return days;}
  function weekBars(){const vals=lastSevenDays(),m=Math.max(2,...vals.map(v=>v.count));return `<div class="week-chart">${vals.map(v=>`<div class="week-col"><div class="week-bar-space"><div class="week-bar ${v.day===localDate()?'current':''} ${v.count?'has-data':''}" style="height:${Math.max(v.count?12:5,v.count/m*100)}%" title="${v.count} study events"></div></div><span>${v.label}</span></div>`).join('')}</div>`;}
  function dashboard(){const done=completeCount(),started=startedCount(),focus=nextLesson();const learningPercent=percent(done);const recent=recentActivity();const due=state.reminders.filter(r=>!r.done&&new Date(r.at).getTime()<=Date.now());return `<div class="page-intro"><div><div class="eyebrow">BUILD MOMENTUM, EVERY DAY</div><h1>Your growth starts here <span class="wave">✳</span></h1><p>${esc(fullDate())} <span class="intro-divider">·</span> One concept at a time, you're getting interview-ready.</p></div><button class="btn btn-outline export-desktop" data-export>${icon('download',17)} Export progress</button></div>
    <div class="stats-grid">
      <div class="stat-card"><div class="stat-icon purple">${icon('book',21)}</div><div class="stat-value">${TOPICS.length}</div><div class="stat-label">Total topics</div><div class="stat-foot">Across ${groups.length} learning paths</div></div>
      <div class="stat-card"><div class="stat-icon green">${icon('check-circle',21)}</div><div class="stat-value">${done}<span class="stat-fraction"> / ${TOPICS.length}</span></div><div class="stat-label">Topics completed</div><div class="stat-foot">${learningPercent}% of your roadmap</div></div>
      <div class="stat-card"><div class="stat-icon orange">${icon('flame',21)}</div><div class="stat-value">${streak()} <span class="stat-unit">days</span></div><div class="stat-label">Study streak</div><div class="stat-foot">Build consistency every day</div></div>
      <div class="stat-card"><div class="stat-icon blue">${icon('target',21)}</div><div class="stat-value">${started}</div><div class="stat-label">In progress</div><div class="stat-foot">Lessons you can resume</div></div>
    </div>
    ${focusCard(focus)}
    <section class="chat-guides panel" aria-label="JavaScript interview deep dives">
      <div class="chat-guides-heading"><div><div class="eyebrow">FROM YOUR JAVASCRIPT INTERVIEW PREPARATION</div><h2>Study the full explanations</h2><p>The detailed interview-style lessons: simple language, runnable code, dry runs, execution diagrams, questions and answers.</p></div><span class="guide-count">${Object.keys(DEEP).length} detailed guides</span></div>
      <div class="chat-guide-links">${TOPICS.filter(t=>DEEP[t.id]).map((t,i)=>`<button class="chat-guide-link" data-go="topic/${t.id}"><span class="guide-number">${String(i+1).padStart(2,'0')}</span><span>${esc(t.title)}</span>${icon('arrow',15)}</button>`).join('')}</div>
    </section>
    <div class="dashboard-two-col"><section class="panel activity-panel">${sectionHeading('MOMENTUM','Study activity','Your last seven days')} ${weekBars()}<div class="panel-foot">${icon('info',15)} Study actions recorded when you start or complete lessons.</div></section>
    <section class="panel progress-panel">${sectionHeading('AT A GLANCE','Your roadmap','','<button class="text-link" data-go="tracker">View tracker '+icon('arrow',15)+'</button>')}
      <div class="progress-ring-row"><div class="donut" style="--pct:${learningPercent}"><div><strong>${learningPercent}%</strong><span>complete</span></div></div><div class="ring-breakdown"><div><span class="legend-point green-dot"></span>Completed <strong>${done}</strong></div><div><span class="legend-point violet-dot"></span>In progress <strong>${started}</strong></div><div><span class="legend-point gray-dot"></span>Not started <strong>${TOPICS.length-done-started}</strong></div></div></div>
    </section></div>
    <div class="dashboard-lower"><section>${sectionHeading('BUILT FOR YOU','Explore the curriculum','In-depth explanations, real code, flow diagrams and interview questions','<button class="text-link" data-go="topics">All topics '+icon('arrow',15)+'</button>')}
      <div class="topics-grid dashboard-topics">${TOPICS.filter(t=>progressOf(t.id).status!=='completed').slice(0,3).map(t=>topicCard(t,true)).join('')}</div></section>
      <section class="panel reminder-mini"><div class="mini-header"><span class="stat-icon orange">${icon('bell',21)}</span><h3>Stay on track</h3></div><p>${due.length?`You have ${due.length} overdue reminder${due.length===1?'':'s'}.`:(state.daily.enabled?`Daily study reminder is set for ${esc(state.daily.time)}.`:'Set a daily reminder and make studying a habit.')}</p><button class="btn btn-outline full-width" data-go="reminders">Manage reminders ${icon('arrow',16)}</button></section></div>`;}
  function topicsPage(){const completed=completeCount();return `<div class="page-intro"><div><div class="eyebrow">LEARNING LIBRARY</div><h1>Explore topics</h1><p>Clear concepts, visual flow diagrams, practical examples, and interview-ready answers.</p></div><div class="summary-chip">${icon('check-circle',16)} ${completed} / ${TOPICS.length} completed</div></div>
    <div class="library-highlight"><span>${icon('book',17)} <strong>${Object.keys(DEEP).length} full JavaScript interview deep dives</strong> with four chapters, code walkthroughs, common mistakes and practice questions. Open any JavaScript topic with a Full guide label.</span></div>
    <div class="search-toolbar"><label class="search-box">${icon('search',19)}<input id="topic-search" type="search" value="${esc(searchValue)}" placeholder="Search topics, concepts, or technologies..." autocomplete="off" aria-label="Search topics" /></label><span class="result-count" id="result-count">${TOPICS.length} topics</span></div>
    <div class="filter-row" role="group" aria-label="Filter topics">${['All topics',...groups].map(g=>`<button class="filter-pill ${activeCategory===g?'selected':''}" data-filter="${esc(g)}">${esc(g)}</button>`).join('')}</div>
    <div class="topics-grid all-topics" id="topics-list">${TOPICS.map(t=>topicCard(t)).join('')}</div><div class="empty-state" id="topic-empty" hidden>${icon('search',30)}<h3>No matching topics</h3><p>Try a different keyword or category.</p><button class="btn btn-primary" data-clear-search>Clear filters</button></div>`;}
  function filterCards(){const cards=document.querySelectorAll('.all-topics .topic-card');let n=0;cards.forEach(el=>{const valid=(!searchValue||el.dataset.search.includes(searchValue.toLowerCase()))&&(activeCategory==='All topics'||el.dataset.group===activeCategory);el.hidden=!valid;if(valid)n++;});const counter=document.getElementById('result-count');if(counter)counter.textContent=`${n} topic${n===1?'':'s'}`;const empty=document.getElementById('topic-empty');if(empty)empty.hidden=n!==0;}
  function diagram(flow){return `<div class="flow-diagram" role="img" aria-label="Step-by-step flow: ${esc(flow.join(', '))}">${flow.map((s,i)=>`${i?`<div class="flow-connector"><span></span>${icon('chevron',15)}</div>`:''}<div class="flow-node ${i===0?'first':i===flow.length-1?'last':''}"><small>${String(i+1).padStart(2,'0')}</small><strong>${esc(s)}</strong></div>`).join('')}</div>`;}

  function renderDeepDive(topicId){
    const deep=DEEP[topicId];
    if(!deep)return '';
    const chapterHtml=deep.chapters.map((ch,i)=>`<section class="deep-chapter" id="chapter-${i+1}">
      <h3>${esc(ch.heading)}</h3>
      ${ch.paragraphs.map(p=>`<p>${esc(p)}</p>`).join('')}
      ${ch.code?`<div class="deep-code-header"><span>EXAMPLE ${i+1}</span><button class="deep-copy" data-copy-deep="${esc(topicId)}" data-chapter="${i}">${icon('code',14)} Copy code</button></div><div class="deep-code"><pre><code>${esc(ch.code)}</code></pre></div>`:''}
      ${ch.steps?.length?`<div class="deep-run"><strong>${icon('play',15)} Dry run — follow every step</strong><ol>${ch.steps.map(st=>`<li>${esc(st)}</li>`).join('')}</ol></div>`:''}
    </section>`).join('');
    const vis=deep.visual;
    const frames=vis?.frames||[];
    const simulation=frames.length?`<div class="interactive-visual" data-visual="${esc(topicId)}"><div class="visual-head"><div><span class="block-kicker">INTERACTIVE FLOW</span><h3>${esc(vis.title)}</h3><p>Use Next to walk through the execution one step at a time.</p></div><span class="visual-page" data-visual-page>1 / ${frames.length}</span></div>
      <div class="visual-frames">${frames.map((f,i)=>`<div class="visual-frame" data-visual-frame="${i}" ${i?'hidden':''}><h4>${esc(f.caption)}</h4><p>${esc(f.detail)}</p><div class="visual-stack" aria-label="Execution state">${f.stack.map((name,j)=>`<div class="visual-stack-item ${j===f.stack.length-1?'active':''}"><span>${esc(name)}</span></div>`).join('')}</div></div>`).join('')}</div>
      <div class="visual-controls"><button type="button" data-visual-prev disabled>${icon('left',15)} Previous</button><div class="visual-dots">${frames.map((_,i)=>`<span class="visual-dot ${i===0?'current':''}" data-visual-dot="${i}"></span>`).join('')}</div><button type="button" data-visual-next>Next ${icon('arrow',15)}</button></div>
    </div>`:'';
    return `<section class="lesson-block deep-dive-block" id="extended">
      <div class="block-kicker">EXTENDED INTERVIEW GUIDE · ${deep.chapters.length} CHAPTERS</div>
      <h2>Detailed explanation with examples</h2>
      <p class="deep-intro">${esc(deep.intro)}</p><p class="deep-note">Rebuilt from the topics and teaching approach of your earlier interview-prep discussions; this is a structured guide, not an automatic word-for-word transcript.</p>
      <div class="deep-toc"><strong>IN THIS GUIDE</strong><ol>${deep.chapters.map((c,i)=>`<li><a href="#chapter-${i+1}" data-scroll="chapter-${i+1}">${esc(c.heading)}</a></li>`).join('')}</ol></div>
      ${simulation}
      ${chapterHtml}
      ${deep.pitfalls?.length?`<div class="deep-pitfalls"><h3>${icon('info',18)} Common interview mistakes</h3><ul>${deep.pitfalls.map(v=>`<li>${esc(v)}</li>`).join('')}</ul></div>`:''}
      ${deep.questions?.length?`<div class="deep-followups"><h3>Follow-up questions interviewers ask</h3>${deep.questions.map(item=>`<details><summary>${esc(item.q)}</summary><p>${esc(item.a)}</p></details>`).join('')}</div>`:''}
      ${deep.say?`<div class="deep-answer"><h3>${icon('target',19)} A polished 60-second interview answer</h3><p>${esc(deep.say)}</p></div>`:''}
    </section>`;
  }
  function handleVisualClick(button,direction){
    const wrapper=button.closest('[data-visual]'); if(!wrapper)return;
    const frames=Array.from(wrapper.querySelectorAll('[data-visual-frame]'));
    const current=frames.findIndex(frame=>!frame.hidden);
    const next=Math.max(0,Math.min(frames.length-1,current+direction));
    frames.forEach((frame,index)=>{frame.hidden=index!==next;});
    wrapper.querySelector('[data-visual-page]').textContent=`${next+1} / ${frames.length}`;
    wrapper.querySelector('[data-visual-prev]').disabled=next===0;
    wrapper.querySelector('[data-visual-next]').disabled=next===frames.length-1;
    wrapper.querySelectorAll('[data-visual-dot]').forEach((dot,index)=>dot.classList.toggle('current',index===next));
  }

  function lessonPage(t){const p=progressOf(t.id),idx=TOPICS.indexOf(t),prev=TOPICS[idx-1],next=TOPICS[idx+1],q=state.quiz[t.id];return `<div class="lesson-page"><div class="lesson-breadcrumb"><button data-go="topics">${icon('left',16)} All topics</button><span>/</span><span>${esc(t.category)}</span><span>/</span><strong>${esc(t.title)}</strong></div>
    <div class="lesson-heading"><div class="lesson-heading-main"><div class="lesson-tags"><span class="label-chip ${palette[t.category]}">${esc(t.category)}</span><span class="label-chip neutral">${esc(t.level)}</span><span class="muted-inline">${icon('clock',15)} ${t.minutes} min</span></div><h1>${esc(t.title)}</h1><p>${esc(t.summary)}</p></div><div class="lesson-quick-actions">${pillStatus(p)}<button class="btn ${p.status==='completed'?'btn-outline':'btn-primary'}" data-complete="${t.id}">${icon('check',17)} ${p.status==='completed'?'Mark as in progress':'Mark complete'}</button></div></div>
    <div class="lesson-layout"><article class="lesson-article">
      <section class="lesson-block" id="overview"><div class="block-kicker">THE BIG PICTURE</div><h2>Understand it simply</h2><p class="lead-copy">${esc(t.analogy)}</p><div class="concept-box"><div class="concept-header">${icon('spark',18)} Key things to remember</div><ul>${t.takeaways.map(x=>`<li>${icon('check-circle',17)}<span>${esc(x)}</span></li>`).join('')}</ul></div></section>
      <section class="lesson-block" id="flow"><div class="block-kicker">VISUAL LEARNING</div><h2>How it works — step by step</h2><p>Follow the sequence from the first action to the final outcome.</p>${diagram(t.flow)}</section>
      <section class="lesson-block" id="explanation"><div class="block-kicker">DEEP DIVE</div><h2>Let's break it down</h2>${t.sections.map(s=>`<div class="reading-section"><h3>${esc(s.heading)}</h3><p>${esc(s.body)}</p></div>`).join('')}</section>
      ${renderDeepDive(t.id)}
      <section class="lesson-block" id="example"><div class="block-kicker">HANDS-ON EXAMPLE</div><h2>See it in code</h2><div class="code-wrapper"><div class="code-topbar"><span><span class="code-light red"></span><span class="code-light yellow"></span><span class="code-light green"></span></span><span>JavaScript / JSX</span><button data-copy-code="${t.id}" aria-label="Copy code">${icon('code',15)} Copy</button></div><pre><code>${esc(t.code)}</code></pre></div><h3 class="walkthrough-heading">Dry run</h3><ol class="walkthrough">${t.walkthrough.map(s=>`<li>${esc(s)}</li>`).join('')}</ol></section>
      <section class="lesson-block" id="interview"><div class="block-kicker">INTERVIEW PRACTICE</div><h2>How to answer in an interview</h2><div class="interview-box"><div class="interview-question">${icon('target',19)} ${esc(t.interview.question)}</div><div class="interview-answer"><strong>Suggested answer</strong><p>${esc(t.interview.answer)}</p></div></div></section>
      <section class="lesson-block" id="quiz"><div class="block-kicker">KNOWLEDGE CHECK</div><h2>Quick question</h2><div class="quiz-card"><h3>${esc(t.quiz.question)}</h3><div class="quiz-options">${t.quiz.options.map((s,i)=>`<button class="quiz-option ${q!==undefined&&q!==null?(i===t.quiz.correct?'right':i===q?'wrong':''):''}" data-quiz="${t.id}" data-answer="${i}" ${q!==undefined&&q!==null?'disabled':''}><span>${String.fromCharCode(65+i)}</span>${esc(s)}</button>`).join('')}</div>${q!==undefined&&q!==null?`<div class="quiz-feedback ${q===t.quiz.correct?'correct':'incorrect'}"><strong>${q===t.quiz.correct?'Correct! Great job.':'Good try — review the answer.'}</strong><p>${esc(t.quiz.explanation)}</p><button data-retry-quiz="${t.id}">Try again ${icon('repeat',15)}</button></div>`:''}</div></section>
      <section class="lesson-block" id="notes"><div class="block-kicker">YOUR PERSONAL WORKSPACE</div><h2>My study notes</h2><p>Write insights and tricky points in your own words. Notes are saved automatically in this browser.</p><textarea class="note-editor" data-note="${t.id}" placeholder="What did you learn? What should you revise later?" rows="5">${esc(state.notes[t.id]||'')}</textarea><span class="note-hint">${icon('save',14)} Autosaved locally</span></section>
      <div class="lesson-end"><div><h3>How confident do you feel?</h3><p>This helps you identify what to revise.</p></div><div class="confidence-buttons">${[['low','Need practice'],['medium','Getting there'],['high','Confident']].map(([v,label])=>`<button class="confidence-btn ${p.confidence===v?'selected':''}" data-confidence="${t.id}" data-value="${v}">${label}</button>`).join('')}</div><button class="btn btn-primary lesson-complete" data-complete="${t.id}">${icon('check',18)} ${p.status==='completed'?'Reopen this topic':'Complete this topic'}</button></div>
      <div class="lesson-navigation">${prev?`<button data-go="topic/${prev.id}">${icon('left',16)} <span><small>PREVIOUS TOPIC</small><strong>${esc(prev.title)}</strong></span></button>`:'<span></span>'}${next?`<button data-go="topic/${next.id}"><span><small>NEXT TOPIC</small><strong>${esc(next.title)}</strong></span> ${icon('arrow',17)}</button>`:'<span></span>'}</div>
    </article><aside class="lesson-aside"><div class="toc-card"><strong>ON THIS PAGE</strong>${[['overview','Understand it simply'],['flow','Visual flow diagram'],['explanation','Core explanation'],...(DEEP[t.id]?[['extended','Full deep dive + simulation']]:[]),['example','Code + dry run'],['interview','Interview answer'],['quiz','Knowledge check'],['notes','My notes']].map(([anchor,label])=>`<a href="#${anchor}" data-scroll="${anchor}">${esc(label)}</a>`).join('')}</div><div class="tip-card">${icon('spark',20)}<strong>Interview tip</strong><p>Try explaining this topic out loud in under two minutes. Clear explanations matter as much as correct code.</p></div></aside></div></div>`;}
  function trackerPage(){const done=completeCount(),started=startedCount();return `<div class="page-intro"><div><div class="eyebrow">PROGRESS & REFLECTION</div><h1>Progress tracker</h1><p>See what you've learned, what needs work, and where to focus next.</p></div><button class="btn btn-outline" data-export>${icon('download',17)} Export data</button></div>
    <div class="tracker-summary"><div class="tracker-main-panel panel"><span class="eyebrow">YOUR OVERALL COMPLETION</span><div class="tracker-main-count">${percent(done)}<span>%</span></div><div class="bar-track"><div style="width:${percent(done)}%" class="bar-fill"></div></div><p>${done} of ${TOPICS.length} topics completed · ${started} currently in progress</p></div><div class="tracker-side-panel panel"><span class="eyebrow">CONFIDENCE CHECK</span><div class="confidence-stats">${['high','medium','low'].map(c=>`<div><span class="confidence-dot ${c}"></span>${c==='high'?'Confident':c==='medium'?'Getting there':'Need practice'}<strong>${TOPICS.filter(t=>progressOf(t.id).confidence===c).length}</strong></div>`).join('')}</div></div></div>
    ${sectionHeading('ROADMAP PROGRESS','Track every topic','Start a lesson, mark it complete, and rate your confidence.')}
    <div class="tracker-table-shell"><div class="tracker-table-head"><span>TOPIC</span><span>STATUS</span><span>CONFIDENCE</span><span>LAST STUDIED</span><span></span></div>${TOPICS.map(t=>{const p=progressOf(t.id);return `<div class="tracker-row"><div class="tracker-topic"><span class="topic-mark tiny ${palette[t.category]}">${topicIcon(t.category)}</span><span><strong>${esc(t.title)}</strong><small>${esc(t.category)} · ${esc(t.level)}</small></span></div><div>${pillStatus(p)}</div><div><select aria-label="Confidence for ${esc(t.title)}" data-tracker-confidence="${t.id}"><option value="" ${!p.confidence?'selected':''}>Not rated</option><option value="low" ${p.confidence==='low'?'selected':''}>Need practice</option><option value="medium" ${p.confidence==='medium'?'selected':''}>Getting there</option><option value="high" ${p.confidence==='high'?'selected':''}>Confident</option></select></div><div class="last-studied">${p.lastStudied?new Date(p.lastStudied).toLocaleDateString('en-IN',{day:'numeric',month:'short'}):'—'}</div><button class="tracker-open" data-go="topic/${t.id}" aria-label="Open ${esc(t.title)}">${icon('arrow',17)}</button></div>`}).join('')}</div><div class="data-manage"><div><strong>Keep your learning history safe</strong><p>Export a backup or import a previous backup. Data is stored on this device.</p></div><div class="data-actions"><button class="btn btn-outline" data-export>${icon('download',16)} Export</button><label class="btn btn-outline file-button">${icon('upload',16)} Import <input type="file" id="import-file" accept="application/json,.json" hidden /></label><button class="btn btn-danger" data-reset>${icon('trash',16)} Reset</button></div></div>`;}
  function remindersPage(){const future=state.reminders.filter(r=>!r.done).sort((a,b)=>new Date(a.at)-new Date(b.at));const history=state.reminders.filter(r=>r.done).slice(-3);const permission=('Notification' in window)?Notification.permission:'unsupported';return `<div class="page-intro"><div><div class="eyebrow">YOUR STUDY ROUTINE</div><h1>Reminders</h1><p>Make preparation a habit with a daily reminder and one-time study tasks.</p></div></div>
    <div class="reminder-layout"><div class="reminder-main"><div class="panel reminder-settings"><div class="settings-head"><span class="settings-icon">${icon('repeat',21)}</span><div><h2>Daily study reminder</h2><p>Choose a time that works with your routine.</p></div><label class="switch"><input id="daily-enabled" type="checkbox" ${state.daily.enabled?'checked':''} aria-label="Enable daily study reminders"/><span></span></label></div><div class="time-setting"><div><strong>Reminder time</strong><span>Uses your device's local time</span></div><input type="time" id="daily-time" value="${esc(state.daily.time)}"/></div><div class="setting-tip">${icon('info',17)} Reminders are checked while this page is open. Browser notifications require permission; a closed browser cannot deliver these reminders.</div><button class="btn btn-primary" id="notifications-button" ${permission==='granted'?'disabled':''}>${icon('bell',16)} ${permission==='granted'?'Browser notifications enabled':'Enable browser notifications'}</button></div>
      <div class="panel reminder-add"><div class="eyebrow">ONE-TIME TASK</div><h2>Add a study reminder</h2><p>Schedule a topic revision, practice problem, or mock interview.</p><form id="reminder-form"><label>What do you want to study?<input name="title" maxlength="100" required placeholder="e.g. Revise JavaScript closures" /></label><div class="form-two"><label>Date<input name="date" type="date" min="${localDate()}" required value="${localDate()}" /></label><label>Time<input name="time" type="time" required value="20:00" /></label></div><button class="btn btn-primary" type="submit">${icon('bell',16)} Add reminder</button></form></div>
    </div><div class="reminder-side"><div class="panel scheduled-panel"><div class="panel-header-row"><h2>Scheduled reminders</h2><span class="list-count">${future.length}</span></div>${future.length?`<div class="reminder-list">${future.map(r=>`<div class="reminder-item"><div class="reminder-date">${icon('calendar',18)}</div><div><strong>${esc(r.title)}</strong><span>${new Date(r.at).toLocaleString('en-IN',{day:'numeric',month:'short',year:'numeric',hour:'numeric',minute:'2-digit'})}</span>${new Date(r.at)<=new Date()?'<em>Due now</em>':''}</div><div class="reminder-item-actions"><button data-done-reminder="${esc(r.id)}" title="Mark done" aria-label="Mark reminder done">${icon('check',17)}</button><button data-remove-reminder="${esc(r.id)}" title="Delete reminder" aria-label="Delete reminder">${icon('trash',16)}</button></div></div>`).join('')}</div>`:`<div class="reminders-empty">${icon('calendar',30)}<strong>No reminders yet</strong><p>Add your first study task and it will appear here.</p></div>`}</div>
      <div class="reminder-illustration"><span>${icon('spark',24)}</span><h3>Consistency beats intensity.</h3><p>Even 20 focused minutes of revision can help you retain what you've learned.</p></div>${history.length?`<div class="panel recent-done"><h3>Recently completed</h3>${history.map(r=>`<div>${icon('check-circle',16)} ${esc(r.title)}</div>`).join('')}</div>`:''}</div></div>`;}
  function render(){const r=route();let html='',title='Dashboard';if(r.page==='topics'){title='Explore topics';html=topicsPage();}else if(r.page==='topic'){const t=TOPICS.find(t=>t.id===r.id);if(t){title=t.title;html=lessonPage(t);}else{title='Not found';html=`<div class="empty-state"><h2>We couldn't find this topic.</h2><button data-go="topics" class="btn btn-primary">Browse topics</button></div>`;}}else if(r.page==='tracker'){title='Progress tracker';html=trackerPage();}else if(r.page==='reminders'){title='Reminders';html=remindersPage();}else{title='Dashboard';html=dashboard();}shell(html,title,'',r.page);}
  function toast(message){const box=document.getElementById('toast-container');if(!box)return;box.innerHTML=`<div class="toast">${icon('check-circle',17)} ${esc(message)}</div>`;clearTimeout(toastTimer);toastTimer=setTimeout(()=>{if(box)box.innerHTML='';},3500);}
  function reminderNotify(title,body){toast(title);if('Notification' in window&&Notification.permission==='granted'){try{new Notification(title,{body,tag:'interviewos-'+title});}catch(e){console.warn('Browser notification unavailable',e);}}}
  function checkReminders(){const now=new Date();let dirty=false;const today=localDate(now);const hhmm=`${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;if(state.daily.enabled&&hhmm>=state.daily.time&&state.daily.lastFired!==today){state.daily.lastFired=today;dirty=true;reminderNotify('Time for interview prep!','Open InterviewOS and study one topic today.');}for(const item of state.reminders){if(!item.done&&!item.notified&&new Date(item.at).getTime()<=now.getTime()){item.notified=true;dirty=true;reminderNotify('Study reminder',item.title);}}if(dirty){save();const r=route();if(r.page==='reminders')render();}}
  function exportData(){const blob=new Blob([JSON.stringify({version:1,exportedAt:new Date().toISOString(),data:state},null,2)],{type:'application/json'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=`interviewos-backup-${localDate()}.json`;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1500);toast('Progress backup exported');}
  async function importData(file){if(!file)return;try{const payload=JSON.parse(await file.text());const data=payload?.data??payload;if(!data||typeof data!=='object'||!Array.isArray(data.reminders)||!data.progress||typeof data.progress!=='object'||!data.notes||typeof data.notes!=='object')throw new Error('Invalid format');const next={...initial(),...data,daily:{...initial().daily,...data.daily}};state=next;save();render();toast('Progress imported successfully');}catch(e){toast('Invalid backup file — import failed');}}
  function click(e){const nav=e.target.closest('[data-go]');if(nav){go(nav.dataset.go);return;}
    if(e.target.closest('[data-menu]')){drawerOpen=true;render();return;}if(e.target.closest('[data-close-drawer]')){drawerOpen=false;render();return;}
    const category=e.target.closest('[data-category-link]');if(category){activeCategory=category.dataset.categoryLink;searchValue='';go('topics');return;}
    const filter=e.target.closest('[data-filter]');if(filter){activeCategory=filter.dataset.filter;render();return;}
    const clear=e.target.closest('[data-clear-search]');if(clear){activeCategory='All topics';searchValue='';render();return;}
    const finish=e.target.closest('[data-complete]');if(finish){const id=finish.dataset.complete;setTopicStatus(id,progressOf(id).status==='completed'?'in-progress':'completed');return;}
    const conf=e.target.closest('[data-confidence]');if(conf){setConfidence(conf.dataset.confidence,conf.dataset.value);return;}
    const quiz=e.target.closest('[data-quiz]');if(quiz){const id=quiz.dataset.quiz;state.quiz[id]=Number(quiz.dataset.answer);if(progressOf(id).status==='not-started'){state.progress[id]={...progressOf(id),status:'in-progress',lastStudied:new Date().toISOString()};}save();render();return;}
    const retry=e.target.closest('[data-retry-quiz]');if(retry){delete state.quiz[retry.dataset.retryQuiz];save();render();document.getElementById('quiz')?.scrollIntoView({behavior:'smooth'});return;}
    const visualPrev=e.target.closest('[data-visual-prev]');if(visualPrev){handleVisualClick(visualPrev,-1);return;}
    const visualNext=e.target.closest('[data-visual-next]');if(visualNext){handleVisualClick(visualNext,1);return;}
    const copyDeep=e.target.closest('[data-copy-deep]');if(copyDeep){const ch=DEEP[copyDeep.dataset.copyDeep]?.chapters[Number(copyDeep.dataset.chapter)];if(ch?.code){if(navigator.clipboard?.writeText){navigator.clipboard.writeText(ch.code).then(()=>toast('Example copied')).catch(()=>toast('Copy unavailable'));}else{toast('Copy requires a secure browser context');}}return;}
    const copy=e.target.closest('[data-copy-code]');if(copy){const t=TOPICS.find(t=>t.id===copy.dataset.copyCode);if(t){if(navigator.clipboard?.writeText){navigator.clipboard.writeText(t.code).then(()=>toast('Code copied')).catch(()=>toast('Copy unavailable in this browser'));}else{toast('Copy requires a secure browser context');}}return;}
    const scroll=e.target.closest('[data-scroll]');if(scroll){e.preventDefault();document.getElementById(scroll.dataset.scroll)?.scrollIntoView({behavior:'smooth',block:'start'});return;}
    if(e.target.closest('[data-export]')){exportData();return;}
    if(e.target.closest('[data-reset]')){if(window.confirm('Delete all progress, notes, quizzes, and reminders saved in this browser? Export a backup first if needed.')){state=initial();save();render();toast('Local data reset');}return;}
    const done=e.target.closest('[data-done-reminder]');if(done){const r=state.reminders.find(x=>x.id===done.dataset.doneReminder);if(r){r.done=true;save();render();toast('Reminder completed');}return;}
    const remove=e.target.closest('[data-remove-reminder]');if(remove){state.reminders=state.reminders.filter(x=>x.id!==remove.dataset.removeReminder);save();render();toast('Reminder removed');return;}
    if(e.target.closest('#notifications-button')){if(!('Notification' in window)){toast('Browser notifications are not supported');return;}Notification.requestPermission().then(p=>{render();toast(p==='granted'?'Browser notifications enabled':'Notification permission not granted');}).catch(()=>toast('Notification permission not available'));return;}
  }
  function changed(e){if(e.target.matches('#daily-enabled')){state.daily.enabled=e.target.checked;save();render();toast(state.daily.enabled?'Daily reminder enabled':'Daily reminder paused');}
    if(e.target.matches('#daily-time')){state.daily.time=e.target.value;save();render();toast('Daily reminder time saved');}
    if(e.target.matches('[data-tracker-confidence]')){setConfidence(e.target.dataset.trackerConfidence,e.target.value);}
    if(e.target.matches('#import-file'))importData(e.target.files?.[0]);
  }
  function input(e){if(e.target.matches('#topic-search')){searchValue=e.target.value.trim().toLowerCase();filterCards();}if(e.target.matches('[data-note]')){state.notes[e.target.dataset.note]=e.target.value;save();}}
  function submit(e){if(e.target.id!=='reminder-form')return;e.preventDefault();const data=new FormData(e.target);const title=String(data.get('title')||'').trim(),date=String(data.get('date')||''),time=String(data.get('time')||'');const dt=new Date(`${date}T${time}:00`);if(!title||!date||!time||Number.isNaN(dt.getTime())){toast('Please complete the reminder fields');return;}if(dt.getTime()<Date.now()-60000){toast('Choose a time in the future');return;}state.reminders.push({id:(crypto.randomUUID?crypto.randomUUID():String(Date.now())+'-'+Math.random()),title,at:dt.toISOString(),done:false,notified:false});save();render();toast('Study reminder added');}
  window.addEventListener('hashchange',()=>{drawerOpen=false;render();window.scrollTo(0,0);});
  document.addEventListener('click',click);
  document.addEventListener('change',changed);
  document.addEventListener('input',input);
  document.addEventListener('submit',submit);
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)checkReminders();});
  read();if(!location.hash)location.hash='#/dashboard';render();checkReminders();setInterval(checkReminders,30000);
})();


