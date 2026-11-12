#!/bin/bash
# EC2 메타데이터(IMDSv2)에서 가용 영역과 인스턴스 ID를 읽어 index.html의 메타 태그에 넣는다.
# 화면 왼쪽 아래에 "WEB 가용 영역: ... · WEB 인스턴스 ID: ..."로 표시된다.
# 사용: sudo bash scripts/set-web-az.sh [index.html 위치, 기본 /var/www/html/index.html]
# index.html을 다시 복사(배포)하면 값이 비워지므로, 배포한 뒤 다시 실행한다.
set -euo pipefail

html=${1:-/var/www/html/index.html}
imds=${IMDS_URL:-http://169.254.169.254}

token=$(curl --noproxy '*' -fsS -X PUT \
  -H 'X-aws-ec2-metadata-token-ttl-seconds: 60' \
  "$imds/latest/api/token")

zone=$(curl --noproxy '*' -fsS \
  -H "X-aws-ec2-metadata-token: $token" \
  "$imds/latest/meta-data/placement/availability-zone")

instance_id=$(curl --noproxy '*' -fsS \
  -H "X-aws-ec2-metadata-token: $token" \
  "$imds/latest/meta-data/instance-id")

# 값 검증: 형식이 다르면 HTML에 넣지 않음 (예: ap-northeast-2a, i-0123456789abcdef0)
[[ $zone =~ ^[a-z]{2}(-[a-z]+)+-[0-9]+[a-z]$ ]] || { echo "가용 영역 값이 이상합니다: $zone" >&2; exit 1; }
[[ $instance_id =~ ^i-[0-9a-f]{8,17}$ ]] || { echo "인스턴스 ID 값이 이상합니다: $instance_id" >&2; exit 1; }

for name in web-availability-zone web-instance-id; do
  grep -q "<meta name=\"$name\" content=\"[^\"]*\"" "$html" || { echo "$html에 $name 메타 태그가 없습니다" >&2; exit 1; }
done

# 기존 값이 있어도 덮어씀 → 여러 번 실행해도 됨
sed -i -E \
  -e "s|(<meta name=\"web-availability-zone\" content=\")[^\"]*(\")|\1$zone\2|" \
  -e "s|(<meta name=\"web-instance-id\" content=\")[^\"]*(\")|\1$instance_id\2|" \
  "$html"

grep -E 'web-(availability-zone|instance-id)' "$html"
