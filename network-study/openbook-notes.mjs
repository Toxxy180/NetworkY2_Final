import {annotateCommands} from './command-notes.mjs';

const modeKeys={'#':'exec','>':'user','(config)#':'global','(config-if)#':'iface','(config-if-range)#':'range','(config-subif)#':'sub','(config-line)#':'line','(config-vlan)#':'vlan','(config-router)#':'router','(config-ext-nacl)#':'acl','(config-route-map)#':'map'};
const briefRules=[
 [/^enable$/,'เข้าสิทธิ์สูง'],[/^(conf t|configure terminal)$/,'เริ่มตั้งค่า'],[/^hostname /,'ตั้งชื่อ'],[/^no ip domain-lookup$/,'ปิด DNS lookup'],
 [/^enable secret /,'รหัส enable'],[/^line console /,'เลือก console'],[/^line vty /,'เลือก remote line'],[/^password /,'รหัส line'],[/^login$/,'ตรวจรหัส line'],[/^exec-timeout /,'ตั้ง idle timeout'],
 [/^interface range /,'เลือกหลายพอร์ต'],[/^interface vlan /,'เลือก SVI'],[/^interface loopback/,'สร้าง loopback'],[/^interface .*\./,'เลือก subif'],[/^interface /,'เลือกพอร์ต'],
 [/^ip address /,'ตั้ง IP/mask'],[/^no shutdown$/,'เปิดพอร์ต'],[/^shutdown$/,'ปิดพอร์ต'],[/^exit$/,'ย้อน 1 โหมด'],[/^end$/,'กลับ #'],[/^ip default-gateway /,'gateway บริหาร'],[/^copy /,'บันทึกถาวร'],
 [/^clear mac /,'ล้าง dynamic MAC'],[/^mac address-table static /,'ผูก MAC/พอร์ต'],
 [/^switchport port-security maximum /,'จำนวน MAC สูงสุด'],[/^switchport port-security mac-address sticky$/,'เรียน MAC ลง run'],[/^switchport port-security violation protect$/,'drop ไม่แจ้ง'],[/^switchport port-security violation restrict$/,'drop พร้อมนับ'],[/^switchport port-security violation shutdown$/,'ละเมิดแล้วปิด'],[/^switchport port-security$/,'เปิด Port Security'],
 [/^vtp domain /,'ตั้ง domain'],[/^vtp password /,'รหัส VTP'],[/^vtp version /,'version VTP'],[/^vtp mode /,'บทบาท VTP'],[/^vlan /,'เลือก VLAN'],[/^name /,'ชื่อ VLAN'],
 [/^switchport mode /,'กำหนด access/trunk'],[/^switchport access vlan /,'data VLAN'],[/^switchport voice vlan /,'voice VLAN'],[/^switchport trunk native /,'native ให้ตรงกัน'],[/^switchport trunk allowed vlan add /,'เพิ่ม allowed'],[/^switchport trunk allowed /,'แทน allowed list'],[/^switchport nonegotiate$/,'ปิด DTP'],[/^no switchport protected$/,'ยกเลิก protected'],[/^switchport protected$/,'กัน protected คุยกัน'],
 [/^spanning-tree vlan .*root primary$/,'ตั้ง root หลัก'],[/^spanning-tree portfast$/,'เร่งพอร์ต PC'],[/^spanning-tree bpduguard /,'รับ BPDU แล้วปิด'],[/^spanning-tree guard root$/,'กัน root จากด้านนี้'],
 [/^encapsulation dot1Q /i,'ผูก VLAN tag'],[/^ip routing$/,'เปิด L3 routing'],
 [/^ip access-list extended /,'สร้าง named ACL'],[/^deny ip .* host /,'ห้ามไป host นี้'],[/^permit tcp .* eq 80$/,'อนุญาต HTTP'],[/^permit tcp .* eq 443$/,'อนุญาต HTTPS'],[/^permit icmp /,'ให้ส่ง echo'],[/^deny ip /,'ห้าม IP ตามเงื่อนไข'],[/^permit ip any any$/,'ที่เหลือผ่าน'],[/^ip access-group /,'ผูก ACL กับพอร์ต'],
 [/^router ospf /,'เข้า OSPF process'],[/^router eigrp /,'เข้า EIGRP AS'],[/^(eigrp )?router-id /,'ตั้ง RID ไม่ซ้ำ'],[/^network .* area /,'เลือก IF เข้า area'],[/^network /,'เลือก IF เข้า EIGRP'],[/^passive-interface /,'ไม่ส่ง Hello ที่ IF'],[/^auto-cost /,'reference Mbps'],[/^bandwidth /,'BW คำนวณ Kbit/s'],[/^ip ospf priority /,'สิทธิ์เลือก DR/BDR'],[/^ip ospf network /,'P2P ไม่เลือก DR'],[/^ip ospf authentication /,'เปิด MD5 ที่ IF'],[/^ip ospf message-digest-key /,'key ID/secret'],[/^area .* authentication /,'MD5 ทั้ง area'],[/^no auto-summary$/,'ปิด auto-summary'],
 [/^standby version /,'version HSRP'],[/^(standby|vrrp|glbp) \d+ ip /,'ตั้ง VIP'],[/^(standby|vrrp|glbp) \d+ priority /,'ตั้ง priority'],[/^(standby|vrrp|glbp) \d+ preempt$/,'แย่งบทบาทกลับ'],[/^standby \d+ timers /,'hello/hold วินาที'],[/^vrrp \d+ timers /,'advertise วินาที'],[/^glbp \d+ load-balancing /,'วิธีกระจาย MAC'],
 [/^track /,'ติดตาม uplink'],[/^standby \d+ track /,'uplink เสียลด pri'],
 [/^route-map .* deny /,'กัน route ที่ match'],[/^route-map .* permit /,'รับ route ที่ match'],[/^match tag /,'ตรวจ tag เดิม'],[/^set tag /,'ใส่ tag ทิศนี้'],[/^redistribute eigrp /,'EIGRP เข้า OSPF'],[/^redistribute ospf /,'OSPF เข้า EIGRP'],
 [/^show version$/,'รุ่น/IOS'],[/^show running-config$/,'ค่าที่ใช้อยู่'],[/^show startup-config$/,'ค่าตอนบูต'],[/^show ip interface brief$/,'IP และ up/down'],[/^show interfaces status err-disabled$/,'พอร์ตถูกปิดอัตโนมัติ'],[/^show interfaces status$/,'สถานะพอร์ต'],[/^show interfaces counters$/,'ตัวนับเฟรม'],[/^show interfaces trunk$/,'trunk/native/allowed'],[/^show interfaces .* switchport$/,'mode และ VLAN'],[/^show mac address-table address /,'หา MAC นี้'],[/^show mac address-table aging/,'เวลา aging'],[/^show mac address-table/,'MAC/VLAN/พอร์ต'],[/^show port-security interface /,'secure/violation'],[/^show port-security address$/,'secure MAC'],[/^show port-security$/,'สรุป Port Security'],[/^show vlan /,'VLAN และพอร์ต'],[/^show vtp /,'mode/revision'],[/^show cdp /,'เพื่อนบ้าน/พอร์ต'],
 [/^show spanning-tree inconsistentports$/,'พอร์ต inconsistent'],[/^show spanning-tree interface /,'STP ของพอร์ต'],[/^show spanning-tree /,'root/role/state'],[/^show ip ospf neighbor$/,'OSPF neighbor'],[/^show ip ospf interface /,'cost/type/timer'],[/^show ip eigrp neighbors$/,'EIGRP neighbor'],[/^show ip eigrp topology$/,'successor/FD/RD'],[/^show ip route/,'ตรวจ route/next hop'],[/^show ip protocols$/,'routing ที่รัน'],[/^show ip interface /,'ACL ของพอร์ต'],[/^show access-lists /,'ACL/hit counter'],[/^show standby/,'Active/Standby'],[/^show vrrp/,'Master/Backup'],[/^show glbp/,'AVG/AVF'],[/^show track/,'สถานะ uplink'],[/^show route-map$/,'match/set ของ route'],
 [/^ip -br addr$/,'IP แบบย่อ'],[/^ip route$/,'ตาราง route'],[/^ip neigh$/,'ARP cache'],[/^fping /,'หา host ที่ตอบ'],[/^(sudo )?tcpdump /,'จับ/บันทึก packet'],[/^ping /,'ทดสอบ reachability'],[/^traceroute /,'ไล่ hop ด้วย IP'],[/^(sudo )?arp-scan /,'หา IP/MAC local'],[/^(sudo )?nmap -sn /,'ค้น host'],[/^(sudo )?nmap -sS /,'SYN scan ports'],[/^(sudo )?tshark /,'แสดง VLAN/IP'],[/^(sudo )?yersinia dtp /,'ส่ง DTP ในแลป'],[/^(sudo )?yersinia -G$/,'เปิด Yersinia GUI'],[/^arp -a$/,'ดู ARP cache']
];
export function annotateOpenbook(block){
 let device=block.device||'SW1',type=block.inputType||'ios',mode='exec';
 let host=type==='ios'&&block.code.startsWith('enable\n')&&/^hostname /m.test(block.code)?'Switch':device;
 if(type==='ios'&&block.code.startsWith('enable\n'))mode='user';
 return block.code.split('\n').map((original,index)=>{
  const command=original.trim();
  if(/^[!#]/.test(command)){
   const label=command.replace(/^[!#]\s*/,'');
   const named=label.match(/^(R\d+|SW\d+)\b/);
   if(named){device=host=named[1];type='ios';mode=/\(conf t\)/.test(label)?'global':'exec';}
   if(/^Kali\b/i.test(label)){type='shell';device='Kali';}
   if(/^Windows\b/i.test(label)){type='windows';device='PC';}
   return {line:index+1,kind:'label',label};
  }
  const brief=briefRules.find(([pattern])=>pattern.test(command));
  if(!brief)throw new Error('Missing A4 short comment: '+command);
  let note;
  if(type==='windows')note={command:original,prompt:'C:\\>',meaning:command.startsWith('ping ')?'ส่ง ping ต่อเนื่องบน Windows; หยุดด้วย Ctrl+C':'ดู IP/MAC ที่อยู่ใน ARP cache'};
  else {
   note=annotateCommands(command,{device,inputType:type,initialMode:mode,initialHostname:host})[0];
   if(type==='ios'){mode=modeKeys[note.nextMode];host=note.nextPrompt.slice(0,-note.nextMode.length);}
  }
  return {...note,line:index+1,command:original,kind:'command',brief:brief[1]};
 });
}
