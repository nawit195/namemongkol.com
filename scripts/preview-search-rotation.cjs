// Actual search component with a deliberately slow, read-only loopback API.
// No real accounts, analytics, database writes or credit operations.
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const esbuild = require(process.argv[2]);
const directory = path.resolve('scratch/english-names');
const output = path.join(directory, 'rotation-fixture.js');
const requests = [];
const mocks = {
    '@/utils/supabase': 'export const supabase={auth:{getUser:async()=>({data:{user:null}})}};',
    '@/lib/analytics': 'export async function trackEvent(){}',
    '@/components/LanguageProvider': 'export const useLanguage=()=>({t:key=>key});',
    'next/navigation': 'export const useRouter=()=>({push(){}});',
    'next/link': "import React from 'react';export default function Link({children,prefetch,...props}){return <a {...props}>{children}</a>}",
};
const summary = { grades: { 'A+': 0, A: 80, B: 0, C: 0 }, withPronunciation: 80, withMeaning: 80 };
const names = letter => Array.from({ length: 80 }, (_, index) => ({ name: `${letter}ทดสอบ${index}`, gender: 'neutral', meaning: 'ข้อมูลจำลอง', pronunciation: 'ทด-สอบ', numerology: 24, suitableDays: ['sunday'], grade: 'A' }));
const result = (letter, rotation = 0) => {
    const pool = names(letter);
    return { success: true, dataSource: 'database', data: pool.slice(0, 50), featuredData: Array.from({ length: 10 }, (_, index) => pool[(rotation * 10 + index) % pool.length]), total: 80, page: 1, pageSize: 50, totalPages: 2, summary };
};
(async () => {
    fs.mkdirSync(directory, { recursive: true });
    await esbuild.build({
        stdin: { contents: `import React from 'react';import{createRoot}from'react-dom/client';import App from './src/app/search/ClientPage';import{THAI_NAME_INITIALS}from'./src/data/thaiInitials';const initial=${JSON.stringify(result('ก'))};const previews=Object.fromEntries(THAI_NAME_INITIALS.map(letter=>[letter,{data:initial.data.slice(0,10).map(item=>({...item,name:item.name.replace(/^ก/,letter)})),dataSource:'database',total:80,totalPages:2,summary:initial.summary}]));createRoot(document.getElementById('root')).render(<App initialResult={initial} initialLetterPreviews={previews} initialStats={{totalAnalyses:0,weeklyAnalyses:0,totalUsers:0,avgRating:0,reviewCount:0,totalNames:80,totalPremiumNames:0}}/>);`, resolveDir: process.cwd(), loader: 'tsx' },
        outfile: output, bundle: true, platform: 'browser', jsx: 'automatic', define: { 'process.env.NODE_ENV': '"development"' },
        plugins: [{ name: 'isolated-rotation', setup(build) {
            build.onResolve({ filter: /.*/ }, args => mocks[args.path] ? { path: args.path, namespace: 'fixture' } : undefined);
            build.onLoad({ filter: /.*/, namespace: 'fixture' }, args => ({ contents: mocks[args.path], loader: 'tsx', resolveDir: process.cwd() }));
        } }],
    });
    const cssDir = path.resolve('.next/static/chunks');
    const css = fs.readdirSync(cssDir).filter(file => file.endsWith('.css')).map(file => fs.readFileSync(path.join(cssDir, file), 'utf8')).join('\n');
    http.createServer(async (request, response) => {
        const url = new URL(request.url, 'http://127.0.0.1:3159');
        response.setHeader('Cache-Control', 'no-store');
        if (url.pathname === '/fixture.js') { response.setHeader('Content-Type', 'text/javascript'); response.end(fs.readFileSync(output)); return; }
        if (url.pathname === '/mock/status') { response.setHeader('Content-Type', 'application/json'); response.end(JSON.stringify({ requests })); return; }
        if (url.pathname.startsWith('/api/public/')) {
            response.setHeader('Content-Type', 'application/json');
            if (url.pathname === '/api/public/stats') { response.end('{"success":false}'); return; }
            const letter = decodeURIComponent(url.pathname.split('/').pop());
            const seed = url.searchParams.get('seed') || '';
            requests.push({ letter, seed });
            await new Promise(resolve => setTimeout(resolve, 1800));
            response.end(JSON.stringify(result(['ก', 'ข'].includes(letter) ? letter : 'ก', Number(seed.match(/rotation-(\d+)$/)?.[1] || 0)))); return;
        }
        response.setHeader('Content-Type', 'text/html; charset=utf-8');
        response.end(`<!doctype html><html lang="th"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Rotation performance QA</title><style>${css}body{margin:0;font-family:Tahoma,sans-serif}#qa{position:fixed;top:0;left:0;z-index:99999;background:white;padding:8px;border:1px solid #999;font-size:12px}</style><div id="qa">QA · API จำลองช้า 1,800ms · ไม่มีการหักเครดิต <span id="metrics"></span></div><div id="root"></div><script>let clickedAt=0,lastName='';document.addEventListener('pointerdown',e=>{if(e.target.closest('button[aria-label^="เปลี่ยนรายชื่อ"]'))clickedAt=performance.now()});new MutationObserver(()=>{const name=document.querySelector('tbody tr td')?.innerText;if(name&&name!==lastName){lastName=name;if(clickedAt){document.getElementById('metrics').textContent='เปลี่ยนชื่อใน '+Math.round(performance.now()-clickedAt)+'ms';clickedAt=0}}}).observe(document.getElementById('root'),{childList:true,subtree:true,characterData:true});</script><script src="/fixture.js"></script></html>`);
    }).listen(3159, '127.0.0.1', () => console.log('Rotation fixture http://127.0.0.1:3159'));
})().catch(error => { console.error(error.message); process.exitCode = 1; });
