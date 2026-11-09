// Requires Playwright and an installed Chrome; respects NODE_PATH for bundled runtimes.
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const here = path.dirname(fileURLToPath(import.meta.url));
const output = path.resolve(here, '../output/pdf');
await fs.mkdir(output, { recursive: true });
const browser = await chromium.launch({channel:'chrome', headless:true});
try {
 const page = await browser.newPage({viewport:{width:1440,height:1000}});
 await page.addInitScript(()=>localStorage.setItem('network-intro-01076040-shown','1'));
 for (const id of ['theory','practical']) {
  await page.goto(pathToFileURL(path.join(here,'dist/index.html')).href+'#/openbook/'+id);
  await page.locator('.ob-sheet').last().waitFor();
  await page.evaluate(()=>document.fonts.ready);
  await page.emulateMedia({media:'print'});
  const layout = await page.locator('.ob-sheet').evaluateAll(sheets=>sheets.map(sheet=>({
   side:sheet.getAttribute('aria-label'),
   columns:[...sheet.querySelectorAll('.ob-column')].map(column=>({
    used:Math.round(column.getBoundingClientRect().height),
    available:Math.round(sheet.querySelector('.ob-columns').getBoundingClientRect().height),
    overflow:column.getBoundingClientRect().bottom > sheet.querySelector('.ob-sheet-foot').getBoundingClientRect().top-4
   }))
  })));
  if (layout.some(sheet=>sheet.columns.some(column=>column.overflow))) {
   throw new Error('A4 content overflows: '+JSON.stringify({id,layout}));
  }
  const filename = 'network-openbook-'+id+'-a4.pdf';
  await page.pdf({path:path.join(output,filename),preferCSSPageSize:true,printBackground:true,displayHeaderFooter:false,tagged:true});
  await fs.copyFile(path.join(output,filename),path.join(here,'dist/openbook-'+id+'.pdf'));
  console.log(JSON.stringify({id,filename,layout}));
 }
} finally { await browser.close(); }
