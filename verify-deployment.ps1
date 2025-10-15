# MarkSure AOI - Deployment Verification Script

Write-Host "🔍 Verifying Deployment Readiness..." -ForegroundColor Cyan
Write-Host ""

# Check if build folder exists
$buildPath = ".\frontend\build"
if (Test-Path $buildPath) {
    Write-Host "✅ Build folder exists: $buildPath" -ForegroundColor Green
} else {
    Write-Host "❌ Build folder missing: $buildPath" -ForegroundColor Red
    exit 1
}

# Check if vercel.json exists
$vercelConfig = ".\frontend\vercel.json"
if (Test-Path $vercelConfig) {
    Write-Host "✅ Vercel configuration exists: $vercelConfig" -ForegroundColor Green
} else {
    Write-Host "❌ Vercel configuration missing: $vercelConfig" -ForegroundColor Red
    exit 1
}

# Check if _redirects exists for fallback
$redirects = ".\frontend\public\_redirects"
if (Test-Path $redirects) {
    Write-Host "✅ Netlify redirects exists: $redirects" -ForegroundColor Green
} else {
    Write-Host "⚠️  Netlify redirects missing: $redirects" -ForegroundColor Yellow
}

# Check build contents
$indexHtml = "$buildPath\index.html"
$staticFolder = "$buildPath\static"

if (Test-Path $indexHtml) {
    Write-Host "✅ Index.html exists in build" -ForegroundColor Green
} else {
    Write-Host "❌ Index.html missing in build" -ForegroundColor Red
    exit 1
}

if (Test-Path $staticFolder) {
    Write-Host "✅ Static assets folder exists" -ForegroundColor Green
} else {
    Write-Host "❌ Static assets folder missing" -ForegroundColor Red
    exit 1
}

# Check package.json scripts
$packageJson = ".\frontend\package.json"
if (Test-Path $packageJson) {
    $package = Get-Content $packageJson | ConvertFrom-Json
    if ($package.scripts.build) {
        Write-Host "✅ Build script exists in package.json" -ForegroundColor Green
    } else {
        Write-Host "❌ Build script missing in package.json" -ForegroundColor Red
        exit 1
    }
}

Write-Host ""
Write-Host "🎉 DEPLOYMENT READY!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Deploy frontend folder to Vercel" -ForegroundColor White
Write-Host "2. Set root directory to 'frontend' in Vercel" -ForegroundColor White
Write-Host "3. Add backend URL as REACT_APP_API_BASE_URL environment variable" -ForegroundColor White
Write-Host "4. Deploy!" -ForegroundColor White