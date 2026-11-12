/* ===================== UTIL ===================== */
const pad=n=>String(n).padStart(2,'0');
const now=()=>{const d=new Date();return {d:`${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`,t:`${pad(d.getHours())}:${pad(d.getMinutes())}`}};
const TODAY=now().d;
const fmtD=s=>s.slice(0,10).replace(/-/g,'.');
const WD=['일','월','화','수','목','금','토'];
const BREEDS={'개':['말티즈','푸들','비숑 프리제','포메라니안','웰시코기','시바견','진돗개','골든 리트리버','믹스'],'고양이':['코리안숏헤어','러시안블루','페르시안','먼치킨','스코티시폴드','브리티시숏헤어','믹스'],'기타':[]};

/* ===================== STATE ===================== */
const S={user:null,route:{name:'login'},d:{},q:'',flash:'',edit:null,addPet:null,petTab:'info',draft:{},reg:null,errs:{},saveId:true,showPw:false,vets:null};
const $=s=>document.querySelector(s);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const shortG=g=>g==='암컷'?'암':g==='수컷'?'수':'-';
const PLUS='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg>';

function setUser(u){S.user=u;try{u?sessionStorage.setItem('user',JSON.stringify(u)):sessionStorage.removeItem('user');}catch(e){}}

// 대기·진료중인 방문이 있는 동물 id → 진료가 끝날 때까지 방문 등록 버튼 비활성화
const VISIT_OFF='title="진료가 끝나면 다시 등록할 수 있습니다" disabled';

