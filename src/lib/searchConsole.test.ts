import { describe,expect,it } from 'vitest';
import { compatibleGscPeriods,gscCoverageWarnings,gscScopeKey,gscPacificToday,GSC_MAX_BYTES,GSC_MAX_ROWS,normalizeGscUpload,parseGscCsv,summarizeGscRows,type GscScope } from './searchConsole';
const scope:GscScope={property:'https://www.namemongkol.com/',searchType:'web',from:'2026-10-01',to:'2026-10-28',country:'all',device:'all',filters:''};
const queryCsv='Top queries,Clicks,Impressions,CTR,Position\r\nชื่อมงคล,10,100,10%,4\r\nชื่อลูก,30,900,3.33%,12';
const upload=(csv=queryCsv,kind='queries')=>({scope,files:[{name:'Queries.csv',kind,csv}]});
describe('Search Console exports',()=>{
 it('parses BOM, CRLF, commas, escaped quotes and multiline cells without flattening dimensions',()=>{
  expect(parseGscCsv('\uFEFFQuery,Clicks\r\n"ชื่อ, \"\"เพราะ\"\"\nสองบรรทัด",1\r\n')).toEqual([['Query','Clicks'],['ชื่อ, "เพราะ"\nสองบรรทัด','1']]);
  const parsed=normalizeGscUpload(upload());expect(parsed.rows).toHaveLength(2);
  expect(summarizeGscRows(parsed.rows)).toEqual({clicks:40,impressions:1000,ctr:4,position:11.2});
  expect(parsed.rows.every(row=>!row.path)).toBe(true);
  expect(gscCoverageWarnings('queries',1000)).toHaveLength(4);
 });
 it('supports separate Google tables and genuine joint rows, preserving PT dates and URL variants',()=>{
  const parsed=normalizeGscUpload({scope:{...scope,property:'sc-domain:namemongkol.com'},files:[
   {name:'Pages.csv',kind:'pages',csv:'Top pages,Clicks,Impressions,Position\nhttps://namemongkol.com/search?day=monday,1,10,2'},
   {name:'Chart.csv',kind:'daily',csv:'Date,Clicks,Impressions,Position\n2026-10-01,3,30,2'},
   {name:'Joint.csv',kind:'query-pages',csv:'query,page,clicks,impressions,position\nชื่อมงคล,/search,5,10,3'},
  ]});
  expect(parsed.kinds).toEqual(['pages','daily','query-pages']);
  expect(parsed.rows.find(row=>row.kind==='daily')?.date).toBe('2026-10-01');
  expect(parsed.rows.find(row=>row.kind==='pages')?.path).toBe('https://namemongkol.com/search?day=monday');
  expect(parsed.rows.find(row=>row.kind==='query-pages')?.query).toBe('ชื่อมงคล');
 });
 it('creates the same import hash for identical normalized data regardless of filename or row order, and versions revisions',()=>{
  const first=normalizeGscUpload(upload());
  const second=normalizeGscUpload({scope,files:[{name:'Renamed.csv',kind:'queries',csv:'query,clicks,impressions,position\nชื่อลูก,30,900,12\nชื่อมงคล,10,100,4'}]});
  expect(first.contentHash).toBe(second.contentHash);expect(first.rows[0].identityHash).toMatch(/^[a-f0-9]{64}$/);
  expect(first.contentHash).not.toBe(normalizeGscUpload(upload(queryCsv.replace('10,100,','11,100,'))).contentHash);
 });
 it('rejects malformed/mismatched files, duplicate dimensions and rows, foreign URLs, invalid counts and daily periods',()=>{
  for(const csv of ['q,c\n"oops,1','q,c\nx,1,2','q,c\n"ok"bad,1'])expect(()=>parseGscCsv(csv)).toThrow();
  for(const csv of ['query,clicks,impressions,position\nq,no,1,1','query,clicks,impressions,position\nq,-1,1,1','query,clicks,impressions,position\nq,1.5,1,1','query,clicks,impressions,position\nq,"1,2",100,1','query,clicks,impressions,position\nq,1,10,1\nq,1,10,1'])expect(()=>normalizeGscUpload(upload(csv))).toThrow();
  expect(()=>normalizeGscUpload(upload('query,page,clicks,impressions,position\nq,/search,1,10,1'))).toThrow();
  expect(()=>normalizeGscUpload(upload('query,country,clicks,impressions,position\nq,TH,1,10,1'))).toThrow();
  expect(()=>normalizeGscUpload(upload('query,clicks,clicks,impressions,position\nq,1,2,10,1'))).toThrow();
  expect(()=>normalizeGscUpload(upload('page,clicks,impressions,position\nhttps://evil.test/,1,10,1','pages'))).toThrow();
  expect(()=>normalizeGscUpload(upload('page,clicks,impressions,position\ninvalid text,1,10,1','pages'))).toThrow();
  expect(()=>normalizeGscUpload(upload('page,clicks,impressions,position\nhttp://namemongkol.com/,1,10,1','pages'))).toThrow();
  for(const day of ['2026-09-30','2026-10-29','2026-10-01T12:00:00','2026-02-30'])expect(()=>normalizeGscUpload(upload(`Date,Clicks,Impressions,Position\n${day},1,10,1`,'daily'))).toThrow();
  expect(()=>normalizeGscUpload({scope,files:[upload().files[0],upload().files[0]]})).toThrow();
 });
 it('enforces request byte and row limits rather than partial imports',()=>{
  expect(()=>normalizeGscUpload(upload('q'.repeat(GSC_MAX_BYTES)))).toThrow('3 MB');
  const many='query,clicks,impressions,position\n'+Array.from({length:GSC_MAX_ROWS+1},(_,i)=>`q${i},1,10,1`).join('\n');
  expect(()=>normalizeGscUpload(upload(many))).toThrow('20,000');
 });
 it('validates integer text before floating-point rounding and requires a measured position to start at one',()=>{
  for(const value of ['9007199254740991.1','1.00000000000000000001','1.1']) {
   expect(()=>normalizeGscUpload(upload(`query,clicks,impressions,position\nq,${value},10,1`))).toThrow('จำนวนเต็ม');
   expect(()=>normalizeGscUpload(upload(`query,clicks,impressions,position\nq,0,${value},1`))).toThrow('จำนวนเต็ม');
  }
  expect(normalizeGscUpload(upload('query,clicks,impressions,position\nq,1.000,10.0,1')).rows[0].clicks).toBe(1);
  expect(normalizeGscUpload(upload('query,clicks,impressions,position\nq,0,0,0')).rows[0].position).toBe(0);
  for(const position of ['0','0.5']) expect(()=>normalizeGscUpload(upload(`query,clicks,impressions,position\nq,0,10,${position}`))).toThrow('position');
 });
 it('compares only matching scopes and equal, disjoint PT date intervals',()=>{
  expect(gscPacificToday(new Date('2026-11-25T07:59:59Z'))).toBe('2026-11-24');
  expect(()=>normalizeGscUpload({...upload(),scope:{...scope,from:'2099-01-01',to:'2099-01-28'}})).toThrow();
  const previous={...scope,from:'2026-09-03',to:'2026-09-30'};
  expect(compatibleGscPeriods(scope,previous)).toBe(true);
  for(const value of [{...previous,country:'TH'},{...previous,device:'mobile' as const},{...previous,filters:'query filter'},{...previous,from:'2026-09-04'},{...previous,from:'2026-09-30',to:'2026-10-27'}])expect(compatibleGscPeriods(scope,value)).toBe(false);
  expect(gscScopeKey(scope)).toBe(gscScopeKey({...scope,from:'2026-09-03',to:'2026-09-30'}));
 });
});
