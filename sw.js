/* Mr Kelly DT offline support. VERSION is replaced at build time. */
const VERSION='1792719922';
const SHELL='mkdt-shell-'+VERSION, RUNTIME='mkdt-runtime';
const PRECACHE=['/','/manifest.webmanifest','/icon-192.png','/icon-512.png'];
self.addEventListener('install',e=>{ e.waitUntil(caches.open(SHELL).then(c=>c.addAll(PRECACHE)).then(()=>self.skipWaiting())); });
self.addEventListener('activate',e=>{ e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k.startsWith('mkdt-shell-')&&k!==SHELL).map(k=>caches.delete(k)))).then(()=>self.clients.claim())); });
self.addEventListener('fetch',e=>{
  const r=e.request; if(r.method!=='GET') return;
  const u=new URL(r.url);
  if(r.mode==='navigate'){ // network first so updates arrive; fall back to the saved copy offline
    e.respondWith(fetch(r).then(res=>{ const c=res.clone(); caches.open(SHELL).then(x=>x.put('/',c)); return res; }).catch(()=>caches.match('/'))); return; }
  if(u.origin===location.origin && (u.pathname.startsWith('/img/')||u.pathname.startsWith('/printables/'))){ // cache what pupils open
    e.respondWith(caches.match(r).then(hit=>hit||fetch(r).then(res=>{ if(res.ok){const c=res.clone(); caches.open(RUNTIME).then(x=>x.put(r,c));} return res; }))); return; }
  if(/fonts\.(googleapis|gstatic)\.com$/.test(u.hostname)){
    e.respondWith(caches.match(r).then(hit=>{ const net=fetch(r).then(res=>{ const c=res.clone(); caches.open(RUNTIME).then(x=>x.put(r,c)); return res; }).catch(()=>hit); return hit||net; })); }
});
