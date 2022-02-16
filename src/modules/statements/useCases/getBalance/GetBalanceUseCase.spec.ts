import { hash } from "bcryptjs";
import { AppError } from "../../../../shared/errors/AppError";
import { User } from "../../../users/entities/User";
import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { GetBalanceUseCase } from "./GetBalanceUseCase";

let usersRepositoryInMemory: InMemoryUsersRepository;
let statementsRepositoryInMemory: InMemoryStatementsRepository;
let getBalanceUseCase: GetBalanceUseCase;
let user: User;

describe('Get Balance Use Case', () => {
  beforeEach(async () => {
    usersRepositoryInMemory = new InMemoryUsersRepository();
    statementsRepositoryInMemory = new InMemoryStatementsRepository();

    getBalanceUseCase = new GetBalanceUseCase(
      statementsRepositoryInMemory,
      usersRepositoryInMemory
    );

    const hashedPassword = await hash('123', 8);

    user = await usersRepositoryInMemory.create({
      name: 'My User',
      email: 'myemailuser@user.com',
      password: hashedPassword
    });
  });

  it('should be able to show balance', async () => {
    const response = await getBalanceUseCase.execute({
      user_id: String(user.id)
    });

    expect(response).toHaveProperty('statement');
    expect(response).toHaveProperty('balance');
    expect(response.balance).toBeLessThanOrEqual(0);
  });

  it('should not be able to show balance to a user that does not exists', () => {
    expect(async () => {
      await getBalanceUseCase.execute({
        user_id: 'my-fake-user-id'
      });
    }).rejects.toBeInstanceOf(AppError);

  });
});
