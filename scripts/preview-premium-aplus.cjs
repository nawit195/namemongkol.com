// Local visual fixture: actual result components, simulated data, no auth/credit calls.
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const esbuild = require(process.argv[2]);
const root = process.cwd();
const directory = path.join(root, 'scratch/premium-aplus-import');
const outfile = path.join(directory, 'fixture.cjs');
(async () => {
    await esbuild.build({
        stdin: { contents: `import React from 'react'; import {renderToStaticMarkup} from 'react-dom/server'; import Card from './src/app/premium-search/components/PremiumNameCard'; import {PremiumAnalysisNameDetails as Details} from './src/app/premium-analysis/PremiumAnalysisNameDetails';
const item={name:'อนันต์ญาณ์',englishName:'A-NANYA',pronunciation:'อะ-นัน-ยา',pronunciationStatus:'pending',meaning:'ผู้รู้ไม่สิ้นสุด',meaningStatus:'pending',totalScore:51,suitableDays:['อาทิตย์','อังคาร'],scoreBreakdown:['65🟢'],gender:'neutral'};
export function render(){return renderToStaticMarkup(<main style={{maxWidth:1100,margin:'0 auto',padding:16}}><p style={{color:'#0f172a',padding:12,background:'#fef3c7'}}>QA · ข้อมูลจำลอง · ไม่หักเครดิต</p><h1 style={{color:'#0f172a',fontSize:24,margin:'24px 0'}}>ข้อมูลชื่อในผลลัพธ์พรีเมียม</h1><section style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(min(280px,100%),1fr))',gap:16}}><div><h2 style={{color:'#0f172a',marginBottom:12}}>Premium Search · ปลดล็อกแล้ว</h2><Card item={item} isUnlocked={true}/></div><div><h2 style={{color:'#0f172a',marginBottom:12}}>Premium Analysis</h2><div style={{background:'#0f172a',borderRadius:16,padding:24}}><h3 style={{color:'white',fontSize:24}}>อนันต์ญาณ์</h3><Details result={item}/></div><h2 style={{color:'#0f172a',margin:'20px 0 12px'}}>ประวัติเดิม · ไม่มีชื่ออังกฤษ</h2><div style={{background:'#0f172a',borderRadius:16,padding:24}}><Details result={{meaning:'ความหมายจากประวัติเดิม'}}/></div></div></section></main>);}`, resolveDir: root, loader: 'tsx' },
        outfile, bundle: true, platform: 'node', format: 'cjs', jsx: 'automatic', external: ['react', 'react-dom/server'],
        plugins: [{ name: 'language-fixture', setup(build) { build.onResolve({ filter: /LanguageProvider$/ }, () => ({ path: 'language', namespace: 'fixture' })); build.onLoad({ filter: /.*/, namespace: 'fixture' }, () => ({ contents: 'export const useLanguage=()=>({t:(key)=>key});', loader: 'js' })); } }],
    });
    const { render } = require(outfile);
    const cssFiles = fs.readdirSync(path.join(root, '.next/static/chunks')).filter(file => file.endsWith('.css'));
    const css = cssFiles.map(file => fs.readFileSync(path.join(root, '.next/static/chunks', file), 'utf8')).join('\n');
    http.createServer((request, response) => {
        response.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' });
        response.end(`<!doctype html><html lang="th"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Premium details QA</title><style>${css}body{background:#f8f8fc;font-family:Tahoma,sans-serif}*{box-sizing:border-box}</style>${render()}</html>`);
    }).listen(3157, '127.0.0.1', () => console.log('Local fixture http://127.0.0.1:3157'));
})().catch(error => { console.error(error.message); process.exitCode = 1; });
