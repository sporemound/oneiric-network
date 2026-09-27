import assert from 'node:assert/strict';
import {test} from 'node:test';
import {IDBFactory} from 'fake-indexeddb';
import {createNotebook,appendReport,appendAnnotation,encryptNotebook,decryptNotebook,createPublicSnapshot,parsePublicSnapshot,publicSnapshotHTML,parseBackup} from '../apps/web/vault.mjs';
import {openNotebookStore} from '../apps/web/notebook-store.mjs';
const password='fictional rehearsal passphrase only';
const fixture=()=>{
 let v=createNotebook('private name');v=appendReport(v,'PRIVATE TITLE','SELECTED ORIGINAL');v=appendReport(v,'OTHER TITLE','UNSELECTED SECRET');return appendAnnotation(v,v.reports[0].id,'PRIVATE ANNOTATION');
};
test('rehearsal: independent installation restores ciphertext, identity and exact records',async()=>{
 const v=fixture(),one=await openNotebookStore(new IDBFactory()),backup=await encryptNotebook(v,password);
 await one.write(null,backup);assert(!backup.includes('SELECTED ORIGINAL'));one.close();
 // New database factory: no shared browser storage or original installation.
 const two=await openNotebookStore(new IDBFactory());assert.equal(await two.read(),null);
 const recovered=await decryptNotebook(backup,password);await two.write(null,backup);
 assert.deepEqual(recovered,v);assert.equal(recovered.identity.id,v.identity.id);
 const pub=createPublicSnapshot(recovered,[recovered.reports[0].id],'public name'),json=JSON.stringify(pub),html=publicSnapshotHTML(pub);
 for(const secret of ['PRIVATE TITLE','UNSELECTED SECRET','PRIVATE ANNOTATION','private name',recovered.reports[0].id]){assert(!json.includes(secret));assert(!html.includes(secret));}
 assert(json.includes('SELECTED ORIGINAL'));assert.equal(parsePublicSnapshot(json).events.length,2);
 assert.equal(recovered.reports[0].text,'SELECTED ORIGINAL');two.close();
});
test('wrong passphrase, ciphertext modification and unsupported headers fail closed',async()=>{
 const raw=await encryptNotebook(fixture(),password);
 await assert.rejects(decryptNotebook(raw,'incorrect phrase'),/Unable to unlock/);
 const e=JSON.parse(raw);e.ciphertext=(e.ciphertext[0]==='A'?'B':'A')+e.ciphertext.slice(1);
 await assert.rejects(decryptNotebook(JSON.stringify(e),password),/Unable to unlock/);
 e.kdf='PBKDF2-SHA256-1';assert.throws(()=>parseBackup(JSON.stringify(e)),/Unsupported/);
 assert.throws(()=>parseBackup('x'.repeat(8*1024*1024+1)),/limit/);
});
test('encryption is randomized and unsupported notebook versions are rejected',async()=>{
 const v=fixture(),a=JSON.parse(await encryptNotebook(v,password)),b=JSON.parse(await encryptNotebook(v,password));
 assert.notEqual(a.salt,b.salt);assert.notEqual(a.iv,b.iv);assert.notEqual(a.ciphertext,b.ciphertext);
 v.version=2;await assert.rejects(encryptNotebook(v,password),/Unsupported/);
});
test('atomic storage refuses restore over existing work and rejects stale writers',async()=>{
 const db=new IDBFactory(),a=await openNotebookStore(db),b=await openNotebookStore(db);
 await a.write(null,'encrypted revision 1');
 await assert.rejects(b.write(null,'replacement'),/another tab/);
 const results=await Promise.allSettled([a.write('encrypted revision 1','encrypted revision 2'),b.write('encrypted revision 1','encrypted revision 3')]);
 assert.equal(results.filter(r=>r.status==='fulfilled').length,1);
 assert(['encrypted revision 2','encrypted revision 3'].includes(await a.read()));a.close();b.close();
});
test('publication is an explicit allowlist and inert HTML escapes hostile report text',()=>{
 let v=createNotebook('test');v=appendReport(v,'secret title','</script><img src=x onerror=alert(1)>');
 assert.throws(()=>createPublicSnapshot(v,[],'name'),/Select/);
 const snapshot=createPublicSnapshot(v,[v.reports[0].id],'name'),html=publicSnapshotHTML(snapshot);
 assert(!html.includes('<img'));assert(html.includes('&lt;img'));assert(!html.includes('<script'));
 snapshot.events[1].header.visibility='private';assert.throws(()=>parsePublicSnapshot(JSON.stringify(snapshot)),/envelope/);
});
