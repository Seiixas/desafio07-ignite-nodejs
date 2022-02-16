import "reflect-metadata";

import { CreateUserUseCase } from "./CreateUserUseCase"
import { InMemoryUsersRepository } from '../../repositories/in-memory/InMemoryUsersRepository'
import { AppError } from "../../../../shared/errors/AppError";

let createUserUseCase: CreateUserUseCase;
let usersRepositoryInMemory: InMemoryUsersRepository;

describe('Create User Use Case', () => {
  beforeEach(() => {
    usersRepositoryInMemory = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(usersRepositoryInMemory);
  })

  it('should be able to create a new user', async () => {
    const user = await createUserUseCase.execute({
      name: 'Name User Test',
      email: 'myemailtest@user.com',
      password: 'MySecretPassw0rd'
    });

    expect(user).toHaveProperty('id')
  });

  it('should not be able to create two users with same email', () => {
    expect(async () => {
        await createUserUseCase.execute({
          name: 'My first user',
          email: 'sameemail@user.com',
          password: 'MySecretPassw0rd'
        });

        await createUserUseCase.execute({
          name: 'My second user',
          email: 'sameemail@user.com',
          password: 'MySecretPassw0rd'
        });
      }
    ).rejects.toBeInstanceOf(AppError);
  })
})
