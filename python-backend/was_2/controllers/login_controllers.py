from services.user_service import UserService


class LoginControllers:
    def __init__(self):
        self.user_service = UserService()

    async def login(self, data):
        user = await self.user_service.login(data.login_id, data.password)
        if user is None:
            return None
        return user, await self.user_service.create_session(user)

    async def session_user(self, session_id):
        return await self.user_service.session_user(session_id)

    async def logout(self, session_id):
        await self.user_service.delete_session(session_id)
