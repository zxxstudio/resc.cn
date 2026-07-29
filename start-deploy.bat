@echo off
chcp 65001 >nul
title 自动部署守护进程
cd /d "%~dp0"
echo.
echo ====================================
echo   自动部署守护进程
echo   按 Ctrl+C 停止
echo ====================================
echo.
node auto-deploy.mjs
pause