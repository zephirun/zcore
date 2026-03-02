# Oracle DB Port Proxy Setup for WSL2
# Run this script as Administrator in PowerShell after every Windows restart.
# This forwards Oracle port 1521 from the WSL2 gateway to the external Oracle DB server.

# Add port proxy rule
netsh interface portproxy add v4tov4 `
    listenport=1521 `
    listenaddress=172.29.176.1 `
    connectport=1521 `
    connectaddress=168.138.236.217

# Allow port 1521 through Windows Firewall
netsh advfirewall firewall add rule `
    name="Oracle OCI Port (WSL2)" `
    dir=in `
    action=allow `
    protocol=TCP `
    localport=1521

Write-Host "✅ Port proxy configured. Oracle DB is now accessible from WSL2." -ForegroundColor Green

# Show current proxy rules to confirm
netsh interface portproxy show all
