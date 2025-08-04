@echo off
echo 启动视频混剪项目...

echo.
echo 1. 启动后端服务...
cd backend
start "Backend Server" powershell -Command "npm run dev"

echo.
echo 2. 等待后端启动...
timeout /t 5 /nobreak > nul

echo.
echo 3. 启动前端服务...
cd ../frontend
start "Frontend Server" powershell -Command "npm run dev"

echo.
echo 项目启动完成！
echo 前端地址: http://localhost:3000
echo 后端地址: http://localhost:3001
echo.
echo 注意：如果服务启动失败，请检查：
echo - Node.js 是否正确安装
echo - 依赖是否已安装 (npm install)
echo - 端口是否被占用
echo.
echo 按任意键退出...
pause > nul 