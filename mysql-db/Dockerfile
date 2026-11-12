# syntax=docker/dockerfile:1
FROM mysql:8.4
COPY schema.sql /docker-entrypoint-initdb.d/
CMD ["--mysql-native-password=ON", "--authentication-policy=mysql_native_password"]