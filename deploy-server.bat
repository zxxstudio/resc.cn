@echo off
chcp 65001 >nul
title 部署到服务器
cd /d "%~dp0"
echo.
echo ====================================
echo   部署到服务器 (121.37.183.37)
echo ====================================
echo.
node deploy-to-server.mjs
pause