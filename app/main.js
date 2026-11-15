import {get} from "./api.js";
import {md} from "./md.js";
import {esc,usd,num,pct,dt,left,openOf,badge} from "./fmt.js";
const view=document.getElementById("view");
const BASE="https://make.fun";
let board=null,timer=null;
function ready(){window.__shotReady=true}
function loading(t){window.__shotReady=false;view.innerHTML="<h1>"+esc(t)+"</h1><p class=muted>Loading from make.fun…</p>"}
function fail(e){window.__shotReady=false;view.innerHTML='<div class=err role=alert><b>Could not load this page.</b><p>'+esc(e.message||e)+'</p><button data-act=retry>Retry</button></div>';ready()}
function tick(){document.querySelectorAll("[data-dl]").forEach(el=>{el.textContent=left(Number(el.dataset.dl)-Date.now())})}
if(!timer)timer=setInterval(tick,1000);
view.addEventListener("click",e=>{if(e.target.closest("[data-act=retry]"))route()});
document.getElementById("hs").addEventListener("submit",e=>{e.preventDefault();const q=document.getElementById("hq").value.trim();if(q)location.hash="#/u/"+encodeURIComponent(q)});
function route(){
  const h=(location.hash||"#/").slice(2),p=h.split("/").filter(Boolean);
  if(p.length===0)return boardView();
  if(p[0]==="bounty"&&p[1]&&p.length===2)return bountyView(decodeURIComponent(p[1]));
  if(p[0]==="bounty"&&p[1]&&p[2]==="leaderboard")return lbView(decodeURIComponent(p[1]));
  if(p[0]==="u"&&p[1])return profileView(decodeURIComponent(p[1]));
  loading("Not found");view.innerHTML+='<p><a href="#/">Back to the board</a></p>';ready();
}
window.addEventListener("hashchange",route);
async function boardView(){
  loading("Live bounties");
  try{
    if(!board){
      let items=[],cur="",pages=0;
      do{const d=await get("/competitions?limit=100"+(cur?"&cursor="+encodeURIComponent(cur):""));items=items.concat(d.items||[]);cur=d.next_cursor||"";pages++}while(cur&&pages<8);
      board=items;
    }
    const taking=board.filter(openOf);
    const pot=taking.reduce((a,c)=>a+Number(c.potUsd||0),0),ent=taking.reduce((a,c)=>a+Number(c.submissionCount||0),0);
    view.innerHTML='<h1>Live bounties</h1><p class=sub>Every bounty on make.fun, reward shown as its live pot. A bounty past its deadline is closed even when the API still says open.</p>'
      +'<div class=strip><div><b>'+taking.length+'</b><span>taking entries</span></div><div><b>'+usd(pot)+'</b><span>total live pots</span></div><div><b>'+num(ent)+'</b><span>total entries</span></div><div><b>'+board.length+'</b><span>bounties listed</span></div></div>'
      +'<div class=controls><input type=search id=q placeholder="Search title or slug…" aria-label="Search bounties">'
      +'<label>Sort <select id=sort><option value=close>Closing soonest</option><option value=pot>Biggest pot</option><option value=entries>Most entries</option></select></label>'
      +'<label>Fee <select id=fee><option value=all>Free + paid</option><option value=free>Free entry</option><option value=paid>Paid entry</option></select></label>'
      +'<label>Status <select id=st><option value=taking>Taking entries</option><option value=all>All</option><option value=closed>Closed</option></select></label></div>'
      +'<p class=small muted id=shown></p><table><thead><tr><th>Bounty</th><th class=num>Live pot</th><th class=num>Entry fee</th><th>Time left</th><th class=num>Entries</th></tr></thead><tbody id=rows></tbody></table>';
    const draw=()=>{
      const q=document.getElementById("q").value.toLowerCase(),s=document.getElementById("sort").value,f=document.getElementById("fee").value,st=document.getElementById("st").value;
      let list=board.filter(c=>{const t=(c.title+" "+c.slug+" "+(c.category||"")).toLowerCase();return (!q||t.includes(q))&&(!c.entryFeeUsd?f!=="paid":f!=="free")&&(st==="all"||(st==="taking"?openOf(c):!openOf(c)))});
      list=list.slice().sort((a,b)=>s==="pot"?Number(b.potUsd||0)-Number(a.potUsd||0):s==="entries"?Number(b.submissionCount||0)-Number(a.submissionCount||0):(new Date(a.deadline)-new Date(b.deadline)));
      document.getElementById("shown").textContent="Showing "+list.length+" of "+board.length+" bounties";
      document.getElementById("rows").innerHTML=list.map(c=>'<tr><td><a href="#/bounty/'+esc(c.slug)+'">'+esc(c.title)+'</a><span class=cat>'+esc(c.category||"")+" · "+badge(c)+'</span></td><td class=num><span class=pot>'+usd(c.potUsd)+'</span></td><td class="num fee">'+(c.entryFeeUsd?usd(c.entryFeeUsd):"Free")+'</td><td data-dl="'+new Date(c.deadline).getTime()+'">'+left(new Date(c.deadline)-Date.now())+'</td><td class=num>'+num(c.submissionCount)+"</td></tr>").join("")||'<tr><td colspan=5>No bounties match.</td></tr>';
    };
    ["q","sort","fee","st"].forEach(id=>document.getElementById(id).addEventListener("input",draw));
    draw();ready();
  }catch(e){fail(e)}
}
async function bountyView(slug){
  loading("Bounty");
  try{
    const c=await get("/competitions/"+encodeURIComponent(slug));
    const rw=c.rewardsNow||[],max=Math.max(1,...rw.map(r=>Number(r.amountUsd||0)));
    view.innerHTML='<p><a href="#/">← Board</a> · <a href="#/bounty/'+esc(c.slug)+'/leaderboard">Leaderboard</a> · <a href="'+BASE+esc(c.url||"/bounty/"+c.slug)+'">Enter on make.fun →</a></p>'
      +"<h1>"+esc(c.title)+"</h1><p class=sub>"+esc(c.summary||c.category||"")+" "+badge(c)+"</p>"
      +'<div class=strip><div><b>'+usd(c.potUsd)+'</b><span>live pot</span></div><div><b>'+(c.entryFeeUsd?usd(c.entryFeeUsd):"Free")+'</b><span>entry fee</span></div><div><b>'+num(c.submissionCount)+'</b><span>entries</span></div><div><b data-dl="'+new Date(c.deadline).getTime()+'">'+left(new Date(c.deadline)-Date.now())+'</b><span>time left</span></div></div>'
      +'<h2>Rewards — live pot '+usd(c.potUsd)+'</h2><table class=bars><thead><tr><th>Place</th><th>Base</th><th>Fee share</th><th></th><th class=amt>Total</th></tr></thead><tbody>'
      +(rw.map(r=>'<tr><td>#'+r.place+'</td><td class=num>'+usd(r.baseUsd)+'</td><td class=num>'+usd(r.feeShareUsd)+'</td><td><div class=bar style="width:'+Math.max(2,Math.round(Number(r.amountUsd||0)/max*100))+'%"></div></td><td class=amt><b>'+usd(r.amountUsd)+"</b></td></tr>").join("")||'<tr><td colspan=5>No rewards table published.</td></tr>')+"</tbody></table>"
      +'<dl class=kv><dt>Opens</dt><dd>'+dt(c.opensAt)+'</dd><dt>Deadline</dt><dd>'+dt(c.deadline)+'</dd><dt>Results</dt><dd>'+(c.resolvedAt?dt(c.resolvedAt):"Not published yet")+'</dd><dt>Status</dt><dd>'+(openOf(c)?"Taking entries":"Closed — past deadline")+" ("+esc(c.status||"")+")</dd><dt>Entry fees</dt><dd>"+usd(c.entryFeesUsd)+" from "+num(c.entryFeePayers)+" payers</dd></dl>"
      +(c.description?'<h2>About</h2><div class=desc>'+md(c.description)+"</div>":"")
      +(c.rules?'<h2>Rules</h2><p class=desc>'+esc(c.rules)+"</p>":"")
      
      +'<p class=small><a href="#/bounty/'+esc(c.slug)+'/leaderboard">See the leaderboard →</a></p>';
    ready();
  }catch(e){fail(e)}
}
async function lbView(slug){
  loading("Leaderboard");
  try{
    const d=await get("/competitions/"+encodeURIComponent(slug)+"/leaderboard");
    const en=(d.entries||[]).slice(),comp=d.competition||{slug};
    let shown=0;
    const row=e=>{const v=e.values||{};return '<tr><td>'+num(e.rank)+'</td><td><a href="#/u/'+esc(e.handle)+'">'+esc(e.handle)+'</a>'+(e.title?' <span class=cat>'+esc(e.title)+"</span>":"")+'</td><td class=num>'+pct(v.judge)+'</td><td class=num>'+(v.judge_low!=null?pct(v.judge_low)+" – "+pct(v.judge_high):"—")+'</td><td class=num>'+(v.valid==null?"—":v.valid)+'</td><td class=num>'+(v.bytes!=null?num(v.bytes)+" B":"—")+"</td></tr>"};
    const more=()=>{const n=en.slice(shown,shown+50);shown+=n.length;document.getElementById("rows").insertAdjacentHTML("beforeend",n.map(row).join(""));const b=document.getElementById("more");if(b)b.disabled=shown>=en.length;const s=document.getElementById("shown");if(s)s.textContent="Showing "+shown+" of "+en.length+" ranked entries";if(shown>=en.length&&b)b.remove()};
    view.innerHTML='<p><a href="#/bounty/'+esc(comp.slug)+'">← '+esc(comp.title||slug)+'</a></p><h1>Leaderboard</h1><p class=sub>'+esc(comp.title||slug)+" · "+esc(d.phase?d.phase.title:"")+(d.metrics_withheld?" · scores withheld in dev phase":"")+'</p>'
      +(en.length?'<p class=small muted id=shown></p><table><thead><tr><th>#</th><th>Handle</th><th class=num>Win rate</th><th class=num>90% interval</th><th class=num>Valid</th><th class=num>Size</th></tr></thead><tbody id=rows></tbody></table><p class=more><button id=more>Show more</button></p>'
      :'<p>No ranked entries published yet for this bounty. Judging runs after entries close; the bounty page still lists its live entry count.</p><p><a href="#/bounty/'+esc(comp.slug)+'">Back to the bounty →</a></p>');
    if(en.length){document.getElementById("more").addEventListener("click",more);more()}
    ready();
  }catch(e){fail(e)}
}
async function profileView(handle){
  loading("Profile");
  try{
    const p=await get("/profiles/"+encodeURIComponent(handle));
    const r=p.record||{},sol=p.solutions||[];
    const av=p.avatar&&p.avatar.url?BASE+p.avatar.url:(p.image?BASE+p.image:"");
    view.innerHTML='<div class=prow>'+(av?'<img class=avatar crossorigin="anonymous" src="'+esc(av)+'" alt="Avatar of '+esc(p.display_name||handle)+'">':"")+'<div><h1>'+esc(p.display_name||handle)+'</h1><p class=sub>@'+esc(p.handle||handle)+(p.joined_at?" · joined "+dt(p.joined_at):"")+"</p>"+(p.bio?"<p>"+esc(p.bio)+"</p>":"")+"</div></div>"
      +'<p><span class=pill>'+num(r.competitions_entered)+' entered</span><span class=pill>'+num(r.competitions_placed)+' placed</span><span class=pill>'+num(r.competitions_won)+' won</span><span class=pill>Best #'+(r.best_placement||"—")+'</span><span class=pill>'+usd(r.prize_usd)+' won</span></p>'
      +"<h2>Solutions ("+sol.length+')</h2><table><thead><tr><th>Entry</th><th>Bounty</th><th class=num>Place</th><th class=num>Prize</th><th class=num>Score</th></tr></thead><tbody>'
      +(sol.map(s=>{const co=s.competition||{};return '<tr><td>'+esc(s.title||"")+'</td><td><a href="#/bounty/'+esc(co.slug||"")+'">'+esc(co.title||"")+'</a></td><td class=num>'+(s.placement||"—")+'</td><td class=num>'+(s.prize_usd?usd(s.prize_usd):"—")+'</td><td class=num>'+(s.score&&s.score.value!=null?pct(s.score.value):"—")+"</td></tr>"}).join("")||'<tr><td colspan=5>No solutions yet.</td></tr>')+"</tbody></table>";
    ready();
  }catch(e){fail(e)}
}
route();
