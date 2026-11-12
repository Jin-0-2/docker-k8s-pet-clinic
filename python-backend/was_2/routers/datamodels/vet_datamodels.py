from pydantic import BaseModel

from routers.datamodels.desk_datamodels import PetResponse


# 진료 응답 (방문 등록, 진료 이력, 배정된 진료 목록)

class ConsultationResponse(BaseModel):
    cid: int
    pid: int
    pname: str
    vet_uid: int
    vet_name: str
    date: str
    purpose: str
    diagnosis: str | None = None
    status: str

# 현재 진료 정보 보기 응답

class ConsultationDetail(ConsultationResponse):
    pet: PetResponse

# 진단 작성 기능 요청

class DiagnosisRequest(BaseModel):
    diagnosis: str
