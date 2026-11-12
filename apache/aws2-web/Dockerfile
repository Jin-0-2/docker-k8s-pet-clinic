# syntax=docker/dockerfile:1
FROM httpd:2.4-alpine

# 기본값은 빌드 검증용이고, 실제 값은 docker run -e 또는 Pod의 env로 덮어씀
ENV BACKEND_URL=http://backend.invalid:8080

# a2enmod 대체: 주석 처리된 모듈 3개를 활성화하고, 설정 파일 2개를 포함시킴
RUN sed -i \
      -e 's/^#\(LoadModule proxy_module \)/\1/' \
      -e 's/^#\(LoadModule proxy_http_module \)/\1/' \
      -e 's/^#\(LoadModule headers_module \)/\1/' \
      conf/httpd.conf \
 && printf '\nInclude conf/extra/proxy.conf\nInclude conf/extra/zz-hardening.conf\n' >> conf/httpd.conf

RUN echo "ServerName localhost" >> conf/httpd.conf

# 원본 conf/proxy.conf, conf/zz-hardeing.conf -> conf/extra/ 디렉토리로 복사
COPY conf/proxy.conf conf/zz-hardening.conf conf/extra/

# 웹 파일 6개만 복사 (scripts/, README 등은 넣지 않음)
COPY --chmod=644 index.html api.js desk.js vet.js app.js style.css /usr/local/apache2/htdocs/

# apachectl configtest 대체: 설정이 틀리면 빌드가 실패함
RUN httpd -t

EXPOSE 80
# CMD는 httpd 이미지의 기본값(httpd-foreground)을 그대로 사용