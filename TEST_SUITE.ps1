# Comprehensive Test Suite for MindMate Backend

$BASE_URL = "http://localhost:5000"
$results = @()

function Test-Endpoint {
    param(
        [string]$Name,
        [string]$Method,
        [string]$Uri,
        [hashtable]$Headers = @{},
        [object]$Body = $null
    )
    
    try {
        Write-Host "Testing: $Name..." -ForegroundColor Cyan
        
        $params = @{
            Uri = $Uri
            Method = $Method
            Headers = $Headers
            ContentType = "application/json"
            ErrorAction = "Continue"
        }
        
        if ($Body) {
            $params['Body'] = $Body | ConvertTo-Json -Depth 10
        }
        
        $response = Invoke-WebRequest @params
        
        Write-Host "✅ $Name - Status: $($response.StatusCode)" -ForegroundColor Green
        Write-Host "Response: $($response.Content)" -ForegroundColor Gray
        
        $results += @{
            Name = $Name
            Status = "✅ PASS"
            Code = $response.StatusCode
            Details = $response.Content
        }
    }
    catch {
        Write-Host "❌ $Name - Error: $($_.Exception.Message)" -ForegroundColor Red
        $results += @{
            Name = $Name
            Status = "❌ FAIL"
            Error = $_.Exception.Message
        }
    }
    Write-Host ""
}

# Test 1: AI Status (No auth required)
Test-Endpoint -Name "AI Status Check" `
    -Method "Get" `
    -Uri "$BASE_URL/api/data/ai-status"

# Test 2: Health Check (should fail - no such route yet)
Test-Endpoint -Name "Health Check" `
    -Method "Get" `
    -Uri "$BASE_URL/health"

# Test 3: User Signup
$signupBody = @{
    email = "testuser@example.com"
    password = "TestPassword123!"
    username = "testuser_$(Get-Random -Minimum 1000 -Maximum 9999)"
    gender = "male"
    age = 25
}

Test-Endpoint -Name "User Signup" `
    -Method "Post" `
    -Uri "$BASE_URL/api/users/signup" `
    -Body $signupBody

# Test 4: User Login (with random user)
$loginBody = @{
    identifier = $signupBody.email
    password = $signupBody.password
}

Test-Endpoint -Name "User Login" `
    -Method "Post" `
    -Uri "$BASE_URL/api/users/login" `
    -Body $loginBody

# Test 5: Invalid Login
$invalidLoginBody = @{
    identifier = "nonexistent@example.com"
    password = "WrongPassword"
}

Test-Endpoint -Name "Invalid Login (should fail)" `
    -Method "Post" `
    -Uri "$BASE_URL/api/users/login" `
    -Body $invalidLoginBody

# Test 6: Process Text Without Auth (should fail)
$processBody = @{
    type = "text"
    text = "I feel happy"
}

Test-Endpoint -Name "Process Text Without Auth (should fail)" `
    -Method "Post" `
    -Uri "$BASE_URL/api/data/process" `
    -Body $processBody

# Test 7: Get Sessions Without Auth (should fail)
Test-Endpoint -Name "Get Sessions Without Auth (should fail)" `
    -Method "Get" `
    -Uri "$BASE_URL/api/sessions"

# Display Summary
Write-Host "================================" -ForegroundColor Yellow
Write-Host "TEST SUMMARY" -ForegroundColor Yellow
Write-Host "================================" -ForegroundColor Yellow
$passed = @($results | Where-Object {$_.Status -eq "✅ PASS"}).Count
$failed = @($results | Where-Object {$_.Status -eq "❌ FAIL"}).Count
Write-Host "Total Tests: $($results.Count)" -ForegroundColor Cyan
Write-Host "Passed: $passed" -ForegroundColor Green
Write-Host "Failed: $failed" -ForegroundColor Red
