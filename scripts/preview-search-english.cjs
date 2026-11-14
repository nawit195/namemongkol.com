// Loopback-only visual fixture using the actual interactive search row.
// No credentials, analytics requests, database writes or credit operations.
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const esbuild = require(process.argv[2]);
const root = process.cwd();
const directory = path.join(root, 'scratch/english-names');
const output = path.join(directory, 'search-english-fixture.js');

const mocks = {
    '@/utils/supabase': 'export const supabase = {};',
    '@/lib/analytics': 'export async function trackEvent() {}',
    'next/navigation': 'export const useRouter = () => ({push(){}});',
    'next/link': "import React from 'react'; export default function Link({children,prefetch,...props}) {return <a {...props}>{children}</a>;}",
};

(async () => {
    fs.mkdirSync(directory, { recursive: true });
    await esbuild.build({
        stdin: {
            contents: `import React from 'react';
import {createRoot} from 'react-dom/client';
import {NameRow} from './src/app/search/ClientPage';
const base={gender:'neutral',numerology:24,suitableDays:['sunday','wednesday_night','friday'],grade:'A',meaning:'ตัวอย่างข้อมูลสำหรับตรวจหน้าจอ',meaningStatus:'pending'};
const rows=[
    {...base,name:'กงศร',englishName:'KONGSON',englishNameStatus:'pending',englishNameSource:'rtgs-reading-v1',pronunciation:'กง-สอน'},
    {...base,name:'กมลชนก',englishName:'KAMONCHANOK',englishNameStatus:'pending',englishNameSource:'premium-catalog',pronunciation:'กะ-มน-ชะ-หนก'},
    {...base,name:'กมล',englishName:'KAMON',pronunciation:'กะ-มน'},
    {...base,name:'กฌิน',englishNameStatus:'pending',englishNameSource:'rtgs-reading-v1',meaning:'ตัวอย่างคำอ่านที่ต้องตรวจเพิ่ม'},
    {...base,name:'ศิริกัญญ์วราภรณ์',englishName:'SIRIKANWARAPHONSUPHAPHONLONGNAME-LONGNAME',englishNameStatus:'pending',englishNameSource:'rtgs-reading-v1',pronunciation:'สิ-ริ-กัน-วะ-รา-พอน',meaning:'ตัวอย่างชื่อภาษาอังกฤษที่ยาวเพื่อทดสอบการตัดบรรทัดบนมือถือและเดสก์ท็อป'}
];
createRoot(document.getElementById('root')).render(<main className="mx-auto w-full max-w-6xl px-3 py-6 sm:px-6">
<p className="mb-2 text-xs text-slate-600">QA · ข้อมูลจำลอง · ไม่เชื่อมฐานข้อมูล</p>
<h1 className="mb-2 text-2xl font-bold text-[#1a1a3e]">ชื่อภาษาอังกฤษในหน้าค้นหา</h1>
<p className="mb-5 text-sm leading-6 text-slate-600">กดแถวเพื่อเปิดรายละเอียดชื่อและสถานะการสะกด</p>
<div className="overflow-hidden rounded-2xl border border-[#e4e1ee] bg-white"><table className="w-full border-collapse text-left"><thead className="bg-[#f4f1fb]"><tr>
<th className="px-4 py-4 text-sm">ชื่อมงคล</th><th className="hidden px-3 py-4 text-sm lg:table-cell">ชื่อภาษาอังกฤษ</th><th className="hidden px-3 py-4 text-sm lg:table-cell">คำอ่าน</th><th className="px-2 py-4 text-sm">ความหมาย</th><th className="hidden px-4 py-4 text-sm md:table-cell">วันเกิด</th><th className="hidden px-4 py-4 text-sm md:table-cell">ผลรวม</th><th className="px-3 py-4 text-sm"><span className="sr-only">รายละเอียด</span></th>
</tr></thead><tbody>{rows.map((row,index)=><NameRow key={row.name} {...row} rowIndex={index}/>)}</tbody></table></div></main>);`,
            loader: 'tsx',
            resolveDir: root,
        },
        outfile: output,
        bundle: true,
        platform: 'browser',
        jsx: 'automatic',
        define: { 'process.env.NODE_ENV': '"development"' },
        plugins: [{
            name: 'isolated-search-fixture',
            setup(build) {
                build.onResolve({ filter: /.*/ }, args => mocks[args.path] ? { path: args.path, namespace: 'fixture' } : undefined);
                build.onLoad({ filter: /.*/, namespace: 'fixture' }, args => ({ contents: mocks[args.path], loader: 'tsx', resolveDir: root }));
            },
        }],
    });
    const stylesDirectory = path.join(root, '.next/static/chunks');
    const css = fs.readdirSync(stylesDirectory).filter(file => file.endsWith('.css'))
        .map(file => fs.readFileSync(path.join(stylesDirectory, file), 'utf8')).join('\n');
    const generatedCss = output.replace(/\.js$/, '.css');
    const allCss = css + (fs.existsSync(generatedCss) ? fs.readFileSync(generatedCss, 'utf8') : '');
    http.createServer((request, response) => {
        response.setHeader('Cache-Control', 'no-store');
        if (request.url === '/fixture.js') {
            response.setHeader('Content-Type', 'application/javascript');
            response.end(fs.readFileSync(output));
            return;
        }
        response.setHeader('Content-Type', 'text/html; charset=utf-8');
        response.end(`<!doctype html><html lang="th"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Search English spelling QA</title><style>${allCss}*{box-sizing:border-box}body{margin:0;background:#f8f8fc;font-family:Tahoma,sans-serif}</style><div id="root"></div><script src="/fixture.js"></script></html>`);
    }).listen(3158, '127.0.0.1', () => console.log('Local fixture http://127.0.0.1:3158'));
})().catch(error => { console.error(error.message); process.exitCode = 1; });
