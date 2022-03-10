import request from 'supertest';
import { Connection, createConnection } from 'typeorm';
import { app } from '../../../../app';

let connection: Connection;

describe('Authenticate User Controller', () => {
  beforeAll(async () => {
  connection = await createConnection();
  await connection.runMigrations();
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it('should be able to authenticate an user', async () => {
    await request(app)
      .post('/api/v1/users')
      .send({
        name: 'Matthew',
        email: 'auth@mail.com',
        password: 'authenticate'
      });

    const response = await request(app)
      .post('/api/v1/sessions')
      .send({
        email: 'auth@mail.com',
        password: 'authenticate'
      });

    expect(response.body).toHaveProperty('token');
  });

  it('should not be able able to authenticate a user with incorrect password', async () => {
    await request(app)
      .post('/api/v1/users')
      .send({
        name: 'Matthew',
        email: 'auth@mail.com',
        password: 'authenticate'
      });

    const response = await request(app)
      .post('/api/v1/sessions')
      .send({
        email: 'auth@mail.com',
        password: 'wrong-password'
      });

    expect(response.status).toBe(401);
  });

  it('should not be able able to authenticate a user with incorrect email', async () => {
    await request(app)
      .post('/api/v1/users')
      .send({
        name: 'Matthew',
        email: 'auth@mail.com',
        password: 'my-secure-password'
      });

    const response = await request(app)
      .post('/api/v1/sessions')
      .send({
        email: 'my-wrong-mail@mail.com',
        password: 'my-secure-password'
      });

    expect(response.status).toBe(401);
  });

  it('should not be able able to authenticate a user that does not exists', async () => {
    const response = await request(app)
      .post('/api/v1/sessions')
      .send({
        email: 'i-dont-exist@mail.com',
        password: 'yeah'
      });

    expect(response.status).toBe(401);
  });
})

