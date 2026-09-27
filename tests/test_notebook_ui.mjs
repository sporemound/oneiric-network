import assert from 'node:assert/strict';
import {test} from 'node:test';
import {readFileSync} from 'node:fs';
import {webcrypto} from 'node:crypto';
import {JSDOM,VirtualConsole} from 'jsdom';
import {IDBFactory} from 'fake-indexeddb';
import {openNotebookStore} from '../apps/web/notebook-store.mjs';
import {decryptNotebook,createPublicSnapshot} from '../apps/web/vault.mjs';
const html=readFileSync(new URL('../apps/web/notebook.html',import.meta.url),'utf8');
const password='test recovery phrase stays local';
function instance(db=new IDBFactory()){
 const errors=[],console=new VirtualConsole();console.on('jsdomError',e=>errors.push(e.message));
 const dom=new JSDOM(html,{url:'https://rehearsal.invalid',runScripts:'dangerously',virtualConsole:console,beforeParse(w){
  Object.defineProperty(w,'crypto',{value:webcrypto});w.indexedDB=db;w.TextEncoder=TextEncoder;w.TextDecoder=TextDecoder;w.structuredClone=structuredClone;w.confirm=()=>true;
 }});
 const doc=dom.window.document;
 return {dom,doc,errors,db,set(id,value){const el=doc.getElementById(id);el.value=value;el.dispatchEvent(new dom.window.Event('input',{bubbles:true}));},submit(id){doc.getElementById(id).dispatchEvent(new dom.window.Event('submit',{bubbles:true,cancelable:true}));},file(id,text){Object.defineProperty(doc.getElementById(id),'files',{configurable:true,value:[{size:Buffer.byteLength(text),text:async()=>text}]});}};
}
async function waitFor(fn){const start=Date.now();while(!fn()){if(Date.now()-start>10000)throw new Error('UI did not reach expected state.');await new Promise(r=>setTimeout(r,15));}}
test('UI creates, saves, preserves other drafts, locks, restores in a clean instance and reads public data',async()=>{
 const a=instance();await waitFor(()=>a.doc.getElementById('entry-form'));
 a.set('handle','Fictional tester');a.set('password',password);a.set('confirm-password',password);a.submit('entry-form');await waitFor(()=>a.doc.getElementById('report-form'));
 a.set('report-title','PRIVATE TITLE');a.set('report-text','Selected original');a.submit('report-form');await waitFor(()=>a.doc.querySelector('.report h3')?.textContent==='PRIVATE TITLE');
 a.set('report-title','Unsaved second title');a.set('report-text','Unsaved second report');a.set('annotation-text','SECRET NOTE');a.submit('annotation-form');await waitFor(()=>a.doc.querySelector('.note'));
 assert.equal(a.doc.getElementById('report-text').value,'Unsaved second report');
 const backing=await openNotebookStore(a.db),backup=await backing.read();assert(!backup.includes('Selected original'));const current=await decryptNotebook(backup,password);
 a.doc.getElementById('lock').click();assert(!a.doc.body.textContent.includes('SECRET NOTE'));assert(!a.doc.querySelector('#report-text'));
 a.dom.window.close();backing.close();
 const b=instance();await waitFor(()=>b.doc.getElementById('restore-form'));
 b.file('backup-file',backup);b.set('restore-password',password);b.submit('restore-form');await waitFor(()=>b.doc.querySelector('.note'));
 assert.equal(b.doc.querySelector('.note').textContent,'SECRET NOTE');assert(!b.doc.body.textContent.includes('Unsaved second report'));
 b.file('verify-file',backup);b.submit('verify-form');await waitFor(()=>b.doc.getElementById('status').textContent.includes('Downloaded backup verified'));
 const pub=JSON.stringify(createPublicSnapshot(current,[current.reports[0].id],'Public alias'));
 const c=instance();await waitFor(()=>c.doc.getElementById('reader-form'));c.file('public-file',pub);c.submit('reader-form');await waitFor(()=>c.doc.getElementById('public-reader').textContent.includes('Selected original'));
 assert(!c.doc.getElementById('public-reader').textContent.includes('SECRET NOTE'));
 assert.equal(await (await openNotebookStore(c.db)).read(),null);
 assert.deepEqual([...a.errors,...b.errors,...c.errors],[]);b.dom.window.close();c.dom.window.close();
});
test('UI will not offer a notebook when encryption is unavailable',async()=>{
 const dom=new JSDOM(html,{runScripts:'dangerously',beforeParse(w){w.TextEncoder=TextEncoder;w.TextDecoder=TextDecoder;}});
 await waitFor(()=>dom.window.document.getElementById('status').textContent.includes('Encryption is unavailable'));
 assert.equal(dom.window.document.getElementById('entry-form'),null);dom.window.close();
});
