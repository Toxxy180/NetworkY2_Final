'use strict';
(() => {
 const KEY='network-final-01076040-v1', SESSION=KEY+'-session';
 const icons={home:'M3 10 12 3l9 7M5 9v12h5v-7h4v7h5V9',book:'M12 5v16M12 5C8 2 4 3 2 4v15c3-1 6-1 10 2 4-3 7-3 10-2V4c-3-1-6-1-10 1Z',quiz:'M7 3h10a2 2 0 0 1 2 2v16H5V5a2 2 0 0 1 2-2Zm1 5h8m-8 4h8m-8 4h5',review:'M3 11a9 9 0 1 1 2 7M3 5v6h6m3-5v6l4 2',search:'M21 21l-5-5m2-6a7 7 0 1 1-14 0 7 7 0 0 1 14 0',arrow:'M5 12h14m-6-6 6 6-6 6',check:'m5 12 4 4L19 6',info:'M12 11v6m0-10v1m9 4a9 9 0 1 1-18 0 9 9 0 0 1 18 0',menu:'M4 6h16M4 12h16M4 18h16',close:'m6 6 12 12M6 18 18 6',download:'M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5',play:'m8 4 12 8-12 8V4Z',left:'M19 12H5m6-6-6 6 6 6',copy:'M8 8h12v13H8V8ZM4 16H2V2h12v2',flag:'M5 22V3m0 1c5-4 9 4 15 0v10c-6 4-10-4-15 0',grad:'m2 8 10-5 10 5-10 5L2 8Zm4 2v7c4 3 8 3 12 0v-7m4-2v9'};
 icons.explore='M9 3h6m-5 0v7L4 20c-.4.7.1 1 1 1h14c.9 0 1.4-.3 1-1l-6-10V3M8 14h8';
 const icon=(name,size=20)=>`<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${icons[name]||icons.book}"/></svg>`;
 const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const fmt=s=>esc(s).replace(/`([^`]+)`/g,'<code>$1</code>').replace(/\*\*([^*]+)\*\*/g,'<strong>$1</strong>');
 const paragraphs=value=>String(value??'').split(/\n\s*\n/).filter(part=>part.trim()).map(part=>`<p>${fmt(part)}</p>`).join('');
 let storageOK=true, state={done:[],answers:{},history:[]}, session=null, reviewFilter='all';
 try{const old=JSON.parse(localStorage.getItem(KEY));if(old&&Array.isArray(old.done)&&old.answers&&Array.isArray(old.history))state=old;session=JSON.parse(sessionStorage.getItem(SESSION));}catch(e){storageOK=false;}
 const chapters=window.CHAPTERS;
 if(!Array.isArray(chapters)||chapters.length!==8){document.getElementById('main').innerHTML='<div class="empty-state"><h1>โหลดบทเรียนไม่สำเร็จ</h1><p>กรุณารีเฟรชหน้าเว็บอีกครั้ง</p></div>';return;}
 const allQuestions=chapters.flatMap(c=>c.questions.map(q=>({...q,chapterId:c.id,chapterTitle:c.shortTitle})));
 const qmap=Object.fromEntries(allQuestions.map(q=>[q.id,q]));
 if(session&&(!Array.isArray(session.ids)||session.ids.some(id=>!qmap[id])))session=null;
 const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(state));}catch(e){storageOK=false;}};
 const saveSession=()=>{try{sessionStorage.setItem(SESSION,JSON.stringify(session));}catch(e){}};
 const wrongIds=()=>Object.keys(state.answers).filter(id=>qmap[id]&&!state.answers[id].correct);
 const main=document.getElementById('main');
 const toast=text=>{const el=document.getElementById('toast');el.textContent=text;el.classList.add('show');clearTimeout(toast.timer);toast.timer=setTimeout(()=>el.classList.remove('show'),2600)};
 const logo=`<svg width="40" height="44" viewBox="0 0 44 44" fill="none" stroke="currentColor" stroke-width="3.5" aria-hidden="true"><path d="m22 7-16 30h32L22 7Z"/><circle cx="22" cy="7" r="5" fill="white"/><circle cx="6" cy="37" r="5" fill="white"/><circle cx="38" cy="37" r="5" fill="white"/></svg>`;
 function sidebar(active = 'home', cid) {
  const practical = ['labs','labQuiz'].includes(active);
  const navigation = [
   ['home','ภาพรวม','#/'],
   ['explore','ห้องทดลองเครือข่าย','#/explore'],
   ['openbook','Openbook · A4 หน้า–หลัง','#/openbook/theory'],
   ['book','บทเรียนทฤษฎี','#/chapters'],
   ['quiz','ข้อสอบทฤษฎี','#/practice'],
   ['labs','บทเรียนปฏิบัติ','#/labs'],
   ['labQuiz','ข้อสอบปฏิบัติ','#/lab-exams'],
   ['review','ทบทวนข้อทฤษฎีที่พลาด','#/review']
  ];
  document.getElementById('sidebar').innerHTML = `<a href="#/" class="brand">${logo}<span><strong>Network</strong><small>FINAL LAB</small></span></a>
   <nav aria-label="ส่วนหลัก">${navigation.map(([key,title,url])=>`<a class="nav-item ${key===active?'active':''}" href="${url}" ${key===active?'aria-current="page"':''}>${icon(key==='labQuiz'?'quiz':key==='labs'?'book':key)}${title}</a>`).join('')}</nav>
   <hr class="nav-divider"><p class="nav-label">${practical?'8 ชุดภาคปฏิบัติ':'8 บทภาคทฤษฎี'}</p>
   <nav aria-label="รายการบทเรียน">${chapters.map(c=>{
    const done=(practical?labState.done:state.done).includes(c.id);
    const url=practical?`#/${active==='labQuiz'?'lab-exam':'lab'}/${c.id}`:`#/chapter/${c.id}`;
    return `<a class="nav-item chapter-nav ${cid===c.id?'active':''}" href="${url}" ${cid===c.id?'aria-current="page"':''}><span class="chapter-num ${done?'done':''}">${done?icon('check',14):c.id}</span>${esc(c.shortTitle)}</a>`;
   }).join('')}</nav><div class="sidebar-bottom"><a href="exam-scope.pdf" target="_blank" rel="noopener">${icon('download',16)}แนวข้อสอบอาจารย์ (PDF)</a><span>${icon('grad',16)} รายวิชา 01076040</span></div>`;
 }
 function breadcrumb(label='ภาพรวม'){document.getElementById('breadcrumb').innerHTML=`<a href="#/"><b>Network</b></a><span>/</span><span class="crumb-detail">${esc(label)}</span>`;document.title=`${label} · Network Final Lab`;}
 function chapterCard(c){return `<a href="#/chapter/${c.id}" class="chapter-card"><span class="num">${state.done.includes(c.id)?icon('check',20):String(c.id).padStart(2,'0')}</span><div class="detail"><h3>${esc(c.shortTitle)}</h3><p>${esc(c.subtitle)}</p></div><span class="count">15 ข้อ</span>${icon('arrow',18)}</a>`}
 function scopeNote(){return `<details class="scope-note"><summary>ขอบเขตและที่มาของเนื้อหา</summary><p>ยึดไฟล์ “แนวเนื้อหาข้อสอบปลายภาค_Network.pdf” ทั้ง 5 หน้าเป็นขอบเขตหลัก แบ่งตามหัวข้อ 1–8 และเสริมจากสไลด์ ใบงาน Cisco IOS และการทดลองบน Kali ใน Network_Files ดูชื่อเอกสารที่ท้ายแต่ละบท</p><ul><li>ข้อสอบฝึก 120 ข้อในเว็บนี้สร้างขึ้นเพื่อทบทวน ไม่ใช่ข้อสอบจริงหรือข้อสอบที่อาจารย์รับรอง</li><li>WLAN อยู่ในคำอธิบายรายวิชา แต่ไม่ได้แยกเป็นหัวข้อในแนวปลายภาคฉบับนี้ จึงเน้น 8 บทตามไฟล์ ส่วน IP Telephony ครอบคลุม Voice VLAN ตามแนว</li><li>ตัวอย่างคำสั่งอ้างอิง Cisco IOS ทั่วไป รายละเอียดอาจต่างตามรุ่นและเวอร์ชัน ตรวจชื่อ interface และ IP ให้ตรงกับแลป</li><li>เลขบทกับตำแหน่งใน PDF: บท 1–2 หน้า 1–2, บท 3 หน้า 2–3, บท 4–5 หน้า 3–4, บท 6–7 หน้า 4, บท 8 หน้า 4–5</li></ul><a href="exam-scope.pdf" target="_blank" rel="noopener">เปิดไฟล์แนวข้อสอบต้นฉบับ ${icon('arrow',14)}</a></details>`}
 function dashboard(){sidebar('home');breadcrumb();const answered=Object.keys(state.answers).filter(id=>qmap[id]).length;const percent=Math.round(state.done.length/8*100);const next=chapters.find(c=>!state.done.includes(c.id))||chapters[0];main.innerHTML=`<section class="hero"><div><h1>เชื่อมความเข้าใจ<br>ก่อนเข้าสอบ</h1><p>สรุปและฝึกทำข้อสอบวิชาเครือข่ายครบ 8 บทเรียน<br>ฝึกอธิบายหลักการ ซ้อมคำสั่งจากใบงาน และทดสอบด้วยโจทย์ 120 ข้อ</p><div class="actions"><a class="btn primary" href="#/chapter/${next.id}">${icon('play',17)}${state.done.length?'เรียนบทถัดไป':'อ่านภาคทฤษฎี'}</a><a class="btn" href="#/explore">เปิดห้องทดลองเครือข่าย</a><a class="btn" href="#/openbook/theory">Openbook · A4 หน้า–หลัง</a><a class="btn" href="#/labs">บทเรียนปฏิบัติ</a><a class="btn" href="#/lab-exams">ข้อสอบปฏิบัติ 8 ชุด</a><a class="btn" href="#/practice">${icon('quiz',18)}ฝึกทำข้อสอบ</a></div></div><div class="hero-art">${Diagrams.hero()}</div></section><div class="progress-strip"><span>อ่านแล้ว: <strong>${state.done.length} / 8</strong> บท</span><span class="divider"></span><span>ข้อที่เคยทำ: <strong>${answered} / 120</strong></span><div class="progress-track" role="progressbar" aria-label="บทเรียนที่อ่านแล้ว" aria-valuenow="${percent}" aria-valuemin="0" aria-valuemax="100"><div class="progress-fill" style="width:${percent}%"></div></div><b>${percent}%</b></div><div class="section-heading"><h2>เส้นทางทบทวน</h2><small>เรียงจากพื้นฐาน → ประยุกต์</small></div><div class="chapter-grid">${chapters.map(chapterCard).join('')}</div><div class="note">${icon('info',21)}<div><strong>เริ่มจาก Switching แล้วเชื่อมต่อไปจนถึง WAN</strong><br>แต่ละบทมีคำอธิบาย แผนภาพ ตัวอย่าง และข้อสอบ 15 ข้อพร้อมเหตุผลของเฉลย</div></div>${scopeNote()}<p class="tiny-note">${storageOK?'ความคืบหน้าบันทึกในเบราว์เซอร์นี้โดยอัตโนมัติ ไม่ซิงก์ข้ามอุปกรณ์':'เบราว์เซอร์ไม่อนุญาตให้บันทึก ความคืบหน้าจะอยู่เฉพาะหน้านี้'}</p>`;}
 function chapterIndex(){sidebar('book');breadcrumb('บทเรียนทฤษฎี');main.innerHTML=`<div class="page-head"><div><h1>บทเรียนภาคทฤษฎี</h1><p class="lead">เรียนรู้ว่าแต่ละส่วนทำงานอย่างไร แล้วเชื่อมโยงเข้ากับสถานการณ์ในแลป</p></div></div><div class="chapter-grid">${chapters.map(chapterCard).join('')}</div>${scopeNote()}`;}
 function sectionHTML(s,i){return `<section class="lesson-section" id="section-${i}"><h2>${esc(s.title)}</h2>${(s.body||[]).map(p=>`<p>${fmt(p)}</p>`).join('')}${s.diagram?Diagrams.render(s.diagram,true):''}${s.bullets?`<ul>${s.bullets.map(b=>`<li>${fmt(b)}</li>`).join('')}</ul>`:''}${s.table?`<div class="table-scroll"><table><thead><tr>${s.table.headers.map(h=>`<th scope="col">${esc(h)}</th>`).join('')}</tr></thead><tbody>${s.table.rows.map(r=>`<tr>${r.map(v=>`<td>${fmt(v)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`:''}${s.code?`<div class="code-header"><span>ตัวอย่างคำสั่ง / ผลลัพธ์</span><button class="btn small" data-copy="${i}">${icon('copy',13)}คัดลอก</button></div><pre><code>${esc(s.code)}</code></pre>`:''}${s.example?`<div class="example"><h3>${esc(s.example.title)}</h3>${s.example.body.map(p=>`<p>${fmt(p)}</p>`).join('')}</div>`:''}${s.pitfall?`<div class="pitfall"><strong>จุดที่มักสับสน</strong>${fmt(s.pitfall)}</div>`:''}</section>`}
 function lesson(id, tab = 'lesson') {
  if (tab === 'lab') { practicalLesson(id); return; }
  const c = chapters.find(chapter => chapter.id === id);
  if (!c) { location.hash = '#/'; return; }
  const summary = tab === 'summary';
  const tabs = [['lesson', 'ภาคทฤษฎี'], ['summary', 'สรุปก่อนสอบ']];
  sidebar('book', id);
  breadcrumb(`ทฤษฎี · บท ${id} · ${c.shortTitle}`);
  const content = summary
   ? `<h2>สรุปหลักการก่อนสอบ</h2><ul class="summary-list">${c.summary.map(s=>`<li>${fmt(s)}</li>`).join('')}</ul>`
   : `<div class="objectives"><strong>อ่านจบแล้ว คุณจะอธิบายได้ว่า…</strong><ul>${c.objectives.map(o=>`<li>${fmt(o)}</li>`).join('')}</ul></div>${c.sections.map(sectionHTML).join('')}`;
  main.innerHTML = `<div class="page-head"><div><div class="chapter-label">ภาคทฤษฎี · บท ${id} / 8</div><h1>${esc(c.title)}</h1><p class="lead">${esc(c.subtitle)}</p></div><button class="btn primary" data-start="${id}">${icon('quiz',17)}ฝึกทำข้อสอบ 15 ข้อ</button></div>
   <div class="tabs" role="tablist" aria-label="รูปแบบบทเรียน">${tabs.map(([key,label])=>`<button class="tab ${tab===key?'active':''}" role="tab" aria-selected="${tab===key}" data-tab="${key}" data-chapter="${id}">${label}</button>`).join('')}</div>
   <div class="reading-layout"><article class="reading">${content}
    <a class="btn" href="#/lab/${id}">เรียนภาคปฏิบัติของเรื่องนี้ ${icon('arrow',16)}</a>
    <div class="chapter-end"><button class="btn ${state.done.includes(id)?'success':'primary'}" data-done="${id}">${icon('check',17)}${state.done.includes(id)?'อ่านบทนี้แล้ว':'ทำเครื่องหมายว่าอ่านแล้ว'}</button>${id<8?`<a class="btn" href="#/chapter/${id+1}">บทถัดไป ${icon('arrow',16)}</a>`:'<a class="btn" href="#/practice">ฝึกทำข้อสอบทฤษฎี</a>'}</div>
    <details class="sources"><summary>เอกสารประกอบบทนี้</summary><p>ชีทและใบงานใน Network_Files</p><ul>${c.courseFiles.map(ref=>`<li>${esc(ref)}</li>`).join('')}</ul><a href="exam-scope.pdf" target="_blank" rel="noopener">แนวข้อสอบต้นฉบับ (PDF 5 หน้า)</a>${c.sources.map(s=>`<a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.title)}</a>`).join('')}</details>
   </article><aside class="toc" aria-label="สารบัญในบท"><h3>เนื้อหาในบทนี้</h3>${summary?'<p class="tiny-note">สรุปหลักการของบทนี้</p>':c.sections.map((s,i)=>`<a href="#/chapter/${id}" data-scroll="section-${i}">${esc(s.title)}</a>`).join('')}<button class="btn primary" data-start="${id}">${icon('quiz',15)}ฝึกทำข้อสอบ</button></aside></div>`;
  if (!summary) setupReading("theory", id, c.sections);
 }
 function labSection(s, i) {
  return `<section class="lesson-section" id="section-${i}"><h2>${esc(s.title)}</h2><div class="lab-brief"><h3>เตรียมและทำตามลำดับ</h3><ol>${s.body.map(p=>`<li>${fmt(p)}</li>`).join('')}</ol></div>
   <details class="lab-answer" open><summary>คำสั่งพร้อมความหมายและวิธีตรวจผล</summary>
    ${s.steps.map(step=>`<div class="command-block"><div class="code-header"><span>${esc(step.device)}</span><button class="btn small" data-copy>${icon('copy',13)}คัดลอกทั้งชุด</button></div><pre><code>${esc(step.code)}</code></pre><details class="command-meaning" open><summary>ความหมายทีละบรรทัด · ${step.notes.length} บรรทัด</summary>${commandNotes(step.notes)}</details></div>`).join('')}
    <div class="example"><h3>${esc(s.example.title)}</h3>${s.example.body.map(p=>`<p>${fmt(p)}</p>`).join('')}</div></details></section>`;
 }
 function commandNotes(notes) {
  return `<ol class="command-notes" aria-label="ความหมายของคำสั่งทีละบรรทัด">${notes.map(note=>`<li><div class="command-note-code"><span class="command-line-number">บรรทัด ${note.line}</span><code>${esc(note.command)}</code><span class="command-mode">${esc(note.mode)}${note.nextMode!==note.mode?' → '+esc(note.nextMode):''}</span></div><p>${esc(note.meaning)}</p></li>`).join('')}</ol>`;
 }
 function commandSolution(question) {
  return `<p><strong>${question.kind==='fill'?'คำสั่งที่เติมในช่องว่าง':'ชุดคำสั่งเฉลย'}</strong></p><pre><code>${esc(question.answer)}</code></pre>${paragraphs(question.explanation)}<h3>${question.kind==='fill'?'ชุดที่เติมครบ พร้อมความหมาย':'ความหมายทีละบรรทัด'}</h3>${commandNotes(question.notes)}${question.accept.length>1?`<details class="command-alternatives"><summary>คำตอบทางเลือกที่รับได้</summary>${question.accept.slice(1).map(value=>`<pre><code>${esc(value)}</code></pre>`).join('')}</details>`:''}`;
 }
 function commandFeedback(question,answer) {
  const result=window.PracticalTools.check(question,answer);
  return `<div class="command-line-result"><p>ตรงตามชุดคำตอบ ${result.matched} / ${result.total} บรรทัด</p><ol>${result.rows.map(row=>`<li class="${row.correct?'line-correct':'line-wrong'}"><strong>บรรทัด ${row.line} · ${row.correct?'ถูกต้อง':!row.actual?'ยังขาดคำสั่ง':!row.expected?'มีคำสั่งเกิน':'คำสั่งหรือลำดับยังไม่ตรง'}</strong>${row.correct?'':`<p>คุณพิมพ์: <code>${esc(row.actual||'(ว่าง)')}</code></p><p>ตามชุดเฉลย: <code>${esc(row.expected||'(ไม่มีบรรทัดนี้)')}</code></p>`}</li>`).join('')}</ol></div>`;
 }
 function practice(){sidebar('quiz');breadcrumb('ข้อสอบทฤษฎี');main.innerHTML=`<div class="page-head"><div><h1>ข้อสอบภาคทฤษฎี</h1><p class="lead">เลือกฝึกพร้อมเฉลยทีละข้อ หรือทำครบชุดแล้วตรวจคะแนน<br>โจทย์แต่งขึ้นตามขอบเขตอาจารย์ มีทั้งพื้นฐาน การอ่านคำสั่ง และวิเคราะห์ภาพ</p></div></div>${session&&!session.finished?`<div class="note">${icon('info')}<div>คุณมีชุดที่กำลังทำอยู่: ${esc(session.title)}<br><a href="#/quiz">กลับไปทำต่อ ${icon('arrow',14)}</a></div></div>`:''}<div class="mock-banner"><div><h3>ชุดทบทวนรวม 30 ข้อ</h3><p>สุ่มจากคลังทั้ง 8 บท · ตรวจคะแนนเมื่อทำครบ · ไม่จำกัดเวลา</p></div><button class="btn" data-start="mock" data-mode="exam">เริ่มชุดรวม ${icon('arrow',17)}</button></div><div class="quiz-chooser">${chapters.map(c=>{const results=state.history.filter(h=>h.chapter===c.id);const best=results.length?Math.max(...results.map(r=>r.score)):null;return `<section class="quiz-choice"><span class="label">บท ${String(c.id).padStart(2,'0')} · 15 ข้อ</span><h3>${esc(c.shortTitle)}</h3><p>${esc(c.subtitle)}</p><div class="actions"><button class="btn primary small" data-start="${c.id}">ฝึกพร้อมเฉลย</button><button class="btn small" data-start="${c.id}" data-mode="exam">ทำครบแล้วตรวจ</button></div><p class="tiny-note">${best===null?'ยังไม่เคยทำครบชุด':`คะแนนสูงสุด ${best}/15 · ทำครบ ${results.length} ครั้ง`}</p></section>`}).join('')}</div>`;}
 const shuffle=a=>{const b=[...a];for(let i=b.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[b[i],b[j]]=[b[j],b[i]];}return b};
 function startQuiz(target,mode='practice'){let ids,title,chapter=null;if(target==='mock'){ids=shuffle(chapters.flatMap(c=>shuffle(c.questions).slice(0,4).map(q=>q.id))).slice(0,30);title='ชุดทบทวนรวม 30 ข้อ';}else if(target==='wrong'){ids=shuffle(wrongIds().filter(id=>reviewFilter==='all'||qmap[id].chapterId===Number(reviewFilter)));title='ทบทวนข้อที่เคยพลาด';if(!ids.length){toast('ยังไม่มีข้อที่ต้องทบทวน');return}}else{chapter=Number(target);const c=chapters.find(c=>c.id===chapter);if(!c)return;ids=c.questions.map(q=>q.id);title=c.shortTitle;}
 session={ids,title,chapter,mode,index:0,choices:{},checked:{},orders:Object.fromEntries(ids.map(id=>[id,shuffle([0,1,2,3])])),startedAt:Date.now(),finished:false};saveSession();if(location.hash==='#/quiz')render();else location.hash='#/quiz';}
 function record(id,choice){const q=qmap[id];state.answers[id]={choice,correct:choice===q.answer,date:Date.now()};save();}
 function quiz(){if(!session){location.hash='#/practice';return;}if(session.finished){results();return;}sidebar('quiz');breadcrumb('กำลังทำข้อสอบ');const q=qmap[session.ids[session.index]],choice=session.choices[q.id],checked=!!session.checked[q.id],count=Object.keys(session.choices).length,idx=session.index;const order=session.orders[q.id];main.innerHTML=`<div class="quiz-shell"><div class="page-head"><div><h1>${esc(session.title)}</h1><p class="lead">${session.mode==='exam'?'ทำครบแล้วตรวจ · สามารถย้อนกลับไปแก้คำตอบก่อนส่ง':'ฝึกพร้อมเฉลย · เลือกคำตอบแล้วกดตรวจ เพื่ออ่านเหตุผล'}</p></div><a class="btn small" href="#/practice">พักไว้ก่อน</a></div><div class="quiz-meta"><span>ข้อ <strong>${idx+1} / ${session.ids.length}</strong></span><span>ตอบแล้ว ${count} ข้อ</span></div><div class="progress-track"><div class="progress-fill" style="width:${count/session.ids.length*100}%"></div></div><section class="question-panel"><div class="question-top"><span>บท ${q.chapterId} · ${esc(q.chapterTitle)}</span><span class="level">${esc(q.level)}</span></div><h2>${fmt(q.prompt)}</h2>${q.diagram?Diagrams.question(q.diagram):''}<div class="options" role="group" aria-label="ตัวเลือกคำตอบ">${order.map((original,i)=>`<button class="option ${choice===original?'selected':''} ${checked&&original===q.answer?'correct':''} ${checked&&choice===original&&choice!==q.answer?'wrong':''}" data-option="${original}" aria-pressed="${choice===original}" ${checked?'disabled':''}><span class="letter">${'ABCD'[i]}</span><span>${fmt(q.options[original])}</span></button>`).join('')}</div>${checked?`<div class="feedback ${choice!==q.answer?'wrong':''}" role="status"><strong>${choice===q.answer?'ถูกต้อง เข้าใจหลักการแล้ว':'ยังไม่ถูก ลองดูเหตุผลตรงนี้'}</strong><p>คำตอบที่ถูก: ${fmt(q.options[q.answer])}</p>${paragraphs(q.explanation)}</div>`:''}<div class="quiz-bottom"><button class="btn" data-prev ${idx===0?'disabled':''}>${icon('left',16)}ข้อก่อนหน้า</button><div class="actions">${session.mode==='practice'&&!checked?`<button class="btn primary" data-check ${choice===undefined?'disabled':''}>ตรวจคำตอบ ${icon('check',16)}</button>`:idx<session.ids.length-1?`<button class="btn primary" data-next>ข้อถัดไป ${icon('arrow',16)}</button>`:`<button class="btn primary" data-finish ${session.mode==='exam'&&count<session.ids.length?'disabled':''}>ตรวจคะแนนทั้งหมด ${icon('check',16)}</button>`}</div></div>${session.mode==='exam'&&idx===session.ids.length-1&&count<session.ids.length?'<p class="tiny-note">ตอบให้ครบทุกข้อก่อนตรวจคะแนน เลือกเลขข้อด้านล่างเพื่อกลับไปทำข้อที่เว้นไว้</p>':''}</section><nav class="question-dots" aria-label="ไปยังข้อสอบ">${session.ids.map((id,i)=>`<button data-jump="${i}" class="${session.choices[id]!==undefined?'answered':''} ${idx===i?'current':''}" aria-label="ไปข้อ ${i+1}${session.choices[id]!==undefined?' ตอบแล้ว':''}" ${idx===i?'aria-current="step"':''}>${i+1}</button>`).join('')}</nav><p class="tiny-note">คำถามและเฉลยสร้างเพื่อฝึกทบทวน ไม่ใช่ข้อสอบจริงของอาจารย์</p></div>`;}
 function finish(){if(!session)return;const unanswered=session.ids.findIndex(id=>session.choices[id]===undefined||(session.mode==='practice'&&!session.checked[id]));if(unanswered!==-1){session.index=unanswered;saveSession();quiz();toast('ยังมีข้อที่ไม่ได้ตอบหรือตรวจคำตอบ');return}session.finished=true;session.ids.forEach(id=>record(id,session.choices[id]));session.score=session.ids.filter(id=>session.choices[id]===qmap[id].answer).length;state.history.push({chapter:session.chapter,title:session.title,score:session.score,total:session.ids.length,date:Date.now()});state.history=state.history.slice(-100);save();saveSession();results();window.scrollTo({top:0});}
 function resultReview(q,choice){const correct=choice===q.answer;return `<details class="review-item"><summary><span class="mark ${correct?'good':''}">${icon(correct?'check':'close',13)}</span><span>${fmt(q.prompt)}</span></summary><div class="review-body">${q.diagram?Diagrams.render(q.diagram):''}<p>คุณตอบ: <strong>${fmt(q.options[choice]??'ไม่ได้ตอบ')}</strong></p><p>คำตอบที่ถูก: <strong>${fmt(q.options[q.answer])}</strong></p>${paragraphs(q.explanation)}<a href="#/chapter/${q.chapterId}">กลับไปอ่านบท ${q.chapterId} ${icon('arrow',13)}</a></div></details>`}
 function results(){sidebar('quiz');breadcrumb('ผลการฝึก');const score=session.score,total=session.ids.length,percent=Math.round(score/total*100);main.innerHTML=`<div class="quiz-shell"><section class="result-head"><div class="score-circle"><b>${percent}%</b><span>${score} / ${total} ข้อ</span></div><h1>${percent>=80?'เข้าใจภาพรวมได้ดีแล้ว':percent>=50?'เริ่มเชื่อมโยงได้แล้ว ค่อย ๆ เก็บจุดที่พลาด':'กลับไปอ่านหลักการ แล้วลองใหม่ได้เสมอ'}</h1><p class="lead" style="margin:auto">${esc(session.title)} · คะแนนนี้ใช้ประเมินการฝึก ไม่ใช่การคาดการณ์คะแนนสอบจริง</p><div class="actions"><button class="btn primary" data-retry>ลองทำชุดเดิมอีกครั้ง</button><a class="btn" href="#/review">ทบทวนจุดที่พลาด</a><a class="btn" href="#/practice">เลือกบทอื่น</a></div></section><div class="section-heading"><h2>เฉลยพร้อมเหตุผล</h2><small>กดแต่ละข้อเพื่ออ่าน</small></div>${session.ids.map(id=>resultReview(qmap[id],session.choices[id])).join('')}</div>`;}
 function review(){sidebar('review');breadcrumb('ทบทวนจุดที่พลาด');const ids=wrongIds(),filtered=ids.filter(id=>reviewFilter==='all'||qmap[id].chapterId===Number(reviewFilter));main.innerHTML=`<div class="page-head"><div><h1>กลับมาเก็บจุดที่พลาด</h1><p class="lead">รวมข้อที่คำตอบล่าสุดยังไม่ถูก เมื่อตอบถูกในครั้งถัดไป ข้อนั้นจะออกจากรายการนี้</p></div>${filtered.length?'<button class="btn primary" data-start="wrong">ฝึกข้อเหล่านี้อีกครั้ง</button>':''}</div>${ids.length?`<div class="review-toolbar"><span class="muted">${filtered.length} ข้อที่ต้องทบทวน</span><select id="review-filter" aria-label="กรองข้อที่ผิดตามบท"><option value="all">ทุกบท</option>${chapters.map(c=>`<option value="${c.id}" ${String(c.id)===reviewFilter?'selected':''}>${c.id}. ${esc(c.shortTitle)}</option>`).join('')}</select></div>${filtered.length?filtered.map(id=>resultReview(qmap[id],state.answers[id].choice)).join(''):'<div class="empty-state"><h2>บทนี้ไม่มีข้อที่ค้างทบทวน</h2><p>เลือกบทอื่น หรือกลับไปฝึกชุดใหม่ได้เลย</p></div>'}`:`<div class="empty-state">${icon('check',42)}<h2>${Object.keys(state.answers).length?'ไม่มีข้อผิดที่ค้างทบทวน':'เริ่มฝึก แล้วเราจะช่วยเก็บจุดที่พลาด'}</h2><p>${Object.keys(state.answers).length?'ลองชุดรวมเพื่อเชื่อมความเข้าใจข้ามบท':'ตอบผิดได้เต็มที่ ทุกข้อมีเหตุผลให้เรียนรู้ต่อ'}</p><a class="btn primary" href="#/practice">เลือกข้อสอบฝึก ${icon('arrow',16)}</a></div>`}`;}
 function render(){window.Openbook.unmount();window.NetworkExperience.unmount();readingContext = null;document.body.classList.remove('menu-open');document.getElementById('menu-toggle').setAttribute('aria-expanded','false');const route=location.hash.replace(/^#\/?/,'').split('?')[0].split('/');if(route[0]==='chapter')lesson(Number(route[1]),['summary','lab'].includes(location.hash.split('?')[1]) ? location.hash.split('?')[1] : 'lesson');else if(route[0]==='openbook'){sidebar('openbook');breadcrumb('Openbook · A4 หน้า–หลัง');window.Openbook.mount(main,route[1]);}else if(route[0]==='explore'){sidebar('explore');breadcrumb('ห้องทดลองเครือข่าย');window.NetworkExperience.mount(main);}else if(route[0]==='labs')practicalIndex();else if(route[0]==='lab-exams')practicalIndex(true);else if(route[0]==='lab')practicalLesson(Number(route[1]));else if(route[0]==='lab-exam')practicalExam(Number(route[1]));else if(route[0]==='chapters')chapterIndex();else if(route[0]==='practice')practice();else if(route[0]==='quiz')quiz();else if(route[0]==='review')review();else dashboard();}

 const practicalExams = window.PRACTICAL_EXAMS;
 const LAB_KEY = KEY + '-practical';
 const READING_KEY = KEY + '-reading';
 let readingState = {};
 let readingContext = null;
 let readingFrame = null;
 try {
  const saved = JSON.parse(localStorage.getItem(READING_KEY));
  if (saved && typeof saved === 'object' && !Array.isArray(saved)) readingState = saved;
 } catch { storageOK = false; }
 function saveReading() {
  try { localStorage.setItem(READING_KEY, JSON.stringify(readingState)); }
  catch { storageOK = false; }
 }
 function readingLinks(sections) {
  return sections.map((section, index) => `<div class="reading-toc-item" data-reading-item="${index}"><button class="reading-tick" data-toc-mark="${index}" aria-pressed="false" aria-label="มาร์คว่าอ่านแล้ว · ${esc(section.title)}"></button><a href="#section-${index}" data-scroll="section-${index}" data-reading-link="${index}"><span>${esc(section.title)}</span><span class="reading-location">กำลังอ่าน</span></a></div>`).join('');
 }
 function setupReading(kind, id, sections) {
  const key = kind + ':' + id;
  const saved = readingState[key];
  const progress = {
   last: typeof saved?.last === 'string' ? saved.last : '',
   read: Array.isArray(saved?.read) ? saved.read.filter(title => sections.some(section => section.title === title)) : []
  };
  readingState[key] = progress;
  readingContext = {key, sections, progress, index: 0, elements: Array.from(main.querySelectorAll('.lesson-section'))};
  const lastIndex = sections.findIndex(section => section.title === progress.last);
  const panel = document.createElement('div');
  panel.className = 'reading-progress-panel';
  panel.innerHTML = `<div class="reading-progress-heading"><strong>ความคืบหน้าในบทนี้</strong><span data-reading-count></span></div>
   <p class="reading-current" data-reading-current></p>
   ${lastIndex >= 0 ? `<div class="reading-resume"><p>ครั้งก่อนอ่านถึง ${esc(sections[lastIndex].title)}</p><button class="btn small" data-scroll="section-${lastIndex}">อ่านต่อจากหัวข้อล่าสุด ${icon('arrow',14)}</button></div>` : ''}
   <p class="tiny-note">กดวงกลมในสารบัญหรือปุ่มท้ายหัวข้อเพื่อมาร์คว่าอ่านแล้ว ตำแหน่งที่อ่านบันทึกในเบราว์เซอร์นี้เมื่ออนุญาตให้จัดเก็บข้อมูล</p>
   <details class="mobile-reading-toc"><summary>สารบัญและหัวข้อที่อ่านแล้ว</summary><nav aria-label="สารบัญสำหรับมือถือ">${readingLinks(sections)}</nav></details>`;
  main.querySelector('.reading').prepend(panel);
  const toc = main.querySelector('.toc');
  toc.querySelectorAll('[data-scroll]').forEach(link => link.remove());
  const navigation = document.createElement('nav');
  navigation.setAttribute('aria-label', 'หัวข้อและความคืบหน้าการอ่าน');
  navigation.innerHTML = readingLinks(sections);
  toc.querySelector('h2, h3').after(navigation);
  readingContext.elements.forEach((section, index) => {
   const footer = document.createElement('div');
   footer.className = 'section-reading-actions';
   footer.innerHTML = `<button class="btn small" data-section-read="${index}" aria-pressed="false"></button>`;
   section.append(footer);
  });
  updateReadingMarkers();
 }
 function updateReadingMarkers() {
  if (!readingContext) return;
  const {sections, progress, index} = readingContext;
  for (const link of main.querySelectorAll('[data-reading-link]')) {
   const sectionIndex = Number(link.dataset.readingLink);
   const read = progress.read.includes(sections[sectionIndex].title);
   const active = sectionIndex === index;
   link.classList.toggle('reading-active', active);
   link.classList.toggle('reading-complete', read);
   const row = link.closest('.reading-toc-item');
   row.classList.toggle('reading-active', active);
   const mark = row.querySelector('.reading-tick');
   mark.innerHTML = read ? icon('check',14) : '';
   mark.setAttribute('aria-pressed', String(read));
   mark.setAttribute('aria-label', (read ? 'ยกเลิกมาร์ค · ' : 'มาร์คว่าอ่านแล้ว · ') + sections[sectionIndex].title);
   if (active) link.setAttribute('aria-current', 'location');
   else link.removeAttribute('aria-current');
  }
  for (const button of main.querySelectorAll('[data-section-read]')) {
   const read = progress.read.includes(sections[Number(button.dataset.sectionRead)].title);
   button.setAttribute('aria-pressed', String(read));
   button.classList.toggle('success', read);
   button.innerHTML = icon('check',15) + (read ? 'อ่านหัวข้อนี้แล้ว · ยกเลิกมาร์ค' : 'อ่านหัวข้อนี้แล้ว');
  }
  main.querySelector('[data-reading-count]').textContent = `อ่านแล้ว ${progress.read.length} / ${sections.length} หัวข้อ`;
  main.querySelector('[data-reading-current]').textContent = 'กำลังอ่าน · ' + sections[index].title;
 }
 function updateReadingPosition() {
  readingFrame = null;
  if (!readingContext) return;
  const top = document.querySelector('.topbar').getBoundingClientRect().bottom + 24;
  let index = 0;
  readingContext.elements.forEach((section, sectionIndex) => {
   if (section.getBoundingClientRect().top <= top) index = sectionIndex;
  });
  if (window.scrollY + innerHeight >= document.documentElement.scrollHeight - 2) index = readingContext.sections.length - 1;
  const target = readingContext.scrollTarget;
  if (target && Math.abs(window.scrollY - target.top) < 2) {
   index = target.index;
   target.reached = true;
  } else if (target?.reached) readingContext.scrollTarget = null;
  if (readingContext.index !== index) {
   readingContext.index = index;
   updateReadingMarkers();
  }
  if (window.scrollY > 0 && readingContext.progress.last !== readingContext.sections[index].title) {
   readingContext.progress.last = readingContext.sections[index].title;
   saveReading();
  }
 }
 function markReadingSection(index) {
  if (!readingContext || !readingContext.sections[index]) return;
  const {progress, sections} = readingContext;
  const title = sections[index].title;
  if (progress.read.includes(title)) progress.read = progress.read.filter(value => value !== title);
  else progress.read.push(title);
  progress.last = sections[readingContext.index].title;
  saveReading();
  updateReadingMarkers();
  toast(storageOK ? 'บันทึกเครื่องหมายการอ่านแล้ว' : 'บันทึกได้เฉพาะขณะเปิดหน้านี้ เบราว์เซอร์ไม่อนุญาตให้จัดเก็บข้อมูล');
 }
 function scrollToReadingSection(id, behavior = 'smooth') {
  const section = document.getElementById(id);
  if (!section) return;
  const offset = document.querySelector('.topbar').offsetHeight + 20;
  const top = Math.max(0, Math.min(
   document.documentElement.scrollHeight - innerHeight,
   window.scrollY + section.getBoundingClientRect().top - offset
  ));
  const index = readingContext?.elements.indexOf(section);
  if (index >= 0) readingContext.scrollTarget = {index, top, reached: false};
  window.scrollTo({
   top,
   behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : behavior
  });
  if (readingContext) updateReadingPosition();
 }
 window.addEventListener('scroll', () => {
  if (readingContext && readingFrame === null) readingFrame = requestAnimationFrame(updateReadingPosition);
 }, {passive: true});
 let labState = {schemaVersion:2,done: [], runs: {}, best: {}};
 let labMigrated=false;
 try {
  const saved = JSON.parse(localStorage.getItem(LAB_KEY));
  if (saved && Array.isArray(saved.done) && saved.runs && saved.best) { labState = saved; if(saved.schemaVersion!==2){labState.schemaVersion=2;labState.best={};for(const run of Object.values(labState.runs)){run.finished=false;run.revision=2;}labMigrated=true;} }
 } catch { storageOK = false; }
 function saveLabState() {
  try { localStorage.setItem(LAB_KEY, JSON.stringify(labState)); }
  catch { storageOK = false; toast('เบราว์เซอร์ไม่อนุญาตให้บันทึก คำตอบจะอยู่จนกว่าจะปิดหน้านี้'); }
 }
 if(labMigrated)saveLabState();
 function commandMatches(question,answer) { return window.PracticalTools.commandMatches(question,answer); }
 function practicalCard(exam, exams) {
  const chapter = chapters.find(c => c.id === exam.id);
  const run = labState.runs[exam.id];
  const status = exams
   ? (labState.best[exam.id] === undefined ? 'ยังไม่ได้ตรวจคำตอบ' : `คะแนนสูงสุด ${labState.best[exam.id]} / ${exam.questions.length}`)
   : (labState.done.includes(exam.id) ? 'อ่านบทเรียนนี้แล้ว' : `${chapter.labs.length} งานจากใบงาน`);
  return `<section class="quiz-choice"><span class="label">${exams?'ชุดสอบ':'บทเรียนปฏิบัติ'} ${exam.id} · ${exams?exam.questions.length+' ข้อ':chapter.labs.length+' งาน'}</span>
   <h2>${esc(exam.title)}</h2><p>${esc(exam.scenario)}</p>
   <div class="actions"><a class="btn primary small" href="#/${exams?'lab-exam':'lab'}/${exam.id}">${exams?(run&&!run.finished?'ทำชุดนี้ต่อ':'ทำข้อสอบชุดนี้'):'อ่านบทเรียน'}</a>
   <a class="btn small" href="#/${exams?'lab':'lab-exam'}/${exam.id}">${exams?'อ่านบทเรียนประกอบ':'ไปทำข้อสอบ'}</a></div><p class="tiny-note">${status}</p></section>`;
 }
 function practicalIndex(exams = false) {
  sidebar(exams ? 'labQuiz' : 'labs');
  const title = exams ? 'ข้อสอบภาคปฏิบัติ' : 'บทเรียนภาคปฏิบัติ';
  breadcrumb(title);
  main.innerHTML = `<div class="page-head"><div><h1>${title}</h1><p class="lead">${exams
   ? '8 ชุดตามเรื่อง · ชุดละ 8 ข้อ · เขียนคำสั่ง เติมบรรทัด และแก้ชุดคำสั่ง พร้อมเฉลยทีละบรรทัด'
   : 'คำสั่งจาก 22 งานแลบ แสดงพร้อมความหมายทีละบรรทัด โหมดที่ใช้ และวิธีตรวจผล'}</p></div>
   <a class="btn" href="#/${exams?'labs':'lab-exams'}">${exams?'อ่านบทเรียนปฏิบัติ':'เลือกชุดข้อสอบปฏิบัติ'} ${icon('arrow',16)}</a></div>
   <div class="quiz-chooser">${practicalExams.map(exam=>practicalCard(exam,exams)).join('')}</div>`;
 }
 function practicalLesson(id) {
  const c = chapters.find(chapter=>chapter.id===id);
  const exam = practicalExams.find(item=>item.id===id);
  if (!c || !exam) { location.hash = '#/labs'; return; }
  sidebar('labs', id);
  breadcrumb('ปฏิบัติ · ' + exam.title);
  main.innerHTML = `<div class="page-head"><div><p class="chapter-label">บทเรียนภาคปฏิบัติ ${id} / 8</p><h1>${esc(exam.title)}</h1><p class="lead">${esc(exam.scenario)}</p></div>
   <a class="btn primary" href="#/lab-exam/${id}">ทำข้อสอบชุดนี้ ${icon('arrow',16)}</a></div>
   <div class="actions lab-links"><a class="btn small" href="#/labs">บทเรียนปฏิบัติทั้งหมด</a><a class="btn small" href="#/chapter/${id}">อ่านทฤษฎีประกอบ</a></div>
   <div class="reading-layout"><article class="reading"><div class="objectives"><strong>ฝึกพิมพ์คำสั่งเป็นชุด ก่อนเข้าสอบปฏิบัติ</strong><p>อ่านคำสั่งคู่กับความหมายทีละบรรทัด ดูโหมดก่อนและหลังพิมพ์ แล้วคัดลอกทั้งชุดไปซ้อมกับอุปกรณ์ตามผัง</p><ul class="cli-mode-legend"><li><code>&gt;</code> ใช้ <code>enable</code> เข้า <code>#</code></li><li><code>#</code> ใช้คำสั่งตรวจผล หรือ <code>configure terminal</code> เพื่อเริ่มตั้งค่า</li><li><code>(config)#</code> เลือก interface/router/line ก่อนใส่ค่าของส่วนนั้น</li><li><code>$</code> คือ terminal ของ Kali; Display Filter ใส่ใน Wireshark</li></ul><p>คำสั่งยาวในกรอบเลื่อนแนวนอนได้; ปุ่มคัดลอกทั้งชุดเก็บคำสั่งครบตามบรรทัด</p></div>
   ${c.labs.map(labSection).join('')}
   ${id===5?'<a class="btn" href="#/lab/8">ฝึก EIGRP และ redistribution ต่อในบท 8</a>':''}
   <div class="chapter-end"><button class="btn ${labState.done.includes(id)?'success':'primary'}" data-lab-done="${id}">${labState.done.includes(id)?'อ่านบทปฏิบัตินี้แล้ว':'บันทึกว่าอ่านบทปฏิบัติแล้ว'}</button><a class="btn" href="#/lab-exam/${id}">ไปทำข้อสอบ ${exam.questions.length} ข้อ</a></div>
   <details class="sources"><summary>ใบงานประกอบบทนี้</summary><ul>${c.courseFiles.map(ref=>`<li>${esc(ref)}</li>`).join('')}</ul></details></article>
   <aside class="toc"><h2>งานในบทนี้</h2>${c.labs.map((s,i)=>`<a href="#/lab/${id}" data-scroll="section-${i}">${esc(s.title)}</a>`).join('')}<a href="#/lab-exam/${id}">ทำข้อสอบชุดนี้</a></aside></div>`;
  setupReading("lab", id, c.labs);
 }
 function practicalExam(id) {
  const exam=practicalExams.find(item=>item.id===id);
  if(!exam){location.hash='#/lab-exams';return;}
  let run=labState.runs[id];
  if(!run||!run.answers||typeof run.answers!=='object')run=labState.runs[id]={answers:{},finished:false,revision:exam.revision};
  if(run.revision!==exam.revision){run.finished=false;run.revision=exam.revision;delete labState.best[id];saveLabState();}
  sidebar('labQuiz',id);breadcrumb('ข้อสอบปฏิบัติ · ชุด '+id);
  const score=exam.questions.filter(q=>commandMatches(q,run.answers[q.id]||'')).length;
  const labels={single:'เขียนคำสั่ง',block:'เขียนทั้งชุด',fill:'เติมบรรทัดที่หาย',repair:'แก้คำสั่ง'};
  main.innerHTML=`<div class="quiz-shell practical-exam"><div class="page-head"><div><p class="chapter-label">ข้อสอบภาคปฏิบัติ ชุด ${id} / 8</p><h1>${esc(exam.title)}</h1><p class="lead">${esc(exam.scenario)}</p></div></div>
   <div class="actions lab-links"><a class="btn small" href="#/lab-exams">เลือกชุดข้อสอบ</a><a class="btn small" href="#/lab/${id}">ดูคำสั่งพร้อมความหมาย</a></div>
   ${run.finished?`<div class="result-head"><h2>ผลชุดที่ ${id}</h2><p class="lab-score">${score} / ${exam.questions.length}</p><p>ตรวจทั้งชุดและลำดับบรรทัด; ดูจุดที่ต้องแก้กับเฉลยด้านล่าง</p><button class="btn primary" data-lab-retry="${id}">ทำชุดนี้ใหม่</button></div>`:'<div class="note"><div><strong>ซ้อมคำสั่งล้วน 8 ข้อ</strong><ul><li>เขียนหนึ่งคำสั่งต่อบรรทัด; ข้อเขียนชุดและข้อแก้คำสั่งให้ตอบทั้งชุดตามลำดับที่โจทย์ระบุ</li><li>ข้อเติมบรรทัด ให้พิมพ์เฉพาะคำสั่งแทน ____</li><li>รองรับคำย่อที่แสดงในบทเรียน เช่น sh, conf t, int, shut; ชื่อ ACL, route-map และ secret ต้องตรงตัวพิมพ์</li><li>เปิดเฉลยรายข้อเพื่อทบทวนได้ก่อนส่ง; คะแนนนี้ใช้ฝึกเทียบแม่แบบคำสั่งตามลำดับที่โจทย์กำหนด</li></ul></div></div>'}
   ${exam.questions.map((q,i)=>{
    const correct=commandMatches(q,run.answers[q.id]||'');
    const rows=q.kind==='fill'?2:Math.min(12,Math.max(2,q.answer.split('\n').length+1));
    return `<section class="question-panel" id="lab-question-${i}"><div class="question-top"><span>ข้อ ${i+1} / ${exam.questions.length}</span><span class="command-kind">${labels[q.kind]}</span></div><h2>${esc(q.prompt)}</h2><p class="command-context">${esc(q.context)}</p>
     ${q.given?`<div class="given-commands"><p><strong>${q.kind==='fill'?'เติมบรรทัด ____ ในชุดนี้':'ชุดที่โจทย์ให้มาเพื่อแก้ไข'}</strong></p><pre><code>${esc(q.given)}</code></pre></div>`:''}
     <label class="answer-label" for="${q.id}">${q.kind==='fill'?'คำสั่งเฉพาะช่องว่าง':'คำสั่งของคุณ'}</label><textarea class="cli-answer" id="${q.id}" data-lab-answer="${q.id}" data-set="${id}" rows="${rows}" spellcheck="false" autocapitalize="off" autocomplete="off" placeholder="หนึ่งคำสั่งต่อบรรทัด ไม่ต้องพิมพ์ prompt" ${run.finished?'readonly':''}>${esc(run.answers[q.id]||'')}</textarea>
     ${run.finished?`<div class="feedback ${correct?'':'wrong'}"><strong>${correct?'คำสั่งครบและถูกต้อง':'ตรวจบรรทัดที่ต้องแก้'}</strong>${commandFeedback(q,run.answers[q.id]||'')}${commandSolution(q)}</div>`:`<details class="command-solution"><summary>เปิดเฉลยและความหมายทีละบรรทัด</summary>${commandSolution(q)}</details>`}</section>`;
   }).join('')}
   <div class="quiz-bottom">${run.finished?`<button class="btn" data-lab-retry="${id}">ทำชุดนี้ใหม่</button><a class="btn primary" href="#/${id<8?'lab-exam/'+(id+1):'lab-exams'}">${id<8?'ไปชุดถัดไป':'ดูชุดข้อสอบทั้งหมด'}</a>`:`<p id="lab-answer-count" role="status">ตอบแล้ว ${exam.questions.filter(q=>run.answers[q.id]?.trim()).length} / ${exam.questions.length} ข้อ</p><button class="btn primary" data-lab-submit="${id}">ส่งคำตอบและตรวจทั้งชุด</button>`}</div>
   <p class="tiny-note">${storageOK?'เก็บคำตอบอัตโนมัติในเบราว์เซอร์นี้':'เบราว์เซอร์ไม่อนุญาตให้บันทึก เก็บคำตอบได้เฉพาะขณะเปิดหน้านี้'}</p></div>`;
 }
 function submitPractical(id) {
  const exam = practicalExams.find(item=>item.id===id);
  const run = labState.runs[id];
  if (!exam || !run || run.finished) return;
  const missing=exam.questions.findIndex(q=>!run.answers[q.id]?.trim());
  if (missing>=0) {
   toast('กรุณาตอบข้อ ' + (missing+1) + ' ก่อนส่งทั้งชุด');
   document.getElementById(exam.questions[missing].id)?.focus();
   return;
  }
  run.finished=true;
  const score=exam.questions.filter(q=>commandMatches(q,run.answers[q.id])).length;
  labState.best[id]=Math.max(labState.best[id]||0,score);
  saveLabState();
  practicalExam(id);
  window.scrollTo({top:0});
 }
 document.getElementById('menu-toggle').innerHTML=icon('menu');document.getElementById('search-icon').innerHTML=icon('search',16);
 document.getElementById('menu-toggle').addEventListener('click',()=>{const open=document.body.classList.toggle('menu-open');document.getElementById('menu-toggle').setAttribute('aria-expanded',String(open))});document.getElementById('scrim').addEventListener('click',()=>{document.body.classList.remove('menu-open');document.getElementById('menu-toggle').setAttribute('aria-expanded','false')});
 main.addEventListener('click',async e=>{const b=e.target.closest('button,a');if(!b)return;
 if(b.hasAttribute('data-lab-done')) {
  const id=Number(b.dataset.labDone);
  if(!labState.done.includes(id)) labState.done.push(id);
  saveLabState(); practicalLesson(id); toast('บันทึกบทปฏิบัติที่อ่านแล้ว');
 }
 if(b.hasAttribute('data-lab-submit')) submitPractical(Number(b.dataset.labSubmit));
 if(b.hasAttribute('data-lab-retry')) {
  const id=Number(b.dataset.labRetry);
  labState.runs[id]={answers:{},finished:false,revision:practicalExams.find(exam=>exam.id===id).revision};
  saveLabState(); practicalExam(id); window.scrollTo({top:0});
 }
 if(b.hasAttribute('data-section-read')) markReadingSection(Number(b.dataset.sectionRead));
 if(b.hasAttribute('data-toc-mark')) markReadingSection(Number(b.dataset.tocMark));
 if(b.hasAttribute('data-start')){startQuiz(b.dataset.start,b.dataset.mode||'practice');window.scrollTo({top:0});}
 if(b.hasAttribute('data-scroll')){e.preventDefault();scrollToReadingSection(b.dataset.scroll);}
 if(b.hasAttribute('data-tab')){const id=Number(b.dataset.chapter);location.hash=`#/chapter/${id}${b.dataset.tab==='lesson'?'':'?'+b.dataset.tab}`;}
 if(b.hasAttribute('data-done')){const id=Number(b.dataset.done);if(!state.done.includes(id))state.done.push(id);save();b.classList.remove('primary');b.classList.add('success');b.innerHTML=icon('check',17)+'อ่านบทนี้แล้ว';sidebar('book',id);toast('บันทึกว่าอ่านบทนี้แล้ว');}
 if(b.hasAttribute('data-copy')){const code=b.closest('.code-header').nextElementSibling.textContent;try{await navigator.clipboard.writeText(code);toast('คัดลอกคำสั่งแล้ว')}catch(err){toast('คัดลอกอัตโนมัติไม่ได้ กรุณาเลือกข้อความในช่องคำสั่ง')}}
 if(b.hasAttribute('data-sim'))Diagrams.update(b.closest('.diagram'),b.dataset.sim);
 if(b.hasAttribute('data-option')){session.choices[session.ids[session.index]]=Number(b.dataset.option);saveSession();const y=window.scrollY;quiz();window.scrollTo({top:y});}
 if(b.hasAttribute('data-check')){const id=session.ids[session.index];if(session.choices[id]!==undefined){session.checked[id]=true;record(id,session.choices[id]);saveSession();const y=window.scrollY;quiz();window.scrollTo({top:y});}}
 if(b.hasAttribute('data-next')){session.index=Math.min(session.ids.length-1,session.index+1);saveSession();quiz();window.scrollTo({top:0});}
 if(b.hasAttribute('data-prev')){session.index=Math.max(0,session.index-1);saveSession();quiz();window.scrollTo({top:0});}
 if(b.hasAttribute('data-jump')){session.index=Number(b.dataset.jump);saveSession();quiz();window.scrollTo({top:0});}
 if(b.hasAttribute('data-finish'))finish();
 if(b.hasAttribute('data-retry')){session={...session,index:0,choices:{},checked:{},orders:Object.fromEntries(session.ids.map(id=>[id,shuffle([0,1,2,3])])),startedAt:Date.now(),finished:false,score:undefined};saveSession();quiz();window.scrollTo({top:0});}
 });
 main.addEventListener('input', e => {
  const input=e.target.closest('[data-lab-answer]');
  if(!input) return;
  const id=Number(input.dataset.set);
  const exam=practicalExams.find(item=>item.id===id);
  const run=labState.runs[id];
  if(!exam || !run || run.finished) return;
  run.answers[input.dataset.labAnswer]=input.value;
  saveLabState();
  document.getElementById('lab-answer-count').textContent='ตอบแล้ว '+exam.questions.filter(q=>run.answers[q.id]?.trim()).length+' / '+exam.questions.length+' ข้อ';
 });
 main.addEventListener('change',e=>{if(e.target.id==='review-filter'){reviewFilter=e.target.value;review()}});
 const search = document.getElementById('search'), searchResults = document.getElementById('search-results');
 search.addEventListener('input', () => {
  const term = search.value.trim().toLowerCase();
  if (!term) { searchResults.hidden = true; return; }
  const found = [];
  for (const c of chapters) {
   if ([c.title,c.shortTitle,c.subtitle].join(' ').toLowerCase().includes(term)) found.push({c,title:c.title});
   for (const [tab,sections] of [['lesson',c.sections],['lab',c.labs]]) {
    sections.forEach((s,i) => {
     const words = [s.title,...s.body,...(s.bullets||[]),s.code,...(s.steps||[]).map(step => step.code),...(s.example?.body||[])];
     if (words.join(' ').toLowerCase().includes(term)) found.push({c,title:s.title,i,tab});
    });
   }
  }
  searchResults.hidden = false;
  searchResults.innerHTML = found.length ? found.slice(0,10).map(r=>`<a class="search-result" href="#/${r.tab==='lab'?'lab':'chapter'}/${r.c.id}" ${r.i!==undefined?`data-search-section="${r.i}"`:''}>${esc(r.title)}<small>บท ${r.c.id} · ${r.tab==='lab'?'ภาคปฏิบัติ':'ภาคทฤษฎี'}</small></a>`).join('') : '<div class="search-empty">ไม่พบหัวข้อนี้ ลองคำว่า VLAN, Cost หรือ Gateway</div>';
 });
 let searchTarget;
 function revealSearchTarget() {
  if (searchTarget === undefined) return;
  const section = document.getElementById('section-' + searchTarget);
  const solution = section?.querySelector('.lab-answer');
  if (solution) solution.open = true;
  if (section) scrollToReadingSection(section.id, "auto");
  searchTarget = undefined;
 }
 searchResults.addEventListener('click', e => {
  const link = e.target.closest('a');
  if (!link) return;
  e.preventDefault();
  const hash = link.getAttribute('href');
  searchTarget = link.dataset.searchSection;
  searchResults.hidden = true;
  search.value = '';
  if (location.hash === hash) {
   render();
   revealSearchTarget();
  } else {
   location.hash = hash;
  }
 });
 document.addEventListener('click',e=>{if(!e.target.closest('.search-wrap'))searchResults.hidden=true});document.addEventListener('keydown',e=>{if(e.key==='Escape'){searchResults.hidden=true;document.body.classList.remove('menu-open');document.getElementById('menu-toggle').setAttribute('aria-expanded','false')}if(e.key==='/'&&!['INPUT','TEXTAREA','SELECT'].includes(document.activeElement.tagName)){e.preventDefault();search.focus()}});
 window.addEventListener('hashchange',()=>{render();window.scrollTo({top:0});revealSearchTarget()});render();
})();
