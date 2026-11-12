/* ===================== DESK: SEARCH ===================== */
function vSearch(){
  const q=S.q.trim(),rows=S.d.rows||[],o=S.d.owner;
  const hl=n=>q?esc(n).replace(esc(q),`<b style="color:var(--ac)">${esc(q)}</b>`):esc(n);
  // 좌측: 보호자 목록 (최근 등록 20명, 조회하면 이름으로 필터링) / 선택하면 페이지 이동 없이 우측에 채워짐
  const list=`<div class="sec"><h2>보호자<em>${rows.length}</em></h2></div>
    <table class="tbl"><colgroup><col style="width:80px"><col style="width:120px"><col></colgroup>
    <thead><tr><th>보호자명</th><th>휴대폰</th><th>반려동물</th></tr></thead><tbody>
    ${rows.map(r=>`<tr class="click ${r.id===S.sel?'sel':''}" onclick="selOwner(${r.id})"><td>${hl(r.name)}</td><td>${esc(r.phone)}</td>
      <td>${r.pets.map(p=>esc(p.name)).join(', ')||'<span class="muted">-</span>'}</td></tr>`).join('')}
    </tbody></table>${rows.length?'':`<div class="empty">${q?'조회 결과가 없습니다.':'등록된 보호자가 없습니다.'}</div>`}`;
  // 우측: 보호자 상세 틀은 항상 그대로, 선택한 보호자 정보로 채움
  const detail=o?ownerBody(o,ownerAct('s'),1):ownerBody({id:0,name:'',phone:'',addr:'',pets:[]},'',1);
  return bar()+ph(null,'진료 접수','',`<button class="btn" onclick="go('register')">${PLUS}신규 보호자 등록</button>`)+
  `<div class="body"><form style="display:flex;gap:8px" onsubmit="event.preventDefault();S.q=$('#q').value;go('search').then(()=>$('#q').focus())">
    <input class="in" id="q" style="width:480px;height:38px" placeholder="보호자 이름" value="${esc(S.q)}" autofocus>
    <button class="btn p l">조회</button></form><div class="split"><div>${list}</div><div>${detail}</div></div></div>`;
}
function selOwner(id){S.sel=id;S.edit=null;S.addPet=null;S.errs={};S.flash='';refresh(true);}

