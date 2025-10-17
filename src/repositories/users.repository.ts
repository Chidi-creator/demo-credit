import { IUser } from "@models/user";
import { BaseRepository } from "./base.repository";

class UserRepository extends BaseRepository<IUser> {
  protected table = "users";
}

export default UserRepository;
