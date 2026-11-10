// Local UI fixture only. No Supabase credentials, actual members or production writes.
// node scripts/preview-returning-members.cjs <path-to-esbuild>
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),os=require('node:os');
const {build}=require(path.resolve(process.argv[2]));
const root=process.cwd(),out=path.join(os.tmpdir(),'namemongkol-returning-members-ui-test');
fs.mkdirSync(out,{recursive:true});
(async()=>{
const sourceRoot=root.replaceAll('\\','/');
fs.writeFileSync(path.join(out,'entry.tsx'),`
import React,{useState} from 'react';import {createRoot} from 'react-dom/client';
import Page from '${sourceRoot}/src/app/admin/returning-members/page';
import {MemberActivityTracker} from '${sourceRoot}/src/components/MemberActivityTracker';
import {setUser} from 'qa-auth';
function App(){const [id,update]=useState(window.__fixtureUser);return <><header style={{padding:12,display:'flex',gap:8,flexWrap:'wrap'}}><strong>QA · ข้อมูลจำลอง</strong>{['admin','member-a','member-b','guest'].map(value=><button key={value} onClick={async()=>{await fetch('/fixture/auth',{method:'POST',body:value});const next=value==='guest'?null:value;setUser(next);update(next);}}>{value}</button>)}{['normal','failure'].map(mode=><button key={mode} onClick={async()=>{await fetch('/fixture/mode',{method:'POST',body:mode});location.reload();}}>{mode}</button>)}<a href='/admin/returning-members'>รายงาน</a><a href='/names/boys'>หน้าสาธารณะ</a></header><MemberActivityTracker user={id?{id,is_anonymous:false}:null}/>{location.pathname.startsWith('/admin')?<Page/>:<main style={{padding:24}}><h1>หน้าสาธารณะสำหรับทดสอบ tracker</h1><button>ใช้งานต่อ</button><a href='/names/girls'>เปลี่ยนหมวด</a><a href='/login'>หน้า Login</a></main>}</>};createRoot(document.getElementById('root')).render(<App/>);`);
const plugin={name:'fixture-auth',setup(b){
 b.onResolve({filter:/^(qa-auth|@\/utils\/supabase)$/},()=>({path:'auth',namespace:'qa'}));
 b.onResolve({filter:/^next\/navigation$/},()=>({path:'navigation',namespace:'qa'}));
 b.onResolve({filter:/^next\/link$/},()=>({path:'link',namespace:'qa'}));
 b.onLoad({filter:/.*/,namespace:'qa'},({path:p})=>({loader:'jsx',contents:p==='auth'?`let user=window.__fixtureUser;const listeners=new Set();export function setUser(id){user=id;for(const cb of listeners)cb(id?'SIGNED_IN':'SIGNED_OUT',id?{user:{id}}:null);}export const supabase={auth:{getUser:async()=>({data:{user:user?{id:user}:null},error:null}),onAuthStateChange(cb){listeners.add(cb);queueMicrotask(()=>cb('INITIAL_SESSION',user?{user:{id:user}}:null));return {data:{subscription:{unsubscribe(){listeners.delete(cb)}}}}}}};`:p==='navigation'?`export const usePathname=()=>location.pathname;export const useRouter=()=>({push(url){location.assign(url)}});`:`import React from 'react';export default function Link({href,children,prefetch,...props}){return <a href={href} {...props}>{children}</a>}`}));
}};
await build({entryPoints:[path.join(out,'entry.tsx')],bundle:true,platform:'browser',jsx:'automatic',plugins:[plugin],alias:{'@':path.join(root,'src'),react:path.join(root,'node_modules/react'),'react-dom':path.join(root,'node_modules/react-dom')},nodePaths:[path.join(root,'node_modules')],define:{'process.env.NODE_ENV':'"development"'},outfile:path.join(out,'app.js')});
let user='admin',mode='normal';const records=[];
const day=()=>new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Bangkok'}).format(new Date());
http.createServer(async(req,res)=>{const url=new URL(req.url,'http://127.0.0.1:3157');const json=(body,status=200)=>{res.writeHead(status,{'content-type':'application/json'});res.end(JSON.stringify(body));};let text='';if(req.method==='POST')for await(const part of req)text+=part;
try{
 if(url.pathname==='/fixture/auth'){user=text==='guest'?null:text;return json({user});}
 if(url.pathname==='/fixture/mode'){mode=text;return json({mode});}
 if(url.pathname==='/fixture/status')return json({records});
 if(url.pathname==='/api/member-activity'){records.push({user,body:text});return json({success:true,recorded:!!user&&user!=='admin',activityDate:day()});}
 if(url.pathname==='/api/admin/returning-members'){
  if(!user)return json({error:'กรุณาเข้าสู่ระบบ'},401);if(user!=='admin')return json({error:'สำหรับผู้ดูแลระบบเท่านั้น'},403);if(mode==='failure')return json({error:'ยังไม่ได้ติดตั้งระบบกิจกรรมสมาชิก กรุณาติดตั้ง SQL migration ก่อนใช้งาน'},503);
  const source=url.searchParams.get('source'),search=url.searchParams.get('search')||'',page=Number(url.searchParams.get('page')||1);
  let members=Array.from({length:90},(_,i)=>{const kind=['observed','legacy','mixed'][i%3],active=[4,3,5][i%3],observed=[4,0,2][i%3];return {id:'10000000-0000-4000-8000-'+String(i+1).padStart(12,'0'),firstName:i===0?null:'สมาชิกทดสอบ '+String(i+1).padStart(3,'0'),lastName:null,email:i===0?null:'member'+i+'@example.test',tier:['free','pro','vvip'][i%3],activeDays:active,observedDays:observed,legacyOnlyDays:active-observed,firstSeenAt:new Date(Date.now()-(active-1)*86400000).toISOString(),lastSeenAt:new Date().toISOString(),source:kind};});
  if(source==='observed')members=members.filter(row=>row.observedDays>=2).map(row=>({...row,activeDays:row.observedDays,legacyOnlyDays:0,source:'observed'}));
  if(search==='ช้า'||search==='เร็ว')members=[{...members[0],firstName:search+'ทดสอบ'}];else if(search)members=members.filter(row=>`${row.firstName} ${row.email}`.includes(search));
  members.sort((a,b)=>b.activeDays-a.activeDays||a.id.localeCompare(b.id));const total=members.length;
  const send=()=>json({success:true,members:members.slice((page-1)*50,page*50),total,page,pageSize:50,summary:{activeMembers:total+2,returningMembers:total},coverage:{trackingStartedAt:new Date().toISOString(),legacyImportedAt:new Date().toISOString(),legacySources:['user_action_events','analysis_history','credit_transactions']}});
  return search==='ช้า'?setTimeout(send,15000):send();
 }
 if(url.pathname==='/app.js'||url.pathname==='/app.css'){res.setHeader('content-type',url.pathname.endsWith('.js')?'text/javascript':'text/css');return res.end(fs.readFileSync(path.join(out,url.pathname.slice(1))));}
 res.setHeader('content-type','text/html;charset=utf-8');res.end('<!doctype html><html lang="th"><meta name="viewport" content="width=device-width,initial-scale=1"><style>body{margin:0;background:#0f172a;color:#e2e8f0;font:16px/1.8 sans-serif}*{box-sizing:border-box}button{min-height:44px;cursor:pointer;background:#1e293b;color:#e2e8f0;border:1px solid #64748b;border-radius:8px;padding:8px 12px}a{color:inherit;margin:0 8px}</style><link rel="stylesheet" href="/app.css"><script>window.__fixtureUser='+JSON.stringify(user)+';</script><div id="root"></div><script src="/app.js"></script></html>');
}catch(error){json({error:String(error)},500);}}).listen(3157,'127.0.0.1',()=>console.log('Returning-members UI fixtures: http://127.0.0.1:3157/admin/returning-members (no real user data).'));
})();
