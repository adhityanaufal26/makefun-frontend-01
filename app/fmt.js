export function esc(s){return String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
export function usd(v){const n=Number(v);return Number.isFinite(n)?"$"+n.toLocaleString("en-US",{maximumFractionDigits:2}):"—"}
export function num(v){const n=Number(v);return Number.isFinite(n)?n.toLocaleString("en-US"):"—"}
export function pct(v){return v==null?"—":(Number(v)/1e6*100).toFixed(2)+"%"}
export function dt(s){if(!s)return "—";const d=new Date(s);return Number.isNaN(d)?"—":d.toLocaleString("en-US",{month:"short",day:"numeric",year:"numeric",hour:"2-digit",minute:"2-digit"})}
export function left(ms){if(ms<=0)return "closed";const s=Math.floor(ms/1000),d=Math.floor(s/86400),h=Math.floor(s%86400/3600),m=Math.floor(s%3600/60);if(d>0)return d+"d "+h+"h "+String(m).padStart(2,"0")+"m";if(h>0)return h+"h "+String(m).padStart(2,"0")+"m";return m+"m "+String(s%60).padStart(2,"0")+"s"}
export function openOf(c){return c&&c.deadline?Date.now()<new Date(c.deadline).getTime():false}
export function badge(c){return openOf(c)?'<span class="badge open">OPEN</span>':'<span class="badge closed">CLOSED</span>'}
