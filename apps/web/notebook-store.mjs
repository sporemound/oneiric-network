// Atomic compare-and-swap avoids overwriting changes from another tab.
export function openNotebookStore(indexedDB,name='oneiric-private-notebook-v1'){
 return new Promise((resolve,reject)=>{
  if(!indexedDB){reject(new Error('Local storage unavailable. Your notebook has not been saved.'));return;}
  const request=indexedDB.open(name,1);
  request.onupgradeneeded=()=>request.result.createObjectStore('encrypted');
  request.onerror=()=>reject(new Error('Cannot open local encrypted storage.'));
  request.onblocked=()=>reject(new Error('Close other notebook tabs and try again.'));
  request.onsuccess=()=>{
   const db=request.result;db.onversionchange=()=>db.close();
   resolve({
    read:()=>new Promise((yes,no)=>{const tx=db.transaction('encrypted','readonly'),get=tx.objectStore('encrypted').get('current');get.onsuccess=()=>yes(get.result??null);get.onerror=()=>no(get.error);}),
    write:(expected,next)=>new Promise((yes,no)=>{
     let conflict=false;const tx=db.transaction('encrypted','readwrite'),store=tx.objectStore('encrypted'),get=store.get('current');
     get.onsuccess=()=>{if((get.result??null)!==expected){conflict=true;tx.abort();}else store.put(next,'current');};
     tx.oncomplete=()=>yes();tx.onerror=()=>{};tx.onabort=()=>no(new Error(conflict?'Storage changed in another tab. Lock and unlock to reload; your current input has not been saved.':'Local save failed. Keep this page open and export your last saved backup.'));
    }),close:()=>db.close()
   });
  };
 });
}
