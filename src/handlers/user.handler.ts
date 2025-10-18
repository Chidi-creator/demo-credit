import { Request, Response } from "express";
import { responseManager } from "@managers/index";
import UserUseCases from "@usecases/user.usecase";
import { AuthenticatedRequest } from "@services/types/auth";
import { IUser } from "@models/user";

class UserHandler {
  private userUseCases: UserUseCases;
  constructor() {
    this.userUseCases = new UserUseCases();
  }

  insertUsers = async (req: Request, res: Response) => {
    try {
      const users: IUser[] = req.body;
      const ids = await this.userUseCases.insertUsers(users);
      return responseManager.success(res, { ids }, "Users inserted");
    } catch (error: any) {
      return responseManager.handleError(res, error);
    }
  };

  getAllUsers = async (req: Request, res: Response) => {
    try {
      const page = req.query.page ? Number(req.query.page) : undefined;
      const limit = req.query.limit ? Number(req.query.limit) : 10; // default 10

      const users = await this.userUseCases.getAllUsers(page, limit);
      return responseManager.success(res, users, "Users fetched");
    } catch (error: any) {
      return responseManager.handleError(res, error);
    }
  };

  getUserById = async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) return responseManager.error(res, "Invalid id");
      const user = await this.userUseCases.getUserById(id);
      if (!user) return responseManager.notFound(res, "User not found");
      return responseManager.success(res, user, "User fetched");
    } catch (error: any) {
      return responseManager.handleError(res, error);
    }
  };

  updateUser = async (req: Request, res: Response) => {
    try {
      const authReq = req as AuthenticatedRequest;
      const requesterId = Number(authReq.user?.id);
      if (!authReq.user || !authReq.user.id || isNaN(requesterId)) {
        return responseManager.unauthorized(res, "User not authenticated");
      }

      const id = Number(req.params.id);
      if (isNaN(id)) return responseManager.error(res, "Invalid id");

      const data: Partial<IUser> = req.body;
      const ok = await this.userUseCases.update(id, data);
      if (!ok) return responseManager.error(res, "Update failed");
      return responseManager.success(res, {}, "User updated");
    } catch (error: any) {
      return responseManager.handleError(res, error);
    }
  };
}

export default UserHandler;
