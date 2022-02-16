import { hash } from 'bcryptjs';
import { AppError } from '../../../../shared/errors/AppError';
import { InMemoryUsersRepository } from '../../repositories/in-memory/InMemoryUsersRepository';
import { ShowUserProfileUseCase } from '../../useCases/showUserProfile/ShowUserProfileUseCase';

let usersRepositoryInMemory: InMemoryUsersRepository;
let showUserProfileUseCase: ShowUserProfileUseCase;

describe('Show User Profile Use Case', () => {
  beforeEach(() => {
    usersRepositoryInMemory = new InMemoryUsersRepository();
    showUserProfileUseCase = new ShowUserProfileUseCase(
      usersRepositoryInMemory
    );
  });

  it('should be able to show an user profile', async() => {
    const hashedPassword = await hash('123', 8);

    const user = await usersRepositoryInMemory.create({
      name: 'My User',
      email: 'myemailuser@user.com',
      password: hashedPassword
    });

    const response = await showUserProfileUseCase.execute(String(user.id));

    expect(response).toBe(user);
  });

  it('should not be able to show an user profile that does not exists', async() => {
    expect(async () => {
      await showUserProfileUseCase.execute('my-fake-id');
    }).rejects.toBeInstanceOf(AppError);
  });
});
