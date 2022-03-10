import request from "supertest";
import { Connection, createConnection } from "typeorm";
import { app } from "../../../../app";

let connection: Connection;

describe('Get Balance Controller', () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it('should be able to show balance', async () => {
    await request(app)
      .post('/api/v1/users')
      .send({
        name: 'Matthew',
        email: 'matthew@mail.com',
        password: 'password'
      });

    const response = await request(app)
      .post('/api/v1/sessions')
      .send({
        email: 'matthew@mail.com',
        password: 'password'
      });

    const { token } = response.body;

    const balance = await request(app)
      .get('/api/v1/statements/balance')
      .set({
        Authorization: `Bearer ${token}`
      });

    expect(balance.body).toHaveProperty('statement');
    expect(balance.body).toHaveProperty('balance');
  });

  it('should not be able to show balance to a user that does not exists', async () => {
    const balance = await request(app)
      .get('/api/v1/statements/balance')
      .set({
        Authorization: `Bearer fake-token`
      });

    expect(balance.status).toBe(401);
  });
});
