import { IUser } from "@models/user";
import { BaseRepository } from "./base.repository";
import { DatabaseError } from "@managers/error.manager";

class UserRepository extends BaseRepository<IUser> {
  protected table = "users";

  //check if user is blacklisted
  async isUserBlacklisted(userId: number): Promise<boolean> {
    try {
      const user = await this.findById(userId);
      if (!user) {
        throw new Error(`User with id ${userId} not found`);
      }
      if (user.is_blacklisted) {
        return true;
      }
      return false;
    } catch (error: any) {
      throw new DatabaseError(
        `Error checking if user is blacklisted: ${error.message}`
      );
    }
  }
}

export default UserRepository;
