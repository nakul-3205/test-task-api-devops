# Task Management API

A simple, clean **Task Management REST API** built for DevOps learning purposes.

## What This Project Is

This is a beginner-friendly backend application designed specifically for learning DevOps concepts:

- Linux server administration
- SSH and remote deployment
- Networking and ports
- Docker and Docker Compose
- CI/CD pipelines
- Cloud deployment (Azure, AWS, etc.)
- Infrastructure as Code (Terraform)
- Monitoring (Prometheus/Grafana)
- Logging
- Kubernetes

The application logic is intentionally **simple** so you can focus on infrastructure learning.

---

## Architecture

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Client    │ ──► │    Nginx    │ ──► │  Node.js    │ ──► │ PostgreSQL  │
│  (curl/etc) │     │ (optional)  │     │    API      │ ◄──► │   + Redis   │
└─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘
                                              │
                                         JWT Auth
```

### Components

| Component | Technology | Purpose |
|-----------|------------|---------|
| API | Node.js + Express + TypeScript | REST API server |
| Database | PostgreSQL | Persistent storage |
| Cache | Redis | Task caching |
| ORM | Prisma | Database queries |
| Auth | JWT | Stateless authentication |

---

## Prerequisites

- **Node.js** v20+ ([download](https://nodejs.org/))
- **npm** or **yarn**
- **Docker** and **Docker Compose** (for containerized setup)
- **Git**

---

## Project Structure

```
task-management-api/
├── src/
│   ├── app.ts              # Express app configuration
│   ├── server.ts           # Server entry point
│   ├── db/
│   │   └── prisma.ts       # Prisma client
│   ├── routes/
│   │   ├── auth.routes.ts  # Auth endpoints
│   │   ├── task.routes.ts  # Task endpoints
│   │   └── health.routes.ts# Health checks
│   ├── middleware/
│   │   ├── auth.ts         # JWT authentication
│   │   ├── errorHandler.ts # Error handling
│   │   └── validators.ts   # Request validation
│   ├── services/
│   │   ├── auth.service.ts # Auth business logic
│   │   └── task.service.ts # Task business logic + Redis
│   └── utils/
├── prisma/
│   └── schema.prisma       # Database schema
├── tests/
│   └── app.test.ts         # Test suite
├── .env.example            # Environment template
├── .gitignore
├── docker-compose.yml      # Production containers
├── docker-compose.dev.yml  # Development containers
├── Dockerfile
├── package.json
├── tsconfig.json
└── README.md
```

---

## Environment Variables

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

| Variable | Description | Example |
|----------|-------------|---------|
| `PORT` | Server port | `3000` |
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@localhost:5432/taskdb` |
| `REDIS_URL` | Redis connection string | `redis://localhost:6379` |
| `JWT_SECRET` | Secret for JWT tokens | `your-secret-key` |
| `NODE_ENV` | Environment | `development` or `production` |

---

## Quick Start

### Option 1: Local Development (Recommended for Learning)

#### 1. Start PostgreSQL and Redis

```bash
docker compose -f docker-compose.dev.yml up -d
```

#### 2. Install Dependencies

```bash
npm install
```

#### 3. Generate Prisma Client

```bash
npm run prisma:generate
```

#### 4. Run Database Migrations

```bash
npm run prisma:migrate
```

#### 5. Start the API

```bash
npm run dev
```

Server runs at `http://localhost:3000`

---

### Option 2: Full Docker Setup

Build and run everything in containers:

```bash
docker compose up --build
```

Access the API at `http://localhost:3000`

**Note:** When running in Docker, you need to run migrations inside the container:

```bash
docker exec -it taskapi npx prisma migrate deploy
```

---

## API Endpoints

### Health

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/health` | No | Basic health check |
| GET | `/health/ready` | No | Readiness check (DB + Redis) |

### Authentication

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/auth/register` | No | Register new user |
| POST | `/auth/login` | No | Login and get JWT token |

### Tasks

All task endpoints require JWT authentication.

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/tasks` | Yes | Get all tasks (cached in Redis) |
| GET | `/tasks/:id` | Yes | Get single task |
| POST | `/tasks` | Yes | Create task |
| PATCH | `/tasks/:id` | Yes | Update task |
| DELETE | `/tasks/:id` | Yes | Delete task |

---

## Example Requests

### Register User

```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123",
    "name": "John Doe"
  }'
```

Response:
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid...",
      "email": "user@example.com",
      "name": "John Doe"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Login

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'
```

### Create Task

```bash
curl -X POST http://localhost:3000/tasks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "title": "Learn Docker",
    "description": "Complete this DevOps project"
  }'
```

### Get All Tasks

```bash
curl -X GET http://localhost:3000/tasks \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Get Single Task

```bash
curl -X GET http://localhost:3000/tasks/TASK_ID \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Update Task

```bash
curl -X PATCH http://localhost:3000/tasks/TASK_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "completed": true
  }'
```

### Delete Task

```bash
curl -X DELETE http://localhost:3000/tasks/TASK_ID \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Health Check

```bash
curl http://localhost:3000/health
```

### Readiness Check

```bash
curl http://localhost:3000/health/ready
```

---

## Running Tests

```bash
# Make sure PostgreSQL and Redis are running
docker compose -f docker-compose.dev.yml up -d

# Run migrations
npm run prisma:migrate

# Run tests
npm test
```

---

## Building for Production

```bash
npm run build
npm start
```

---

## Redis Usage

Redis is used for **simple caching** of the `GET /tasks` endpoint:

1. When a user requests their tasks, the API first checks Redis
2. If cached, returns immediately (cache hit)
3. If not cached, queries PostgreSQL and stores result in Redis for 60 seconds
4. Cache is invalidated when tasks are created, updated, or deleted

This gives you a practical reason to:
- Learn Redis commands
- Understand cache invalidation
- Debug cache-related issues
- Monitor Redis performance

---

## Next Steps for DevOps Learning

Once you have this running, try:

1. **Linux Basics**
   - Deploy to a Linux VM
   - Set up users and permissions
   - Configure firewall rules

2. **Networking**
   - Set up Nginx as reverse proxy
   - Configure SSL/TLS
   - Learn about ports and firewalls

3. **Docker**
   - Modify the Dockerfile
   - Learn multi-stage builds
   - Optimize image size

4. **CI/CD**
   - Create GitHub Actions workflow
   - Automate testing
   - Auto-deploy on push

5. **Cloud**
   - Deploy to Azure/AWS/GCP
   - Use managed databases
   - Configure networking

6. **Terraform**
   - Provision cloud resources
   - Manage infrastructure as code

7. **Monitoring**
   - Add Prometheus metrics
   - Create Grafana dashboards
   - Set up alerts

8. **Kubernetes**
   - Write K8s manifests
   - Deploy to Minikube/kind
   - Learn about pods, services, deployments

---

## Troubleshooting

### Database Connection Error

Ensure PostgreSQL is running:
```bash
docker compose -f docker-compose.dev.yml ps
```

Check connection string in `.env`.

### Redis Connection Error

Ensure Redis is running:
```bash
docker compose -f docker-compose.dev.yml ps
```

### Migration Errors

Reset and re-run migrations:
```bash
npx prisma migrate reset
npx prisma migrate dev
```

### Port Already in Use

Change `PORT` in `.env` or stop conflicting services.

---

## License

ISC