/* ===================== DESK: REGISTER ===================== */
const blankPet=()=>({name:'',type:'개',breed:'',gender:'',age:'',weight:'',notes:''});
function petRows(p,pre,err,cols=2){
  const e=k=>err[pre+k],fe=k=>e(k)?`<span class="ferr">${e(k)}</span>`:'';
  const f=[
    ['이름<span class="req">*</span>',`<input class="in ${e('name')?'bad':''}" style="max-width:220px" data-f="${pre}name" value="${esc(p.name)}">${fe('name')}`],
    ['종류<span class="req">*</span>',`<div class="rad">${['개','고양이','기타'].map(t=>`<label><input type="radio" name="${pre}type" value="${t}" ${p.type===t?'checked':''}>${t}</label>`).join('')}</div>`],
    ['품종',`<input class="in" style="max-width:220px" data-f="${pre}breed" list="bl-${pre}" value="${esc(p.breed)}" placeholder="입력 또는 선택"><datalist id="bl-${pre}">${(BREEDS[p.type]||[]).map(b=>`<option value="${b}">`).join('')}</datalist>`],
    ['성별<span class="req">*</span>',`<div class="rad">${['수컷','암컷'].map(g=>`<label><input type="radio" name="${pre}gender" value="${g}" ${p.gender===g?'checked':''}>${g}</label>`).join('')}</div>${fe('gender')}`],
    ['나이',`<span class="unit" style="width:120px"><input class="in ${e('age')?'bad':''}" data-f="${pre}age" value="${esc(p.age)}" inputmode="numeric"><em>세</em></span>${fe('age')}`],
    ['몸무게',`<span class="unit" style="width:120px"><input class="in ${e('weight')?'bad':''}" data-f="${pre}weight" value="${esc(p.weight)}" inputmode="decimal"><em>kg</em></span>${fe('weight')}`],
  ];
  // cols=2: 한 줄에 두 항목 (등록 페이지, 보호자 상세), cols=1: 한 줄에 한 항목 (검색 화면 우측 반쪽)
  let html='';
  for(let i=0;i<f.length;i+=cols)html+=`<div class="row" style="grid-template-columns:${cols===2?'140px 1fr 140px 1fr':'140px 1fr'}">${f.slice(i,i+cols).map(([k,v])=>`<div class="k">${k}</div><div class="v">${v}</div>`).join('')}</div>`;
  return html+`<div class="row" style="grid-template-columns:140px 1fr"><div class="k">비고</div><div class="v"><input class="in" data-f="${pre}notes" value="${esc(p.notes)}" placeholder="알레르기, 주의사항 등"></div></div>`;
}
function readPet(pre){
  const g=k=>{const el=document.querySelector(`[data-f="${pre}${k}"]`);return el?el.value.trim():''};
  const r=k=>{const el=document.querySelector(`input[name="${pre}${k}"]:checked`);return el?el.value:''};
  return {name:g('name'),type:r('type')||'개',breed:g('breed'),gender:r('gender'),age:g('age'),weight:g('weight'),notes:g('notes')};
}
function regSync(){ if(!S.reg)return;
  S.reg.owner={name:($('[data-f=oname]')||{}).value||'',phone:($('[data-f=ophone]')||{}).value||'',addr:($('[data-f=oaddr]')||{}).value||''};
  S.reg.pets=S.reg.pets.map((_,i)=>readPet(`p${i}`));
}
function vRegister(){
  if(!S.reg)S.reg={owner:{name:'',phone:'',addr:''},pets:[blankPet()]};
  const R=S.reg,E=S.errs;
  return bar()+ph([['진료 접수',"go('search')"],['신규 보호자 등록']],'신규 보호자 등록')+
  `<div class="body" onchange="if(event.target.name&&event.target.name.endsWith('type')){regSync();render();}">
    <div class="sec"><h2>보호자 정보</h2></div>
    <div class="ig">
      <div class="row" style="grid-template-columns:140px 1fr 140px 1fr">
        <div class="k">보호자명<span class="req">*</span></div><div class="v"><input class="in ${E.oname?'bad':''}" style="width:220px" data-f="oname" value="${esc(R.owner.name)}">${E.oname?`<span class="ferr">${E.oname}</span>`:''}</div>
        <div class="k">휴대폰<span class="req">*</span></div><div class="v"><input class="in ${E.ophone?'bad':''}" style="width:220px" data-f="ophone" value="${esc(R.owner.phone)}" placeholder="010-0000-0000" oninput="fmtPhone(this)">${E.ophone?`<span class="ferr">${E.ophone}</span>`:''}</div>
      </div>
      <div class="row" style="grid-template-columns:140px 1fr"><div class="k">주소</div><div class="v"><input class="in" data-f="oaddr" value="${esc(R.owner.addr)}"></div></div>
    </div>
    <div class="sec mt"><h2>반려동물 정보<em>${R.pets.length}</em></h2><span class="r"><button class="btn s" onclick="regSync();S.reg.pets.push(blankPet());render()">${PLUS}반려동물 추가</button></span></div>
    <div class="ig">${R.pets.map((p,i)=>`<div class="row" style="grid-template-columns:1fr auto"><div class="grp ${i?'sepb':''}">반려동물 ${i+1}</div><div class="grp ${i?'sepb':''}">${R.pets.length>1?`<button class="btn t err" onclick="regSync();S.reg.pets.splice(${i},1);render()">삭제</button>`:''}</div></div>${petRows(p,`p${i}`,E)}`).join('')}</div>
  </div>
  <div class="foot"><button class="btn l" onclick="S.reg=null;go('search')">취소</button><button class="btn p l" onclick="submitReg()">등록</button></div>`;
}
function fmtPhone(el){let d=el.value.replace(/\D/g,'').slice(0,11);el.value=d.length<4?d:d.length<8?d.slice(0,3)+'-'+d.slice(3):d.slice(0,3)+'-'+d.slice(3,d.length-4)+'-'+d.slice(-4);}
function petErrs(p,pre,E){
  if(!p.name)E[pre+'name']='이름을 입력해 주세요.';if(!p.gender)E[pre+'gender']='성별을 선택해 주세요.';
  if(p.age&&!/^\d+$/.test(p.age))E[pre+'age']='숫자만 입력해 주세요.';if(p.weight&&!/^\d+(\.\d+)?$/.test(p.weight))E[pre+'weight']='숫자만 입력해 주세요.';
}
async function submitReg(){
  regSync();const R=S.reg,E={};
  if(!R.owner.name.trim())E.oname='보호자명을 입력해 주세요.';
  if(!/^01\d-\d{3,4}-\d{4}$/.test(R.owner.phone))E.ophone='휴대폰 번호를 확인해 주세요.';
  R.pets.forEach((p,i)=>petErrs(p,`p${i}`,E));
  S.errs=E;if(Object.keys(E).length){render();return;}
  let o;
  try{o=await api('POST','/desk/owner',{oname:R.owner.name.trim(),pnum:R.owner.phone,address:R.owner.addr.trim()||null,pets:R.pets.map(apiPet)});}
  catch(e){toast(e.message);return;}
  S.reg=null;S.flash=`보호자 1명, 반려동물 ${R.pets.length}마리가 등록되었습니다.`;go('owner',{id:o.oid});
}

