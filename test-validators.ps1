# Test Validators Script

$baseUrl = "http://localhost:3000/api"

function Write-Success { Write-Host $args -ForegroundColor Green }
function Write-ErrorMsg { Write-Host $args -ForegroundColor Red }
function Write-Info { Write-Host $args -ForegroundColor Cyan }

Write-Info "=== TESTING INPUT VALIDATORS ==="

# TEST 1: USER REGISTRATION - VALID
Write-Info "`n[TEST 1] User Registration - VALID"
$body = @{
    email = "testuser_$(Get-Random)@example.com"
    password = "password123"
    firstName = "John"
    lastName = "Doe"
} | ConvertTo-Json

$response = Invoke-WebRequest -Uri "$baseUrl/users/register" -Method POST -ContentType "application/json" -Body $body -ErrorAction SilentlyContinue

if ($response.StatusCode -eq 201) {
    Write-Success "PASS: User registered successfully"
    $userData = $response.Content | ConvertFrom-Json
    $userId = $userData.data.id
    $userEmail = $userData.data.email
    Write-Info "User ID: $userId"
} else {
    Write-ErrorMsg "FAIL: Expected 201, got $($response.StatusCode)"
}

# TEST 2: USER REGISTRATION - INVALID EMAIL
Write-Info "`n[TEST 2] User Registration - INVALID EMAIL"
$body = @{
    email = "invalid-email"
    password = "password123"
    firstName = "John"
    lastName = "Doe"
} | ConvertTo-Json

try {
    Invoke-WebRequest -Uri "$baseUrl/users/register" -Method POST -ContentType "application/json" -Body $body -ErrorAction Stop | Out-Null
    Write-ErrorMsg "FAIL: Should have rejected invalid email"
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    if ($statusCode -eq 400) {
        Write-Success "PASS: Validation rejected invalid email"
    } else {
        Write-ErrorMsg "FAIL: Expected 400, got $statusCode"
    }
}

# TEST 3: USER REGISTRATION - MISSING REQUIRED FIELD
Write-Info "`n[TEST 3] User Registration - MISSING REQUIRED FIELD"
$body = @{
    email = "test@example.com"
    password = "password123"
    firstName = "John"
} | ConvertTo-Json

try {
    Invoke-WebRequest -Uri "$baseUrl/users/register" -Method POST -ContentType "application/json" -Body $body -ErrorAction Stop | Out-Null
    Write-ErrorMsg "FAIL: Should have rejected missing field"
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    if ($statusCode -eq 400) {
        Write-Success "PASS: Validation rejected missing field"
    } else {
        Write-ErrorMsg "FAIL: Expected 400, got $statusCode"
    }
}

# TEST 4: USER REGISTRATION - PASSWORD TOO SHORT
Write-Info "`n[TEST 4] User Registration - PASSWORD TOO SHORT"
$body = @{
    email = "test@example.com"
    password = "123"
    firstName = "John"
    lastName = "Doe"
} | ConvertTo-Json

try {
    Invoke-WebRequest -Uri "$baseUrl/users/register" -Method POST -ContentType "application/json" -Body $body -ErrorAction Stop | Out-Null
    Write-ErrorMsg "FAIL: Should have rejected short password"
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    if ($statusCode -eq 400) {
        Write-Success "PASS: Validation rejected short password"
    } else {
        Write-ErrorMsg "FAIL: Expected 400, got $statusCode"
    }
}

# TEST 5: LOGIN USER - VALID
Write-Info "`n[TEST 5] Login User - VALID"
$body = @{
    email = $userEmail
    password = "password123"
} | ConvertTo-Json

$response = Invoke-WebRequest -Uri "$baseUrl/users/login" -Method POST -ContentType "application/json" -Body $body -ErrorAction SilentlyContinue

if ($response.StatusCode -eq 200) {
    Write-Success "PASS: User logged in successfully"
    $loginData = $response.Content | ConvertFrom-Json
    $token = $loginData.data.token
    Write-Info "Token obtained"
} else {
    Write-ErrorMsg "FAIL: Expected 200, got $($response.StatusCode)"
}

# TEST 6: CREATE ORGANIZATION - VALID
Write-Info "`n[TEST 6] Create Organization - VALID"
$body = @{
    name = "Test Organization"
    description = "A test organization"
    slug = "test-org-$(Get-Random)"
} | ConvertTo-Json

$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

$response = Invoke-WebRequest -Uri "$baseUrl/organizations" -Method POST -Headers $headers -Body $body -ErrorAction SilentlyContinue

