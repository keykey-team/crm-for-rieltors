import { Request, Response } from 'express';
import { inject, injectable } from 'tsyringe';
import { BaseController } from '../../../common/infrastructure/BaseController';
import { validateDto } from '../../../common/infrastructure/validation';
import { UnauthorizedError } from '../../../common/errors';
import { AuthService } from '../services/AuthService';
import { LoginDto } from '../models/dto/LoginDto';
import { RegisterDto } from '../models/dto/RegisterDto';
import { env } from '../../../app/config/env';

const AUTH_COOKIE_NAME = 'crm_token';

@injectable()
export class AuthController extends BaseController {
  constructor(@inject(AuthService) private readonly authService: AuthService) {
    super();
  }

  register = async (req: Request, res: Response) => {
    const payload = await validateDto(RegisterDto, req.body);
    const { user, token } = await this.authService.register(payload);
    this.setAuthCookie(res, token);
    return this.ok(res, user, 201);
  };

  login = async (req: Request, res: Response) => {
    const payload = await validateDto(LoginDto, req.body);
    const { user, token } = await this.authService.login(payload);
    this.setAuthCookie(res, token);
    return this.ok(res, user);
  };

  session = async (req: Request, res: Response) => {
    const user = req.user;
    if (!user) {
      throw new UnauthorizedError();
    }

    const sessionUser = await this.authService.getSession(user.id);
    return this.ok(res, sessionUser);
  };

  logout = async (_req: Request, res: Response) => {
    res.clearCookie(AUTH_COOKIE_NAME, this.cookieOptions());

    return this.ok(res, { success: true });
  };

  private setAuthCookie(res: Response, token: string): void {
    res.cookie(AUTH_COOKIE_NAME, token, {
      ...this.cookieOptions(),
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
  }

  private cookieOptions() {
    const isProd = env.nodeEnv === 'production';

    return {
      httpOnly: true,
      sameSite: isProd ? ('none' as const) : ('lax' as const),
      secure: isProd,
      path: '/',
    };
  }
}
