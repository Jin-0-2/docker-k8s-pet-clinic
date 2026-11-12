# aws2-web

동물병원 진료 관리 시스템의 웹(화면) 파일입니다. Apache에 올려서 사용합니다.

**코드는 수정할 필요가 없습니다.** 파일을 Apache에 복사하고, `/api/` 요청을 WAS 앞의 ALB로 보내는 리버스 프록시 설정만 추가하면 됩니다.

```
브라우저 ── /        → Apache가 이 저장소의 파일(index.html, *.js, *.css)을 그대로 제공
        └─ /api/... → Apache가 WAS 쪽 ALB로 전달 (/api는 떼고 전달)
```

## 1. 파일 복사

이 저장소의 파일을 Apache의 DocumentRoot(기본 `/var/www/html/`)에 바로 넣습니다. 폴더째 넣지 말고 파일만 넣으세요.

```bash
sudo cp index.html style.css api.js desk.js vet.js app.js /var/www/html/
```

### (선택) 화면에 WEB 가용 영역 · 인스턴스 ID 표시

파일을 복사한 뒤 웹 서버 인스턴스에서 아래 명령을 실행하면, 모든 화면 왼쪽 아래에 `WEB 가용 영역: ap-northeast-2a · WEB 인스턴스 ID: i-...`가 표시됩니다.

```bash
sudo bash scripts/set-web-az.sh        # 기본 대상: /var/www/html/index.html
```

- EC2 메타데이터(IMDSv2)에서 값을 읽어 `index.html`의 메타 태그 두 개(`web-availability-zone`, `web-instance-id`)에 넣습니다. 값이 비어 있으면 화면에 표시하지 않습니다.
- `index.html`을 다시 복사하면 값이 비워지므로 **배포할 때마다 다시 실행**하세요. 여러 번 실행해도 됩니다.
- `scripts/` 폴더는 `/var/www/html`에 복사하지 마세요.

## 2. 리버스 프록시 설정 (ALB 주소만 바꾸면 됨)

`/etc/httpd/conf.d/proxy.conf` 파일을 만들고 `내부ALB주소`를 실제 WAS ALB의 DNS 이름으로 바꿉니다.

```apache
ProxyPass        /api/ http://내부ALB주소/ disablereuse=On
ProxyPassReverse /api/ http://내부ALB주소/
ProxyTimeout 30
```

- `/api/`와 ALB 주소 끝에 `/`를 **둘 다** 붙여야 `/api`가 떼어지고 전달됩니다.
- `disablereuse=On`은 ALB IP가 바뀌어도 접속이 끊기지 않게 해 줍니다.

```bash
sudo apachectl configtest      # Syntax OK 확인
sudo systemctl reload httpd
```

## 확인

- `http://웹서버주소/` 접속 → 로그인 화면이 뜨면 정상입니다.
- 로그인이 안 되고 `/api/...` 요청이 502/503이면 ALB 주소, 보안 그룹(웹 서버 → ALB), SELinux(`sudo setsebool -P httpd_can_network_connect 1`)를 확인하세요.
