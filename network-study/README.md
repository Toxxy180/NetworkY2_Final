# Network Final Lab — 01076040

Thai self-study website based on the five-page instructor final-exam scope and the lecture slides and lab sheets in `network_files/`. Each of the eight chapters has theory, guided CLI practice, a revision summary, and 15 practice questions.

The main navigation has separate theory lessons, theory quizzes, practical lessons, and practical exam sets. Practical exams contain five command-entry questions per set across eight sets. Answers are checked against the authored answer variants, with results and explanations shown after submission. Drafts, best scores, and practical reading progress use a separate localStorage key ending in `-practical`.

Author practical questions in `content/practical-exams.json`. Each question supplies a prompt, device or CLI mode, canonical answer, accepted alternatives, an explanation, and an input type (`ios`, `shell`, or `filter`). IOS keywords accept the displayed abbreviations and case variations. Named identifiers retain case, as do shell commands and display filters. The validator checks all eight sets and includes them in both generated entry points.

## Preview

The interactive network laboratory is available at `#/explore`. Its Canvas scenarios, step controls, playback, fullscreen view, and lesson links are implemented in `dist/network-experience.js` and `dist/network-experience.css`. It illustrates HSRP tracking/preempt, OSPF path changes, and Router-on-a-Stick forwarding. Motion follows the existing animation preference and reduced-motion setting, and playback stops when the page is hidden or the route changes.

The offline build inlines every local stylesheet and deferred script listed by `dist/index.html`, including the existing quest and 3D product modules.

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
