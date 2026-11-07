import fs from 'node:fs';
import assert from 'node:assert/strict';
const chapters=['content/chapters-1-4.json','content/chapters-5-8.json'].flatMap(p=>JSON.parse(fs.readFileSync(p,'utf8').replace(/^\uFEFF/,'')));
assert.equal(chapters.length,8);const ids=new Set();
for(const [i,c] of chapters.entries()){
 assert.equal(c.id,i+1);assert.equal(c.questions.length,15,`Chapter ${c.id} needs 15 questions`);assert(c.sections.length>=5);assert(c.summary.length>=5);assert(c.sources.length);
 for(const s of c.sections){assert(s.title);assert(Array.isArray(s.body));if(s.table)for(const row of s.table.rows)assert.equal(row.length,s.table.headers.length);if(s.diagram)assert(['switch','vlan','stp','intervlan','routing','gateway','auth','wan'].includes(s.diagram));}
 for(const q of c.questions){assert(!ids.has(q.id));ids.add(q.id);assert.equal(q.options.length,4);assert.equal(new Set(q.options).size,4);assert(Number.isInteger(q.answer)&&q.answer>=0&&q.answer<4);assert(q.explanation.length>30);assert(q.prompt.length>12);assert(['พื้นฐาน','ประยุกต์','วิเคราะห์'].includes(q.level));}
}
assert.equal(ids.size,120);
fs.writeFileSync('dist/data.js','window.CHAPTERS = '+JSON.stringify(chapters,null,2)+';\n');
console.log(JSON.stringify({chapters:chapters.length,questions:ids.size,sections:chapters.reduce((n,c)=>n+c.sections.length,0),diagramQuestions:chapters.reduce((n,c)=>n+c.questions.filter(q=>q.diagram).length,0),status:'pass'}));
