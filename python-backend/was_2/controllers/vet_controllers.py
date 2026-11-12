from services.consultation_service import ConsultationService


class VetControllers:
    def __init__(self):
        self.consultation_service = ConsultationService()

    async def get_assigned(self, user):
        return await self.consultation_service.assigned(user.uid)

    async def start(self, cid, user):
        return await self.consultation_service.change_status(cid, user.uid, "대기", "진료중")

    async def get_consultation(self, cid, user):
        return await self.consultation_service.detail(cid, user.uid)

    async def get_history(self, pid, user):
        return await self.consultation_service.history(pid, user.branch)

    async def diagnose(self, cid, data, user):
        return await self.consultation_service.diagnose(cid, user.uid, data.diagnosis)

    async def end(self, cid, user):
        return await self.consultation_service.change_status(cid, user.uid, "진료중", "종료")
