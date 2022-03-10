import request from "supertest";
import { Connection, createConnection } from "typeorm";
import { app } from "../../../../app";

let connection: Connection;

describe('Create Statement Controller', () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it('should be able to create a deposit statement', async () => {
    await request(app)
      .post('/api/v1/users')
      .send({
        name: 'Paul',
        email: 'paul@mail.com',
        password: 'password'
      });

    const response = await request(app)
      .post('/api/v1/sessions')
      .send({
        email: 'paul@mail.com',
        password: 'password'
      });

    const { token } = response.body;

    await request(app)
      .post('/api/v1/statements/deposit')
      .send({
        amount: 150,
        description: 'Its payday'
      })
      .set({
        Authorization: `Bearer ${token}`
      });

    const balance = await request(app)
      .get('/api/v1/statements/balance')
      .set({
        Authorization: `Bearer ${token}`
      });

    expect(balance.body.balance).toEqual(150);
  });

  it('should be able to create a withdraw statement', async () => {
    await request(app)
      .post('/api/v1/users')
      .send({
        name: 'Paul',
        email: 'paul@mail.com',
        password: 'password'
      });

    const response = await request(app)
      .post('/api/v1/sessions')
      .send({
        email: 'paul@mail.com',
        password: 'password'
      });

    const { token } = response.body;

    await request(app)
      .post('/api/v1/statements/deposit')
      .send({
        amount: 150,
        description: 'Its payday'
      })
      .set({
        Authorization: `Bearer ${token}`
      });

    await request(app)
      .post('/api/v1/statements/withdraw')
      .send({
        amount: 100,
        description: 'Paying debts'
      })
      .set({
        Authorization: `Bearer ${token}`
      });

    const balance = await request(app)
      .get('/api/v1/statements/balance')
      .set({
        Authorization: `Bearer ${token}`
      });

    expect(balance.body.balance).toEqual(50);
  });

  it('should not be able to do any statement operation with an user that does not exists', async () => {
    const balance = await request(app)
      .get('/api/v1/statements/withdraw')
      .set({
        Authorization: `Bearer fake-id`
      });

    expect(balance.status).toBe(401);
  });

  it('should not be able to do a withdraw operation without funds', async () => {
    await request(app)
      .post('/api/v1/users')
      .send({
        name: 'Paul',
        email: 'paul@mail.com',
        password: 'password'
      });

    const response = await request(app)
      .post('/api/v1/sessions')
      .send({
        email: 'paul@mail.com',
        password: 'password'
      });

    const { token } = response.body;

    await request(app)
      .post('/api/v1/statements/deposit')
      .send({
        amount: 150,
        description: 'Its payday'
      })
      .set({
        Authorization: `Bearer ${token}`
      });

    const withdraw = await request(app)
      .post('/api/v1/statements/withdraw')
      .send({
        amount: 2000,
        description: 'Paying debts'
      })
      .set({
        Authorization: `Bearer ${token}`
      });

    expect(withdraw.status).toBe(400);
  })
});
