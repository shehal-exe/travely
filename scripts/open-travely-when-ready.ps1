param(
  [Parameter(Mandatory = $true)]
  [ValidatePattern('^http://(?:\d{1,3}\.){3}\d{1,3}:\d+/$')]
  [string]$Url
)

$ErrorActionPreference = "SilentlyContinue"

for ($attempt = 0; $attempt -lt 120; $attempt++) {
  try {
    $response = Invoke-WebRequest -Uri $Url -UseBasicParsing -TimeoutSec 2
    if ($response.StatusCode -ge 200 -and $response.StatusCode -lt 500) {
      Start-Process $Url
      exit 0
    }
  }
  catch {
    Start-Sleep -Milliseconds 500
  }
}

exit 1

