'use strict';
(() => {
 const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const sheets = window.OPENBOOK;
 // Keep the compact text intact for print; separate sentences on screen.
 const sentences = text => text.split(/(?<=[.!?])\s+(?=[\p{L}])/u).map(part=>`<span class="ob-sentence">${esc(part)}</span>`).join(' ');
 const block = item => `<section class="ob-block"><h3>${esc(item.title)}</h3>${item.text ? item.text.split('\n').map(p=>`<p>${sentences(p)}</p>`).join('') : ''}${item.code ? `<pre>${esc(item.code)}</pre>` : ''}</section>`;
 function pages(set) {
  return set.pages.map((page, index) => `<article class="ob-sheet" id="ob-side-${index+1}" aria-label="${esc(set.title)} ด้าน${esc(page.side)}">
   <header class="ob-sheet-head"><div><b>NETWORK / OPENBOOK</b><h2>${esc(set.title)} · ด้าน${esc(page.side)}</h2></div><div><strong>A4 · ${index+1}/2</strong><span>01076040</span></div></header>
   <div class="ob-sheet-caption">${esc(page.title)}</div>
   <div class="ob-columns" style="--ob-cols:${page.columns.length}">${page.columns.map(items=>`<div class="ob-column">${items.map(block).join('')}</div>`).join('')}</div>
   <footer class="ob-sheet-foot"><span>ยึด Scope ปลายภาค + สไลด์และแลปใน network_files · แม่แบบสำหรับคัดลงกระดาษ</span><span>${esc(set.title)} / ${esc(page.side)}</span></footer>
  </article>`).join('');
 }
 function mount(main, id) {
  const set = sheets.find(item => item.id === id) || sheets[0];
  document.body.classList.add('ob-active');
  const pdf = window.OPENBOOK_PDF_URLS?.[set.id] || `openbook-${set.id}.pdf`;
  main.innerHTML = `<div class="ob-page" data-set="${set.id}">
   <section class="ob-intro"><span class="ob-eyebrow">EXAM DESK / A4 FRONT + BACK</span><h1>Openbook พร้อมจดเข้าสอบ</h1><p>แยกทฤษฎีและปฏิบัติอย่างละ 1 แผ่น A4 หน้า–หลัง รวม 4 หน้า จัดหัวข้อให้คัดตัวเล็กและค้นระหว่างสอบได้เร็ว</p></section>
   <div class="ob-toolbar"><nav aria-label="เลือกชีท Openbook"><a href="#/openbook/theory" ${set.id==='theory'?'aria-current="page"':''}>ทฤษฎี · 2 หน้า</a><a href="#/openbook/practical" ${set.id==='practical'?'aria-current="page"':''}>ปฏิบัติ · 2 หน้า</a></nav><div class="ob-actions"><a class="btn" href="${esc(pdf)}" download="network-openbook-${set.id}-a4.pdf">ดาวน์โหลด PDF</a><button class="btn primary" type="button" data-ob-print>พิมพ์ ${esc(set.title)}</button></div></div>
   <aside class="ob-print-note"><strong>${esc(set.description)}</strong><p>หน้าจอขยายตัวอักษรให้อ่านง่าย · PDF และงานพิมพ์จัดแบบตัวเล็ก 3–4 คอลัมน์</p><p>พิมพ์ A4 แนวตั้ง · ขนาดจริง 100% · สองหน้าแบบพลิกขอบยาว · ปิดหัวกระดาษ/ท้ายกระดาษของเบราว์เซอร์</p><div><a href="#ob-side-1" data-ob-side="1">ไปด้านหน้า ↓</a><a href="#ob-side-2" data-ob-side="2">ไปด้านหลัง ↓</a></div></aside>
   <div class="ob-sheets">${pages(set)}</div>
   <p class="ob-endnote">คำสั่งในกรอบที่ยาวอาจตัดบรรทัดเพื่อจัดหน้า ให้พิมพ์ต่อเป็นคำสั่งเดียว · ชื่อ interface / IP / VLAN ต้องตรงโจทย์ · อ่านคำอธิบายเต็มและฝึกคำสั่งต่อได้ในบทเรียนทั้ง 8 บท</p>
  </div>`;
  main.querySelector('[data-ob-print]').addEventListener('click',()=>window.print());
  main.querySelectorAll('[data-ob-side]').forEach(link=>link.addEventListener('click',event=>{
   event.preventDefault();
   main.querySelector(`#ob-side-${link.dataset.obSide}`).scrollIntoView({behavior:'instant',block:'start'});
  }));
 }
 window.Openbook = {mount, unmount(){document.body.classList.remove('ob-active');}};
})();
