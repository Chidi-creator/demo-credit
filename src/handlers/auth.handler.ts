import { ValidationError } from "@managers/error.manager";
import { responseManager } from "@managers/index";
import { AuthService } from "@services/auth.service";
import { AuthenticatedRequest, ILoginRequest } from "@services/types/auth";
import { Request, Response } from "express";
import UserUseCases from "@usecases/user.usecase";
import logger from "@services/logger.service";

class AuthHandler {
  private authService: AuthService;
  private userUseCase: UserUseCases;

  constructor() {
    this.authService = new AuthService();
    this.userUseCase = new UserUseCases();
  }

  login = async (req: Request, res: Response) => {
    const startTime = Date.now();
    const { email, otp } = req.body;

    try {
      const body: ILoginRequest = req.body;

      if (!body.email) {
        throw new ValidationError("Email is required");
      }

      // If no OTP provided, send OTP to email
      if (!body.otp) {
        const otpStartTime = Date.now();
        await this.authService.sendOTPEmail(body.email);
        const otpDuration = Date.now() - otpStartTime;
        
        logger.logAuth('SEND_OTP', body.email, true);
        logger.logPerformance('Send OTP Email', otpDuration);
        
        return responseManager.success(
          res,
          {},
          "OTP sent to email successfully"
        );
      }

      // Validate OTP
      const validateStartTime = Date.now();
      const valid = await this.authService.validateOTP(body.email, body.otp);
      const validateDuration = Date.now() - validateStartTime;
      
      logger.logPerformance('Validate OTP', validateDuration);
      
      if (!valid) {
        logger.logAuth('VALIDATE_OTP', body.email, false);
        throw new ValidationError("Invalid OTP");
      }

      logger.logAuth('VALIDATE_OTP', body.email, true);

      // Get or create user
      let user = await this.userUseCase.getUserByEmail(body.email);
      if (!user) {
        // Create new user if doesn't exist
        const userId = await this.userUseCase.createUser({
          email: body.email,
        });

        user = await this.userUseCase.getUserById(userId);
        if (!user) {
          return responseManager.error(res, "Failed to create user");
        }
      }

      if (!user || user.id === undefined) {
        return responseManager.validationError(
          res,
          "Failed to create user: ID is missing."
        );
      }

      // Create auth tokens
      const tokens = await this.authService.createAuthTokens({
        id: user.id,
        email: user.email,
      });

      return responseManager.success(
        res,
        {
          user: {
            id: user.id,
            email: user.email,
            first_name: user.first_name,
            last_name: user.last_name,
            is_verified: user.is_verified,
          },
          tokens: {
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
          },
        },
        "Login successful"
      );
    } catch (error: any) {
      const totalTime = Date.now() - startTime;
      logger.logAuth('LOGIN_FAILED', email || 'unknown', false);
      logger.error(`Login failed for ${email}`, error);
      responseManager.handleError(res, error);
    }
  };

  // Refresh token endpoint
  refresh = async (req: Request, res: Response) => {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        throw new ValidationError("Refresh token is required");
      }

      const tokens = await this.authService.refreshAccessToken(refreshToken);

      if (!tokens) {
        return responseManager.unauthorized(res, "Invalid refresh token");
      }

      return responseManager.success(
        res,
        {
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
        },
        "Tokens refreshed successfully"
      );
    } catch (error) {
      if (error instanceof ValidationError) {
        return responseManager.validationError(res, error.message);
      }
      console.error("Refresh error:", error);
      return responseManager.error(res, "Token refresh failed");
    }
  };

  // Logout endpoint (stateless JWT - client discards tokens)
  logout = async (req: Request, res: Response) => {
    try {
      const authReq = req as AuthenticatedRequest; 
      const userId = authReq.user?.id;

      if (!userId) {
        return responseManager.unauthorized(res, "User not authenticated");
      }

      // For stateless JWT, logout is handled client-side by discarding tokens
      // Server doesn't need to track anything
      return responseManager.success(res, {}, "Logged out successfully");
    } catch (error) {
      console.error("Logout error:", error);
      return responseManager.error(res, "Logout failed");
    }
  };
}

export default AuthHandler;
