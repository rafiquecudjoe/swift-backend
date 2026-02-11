# Swift Transport - Driver Management Backend

A robust NestJS backend API for managing drivers and vehicle assignments for Swift Transport, a transport platform operating across Africa.

## 🏗️ Architecture Overview

This project follows a **clean, modular architecture** with clear separation of concerns:

```
src/
├── apis/                    # Feature modules (business logic)
│   └── auth/               # Authentication module
│       ├── dto/            # Data Transfer Objects
│       ├── guards/         # Route guards (JWT, Admin)
│       ├── strategies/     # Passport strategies
│       ├── auth.controller.ts
│       ├── auth.service.ts
│       ├── auth.validator.ts
│       └── auth.module.ts
├── common/                  # Shared utilities
│   ├── entities/           # Swagger response entities
│   ├── types/              # TypeScript type definitions
│   ├── prisma.ts           # Prisma singleton instance
│   └── response.ts         # Response builder class
├── config/                  # Configuration
│   ├── config.ts           # Centralized config object
│   └── validate-env.ts     # Joi environment validation
├── repositories/           # Data access layer
│   ├── entities/           # Entity type definitions
│   ├── user.repository.ts
│   ├── driver.repository.ts
│   ├── vehicle.repository.ts
│   ├── assignment.repository.ts
│   └── repositories.module.ts
├── utils/                  # Pure utility functions
│   ├── joi.validator.ts
│   ├── logger.ts
│   ├── utils.ts
│   └── sanitize.ts
├── app.module.ts
├── app.controller.ts
├── app.service.ts
└── main.ts
```

## 🔑 Key Design Patterns

### 1. **Repository Pattern**
All database operations are encapsulated in dedicated repository classes (`src/repositories/`), separate from business logic.

### 2. **Prisma Singleton**
Direct import of Prisma Client singleton (`src/common/prisma.ts`) - no unnecessary abstraction layers.

### 3. **Joi Validation**
Schema validation using Joi in dedicated validator classes (`*.validator.ts`).

### 4. **Standardized Responses**
All endpoints return consistent response format: `{ message, data }`

### 5. **Feature-Based Modules**
Each feature (auth, drivers, vehicles) is a self-contained module in `src/apis/`.

## 📦 Tech Stack

- **Runtime:** Node.js v20 LTS
- **Framework:** NestJS 11
- **Database:** PostgreSQL
- **ORM:** Prisma 7
- **Authentication:** JWT with Passport.js
- **Password Hashing:** Argon2 (industry best practice)
- **Validation:** Joi
- **Documentation:** Swagger/OpenAPI
- **Security:** Helmet, CORS, Throttling
- **Logging:** Winston + Morgan

## 🚀 Getting Started

### Prerequisites

- Node.js v20 or higher
- PostgreSQL database
- npm or pnpm

### Installation

1. **Install dependencies:**
```bash
npm install
```

2. **Configure environment variables:**
```bash
cp .env.example .env
# Edit .env with your database credentials
```

3. **Generate Prisma Client:**
```bash
npx prisma generate
```

4. **Run database migrations:**
```bash
npx prisma migrate dev --name init
```

5. **Start development server:**
```bash
npm run start:dev
```

The API will be available at:
- **Server:** http://localhost:3000
- **Swagger Docs:** http://localhost:3000/api

## 🗄️ Database Schema

<p align="center">
  <img src="docs/db-schema.png" alt="Database Schema" width="100%" />
</p>

### Core Models

**User** - Authentication & RBAC
- Email, password (argon2 hashed), fullName
- Role: ADMIN or OPERATIONS
- Active status tracking

**Driver** - Core entity
- Full name, phone number, license number
- Status: ACTIVE, SUSPENDED, INACTIVE
- Soft delete support (deletedAt)

**Vehicle** - Fleet management
- Registration number
- Soft delete support

**VehicleAssignment** - Assignment tracking
- Driver-Vehicle mapping
- Assigned/unassigned timestamps
- Complete historical tracking

**AuditLog** - Security & Compliance
- Tracks all critical operations (CREATE, UPDATE, DELETE, ASSIGN, UNASSIGN)
- User ID, entity type, entity ID, action, timestamp
- IP address tracking
- JSON details field for context
- Indexed for fast querying by user, entity, action, and timestamp

## 📡 API Endpoints

### Authentication

- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login
- `POST /api/v1/auth/refresh` - Refresh access token
- `GET /api/v1/auth/profile` - Get profile (protected)

### Drivers (Admin: full CRUD, Operations: read-only)

