import fs from 'node:fs';
import assert from 'node:assert/strict';
const chapters=['content/chapters-1-4.json','content/chapters-5-8.json'].flatMap(p=>JSON.parse(fs.readFileSync(p,'utf8').replace(/^\uFEFF/,'')));
const review = JSON.parse(fs.readFileSync('content/course-review.json', 'utf8'));
assert.equal(review.length, chapters.length);
for (const [i, unit] of review.entries()) {
 const chapter = chapters[i];
 assert.equal(unit.id, chapter.id);
 assert(unit.refs.length && unit.theory.length && unit.labs.length);
 for (const lab of unit.labs) {
  assert(lab.title && lab.body.length && lab.steps.length && lab.example.body.length);
  for (const step of lab.steps) assert(step.device && step.code.trim());
 }
 chapter.sections.push(...unit.theory);
 chapter.labs = unit.labs;
 chapter.courseFiles = unit.refs;
}
assert.equal(chapters.length,8);const ids=new Set();
for(const [i,c] of chapters.entries()){
 assert.equal(c.id,i+1);assert.equal(c.questions.length,15,`Chapter ${c.id} needs 15 questions`);assert(c.sections.length>=5);assert(c.summary.length>=5);assert(c.sources.length);
 for(const s of c.sections){assert(s.title);assert(Array.isArray(s.body));if(s.table)for(const row of s.table.rows)assert.equal(row.length,s.table.headers.length);if(s.diagram)assert(['switch','vlan','stp','intervlan','routing','gateway','auth','wan'].includes(s.diagram));}
 for(const q of c.questions){assert(!ids.has(q.id));ids.add(q.id);assert.equal(q.options.length,4);assert.equal(new Set(q.options).size,4);assert(Number.isInteger(q.answer)&&q.answer>=0&&q.answer<4);assert(q.explanation.length>30);assert(q.prompt.length>12);assert(['พื้นฐาน','ประยุกต์','วิเคราะห์'].includes(q.level));}
}
assert.equal(ids.size,120);
const practicalExams = JSON.parse(fs.readFileSync('content/practical-exams.json', 'utf8'));
assert.equal(practicalExams.length, chapters.length);
const practicalIds = new Set();
for (const [i, exam] of practicalExams.entries()) {
 assert.equal(exam.id, chapters[i].id);
 assert(exam.title && exam.scenario && exam.questions.length === 5);
 for (const question of exam.questions) {
  assert(!practicalIds.has(question.id));
  practicalIds.add(question.id);
  assert(question.prompt && question.context && question.answer && question.explanation);
  assert(question.accept.includes(question.answer));
  assert(['ios', 'shell', 'filter'].includes(question.inputType));
 }
}
const openbook = JSON.parse(fs.readFileSync('content/openbook.json', 'utf8'));
assert.deepEqual(openbook.map(set => set.id), ['theory', 'practical']);
for (const set of openbook) {
 assert.equal(set.pages.length, 2, 'Each Openbook sheet must have a front and back');
 assert.deepEqual(set.pages.map(page => page.side), ['หน้า', 'หลัง']);
 for (const page of set.pages) {
  assert.equal(page.columns.length, set.id === 'theory' ? 4 : 3);
  for (const column of page.columns) {
   assert(column.length);
   for (const block of column) assert(block.title && (block.text || block.code));
  }
 }
}
const data = 'window.CHAPTERS = '+JSON.stringify(chapters,null,2)+';\n'
 + 'window.PRACTICAL_EXAMS = '+JSON.stringify(practicalExams,null,2)+';\n'
 + 'window.OPENBOOK = '+JSON.stringify(openbook,null,2)+';\n';
fs.writeFileSync('dist/data.js', data);

// Keep the offline page at the repository root in sync with the served app.
const asset = name => fs.readFileSync('dist/' + name, 'utf8');
const encoded = name => fs.readFileSync('dist/' + name).toString('base64');
const pdf = `window.pdfUrl=URL.createObjectURL(new Blob([Uint8Array.from(atob('${encoded('exam-scope.pdf')}'),c=>c.charCodeAt(0))],{type:'application/pdf'}));`;
const openbookPDFs = 'window.OPENBOOK_PDF_URLS={'+openbook.filter(set=>fs.existsSync('dist/openbook-'+set.id+'.pdf')).map(set=>`${JSON.stringify(set.id)}:URL.createObjectURL(new Blob([Uint8Array.from(atob('${encoded('openbook-'+set.id+'.pdf')}'),c=>c.charCodeAt(0))],{type:'application/pdf'}))`).join(',')+'};';
const template = asset('index.html');
const deferredAssets = [...template.matchAll(/<script src="([^"]+)" defer><\/script>/g)].map(match => match[1]);
const scripts = deferredAssets.map(name => {
 if (name === 'data.js') return data;
 if (name === 'app.js') return asset(name).replaceAll('href="exam-scope.pdf"', 'href="${window.pdfUrl}"');
 return asset(name);
});
const script = [pdf, openbookPDFs, ...scripts].join('\n').replace(/<\/script/gi, '<\\/script');
const offline = template
 .replace('href="favicon.svg"', () => `href="data:image/svg+xml;base64,${encoded('favicon.svg')}"`)
 .replace(/<link [^>]*href="https:\/\/fonts\.[^>]+>/g, '')
 .replace(/<link rel="stylesheet" href="([^"]+)">/g, (_, name) => `<style>${asset(name)}</style>`)
 .replace(/<script src="[^"]+" defer><\/script>/g, '')
 .replace('</body>', () => `<script>${script}</script></body>`);
fs.writeFileSync('../index.html', offline);
console.log(JSON.stringify({chapters:chapters.length,questions:ids.size,practicalSets:practicalExams.length,practicalQuestions:practicalIds.size,sections:chapters.reduce((n,c)=>n+c.sections.length,0),diagramQuestions:chapters.reduce((n,c)=>n+c.questions.filter(q=>q.diagram).length,0),status:'pass'}));
