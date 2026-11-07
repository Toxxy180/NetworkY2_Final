# Network Final Lab — 01076040

Thai self-study website based on the five-page instructor final-exam scope and the lecture slides and lab sheets in `network_files/`. Each of the eight chapters has theory, guided CLI practice, a revision summary, and 15 practice questions.

## Preview

Run `node serve.mjs` from this directory and open `http://127.0.0.1:4173`.

Hosting assets live in `dist/`. Core lessons and questions are in `content/chapters-1-4.json` and `content/chapters-5-8.json`. The course-file references, additional theory and device-specific lab walkthroughs are in `content/course-review.json`. After changes, run `node validate.mjs` from this directory to validate the content and rebuild both `dist/data.js` and the standalone `../index.html`.

The question bank is newly written practice material, not the instructor's actual examination. Progress is saved in the browser's localStorage; active quizzes use sessionStorage. No server or login is required for progress and no cross-device synchronization is implied.

## Content boundary

1. Ethernet switching and MAC addresses
2. VLAN, trunk, VTP and port security features
3. STP and loop protection
4. Inter-VLAN routing and switch management
5. OSPF and EIGRP
6. HSRP, VRRP and GLBP
7. 802.1X, discovery tools and packet analysis
8. WAN, PPP, MPLS, VPN and WAN topologies

Each chapter lists supporting primary-source documentation. Version-dependent defaults are qualified in the lesson text.
