@echo off
docker-compose up -d db redis
sleep 10s
docker-compose up -d --build