const app=document.getElementById('app'),status=document.getElementById('status');
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let store=null,stored=null,notebook=null,passphrase='',busy=false,preview=null,dirty=false,backupCheck='No backup verified in this session.';
let drafts={title:'',text:'',annotation:'',report:''};
const field=id=>document.getElementById(id);
function message(text,error=false){status.textContent=text;status.classList.toggle('error',error);status.setAttribute('role',error?'alert':'status');}
function download(name,text,type='application/json'){
 const blob=new Blob([text],{type}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),30000);
}
async function fileText(id){const file=field(id).files[0];if(!file)throw new Error('Choose a file first.');if(file.size>8*1024*1024)throw new Error('File exceeds the 8 MiB limit.');return file.text();}
async function action(fn){if(busy)return;busy=true;const controls=[...app.querySelectorAll('button,input,textarea,select')].map(el=>[el,el.disabled]);controls.forEach(([el])=>el.disabled=true);try{await fn();}catch(e){message(e.message||'Operation failed. Nothing was changed.',true);}finally{busy=false;controls.forEach(([el,disabled])=>el.disabled=disabled);}}
function bind(id,fn){field(id)?.addEventListener('submit',e=>{e.preventDefault();action(fn);});}
async function persist(next,password=passphrase){
 const encrypted=await encryptNotebook(next,password);await store.write(stored,encrypted);
 stored=encrypted;notebook=next;passphrase=password;preview=null;backupCheck='This revision has not been verified against a downloaded backup.';
}
function readerMarkup(){return `<section class="panel"><h2>Read a public snapshot</h2><p>This opens selected public reports without importing them into your notebook.</p><form id="reader-form"><label for="public-file">Public selection (.json)</label><input id="public-file" type="file" accept=".json,application/json" required><button>Open public selection</button></form><div id="public-reader"></div></section>`;}
function render(){
 if(!store){app.innerHTML='<p>Opening encrypted local storage…</p>';return;}
 if(!notebook){
  app.innerHTML=`<div class="grid"><section class="panel"><h2>${stored?'Unlock this notebook':'Create a notebook'}</h2><p>${stored?'An encrypted notebook is saved in this browser.':'Use a made-up name and fictional notes while testing recovery.'}</p><form id="entry-form">${stored?'':'<label for="handle">Notebook name</label><input id="handle" maxlength="80" required autocomplete="off">'}<label for="password">Passphrase</label><input id="password" type="password" minlength="12" maxlength="1024" autocomplete="off" required>${stored?'':'<label for="confirm-password">Repeat passphrase</label><input id="confirm-password" type="password" minlength="12" maxlength="1024" autocomplete="off" required><p class="small">Use a long, unique passphrase and keep it separately. No reset service exists.</p>'}<button class="primary">${stored?'Unlock':'Create encrypted notebook'}</button></form></section><section class="panel"><h2>Restore on this installation</h2><p>${stored?'A notebook already exists here. Restoration is available only in an empty installation, so it cannot overwrite your work.':'Restore an encrypted backup without contacting the original installation.'}</p>${stored?'':`<form id="restore-form"><label for="backup-file">Encrypted backup (.json)</label><input id="backup-file" type="file" accept=".json,application/json" required><label for="restore-password">Backup passphrase</label><input id="restore-password" type="password" maxlength="1024" autocomplete="off" required><button>Restore encrypted backup</button></form>`}</section></div>${readerMarkup()}`;
  bind('entry-form',async()=>{
   const password=field('password').value;
   if(stored){const current=await store.read();if(!current)throw new Error('Stored notebook is missing. Reload this page to restore a backup.');const v=await decryptNotebook(current,password);stored=current;notebook=v;passphrase=password;backupCheck='No backup verified in this session.';}
   else{if(password!==field('confirm-password').value)throw new Error('Passphrases do not match.');await persist(createNotebook(field('handle').value),password);}
   render();message('Notebook unlocked. Saved data stays encrypted in this browser.');
  });
  bind('restore-form',async()=>{
   const raw=await fileText('backup-file'),password=field('restore-password').value;
   const recovered=await decryptNotebook(raw,password);
   await store.write(null,raw);stored=raw;notebook=recovered;passphrase=password;dirty=false;
   backupCheck=`Restored and decrypted backup: revision ${recovered.revision}.`;
   render();message('Recovery succeeded in this installation. No original service was contacted.');
  });
 }else{
  app.innerHTML=`<section class="panel"><div class="row"><div><h2>${esc(notebook.identity.handle)}</h2><p class="storage-status">Saved encrypted on this device · revision ${notebook.revision}</p><p class="small">${esc(backupCheck)}</p></div><button id="lock" class="spacer">Lock notebook</button></div><div class="actions"><button id="backup">Download encrypted backup</button></div><form id="verify-form"><label for="verify-file">Verify your downloaded backup</label><input id="verify-file" type="file" accept=".json,application/json" required><button>Reopen and verify</button></form></section>
  <div class="grid"><section class="panel"><h2>Record a dream</h2><form id="report-form"><label for="report-title">Private title</label><input id="report-title" maxlength="200" required autocomplete="off"><label for="report-text">Original report</label><textarea id="report-text" maxlength="100000" required></textarea><p class="small">Saving preserves the original text. Later interpretations are separate notes.</p><button class="primary">Save encrypted report</button></form></section><section class="panel"><h2>Add a later interpretation</h2><form id="annotation-form"><label for="annotation-report">Original report</label><select id="annotation-report" required>${notebook.reports.map(r=>`<option value="${r.id}">${esc(r.title)}</option>`).join('')}</select><label for="annotation-text">Private annotation</label><textarea id="annotation-text" maxlength="20000" required></textarea><button ${notebook.reports.length?'':'disabled'}>Save separate annotation</button></form></section></div>
  <section class="panel"><h2>Originals and later notes</h2>${notebook.reports.map(r=>`<article class="report"><h3>${esc(r.title)}</h3><span class="small">${esc(r.created_at)}</span><blockquote>${esc(r.text)}</blockquote>${r.annotations.map(a=>`<p class="small">Later note · ${esc(a.created_at)}</p><p class="note">${esc(a.text)}</p>`).join('')}</article>`).join('')||'<p>No reports yet.</p>'}</section>
  <section class="panel"><h2>Prepare a public selection</h2><p>Only selected original text, its recorded time, a public name and your portable author identifier will leave the notebook. Private titles and all annotations are excluded.</p><form id="preview-form"><label for="public-handle">Public name shown in the snapshot</label><input id="public-handle" maxlength="80" required autocomplete="off"><div>${notebook.reports.map(r=>`<label class="pick"><input type="checkbox" name="selection" value="${r.id}"><span>${esc(r.title)}<br><span class="small">Private title shown here for selection only</span></span></label>`).join('')}</div><button>Review exact public contents</button></form><div id="publication-preview"></div></section>${readerMarkup()}`;
  field('report-title').value=drafts.title;field('report-text').value=drafts.text;field('annotation-text').value=drafts.annotation;
  if(notebook.reports.some(r=>r.id===drafts.report))field('annotation-report').value=drafts.report;
  dirty=Boolean(drafts.title||drafts.text||drafts.annotation);
  bind('report-form',async()=>{await persist(appendReport(notebook,field('report-title').value,field('report-text').value));drafts.title='';drafts.text='';render();message('Original report saved encrypted. Download a fresh backup to protect this revision.');});
  bind('annotation-form',async()=>{await persist(appendAnnotation(notebook,field('annotation-report').value,field('annotation-text').value));drafts.annotation='';render();message('Annotation saved separately. Original report unchanged.');});
  field('backup').onclick=()=>action(async()=>{download(`oneiric-encrypted-backup-r${notebook.revision}.json`,stored);message('Backup download requested. Reopen the saved file below to verify it; this page cannot confirm the download reached disk.');});
  bind('verify-form',async()=>{const recovered=await decryptNotebook(await fileText('verify-file'),passphrase);if(JSON.stringify(recovered)!==JSON.stringify(notebook))throw new Error('The backup unlocked, but it is not the current notebook revision. Keep it, and download a current backup.');backupCheck=`Downloaded backup verified against revision ${notebook.revision}.`;render();message(backupCheck);});
  field('lock').onclick=()=>{if(dirty&&!confirm('Discard unsaved form text and lock? Saved reports are already encrypted.'))return;notebook=null;passphrase='';preview=null;dirty=false;drafts={title:'',text:'',annotation:'',report:''};render();message('Locked. Unlock with your passphrase or restore a backup on an empty installation.');};
  bind('preview-form',async()=>{
   const ids=[...app.querySelectorAll('input[name="selection"]:checked')].map(e=>e.value);preview=createPublicSnapshot(notebook,ids,field('public-handle').value);
   field('publication-preview').innerHTML=`<h3>Exact public payload</h3><p class="small">${ids.length} selected ${ids.length===1?'report':'reports'}. Author identifier: ${esc(notebook.identity.id)}. These records are unsigned. Publishing this identifier can link separate public selections.</p><pre>${esc(JSON.stringify(preview,null,2))}</pre><label class="pick"><input id="publish-consent" type="checkbox"><span>I reviewed the text, times and author identifier. I understand public copies may persist.</span></label><div class="actions"><button id="download-public-json" type="button">Export public JSON</button><button id="download-public-html" type="button">Export readable public page</button></div><p class="small">These buttons download files only. Nothing is posted or uploaded.</p>`;
   const exportPublic=html=>action(async()=>{if(!field('publish-consent').checked)throw new Error('Review the public contents and check the confirmation first.');download(html?'oneiric-public-selection.html':'oneiric-public-selection.json',html?publicSnapshotHTML(preview):JSON.stringify(preview,null,2),html?'text/html':'application/json');message('Public selection download requested. No private titles or annotations were included.');});
   field('download-public-json').onclick=()=>exportPublic(false);field('download-public-html').onclick=()=>exportPublic(true);
  });
 }
 bind('reader-form',async()=>{const b=parsePublicSnapshot(await fileText('public-file'));field('public-reader').innerHTML=`<h3>Public name: ${esc(b.events[0].payload.data.handle)}</h3><p class="small">Unsigned public snapshot · ${b.events.length-1} reports · no verified timing</p>${b.events.slice(1).map(e=>`<article class="report"><p class="small">${esc(e.header.created_at)}</p><blockquote>${esc(e.payload.data.text)}</blockquote></article>`).join('')}`;message('Public snapshot opened. Your private notebook was not changed.');});
}
app.addEventListener('input',event=>{
 if(event.target.closest('#report-form,#annotation-form')){drafts={title:field('report-title').value,text:field('report-text').value,annotation:field('annotation-text').value,report:field('annotation-report').value};dirty=Boolean(drafts.title||drafts.text||drafts.annotation);}
 if(event.target.closest('#preview-form')){preview=null;const target=field('publication-preview');if(target)target.replaceChildren();}
});
window.addEventListener('beforeunload',event=>{if(dirty||busy){event.preventDefault();event.returnValue='';}});
window.addEventListener('pagehide',()=>{notebook=null;passphrase='';preview=null;dirty=false;drafts={title:'',text:'',annotation:'',report:''};app.replaceChildren();});
window.addEventListener('pageshow',event=>{if(event.persisted)location.reload();});
async function start(){try{if(!crypto.subtle)throw new Error('Encryption is unavailable here. Open a trusted copy using HTTPS or localhost. No plaintext notebook will be stored.');store=await openNotebookStore(window.indexedDB);stored=await store.read();render();}catch(e){app.innerHTML=readerMarkup();message(e.message,true);bind('reader-form',async()=>{const b=parsePublicSnapshot(await fileText('public-file'));field('public-reader').textContent=b.events.slice(1).map(e=>e.payload.data.text).join('\n\n');});}}
start();
