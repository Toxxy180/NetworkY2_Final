/* The same checker is used by the browser and the Node regression tests. */
(function(root,factory){
 const api=factory();
 if(typeof module==='object'&&module.exports)module.exports=api;
 else root.PracticalTools=api;
})(typeof window==='undefined'?globalThis:window,function(){
 'use strict';
 function normalizeCommand(value,type='ios'){
  let text=String(value).trim();
  if(type==='ios'){
   text=text.replace(/^[\w.-]+(?:\([^)]*\))?[#>]\s*/,'');
   text=text.replace(/^sh\b/i,'show').replace(/^conf(?:ig)?\s+t(?:erm)?$/i,'configure terminal')
    .replace(/^int\b/i,'interface').replace(/^(no\s+)?shut$/i,'$1shutdown')
    .replace(/^show ip int\b/i,'show ip interface').replace(/^show int\b/i,'show interfaces')
    .replace(/^ip add\b/i,'ip address');
   if(/^(?:interface\b|passive-interface\b|show (?:ip (?:ospf )?)?interfaces?\b)/i.test(text))
    text=text.replace(/\b(gigabitethernet|gi|g|fastethernet|fa|f)\s*(\d+(?:\/\d+)+(?:\.\d+)?)/gi,(_,prefix,num)=>(/^(f|fa|fast)/i.test(prefix)?'fa':'gi')+num);
   const words=text.split(/\s+/),lower=words.map(w=>w.toLowerCase()),sensitive=new Set();
   if(['hostname','name','password'].includes(lower[0]))sensitive.add(1);
   if(lower[0]==='enable'&&lower[1]==='secret')sensitive.add(2);
   if(lower[0]==='vtp'&&['domain','password'].includes(lower[1]))sensitive.add(2);
   if(lower[0]==='ip'&&lower[1]==='access-list')sensitive.add(3);
   if(lower[0]==='ip'&&lower[1]==='access-group')sensitive.add(2);
   lower.forEach((word,i)=>{if(word==='route-map'||word==='md5')sensitive.add(i+1)});
   if(lower[0]==='configure'&&lower[1]==='terminal')return 'configure terminal';
   if(lower[0]==='show'&&lower.at(-1)==='br')lower[lower.length-1]='brief';
   return words.map((word,i)=>sensitive.has(i)?word:lower[i]).join(' ');
  }
  if(type==='shell')text=text.replace(/^(?:[\w.@:~\/-]+\s*)?\$\s*/,'');
  const tokens=text.match(/"(?:\\.|[^"\\])*"|'[^']*'|[^\s]+/g)||[];
  return tokens.join(type==='filter'?'':' ');
 }
 function lines(value,type){
  return String(value??'').replace(/\r\n?/g,'\n').split('\n')
   .map(line=>line.trim()).filter(line=>line&&!(type==='ios'&&line.startsWith('!')));
 }
 function check(question,answer){
  const type=question.inputType||'ios',given=lines(answer,type);
  let best;
  for(const variant of question.accept){
   const expected=lines(variant,type),length=Math.max(given.length,expected.length);
   const rows=Array.from({length},(_,index)=>({line:index+1,expected:expected[index]||'',actual:given[index]||'',
    correct:!!expected[index]&&!!given[index]&&normalizeCommand(expected[index],type)===normalizeCommand(given[index],type)}));
   const matched=rows.filter(row=>row.correct).length;
   const result={correct:rows.every(row=>row.correct),matched,total:expected.length,rows};
   if(!best||result.correct||matched>best.matched)best=result;
   if(result.correct)break;
  }
  return best;
 }
 return {normalizeCommand,check,commandMatches:(question,answer)=>check(question,answer).correct};
});
