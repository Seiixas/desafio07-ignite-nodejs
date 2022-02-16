import { hash } from "bcryptjs";
import { AppError } from "../../../../shared/errors/AppError";
import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { AuthenticateUserUseCase } from "./AuthenticateUserUseCase";

let authenticateUserUseCase: AuthenticateUserUseCase;
let usersRepositoryInMemory: InMemoryUsersRepository;

describe('Authenticate User Use Case', () => {
  beforeEach(() => {
    usersRepositoryInMemory = new InMemoryUsersRepository();
    authenticateUserUseCase = new AuthenticateUserUseCase(
      usersRepositoryInMemory
    );
  })

  it('should be able to authenticate a user', async () => {
    const hashedPassword = await hash('mysecretpassword', 8);

    const user = await usersRepositoryInMemory.create({
      name: 'My authentication user',
      email: 'authenticate@user.com',
      password: hashedPassword
    });

    const tokenResponse = await authenticateUserUseCase.execute({
      email: user.email,
      password: 'mysecretpassword'
    });

    expect(tokenResponse).toHaveProperty('token');
  });

  it('should not be able able to authenticate a user with incorrect password', async () => {
    const hashedPassword = await hash('mysecretpassword', 8);

    const user = await usersRepositoryInMemory.create({
      name: 'My authentication user',
      email: 'authenticate@user.com',
      password: hashedPassword
    });

    expect(async () => {
      await authenticateUserUseCase.execute({
        email: user.email,
        password: 'myincorrectpassword'
      });

    }).rejects.toBeInstanceOf(AppError)
  });

  it('should not be able able to authenticate a user with incorrect email', async () => {
    const hashedPassword = await hash('mysecretpassword', 8);

    await usersRepositoryInMemory.create({
      name: 'My authentication user',
      email: 'authenticate@user.com',
      password: hashedPassword
    });

    expect(async () => {
      await authenticateUserUseCase.execute({
        email: 'incorrecauthenticate@user.com',
        password: 'mysecretpassword'
      });

    }).rejects.toBeInstanceOf(AppError)
  });

  it('should not be able able to authenticate a user that does not exists', async () => {
    expect(async () => {
      await authenticateUserUseCase.execute({
        email: 'unkownuseremail@user.com',
        password: 'randompassword'
      });

    }).rejects.toBeInstanceOf(AppError)
  });
});
