# Swift Transport - Driver Management Backend

A robust NestJS backend API for managing drivers and vehicle assignments for Swift Transport, a transport platform operating across Africa.

## 🎥 Video Walkthrough (5 min)

▶️ [Watch on Loom](https://www.loom.com/share/f990315304e44961ba711bf74c3a4689) — 5 minute walkthrough of the API and dashboard

## 🏗️ Architecture Overview

This backend follows a **feature-first modular architecture** on top of NestJS, with strict separation between API, business rules, and data access:

```
src/
├── apis/                            # HTTP API modules (controllers/services/validators)
│   ├── auth/                        # Registration, login, refresh token, profile
│   │   ├── dto/
│   │   ├── decorators/
│   │   ├── guards/
│   │   ├── strategies/
│   │   └── auth.module.ts
│   ├── drivers/                     # Driver CRUD + status lifecycle
│   ├── vehicles/                    # Vehicle CRUD + lifecycle
│   └── assignments/                 # Driver-vehicle assignment/unassignment flow
├── repositories/                    # Data access layer (Prisma-backed repositories)
│   ├── repositories.module.ts
│   ├── user.repository.ts
│   ├── driver.repository.ts
│   ├── vehicle.repository.ts
│   ├── assignment.repository.ts
│   └── entities/                    # Repository input/query types
├── common/                          # Cross-cutting infrastructure and shared contracts
│   ├── audit-log/                   # Audit logging module/service
│   ├── entities/                    # Shared response/audit entities
│   ├── enums/
│   ├── types/
│   ├── prisma.ts                    # Prisma client (Postgres adapter)
│   └── response.ts                  # Standard API response builder
├── config/                          # Env validation + runtime config
│   ├── validate-env.ts
│   └── config.ts
├── utils/                           # Helpers (validation, logger, query coercion)
│   ├── entities/
│   │   └── utils.entity.ts
│   ├── joi.validator.ts
│   ├── logger.ts
│   └── utils.ts                     # Query param coercion (pagination, booleans)
├── app.module.ts
├── app.controller.ts
├── app.service.ts
└── main.ts
```

### Runtime composition

- **API Layer:** Nest controllers expose versioned routes under `/api/v1/*`
- **Domain Layer:** Services + validators enforce business rules (RBAC, assignment constraints, input checks)
- **Persistence Layer:** Repository classes isolate all Prisma queries/mutations
- **Infrastructure Layer:** PostgreSQL + Prisma migrations + Dockerized deployment (API startup runs `prisma migrate deploy` before boot)

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

## 🐳 Docker (Recommended for Reviewers)

The fastest way to get the API running:

```bash
# Start everything (PostgreSQL + API) - includes automatic migrations
docker compose up -d

# View logs
docker compose logs -f api

# Stop
docker compose down
```

This will:
- Start PostgreSQL 16 on port **4000** (host) → 5432 (container)
- Build and start the API on port **3000**
- Run Prisma migrations automatically on API startup
- Wait for the database to be healthy before starting the API

Once running:
- **API:** http://localhost:3000
- **Swagger Docs:** http://localhost:3000/api

```bash
# Alternative: Build and run manually (requires external PostgreSQL)
docker build -t swift-driver-backend .
docker run -p 3000:3000 --env-file .env swift-driver-backend
```

## 📝 Environment Variables

Copy `.env.example` to `.env` and configure:

```env
NODE_ENV=development
PORT=3000
DATABASE_URL="postgresql://user:password@localhost:5432/swift_driver_management?schema=public"
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
JWT_EXPIRES_IN="24h"
JWT_REFRESH_EXPIRES_IN="7d"
```

> **Note:** When using Docker Compose, the environment variables are pre-configured in `docker-compose.yml`.

## 🛠️ Available Scripts

```bash
# Development
npm run start:dev          # Start with hot reload

# Production
npm run build              # Build for production
npm run start:prod         # Start production server (requires pre-run migrations)
npm run start:docker       # Run migrations + start server (used by Docker)

# Database
npx prisma migrate dev     # Create and run migrations (development)
npx prisma migrate deploy  # Apply migrations (production/CI)
npx prisma studio          # Open Prisma Studio (DB GUI)
npx prisma generate        # Generate Prisma Client

# Testing
npm run test               # Run unit tests
npm run test:e2e           # Run e2e tests
npm run test:cov           # Test coverage

# Code Quality
npm run lint               # Run ESLint
npm run format             # Run Prettier
```

## ✅ Quick Test (for Reviewers)

After starting the server (via Docker or locally), test the API:

```bash
# 1. Register an admin user
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@test.com","password":"Password123!","fullName":"Test Admin","role":"ADMIN"}'

# 2. Login to get tokens
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@test.com","password":"Password123!"}'

# 3. Use the access token to create a driver (replace <TOKEN>)
curl -X POST http://localhost:3000/api/v1/drivers \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN>" \
  -d '{"fullName":"John Doe","phoneNumber":"+233123456789","licenseNumber":"DL-123456"}'

# 4. List drivers
curl http://localhost:3000/api/v1/drivers \
  -H "Authorization: Bearer <TOKEN>"
```

Or use Swagger UI at http://localhost:3000/api for an interactive experience.

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

