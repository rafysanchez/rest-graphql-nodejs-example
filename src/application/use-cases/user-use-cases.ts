import { IUserRepository } from "../../domain/repositories";
import { User } from "../../domain/entities";

export interface CreateUserDTO {
  name: string;
  email: string;
  password?: string;
}

export class CreateUserUseCase {
  constructor(private userRepository: IUserRepository) {}

  async execute(data: CreateUserDTO): Promise<User> {
    const userExists = await this.userRepository.findByEmail(data.email);
    if (userExists) {
      throw new Error("User already exists");
    }

    const user = new User(
      globalThis.crypto.randomUUID(),
      data.name,
      data.email,
      data.password
    );

    return this.userRepository.create(user);
  }
}

export class ListUsersUseCase {
  constructor(private userRepository: IUserRepository) {}

  async execute(): Promise<User[]> {
    return this.userRepository.list();
  }
}

export class GetUserByIdUseCase {
  constructor(private userRepository: IUserRepository) {}

  async execute(id: string): Promise<User | null> {
    return this.userRepository.findById(id);
  }
}
