# Script para iniciar Ollama e a aplicação Mangaba Assistente
# Execute este script para garantir que o Ollama esteja rodando antes da aplicação

Write-Host "Iniciando Mangaba Assistente com Ollama..." -ForegroundColor Green

# Verificar se o Ollama está instalado
$ollamaPath = Get-Command ollama -ErrorAction SilentlyContinue
if (-not $ollamaPath) {
    Write-Host "Ollama não encontrado. Tentando iniciar pelo menu Iniciar..." -ForegroundColor Yellow
    
    # Tentar iniciar pelo atalho do menu Iniciar
    $ollamaShortcut = "$env:APPDATA\Microsoft\Windows\Start Menu\Programs\Ollama\Ollama.lnk"
    if (Test-Path $ollamaShortcut) {
        Start-Process -FilePath $ollamaShortcut
        Write-Host "Ollama iniciado pelo menu Iniciar." -ForegroundColor Green
    } else {
        Write-Host "Atalho do Ollama não encontrado. Por favor, instale o Ollama primeiro." -ForegroundColor Red
        Write-Host "Baixe em: https://ollama.ai/download" -ForegroundColor Yellow
        exit 1
    }
} else {
    # Iniciar Ollama serve em background
    Write-Host "Iniciando servidor Ollama..." -ForegroundColor Yellow
    Start-Process -FilePath "ollama" -ArgumentList "serve" -WindowStyle Hidden
}

# Aguardar o Ollama inicializar
Write-Host "Aguardando Ollama inicializar..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# Verificar se o Ollama está respondendo
$maxAttempts = 10
$attempt = 0
$ollamaReady = $false

while ($attempt -lt $maxAttempts -and -not $ollamaReady) {
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:11434/api/tags" -Method GET -TimeoutSec 5
        if ($response.StatusCode -eq 200) {
            $ollamaReady = $true
            Write-Host "Ollama está pronto!" -ForegroundColor Green
        }
    } catch {
        $attempt++
        Write-Host "Tentativa $attempt/$maxAttempts - Aguardando Ollama..." -ForegroundColor Yellow
        Start-Sleep -Seconds 3
    }
}

if (-not $ollamaReady) {
    Write-Host "Ollama não respondeu após $maxAttempts tentativas." -ForegroundColor Red
    Write-Host "Continuando mesmo assim..." -ForegroundColor Yellow
}

# Verificar modelos disponíveis
try {
    $modelsResponse = Invoke-WebRequest -Uri "http://localhost:11434/api/tags" -Method GET
    $models = ($modelsResponse.Content | ConvertFrom-Json).models
    
    Write-Host "Modelos disponíveis no Ollama:" -ForegroundColor Cyan
    foreach ($model in $models) {
        Write-Host "  - $($model.name)" -ForegroundColor White
    }
    
    # Verificar se llama2:latest está disponível
    $hasLlama2 = $models | Where-Object { $_.name -eq "llama2:latest" }
    if (-not $hasLlama2) {
        Write-Host "Modelo llama2:latest não encontrado. Baixando..." -ForegroundColor Yellow
        Start-Process -FilePath "ollama" -ArgumentList "pull", "llama2" -Wait
    }
} catch {
    Write-Host "Não foi possível verificar modelos. Continuando..." -ForegroundColor Yellow
}

# Iniciar a aplicação React
Write-Host "Iniciando aplicação Mangaba Assistente..." -ForegroundColor Green
npm start