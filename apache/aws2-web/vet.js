/* ===================== VET: LIST ===================== */
function vVlist(){
  const L=S.d.list,cur=L.find(c=>c.state==='진료중'),q=L.filter(c=>c.state==='대기');
  const rows=[...(cur?[cur]:[]),...q],d=new Date();
  return bar()+ph(null,'진료 목록',`${fmtD(TODAY)} (${WD[d.getDay()]})`)+
  `<div class="body">
    <table class="tbl"><colgroup><col style="width:60px"><col style="width:120px"><col style="width:140px"><col><col style="width:110px"><col style="width:120px"></colgroup>
    <thead><tr><th class="c">순번</th><th class="c">접수</th><th>환자</th><th>방문 목적</th><th>상태</th><th></th></tr></thead><tbody>
    ${rows.map(c=>{const qi=q.indexOf(c),first=qi===0&&!cur;
      return `<tr class="${first||c.state==='진료중'?'sel':''}"><td class="c">${qi>=0?(qi===0?`<b>${qi+1}</b>`:qi+1):'-'}</td><td class="c">${fmtD(c.date).slice(5)} ${c.date.slice(11,16)}</td>
      <td style="font-weight:600">${esc(c.petName)}</td><td>${esc(c.purpose)}</td><td>${stBadge(c.state)}</td>
      <td class="c">${c.state==='진료중'?`<button class="btn s p" onclick="go('consult')">진료 화면</button>`:`<button class="btn s ${first?'p':''}" ${first?'':'disabled'} onclick="startConsult(${c.id})">진료 시작</button>`}</td></tr>`}).join('')}
    </tbody></table>${rows.length?'':'<div class="empty">배정된 진료가 없습니다.</div>'}
  </div>`;
}
async function startConsult(id){try{await api('PATCH',`/vet/consultation/${id}/start`);}catch(e){return toast(e.message);}go('consult');}

/* ===================== VET: CONSULT ===================== */
function vConsult(){
  const c=S.d.cur;
  if(!c)return bar()+ph([['진료 목록',"go('vlist')"],['현재 진료']],'현재 진료')+`<div class="body"><div class="empty" style="border:0">진행 중인 진료가 없습니다.<div style="margin-top:14px"><button class="btn" onclick="go('vlist')">진료 목록으로</button></div></div></div>`;
  const p=S.d.curPet,H=S.d.hist,dr=S.draft[c.id]??c.diagnosis;
  return bar()+`<div class="ph" style="align-items:center;padding-top:14px;padding-bottom:14px"><div><div class="crumb"><a onclick="go('vlist')">진료 목록</a><span>/</span>현재 진료</div><h1>${esc(p.name)}</h1></div>
    <div class="act" style="gap:16px">${stBadge('진료중')}<button class="btn p" style="height:36px;padding:0 20px" onclick="endConsult(${c.id})">진료 종료</button></div></div>
  <div style="padding:20px 32px 0">
    <div class="ig">
      <div class="row" style="grid-template-columns:100px 1fr 100px 1fr 100px 1fr 100px 1fr 100px 1fr">
        <div class="k">종류</div><div class="v">${esc(p.type)}</div><div class="k">품종</div><div class="v">${esc(p.breed)||'-'}</div>
        <div class="k">성별</div><div class="v">${esc(p.gender)||'-'}</div><div class="k">나이</div><div class="v">${p.age!==''?esc(p.age)+'세':'-'}</div><div class="k">몸무게</div><div class="v">${p.weight!==''?esc(p.weight)+'kg':'-'}</div>
      </div>
      <div class="row" style="grid-template-columns:100px 1fr"><div class="k">방문 목적</div><div class="v">${esc(c.purpose)}</div></div>
      <div class="row" style="grid-template-columns:100px 1fr"><div class="k">비고</div><div class="v" style="${p.notes?'color:var(--err)':''}">${esc(p.notes)||'<span class="muted">-</span>'}</div></div>
    </div>
  </div>
  <div class="cs">
    <div style="display:flex;flex-direction:column">
      <div class="sec"><h2>진단</h2><span class="r ferr" id="ediag"></span></div>
      <textarea class="in" id="diag" style="flex:1;min-height:360px;font-size:13.5px;line-height:1.75;resize:none" oninput="S.draft[${c.id}]=this.value">${esc(dr)}</textarea>
    </div>
    <div>
      <div class="sec"><h2>진료 이력<em>${H.length}</em></h2></div>
      <table class="tbl"><colgroup><col style="width:96px"><col style="width:64px"><col></colgroup>
      <thead><tr><th>진료일</th><th>수의사</th><th>방문 목적 / 진단</th></tr></thead><tbody>
      ${H.map(h=>`<tr><td style="vertical-align:top;padding-top:12px">${fmtD(h.date)}</td><td style="vertical-align:top;padding-top:12px">${esc(h.vet)}</td><td class="wrap"><div style="color:var(--tx2)">${esc(h.purpose)}</div><div style="margin-top:3px">${esc(h.diagnosis)||'<span class="muted">-</span>'}</div></td></tr>`).join('')}
      </tbody></table>${H.length?'':'<div class="empty">이전 진료 이력이 없습니다.</div>'}
    </div>
  </div>`;
}
async function endConsult(id){
  const t=$('#diag').value.trim();
  if(!t){$('#ediag').textContent='진단 내용을 입력해 주세요.';$('#diag').classList.add('bad');$('#diag').focus();return;}
  try{await api('PATCH','/vet/consultation/'+id,{diagnosis:t});await api('PATCH',`/vet/consultation/${id}/end`);}catch(e){return toast(e.message);}
  const name=S.d.curPet.name;delete S.draft[id];await go('vlist');toast(`${name} 진료가 종료되었습니다.`);
}
