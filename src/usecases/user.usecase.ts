import UserRepository from "@repositories/users.repository";
import { IUser } from "@models/user";

class UserUseCases {
  userRepository: UserRepository;

  constructor() {
    this.userRepository = new UserRepository();
  }

  async createUser(userData: IUser): Promise<number> {
    return await this.userRepository.create(userData);
  }

    async insertUsers(usersData: IUser[]): Promise<number[]> {
    return await this.userRepository.insertMany(usersData);
  }

  async getAllUsers(page?: number, limit?: number): Promise<IUser[]> {
    if (typeof page === "number" && page > 0 && typeof limit === "number") {
      const offset = (page - 1) * limit;
      return await this.userRepository.findAll(limit, offset);
    }
    // default: return all if pagination not provided
    return await this.userRepository.findAll();
  }

    async getUserById(id: number): Promise<IUser | undefined> {
    return await this.userRepository.findById(id);
  }

  async getUserByEmail(email: string): Promise<IUser | undefined> {
    return await this.userRepository.findOneByQuery({ email });
  }
  
  async update(id: number, data: Partial<IUser>): Promise<boolean> {
    return await this.userRepository.update(id, data);
  }

  async isUserBlacklisted(userId: number): Promise<boolean> {
    return await this.userRepository.isUserBlacklisted(userId);
  }

  async isUserVerified(userId: number): Promise<boolean> {
    return await this.userRepository.isUserVerified(userId);
  }
}

export default UserUseCases;