// Recovery v1: encrypted local notebook, not an authentication or signing protocol.
const FORMAT='oneiric-notebook-backup', VERSION=1, ITERATIONS=600000;
const LIMIT=8*1024*1024, MAX_REPORTS=500;
const enc=new TextEncoder(), dec=new TextDecoder('utf-8',{fatal:true});
const aad=enc.encode('oneiric:notebook-backup:1');
const fail=message=>{throw new Error(message);};
const exact=(value,keys)=>{if(!value||typeof value!=='object'||Array.isArray(value)||Object.keys(value).sort().join(',')!==[...keys].sort().join(','))fail('Unexpected fields or unsupported format.');};
const string=(s,max)=>{if(typeof s!=='string'||!s.trim()||s.length>max)fail('Invalid text field.');for(const c of s){const cp=c.codePointAt(0);if(cp>=0xd800&&cp<=0xdfff)fail('Text contains an invalid Unicode surrogate.');}};
const uuid=s=>{if(typeof s!=='string'||!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(s))fail('Invalid identifier.');};
const time=s=>{if(typeof s!=='string'||!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(s)||!Number.isFinite(Date.parse(s))||new Date(s).toISOString()!==s)fail('Invalid timestamp.');};
export function validateNotebook(v){
 exact(v,['format','version','identity','revision','reports']);
 if(v.format!=='oneiric-notebook'||v.version!==VERSION)fail('Unsupported notebook version.');
 exact(v.identity,['id','handle']);uuid(v.identity.id);string(v.identity.handle,80);
 if(!Number.isSafeInteger(v.revision)||v.revision<0||!Array.isArray(v.reports)||v.reports.length>MAX_REPORTS)fail('Invalid notebook size or revision.');
 const ids=new Set([v.identity.id]);
 const unique=id=>{uuid(id);if(ids.has(id))fail('Duplicate identifier.');ids.add(id);};
 for(const r of v.reports){
  exact(r,['id','created_at','title','text','annotations']);unique(r.id);time(r.created_at);string(r.title,200);string(r.text,100000);
  if(!Array.isArray(r.annotations)||r.annotations.length>100)fail('Too many annotations.');
  for(const a of r.annotations){exact(a,['id','created_at','text']);unique(a.id);time(a.created_at);string(a.text,20000);if(a.created_at<r.created_at)fail('Annotation predates report.');}
 }
 if(enc.encode(JSON.stringify(v)).length>4*1024*1024)fail('Notebook exceeds the 4 MiB rehearsal limit.');
 return v;
}
export function createNotebook(handle){return validateNotebook({format:'oneiric-notebook',version:VERSION,identity:{id:crypto.randomUUID(),handle:handle.trim()},revision:0,reports:[]});}
export function appendReport(v,title,text){
 const next=structuredClone(v);next.reports.push({id:crypto.randomUUID(),created_at:new Date().toISOString(),title:title.trim(),text,annotations:[]});next.revision++;
 return validateNotebook(next);
}
export function appendAnnotation(v,id,text){
 const next=structuredClone(v),report=next.reports.find(r=>r.id===id);if(!report)fail('Report not found.');
 report.annotations.push({id:crypto.randomUUID(),created_at:new Date().toISOString(),text});next.revision++;
 return validateNotebook(next);
}
const b64=bytes=>{let s='';for(const b of bytes)s+=String.fromCharCode(b);return btoa(s).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');};
const un64=(s,length)=>{
 if(typeof s!=='string'||!s.length||s.length>LIMIT||!/^[A-Za-z0-9_-]+$/.test(s))fail('Invalid backup encoding.');
 let raw;try{raw=atob(s.replace(/-/g,'+').replace(/_/g,'/'));}catch{fail('Invalid backup encoding.');}
 const bytes=Uint8Array.from(raw,c=>c.charCodeAt(0));
 if((length&&bytes.length!==length)||b64(bytes)!==s)fail('Invalid backup encoding.');return bytes;
};
export function parseBackup(raw){
 if(typeof raw!=='string'||enc.encode(raw).length>LIMIT)fail('Backup exceeds the 8 MiB limit.');
 let e;try{e=JSON.parse(raw);}catch{fail('Backup is not valid JSON.');}
 exact(e,['format','version','kdf','cipher','salt','iv','ciphertext']);
 if(e.format!==FORMAT||e.version!==VERSION||e.kdf!=='PBKDF2-SHA256-600000'||e.cipher!=='AES-256-GCM')fail('Unsupported backup format.');
 un64(e.salt,16);un64(e.iv,12);if(un64(e.ciphertext).length<16)fail('Truncated backup.');return e;
}
async function derive(password,salt){
 string(password,1024);
 if(!crypto.subtle)fail('This browser needs a secure context for encryption.');
 const material=await crypto.subtle.importKey('raw',enc.encode(password),'PBKDF2',false,['deriveKey']);
 return crypto.subtle.deriveKey({name:'PBKDF2',salt,iterations:ITERATIONS,hash:'SHA-256'},material,{name:'AES-GCM',length:256},false,['encrypt','decrypt']);
}
export async function encryptNotebook(v,password){
 validateNotebook(v);if(typeof password!=='string'||password.length<12||password.length>1024)fail('Use a passphrase of 12–1024 characters.');
 const salt=crypto.getRandomValues(new Uint8Array(16)),iv=crypto.getRandomValues(new Uint8Array(12));
 const key=await derive(password,salt);
 const ciphertext=await crypto.subtle.encrypt({name:'AES-GCM',iv,additionalData:aad,tagLength:128},key,enc.encode(JSON.stringify(v)));
 return JSON.stringify({format:FORMAT,version:VERSION,kdf:'PBKDF2-SHA256-600000',cipher:'AES-256-GCM',salt:b64(salt),iv:b64(iv),ciphertext:b64(new Uint8Array(ciphertext))});
}
export async function decryptNotebook(raw,password){
 const e=parseBackup(raw),key=await derive(password,un64(e.salt,16));let plaintext;
 try{plaintext=await crypto.subtle.decrypt({name:'AES-GCM',iv:un64(e.iv,12),additionalData:aad,tagLength:128},key,un64(e.ciphertext));}
 catch{fail('Unable to unlock: incorrect passphrase or damaged backup.');}
 return validateNotebook(JSON.parse(dec.decode(plaintext)));
}
export function createPublicSnapshot(v,reportIds,publicHandle){
 validateNotebook(v);string(publicHandle,80);
 if(!Array.isArray(reportIds)||!reportIds.length||new Set(reportIds).size!==reportIds.length)fail('Select at least one distinct report.');
 const reports=reportIds.map(id=>{const r=v.reports.find(r=>r.id===id);if(!r)fail('Selected report not found.');return r;});
 const now=new Date().toISOString();
 const event=(kind,data,created_at=now)=>({header:{schema_version:'0.1.0',event_id:crypto.randomUUID(),author_id:v.identity.id,created_at,visibility:'public',references:[]},payload:{kind,data}});
 return {format:'oneiric-network-bundle',schema_version:'0.1.0',exported_at:now,scope:'public',events:[event('presence',{participant_id:v.identity.id,handle:publicHandle.trim()}),...reports.map(r=>event('dream',{text:r.text,language:'und'},r.created_at))],omitted_event_ids:[]};
}
export function validatePublicSnapshot(b){
 exact(b,['format','schema_version','exported_at','scope','events','omitted_event_ids']);time(b.exported_at);
 if(b.format!=='oneiric-network-bundle'||b.schema_version!=='0.1.0'||b.scope!=='public'||!Array.isArray(b.events)||b.events.length<2||b.events.length>501||!Array.isArray(b.omitted_event_ids)||b.omitted_event_ids.length)fail('Unsupported publication snapshot.');
 let author;const ids=new Set();
 b.events.forEach((e,i)=>{
  exact(e,['header','payload']);exact(e.header,['schema_version','event_id','author_id','created_at','visibility','references']);exact(e.payload,['kind','data']);
  const h=e.header;uuid(h.event_id);uuid(h.author_id);time(h.created_at);
  if(ids.has(h.event_id))fail('Duplicate public event.');ids.add(h.event_id);
  if(h.schema_version!=='0.1.0'||h.visibility!=='public'||!Array.isArray(h.references)||h.references.length)fail('Invalid public envelope.');
  if(i===0){if(e.payload.kind!=='presence')fail('Missing public presence.');exact(e.payload.data,['participant_id','handle']);uuid(e.payload.data.participant_id);string(e.payload.data.handle,80);author=e.payload.data.participant_id;}
  else{if(e.payload.kind!=='dream')fail('This reader accepts original reports only.');exact(e.payload.data,['text','language']);string(e.payload.data.text,100000);if(e.payload.data.language!=='und')fail('Unsupported snapshot language field.');}
  if(h.author_id!==author)fail('Inconsistent snapshot author.');
 });return b;
}
export function parsePublicSnapshot(raw){if(typeof raw!=='string'||enc.encode(raw).length>LIMIT)fail('Snapshot exceeds the 8 MiB limit.');return validatePublicSnapshot(JSON.parse(raw));}
const htmlEscape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function publicSnapshotHTML(snapshot){
 validatePublicSnapshot(snapshot);const handle=snapshot.events[0].payload.data.handle;
 return `<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; base-uri 'none'; form-action 'none'"><title>Oneiric Network — public selection</title><style>body{background:#0b1418;color:#e7eeea;font:18px/1.7 system-ui,sans-serif;max-width:760px;margin:auto;padding:32px}h1{font-family:Georgia,serif;font-weight:400}article{border-top:1px solid #40545b;margin-top:30px;padding-top:20px}p{white-space:pre-wrap;overflow-wrap:anywhere}small{color:#afc8c9}</style><h1>A public selection</h1><p>Published name: ${htmlEscape(handle)}</p><small>Unsigned reports selected by the notebook owner. No verified timing or experimental claims.</small>${snapshot.events.slice(1).map((e,i)=>`<article><h2>Report ${i+1}</h2><small>${htmlEscape(e.header.created_at)} · author-reported time</small><p>${htmlEscape(e.payload.data.text)}</p></article>`).join('')}<footer><p>Private titles and annotations are not included. Public copies cannot be recalled from other holders.</p></footer></html>`;
}
