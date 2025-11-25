# Updated migration script with correct password

# Encode @ as %40
$password = "Newpass01%40"

# Direct connection for migration (port 5432)
$env:DIRECT_URL = "postgresql://postgres.zdwyvbzchgxsoyovifnm:$password@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres"

# Pooler connection for app (port 6543)
$env:DATABASE_URL = "postgresql://postgres.zdwyvbzchgxsoyovifnm:$password@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true"

Write-Host "Running Prisma migration..."
npx prisma migrate deploy

Write-Host "`nMigration completed! Check Supabase Table Editor."
