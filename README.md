# Admin Panel Backend

A production-ready NestJS backend application with Google OAuth authentication, user management, and Protocol Buffers export capabilities.

## Tech Stack

- **Framework**: NestJS 11
- **Language**: TypeScript 5
- **Database**: SQLite with Prisma ORM
- **Authentication**: Google OAuth 2.0 + JWT
- **Security**: SHA-384 hashing, RSA-2048 digital signatures
- **Serialization**: Protocol Buffers

## Prerequisites

- Node.js 18 or higher
- pnpm (recommended) or npm
- Google OAuth credentials

## Environment Setup

1. Create a `.env` file in the root directory:

```env
# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:3000/auth/google/callback

# JWT Configuration
JWT_SECRET=your_secure_random_secret
JWT_EXPIRES_IN=1h

# Frontend URL
FRONTEND_URL=http://localhost:3001

# RSA Keys for User Data Signatures (DO NOT REGENERATE)
USER_DATA_PRIVATE_KEY="your_private_key"
USER_DATA_PUBLIC_KEY="your_public_key"

# Database
DATABASE_URL="file:./dev.db"
```

2. Generate RSA keys (first time only):

```bash
node generate-keys.js
```

Copy the generated keys to your `.env` file.

## Installation

```bash
# Install dependencies
pnpm install

# Generate Prisma client
npx prisma generate

# Create database and apply schema
npx prisma db push
```

## Running the Application

### Development Mode

```bash
pnpm run start:dev
```

The server will start on `http://localhost:4000`

### Production Mode

```bash
# Build the application
pnpm run build

# Start production server
pnpm run start:prod
```

## API Endpoints

### Authentication
- `GET /auth/google` - Initiate Google OAuth flow
- `GET /auth/google/callback` - OAuth callback handler
- `GET /auth/profile` - Get authenticated user profile (JWT protected)

### User Management (All JWT Protected)
- `POST /users` - Create new user
- `GET /users?page=1&limit=10` - List users (paginated)
- `GET /users/:id` - Get user by ID
- `PUT /users/:id` - Update user
- `DELETE /users/:id` - Delete user
- `GET /users/stats/last-7-days` - Get user creation statistics
- `GET /users/export` - Export users as Protocol Buffers
- `GET /users/public-key` - Get RSA public key

## Database Management

```bash
# View database in Prisma Studio
npx prisma studio

# Reset database (WARNING: deletes all data)
npx prisma db push --force-reset

# Generate Prisma client after schema changes
npx prisma generate
```

## Testing

```bash
# Run unit tests
pnpm run test

# Run e2e tests
pnpm run test:e2e

# Generate test coverage
pnpm run test:cov
```

## Project Structure

```
src/
├── auth/              # Authentication module
│   ├── guards/        # JWT and OAuth guards
│   ├── strategies/    # Passport strategies
│   └── dto/           # Data transfer objects
├── users/             # User management module
│   ├── dto/           # User DTOs with validation
│   ├── users.controller.ts
│   ├── users.service.ts
│   ├── users.repository.ts
│   └── user.proto     # Protocol Buffers schema
├── prisma/            # Prisma service
└── main.ts            # Application entry point
```

## Security Features

- **JWT Authentication**: Secure token-based authentication
- **SHA-384 Hashing**: Email integrity verification
- **RSA-2048 Signatures**: Digital signatures for data authenticity
- **Input Validation**: class-validator decorators on all DTOs
- **CORS Protection**: Configured for frontend origin only

## Important Notes

⚠️ **Never regenerate RSA keys** after initial setup - this will invalidate all existing user signatures.

⚠️ Keep your `.env` file secure and never commit it to version control.

⚠️ Use strong, random values for `JWT_SECRET` in production.

## Troubleshooting

### Port Already in Use
```bash
# Kill process on port 4000
lsof -ti:4000 | xargs kill -9
```

### Prisma Client Issues
```bash
# Regenerate Prisma client
npx prisma generate
```

### Database Schema Mismatch
```bash
# Reset and sync database
npx prisma db push --force-reset
```

## License

Private - All Rights Reserved
