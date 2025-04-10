@echo off
docker-compose up -d db redis --build
sleep 10s
docker-compose up -d --build