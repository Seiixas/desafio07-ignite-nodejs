import { hash } from "bcryptjs";
import { AppError } from "../../../../shared/errors/AppError";
import { User } from "../../../users/entities/User";
import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { CreateStatementUseCase } from "./CreateStatementUseCase";

let createStatementUseCase: CreateStatementUseCase;
let usersRepositoryInMemory: InMemoryUsersRepository;
let statementsRepositoryInMemory: InMemoryStatementsRepository;
let user: User;

enum OperationType {
  DEPOSIT = 'deposit',
  WITHDRAW = 'withdraw',
}

describe('Create Statement Use Case', () => {
  beforeEach(async () => {
    usersRepositoryInMemory = new InMemoryUsersRepository();
    statementsRepositoryInMemory = new InMemoryStatementsRepository();

    createStatementUseCase = new CreateStatementUseCase(
      usersRepositoryInMemory,
      statementsRepositoryInMemory
    );

    const hashedPassword = await hash('mysecretpassword', 8);

    user = await usersRepositoryInMemory.create({
      name: 'My User',
      email: 'myemail@user.com',
      password: hashedPassword
    });
  });

  it('should be able to create a deposit statement', async() => {
    const response = await createStatementUseCase.execute({
      user_id: String(user.id),
      amount: 150,
      description: 'Its payday',
      type: "deposit" as OperationType
    });

    const balanceResponse = await statementsRepositoryInMemory.getUserBalance({
      user_id: String(user.id)
    });

    expect(response.user_id).toEqual(user.id);
    expect(response.type).toEqual('deposit');
    expect(balanceResponse.balance).toEqual(150);
  });

  it('should be able to create a withdraw statement', async() => {
    await createStatementUseCase.execute({
      user_id: String(user.id),
      amount: 150,
      description: 'Its payday',
      type: "deposit" as OperationType
    });

    const response = await createStatementUseCase.execute({
      user_id: String(user.id),
      amount: 100,
      description: 'Withdraw to pay my portuguese course',
      type: "withdraw" as OperationType
    });

    const balanceResponse = await statementsRepositoryInMemory.getUserBalance({
      user_id: String(user.id)
    });

    expect(response.user_id).toEqual(user.id);
    expect(response.type).toEqual('withdraw');
    expect(balanceResponse.balance).toEqual(50);
  });

  it('should not be able to do any statement operation with an user that does not exists', () => {
    expect(async() => {
      await createStatementUseCase.execute({
        user_id: 'fake-user-id',
        amount: 150,
        description: 'Its payday',
        type: "deposit" as OperationType
      });
    }).rejects.toBeInstanceOf(AppError);
  });

  it('should not be able to do a withdraw operation without funds', () => {
    expect(async() => {
      await createStatementUseCase.execute({
        user_id: String(user.id),
        amount: 40,
        description: 'My gift',
        type: "deposit" as OperationType
      });

      await createStatementUseCase.execute({
        user_id: String(user.id),
        amount: 2000,
        description: 'Trying to cheat the bank',
        type: "withdraw" as OperationType
      });
    }).rejects.toBeInstanceOf(AppError);
  });
});
