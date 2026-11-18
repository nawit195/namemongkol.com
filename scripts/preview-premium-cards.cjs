// Local visual fixture: actual result components, simulated data, no auth/credit calls.
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const esbuild = require(process.argv[2]);
const root = process.cwd();
const directory = path.join(root, 'scratch/premium-aplus-import');
const outfile = path.join(directory, 'cards-fixture.cjs');
(async () => {
    await esbuild.build({
        stdin: { contents: `import React from 'react'; import {renderToStaticMarkup} from 'react-dom/server'; import Card from './src/app/premium-search/components/PremiumNameCard';
const base={name:'กานต์',englishName:'KANT',pronunciation:'กาน',pronunciationStatus:'approved',meaning:'เป็นที่รัก เป็นที่พอใจ',meaningStatus:'approved',totalScore:41,suitableDays:['อาทิตย์','อังคาร','พุธ(กลางคืน)','พฤหัสบดี','ศุกร์'],scoreBreakdown:['14🟢','45🟢','54🟢','41🟢','15🟢','59🟢'],gender:'neutral'};
const items=[base,{...base,name:'ภูาฬฉ',englishName:undefined,pronunciation:undefined,meaning:undefined,pronunciationStatus:undefined,meaningStatus:undefined,totalScore:24},{...base,name:'อนันต์ญาณ์',englishName:'A-NANYA',pronunciation:'อะ-นัน-ยา',meaning:'ผู้รู้ไม่สิ้นสุด',pronunciationStatus:'pending',meaningStatus:'pending',totalScore:51},{...base,name:'ศิริกัญญ์วราภรณ์',englishName:'SIRIKAN-WARAPHON-LONG-NAME',meaning:'ผู้มีความดีงามและความเจริญรุ่งเรือง เป็นที่รักของครอบครัว และมีคุณค่าทางจิตใจ ชื่อนี้ใช้เพื่อทดสอบการแสดงความหมายที่ยาวให้ยังสามารถอ่านได้ครบเมื่อเปิดรายละเอียด',pronunciationVariants:['สิ-ริ-กัน-วะ-รา-พอน'],suitableDays:['อาทิตย์','จันทร์','อังคาร','พุธ(กลางวัน)','พุธ(กลางคืน)','พฤหัสบดี','ศุกร์','เสาร์']},{...base,name:'ขวัญ',englishName:undefined,pronunciation:'ขวัน',totalScore:16},{...base,name:'รายการที่ยังไม่ปลดล็อก'}];
export function render(){return renderToStaticMarkup(<main style={{maxWidth:1100,margin:'0 auto',padding:16}}><p style={{fontSize:12,color:'#475569',marginBottom:16}}>QA · ข้อมูลจำลอง · ไม่หักเครดิต</p><h1 style={{color:'#1a1a3e',fontSize:24,marginBottom:20}}>เลือกชื่อที่ใช่สำหรับคุณ</h1><section style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(min(285px,100%),1fr))',alignItems:'start',gap:16}}>{items.map((item,i)=><Card key={i} item={item} isUnlocked={i!==5}/>)}</section></main>);}`, resolveDir: root, loader: 'tsx' },
        outfile, bundle: true, platform: 'node', format: 'cjs', jsx: 'automatic', external: ['react', 'react-dom/server'],
        plugins: [{ name: 'language-fixture', setup(build) { build.onResolve({ filter: /LanguageProvider$/ }, () => ({ path: 'language', namespace: 'fixture' })); build.onLoad({ filter: /.*/, namespace: 'fixture' }, () => ({ contents: 'const labels={sunday:"อาทิตย์",monday:"จันทร์",tuesday:"อังคาร",wednesday:"พุธ(กลางวัน)",wednesday_night:"พุธ(กลางคืน)",thursday:"พฤหัสบดี",friday:"ศุกร์",saturday:"เสาร์"}; export const useLanguage=()=>({t:(key)=>labels[key.split(".").pop()]||key});', loader: 'js' })); } }],
    });
    const { render } = require(outfile);
    const cssFiles = fs.readdirSync(path.join(root, '.next/static/chunks')).filter(file => file.endsWith('.css'));
    const css = cssFiles.map(file => fs.readFileSync(path.join(root, '.next/static/chunks', file), 'utf8')).join('\n') + fs.readFileSync(outfile.replace(/\.cjs$/, '.css'), 'utf8');
    http.createServer((request, response) => {
        response.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' });
        response.end(`<!doctype html><html lang="th"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Premium cards QA</title><style>${css}body{background:#f8f8fc;font-family:Tahoma,sans-serif}*{box-sizing:border-box}</style>${render()}</html>`);
    }).listen(3157, '127.0.0.1', () => console.log('Local fixture http://127.0.0.1:3157'));
})().catch(error => { console.error(error.message); process.exitCode = 1; });
