const SHELL_CACHE="floodhelp-shell-v1";
const MAP_CACHE="floodhelp-map-v1";
const SHELL_FILES=["./","./index.html"];
self.addEventListener("install",event=>{
 event.waitUntil(caches.open(SHELL_CACHE).then(cache=>cache.addAll(SHELL_FILES)).then(()=>self.skipWaiting()));
});
self.addEventListener("activate",event=>{
 event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key.startsWith("floodhelp-")&&key!==SHELL_CACHE&&key!==MAP_CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim()));
});
self.addEventListener("fetch",event=>{
 const request=event.request;
 if(request.method!=="GET")return;
 const url=new URL(request.url);
 const isTile=/^(a|b|c)\.tile\.openstreetmap\.org$/.test(url.hostname)||url.hostname==="tile.openstreetmap.org";
 const isLeaflet=url.hostname==="unpkg.com"&&url.pathname.includes("/leaflet@1.9.4/");
 if(request.mode==="navigate"){
  event.respondWith(fetch(request).then(response=>{
   if(response&&response.ok)caches.open(SHELL_CACHE).then(cache=>cache.put("./index.html",response.clone()));
   return response;
  }).catch(()=>caches.match("./index.html").then(cached=>cached||caches.match("./"))));
  return;
 }
 if(isTile||isLeaflet){
  event.respondWith(fetch(request).then(response=>{
   if(response&&(response.ok||response.type==="opaque"))caches.open(MAP_CACHE).then(cache=>cache.put(request,response.clone()));
   return response;
  }).catch(()=>caches.match(request)));
 }
});