// 화면별로 필요한 데이터를 WAS에서 가져옴
const LOAD={
  search:async(r,d,keep)=>{
    if(keep&&S.d.rows){d.rows=S.d.rows;if(d.rows.some(o=>o.id===S.sel)){const o=uiOwner(await api('GET','/desk/owner/'+S.sel));d.rows=d.rows.map(x=>x.id===o.id?o:x);}}   // 목록은 그대로, 선택한 보호자만 다시 조회
    else d.rows=(await api('GET','/desk/owner?name='+encodeURIComponent(S.q.trim()))).map(uiOwner);   // 검색어가 없으면 최근 등록 20명
    d.owner=d.rows.find(o=>o.id===S.sel);if(!d.owner){S.sel=null;return;}d.active=d.owner.active;},
  owner:async(r,d)=>{d.owner=uiOwner(await api('GET','/desk/owner/'+r.id));d.active=d.owner.active;},
  pet:async(r,d)=>{const [p,o,h]=await Promise.all([api('GET','/desk/pet/'+r.id),api('GET','/desk/owner/'+r.oid),api('GET',`/desk/pet/${r.id}/consultation`)]);
    d.pet=uiPet(p);d.owner=uiOwner(o);d.hist=h.map(uiConsult);d.active=d.hist.some(c=>c.state!=='종료')?[d.pet.id]:[];},
  vlist:async(r,d)=>{d.list=(await api('GET','/vet/consultation')).map(uiConsult);},
  consult:async(r,d)=>{await LOAD.vlist(r,d);const c=d.list.find(x=>x.state==='진료중');if(!c)return;
    const [cd,h]=await Promise.all([api('GET','/vet/consultation/'+c.id),api('GET','/vet/consultation/history/'+c.petId)]);
    d.cur=uiConsult(cd);d.curPet=uiPet(cd.pet);d.hist=h.map(uiConsult).filter(x=>x.state==='종료');},
};
async function refresh(keep){   // keep: 검색 목록은 다시 받지 않음 (자동 새로고침, 보호자 선택)
  try{const d={};if(S.user&&LOAD[S.route.name])await LOAD[S.route.name](S.route,d,keep);S.d=d;render();return true;}
  catch(e){if(!S.user){S.route={name:'login'};render();return true;}toast(e.message);return false;}
}
// 화면 ↔ 주소 해시 (#/owner/3, #/pet/5/3) → 뒤로가기·앞으로가기, 새로고침해도 같은 화면
const HOME=u=>u.role==='vet'?'vlist':'search';
const ROLE_VIEWS={desk:['search','register','owner','pet'],vet:['vlist','consult']};
const toHash=r=>'#/'+[r.name,r.id,r.oid].filter(x=>x!=null).join('/');
function fromHash(){
  const [name,id,oid]=location.hash.replace(/^#\/?/,'').split('/');
  if(!S.user)return {name:'login'};
  if(!(ROLE_VIEWS[S.user.role]||[]).includes(name))return {name:HOME(S.user)};
  if(name==='owner')return id?{name,id:+id}:{name:HOME(S.user)};
  if(name==='pet')return id&&oid?{name,id:+id,oid:+oid}:{name:HOME(S.user)};
  return {name};
}
// nav: push(새 기록 추가) / replace(현재 기록 교체) / pop(뒤로·앞으로가기로 이동)
async function go(name,params={},nav='push'){
  const prev=S.route;S.route={name,...params};S.edit=null;S.addPet=null;S.errs={};if(name!=='owner')S.flash='';
  const ok=await refresh();if(!ok)S.route=prev;
  const h=toHash(S.route);if(location.hash!==h)history[nav==='push'?'pushState':'replaceState'](null,'',h);
  window.scrollTo(0,0);
  return ok;
}
function toast(msg){document.querySelectorAll('.toast').forEach(x=>x.remove());const t=document.createElement('div');t.className='toast';t.textContent=msg;document.body.appendChild(t);setTimeout(()=>t.remove(),2400);}
function closeLayer(){$('#layer').innerHTML='';if(S.visitPid){S.visitPid=null;render();}}

/* ===================== SHELL ===================== */
function bar(){
  const u=S.user, r=S.route.name, vet=u.role==='vet';
  const waiting=vet&&S.d.list?S.d.list.filter(c=>c.state==='대기').length:0;
  const items=vet?[['vlist',`진료 목록${waiting?`<span class="n">${waiting}</span>`:''}`],['consult','현재 진료']]
               :[['search','진료 접수'],['register','신규 보호자 등록']];
  const active=vet?(r==='consult'?'consult':'vlist'):(r==='register'?'register':'search');
  return `<div class="bar"><div class="brand"><i></i>PetClinic<small>${esc(u.branch)}</small></div>
  <nav class="gnb">${items.map(([k,t])=>`<a class="${k===active?'on':''}" onclick="go('${k}')">${t}</a>`).join('')}</nav>
  <div class="util"><span><b>${esc(u.name)}</b> ${vet?'수의사':'데스크'}</span><span class="sep"></span><a onclick="logout()">로그아웃</a></div></div>`;
}
function ph(crumbs,title,sub,act=''){
  return `<div class="ph"><div>${crumbs?`<div class="crumb">${crumbs.map(([t,f])=>f?`<a onclick="${f}">${esc(t)}</a>`:esc(t)).join('<span>/</span>')}</div>`:''}
  <h1>${esc(title)}${sub?`<small>${esc(sub)}</small>`:''}</h1></div><div class="act">${act}</div></div>`;
}

/* ===================== LOGIN ===================== */
function vLogin(){
  return `<div class="login">
    <div class="side"><div class="brand"><i></i>PetClinic</div>
      <div class="copy"><h2>베스틴 글로벌<br>멀티클라우드과정<br>KDT 6기</h2><p>5개 지점 데스크 · 수의사 통합 진료 관리 시스템</p></div></div>
    <div class="form"><div>
      <h1>로그인</h1>
      <div class="muted" style="margin-top:8px">계정 권한에 따라 데스크 / 수의사 화면으로 자동 이동합니다.</div>
      <form onsubmit="event.preventDefault();login()">
        <label class="l">아이디</label><input class="in" id="lid" value="${S.saveId?'desk1':''}" autocomplete="off">
        <label class="l">비밀번호</label>
        <div class="pw"><input class="in" id="lpw" type="${S.showPw?'text':'password'}" style="padding-right:38px">
          <button type="button" onclick="S.showPw=!S.showPw;const v=$('#lpw').value,i=$('#lid').value;render();$('#lpw').value=v;$('#lid').value=i"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg></button></div>
        <label class="chk"><input type="checkbox" ${S.saveId?'checked':''} onchange="S.saveId=this.checked">아이디 저장</label>
        <div id="lerr" class="ferr" style="margin:12px 0 0;display:block;min-height:16px"></div>
        <button class="btn p" style="width:100%;height:46px;margin-top:6px;font-size:14px">로그인</button>
      </form>
      <div class="muted" style="margin-top:22px;font-size:12px;text-align:center">계정 문의는 지점 관리자에게 요청하세요.</div>
    </div></div></div>`;
}
async function login(){
  const id=$('#lid').value.trim(),pw=$('#lpw').value;
  let u;
  try{u=await api('POST','/login',{login_id:id,password:pw});}
  catch(e){$('#lerr').textContent='아이디 또는 비밀번호가 올바르지 않습니다.';return;}
  setUser(u);S.q='';S.sel=null;S.vets=null;go(HOME(u),{},'replace');   // 로그인 화면은 기록에 남기지 않음
}
async function logout(){try{await api('DELETE','/login');}catch(e){}setUser(null);S.vets=null;go('login',{},'replace');}

// 5초마다 다시 조회 → 수의사 진료 목록(새 접수), 데스크 보호자·반려동물 상세(진료 상태·방문 등록 버튼)
// 수정 중이거나 방문 등록 창이 열려 있으면 입력이 지워지지 않게 건너뜀
setInterval(()=>{
  if(!S.user||document.hidden)return;
  const r=S.route.name;
  if(document.activeElement&&document.activeElement.matches('input,textarea,select'))return;
  if(r==='vlist'||((r==='owner'||r==='pet'||r==='search')&&!S.edit&&!S.addPet&&!S.visitPid))refresh(true);
},5000);

/* ===================== RENDER ===================== */
const VIEWS={login:vLogin,search:vSearch,register:vRegister,owner:vOwner,pet:vPet,vlist:vVlist,consult:vConsult};
function render(){
  if(!S.user&&S.route.name!=='login')S.route={name:'login'};
  const html=VIEWS[S.route.name]();if(html!==undefined)$('#app').innerHTML=html;
}
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeLayer();});
try{S.user=JSON.parse(sessionStorage.getItem('user'));}catch(e){}
// 뒤로가기·앞으로가기: 주소의 화면으로 이동 (방문 등록 창은 닫음)
window.addEventListener('popstate',()=>{$('#layer').innerHTML='';S.visitPid=null;const r=fromHash();go(r.name,r,'pop');});
// 시작: 주소의 화면을 열고, 열 수 없으면(없는 보호자 등) 첫 화면으로
const start=fromHash();
go(start.name,start,'replace').then(ok=>{if(!ok&&S.user)go(HOME(S.user),{},'replace');});
// 화면 왼쪽 아래: 이 화면을 준 웹 서버의 가용 영역 · 인스턴스 ID (index.html 메타 태그, 값이 있는 것만 표시)
const meta=n=>(document.querySelector(`meta[name="${n}"]`)||{}).content||'';
$('#webinfo').textContent=[meta('web-availability-zone')&&'WEB 가용 영역: '+meta('web-availability-zone'),meta('web-instance-id')&&'WEB 인스턴스 ID: '+meta('web-instance-id')].filter(Boolean).join(' · ');
