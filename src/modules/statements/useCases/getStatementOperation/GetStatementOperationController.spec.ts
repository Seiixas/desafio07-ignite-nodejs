import request from 'supertest';
import { Connection, createConnection } from "typeorm";
import { app } from '../../../../app';

let connection: Connection;

describe('Get Statement Operation Controller', () => {
  beforeAll(async() => {
    connection = await createConnection();
    await connection.runMigrations();
  });

  afterAll(async() => {
    await connection.dropDatabase();
    await connection.close();
  });

  it('should be able to get statement operation from user', async () => {
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

    const deposit = await request(app)
      .post('/api/v1/statements/deposit')
      .send({
        amount: 150,
        description: 'Its payday'
      })
      .set({
        Authorization: `Bearer ${token}`
      });

    const { id } = deposit.body;

    const statement = await request(app)
      .get(`/api/v1/statements/${id}`)
      .set({
        Authorization: `Bearer ${token}`
      })

    expect(statement.body).toHaveProperty('amount');
    expect(statement.body.amount).toEqual(150);
    expect(statement.body).toHaveProperty('user_id');
  });

  it('should not be able to get statement that does not exists', async () => {
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

    const id = 'fake-statement-id';

    const statement = await request(app)
      .get(`/api/v1/statements/${id}`)
      .set({
        Authorization: `Bearer ${token}`
      })

    expect(statement.status).toBe(404);
  });
});