if ($response.StatusCode -eq 201) {
    Write-Success "PASS: Organization created successfully"
    $orgData = $response.Content | ConvertFrom-Json
    $orgId = $orgData.data.id
    Write-Info "Organization ID: $orgId"
} else {
    Write-ErrorMsg "FAIL: Expected 201, got $($response.StatusCode)"
}

# TEST 7: CREATE ORGANIZATION - MISSING SLUG
Write-Info "`n[TEST 7] Create Organization - MISSING REQUIRED SLUG"
$body = @{
    name = "Test Organization"
    description = "A test organization"
} | ConvertTo-Json

try {
    Invoke-WebRequest -Uri "$baseUrl/organizations" -Method POST -Headers $headers -Body $body -ErrorAction Stop | Out-Null
    Write-ErrorMsg "FAIL: Should have rejected missing slug"
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    if ($statusCode -eq 400) {
        Write-Success "PASS: Validation rejected missing slug"
    } else {
        Write-ErrorMsg "FAIL: Expected 400, got $statusCode"
    }
}

# TEST 8: CREATE PROJECT - VALID
Write-Info "`n[TEST 8] Create Project - VALID"
$body = @{
    name = "Test Project"
    description = "A test project"
} | ConvertTo-Json

$response = Invoke-WebRequest -Uri "$baseUrl/organizations/$orgId/projects" -Method POST -Headers $headers -Body $body -ErrorAction SilentlyContinue

if ($response.StatusCode -eq 201) {
    Write-Success "PASS: Project created successfully"
    $projectData = $response.Content | ConvertFrom-Json
    $projectId = $projectData.data.id
    Write-Info "Project ID: $projectId"
} else {
    Write-ErrorMsg "FAIL: Expected 201, got $($response.StatusCode)"
}

# TEST 9: CREATE PROJECT - MISSING NAME
Write-Info "`n[TEST 9] Create Project - MISSING NAME"
$body = @{
    description = "A test project"
} | ConvertTo-Json

try {
    Invoke-WebRequest -Uri "$baseUrl/organizations/$orgId/projects" -Method POST -Headers $headers -Body $body -ErrorAction Stop | Out-Null
    Write-ErrorMsg "FAIL: Should have rejected missing name"
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    if ($statusCode -eq 400) {
        Write-Success "PASS: Validation rejected missing name"
    } else {
        Write-ErrorMsg "FAIL: Expected 400, got $statusCode"
    }
}

# TEST 10: CREATE TASK - VALID
Write-Info "`n[TEST 10] Create Task - VALID"
$body = @{
    title = "Test Task"
    description = "A test task"
    priority = "HIGH"
    assignedTo = $userId
} | ConvertTo-Json

$response = Invoke-WebRequest -Uri "$baseUrl/projects/$projectId/tasks" -Method POST -Headers $headers -Body $body -ErrorAction SilentlyContinue

if ($response.StatusCode -eq 201) {
    Write-Success "PASS: Task created successfully"
    $taskData = $response.Content | ConvertFrom-Json
    $taskId = $taskData.data.id
    Write-Info "Task ID: $taskId"
} else {
    Write-ErrorMsg "FAIL: Expected 201, got $($response.StatusCode)"
}

# TEST 11: CREATE TASK - INVALID PRIORITY
Write-Info "`n[TEST 11] Create Task - INVALID PRIORITY"
$body = @{
    title = "Test Task"
    priority = "INVALID"
} | ConvertTo-Json

try {
    Invoke-WebRequest -Uri "$baseUrl/projects/$projectId/tasks" -Method POST -Headers $headers -Body $body -ErrorAction Stop | Out-Null
    Write-ErrorMsg "FAIL: Should have rejected invalid priority"
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    if ($statusCode -eq 400) {
        Write-Success "PASS: Validation rejected invalid priority"
    } else {
        Write-ErrorMsg "FAIL: Expected 400, got $statusCode"
    }
}

# TEST 12: UPDATE TASK - VALID
Write-Info "`n[TEST 12] Update Task - VALID"
$body = @{
    title = "Updated Task Title"
    status = "IN_PROGRESS"
    priority = "CRITICAL"
} | ConvertTo-Json

$response = Invoke-WebRequest -Uri "$baseUrl/tasks/$taskId" -Method PUT -Headers $headers -Body $body -ErrorAction SilentlyContinue

if ($response.StatusCode -eq 200) {
    Write-Success "PASS: Task updated successfully"
} else {
    Write-ErrorMsg "FAIL: Expected 200, got $($response.StatusCode)"
}

Write-Info "`n=== ALL TESTS COMPLETED ==="