/* ===================== DESK: OWNER ===================== */
function ownerAct(size=''){
  return S.edit==='owner'?`<button class="btn ${size}" onclick="S.edit=null;S.errs={};render()">취소</button><button class="btn p ${size}" onclick="saveOwner()">저장</button>`:`<button class="btn ${size}" onclick="S.edit='owner';render()">보호자 정보 수정</button>`;
}
function ownerBody(o,act='',cols=2){
  const ps=o.pets,ed=S.edit==='owner',E=S.errs;
  return `${S.flash?`<div class="alert"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#1F7A4D" stroke-width="2.4"><path d="M5 12l5 5 9-10"/></svg>${esc(S.flash)}</div>`:''}
    <div class="sec"><h2>보호자 정보</h2><span class="r">${act}</span></div>
    <div class="ig">
      <div class="row" style="grid-template-columns:140px 1fr 140px 1fr">
        <div class="k">보호자명</div><div class="v">${ed?`<input class="in ${E.oname?'bad':''}" style="max-width:240px" id="eoname" value="${esc(o.name)}">${E.oname?`<span class="ferr">${E.oname}</span>`:''}`:esc(o.name)}</div>
        <div class="k">휴대폰</div><div class="v">${ed?`<input class="in ${E.ophone?'bad':''}" style="max-width:240px" id="eophone" value="${esc(o.phone)}" oninput="fmtPhone(this)">${E.ophone?`<span class="ferr">${E.ophone}</span>`:''}`:esc(o.phone)}</div>
      </div>
      <div class="row" style="grid-template-columns:140px 1fr"><div class="k">주소</div><div class="v">${ed?`<input class="in" id="eoaddr" value="${esc(o.addr)}">`:esc(o.addr)||(o.id?'<span class="muted">-</span>':'')}</div></div>
    </div>
    <div class="sec mt"><h2>반려동물<em>${ps.length}</em></h2><span class="r">${S.addPet||!o.id?'':`<button class="btn s" onclick="S.addPet=blankPet();S.errs={};render()">${PLUS}반려동물 추가</button>`}</span></div>
    <table class="tbl"><colgroup><col style="width:13%"><col style="width:28%"><col style="width:9%"><col style="width:9%"><col style="width:11%"><col><col style="width:100px"></colgroup>
    <thead><tr><th>이름</th><th>종류/품종</th><th class="c">성별</th><th class="r">나이</th><th class="r">몸무게</th><th>비고</th><th class="c">관리</th></tr></thead><tbody>
    ${ps.map(p=>`<tr class="${S.visitPid===p.id?'sel':''}"><td><a class="lnk" onclick="S.petTab='info';go('pet',{id:${p.id},oid:${o.id}})">${esc(p.name)}</a></td><td>${esc(p.type)} / ${esc(p.breed)||'-'}</td><td class="c">${shortG(p.gender)}</td><td class="r">${p.age!==''?esc(p.age)+'세':'-'}</td><td class="r">${p.weight!==''?esc(p.weight)+'kg':'-'}</td>
      <td class="${p.notes?'flag':'muted'}">${esc(p.notes)||'-'}</td>
      <td class="c"><button class="btn s p" ${S.d.active.includes(p.id)?VISIT_OFF:''} onclick="openVisit(${p.id})">방문 등록</button></td></tr>`).join('')}
    </tbody></table>${ps.length?'':`<div class="empty">${o.id?'등록된 반려동물이 없습니다.':'왼쪽 목록에서 보호자를 선택하세요.'}</div>`}
    ${S.addPet?`<div class="sec mt"><h2>반려동물 추가</h2><span class="r"><button class="btn s" onclick="S.addPet=null;S.errs={};render()">취소</button><button class="btn s p" onclick="saveAddPet(${o.id})">추가</button></span></div>
      <div class="ig" onchange="if(event.target.name==='addtype'){S.addPet=readPet('add');render();}">${petRows(S.addPet,'add',S.errs,cols)}</div>`:''}`;
}
function vOwner(){
  const o=S.d.owner;
  return bar()+ph([['진료 접수',"go('search')"],['보호자 상세']],o.name,o.phone,ownerAct())+`<div class="body">${ownerBody(o)}</div>`;
}
async function saveOwner(){
  const o=S.d.owner,n=$('#eoname').value.trim(),ph=$('#eophone').value,ad=$('#eoaddr').value.trim(),E={};
  if(!n)E.oname='보호자명을 입력해 주세요.';if(!/^01\d-\d{3,4}-\d{4}$/.test(ph))E.ophone='휴대폰 번호를 확인해 주세요.';
  S.errs=E;if(Object.keys(E).length)return render();
  try{await api('PATCH','/desk/owner/'+o.id,{oname:n,pnum:ph,address:ad||null});}catch(e){return toast(e.message);}
  S.edit=null;S.flash='';await refresh();toast('보호자 정보가 수정되었습니다.');
}
async function saveAddPet(oid){
  const p=readPet('add'),E={};petErrs(p,'add',E);S.errs=E;S.addPet=p;if(Object.keys(E).length)return render();
  try{await api('POST','/desk/pet',{oid,pets:[apiPet(p)]});}catch(e){return toast(e.message);}
  S.addPet=null;S.flash='';await refresh();toast(`${p.name}이(가) 추가되었습니다.`);
}

/* ===================== DESK: PET ===================== */
function vPet(){
  const p=S.d.pet,o=S.d.owner,H=S.d.hist,ed=S.edit==='pet',tab=S.petTab,E=S.errs;
  const v=(k,txt,w='220px',u='')=>ed?(u?`<span class="unit" style="width:120px"><input class="in ${E['ep'+k]?'bad':''}" data-f="ep${k}" value="${esc(p[k])}"><em>${u}</em></span>${E['ep'+k]?`<span class="ferr">${E['ep'+k]}</span>`:''}`:`<input class="in" style="width:${w}" data-f="ep${k}" value="${esc(p[k])}">`):txt;
  const rad=(k,opts)=>ed?`<div class="rad">${opts.map(t=>`<label><input type="radio" name="ep${k}" value="${t}" ${p[k]===t?'checked':''}>${t}</label>`).join('')}</div>`:esc(p[k])||'-';
  const info=`<div class="sec"><h2>반려동물 정보</h2><span class="r">${ed?`<button class="btn s" onclick="S.edit=null;S.errs={};render()">취소</button><button class="btn s p" onclick="savePet()">저장</button>`:`<button class="btn s" onclick="S.edit='pet';render()">수정</button>`}</span></div>
    <div class="ig">
      <div class="row" style="grid-template-columns:140px 1fr 140px 1fr 140px 1fr"><div class="k">이름</div><div class="v">${v('name',esc(p.name))}${E.epname?`<span class="ferr">${E.epname}</span>`:''}</div><div class="k">종류</div><div class="v">${rad('type',['개','고양이','기타'])}</div><div class="k">품종</div><div class="v">${v('breed',esc(p.breed)||'-')}</div></div>
      <div class="row" style="grid-template-columns:140px 1fr 140px 1fr 140px 1fr"><div class="k">성별</div><div class="v">${rad('gender',['수컷','암컷'])}</div><div class="k">나이</div><div class="v">${v('age',p.age!==''?esc(p.age)+'세':'-','','세')}</div><div class="k">몸무게</div><div class="v">${v('weight',p.weight!==''?esc(p.weight)+'kg':'-','','kg')}</div></div>
      <div class="row" style="grid-template-columns:140px 1fr"><div class="k">비고</div><div class="v ${p.notes&&!ed?'flag':''}">${ed?`<input class="in" data-f="epnotes" value="${esc(p.notes)}">`:esc(p.notes)||'<span class="muted">-</span>'}</div></div>
    </div>
    <div class="sec mt"><h2>보호자</h2></div>
    <div class="ig"><div class="row" style="grid-template-columns:140px 1fr 140px 1fr 140px 1fr"><div class="k">보호자명</div><div class="v"><a class="lnk" style="font-weight:500" onclick="go('owner',{id:${o.id}})">${esc(o.name)}</a></div><div class="k">휴대폰</div><div class="v">${esc(o.phone)}</div><div class="k">주소</div><div class="v">${esc(o.addr)||'-'}</div></div></div>`;
  const hist=`<table class="tbl"><colgroup><col style="width:130px"><col style="width:120px"><col style="width:30%"><col><col style="width:100px"></colgroup>
    <thead><tr><th>진료일</th><th>담당 수의사</th><th>방문 목적</th><th>진단</th><th>상태</th></tr></thead><tbody>
    ${H.map(c=>`<tr><td>${fmtD(c.date)}</td><td>${esc(c.vet)}</td><td class="wrap">${esc(c.purpose)}</td><td class="wrap ${c.diagnosis?'':'muted'}">${esc(c.diagnosis)||'-'}</td><td>${stBadge(c.state)}</td></tr>`).join('')}
    </tbody></table>${H.length?'':'<div class="empty">진료 이력이 없습니다.</div>'}`;
  return bar()+ph([['진료 접수',"go('search')"],[o.name,`go('owner',{id:${o.id}})`],['반려동물 상세']],p.name,[p.type,p.breed,shortG(p.gender),p.age!==''&&p.age+'세',p.weight!==''&&p.weight+'kg'].filter(Boolean).join(' · '),
    `<button class="btn p" ${S.d.active.includes(p.id)?VISIT_OFF:''} onclick="openVisit(${p.id})">${PLUS}방문 등록</button>`)+
  `<div class="tabs"><a class="${tab==='info'?'on':''}" onclick="S.petTab='info';S.edit=null;render()">기본 정보</a><a class="${tab==='hist'?'on':''}" onclick="S.petTab='hist';S.edit=null;render()">진료 이력 <span class="muted" style="font-weight:500">${H.length}</span></a></div>
  <div class="body">${tab==='info'?info:hist}</div>`;
}
function stBadge(s){return `<span class="st ${s==='대기'?'w':s==='진료중'?'i':'d'}">${s}</span>`}
async function savePet(){
  const p=S.d.pet,n=readPet('ep'),E={};
  petErrs(n,'ep',E);delete E.epgender;S.errs=E;if(Object.keys(E).length)return render();
  try{await api('PATCH','/desk/pet/'+p.id,apiPet(n));}catch(e){return toast(e.message);}
  S.edit=null;S.errs={};await refresh();toast('반려동물 정보가 수정되었습니다.');
}

/* ===================== VISIT DRAWER ===================== */
async function openVisit(pid){
  const o=S.d.owner,p=o.pets.find(x=>x.id===pid),n=now();
  if(!S.vets){try{S.vets=await api('GET','/desk/vets');}catch(e){return toast(e.message);}}
  S.visitPid=pid;render();
  $('#layer').innerHTML=`<div class="dov" onclick="closeLayer()"></div><aside class="dr">
    <div class="dh"><b>방문 등록</b><button onclick="closeLayer()" aria-label="닫기">✕</button></div>
    <div class="db">
      <dl class="dsum">
        <dt>환자</dt><dd><b>${esc(p.name)}</b> <span class="muted">${esc([p.type,p.breed,shortG(p.gender),p.age!==''&&p.age+'세',p.weight!==''&&p.weight+'kg'].filter(Boolean).join(' · '))}</span></dd>
        <dt>보호자</dt><dd>${esc(o.name)} <span class="muted">${esc(o.phone)}</span></dd>
        ${p.notes?`<dt>비고</dt><dd class="flag">${esc(p.notes)}</dd>`:''}
      </dl>
      <label class="dl">방문일시</label><input class="in" readonly value="${n.d} ${n.t}">
      <label class="dl">담당 수의사<span class="req">*</span></label>
      <select class="in" id="vvet"><option value="">선택</option>${S.vets.map(v=>`<option value="${v.uid}">${esc(v.name)}</option>`).join('')}</select><div class="ferr" id="evvet" style="margin:4px 0 0"></div>
      <label class="dl">방문 목적<span class="req">*</span></label>
      <textarea class="in" id="vpur" rows="7"></textarea><div class="ferr" id="evpur" style="margin:4px 0 0"></div>
    </div>
    <div class="dft"><button class="btn l" onclick="closeLayer()">취소</button><button class="btn p l" style="flex:1" onclick="saveVisit(${pid})">등록</button></div>
  </aside>`;
  $('#vvet').focus();
}
async function saveVisit(pid){
  const sel=$('#vvet'),v=sel.value,pu=$('#vpur').value.trim();
  $('#evvet').textContent=v?'':'담당 수의사를 선택해 주세요.';$('#evpur').textContent=pu?'':'방문 목적을 입력해 주세요.';
  if(!v||!pu)return;
  try{
    const h=await api('GET',`/desk/pet/${pid}/consultation`);
    if(h.some(c=>c.status!=='종료')){$('#evpur').textContent='이미 대기 또는 진료 중인 방문이 있습니다.';return;}
    await api('POST',`/desk/pet/${pid}/consultation`,{vet_uid:Number(v),purpose:pu});
  }catch(e){return toast(e.message);}
  const name=sel.options[sel.selectedIndex].text;
  $('#layer').innerHTML='';S.visitPid=null;S.flash='';await refresh();toast(`방문이 등록되었습니다. 담당 ${name} · 대기`);
}
