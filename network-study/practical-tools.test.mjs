import test from 'node:test';
import assert from 'node:assert/strict';
import tools from './dist/practical-tools.js';
import {annotateCommands} from './command-notes.mjs';
import {annotateOpenbook} from './openbook-notes.mjs';
const q=(answer,inputType='ios')=>({answer,accept:[answer],inputType});
test('multi-line IOS accepts prompts, CRLF, blank lines and supported abbreviations',()=>{
 assert(tools.commandMatches(q('configure terminal\ninterface gi0/1\nno shutdown\nend'),
  'SW1# conf t\r\n\r\nSW1(config)# int GigabitEthernet 0/1\r\nSW1(config-if)# no shut\r\nend'));
});
test('single-command answers still support the old displayed aliases and filter answers',()=>{
 assert(tools.commandMatches(q('show ip interface brief'),'sh ip int br'));
 assert(tools.commandMatches(q('configure terminal'),'CONF T'));
 assert(tools.commandMatches(q('no shutdown'),'no shut'));
 assert(tools.commandMatches(q('ospf','filter'),' ospf '));
 assert(!tools.commandMatches(q('ospf','filter'),'OSPF'));
});
test('missing, extra, reordered and wrong parameter lines are rejected with feedback',()=>{
 const question=q('configure terminal\ninterface gi0/1\nswitchport access vlan 10\nend');
 for(const input of ['configure terminal\ninterface gi0/1\nend','configure terminal\ninterface gi0/1\nswitchport access vlan 20\nend','interface gi0/1\nconfigure terminal\nswitchport access vlan 10\nend',question.answer+'\nshow vlan brief']){
  const result=tools.check(question,input);assert.equal(result.correct,false);assert(result.rows.some(row=>!row.correct));
 }
});
test('keywords ignore case; identifiers, secrets and parameter t retain case and meaning',()=>{
 assert(tools.commandMatches(q('vtp domain LABCORP'),'VTP DOMAIN LABCORP'));
 assert(!tools.commandMatches(q('vtp domain LABCORP'),'vtp domain labcorp'));
 assert(!tools.commandMatches(q('ip access-group FILTER_STAFF_TRAFFIC in'),'ip access-group filter_staff_traffic in'));
 assert(!tools.commandMatches(q('redistribute eigrp 100 subnets route-map EIGRP-TO-OSPF'),'redistribute eigrp 100 subnets route-map eigrp-to-ospf'));
 assert(tools.commandMatches(q('enable secret t'),'enable secret t'));
 assert(!tools.commandMatches(q('enable secret t'),'enable secret terminal'));
 assert(!tools.commandMatches(q('enable secret GigabitEthernet0/1'),'enable secret gi0/1'));
 assert(!tools.commandMatches(q('ip ospf message-digest-key 1 md5 KeyAbC'),'ip ospf message-digest-key 1 md5 keyabc'));
});
test('shell flag case and quoted whitespace matter; display filter ignores operator spacing',()=>{
 assert(!tools.commandMatches(q('sudo nmap -sS -p 443 192.168.20.10','shell'),'sudo nmap -ss -p 443 192.168.20.10'));
 assert(!tools.commandMatches(q("tcpdump 'a  b'",'shell'),"tcpdump 'a b'"));
 assert(tools.commandMatches(q('ip.proto == 88 || ip.proto == 89','filter'),'ip.proto==88||ip.proto==89'));
});
test('annotation follows modes and explains save, wildcard, bandwidth and route-map separately',()=>{
 const notes=annotateCommands('enable\nconfigure terminal\ninterface gi0/0.10\nencapsulation dot1Q 10\nexit\nrouter ospf 1\nnetwork 10.0.0.0 0.0.0.3 area 0\nend\ncopy running-config startup-config');
 assert.equal(notes[0].mode,'>');assert.equal(notes[2].nextMode,'(config-subif)#');
 assert.equal(notes[4].nextMode,'(config)#');assert.match(notes[6].meaning,/wildcard/);
 assert.equal(notes[7].nextMode,'#');assert.match(notes[8].meaning,/บันทึก/);
 assert.throws(()=>annotateCommands('not-a-real-command'),/Missing IOS/);
});
test('CLI prompts use the mode before each command and apply hostname changes afterwards',()=>{
 const notes=annotateCommands('enable\nconfigure terminal\nhostname SW1\nline console 0\npassword cisco\nexit\ninterface gi0/0.10\nexit\nrouter ospf 1\nend\nshow ip ospf neighbor',{device:'SW1 · console'});
 assert.deepEqual(notes.map(n=>n.prompt),['Switch>','Switch#','Switch(config)#','SW1(config)#','SW1(config-line)#','SW1(config-line)#','SW1(config)#','SW1(config-subif)#','SW1(config)#','SW1(config-router)#','SW1#']);
 assert.equal(notes[2].nextPrompt,'SW1(config)#');
 assert.equal(annotateCommands('show ip ospf neighbor',{device:'R2 · router'})[0].prompt,'R2#');
 assert.equal(annotateCommands('ip -br addr',{inputType:'shell',device:'Kali-1'})[0].prompt,'kali@kali-1:~$');
 assert.equal(annotateCommands('ospf',{inputType:'filter'})[0].prompt,'Display Filter:');
 const range=annotateCommands('configure terminal\ninterface range fa0/1 - 3\nswitchport mode access\nexit',{device:'SW2'});
 assert.equal(range[2].prompt,'SW2(config-if-range)#');
 assert.equal(range[3].nextPrompt,'SW2(config)#');
});
test('A4 session labels switch routers while ordinary labels preserve the active mode',()=>{
 const notes=annotateOpenbook({device:'R1',inputType:'ios',code:'conf t\nrouter ospf 1\nend\n! R4: ตัดลิงก์\nconf t\ninterface gi0/1\nshutdown\n! คืนลิงก์\nno shutdown\nend'});
 assert.equal(notes[3].kind,'label');
 assert.equal(notes[4].prompt,'R4#');
 assert.equal(notes[6].prompt,'R4(config-if)#');
 assert.equal(notes[8].prompt,'R4(config-if)#');
 assert.equal(notes[8].brief,'เปิดพอร์ต');
 const boundary=annotateOpenbook({device:'R1',inputType:'ios',code:'! R2 (conf t)\nrouter eigrp 100'});
 assert.equal(boundary[1].prompt,'R2(config)#');
 const mixed=annotateOpenbook({device:'Kali',inputType:'shell',code:'# Kali\nip -br addr\n# Windows\nping -t 192.168.10.1\narp -a'});
 assert.equal(mixed[1].prompt,'kali@kali:~$');
 assert.equal(mixed[3].prompt,'C:\\>');
 assert.match(mixed[4].meaning,/ARP/);
});
