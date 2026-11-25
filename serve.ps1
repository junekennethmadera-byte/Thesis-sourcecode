$prefix = 'http://localhost:8000/'
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add($prefix)
try {
  $listener.Start()
  Write-Output "Serving $PWD at $prefix"
  while ($listener.IsListening) {
    $context = $listener.GetContext()
    $request = $context.Request
    $path = $request.Url.AbsolutePath.TrimStart('/')
    if ([string]::IsNullOrWhiteSpace($path)) { $path = 'frontend/index.html' }
    $filePath = Join-Path -Path $PWD -ChildPath $path
    if (Test-Path $filePath) {
      try {
        $bytes = [System.IO.File]::ReadAllBytes($filePath)
        $context.Response.ContentLength64 = $bytes.Length
        $context.Response.ContentType = ([System.Web.MimeMapping]::GetMimeMapping($filePath))
        $context.Response.OutputStream.Write($bytes, 0, $bytes.Length)
      } catch {
        $context.Response.StatusCode = 500
        $msg = 'Server error'
        $b = [System.Text.Encoding]::UTF8.GetBytes($msg)
        $context.Response.OutputStream.Write($b, 0, $b.Length)
      }
    } else {
      $context.Response.StatusCode = 404
      $msg = 'Not found'
      $b = [System.Text.Encoding]::UTF8.GetBytes($msg)
      $context.Response.OutputStream.Write($b, 0, $b.Length)
    }
    $context.Response.OutputStream.Close()
  }
} finally {
  $listener.Stop()
  $listener.Close()
}
