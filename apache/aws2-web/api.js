/* ===================== API (웹서버가 /api → WAS로 전달) ===================== */
async function api(method,path,body){
  const r=await fetch('/api'+path,{method,headers:body?{'Content-Type':'application/json'}:{},body:body?JSON.stringify(body):undefined});
  if(r.status===401&&path!=='/login'){setUser(null);S.route={name:'login'};render();throw new Error('로그인이 필요합니다.');}
  if(!r.ok)throw new Error(r.status===404?'대상을 찾을 수 없거나 처리할 수 없는 요청입니다.':r.status===422?'입력값을 확인해 주세요.':r.status===401?'아이디 또는 비밀번호가 올바르지 않습니다.':'서버 오류가 발생했습니다.');
  return r.json();
}
// WAS 응답 ↔ 화면용 데이터
const uiPet=p=>({id:p.pid,name:p.pname,type:p.type,breed:p.breed||'',gender:p.gender||'',age:p.age??'',weight:p.weight??'',notes:p.notes||''});
const uiOwner=o=>({id:o.oid,name:o.oname,phone:o.pnum,addr:o.address||'',pets:o.pets.map(uiPet),active:o.active_pids});
const uiConsult=c=>({id:c.cid,petId:c.pid,petName:c.pname,vet:c.vet_name,date:c.date,purpose:c.purpose,diagnosis:c.diagnosis||'',state:c.status});
const apiPet=p=>({pname:p.name,type:p.type,breed:p.breed||null,gender:p.gender||null,age:p.age===''?null:Number(p.age),weight:p.weight===''?null:p.weight,notes:p.notes||null});
