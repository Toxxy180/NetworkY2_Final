# Network Final Lab — 01076040

Thai self-study website based on the five-page instructor final-exam scope and the lecture slides and lab sheets in `network_files/`. Each of the eight chapters has theory, guided CLI practice, a revision summary, and 15 practice questions.

The main navigation has separate theory lessons, theory quizzes, practical lessons, and practical exam sets. Practical exams contain eight command-entry questions per set across eight sets. Questions combine single commands, multi-line blocks, missing lines, and repair tasks. Given blocks are visible; solutions can be expanded while studying, and submission reports mismatched or missing lines. Answers are checked in order against the authored variants. Drafts, best scores, and practical reading progress use a separate localStorage key ending in `-practical`.

Author practical questions in `content/practical-exams.json`. Each question supplies a prompt, device or CLI mode, canonical answer, accepted alternatives, an explanation, and an input type (`ios`, `shell`, or `filter`). IOS keywords accept the displayed abbreviations and case variations. Multi-line answers are checked one command per line; identifiers and secrets retain case. Named identifiers retain case, as do shell commands and display filters. The validator checks all eight sets and includes them in both generated entry points.

## Command annotations and checks

`command-notes.mjs` annotates all 435 lab lines during the build. Each generated `step.notes` entry retains the original command, line number, mode before/after, and a Thai explanation. Unknown IOS/shell commands fail validation, so a new command needs an explanation rule. Lessons display explanations as trailing comments beside each command inside the same code block: `!` for IOS, `#` for terminal/filter study notes. Copy buttons use the original command string and omit study comments. The same view is used for practical solutions.

`dist/practical-tools.js` supplies the same line checker to the UI and Node tests. Run `node --test practical-tools.test.mjs` and `node validate.mjs`. The current practical bank has 8 sets × 8 questions = 64. Practical storage schema 2 retains existing drafts and reading progress while reopening expanded sets and resetting best scores to the new denominator. Theory progress and question IDs are unchanged.

## Preview

The interactive network laboratory is available at `#/explore`. Its Canvas scenarios, step controls, playback, fullscreen view, and lesson links are implemented in `dist/network-experience.js` and `dist/network-experience.css`. It illustrates HSRP tracking/preempt, OSPF path changes, and Router-on-a-Stick forwarding. Motion follows the existing animation preference and reduced-motion setting, and playback stops when the page is hidden or the route changes.

The offline build inlines every local stylesheet and deferred script listed by `dist/index.html`, including the existing quest and 3D product modules.

Run `node serve.mjs` from this directory and open `http://127.0.0.1:4173`.

Hosting assets live in `dist/`. Core lessons and questions are in `content/chapters-1-4.json` and `content/chapters-5-8.json`. The course-file references, additional theory and device-specific lab walkthroughs are in `content/course-review.json`. After changes, run `node validate.mjs` from this directory to validate the content and rebuild both `dist/data.js` and the standalone `../index.html`.

The question bank is newly written practice material, not the instructor's actual examination. Progress is saved in the browser's localStorage; active quizzes use sessionStorage. No server or login is required for progress and no cross-device synchronization is implied.

## Content boundary

## Openbook A4 sheets

Screen typography is centralized in `dist/typography.css`. Author each lesson `body` item as one paragraph; use `**bold**` for key terms and backticks for inline commands. Lab `body` items render as an ordered preparation/work sequence. Quiz explanations support blank lines between paragraphs. Screen-only rules and the Openbook sentence spans preserve the compact A4 print layout.

`#/openbook/theory` and `#/openbook/practical` each contain two A4 portrait pages (front/back), intended as dense handwriting references. Screen text stays larger and reflows on mobile. The print stylesheet uses four columns for theory and three for CLI practice, with 6 mm margins and long-edge duplex instructions. Print/PDF sizes are independent of the reader's theme and font preference.

Edit `content/openbook.json`; render and print behavior live in `dist/openbook.js` and `dist/openbook.css`. To regenerate the PDFs, make Playwright available to Node (through the local installation or `NODE_PATH`) and use an installed Chrome:

```sh
node validate.mjs
node generate-openbook.mjs
node validate.mjs
```

The generator rejects overflowing columns and writes two PDFs to `../output/pdf/`, with hosting copies under `dist/`. The final validation/build embeds both PDFs as Blob downloads in the root offline page. Serve the whole `dist/` folder for the hosted version. The separate root `index.html` remains self-contained.

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
