(() => {
 'use strict';

 const scenarios = [
  {
   id: 'gateway', title: 'สลับ Gateway', chapter: 6,
   description: 'HSRP กลุ่ม 1 ใช้ VIP 192.168.10.1 โดย R1 priority 110, R2 priority 100 และเปิด preempt พร้อมติดตาม uplink',
   steps: [
    {title:'R1 เป็น Active', action:'ตัด Uplink R1', paths:['client-switch','switch-r1','r1-server'],
     detail:'PC A ส่งข้อมูลผ่าน Virtual Gateway 192.168.10.1 โดย R1 เป็น Active ส่วน R2 เตรียมรับช่วง ขณะนี้ทั้งสองเส้นทางยังพร้อมใช้งาน',
     command:'show standby brief', output:'R1  Gi0/1  Grp 1  Pri 110  Active\nR2  Gi0/1  Grp 1  Pri 100  Standby'},
    {title:'Uplink R1 ถูกตัด', action:'ให้ R2 รับช่วง', paths:[], failed:['r1-server'],
     detail:'ลิงก์ออกจาก R1 เสีย แต่ขา LAN ยังทำงานอยู่ Tracking จึงลด priority ของ R1 ลง 30 เหลือ 80 ช่วงนี้รอการเปลี่ยนบทบาท',
     command:'show track 1', output:'Track 1\n  Interface GigabitEthernet0/2 line-protocol\n  Line protocol is Down'},
    {title:'R2 รับช่วง', action:'คืน Uplink R1', paths:['client-switch','switch-r2','r2-server'], failed:['r1-server'],
     detail:'R2 มี priority 100 สูงกว่า R1 ที่เหลือ 80 และเปิด preempt จึงเข้ารับบทบาท Active เครื่องลูกข่ายยังใช้ Gateway 192.168.10.1 เดิม',
     command:'show standby brief', output:'R1  Gi0/1  Grp 1  Pri 80   Standby\nR2  Gi0/1  Grp 1  Pri 100  Active'},
    {title:'R1 กลับมารับบทบาท', action:'เริ่มใหม่', paths:['client-switch','switch-r1','r1-server'],
     detail:'เมื่อ uplink กลับมา Tracking คืน priority ของ R1 เป็น 110 และ preempt ทำให้ R1 กลับเป็น Active อีกครั้ง ให้ทดสอบ ping ไปเครื่องหลัง Gateway เพื่อยืนยันการส่งต่อ',
     command:'show standby brief', output:'R1  Gi0/1  Grp 1  Pri 110  Active\nR2  Gi0/1  Grp 1  Pri 100  Standby'}
   ]
  },
  {
   id:'ospf', title:'เส้นทาง OSPF', chapter:5,
   description:'R1 ไป LAN ของ R4 ได้สองทาง ใช้ reference bandwidth 10000 Mbps และลิงก์สำรอง 1.544 Mbps ตามแลบ',
   steps:[
    {title:'เลือกทาง Cost 20', action:'ตัด Gi0/1 ของ R4', paths:['r1-switch','switch-r4','r4-lan'],
     detail:'ทางผ่าน Switch มี cost 10 จากขาออก R1 บวก 10 จากขา LAN ของ R4 รวม 20 ส่วนทางตรงช้ากว่ามี cost 6476 + 10 = 6486 จึงเก็บไว้เป็นทางสำรอง',
     command:'show ip route 10.0.4.0', output:'O 10.0.4.0/24 [110/20]\n  via 192.168.100.4, GigabitEthernet0/1'},
    {title:'เส้นทางหลักขาด', action:'คำนวณทางใหม่', paths:[], failed:['switch-r4'],
     detail:'เมื่อ Gi0/1 ของ R4 ขาด R1 ต้องตรวจพบการเปลี่ยนแปลงและคำนวณ SPF ใหม่ การตรวจพบขึ้นอยู่กับสถานะลิงก์และ OSPF timers ของ topology จริง',
     command:'show ip ospf neighbor', output:'ตรวจ Neighbor ID และ State ของ R4\nบนวงหลักและลิงก์ point-to-point แยกกัน'},
    {title:'ใช้ลิงก์ Point-to-Point', action:'คืนลิงก์หลัก', paths:['r1-r4','r4-lan'], failed:['switch-r4'],
     detail:'R1 เปลี่ยน next hop เป็น 172.16.14.2 ผ่าน Gi0/3 ค่า metric รวม 6486 เป็น cost ขาออกของ R1 ไป R4 และขา LAN ของ R4',
     command:'show ip route 10.0.4.0', output:'O 10.0.4.0/24 [110/6486]\n  via 172.16.14.2, GigabitEthernet0/3'},
    {title:'กลับมาใช้ทาง Cost ต่ำ', action:'เริ่มใหม่', paths:['r1-switch','switch-r4','r4-lan'],
     detail:'เมื่อ Gi0/1 ของ R4 กลับมาทำงานและ adjacency พร้อม OSPF เลือกทาง metric 20 อีกครั้ง เส้นทางที่สั้นทางกายภาพจึงอาจมี cost สูงกว่าอีกเส้นทางได้',
     command:'show ip route 10.0.4.0', output:'O 10.0.4.0/24 [110/20]\n  via 192.168.100.4, GigabitEthernet0/1'}
   ]
  },
  {
   id:'vlan', title:'ข้าม VLAN', chapter:4,
   description:'PC A อยู่ VLAN 10 และ Web Server อยู่ VLAN 20 โดยใช้ Router-on-a-Stick ที่ R1 สำหรับส่งต่อข้าม subnet',
   steps:[
    {title:'ส่งให้ Default Gateway', action:'ส่งขึ้น Trunk', paths:['pc-switch'],
     detail:'PC A พบว่า Server อยู่คนละ subnet จึงใช้ ARP หา MAC ของ Gateway 192.168.10.1 แล้วส่งเฟรมที่มี Destination MAC ของ Gateway โดย Destination IP ยังเป็น Server',
     command:'ip neigh', output:'192.168.10.1 dev eth0 lladdr 02:00:00:00:10:01\nตัวอย่างรายการ ARP ของ Gateway ฝั่ง VLAN 10'},
    {title:'Trunk ใส่แท็ก VLAN 10', action:'ให้ R1 เลือกทาง', paths:['switch-router'],
     detail:'SW1 รับเฟรมจาก access port ใน VLAN 10 แล้วส่งออก trunk พร้อมแท็ก 802.1Q VLAN 10 เพื่อให้ R1 รับเข้าที่ sub-interface Gi0/0.10',
     command:'show interfaces trunk', output:'Port   Mode   Status    Native VLAN\nGi0/1  on     trunking  666\nAllowed VLANs: 10,20,99'},
    {title:'R1 ส่งกลับด้วยแท็ก VLAN 20', action:'ส่งถึง Web Server', paths:['switch-router'], reverse:true,
     detail:'R1 ตรวจ Destination IP แล้วเลือก Gi0/0.20 สร้างเฟรมใหม่โดยใช้ MAC ของ Server เป็นปลายทาง ส่งออก trunk เดิมด้วยแท็ก VLAN 20 และลด IP TTL ลงหนึ่ง',
     command:'show ip route 192.168.20.0', output:'C 192.168.20.0/24 is directly connected,\n  GigabitEthernet0/0.20'},
    {title:'ปลายทางได้รับเฟรม', action:'เริ่มใหม่', paths:['switch-server'],
     detail:'SW1 รับเฟรม VLAN 20 แล้วถอดแท็กเมื่อส่งออก access port ไป Web Server การตอบกลับต้องผ่าน Gateway ของ VLAN 20 และมีนโยบาย ACL ที่ยอมให้ผ่าน',
     command:'ping 192.168.20.10', output:'ทดสอบจาก PC A หลังตั้ง gateway และ ACL\nบันทึกผล Echo Reply และ counter ของ ACL'}
   ]
  }
 ];
 let cleanup = null;

 function mount(main) {
  unmount();
  const life = new AbortController();
  const signal = life.signal;
  let scenario = scenarios[0], index = 0, playing = false, timer = 0;
  let frame = 0, visible = true, closed = false;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const quiet = () => reduced.matches || document.documentElement.dataset.motion === 'off';
  main.innerHTML = [
   '<div class="ne-lab"><div class="page-head"><div><h1>ห้องทดลองเครือข่าย</h1>',
   '<p class="lead">เลือกสถานการณ์ ลองเปลี่ยนเครือข่าย แล้วตามดูเส้นทางแพ็กเก็ตทีละขั้น</p></div></div>',
   '<div class="ne-scenarios" role="group" aria-label="เลือกสถานการณ์">',
   scenarios.map(item => '<button class="btn" data-ne-scenario="'+item.id+'" aria-pressed="false">'+item.title+'</button>').join(''),
   '</div><p class="ne-context"></p><section class="ne-viewer" aria-label="ภาพจำลองเครือข่าย">',
   '<div class="ne-stage"><div class="ne-stage-heading"><h2></h2><output aria-label="ขั้นตอนปัจจุบัน"></output></div>',
   '<canvas tabindex="0" role="img" aria-label="แผนภาพเครือข่าย ใช้ปุ่มลูกศรซ้ายขวาเพื่อเปลี่ยนขั้นตอน"></canvas>',
   '<div class="ne-legend"><span><i></i>เส้นทางที่กำลังส่งข้อมูล</span><span><i></i>ลิงก์ขัดข้อง</span></div></div>',
   '<div class="ne-controls"><div class="ne-playback">',
   '<button class="btn" data-ne="previous" aria-label="ขั้นก่อนหน้า">←</button>',
   '<button class="btn primary" data-ne="play" aria-pressed="false">เล่นอัตโนมัติ</button>',
   '<button class="btn" data-ne="next"></button>',
   '<button class="btn" data-ne="reset">เริ่มใหม่</button></div>',
   '<div class="ne-timeline" role="group" aria-label="เลือกขั้นตอน"></div>',
   '<button class="btn small" data-ne="fullscreen">เต็มจอ</button></div></section>',
   '<div class="ne-explanation" aria-live="polite"><section class="ne-detail"><h2></h2><p></p></section>',
   '<section class="ne-terminal"><div class="code-header"><span>คำสั่งและตัวอย่างผลประกอบ</span>',
   '<button class="btn small" data-ne="copy">คัดลอกคำสั่ง</button></div><pre><code></code></pre></section></div>',
   '<div class="ne-bottom"><a class="btn" data-ne-lesson></a><p class="tiny-note">ลำดับเหตุการณ์จำลองเพื่ออธิบายหลักการ การทดสอบบนอุปกรณ์จริงดูได้ในบทเรียนประกอบ</p></div></div>'
  ].join('');
  const root = main.querySelector('.ne-lab');
  const canvas = root.querySelector('canvas');
  const ctx = canvas.getContext('2d');
  const viewer = root.querySelector('.ne-viewer');
  const control = name => root.querySelector('[data-ne="'+name+'"]');
  let width = 800, height = 340;

  function graph() {
   const mobile = width < 600;
   const w = mobile ? 400 : 800, h = mobile ? 380 : 340;
   if (scenario.id === 'gateway') return {
    w,h,
    nodes:[
     {id:'client',name:'PC A',hint:'Gateway .1',x:mobile?50:70,y:mobile?190:170,type:'pc'},
     {id:'switch',name:'SW1',hint:'LAN',x:mobile?155:260,y:mobile?190:170},
     {id:'r1',name:'R1',hint:index===2?'Standby · 80':index===1?'Active · 80':'Active · 110',x:mobile?260:470,y:mobile?80:75,type:'router'},
     {id:'r2',name:'R2',hint:index===2?'Active · 100':'Standby · 100',x:mobile?260:470,y:mobile?300:265,type:'router'},
     {id:'server',name:'Server',hint:mobile?'ปลายทาง':'เครือข่ายปลายทาง',x:mobile?350:730,y:mobile?190:170,type:'server'}
    ],
    edges:[['client-switch','client','switch'],['switch-r1','switch','r1'],['r1-server','r1','server'],['switch-r2','switch','r2'],['r2-server','r2','server']]
   };
   if (scenario.id === 'ospf') return {
    w,h,
    nodes:[
     {id:'r1',name:'R1',hint:'ต้นทาง',x:mobile?50:75,y:mobile?155:130,type:'router'},
     {id:'switch',name:'SW1',hint:'192.168.100.0/24',x:mobile?160:300,y:mobile?75:65},
     {id:'r4',name:'R4',hint:'172.16.14.2',x:mobile?270:535,y:mobile?155:130,type:'router'},
     {id:'lan',name:'LAN R4',hint:'10.0.4.0/24',x:mobile?350:730,y:mobile?270:130,type:'pc'}
    ],
    edges:[['r1-switch','r1','switch'],['switch-r4','switch','r4'],['r4-lan','r4','lan'],['r1-r4','r1','r4','backup']]
   };
   return {
    w,h,
    nodes:[
     {id:'pc',name:'PC A',hint:'VLAN 10',x:mobile?60:85,y:mobile?265:230,type:'pc'},
     {id:'switch',name:'SW1',hint:'Access / Trunk',x:mobile?200:325,y:mobile?265:230},
     {id:'router',name:'R1',hint:index===2?'Gi0/0.20':'Gi0/0.10',x:mobile?200:470,y:mobile?85:65,type:'router'},
     {id:'server',name:'Server',hint:'VLAN 20',x:mobile?345:720,y:mobile?265:230,type:'server'}
    ],
    edges:[['pc-switch','pc','switch'],['switch-router','switch','router'],['switch-server','switch','server']]
   };
  }
  function pointsFor(edge, scene) {
   const a = scene.nodes.find(node=>node.id===edge[1]);
   const b = scene.nodes.find(node=>node.id===edge[2]);
   if (edge[3]==='backup') return [[a.x,a.y],[a.x,scene.h-60],[b.x,scene.h-60],[b.x,b.y]];
   return [[a.x,a.y],[b.x,b.y]];
  }
  function pointAlong(points, progress) {
   const lengths=points.slice(1).map((point,i)=>Math.hypot(point[0]-points[i][0],point[1]-points[i][1]));
   let remaining=lengths.reduce((sum,length)=>sum+length,0)*progress;
   for (let i=0;i<lengths.length;i++) {
    if (remaining<=lengths[i] || i===lengths.length-1) {
     const t=remaining/lengths[i];
     return [points[i][0]+(points[i+1][0]-points[i][0])*t,points[i][1]+(points[i+1][1]-points[i][1])*t];
    }
    remaining-=lengths[i];
   }
  }
  function draw(time=0) {
   frame=0;
   if (closed || !ctx) return;
   const scene=graph(), step=scenario.steps[index];
   const ratio=Math.min(devicePixelRatio||1,2);
   ctx.setTransform(ratio,0,0,ratio,0,0);
   ctx.clearRect(0,0,width,height);
   ctx.save();
   ctx.scale(width/scene.w,height/scene.h);
   ctx.lineJoin='round';ctx.lineCap='round';
   for (const edge of scene.edges) {
    const points=pointsFor(edge,scene),active=step.paths.includes(edge[0]),failed=step.failed?.includes(edge[0]);
    ctx.beginPath();ctx.moveTo(...points[0]);points.slice(1).forEach(point=>ctx.lineTo(...point));
    ctx.strokeStyle=failed?'#e89a9a':active?'#a4e9ce':'#4d6876';
    ctx.lineWidth=active?4:2;ctx.setLineDash(failed?[7,7]:[]);ctx.stroke();ctx.setLineDash([]);
    if (failed) {
     const [x,y]=pointAlong(points,.55);
     ctx.fillStyle='#12222d';ctx.fillRect(x-12,y-12,24,24);
     ctx.strokeStyle='#f3a3a3';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(x-6,y-6);ctx.lineTo(x+6,y+6);ctx.moveTo(x+6,y-6);ctx.lineTo(x-6,y+6);ctx.stroke();
    }
    if (active) for (let i=0;i<2;i++) {
     let progress=quiet() ? .33 : ((time/3300+i*.5)%1);
     if(step.reverse)progress=1-progress;
     const [x,y]=pointAlong(points,progress);
     ctx.shadowColor='#a4e9ce';ctx.shadowBlur=12;ctx.fillStyle='#b9f8dc';
     ctx.beginPath();ctx.arc(x,y,4.5,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0;
    }
   }
   if(scenario.id==='ospf'){
    ctx.fillStyle='#b6c9d2';ctx.font='12px Inter, Tahoma, sans-serif';ctx.textAlign='center';
    ctx.fillText('Gi0/3 · 1.544 Mbps',scene.w<600?160:300,scene.h-36);
   }
   for (const node of scene.nodes) {
    const active=step.paths.some(id=>scene.edges.some(edge=>edge[0]===id&&edge.slice(1,3).includes(node.id)));
    const boxWidth=scene.w<600?86:108, boxHeight=48;
    ctx.beginPath();ctx.roundRect(node.x-boxWidth/2,node.y-boxHeight/2,boxWidth,boxHeight,11);
    ctx.fillStyle='#182c37';ctx.fill();ctx.lineWidth=active?2:1;ctx.strokeStyle=active?'#a4e9ce':'#8098a5';ctx.stroke();
    const iconX=node.x-boxWidth/2+18;
    ctx.strokeStyle=active?'#bbf3dc':'#d2e3e9';ctx.lineWidth=1.5;ctx.beginPath();
    if(node.type==='router'){
     ctx.ellipse(iconX,node.y,10,7,0,0,Math.PI*2);
     ctx.moveTo(iconX-6,node.y);ctx.lineTo(iconX+6,node.y);
     ctx.moveTo(iconX,node.y-4);ctx.lineTo(iconX,node.y+4);
    }else if(node.type==='pc'){
     ctx.rect(iconX-9,node.y-7,18,12);
     ctx.moveTo(iconX,node.y+5);ctx.lineTo(iconX,node.y+10);
     ctx.moveTo(iconX-5,node.y+10);ctx.lineTo(iconX+5,node.y+10);
    }else if(node.type==='server'){
     ctx.roundRect(iconX-9,node.y-9,18,7,2);ctx.roundRect(iconX-9,node.y+2,18,7,2);
    }else{
     ctx.roundRect(iconX-10,node.y-6,20,12,3);
     for(let i=0;i<3;i++){ctx.moveTo(iconX-6+i*6,node.y);ctx.lineTo(iconX-5+i*6,node.y);}
    }
    ctx.stroke();
    ctx.fillStyle='#edf5f6';ctx.font='600 '+(scene.w<600?13:16)+'px Inter, Tahoma, sans-serif';ctx.textAlign='center';
    ctx.fillText(node.name,node.x+13,node.y+6);
    ctx.fillStyle='#c1d0d8';ctx.font='12px Inter, Tahoma, sans-serif';
    ctx.fillText(node.hint,node.x,node.y+43);
   }
   ctx.restore();
   if (visible && !document.hidden && !quiet()) frame=requestAnimationFrame(draw);
  }
  function schedule() { if(!closed&&!frame)frame=requestAnimationFrame(draw); }
  function resize() {
   width=canvas.clientWidth;height=canvas.clientHeight;
   const ratio=Math.min(devicePixelRatio||1,2);
   canvas.width=Math.max(1,Math.round(width*ratio));canvas.height=Math.max(1,Math.round(height*ratio));schedule();
  }
  function stop() {
   playing=false;clearTimeout(timer);timer=0;
   control('play').textContent='เล่นอัตโนมัติ';control('play').setAttribute('aria-pressed','false');
  }
  function renderStep() {
   const step=scenario.steps[index];
   root.querySelector('.ne-context').textContent=scenario.description;
   root.querySelector('.ne-stage-heading h2').textContent=step.title;
   root.querySelector('.ne-stage-heading output').textContent=(index+1)+' / '+scenario.steps.length;
   canvas.setAttribute('aria-label',step.title+' · '+step.detail+' ใช้ลูกศรซ้ายขวาเพื่อเปลี่ยนขั้นตอน');
   root.querySelector('.ne-detail h2').textContent=step.title;
   root.querySelector('.ne-detail p').textContent=step.detail;
   root.querySelector('.ne-terminal code').textContent='> '+step.command+'\n\n'+step.output;
   root.querySelector('[data-ne-lesson]').textContent='อ่านบท '+scenario.title+' และตั้งค่าจริง →';
   root.querySelector('[data-ne-lesson]').href='#/lab/'+scenario.chapter;
   control('previous').disabled=index===0;
   control('copy').textContent='คัดลอกคำสั่ง';
   control('next').textContent=step.action;
   root.querySelectorAll('[data-ne-scenario]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.neScenario===scenario.id)));
   root.querySelector('.ne-timeline').replaceChildren(...scenario.steps.map((item,i)=>{
    const button=document.createElement('button');
    button.type='button';button.dataset.neStep=String(i);button.setAttribute('aria-label','ขั้น '+(i+1)+' '+item.title);
    button.setAttribute('aria-pressed',String(i===index));button.className=i<index?'ne-past':'';
    button.textContent=String(i+1);return button;
   }));
   schedule();
  }
  function selectStep(next) { index=next;renderStep(); }
  function advance() {
   if (!playing || closed) return;
   if(index===scenario.steps.length-1){stop();return;}
   selectStep(index+1);timer=setTimeout(advance,3500);
  }
  root.addEventListener('click',async event=>{
   const button=event.target.closest('button');
   if(!button)return;
   if(button.dataset.neScenario){stop();scenario=scenarios.find(item=>item.id===button.dataset.neScenario);selectStep(0);return;}
   if(button.dataset.neStep!==undefined){stop();selectStep(Number(button.dataset.neStep));return;}
   switch(button.dataset.ne){
    case 'previous': stop();selectStep(Math.max(0,index-1));break;
    case 'next': stop();selectStep((index+1)%scenario.steps.length);break;
    case 'reset': stop();selectStep(0);break;
    case 'play':
     if(playing){stop();break;}
     if(index===scenario.steps.length-1)selectStep(0);
     playing=true;button.textContent='หยุดชั่วคราว';button.setAttribute('aria-pressed','true');timer=setTimeout(advance,3500);break;
    case 'copy':
     try {await navigator.clipboard.writeText(scenario.steps[index].command);button.textContent='คัดลอกแล้ว';}
     catch {button.textContent='เลือกคำสั่งจากกล่องด้านล่าง';}
     break;
    case 'fullscreen':
     try {if(document.fullscreenElement===viewer)await document.exitFullscreen();else await viewer.requestFullscreen();}
     catch {button.textContent='ใช้เต็มจอไม่ได้';}
     break;
   }
  },{signal});
  canvas.addEventListener('keydown',event=>{
   if(!['ArrowLeft','ArrowRight'].includes(event.key))return;
   event.preventDefault();stop();selectStep(Math.max(0,Math.min(scenario.steps.length-1,index+(event.key==='ArrowRight'?1:-1))));
  },{signal});
  control('fullscreen').hidden=!document.fullscreenEnabled||!viewer.requestFullscreen;
  document.addEventListener('fullscreenchange',()=>{control('fullscreen').textContent=document.fullscreenElement===viewer?'ย่อจอ':'เต็มจอ';resize();},{signal});
  document.addEventListener('visibilitychange',()=>{if(document.hidden){stop();cancelAnimationFrame(frame);frame=0;}else schedule();},{signal});
  const observer=new MutationObserver(()=>{if(quiet()){stop();cancelAnimationFrame(frame);frame=0;}schedule();});
  observer.observe(document.documentElement,{attributes:true,attributeFilter:['data-motion']});
  reduced.addEventListener('change',()=>{if(quiet())stop();schedule();},{signal});
  const visibility=new IntersectionObserver(entries=>{
   visible=entries[0].isIntersecting;
   if(visible)schedule();else {cancelAnimationFrame(frame);frame=0;}
  });
  visibility.observe(canvas);
  const sizeObserver=new ResizeObserver(resize);sizeObserver.observe(canvas);
  cleanup=()=>{closed=true;stop();life.abort();observer.disconnect();visibility.disconnect();sizeObserver.disconnect();cancelAnimationFrame(frame);};
  renderStep();resize();
 }
 function unmount(){if(cleanup){cleanup();cleanup=null;}}
 window.NetworkExperience={mount,unmount};
})();
