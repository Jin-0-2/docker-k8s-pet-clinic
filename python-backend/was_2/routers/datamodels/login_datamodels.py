from pydantic import BaseModel


# 로그인 기능 요청

class LoginRequest(BaseModel):
    login_id: str
    password: str

# 로그인 기능 응답, 수의사 목록 응답

class UserResponse(BaseModel):
    uid: int
    name: str
    role: str
    branch: str
