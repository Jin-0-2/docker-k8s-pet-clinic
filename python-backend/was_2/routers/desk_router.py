from fastapi import APIRouter, Depends, HTTPException

from process import desk_channel
from routers.datamodels import desk_datamodels, vet_datamodels, login_datamodels
from routers.login_router import login_user

desk_user = login_user("desk")
router = APIRouter(prefix="/desk", tags=["desk"], dependencies=[Depends(desk_user)])


async def call(method, *args):
    result = await desk_channel.request(method, *args)
    if result is None:
        raise HTTPException(status_code=404)
    return result


@router.post("/owner", response_model=desk_datamodels.OwnerResponse)
async def regist(body:desk_datamodels.OwnerRequest, user=Depends(desk_user)):
    return await call("regist_owner", body, user)


@router.get("/owner/{owner_id}", response_model=desk_datamodels.OwnerResponse)
async def get_owner(owner_id: int, user=Depends(desk_user)):
    return await call("get_owner", owner_id, user)


@router.get("/owner", response_model=list[desk_datamodels.OwnerResponse])
async def search_owner(name: str, user=Depends(desk_user)):
    return await call("search_owner", name, user)


@router.patch("/owner/{owner_id}", response_model=desk_datamodels.OwnerResponse)
async def update_owner(owner_id: int, body: desk_datamodels.OwnerUpdate, user=Depends(desk_user)):
    return await call("update_owner", owner_id, body, user)


@router.get("/pet/{pet_id}", response_model=desk_datamodels.PetResponse)
async def get_pet(pet_id: int, user=Depends(desk_user)):
    return await call("get_pet", pet_id, user)


@router.patch("/pet/{pet_id}", response_model=desk_datamodels.PetResponse)
async def update_pet(pet_id: int, body: desk_datamodels.PetUpdate, user=Depends(desk_user)):
    return await call("update_pet", pet_id, body, user)


@router.post("/pet", response_model=desk_datamodels.OwnerResponse)
async def add_pets(body: desk_datamodels.PetAddRequest, user=Depends(desk_user)):
    return await call("add_pets", body, user)


@router.post("/pet/{pet_id}/consultation", response_model=vet_datamodels.ConsultationResponse)
async def regist_consultation(pet_id: int, body: desk_datamodels.ConsultationRequest, user=Depends(desk_user)):
    return await call("regist_consultation", pet_id, body, user)


@router.get("/pet/{pet_id}/consultation", response_model=list[vet_datamodels.ConsultationResponse])
async def get_consultations(pet_id: int, user=Depends(desk_user)):
    return await call("get_consultations", pet_id, user)


@router.get("/vets", response_model=list[login_datamodels.UserResponse])
async def get_vets(user=Depends(desk_user)):
    return await call("get_vets", user)
