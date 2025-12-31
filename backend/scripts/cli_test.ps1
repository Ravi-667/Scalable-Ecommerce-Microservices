$base = 'http://localhost:5000/api'

# wait for health
for ($i = 0; $i -lt 30; $i++) {
  try {
    $h = Invoke-RestMethod -Uri "$base/health" -Method GET -TimeoutSec 2 -ErrorAction Stop
    Write-Host "Health OK: $($h | ConvertTo-Json -Depth 3)"
    break
  } catch {
    Write-Host "Waiting for backend... ($i)"
    Start-Sleep -Seconds 1
  }
}

$email = 'cli-check+' + (Get-Date -Format yyyyMMddHHmmss) + '@example.com'
$body = @{ name = 'CLI Check'; email = $email; password = 'Pass1234' } | ConvertTo-Json
Write-Host "Registering: $email"
$r = Invoke-RestMethod -Uri "$base/auth/register" -Method Post -Body $body -ContentType 'application/json' -ErrorAction Stop
Write-Host "Register response:`n$($r | ConvertTo-Json -Depth 5)"
$token = $r.token
if (-not $token) { Write-Host 'No token returned'; exit 1 }
Write-Host "Token (first 20 chars): $($token.Substring(0,[Math]::Min(20,$token.Length)))"

Write-Host 'Listing products...'
$prods = Invoke-RestMethod -Uri "$base/products" -Method Get -ErrorAction Stop
Write-Host "Products:`n$($prods | ConvertTo-Json -Depth 5)"

$prodId = $null
if ($prods.items -and $prods.items.Count -gt 0) { $prodId = $prods.items[0]._id }
elseif ($prods.Count -gt 0) { $prodId = $prods[0]._id }

if (-not $prodId) {
  Write-Host 'Creating product...'
  $pBody = @{ title = 'CLI Test Product'; description = 'created by script'; price = 5.5; currency = 'USD' } | ConvertTo-Json
  $p = Invoke-RestMethod -Uri "$base/products" -Method Post -Body $pBody -ContentType 'application/json' -Headers @{ Authorization = "Bearer $token" } -ErrorAction Stop
  Write-Host "Created product:`n$($p | ConvertTo-Json -Depth 5)"
  $prodId = $p._id
}

Write-Host "Using product id: $prodId"
$add = @{ productId = $prodId; quantity = 1 } | ConvertTo-Json
Write-Host 'Adding to cart...'
$addRes = Invoke-RestMethod -Uri "$base/cart" -Method Post -Body $add -ContentType 'application/json' -Headers @{ Authorization = "Bearer $token" } -ErrorAction Stop
Write-Host "Add to cart response:`n$($addRes | ConvertTo-Json -Depth 5)"

Write-Host 'Fetching cart...'
$cart = Invoke-RestMethod -Uri "$base/cart" -Method Get -Headers @{ Authorization = "Bearer $token" } -ErrorAction Stop
Write-Host "Cart:`n$($cart | ConvertTo-Json -Depth 5)"
Write-Host 'Test sequence completed.'
