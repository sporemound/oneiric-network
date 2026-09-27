const bundle = JSON.parse(document.getElementById('world-data').textContent);
const layout = JSON.parse(document.getElementById('layout-data').textContent);
const $ = id => document.getElementById(id);
const escape = value => String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const classLabel = {real:'Real-world referent',fictional:'Fictional setting',imagined:'Imagined place',emergent:'Provisional place'};
const stanceLabel = {supports:'Resemblance',contradicts:'Contradiction',uncertain:'Uncertain'};
const date = value => `Sep ${Number(value.slice(8,10))} · ${value.slice(11,16)} UTC`;
let day=5, view='network', world=projectWorld(bundle,layout,day);
let selected={type:'place',id:world.places.find(p=>p.name==='The dry harbor').id};
const badge=(value,label)=>`<span class="tag ${escape(value)}">${escape(label)}</span>`;
const inspect=(type,id,label,cls='observation')=>`<button class="${cls}" data-type="${type}" data-id="${id}">${label}</button>`;
const proof=event=>`<details><summary>Inspect the original event</summary><p>Unsigned synthetic record. This is not verified research evidence.</p><pre>${escape(JSON.stringify(event,null,2))}</pre></details>`;
const annotationsFor=id=>world.annotations.filter(e=>e.payload.data.subject_event_id===id);
const annotationSection=id=>{
 const found=annotationsFor(id);
 return `<section class="detail-section"><h3>Later interpretations</h3>${found.length?found.map(e=>`<p class="small">${date(e.header.created_at)} · ${escape(e.payload.data.layer)}</p><p class="annotation">${escape(e.payload.data.text)}</p>`).join(''):'<p class="small">None recorded by this point in the chronology.</p>'}</section>`;
};
function graph(){
 const position=new Map([...world.dreams,...world.places].map(n=>[n.id,n]));
 $('edges').innerHTML=world.edges.map(edge=>{
  const a=position.get(edge.source_event_id),b=position.get(edge.place_id);
  const path=`M${a.x},${a.y} L${b.x},${b.y}`;
  const active=selected.type==='edge'&&selected.id===edge.id;
  return `<g><path d="${path}" class="connection ${edge.stance}${active?' selected':''}"/><path d="${path}" class="edge-hit" role="button" tabindex="0" data-type="edge" data-id="${edge.id}" aria-label="${escape(`${stanceLabel[edge.stance]}: ${a.code} to ${b.name}`)}"/></g>`;
 }).join('');
 $('nodes').innerHTML=world.places.map((p,i)=>`<button class="node place" style="left:${p.x}px;top:${p.y}px" data-type="place" data-id="${p.id}" aria-pressed="${selected.type==='place'&&selected.id===p.id}" aria-label="Explore ${escape(p.name)}"><span aria-hidden="true">${String(i+1).padStart(2,'0')}</span><span class="node-label">${escape(p.name)}</span><span class="node-sub">${escape(classLabel[p.class])}</span></button>`).join('')+world.dreams.map(d=>`<button class="node dream" style="left:${d.x}px;top:${d.y}px" data-type="dream" data-id="${d.id}" aria-pressed="${selected.type==='dream'&&selected.id===d.id}" aria-label="Read ${d.code}: ${escape(d.title)}">${d.code}</button>`).join('');
}
function atlas(){
 $('atlas-grid').innerHTML=world.places.map((p,i)=>{
  const linked=world.edges.filter(e=>e.place_id===p.id), conflicts=linked.filter(e=>e.stance==='contradicts').length;
  return `<button class="place-card" data-type="place" data-id="${p.id}" aria-pressed="${selected.type==='place'&&selected.id===p.id}"><span class="ordinal">${String(i+1).padStart(2,'0')}</span><strong>${escape(p.name)}</strong><p>${linked.length} attributed connections · ${conflicts} ${conflicts===1?'contradiction':'contradictions'}</p>${badge(p.class,classLabel[p.class])}</button>`;
 }).join('');
}
function detail(){
 let html='';
 if(selected.type==='place'){
  const p=world.places.find(p=>p.id===selected.id);
  const edges=world.edges.filter(e=>e.place_id===p.id);
  html=`<p class="eyebrow">Place ${String(world.places.indexOf(p)+1).padStart(2,'0')} / Atlas entry</p>${badge(p.class,classLabel[p.class])}<h2>${escape(p.name)}</h2><p class="detail-intro">${escape(p.description)}</p><section class="detail-section"><h3>Why these reports are connected</h3>${edges.map(e=>{
   const dream=world.dreams.find(d=>d.id===e.source_event_id);
   return inspect('edge',e.id,`${badge(e.stance,stanceLabel[e.stance])}<strong>${dream.code} · ${escape(dream.title)}</strong><span class="meta">${escape(e.dimension)} · added ${date(e.time)}</span>`);
  }).join('')||'<p class="small">This place has been described, but no associations have been recorded yet.</p>'}</section>${proof(p.event)}`;
 }else if(selected.type==='dream'){
  const d=world.dreams.find(d=>d.id===selected.id), edges=world.edges.filter(e=>e.source_event_id===d.id);
  html=`<p class="eyebrow">${d.code} / Original report</p>${badge('dream','Synthetic report')}<h2>${escape(d.title)}</h2><p class="small">${escape(d.author)} · ${date(d.time)}</p><blockquote>“${escape(d.text)}”</blockquote><section class="detail-section"><h3>Attributed place associations</h3>${edges.map(e=>inspect('edge',e.id,`${badge(e.stance,stanceLabel[e.stance])}<strong>${escape(world.places.find(p=>p.id===e.place_id).name)}</strong>`)).join('')||'<p class="small">No place association recorded. An unconnected report remains part of the archive.</p>'}</section>${annotationSection(d.id)}${proof(d.event)}`;
 }else{
  const e=world.edges.find(e=>e.id===selected.id), d=world.dreams.find(d=>d.id===e.source_event_id),p=world.places.find(p=>p.id===e.place_id);
  html=`<p class="eyebrow">An attributed connection</p>${badge(e.stance,stanceLabel[e.stance])}<h2>${escape(d.title)}<br><span class="muted">& ${escape(p.name)}</span></h2><p class="small">Added ${date(e.time)} · by curator (fictional)</p><section class="detail-section"><h3>Why this line exists</h3><p class="detail-intro">${escape(e.value)}</p><p class="small">Dimension: ${escape(e.dimension)}. Hand-authored association, not an automatic similarity score. Exposure to other reports is unverified.</p></section><section class="detail-section"><h3>What was originally reported</h3><p class="small">${d.code} · ${escape(d.author)} · ${date(d.time)}</p><blockquote>“${escape(d.text)}”</blockquote></section>${annotationSection(d.id)}${inspect('dream',d.id,'Read this report')}${inspect('place',p.id,'Explore this place')}${proof(e.event)}`;
 }
 $('detail-content').innerHTML=html;
}
function render(){
 world=projectWorld(bundle,layout,day);
 const pool=selected.type==='place'?world.places:selected.type==='dream'?world.dreams:world.edges;
 if(!pool.some(item=>item.id===selected.id))selected={type:'dream',id:world.dreams[0].id};
 $('counts').textContent=`${world.dreams.length} reports / ${world.places.length} places / ${world.edges.length} attributed connections`;
 $('day-label').textContent=`Day ${day}`;
 $('time-note').textContent=day===5?'Later interpretations are visible':day===1?'Before the two provisional places were proposed':'Connections are still accumulating';
 $('day').setAttribute('aria-valuetext',`Day ${day}, September ${day}; ${world.dreams.length} fictional reports`);
 $('network-view').hidden=view!=='network';$('atlas-view').hidden=view!=='atlas';
 $('network-button').setAttribute('aria-pressed',view==='network');$('atlas-button').setAttribute('aria-pressed',view==='atlas');
 $('field-kicker').textContent=view==='network'?'01 / Network':'02 / Atlas';
 $('field-title').textContent=view==='network'?'An unfinished geography':'Five ways of being somewhere';
 $('field-hint').textContent=view==='network'?'Select a circle or a connecting line.':'Select a place to read its differences.';
 graph();atlas();detail();
 const unconnected=new Set(world.unconnected.map(d=>d.id));
 $('archive-note').textContent=`${world.unconnected.length} ${world.unconnected.length===1?'report has':'reports have'} no place association at this point.`;
 $('report-list').innerHTML=world.dreams.map(d=>`<button class="report-row" data-type="dream" data-id="${d.id}" aria-pressed="${selected.type==='dream'&&selected.id===d.id}"><span>${d.code} / ${escape(d.author)} / Sep ${Number(d.time.slice(8,10))}</span><strong>${escape(d.title)}</strong>${unconnected.has(d.id)?'<em>No place association</em>':''}</button>`).join('');
}
function selectElement(el){
 const previous=document.activeElement;
 const area=el.closest('#report-list')?'report-list':el.closest('#nodes')?'nodes':el.closest('#edges')?'edges':el.closest('#atlas-grid')?'atlas-grid':null;
 selected={type:el.dataset.type,id:el.dataset.id};render();
 if(area&&previous===el){document.querySelector(`#${area} [data-id="${selected.id}"]`)?.focus({preventScroll:true});}
 $('announcement').textContent=`Selected ${$('detail-content').querySelector('h2').textContent}`;
 if(window.matchMedia('(max-width:760px)').matches)$('detail').scrollIntoView({block:'start',behavior:'auto'});
}
document.addEventListener('click',event=>{const el=event.target.closest('[data-type][data-id]');if(el)selectElement(el);});
$('edges').addEventListener('keydown',event=>{if(['Enter',' '].includes(event.key)&&event.target.matches('.edge-hit')){event.preventDefault();selectElement(event.target);}});
$('network-button').addEventListener('click',()=>{view='network';render();});
$('atlas-button').addEventListener('click',()=>{view='atlas';render();});
$('day').addEventListener('input',event=>{day=Number(event.target.value);render();});
$('about-button').addEventListener('click',()=>{const open=$('about').hidden;$('about').hidden=!open;$('about-button').setAttribute('aria-expanded',open);});
render();
