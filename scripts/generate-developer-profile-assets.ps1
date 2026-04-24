Add-Type -AssemblyName System.Drawing

$ErrorActionPreference = "Stop"

$root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$outDir = Join-Path $root "play-store\developer-profile"
New-Item -ItemType Directory -Force -Path $outDir | Out-Null

function New-Brush($hex) {
  return New-Object System.Drawing.SolidBrush ([System.Drawing.ColorTranslator]::FromHtml($hex))
}

function Draw-Circle($g, $brush, [float]$x, [float]$y, [float]$size) {
  $g.FillEllipse($brush, $x, $y, $size, $size)
}

function Draw-Paw($g, [float]$cx, [float]$cy, [float]$scale, $brush) {
  Draw-Circle $g $brush ($cx - 21 * $scale) ($cy - 12 * $scale) (18 * $scale)
  Draw-Circle $g $brush ($cx - 5 * $scale) ($cy - 23 * $scale) (18 * $scale)
  Draw-Circle $g $brush ($cx + 12 * $scale) ($cy - 12 * $scale) (18 * $scale)
  Draw-Circle $g $brush ($cx - 14 * $scale) ($cy + 5 * $scale) (34 * $scale)
}

function Draw-SoftPiece($g, [float]$cx, [float]$cy, [float]$r, $base, $belly, $face, [float]$tilt) {
  $state = $g.Save()
  $g.TranslateTransform($cx, $cy)
  $g.RotateTransform($tilt)

  $shadowBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(34, 84, 64, 47))
  $g.FillEllipse($shadowBrush, -$r * 0.82, $r * 0.72, $r * 1.64, $r * 0.34)

  $body = New-Object System.Drawing.Drawing2D.GraphicsPath
  $body.AddEllipse(-$r, -$r, $r * 2, $r * 2)
  $pathBrush = New-Object System.Drawing.Drawing2D.PathGradientBrush($body)
  $pathBrush.CenterColor = [System.Drawing.ColorTranslator]::FromHtml($belly)
  $pathBrush.SurroundColors = @([System.Drawing.ColorTranslator]::FromHtml($base))
  $g.FillPath($pathBrush, $body)

  $bellyBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(142, [System.Drawing.ColorTranslator]::FromHtml($belly)))
  $g.FillEllipse($bellyBrush, -$r * 0.42, $r * 0.1, $r * 0.84, $r * 0.58)

  $faceBrush = New-Brush $face
  Draw-Circle $g $faceBrush (-$r * 0.36) (-$r * 0.18) ($r * 0.13)
  Draw-Circle $g $faceBrush ($r * 0.23) (-$r * 0.18) ($r * 0.13)
  $pen = New-Object System.Drawing.Pen $faceBrush.Color, ([Math]::Max(3, $r * 0.05))
  $g.DrawArc($pen, -$r * 0.22, -$r * 0.04, $r * 0.44, $r * 0.3, 20, 140)

  $g.Restore($state)
}

function Save-Jpeg($bitmap, $path, [int]$quality) {
  $codec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq "image/jpeg" }
  $params = New-Object System.Drawing.Imaging.EncoderParameters 1
  $params.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter ([System.Drawing.Imaging.Encoder]::Quality), ([int64]$quality)
  $bitmap.Save($path, $codec, $params)
}

$fontTitle = New-Object System.Drawing.Font "Segoe UI", 92, ([System.Drawing.FontStyle]::Bold), ([System.Drawing.GraphicsUnit]::Pixel)
$fontSmall = New-Object System.Drawing.Font "Segoe UI", 44, ([System.Drawing.FontStyle]::Regular), ([System.Drawing.GraphicsUnit]::Pixel)
$fontIcon = New-Object System.Drawing.Font "Segoe UI", 78, ([System.Drawing.FontStyle]::Bold), ([System.Drawing.GraphicsUnit]::Pixel)

