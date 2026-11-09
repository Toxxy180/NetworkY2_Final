window.CHAPTERS = [
  {
    "id": 1,
    "title": "Ethernet Switching และ MAC Address",
    "shortTitle": "Switching & MAC",
    "subtitle": "ตามรอยเฟรมให้เป็น: เรียนรู้จากต้นทาง ตัดสินใจจากปลายทาง",
    "minutes": 30,
    "objectives": [
      "อธิบายวิธีเรียนรู้ MAC และตัดสินใจส่งเฟรมได้",
      "แยก Forward, Filter และ Flood จากสถานการณ์ได้",
      "อ่าน MAC Address Table และวิเคราะห์ Port Security ได้"
    ],
    "sections": [
      {
        "title": "1. Switch มองข้อมูลอะไร",
        "body": [
          "นึกถึงสวิตช์เป็นผู้คัดแยกซองจดหมายภายในอาคาร: ซองคือ Ethernet frame และเลขห้องคือ MAC Address",
          "งานหลักของ Layer 2 switch คือดูว่าเฟรมควรออกพอร์ตใด ภายใน VLAN ที่เฟรมอยู่ โดยไม่ได้เลือกเส้นทางข้าม IP subnet แบบเราเตอร์",
          "**MAC Address** ทั่วไปมี 48 บิต แสดงเป็นเลขฐานสิบหก 12 หลัก เช่น 0011.2233.4455",
          "ส่วน IP Address ใช้ระบุที่อยู่เชิงตรรกะใน Layer 3 การมี IP กับ MAC จึงทำหน้าที่คนละส่วน และเปลี่ยนแทนกันไม่ได้"
        ],
        "table": {
          "headers": [
            "สิ่งที่ดู",
            "ใช้ทำอะไร",
            "ตัวอย่าง"
          ],
          "rows": [
            [
              "Source MAC",
              "เรียนรู้ว่าอุปกรณ์ต้นทางอยู่ทางพอร์ตใด",
              "เฟรมจาก ...AA เข้าที่ Fa0/1"
            ],
            [
              "Destination MAC",
              "ค้นพอร์ตที่จะส่งเฟรมออก",
              "...BB อยู่ Fa0/2"
            ],
            [
              "VLAN",
              "จำกัดขอบเขต Layer 2 ที่กำลังพิจารณา",
              "ตารางและการ Flood ต้องอยู่ใน VLAN เดียวกัน"
            ],
            [
              "Destination IP",
              "ใช้เลือกเส้นทางโดยอุปกรณ์ Layer 3",
              "192.168.20.20 อยู่เครือข่ายปลายทางใด"
            ]
          ]
        },
        "pitfall": "Layer 3 switch ทำได้ทั้ง Switching และ Routing แต่เมื่อโจทย์ถามการเรียนรู้ MAC ให้นึกถึง Source MAC และพอร์ตขาเข้าเป็นหลัก"
      },
      {
        "title": "2. เรียนรู้ก่อน แล้วจึงเลือกพอร์ตส่งออก",
        "body": [
          "เมื่อเฟรมเข้าพอร์ต สวิตช์เรียนรู้ Source MAC แล้วบันทึกความสัมพันธ์ระหว่าง VLAN, MAC และพอร์ตขาเข้า หลังจากนั้นจึงค้น Destination MAC ใน VLAN นั้นเพื่อเลือกการส่งต่อ",
          "**ตัดสินใจส่งต่อจาก Destination MAC:** ตรวจว่าปลายทางอยู่ในตารางของ VLAN นั้นหรือไม่ แล้วแยกเป็น 3 กรณีต่อไปนี้"
        ],
        "diagram": "switch",
        "example": {
          "title": "เดินเฟรม A → B เมื่อเริ่มต้นตารางว่าง",
          "body": [
            "1) A มี MAC ...AA ส่งเฟรมถึง ...BB เข้าพอร์ต Fa0/1 ใน VLAN 10 สวิตช์เรียนรู้ ...AA → Fa0/1",
            "2) ยังไม่รู้ ...BB จึง Flood ใน VLAN 10 ไป Fa0/2 แต่ไม่ออก Fa0/3 เพราะ PC C อยู่ VLAN 20 และไม่ย้อนกลับ Fa0/1",
            "3) เมื่อ B ตอบกลับ เฟรมเข้าที่ Fa0/2 สวิตช์เรียนรู้ ...BB → Fa0/2 แล้วใช้รายการของ ...AA ส่งคำตอบไป Fa0/1",
            "4) เฟรม A → B ครั้งต่อไปส่งตรงไป Fa0/2 ได้แล้ว เพราะมีรายการปลายทางในตาราง"
          ]
        },
        "pitfall": "การส่งเฟรมของ A ไปหา B ไม่ได้ทำให้สวิตช์เรียนรู้ MAC ของ B ทันที ต้องเห็นเฟรมที่ B เป็นต้นทางก่อน",
        "bullets": [
          "**รู้ปลายทาง และอยู่พอร์ตอื่น:** ส่งออกเฉพาะพอร์ตที่ตารางระบุ",
          "**รู้ปลายทาง แต่อยู่พอร์ตขาเข้า:** Filter เฟรม; ไม่ส่งย้อนกลับพอร์ตเดิม",
          "**ไม่รู้ปลายทาง:** Flood ไปยังพอร์ตที่มีสิทธิ์ส่งต่อใน VLAN เดียวกัน ยกเว้นพอร์ตขาเข้า"
        ]
      },
      {
        "title": "3. Broadcast, Aging และการอ่านตาราง",
        "body": [
          "Broadcast ใช้ Destination MAC เป็น FFFF.FFFF.FFFF สวิตช์ส่งออกพอร์ตที่มีสิทธิ์ส่งต่อใน VLAN เดียวกัน ยกเว้นพอร์ตขาเข้า",
          "ส่วน Unknown unicast คือเฟรมที่ตั้งใจส่งถึงเครื่องเดียว แต่สวิตช์ยังไม่รู้ว่าอยู่พอร์ตไหน จึงต้อง Flood เช่นกัน เหตุผลที่ Flood ต่างกันแม้ผลการส่งคล้ายกัน",
          "**Dynamic MAC aging** ทำให้รายการเก่าหมดอายุเมื่อไม่มีเฟรมต้นทางมาคงความสดของรายการตามเวลาที่กำหนด อุปกรณ์ที่ย้ายพอร์ตสามารถถูกเรียนรู้ใหม่จากเฟรมขาเข้าได้",
          "เวลา aging ปรับได้และขึ้นกับแพลตฟอร์ม จึงไม่ควรตอบว่าเป็นค่าตายตัวทุกเครื่อง"
        ],
        "code": "SW1# show mac address-table dynamic\nVlan    Mac Address       Type       Ports\n10      0000.0000.00aa    DYNAMIC    Fa0/1\n10      0000.0000.00bb    DYNAMIC    Fa0/2\n20      0000.0000.00cc    DYNAMIC    Fa0/3\n\nSW1# show mac address-table interface fa0/1\nSW1# show interfaces status",
        "bullets": [
          "อ่านตารางจาก VLAN → MAC → Type → Port แล้วเทียบกับพอร์ตและ VLAN ในโจทย์",
          "หนึ่งพอร์ตอาจเรียนรู้หลาย MAC ได้ หากต่อกับสวิตช์อีกตัวหรือมีหลายอุปกรณ์อยู่หลังพอร์ตนั้น",
          "MAC table ผูก MAC กับพอร์ต ส่วน ARP table ผูก IPv4 กับ MAC เป็นคนละตาราง",
          "ถ้า MAC เดียวสลับไปมาหลายพอร์ตถี่ ๆ ให้สงสัย Loop หรือการเดินสายผิด ไม่ใช่สรุปว่า Aging เสมอ"
        ]
      },
      {
        "title": "4. Store-and-Forward ต่างจาก Cut-Through อย่างไร",
        "body": [
          "**Store-and-Forward** รับเฟรมครบก่อน ตรวจ Frame Check Sequence (FCS) แล้วค่อยส่งต่อ จึงสามารถทิ้งเฟรมที่ตรวจพบความผิดพลาดได้ก่อนส่งออก แต่ต้องรอรับเฟรมทั้งชุด",
          "**Cut-Through** เริ่มส่งเมื่ออ่านข้อมูลเพียงพอสำหรับการตัดสินใจส่งต่อ เช่น Destination MAC จึงลดความหน่วงจากการรอเฟรมครบ",
          "อย่างไรก็ตาม เมื่อเริ่มส่งไปแล้วอาจยังไม่ได้ตรวจ FCS ที่ท้ายเฟรม จึงมีโอกาสส่งส่วนของเฟรมเสียต่อออกไปด้วย"
        ],
        "table": {
          "headers": [
            "เปรียบเทียบ",
            "Store-and-Forward",
            "Cut-Through"
          ],
          "rows": [
            [
              "จุดเริ่มส่ง",
              "หลังรับเฟรมครบและตรวจสอบ",
              "หลังอ่านข้อมูลปลายทางเพียงพอ"
            ],
            [
              "ตรวจ FCS ก่อนส่ง",
              "ได้",
              "ไม่สามารถรับรองได้ก่อนเริ่มส่ง"
            ],
            [
              "จุดเด่น",
              "กรองเฟรมเสียก่อนส่งต่อ",
              "ลดความหน่วงในการเริ่มส่ง"
            ],
            [
              "แนวข้อสอบ",
              "ต้องการตรวจความเสียหายของเฟรม",
              "ต้องการเริ่มส่งเร็ว"
            ]
          ]
        },
        "pitfall": "FCS ใช้ตรวจความผิดพลาดของเฟรม ไม่ใช่การเข้ารหัส และไม่ได้ทำให้สวิตช์ซ่อมข้อมูลที่เสียได้เอง"
      },
      {
        "title": "5. Port Security และ Sticky MAC",
        "body": [
          "**Port Security** กำหนดว่า MAC ใดหรือกี่ MAC ใช้งานพอร์ตได้ เหมาะกับพอร์ตปลายทางที่ต้องการจำกัดอุปกรณ์ เช่น พอร์ตโต๊ะทำงานที่ให้คอมพิวเตอร์หนึ่งเครื่องใช้งาน",
          "แต่อาศัย MAC เป็นเงื่อนไข จึงไม่ใช่การยืนยันตัวตนผู้ใช้แบบ 802.1X",
          "**Sticky learning** ให้สวิตช์เรียนรู้ secure MAC แล้วเพิ่มลง running-config เมื่อบันทึก running-config เป็น startup-config รายการเหล่านั้นจึงอยู่ต่อหลังรีบูต",
          "การเปิด sticky อย่างเดียวโดยไม่บันทึกไม่รับประกันว่าจะคงอยู่หลังปิดเครื่อง"
        ],
        "code": "SW1(config)# interface fa0/1\nSW1(config-if)# switchport mode access\nSW1(config-if)# switchport access vlan 10\nSW1(config-if)# switchport port-security\nSW1(config-if)# switchport port-security maximum 1\nSW1(config-if)# switchport port-security mac-address sticky\nSW1(config-if)# switchport port-security violation shutdown\nSW1(config-if)# end\nSW1# show port-security interface fa0/1\nSW1# copy running-config startup-config",
        "example": {
          "title": "พอร์ตที่มีทั้ง IP Phone และ PC",
          "body": [
            "ถ้ามีโทรศัพท์และคอมพิวเตอร์อยู่หลังพอร์ตเดียว สวิตช์อาจเห็นมากกว่าหนึ่ง Source MAC ต้องกำหนด maximum และนโยบายตามจำนวนอุปกรณ์ที่อนุญาตจริง การตั้ง maximum 1 โดยไม่พิจารณา Voice/Data VLAN อาจทำให้เกิด violation"
          ]
        }
      },
      {
        "title": "6. เมื่อเกิด Violation ต้องวิเคราะห์อะไร",
        "body": [
          "สมมติพอร์ตเรียนรู้ MAC ที่อนุญาตครบแล้ว แต่พบเฟรมจาก MAC ใหม่ การตอบสนองขึ้นกับ violation mode การเลือกโหมดจึงเป็นนโยบายว่าต้องการทิ้งเฉพาะทราฟฟิกที่ผิดเงื่อนไขหรือหยุดทั้งพอร์ต",
          "ถ้าพอร์ตขึ้น err-disabled ให้หาต้นเหตุและตรวจ MAC ที่อนุญาตก่อน เช่น เปลี่ยนเครื่องตามแผนหรือมีอุปกรณ์เกินจริง",
          "จากนั้นแก้รายการ secure MAC/จำนวนที่อนุญาตตามนโยบาย แล้วจึงเปิดพอร์ตคืน ไม่ควรแก้ด้วยการปิด Port Security ทั้งระบบ"
        ],
        "table": {
          "headers": [
            "Mode",
            "เมื่อพบ MAC ที่ผิดเงื่อนไข",
            "พอร์ตและการแจ้งเตือน"
          ],
          "rows": [
            [
              "Protect",
              "ทิ้งเฟรมที่ผิดเงื่อนไข",
              "พอร์ตยังทำงาน โดยทั่วไปไม่มี violation notification/counter แบบ Restrict"
            ],
            [
              "Restrict",
              "ทิ้งเฟรมที่ผิดเงื่อนไข",
              "พอร์ตยังทำงาน พร้อมนับ violation และแจ้งเตือนตามระบบ"
            ],
            [
              "Shutdown",
              "หยุดการใช้งานพอร์ต",
              "พอร์ตเป็น err-disabled; เป็นค่าเริ่มต้นของ Port Security บน Cisco IOS ทั่วไป"
            ]
          ]
        },
        "code": "SW1# show port-security interface fa0/1\nSW1# show port-security address\nSW1# show interfaces status err-disabled\n! หลังตรวจและแก้สาเหตุแล้ว จึงเปิดพอร์ตคืน\nSW1(config)# interface fa0/1\nSW1(config-if)# shutdown\nSW1(config-if)# no shutdown",
        "pitfall": "Protected Port กับ Port Security ชื่อคล้ายกันแต่คนละงาน: Protected Port แยกการสื่อสารระหว่างพอร์ต ส่วน Port Security จำกัด MAC ที่ใช้งานพอร์ต"
      },
      {
        "title": "Hub, Bridge และ Switch แบ่งเครือข่ายอย่างไร",
        "body": [
          "Hub เป็นอุปกรณ์ Layer 1 ที่ทวนสัญญาณ ทุกเครื่องแบ่งแบนด์วิดท์และ collision domain เดียวกัน",
          "ส่วน bridge เรียนรู้ MAC เพื่อกรองเฟรมระหว่าง segment และ switch ทำหน้าที่เหมือน bridge หลายพอร์ต เมื่อใช้ full duplex ปลายทั้งสองส่งและรับพร้อมกันได้โดยไม่มี collision",
          "ถ้า PC สี่เครื่องเสียบคนละพอร์ตของสวิตช์และอยู่ VLAN เดียวกัน ให้นับสี่ลิงก์แยกกัน แต่ ARP Request หนึ่งครั้งยังถูกกระจายภายใน broadcast domain เดียว Router จะแยกขอบเขตนี้เมื่อส่งต่อข้าม subnet"
        ]
      },
      {
        "title": "อ่าน Ethernet frame จากสายถึง FCS",
        "body": [
          "Preamble 7 ไบต์และ SFD 1 ไบต์ช่วยให้ผู้รับจับจังหวะและรู้จุดเริ่มเฟรม",
          "จากนั้นอ่าน Destination MAC และ Source MAC อย่างละ 6 ไบต์ ตามด้วย Type/Length, payload และ FCS 4 ไบต์ที่ใช้ตรวจความเสียหายด้วย CRC เฟรมปกติขนาด 64–1518 ไบต์นับจาก Destination MAC ถึง FCS",
          "Fragment-free รอ 64 ไบต์แรกเพื่อลดการส่งต่อเศษเฟรม ส่วน store-and-forward รอจนตรวจ FCS ได้ MAC flooding อาศัยการส่งหลาย Source MAC ให้ตารางเต็ม จึงอาจทำให้ unknown unicast ถูก flood มากขึ้น",
          "ตัวอย่างมาตรฐาน IEEE 802.3 ที่ต่างกันที่อัตราส่งคือ 10BASE-T (10 Mbps), 100BASE-TX (100 Mbps) และ 1000BASE-T (1 Gbps) ทั้งหมดส่ง Ethernet frame และใช้ MAC เหมือนกัน สำหรับ MAC แบบ globally administered ช่วง OUI ช่วยระบุองค์กรที่ได้รับการจัดสรรหมายเลข"
        ]
      }
    ],
    "summary": [
      "เรียนรู้จาก Source MAC + พอร์ตขาเข้า + VLAN; ค้น Destination MAC เพื่อตัดสินใจส่ง",
      "Known unicast ส่งเฉพาะทาง; Unknown unicast/Broadcast Flood เฉพาะ VLAN และไม่ย้อนพอร์ตขาเข้า",
      "ปลายทางอยู่พอร์ตเดียวกับขาเข้า → Filter",
      "Dynamic aging ช่วยล้างข้อมูลเก่า; MAC table ไม่ใช่ ARP table",
      "Store-and-Forward ตรวจ FCS ก่อนส่ง ส่วน Cut-Through เริ่มส่งเร็วกว่า",
      "Sticky เพิ่มลง running-config ต้องบันทึกเพื่อคงอยู่หลังรีบูต",
      "Protect/Restrict ทิ้งเฟรมผิดเงื่อนไข; Shutdown ทำพอร์ต err-disabled"
    ],
    "questions": [
      {
        "id": "1-01",
        "prompt": "Layer 2 switch ใช้ข้อมูลใดเป็นหลักในการเลือกพอร์ตส่ง Ethernet frame?",
        "options": [
          "Destination IP",
          "Destination MAC ร่วมกับ VLAN",
          "TCP destination port",
          "DNS name"
        ],
        "answer": 1,
        "explanation": "การส่งต่อใน Layer 2 ค้น Destination MAC ภายใน VLAN นั้น ส่วน Destination IP เป็นข้อมูลหลักของการเลือกเส้นทาง Layer 3",
        "level": "พื้นฐาน"
      },
      {
        "id": "1-02",
        "prompt": "จากภาพ เมื่อ A ส่งเฟรมถึง B และตาราง MAC ว่าง สวิตช์เรียนรู้รายการใดทันที?",
        "options": [
          "...BB → Fa0/2",
          "...AA → Fa0/2",
          "...CC → Fa0/3",
          "...AA → Fa0/1 ใน VLAN 10"
        ],
        "answer": 3,
        "explanation": "สวิตช์เรียนรู้ Source MAC ของ A จากพอร์ตขาเข้า Fa0/1 การเป็น Destination ของ B ไม่ทำให้ทราบตำแหน่ง B โดยอัตโนมัติ",
        "level": "ประยุกต์",
        "diagram": "switch"
      },
      {
        "id": "1-03",
        "prompt": "จากภาพ สมมติมีเฉพาะพอร์ตที่แสดงและทุกพอร์ตอยู่สถานะ Forwarding หาก A ส่ง unknown unicast ใน VLAN 10 สวิตช์ส่งออกทางใด?",
        "options": [
          "Fa0/2 เท่านั้น",
          "Fa0/1 และ Fa0/2",
          "Fa0/2 และ Fa0/3",
          "Fa0/3 เท่านั้น"
        ],
        "answer": 0,
        "explanation": "Flood ได้เฉพาะ VLAN 10 และไม่ย้อนพอร์ตขาเข้า Fa0/1 จึงเหลือ Fa0/2 ส่วน Fa0/3 อยู่ VLAN 20",
        "level": "วิเคราะห์",
        "diagram": "switch"
      },
      {
        "id": "1-04",
        "prompt": "เฟรมเข้าที่ Gi0/1 และตารางระบุว่าปลายทางอยู่ Gi0/1 ใน VLAN เดียวกัน สวิตช์ควรทำอย่างไร?",
        "options": [
          "Flood ทุกพอร์ต",
          "ส่งกลับ Gi0/1",
          "Filter เฟรมนี้ ไม่ส่งกลับพอร์ตเดิม",
          "ลบ VLAN นั้น"
        ],
        "answer": 2,
        "explanation": "ปลายทางอยู่ด้านเดียวกับต้นทางผ่านพอร์ตเดียวกัน สวิตช์ไม่จำเป็นต้องส่งเฟรมกลับออกทางที่รับมา จึง Filter",
        "level": "ประยุกต์"
      },
      {
        "id": "1-05",
        "prompt": "Broadcast frame มี Destination MAC ใด?",
        "options": [
          "0000.0000.0000",
          "FFFF.FFFF.FFFF",
          "224.0.0.18",
          "255.255.255.0"
        ],
        "answer": 1,
        "explanation": "Ethernet broadcast ใช้ MAC ทุกบิตเป็น 1 คือ FFFF.FFFF.FFFF ส่วนสองตัวเลือกท้ายเป็นรูปแบบ IPv4 ไม่ใช่ MAC",
        "level": "พื้นฐาน"
      },
      {
        "id": "1-06",
        "prompt": "เหตุผลหลักของ Dynamic MAC aging คืออะไร?",
        "options": [
          "ล้างรายการเก่าที่ไม่ถูกใช้งานตามเวลาที่กำหนด",
          "เข้ารหัส MAC Address",
          "เปลี่ยน MAC ของทุกเครื่องเมื่อหมดเวลา",
          "ทำให้ทุกพอร์ตเป็น Trunk"
        ],
        "answer": 0,
        "explanation": "Aging ช่วยให้ตารางไม่เก็บตำแหน่งอุปกรณ์เก่าตลอดไป หลังรายการหมดอายุ สวิตช์เรียนรู้ใหม่เมื่อเห็นเฟรมต้นทาง",
        "level": "พื้นฐาน"
      },
      {
        "id": "1-07",
        "prompt": "ต้องการทิ้งเฟรมที่ FCS ผิดก่อนส่งออก ควรเลือกวิธีใด?",
        "options": [
          "Cut-Through",
          "VTP Pruning",
          "PortFast",
          "Store-and-Forward"
        ],
        "answer": 3,
        "explanation": "Store-and-Forward รับทั้งเฟรมจึงตรวจ FCS ที่ท้ายเฟรมได้ก่อนเริ่มส่งต่อ ขณะที่ Cut-Through อาจเริ่มส่งก่อนตรวจครบ",
        "level": "ประยุกต์"
      },
      {
        "id": "1-08",
        "prompt": "ข้อใดอธิบายข้อแลกเปลี่ยนของ Cut-Through ได้ถูกต้อง?",
        "options": [
          "ต้องรอรับครบทุกเฟรมเสมอ",
          "เข้ารหัสได้เร็วแต่ถอดรหัสไม่ได้",
          "เริ่มส่งเร็ว แต่อาจส่งเฟรมเสียออกไปก่อนตรวจ FCS ครบ",
          "ไม่ต้องอ่าน Destination MAC"
        ],
        "answer": 2,
        "explanation": "Cut-Through ลดเวลารอทั้งเฟรม แต่การตรวจ FCS อาจยังไม่เสร็จตอนเริ่มส่ง จึงไม่รับประกันการกรองเฟรมเสียก่อนส่ง",
        "level": "วิเคราะห์"
      },
      {
        "id": "1-09",
        "prompt": "show mac address-table แสดงหลาย MAC บน Gi0/1 ข้อสรุปใดเหมาะสมที่สุด?",
        "options": [
          "Gi0/1 เสียแน่นอน",
          "อาจมีสวิตช์หรือหลายอุปกรณ์อยู่หลัง Gi0/1",
          "ทุก MAC ถูกโจมตีปลอมแน่นอน",
          "สวิตช์กำลังทำ DNS"
        ],
        "answer": 1,
        "explanation": "พอร์ตที่ต่อสวิตช์อีกตัวจะเห็น Source MAC ของหลายเครื่องที่อยู่ด้านนั้นได้ จำนวนหลาย MAC อย่างเดียวไม่ยืนยันว่าเป็นการโจมตี",
        "level": "วิเคราะห์"
      },
      {
        "id": "1-10",
        "prompt": "หลังเปิด Sticky MAC และเรียนรู้เครื่องแล้ว ต้องทำอะไรเพื่อให้ค่าคงอยู่หลังรีบูต?",
        "options": [
          "copy running-config startup-config",
          "clear mac address-table dynamic",
          "shutdown ทุกพอร์ต",
          "เปลี่ยน MAC เป็น Broadcast"
        ],
        "answer": 0,
        "explanation": "Sticky MAC ถูกเพิ่มลง running-config ต้องบันทึก startup-config เพื่อให้บูตครั้งถัดไปใช้รายการที่บันทึกไว้",
        "level": "ประยุกต์"
      },
      {
        "id": "1-11",
        "prompt": "ต้องการทิ้งเฟรมจาก MAC ที่ผิดเงื่อนไข พร้อมเพิ่ม violation counter แต่ยังให้ MAC ที่อนุญาตใช้งานพอร์ตได้ ควรใช้โหมดใด?",
        "options": [
          "Shutdown",
          "PortFast",
          "Protect",
          "Restrict"
        ],
        "answer": 3,
        "explanation": "Restrict ทิ้งเฟรมที่ผิดเงื่อนไขพร้อมนับ/แจ้ง violation โดยพอร์ตยังทำงาน ส่วน Shutdown ปิดทั้งพอร์ต และ Protect ไม่มีการแจ้งแบบเดียวกัน",
        "level": "ประยุกต์"
      },
      {
        "id": "1-12",
        "prompt": "Port Security violation mode Shutdown ส่งผลโดยตรงอย่างไร?",
        "options": [
          "ปิดทั้งสวิตช์",
          "ลบทุก VLAN",
          "ทำให้พอร์ตนั้นเข้า err-disabled",
          "เลือก Root Bridge ใหม่เสมอ"
        ],
        "answer": 2,
        "explanation": "Shutdown ของ Port Security หยุดพอร์ตที่ละเมิด โดยเข้า error-disabled ไม่ใช่สั่งปิดอุปกรณ์ทั้งเครื่อง",
        "level": "พื้นฐาน"
      },
      {
        "id": "1-13",
        "prompt": "พอร์ต maximum 1 เรียนรู้เครื่องเดิมแล้ว เมื่อเสียบเครื่องใหม่พอร์ต err-disabled ควรทำสิ่งใดก่อนเปิดคืน?",
        "options": [
          "ปิด Port Security ทั้งระบบทันที",
          "ตรวจ MAC/เหตุผลการเปลี่ยนเครื่อง และปรับรายการตามนโยบาย",
          "สั่ง reload โดยไม่ตรวจอะไร",
          "เปลี่ยน Native VLAN ให้ไม่ตรงกัน"
        ],
        "answer": 1,
        "explanation": "ต้องแก้ต้นเหตุหรือรายการที่อนุญาตก่อน ไม่เช่นนั้นเปิดพอร์ตคืนก็อาจเกิด violation ซ้ำ การแก้ต้องรักษานโยบายของพอร์ต",
        "level": "วิเคราะห์"
      },
      {
        "id": "1-14",
        "prompt": "ข้อใดแยก MAC Address Table ออกจาก ARP Table ได้ถูกต้อง?",
        "options": [
          "MAC table ผูก MAC กับพอร์ต/VLAN; ARP ผูก IPv4 กับ MAC",
          "ทั้งคู่เก็บเฉพาะ TCP ports",
          "MAC table ผูกชื่อเว็บกับ IP; ARP เก็บรหัสผ่าน",
          "ทั้งคู่ใช้เลือก DR ของ OSPF"
        ],
        "answer": 0,
        "explanation": "ตาราง MAC ใช้ส่งเฟรมผ่านพอร์ต ส่วน ARP ใช้หา MAC ของ IPv4 ในลิงก์เดียวกัน หน้าที่ต่างกันแม้ทั้งคู่มี MAC",
        "level": "พื้นฐาน"
      },
      {
        "id": "1-15",
        "prompt": "พอร์ตหนึ่งต่อ IP Phone และ PC หลังโทรศัพท์ หากกำหนด secure maximum 1 โดยไม่พิจารณา Voice/Data VLAN จะมีความเสี่ยงใด?",
        "options": [
          "ทำให้ OSPF เปลี่ยนเป็น EIGRP",
          "ทำให้ทุกเฟรมกลายเป็น Broadcast",
          "ทำให้โทรศัพท์ไม่มี IP ได้ทุกกรณี",
          "เห็นมากกว่าหนึ่ง Source MAC จนเกิด violation"
        ],
        "answer": 3,
        "explanation": "โทรศัพท์และ PC เป็นคนละอุปกรณ์และมี MAC ของตนเอง จำนวน secure MAC ต้องรองรับรูปแบบใช้งานจริงและความสามารถของแพลตฟอร์ม",
        "level": "วิเคราะห์"
      }
    ],
    "sources": [
      {
        "title": "Cisco — Troubleshooting LAN Switching Environments",
        "url": "https://www.cisco.com/en/US/docs/internetworking/troubleshooting/guide/tr1923.html"
      },
      {
        "title": "Cisco — Port Security, Catalyst 2960-L",
        "url": "https://www.cisco.com/c/en/us/td/docs/switches/lan/catalyst2960l/software/15-2_7_e/configuration_guide/sec/b_1527e_security_2960l_cg/port_security.html"
      }
    ],
    "labs": [
      {
        "title": "ตั้งค่า SW1 และ SW2 จากหน้า console",
        "body": [
          "**เข้าโหมดตั้งค่า:** เริ่มที่ `Switch>` บน SW1; ใช้ `enable` เข้าโหมด `#` แล้วใช้ `configure terminal` เข้า `(config)#`",
          "**แยกโหมดย่อย:** `line` ใช้ตั้งค่าสาย console/VTY; `interface` ใช้ตั้งค่าพอร์ตหรือ SVI",
          "**ออกจากโหมด:** `exit` ย้อนหนึ่งระดับ; `end` กลับ privileged EXEC (`#`)"
        ],
        "steps": [
          {
            "device": "SW1 · Cisco IOS",
            "code": "enable\nconfigure terminal\nhostname SW1\nenable secret cisco123\nline console 0\n password cisco\n login\n exec-timeout 5 0\n exit\nline vty 0 4\n password cisco\n login\n exit\ninterface vlan 1\n ip address 192.168.1.2 255.255.255.0\n no shutdown\n exit\nip default-gateway 192.168.1.1\nend\nshow ip interface brief\nshow running-config\ncopy running-config startup-config\nshow version"
          }
        ],
        "example": {
          "title": "ตรวจผลและอธิบาย",
          "body": [
            "ทำซ้ำบน SW2 โดยใช้ hostname SW2 และ IP 192.168.1.3/24 ตรวจว่า Vlan 1 เป็น up/up เมื่อมีพอร์ต VLAN 1 ที่ใช้งานอยู่ และ running-config แสดง IP ของแต่ละเครื่องถูกตัว เมื่อ copy ถามชื่อปลายทาง ให้กด Enter เพื่อรับค่าเดิม",
            "รหัสผ่านเป็นตัวอย่างในแลบ VTY ใช้รับการเชื่อมต่อระยะไกล Telnet ส่งข้อมูลอ่านได้บนสาย ส่วน SSH เข้ารหัส ให้ตรวจ image และความสามารถด้าน crypto ด้วย show version"
          ]
        }
      },
      {
        "title": "พิสูจน์ MAC learning จากเฟรมที่สวิตช์ได้รับ",
        "body": [
          "**ต่ออุปกรณ์:** Kali-1 → Fa0/1; Kali-2 → Fa0/2; ทั้งสองอยู่ VLAN 1",
          "**เริ่มทดสอบ:** เริ่มจากตาราง MAC ว่าง แล้วสร้างทราฟฟิกตามคำสั่งของแต่ละอุปกรณ์",
          "**ตรวจผล:** เทียบ Source MAC, VLAN และพอร์ตที่สวิตช์เรียนรู้"
        ],
        "steps": [
          {
            "device": "SW1 · Privileged EXEC",
            "code": "show interfaces status\nclear mac address-table dynamic\nshow mac address-table dynamic"
          },
          {
            "device": "Kali-1 · terminal",
            "code": "ping -c 4 192.168.1.20"
          },
          {
            "device": "SW1 · หลัง ping",
            "code": "show mac address-table dynamic\nshow mac address-table aging-time\nconfigure terminal\nmac address-table static 0011.2233.4455 vlan 1 interface fastEthernet 0/1\nend\nshow mac address-table static"
          }
        ],
        "example": {
          "title": "ตรวจผลและอธิบาย",
          "body": [
            "หา MAC ของทั้งสองเครื่องตามพอร์ตขาเข้า เครื่องหลัง SW2 จะปรากฏก็ต่อเมื่อมีเฟรมจากเครื่องนั้นมาถึง SW1 จึงควรตอบจากรายการที่สังเกตได้จริง Static entry ระบุพอร์ตไว้เองและอยู่ต่อหลัง dynamic entry หมดอายุ",
            "ฝึกอ่านจากภาพหน้า 1 ของไฟล์คำสั่งสำคัญฯ ตาราง dynamic มี 3 รายการ โดย 2 รายการชี้ Fa0/24 และ 1 รายการชี้ Fa0/2 จึงนับจำนวนเครื่องจากจำนวนพอร์ตที่มีรายการอย่างเดียวไม่ได้ ส่วนตาราง aging แสดง 300 วินาทีใน VLAN 1, 10, 20 และ 30 ของเครื่องที่จับภาพ"
          ]
        }
      },
      {
        "title": "ทำให้เกิด Port Security violation แล้วกู้พอร์ต",
        "body": [
          "**ตั้งนโยบาย:** กำหนด maximum 2 และ sticky บนพอร์ตผู้ใช้สามพอร์ต",
          "**ทดลองทีละพอร์ต:** ให้สวิตช์เรียนรู้ครบสอง MAC ก่อน แล้วส่งเฟรมจาก MAC ที่สาม",
          "**เปรียบเทียบผล:** ดู violation mode, counter และสถานะพอร์ต ก่อนกู้พอร์ตตามขั้นตอน"
        ],
        "steps": [
          {
            "device": "SW1 · เริ่มที่ #",
            "code": "configure terminal\ninterface range fastEthernet 0/1 - 3\n switchport mode access\n switchport port-security\n switchport port-security maximum 2\n switchport port-security mac-address sticky\n exit\ninterface fa0/1\n switchport port-security violation protect\n exit\ninterface fa0/2\n switchport port-security violation restrict\n exit\ninterface fa0/3\n switchport port-security violation shutdown\nend"
          },
          {
            "device": "Kali ที่ต่อพอร์ตทดสอบ · เปลี่ยน MAC แล้วสร้าง traffic",
            "code": "sudo ip link set eth0 down\nsudo macchanger -r eth0\nsudo ip link set eth0 up\nping -c 2 192.168.1.2"
          },
          {
            "device": "SW1 · ตรวจพอร์ตที่ทดลองและกู้ Fa0/3 หลังนำ MAC ที่ละเมิดออก",
            "code": "show port-security address\nshow port-security interface fa0/2\nshow interfaces status err-disabled\nconfigure terminal\ninterface fa0/3\n shutdown\n no shutdown\nend\nshow port-security interface fa0/3"
          }
        ],
        "example": {
          "title": "ตรวจผลและอธิบาย",
          "body": [
            "Protect ทิ้งเฟรมจาก MAC เกินจำนวน โดย MAC เดิมยังผ่านได้ Restrict ทิ้งเฟรมเช่นกันและนับ violation",
            "ส่วน Shutdown ทำให้ทั้งพอร์ต err-disabled จึงกระทบ MAC เดิมด้วย ถ้าเปลี่ยน MAC ครั้งแรกแล้วยังผ่าน ให้ตรวจจำนวน secure MAC ก่อนสรุปผล",
            "ในภาพหน้า 2 ของไฟล์เดียวกัน Fa0/3 แสดง Violation Mode = Shutdown แต่ Port Status = Secure-up และ Security Violation Count = 0 คำว่า Shutdown ในช่อง Mode จึงบอกว่าจะทำอะไรเมื่อเกิดเหตุ ส่วนช่อง Status บอกสภาพจริงขณะนั้น"
          ]
        }
      }
    ],
    "courseFiles": [
      "chapter1_lecture (2).pdf · หน้า 4–35",
      "chapter2 Switched Network.pdf · หน้า 2–29",
      "week1_lab_sheet (1).pdf · ส่วน 1–4",
      "lab/คำสั่งสำคัญ และ show running config.pdf · หน้า 1–3"
    ]
  },
  {
    "id": 2,
    "title": "VLAN, Trunk, VTP และความปลอดภัยของพอร์ต",
    "shortTitle": "VLAN & Trunk",
    "subtitle": "แยกห้องในเครือข่าย และพาหลาย VLAN เดินทางผ่านสายเดียว",
    "minutes": 35,
    "objectives": [
      "แยก Access, Trunk, Native และ Allowed VLAN ได้",
      "อธิบายบทบาท VTP และความเสี่ยงของ Revision ได้",
      "วิเคราะห์ VLAN hopping, Voice VLAN และ Protected Port ได้"
    ],
    "sections": [
      {
        "title": "1. VLAN คือขอบเขต Broadcast ที่แยกกัน",
        "body": [
          "VLAN แบ่งสวิตช์เชิงตรรกะเป็นหลายเครือข่าย Layer 2 แม้ใช้ฮาร์ดแวร์เครื่องเดียวกัน เช่น VLAN 10 สำหรับนักศึกษา และ VLAN 20 สำหรับเจ้าหน้าที่ Broadcast ใน VLAN 10 ไม่ถูกสวิตช์ Layer 2 ส่งข้ามไป VLAN 20",
          "อุปกรณ์ใน VLAN เดียวกันอาจอยู่คนละสวิตช์ได้ ถ้ามีเส้นทาง Layer 2 ที่ขนส่ง VLAN นั้นถึงกัน ส่วนอุปกรณ์คนละ VLAN ต้องผ่าน Routing เมื่อต้องการสื่อสารระหว่างกัน การเสียบสวิตช์เครื่องเดียวกันจึงไม่ได้แปลว่าจะติดต่อกันได้เสมอ"
        ],
        "diagram": "vlan",
        "example": {
          "title": "เทียบ VLAN กับชั้นเรียน",
          "body": [
            "สวิตช์เหมือนอาคาร VLAN เหมือนห้องเรียน เสียงประกาศในห้องหนึ่งไม่ควรไปรบกวนอีกห้อง การต่อ Trunk เหมือนสร้างทางเชื่อมที่ติดป้ายว่าข้อมูลชิ้นนี้มาจากห้องใด ส่วนการไปอีก VLAN ต้องผ่านจุด Routing"
          ]
        },
        "pitfall": "VLAN ID กับเลข IP subnet เป็นคนละค่า เรามักตั้ง VLAN 10 คู่กับ 192.168.10.0/24 เพื่อจำง่าย แต่ไม่มีข้อบังคับว่าตัวเลขต้องตรงกัน"
      },
      {
        "title": "2. Access, Trunk และ 802.1Q",
        "body": [
          "**Access port** ปกติรับส่งข้อมูลของ Data VLAN เดียวให้เครื่องปลายทาง เฟรมที่ PC ทั่วไปส่งมักไม่มี VLAN tag สวิตช์จึงใช้การกำหนด access VLAN ของพอร์ตเป็นตัวบอกว่าเฟรมนั้นอยู่ VLAN ใด",
          "**Trunk** ใช้ลิงก์เดียวขนหลาย VLAN โดยมาตรฐาน IEEE 802.1Q เพิ่ม tag ระบุ VLAN การรับเฟรม tagged ที่สวิตช์ปลายทางจึงยังแยก VLAN ได้ เมื่อออก Access port ไปยัง PC ทั่วไป tag จะถูกนำออกตามรูปแบบพอร์ต"
        ],
        "table": {
          "headers": [
            "ประเภท",
            "งานหลัก",
            "ตัวอย่าง"
          ],
          "rows": [
            [
              "Access",
              "เชื่อมอุปกรณ์ปลายทางกับ Data VLAN",
              "PC → SW1 VLAN 10"
            ],
            [
              "Trunk",
              "ขนหลาย VLAN บนลิงก์เดียว",
              "SW1 ↔ SW2"
            ],
            [
              "802.1Q tag",
              "ระบุ VLAN ของเฟรมบน Trunk",
              "VLAN ID 10 หรือ 20"
            ],
            [
              "Voice VLAN",
              "รองรับเสียงแยกจาก Data VLAN บนพอร์ตโทรศัพท์",
              "IP Phone VLAN 30 + PC VLAN 10"
            ]
          ]
        },
        "code": "SW1(config)# vlan 10\nSW1(config-vlan)# name STUDENT\nSW1(config)# vlan 20\nSW1(config-vlan)# name STAFF\nSW1(config)# interface fa0/1\nSW1(config-if)# switchport mode access\nSW1(config-if)# switchport access vlan 10\nSW1(config-if)# switchport nonegotiate",
        "pitfall": "Voice VLAN เป็นข้อยกเว้นสำคัญของคำพูดสั้น ๆ ว่า Access port มี VLAN เดียว: พอร์ตโทรศัพท์อาจมีทั้ง Data VLAN และ Voice VLAN โดยยังเป็น Access port ตามรูปแบบ Cisco"
      },
      {
        "title": "3. Native VLAN และ Allowed VLAN ต้องตรวจทั้งสองฝั่ง",
        "body": [
          "โดยทั่วไป 802.1Q Trunk ส่งเฟรมของ Native VLAN แบบ untagged เมื่อรับเฟรม untagged ฝั่งปลายทางจึงจัดเข้า Native VLAN ของตน",
          "ถ้าสองฝั่งตั้ง Native VLAN ต่างกัน อาจเกิดการจัดเฟรมผิด VLAN และปัญหาเครือข่ายตามมา",
          "บางแพลตฟอร์มตั้งให้ tag Native VLAN ได้ จึงควรอ่านเงื่อนไขในโจทย์",
          "**Allowed VLAN list** คือรายการ VLAN ที่อนุญาตให้ผ่าน Trunk การสร้าง VLAN สำเร็จไม่ได้แปลว่าจะผ่าน Trunk ได้ทันที ต้องมี VLAN นั้นในฐานข้อมูล ถูกอนุญาต และมีสถานะส่งต่อที่เหมาะสมทั้งเส้นทาง"
        ],
        "diagram": "vlan",
        "code": "! ตั้งให้สอดคล้องกันที่ SW1 และ SW2\nSwitch(config)# vlan 999\nSwitch(config-vlan)# name UNUSED_NATIVE\nSwitch(config)# interface gi0/1\nSwitch(config-if)# switchport mode trunk\nSwitch(config-if)# switchport trunk native vlan 999\nSwitch(config-if)# switchport trunk allowed vlan 10,20\nSwitch(config-if)# switchport nonegotiate\nSwitch# show interfaces trunk\nSwitch# show interfaces gi0/1 switchport",
        "example": {
          "title": "VLAN 10 ผ่านได้ แต่ VLAN 20 ผ่านไม่ได้",
          "body": [
            "ตรวจ Allowed VLAN ทั้งสองฝั่ง หากฝั่งหนึ่งอนุญาตเฉพาะ 10 เฟรม VLAN 20 จะไม่ผ่านลิงก์นั้น แม้ PC ทั้งสองฝั่งกำหนด IP ถูกต้องแล้วก็ตาม จากนั้นตรวจ VLAN database และสถานะ STP ของ VLAN 20"
          ]
        },
        "pitfall": "ตัวอย่างกำหนด Native VLAN 999 ที่ไม่มีผู้ใช้และไม่ได้อนุญาต user traffic ของ VLAN 999 ผ่าน Trunk อย่าสับสนว่า Allowed VLAN list เป็นการปิดทุก control protocol โดยอัตโนมัติ"
      },
      {
        "title": "4. VTP กระจายฐานข้อมูล VLAN ไม่ได้สร้าง Trunk แทนเรา",
        "body": [
          "**VTP** ช่วยให้สวิตช์ใน domain เดียวกันมีฐานข้อมูล VLAN สอดคล้องกัน โดยแลกประกาศผ่าน Trunk เหมาะกับเครือข่ายที่มีสวิตช์หลายตัว แต่ต้องวางนโยบาย domain, version, mode และ authentication ให้สอดคล้องกัน",
          "สำหรับ VTP v1/v2 ที่พบบ่อยในแลป Server สร้าง/แก้ VLAN และประกาศฐานข้อมูล Client รับไปใช้",
          "ส่วน Transparent ดูแล VLAN ในเครื่องตัวเองและไม่ซิงก์ฐานข้อมูลตามประกาศที่ได้รับ การส่งต่อประกาศของ Transparent ขึ้นกับเวอร์ชัน เช่น v2 ส่งต่อทาง Trunk ได้",
          "**Revision** เป็นเลขเวอร์ชันฐานข้อมูล ไม่ใช่คะแนนความน่าเชื่อถือ",
          "ใน VTP v1/v2 สวิตช์เก่าที่มี domain ตรงและ revision สูงกว่าอาจทำให้ฐานข้อมูลที่ไม่ต้องการแพร่ไปในเครือข่าย จึงต้องตรวจและเตรียมอุปกรณ์ก่อนเชื่อมต่อจริง ไม่ควรจำว่าค่าสูงกว่าแปลว่าดีกว่า"
        ],
        "table": {
          "headers": [
            "Mode/Feature",
            "จำให้ตรงหน้าที่"
          ],
          "rows": [
            [
              "Server (v1/v2)",
              "แก้ฐานข้อมูล VLAN และประกาศให้ domain"
            ],
            [
              "Client (v1/v2)",
              "รับฐานข้อมูล ไม่สร้าง/ลบ VLAN ในเครื่องตามปกติ"
            ],
            [
              "Transparent",
              "แก้ VLAN ในเครื่องเอง ไม่เอาฐานข้อมูลของ domain มาเขียนทับ"
            ],
            [
              "VTP Pruning",
              "ลด flooded traffic ของ VLAN บน Trunk ที่ไม่มีผู้ต้องใช้ VLAN นั้น"
            ],
            [
              "VTP v3",
              "มีกลไก Primary Server เพิ่มเติม จึงอย่านำกฎ v1/v2 ทุกข้อไปใช้ตรง ๆ"
            ]
          ]
        },
        "code": "Switch# show vtp status\nSwitch# show vlan brief\nSwitch# show interfaces trunk\nSwitch# show cdp neighbors",
        "pitfall": "VTP ไม่ได้แจก IP, ไม่กำหนด access VLAN ให้ทุกพอร์ตแทนเรา และไม่ใช่ตัวเจรจา Trunk; การเจรจา Trunk เป็นงานของ DTP"
      },
      {
        "title": "5. ป้องกัน Switch Spoofing และ Double Tagging",
        "body": [
          "**Switch spoofing** อาศัยพอร์ตที่ยอมเจรจา Trunk เช่น attacker ทำตัวคล้ายสวิตช์เพื่อให้ลิงก์กลายเป็น Trunk",
          "วิธีป้องกันที่พอร์ตผู้ใช้คือกำหนด switchport mode access และปิด DTP ด้วย switchport nonegotiate เมื่อแพลตฟอร์มรองรับ",
          "**Double tagging** อาศัย tag ซ้อนและพฤติกรรมการจัดการ Native VLAN ในเงื่อนไขที่เหมาะสม เฟรมอาจถูกตีความเป็น VLAN อื่นเมื่อผ่านสวิตช์ถัดไป",
          "แนวลดความเสี่ยงคือใช้ Native VLAN ที่ไม่มีผู้ใช้ ตั้งให้ตรงกัน จำกัด VLAN ที่ผ่าน Trunk และใช้การ tag Native VLAN เมื่อแพลตฟอร์มและการออกแบบรองรับ"
        ],
        "bullets": [
          "กำหนดบทบาทพอร์ตชัดเจน: ผู้ใช้เป็น Access, uplink ที่จำเป็นเป็น Trunk",
          "ปิดและแยกพอร์ตที่ไม่ได้ใช้งานตามนโยบาย",
          "อย่าใช้ Native VLAN เป็น VLAN สำหรับผู้ใช้ทั่วไป",
          "จำกัด Allowed VLAN ให้มีเฉพาะ VLAN ที่จำเป็น",
          "ตรวจทั้งสองฝั่งของ Trunk ไม่ดู config ฝั่งเดียวแล้วสรุป"
        ],
        "pitfall": "เปลี่ยน Native VLAN อย่างเดียวไม่ใช่การป้องกันทุกกรณี และ VLAN separation ไม่ได้หมายความว่าข้อมูลถูกเข้ารหัส"
      },
      {
        "title": "6. Voice VLAN และ Protected Port",
        "body": [
          "เมื่อ PC ต่อผ่าน IP Phone มายังพอร์ตสวิตช์เดียวกัน เราแยก Data VLAN ของ PC ออกจาก Voice VLAN ของโทรศัพท์ได้ โทรศัพท์ที่รองรับจะ tag ทราฟฟิกเสียงตาม Voice VLAN",
          "การแยกนี้ช่วยจัดนโยบายและ QoS แต่การตั้ง Voice VLAN อย่างเดียวไม่ได้รับประกันคุณภาพเสียง ต้องพิจารณาความหน่วง ความแปรปรวน และการจัดคิวด้วย",
          "**Protected Port** ใช้แยกการส่ง data traffic ระดับ Layer 2 ระหว่างพอร์ตที่ถูกตั้ง protected บนสวิตช์เชิงตรรกะเดียวกัน ทั้ง unicast, multicast และ broadcast แต่ยังส่งถึงพอร์ต unprotected ตามปกติได้",
          "ความสามารถนี้ไม่เทียบเท่า Private VLAN แบบครบรูป และไม่ใช่การยืนยันตัวตน"
        ],
        "code": "! ตัวอย่างพอร์ต IP Phone พร้อม PC\nSwitch(config)# interface fa0/5\nSwitch(config-if)# switchport mode access\nSwitch(config-if)# switchport access vlan 10\nSwitch(config-if)# switchport voice vlan 30\n\n! ตัวอย่างแยกพอร์ตปลายทางสองพอร์ตบนสวิตช์เดียวกัน\nSwitch(config)# interface range fa0/6 - 7\nSwitch(config-if-range)# switchport protected",
        "example": {
          "title": "หอพักที่ผู้ใช้ไม่ควรส่ง Layer 2 ถึงกัน",
          "body": [
            "ตั้งพอร์ตห้อง A และ B เป็น protected ทั้งคู่ ส่วน uplink ไป gateway เป็น unprotected ทั้งสองห้องยังส่งถึง gateway ได้ แต่สวิตช์ไม่ส่ง data traffic Layer 2 ตรงจาก protected port หนึ่งไปอีก protected port หนึ่ง"
          ]
        }
      },
      {
        "title": "VTP revision, pruning และ allowed list",
        "body": [
          "ใน VTP v1/v2 สวิตช์ใน domain เดียวกันอาจรับฐานข้อมูลที่มี revision สูงกว่า การนำ switch เก่าเข้าระบบจึงต้องตรวจ domain และ revision ก่อนต่อ trunk ฝั่ง server สร้าง VLAN",
          "ส่วน client รับฐานข้อมูล แต่ยังต้องกำหนด access port ให้สมาชิกเอง",
          "**VTP** pruning ลดการ flood ของ VLAN ที่ไม่มีผู้ใช้ปลายทางบนกิ่งนั้น",
          "ส่วน allowed list ระบุด้วยมือว่า VLAN ใดมีสิทธิ์ผ่าน trunk แม้ปลายทางจะมีผู้ใช้ก็ตาม VTP v3 เพิ่มแนวคิด primary server ที่มีสิทธิ์แก้ฐานข้อมูล"
        ]
      },
      {
        "title": "Private VLAN กับ Protected Port แยกผู้ใช้อย่างไร",
        "body": [
          "ใน Private VLAN เต็มรูปแบบ primary VLAN ครอบ secondary VLAN พอร์ต isolated ติดต่อ promiscuous port เช่น gateway ได้ ส่วนพอร์ต community ติดต่อกันได้ภายใน community เดียวกันและติดต่อ gateway ได้",
          "Catalyst 2950 ในใบงานใช้ switchport protected บนสองพอร์ตของ switch ตัวเดียว การแยกไม่ติดตามผู้ใช้ข้าม trunk และไม่มีการแบ่ง community จึงต้องทดสอบด้วยเครื่องที่เสียบ switch เดียวกัน"
        ]
      }
    ],
    "summary": [
      "VLAN แยก Broadcast Domain; ข้าม VLAN ต้องใช้ Layer 3",
      "Access รับส่ง Data VLAN ของปลายทาง; Trunk ขนหลาย VLAN ด้วย 802.1Q",
      "Native VLAN ต้องตรงกัน และโดยทั่วไปส่ง untagged",
      "Allowed VLAN กำหนด VLAN ที่ขนผ่านลิงก์ ไม่ได้สร้าง VLAN ให้เอง",
      "VTP กระจาย VLAN database; DTP เจรจา Trunk",
      "ตรวจ domain/version/revision ก่อนนำสวิตช์เก่าเข้า VTP domain",
      "Voice VLAN แยกเสียงจากข้อมูล; Protected Port แยก L2 ระหว่าง protected ports"
    ],
    "questions": [
      {
        "id": "2-01",
        "prompt": "VLAN แบ่งเครือข่ายออกเป็นสิ่งใดเป็นหลัก?",
        "options": [
          "DNS Domain",
          "TCP Session",
          "Broadcast Domain ระดับ Layer 2",
          "OSPF Area เสมอ"
        ],
        "answer": 2,
        "explanation": "แต่ละ VLAN เป็นขอบเขต Broadcast แยกกัน การส่งข้าม VLAN ต้องผ่านอุปกรณ์ Layer 3",
        "level": "พื้นฐาน"
      },
      {
        "id": "2-02",
        "prompt": "จากภาพ SW1 และ SW2 ต้องขนทั้ง VLAN 10 และ 20 ผ่านสายเดียว ควรกำหนดลิงก์ระหว่างกันเป็นอะไร?",
        "options": [
          "Trunk ที่อนุญาต VLAN 10,20",
          "Access VLAN 10 เท่านั้น",
          "Protected Port อย่างเดียว",
          "PortFast โดยไม่ตั้ง VLAN"
        ],
        "answer": 0,
        "explanation": "Trunk ขนส่งหลาย VLAN ผ่านลิงก์เดียว โดย tag ช่วยรักษาข้อมูลว่าเฟรมเป็นของ VLAN ใด",
        "level": "ประยุกต์",
        "diagram": "vlan"
      },
      {
        "id": "2-03",
        "prompt": "IEEE 802.1Q มีหน้าที่สำคัญใดในบริบท Trunk?",
        "options": [
          "แจก Default Gateway",
          "ตรวจรหัสผ่านผู้ใช้ด้วย RADIUS",
          "เลือก DR/BDR",
          "ระบุ VLAN ด้วย tag ใน Ethernet frame"
        ],
        "answer": 3,
        "explanation": "802.1Q เป็นมาตรฐานที่ใช้ระบุ VLAN ของเฟรมบน Trunk ส่วนการยืนยันตัวตนที่พอร์ตคือ 802.1X",
        "level": "พื้นฐาน"
      },
      {
        "id": "2-04",
        "prompt": "จากภาพ หาก SW1 อนุญาต VLAN 10,20 แต่ SW2 อนุญาตเฉพาะ VLAN 10 ผลใดตรงที่สุด?",
        "options": [
          "ทั้งสอง VLAN ผ่านได้เพราะตั้ง Native 999 ตรงกัน",
          "VLAN 20 ไม่ผ่าน Trunk ตามที่ต้องการ",
          "VLAN 20 ถูกเปลี่ยนเป็น VLAN 10 อัตโนมัติ",
          "VTP จะเพิ่ม VLAN 20 ใน Allowed list ให้แน่นอน"
        ],
        "answer": 1,
        "explanation": "Allowed VLAN ต้องรองรับ VLAN ที่ต้องใช้ทั้งสองฝั่ง Native VLAN ตรงกันไม่ได้ชดเชยการไม่อนุญาต VLAN 20",
        "level": "วิเคราะห์",
        "diagram": "vlan"
      },
      {
        "id": "2-05",
        "prompt": "ภายใต้การตั้งค่า Native VLAN แบบปกติที่ไม่บังคับ tag เมื่อ Trunk รับเฟรม untagged จะจัดเฟรมเข้าที่ใด?",
        "options": [
          "VLAN ที่มีเลขสูงสุด",
          "ทุก VLAN พร้อมกัน",
          "Native VLAN ของพอร์ตนั้น",
          "VLAN ของ Destination IP"
        ],
        "answer": 2,
        "explanation": "เฟรมไม่มี tag ระบุ VLAN จึงถูกตีความตาม Native VLAN ของพอร์ตที่รับ นี่คือเหตุผลที่ต้องตั้งสองฝั่งตรงกัน",
        "level": "ประยุกต์"
      },
      {
        "id": "2-06",
        "prompt": "ชุดคำสั่งใดเหมาะกับพอร์ต PC เพื่อลดความเสี่ยง DTP switch spoofing?",
        "options": [
          "switchport mode access และ switchport nonegotiate",
          "switchport mode dynamic desirable",
          "no spanning-tree vlan 10",
          "switchport trunk allowed vlan all"
        ],
        "answer": 0,
        "explanation": "บังคับ Access และปิดการเจรจา DTP ทำให้พอร์ตผู้ใช้ไม่เปลี่ยนเป็น Trunk จากการเจรจากับอุปกรณ์ปลายทาง",
        "level": "ประยุกต์"
      },
      {
        "id": "2-07",
        "prompt": "ใน VTP v1/v2 โหมดใดรับฐานข้อมูล VLAN จาก domain และโดยทั่วไปไม่อนุญาตให้สร้าง VLAN ในเครื่องเอง?",
        "options": [
          "Server",
          "Transparent",
          "Off",
          "Client"
        ],
        "answer": 3,
        "explanation": "Client รับฐานข้อมูลจาก domain ส่วน Server แก้ฐานข้อมูลได้ และ Transparent ดูแล VLAN ของเครื่องเอง",
        "level": "พื้นฐาน"
      },
      {
        "id": "2-08",
        "prompt": "ข้อใดอธิบาย VTP Transparent v2 ได้ถูกต้อง?",
        "options": [
          "รับ revision สูงสุดมาเขียนทับ VLAN ในเครื่องเสมอ",
          "ดูแล VLAN ของตนเอง และส่งต่อประกาศ VTP ทาง Trunk ได้",
          "เปลี่ยนทุกพอร์ตเป็น Access อัตโนมัติ",
          "เป็น Router สำหรับทุก VLAN"
        ],
        "answer": 1,
        "explanation": "Transparent ไม่ซิงก์ฐานข้อมูล VLAN ของเครื่องตามประกาศ แต่ VTP v2 สามารถส่งต่อประกาศที่รับผ่าน Trunk ได้",
        "level": "ประยุกต์"
      },
      {
        "id": "2-09",
        "prompt": "เหตุใดต้องตรวจ VTP revision ของสวิตช์เก่าก่อนนำเข้า domain แบบ v1/v2?",
        "options": [
          "revision สูงทำให้สายเร็วขึ้น",
          "revision เป็นรหัสผ่าน Wi-Fi",
          "ฐานข้อมูลเก่าที่ revision สูงกว่าอาจถูกเผยแพร่เขียนทับฐานข้อมูลที่ต้องการ",
          "revision ต่ำทำให้ STP ใช้งานไม่ได้"
        ],
        "answer": 2,
        "explanation": "Revision บอกเวอร์ชันฐานข้อมูล ไม่ใช่ความถูกต้อง เมื่อเงื่อนไข domain ตรงกัน revision สูงของสวิตช์เก่าอาจนำข้อมูลผิดเข้าระบบ",
        "level": "วิเคราะห์"
      },
      {
        "id": "2-10",
        "prompt": "VTP Pruning มีเป้าหมายใด?",
        "options": [
          "ลด flooded traffic ของ VLAN ไปยัง Trunk ที่ไม่มีผู้ใช้งาน VLAN นั้น",
          "ลบ VLAN ทั้งหมดที่ไม่มี IP",
          "เข้ารหัสเฟรมบน Trunk",
          "ป้องกัน Loop แทน STP"
        ],
        "answer": 0,
        "explanation": "Pruning ลด Broadcast/Unknown traffic ที่ไม่จำเป็นบนลิงก์ แต่ไม่ได้ทำหน้าที่สร้าง spanning tree หรือเข้ารหัส",
        "level": "พื้นฐาน"
      },
      {
        "id": "2-11",
        "prompt": "แนวทางใดช่วยลดความเสี่ยง Double Tagging ตามหลักการ Native VLAN?",
        "options": [
          "ตั้ง Native VLAN ของสองฝั่งให้ต่างกัน",
          "ใช้ VLAN ผู้ใช้ทุก VLAN เป็น Native พร้อมกัน",
          "เปิด DTP ทุกพอร์ต",
          "ใช้ Native VLAN ที่ไม่มีผู้ใช้ ตั้งตรงกัน และจำกัด Trunk ตามความจำเป็น"
        ],
        "answer": 3,
        "explanation": "การแยก Native VLAN ออกจากผู้ใช้และควบคุม Trunk ช่วยลดเงื่อนไขที่การจัดการ tag ซ้อนอาจถูกใช้ข้าม VLAN",
        "level": "ประยุกต์"
      },
      {
        "id": "2-12",
        "prompt": "PC ต่อผ่าน IP Phone แล้วเข้าสวิตช์พอร์ตเดียว ต้องการแยกเสียงออกจากข้อมูล ควรใช้อะไร?",
        "options": [
          "MAC aging",
          "Voice VLAN คู่กับ Data VLAN",
          "เปลี่ยน OSPF area",
          "VTP revision สูงสุด"
        ],
        "answer": 1,
        "explanation": "Voice VLAN แยกทราฟฟิกเสียงของโทรศัพท์จาก Data VLAN ของ PC แม้ทั้งคู่ใช้พอร์ตสวิตช์เดียวกัน",
        "level": "ประยุกต์"
      },
      {
        "id": "2-13",
        "prompt": "Fa0/6 และ Fa0/7 เป็น protected บนสวิตช์เดียวกัน ส่วน uplink Gi0/1 เป็น unprotected ข้อใดถูกต้อง?",
        "options": [
          "ทั้งสามพอร์ตถูก Shutdown",
          "Fa0/6 ส่งตรง Layer 2 ไป Fa0/7 ได้ทุกกรณี",
          "Fa0/6 กับ Fa0/7 ไม่ส่ง data traffic L2 ตรงถึงกัน แต่ส่งไป uplink ได้ตามปกติ",
          "Protected Port ทำให้ VLAN ทั้งหมดรวมกัน"
        ],
        "answer": 2,
        "explanation": "Protected Port จำกัดการส่ง data traffic Layer 2 ระหว่าง protected ports ส่วนการส่งถึง unprotected port ยังทำได้ตามปกติ",
        "level": "วิเคราะห์"
      },
      {
        "id": "2-14",
        "prompt": "คำสั่งใดเหมาะสำหรับตรวจ Operational Trunk, Native VLAN และ Allowed VLAN?",
        "options": [
          "show interfaces trunk",
          "show ip ospf neighbor",
          "show arp เพียงอย่างเดียว",
          "show clock"
        ],
        "answer": 0,
        "explanation": "show interfaces trunk แสดงลิงก์ Trunk พร้อม Native และ Allowed VLAN เป็นจุดเริ่มตรวจที่ตรงกับปัญหา VLAN ผ่านลิงก์ไม่ได้",
        "level": "ประยุกต์"
      },
      {
        "id": "2-15",
        "prompt": "ข้อใดจับคู่หน้าที่ VTP กับ DTP ได้ถูกต้อง?",
        "options": [
          "VTP ยืนยันตัวตน; DTP แจก IP",
          "VTP ป้องกัน Loop; DTP เลือก Root",
          "ทั้งคู่ทำ Routing ระหว่าง VLAN",
          "VTP กระจายฐานข้อมูล VLAN; DTP เจรจาสถานะ Trunk"
        ],
        "answer": 3,
        "explanation": "VTP และ DTP ทำงานคนละเรื่อง แม้เกี่ยวข้องกับสวิตช์และ Trunk เหมือนกัน จึงไม่ควรนำหน้าที่มาปะปน",
        "level": "พื้นฐาน"
      }
    ],
    "sources": [
      {
        "title": "Cisco — Understand VLAN Trunk Protocol (VTP)",
        "url": "https://www.cisco.com/c/en/us/support/docs/lan-switching/vtp/10558-21.html"
      },
      {
        "title": "Cisco — VLAN Configuration Guide",
        "url": "https://www.cisco.com/c/en/us/td/docs/switches/lan/c9000/lyr2-fwd/vlan/vlan-configuration-guide/configure-vlan.html"
      },
      {
        "title": "Cisco — Configuring Protected Ports",
        "url": "https://www.cisco.com/c/en/us/td/docs/switches/lan/catalyst3750/software/release/15-0_2_se/configuration/guide/scg3750/swtrafc.html"
      }
    ],
    "labs": [
      {
        "title": "กระจาย VLAN จาก SW1 ไปยัง SW2 และ SW3",
        "body": [
          "**ต่อ trunk:** SW1 Gi0/1 → SW2; SW1 Gi0/2 → SW3; ฝั่ง client ใช้ Gi0/1",
          "**ตรวจสายและเพื่อนบ้าน:** ตรวจชื่ออุปกรณ์กับพอร์ตให้ตรงผังก่อนตั้งค่า",
          "**เริ่มพิมพ์ IOS:** เริ่มบล็อกคำสั่งที่ privileged EXEC (`#`); แยกคำสั่ง server กับ client"
        ],
        "steps": [
          {
            "device": "SW1 · VTP server",
            "code": "show cdp neighbors\nconfigure terminal\nvtp domain LABCORP\nvtp mode server\nvtp version 2\nvtp password vtp123\ninterface range gi0/1 - 2\n switchport mode trunk\n exit\nvlan 10\n name SALES\n exit\nvlan 20\n name IT\n exit\nvlan 30\n name HR\n exit\nvlan 999\n name NATIVE_UNUSED\nend"
          },
          {
            "device": "SW2 และ SW3 · ทำทั้งสองเครื่อง",
            "code": "configure terminal\nvtp domain LABCORP\nvtp mode client\nvtp password vtp123\ninterface gi0/1\n switchport mode trunk\nend\nshow vtp status\nshow vlan brief\nshow interfaces trunk"
          }
        ],
        "example": {
          "title": "ตรวจผลและอธิบาย",
          "body": [
            "ตรวจ domain, version และ revision ร่วมกับรายการ VLAN 10, 20, 30, 999 บน client ถ้าไม่มาให้ไล่ trunk → domain/password → version บน image ที่รองรับให้สั่ง vtp pruning ใน global config ของ server แล้วตรวจ show vtp status | include Pruning"
          ]
        }
      },
      {
        "title": "ทดสอบ Native VLAN mismatch และ Protected Ports",
        "body": [
          "**ตั้งค่าตั้งต้น:** กำหนด native VLAN 999 ให้ตรงกันที่ปลายทั้งสองของทุก trunk รวม Gi0/2 ของ SW1",
          "**ทดลอง mismatch:** เปลี่ยนเฉพาะฝั่ง SW2 กลับเป็น VLAN 1 แล้วสังเกตผล",
          "**คืนค่าก่อนขั้นถัดไป:** ตั้งฝั่ง SW2 กลับเป็น native VLAN 999 แล้วจึงทดลอง Protected Ports"
        ],
        "steps": [
          {
            "device": "ปลาย trunk แต่ละฝั่ง · เลือกพอร์ตตามสาย",
            "code": "configure terminal\ninterface gi0/1\n switchport trunk native vlan 999\nend\nshow interfaces trunk\nshow cdp neighbors detail"
          },
          {
            "device": "SW1 · Kali สองเครื่องที่ Fa0/1 และ Fa0/2",
            "code": "configure terminal\ninterface range fa0/1 - 2\n switchport mode access\n switchport access vlan 10\n switchport protected\n exit\ninterface fa0/4\n switchport mode access\n switchport access vlan 10\nend\nshow interfaces fa0/1 switchport"
          }
        ],
        "example": {
          "title": "ตรวจผลและอธิบาย",
          "body": [
            "ตรวจ Native VLAN ใน show interfaces trunk ที่ปลายทั้งสอง การตีความเฟรม untagged ต่างกันอาจทำให้เฟรมไปผิด VLAN สำหรับ protected port ให้ทั้งสามเครื่องอยู่ subnet เดียวกัน ตั้ง IP ไม่ซ้ำกัน แล้ว ping ระหว่าง Fa0/1 กับ Fa0/2 ควรถูกกัน แต่ Fa0/1 ไปเครื่องที่ Fa0/4 ควรผ่าน",
            "ภาพคำตอบท้ายบทที่ 2 หน้า 2 ใช้ Fa0/1 และ Fa0/2 เป็น trunk จริงและแสดง Native vlan 999 ทั้งคู่ ส่วนใบงานยกตัวอย่าง Gi0/1 และ Gi0/2 ในห้องสอบให้อ่าน Local Interface ที่ต่อเพื่อนบ้านจาก show cdp neighbors ก่อนเลือกพอร์ตที่จะตั้งค่า"
          ]
        }
      },
      {
        "title": "พิสูจน์ผลการปิด DTP บนพอร์ตผู้ใช้",
        "body": [
          "**เตรียมวงแลป:** ต่อ Kali ที่ SW2 Fa0/2",
          "**เก็บค่าก่อนทดลอง:** ใช้ `show interfaces fa0/2 switchport` บันทึก Administrative Mode และ Operational Mode",
          "**เปรียบเทียบหลังทดลอง:** ส่ง DTP จาก Kali แล้วตรวจสองค่าเดิม; ตั้ง Access และปิด DTP จากนั้นทดสอบซ้ำ"
        ],
        "steps": [
          {
            "device": "Kali · เฉพาะวงทดสอบ VLAN hopping",
            "code": "sudo yersinia dtp -attack 1 -interface eth0"
          },
          {
            "device": "SW2 · กำหนดพอร์ตผู้ใช้และจำกัด trunk",
            "code": "configure terminal\ninterface fa0/2\n switchport mode access\n switchport nonegotiate\n exit\ninterface gi0/1\n switchport trunk allowed vlan remove 999\nend\nshow interfaces fa0/2 switchport\nshow interfaces trunk"
          }
        ],
        "example": {
          "title": "ตรวจผลและอธิบาย",
          "body": [
            "ทดสอบซ้ำ พอร์ตที่ล็อกเป็น access ต้องยังเป็น access การขอ trunk รอบแรกจะสำเร็จได้เฉพาะเมื่อโหมดเดิมยอมเจรจา",
            "ส่วน double tagging ใช้แท็กซ้อน จึงต้องแยก native VLAN ออกจาก VLAN ผู้ใช้และตรวจ allowed list ด้วย"
          ]
        }
      }
    ],
    "courseFiles": [
      "chapter2_lecture (4)  -  Repaired.pdf · หน้า 7–40",
      "chapter2 Switched Network.pdf · หน้า 30–51",
      "week2_lab_sheet (2).pdf · ส่วน 1–6",
      "คำถามท้ายบทที่ 2.pdf · การทดลอง VTP และความปลอดภัยของพอร์ต"
    ]
  },
  {
    "id": 3,
    "title": "Spanning Tree Protocol และการป้องกัน Loop",
    "shortTitle": "STP & Loop",
    "subtitle": "มีสายสำรองได้ แต่ต้องเลือกเส้นทางที่ไม่วนเป็นวง",
    "minutes": 35,
    "objectives": [
      "เลือก Root Bridge และ Root Port จากเงื่อนไขได้",
      "อธิบาย BPDU และบทบาทพอร์ตใน topology ได้",
      "เลือก PortFast, BPDU Guard และ Root Guard ให้ถูกงาน"
    ],
    "sections": [
      {
        "title": "1. ทำไมเครือข่ายที่มีสายสำรองจึงต้องใช้ STP",
        "body": [
          "เมื่อเชื่อมสวิตช์เป็นวง เฟรมที่ถูก Flood อาจวนกลับมาทางลิงก์อื่น แล้วถูกส่งซ้ำต่อไปอีก",
          "Ethernet frame ไม่มีค่า TTL สำหรับหยุดวงวนแบบ IP packet จึงเกิด Broadcast Storm, เฟรมซ้ำ และตาราง MAC เปลี่ยนพอร์ตไปมา (MAC flapping)",
          "**STP** สร้าง topology เชิงตรรกะที่ไม่เป็นวง โดยให้บางพอร์ตหยุดส่ง data traffic บนเส้นทางซ้ำซ้อน แต่สายยังอยู่เป็นทางสำรอง เมื่อเส้นทางหลักเสียจึงคำนวณและเปิดทางที่เหมาะสม",
          "การปิด STP ในเครือข่ายที่มีวงทางกายภาพอาจทำให้ทั้ง LAN ใช้งานไม่ได้"
        ],
        "diagram": "stp",
        "pitfall": "พอร์ตที่ไม่ Forwarding ยังมีบทบาทใน STP และยังประมวลผล BPDU ได้ การ Block ไม่ได้แปลว่าถอดสายหรือไม่มีสัญญาณไฟฟ้า"
      },
      {
        "title": "2. เลือก Root Bridge: ค่าต่ำชนะ",
        "body": [
          "สวิตช์แลก Bridge Protocol Data Unit (BPDU) เพื่อบอกข้อมูล เช่น Root ID, ค่า cost ไป Root และ Bridge ID ของผู้ส่ง แล้วเลือก Root Bridge ที่มี Bridge ID ต่ำที่สุด",
          "ให้เปรียบเทียบ Bridge Priority ก่อน ถ้าเท่ากันจึงดู MAC Address ต่ำกว่า",
          "สำหรับระบบที่ใช้ Extended System ID ค่า VLAN ID รวมอยู่ในส่วน priority ด้วย แต่เมื่อเปรียบเทียบสวิตช์ใน VLAN เดียวกัน ให้คิดตามลำดับ priority แล้ว MAC ได้",
          "ในรูป S1 priority 24576 ต่ำกว่า S2 และ S3 ที่เป็น 32768 จึงเป็น Root แม้ MAC ของ S1 จะสูงกว่าอุปกรณ์อื่นก็ตาม Root Bridge ไม่มี Root Port เพราะตัวมันเองคือจุดอ้างอิงปลายทาง"
        ],
        "diagram": "stp",
        "code": "Switch# show spanning-tree vlan 10\n! ดู Root ID เทียบกับ Bridge ID\n! ถ้าระบุ This bridge is the root แสดงว่าเครื่องนี้เป็น Root\n\nSwitch(config)# spanning-tree vlan 10 priority 24576",
        "pitfall": "STP เลือกค่าต่ำ ไม่เหมือนการเลือก DR/BDR ของ OSPF หรือ Priority ของ Gateway Redundancy ที่โดยทั่วไปค่าสูงกว่าได้เปรียบ"
      },
      {
        "title": "3. เลือก Root Port และ Designated Port ทีละขั้น",
        "body": [
          "**Root Port (RP):** สวิตช์ที่ไม่ใช่ Root เลือกหนึ่งพอร์ตต่อ spanning-tree instance เพื่อใช้เป็นทางที่ดีที่สุดไปยัง Root; เปรียบเทียบตามลำดับในตารางด้านล่าง",
          "**Designated Port (DP):** แต่ละ segment เลือกพอร์ตที่ประกาศเส้นทางไป Root ได้ดีที่สุด หาก cost เท่ากัน Bridge ID ที่ต่ำกว่าจะได้เปรียบ",
          "พอร์ตที่เหลือซึ่งเป็นทางสำรองจะไม่ Forward data จึงตัดวงวนได้"
        ],
        "example": {
          "title": "แก้โจทย์สามเหลี่ยมในรูป",
          "body": [
            "1) S1 เป็น Root เพราะ priority ต่ำสุด",
            "2) ทุกลิงก์ cost 4 ดังนั้น S2 ไป S1 ตรง ๆ มี cost 4 แต่ถ้าอ้อม S3 มี cost 8 จึงเลือกพอร์ตไป S1 เป็น Root Port",
            "3) S3 ก็เลือกพอร์ตไป S1 เป็น Root Port ด้วยเหตุผลเดียวกัน",
            "4) บนลิงก์ S2–S3 ทั้งสองฝั่งมี cost ไป Root เท่ากันคือ 4 ให้เทียบ Bridge ID: priority เท่ากัน แต่ MAC ของ S2 ต่ำกว่า จึงให้ฝั่ง S2 เป็น Designated",
            "5) ฝั่ง S3 ที่หันไป S2 เป็นทางสำรอง ไม่ Forwarding (Alternate/Discarding ใน RSTP) ทำให้วงวนขาด"
          ]
        },
        "diagram": "stp",
        "pitfall": "อย่าดูความเร็วของสายเส้นเดียวแล้วตอบ Root Port ต้องรวม cost ไปจนถึง Root และใช้กฎ tie-break เมื่อจำเป็น",
        "table": {
          "headers": [
            "ลำดับเลือก Root Port",
            "ใช้เมื่อใด / เลือกค่าใด"
          ],
          "rows": [
            [
              "1. Total Root Path Cost",
              "เลือกค่า cost รวมไป Root ที่ต่ำที่สุด"
            ],
            [
              "2. Sender Bridge ID",
              "หาก cost เท่ากัน ให้เลือก BID ของผู้ส่งที่ต่ำกว่า"
            ],
            [
              "3. Sender Port ID",
              "หากยังเท่ากัน ให้เลือก Port ID ของผู้ส่งที่ต่ำกว่า"
            ],
            [
              "4. Local Port ID",
              "ใช้ Port ID ฝั่งรับที่ต่ำกว่า เมื่อเกณฑ์ก่อนหน้ายังเสมอกัน"
            ]
          ]
        }
      },
      {
        "title": "4. STP, RSTP, PVST+ และ MSTP",
        "body": [
          "**STP** แบบเดิมมีสถานะ Blocking, Listening, Learning, Forwarding และ Disabled โดย Listening ยังไม่เรียนรู้ MAC",
          "ส่วน Learning เรียนรู้ MAC ได้แต่ยังไม่ส่ง data frame เมื่อพร้อมจึงเข้าสู่ Forwarding",
          "**RSTP** ปรับบทบาทและกลไกการเปลี่ยนสถานะเพื่อให้ตอบสนองได้เร็วขึ้น โดยรวมสถานะที่ยังไม่ส่งข้อมูลไว้เป็น Discarding แล้วมี Learning และ Forwarding",
          "การฟื้นตัวจริงยังขึ้นกับชนิดลิงก์ topology และอุปกรณ์ จึงไม่ควรรับประกันว่าทุกกรณีจะใช้เวลาเท่ากัน"
        ],
        "table": {
          "headers": [
            "ชื่อ",
            "วิธีจัดต้นไม้",
            "จุดจำ"
          ],
          "rows": [
            [
              "STP แบบเดิม",
              "ต้นไม้ตาม instance ที่ใช้งาน",
              "อ้างอิง 802.1D ในตำรา"
            ],
            [
              "RSTP",
              "กลไก convergence แบบรวดเร็ว",
              "อ้างอิง 802.1w ในตำรา"
            ],
            [
              "PVST+",
              "ต้นไม้แยกต่อ VLAN",
              "แต่ละ VLAN เลือก Root ต่างกันได้"
            ],
            [
              "Rapid PVST+",
              "ต้นไม้แยกต่อ VLAN ด้วยกลไก RSTP",
              "เร็วขึ้นพร้อมแยกตาม VLAN"
            ],
            [
              "MSTP",
              "จับกลุ่มหลาย VLAN เข้า instance",
              "ลดจำนวนต้นไม้และภาระเมื่อ VLAN มาก"
            ]
          ]
        },
        "example": {
          "title": "มี 100 VLAN ต้องมี 100 ต้นไม้เสมอไหม",
          "body": [
            "หากใช้ PVST+ จะคำนวณแยกต่อ VLAN แต่ MSTP ให้ map หลาย VLAN ลง instance ร่วมกันได้ จึงลดจำนวน spanning-tree instances ที่ต้องดูแล"
          ]
        }
      },
      {
        "title": "5. PortFast และ BPDU Guard สำหรับพอร์ตปลายทาง",
        "body": [
          "**PortFast** ให้พอร์ตที่ต่อเครื่องปลายทางเข้าสู่ Forwarding ได้เร็ว โดยไม่รอขั้นตอนเริ่มต้นแบบ STP เดิม เหมาะกับ PC หรืออุปกรณ์ปลายทางที่ไม่สร้าง loop",
          "ไม่ได้หมายความว่าปิด STP หรืออนุญาตให้ต่อวงได้อย่างปลอดภัย",
          "**BPDU Guard** ใช้บังคับนโยบายว่าพอร์ตนี้ไม่ควรได้รับ BPDU",
          "ถ้าพอร์ตที่เปิด Guard ได้รับ BPDU จะเข้า err-disabled ช่วยป้องกันการต่อสวิตช์เข้าพอร์ตผู้ใช้โดยไม่ตั้งใจหรือการประกาศ BPDU จากด้านที่ไม่ควรมีสวิตช์"
        ],
        "code": "Switch(config)# interface fa0/1\nSwitch(config-if)# switchport mode access\nSwitch(config-if)# spanning-tree portfast\nSwitch(config-if)# spanning-tree bpduguard enable\n\nSwitch# show spanning-tree interface fa0/1 detail\nSwitch# show interfaces status err-disabled",
        "pitfall": "PortFast ทำให้เริ่มใช้งานเร็ว ส่วน BPDU Guard เป็นกลไกหยุดพอร์ตเมื่อเห็น BPDU สองอย่างนี้ทำงานเสริมกัน ไม่ใช่ชื่อเรียกแทนกัน"
      },
      {
        "title": "6. Root Guard ป้องกันคนแย่ง Root จากทิศที่ไม่ควรมา",
        "body": [
          "**Root Guard** ใช้บนพอร์ตที่ตามการออกแบบต้องเป็น Designated และไม่ควรกลายเป็นทางไป Root เช่น พอร์ตจาก distribution ลงไป access ที่ไม่ต้องการให้สวิตช์ด้านล่างชนะการเลือก Root",
          "ถ้าได้รับ Superior BPDU ที่ดีกว่า จะเข้าสู่ root-inconsistent และหยุดส่งข้อมูลบนเส้นทางนั้น",
          "เมื่อ Superior BPDU หายไป Root Guard สามารถกลับมาทำงานได้ตามกลไก STP ต่างจากกรณี BPDU Guard ที่เข้า err-disabled ซึ่งต้องแก้สาเหตุและกู้พอร์ตตามนโยบาย",
          "การโจมตี BPDU spoofing มักพยายามประกาศ Bridge ID ที่ดีกว่าเพื่อย้าย Root และบังคับทิศทางทราฟฟิก"
        ],
        "table": {
          "headers": [
            "กลไก",
            "สิ่งที่กระตุ้น",
            "ผลสำคัญ"
          ],
          "rows": [
            [
              "PortFast",
              "พอร์ตเริ่มทำงาน",
              "เข้าสู่ Forwarding เร็วบน edge port"
            ],
            [
              "BPDU Guard",
              "ได้รับ BPDU ที่พอร์ตเปิด Guard",
              "err-disabled"
            ],
            [
              "Root Guard",
              "ได้รับ Superior BPDU ที่ทำให้ทิศทาง Root ไม่ตรงนโยบาย",
              "root-inconsistent"
            ]
          ]
        },
        "code": "Switch(config)# interface gi0/2\nSwitch(config-if)# spanning-tree guard root\nSwitch# show spanning-tree inconsistentports\nSwitch# show spanning-tree vlan 10",
        "pitfall": "อย่าติด Root Guard บน uplink ที่ต้องเป็น Root Port ตามปกติ เพราะจะขัดกับหน้าที่ของพอร์ตนั้น"
      },
      {
        "title": "อ่าน Role, State และเวลา convergence แยกกัน",
        "body": [
          "Role ตอบว่าพอร์ตทำหน้าที่ใดบนต้นไม้ เช่น root port เป็นทางที่ดีที่สุดไป root",
          "ส่วน state ตอบว่าขณะนั้นพอร์ตเรียนรู้ MAC หรือส่งเฟรมได้หรือยัง ใน STP แบบดั้งเดิม listening ฟัง BPDU, learning เริ่มเรียน MAC และ forwarding จึงส่งข้อมูลผู้ใช้",
          "เมื่อรอ Max Age 20 วินาที แล้วผ่าน listening และ learning อย่างละ 15 วินาที เวลารวมอาจถึงประมาณ 50 วินาที บางเหตุการณ์ตรวจลิงก์ขาดได้ทันทีจึงสั้นกว่า RSTP ใช้ proposal/agreement บนลิงก์ point-to-point และมีสถานะ discarding, learning, forwarding"
        ]
      },
      {
        "title": "ทำไม loop ทำให้ MAC เดียวปรากฏสลับพอร์ต",
        "body": [
          "Ethernet frame ไม่มี TTL แบบ IP เฟรม broadcast จึงวนซ้ำได้ในวง Layer 2 สวิตช์เห็น Source MAC เดิมย้อนเข้ามาคนละพอร์ตจึงอัปเดตตารางไปมา เรียก MAC flapping ผลร่วมคือ broadcast storm และเฟรมซ้ำที่ปลายทาง",
          "BPDU บอก Root ID ที่ผู้ส่งเชื่อ, Root Path Cost และ Bridge ID ของผู้ส่ง ในกรณีใช้ short path cost ลิงก์ 100 Mbps มี cost 19 ส่วน 1 Gbps มี cost 4 ให้รวม cost แล้วค่อยตัดสิน tie-break"
        ]
      }
    ],
    "summary": [
      "STP ป้องกัน Layer 2 loop โดยหยุด Forwarding บางทางสำรอง",
      "Root Bridge = Bridge ID ต่ำสุด: priority ก่อน แล้ว MAC",
      "Non-root เลือก Root Port จาก total path cost ต่ำสุด แล้วใช้ BPDU tie-break",
      "Designated Port คือฝั่งที่ประกาศทางไป Root ได้ดีที่สุดบน segment",
      "PortFast ทำ edge port พร้อมเร็ว; BPDU Guard รับ BPDU แล้ว err-disable",
      "Root Guard รับ Superior BPDU แล้ว root-inconsistent",
      "PVST+ แยกต่อ VLAN; MSTP รวมหลาย VLAN ต่อ instance"
    ],
    "questions": [
      {
        "id": "3-01",
        "prompt": "เหตุผลหลักที่ต้องมี STP ในเครือข่าย Layer 2 ที่มีลิงก์ซ้ำซ้อนคืออะไร?",
        "options": [
          "แจก IP ให้ PC",
          "ป้องกันวงวนของการส่งเฟรม",
          "เข้ารหัส MAC",
          "เพิ่มจำนวน VLAN ID"
        ],
        "answer": 1,
        "explanation": "STP ทำให้ topology เชิงตรรกะไม่มีวงวนด้วยการหยุดส่งข้อมูลบางเส้นทางสำรอง จึงลด Broadcast Storm และเฟรมซ้ำ",
        "level": "พื้นฐาน"
      },
      {
        "id": "3-02",
        "prompt": "จากภาพ S1 priority 24576 ส่วน S2/S3 priority 32768 ใครเป็น Root Bridge?",
        "options": [
          "S3 เพราะอยู่ปลายสุด",
          "S2 เพราะ MAC ต่ำกว่า S3",
          "ต้องเทียบ IP ก่อนเสมอ",
          "S1 เพราะ Bridge Priority ต่ำกว่า"
        ],
        "answer": 3,
        "explanation": "การเลือก Root เปรียบเทียบ priority ก่อน MAC เมื่อ S1 มี priority ต่ำที่สุดจึงชนะโดยไม่ต้องใช้ MAC ตัดสิน",
        "level": "ประยุกต์",
        "diagram": "stp"
      },
      {
        "id": "3-03",
        "prompt": "ถ้าสวิตช์สองตัวมี Bridge Priority เท่ากันใน VLAN เดียวกัน ตัวใดได้เปรียบในการเป็น Root?",
        "options": [
          "ตัวที่มี MAC ต่ำกว่า",
          "ตัวที่มี MAC สูงกว่า",
          "ตัวที่มีพอร์ตมากกว่า",
          "ตัวที่เปิด DHCP"
        ],
        "answer": 0,
        "explanation": "Bridge ID ใช้ MAC เป็นตัวตัดสินเมื่อส่วน priority เท่ากัน ค่าต่ำกว่าชนะ",
        "level": "พื้นฐาน"
      },
      {
        "id": "3-04",
        "prompt": "จากภาพ ทุกลิงก์ cost 4 พอร์ตใดของ S2 ควรเป็น Root Port?",
        "options": [
          "พอร์ตไป S3 เพราะมีสอง hop",
          "ทุกพอร์ตพร้อมกัน",
          "พอร์ตตรงไป S1 เพราะ cost รวม 4 ต่ำกว่าทางอ้อม 8",
          "ไม่มี Root Port เพราะ S2 ไม่ใช่ Root"
        ],
        "answer": 2,
        "explanation": "Root Port อยู่บน non-root และเลือกเส้นทางรวมไป Root ที่ดีที่สุด ทางตรง S2→S1 มี cost 4 เทียบกับทางอ้อมผ่าน S3 ที่เป็น 8",
        "level": "วิเคราะห์",
        "diagram": "stp"
      },
      {
        "id": "3-05",
        "prompt": "จากภาพ S2/S3 มี cost ไป Root เท่ากันและ priority เท่ากัน แต่ MAC ของ S2 ต่ำกว่า บนลิงก์ S2–S3 ฝั่งใดเป็น Designated?",
        "options": [
          "S3 เพราะ MAC สูงกว่า",
          "S2 เพราะ Bridge ID ต่ำกว่า",
          "ทั้งสองฝั่งเป็น Root Port",
          "ไม่มีฝ่ายใดเพราะ cost เท่ากัน"
        ],
        "answer": 1,
        "explanation": "เมื่อ root path cost เท่ากันบน segment ให้เปรียบเทียบ Bridge ID ฝั่ง S2 ชนะเพราะ MAC ต่ำกว่า ฝั่ง S3 จึงเป็นทางสำรองไม่ Forwarding",
        "level": "วิเคราะห์",
        "diagram": "stp"
      },
      {
        "id": "3-06",
        "prompt": "Root Bridge มี Root Port กี่พอร์ตต่อ spanning-tree instance?",
        "options": [
          "เท่าจำนวน VLAN ทั้งหมด",
          "หนึ่งพอร์ตเสมอ",
          "สองพอร์ตเสมอ",
          "ไม่มี เพราะตัวเองคือ Root"
        ],
        "answer": 3,
        "explanation": "Root Port คือทางไป Root ของ non-root switch Root Bridge ไม่ต้องมีทางไปตัวเอง",
        "level": "พื้นฐาน"
      },
      {
        "id": "3-07",
        "prompt": "BPDU ใช้สื่อสารข้อมูลกลุ่มใดเป็นหลัก?",
        "options": [
          "Root ID, Bridge ID และ path cost",
          "DNS records และ DHCP leases",
          "รหัสผ่าน PC แบบ plaintext",
          "รายชื่อ TCP ports ของทุกโปรแกรม"
        ],
        "answer": 0,
        "explanation": "BPDU แลกข้อมูลที่ใช้คำนวณ spanning tree และเลือกบทบาทพอร์ต ไม่ใช่การแลกฐานข้อมูลแอปพลิเคชัน",
        "level": "พื้นฐาน"
      },
      {
        "id": "3-08",
        "prompt": "ใน STP แบบเดิม สถานะใดเรียนรู้ MAC ได้ แต่ยังไม่ส่ง data frame?",
        "options": [
          "Listening",
          "Blocking",
          "Learning",
          "Forwarding"
        ],
        "answer": 2,
        "explanation": "Learning เริ่มสร้าง MAC table แต่ยังไม่ Forward data ส่วน Listening ยังไม่เรียนรู้ MAC และ Forwarding ส่งข้อมูลได้แล้ว",
        "level": "ประยุกต์"
      },
      {
        "id": "3-09",
        "prompt": "ข้อใดเป็นชุดสถานะหลักของ RSTP?",
        "options": [
          "Active, Standby, Listen",
          "Discarding, Learning, Forwarding",
          "Init, 2-Way, Full",
          "Server, Client, Transparent"
        ],
        "answer": 1,
        "explanation": "RSTP ใช้สามสถานะหลักคือ Discarding, Learning, Forwarding ส่วนตัวเลือกอื่นเป็นศัพท์จากโปรโตคอลหรือหน้าที่อื่น",
        "level": "พื้นฐาน"
      },
      {
        "id": "3-10",
        "prompt": "พอร์ตต่อ PC ต้องการเริ่มส่งข้อมูลได้เร็วเมื่อ link up ควรใช้คุณสมบัติใด?",
        "options": [
          "VTP Pruning",
          "Root Guard เพียงอย่างเดียว",
          "ปิด STP ทั้ง LAN",
          "PortFast"
        ],
        "answer": 3,
        "explanation": "PortFast ออกแบบให้ edge port เข้าสู่ Forwarding ได้เร็ว แต่ควรใช้กับปลายทางที่ไม่สร้าง loop และมักใช้คู่ BPDU Guard",
        "level": "ประยุกต์"
      },
      {
        "id": "3-11",
        "prompt": "พอร์ตที่เปิด BPDU Guard ได้รับ BPDU จากสวิตช์ที่ถูกนำมาเสียบ ผลที่คาดคืออะไร?",
        "options": [
          "พอร์ตเข้า err-disabled",
          "พอร์ตกลายเป็น Trunk เสมอ",
          "สวิตช์เปลี่ยนเป็น VTP Server",
          "เพิ่มค่า MAC aging"
        ],
        "answer": 0,
        "explanation": "BPDU Guard หยุดพอร์ตเมื่อเห็น BPDU ตามนโยบายว่าพอร์ตนี้ไม่ควรต่ออุปกรณ์ที่ส่ง BPDU",
        "level": "ประยุกต์"
      },
      {
        "id": "3-12",
        "prompt": "ต้องการป้องกันสวิตช์ฝั่ง access ประกาศ Superior BPDU มาแย่ง Root แต่ไม่ได้ต้องการปิดพอร์ตเพียงเพราะได้รับ BPDU ปกติ ควรใช้สิ่งใด?",
        "options": [
          "PortFast",
          "VTP Client",
          "Root Guard",
          "MAC Sticky"
        ],
        "answer": 2,
        "explanation": "Root Guard สนใจ Superior BPDU ที่ทำให้พอร์ตกลายเป็นทางไป Root ที่ไม่ตรงนโยบาย จึงเข้า root-inconsistent แทนการปิดเพราะ BPDU ทุกแบบ",
        "level": "วิเคราะห์"
      },
      {
        "id": "3-13",
        "prompt": "Root Guard ที่ถูกกระตุ้นด้วย Superior BPDU ทำให้เกิดสถานะใด?",
        "options": [
          "Full",
          "Root-inconsistent",
          "HSRP Standby",
          "VTP Transparent"
        ],
        "answer": 1,
        "explanation": "Root-inconsistent หยุดการส่งข้อมูลเพื่อรักษาตำแหน่ง Root และกลับได้เมื่อเงื่อนไข Superior BPDU หมดไปตามกลไก",
        "level": "พื้นฐาน"
      },
      {
        "id": "3-14",
        "prompt": "องค์กรมี VLAN จำนวนมากและต้องการให้หลาย VLAN ใช้ spanning-tree instance ร่วมกัน ควรพิจารณาอะไร?",
        "options": [
          "PVST+ ที่หนึ่ง instance ต่อ VLAN",
          "802.1X",
          "Port Security",
          "MSTP"
        ],
        "answer": 3,
        "explanation": "MSTP อนุญาตให้ map หลาย VLAN เข้า instance เดียว เพื่อลดจำนวนต้นไม้ที่ต้องคำนวณและจัดการ",
        "level": "ประยุกต์"
      },
      {
        "id": "3-15",
        "prompt": "หลังปิด STP ในวงสวิตช์สามเหลี่ยม พบ Broadcast สูงและ MAC เดียวสลับพอร์ตถี่ ๆ ข้อสรุปใดเหมาะสมที่สุด?",
        "options": [
          "สงสัย Layer 2 loop ที่ทำให้ Broadcast Storm และ MAC flapping",
          "เป็นพฤติกรรมปกติของ VLAN เสมอ",
          "เกิดจาก OSPF protocol 89 อย่างเดียว",
          "ต้องเพิ่ม Native VLAN ทุกพอร์ตเป็นคนละค่า"
        ],
        "answer": 0,
        "explanation": "อาการร่วมนี้สอดคล้องกับเฟรมวนใน Layer 2 เมื่อไม่มี STP ควบคุมเส้นทางซ้ำซ้อน ต้องตรวจ topology และฟื้นการป้องกัน loop",
        "level": "วิเคราะห์"
      }
    ],
    "sources": [
      {
        "title": "Cisco — Understand Rapid Spanning Tree Protocol",
        "url": "https://www.cisco.com/c/en/us/support/docs/lan-switching/spanning-tree-protocol/24062-146.html"
      },
      {
        "title": "Cisco — Understand PortFast and BPDU Guard",
        "url": "https://www.cisco.com/c/en/us/support/docs/lan-switching/spanning-tree-protocol/10586-65.html"
      },
      {
        "title": "Cisco — Configuring STP Extensions and Root Guard",
        "url": "https://www.cisco.com/c/en/us/td/docs/switches/datacenter/nexus5000/sw/layer2/b_Cisco_Nexus_5000_Series_NX-OS_/Cisco_Nexus_5000_Series_NX-OS__chapter11.html"
      }
    ],
    "labs": [
      {
        "title": "อ่าน BPDU และดูพอร์ตสำรองในสามเหลี่ยม SW1–SW2–SW3",
        "body": [
          "**เตรียม topology:** ทำตาม Lab 3 ในวงแยก; เปิด STP แล้วต่อ SW1–SW2–SW3 เป็นสามเหลี่ยม",
          "**เก็บหลักฐานก่อนเปลี่ยนค่า:** บันทึก Root ID, Bridge ID และพอร์ตที่กั้นวง",
          "**ช่วงทดลองปิด STP:** ปลดลิงก์สำรองไว้จนพร้อมสังเกต; คืน STP ทันทีหลังจบช่วงทดลองตามใบงาน"
        ],
        "steps": [
          {
            "device": "SW1–SW3 · ตรวจแต่ละเครื่อง",
            "code": "show spanning-tree vlan 1\nshow mac address-table dynamic\nshow interfaces counters"
          },
          {
            "device": "SW1–SW3 · เฉพาะขั้นทดสอบ loop ใน topology ที่แยกไว้",
            "code": "configure terminal\nno spanning-tree vlan 1\nend"
          },
          {
            "device": "SW1–SW3 · ปลดลิงก์ที่ปิดวงและคืน STP ก่อนต่อครบสามด้าน",
            "code": "configure terminal\nspanning-tree vlan 1\nend\nshow spanning-tree vlan 1"
          },
          {
            "device": "SW1 · กำหนด root แล้วเปรียบเทียบสามเครื่อง",
            "code": "configure terminal\nspanning-tree vlan 1 root primary\nend\nshow spanning-tree vlan 1"
          },
          {
            "device": "Wireshark บน Kali · Display filter สำหรับ Configuration BPDU",
            "code": "stp.type == 0x00"
          }
        ],
        "example": {
          "title": "ตรวจผลและอธิบาย",
          "body": [
            "บน root ให้หา This bridge is the root และ Root ID ที่ตรง Bridge ID ใน topology ที่ลิงก์ทำงานครบ สวิตช์อื่นมี root port ของ VLAN 1 หนึ่งพอร์ต อ่าน Role คู่กับ Sts เช่น Root/FWD และ Altn/BLK แล้วเทียบกับ Root Path Cost ใน BPDU"
          ]
        }
      },
      {
        "title": "ทดสอบ BPDU Spoofing ก่อนและหลังเปิด BPDU Guard",
        "body": [
          "**เริ่มบน Kali:** ใน Lab 3 เปิด Yersinia แล้วเลือก STP → Claiming Root Role เพื่อส่ง superior BPDU จากพอร์ตปลายทาง",
          "**บันทึกผล:** ดู Root ID ที่สวิตช์เห็น แล้วหยุดการทดสอบก่อนตั้งค่า BPDU Guard",
          "**ตรวจพอร์ตก่อนตั้งค่า:** ยืนยันว่า Gi0/1 เป็นพอร์ตที่ต่อไปยัง Kali จริง แล้วทดสอบก่อนและหลังเปิด Guard"
        ],
        "steps": [
          {
            "device": "Kali · เปิดเครื่องมือในวงแลบ",
            "code": "sudo yersinia -G"
          },
          {
            "device": "SW2 · ป้องกันพอร์ตปลายทางแล้วทดสอบซ้ำ",
            "code": "configure terminal\ninterface gi0/1\n switchport mode access\n spanning-tree portfast\n spanning-tree bpduguard enable\nend\nshow interfaces status err-disabled\nshow spanning-tree vlan 1"
          }
        ],
        "example": {
          "title": "ตรวจผลและอธิบาย",
          "body": [
            "เมื่อได้รับ BPDU พอร์ตที่เปิด BPDU Guard จะเข้า err-disabled หยุดต้นทาง BPDU ก่อนสั่ง shutdown และ no shutdown ที่ Gi0/1",
            "ส่วน Root Guard ใช้กับทางลงที่ยังต้องรับ BPDU ปกติ เมื่อได้รับ superior BPDU พอร์ตจะเป็น root-inconsistent และกลับได้หลัง BPDU ดังกล่าวหยุด"
          ]
        }
      }
    ],
    "courseFiles": [
      "Spanning Tree Protocol Presentation (1).pdf · หน้า 3–28",
      "chapter2 Switched Network.pdf · หน้า 52–74",
      "lab/LAb 3.pdf และ LAb 3(1).pdf · Part 1–4"
    ]
  },
  {
    "id": 4,
    "title": "Inter-VLAN Routing และการจัดการสวิตช์",
    "shortTitle": "Inter-VLAN Routing",
    "subtitle": "ให้เครื่องคนละ VLAN คุยกันผ่าน Gateway ที่ถูกต้อง",
    "minutes": 35,
    "objectives": [
      "ตามเส้นทางแพ็กเก็ตที่ข้าม VLAN ได้",
      "ตั้ง Router-on-a-Stick และ SVI ตามตัวอย่างได้",
      "แยก Management IP, Default Gateway และ ip routing ได้",
      "ตรวจปัญหาอย่างเป็นลำดับและบันทึกค่าถาวรได้"
    ],
    "sections": [
      {
        "title": "1. ทำไม Trunk อย่างเดียวจึงยังข้าม VLAN ไม่ได้",
        "body": [
          "**Trunk** มีหน้าที่ขนเฟรมหลาย VLAN แต่ยังรักษาการแยก VLAN ไว้ การจะส่งจาก VLAN 10 ไป VLAN 20 ต้องมีอุปกรณ์ Layer 3 ที่ทำ Routing ระหว่าง IP subnet เหล่านั้น",
          "โดยทั่วไปกำหนดหนึ่ง IP subnet ต่อ VLAN เพื่อให้ออกแบบและแก้ปัญหาง่าย",
          "ตัวอย่าง A อยู่ 192.168.10.10/24 ใน VLAN 10 และ B อยู่ 192.168.20.20/24 ใน VLAN 20",
          "เมื่อ A คำนวณด้วย subnet mask จะเห็นว่า B อยู่คนละ subnet จึงส่งเฟรมให้ Default Gateway ของ VLAN 10 คือ 192.168.10.1 แล้วให้ Gateway ส่งต่อไปยัง VLAN 20"
        ],
        "diagram": "intervlan",
        "pitfall": "การตั้ง Default Gateway ให้ PC เป็น IP ของ B ที่อยู่คนละ subnet ไม่ใช่วิธีข้าม VLAN Gateway ของ PC ต้องเข้าถึงได้บนลิงก์ของ PC ตามการออกแบบ"
      },
      {
        "title": "2. เดินทาง A → B: IP เดิม แต่ MAC เปลี่ยนเมื่อผ่าน Router",
        "body": [
          "**1. เครื่องต้นทาง:** A ใช้ ARP เพื่อหา MAC ของ Default Gateway ใน VLAN 10 แล้วสร้างเฟรม Source MAC = A, Destination MAC = Gateway แต่ IP packet ข้างในยังมี Destination IP = B ไม่ใช่ IP ของ Gateway",
          "**2. Router:** Router รับเฟรม ถอดส่วน Layer 2 ตรวจ Destination IP และตาราง Routing แล้วสร้างเฟรมใหม่สำหรับ VLAN 20",
          "ถ้ายังไม่รู้ MAC ของ B ก็ใช้ ARP ใน VLAN 20 ก่อน เฟรมขาออกมี Source MAC ของ interface ฝั่ง VLAN 20 และ Destination MAC ของ B",
          "**3. เปรียบเทียบก่อนและหลัง Routing:** ในตัวอย่างไม่มี NAT ค่า Source/Destination IP ของการสื่อสารยังเป็น A และ B แต่ TTL ลดลงตามการผ่าน Router และส่วนหัว Layer 2 เปลี่ยนให้เหมาะกับลิงก์ถัดไป",
          "การอ่าน capture จึงต้องแยกว่ากำลังดู IP packet หรือ Ethernet frame"
        ],
        "example": {
          "title": "ตรวจความเข้าใจด้วย 2 คำถาม",
          "body": [
            "A จะ ARP หา MAC ของใคร? หา Gateway 192.168.10.1 เพราะ B อยู่คนละ subnet",
            "Destination IP ในเฟรมที่ A ส่งให้ Gateway คือใคร? ยังเป็น 192.168.20.20 ของ B เพราะ Gateway เป็นเพียงทางผ่าน"
          ]
        },
        "diagram": "intervlan"
      },
      {
        "title": "3. Router-on-a-Stick: สายจริงเส้นเดียว หลาย Sub-interface",
        "body": [
          "**Router-on-a-Stick (ROAS)** ต่อสวิตช์กับ Router ด้วย Trunk หนึ่งลิงก์ บน Router สร้าง sub-interface แยก VLAN แล้วกำหนด encapsulation dot1Q ให้ตรงกับ VLAN ID พร้อม IP Gateway ของ subnet นั้น",
          "ชื่อ sub-interface เช่น Gi0/0.10 เป็นชื่อที่ผู้ดูแลเลือก เลขท้าย .10 ไม่ได้ผูก VLAN 10 โดยอัตโนมัติ",
          "คำสั่ง encapsulation dot1Q 10 ต่างหากที่กำหนดการรับ tag VLAN 10 เรามักตั้งเลขให้ตรงกันเพื่ออ่านง่าย"
        ],
        "code": "! ฝั่งสวิตช์: uplink ไป Router\nSW1(config)# interface gi0/1\nSW1(config-if)# switchport mode trunk\nSW1(config-if)# switchport trunk allowed vlan 10,20\n\n! ฝั่ง Router: ตัวอย่างชื่อพอร์ต ปรับตามรุ่นในแลป\nR1(config)# interface gi0/0\nR1(config-if)# no shutdown\nR1(config)# interface gi0/0.10\nR1(config-subif)# encapsulation dot1Q 10\nR1(config-subif)# ip address 192.168.10.1 255.255.255.0\nR1(config)# interface gi0/0.20\nR1(config-subif)# encapsulation dot1Q 20\nR1(config-subif)# ip address 192.168.20.1 255.255.255.0",
        "bullets": [
          "สร้าง VLAN และกำหนด access ports บนสวิตช์ให้ครบ",
          "เปิด physical interface ของ Router ด้วย no shutdown",
          "Tag ของแต่ละ sub-interface ต้องตรง VLAN ที่ต้องการ",
          "PC แต่ละ VLAN ใช้ Gateway ที่อยู่ subnet เดียวกับตัวเอง",
          "เมื่อทั้งสอง subnet เป็น directly connected และ interface up ไม่จำเป็นต้องเพิ่ม static route ระหว่างสอง subnet นี้"
        ],
        "pitfall": "ทุก VLAN แชร์ลิงก์จริงเดียวของ ROAS จึงมีทั้งข้อจำกัด bandwidth และจุดเสียร่วม หากสาย Trunk เส้นนี้ขาด หลาย VLAN จะข้ามเครือข่ายไม่ได้พร้อมกัน"
      },
      {
        "title": "4. Layer 3 Switch และ SVI",
        "body": [
          "**Switched Virtual Interface (SVI)** เป็น interface เชิงตรรกะของ VLAN เช่น interface vlan 10",
          "บน Layer 3 switch ให้ IP ของ SVI เป็น Default Gateway ของเครื่องใน VLAN นั้น และเปิด ip routing เพื่อให้สวิตช์ส่ง packet ข้าม subnet",
          "**SVI** จะใช้งานได้ต้องมีเงื่อนไขพื้นฐาน เช่น VLAN มีอยู่และ active, SVI ไม่ถูก shutdown และตามพฤติกรรม autostate ทั่วไปต้องมีพอร์ต Layer 2 ที่ up และ Forwarding ใน VLAN นั้นอย่างน้อยหนึ่งพอร์ต อาจเป็น Access หรือ Trunk ที่ขน VLAN นั้นอยู่"
        ],
        "code": "L3SW(config)# vlan 10\nL3SW(config)# vlan 20\nL3SW(config)# interface vlan 10\nL3SW(config-if)# ip address 192.168.10.1 255.255.255.0\nL3SW(config-if)# no shutdown\nL3SW(config)# interface vlan 20\nL3SW(config-if)# ip address 192.168.20.1 255.255.255.0\nL3SW(config-if)# no shutdown\nL3SW(config)# ip routing\nL3SW# show ip interface brief\nL3SW# show ip route",
        "table": {
          "headers": [
            "เปรียบเทียบ",
            "Router-on-a-Stick",
            "Layer 3 Switch + SVI"
          ],
          "rows": [
            [
              "Gateway อยู่ที่",
              "Router sub-interface",
              "SVI บน L3 switch"
            ],
            [
              "การแยก VLAN",
              "encapsulation dot1Q บน sub-interface",
              "interface vlan ตาม VLAN"
            ],
            [
              "การขนระหว่างอุปกรณ์",
              "Trunk ไป Router เส้นเดียวในแบบพื้นฐาน",
              "Routing เกิดใน L3 switch; uplink ยังออกแบบตาม topology"
            ],
            [
              "จุดตรวจสำคัญ",
              "Physical link, trunk, dot1Q, IP",
              "VLAN active, SVI up, ip routing"
            ]
          ]
        },
        "pitfall": "มีคำสั่ง interface vlan ไม่ได้พิสูจน์ว่าสวิตช์ทำ Routing ได้ทุกกรณี ต้องดูรุ่น ความสามารถ และการเปิด Routing ด้วย"
      },
      {
        "title": "5. Management SVI และ Default Gateway ของสวิตช์",
        "body": [
          "**Layer 2 switch** ใช้ Management SVI เพื่อให้ผู้ดูแลติดต่อสวิตช์ผ่าน IP เช่น SSH หรือ ping IP นี้เป็นที่อยู่ของตัวสวิตช์ ไม่ได้ทำให้สวิตช์นั้นกลายเป็น Gateway ที่ route ระหว่าง VLAN ให้ PC โดยอัตโนมัติ",
          "เมื่อสวิตช์ทำงานแบบ Layer 2 และไม่ได้เปิด ip routing หากผู้ดูแลมาจาก subnet อื่น สวิตช์ต้องมี ip default-gateway ที่เข้าถึงได้จาก management VLAN เพื่อส่งแพ็กเก็ตตอบกลับออกไป ส่วนอุปกรณ์ที่เปิด IP routing ใช้ตาราง Routing และ default route ตามการออกแบบ"
        ],
        "code": "! ตัวอย่าง Management VLAN แยกจาก VLAN ผู้ใช้\nL2SW(config)# vlan 99\nL2SW(config)# interface vlan 99\nL2SW(config-if)# ip address 192.168.99.2 255.255.255.0\nL2SW(config-if)# no shutdown\nL2SW(config)# ip default-gateway 192.168.99.1\n! VLAN 99 ต้องมีเส้นทาง L2 ถึง Gateway และมีพอร์ตใช้งานจริง\n\nL2SW# show ip interface brief\nL2SW# ping 192.168.99.1",
        "example": {
          "title": "ผู้ดูแล subnet เดียวกันเข้าถึงได้ แต่ subnet อื่นเข้าไม่ได้",
          "body": [
            "ตรวจ Default Gateway ของสวิตช์และเส้นทางตอบกลับ เพราะการ ping ภายใน subnet เดียวกันไม่จำเป็นต้องใช้ Gateway จึงผ่านได้แม้ยังไม่ได้ตั้ง Gateway การทดสอบผ่านแค่กรณีนี้ยังไม่พิสูจน์ว่า remote management ข้าม subnet พร้อม"
          ]
        }
      },
      {
        "title": "6. ตรวจปัญหาเป็นชั้น และบันทึกค่าหลังแก้",
        "body": [
          "เริ่มจากจุดใกล้ต้นทาง: สายและสถานะพอร์ต → access VLAN → IP/mask/Gateway ของ PC → Trunk/Allowed VLAN → sub-interface หรือ SVI → Routing/ACL/เส้นทางตอบกลับ การ ping Gateway ของ VLAN ตนเองเป็นจุดแบ่งสำคัญ ถ้ายังไม่ผ่าน ไม่ควรเริ่มแก้ routing protocol ไกลออกไป",
          "running-config คือค่าที่อุปกรณ์กำลังใช้ ส่วน startup-config คือค่าที่จะอ่านเมื่อเปิดเครื่องใหม่ หลังเปลี่ยนค่าและตรวจผ่านแล้วใช้ copy running-config startup-config เพื่อเก็บงาน หากแก้เฉพาะ running-config แล้วรีบูต ค่าอาจย้อนกลับ"
        ],
        "table": {
          "headers": [
            "อาการ",
            "จุดตรวจแรก"
          ],
          "rows": [
            [
              "PC ping Gateway ตัวเองไม่ได้",
              "IP/mask, access VLAN, สาย, interface Gateway"
            ],
            [
              "VLAN เดียวกันข้ามสวิตช์ไม่ได้",
              "Trunk, Allowed VLAN, VLAN active, STP"
            ],
            [
              "Ping Gateway ได้ แต่ข้าม VLAN ไม่ได้",
              "ip routing, route, ACL, Gateway ปลายทางและทางกลับ"
            ],
            [
              "SVI down ทั้งที่ no shutdown แล้ว",
              "VLAN active และพอร์ตใน VLAN ที่ up/Forwarding"
            ],
            [
              "รีบูตแล้วค่าหาย",
              "ได้บันทึก startup-config หรือไม่"
            ]
          ]
        },
        "code": "Switch# show vlan brief\nSwitch# show interfaces trunk\nSwitch# show ip interface brief\nRouter# show ip route\nRouter# show arp\nSwitch# copy running-config startup-config",
        "pitfall": "ตัวอย่างคำสั่งเป็น Cisco IOS แบบทั่วไป ชื่อพอร์ตและคำสั่งบางส่วนแตกต่างตามรุ่น ให้เทียบกับอุปกรณ์จริงในแลปก่อนใช้"
      },
      {
        "title": "แท็ก 802.1Q ผ่านเราเตอร์อย่างไร",
        "body": [
          "บน trunk สวิตช์แทรกแท็ก 4 ไบต์หลัง Source MAC ประกอบด้วย TPID 0x8100 และ TCI ที่แบ่งเป็น PCP 3 บิต, DEI 1 บิต และ VID 12 บิต เฟรม Ethernet ปกติที่บรรทุก payload 1500 ไบต์จึงยาวจาก 1518 เป็น 1522 ไบต์รวม FCS โดย IP MTU ยังคงเดิม",
          "R1 รับเฟรม VLAN 10 ผ่าน sub-interface .10 ถอดหัว Layer 2 เลือกทางจาก Destination IP แล้วสร้างเฟรมใหม่ออก .20 พร้อม MAC ปลายทางของ Web Server การรับและส่งใช้ physical trunk เดียวกัน ทราฟฟิกหลาย VLAN จึงแย่งความจุในแต่ละทิศทาง"
        ]
      },
      {
        "title": "อ่าน Extended ACL จากมุมพอร์ตที่รับแพ็กเก็ต",
        "body": [
          "Extended ACL ตรวจต้นทาง ปลายทาง โปรโตคอล และพอร์ต TCP/UDP จากบนลงล่างแล้วใช้บรรทัดแรกที่ตรง ท้ายรายการมี implicit deny การผูก in บน Gi0/0.10 กรองแพ็กเก็ตที่ R1 รับจาก Staff ก่อนเลือกทางออก",
          "ถ้าย้าย ACL ไปขาออก Gi0/0.20 กฎที่กัน Staff ไป Kali VLAN 99 จะไม่เห็นแพ็กเก็ตนั้นเพราะใช้คนละทางออก การทดสอบต้องระบุทั้งต้นทางและบริการ เช่น ping สำเร็จยังสรุปไม่ได้ว่า SSH ผ่าน"
        ]
      }
    ],
    "summary": [
      "Trunk ขนหลาย VLAN; Routing ทำให้ข้าม VLAN ได้",
      "PC ส่งถึงเครือข่ายอื่นโดยใช้ MAC ของ Gateway แต่ Destination IP ยังเป็นเครื่องปลายทาง",
      "ROAS ใช้ sub-interface และ encapsulation dot1Q ให้ตรง VLAN",
      "L3 switch ใช้ SVI เป็น Gateway และต้องเปิด ip routing ตามแพลตฟอร์ม",
      "Management SVI ให้เข้าถึงตัวสวิตช์ ไม่ได้เปิด Inter-VLAN Routing เอง",
      "L2 switch ใช้ ip default-gateway สำหรับทางกลับไป subnet อื่น",
      "แก้ปัญหาจากพอร์ต/IP/VLAN ก่อน แล้วตรวจ Routing และบันทึก startup-config"
    ],
    "questions": [
      {
        "id": "4-01",
        "prompt": "เครื่องอยู่คนละ VLAN และคนละ IP subnet ต้องมีความสามารถใดเพื่อสื่อสารระหว่างกัน?",
        "options": [
          "VTP เท่านั้น",
          "DTP เท่านั้น",
          "Routing ระดับ Layer 3",
          "MAC aging เท่านั้น"
        ],
        "answer": 2,
        "explanation": "VLAN แยกเครือข่าย Layer 2 การข้าม IP subnet ต้องใช้ Router หรือ L3 switch ทำ Routing",
        "level": "พื้นฐาน"
      },
      {
        "id": "4-02",
        "prompt": "จากภาพ A = 192.168.10.10/24 ต้องส่งถึง B = 192.168.20.20/24 โดยไม่มี NAT A ควร ARP หา MAC ของใครก่อนส่งออก?",
        "options": [
          "Gateway 192.168.10.1",
          "B โดยตรงใน VLAN 20",
          "192.168.20.0 ซึ่งเป็น network address",
          "ทุกเครื่องบนอินเทอร์เน็ต"
        ],
        "answer": 0,
        "explanation": "B อยู่คนละ subnet A จึงใช้ Gateway ใน VLAN ตัวเองเป็น next hop และ ARP หา MAC ของ Gateway",
        "level": "ประยุกต์",
        "diagram": "intervlan"
      },
      {
        "id": "4-03",
        "prompt": "จากภาพ ในเฟรมที่ A ส่งให้ Gateway เพื่อไป B ค่า Destination IP ภายใน packet คืออะไร?",
        "options": [
          "192.168.10.1",
          "192.168.10.10",
          "255.255.255.255",
          "192.168.20.20"
        ],
        "answer": 3,
        "explanation": "Gateway เป็น next hop ระดับ Layer 2 ของ A แต่ปลายทาง Layer 3 ยังเป็น B จึงใช้ Destination IP 192.168.20.20",
        "level": "วิเคราะห์",
        "diagram": "intervlan"
      },
      {
        "id": "4-04",
        "prompt": "Router-on-a-Stick แบบพื้นฐานใช้โครงสร้างใด?",
        "options": [
          "หนึ่งสาย Access ต่อทุก VLAN โดยไม่ใช้ tag",
          "หนึ่ง Trunk กับหลาย Router sub-interfaces",
          "หนึ่ง DNS server ต่อหนึ่งพอร์ต",
          "เปิด PortFast บนทุก Router"
        ],
        "answer": 1,
        "explanation": "ROAS ใช้ Trunk เส้นเดียวให้หลาย VLAN ถึง Router แล้วแยกด้วย sub-interface ที่กำหนด dot1Q และ IP Gateway",
        "level": "พื้นฐาน"
      },
      {
        "id": "4-05",
        "prompt": "Gi0/0.10 มีคำสั่ง encapsulation dot1Q 20 sub-interface นี้ผูกกับ VLAN ใดตามคำสั่ง?",
        "options": [
          "VLAN 10 เพราะชื่อ .10",
          "ทั้ง VLAN 10 และ 20 อัตโนมัติ",
          "VLAN 20 เพราะ dot1Q 20",
          "VLAN 1 เสมอ"
        ],
        "answer": 2,
        "explanation": "เลขชื่อ sub-interface ไม่ได้กำหนด VLAN เอง encapsulation dot1Q 20 เป็นตัวผูก tag VLAN 20 แม้ควรตั้งชื่อให้สอดคล้องเพื่อลดความสับสน",
        "level": "วิเคราะห์"
      },
      {
        "id": "4-06",
        "prompt": "ในตัวอย่าง ROAS VLAN 10 ใช้ 192.168.10.0/24 และ Router sub-interface เป็น .1 PC 192.168.10.10 ควรตั้ง Gateway ใด?",
        "options": [
          "192.168.10.1",
          "192.168.20.20",
          "192.168.10.255",
          "192.168.10.0"
        ],
        "answer": 0,
        "explanation": "Gateway ต้องเป็น IP interface ของ Router ที่อยู่ใน subnet ของ PC .0 คือ network address และ .255 เป็น broadcast สำหรับ /24",
        "level": "ประยุกต์"
      },
      {
        "id": "4-07",
        "prompt": "ตั้ง sub-interface ของ Router ครบแล้ว แต่ physical interface Gi0/0 ยัง administratively down ควรทำอะไร?",
        "options": [
          "เพิ่ม VTP revision",
          "ลบ MAC ของทุก PC",
          "เปลี่ยนไปใช้ Native VLAN ต่างกัน",
          "ตรวจลิงก์แล้วสั่ง no shutdown ที่ physical interface"
        ],
        "answer": 3,
        "explanation": "Sub-interfaces อาศัย physical interface ร่วมกัน ถ้า parent ถูก shutdown จะไม่สามารถขนส่งทราฟฟิกตามที่ต้องการ",
        "level": "ประยุกต์"
      },
      {
        "id": "4-08",
        "prompt": "บน Layer 3 switch ที่รองรับ Routing ตั้ง SVI ของสอง VLAN แล้ว แต่ไม่ได้เปิดการ Route IPv4 คำสั่งใดตรงงาน?",
        "options": [
          "switchport protected",
          "ip routing",
          "vtp mode client",
          "spanning-tree portfast"
        ],
        "answer": 1,
        "explanation": "ip routing เปิดการส่งต่อ IP ระหว่าง interface บนแพลตฟอร์มที่รองรับ การมี IP บน SVI อย่างเดียวไม่ได้ยืนยันว่า Routing เปิดแล้ว",
        "level": "ประยุกต์"
      },
      {
        "id": "4-09",
        "prompt": "SVI VLAN 20 ยัง down หลัง no shutdown แล้ว ข้อใดควรตรวจต่อภายใต้ autostate ทั่วไป?",
        "options": [
          "เปลี่ยนทุก PC เป็น DHCP เท่านั้น",
          "ปิด VLAN 10 เสมอ",
          "VLAN 20 active และมีพอร์ตใน VLAN ที่ up/Forwarding หรือไม่",
          "ตั้ง MAC ของ Gateway เป็น Broadcast"
        ],
        "answer": 2,
        "explanation": "SVI ต้องสัมพันธ์กับ VLAN ที่ใช้งานได้ และโดยทั่วไปต้องมีพอร์ต Layer 2 ที่ up และ Forwarding ใน VLAN นั้น ไม่ใช่แค่ no shutdown ที่ SVI",
        "level": "วิเคราะห์"
      },
      {
        "id": "4-10",
        "prompt": "Management SVI บน Layer 2 switch มีหน้าที่หลักใด?",
        "options": [
          "ให้เข้าถึงตัวสวิตช์ผ่าน IP เช่น SSH/ping",
          "ทำ NAT ให้ทุก VLAN เสมอ",
          "แทน Default Gateway ของทุก PC โดยอัตโนมัติ",
          "ทำให้ Access port กลายเป็น Trunk"
        ],
        "answer": 0,
        "explanation": "Management SVI เป็น IP endpoint ของตัวสวิตช์ ไม่ได้เพิ่มความสามารถ Inter-VLAN Routing โดยอัตโนมัติ",
        "level": "พื้นฐาน"
      },
      {
        "id": "4-11",
        "prompt": "L2 switch ที่ไม่ได้เปิด ip routing มี Management IP 192.168.99.2/24 ต้องส่งคำตอบถึงผู้ดูแล subnet อื่นผ่าน Router .1 ควรตั้งอะไร?",
        "options": [
          "ip default-gateway 192.168.99.255",
          "switchport access vlan 1 ทุกพอร์ต",
          "encapsulation dot1Q 99 บน PC",
          "ip default-gateway 192.168.99.1"
        ],
        "answer": 3,
        "explanation": "เมื่อทำงานเป็น L2 IP host สวิตช์ใช้ ip default-gateway เป็นทางส่งไป subnet อื่น Gateway ต้องเป็น IP Router ที่เข้าถึงได้ใน management subnet",
        "level": "ประยุกต์"
      },
      {
        "id": "4-12",
        "prompt": "สอง subnet ต่อกับ Router โดยตรงและ interface ทั้งคู่ up/up โดยไม่มี ACL ปิดกั้น จำเป็นต้องเพิ่ม static route ระหว่างสอง subnet นี้หรือไม่?",
        "options": [
          "จำเป็นเสมอ เพราะ Router ไม่รู้ interface ของตัวเอง",
          "ไม่จำเป็น เพราะมี directly connected routes แล้ว",
          "จำเป็นต้องติดตั้ง OSPF เสมอ",
          "ต้องใช้ VTP แทน route"
        ],
        "answer": 1,
        "explanation": "Router ติดตั้ง connected route จาก interface ที่ทำงานอยู่ได้ จึง route ระหว่างเครือข่ายที่ต่อโดยตรงได้โดยไม่ต้องเพิ่ม static route ซ้ำ",
        "level": "วิเคราะห์"
      },
      {
        "id": "4-13",
        "prompt": "PC ยัง ping Gateway ใน VLAN ของตนเองไม่ได้ ควรเริ่มตรวจจุดใด?",
        "options": [
          "BGP ของผู้ให้บริการก่อน",
          "DNS ชื่อเว็บไซต์ก่อนเท่านั้น",
          "สาย/พอร์ต, access VLAN, IP/mask และ interface Gateway",
          "เพิ่ม static route แบบสุ่ม"
        ],
        "answer": 2,
        "explanation": "ปัญหาเกิดก่อนถึง Gateway จึงควรตรวจการเชื่อมต่อและการกำหนดค่าใน local VLAN ก่อนขยับไป Routing ไกลออกไป",
        "level": "วิเคราะห์"
      },
      {
        "id": "4-14",
        "prompt": "คำสั่งใดบันทึกค่าปัจจุบันเพื่อใช้หลังรีบูต?",
        "options": [
          "copy running-config startup-config",
          "copy startup-config running-config",
          "show running-config",
          "clear ip route *"
        ],
        "answer": 0,
        "explanation": "ต้องคัดลอกจาก running-config ที่ใช้งานอยู่ไป startup-config ที่ใช้ตอนบูต คำสั่งกลับทิศไม่ใช่การบันทึกค่าปัจจุบันลง startup",
        "level": "พื้นฐาน"
      },
      {
        "id": "4-15",
        "prompt": "ขณะ packet ผ่าน Router ไปอีก Ethernet VLAN โดยไม่มี NAT ข้อใดถูกต้อง?",
        "options": [
          "Source/Destination MAC ไม่เปลี่ยนเลยทุก hop",
          "Destination IP กลายเป็น IP Gateway ถาวร",
          "Router ส่งเฟรมเดิมทุกบิตโดยไม่ตรวจ IP",
          "Layer 2 header ถูกสร้างใหม่ ส่วนปลายทาง IP ยังคงเป็นเครื่องปลายทางและ TTL ลดลง"
        ],
        "answer": 3,
        "explanation": "Router ตัดสินใจจาก IP แล้ว encapsulate ใหม่สำหรับลิงก์ขาออก ทำให้ MAC เปลี่ยนตาม next hop ขณะที่ปลายทาง IP เดิมยังอยู่เมื่อไม่มี NAT",
        "level": "วิเคราะห์"
      }
    ],
    "sources": [
      {
        "title": "Cisco — Configure Inter-VLAN Routing with an External Router",
        "url": "https://www.cisco.com/c/en/us/support/docs/lan-switching/inter-vlan-routing/14976-50.html"
      },
      {
        "title": "Cisco — Switch Virtual Interfaces and SVI Autostate",
        "url": "https://www.cisco.com/en/US/docs/switches/lan/catalyst3850/software/release/3se/consolidated_guide/b_consolidated_3850_3se_cg_chapter_011100.html"
      },
      {
        "title": "Cisco — Configuring Static IP Unicast Routing",
        "url": "https://www.cisco.com/c/en/us/td/docs/switches/lan/cisco_ie4010/software/release/15-2_4_EC/configuration/guide/scg-ie4010_5000/swipstatrout.html"
      }
    ],
    "labs": [
      {
        "title": "ต่อ trunk และสร้าง gateway ของ VLAN 10, 20, 99",
        "body": [
          "**ต่ออุปกรณ์:** R1 และ R2 ต่อสวิตช์สองตัวผ่าน trunk; native VLAN 666; allowed VLAN 10, 20, 99",
          "**ตั้ง IP เครื่องปลายทาง:** PC-Staff = 192.168.10.10/24; Web-Svr = 192.168.20.10/24; Kali = 192.168.99.100/24",
          "**ตั้ง gateway:** แต่ละเครื่องใช้ที่อยู่ .1 ใน subnet ของตนเอง จากนั้นตรวจ trunk และ sub-interface"
        ],
        "steps": [
          {
            "device": "SW1/SW2 · สร้าง VLAN และกำหนด uplink ตามผัง",
            "code": "configure terminal\nvlan 10\n exit\nvlan 20\n exit\nvlan 99\n exit\nvlan 666\n name Unused_Native_VLAN\n exit\ninterface range gi0/0, gi0/4\n switchport mode trunk\n switchport trunk native vlan 666\n switchport trunk allowed vlan 10,20,99\n switchport nonegotiate\n no shutdown\n exit\ninterface fa0/1\n switchport mode access\n switchport access vlan 10\n no shutdown\nend\nshow vlan brief\nshow interfaces trunk"
          },
          {
            "device": "R1 · สร้าง sub-interface และ transit ไป R2",
            "code": "configure terminal\ninterface gi0/0\n no shutdown\n exit\ninterface gi0/0.10\n encapsulation dot1Q 10\n ip address 192.168.10.1 255.255.255.0\n exit\ninterface gi0/0.20\n encapsulation dot1Q 20\n ip address 192.168.20.1 255.255.255.0\n exit\ninterface gi0/0.99\n encapsulation dot1Q 99\n ip address 192.168.99.1 255.255.255.0\n exit\ninterface gi0/1\n ip address 10.0.0.1 255.255.255.252\n no shutdown\n exit\nrouter ospf 1\n router-id 1.1.1.1\n network 192.168.0.0 0.0.255.255 area 0\n network 10.0.0.0 0.0.0.3 area 0\nend\nshow ip interface brief\nshow ip route connected"
          }
        ],
        "example": {
          "title": "ตรวจผลและอธิบาย",
          "body": [
            "กำหนด access port ของ Web-Svr เป็น VLAN 20 และ Kali เป็น VLAN 99 ตามตำแหน่งสาย",
            "ส่วน R2 ใช้คำสั่งแบบ R1 แต่แทน .1 ด้วย .2 ในทั้งสาม VLAN และ transit ใช้ router-id 2.2.2.2 ถ้ารุ่นอุปกรณ์ให้เลือก encapsulation บนสวิตช์ ให้ตั้ง switchport trunk encapsulation dot1q ก่อนสั่ง mode trunk",
            "ทดสอบเครื่องละสองขั้น เริ่ม ping gateway ตัวเองแล้วจึง ping ข้าม VLAN ถ้าขั้นแรกตก ให้เทียบ access VLAN, allowed VLAN, tag บน sub-interface และสถานะ physical port ก่อนดู ACL"
          ]
        }
      },
      {
        "title": "ตั้ง FILTER_STAFF_TRAFFIC และพิสูจน์ว่า ACL จับแพ็กเก็ต",
        "body": [
          "**กำหนดสิทธิ์ของ Staff:** เข้า Web Server ได้เฉพาะ HTTP, HTTPS และ ICMP Echo; กัน Staff ไปยัง Kali ตาม ACL ของใบงาน",
          "**ใส่ ACL ให้ถูกทิศ:** ผูก `FILTER_STAFF_TRAFFIC` เฉพาะขาเข้าจาก VLAN 10",
          "**พิสูจน์ผล:** สร้างทราฟฟิกจาก Staff แล้วดู counter; เมื่อตรวจจาก Kali ให้อ่านข้อจำกัดของ ACL แบบ stateless ในคำอธิบายประกอบ"
        ],
        "steps": [
          {
            "device": "R1 · เริ่มที่ #",
            "code": "configure terminal\nip access-list extended FILTER_STAFF_TRAFFIC\n deny ip 192.168.10.0 0.0.0.255 host 192.168.99.100\n permit tcp 192.168.10.0 0.0.0.255 host 192.168.20.10 eq 80\n permit tcp 192.168.10.0 0.0.0.255 host 192.168.20.10 eq 443\n permit icmp 192.168.10.0 0.0.0.255 host 192.168.20.10 echo\n deny ip 192.168.10.0 0.0.0.255 192.168.20.0 0.0.0.255\n permit ip any any\n exit\ninterface gi0/0.10\n ip access-group FILTER_STAFF_TRAFFIC in\nend\nshow ip interface gi0/0.10\nshow access-lists FILTER_STAFF_TRAFFIC"
          },
          {
            "device": "PC-Staff · ทดสอบจากต้นทางที่ ACL ครอบคลุม",
            "code": "ping 192.168.20.10\nssh 192.168.20.10\nping 192.168.99.100"
          }
        ],
        "example": {
          "title": "ตรวจผลและอธิบาย",
          "body": [
            "ตรวจ match counter หลังแต่ละรายการ Ping ไป Web ควรผ่าน ส่วน SSH ไป Web และ ping ไป Kali ควรตรง deny เมื่อมีบริการ Web เปิดจริงให้ทดสอบ HTTP/HTTPS เพิ่ม การที่ SSH ไม่ตอบเพียงอย่างเดียวแยกไม่ได้ว่า ACL บล็อกหรือปลายทางปิดบริการ",
            "ACL เป็นแบบ stateless ถ้า Kali เริ่มคุยกับ Staff แพ็กเก็ตตอบจาก Staff กลับ Kali อาจถูกกฎแรกทิ้ง ให้แยกการทดสอบ Kali → Web ออกจาก Kali ↔ Staff และบันทึกทิศที่ counter เพิ่ม"
          ]
        }
      }
    ],
    "courseFiles": [
      "มาตรฐานและเทคโนโลยีเครือข่าย (2).pdf · หน้า 2–21",
      "advanced_inter_vlan_lab_sheet.docx และ lab/advanced_inter_vlan_lab_sheet.pdf · ข้อ 1–4",
      "week1_lab_sheet (1).pdf · Management SVI"
    ]
  },
  {
    "id": 5,
    "title": "OSPF และ EIGRP",
    "shortTitle": "OSPF / EIGRP",
    "subtitle": "ให้เราเตอร์เรียนรู้เส้นทาง เลือกทางที่ดีที่สุด และรับมือเมื่อเส้นทางเปลี่ยน",
    "minutes": 40,
    "objectives": [
      "อธิบาย Hello, Neighbor, LSA และการคำนวณ OSPF Cost",
      "เลือก DR/BDR และคำนวณ Wildcard Mask ได้",
      "แยกตาราง EIGRP และทดสอบเงื่อนไข Feasible Successor",
      "รวมเส้นทางและอธิบายความเสี่ยงของ Redistribution"
    ],
    "sections": [
      {
        "title": "เริ่มจากภาพใหญ่: Routing ต่างจาก Switching อย่างไร",
        "body": [
          "สวิตช์ Layer 2 ส่งเฟรมภายใน VLAN โดยดู Destination MAC ส่วนเราเตอร์เลือกทางไป IP Network ปลายทางจาก Routing Table",
          "เมื่อเครือข่ายใหญ่ขึ้น การใส่ Static Route ทุกเส้นด้วยมือจะดูแลยาก จึงใช้ Routing Protocol ช่วยแลกเปลี่ยนข้อมูลเส้นทาง",
          "**OSPF** เป็น Link-State Protocol: เราเตอร์แลกเปลี่ยนข้อมูลสถานะลิงก์เป็น LSA สร้างฐานข้อมูล LSDB แล้วคำนวณเส้นทางด้วย SPF เปรียบเหมือนแต่ละตัวมีแผนที่ของ Area แล้วเลือกทางของตนเอง",
          "ส่วน **EIGRP** ใช้อัลกอริทึม DUAL เพื่อเลือกเส้นทางและรักษาทางสำรองที่ยืนยันว่าไม่วนลูป"
        ],
        "diagram": "routing",
        "table": {
          "headers": [
            "สิ่งที่เห็น",
            "ใช้ตอบคำถาม"
          ],
          "rows": [
            [
              "Neighbor Table",
              "เราคุยกับเราเตอร์ข้างเคียงตัวใดได้"
            ],
            [
              "LSDB / Topology Table",
              "เรียนรู้อะไรเกี่ยวกับเครือข่ายและเส้นทาง"
            ],
            [
              "Routing Table",
              "เส้นทางใดถูกเลือกใช้งานในขณะนี้"
            ]
          ]
        },
        "pitfall": "OSPF Cost เปรียบเทียบเส้นทาง OSPF ส่วน Administrative Distance ใช้เปรียบเทียบความน่าเชื่อถือระหว่างแหล่งเส้นทางสำหรับ prefix เดียวกัน อย่าเอาสองค่านี้มาปนกัน"
      },
      {
        "title": "OSPF ใช้ IP Protocol 89 และเริ่มรู้จักกันด้วย Hello",
        "body": [
          "**OSPF** สำหรับ IPv4 ส่งข้อมูลตรงใน IP โดยระบุ Protocol Number 89 จึงไม่มี TCP Port 89 หรือ UDP Port 89 ให้หา Hello ใช้ค้นหาเพื่อนบ้านและบอกว่ายังทำงานอยู่",
          "บนลิงก์เดียวกัน ตรวจ Area, Hello/Dead Timer, Authentication และการตั้งค่า IP/Network Type ให้สอดคล้องกัน รวมถึง Router ID ที่ต้องไม่ซ้ำ หากเป็น Ethernet ปกติควรอยู่ subnet เดียวกัน",
          "ค่า OSPF Process ID เป็นหมายเลขภายในเครื่อง ไม่จำเป็นต้องเท่ากันระหว่างเราเตอร์",
          "Neighbor ไม่จำเป็นต้องขึ้น FULL กับทุกตัวบน Broadcast Network: DROTHER สองตัวอาจอยู่ 2-WAY ตามปกติ แต่สร้าง Full Adjacency กับ DR/BDR ดังนั้นอ่านบทบาทและ Network Type ก่อนสรุปว่าระบบเสีย"
        ],
        "code": "show ip ospf neighbor\nshow ip ospf interface GigabitEthernet0/0\nshow ip ospf\nshow ip route ospf",
        "example": {
          "title": "เช็กลิสต์เมื่อไม่พบ Neighbor",
          "body": [
            "เริ่มจาก interface up/up และ ping IP ฝั่งตรงข้ามได้ จากนั้นเทียบ Area และ Hello/Dead Timer แล้วตรวจ authentication, passive-interface และการกรอง IP Protocol 89",
            "การ ping ผ่านพิสูจน์ได้แค่ IP Connectivity บางส่วน ไม่ได้พิสูจน์ว่า OSPF ตั้งค่าตรงกันครบ"
          ]
        }
      },
      {
        "title": "Wildcard Mask: บิต 0 ต้องตรง บิต 1 ไม่ต้องสนใจ",
        "body": [
          "ในคำสั่ง network ของ OSPF แบบ Cisco IOS, Wildcard Mask ใช้เลือก interface ที่ IP ตรงเงื่อนไขเพื่อเปิด OSPF บน interface นั้น ไม่ใช่คำสั่งสร้าง subnet ใหม่",
          "สำหรับ mask แบบต่อเนื่อง คำนวณ wildcard ด้วย 255.255.255.255 ลบ Subnet Mask ทีละ octet เช่น /30 คือ 255.255.255.252 จึงได้ 0.0.0.3 ส่วน 0.0.0.0 หมายถึงให้ตรง IP ที่ระบุทุกบิต"
        ],
        "table": {
          "headers": [
            "Prefix",
            "Subnet Mask",
            "Wildcard"
          ],
          "rows": [
            [
              "/24",
              "255.255.255.0",
              "0.0.0.255"
            ],
            [
              "/26",
              "255.255.255.192",
              "0.0.0.63"
            ],
            [
              "/30",
              "255.255.255.252",
              "0.0.0.3"
            ],
            [
              "/32",
              "255.255.255.255",
              "0.0.0.0"
            ]
          ]
        },
        "code": "router ospf 1\n router-id 1.1.1.1\n network 10.0.12.0 0.0.0.3 area 0",
        "example": {
          "title": "อ่านคำสั่งให้เป็น",
          "body": [
            "network 10.0.12.0 0.0.0.3 area 0 เลือก IP ของ interface ในช่วง 10.0.12.0–10.0.12.3 แล้วผูกกับ Area 0",
            "ถ้าต้องการเลือกเฉพาะ interface ที่มี IP 10.0.12.1 สามารถใช้ network 10.0.12.1 0.0.0.0 area 0"
          ]
        }
      },
      {
        "title": "DR/BDR: ตัวประสานงานบน Multiaccess Network",
        "body": [
          "บน Broadcast Network เช่น Ethernet ที่มีเราเตอร์หลายตัว OSPF เลือก Designated Router (DR) และ Backup Designated Router (BDR) เพื่อลดจำนวนความสัมพันธ์ที่ต้องแลกเปลี่ยนฐานข้อมูล ไม่ได้บังคับให้ข้อมูลผู้ใช้ทุกแพ็กเก็ตวิ่งผ่าน DR",
          "เมื่อมีการเลือกตั้ง เปรียบเทียบ Interface Priority สูงสุดก่อน แล้วใช้ Router ID สูงสุดตัดสินเมื่อ Priority เท่ากัน",
          "ค่า Priority 0 ไม่มีสิทธิ์เป็น DR หรือ BDR ส่วน Point-to-Point Network ไม่มีการเลือก DR/BDR",
          "การเลือกตั้ง OSPF โดยทั่วไปไม่ preempt: เราเตอร์ใหม่ที่มี Priority สูงกว่าไม่ได้แย่ง DR ที่ยังทำงานปกติทันที โจทย์ที่ถามว่าใครชนะต้องดูว่าเป็นการเลือกตั้งใหม่หรือมี DR เดิมอยู่แล้ว"
        ],
        "table": {
          "headers": [
            "เราเตอร์",
            "Priority",
            "Router ID",
            "การเลือกตั้งใหม่"
          ],
          "rows": [
            [
              "R1",
              "1",
              "1.1.1.1",
              "BDR เมื่อมีเฉพาะสามตัวนี้"
            ],
            [
              "R2",
              "1",
              "2.2.2.2",
              "DR เพราะ Router ID สูงกว่า R1"
            ],
            [
              "R3",
              "0",
              "9.9.9.9",
              "ไม่มีสิทธิ์เป็น DR/BDR"
            ]
          ]
        },
        "pitfall": "อย่าจำสลับกับ STP: STP เลือก Bridge ID ต่ำสุด ส่วน OSPF DR เลือก Priority สูงสุดแล้ว Router ID สูงสุด"
      },
      {
        "title": "Cost และ Reference Bandwidth: ทางสั้นคือค่า Cost รวมต่ำ",
        "body": [
          "**OSPF** เลือกเส้นทางจากผลรวม Cost ของ interface ขาออกตามเส้นทาง ไม่ได้นับจำนวนเราเตอร์เพียงอย่างเดียว ในภาพ R1 ไป R3 โดยตรง Cost 30 แต่ผ่าน R2 มี Cost 10 + 10 = 20 จึงเลือกผ่าน R2",
          "ค่า Cost อัตโนมัติสัมพันธ์กับ Reference Bandwidth ÷ Interface Bandwidth โดยใช้หน่วยให้ตรงกัน และโดยทั่วไปค่าต่ำสุดเป็น 1",
          "หากใช้ reference 100 Mbps ลิงก์ 100 Mbps และ 1 Gbps อาจได้ Cost 1 เหมือนกัน จึงควรปรับ reference ให้เหมาะกับความเร็วเครือข่ายและให้สอดคล้องทุกเราเตอร์",
          "หากเส้นทางที่มีคุณสมบัติเทียบกันได้มี Cost เท่ากัน OSPF อาจติดตั้งหลาย next hop เพื่อทำ Equal-Cost Multipath (ECMP) ตามขีดจำกัดอุปกรณ์",
          "คำสั่ง bandwidth เป็นข้อมูลสำหรับการคำนวณ ไม่ใช่การเปลี่ยนความเร็วจริงของสาย"
        ],
        "diagram": "routing",
        "code": "router ospf 1\n auto-cost reference-bandwidth 10000\n!\ninterface GigabitEthernet0/0\n ip ospf cost 10",
        "example": {
          "title": "ลองคำนวณ",
          "body": [
            "Reference 10,000 Mbps และ interface 1,000 Mbps ให้ Cost 10; interface 100 Mbps ให้ Cost 100",
            "ถ้ากำหนด ip ospf cost เอง ค่านั้นใช้แทนค่า Cost อัตโนมัติของ interface"
          ]
        }
      },
      {
        "title": "Authentication: ตรวจว่าข้อความมาจากผู้ที่รู้กุญแจ",
        "body": [
          "MD5 Authentication ในบริบท OSPFv2 แบบที่พบในแลปใช้กุญแจร่วมสร้าง Digest เพื่อตรวจสอบความถูกต้องของข้อความและการยืนยันแหล่งส่ง ผู้รับคำนวณเทียบก่อนยอมรับ",
          "สิ่งนี้ไม่ได้เข้ารหัสแพ็กเก็ต OSPF ทั้งชุด ผู้ที่จับแพ็กเก็ตยังอาจอ่านข้อมูลเส้นทางที่ส่งอยู่ได้ จึงต้องแยก Authentication/Integrity ออกจาก Confidentiality",
          "หาก key หรือวิธี authentication ไม่ตรงกัน Neighbor อาจตั้งไม่สำเร็จ"
        ],
        "pitfall": "คำตอบว่า ‘เปิด MD5 แล้วไม่มีใครอ่าน Packet ได้’ ผิด: Digest ไม่เท่ากับ Encryption และ MD5 เป็นเทคโนโลยีเก่าที่อธิบายตามบริบทแลป"
      },
      {
        "title": "EIGRP: 3 ตาราง และเงื่อนไขทางสำรอง",
        "body": [
          "**Neighbor Table:** เก็บเพื่อนบ้านที่สร้างความสัมพันธ์ได้",
          "**Topology Table:** เก็บข้อมูลเส้นทางที่เรียนรู้",
          "**Routing Table:** เก็บเส้นทางที่ได้รับเลือกใช้งาน; Successor คือ next hop ของทางหลักที่ดีที่สุด",
          "**Reported Distance (RD)** คือระยะทางที่เพื่อนบ้านประกาศว่าตนไปถึงปลายทาง",
          "ส่วน **Feasible Distance (FD)** เป็นค่าระยะทางอ้างอิงที่ DUAL ใช้ตรวจความเป็นไปได้ของเส้นทาง โดยละเอียดคือค่าต่ำสุดนับจากครั้งล่าสุดที่เส้นทางเข้าสู่สถานะ Passive",
          "เพื่อนบ้านที่จะเป็น Feasible Successor ต้องผ่าน Feasibility Condition: RD < FD อย่างเคร่งครัด จึงมีทางสำรองที่รับรองว่าไม่วนกลับมาหาเรา",
          "หากไม่ผ่านไม่ได้แปลว่าเส้นทางนั้นวนจริงเสมอไป แต่ยังใช้เป็นทางสำรองทันทีแบบที่ผ่านเงื่อนไขไม่ได้ และอาจต้อง Query/คำนวณใหม่เมื่อทางหลักล่ม"
        ],
        "table": {
          "headers": [
            "FD อ้างอิง",
            "RD ของผู้เสนอทางสำรอง",
            "ผ่าน RD < FD หรือไม่"
          ],
          "rows": [
            [
              "1000",
              "900",
              "ผ่าน"
            ],
            [
              "1000",
              "1000",
              "ไม่ผ่าน เพราะเท่ากัน"
            ],
            [
              "1000",
              "1200",
              "ไม่ผ่าน"
            ]
          ]
        },
        "code": "show ip eigrp neighbors\nshow ip eigrp topology\nshow ip route eigrp",
        "pitfall": "อย่านำระยะรวมผ่านเพื่อนบ้านมาแทน RD ในการเช็กเงื่อนไข และอย่าใช้ ≤ แทน <"
      },
      {
        "title": "Route Summarization และ Redistribution",
        "body": [
          "**Summarization** คือรวม prefix ที่อยู่ติดกันและมีบิตนำหน้าร่วมกันเพื่อลดจำนวนรายการ",
          "เช่น 172.16.8.0/24, .9.0/24, .10.0/24 และ .11.0/24 รวมพอดีเป็น 172.16.8.0/22 โดย mask คือ 255.255.252.0 ครอบคลุม 172.16.8.0–172.16.11.255",
          "วิธีคิดคือ octet ที่สาม: 8 = 00001000 และ 11 = 00001011 มี 6 บิตแรกร่วมกัน บวก 16 บิตของสอง octet แรกเป็น /22 การรวมต้องตรวจทั้งขอบเขตและ alignment ไม่ใช่แค่ลด prefix ตามจำนวนเครือข่าย",
          "**Redistribution** คือให้เราเตอร์ชายแดนนำเส้นทางจากระบบหนึ่งเข้าอีกระบบ เช่น OSPF ↔ EIGRP",
          "ต้องกำหนด metric เริ่มต้นให้โปรโตคอลที่ต้องการ และควบคุม prefix/route tag เพื่อไม่ให้เส้นทางที่นำออกถูกนำกลับซ้ำเป็น Route Feedback โดยเฉพาะเมื่อมีหลายจุดเชื่อมต่อ"
        ],
        "example": {
          "title": "ผูกกับ Lab ที่มี R1–R3",
          "body": [
            "ถ้า R1 อยู่ฝั่ง EIGRP และ R3 อยู่ฝั่ง OSPF ใช้ R2 เป็นจุดแลกเส้นทาง แล้วตรวจ Routing Table ทั้งสองฝั่งและ ping/traceroute ยืนยัน",
            "เห็น Neighbor ครบไม่ได้แปลว่า redistribution สำเร็จ ต้องดู prefix ปลายทาง, next hop, metric และเส้นทางขากลับด้วย"
          ]
        },
        "pitfall": "Summary ที่กว้างเกินเครือข่ายจริงอาจดึงทราฟฟิกที่ไปไม่ถึงมาให้เรา ส่วน Redistribution ไม่ใช่การแปลงแพ็กเก็ตข้อมูลจาก OSPF เป็น EIGRP"
      },
      {
        "title": "คำนวณ Cost ไปถึง LAN ของ R4",
        "body": [
          "ใช้ reference bandwidth 10000 Mbps และสมมติ Gi0/1 กับ Gi0/2 เป็น Gigabit ตามผัง Cost ต่อพอร์ต = 10000 / 1000 = 10",
          "ส่วน Gi0/3 ตั้ง bandwidth 1544 kbps ได้ 10000 / 1.544 ≈ 6476.68 ตัดเศษเป็น 6476 คำสั่ง bandwidth ระบุแบนด์วิดท์อ้างอิงให้โปรโตคอล ไม่ได้เปลี่ยนความเร็วสาย",
          "ปลายทางคือ 10.0.4.0/24 จึงรวม cost ขาออกของ R1 และ cost จาก R4 ออก LAN เส้นผ่าน switch ได้ 10 + 10 = 20 ส่วนเส้นตรงได้ 6476 + 10 = 6486 ขากลับของสายเส้นเดียวกันไม่ถูกนับซ้ำ ถ้า cost รวมเท่ากันอาจเห็นหลาย next hop ด้วย ECMP"
        ]
      },
      {
        "title": "DUAL ใช้ทางสำรองเมื่อใด",
        "body": [
          "**EIGRP** เก็บรายชื่อเพื่อนบ้านใน neighbor table และข้อมูลปลายทางกับระยะทางใน topology table เส้นทางที่เลือกใช้เรียก successor",
          "ส่วน feasible successor ต้องผ่านเงื่อนไข reported distance ของเพื่อนบ้าน < feasible distance ของเรา เช่น FD 100 กับ RD 80 ผ่าน แต่ RD 100 ไม่ผ่าน",
          "ถ้า successor หายและมี feasible successor จึงสลับได้ทันที หากไม่มีจะเข้าสถานะ Active แล้วส่ง Query รอ Reply เพื่อหาเส้นทางใหม่ Hello ใช้ค้นหาเพื่อนบ้าน Update ส่งข้อมูลเส้นทาง ส่วน ACK ยืนยันการรับข้อความที่ส่งแบบเชื่อถือได้"
        ]
      }
    ],
    "summary": [
      "OSPF = IP Protocol 89, Hello หาเพื่อนบ้าน, LSA สร้างแผนที่, SPF เลือก Cost รวมต่ำ",
      "Wildcard = 255.255.255.255 − Subnet Mask; /30 ได้ 0.0.0.3",
      "DR: Priority สูงก่อน Router ID สูง; Priority 0 ไม่ลงแข่ง; โดยทั่วไปไม่ preempt",
      "Point-to-Point ไม่มี DR/BDR; 2-WAY ระหว่าง DROTHER อาจเป็นปกติ",
      "EIGRP: Neighbor → Topology → Routing; Feasible Successor ต้อง RD < FD",
      "172.16.8.0/24 ถึง .11.0/24 สรุปเป็น 172.16.8.0/22",
      "Authentication ไม่ใช่ Encryption; Redistribution ต้องดู Metric และป้องกัน Feedback"
    ],
    "questions": [
      {
        "id": "5-01",
        "prompt": "ต้องการกรอง OSPFv2 ใน IPv4 ควรตรวจฟิลด์ใด",
        "options": [
          "TCP Destination Port 89",
          "UDP Destination Port 89",
          "IP Protocol Number 89",
          "Ethernet VLAN ID 89"
        ],
        "answer": 2,
        "explanation": "OSPF อยู่ตรงใน IP โดยใช้ Protocol 89 ไม่ได้ห่อด้วย TCP/UDP จึงไม่มี port 89 ของ OSPF",
        "level": "พื้นฐาน"
      },
      {
        "id": "5-02",
        "prompt": "Subnet Mask 255.255.255.252 มี Wildcard Mask เท่าใด",
        "options": [
          "0.0.0.252",
          "0.0.0.30",
          "255.255.255.3",
          "0.0.0.3"
        ],
        "answer": 3,
        "explanation": "ลบทีละ octet: 255−255 = 0 และ 255−252 = 3 จึงได้ 0.0.0.3",
        "level": "ประยุกต์"
      },
      {
        "id": "5-03",
        "prompt": "คำสั่ง network 10.0.12.0 0.0.0.3 area 0 ใช้เลือก interface ที่มี IP ใดได้",
        "options": [
          "10.0.12.2",
          "10.0.12.4",
          "10.0.13.2",
          "10.0.12.8"
        ],
        "answer": 0,
        "explanation": "Wildcard .3 เปิดให้สองบิตท้ายเปลี่ยนได้ จึงตรงช่วง 10.0.12.0 ถึง .3; .2 อยู่ในช่วง",
        "level": "ประยุกต์"
      },
      {
        "id": "5-04",
        "prompt": "R1 และ R2 อยู่ลิงก์เดียวกัน ping กันได้ แต่ Hello/Dead Timer ไม่ตรงกัน ควรสรุปอย่างไร",
        "options": [
          "OSPF ต้องทำงานได้เพราะ ping ผ่านแล้ว",
          "IP ใช้ได้บางส่วน แต่ต้องแก้ Timer ให้สอดคล้องเพื่อสร้าง OSPF Neighbor",
          "เปลี่ยน Process ID ให้เท่ากันเท่านั้น",
          "เพิ่ม Router ID ให้สูงขึ้นจะหาย"
        ],
        "answer": 1,
        "explanation": "IP Reachability และ OSPF adjacency เป็นคนละเงื่อนไข Hello/Dead Timer ต้องสอดคล้อง Process ID เป็นค่าภายในเครื่อง",
        "level": "ประยุกต์"
      },
      {
        "id": "5-05",
        "prompt": "การเลือก DR ใหม่มี R1 Priority 1/RID 1.1.1.1, R2 Priority 1/RID 2.2.2.2, R3 Priority 0/RID 9.9.9.9 ใครเป็น DR",
        "options": [
          "R1",
          "R3",
          "R2",
          "ทุกตัวเป็น DR พร้อมกัน"
        ],
        "answer": 2,
        "explanation": "ตัด R3 ออกเพราะ Priority 0 จากนั้น R1/R2 Priority เท่ากัน จึงเลือก Router ID สูงกว่า คือ R2",
        "level": "ประยุกต์"
      },
      {
        "id": "5-06",
        "prompt": "มี DR ทำงานปกติอยู่แล้ว แล้วเพิ่มเราเตอร์ Priority สูงกว่า จะเกิดอะไรขึ้นตามปกติ",
        "options": [
          "DR ใหม่แย่งตำแหน่งทันทีเสมอ",
          "DR เดิมกลายเป็น STP Root",
          "เราเตอร์ใหม่ไม่มีวันเป็น DR ได้",
          "DR เดิมยังทำงานต่อ เพราะการเลือกตั้งไม่ preempt"
        ],
        "answer": 3,
        "explanation": "OSPF ไม่แย่ง DR ที่ยังทำงานอยู่เพียงเพราะเราเตอร์ใหม่มี Priority สูงกว่า การเปลี่ยนบทบาทต้องอาศัยเหตุการณ์เลือกตั้งที่เหมาะสม",
        "level": "วิเคราะห์"
      },
      {
        "id": "5-07",
        "prompt": "บน OSPF Point-to-Point Network ต้องเลือก DR/BDR กี่ตัว",
        "options": [
          "ไม่มีการเลือก DR/BDR",
          "DR 1 ตัว BDR 1 ตัว",
          "DR 2 ตัว",
          "เลือกเฉพาะ BDR"
        ],
        "answer": 0,
        "explanation": "Point-to-Point มีเพื่อนที่ปลายลิงก์เดียว จึงไม่ต้องมีตัวประสานการแลกฐานข้อมูลแบบ Multiaccess",
        "level": "พื้นฐาน"
      },
      {
        "id": "5-08",
        "prompt": "จากภาพ R1 จะไป R3 ด้วยทางใด เมื่อเปรียบเทียบ OSPF Cost ของทางที่แสดง",
        "options": [
          "R1 → R3 เพราะจำนวน hop น้อยกว่าเสมอ",
          "R1 → R2 → R3 รวม Cost 20",
          "สุ่มทั้งสองทางเพราะปลายทางเดียวกัน",
          "ไปไม่ได้เพราะ R2 อยู่ตรงกลาง"
        ],
        "answer": 1,
        "explanation": "OSPF รวม Cost ตามเส้นทาง ทางผ่าน R2 = 10+10 = 20 น้อยกว่าทางตรง 30 จึงเลือกทางผ่าน R2",
        "level": "ประยุกต์",
        "diagram": "routing"
      },
      {
        "id": "5-09",
        "prompt": "จากภาพ ถ้าปรับลิงก์ตรง R1 → R3 จาก Cost 30 เป็น 20 และเงื่อนไขอื่นเท่ากัน ผลใดเป็นไปได้",
        "options": [
          "เลือกทางตรงเท่านั้นเพราะมี hop น้อยกว่า",
          "ปิดลิงก์ผ่าน R2 ด้วย STP",
          "ติดตั้งทั้งทางตรงและทางผ่าน R2 แบบ ECMP",
          "R1 ต้องกลายเป็น DR ก่อนจึงใช้ทางตรงได้"
        ],
        "answer": 2,
        "explanation": "ทางตรง Cost 20 เท่ากับทางผ่าน R2 Cost 10+10 จึงเป็น Equal-Cost Paths และอาจติดตั้งหลาย next hop ตามขีดจำกัดอุปกรณ์",
        "level": "วิเคราะห์",
        "diagram": "routing"
      },
      {
        "id": "5-10",
        "prompt": "Reference Bandwidth 10,000 Mbps และ interface 1,000 Mbps ได้ OSPF Cost อัตโนมัติเท่าใด",
        "options": [
          "1",
          "100",
          "1000",
          "10"
        ],
        "answer": 3,
        "explanation": "ใช้หน่วยเหมือนกันแล้วหาร 10,000÷1,000 = 10 ค่าตั้ง reference ควรสอดคล้องทุกเราเตอร์",
        "level": "ประยุกต์"
      },
      {
        "id": "5-11",
        "prompt": "เปิด MD5 Authentication สำหรับ OSPF แล้ว ข้อใดถูกต้อง",
        "options": [
          "ช่วยตรวจสอบข้อความ แต่ไม่ได้เข้ารหัสแพ็กเก็ตทั้งหมด",
          "เข้ารหัสข้อมูลทุกฟิลด์จน Wireshark อ่านไม่ได้",
          "เปลี่ยน OSPF เป็น TCP",
          "ทำให้ไม่ต้องตั้ง Area ให้ตรงกัน"
        ],
        "answer": 0,
        "explanation": "Digest ใช้ตรวจ Authentication/Integrity การปกปิดเนื้อหาต้องใช้กลไกเข้ารหัสแยกต่างหาก",
        "level": "ประยุกต์"
      },
      {
        "id": "5-12",
        "prompt": "EIGRP ต้องการดูข้อมูลเส้นทางที่เรียนรู้และทางสำรอง ควรเริ่มที่ตารางใด",
        "options": [
          "MAC Address Table",
          "Topology Table",
          "ARP Table",
          "VLAN Database"
        ],
        "answer": 1,
        "explanation": "EIGRP Topology Table เก็บข้อมูลเส้นทาง Neighbor Table เก็บเพื่อนบ้าน ส่วน Routing Table แสดงเส้นทางที่เลือกติดตั้ง",
        "level": "พื้นฐาน"
      },
      {
        "id": "5-13",
        "prompt": "EIGRP มี FD อ้างอิง 1000 ทางสำรอง A มี RD 900 ทางสำรอง B มี RD 1000 ใครผ่าน Feasibility Condition",
        "options": [
          "ทั้ง A และ B",
          "เฉพาะ B",
          "เฉพาะ A",
          "ไม่มีใครผ่าน"
        ],
        "answer": 2,
        "explanation": "เงื่อนไขเป็น RD < FD แบบน้อยกว่าอย่างเคร่งครัด A:900<1000 ผ่าน แต่ B เท่ากับ 1000 จึงไม่ผ่าน",
        "level": "ประยุกต์"
      },
      {
        "id": "5-14",
        "prompt": "172.16.8.0/24 ถึง 172.16.11.0/24 รวมพอดีเป็นข้อใด",
        "options": [
          "172.16.8.0/23",
          "172.16.0.0/22",
          "172.16.10.0/22",
          "172.16.8.0/22"
        ],
        "answer": 3,
        "explanation": "4 เครือข่าย /24 ใช้บิต host เพิ่ม 2 บิตจึงเป็น /22 และเริ่มที่ขอบเขต 8 ครอบคลุม octet ที่สาม 8–11",
        "level": "ประยุกต์"
      },
      {
        "id": "5-15",
        "prompt": "มี Redistribution OSPF ↔ EIGRP หลายจุด เส้นทางถูกนำกลับเข้าโปรโตคอลเดิม ควรจัดการอย่างไร",
        "options": [
          "ใช้ policy/filter หรือ route tag ควบคุมการนำเส้นทางกลับ และกำหนด metric ให้เหมาะสม",
          "เพิ่มทุก metric ให้เป็น 0 เสมอ",
          "เปิด Trunk ทุกพอร์ต",
          "ปิดการตรวจ Neighbor ทั้งหมด"
        ],
        "answer": 0,
        "explanation": "การนำเข้าออกหลายจุดเสี่ยง Route Feedback ต้องควบคุมต้นทางของเส้นทางและ prefix ที่อนุญาต การมี Neighbor เพียงอย่างเดียวไม่ได้ป้องกันปัญหานี้",
        "level": "วิเคราะห์"
      }
    ],
    "sources": [
      {
        "title": "Cisco: อ่าน show ip ospf interface",
        "url": "https://www.cisco.com/c/en/us/support/docs/ip/open-shortest-path-first-ospf/13689-17.html"
      },
      {
        "title": "Cisco: Troubleshoot EIGRP Common Issues",
        "url": "https://www.cisco.com/c/en/us/support/docs/ip/enhanced-interior-gateway-routing-protocol-eigrp/118974-technote-eigrp-00.html"
      },
      {
        "title": "RFC 7868: EIGRP และ DUAL",
        "url": "https://datatracker.ietf.org/doc/html/rfc7868"
      }
    ],
    "labs": [
      {
        "title": "ตั้ง OSPF Area 0 ของ R1–R4",
        "body": [
          "**กำหนด IP ตามหมายเลข router N:** วง broadcast ใช้ Gi0/1 = 192.168.100.N/24; วง LAN ใช้ Gi0/2 = 10.0.N.1/24",
          "**กำหนดตัวตน:** Loopback0 และ Router ID ใช้ N.N.N.N",
          "**แยกลิงก์สำรอง:** Gi0/3 มีเฉพาะ R1 กับ R4; ตั้งค่าแต่ละเครื่องตามผังแล้วตรวจ neighbor"
        ],
        "steps": [
          {
            "device": "R1 · ค่าอ้างอิงสำหรับ Part A–C",
            "code": "configure terminal\ninterface loopback0\n ip address 1.1.1.1 255.255.255.255\n exit\ninterface gi0/1\n ip address 192.168.100.1 255.255.255.0\n ip ospf priority 100\n no shutdown\n exit\ninterface gi0/2\n ip address 10.0.1.1 255.255.255.0\n no shutdown\n exit\ninterface gi0/3\n ip address 172.16.14.1 255.255.255.252\n bandwidth 1544\n ip ospf network point-to-point\n no shutdown\n exit\nrouter ospf 1\n router-id 1.1.1.1\n network 192.168.100.0 0.0.0.255 area 0\n network 10.0.1.0 0.0.0.255 area 0\n network 172.16.14.0 0.0.0.3 area 0\n passive-interface gi0/2\n auto-cost reference-bandwidth 10000\nend\nshow ip ospf neighbor\nshow ip ospf interface brief"
          }
        ],
        "example": {
          "title": "ตรวจผลและอธิบาย",
          "body": [
            "R2 ตั้ง priority 100, R3 ใช้ค่าเริ่มต้น และ R4 ตั้ง 0 บน Gi0/1 สำหรับ R2/R3 ตัดบล็อก Gi0/3 และ network 172.16.14.0 ออก สำหรับ R4 ใช้ 172.16.14.2/30 รูปแบบ point-to-point เหมือน R1 เปลี่ยน LAN network statement ให้ตรงแต่ละเครื่อง",
            "ถ้าเลือกพร้อมกัน R2 ชนะ R1 เพราะ Router ID สูงกว่าเมื่อ priority เท่ากัน แต่ DR เดิมยังอยู่ได้เมื่ออีกตัวมาทีหลัง บน broadcast เพื่อน DROTHER สองตัวอาจเห็น 2-WAY ได้ตามปกติ ส่วนลิงก์ Gi0/3 ควรเห็น FULL โดยไม่มี DR/BDR"
          ]
        }
      },
      {
        "title": "เปิด MD5 และทดลองตัดเส้นทางหลัก",
        "body": [
          "**ตั้ง authentication:** ให้ Key ID และ secret ตรงกันที่ Gi0/1 ของทุกเครื่อง รวมทั้ง Gi0/3 ทั้งสองฝั่ง",
          "**ตรวจ neighbor ก่อน:** รอให้ทุกคู่ที่ต้องสร้าง adjacency กลับมาเป็น neighbor",
          "**ทดสอบเส้นทาง:** ตรวจทางหลักก่อนตัดลิงก์ แล้วเทียบ next hop และ cost หลังตัดและคืนลิงก์"
        ],
        "steps": [
          {
            "device": "Router ทุกตัว · ทำส่วน interface ซ้ำที่ Gi0/3 ของ R1/R4 ด้วย",
            "code": "configure terminal\ninterface gi0/1\n ip ospf authentication message-digest\n ip ospf message-digest-key 1 md5 CCNAlab#2024\n exit\nrouter ospf 1\n area 0 authentication message-digest\nend\nshow ip ospf interface gi0/1\nshow ip ospf neighbor"
          },
          {
            "device": "R1 · บันทึกก่อนตัด ระหว่างตัด และหลังคืนลิงก์",
            "code": "show ip route 10.0.4.0\nshow ip route ospf\nshow ip ospf interface gi0/3"
          },
          {
            "device": "R4 · ตัดเส้นทางผ่านสวิตช์ชั่วคราว",
            "code": "configure terminal\ninterface gi0/1\n shutdown\nend"
          }
        ],
        "example": {
          "title": "ตรวจผลและอธิบาย",
          "body": [
            "อ่าน [110/metric] และ next hop บน R1 ปกติควรไปทาง 192.168.100.4 เมื่อตัดแล้วควรเปลี่ยนเป็น 172.16.14.2 คืนลิงก์ด้วย no shutdown บน Gi0/1 ของ R4 แล้วตรวจอีกครั้ง",
            "ถ้า neighbor ไม่ขึ้น ให้ไล่ interface up/up → IP/mask → area และ wildcard → hello/dead → network type → authentication ทั้งสองด้าน ถ้ามี neighbor แล้วแต่ไม่มี LAN route ให้ตรวจ network ที่ครอบ Gi0/2 แม้พอร์ตนั้นตั้ง passive"
          ]
        }
      }
    ],
    "courseFiles": [
      "OSPF_Single_Area_Advanced.pdf · หน้า 2–12",
      "Lab_Sheet_OSPF_Single_Area_Advanced.docx และ lab/Lab_Sheet_OSPF_Single_Area_Advanced.pdf · Part A–E",
      "Advanced_Routing_WAN_Lecture_Lab.pdf · หน้า 4–16",
      "แลบ EIGRP/OSPF สามเราเตอร์และ redistribution ดูภาคปฏิบัติบท 8"
    ]
  },
  {
    "id": 6,
    "title": "Gateway Redundancy: HSRP, VRRP และ GLBP",
    "shortTitle": "Gateway Redundancy",
    "subtitle": "เกตเวย์เสมือนช่วยให้เครื่องลูกข่ายใช้งานต่อเมื่อเราเตอร์หลักขัดข้อง",
    "minutes": 30,
    "objectives": [
      "อธิบาย Virtual IP/Virtual MAC และการรับช่วง Gateway",
      "เปรียบเทียบ HSRP, VRRP และ GLBP",
      "อ่านผล Priority, Preempt และการติดตาม uplink",
      "วัด Convergence Time และแยก Timer ออกจากเวลาหยุดชะงักจริง"
    ],
    "sections": [
      {
        "title": "ทำไมมีเราเตอร์สองตัวแล้ว ยังต้องมี Virtual Gateway",
        "body": [
          "เครื่องลูกข่ายทั่วไปตั้ง Default Gateway เป็น IP หนึ่งค่า หากค่านั้นเป็น IP จริงของเราเตอร์ที่ล่ม การมีเราเตอร์ตัวที่สองอยู่ใน VLAN ไม่ได้ทำให้ลูกข่ายสลับมาใช้อัตโนมัติ",
          "First-Hop Redundancy Protocol (FHRP) จึงสร้าง Virtual IP และ Virtual MAC ให้เราเตอร์หลายตัวร่วมรับผิดชอบ",
          "ในภาพ Client 192.168.10.10 ใช้ Default Gateway 192.168.10.1 ซึ่งเป็น Virtual IP",
          "ส่วน R1 และ R2 ใช้ IP จริง .2 และ .3 เมื่อเครื่องหลักล่ม เครื่องสำรองรับหน้าที่ Virtual Gateway ต่อ ลูกข่ายจึงคงค่า Gateway เดิมได้"
        ],
        "diagram": "gateway",
        "example": {
          "title": "คิดเหมือนเคาน์เตอร์บริการ",
          "body": [
            "ลูกค้าจำหมายเลขเคาน์เตอร์เดียว แต่พนักงานด้านหลังเปลี่ยนคนได้ Virtual IP คือจุดติดต่อคงที่ ส่วนเราเตอร์จริงคือผู้ให้บริการในเวลานั้น",
            "FHRP ดูแลประตูออกจาก LAN แต่ยังต้องมีเส้นทางออกปลายทางและเส้นทางขากลับที่ใช้งานได้"
          ]
        },
        "pitfall": "Gateway redundancy ไม่ได้ทำให้ลิงก์ WAN ทุกเส้นหรือ DNS กลายเป็นระบบสำรองโดยอัตโนมัติ"
      },
      {
        "title": "HSRP: Active/Standby, Priority และ Preempt",
        "body": [
          "**HSRP** เป็นเทคโนโลยีของ Cisco โดย Active Router ส่งต่อข้อมูลแทน Virtual Gateway และ Standby Router รอรับช่วง Priority สูงกว่ามีสิทธิ์เหนือกว่าในการเลือกบทบาทตามสถานการณ์",
          "**Preempt** คืออนุญาตให้เราเตอร์ที่เหมาะสมกว่ากลับมารับตำแหน่ง Active จากตัวที่กำลังทำงานอยู่",
          "**HSRP** โดยทั่วไปไม่เปิด preempt เป็นค่าเริ่มต้น ดังนั้น R1 Priority 110 กลับมาออนไลน์หลัง R2 Priority 100 รับช่วงแล้ว ไม่ได้แปลว่า R1 จะได้ Active คืนทันที",
          "ถ้าลิงก์ LAN ของ R1 ยัง up แต่ uplink ด้านนอกล่ม การดูเฉพาะ Hello ระหว่าง R1/R2 อาจไม่พบปัญหา",
          "จึงใช้ Tracking ลด Priority ตามสถานะ uplink หรือ object ที่ตรวจสอบ และให้เราเตอร์ที่ดีกว่ารับช่วงตามนโยบาย preempt"
        ],
        "diagram": "gateway",
        "code": "! ตัวอย่าง Cisco IOS บน R1 สำหรับ HSRPv2\ninterface GigabitEthernet0/0\n ip address 192.168.10.2 255.255.255.0\n standby version 2\n standby 10 ip 192.168.10.1\n standby 10 priority 110\n standby 10 preempt\n!\nshow standby brief",
        "example": {
          "title": "R1 มี Priority110 และถูกลดลง20",
          "body": [
            "หลัง Tracking ตรวจพบปัญหา ค่า R1 เหลือ 90 ต่ำกว่า R2 ที่ 100 หาก R2 เปิด preempt และเงื่อนไขอื่นพร้อม R2 สามารถรับบท Active",
            "Preempt delay อาจใช้รอให้ routing/uplink พร้อมก่อนรับหน้าที่คืน เพื่อลดการสลับเร็วเกินไป"
          ]
        }
      },
      {
        "title": "VRRP และ GLBP: สำรองกับกระจายโหลด",
        "body": [
          "**VRRP** เป็นมาตรฐานเปิด ใช้ชื่อบทบาท Master/Backup ตามคำศัพท์ในแนวข้อสอบ Priority สูงกว่ามีสิทธิ์เป็น Master และเปิด preemption โดยค่าเริ่มต้น",
          "สำหรับ IP Address Owner ที่ใช้ IP จริงของตนเป็น Virtual IP มี Priority 255 และเป็นกรณีพิเศษที่มีสิทธิ์กลับเป็น Master",
          "**GLBP** ช่วยให้ลูกข่ายต่างเครื่องใช้เราเตอร์ส่งต่อคนละตัวภายใต้ Virtual IP เดียว AVG (Active Virtual Gateway) ตอบ ARP ด้วย Virtual MAC ที่แตกต่างกันตามกลไกกระจายโหลด",
          "ส่วน AVF (Active Virtual Forwarder) รับผิดชอบส่งต่อข้อมูลของ Virtual MAC นั้น",
          "HSRP/VRRP หนึ่งกลุ่มโดยหลักมีตัวส่งต่อหลักหนึ่งตัว การทำหลายกลุ่มเพื่อแบ่ง VLAN หรือกลุ่มลูกข่ายเป็นอีกวิธีหนึ่ง แต่ต่างจากการกระจายโหลดที่ GLBP ทำในกลุ่มเดียว"
        ],
        "table": {
          "headers": [
            "หัวข้อ",
            "HSRP",
            "VRRP",
            "GLBP"
          ],
          "rows": [
            [
              "บทบาทหลัก",
              "Active / Standby",
              "Master / Backup",
              "AVG / AVF"
            ],
            [
              "จุดเด่น",
              "สำรอง Gateway ในระบบ Cisco",
              "มาตรฐานเปิดสำหรับสำรอง Gateway",
              "สำรองและกระจายโหลด Gateway"
            ],
            [
              "Preempt ค่าเริ่มต้นที่ต้องจำ",
              "ปิด",
              "เปิด; Owner เป็นกรณีพิเศษ",
              "ตรวจตามบทบาทและการตั้งค่า"
            ],
            [
              "หนึ่ง Virtual IP",
              "รองรับ",
              "รองรับ",
              "รองรับ พร้อมหลาย Virtual MAC สำหรับ Forwarder"
            ]
          ]
        },
        "pitfall": "GLBP ไม่ได้แปลว่าแพ็กเก็ตทุกแพ็กเก็ตของการเชื่อมต่อเดียวถูกสลับส่งระหว่างเราเตอร์เสมอ วิธีแบ่งโหลดสัมพันธ์กับ ARP และนโยบายที่ตั้ง"
      },
      {
        "title": "จำ Protocol, Multicast และ Virtual MAC โดยระบุเวอร์ชัน",
        "body": [
          "แยก ‘IP Protocol Number’ ออกจาก ‘UDP Port’ ให้ชัดเจน HSRP IPv4 ใช้ UDP 1985 ส่วน VRRP IPv4 ใช้ IP Protocol 112 และ multicast 224.0.0.18 จึงหาด้วย udp.port == 112 ไม่ได้",
          "รูปแบบ Virtual MAC ต้องผูกกับโปรโตคอลและเวอร์ชัน สำหรับ VRRP IPv4 คือ 00:00:5e:00:01:xx โดย xx เป็น VRID ในฐานสิบหก ส่วน HSRPv1 คือ 0000.0c07.acXX และ HSRPv2 คือ 0000.0c9f.fXXX"
        ],
        "table": {
          "headers": [
            "โปรโตคอล IPv4",
            "ปลายทางควบคุม",
            "Virtual MAC ตัวอย่างกลุ่ม10"
          ],
          "rows": [
            [
              "HSRPv1",
              "UDP 1985 / 224.0.0.2",
              "0000.0c07.ac0a"
            ],
            [
              "HSRPv2",
              "UDP 1985 / 224.0.0.102",
              "0000.0c9f.f00a"
            ],
            [
              "VRRP",
              "IP Protocol 112 / 224.0.0.18",
              "0000.5e00.010a"
            ]
          ]
        },
        "example": {
          "title": "แปลง VRID ให้เป็น MAC",
          "body": [
            "VRID10 ฐานสิบ = 0A ฐานสิบหก จึงได้ VRRP MAC 0000.5e00.010a",
            "ท้าย MAC ไม่ใช่ IP Address ของเราเตอร์ และไม่ใช่หมายเลขพอร์ตสวิตช์"
          ]
        }
      },
      {
        "title": "Timer และ Convergence Time: อย่าตอบว่า Hello เท่ากับเวลาสลับ",
        "body": [
          "ค่า HSRP ที่มักใช้เป็นค่าเริ่มต้นในแลป Cisco คือ Hello 3 วินาที และ Hold 10 วินาที",
          "ส่วน **VRRP** ค่า Advertisement Interval โดยทั่วไป 1 วินาที การประกาศว่า Master หายต้องรอหลายช่วงรวม Skew Time จึงไม่ใช่สลับภายใน 1 วินาทีเสมอ",
          "สำหรับ VRRPv2, Master_Down_Interval = 3 × Advertisement_Interval + (256 − Priority)/256 วินาที เช่น Interval 1 และ Backup Priority 100 ได้ 3 + 156/256 ≈ 3.609 วินาที",
          "ส่วน VRRPv3 คำนวณ Skew โดยสัมพันธ์กับ Master Advertisement Interval",
          "เมื่อใช้ค่าตั้งต้นเหล่านี้ VRRP มักตรวจการหายของ Master เร็วกว่า HSRP",
          "แต่เวลาสลับจริงยังขึ้นกับการตรวจ failure, timer ที่ตั้ง, การรับช่วง forwarding, ARP/MAC learning และวิธีวัด ทั้งสองระบบปรับ Timer ให้เร็วขึ้นได้ตามความสามารถอุปกรณ์"
        ],
        "pitfall": "จำนวน ping ที่หาย × ช่วง ping เป็นเพียงค่าประมาณ การเทียบเวลาต้องใช้วิธีและจุดวัดเดียวกัน ไม่อ้างว่า VRRP เร็วกว่า HSRP ทุกกรณี"
      },
      {
        "title": "อ่าน Capture เพื่อวัดผลการรับช่วงอย่างมีหลักฐาน",
        "body": [
          "ในแลปให้สร้างทราฟฟิกต่อเนื่องจากลูกข่ายไปปลายทางผ่าน Gateway แล้วบันทึกเวลาที่ทำให้ตัวหลักหรือ uplink ขัดข้อง ควบคู่กับ capture โปรโตคอลและ Echo Request/Reply",
          "กำหนดสิ่งที่จะวัดก่อน: control-plane failover ดูการเปลี่ยน Active/Master",
          "ส่วน data-plane outage ดูช่วงที่แพ็กเก็ตผู้ใช้ส่งต่อไม่ได้ การใช้เวลาจาก Hello สุดท้ายของตัวเดิมถึง Hello/Advertisement แรกของตัวใหม่เป็นค่าประมาณเฉพาะที่จุด capture มองเห็น",
          "สำหรับตัวอย่าง ถ้ามีหลักฐานเวลา failure ที่ 12.000 วินาที และแพ็กเก็ตผู้ใช้สำเร็จครั้งแรกหลังรับช่วงที่ 15.400 วินาที เวลากลับมาให้บริการที่วัดได้ประมาณ 3.400 วินาที ต้องบอกความละเอียดของ probe และจุดจับด้วย"
        ],
        "code": "# Wireshark display filters\nhsrp\nvrrp\nudp.port == 1985\nip.proto == 112\nicmp",
        "example": {
          "title": "เมื่อ Gateway เปลี่ยนแล้วแต่ ping ยังไม่ผ่าน",
          "body": [
            "ตรวจว่าเราเตอร์ใหม่มีเส้นทางไปปลายทางและเส้นทางขากลับหรือไม่ ตรวจ Tracking และสถานะ uplink ด้วย",
            "ดู ARP ของลูกข่ายและ MAC Address Table ของสวิตช์ประกอบ เพื่อยืนยันว่าทราฟฟิกไปยังตัวที่รับหน้าที่จริง"
          ]
        }
      },
      {
        "title": "Preempt, tracking และปัญหาขา LAN ยังดีแต่ WAN ขาด",
        "body": [
          "**Preempt** อนุญาตให้ router ที่มี priority สูงกว่าเข้ารับบทบาทเมื่อพร้อม Tracking ตรวจวัตถุที่กระทบการส่งต่อ เช่น line protocol ของ uplink ถ้า R1 มี priority 120 แล้ว track ลด 30 จะเหลือ 90 ต่ำกว่า R2 ที่มี 100 จึงให้ R2 ที่เปิด preempt เข้ารับช่วงได้",
          "ถ้าปิดเฉพาะ uplink ของ R1 แต่ยังส่ง Hello บน LAN ได้ การเฝ้ารอ Hello อย่างเดียวจะมองไม่เห็นความเสียหายนี้ ให้ทดสอบด้วยการ ping เครื่องหลัง gateway ด้วย เพราะตอบ VIP ได้ยังไม่พิสูจน์ว่าออก WAN ได้"
        ]
      },
      {
        "title": "GLBP เลือกคนตอบ ARP กับคนส่ง packet อย่างไร",
        "body": [
          "AVG เป็นผู้ตอบ ARP ของ virtual IP และเลือก virtual MAC ของ AVF ให้ client แต่ละเครื่อง",
          "ส่วน AVF ส่งต่อเฟรมที่จ่าถึง MAC ที่ตนรับผิดชอบ Round-robin สลับการแจก MAC ตามคำขอ, weighted แบ่งตามน้ำหนัก และ host-dependent ผูกการเลือกกับตัวตนของ client",
          "ARP cache ทำให้การ ping หลายครั้งจากเครื่องเดิมมักใช้ AVF เดิม จึงต้องเปรียบเทียบหลาย client และดู ARP Reply ก่อนสรุปการกระจายโหลด จำนวน client ต่อ AVF และจำนวนไบต์ที่แต่ละตัวส่งเป็นคนละตัวชี้วัด"
        ]
      },
      {
        "title": "แยก State ของ HSRP, VRRP และหมายเลขกลุ่ม",
        "body": [
          "**HSRP** มี Initial, Learn, Listen, Speak, Standby และ Active ช่วง Learn ยังรอเรียน virtual IP",
          "ส่วน Speak ใช้แลก Hello และเข้าร่วมเลือกบทบาท เมื่อกลุ่มนิ่ง Active รับส่งให้ client และ Standby เตรียมรับช่วง",
          "**VRRP** ในใบงานใช้ Initialize, Backup และ Master โดยเจ้าของ IP จริงที่ตรงกับ virtual IP ใช้ priority 255 ส่วนค่า 0 ใน advertisement เป็นสัญญาณสละบทบาท HSRPv2 group 1 ใช้ virtual MAC 0000.0c9f.f001 ขณะที่ VRRP IPv4 VRID 1 ใช้ 0000.5e00.0101 จึงอ่าน group และ protocol ย้อนจากรูปแบบ MAC ได้"
        ]
      }
    ],
    "summary": [
      "Client ตั้ง Default Gateway เป็น Virtual IP เพื่อคงค่าเดิมขณะเราเตอร์สลับตัว",
      "HSRP: Active/Standby; Preempt โดยทั่วไปปิด — VRRP: Master/Backup; Preempt เปิด",
      "Priority สูงมีสิทธิ์เหนือกว่า แต่ต้องพิจารณา Preempt และสถานะเดิม",
      "HSRP IPv4 = UDP 1985; VRRP IPv4 = IP 112 และ 224.0.0.18",
      "VRRP IPv4 MAC = 0000.5e00.01xx โดย xx คือ VRID ฐาน 16",
      "GLBP ใช้ AVG/AVF ช่วยกระจายงานส่งต่อ",
      "วัด Convergence ต้องระบุจุดเริ่ม จุดจบ และแยก control plane กับ data plane"
    ],
    "questions": [
      {
        "id": "6-01",
        "prompt": "จากภาพ Client ควรตั้ง Default Gateway เป็น IP ใดเพื่อใช้ Gateway Redundancy",
        "options": [
          "192.168.10.2",
          "192.168.10.3",
          "192.168.10.10",
          "192.168.10.1"
        ],
        "answer": 3,
        "explanation": ".1 คือ Virtual IP ที่เราเตอร์รับผิดชอบร่วมกัน ส่วน .2/.3 เป็น IP จริงของแต่ละตัว หากผูกกับ IP จริงจะเสียประโยชน์การรับช่วง",
        "level": "พื้นฐาน",
        "diagram": "gateway"
      },
      {
        "id": "6-02",
        "prompt": "จากภาพ R1 ล่มและ R2 รับหน้าที่ Virtual Gateway สำเร็จ Client ต้องแก้ Gateway เป็น .3 หรือไม่",
        "options": [
          "ไม่ต้อง ยังคงใช้ 192.168.10.1",
          "ต้องเปลี่ยนเป็น 192.168.10.3 ทุกครั้ง",
          "ต้องเปลี่ยน IP ตัวเองเป็น 192.168.10.1",
          "ต้องลบ VLAN 10"
        ],
        "answer": 0,
        "explanation": "หัวใจของ Virtual Gateway คือจุดติดต่อของ Client คงเดิม ขณะที่ผู้ส่งต่อด้านหลังเปลี่ยนจาก R1 เป็น R2",
        "level": "ประยุกต์",
        "diagram": "gateway"
      },
      {
        "id": "6-03",
        "prompt": "ชื่อบทบาทหลักของ HSRP คือคู่ใด",
        "options": [
          "Root / Designated",
          "Active / Standby",
          "Master / Backup",
          "Supplicant / Authenticator"
        ],
        "answer": 1,
        "explanation": "HSRP ใช้ Active และ Standby ส่วน Master/Backup เป็นคำศัพท์ VRRP ในแนวข้อสอบ",
        "level": "พื้นฐาน"
      },
      {
        "id": "6-04",
        "prompt": "R2 Priority 100 เป็น HSRP Active อยู่ แล้ว R1 Priority 110 กลับมาโดยปิด Preempt คาดว่าอย่างไร",
        "options": [
          "R1 แย่ง Active ทันทีเสมอ",
          "ทั้งสองต้องหยุดส่งข้อมูล",
          "R2 อาจคง Active ต่อ แม้ R1 Priority สูงกว่า",
          "Priority ของ R2 จะเปลี่ยนเป็น 255 อัตโนมัติ"
        ],
        "answer": 2,
        "explanation": "Priority สูงไม่ได้บังคับให้แย่ง Active เดิมเมื่อ Preempt ปิด ต้องพิจารณาสถานะและนโยบายการรับบทบาท",
        "level": "วิเคราะห์"
      },
      {
        "id": "6-05",
        "prompt": "ต้องการให้ R1 ที่มี Priority สูงกว่ารับบท HSRP Active คืนหลังฟื้นตัว คำสั่งใดเกี่ยวข้อง",
        "options": [
          "switchport mode access",
          "ip ospf priority 0",
          "vtp mode transparent",
          "standby 10 preempt"
        ],
        "answer": 3,
        "explanation": "standby group preempt อนุญาตให้แย่งบท Active ตาม Priority อาจตั้ง delay เพิ่มเพื่อรอความพร้อม",
        "level": "ประยุกต์"
      },
      {
        "id": "6-06",
        "prompt": "R1 Priority 110 ถูก Tracking ลด 20 ส่วน R2 Priority 100 และเปิด Preempt ค่าใดอธิบายการรับช่วงได้",
        "options": [
          "R1 เหลือ 90 จึงต่ำกว่า R2 และ R2 สามารถรับ Active",
          "R1 เหลือ 130 จึงยังสูงกว่า",
          "R2 ต้องใช้ OSPF Cost ก่อน",
          "R1 ยังคง 110 เพราะ Tracking ไม่มีผลต่อ Priority"
        ],
        "answer": 0,
        "explanation": "นำ 110−20=90 แล้วเทียบ 100 ของ R2 Tracking จึงช่วยสะท้อนปัญหา uplink แม้ LAN interface ยัง up",
        "level": "ประยุกต์"
      },
      {
        "id": "6-07",
        "prompt": "ข้อใดเปรียบเทียบ Preempt ของ HSRP และ VRRP โดยทั่วไปได้ถูกต้อง",
        "options": [
          "HSRP เปิด ส่วน VRRP ปิด",
          "HSRP ปิดโดยค่าเริ่มต้น ส่วน VRRP เปิด",
          "ทั้งคู่ปิดเสมอและเปิดไม่ได้",
          "Preempt ใช้เฉพาะ STP"
        ],
        "answer": 1,
        "explanation": "เป็นค่าเริ่มต้นที่มักพบในบริบทแลป ต้องดู configuration จริงด้วย VRRP address owner ยังเป็นกรณีพิเศษ",
        "level": "พื้นฐาน"
      },
      {
        "id": "6-08",
        "prompt": "HSRP สำหรับ IPv4 ใช้การระบุโปรโตคอลแบบใด",
        "options": [
          "TCP Port 1985",
          "IP Protocol 112",
          "UDP Port 1985",
          "UDP Port 89"
        ],
        "answer": 2,
        "explanation": "HSRP IPv4 ห่อด้วย UDP 1985 อย่าสลับกับ VRRP ซึ่งใช้ IP Protocol 112",
        "level": "พื้นฐาน"
      },
      {
        "id": "6-09",
        "prompt": "ข้อใดคือ VRRP สำหรับ IPv4",
        "options": [
          "UDP 112 และ 224.0.0.2",
          "TCP 1985 และ 224.0.0.18",
          "IP 89 และ 224.0.0.5",
          "IP Protocol 112 และ Multicast 224.0.0.18"
        ],
        "answer": 3,
        "explanation": "112 เป็นหมายเลข Protocol ใน IP header ของ VRRP ไม่ใช่หมายเลข TCP/UDP port",
        "level": "ประยุกต์"
      },
      {
        "id": "6-10",
        "prompt": "VRRP IPv4 กลุ่ม 10 มี Virtual MAC ข้อใด",
        "options": [
          "0000.5e00.010a",
          "0000.5e00.0110",
          "0000.0c07.ac0a",
          "0000.0c9f.f00a"
        ],
        "answer": 0,
        "explanation": "VRID10 ฐานสิบคือ 0a ฐาน 16 นำต่อท้าย 0000.5e00.01 ส่วนอีกสองรูปแบบเป็น HSRPv1/v2",
        "level": "ประยุกต์"
      },
      {
        "id": "6-11",
        "prompt": "HSRPv2 IPv4 กลุ่ม 10 ใช้ Virtual MAC ใด",
        "options": [
          "0000.0c07.ac0a",
          "0000.0c9f.f00a",
          "0000.5e00.010a",
          "ffff.ffff.ffff"
        ],
        "answer": 1,
        "explanation": "HSRPv2 ใช้ช่วง 0000.0c9f.f000–ffff โดยท้าย 12 บิตคือ group; กลุ่ม 10 จึงเป็น 00a",
        "level": "ประยุกต์"
      },
      {
        "id": "6-12",
        "prompt": "ต้องการกระจาย Client ไปใช้เราเตอร์ส่งต่อหลายตัวภายใต้ Virtual IP เดียว เทคโนโลยีใดตรงที่สุด",
        "options": [
          "STP",
          "VTP",
          "GLBP",
          "802.1Q"
        ],
        "answer": 2,
        "explanation": "GLBP มี AVG ตอบ ARP ให้ Client ใช้ Virtual MAC ของ AVF ต่างตัว จึงรองรับทั้งความซ้ำซ้อนและแบ่งโหลด",
        "level": "ประยุกต์"
      },
      {
        "id": "6-13",
        "prompt": "VRRPv2 มี Advertisement1 วินาที และ Backup Priority 100 ค่า Master_Down_Interval ตามสูตรประมาณเท่าใด",
        "options": [
          "1 วินาที",
          "10 วินาที",
          "100 วินาที",
          "3.609 วินาที"
        ],
        "answer": 3,
        "explanation": "3×1 +(256−100)/256 =3+0.609375 ≈3.609 วินาที ค่านี้เป็น timer ไม่ใช่การรับประกัน outage จริง",
        "level": "ประยุกต์"
      },
      {
        "id": "6-14",
        "prompt": "ข้อใดถูกต้องเกี่ยวกับการเปรียบเทียบ VRRP กับ HSRP",
        "options": [
          "เมื่อใช้ Timer เริ่มต้นที่กล่าวในบท VRRP มักตรวจ failure เร็วกว่า แต่ปรับ Timer แล้วผลอาจต่าง",
          "VRRP เร็วกว่าเสมอในทุก configuration",
          "HSRP Hold Timer เท่ากับ Hello Timer เสมอ",
          "VRRP มี Advertisement1 วินาทีจึงสลับได้ตรง 1 วินาทีแน่นอน"
        ],
        "answer": 0,
        "explanation": "ความเร็วขึ้นกับ Timer, failure detection และสภาพเครือข่าย ต้องไม่ใช้ค่า Hello/Advertisement แทน outage ทั้งหมด",
        "level": "วิเคราะห์"
      },
      {
        "id": "6-15",
        "prompt": "บันทึก failure เวลา 12.000s และ probe ผู้ใช้สำเร็จครั้งแรกหลังรับช่วงที่ 15.400s ควรรายงานอย่างไร",
        "options": [
          "Convergence เท่ากับ 15.400s เสมอ",
          "กลับมาให้บริการประมาณ 3.400s พร้อมระบุ probe interval และจุดวัด",
          "Convergence เท่ากับ 1s เพราะเป็น VRRP",
          "สรุปได้ว่าไม่มีแพ็กเก็ตสูญหาย"
        ],
        "answer": 1,
        "explanation": "ลบ 15.400−12.000=3.400s แต่ความละเอียดการวัดขึ้นกับ probe และตำแหน่ง capture ต้องแยกจากการเปลี่ยนบทบาท control plane",
        "level": "วิเคราะห์"
      }
    ],
    "sources": [
      {
        "title": "Cisco: HSRP Version2",
        "url": "https://www.cisco.com/c/en/us/td/docs/ios-xml/ios/ipapp_fhrp/configuration/xe-16/fhp-xe-16-book/fhp-hsrp-v2.html"
      },
      {
        "title": "RFC3768: VRRPv2 ตามคำศัพท์และ Timer ในแลป",
        "url": "https://www.rfc-editor.org/rfc/rfc3768.html"
      },
      {
        "title": "RFC5798: VRRPv3",
        "url": "https://www.rfc-editor.org/rfc/rfc5798.html"
      },
      {
        "title": "Cisco: Configuring HSRP",
        "url": "https://www.cisco.com/c/en/us/td/docs/routers/ios-xe/network-services/network-services/m_fhp-hsrp-0.html"
      },
      {
        "title": "Cisco: GLBP",
        "url": "https://www.cisco.com/en/US/docs/ios/12_2t/12_2t15/feature/guide/ft_glbp.html"
      }
    ],
    "labs": [
      {
        "title": "ตั้ง HSRPv2 บน R1 และ R2",
        "body": [
          "**เตรียมวง HSRP:** ใช้ 192.168.10.0/24; R1 และ R2 ต่อ Gi0/1 เข้าสวิตช์ใน VLAN เดียวกัน",
          "**ตั้ง client:** กำหนด default gateway เป็น Virtual IP 192.168.10.1",
          "**ตั้งและตรวจบทบาท:** ทำบล็อกแยกตามชื่อ R1/R2 แล้วตรวจ Active, Standby และ Virtual IP"
        ],
        "steps": [
          {
            "device": "R1 · Cisco IOS",
            "code": "configure terminal\ninterface gi0/1\n ip address 192.168.10.2 255.255.255.0\n no shutdown\n standby version 2\n standby 1 ip 192.168.10.1\n standby 1 priority 110\n standby 1 preempt\n standby 1 timers 1 4\nend\nshow standby brief"
          },
          {
            "device": "R2 · Cisco IOS",
            "code": "configure terminal\ninterface gi0/1\n ip address 192.168.10.3 255.255.255.0\n no shutdown\n standby version 2\n standby 1 ip 192.168.10.1\n standby 1 priority 100\n standby 1 preempt\n standby 1 timers 1 4\nend\nshow standby brief"
          }
        ],
        "example": {
          "title": "ตรวจผลและอธิบาย",
          "body": [
            "R1 ควรแสดง Active และ R2 แสดง Standby ตรวจ group 1, virtual IP และ P ซึ่งหมายถึงเปิด preempt ค่า 1 และ 4 คือ Hello และ Hold หน่วยวินาที HSRPv2 ใช้ UDP 1985 ไป 224.0.0.102",
            "ตัวอย่างจากสไลด์เรื่อง tracking ใช้คนละ group กับ Part A หากใช้ HSRP group 10 บน Gi0/0/0.10 ที่ priority 120 ให้สร้าง track 1 interface GigabitEthernet0/0/1 line-protocol ใน global config แล้วใส่ standby 10 track 1 decrement 30 ใน sub-interface เมื่อ uplink down ให้เทียบ priority 90 กับเครื่องสำรอง 100 ใน show standby"
          ]
        }
      },
      {
        "title": "ตั้ง VRRP บน R1 และ R2",
        "body": [
          "**เตรียมวง VRRP:** ใช้ 192.168.20.0/24; R1 และ R2 ต่อ Gi0/1 เข้าสวิตช์ใน VLAN เดียวกัน",
          "**ตั้ง client:** กำหนด default gateway เป็น Virtual IP 192.168.20.1",
          "**ตั้งและตรวจบทบาท:** ทำบล็อกแยกตามชื่อ R1/R2 แล้วตรวจ Master, Backup และ Virtual IP"
        ],
        "steps": [
          {
            "device": "R1 · Cisco IOS",
            "code": "configure terminal\ninterface gi0/1\n ip address 192.168.20.2 255.255.255.0\n no shutdown\n vrrp 1 ip 192.168.20.1\n vrrp 1 priority 110\n vrrp 1 preempt\n vrrp 1 timers advertise 1\nend\nshow vrrp brief"
          },
          {
            "device": "R2 · Cisco IOS",
            "code": "configure terminal\ninterface gi0/1\n ip address 192.168.20.3 255.255.255.0\n no shutdown\n vrrp 1 ip 192.168.20.1\n vrrp 1 priority 100\n vrrp 1 preempt\n vrrp 1 timers advertise 1\nend\nshow vrrp brief"
          }
        ],
        "example": {
          "title": "ตรวจผลและอธิบาย",
          "body": [
            "R1 ควรเป็น Master ตามคำเรียกในชีท และ R2 เป็น Backup ค่า 1 วินาทีคือ advertisement interval เมื่อ priority ของ Backup เป็น 100 สูตร Master Down ของ VRRPv2 คือ 3 × 1 + (256 − 100)/256 ≈ 3.61 วินาที ใช้ Wireshark filter vrrp ดู advertisement ไป 224.0.0.18"
          ]
        }
      },
      {
        "title": "ตั้ง GLBP บน R1 และ R2",
        "body": [
          "**เตรียมวง GLBP:** ใช้ 192.168.30.0/24; R1 และ R2 ต่อ Gi0/1 เข้าสวิตช์ใน VLAN เดียวกัน",
          "**ตั้ง client:** กำหนด default gateway เป็น Virtual IP 192.168.30.1",
          "**ตั้งและตรวจบทบาท:** ทำบล็อกแยกตามชื่อ R1/R2 แล้วตรวจ AVG และ AVF ตามคำสั่งด้านล่าง"
        ],
        "steps": [
          {
            "device": "R1 · Cisco IOS",
            "code": "configure terminal\ninterface gi0/1\n ip address 192.168.30.2 255.255.255.0\n no shutdown\n glbp 1 ip 192.168.30.1\n glbp 1 priority 110\n glbp 1 preempt\n glbp 1 load-balancing round-robin\nend\nshow glbp brief"
          },
          {
            "device": "R2 · Cisco IOS",
            "code": "configure terminal\ninterface gi0/1\n ip address 192.168.30.3 255.255.255.0\n no shutdown\n glbp 1 ip 192.168.30.1\n glbp 1 priority 100\n glbp 1 preempt\n glbp 1 load-balancing round-robin\nend\nshow glbp brief"
          }
        ],
        "example": {
          "title": "ตรวจผลและอธิบาย",
          "body": [
            "R1 ควรเป็น AVG ดูบรรทัด group เทียบกับบรรทัด Fwd ของแต่ละ AVF ใช้ client สองเครื่องล้าง ARP ของ VIP แล้ว ping VIP และดู ip neigh จับคู่ virtual MAC กับ show glbp ก่อนทดลองเปลี่ยน load-balancing เป็น weighted หรือ host-dependent ทั้งสอง router สำหรับ weighted ให้พิจารณาค่า weighting ของแต่ละเครื่องด้วย"
          ]
        }
      },
      {
        "title": "วัด failover จาก ping, บทบาท และไฟล์ capture",
        "body": [
          "**สร้าง data traffic:** ให้ PC ping ปลายทางที่อยู่หลัง router ต่อเนื่อง เพื่อทดสอบ forwarding ผ่าน HSRP gateway",
          "**จับแพ็กเก็ต:** ให้ Kali ที่ต่อพอร์ต mirror เริ่มบันทึกก่อนตัด Gi0/1 ของ R1",
          "**วัดการรับช่วง:** เทียบ packet loss, บทบาท router และเวลาใน capture จากนั้นคืนลิงก์"
        ],
        "steps": [
          {
            "device": "Kali · บันทึก pcap",
            "code": "sudo tcpdump -ni eth0 -w hsrp-failover.pcap 'udp port 1985 or icmp or arp'"
          },
          {
            "device": "PC ฝั่ง LAN · อีกหน้าต่างหนึ่ง ทดสอบการเข้าถึง VIP",
            "code": "ping -i 0.2 192.168.10.1"
          },
          {
            "device": "R1 · ทดสอบเมื่อระบบพร้อม",
            "code": "configure terminal\ninterface gi0/1\n shutdown\nend"
          },
          {
            "device": "R2 · ระหว่างขัดข้อง",
            "code": "show standby brief"
          }
        ],
        "example": {
          "title": "ตรวจผลและอธิบาย",
          "body": [
            "จดเวลาของ Echo Reply สุดท้ายก่อนขาดและ Reply แรกหลังกลับมา ตัวอย่าง 12.0 ถึง 15.2 วินาทีมีช่วงห่าง 3.2 วินาที ค่านี้รวมช่วงส่ง ping และอาจต่างจากเวลาสลับบทบาท ดู sequence ที่หายและ Hello ประกอบ แล้วคืน Gi0/1 ของ R1 ด้วย no shutdown",
            "ทำซ้ำในวงของ VRRP โดยใช้ ip proto 112 และ show vrrp brief ส่วน GLBP ใช้ udp port 3222 และ show glbp brief ตรวจทั้ง AVG, AVF และ client ที่ได้รับผล บันทึกผลก่อนล้ม ระหว่างล้ม และหลังคืนลิงก์"
          ]
        }
      }
    ],
    "courseFiles": [
      "Default Gateway คือจุดเปราะบางของเครือข่าย.pdf · HSRP, VRRP, GLBP และ failover",
      "Lab Sheet  Gateway Redundancy — HSRP   VRRP   GLBP_260826_142251.pdf · Part A",
      "Lab_Sheet__Gateway_Redundancy VRRP(1).pdf และ Assignment/Lab_Sheet__Gateway_Redundancy VRRP.pdf · Part B",
      "Lab_Sheet__Gateway_RedundancyGLBP_1.pdf และฉบับ DOCX ใน lab · Part C",
      "มาตรฐานและเทคโนโลยีเครือข่าย (2).pdf · หน้า 28–34"
    ]
  },
  {
    "id": 7,
    "title": "802.1X เครื่องมือสำรวจ และการวิเคราะห์แพ็กเก็ต",
    "shortTitle": "Security / Packet Analysis",
    "subtitle": "เชื่อมมาตรฐาน การยืนยันตัวตน และหลักฐานจากแพ็กเก็ตเข้ากับการแก้ปัญหาแลป",
    "minutes": 30,
    "objectives": [
      "แยกมาตรฐาน 802.3,802.1Q,802.1X และบทบาทการยืนยันตัวตน",
      "เลือก Nmap, arp-scan, traceroute และ Wireshark ให้ตรงงาน",
      "เขียน display filter สำหรับโปรโตคอลที่ออกสอบ",
      "ไล่ปัญหาจาก IP ไป MAC และพอร์ตสวิตช์อย่างเป็นขั้นตอน"
    ],
    "sections": [
      {
        "title": "มาตรฐานที่ชื่อคล้ายกัน แต่ทำคนละหน้าที่",
        "body": [
          "IEEE 802.3 เกี่ยวข้องกับ Ethernet เช่นกลไก MAC และ Physical Layer ของ Ethernet",
          "ส่วน 802.1Q ใช้กับ bridged networks/VLAN tagging และ 802.1X ใช้ควบคุมการเข้าถึงเครือข่ายผ่านการยืนยันตัวตนที่พอร์ต",
          "จำด้วยคำถามที่แต่ละมาตรฐานตอบ: 802.3 ส่งข้อมูลบน Ethernet อย่างไร, 802.1Q เฟรมเป็นของ VLAN ใด, 802.1X ผู้เชื่อมต่อได้รับอนุญาตใช้เครือข่ายหรือยัง การใช้ VLAN อย่างเดียวไม่ได้ทดแทนการยืนยันตัวตน"
        ],
        "table": {
          "headers": [
            "มาตรฐาน",
            "คำสำคัญ",
            "ตัวอย่างในแลป"
          ],
          "rows": [
            [
              "IEEE 802.3",
              "Ethernet",
              "การสื่อสารผ่าน Ethernet interface"
            ],
            [
              "IEEE 802.1Q",
              "VLAN / Tagging",
              "เฟรม VLAN 10 วิ่งผ่าน trunk"
            ],
            [
              "IEEE 802.1X",
              "Port-based Access Control",
              "ตรวจสิทธิ์ก่อนยอมให้ Client ใช้เครือข่าย"
            ]
          ]
        },
        "pitfall": "802.1X ไม่ใช่มาตรฐานเข้ารหัส Wi-Fi และไม่ใช่ชื่ออื่นของ Port Security ที่จำกัด MAC"
      },
      {
        "title": "802.1X: ใครเป็นผู้ขอ ใครคุมประตู ใครตัดสิน",
        "body": [
          "**Supplicant:** ซอฟต์แวร์หรืออุปกรณ์ฝั่งผู้ใช้ที่ร้องขอเข้าเครือข่าย",
          "**Authenticator:** อุปกรณ์ที่ควบคุมการผ่านของพอร์ต เช่น สวิตช์หรือ Access Point",
          "**Authentication Server:** ตรวจข้อมูลยืนยันตัวตน โดยมักใช้ RADIUS",
          "ฝั่ง Client คุยกับ Authenticator ผ่าน EAP over LAN (EAPOL) แล้ว Authenticator ส่งข้อมูลไปให้ Server ผ่าน RADIUS ในรูปแบบใช้งานทั่วไป",
          "ก่อนผ่านการยืนยันตัวตน controlled port จะยังไม่อนุญาตทราฟฟิกปกติตามนโยบาย แต่ยังต้องเปิดทางสำหรับขั้นตอน authentication",
          "เมื่อ Server ยอมรับและอุปกรณ์นำผลไปใช้งาน พอร์ต/เซสชันจึงเข้าสู่สถานะ Authorized และอาจได้รับ VLAN หรือนโยบายเฉพาะผู้ใช้ตามระบบที่ตั้งไว้",
          "การปฏิเสธอาจนำไปสู่การบล็อกหรือ VLAN จำกัดสิทธิ์ตาม configuration"
        ],
        "diagram": "auth",
        "example": {
          "title": "เทียบกับการเข้าห้องแลป",
          "body": [
            "นักศึกษาที่แสดงบัตร = Supplicant, เครื่องอ่านบัตรและประตู = Authenticator, ฐานข้อมูลสิทธิ์นักศึกษา = Authentication Server",
            "ประตูช่วยคุมการเข้า แต่ผู้ตรวจสิทธิ์จริงในแบบนี้คือ Server จึงต้องตรวจทั้งการสื่อสาร Client–Switch และ Switch–Server"
          ]
        }
      },
      {
        "title": "เลือกเครื่องมือให้ตรงคำถาม",
        "body": [
          "**Nmap** ใช้สำรวจว่า host ใดตอบสนอง และบริการ/port ใดเปิดอยู่ โดยเลือกโหมดให้ตรงเป้าหมาย",
          "ส่วน arp-scan ใช้ ARP สำรวจ IP/MAC บนเครือข่าย Ethernet ที่เข้าถึงระดับ Layer 2 ได้ ARP ไม่ถูกเราเตอร์ส่งต่อข้าม subnet แบบปกติ",
          "**traceroute** เพิ่มค่า TTL ทีละขั้นเพื่อเห็นเราเตอร์ตามเส้นทางจากคำตอบ ICMP Time Exceeded และผลตอบกลับปลายทางตามชนิด probe ของเครื่องมือ",
          "ส่วน Windows ใช้คำสั่ง tracert โดยทั่วไป หากเห็น * อาจเป็นเพราะไม่ตอบ probe หรือถูกกรอง ไม่ได้ยืนยันว่าทราฟฟิกทุกชนิดผ่านไม่ได้",
          "**Wireshark** จับแพ็กเก็ตที่จุดจับมองเห็นแล้วถอดรหัส protocol ให้ตรวจลำดับเหตุการณ์",
          "ใน switched LAN เครื่องจับไม่ได้เห็น unicast ของทุกเครื่องอัตโนมัติ หากต้องดูพอร์ตอื่นอาจต้องใช้ SPAN/mirror ตาม topology ของแลป"
        ],
        "table": {
          "headers": [
            "คำถาม",
            "เครื่องมือ",
            "สิ่งที่ต้องระวังตอนแปลผล"
          ],
          "rows": [
            [
              "มี host ใดตอบบ้าง",
              "Nmap -sn",
              "ไม่ตอบไม่เท่ากับไม่มี host เสมอ"
            ],
            [
              "IP นี้ใช้ MAC อะไรบน LAN",
              "arp-scan / ARP table",
              "ขอบเขต Layer 2"
            ],
            [
              "ไปปลายทางผ่าน hop ใด",
              "traceroute / tracert",
              "ทางกลับและการกรองมีผล"
            ],
            [
              "เกิดแพ็กเก็ตอะไรขึ้นจริง",
              "Wireshark",
              "ต้องจับในจุดที่เห็นทราฟฟิก"
            ]
          ]
        },
        "code": "# ใช้กับเครือข่ายทดลองที่ได้รับอนุญาต\nnmap -sn 192.168.10.0/24\nnmap -sV -p 22,80,443 192.168.10.20\nsudo arp-scan --localnet\ntraceroute 192.168.20.20\n# Windows\ntracert 192.168.20.20"
      },
      {
        "title": "Capture Filter กับ Display Filter: ใช้คนละภาษา",
        "body": [
          "**Capture Filter** คัดว่าจะเก็บแพ็กเก็ตใดตั้งแต่ตอนจับ ใช้ไวยากรณ์ตระกูล BPF เช่น udp port 1985 แพ็กเก็ตที่ถูกตัดออกไม่ได้อยู่ในไฟล์ capture จึงเรียกกลับมาด้วยการล้าง display filter ไม่ได้",
          "**Display Filter** ใช้เลือกว่าจะแสดงแพ็กเก็ตใดจากข้อมูลที่จับมาแล้ว เช่น udp.port == 1985 การกรองนี้ไม่ลบแพ็กเก็ตต้นฉบับ เมื่อล้าง filter จะกลับมาเห็นรายการเดิมได้",
          "อ่าน Layer ให้ถูก: OSPF/VRRP ใช้ ip.proto ส่วน HSRP ใช้ udp.port ตัวกรองชื่อ protocol เช่น ospf, hsrp, vrrp อ่านง่ายเมื่อ Wireshark ถอดรหัส protocol นั้นได้"
        ],
        "table": {
          "headers": [
            "ต้องการดู",
            "Display Filter",
            "Capture Filter ตัวอย่าง"
          ],
          "rows": [
            [
              "OSPF สำหรับ IPv4",
              "ospf หรือ ip.proto == 89",
              "ip proto 89"
            ],
            [
              "EIGRP สำหรับ IPv4",
              "eigrp หรือ ip.proto == 88",
              "ip proto 88"
            ],
            [
              "HSRP สำหรับ IPv4",
              "hsrp หรือ udp.port == 1985",
              "udp port 1985"
            ],
            [
              "VRRP สำหรับ IPv4",
              "vrrp หรือ ip.proto == 112",
              "ip proto 112"
            ],
            [
              "IP 192.168.10.10",
              "ip.addr == 192.168.10.10",
              "host 192.168.10.10"
            ],
            [
              "EAP over LAN",
              "eapol",
              "ether proto 0x888e"
            ]
          ]
        },
        "code": "# Display filter: ดู OSPF หรือ EIGRP\nip.proto == 89 || ip.proto == 88\n\n# Display filter: ICMP ของ Client ที่ระบุ\nicmp && ip.addr == 192.168.10.10",
        "pitfall": "udp port 1985 ใช้เป็น Capture Filter ส่วน udp.port == 1985 ใช้เป็น Display Filter อย่าสลับช่อง"
      },
      {
        "title": "ตามหาเครื่องจาก IP → MAC → Switch Port",
        "body": [
          "**ขั้นที่ 1:** เริ่มจาก IP ของเครื่องปลายทาง แล้วดู ARP/Neighbor Table ของอุปกรณ์ที่อยู่ subnet เดียวกัน เพื่อหา MAC จากนั้นค้น MAC Address Table ของสวิตช์เพื่อทราบ VLAN และพอร์ตที่เรียนรู้ MAC นั้น",
          "**ขั้นที่ 2:** ถ้าพอร์ตที่พบเป็น trunk/uplink แปลว่าเครื่องอาจอยู่หลังสวิตช์อีกตัว ต้องตาม topology ไปทีละตัวโดยใช้ข้อมูล CDP/LLDP และตรวจ MAC ต่อ จนพบ access port แล้วเช็ก VLAN, link, port security และ authentication ของพอร์ตนั้น",
          "**ขั้นที่ 3:** **MAC Address** Table ตอบว่า MAC อยู่ทางไหน ไม่ได้พิสูจน์ว่า IP ถูกต้องหรือมีเส้นทางข้าม VLAN ครบ จึงต้องดู IP/mask/gateway ของ PC, VLAN/trunk, SVI/routing และเส้นทางขากลับประกอบ"
        ],
        "code": "show ip arp\nshow mac address-table address aaaa.bbbb.cccc\nshow interfaces status\nshow interfaces switchport\nshow vlan brief\nshow interfaces trunk\nshow cdp neighbors\nshow port-security interface FastEthernet0/1",
        "example": {
          "title": "PC2 ต่อสายแล้วแต่เข้าเครือข่ายไม่ได้",
          "body": [
            "ตรวจไฟลิงก์และสถานะพอร์ต → ดูว่าเป็น access VLAN ที่ต้องการ → ตรวจว่า MAC เรียนรู้ที่พอร์ตนั้น → เช็กสถานะ 802.1X/Port Security",
            "เมื่อผ่าน Layer 2 แล้วจึงตรวจ IP/mask/default gateway และลอง ping gateway ก่อนออกไปปลายทาง"
          ]
        }
      },
      {
        "title": "ฝึกอ่านหลักฐาน: Authentication ล้มเหลวตรงไหน",
        "body": [
          "จากภาพ PC ต้องส่ง EAPOL ถึง Switch และ Switch ต้องติดต่อ RADIUS Server ได้ หาก PC ส่ง EAPOL แต่ไม่ได้รับการเดินกระบวนการต่อ ให้ตรวจ supplicant, port configuration และสถานะ authentication ฝั่ง Switch",
          "ถ้า Switch ส่ง RADIUS request แต่ไม่เห็น response ให้ตรวจเส้นทางไป Server, shared secret, policy และ log ฝั่ง Server ก่อนสรุปว่ารหัสผู้ใช้ผิด การตรวจรหัสต้องแยกจากการที่ข้อความไปไม่ถึง",
          "ทำรายงานแลปให้มีคำถาม สมมติฐาน หลักฐาน และข้อสรุป เช่น ‘คาดว่า VLAN ผิด เพราะ MAC อยู่พอร์ตถูกแต่ show interfaces switchport แสดง Access VLAN 20 แทน 10’ จะชัดกว่าการเปลี่ยนหลายอย่างพร้อมกัน"
        ],
        "diagram": "auth",
        "pitfall": "ไม่มีแพ็กเก็ตในหน้าจออาจเกิดจาก filter ผิดหรือจับผิด interface ก่อนสรุปว่าอุปกรณ์ไม่ส่ง ให้ล้าง filter และยืนยันจุด capture"
      },
      {
        "title": "เมื่อผลจาก arp-scan, nmap และตาราง MAC มีจำนวนต่างกัน",
        "body": [
          "arp-scan ถามหา IP ผ่าน ARP ภายใน broadcast domain เดียวกัน สวิตช์เก็บเฉพาะ source MAC ของเฟรมที่มาถึงพอร์ตของมัน",
          "ส่วน nmap -sn ตรวจ host discovery ซึ่งการตอบขึ้นกับทางเดินและการกรอง ความต่างของจำนวนรายการจึงต้องอธิบายด้วย VLAN, ตำแหน่งเครื่องมือ และเวลาที่เก็บ",
          "802.1X ควบคุมการเปิดสิทธิ์บนพอร์ต supplicant ส่ง EAPOL ไป authenticator และ authenticator ติดต่อ authentication server ซึ่งมักใช้ RADIUS ถ้าทดสอบการยืนยันตัวตนให้จับ eapol ที่ฝั่งผู้ใช้ ส่วนการหา VLAN tag ต้องเลือกจุดจับที่มองเห็น trunk"
        ]
      }
    ],
    "summary": [
      "802.3=Ethernet,802.1Q=VLAN,802.1X=ยืนยันตัวตนเพื่อควบคุมการเข้าเครือข่าย",
      "Supplicant ขอเข้า → Authenticator คุมพอร์ต → Authentication Server ตรวจสิทธิ์",
      "Nmap สำรวจ host/บริการ; arp-scan หา IP/MAC ใน LAN; traceroute ดู hop; Wireshark ดูแพ็กเก็ต",
      "Capture Filter คัดก่อนเก็บ ส่วน Display Filter ซ่อน/แสดงของที่เก็บแล้ว",
      "OSPF89/EIGRP88/VRRP112 เป็น IP Protocol; HSRP1985 เป็น UDP Port",
      "ไล่ปัญหา IP→ARP/MAC→Switch Port→VLAN/Trunk→Gateway/Routing"
    ],
    "questions": [
      {
        "id": "7-01",
        "prompt": "IEEE 802.1X มีหน้าที่หลักข้อใด",
        "options": [
          "ควบคุมการเข้าถึงเครือข่ายด้วยการยืนยันตัวตนที่พอร์ต",
          "ติด VLAN tag ให้ทุกเฟรม",
          "คำนวณเส้นทางด้วย Cost",
          "เลือก HSRP Active"
        ],
        "answer": 0,
        "explanation": "802.1X เป็น Port-Based Network Access Control ส่วน VLAN tagging เกี่ยวข้องกับ 802.1Q",
        "level": "พื้นฐาน"
      },
      {
        "id": "7-02",
        "prompt": "จากภาพ PC ที่ร้องขอเข้าเครือข่ายมีบทบาทใด",
        "options": [
          "Authenticator",
          "Supplicant",
          "Authentication Server",
          "Designated Router"
        ],
        "answer": 1,
        "explanation": "Supplicant อยู่ฝั่งผู้ใช้และร้องขอ authentication; Switch คุมพอร์ต ส่วน Server ตรวจข้อมูลสิทธิ์",
        "level": "พื้นฐาน",
        "diagram": "auth"
      },
      {
        "id": "7-03",
        "prompt": "จากภาพ อุปกรณ์ใดคุมการผ่านทราฟฟิกของพอร์ตตามผลยืนยันตัวตน",
        "options": [
          "PC ในบทบาท RADIUS Server",
          "Router ที่เป็น OSPF DR",
          "Switch ในบทบาท Authenticator",
          "ARP Table ของผู้ใช้"
        ],
        "answer": 2,
        "explanation": "Authenticator เช่น Switch บังคับใช้ผลการยืนยันตัวตนที่พอร์ต โดย Authentication Server เป็นผู้ตรวจ credentials ตามแบบที่แสดง",
        "level": "ประยุกต์",
        "diagram": "auth"
      },
      {
        "id": "7-04",
        "prompt": "ระหว่าง Supplicant กับ Authenticator ใช้สิ่งใดขนส่ง EAP บน LAN",
        "options": [
          "OSPF Hello",
          "VTP Advertisement",
          "HSRP Coup",
          "EAPOL"
        ],
        "answer": 3,
        "explanation": "EAPOL ย่อจาก EAP over LAN ส่วนการสื่อสารจาก Authenticator ไป Server มักใช้ RADIUS",
        "level": "พื้นฐาน"
      },
      {
        "id": "7-05",
        "prompt": "ต้องการสำรวจ host ในวงแลปโดยไม่ทำ port scan ตามหลัง เลือกคำสั่งใด",
        "options": [
          "nmap -sn 192.168.10.0/24",
          "nmap -sV -p 22 192.168.10.20",
          "tracert 192.168.10.1",
          "show vlan brief"
        ],
        "answer": 0,
        "explanation": "-sn ทำ Host Discovery โดยข้ามขั้น Port Scan ไม่ได้หมายความว่าทุก host จะตอบ probes เสมอ",
        "level": "ประยุกต์"
      },
      {
        "id": "7-06",
        "prompt": "ต้องการหา IP/MAC ของเครื่องใน Layer 2 LAN ที่ต่ออยู่ เครื่องมือใดตรงงานที่สุด",
        "options": [
          "OSPF SPF",
          "arp-scan",
          "HSRP Preempt",
          "VTP Pruning"
        ],
        "answer": 1,
        "explanation": "arp-scan ใช้ ARP บน LAN เพื่อค้น IP/MAC โดย ARP ไม่ถูก route ข้าม subnet ปกติ",
        "level": "ประยุกต์"
      },
      {
        "id": "7-07",
        "prompt": "traceroute แสดง * ที่หนึ่ง hop แต่ถึงปลายทางได้ ควรตีความอย่างไร",
        "options": [
          "เราเตอร์ทุกตัวหลัง hop นั้นเสียแน่นอน",
          "ต้องมี STP Loop แน่นอน",
          "hop นั้นอาจไม่ตอบหรือถูกกรอง probe แต่เส้นทางยังส่งต่อได้",
          "ปลายทางไม่มี IP Address"
        ],
        "answer": 2,
        "explanation": "การไม่ตอบ probe ไม่เท่ากับส่งต่อข้อมูลไม่ได้ ดูผลของ hop ถัดไปและปลายทางร่วมกัน",
        "level": "วิเคราะห์"
      },
      {
        "id": "7-08",
        "prompt": "Capture Filter ต่างจาก Display Filter อย่างไร",
        "options": [
          "ทั้งคู่ลบแพ็กเก็ตต้นฉบับเหมือนกัน",
          "Display Filter เลือกก่อนการจับเสมอ",
          "Capture Filter ใช้ได้เฉพาะ TCP",
          "Capture Filter คัดก่อนเก็บ ส่วน Display Filter เลือกแสดงจากแพ็กเก็ตที่เก็บแล้ว"
        ],
        "answer": 3,
        "explanation": "สองชนิดทำงานต่างช่วงและใช้ไวยากรณ์ต่างกัน แพ็กเก็ตที่ไม่ถูกจับไม่มีให้แสดงย้อนหลัง",
        "level": "พื้นฐาน"
      },
      {
        "id": "7-09",
        "prompt": "ข้อใดเป็น Wireshark Display Filter สำหรับ HSRP IPv4",
        "options": [
          "udp.port == 1985",
          "udp port 1985",
          "tcp.port == 1985",
          "ip.proto == 1985"
        ],
        "answer": 0,
        "explanation": "HSRP IPv4 ใช้ UDP 1985 และรูปแบบชื่อฟิลด์ udp.port เป็นภาษา Display Filter ส่วน udp port 1985 เป็น Capture Filter",
        "level": "ประยุกต์"
      },
      {
        "id": "7-10",
        "prompt": "ต้องการแสดง VRRP IPv4 เลือก filter ใด",
        "options": [
          "udp.port == 112",
          "ip.proto == 112",
          "tcp.port == 112",
          "ip.addr == 112"
        ],
        "answer": 1,
        "explanation": "VRRP อยู่ใน IP Protocol 112 โดยตรง ไม่ได้ใช้ TCP/UDP port 112",
        "level": "ประยุกต์"
      },
      {
        "id": "7-11",
        "prompt": "ต้องการแสดงแพ็กเก็ต OSPF หรือ EIGRP สำหรับ IPv4 เลือกข้อใด",
        "options": [
          "ip.proto == 89 && ip.proto == 88",
          "udp.port == 89 || udp.port == 88",
          "ip.proto == 89 || ip.proto == 88",
          "vlan.id == 89 || vlan.id == 88"
        ],
        "answer": 2,
        "explanation": "OR (||) ยอมรับเมื่อเป็นอย่างใดอย่างหนึ่ง ส่วนฟิลด์ protocol เดียวไม่สามารถเท่ากับ 88 และ 89 พร้อมกัน",
        "level": "ประยุกต์"
      },
      {
        "id": "7-12",
        "prompt": "ใช้ Display Filter ซ่อนแพ็กเก็ตจำนวนมาก แล้วต้องการเห็นทั้งหมดอีกครั้งควรทำอย่างไร",
        "options": [
          "ต้องจับข้อมูลใหม่ทุกครั้ง",
          "รีเซ็ต Switch ทุกตัว",
          "กู้ไฟล์จากถังขยะ",
          "ล้าง Display Filter"
        ],
        "answer": 3,
        "explanation": "Display Filter เปลี่ยนเฉพาะรายการที่แสดง แพ็กเก็ตยังอยู่ใน capture file จึงล้าง filter เพื่อดูทั้งหมดได้",
        "level": "ประยุกต์"
      },
      {
        "id": "7-13",
        "prompt": "ทราบ IP ของ PC แล้ว ต้องการหาพอร์ตที่เสียบ ควรเชื่อมข้อมูลใด",
        "options": [
          "ARP Table หา MAC แล้ว MAC Address Table หา VLAN/Port",
          "OSPF Router ID แล้ว DHCP Lease ของอินเทอร์เน็ต",
          "HSRP Priority แล้ว VTP Revision",
          "จำนวน hop แล้วเลข VLAN เท่ากับ IP"
        ],
        "answer": 0,
        "explanation": "ARP เชื่อม IP↔MAC ส่วน Switch MAC Table เชื่อม VLAN/MAC↔Port ถ้าพบ trunk ให้ตามไปยังสวิตช์ถัดไป",
        "level": "ประยุกต์"
      },
      {
        "id": "7-14",
        "prompt": "ค้น MAC แล้วพบว่ามาจาก trunk uplink ควรทำอย่างไรต่อ",
        "options": [
          "สรุปว่าเครื่องผู้ใช้เสียบ trunk โดยตรงแน่นอน",
          "ตามสวิตช์เพื่อนบ้านแล้วค้น MAC ต่อจนพบ access port",
          "ลบ MAC Table ทุกเครื่องทันที",
          "เปลี่ยน Gateway ของผู้ใช้เป็น trunk"
        ],
        "answer": 1,
        "explanation": "MAC ที่เรียนรู้บน uplink อาจมาจากเครื่องหลังสวิตช์ตัวอื่น ต้องอาศัย topology/CDP/LLDP ประกอบ",
        "level": "วิเคราะห์"
      },
      {
        "id": "7-15",
        "prompt": "Switch ส่ง RADIUS request แล้วไม่เห็น response ข้อสรุปใดรอบคอบที่สุด",
        "options": [
          "รหัสผ่านผิดแน่นอนทุกกรณี",
          "802.1X ไม่ต้องใช้ Server จึงละเลยได้",
          "ตรวจเส้นทาง Server การตั้งค่า RADIUS และ log ก่อนสรุปว่ารหัสผู้ใช้ผิด",
          "ต้องเปลี่ยนไปใช้ TCP 1985"
        ],
        "answer": 2,
        "explanation": "การสื่อสารถึง Server และผลตรวจ credentials เป็นคนละขั้น ไม่มี response อาจเกิดจาก routing, filtering, secret/config หรือ Server ไม่พร้อม",
        "level": "วิเคราะห์"
      }
    ],
    "sources": [
      {
        "title": "Cisco: 802.1X Port-Based Authentication",
        "url": "https://www.cisco.com/c/en/us/td/docs/iosxr/ncs5500/security/26xx/configuration/guide/b-system-security-cg-ncs5500-26xx/ieee-802-1-x-port-based-authentication.html"
      },
      {
        "title": "Wireshark: Display Filtering",
        "url": "https://www.wireshark.org/docs/wsug_html_chunked/ChWorkDisplayFilterSection.html"
      },
      {
        "title": "Wireshark: Capture Filters",
        "url": "https://wiki.wireshark.org/captureFilters"
      },
      {
        "title": "Nmap: Host Discovery",
        "url": "https://nmap.org/book/man-host-discovery.html"
      }
    ],
    "labs": [
      {
        "title": "ระบุ IP → MAC → พอร์ต และพิสูจน์ขอบเขต ARP",
        "body": [
          "**เตรียมวงสัปดาห์ที่ 1:** ใช้ Kali-1, Kali-2 และ Kali-3 ตามผัง",
          "**เริ่ม capture ก่อน:** เปิดหน้าต่างจับแพ็กเก็ตบน Kali-2 และ Kali-3",
          "**สร้าง ARP:** ให้ Kali-1 ping IP ที่ไม่มีเครื่องใช้งาน แล้วเทียบผลกับตาราง MAC"
        ],
        "steps": [
          {
            "device": "Kali-2 / Kali-3 · จับ ARP",
            "code": "sudo tcpdump -i eth0 -nn arp"
          },
          {
            "device": "Kali-1 · สำรวจวงที่กำลังทำแลบ",
            "code": "ip addr show\nping -c 2 192.168.1.99\nsudo arp-scan --interface=eth0 --localnet\nsudo nmap -sn 192.168.1.0/24\nip neigh"
          },
          {
            "device": "SW1 · เทียบ MAC จาก Kali กับพอร์ต",
            "code": "show mac address-table dynamic\nshow interfaces status\nshow cdp neighbors"
          }
        ],
        "example": {
          "title": "ตรวจผลและอธิบาย",
          "body": [
            "จับคู่ IP กับ MAC จาก ARP แล้วค้น MAC ในตารางของ SW1 ถ้ารายการชี้ไป trunk ให้ตามไปเช็ก switch ถัดไป ควรเห็น ARP Request ที่เครื่องอื่นใน VLAN เดียวกันแม้ไม่มี ARP Reply จาก .99"
          ]
        }
      },
      {
        "title": "ตรวจ Web Server และแท็กจากแลบ ROAS",
        "body": [
          "**ตรวจจาก VLAN 99:** บน Kali ตรวจ Web-Svr 192.168.20.10 ตามคำสั่งของแลป",
          "**ทดสอบสิทธิ์ Staff:** ย้ายจุดกำเนิดการทดสอบไปยัง PC-Staff ใน VLAN 10 เพื่อให้ผ่าน ACL ขาเข้าที่ตั้งไว้",
          "**ดู VLAN tag:** จับจากจุดที่มองเห็น trunk และคง tag ตามวิธีด้านล่าง"
        ],
        "steps": [
          {
            "device": "Kali · ดูเส้นทางและบริการ",
            "code": "fping -a -g 192.168.10.0/24\nfping -a -g 192.168.20.0/24\nsudo nmap -sS -p 21,22,23,80,443,3389 192.168.20.10\ntraceroute -n 192.168.20.10"
          },
          {
            "device": "Kali · รับสำเนา trunk ที่คง VLAN tag",
            "code": "sudo tshark -i eth0 -Y vlan -T fields -e frame.number -e vlan.id -e ip.src -e ip.dst"
          }
        ],
        "example": {
          "title": "ตรวจผลและอธิบาย",
          "body": [
            "สถานะ open แปลว่าบริการรับการเชื่อมต่อ closed แปลว่าปลายทางตอบว่าพอร์ตปิด",
            "ส่วน filtered หมายถึงเครื่องมือบอกสถานะพอร์ตไม่ได้เนื่องจากการกรองหรือไม่ได้รับคำตอบ จาก access port ปกติมักไม่เห็นแท็ก หากไม่มี vlan.id ให้ตรวจ source ของ SPAN การคง tag และจุดจับก่อนสรุปว่า trunk เสีย"
          ]
        }
      },
      {
        "title": "จับ control plane ให้ถูก segment",
        "body": [
          "**จับ OSPF:** Kali ที่ต่อ SW3 ในวง R2–R3 มองเห็น OSPF บน segment นี้",
          "**จับ EIGRP:** โปรโตคอลอยู่ลิงก์ R1–R2; ใช้ mirror ที่ SW2 มายัง Kali ตามผัง",
          "**ระบุหลักฐาน:** บันทึกตำแหน่ง sensor คู่กับชื่อไฟล์ capture เสมอ"
        ],
        "steps": [
          {
            "device": "Kali · ตรวจ interface แล้วเริ่มจับ",
            "code": "ip -br addr\nsudo tcpdump -ni eth0 'ip proto 88 or ip proto 89' -w routing_control.pcap"
          },
          {
            "device": "Wireshark · Display filter เมื่อเปิดไฟล์",
            "code": "ip.proto == 88 || ip.proto == 89"
          }
        ],
        "example": {
          "title": "ตรวจผลและอธิบาย",
          "body": [
            "หา Hello และบันทึก source, destination และเวลา เมื่อเปลี่ยน topology ค่อยหา EIGRP Query/Reply หรือ OSPF LS Update ตามเหตุการณ์ หมายเลข 88 และ 89 เป็นค่าใน IP header การกรองด้วย tcp.port จะหาแพ็กเก็ตเหล่านี้ไม่พบ"
          ]
        }
      }
    ],
    "courseFiles": [
      "week1_lab_sheet (1).pdf · MAC learning, ARP และ Kali Network Discovery",
      "lab/advanced_inter_vlan_lab_sheet.pdf · ข้อ 4 การตรวจ ACL และ VLAN tag",
      "สรุปเนื้อหาข้อสอบปลายภาค_Internetworking_2569.pdf · หน้า 4",
      "lab/---------------_Advanced_Routing_WAN_3Routers.docx.pdf · หน้า 7–8"
    ]
  },
  {
    "id": 8,
    "title": "WAN, PPP, MPLS, VPN และรูปแบบการเชื่อมต่อ",
    "shortTitle": "WAN / VPN",
    "subtitle": "เลือกวิธีเชื่อมสาขา แยกเรื่องส่งต่อข้อมูล ยืนยันตัวตน และเข้ารหัสให้ชัด",
    "minutes": 30,
    "objectives": [
      "แยกหน้าที่ LCP, NCP และ CHAP ใน PPP",
      "อธิบาย MPLS Label และข้อจำกัดเรื่อง Encryption",
      "เลือก Remote-Access หรือ Site-to-Site VPN ตามผู้ใช้งาน",
      "เปรียบเทียบ Hub-and-Spoke, Partial Mesh และ Full Mesh พร้อมนับลิงก์"
    ],
    "sections": [
      {
        "title": "WAN เชื่อมเครือข่ายที่อยู่ห่างกัน",
        "body": [
          "LAN เป็นเครือข่ายในพื้นที่ที่ดูแลร่วมกัน เช่นภายในห้องแลปหรืออาคาร ส่วน WAN เชื่อมเครือข่ายต่างสถานที่ เช่นสำนักงานใหญ่กับสาขา ผ่านโครงข่ายผู้ให้บริการหรืออินเทอร์เน็ต",
          "เวลาวิเคราะห์โจทย์ให้แยกสามชั้นของการออกแบบ: ใช้อะไรเชื่อมถึงกัน เช่นบริการ WAN; จัดรูปแบบการเชื่อมต่ออย่างไร เช่น Hub-and-Spoke; และต้องการความปลอดภัยแบบไหน เช่นแยกข้อมูลลูกค้าหรือเข้ารหัส ทั้งสามคำถามไม่ใช่เรื่องเดียวกัน"
        ],
        "diagram": "wan",
        "example": {
          "title": "จาก Campus LAN ไปหลายสาขา",
          "body": [
            "ในอาคารใช้ VLAN แยกแผนกและ Inter-VLAN Routing เชื่อมกัน แต่ถ้าจะเชื่อมสำนักงานอีกจังหวัด ต้องมี WAN connectivity และเส้นทางไปกลับ",
            "จากนั้นจึงพิจารณาว่าจะใช้ VPN เข้ารหัสหรือบริการ MPLS VPN ตามข้อกำหนดของระบบ"
          ]
        }
      },
      {
        "title": "PPP: LCP เปิดลิงก์, NCP เตรียม Network Layer",
        "body": [
          "**PPP** หรือ Point-to-Point Protocol ใช้ขนส่ง datagram ผ่านลิงก์ระหว่างสองปลายทาง",
          "มี LCP (Link Control Protocol) จัดการการตั้งค่าและสถานะลิงก์ รวมถึงตกลงตัวเลือกที่ไม่ขึ้นกับ Network Layer เช่นว่าจะใช้ authentication แบบใด",
          "เมื่อสร้างลิงก์และผ่าน authentication หากกำหนดไว้แล้ว จึงเข้าสู่การตั้งค่า Network Layer ด้วย NCP (Network Control Protocol) ที่เหมาะกับโปรโตคอลนั้น เช่น IPCP สำหรับ IPv4",
          "ลำดับที่ต้องจำคือ Physical Link พร้อม → LCP เจรจา → Authentication ถ้ากำหนด → NCP → ส่งข้อมูล Network Layer ได้ ถ้า LCP ยังไม่เปิด การแก้ routing เพียงอย่างเดียวจะไม่ทำให้ PPP พร้อมใช้งาน"
        ],
        "table": {
          "headers": [
            "องค์ประกอบ",
            "หน้าที่",
            "จำแบบสั้น"
          ],
          "rows": [
            [
              "LCP",
              "ตั้งค่า/ทดสอบ/ยุติ PPP Link และเจรจาตัวเลือก",
              "จัดการลิงก์"
            ],
            [
              "Authentication เช่น CHAP",
              "ตรวจสอบ peer ตามวิธีที่ตกลง",
              "ตรวจอีกฝั่ง"
            ],
            [
              "NCP เช่น IPCP",
              "ตั้งค่าส่วนของ Network Layer",
              "เตรียม IP"
            ],
            [
              "Data",
              "ส่ง datagram หลังเงื่อนไขพร้อม",
              "ใช้งานลิงก์"
            ]
          ]
        },
        "pitfall": "PPP เป็นโปรโตคอลลิงก์ ไม่ใช่ Routing Protocol; LCP ไม่ได้ทำหน้าที่เลือก OSPF Route"
      },
      {
        "title": "CHAP: Challenge–Response ไม่ใช่การเข้ารหัสข้อมูลทั้งหมด",
        "body": [
          "**CHAP** ใช้การท้าทายด้วย Challenge แล้วให้ peer คำนวณ Response จาก Challenge และ shared secret ฝั่งตรวจสอบคำนวณเทียบเพื่อตัดสิน Success หรือ Failure โดยไม่ส่ง secret เดิมเป็นข้อความตรง ๆ ในการแลกเปลี่ยนแบบปกติ",
          "การยืนยันตัวตนนี้ตอบว่า peer รู้ secret หรือไม่ ไม่ได้ทำให้ payload ทุกแพ็กเก็ตบน PPP ถูกเข้ารหัส หากโจทย์ต้องการรักษาความลับของข้อมูลยังต้องพิจารณากลไกเข้ารหัสเพิ่มเติม",
          "ในแลป Cisco แบบ PPP/CHAP ตรวจ hostname/username ที่จับคู่ฝั่งตรงข้าม รหัส shared secret และการตั้งค่า ppp authentication ให้สอดคล้อง พร้อมดูสถานะ LCP/NCP ก่อนแก้เส้นทาง"
        ],
        "code": "! ตัวอย่างแนวคิด Cisco IOS สำหรับลิงก์ Serial ที่รองรับ\ninterface Serial0/0/0\n encapsulation ppp\n ppp authentication chap\n!\nshow interfaces Serial0/0/0",
        "example": {
          "title": "อ่านสถานะให้ตรงขั้น",
          "body": [
            "ลิงก์ทางกายภาพพร้อม แต่ Authentication Failure: ตรวจ CHAP identity/secret",
            "LCP เปิดแล้วแต่ IPCP ยังไม่พร้อม: ตรวจการตั้งค่า IPv4/NCP มากกว่าการเปลี่ยน STP"
          ]
        }
      },
      {
        "title": "MPLS: ใช้ Label ส่งต่อและแยกบริการ",
        "body": [
          "**MPLS** ย่อจาก Multiprotocol Label Switching โหนดในเครือข่าย MPLS ใช้ label ประกอบการส่งต่อ โดยบริเวณทางเข้าอาจ push label ระหว่างทาง swap และทางออก pop ตามเส้นทางและการทำงานที่กำหนด",
          "**MPLS** Layer 3 VPN ช่วยให้ผู้ให้บริการแยกข้อมูลเส้นทางของลูกค้า เช่นใช้ VRF ทำให้สององค์กรสามารถใช้ private subnet ซ้ำกันได้โดยยังแยกการส่งต่อของแต่ละ VPN ตามการตั้งค่าที่ถูกต้อง",
          "แต่ label และการแยก VPN ไม่ได้เข้ารหัสข้อมูลอัตโนมัติ ถ้าข้อกำหนดต้องป้องกันการดักอ่านระหว่างทาง ต้องเสริมเทคโนโลยี encryption เช่น IPsec ตามสถาปัตยกรรม"
        ],
        "table": {
          "headers": [
            "สิ่งที่ MPLS VPN ช่วย",
            "สิ่งที่ไม่ควรเหมารวม"
          ],
          "rows": [
            [
              "แยกบริบทการส่งต่อ/เส้นทางลูกค้า",
              "ไม่ได้แปลว่าเข้ารหัส payload แล้ว"
            ],
            [
              "ใช้ Label ใน MPLS forwarding",
              "Label ไม่ใช่รหัสผ่าน"
            ],
            [
              "ให้บริการเชื่อมสาขาผ่านผู้ให้บริการ",
              "ยังต้องออกแบบ routing และความพร้อมใช้งาน"
            ]
          ]
        },
        "pitfall": "คำว่า VPN หมายถึงเครือข่ายส่วนตัวเสมือน แต่ไม่ได้รับประกันว่าทุกเทคโนโลยีที่ใช้ชื่อนี้จะเข้ารหัส"
      },
      {
        "title": "Remote-Access VPN กับ Site-to-Site VPN",
        "body": [
          "**Remote-Access VPN** เชื่อมผู้ใช้รายบุคคลเข้าทรัพยากรองค์กร เช่นนักศึกษาหรือพนักงานใช้ notebook จากบ้านเชื่อมเครือข่ายมหาวิทยาลัย/บริษัท จุดเน้นอยู่ที่การยืนยันตัวตนของผู้ใช้และสิทธิ์ที่ได้รับ",
          "**Site-to-Site VPN** เชื่อมเครือข่ายของสองสถานที่ขึ้นไป โดยมี gateway ของแต่ละฝั่งสร้าง tunnel ให้เครื่องใน subnet ภายในติดต่อกันตาม policy ผู้ใช้แต่ละเครื่องไม่จำเป็นต้องเปิด VPN client ของตนทุกครั้ง",
          "VPN ที่ใช้ IPsec/TLS สามารถให้ confidentiality ตามโหมดและนโยบายที่ตั้ง แต่ต้องตรวจทั้งการสร้าง tunnel, routes, selectors/policy และการอนุญาตทราฟฟิก",
          "การเห็น tunnel up เพียงอย่างเดียวไม่ได้รับประกันว่าปลายทางทุกเครือข่ายใช้ได้"
        ],
        "table": {
          "headers": [
            "โจทย์",
            "รูปแบบเหมาะสม",
            "ปลายทางของการเชื่อมต่อ"
          ],
          "rows": [
            [
              "พนักงานใช้ notebook ที่บ้านเข้าองค์กร",
              "Remote-Access",
              "ผู้ใช้หนึ่งเครื่อง ↔ องค์กร"
            ],
            [
              "สำนักงานกรุงเทพฯเชื่อมสาขาเชียงใหม่",
              "Site-to-Site",
              "เครือข่าย ↔ เครือข่าย"
            ],
            [
              "หลายองค์กรใช้บริการ MPLS ร่วมกัน",
              "MPLS VPN",
              "แยกบริบทลูกค้าบนโครงข่ายผู้ให้บริการ"
            ]
          ]
        },
        "example": {
          "title": "คิดจากผู้ที่ต้องเชื่อม",
          "body": [
            "หากโจทย์เน้น ‘คนทำงานจากบ้าน’ ให้นึกถึง Remote-Access ก่อน",
            "หากโจทย์เน้น ‘ทุกเครื่องในสองสำนักงาน’ ให้นึกถึง Site-to-Site ก่อน"
          ]
        }
      },
      {
        "title": "Topology: เลือกจากทิศทางทราฟฟิกและต้นทุนลิงก์",
        "body": [
          "**Hub-and-Spoke** ให้สาขาต่อเข้าศูนย์กลาง เช่น A/B/C ต่อ HQ การเดินจาก A ไป B จึงผ่าน HQ ตามรูปแบบ star พื้นฐาน",
          "เหมาะเมื่อทราฟฟิกส่วนใหญ่เข้าศูนย์กลางและต้องการดูแลง่าย แต่ HQ/uplink อาจเป็นคอขวดหรือจุดล้มเหลวร่วม",
          "**Partial Mesh** เพิ่มทางตรงเฉพาะคู่ที่จำเป็น เช่น A ติดต่อ B บ่อยจึงเพิ่ม A–B เพื่อไม่อ้อม HQ ทุกครั้ง ยังคงใช้ลิงก์น้อยกว่า Full Mesh และต้องออกแบบ routing ให้เลือกเส้นทางที่ต้องการ",
          "**Full Mesh** เชื่อมทุกคู่โดยตรง ถ้ามี n จุดและนับลิงก์แบบไม่กำหนดทิศทางคู่ละหนึ่งเส้น จำนวนลิงก์ = n(n−1)/2 เช่น 4 จุดได้ 6 เส้น เทียบกับ Hub-and-Spoke4 จุดที่มี 3 เส้น",
          "การมีลิงก์ครบคู่เพิ่มต้นทุนและงานดูแล ไม่ได้ทำให้การรับช่วงเกิดขึ้นโดยไม่ต้องมี routing ที่ถูกต้อง"
        ],
        "diagram": "wan",
        "table": {
          "headers": [
            "4 จุด: HQ,A,B,C",
            "จำนวนลิงก์ในตัวอย่าง",
            "A ไป B"
          ],
          "rows": [
            [
              "Hub-and-Spoke",
              "3",
              "ผ่าน HQ"
            ],
            [
              "Partial Mesh เพิ่ม A–B",
              "4",
              "มีทางตรง A–B"
            ],
            [
              "Full Mesh",
              "6",
              "ทุกคู่มีทางตรง"
            ]
          ]
        },
        "pitfall": "รูปแบบ Physical Topology กับ Logical/Tunnel Topology อาจไม่เหมือนกัน โจทย์นับลิงก์ต้องดูว่ากำลังนับสายจริงหรือ tunnel"
      },
      {
        "title": "ออกแบบ WAN จากเส้นทางที่สาขาใช้จริง",
        "body": [
          "ถ้าสาขาคุยกับศูนย์กลางเป็นหลัก hub-and-spoke ใช้ลิงก์น้อย แต่สาขาที่ส่งหากันต้องผ่าน hub และต้องเผื่อความจุที่ศูนย์กลาง ถ้ามีสองสาขาที่ส่งข้อมูลหากันมาก ให้เพิ่มลิงก์ตรงเป็น partial mesh",
          "ส่วน full mesh ของ n จุดต้องใช้ n(n−1)/2 ลิงก์ เช่น 5 จุดต้องใช้ 10 ลิงก์",
          "ในกรณีศึกษาของสไลด์ องค์กรอาจใช้ MPLS ของผู้ให้บริการเป็นทางหลัก ใช้ site-to-site VPN ผ่านอินเทอร์เน็ตเป็นทางสำรอง และให้พนักงานนอกสำนักงานต่อด้วย remote-access VPN การแยกเส้นทางด้วย label และการเข้ารหัสเพื่อรักษาความลับทำคนละหน้าที่"
        ]
      },
      {
        "title": "รวมสี่ /24 ให้เป็น /22 แล้วตรวจขอบเขต",
        "body": [
          "10.10.0.0/24 ถึง 10.10.3.0/24 มีสองบิตท้ายของ octet ที่สามเปลี่ยนได้ (00, 01, 10, 11) จึงมี prefix ร่วม 22 บิต ได้ 10.10.0.0/22 หรือ mask 255.255.252.0 ครอบคลุมถึง 10.10.3.255 การเริ่มที่ 10.10.1.0 แล้วรวมสี่วงจะข้ามขอบเขต /22 นี้",
          "**Summarization** ลดจำนวน prefix ที่ประกาศ ส่วน redistribution นำ route ข้ามระหว่าง routing protocol ต้องแปลง metric และควบคุมทิศทาง ถ้าประกาศ summary ที่ครอบ subnet ที่ไปไม่ถึง แพ็กเก็ตของ subnet นั้นอาจถูกส่งมาทิ้งที่ผู้ประกาศ"
        ]
      }
    ],
    "summary": [
      "PPP: LCP ดูแลลิงก์ → Authentication ถ้ากำหนด → NCP เตรียม Network Layer",
      "CHAP = Challenge–Response ยืนยันตัวตน ไม่ใช่ Encryption ของข้อมูลทั้งหมด",
      "MPLS ใช้ Label; MPLS VPN แยกลูกค้า แต่ไม่เข้ารหัสให้เอง",
      "Remote-Access = ผู้ใช้เข้าองค์กร; Site-to-Site = เชื่อมเครือข่ายต่างสำนักงาน",
      "Hub-and-Spoke ง่ายและรวมศูนย์; Partial Mesh เพิ่มคู่สำคัญ; Full Mesh เชื่อมทุกคู่",
      "Full Mesh n จุด ใช้ n(n−1)/2 ลิงก์ เมื่อแต่ละคู่เชื่อมเส้นเดียว"
    ],
    "questions": [
      {
        "id": "8-01",
        "prompt": "ใน PPP, LCP ทำหน้าที่หลักข้อใด",
        "options": [
          "เลือก OSPF DR",
          "สร้างและจัดการลิงก์ รวมถึงเจรจาตัวเลือกของ PPP",
          "เก็บ MAC Address Table",
          "เข้ารหัสข้อมูล IP ทุกแพ็กเก็ต"
        ],
        "answer": 1,
        "explanation": "LCP เป็น Link Control Protocol จัดการลิงก์และตัวเลือก PPP ส่วน Network Layer มี NCP ดูแล",
        "level": "พื้นฐาน"
      },
      {
        "id": "8-02",
        "prompt": "ต้องตั้งค่าส่วน IPv4 หลัง PPP Link พร้อม องค์ประกอบใดเกี่ยวข้อง",
        "options": [
          "VTP Client",
          "HSRP Standby",
          "NCP โดยใช้ IPCP สำหรับ IPv4",
          "BPDU Guard"
        ],
        "answer": 2,
        "explanation": "NCP เป็นกลุ่มโปรโตคอลสำหรับตั้งค่า Network Layer ส่วน IPCP เป็นตัวที่ใช้กับ IPv4",
        "level": "พื้นฐาน"
      },
      {
        "id": "8-03",
        "prompt": "ลำดับ PPP ที่มี Authentication ตามปกติคือข้อใด",
        "options": [
          "NCP → Data → LCP → Authentication",
          "Data → CHAP → LCP → NCP",
          "OSPF → STP → CHAP → Data",
          "LCP → Authentication → NCP → Data"
        ],
        "answer": 3,
        "explanation": "ต้องสร้างลิงก์ด้วย LCP ก่อน ยืนยันตัวตนหากกำหนด แล้วตั้ง Network Layer ด้วย NCP จึงส่งข้อมูลได้",
        "level": "ประยุกต์"
      },
      {
        "id": "8-04",
        "prompt": "CHAP ตรวจสอบ peer ด้วยแนวคิดใด",
        "options": [
          "Challenge–Response ที่คำนวณโดยใช้ shared secret",
          "ส่ง secret เป็น broadcast ทุกวินาที",
          "เปรียบเทียบ VLAN ID เท่านั้น",
          "เลือก MAC ต่ำที่สุดเป็นผู้ใช้ที่ผ่าน"
        ],
        "answer": 0,
        "explanation": "CHAP ส่ง Challenge ให้ peer คำนวณ Response ซึ่งขึ้นกับ secret แล้วผู้ตรวจสอบคำนวณเทียบ ไม่ใช่การเลือก VLAN หรือ MAC",
        "level": "พื้นฐาน"
      },
      {
        "id": "8-05",
        "prompt": "เปิด CHAP บน PPP แล้ว ข้อใดถูกต้อง",
        "options": [
          "ทุกแพ็กเก็ต IP ถูกเข้ารหัสแน่นอน",
          "ยืนยันตัวตน peer แต่ไม่ได้เข้ารหัส payload ทั้งหมดโดยอัตโนมัติ",
          "ไม่ต้องใช้ NCP อีกต่อไป",
          "PPP เปลี่ยนเป็น MPLS ทันที"
        ],
        "answer": 1,
        "explanation": "Authentication กับ Confidentiality เป็นคนละคุณสมบัติ CHAP ไม่ได้เป็นกลไก encryption ของทราฟฟิกผู้ใช้",
        "level": "ประยุกต์"
      },
      {
        "id": "8-06",
        "prompt": "PPP ผ่าน Authentication แล้วแต่ IPCP ยังไม่พร้อม ควรตรวจด้านใดก่อน",
        "options": [
          "STP Root Priority ของ LAN ทุกตัว",
          "VTP Revision เท่านั้น",
          "การตั้งค่า IPv4 และ NCP ของลิงก์",
          "HSRP Virtual MAC เท่านั้น"
        ],
        "answer": 2,
        "explanation": "IPCP เป็น NCP สำหรับ IPv4 หากขั้นนี้ไม่สำเร็จให้ตรวจการตั้งค่าที่เกี่ยวข้องกับ IPv4/PPP ก่อนเปลี่ยน protocol อื่น",
        "level": "ประยุกต์"
      },
      {
        "id": "8-07",
        "prompt": "MPLS ใช้สิ่งใดเป็นหลักในการส่งต่อภายใน MPLS Network",
        "options": [
          "รหัสผ่าน CHAP ของผู้ใช้",
          "VTP Revision Number",
          "OSPF Process ID ของ Client",
          "Label"
        ],
        "answer": 3,
        "explanation": "MPLS forwarding ใช้ label ตาม state ที่ติดตั้งในเครือข่าย ไม่ใช่การส่งตาม password หรือ process ID",
        "level": "พื้นฐาน"
      },
      {
        "id": "8-08",
        "prompt": "องค์กรใช้ MPLS VPN แล้วต้องการให้ข้อมูลลับจากผู้ดักอ่าน คำตอบใดถูกต้อง",
        "options": [
          "พิจารณาเพิ่มการเข้ารหัส เช่น IPsec เพราะ MPLS VPN ไม่เข้ารหัสให้เอง",
          "ไม่ต้องทำอะไรเพราะ Label คือ Encryption",
          "ปิด Routing Table จะทำให้ปลอดภัย",
          "ใช้ VLAN 1 จะเข้ารหัสอัตโนมัติ"
        ],
        "answer": 0,
        "explanation": "MPLS VPN ให้การแยกบริบทลูกค้า แต่ isolation ไม่เท่ากับ encryption ข้อกำหนด confidentiality ต้องมีกลไกเหมาะสม",
        "level": "ประยุกต์"
      },
      {
        "id": "8-09",
        "prompt": "พนักงานหนึ่งคนใช้ notebook จากบ้านเข้าระบบภายในบริษัท รูปแบบใดตรงที่สุด",
        "options": [
          "Site-to-Site VPN ระหว่างสองสำนักงานเท่านั้น",
          "Remote-Access VPN",
          "VTP Pruning",
          "STP PortFast"
        ],
        "answer": 1,
        "explanation": "โจทย์เชื่อมผู้ใช้รายบุคคลเข้าทรัพยากรองค์กร จึงเป็น Remote-Access",
        "level": "ประยุกต์"
      },
      {
        "id": "8-10",
        "prompt": "ต้องการให้เครือข่ายสำนักงานกรุงเทพฯกับเชียงใหม่ติดต่อกันผ่าน tunnel ของ gateway เลือกอะไร",
        "options": [
          "Remote-Access สำหรับทุก MAC บน trunk",
          "802.1X แทน WAN ทั้งหมด",
          "Site-to-Site VPN",
          "MAC Aging"
        ],
        "answer": 2,
        "explanation": "เป็นการเชื่อมเครือข่ายสองสถานที่โดย gateway รับหน้าที่ tunnel จึงเป็น Site-to-Site",
        "level": "ประยุกต์"
      },
      {
        "id": "8-11",
        "prompt": "จากภาพ star พื้นฐานที่ยังไม่มีลิงก์ A–B การสื่อสาร A ไป B ผ่านที่ใด",
        "options": [
          "ต้องผ่าน C เสมอ",
          "ไปตรง A–B ที่ไม่มีอยู่",
          "ออกอินเทอร์เน็ตโดยไม่ผ่านลิงก์ใด",
          "HQ"
        ],
        "answer": 3,
        "explanation": "ใน Hub-and-Spoke พื้นฐาน สาขาเชื่อมศูนย์กลาง จึงใช้ A→HQ→B",
        "level": "ประยุกต์",
        "diagram": "wan"
      },
      {
        "id": "8-12",
        "prompt": "จากภาพ หากเพิ่มลิงก์ตรง A–B เพียงคู่เดียวจาก star เดิม รูปแบบใหม่ตรงกับข้อใด",
        "options": [
          "Partial Mesh",
          "Full Mesh ทันที",
          "Point-to-Point เพียงสองจุดทั้งระบบ",
          "เครือข่ายที่ไม่มีศูนย์กลางแน่นอน"
        ],
        "answer": 0,
        "explanation": "เพิ่มเฉพาะบางคู่เป็น Partial Mesh ยังไม่ครบทุกคู่ เพราะ A–C และ B–C ยังไม่มีทางตรง",
        "level": "ประยุกต์",
        "diagram": "wan"
      },
      {
        "id": "8-13",
        "prompt": "Full Mesh มี 4 จุดและเชื่อมทุกคู่คู่ละหนึ่งลิงก์ ต้องใช้กี่ลิงก์",
        "options": [
          "3",
          "6",
          "4",
          "12"
        ],
        "answer": 1,
        "explanation": "n(n−1)/2 =4×3/2=6 หาร 2 เพราะ A–B และ B–A เป็นลิงก์เดียวกัน",
        "level": "ประยุกต์"
      },
      {
        "id": "8-14",
        "prompt": "เมื่อขยาย Full Mesh จาก 4 จุดเป็น 5 จุด จำนวนลิงก์รวมและจำนวนที่เพิ่มเป็นเท่าใด",
        "options": [
          "รวม 5 ลิงก์ เพิ่ม 1 ลิงก์",
          "รวม 20 ลิงก์ เพิ่ม 14 ลิงก์",
          "รวม 10 ลิงก์ เพิ่ม 4 ลิงก์",
          "รวม 6 ลิงก์ ไม่ต้องเพิ่ม"
        ],
        "answer": 2,
        "explanation": "5×4/2=10 จากเดิม 6 จึงเพิ่ม 4 จุดใหม่ต้องเชื่อมกับจุดเดิมทั้ง 4",
        "level": "วิเคราะห์"
      },
      {
        "id": "8-15",
        "prompt": "องค์กรมีทราฟฟิกสาขาส่วนใหญ่ไป HQ แต่ A–B คุยกันหนักและต้องลดการอ้อมโดยคุมจำนวนลิงก์ แบบใดเหมาะกับเงื่อนไขที่สุด",
        "options": [
          "Full Mesh ทุกคู่เป็นคำตอบเดียวเสมอ",
          "ตัดลิงก์ทุกสาขาที่ไป HQ",
          "ใช้ CHAP แทนการเพิ่มเส้นทาง",
          "Hub-and-Spoke พร้อมลิงก์ A–B เพิ่มเป็น Partial Mesh"
        ],
        "answer": 3,
        "explanation": "รักษาศูนย์กลางสำหรับทราฟฟิกหลักและเพิ่มเฉพาะคู่ A–B ที่ใช้งานมาก ตรงกับ Partial Mesh ที่ลดการอ้อมโดยไม่จ่ายลิงก์ทุกคู่",
        "level": "วิเคราะห์"
      }
    ],
    "sources": [
      {
        "title": "RFC1661: Point-to-Point Protocol",
        "url": "https://www.rfc-editor.org/rfc/rfc1661.html"
      },
      {
        "title": "RFC1994: CHAP",
        "url": "https://www.rfc-editor.org/rfc/rfc1994.html"
      },
      {
        "title": "RFC4381: Security of BGP/MPLS IP VPNs",
        "url": "https://www.rfc-editor.org/rfc/rfc4381.html"
      },
      {
        "title": "Cisco: MPLS Layer3 VPN",
        "url": "https://www.cisco.com/c/en/us/td/docs/switches/lan/c9000/mpls/mpls-configuration-guide/mpls-layer-3-vpn.html"
      }
    ],
    "labs": [
      {
        "title": "สร้างสอง routing domain ตามผังสามเราเตอร์",
        "body": [
          "**ตั้งเครื่องปลายทาง:** PC1 = 192.168.10.10/24, gateway 192.168.10.1; PC2 = 192.168.30.30/24, gateway 192.168.30.1",
          "**ตั้งลิงก์ router:** R1–R2 ใช้ 10.0.12.0/30; R2–R3 ใช้ 10.0.23.0/29",
          "**ตั้ง Kali:** ใช้ 10.0.23.3/29 แล้วสร้าง EIGRP และ OSPF ตามบล็อกของแต่ละอุปกรณ์"
        ],
        "steps": [
          {
            "device": "R1 · ฝั่ง EIGRP",
            "code": "configure terminal\ninterface g0/0\n ip address 192.168.10.1 255.255.255.0\n no shutdown\n exit\ninterface g0/1\n ip address 10.0.12.1 255.255.255.252\n no shutdown\n exit\nrouter eigrp 100\n eigrp router-id 1.1.1.1\n network 192.168.10.0 0.0.0.255\n network 10.0.12.0 0.0.0.3\n passive-interface g0/0\n no auto-summary\nend\nshow ip eigrp neighbors"
          },
          {
            "device": "R2 · boundary router",
            "code": "configure terminal\ninterface g0/0\n ip address 10.0.12.2 255.255.255.252\n no shutdown\n exit\ninterface g0/1\n ip address 10.0.23.1 255.255.255.248\n no shutdown\n exit\nrouter eigrp 100\n eigrp router-id 2.2.2.2\n network 10.0.12.0 0.0.0.3\n no auto-summary\n exit\nrouter ospf 1\n router-id 2.2.2.2\n network 10.0.23.0 0.0.0.7 area 0\nend\nshow ip protocols"
          },
          {
            "device": "R3 · ฝั่ง OSPF",
            "code": "configure terminal\ninterface g0/0\n ip address 10.0.23.2 255.255.255.248\n no shutdown\n exit\ninterface g0/1\n ip address 192.168.30.1 255.255.255.0\n no shutdown\n exit\nrouter ospf 1\n router-id 3.3.3.3\n network 10.0.23.0 0.0.0.7 area 0\n network 192.168.30.0 0.0.0.255 area 0\n passive-interface g0/1\nend\nshow ip ospf neighbor\nshow ip route"
          }
        ],
        "example": {
          "title": "ตรวจผลและอธิบาย",
          "body": [
            "ก่อนเชื่อมสอง domain ให้ R1 เห็น R2 เป็น EIGRP neighbor และ R3 เห็น R2 เป็น OSPF neighbor แม้แต่ละลิงก์ ping ได้ R1 กับ R3 ยังไม่รู้จัก LAN ฝั่งตรงข้าม ตรวจ show ip route บน R2 ว่าเห็นทั้งสอง LAN ก่อนทำขั้นต่อไป"
          ]
        }
      },
      {
        "title": "ให้ R2 แลกเส้นทางด้วย metric และ route tag",
        "body": [
          "**ทำที่ R2:** นำ route จาก EIGRP เข้า OSPF พร้อม tag 100; ทิศย้อนกลับใส่ tag 200",
          "**กัน route feedback:** ปฏิเสธ tag ของ domain ปลายทางก่อนถึง permit เพื่อไม่ส่ง route กลับเข้าต้นทาง",
          "**ตรวจ metric และ route:** ใช้ seed metric ตามใบงาน แล้วตรวจเส้นทางไปและกลับ"
        ],
        "steps": [
          {
            "device": "R2 · route-map และ redistribution",
            "code": "configure terminal\nroute-map EIGRP-TO-OSPF deny 10\n match tag 200\n exit\nroute-map EIGRP-TO-OSPF permit 20\n set tag 100\n exit\nroute-map OSPF-TO-EIGRP deny 10\n match tag 100\n exit\nroute-map OSPF-TO-EIGRP permit 20\n set tag 200\n exit\nrouter ospf 1\n redistribute eigrp 100 subnets route-map EIGRP-TO-OSPF\n exit\nrouter eigrp 100\n redistribute ospf 1 metric 10000 100 255 1 1500 route-map OSPF-TO-EIGRP\nend\nshow route-map\nshow ip protocols"
          },
          {
            "device": "R1 · ตรวจเส้นทางที่นำเข้า",
            "code": "show ip eigrp topology\nshow ip route 192.168.30.0"
          },
          {
            "device": "R3 · ตรวจเส้นทางกลับ",
            "code": "show ip route 192.168.10.0"
          }
        ],
        "example": {
          "title": "ตรวจผลและอธิบาย",
          "body": [
            "R1 ควรเห็น D EX ไป 192.168.30.0/24 และ R3 เห็น O E2 ไป 192.168.10.0/24 เมื่อใช้ external type เริ่มต้น ค่า seed metric ฝั่ง EIGRP เรียงเป็น bandwidth, delay, reliability, load, MTU ตรวจว่าจาก PC1 ping 192.168.30.30 และจาก PC2 ping 192.168.10.10 ได้ทั้งสองทาง"
          ]
        }
      },
      {
        "title": "ตัด R1–R2 แล้ววัดเวลาที่กลับมาส่งข้อมูลได้",
        "body": [
          "**เริ่มเก็บข้อมูล:** จับไฟล์ `routing_control.pcap` ตามบท 7 และให้ PC1 ping PC2 ต่อเนื่อง",
          "**เก็บค่าก่อนตัดลิงก์:** บันทึก neighbor และ route แล้วตัด R1–R2 ตามขั้นตอน",
          "**แปลผลตาม topology:** R2 เป็นทางผ่านเพียงเส้นเดียว; วัดเวลาที่กลับมาสื่อสารได้หลังคืนลิงก์"
        ],
        "steps": [
          {
            "device": "PC1 · Linux",
            "code": "ping -i 1 192.168.30.30"
          },
          {
            "device": "R1 · ระหว่างขัดข้อง",
            "code": "configure terminal\ninterface g0/1\n shutdown\nend\nshow ip eigrp neighbors\nshow ip route"
          },
          {
            "device": "R1 · ครบ 20 วินาทีแล้วเปิดลิงก์คืน",
            "code": "configure terminal\ninterface g0/1\n no shutdown\nend\nshow ip eigrp neighbors\nshow ip route 192.168.30.0"
          }
        ],
        "example": {
          "title": "ตรวจผลและอธิบาย",
          "body": [
            "ช่วงปิดสาย การสื่อสารต้องหยุดเพราะไม่มีทางสำรอง บันทึกเวลาตั้งแต่ no shutdown จน neighbor กลับมา, D EX ปรากฏ และ ping ตอบอีกครั้ง จึงแยกช่วงรอเปิดสาย 20 วินาทีออกจากเวลาฟื้นตัวของ routing ได้ ปิดท้ายด้วย traceroute จาก PC1 และอธิบายบทบาท R1 → R2 → R3"
          ]
        }
      }
    ],
    "courseFiles": [
      "Advanced_Routing_WAN_Lecture_Lab.pdf · หน้า 8–20",
      "lab/---------------_Advanced_Routing_WAN_3Routers.docx.pdf · หน้า 2–11",
      "สรุปเนื้อหาข้อสอบปลายภาค_Internetworking_2569.pdf · หน้า 4–5"
    ]
  }
];
window.PRACTICAL_EXAMS = [
  {
    "id": 1,
    "title": "Switch พื้นฐานและ Port Security",
    "scenario": "SW1 ต่อ PC ที่ Fa0/1 และ Fa0/3 ใช้ VLAN 1 สำหรับบริหารจัดการ",
    "questions": [
      {
        "id": "lab-1-1",
        "prompt": "เข้าโหมดตั้งค่าหลัก",
        "context": "SW1#",
        "answer": "configure terminal",
        "accept": [
          "configure terminal",
          "conf t"
        ],
        "explanation": "จาก privileged EXEC ใช้ configure terminal เพื่อเข้าสู่ (config)#",
        "inputType": "ios"
      },
      {
        "id": "lab-1-2",
        "prompt": "ตั้ง IP สำหรับบริหารจัดการ",
        "context": "SW1(config-if)# อยู่ที่ interface vlan 1 กำหนด IP 192.168.1.2/24",
        "answer": "ip address 192.168.1.2 255.255.255.0",
        "accept": [
          "ip address 192.168.1.2 255.255.255.0"
        ],
        "explanation": "Management IP ตั้งบน SVI และ /24 ใช้ mask 255.255.255.0",
        "inputType": "ios"
      },
      {
        "id": "lab-1-3",
        "prompt": "แสดงรายการ MAC ที่เรียนรู้แบบ dynamic",
        "context": "SW1#",
        "answer": "show mac address-table dynamic",
        "accept": [
          "show mac address-table dynamic"
        ],
        "explanation": "ดู MAC ที่เรียนรู้จากเฟรม แล้วเทียบ VLAN และพอร์ตขาเข้ากับสายจริง",
        "inputType": "ios"
      },
      {
        "id": "lab-1-4",
        "prompt": "จำกัด secure MAC สูงสุดสองรายการ",
        "context": "SW1(config-if)# อยู่ที่ Fa0/1 ซึ่งเปิด port-security แล้ว",
        "answer": "switchport port-security maximum 2",
        "accept": [
          "switchport port-security maximum 2"
        ],
        "explanation": "Maximum นับจำนวน MAC ที่อนุญาตบนพอร์ต เมื่อเต็มจึงเกิด violation เมื่อมี MAC ใหม่",
        "inputType": "ios"
      },
      {
        "id": "lab-1-5",
        "prompt": "นำพอร์ตที่ shutdown ไว้กลับมาเปิด",
        "context": "SW1(config-if)# อยู่ที่ Fa0/3 นำ MAC ที่ละเมิดออกแล้ว และสั่ง shutdown ไปแล้ว",
        "answer": "no shutdown",
        "accept": [
          "no shutdown"
        ],
        "explanation": "หลังแก้สาเหตุและ shutdown แล้ว ให้ no shutdown เพื่อเปิดพอร์ต ตรวจสถานะและ violation counter ซ้ำ",
        "inputType": "ios"
      }
    ]
  },
  {
    "id": 2,
    "title": "VLAN, VTP และ Trunk",
    "scenario": "SW1 เป็น VTP server ของ LABCORP ใช้ Gi0/1 เป็น trunk และ Fa0/2 เป็นพอร์ตผู้ใช้",
    "questions": [
      {
        "id": "lab-2-1",
        "prompt": "ตั้ง VTP domain",
        "context": "SW1(config)#",
        "answer": "vtp domain LABCORP",
        "accept": [
          "vtp domain LABCORP"
        ],
        "explanation": "ชื่อ domain ต้องสอดคล้องกับ switch ที่จะรับฐานข้อมูล VLAN",
        "inputType": "ios"
      },
      {
        "id": "lab-2-2",
        "prompt": "ล็อกพอร์ตเป็น trunk",
        "context": "SW1(config-if)# อยู่ที่ Gi0/1 อุปกรณ์รองรับ dot1q อยู่แล้ว",
        "answer": "switchport mode trunk",
        "accept": [
          "switchport mode trunk"
        ],
        "explanation": "กำหนด trunk เพื่อให้หลาย VLAN ผ่านลิงก์เดียวกัน",
        "inputType": "ios"
      },
      {
        "id": "lab-2-3",
        "prompt": "ตั้ง native VLAN ตามใบงานสัปดาห์ที่ 2",
        "context": "SW1(config-if)# อยู่ที่ Gi0/1 สร้าง VLAN 999 แล้ว",
        "answer": "switchport trunk native vlan 999",
        "accept": [
          "switchport trunk native vlan 999"
        ],
        "explanation": "ตั้งปลาย trunk ทั้งสองฝั่งให้ตรงกัน และแยก native VLAN ออกจากพอร์ตผู้ใช้",
        "inputType": "ios"
      },
      {
        "id": "lab-2-4",
        "prompt": "ปิดการเจรจา DTP",
        "context": "SW1(config-if)# อยู่ที่ Fa0/2 ซึ่งตั้งเป็น access แล้ว",
        "answer": "switchport nonegotiate",
        "accept": [
          "switchport nonegotiate"
        ],
        "explanation": "ปิดการส่ง DTP ร่วมกับล็อก access mode เพื่อป้องกันการเจรจาเป็น trunk",
        "inputType": "ios"
      },
      {
        "id": "lab-2-5",
        "prompt": "ตรวจ trunk และ native VLAN",
        "context": "SW1# ต้องการดูรายการ trunk ทุกพอร์ต",
        "answer": "show interfaces trunk",
        "accept": [
          "show interfaces trunk"
        ],
        "explanation": "ผลแสดงพอร์ตที่ trunking, native VLAN และ allowed VLAN",
        "inputType": "ios"
      }
    ]
  },
  {
    "id": 3,
    "title": "STP และการป้องกัน BPDU",
    "scenario": "SW1–SW3 ต่อเป็นสามเหลี่ยม โดย SW1 เป็น root ที่กำหนดไว้ และ SW2 Gi0/1 ต่อ PC",
    "questions": [
      {
        "id": "lab-3-1",
        "prompt": "กำหนด SW1 เป็น root หลักของ VLAN 1",
        "context": "SW1(config)#",
        "answer": "spanning-tree vlan 1 root primary",
        "accept": [
          "spanning-tree vlan 1 root primary"
        ],
        "explanation": "คำสั่งปรับ priority เพื่อให้ switch เป็น root หลักตามเงื่อนไขที่ตรวจพบ",
        "inputType": "ios"
      },
      {
        "id": "lab-3-2",
        "prompt": "ดู Root ID และบทบาทพอร์ต",
        "context": "SW2# ให้ระบุ VLAN 1",
        "answer": "show spanning-tree vlan 1",
        "accept": [
          "show spanning-tree vlan 1"
        ],
        "explanation": "เทียบ Root ID กับ Bridge ID แล้วอ่าน Role คู่กับ State ของแต่ละพอร์ต",
        "inputType": "ios"
      },
      {
        "id": "lab-3-3",
        "prompt": "ให้พอร์ต PC เข้า forwarding เร็ว",
        "context": "SW2(config-if)# อยู่ที่ Gi0/1 ซึ่งเป็น access port ไป PC",
        "answer": "spanning-tree portfast",
        "accept": [
          "spanning-tree portfast"
        ],
        "explanation": "PortFast ใช้กับปลายทางเพื่อข้ามการรอ listening/learning ตอนเปิดพอร์ต",
        "inputType": "ios"
      },
      {
        "id": "lab-3-4",
        "prompt": "ป้องกัน PC ส่ง BPDU เข้าพอร์ต",
        "context": "SW2(config-if)# อยู่ที่ Gi0/1",
        "answer": "spanning-tree bpduguard enable",
        "accept": [
          "spanning-tree bpduguard enable"
        ],
        "explanation": "เมื่อพอร์ตรับ BPDU จะเข้าสู่ err-disabled ต้องแก้ต้นทางก่อนกู้พอร์ต",
        "inputType": "ios"
      },
      {
        "id": "lab-3-5",
        "prompt": "ตรวจรายการพอร์ตที่ถูกปิดจากเหตุผิดปกติ",
        "context": "SW2#",
        "answer": "show interfaces status err-disabled",
        "accept": [
          "show interfaces status err-disabled"
        ],
        "explanation": "ดูว่าพอร์ตใด err-disabled หลังทดสอบ BPDU Guard",
        "inputType": "ios"
      }
    ]
  },
  {
    "id": 4,
    "title": "Router-on-a-Stick และ ACL",
    "scenario": "R1 เชื่อม trunk ที่ Gi0/0 และให้ VLAN 10 เข้าทาง Gi0/0.10",
    "questions": [
      {
        "id": "lab-4-1",
        "prompt": "ผูก sub-interface กับ VLAN 10",
        "context": "R1(config-subif)# อยู่ที่ Gi0/0.10",
        "answer": "encapsulation dot1Q 10",
        "accept": [
          "encapsulation dot1Q 10"
        ],
        "explanation": "เลขหลัง dot1Q ต้องตรง VLAN tag ที่รับจาก trunk",
        "inputType": "ios"
      },
      {
        "id": "lab-4-2",
        "prompt": "ตั้ง gateway ของ VLAN 10",
        "context": "R1(config-subif)# อยู่ที่ Gi0/0.10 ใช้ 192.168.10.1/24",
        "answer": "ip address 192.168.10.1 255.255.255.0",
        "accept": [
          "ip address 192.168.10.1 255.255.255.0"
        ],
        "explanation": "PC ใน VLAN 10 ใช้ IP นี้เป็น default gateway",
        "inputType": "ios"
      },
      {
        "id": "lab-4-3",
        "prompt": "อนุญาต HTTPS จาก Staff ไป Web Server",
        "context": "R1(config-ext-nacl)# ต้นทาง 192.168.10.0/24 ปลายทาง 192.168.20.10 ระบุ host และเลขพอร์ต",
        "answer": "permit tcp 192.168.10.0 0.0.0.255 host 192.168.20.10 eq 443",
        "accept": [
          "permit tcp 192.168.10.0 0.0.0.255 host 192.168.20.10 eq 443"
        ],
        "explanation": "HTTPS ใช้ TCP 443 ส่วน wildcard ของ /24 คือ 0.0.0.255",
        "inputType": "ios"
      },
      {
        "id": "lab-4-4",
        "prompt": "ติด ACL ขาเข้าจาก Staff",
        "context": "R1(config-subif)# อยู่ที่ Gi0/0.10 ชื่อ ACL FILTER_STAFF_TRAFFIC",
        "answer": "ip access-group FILTER_STAFF_TRAFFIC in",
        "accept": [
          "ip access-group FILTER_STAFF_TRAFFIC in"
        ],
        "explanation": "ทิศ in ตรวจแพ็กเก็ตที่เข้ามาจาก VLAN 10 ก่อนเลือกทางออก",
        "inputType": "ios"
      },
      {
        "id": "lab-4-5",
        "prompt": "ดู counter ของ ACL ที่ตั้ง",
        "context": "R1# ให้ระบุชื่อ FILTER_STAFF_TRAFFIC",
        "answer": "show access-lists FILTER_STAFF_TRAFFIC",
        "accept": [
          "show access-lists FILTER_STAFF_TRAFFIC",
          "show ip access-lists FILTER_STAFF_TRAFFIC"
        ],
        "explanation": "เทียบจำนวน match ที่เพิ่มกับการ ping หรือเรียกบริการจาก Staff",
        "inputType": "ios"
      }
    ]
  },
  {
    "id": 5,
    "title": "OSPF Single Area",
    "scenario": "R1–R4 อยู่บนวง 192.168.100.0/24 และมีลิงก์ตรง R1–R4 ที่ 172.16.14.0/30",
    "questions": [
      {
        "id": "lab-5-1",
        "prompt": "ประกาศ subnet /24 เข้า Area 0",
        "context": "R1(config-router)# อยู่ใน router ospf 1 ใช้ network address ของวง 192.168.100.0/24",
        "answer": "network 192.168.100.0 0.0.0.255 area 0",
        "accept": [
          "network 192.168.100.0 0.0.0.255 area 0"
        ],
        "explanation": "Wildcard /24 คือ 0.0.0.255 เลือก interface ในวงนี้เข้าร่วม Area 0",
        "inputType": "ios"
      },
      {
        "id": "lab-5-2",
        "prompt": "ทำให้ R4 ไม่มีสิทธิ์เป็น DR/BDR",
        "context": "R4(config-if)# อยู่ที่ Gi0/1",
        "answer": "ip ospf priority 0",
        "accept": [
          "ip ospf priority 0"
        ],
        "explanation": "Priority 0 บน interface ทำให้ไม่เข้าร่วมการเลือก DR/BDR ของ segment นี้",
        "inputType": "ios"
      },
      {
        "id": "lab-5-3",
        "prompt": "ตั้ง network type ของลิงก์ตรง",
        "context": "R1(config-if)# อยู่ที่ Gi0/3 ซึ่งต่อ R4 โดยตรง",
        "answer": "ip ospf network point-to-point",
        "accept": [
          "ip ospf network point-to-point"
        ],
        "explanation": "Point-to-point ไม่มีการเลือก DR/BDR ให้ตั้งทั้งสองฝั่ง",
        "inputType": "ios"
      },
      {
        "id": "lab-5-4",
        "prompt": "ปรับ reference bandwidth",
        "context": "R1(config-router)# อยู่ใน OSPF ใช้ 10000 Mbps",
        "answer": "auto-cost reference-bandwidth 10000",
        "accept": [
          "auto-cost reference-bandwidth 10000"
        ],
        "explanation": "ใช้ค่าเดียวกันทุก router เพื่อให้การคำนวณ cost สอดคล้องกัน",
        "inputType": "ios"
      },
      {
        "id": "lab-5-5",
        "prompt": "ตรวจเพื่อนบ้าน OSPF",
        "context": "R1#",
        "answer": "show ip ospf neighbor",
        "accept": [
          "show ip ospf neighbor"
        ],
        "explanation": "อ่าน Neighbor ID, State และ Interface เพื่อตรวจ adjacency",
        "inputType": "ios"
      }
    ]
  },
  {
    "id": 6,
    "title": "HSRP, VRRP และ GLBP",
    "scenario": "R1 กับ R2 เป็นคู่ gateway ในแต่ละวงตามใบงาน ใช้กลุ่ม 1",
    "questions": [
      {
        "id": "lab-6-1",
        "prompt": "ตั้ง Virtual IP ของ HSRP",
        "context": "R1(config-if)# อยู่ที่ interface วง 192.168.10.0/24 ใช้ VIP 192.168.10.1",
        "answer": "standby 1 ip 192.168.10.1",
        "accept": [
          "standby 1 ip 192.168.10.1"
        ],
        "explanation": "Client ใช้ virtual IP เป็น gateway ส่วน router แต่ละตัวมี IP จริงคนละหมายเลข",
        "inputType": "ios"
      },
      {
        "id": "lab-6-2",
        "prompt": "ให้ HSRP ที่ priority สูงกว่ากลับมารับบทบาทได้",
        "context": "R1(config-if)# กลุ่ม 1",
        "answer": "standby 1 preempt",
        "accept": [
          "standby 1 preempt"
        ],
        "explanation": "Preempt อนุญาตให้เครื่องที่พร้อมและ priority สูงกว่าเข้ารับบทบาท",
        "inputType": "ios"
      },
      {
        "id": "lab-6-3",
        "prompt": "ตั้ง Virtual IP ของ VRRP",
        "context": "R1(config-if)# อยู่ที่ interface วง 192.168.20.0/24 ใช้ VIP 192.168.20.1",
        "answer": "vrrp 1 ip 192.168.20.1",
        "accept": [
          "vrrp 1 ip 192.168.20.1"
        ],
        "explanation": "ให้ทั้งสอง router ใช้ VRID และ virtual IP ตรงกัน",
        "inputType": "ios"
      },
      {
        "id": "lab-6-4",
        "prompt": "ตั้ง GLBP กระจายด้วย round-robin",
        "context": "R1(config-if)# กลุ่ม 1",
        "answer": "glbp 1 load-balancing round-robin",
        "accept": [
          "glbp 1 load-balancing round-robin"
        ],
        "explanation": "AVG สลับแจก virtual MAC ของ AVF ตามคำขอ ARP และ client ใช้ MAC นั้นส่งข้อมูล",
        "inputType": "ios"
      },
      {
        "id": "lab-6-5",
        "prompt": "ตรวจบทบาท HSRP ของทุกกลุ่มแบบย่อ",
        "context": "R2#",
        "answer": "show standby brief",
        "accept": [
          "show standby brief"
        ],
        "explanation": "ดู State, Active, Standby, Virtual IP และ priority หลังทดสอบ failover",
        "inputType": "ios"
      }
    ]
  },
  {
    "id": 7,
    "title": "ตรวจเครือข่ายและจับแพ็กเก็ต",
    "scenario": "ใช้ Kali ที่มี interface eth0 ในวงแลบ และเลือกจุดจับให้เห็น traffic ที่ต้องการ",
    "questions": [
      {
        "id": "lab-7-1",
        "prompt": "ดู IP และชื่อ interface ของ Kali แบบย่อ",
        "context": "Kali $ ใช้คำสั่ง ip",
        "answer": "ip -br addr",
        "accept": [
          "ip -br addr",
          "ip -br address"
        ],
        "explanation": "ตรวจชื่อ interface และ IP ก่อนระบุ eth0 ในเครื่องมือจับ packet",
        "inputType": "shell"
      },
      {
        "id": "lab-7-2",
        "prompt": "ค้นหาเครื่องใน broadcast domain เดียวกัน",
        "context": "Kali $ ใช้ arp-scan ระบุ interface eth0 และ localnet",
        "answer": "sudo arp-scan --interface=eth0 --localnet",
        "accept": [
          "sudo arp-scan --interface=eth0 --localnet",
          "sudo arp-scan --interface eth0 --localnet"
        ],
        "explanation": "ARP scan ส่งคำขอใน Layer 2 จึงขึ้นกับ VLAN ที่ Kali ต่ออยู่",
        "inputType": "shell"
      },
      {
        "id": "lab-7-3",
        "prompt": "จับเฉพาะ ARP แบบไม่ resolve ชื่อ",
        "context": "Kali $ ใช้ tcpdump ที่ eth0 พร้อม -nn",
        "answer": "sudo tcpdump -i eth0 -nn arp",
        "accept": [
          "sudo tcpdump -i eth0 -nn arp",
          "sudo tcpdump -nn -i eth0 arp",
          "sudo tcpdump -nni eth0 arp"
        ],
        "explanation": "แสดง ARP Request/Reply ที่จุดจับมองเห็น โดยใช้เลขที่อยู่และพอร์ตตรง ๆ",
        "inputType": "shell"
      },
      {
        "id": "lab-7-4",
        "prompt": "กรอง OSPF ใน Wireshark",
        "context": "กรอกเฉพาะ display filter ด้วยชื่อโปรโตคอล",
        "answer": "ospf",
        "accept": [
          "ospf"
        ],
        "explanation": "ชื่อ ospf เป็น display filter ส่วน capture filter ของ tcpdump ใช้ ip proto 89",
        "inputType": "filter"
      },
      {
        "id": "lab-7-5",
        "prompt": "ตรวจเพื่อนบ้านจาก Cisco switch",
        "context": "SW1# ต้องการดูชื่ออุปกรณ์และ Local Interface แบบย่อ",
        "answer": "show cdp neighbors",
        "accept": [
          "show cdp neighbors"
        ],
        "explanation": "ใช้ Local Interface ระบุ uplink แล้วตาม MAC ไปตรวจ switch ถัดไป",
        "inputType": "ios"
      }
    ]
  },
  {
    "id": 8,
    "title": "EIGRP และ Redistribution",
    "scenario": "R2 เป็น boundary router ระหว่าง EIGRP AS 100 และ OSPF process 1",
    "questions": [
      {
        "id": "lab-8-1",
        "prompt": "เข้า EIGRP process",
        "context": "R2(config)# AS 100",
        "answer": "router eigrp 100",
        "accept": [
          "router eigrp 100"
        ],
        "explanation": "AS ต้องตรงกับเพื่อนบ้านใน EIGRP domain ที่จะเชื่อมต่อ",
        "inputType": "ios"
      },
      {
        "id": "lab-8-2",
        "prompt": "ประกาศลิงก์ /30 เข้า EIGRP",
        "context": "R1(config-router)# ใช้ network address 10.0.12.0/30",
        "answer": "network 10.0.12.0 0.0.0.3",
        "accept": [
          "network 10.0.12.0 0.0.0.3"
        ],
        "explanation": "Wildcard /30 คือ 0.0.0.3 และตรงกับลิงก์ R1–R2",
        "inputType": "ios"
      },
      {
        "id": "lab-8-3",
        "prompt": "นำ EIGRP เข้า OSPF ตาม route-map",
        "context": "R2(config-router)# อยู่ใน OSPF process 1 ใช้ route-map EIGRP-TO-OSPF",
        "answer": "redistribute eigrp 100 subnets route-map EIGRP-TO-OSPF",
        "accept": [
          "redistribute eigrp 100 subnets route-map EIGRP-TO-OSPF"
        ],
        "explanation": "subnets ให้นำ subnet routes เข้าได้ ส่วน route-map ใช้กรองและกำหนด tag",
        "inputType": "ios"
      },
      {
        "id": "lab-8-4",
        "prompt": "นำ OSPF เข้า EIGRP พร้อม seed metric",
        "context": "R2(config-router)# อยู่ใน EIGRP 100 ใช้ metric 10000 100 255 1 1500 และ route-map OSPF-TO-EIGRP",
        "answer": "redistribute ospf 1 metric 10000 100 255 1 1500 route-map OSPF-TO-EIGRP",
        "accept": [
          "redistribute ospf 1 metric 10000 100 255 1 1500 route-map OSPF-TO-EIGRP"
        ],
        "explanation": "Metric เรียงเป็น bandwidth, delay, reliability, load, MTU เพื่อให้ EIGRP นำ route ไปคำนวณได้",
        "inputType": "ios"
      },
      {
        "id": "lab-8-5",
        "prompt": "ตรวจเส้นทางไป LAN ฝั่ง R3",
        "context": "R1# ระบุ network 192.168.30.0",
        "answer": "show ip route 192.168.30.0",
        "accept": [
          "show ip route 192.168.30.0"
        ],
        "explanation": "หลัง redistribution ควรมี D EX ไป LAN ฝั่ง OSPF และต้องมีเส้นทางย้อนกลับด้วย",
        "inputType": "ios"
      }
    ]
  }
];
window.OPENBOOK = [
  {
    "id": "theory",
    "title": "ภาคทฤษฎี",
    "description": "คำจำกัดความ หลักการ เปรียบเทียบ สูตร และจุดที่มักสับสน ครบ 8 บท",
    "pages": [
      {
        "side": "หน้า",
        "title": "Switching · VLAN · STP · Inter-VLAN",
        "columns": [
          [
            {
              "title": "01 Ethernet / MAC learning",
              "text": "Switch ทำงานหลักที่ L2 ส่ง Ethernet frame ด้วย MAC; Router L3 เลือก IP route. MAC 48 บิต (6 octets), broadcast FF:FF:FF:FF:FF:FF. แต่ละพอร์ตสวิตช์แยก collision domain; VLAN แยก broadcast domain. Full-duplex ส่งและรับพร้อมกัน ไม่มี collision ตามการทำงานปกติของลิงก์นี้.\nรับเฟรม → เรียน Source MAC + VLAN + ingress port → ดู Destination MAC. Known unicast: ส่งพอร์ตที่ตารางระบุ; อยู่พอร์ตเดียวกับขาเข้า: filter ไม่ส่งกลับ. Unknown unicast / broadcast: flood เฉพาะพอร์ตที่ส่งต่อได้ใน VLAN เดียวกัน ยกเว้นขาเข้า. Multicast ขึ้นกับการ snooping/การตั้งค่า.\nMAC table ใช้คู่ VLAN+MAC; MAC เดียวอาจพบในคนละ VLAN. เรียนจาก source แม้ destination ยังไม่รู้. อุปกรณ์ย้ายพอร์ต: source frame ใหม่ทำให้เรียนตำแหน่งใหม่. Aging ลบ dynamic entry ที่หมดอายุ; ค่าเริ่มต้นพบได้บ่อย 300s ตรวจจริงด้วย show. Static ไม่หมดตาม dynamic aging.\nARP หา MAC จาก IPv4 ใน LAN; ARP request เป็น broadcast, reply ปกติเป็น unicast. เป้าหมายต่าง subnet: PC ARP หา MAC ของ gateway ไม่ใช่ MAC ของเครื่องปลายทางไกล."
            },
            {
              "title": "Store-and-Forward / Cut-Through",
              "text": "Store-and-Forward รับครบเฟรม ตรวจ FCS/CRC แล้วส่ง; ทิ้งเฟรมเสียก่อนส่งต่อ มี latency มากกว่า. Cut-Through เริ่มส่งหลังรู้ destination มี latency ต่ำ แต่เฟรมอาจถูกส่งไปก่อนรู้ FCS เสีย. FCS ตรวจข้อผิดพลาด ไม่ได้แก้ข้อมูลหรือเข้ารหัส.\nHub ทำซ้ำสัญญาณร่วม collision domain; switch เรียน MAC เลือกพอร์ต; router แยก broadcast และ route ข้าม subnet. Switch ไม่เปลี่ยน IP src/dst ของ frame ที่ bridge ตามปกติ."
            },
            {
              "title": "Port Security / Sticky / Violation",
              "text": "จำกัด source MAC ที่อนุญาตต่อพอร์ต; ตั้ง access mode, เปิด port-security, maximum, วิธีเรียน MAC, violation. Sticky เรียน MAC ลง running-config; ต้อง copy run start จึงคงอยู่หลัง reboot. MAC ที่ตั้งแบบ static กับ dynamic/sticky มีวิธีเก็บต่างกัน.\nProtect: drop เฟรม MAC เกิน/ไม่อนุญาต พอร์ตยัง up ไม่มีการแจ้งเตือนแบบ restrict. Restrict: drop + เพิ่ม violation counter/แจ้งตามที่รองรับ. Shutdown (ค่าปกติหลายรุ่น): err-disabled ทั้งพอร์ต. ตรวจ secure MAC, maximum, violation mode และ counter ก่อนสรุป.\nกู้พอร์ต: แก้สาเหตุ/ถอดเครื่องที่ผิดนโยบาย → ตรวจ sticky เก่า → shutdown / no shutdown → ตรวจ show port-security interface. เปิดกลับโดยไม่แก้สาเหตุอาจปิดซ้ำ. Port Security ตรวจ MAC ของเฟรม จึงไม่ได้ยืนยันตัวบุคคลแบบ 802.1X."
            }
          ],
          [
            {
              "title": "02 VLAN / Access / Trunk / 802.1Q",
              "text": "VLAN แบ่ง L2 broadcast domain แบบ logical; ต่าง VLAN ต้อง route ผ่าน L3 แม้ต่อ switch ตัวเดียวกัน. VLAN เดียวกันต่าง switch ใช้ trunk ขน VLAN ถึงกัน. VLAN กับ subnet คนละแนวคิด แต่ในการออกแบบทั่วไปจับหนึ่ง subnet ต่อหนึ่ง VLAN.\nAccess: อุปกรณ์ผู้ใช้ใน data VLAN เดียว เฟรมปลายทางทั่วไป untagged. Trunk: หลาย VLAN ผ่านลิงก์เดียว ใช้ 802.1Q tag 4 bytes; VLAN ID 12 บิต, VLAN ใช้งานทั่วไป 1–4094; ID 0 ใช้ priority tag, 4095 reserved. Voice VLAN เป็นกรณีพิเศษที่พอร์ต access รองรับ data+voice.\nNative VLAN: เฟรมของ VLAN นี้โดยปกติ untagged บน 802.1Q trunk; untagged ที่รับเข้าจัดเข้า native. Native ต้องตรงทั้งคู่. Native mismatch อาจทำให้เฟรมเข้า VLAN ผิด. Allowed list คุม VLAN ที่ผ่าน trunk; สร้าง VLAN แล้วต้องตรวจ allowed/active/forwarding ด้วย.\nจำกัด allowed เฉพาะที่ใช้; เปลี่ยน native เป็น VLAN ที่ไม่มีผู้ใช้; หลีกเลี่ยง data VLAN บน native. คำสั่ง allowed vlan LIST แทนรายการเดิม; add/remove แก้เฉพาะส่วน. ตรวจทั้งสองฝั่งด้วย show interfaces trunk และ show interfaces ... switchport."
            },
            {
              "title": "VTP / Revision / Pruning",
              "text": "VTP กระจายฐานข้อมูล VLAN ระหว่าง switch ใน domain ผ่าน trunk; ไม่สร้าง trunk และไม่กำหนด access-port membership ให้เอง. ตัวอย่างแลปใช้ VTPv2: domain LABCORP, password vtp123. รุ่น/โหมดมีผลต่อพฤติกรรม.\nServer สร้าง/แก้ VLAN และประกาศฐานข้อมูล. Client รับฐานข้อมูล โดยทั่วไปแก้ VLAN เองไม่ได้. Transparent ดูแล VLAN local ไม่รับมาแทนฐานของตน และส่งต่อประกาศตามเวอร์ชัน/เงื่อนไข.\nRevision สูงกว่าอาจนำฐาน VLAN มาเขียนทับเมื่อเงื่อนไขตรง: ตรวจ domain/password/version/mode/revision ก่อนเสียบ switch เก่า. Revision สูงไม่ได้แปลว่าข้อมูลถูก.\nPruning ลด broadcast/unknown-unicast traffic ของ VLAN บน trunk ที่ปลายทางไม่ต้องใช้. ต่างจาก allowed list ซึ่งเป็นการอนุญาตแบบตั้งค่า; pruning ไม่ใช่กลไกควบคุมสิทธิ์แทน allowed list."
            },
            {
              "title": "DTP / VLAN hopping / Isolation",
              "text": "DTP เจรจา trunk; switch spoofing พยายามทำให้พอร์ตผู้ใช้เป็น trunk. ป้องกัน: switchport mode access + switchport nonegotiate; trunk ที่ตั้งเองใช้ mode trunk + nonegotiate ทั้งสองฝั่งที่เหมาะสม.\nDouble tagging ใช้ tag ซ้อนและการถอด native tag: ไม่ให้ผู้ใช้อยู่ native VLAN, native ให้ตรงกันและแยกจาก data, จำกัด VLAN ที่ผ่าน. ปิด DTP อย่างเดียวไม่แก้ทุกกรณี double tagging.\nVoice VLAN แยกเสียงจาก data แม้โทรศัพท์กับ PC ใช้พอร์ตเดียว: โทรศัพท์มัก tag voice; PC untagged เข้า access VLAN. ไม่ได้เข้ารหัสเสียงด้วยตัวมันเอง.\nProtected port: protected ↔ protected บน switch เดียวกันไม่ส่งต่อโดยตรง แต่ยังคุยกับ unprotected ได้. Private VLAN: primary/secondary; isolated ไม่คุยกับ isolated/community โดยตรง, community คุยในกลุ่ม, promiscuous เช่น gateway เข้าถึงตาม mapping. Protected ไม่เท่ากับ PVLAN เต็มรูปแบบ."
            }
          ],
          [
            {
              "title": "03 STP / BPDU / Root election",
              "text": "L2 loop ทำให้ broadcast storm, duplicate frames, MAC flapping เพราะ Ethernet frame ไม่มี TTL สำหรับหยุด loop. STP แลก BPDU สร้าง topology ที่ไม่วน และเก็บลิงก์สำรองไว้. ไม่ต้องถอดสายสำรองทิ้ง.\nRoot = Bridge ID ต่ำสุด. BID = priority + extended system ID (VLAN ใน PVST) + MAC; priority เท่ากัน → MAC ต่ำชนะ. ตั้ง priority เป็นขั้น 4096 ตามแพลตฟอร์ม; ค่าทั่วไป 32768 (+VLAN). Root bridge ไม่มี root port; พอร์ตใช้งานบน root เป็น designated ตาม segment.\nRoot Port (RP): หนึ่งต่อ non-root switch ต่อ instance; เส้นทางรวม cost ถึง root ต่ำสุด. หากเท่ากัน ดู sender BID ต่ำ → sender port ID ต่ำ → local port ID ต่ำตามลำดับ tie ที่ยังเหลือ.\nDesignated Port (DP): ตัวแทนแต่ละ segment ที่เสนอ root path ดีสุด; เทียบ root ID → cost → BID → port ID. พอร์ตที่เป็นทางสำรองถูก block/discard. อ่าน role กับ state แยกกัน.\nShort path cost ที่พบบ่อย: 10M=100, 100M=19, 1G=4, 10G=2; long method ใช้คนละตัวเลข ต้องตรวจ mode. Cost ถึง root = ผลรวม cost ของพอร์ตตามทางไป root."
            },
            {
              "title": "STP / RSTP / PVST / MST",
              "text": "802.1D STP states: Blocking → Listening → Learning → Forwarding; Disabled เมื่อไม่ร่วมทำงาน. Listening ยังไม่เรียน MAC; Learning เรียน MAC แต่ยังไม่ส่ง user data. Timer ทั่วไป hello 2s, max age 20s, forward delay 15s; บางเหตุการณ์อาจรวมรอถึงประมาณ 50s.\nRSTP 802.1w: Discarding / Learning / Forwarding; role Root, Designated, Alternate, Backup; proposal/agreement และ edge ช่วย converge เร็วเมื่อเงื่อนไขเหมาะสม ไม่รับประกันเวลาตายตัวทุกเหตุการณ์.\nPVST+ แยก tree ต่อ VLAN; Rapid PVST+ ใช้ RSTP ต่อ VLAN. MSTP map หลาย VLAN เข้า instance ลดจำนวน tree; region ต้องมีชื่อ/revision/VLAN mapping ตรงกัน. ปรับ root ต่อ VLAN/instance เพื่อออกแบบเส้นทาง."
            },
            {
              "title": "PortFast / BPDU Guard / Root Guard",
              "text": "PortFast ให้พอร์ตปลายทางเข้าส่งต่อเร็ว; STP ยังตรวจ BPDU จึงไม่ใช่ปิด STP. ใช้กับ PC/server ตาม topology. BPDU Guard รับ BPDU ใด ๆ บนพอร์ตที่เปิด guard → err-disabled; กันการเสียบ switch/การส่ง BPDU จากขอบเครือข่าย.\nRoot Guard ใช้ทิศที่ไม่ควรมี root: ได้ superior BPDU → root-inconsistent; เมื่อ superior BPDU หายจะคืนตามกลไก. ไม่ใช่ shutdown แบบ BPDU Guard.\nBPDU spoofing ส่ง BID/Root ID ที่ดีกว่าเพื่อเปลี่ยน root/เส้นทาง. วาง Root Guard ที่ downlink และ BPDU Guard ที่ edge ตามหน้าที่. ตรวจ show spanning-tree vlan 1, inconsistentports, interfaces status err-disabled. อย่าสับสน MAC flapping จาก loop กับ MAC aging ปกติ."
            }
          ],
          [
            {
              "title": "04 Inter-VLAN / ROAS / SVI",
              "text": "Trunk ขนหลาย VLAN แต่ไม่ route ให้เอง. Router-on-a-Stick (ROAS): switch trunk → physical router interface เดียว → sub-interface ต่อ VLAN, encapsulation dot1Q VLAN_ID, IP เป็น gateway ของ subnet นั้น. Physical ต้อง no shutdown และ VLAN ต้องอนุญาตบน trunk.\nL3 Switch: สร้าง VLAN, interface vlan ID (SVI) ใส่ gateway IP, no shutdown และ ip routing. SVI จะ up ตามเงื่อนไข VLAN/พอร์ตที่ active ของรุ่นนั้น; สร้าง SVI อย่างเดียวอาจยัง down.\nROAS ใช้พอร์ตร่วมสำหรับหลาย VLAN, ข้าม VLAN วิ่งเข้าและออกลิงก์เดียวกัน; full-duplex ส่ง/รับพร้อมกันได้ จึงไม่ควรสรุปว่า 1Gbps เหลือ 500Mbps เสมอ. L3 switch route ในระบบ switch เหมาะกับ traffic ภายในมากกว่า แต่ขึ้นกับฮาร์ดแวร์/แบบเครือข่าย."
            },
            {
              "title": "ตามแพ็กเก็ต A → B ข้าม VLAN",
              "text": "A ตรวจ mask: B อยู่คนละ subnet → ใช้ default gateway. A ARP หา gateway → frame src MAC=A, dst MAC=gateway, IP src=A/dst=B. Switch ใส่ tag บน trunk ตาม VLAN. Router เปิด L2 header, หา route ด้วย destination IP, ลด TTL, สร้าง frame ใหม่ให้ next hop/เครื่อง B.\nถ้าไม่มี NAT: IP src/dst คงเดิมตลอดทาง; MAC เปลี่ยนเมื่อข้าม router แต่ละ hop; IPv4 header checksum เปลี่ยนตาม TTL. Switch ที่ bridge ปกติไม่ลด IP TTL. ขากลับต้องมี route และ gateway ที่ถูกต้องด้วย.\nถ้า A/B อยู่ subnet เดียวกัน A ARP หา B โดยตรง. ตั้ง mask ผิดอาจทำให้ ARP หาเครื่องไกลแทนการส่ง gateway. เลือก route ด้วย longest-prefix match ก่อนเทียบ AD/metric ของเส้นทางสำหรับ prefix ที่แข่งขันกัน."
            },
            {
              "title": "Management / Running / Startup",
              "text": "L2 switch ใช้ management SVI เป็น IP สำหรับเข้าไปบริหาร ไม่ได้ทำให้ route ระหว่าง VLAN โดยอัตโนมัติ. ตั้ง ip default-gateway ให้บริหารจาก subnet อื่นเมื่อไม่ได้เปิด IP routing. L3 ที่เปิด routing ใช้ตาราง route/default route.\nRunning-config อยู่ที่ใช้งานปัจจุบัน; startup-config ใช้ตอนบูต. copy running-config startup-config หลังตรวจผล. enable secret ตั้งรหัส privileged; line console/vty password ต้อง login ตามแบบแลป. ชื่อ interface และช่วง vty ขึ้นกับรุ่น."
            },
            {
              "title": "ACL / วิธีตรวจปัญหา",
              "text": "ACL อ่านบนลงล่าง match แรกแล้วหยุด; มี implicit deny ท้าย. Standard ดู source IP; Extended ดู src/dst/protocol/port. in = รับเข้าที่ interface, out = ก่อนส่งออกจาก interface; คิดจากมุม router.\nROAS lab ใส่ FILTER_STAFF_TRAFFIC in ที่ g0/0.10: ปฏิเสธ Staff→Kali, อนุญาตเว็บ TCP80/443+ICMP echo ไป web server, deny traffic อื่นเข้า server subnet แล้ว permit ip any any. ACL นี้ stateless: คำตอบจาก Staff ไป Kali ก็อาจถูก deny แม้ Kali เริ่มก่อน.\nลำดับเช็ก: สาย/port up → VLAN/access/trunk/native/allowed → IP/mask/gateway → route ไป–กลับ → ACL/counter → capture. ping gateway ผ่านแต่ข้าม VLAN ไม่ได้ให้ดู routing/ACL; อย่าเปลี่ยนหลายค่าโดยไม่ตรวจผลแต่ละจุด."
            }
          ]
        ]
      },
      {
        "side": "หลัง",
        "title": "OSPF / EIGRP · FHRP · 802.1X / Tools · WAN",
        "columns": [
          [
            {
              "title": "05 OSPF / Neighbor / DR",
              "text": "OSPF เป็น link-state IGP; Hello ค้นหา/รักษา neighbor, LSA เผยแพร่ link state, LSDB เป็นฐาน SPF. ใช้ IP protocol 89; multicast 224.0.0.5 AllSPFRouters / .6 AllDRouters. Process ID มีผล local ไม่ต้องเท่ากัน; area และค่าบนลิงก์ที่จำเป็นต้องตรง. Router ID 32-bit ต้องไม่ซ้ำ; ตั้งเองได้.\nNeighbor ต้องตรวจ subnet/area, hello-dead timers, network type, auth/key, passive-interface และ MTU เมื่อ ExStart/Exchange ค้าง. States: Down→Init→2-Way→ExStart→Exchange→Loading→Full. DROTHER↔DROTHER ค้าง 2-Way บน broadcast เป็นปกติ; Full กับ DR/BDR.\nBroadcast elect DR/BDR: interface priority สูงสุด → RID สูงสุด; priority 0 ไม่มีสิทธิ์. ไม่ preempt DR เดิมทันทีเมื่อมีตัวดีกว่าเข้ามา. P2P ไม่มี DR/BDR. ค่า timer ที่พบบ่อย broadcast/P2P hello10/dead40 ต้องตรวจจริง. Passive ไม่ส่ง Hello ที่ interface นั้นแต่ยังประกาศ network ที่เข้าเงื่อนไข."
            },
            {
              "title": "Wildcard / Cost / Authentication",
              "text": "Wildcard = 255.255.255.255 − mask; บิต0ต้องตรง บิต1ไม่สนใจ. /24→0.0.0.255, /30→0.0.0.3, /29→0.0.0.7, host→0.0.0.0. network ใน OSPF/EIGRP ใช้เลือก local interface ที่ร่วมโปรโตคอล.\nOSPF cost = reference bandwidth / interface bandwidth, อย่างน้อย1; IOS ตัดเศษลง. รวม cost ขาออกตามเส้นทางและลิงก์ LAN ปลายทาง. Reference ต้องสอดคล้องทั้งระบบ; bandwidth ใช้คำนวณ ไม่ได้จำกัดความเร็วจริง. Equal-cost อาจมีหลาย next hop.\nแลป ref10000Mbps: Gi1G cost10; 1.544M cost6476; R1→R4 LAN ผ่าน Gi broadcast =10+10=20; backup P2P=6476+10=6486. สไลด์ที่ปัดเป็น6477/รวม12954 ใช้คนละวิธีจาก IOS.\nMD5 authentication ตรวจ digest/ผู้รู้ shared key ไม่ได้เข้ารหัสข้อมูลแพ็กเก็ต. ตรวจ key ID, secret, mode ทั้งสองฝั่ง; auth ผิด neighbor ไม่ขึ้น. OSPF AD110, EIGRP internal90/external170 เป็นค่า default ที่พบใน IOS."
            },
            {
              "title": "EIGRP / Summary / Redistribution",
              "text": "EIGRP ใช้ IP protocol88, multicast224.0.0.10; DUAL เลือก successor และหาเส้นทาง loop-free. Neighbor table=เพื่อน; topology=เส้นทางเรียนรู้; routing=เส้นทางใช้งาน. Metric default ใช้ min bandwidth + sum delay ตาม K values ไม่ใช่นับ hop.\nFD=ดีที่สุดของเรา; RD=distance ที่ neighbor รายงาน. Feasible successor ต้อง RD < FD ของ successor (เท่ากันไม่ผ่าน). ไม่มี FS แล้ว main ล่ม → query/diffusing computation; มีเส้นทางสำรองทางกายภาพไม่ได้แปลว่ามี FS.\nSummary ต้อง prefix ต่อเนื่อง/ตรง boundary: 172.16.8–11 /24→172.16.8.0/22, mask255.255.252.0; 10.10.0–3 /24→10.10.0.0/22. ดู common leading bits อย่ารวมกิน subnet ที่ไม่ตั้งใจ.\nRedistribution นำ route ระหว่าง protocol; EIGRP ต้อง seed metric ที่เหมาะสม (BW,delay,reliability,load,MTU). ใส่ subnets ตอนเข้า OSPF ตาม IOS. Tag+route-map กัน route feedback; ตรวจ route ไปและกลับ; summary กับ redistribute ทำคนละหน้าที่."
            }
          ],
          [
            {
              "title": "06 FHRP / HSRP / VRRP / GLBP",
              "text": "FHRP ให้ host ใช้ Virtual IP+Virtual MAC เป็น default gateway คงที่เมื่อ router เปลี่ยนบทบาท. Real IP ของแต่ละ router ต้องไม่ซ้ำ. Host ARP หา VIP; ผู้รับผิดชอบตอบ virtual MAC. มี router สองเครื่องอย่างเดียวไม่ทำให้ gateway ที่ host ตั้งไว้สลับเอง.\nHSRP (Cisco): Active forward, Standby รอรับช่วง. Priority สูงชนะ (default100); เท่ากันใช้ real IP สูงตามเงื่อนไข election. preempt อนุญาตตัว priority สูงกว่าแย่งกลับ; ไม่เปิดอาจปล่อย Active เดิมต่อ. Active/Standby ต่อ group ไม่ได้แบ่งทุก packet ของ group ให้สองเครื่องเท่ากัน.\nVRRP (มาตรฐาน): Master/Backup; priority default100, IP owner255, 0 สื่อสละบทบาท; preemption เปิดเป็นค่าเริ่มต้นตาม VRRP. Host ใช้ VIP เช่นกัน. ระบุ version เมื่อตอบ timers/รายละเอียด.\nGLBP (Cisco): AVG เลือก/ตอบ ARP ด้วย virtual MAC ของ AVF; AVF ส่ง traffic ของ MAC ที่ได้รับมอบหมาย. Round-robin แจก MAC หมุนตาม ARP; weighted แบ่งตาม weight; host-dependent ผูก host ให้คงที่. ARP cache ทำให้ host เดียว ping ซ้ำไม่ได้พิสูจน์การกระจายหลาย AVF."
            },
            {
              "title": "Protocol / Multicast / Virtual MAC",
              "text": "HSRPv1: UDP1985 →224.0.0.2, MAC0000.0c07.acXX (XX=group hex). HSRPv2: UDP1985 →224.0.0.102, MAC0000.0c9f.fXXX (XXX=group hex), รองรับ group มากขึ้น.\nVRRP IPv4: IP112 →224.0.0.18, MAC0000.5e00.01XX (VRID hex). GLBP: UDP3222 →224.0.0.102, virtual MAC prefix0007.b4… แยก AVF. IP protocol number ไม่ใช่ TCP/UDP port. HSRPv2 กับ GLBP multicast เดียวกันแต่ UDP port ต่าง.\nReal MAC อาจต่างจาก virtual MAC; ดู ARP ที่ client + show standby/vrrp/glbp ประกอบ capture. อย่าสรุปบทบาทจาก IP ผู้ส่งเพียงค่าเดียว."
            },
            {
              "title": "Timers / Tracking / Failover",
              "text": "HSRP default hello3s/hold10s; แลปตั้ง1/4. Hold หมดหลังไม่ได้ยิน active จึง elect; hello interval ไม่เท่ากับเวลาที่ traffic ฟื้น.\nVRRPv2: Master_Down=3×Advertisement+Skew; Skew=(256−priority)/256 วินาที. Ad1s, Backup priority100 →3.609s. VRRPv3 skew ยังขึ้นกับ advertisement interval.\nTracking ลด priority เมื่อ uplink เสียแม้ LAN interface ยัง up. ตัวอย่าง110−30=80 < backup100; มี preempt ตามนโยบายจึงสลับตาม priority. อีกแลป120−30=90 <100: อย่าปนเลขต่าง scenario.\nวัด failover จาก ping ต่อเนื่อง + เวลาของ last good/first restored + control-plane capture + show role. Ping ทุก1s ให้ความละเอียดจำกัด; เวลารวมขึ้นกับ timer, election, ARP/MAC relearn และเงื่อนไขเส้นทาง. GLBP failover AVG กับ AVF มีหน้าที่ต่างกัน.\nVIP ต้อง subnet เดียวกับ host, group/version/virtual IP ตรงกันระหว่าง router; protocol ถูกบล็อกหรือ config ไม่ตรงอาจเห็น active/master ซ้ำ. ตัด uplink เพื่อตรวจ track และตัด LAN เพื่อตรวจ gateway reachability เป็นคนละการทดลอง."
            }
          ],
          [
            {
              "title": "07 Standards / 802.1X / AAA",
              "text": "IEEE802.3=Ethernet; 802.1Q=VLAN tagging/bridging; 802.1X=port-based network access control. 802.1X ไม่ใช่การใส่ VLAN tag. Authentication=เป็นใคร; Authorization=ทำอะไรได้; Accounting=บันทึกการใช้งาน.\nSupplicant=client ผู้ขอ, Authenticator=switch/AP คุมพอร์ต, Authentication server=เช่น RADIUS ตรวจข้อมูล. Supplicant↔Authenticator ใช้ EAP over LAN (EAPOL); Authenticator↔Server ส่ง EAP ผ่าน RADIUS. ก่อน authorize พอร์ตจำกัด user traffic ตาม policy แต่เปิดทางข้อความควบคุมที่ต้องใช้.\nSuccess → authorize พอร์ต/อาจให้ dynamic VLAN ตาม policy; Failure/timeout ต้องแยกว่า client ไม่ตอบ, EAP method/credential/cert ผิด หรือ RADIUS ไม่ถึง. EAPOL เห็นที่ access link; capture ที่ server มักเห็น RADIUS. MAC security ไม่ยืนยันตัวบุคคลแทน 802.1X. การเข้ารหัส traffic ขึ้นกับเทคโนโลยีอื่นด้วย."
            },
            {
              "title": "เลือกเครื่องมือจากคำถาม",
              "text": "ip addr/ip route/ip neigh: IP, route, ARP cache local. ping: ICMP reachability/latency; ping ไม่ผ่านอาจถูกกรองจึงไม่ยืนยันว่า host ปิด. traceroute/tracert: TTL/hop response; เครื่องหมาย * อาจไม่ตอบ probe ไม่ได้แปลว่าทุก traffic ไปไม่ได้.\narp-scan: พบ IP↔MAC ภายใน local broadcast segment; ARP ไม่ข้าม router. nmap -sn สำรวจ host; scan port ดู open/closed/filtered. Open=มีบริการตอบรับ, closed=hostตอบว่าไม่ฟัง, filtered=ตัวกรอง/ไม่มีหลักฐานพอ. MAC ของ next hop ไม่ใช่ MAC ของ host ต่าง subnet.\nตามหาเครื่อง: IP→ARP/MAC→show mac address-table address MAC→พอร์ต/VLAN→show interfaces status/switchport→CDP/ผังถ้าพอร์ตเป็น trunk แล้วไล่ switch ถัดไป. CDP รายงาน neighbor ที่รองรับ ไม่ใช่รายชื่อ host ทุกตัว."
            },
            {
              "title": "Capture / Display filter / หลักฐาน",
              "text": "tcpdump capture filter (BPF) เลือกก่อนบันทึก; Wireshark display filter เลือกแสดงหลังจับ ใช้ syntax คนละภาษา. Capture ที่ผิดตำแหน่งทำให้ไม่เห็นแม้ protocol ทำงาน.\nCapture → Display: ip proto89 → ospf หรือ ip.proto==89; ip proto88 → eigrp; udp port1985 → hsrp; ip proto112 → vrrp; udp port3222 → udp.port==3222; ether proto0x888e → eapol. host192.168.20.10 → ip.addr==192.168.20.10.\nDisplay vlan.id==10 ใช้กับเฟรมที่มี tag จริง. Capture ที่ access port โดยทั่วไป untagged; trunk/SPAN ต้องรักษา encapsulation และเลือก interface ที่เหมาะสม. Promiscuous mode ไม่ทำให้ switch ส่ง unicast ทุกพอร์ตมาให้.\nHSRP Hello/OSPF Hello ไม่พิสูจน์ data traffic ผ่านด้วยตัวมันเอง; ต้องดู ping/route/ACL/port ประกอบ. เช็ก timestamp, interface, source/destination, VLAN, protocol และทิศทางก่อนสรุป. เก็บ pcap เพื่อย้อนเทียบเหตุการณ์ก่อนตัด/หลังตัด/หลังคืนลิงก์."
            }
          ],
          [
            {
              "title": "08 WAN / PPP / CHAP",
              "text": "WAN เชื่อม LAN ที่อยู่ไกลผ่านผู้ให้บริการ/ลิงก์ระหว่างไซต์. เลือกจาก bandwidth, latency, availability, ราคา และรูปแบบ traffic. Point-to-point=เชื่อมสองปลาย; multipoint=หลายปลายร่วมโครงข่ายตามบริการ.\nPPP เป็น data-link protocol ของ point-to-point: LCP ตั้ง/ทดสอบ link → authentication ถ้ากำหนด → NCP ตั้ง network-layer protocol → data. IPCP เป็น NCP สำหรับ IPv4; PPP ไม่ใช่ IP routing protocol. LCP สร้างลิงก์ไม่ได้หมายความว่า IP สื่อสารได้แล้ว.\nCHAP: challenger ส่ง challenge+ID → peer hash challenge+shared secret → challenger คำนวณเทียบ → success/failure; อาจ challenge ซ้ำเป็นระยะ. Secret ไม่ถูกส่งตรง ๆ ในขั้น hash response แต่ไม่ได้เข้ารหัส payload ทั้งหมด. PAP ส่ง credential แบบ plaintext ตามกลไก ต้องพึ่งชั้นป้องกันอื่นหากใช้.\nPPP authentication ผิดให้ดู username/ชื่อ peer/secret และ link encapsulation; routing และ addressing ต้องตรวจเพิ่มหลัง link ผ่าน."
            },
            {
              "title": "MPLS / VPN / การแยกกับเข้ารหัส",
              "text": "MPLS ส่งต่อด้วย label ใน provider network: ingress PE push label, P router swap label, egress pop ตามกลไก. CE อยู่ฝั่งลูกค้า, PE เชื่อมลูกค้า, P อยู่ core. Label เลือก forwarding path ไม่ใช่เลข IP address ของ host.\nMPLS L3VPN ใช้ VRF แยก routing table ลูกค้า; แยกเครือข่าย/route ไม่ได้เข้ารหัส payload อัตโนมัติ. ถ้าต้องการ confidentiality ใช้ระบบ encryption เช่น IPsec ตามการออกแบบ.\nRemote-Access VPN: ผู้ใช้/อุปกรณ์รายบุคคลเชื่อมเข้าองค์กรจากภายนอก มี client/authentication ตามระบบ. Site-to-Site VPN: gateway เชื่อม LAN ของสำนักงาน ใช้ policy/route ระหว่างไซต์; ผู้ใช้ LAN ไม่จำเป็นต้องเปิด client เองทุกคน.\nVPN คือการเชื่อมเชิงตรรกะผ่านเครือข่ายที่ใช้ร่วมกัน; ความลับ/ความถูกต้อง/การยืนยันตัวตนขึ้นกับ protocol และ config. Tunnel up ยังต้องตรวจ selector, route, ACL และ return path ของ traffic."
            },
            {
              "title": "Topology / Summary / Border router",
              "text": "Hub-and-Spoke: สาขาผ่าน hub ดูแลง่าย ลิงก์น้อย; spoke↔spoke อ้อมผ่าน hub และ hub เป็นจุดสำคัญ. n โหนดแบบ hub เดียวต้อง n−1 ลิงก์.\nPartial Mesh: เพิ่มทางตรงเฉพาะคู่ที่ใช้บ่อย ลดการอ้อมและเพิ่มทางสำรองบางส่วน ต้นทุนปานกลาง. Full Mesh: ทุกคู่มีลิงก์ตรง n(n−1)/2; n=4→6, n=5→10; ทางตรงมากแต่ตั้งค่า/ดูแลเพิ่มเร็ว. สำรองทางกายภาพต้องมี routing ที่ใช้เส้นทางนั้นได้ด้วย.\nWAN lab: R1 EIGRP100 ↔ R2 border ↔ R3 OSPF Area0. R2 ร่วมสองโปรโตคอลแล้ว redistribute ไป–กลับพร้อม metric/tag. OSPF/EIGRP อยู่เครื่องเดียวกันเฉย ๆ ไม่ทำให้แลก route อัตโนมัติ.\nR1 เรียน LAN ฝั่ง R3 เป็น D EX; R3 เรียน LAN ฝั่ง R1 เป็น O E2 ตาม config. route tag กันนำ route ที่เคย redistribute กลับเข้าต้นทาง. สองทิศต้องมี route และ PC ต้อง gateway ถูก.\nแลปตัด R1–R2 ที่มีเส้นทางกายภาพเดียวจะขาดจนคืนลิงก์ ไม่ใช่ตัวอย่างที่ต้องสลับไป alternate path ได้เสมอ. แยก route withdrawal, convergence หลังคืน และ FHRP gateway failover ให้ชัด."
            }
          ]
        ]
      }
    ]
  },
  {
    "id": "practical",
    "title": "ภาคปฏิบัติ",
    "description": "แม่แบบ Cisco IOS / Kali จากงานแลบ พร้อมค่าตัวอย่าง วิธีตรวจ และจุดแก้ปัญหา",
    "pages": [
      {
        "side": "หน้า",
        "title": "Console / MAC · VLAN / STP · ROAS / ACL",
        "columns": [
          [
            {
              "title": "เริ่ม IOS / โหมด / Save",
              "text": "> user EXEC → enable → # privileged → conf t → (config)#; int ... เข้า interface; exit ย้อน1ชั้น, end กลับ #; show/copy ใช้ # หรือ do show ... ใน config. คำย่อด้านล่างเป็น IOS; เปลี่ยน IP/พอร์ตตามผัง. ! เป็น comment/separator; ไม่พิมพ์เครื่องหมาย / เพื่อรวมคำสั่ง.",
              "code": "enable\nconfigure terminal\nhostname SW1\nno ip domain-lookup\nenable secret cisco123\nline console 0\n password cisco\n login\n exec-timeout 5 0\n exit\nline vty 0 4\n password cisco\n login\n exit\ninterface vlan 1\n ip address 192.168.1.2 255.255.255.0\n no shutdown\n exit\nip default-gateway 192.168.1.1\nend\ncopy running-config startup-config"
            },
            {
              "title": "Week1 SW2 / ตรวจ MAC",
              "text": "SW2 เปลี่ยน hostname และ SVI เป็น192.168.1.3/24. ให้ PC อยู่ subnet เดียวกันแล้ว ping เพื่อสร้าง source traffic. Static example ปรับ MAC/พอร์ตจริง; clear dynamic แล้วต้องส่งเฟรมเพื่อเรียนใหม่.",
              "code": "show version\nshow running-config\nshow startup-config\nshow ip interface brief\nshow interfaces status\nshow mac address-table dynamic\nshow mac address-table aging-time\nshow mac address-table address 0011.2233.4455\nclear mac address-table dynamic\nconf t\nmac address-table static 0011.2233.4455 vlan 1 interface fa0/1\nend\nshow mac address-table static"
            },
            {
              "title": "Port Security / กู้ err-disabled",
              "text": "Fa0/1 protect; Fa0/2 restrict; Fa0/3 shutdown. maximum2 แล้วให้ MAC ที่3 ส่งเฟรม. Sticky ถูกเก็บใน run; save หลังตรวจ. คำสั่ง recovery ใช้หลังแก้ต้นเหตุ.",
              "code": "conf t\ninterface range fa0/1 - 3\n switchport mode access\n switchport port-security\n switchport port-security maximum 2\n switchport port-security mac-address sticky\n exit\ninterface fa0/1\n switchport port-security violation protect\ninterface fa0/2\n switchport port-security violation restrict\ninterface fa0/3\n switchport port-security violation shutdown\nend\nshow port-security\nshow port-security interface fa0/3\nshow port-security address\nshow interfaces status err-disabled\nconf t\ninterface fa0/3\n shutdown\n no shutdown\nend"
            },
            {
              "title": "Voice VLAN / โทรศัพท์ + PC",
              "text": "พอร์ต data VLAN10 + voice VLAN100; สร้าง VLAN100 ก่อน. โทรศัพท์ที่รองรับ tag เสียง ส่วน PC ใช้ data VLAN.",
              "code": "conf t\nvlan 100\nexit\ninterface fa0/5\n switchport mode access\n switchport access vlan 10\n switchport voice vlan 100\nend"
            }
          ],
          [
            {
              "title": "VTPv2 / VLAN / Access / Trunk",
              "text": "SW1 server; SW2,SW3 client (เปลี่ยนเฉพาะ mode). ตั้ง trunk ทุกฝั่งตามผัง: SW1Gi0/1→SW2, Gi0/2→SW3; clientGi0/1. Native Week2=999; ROAS=666 แยกคนละแลป. VLAN สร้างบน server; ตรวจ revision ก่อนต่อระบบ.",
              "code": "conf t\nvtp domain LABCORP\nvtp password vtp123\nvtp version 2\nvtp mode server\nvlan 10\n name SALES\nvlan 20\n name IT\nvlan 30\n name HR\nvlan 999\n name NATIVE_UNUSED\nexit\ninterface gi0/1\n switchport mode trunk\n switchport trunk native vlan 999\n switchport trunk allowed vlan 10,20,30,999\n switchport nonegotiate\n no shutdown\n exit\ninterface fa0/1\n switchport mode access\n switchport access vlan 10\n switchport nonegotiate\n no shutdown\nend\nshow vlan brief\nshow vtp status\nshow interfaces trunk\nshow interfaces fa0/1 switchport\nshow cdp neighbors detail"
            },
            {
              "title": "Protected / Allowed / Pruning",
              "text": "protected Fa0/1↔Fa0/2 ไม่คุยตรง แต่คุย Fa0/4 unprotected ได้ถ้า IP/VLAN ถูก. ตัวอย่างกำหนดทั้งสามพอร์ตเป็น access VLAN10. เพิ่ม allowed ด้วย add เพื่อไม่ทับรายการ; VLAN40 ต้องสร้างให้ใช้งานได้. vtp pruning ใช้ที่ server หาก image รองรับ.",
              "code": "conf t\ninterface range fa0/1 - 2\n switchport mode access\n switchport access vlan 10\n switchport protected\nexit\ninterface fa0/4\n switchport mode access\n switchport access vlan 10\n no switchport protected\nexit\ninterface gi0/1\n switchport trunk allowed vlan add 40\nend"
            },
            {
              "title": "STP / PortFast / Guards",
              "text": "SW1 root ของ VLAN1; SW2Gi0/1 ในใบงานเป็นพอร์ต PC. Root Guard ใช้เฉพาะ downlink ที่ไม่ควรเห็น root. อย่าใช้ PortFast/Guard แบบ edge บนลิงก์ switch ระหว่างกันโดยไม่ดูบทบาท.",
              "code": "conf t\nspanning-tree vlan 1 root primary\ninterface gi0/1\n switchport mode access\n spanning-tree portfast\n spanning-tree bpduguard enable\nend\nshow spanning-tree vlan 1\nshow spanning-tree interface gi0/1 detail\nshow spanning-tree inconsistentports\nshow interfaces status err-disabled\n! ตัวอย่าง Root Guard ที่ downlink\nconf t\ninterface fa0/10\n spanning-tree guard root\nend\nshow interfaces counters"
            },
            {
              "title": "พิสูจน์ผล VLAN / STP",
              "text": "VLAN เดียวข้าม switch ควรถึง; ต่าง VLAN ต้อง route. ตรวจ native/allowed ทั้งคู่. STP ดู Root/RP/DP/alternate แล้วตัด active link. BPDU Guard รับ BPDU → err-disabled; แก้เหตุแล้ว shut/no shut. Display: stp.type==0x00. แลป loop ใช้ no spanning-tree vlan 1; ปลดสายวงวนก่อนคืน spanning-tree vlan 1 แล้วค่อยต่อครบ. Kali ด้านล่างใช้ในวงแลปแยก.",
              "code": "sudo yersinia dtp -attack 1 -interface eth0\nsudo yersinia -G"
            }
          ],
          [
            {
              "title": "ROAS / L2 switch / IP plan",
              "text": "R1 g0/0 trunk → subif10/20/99 IP .1; R2 subifเหมือนกัน IP .2. Staff192.168.10.10, Web192.168.20.10, Kali192.168.99.100 (/24); gateway=.1 ของแต่ละ subnet. R1g0/1=10.0.0.1/30, R2=.2. ตัวอย่าง switch trunkGi0/0, accessพอร์ตเปลี่ยนตามผัง.",
              "code": "conf t\nvlan 10\nvlan 20\nvlan 99\nvlan 666\nexit\ninterface gi0/0\n switchport mode trunk\n switchport trunk native vlan 666\n switchport trunk allowed vlan 10,20,99\n switchport nonegotiate\nexit\ninterface fa0/1\n switchport mode access\n switchport access vlan 10\nend\n! R1\nconf t\ninterface g0/0\n no shutdown\ninterface g0/0.10\n encapsulation dot1Q 10\n ip address 192.168.10.1 255.255.255.0\ninterface g0/0.20\n encapsulation dot1Q 20\n ip address 192.168.20.1 255.255.255.0\ninterface g0/0.99\n encapsulation dot1Q 99\n ip address 192.168.99.1 255.255.255.0\ninterface g0/1\n ip address 10.0.0.1 255.255.255.252\n no shutdown\nexit\nrouter ospf 1\n router-id 1.1.1.1\n network 192.168.0.0 0.0.255.255 area 0\n network 10.0.0.0 0.0.0.3 area 0\nend"
            },
            {
              "title": "Extended ACL ของใบงาน ROAS",
              "text": "ใส่ R1 g0/0.10 inbound จาก Staff; ใช้ counter พิสูจน์จากต้นทาง Staff. deny ไป Kali เป็น stateless จึงอาจตัด reply ของ Staff ด้วย.",
              "code": "conf t\nip access-list extended FILTER_STAFF_TRAFFIC\n deny ip 192.168.10.0 0.0.0.255 host 192.168.99.100\n permit tcp 192.168.10.0 0.0.0.255 host 192.168.20.10 eq 80\n permit tcp 192.168.10.0 0.0.0.255 host 192.168.20.10 eq 443\n permit icmp 192.168.10.0 0.0.0.255 host 192.168.20.10 echo\n deny ip 192.168.10.0 0.0.0.255 192.168.20.0 0.0.0.255\n permit ip any any\nexit\ninterface g0/0.10\n ip access-group FILTER_STAFF_TRAFFIC in\nend\nshow access-lists FILTER_STAFF_TRAFFIC\nshow ip interface g0/0.10\nshow ip route\nshow ip interface brief"
            },
            {
              "title": "L3 SVI / ตรวจตามชั้น",
              "text": "ทางเลือกแทน ROAS: สร้าง VLAN บน L3 switch แล้ว SVI ตามตัวอย่าง; VLAN20 ทำซ้ำ IP192.168.20.1. ต้องมี active member/trunk ที่ทำให้ SVI up. ตรวจ host IP/mask/gateway → access VLAN → trunk → router/subif → route → ACL.",
              "code": "conf t\nip routing\ninterface vlan 10\n ip address 192.168.10.1 255.255.255.0\n no shutdown\nend"
            }
          ]
        ]
      },
      {
        "side": "หลัง",
        "title": "OSPF · HSRP / VRRP / GLBP · EIGRP–OSPF / Kali",
        "columns": [
          [
            {
              "title": "OSPF R1–R4 / Area0",
              "text": "N=1..4: Loopback0=N.N.N.N/32; Gi0/1=192.168.100.N/24; Gi0/2=10.0.N.1/24. R1/R2 Gi0/1 priority100, R3 default1, R4 priority0. R1Gi0/3=172.16.14.1/30, R4=.2, bandwidth1544 และ P2P. ตั้ง address/no shut ทุกลิงก์ตามนี้; ตัวอย่างด้านล่าง R1.",
              "code": "conf t\ninterface loopback 0\n ip address 1.1.1.1 255.255.255.255\ninterface gi0/1\n ip address 192.168.100.1 255.255.255.0\n ip ospf priority 100\n no shutdown\ninterface gi0/2\n ip address 10.0.1.1 255.255.255.0\n no shutdown\ninterface gi0/3\n ip address 172.16.14.1 255.255.255.252\n bandwidth 1544\n ip ospf network point-to-point\n no shutdown\nexit\nrouter ospf 1\n router-id 1.1.1.1\n auto-cost reference-bandwidth 10000\n network 192.168.100.0 0.0.0.255 area 0\n network 10.0.1.0 0.0.0.255 area 0\n network 172.16.14.0 0.0.0.3 area 0\n network 1.1.1.1 0.0.0.0 area 0\n passive-interface gi0/2\nend"
            },
            {
              "title": "MD5 / ตรวจ / ตัดเส้นทาง",
              "text": "ทุก router ตั้ง reference10000; R2/R3 ไม่ใส่ network P2P ที่ไม่มี. เปิด auth และ key ตรงกันทุก interface ที่มี OSPF neighbor; Gi0/3 ทำเฉพาะ R1/R4. Area auth ต้องพร้อมทั้ง area. R1ไปLAN R4: primary20; ตัด R4Gi0/1 → next hop172.16.14.2, cost6486; คืน no shutdown.",
              "code": "conf t\ninterface gi0/1\n ip ospf authentication message-digest\n ip ospf message-digest-key 1 md5 CCNAlab#2024\nexit\ninterface gi0/3\n ip ospf authentication message-digest\n ip ospf message-digest-key 1 md5 CCNAlab#2024\nexit\nrouter ospf 1\n area 0 authentication message-digest\nend\nshow ip ospf neighbor\nshow ip ospf interface brief\nshow ip ospf interface gi0/3\nshow ip route ospf\nshow ip route 10.0.4.0\nshow ip protocols\n! R4: ตัดแล้วตรวจจาก R1\nconf t\ninterface gi0/1\n shutdown\n! คืนลิงก์หลังวัด\n no shutdown\nend"
            },
            {
              "title": "OSPF ไม่ขึ้น / Cost ไม่ตรง",
              "text": "ตรวจ IP/mask/area, no shutdown, passive, auth/key, hello/dead, network type; stuck ExStart/Exchange ดู MTU. 2-Way ระหว่าง DROTHER ปกติ. Priority0 ไม่เป็น DR; ตัวใหม่ priority สูงไม่แย่ง DR เดิมทันที. bandwidth1544 เป็นค่าคำนวณ Kbit/s; auto-cost10000 เป็น Mbit/s. IOSตัดเศษ cost6476 ไม่ใช่6477."
            },
            {
              "title": "Common masks / Route codes",
              "text": "/24 255.255.255.0 WC0.0.0.255; /30 .252 WC.3; /29 .248 WC.7; /22 255.255.252.0 WC0.0.3.255. C=connected, L=local, O=OSPF, O E2=external OSPF, D=EIGRP, D EX=external EIGRP. show ip route <IP> ใช้ดู route ที่ match ปลายทาง."
            }
          ],
          [
            {
              "title": "FHRP lab / HSRPv2",
              "text": "แต่ละแลปใช้ group1: R1 real .2 priority110, R2 real .3 priority100, VIP .1. HSRP subnet192.168.10.0/24; VRRP .20.0/24; GLBP .30.0/24. ใช้ interfaceGi0/1 ตามใบงาน. แม่แบบ R1; R2 เปลี่ยน real IP/priority. Client gateway=VIP.",
              "code": "conf t\ninterface gi0/1\n ip address 192.168.10.2 255.255.255.0\n no shutdown\n standby version 2\n standby 1 ip 192.168.10.1\n standby 1 priority 110\n standby 1 preempt\n standby 1 timers 1 4\nend\nshow standby brief\nshow standby gi0/1"
            },
            {
              "title": "VRRP / GLBP (แยกแต่ละแลป)",
              "code": "conf t\ninterface gi0/1\n ip address 192.168.20.2 255.255.255.0\n no shutdown\n vrrp 1 ip 192.168.20.1\n vrrp 1 priority 110\n vrrp 1 preempt\n vrrp 1 timers advertise 1\nend\nshow vrrp brief\n! GLBP R1 / R2 เปลี่ยนเป็น .3 pri100\nconf t\ninterface gi0/1\n ip address 192.168.30.2 255.255.255.0\n no shutdown\n glbp 1 ip 192.168.30.1\n glbp 1 priority 110\n glbp 1 preempt\n glbp 1 load-balancing round-robin\nend\nshow glbp brief\nshow glbp"
            },
            {
              "title": "Tracking (อีกตัวอย่าง group10)",
              "text": "กรณี priority120 ลด30→90 แพ้ backup100. ถ้าใช้110จะเหลือ80. เปลี่ยน interface ให้ตรง router ที่ใช้; standby preempt ตั้งทั้งสองฝั่งที่ต้องแย่งกลับ.",
              "code": "conf t\ntrack 1 interface g0/0/1 line-protocol\ninterface g0/0/0.10\n standby 10 priority 120\n standby 10 preempt\n standby 10 track 1 decrement 30\nend\nshow track 1\nshow standby brief"
            },
            {
              "title": "Failover / ARP / Capture",
              "text": "เริ่ม capture+ping → บันทึกบทบาท → shutdown interface ตามโจทย์ → ดู packet loss และบทบาทใหม่ → no shut → ดู preempt/recovery. Linux ping -i0.2 ได้ความละเอียดกว่าทุก1s. GLBP ทดสอบหลาย client/ARP ใหม่; hostเดียวมี ARP cache จึงไม่เห็นการแบ่งทุก packet.",
              "code": "# Kali: เปลี่ยน interface ตาม ip -br addr\nping -i 0.2 192.168.10.1\nsudo tcpdump -ni eth0 -w failover.pcap 'udp port 1985 or icmp or arp'\n# Windows\nping -t 192.168.10.1\narp -a"
            },
            {
              "title": "Filter จับคู่ให้ถูกภาษา",
              "text": "Wireshark display: hsrp / vrrp / ospf / eigrp / stp / eapol / arp / icmp; ip.proto==89 (OSPF), ==88 (EIGRP), ==112 (VRRP); udp.port==1985 HSRP, ==3222 GLBP. BPF: ip proto 89 / ip proto 88 / ip proto 112 / udp port 1985 / udp port 3222. ใช้ or รวมในภาษาเดียวกัน."
            }
          ],
          [
            {
              "title": "WAN 3 routers / IP plan / Routing",
              "text": "R1g0/0 LAN10=192.168.10.1/24, g0/1=10.0.12.1/30; R2g0/0=.12.2/30, g0/1=10.0.23.1/29; R3g0/0=.23.2/29, g0/1 LAN30=192.168.30.1/24. PC1=.10.10 gw.10.1; PC2=.30.30 gw.30.1; Kali10.0.23.3/29. ใส่ IP/no shut ก่อน. คำสั่งแต่ละกลุ่มเริ่ม global config.",
              "code": "! R1 (conf t)\nrouter eigrp 100\n eigrp router-id 1.1.1.1\n network 192.168.10.0 0.0.0.255\n network 10.0.12.0 0.0.0.3\n passive-interface g0/0\n no auto-summary\nend\n! R2 (conf t)\nrouter eigrp 100\n eigrp router-id 2.2.2.2\n network 10.0.12.0 0.0.0.3\n no auto-summary\n exit\nrouter ospf 1\n router-id 2.2.2.2\n network 10.0.23.0 0.0.0.7 area 0\nend\n! R3 (conf t)\nrouter ospf 1\n router-id 3.3.3.3\n network 10.0.23.0 0.0.0.7 area 0\n network 192.168.30.0 0.0.0.255 area 0\n passive-interface g0/1\nend"
            },
            {
              "title": "R2 Redistribute / Tag กัน feedback",
              "text": "EIGRP→OSPF ใส่ tag100 และกัน200; OSPF→EIGRP ใส่200 กัน100. Seed metric 10000 100 255 1 1500 = BW, delay, reliability, load, MTU. route-map permit20 ไม่ใส่ match จะรับส่วนที่เหลือ.",
              "code": "conf t\nroute-map EIGRP-TO-OSPF deny 10\n match tag 200\nroute-map EIGRP-TO-OSPF permit 20\n set tag 100\nroute-map OSPF-TO-EIGRP deny 10\n match tag 100\nroute-map OSPF-TO-EIGRP permit 20\n set tag 200\nexit\nrouter ospf 1\n redistribute eigrp 100 subnets route-map EIGRP-TO-OSPF\n exit\nrouter eigrp 100\n redistribute ospf 1 metric 10000 100 255 1 1500 route-map OSPF-TO-EIGRP\nend\nshow ip eigrp neighbors\nshow ip eigrp topology\nshow ip route\nshow ip protocols\nshow route-map"
            },
            {
              "title": "Kali / พิสูจน์ host–service–VLAN",
              "text": "เปลี่ยน eth0 ให้ตรงจริง; arp-scan อยู่ local LAN. nmap ใช้ตรวจ server ในแลป. เห็น VLAN tag ต้องจับ trunk/SPAN ที่รักษา tag. คำสั่ง shell ขึ้นบรรทัดใหม่ในแผ่นเพราะยาว ให้พิมพ์ต่อเป็นคำสั่งเดียวตามกรอบ.",
              "code": "ip -br addr\nip route\nip neigh\nfping -a -g 192.168.10.0/24\nsudo tcpdump -i eth0 -nn arp\nping -c 4 192.168.20.10\ntraceroute -n 192.168.30.30\nsudo arp-scan --interface=eth0 --localnet\nnmap -sn 192.168.10.0/24\nsudo nmap -sS -p 21,22,23,80,443,3389 192.168.20.10\nsudo tcpdump -ni eth0 -w routing_control.pcap 'ip proto 88 or ip proto 89'\nsudo tshark -i eth0 -Y vlan -T fields -e frame.number -e vlan.id -e ip.src -e ip.dst"
            },
            {
              "title": "ตรวจปลายทาง / คืนค่า / Save",
              "text": "R1 ต้องเห็น D EX192.168.30.0/24; R3 เห็น O E2 192.168.10.0/24. ping PC1↔PC2 และ traceroute ไป–กลับ. ตัด R1g0/1 ประมาณ20sแล้ว no shut; ผังนี้ไม่มี alternate path จึงขาดจนคืนลิงก์. ตรวจ neighbor/route กลับมา จากนั้น copy run start ทุกอุปกรณ์. ถ้าไม่ผ่าน: L1→VLAN→IP/mask/gateway→neighbor→route ไป–กลับ→ACL→capture."
            }
          ]
        ]
      }
    ]
  }
];
