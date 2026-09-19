import request from 'supertest';
import app from '../src/app';
import prisma from '../src/db/prisma';

describe('Health Endpoints', () => {
  describe('GET /health', () => {
    it('should return healthy status', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body.status).toBe('healthy');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('uptime');
    });
  });

  describe('GET /health/ready', () => {
    it('should check database and redis connectivity', async () => {
      const response = await request(app)
        .get('/health/ready')
        .expect(200);

      expect(response.body).toHaveProperty('status');
      expect(response.body).toHaveProperty('checks');
      expect(response.body.checks).toHaveProperty('database');
    });
  });
});

describe('Authentication', () => {
  const testUser = {
    email: `test-${Date.now()}@example.com`,
    password: 'password123',
    name: 'Test User',
  };

  describe('POST /auth/register', () => {
    it('should register a new user', async () => {
      const response = await request(app)
        .post('/auth/register')
        .send(testUser)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('token');
      expect(response.body.data.user).toHaveProperty('email', testUser.email);
    });

    it('should reject invalid email', async () => {
      const response = await request(app)
        .post('/auth/register')
        .send({ email: 'invalid', password: 'password123' })
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should reject short password', async () => {
      const response = await request(app)
        .post('/auth/register')
        .send({ email: 'valid@example.com', password: 'short' })
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /auth/login', () => {
    let token: string;

    beforeAll(async () => {
      // Create a user for login test
      await request(app)
        .post('/auth/register')
        .send({
          email: `login-test-${Date.now()}@example.com`,
          password: 'password123',
        });
    });

    it('should login with valid credentials', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password,
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('token');
      token = response.body.data.token;
    });

    it('should reject invalid credentials', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          email: testUser.email,
          password: 'wrongpassword',
        })
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });
});

describe('Task Management (Authenticated)', () => {
  let authToken: string;
  let createdTaskId: string;

  beforeAll(async () => {
    // Register and get token
    const registerResponse = await request(app)
      .post('/auth/register')
      .send({
        email: `task-test-${Date.now()}@example.com`,
        password: 'password123',
      });

    authToken = registerResponse.body.data.token;
  });

  describe('POST /tasks', () => {
    it('should create a task when authenticated', async () => {
      const response = await request(app)
        .post('/tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Test Task',
          description: 'This is a test task',
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe('Test Task');
      createdTaskId = response.body.data.id;
    });

    it('should reject task creation without authentication', async () => {
      const response = await request(app)
        .post('/tasks')
        .send({ title: 'Unauthorized Task' })
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /tasks', () => {
    it('should get all tasks for the authenticated user', async () => {
      const response = await request(app)
        .get('/tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  describe('GET /tasks/:id', () => {
    it('should get a specific task by ID', async () => {
      const response = await request(app)
        .get(`/tasks/${createdTaskId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(createdTaskId);
    });
  });

  describe('PATCH /tasks/:id', () => {
    it('should update a task', async () => {
      const response = await request(app)
        .patch(`/tasks/${createdTaskId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ completed: true })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.completed).toBe(true);
    });
  });

  describe('DELETE /tasks/:id', () => {
    it('should delete a task', async () => {
      await request(app)
        .delete(`/tasks/${createdTaskId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(204);

      // Verify deletion
      const getResponse = await request(app)
        .get(`/tasks/${createdTaskId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(getResponse.body.success).toBe(false);
    });
  });
});

// Cleanup after tests
afterAll(async () => {
  await prisma.$disconnect();
});
