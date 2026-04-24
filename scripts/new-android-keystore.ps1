param(
  [string]$KeystorePath = "android\\keystore\\animal-merge-upload-key.jks",
  [string]$Alias = "animalmerge",
  [string]$StorePassword,
  [string]$KeyPassword
)

if (-not $StorePassword) {
  throw "StorePassword is required."
}

if (-not $KeyPassword) {
  throw "KeyPassword is required."
}

$javaHome = $env:JAVA_HOME
if (-not $javaHome) {
  $javaHome = "C:\\Program Files\\Android\\Android Studio\\jbr"
}

$keytool = Join-Path $javaHome "bin\\keytool.exe"
if (-not (Test-Path $keytool)) {
  throw "keytool.exe not found. Set JAVA_HOME to a JDK/JBR path first."
}

$targetPath = Join-Path (Get-Location) $KeystorePath
$targetDir = Split-Path $targetPath -Parent

if (-not (Test-Path $targetDir)) {
  New-Item -ItemType Directory -Path $targetDir | Out-Null
}

& $keytool -genkeypair `
  -v `
  -keystore $targetPath `
  -alias $Alias `
  -keyalg RSA `
  -keysize 2048 `
  -validity 10000 `
  -storepass $StorePassword `
  -keypass $KeyPassword `
  -dname "CN=Animal Merge Game, OU=Games, O=Masaki, L=Tokyo, S=Tokyo, C=JP"

Write-Host "Keystore created at $targetPath"
