#!/bin/sh
set -e

echo "===================================================="
echo " Starting Payroll Management System in Docker"
echo "===================================================="

# Wait for PostgreSQL database to be ready and sync schema
echo "Waiting for PostgreSQL database to be reachable..."
until npx prisma db push --skip-generate; do
  echo "PostgreSQL is not ready yet, retrying in 3 seconds..."
  sleep 3
done

echo "Database schema synchronized successfully!"

# Run database seeding to ensure default data and admin credentials exist
echo "Checking & seeding database..."
npm run prisma:seed || echo "Seed completed or already initialized."

echo "Starting Next.js production server on http://0.0.0.0:3000..."
exec npm run start -- -H 0.0.0.0 -p 3000
