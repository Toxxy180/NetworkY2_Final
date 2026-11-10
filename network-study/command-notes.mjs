// Shared by the content builder and tests. Unknown commands fail the build.
const modes = {exec:'#',user:'>',global:'(config)#',iface:'(config-if)#',sub:'(config-subif)#',line:'(config-line)#',vlan:'(config-vlan)#',router:'(config-router)#',acl:'(config-ext-nacl)#',map:'(config-route-map)#'};
const rules = [
 [/^enable$/,()=> 'เข้า privileged EXEC (#) เพื่อใช้คำสั่งตรวจสอบและเข้าสู่การตั้งค่า', 'exec'],
 [/^(?:configure terminal|conf t)$/,()=> 'เข้า global configuration เพื่อเริ่มแก้ค่าของอุปกรณ์', 'global'],
 [/^hostname (.+)$/,m=>`ตั้งชื่ออุปกรณ์เป็น ${m[1]}; ชื่อนี้จะแสดงใน CLI prompt`],
 [/^enable secret (.+)$/,()=> 'ตั้งรหัสผ่านสำหรับเข้า privileged EXEC; ค่าที่ตั้งอยู่ใน running-config'],
 [/^line (console|vty) (.+)$/,m=>`เลือก ${m[1]==='console'?'สาย console สำหรับเข้าเครื่องโดยตรง':'ช่วงสาย VTY สำหรับ remote session'} หมายเลข ${m[2]} เพื่อกำหนดการ login`, 'line'],
 [/^password (.+)$/,()=> 'ตั้งรหัสผ่านของ line ที่เลือก; ใช้คู่กับ login ตามรูปแบบแลปนี้'],
 [/^login$/,()=> 'ให้ line นี้ตรวจรหัสผ่านที่กำหนดด้วย password ก่อนเข้าใช้งาน'],
 [/^exec-timeout (\d+) (\d+)$/,m=>`ตัด session เมื่อไม่มีการใช้งาน ${m[1]} นาที ${m[2]} วินาที`],
 [/^interface range (.+)$/,m=>`เลือกหลาย interface (${m[1]}) เพื่อใช้ค่าตั้งถัดไปกับทุกพอร์ตในช่วง`, 'iface'],
 [/^interface (.+)$/,m=>`เลือกหรือสร้าง interface ${m[1]} เพื่อรับค่าตั้งในบรรทัดถัดไป`,m=>m[1].includes('.')?'sub':'iface'],
 [/^ip address (\S+) (\S+)$/,m=>`กำหนด IPv4 ${m[1]} และ subnet mask ${m[2]} ให้ interface/SVI ที่กำลังเลือก`],
 [/^no shutdown$/,()=> 'เปิด interface ที่เลือกในทาง administrative; สาย/โปรโตคอลยังต้องพร้อมจึงจะ up ได้'],
 [/^shutdown$/,()=> 'ปิด interface ที่เลือกในทาง administrative; ใช้ตัดลิงก์หรือเป็นขั้นตอนกู้พอร์ตตามแลป'],
 [/^ip default-gateway (\S+)$/,m=>`ตั้ง gateway ${m[1]} ให้สวิตช์ L2 ตอบกลับไป subnet อื่น เมื่อไม่ได้เปิด IP routing`],
 [/^copy running-config startup-config$/,()=> 'บันทึกค่าที่ใช้งานปัจจุบันไปยังค่าที่อ่านตอนบูต; ยืนยันชื่อปลายทางด้วย Enter ตาม prompt'],
 [/^clear mac address-table dynamic$/,()=> 'ล้าง MAC ที่เรียนรู้แบบ dynamic เพื่อเริ่มสังเกตการเรียนรู้ใหม่; ไม่ใช่การลบ VLAN'],
 [/^mac address-table static (\S+) vlan (\d+) interface (.+)$/,m=>`ผูก MAC ${m[1]} ใน VLAN ${m[2]} ไปพอร์ต ${m[3]} แบบ static`],
 [/^switchport mode (access|trunk)$/,m=>m[1]==='access'?'ล็อกพอร์ตเป็น access สำหรับ data VLAN ของเครื่องปลายทาง':'ล็อกพอร์ตเป็น trunk เพื่อขนส่งหลาย VLAN'],
 [/^switchport access vlan (\d+)$/,m=>`ให้ data traffic แบบ access ของพอร์ตอยู่ VLAN ${m[1]}`],
 [/^switchport voice vlan (\d+)$/,m=>`กำหนด voice VLAN ${m[1]} สำหรับโทรศัพท์ที่รองรับบนพอร์ตนี้`],
 [/^switchport port-security$/,()=> 'เปิด Port Security บนพอร์ต; คำสั่ง maximum/sticky/violation ด้านล่างกำหนดนโยบายเพิ่ม'],
 [/^switchport port-security maximum (\d+)$/,m=>`อนุญาต secure MAC สูงสุด ${m[1]} รายการบนพอร์ต`],
 [/^switchport port-security mac-address sticky$/,()=> 'เรียน secure MAC แบบ sticky แล้วเพิ่มลง running-config; ต้อง save เพื่อคงไว้หลัง reboot'],
 [/^switchport port-security violation (protect|restrict|shutdown)$/,m=>({protect:'เมื่อ MAC ผิดเงื่อนไข ให้ drop เฟรม แต่พอร์ตยังทำงาน โดยไม่มีการแจ้งแบบ restrict',restrict:'เมื่อ MAC ผิดเงื่อนไข ให้ drop พร้อมนับ violation/แจ้งตามระบบ โดยพอร์ตยังทำงาน',shutdown:'เมื่อ MAC ผิดเงื่อนไข ให้พอร์ตเข้า err-disabled; แก้ต้นเหตุก่อน shutdown/no shutdown'})[m[1]]],
 [/^vtp domain (\S+)$/,m=>`เข้าร่วม VTP domain ชื่อ ${m[1]}; ชื่อต้องตรงกับสมาชิกในแลป`],
 [/^vtp mode (server|client|transparent)$/,m=>`ตั้ง VTP เป็น ${m[1]}: ${{server:'แก้และประกาศฐาน VLAN',client:'รับฐาน VLAN จาก domain',transparent:'ดูแล VLAN local โดยไม่รับฐานมาเขียนทับ'}[m[1]]}`],
 [/^vtp version (\d+)$/,m=>`ใช้ VTP version ${m[1]} ตามใบงาน`],
 [/^vtp password (.+)$/,()=> 'กำหนด VTP password ให้ตรงกันระหว่างสมาชิกของ domain'],
 [/^vtp pruning$/,()=> 'เปิด VTP pruning บนอุปกรณ์ที่รองรับ เพื่อลด flooded traffic บน trunk ที่ไม่ต้องใช้ VLAN นั้น'],
 [/^vlan (\d+)$/,m=>`สร้างหรือเลือก VLAN ${m[1]} แล้วเข้าโหมด config-vlan`, 'vlan'],
 [/^name (.+)$/,m=>`ตั้งชื่อ VLAN ที่กำลังเลือกเป็น ${m[1]}`],
 [/^switchport trunk native vlan (\d+)$/,m=>`ตั้ง native VLAN เป็น ${m[1]}; ปลาย trunk อีกด้านต้องตั้งตรงกัน`],
 [/^switchport trunk allowed vlan (?:(add|remove) )?([\d, -]+)$/,m=>`${m[1]==='add'?'เพิ่ม':m[1]==='remove'?'นำออก':'แทนรายการเดิมด้วย'} VLAN ${m[2]} ${m[1]==='remove'?'จาก':'ใน'} allowed list ของ trunk`],
 [/^switchport nonegotiate$/,()=> 'หยุดส่ง DTP เพื่อเจรจา trunk; กำหนด mode access/trunk เองให้ตรงบทบาทก่อน'],
 [/^switchport protected$/,()=> 'แยกพอร์ตนี้จาก protected port อื่นบนสวิตช์เดียวกัน; ยังติดต่อ unprotected port ตามปกติได้'],
 [/^no switchport protected$/,()=> 'ยกเลิกสถานะ protected ของพอร์ตนี้'],
 [/^no spanning-tree vlan (\d+)$/,m=>`ปิด STP ของ VLAN ${m[1]} สำหรับช่วงทดลอง loop ในวงแลป; คืน STP ตามขั้นตอนใบงาน`],
 [/^spanning-tree vlan (\d+) root primary$/,m=>`ให้ IOS ปรับ priority เพื่อพยายามให้อุปกรณ์เป็น root หลักของ VLAN ${m[1]}; ตรวจผลด้วย show spanning-tree`],
 [/^spanning-tree vlan (\d+)$/,m=>`เปิด STP ของ VLAN ${m[1]} คืนหลังการทดลอง`],
 [/^spanning-tree portfast$/,()=> 'ให้พอร์ตปลายทางเข้าสู่ Forwarding เร็ว; STP ยังทำงาน ไม่ใช่การปิด STP'],
 [/^spanning-tree bpduguard enable$/,()=> 'เปิด BPDU Guard; ถ้าพอร์ตได้รับ BPDU จะเข้า err-disabled'],
 [/^spanning-tree guard root$/,()=> 'เปิด Root Guard; superior BPDU ทำให้พอร์ตอยู่ root-inconsistent แทนการยอมเป็นทางไป root'],
 [/^encapsulation dot1Q (\d+)( native)?$/i,m=>`ผูก sub-interface กับ tag ของ VLAN ${m[1]}${m[2]?' และกำหนดเป็น native':''}; เลขท้ายชื่อ sub-interface อย่างเดียวไม่ได้ผูก VLAN`],
 [/^ip routing$/,()=> 'เปิด IPv4 routing บน L3 switch ที่รองรับ เพื่อส่งต่อระหว่าง subnet/SVI'],
 [/^ip access-list extended (\S+)$/,m=>`สร้างหรือเลือก named extended ACL ${m[1]} แล้วเข้าโหมด config-ext-nacl`, 'acl'],
 [/^deny ip (\S+) (\S+) host (\S+)$/,m=>`ปฏิเสธ IP จาก ${m[1]} wildcard ${m[2]} ไป host ${m[3]}; ประมวลผล ACL จากบนลงล่าง`],
 [/^permit tcp (\S+) (\S+) host (\S+) eq (\d+)$/,m=>`อนุญาต TCP จาก ${m[1]} wildcard ${m[2]} ไป host ${m[3]} เฉพาะ destination port ${m[4]}`],
 [/^permit icmp (\S+) (\S+) host (\S+) echo$/,m=>`อนุญาต ICMP Echo Request จาก ${m[1]} wildcard ${m[2]} ไป host ${m[3]}`],
 [/^deny ip (\S+) (\S+) (\S+) (\S+)$/,m=>`ปฏิเสธ IP จาก ${m[1]} wildcard ${m[2]} ไป ${m[3]} wildcard ${m[4]}`],
 [/^permit ip any any$/,()=> 'อนุญาต IP อื่นที่ยังไม่ match บรรทัดก่อนหน้า; ACL มี implicit deny ท้ายรายการ'],
 [/^ip access-group (\S+) (in|out)$/,m=>`ผูก ACL ${m[1]} กับ interface ทิศ ${m[2]} (${m[2]==='in'?'แพ็กเก็ตที่รับเข้ามา':'แพ็กเก็ตก่อนส่งออก'} จากมุม router)`],
 [/^router (ospf|eigrp) (\d+)$/,m=>`เข้าโหมด ${m[1].toUpperCase()} ${m[1]==='ospf'?'process':'AS'} ${m[2]} เพื่อใส่ค่าของ routing protocol`, 'router'],
 [/^(?:eigrp )?router-id (\S+)$/,m=>`กำหนด Router ID เป็น ${m[1]}; ให้ไม่ซ้ำกับ router อื่นในระบบ`],
 [/^network (\S+) (\S+) area (\S+)$/,m=>`เลือก local interface ที่ IP ตรง ${m[1]} wildcard ${m[2]} ให้ร่วม OSPF area ${m[3]}; ไม่ใช่สร้าง IP ให้ interface`],
 [/^network (\S+) (\S+)$/,m=>`เลือก local interface ที่ IP ตรง ${m[1]} wildcard ${m[2]} ให้ร่วม EIGRP ตาม AS ที่เลือก`],
 [/^passive-interface (\S+)$/,m=>`ไม่ส่ง Hello ที่ ${m[1]}; เครือข่ายที่เข้าเงื่อนไขยังประกาศได้ แต่ไม่สร้าง neighbor บนพอร์ตนี้`],
 [/^auto-cost reference-bandwidth (\d+)$/,m=>`ตั้ง OSPF reference bandwidth ${m[1]} Mbps สำหรับคำนวณ cost; ตั้งให้สอดคล้องทุก router`],
 [/^bandwidth (\d+)$/,m=>`ใส่ค่า bandwidth ${m[1]} Kbit/s สำหรับการคำนวณ metric; ไม่ใช่คำสั่งจำกัดความเร็วจริง`],
 [/^ip ospf priority (\d+)$/,m=>`กำหนด priority เลือก DR/BDR บน interface เป็น ${m[1]}${m[1]==='0'?' จึงไม่มีสิทธิ์เป็น DR/BDR':''}; ไม่แย่ง DR เดิมทันที`],
 [/^ip ospf network point-to-point$/,()=> 'กำหนด OSPF network type เป็น point-to-point; ลิงก์ชนิดนี้ไม่เลือก DR/BDR'],
 [/^ip ospf authentication message-digest$/,()=> 'เปิด OSPF MD5 authentication ที่ interface; ต้องตั้ง key ให้ตรงกับเพื่อนบ้าน'],
 [/^ip ospf message-digest-key (\d+) md5 (.+)$/,m=>`ใส่ MD5 key ID ${m[1]} และ shared secret สำหรับ OSPF; ตรวจ digest ไม่ได้เข้ารหัส payload ทั้งหมด`],
 [/^area (\S+) authentication message-digest$/,m=>`กำหนด OSPF area ${m[1]} ใช้ message-digest authentication; key ของ interface ต้องพร้อมทั้งสองฝั่ง`],
 [/^no auto-summary$/,()=> 'ปิด automatic classful summarization ใน EIGRP แบบที่ใช้ในแลป'],
 [/^standby version (\d+)$/,m=>`ให้ HSRP บน interface ใช้ version ${m[1]}; ตั้งให้ตรงกับอีกฝั่ง`],
 [/^(standby|vrrp|glbp) (\d+) ip (\S+)$/,m=>`กำหนด Virtual IP ${m[3]} ให้ ${m[1]==='standby'?'HSRP':m[1].toUpperCase()} กลุ่ม ${m[2]}; client ใช้ VIP นี้เป็น gateway`],
 [/^(standby|vrrp|glbp) (\d+) priority (\d+)$/,m=>`ตั้ง priority ${m[3]} ของ ${m[1]==='standby'?'HSRP':m[1].toUpperCase()} กลุ่ม ${m[2]}; ค่าสูงมีสิทธิ์เหนือกว่าในการเลือกบทบาท`],
 [/^(standby|vrrp|glbp) (\d+) preempt$/,m=>`อนุญาต ${m[1]==='standby'?'HSRP':m[1].toUpperCase()} กลุ่ม ${m[2]} ที่ priority เหมาะสมกว่าแย่งบทบาทหลักกลับตามเงื่อนไข`],
 [/^standby (\d+) timers (\S+) (\S+)$/,m=>`ตั้ง HSRP กลุ่ม ${m[1]} hello ${m[2]} วินาที และ hold ${m[3]} วินาที; hello ไม่ใช่เวลาสลับจริง`],
 [/^vrrp (\d+) timers advertise (\S+)$/,m=>`ตั้ง VRRP กลุ่ม ${m[1]} ส่ง advertisement ทุก ${m[2]} วินาที`],
 [/^glbp (\d+) load-balancing (\S+)$/,m=>`ใช้ GLBP กลุ่ม ${m[1]} กระจาย Virtual MAC ตามวิธี ${m[2]}; ไม่ได้แบ่งทุก packet ของ client เดียวกัน`],
 [/^route-map (\S+) (deny|permit) (\d+)$/,m=>`เข้า route-map ${m[1]} ลำดับ ${m[3]} แบบ ${m[2]}; ในแลป redistribution ${m[2]==='deny'?'กัน route ที่ match ไม่ให้นำเข้า':'อนุญาต route ที่ match เพื่อนำเข้า'}`, 'map'],
 [/^match tag (\d+)$/,m=>`ให้ sequence นี้ match route ที่มี tag ${m[1]}; ใช้กัน route feedback ตามทิศทางในใบงาน`],
 [/^set tag (\d+)$/,m=>`ใส่ tag ${m[1]} ให้ route ที่ผ่าน sequence นี้ เพื่อจำทิศทางที่นำเข้ามา`],
 [/^redistribute eigrp (\d+) subnets route-map (\S+)$/,m=>`นำ route จาก EIGRP AS ${m[1]} เข้า OSPF พร้อม subnets และกรอง/ตั้ง tag ด้วย ${m[2]}`],
 [/^redistribute ospf (\d+) metric (\S+) (\S+) (\S+) (\S+) (\S+) route-map (\S+)$/,m=>`นำ OSPF process ${m[1]} เข้า EIGRP; seed metric = bandwidth ${m[2]} Kbit/s, delay ${m[3]} หน่วย 10µs, reliability ${m[4]}, load ${m[5]}, MTU ${m[6]}; ใช้ route-map ${m[7]}`]
];
const shows = [
 [/^show version$/, 'ดูรุ่นอุปกรณ์, IOS และข้อมูลระบบ'],
 [/^show running-config$/, 'ดูค่าตั้งที่กำลังใช้งาน; ยังไม่ใช่การ save'],
 [/^show startup-config$/, 'ดูค่าตั้งที่บันทึกไว้สำหรับอ่านตอนบูต'],
 [/^show ip interface brief$/, 'ดู IP กับสถานะ Status/Protocol ของแต่ละ interface แบบย่อ'],
 [/^show interfaces status err-disabled$/, 'ค้นพอร์ตที่อยู่ err-disabled เพื่อระบุพอร์ตที่ต้องตรวจสาเหตุ'],
 [/^show interfaces status$/, 'ดูสถานะพอร์ต, VLAN และความเร็ว/duplex ที่รายงาน'],
 [/^show interfaces counters$/, 'ดูตัวนับรับส่งเฟรมของพอร์ตเพื่อเทียบก่อนและหลังทดลอง'],
 [/^show interfaces trunk$/, 'ดูพอร์ต trunk, native VLAN และ VLAN ที่ allowed/active/forwarding'],
 [/^show interfaces (.+) switchport$/, m=>`ดู Administrative/Operational Mode, access VLAN และ trunk settings ของ ${m[1]}`],
 [/^show mac address-table (dynamic|static)$/, m=>`ดูตาราง MAC แบบ ${m[1]}; เทียบ VLAN, MAC และพอร์ต`],
 [/^show mac address-table aging-time$/, 'ดูเวลา aging ของรายการ MAC แบบ dynamic'],
 [/^show port-security address$/, 'ดู secure MAC ที่ Port Security เรียนรู้หรือกำหนดไว้'],
 [/^show port-security interface (\S+)$/,m=>`ดู maximum, secure MAC, violation mode และ counter ของ ${m[1]}`],
 [/^show cdp neighbors( detail)?$/,m=>`ดูอุปกรณ์ Cisco ที่อยู่ติดกันกับพอร์ตเชื่อมต่อ${m[1]?' พร้อมรายละเอียดของเพื่อนบ้าน':''}`],
 [/^show vtp status$/, 'ดู VTP domain, version, mode และ revision ก่อนเชื่อม switch เข้าวง'],
 [/^show vlan brief$/, 'ดู VLAN ที่มีอยู่กับพอร์ต access ที่เป็นสมาชิก; ไม่ใช้แทน show interfaces trunk'],
 [/^show spanning-tree vlan (\d+)$/,m=>`ดู Root ID, Bridge ID, role, state และ cost ของ STP ใน VLAN ${m[1]}`],
 [/^show ip route connected$/, 'ดู route เครือข่ายที่เชื่อมต่อโดยตรงและใช้งานได้'],
 [/^show ip route ospf$/, 'ดู route ที่เรียนรู้จาก OSPF'],
 [/^show ip route (\S+)$/,m=>`ค้น route ที่ใช้ไปปลายทาง ${m[1]}; ดู next hop และ metric`],
 [/^show ip route$/, 'ดู routing table เพื่อพิสูจน์เส้นทางไปและกลับ'],
 [/^show ip interface (\S+)$/,m=>`ดูสถานะ IPv4 ของ ${m[1]} รวมถึง ACL ขาเข้า/ขาออกที่ผูกไว้`],
 [/^show access-lists (\S+)$/,m=>`ดู ACL ${m[1]} และ hit counter; ส่งทราฟฟิกจากต้นทางที่ ACL ครอบคลุมแล้วเทียบ counter`],
 [/^show ip ospf neighbor$/, 'ดูเพื่อนบ้าน OSPF, state, DR/BDR และ interface ที่สร้างความสัมพันธ์'],
 [/^show ip ospf interface( brief)?$/, 'ดู interface ที่ร่วม OSPF และข้อมูลสถานะโดยย่อ'],
 [/^show ip ospf interface (\S+)$/,m=>`ดู cost, network type, timer และ authentication ของ OSPF ที่ ${m[1]}`],
 [/^show (standby|vrrp|glbp) brief$/,m=>`ดูบทบาทและ Virtual IP ของ ${m[1]==='standby'?'HSRP':m[1].toUpperCase()} แบบย่อ`],
 [/^show ip eigrp neighbors$/, 'ดู EIGRP neighbor ว่าสร้างความสัมพันธ์สำเร็จหรือไม่'],
 [/^show ip eigrp topology$/, 'ดู topology table ของ EIGRP รวมข้อมูล successor, distance และเส้นทางที่เรียนรู้'],
 [/^show ip protocols$/, 'ดู routing protocol ที่รัน, network, passive interface และข้อมูล redistribution'],
 [/^show route-map$/, 'ดู route-map แต่ละ sequence พร้อมเงื่อนไข match และ set ที่ตั้งไว้']
];
function terminalNote(command) {
 const c=command.replace(/^sudo\s+/,''),sudo=command.startsWith('sudo ')?'ใช้สิทธิ์ผู้ดูแล; ':'';
 if (/^ip -br addr$/.test(c)) return 'ดูชื่อ interface กับ IP แบบย่อ; ใช้ชื่อ interface จริงแทน eth0 ในคำสั่งถัดไป';
 if (/^ip addr show$/.test(c)) return 'ดู interface, link และ IP ที่เครื่องใช้อยู่';
 if (/^ip neigh$/.test(c)) return 'ดู neighbor/ARP cache เพื่อจับคู่ IPv4 กับ MAC บนลิงก์ local';
 let m=c.match(/^ip link set (\S+) (up|down)$/);if(m)return sudo+`${m[2]==='up'?'เปิด':'ปิด'} interface ${m[1]} บน Kali เพื่อเตรียมเปลี่ยน MAC ตามแลป`;
 m=c.match(/^macchanger -r (\S+)$/);if(m)return sudo+`สุ่ม MAC ของ ${m[1]} ในวงทดสอบ Port Security แล้วสร้าง traffic เพื่อสังเกต violation`;
 if(c.startsWith('ping ')){const count=c.match(/-c (\d+)/),interval=c.match(/-i (\S+)/);return `ส่ง ICMP Echo ไป ${c.split(/\s+/).at(-1)}${count?` จำนวน ${count[1]} ครั้ง`:''}${interval?` ทุก ${interval[1]} วินาที`:''} เพื่อวัด reachability/packet loss${!count?'; หยุดด้วย Ctrl+C ตาม terminal ที่ใช้':''}`;}
 if(c.startsWith('ssh '))return `ลองเชื่อม SSH ไป ${c.split(' ').at(-1)}; ใช้ทดสอบ traffic TCP/22 ที่ ACL อาจอนุญาตหรือปฏิเสธ`;
 if(c.startsWith('yersinia dtp '))return sudo+'ส่ง DTP ตามตัวเลือก -attack 1 ผ่าน -interface eth0 เพื่อเปรียบเทียบก่อนและหลังปิด DTP ในวงแลป';
 if(c==='yersinia -G')return sudo+'เปิดหน้าต่าง Yersinia ตามแลป; เลือก STP → Claiming Root Role ในขั้นทดลอง BPDU';
 if(c.startsWith('arp-scan '))return sudo+'สำรวจ IP/MAC ใน local network ของ eth0; --localnet ใช้ subnet ของ interface และ ARP ไม่ข้าม router';
 if(c.startsWith('nmap -sn '))return sudo+`สำรวจ host ใน ${c.split(' ').at(-1)} ด้วย -sn โดยไม่ทำ port scan แบบปกติ`;
 if(c.startsWith('nmap -sS -p '))return sudo+`ใช้ SYN scan (-sS) ตรวจ TCP ports ${c.split(' ')[3]} ของ ${c.split(' ').at(-1)}`;
 if(c.startsWith('fping -a -g '))return `สร้างรายชื่อ IP ใน ${c.split(' ').at(-1)} ด้วย -g และแสดงเครื่องที่ตอบด้วย -a`;
 if(c.startsWith('traceroute -n '))return `ติดตาม hop ไป ${c.split(' ').at(-1)}; -n แสดง IP โดยไม่แปลงเป็นชื่อ`;
 if(c.startsWith('tcpdump ')){const file=c.match(/-w (\S+)/);return sudo+'จับบน eth0 (-i; -ni รวม -n ไม่แปลงชื่อ), -nn ไม่แปลงชื่อ host/port'+(file?`; -w เก็บไฟล์ ${file[1]}`:'; แสดงแพ็กเก็ตบน terminal')+(c.includes('1985')?'; filter เลือก HSRP UDP/1985, ICMP หรือ ARP':c.includes('proto 88')?'; BPF เลือก EIGRP IP/88 หรือ OSPF IP/89':'; filter arp เลือกเฉพาะ ARP');}
 if(c.startsWith('tshark '))return sudo+'จับบน eth0; -Y vlan เป็น display filter, -T fields ให้ส่งออกเฉพาะฟิลด์ และ -e เลือกเลขเฟรม, VLAN ID, IP ต้นทาง/ปลายทาง; จุดจับต้องเห็น tag';
 throw new Error('Missing terminal explanation: '+command);
}
export function annotateCommands(code, {inputType, device='', initialMode}={}) {
 const first=code.split('\n').find(s=>s.trim())||'';
 const type=inputType||(/Wireshark|Display filter/i.test(device)?'filter':/Kali|PC[- ]|PC1/.test(device)&&!/SW\d/.test(device)?'shell':/^(sudo |ping |ssh |ip -|ip addr|ip neigh|fping |traceroute )/.test(first)?'shell':'ios');
 let state=initialMode||'exec';
 if(type==='ios'&&first.trim()==='enable'&&!initialMode)state='user';
 return code.split('\n').map((original,index)=>{
  const command=original.trim();if(!command)return {line:index+1,command:original,mode:'',nextMode:'',meaning:'บรรทัดว่าง แยกช่วงคำสั่ง',inputType:type};
  if(type==='filter')return {line:index+1,command:original,mode:'Wireshark · Display Filter',nextMode:'Wireshark · Display Filter',inputType:type,meaning:command==='stp.type == 0x00'?'แสดงเฉพาะ STP Configuration BPDU (type 0x00); ใส่ในช่อง Display Filter ไม่ใช่ terminal':command==='ospf'?'แสดงเฉพาะแพ็กเก็ตที่ Wireshark ถอดรหัสเป็น OSPF':command==='ip.proto == 88 || ip.proto == 89'?'แสดงแพ็กเก็ต IPv4 ของ EIGRP (88) หรือ OSPF (89); || คือ OR':'แสดงแพ็กเก็ตตาม display filter ที่ระบุ'};
  if(type==='shell')return {line:index+1,command:original,mode:'Terminal $',nextMode:'Terminal $',inputType:type,meaning:terminalNote(command)};
  const before=modes[state];let meaning;
  if(command==='exit'){meaning=`ออกจาก ${before} กลับ ${state==='global'?'privileged EXEC (#)':'global configuration (config)#'} หนึ่งระดับ`;state=state==='global'?'exec':'global';}
  else if(command==='end'){meaning='ออกจากโหมดตั้งค่ากลับ privileged EXEC (#); ยังไม่ได้บันทึก startup-config';state='exec';}
  else {
   const show=shows.find(([pattern])=>pattern.test(command));
   if(show){const match=command.match(show[0]);meaning=typeof show[1]==='function'?show[1](match):show[1];}
   else {const rule=rules.find(([pattern])=>pattern.test(command));if(!rule)throw new Error('Missing IOS explanation: '+command);const match=command.match(rule[0]);meaning=rule[1](match);if(rule[2])state=typeof rule[2]==='function'?rule[2](match):rule[2];}
  }
  return {line:index+1,command:original,mode:before,nextMode:modes[state],meaning,inputType:type};
 });
}
