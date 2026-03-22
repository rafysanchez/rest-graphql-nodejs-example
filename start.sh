#!/bin/sh

# Ensure data directory exists
mkdir -p /app/data

# Sync database schema
npx prisma db push

# Start the application
exec node --experimental-strip-types server.ts