- `GET /api/v1/drivers` - List drivers (paginated, filterable by status)
- `GET /api/v1/drivers/:id` - Get driver by ID
- `POST /api/v1/drivers` - Create driver (Admin only)
- `PATCH /api/v1/drivers/:id` - Update driver (Admin only)
- `DELETE /api/v1/drivers/:id` - Deactivate driver / soft delete (Admin only)

### Vehicles (Admin: full CRUD, Operations: read-only)

- `GET /api/v1/vehicles` - List vehicles (paginated)
- `GET /api/v1/vehicles/:id` - Get vehicle by ID
- `POST /api/v1/vehicles` - Create vehicle (Admin only)
- `PATCH /api/v1/vehicles/:id` - Update vehicle (Admin only)
- `DELETE /api/v1/vehicles/:id` - Deactivate vehicle / soft delete (Admin only)

### Assignments (Admin & Operations: full access)

- `GET /api/v1/assignments` - List assignments (filterable by driver, vehicle, active status)
- `GET /api/v1/assignments/:id` - Get assignment by ID
- `POST /api/v1/assignments` - Assign driver to vehicle
- `DELETE /api/v1/assignments/:id` - Unassign driver from vehicle

## 🔒 Security Features

- **Helmet:** Security headers
- **CORS:** Configurable cross-origin requests
- **Rate Limiting:** Throttling (100 req/min globally, custom per endpoint)
- **JWT:** Secure token-based authentication with refresh token rotation
- **Argon2:** Industry-standard password hashing
- **Joi Validation:** Input validation with strict schemas
- **RBAC:** Role-based access control (Admin, Operations) via `@Roles()` decorator

## 🐳 Docker

```bash
# Start everything (PostgreSQL + API)
docker compose up -d

# Or build and run manually
docker build -t swift-driver-backend .
docker run -p 3000:3000 --env-file .env swift-driver-backend
```

## 📝 Environment Variables

```env
NODE_ENV=development
PORT=3000
DATABASE_URL="postgresql://user:password@localhost:5432/swift_driver_management"
JWT_SECRET="your-super-secret-jwt-key"
JWT_EXPIRES_IN="24h"
JWT_REFRESH_EXPIRES_IN="7d"
```

## 🛠️ Available Scripts

```bash
# Development
npm run start:dev          # Start with hot reload

# Production
npm run build              # Build for production
npm run start:prod         # Start production server

# Database
npx prisma migrate dev     # Run migrations
npx prisma studio          # Open Prisma Studio
npx prisma generate        # Generate Prisma Client

# Testing
npm run test               # Run unit tests
npm run test:e2e           # Run e2e tests
npm run test:cov           # Test coverage

# Code Quality
npm run lint               # Run ESLint
npm run format             # Run Prettier
```

## 📚 Documentation

- **Swagger UI:** http://localhost:3000/api (when server is running)
- **Prisma Schema:** `prisma/schema.prisma`

## 🏛️ Architectural Decisions & Trade-offs

### Architecture

- **Repository Pattern:** Chose a dedicated repository layer to decouple database access from business logic. This adds a small amount of boilerplate but makes services testable with mocks and allows swapping the data layer without touching business logic.
- **Joi over class-validator:** Used Joi in dedicated validator classes instead of class-validator decorators on DTOs. This centralises validation logic, keeps DTOs as clean data contracts for Swagger, and makes complex conditional validation (e.g., checking uniqueness against the database) straightforward.
- **Soft Deletes:** Drivers and vehicles use `deletedAt` timestamps rather than hard deletes. This preserves historical assignment data and meets audit trail requirements at the cost of slightly more complex queries (always filtering `deletedAt: null`).



### Assumptions

- A driver can only be assigned to **one vehicle at a time** (enforced via validator checks).
- A vehicle can only have **one active driver** at a time.
- Driver/vehicle deletion is always a **soft delete** (sets `status: INACTIVE` and `deletedAt` timestamp).
- The **Operations** role can read all data and manage assignments but cannot create, update, or delete drivers/vehicles.
- The **Admin** role has full access to all endpoints.
- Phone numbers and license numbers are unique per driver; registration numbers are unique per vehicle.

### What I Would Improve Given More Time

1. **Integration/E2E tests** for the complete assignment flow (create driver → create vehicle → assign → unassign → verify history)
2. **Search and filtering** — full-text search on driver names, date-range filters on assignments
3. **Audit log API endpoint** — Allow administrators to query and export audit logs via API

## 🔄 Development Workflow

1. Create feature module in `src/apis/{feature}/`
2. Define DTOs with Swagger decorators
3. Create validator with Joi schemas
4. Implement repository for data access
5. Build service with business logic
6. Create controller with route handlers
7. Add module to `app.module.ts`
8. Write unit tests
9. Test via Swagger UI



**Built with ❤️ for Swift Transport**

