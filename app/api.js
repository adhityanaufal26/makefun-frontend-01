const API="https://make.fun/api";
const mem=new Map();
function store(){try{return localStorage}catch(e){return null}}
export async function get(path){
  const url=API+path,ls=store();
  let rec=mem.get(url);
  if(!rec&&ls){try{rec=JSON.parse(ls.getItem("mf:"+url)||"null")}catch(e){rec=null}}
  const h={};if(rec&&rec.etag)h["If-None-Match"]=rec.etag;
  const r=await fetch(url,{headers:h});
  if(r.status===304&&rec)return rec.body;
  if(!r.ok)throw new Error("make.fun answered "+r.status+" for "+path);
  const body=await r.json(),etag=r.headers.get("ETag");
  rec={etag,body};mem.set(url,rec);
  if(ls){try{ls.setItem("mf:"+url,JSON.stringify(rec))}catch(e){}}
  return body;
}
export function apiUrl(p){return API+p}
