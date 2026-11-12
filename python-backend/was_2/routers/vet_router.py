from fastapi import APIRouter, Depends, HTTPException

from process import vet_channel
from routers.datamodels import vet_datamodels
from routers.login_router import login_user

vet_user = login_user("vet")
router = APIRouter(prefix="/vet", tags=["vet"], dependencies=[Depends(vet_user)])


async def call(method, *args):
    result = await vet_channel.request(method, *args)
    if result is None:
        raise HTTPException(status_code=404)
    return result


@router.get("/consultation", response_model=list[vet_datamodels.ConsultationResponse])
async def get_assigned(user=Depends(vet_user)):
    return await call("get_assigned", user)


@router.patch("/consultation/{consultation_id}/start", response_model=vet_datamodels.ConsultationDetail)
async def start(consultation_id: int, user=Depends(vet_user)):
    return await call("start", consultation_id, user)


@router.get("/consultation/{consultation_id}", response_model=vet_datamodels.ConsultationDetail)
async def get_consultation(consultation_id: int, user=Depends(vet_user)):
    return await call("get_consultation", consultation_id, user)


@router.get("/consultation/history/{pet_id}", response_model=list[vet_datamodels.ConsultationResponse])
async def get_history(pet_id: int, user=Depends(vet_user)):
    return await call("get_history", pet_id, user)


@router.patch("/consultation/{consultation_id}", response_model=vet_datamodels.ConsultationDetail)
async def diagnose(consultation_id: int, body: vet_datamodels.DiagnosisRequest, user=Depends(vet_user)):
    return await call("diagnose", consultation_id, body, user)


@router.patch("/consultation/{consultation_id}/end", response_model=vet_datamodels.ConsultationDetail)
async def end(consultation_id: int, user=Depends(vet_user)):
    return await call("end", consultation_id, user)