$icon = New-Object System.Drawing.Bitmap 512, 512, ([System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$g = [System.Drawing.Graphics]::FromImage($icon)
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g.Clear([System.Drawing.Color]::Transparent)

$bgPath = New-Object System.Drawing.Drawing2D.GraphicsPath
$bgPath.AddEllipse(18, 18, 476, 476)
$bgBrush = New-Object System.Drawing.Drawing2D.PathGradientBrush($bgPath)
$bgBrush.CenterColor = [System.Drawing.ColorTranslator]::FromHtml("#fff7da")
$bgBrush.SurroundColors = @([System.Drawing.ColorTranslator]::FromHtml("#87b7ba"))
$g.FillPath($bgBrush, $bgPath)

$ringPen = New-Object System.Drawing.Pen ([System.Drawing.Color]::FromArgb(210, 255, 255, 246)), 16
$g.DrawEllipse($ringPen, 34, 34, 444, 444)

Draw-SoftPiece $g 200 227 92 "#f6bf45" "#fff0bd" "#6a452c" -10
Draw-SoftPiece $g 304 248 104 "#9ccfd2" "#edf8ef" "#485a5d" 12
Draw-SoftPiece $g 254 330 118 "#f7c6d1" "#fff4ef" "#6b4c45" -2

$textBrush = New-Brush "#5b4c40"
$format = New-Object System.Drawing.StringFormat
$format.Alignment = [System.Drawing.StringAlignment]::Center
$g.DrawString("MG", $fontIcon, $textBrush, (New-Object System.Drawing.RectangleF 0, 86, 512, 92), $format)

$iconPath = Join-Path $outDir "developer-icon.png"
$icon.Save($iconPath, [System.Drawing.Imaging.ImageFormat]::Png)
$g.Dispose()
$icon.Dispose()

$header = New-Object System.Drawing.Bitmap 4096, 2304, ([System.Drawing.Imaging.PixelFormat]::Format24bppRgb)
$g = [System.Drawing.Graphics]::FromImage($header)
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias

$rect = New-Object System.Drawing.Rectangle 0, 0, 4096, 2304
$bg = New-Object System.Drawing.Drawing2D.LinearGradientBrush $rect, ([System.Drawing.ColorTranslator]::FromHtml("#f6ecd9")), ([System.Drawing.ColorTranslator]::FromHtml("#d8e6dc")), 35
$g.FillRectangle($bg, $rect)

$gridPen = New-Object System.Drawing.Pen ([System.Drawing.Color]::FromArgb(42, 126, 111, 92)), 3
for ($x = 0; $x -lt 4096; $x += 128) {
  $g.DrawLine($gridPen, $x, 0, $x, 2304)
}
for ($y = 0; $y -lt 2304; $y += 128) {
  $g.DrawLine($gridPen, 0, $y, 4096, $y)
}

$blobBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(112, 255, 250, 230))
$g.FillEllipse($blobBrush, 2420, 256, 1280, 1280)
$g.FillEllipse($blobBrush, 2800, 1010, 880, 880)

Draw-SoftPiece $g 2680 1160 270 "#f7c6d1" "#fff4ef" "#6b4c45" -9
Draw-SoftPiece $g 3020 900 230 "#f6bf45" "#fff0bd" "#6a452c" 12
Draw-SoftPiece $g 3330 1190 310 "#9ccfd2" "#edf8ef" "#485a5d" 5
Draw-SoftPiece $g 2740 1540 205 "#a9c8ae" "#f0f7df" "#4f6554" -16

$titleBrush = New-Brush "#5b4c40"
$smallBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(218, 106, 91, 76))
$g.DrawString("Masaki Games", $fontTitle, $titleBrush, 310, 760)
$g.DrawString("Soft puzzle games for quick, cozy play.", $fontSmall, $smallBrush, 316, 890)

$pawBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(86, 135, 183, 186))
Draw-Paw $g 480 540 2.6 $pawBrush
Draw-Paw $g 1170 1550 1.8 $pawBrush
Draw-Paw $g 2070 510 1.4 $pawBrush

$headerPath = Join-Path $outDir "developer-header.jpg"
Save-Jpeg $header $headerPath 92
$g.Dispose()
$header.Dispose()

Write-Output "Wrote $iconPath"
Write-Output "Wrote $headerPath"
