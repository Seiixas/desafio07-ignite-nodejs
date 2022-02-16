import { hash } from "bcryptjs";
import { AppError } from "../../../../shared/errors/AppError";
import { User } from "../../../users/entities/User";
import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { Statement } from "../../entities/Statement";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { GetStatementOperationUseCase } from '../getStatementOperation/GetStatementOperationUseCase';

let usersRepositoryInMemory: InMemoryUsersRepository;
let statementsRepositoryInMemory: InMemoryStatementsRepository;
let getStatementOperationUseCase: GetStatementOperationUseCase;
let user: User;
let statement: Statement;

enum OperationType {
  DEPOSIT = 'deposit',
  WITHDRAW = 'withdraw',
}

describe('Get Statement Operation Use Case', () => {
  beforeEach(async() => {
    usersRepositoryInMemory = new InMemoryUsersRepository();
    statementsRepositoryInMemory = new InMemoryStatementsRepository();

    getStatementOperationUseCase = new GetStatementOperationUseCase(
      usersRepositoryInMemory,
      statementsRepositoryInMemory
    );

    const hashedPassword = await hash('123', 8);

    user = await usersRepositoryInMemory.create({
      name: 'My User',
      email: 'myemailuser@user.com',
      password: hashedPassword
    });

    statement = await statementsRepositoryInMemory.create({
      amount: 1000,
      type: 'withdraw' as OperationType,
      user_id: String(user.id),
      description: 'My Withdraw'
    });
  });

  it('should be able to get statement operation from user', async() => {
    const response = await getStatementOperationUseCase.execute({
      user_id: String(user.id),
      statement_id: String(statement.id)
    });

    expect(response).toHaveProperty('id');
    expect(response.amount).toEqual(1000);
    expect(response).toHaveProperty('user_id');
    expect(response.user_id).toEqual(String(user.id));
  });

  it('should not be able to get statement to a user that does not exists', () => {
    expect(async() => {
      await getStatementOperationUseCase.execute({
        user_id: 'fake-user-id',
        statement_id: String(statement.id)
      })
    }).rejects.toBeInstanceOf(AppError);
  });

  it('should not be able to get statement that does not exists', () => {
    expect(async() => {
      await getStatementOperationUseCase.execute({
        user_id: String(user.id),
        statement_id: 'fake-statement-id'
      })
    }).rejects.toBeInstanceOf(AppError);
  });
});
