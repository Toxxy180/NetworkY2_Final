# Network Final Lab — 01076040

Thai self-study website based on the five-page instructor final-exam scope. Eight chapters, 15 original practice questions per chapter, worked examples, exact SVG network diagrams, practice/exam modes, and local progress tracking.

## Preview

Run `node serve.mjs` from this directory and open `http://127.0.0.1:4173`.

No dependencies or build step. Hosting assets live in `dist/`. Content is authored in `content/chapters-1-4.json` and `content/chapters-5-8.json`. Run `node validate.mjs` to validate and assemble `dist/data.js` after changes.

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
