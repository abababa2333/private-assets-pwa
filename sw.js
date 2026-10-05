const CACHE='private-assets-pwa-v3';
const FILES=['./','index.html','app.js','styles.css','config.js','manifest.webmanifest','icon.svg'];
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(FILES))));
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key!==CACHE).map(key=>caches.delete(key))))));
self.addEventListener('fetch',event=>{if(event.request.method!=='GET'||new URL(event.request.url).origin!==location.origin)return;const url=new URL(event.request.url);const options=url.pathname.endsWith('/config.js')?{cache:'no-store'}:undefined;event.respondWith(fetch(event.request,options).then(response=>{const copy=response.clone();caches.open(CACHE).then(cache=>cache.put(event.request,copy));return response;}).catch(()=>caches.match(event.request)));});
