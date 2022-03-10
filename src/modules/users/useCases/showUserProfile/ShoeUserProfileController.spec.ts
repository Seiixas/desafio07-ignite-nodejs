import { Connection, createConnection } from "typeorm";
import request from 'supertest';
import { app } from "../../../../app";

let connection: Connection;

describe('Show Profile Controller', () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it('should be able to show an user profile', async () => {
    await request(app)
      .post('/api/v1/users')
      .send({
        name: 'John',
        email: 'john@mail.com',
        password: 'password'
      });

    const response = await request(app)
      .post('/api/v1/sessions')
      .send({
        email: 'john@mail.com',
        password: 'password'
      });

    const profile = await request(app)
      .get('/api/v1/profile')
      .set({
        Authorization: `Bearer ${response.body.token}`
      });

    expect(profile.body).toHaveProperty('name');
    expect(profile.body).toHaveProperty('email');
    expect(profile.body.name).toEqual('John');
    expect(profile.body.email).toEqual('john@mail.com');
  })

  it('should not be able to show an user profile that does not exists', async () => {
    const profile = await request(app)
      .get('/api/v1/profile')
      .set({
        Authorization: `Bearer do-not-exists`
      });

    expect(profile.status).toBe(401);
  });
})
