Write-Host "🚀 启动视频混剪项目..." -ForegroundColor Green

Write-Host ""
Write-Host "1. 启动后端服务..." -ForegroundColor Yellow
Set-Location backend
Start-Process powershell -ArgumentList "-Command", "npm run dev" -WindowStyle Normal

Write-Host ""
Write-Host "2. 等待后端启动..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

Write-Host ""
Write-Host "3. 启动前端服务..." -ForegroundColor Yellow
Set-Location ../frontend
Start-Process powershell -ArgumentList "-Command", "npm run dev" -WindowStyle Normal

Write-Host ""
Write-Host "✅ 项目启动完成！" -ForegroundColor Green
Write-Host "🌐 前端地址: http://localhost:3000" -ForegroundColor Cyan
Write-Host "🔧 后端地址: http://localhost:3001" -ForegroundColor Cyan
Write-Host ""
Write-Host "📝 注意：如果服务启动失败，请检查：" -ForegroundColor Yellow
Write-Host "   - Node.js 是否正确安装" -ForegroundColor White
Write-Host "   - 依赖是否已安装 (npm install)" -ForegroundColor White
Write-Host "   - 端口是否被占用" -ForegroundColor White
Write-Host ""
Write-Host "按任意键退出..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown") 