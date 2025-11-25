# Script để fix lỗi Prisma sau khi thay đổi schema
# Chạy script này trong PowerShell tại thư mục root của project

Write-Host "=== Fixing Prisma Client Issues ===" -ForegroundColor Cyan

# Bước 1: Tìm và dừng tất cả process Node.js đang chạy Next.js
Write-Host "`n[1/5] Stopping Next.js dev server..." -ForegroundColor Yellow
$nextProcesses = Get-Process -Name "node" -ErrorAction SilentlyContinue | Where-Object {
    $_.Path -like "*node.exe*"
}

if ($nextProcesses) {
    Write-Host "Found $($nextProcesses.Count) Node.js process(es). Stopping..." -ForegroundColor Yellow
    $nextProcesses | Stop-Process -Force
    Start-Sleep -Seconds 2
    Write-Host "✓ Stopped all Node.js processes" -ForegroundColor Green
} else {
    Write-Host "✓ No running Node.js processes found" -ForegroundColor Green
}

# Bước 2: Xóa cache Prisma
Write-Host "`n[2/5] Removing Prisma cache..." -ForegroundColor Yellow
$prismaCache = "node_modules\.prisma"
if (Test-Path $prismaCache) {
    Remove-Item -Path $prismaCache -Recurse -Force -ErrorAction SilentlyContinue
    Write-Host "✓ Removed $prismaCache" -ForegroundColor Green
} else {
    Write-Host "✓ No Prisma cache found" -ForegroundColor Green
}

# Bước 3: Xóa Prisma client trong node_modules
Write-Host "`n[3/5] Removing @prisma/client..." -ForegroundColor Yellow
$prismaClient = "node_modules\@prisma\client"
if (Test-Path $prismaClient) {
    Remove-Item -Path $prismaClient -Recurse -Force -ErrorAction SilentlyContinue
    Write-Host "✓ Removed $prismaClient" -ForegroundColor Green
} else {
    Write-Host "✓ No @prisma/client found" -ForegroundColor Green
}

# Bước 4: Regenerate Prisma client
Write-Host "`n[4/5] Regenerating Prisma client..." -ForegroundColor Yellow
try {
    npx prisma generate
    Write-Host "✓ Prisma client generated successfully" -ForegroundColor Green
} catch {
    Write-Host "✗ Failed to generate Prisma client" -ForegroundColor Red
    Write-Host "Error: $_" -ForegroundColor Red
    Write-Host "`nTry running manually:" -ForegroundColor Yellow
    Write-Host "  npx prisma generate" -ForegroundColor Cyan
    exit 1
}

# Bước 5: Restart dev server
Write-Host "`n[5/5] Starting dev server..." -ForegroundColor Yellow
Write-Host "Running: npm run dev" -ForegroundColor Cyan
Write-Host ""
Write-Host "=== Server is starting... ===" -ForegroundColor Green
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow
Write-Host ""

npm run dev
