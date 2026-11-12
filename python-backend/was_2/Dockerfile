# syntax=docker/dockerfile:1
FROM python:3.13-slim

# 로그가 바로 stdout으로 나오게 하고(docker logs에서 보임), .pyc 파일을 만들지 않음
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    WAS_HOST=0.0.0.0 \
    WAS_PORT=8080

WORKDIR /app

# 1) 의존성 먼저 설치: requirements.txt가 안 바뀌면 이 레이어는 캐시를 재사용함
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 2) 소스 복사: 코드만 바뀌면 여기부터 다시 빌드됨
COPY config.py start.py process.py ./
COPY controllers/ controllers/
COPY routers/ routers/
COPY services/ services/
COPY repositorys/ repositorys/

# root가 아닌 일반 사용자로 실행
RUN useradd --system --uid 10001 --no-create-home appuser
USER appuser

EXPOSE 8080
CMD ["python", "start.py"]