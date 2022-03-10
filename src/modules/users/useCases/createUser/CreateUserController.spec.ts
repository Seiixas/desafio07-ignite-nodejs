import request from 'supertest';
import { Connection, createConnection } from 'typeorm';
import { app } from '../../../../app';

let connection: Connection;

describe('Create User', () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it('should be able to create a user', async () => {
    const response = await request(app)
      .post('/api/v1/users')
      .send({
        name: 'My User',
        email: 'myemail@test.com',
        password: 'my-secure-password'
      });

    expect(response.status).toBe(201);
  });

  it('should not be able to create two users with same email', async () => {
    await request(app)
      .post('/api/v1/users')
      .send({
        name: 'John',
        email: 'same-email@test.com',
        password: 'my-secure-password'
      });

    const response = await request(app)
      .post('/api/v1/users')
      .send({
        name: 'Matthew',
        email: 'same-email@test.com',
        password: 'this-also-is-secure'
      });

    expect(response.status).toBe(400);
  })
});
