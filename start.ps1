$ErrorActionPreference = "Stop"

Write-Host "New Frontier Bakery backend setup" -ForegroundColor DarkRed
Write-Host ""

$adminSecure = Read-Host "Choose the private admin dashboard password" -AsSecureString
$botSecure = Read-Host "Paste the Telegram bot token (input is hidden)" -AsSecureString
$chatId = Read-Host "Enter the Telegram group chat ID"

$env:ADMIN_PASSWORD = [Net.NetworkCredential]::new("", $adminSecure).Password
$env:TELEGRAM_BOT_TOKEN = [Net.NetworkCredential]::new("", $botSecure).Password
$env:TELEGRAM_CHAT_ID = $chatId.Trim()
$env:HOST = "127.0.0.1"
$env:PORT = "3000"

Write-Host ""
Write-Host "Landing page: http://127.0.0.1:3000" -ForegroundColor Green
Write-Host "Admin page:   http://127.0.0.1:3000/admin" -ForegroundColor Green
Write-Host "Keep this window open while the website is running."
Write-Host ""

node server.js
