@echo off
setlocal
title TRAVELY Local Server

cd /d "%~dp0"

powershell.exe -NoLogo -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\start-travely.ps1"

if errorlevel 1 (
  echo.
  echo TRAVELY could not start. Read the message above, then press any key.
  pause >nul
)

