import { Controller, Get, Post, HttpException, HttpCode, Body, Req, UseGuards, Res, Put, UseInterceptors, UploadedFile } from '@nestjs/common';
import { AuthService } from './auth.service';
import { StatusCode } from '../common/enums/api.enum';
import { ChangePasswordRequest, LoginRequest, RegisterRequest, ResendVerificationEmailRequest, ResetPasswordRequest, UpdateProfileRequest, VefifyEmailRequest } from './dto/user.dto';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiCookieAuth, ApiConsumes } from '@nestjs/swagger';
import { Response, Request } from 'express';
import { Cookies } from '../common/decorators/cookies.decorator';
import { FileInterceptor } from '@nestjs/platform-express';

interface AuthRequest extends Request {
    user?: any;
    headers: {
        authorization?: string;
        [key: string]: string | undefined;
    };
}

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Post('register')
    @HttpCode(201)
    @ApiOperation({ summary: 'Đăng ký người dùng mới' })
    @ApiBody({ type: RegisterRequest })
    async register(@Body() body: RegisterRequest) {
        if (body.password !== body.confirmPassword) {
            throw new HttpException('Email và xác nhận email không khớp', StatusCode.BAD_REQUEST);
        }
        const newUser = await this.authService.register(body);
        return { 
            data: newUser 
        };
    }

    @Post('login')
    @HttpCode(200)
    @ApiOperation({ summary: 'Đăng nhập' })
    @ApiBody({ type: LoginRequest })
    async login(@Body () body: LoginRequest, @Res({ passthrough: true }) response: Response) {
        const { user, access_token, refresh_token } = await this.authService.login(body);

        response.cookie('refresh_token', refresh_token, {
            httpOnly: true,
            secure: false,
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        return {
            data: {
                user,
                access_token,
            }
        };
    }

    @Get('google')
    @UseGuards(AuthGuard('google'))
    async GoogleAuth() {}

    @Get('google/callback')
    @UseGuards(AuthGuard('google'))
    async googleAuthCallback(
        @Req() req, 
        @Res() res: Response
    ) {
        const { access_token, refresh_token } = await this.authService.googleLogin(req.user);
        const frontendUrl = process.env.FRONTEND_URL

        res.cookie('refresh_token', refresh_token, {
            httpOnly: true,
            secure: false,
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        res.setHeader('Location', `${frontendUrl}/auth/callback?access_token=${access_token}`);
        res.status(302);
        res.end();
    }

    @Post('resend-verification-email')
    @HttpCode(200)
    @ApiOperation({ summary: 'Gửi lại email xác thực' })
    @ApiBody({ type: ResendVerificationEmailRequest })
    async resendVerificationEmail(@Body() body: ResendVerificationEmailRequest) {
        const result = await this.authService.resendVerificationEmail(body.email);
        return {
            message: result.message
        }
    }

    @Post('send-reset-password-email')
    @HttpCode(200)
    @ApiOperation({ summary: 'Gửi email đặt lại mật khẩu' })
    @ApiBody({ type: String })
    async sendResetPasswordEmail (@Body() body: ResendVerificationEmailRequest) {
        const result = await this.authService.sendResetPassowrdToken(body.email);
        return {
            message: result.message
        }
    }

    @Post('reset-password/:token')
    @HttpCode(200)
    @ApiOperation({ summary: 'Đặt lại mật khẩu' })
    @ApiBody({ type: String })
    async resetPassword(@Body() body: ResetPasswordRequest, @Req() req: Request) {
        const { email, newPassword, confirmPassword } = body;
        const { token } = req.params as { token: string };

        if (!newPassword || !confirmPassword) {
            throw new HttpException('New password and confirm password are required', StatusCode.BAD_REQUEST);

        }

        const result = await this.authService.resetPassword(token, email, newPassword);

        return {
            message: result.message
        }
    }

    @Post('verify-email/:token')
    @HttpCode(200)
    @ApiOperation({ summary: 'Xác thực email' })
    @ApiBody({ type: String })
    async verifyEmail(@Body() body: VefifyEmailRequest, @Req() req: Request) {
        const { token } = req.params as { token: string };
        const result = await this.authService.verifyEmail(body.email, token);
        return {
            message: result.message
        }
    }

    @Post('refresh')
    @HttpCode(200)
    @ApiOperation({ summary: 'Làm mới access token' })
    @ApiCookieAuth('refresh_token')
    async refresh(
        @Res({ passthrough: true }) response: Response,
        @Cookies('refresh_token') refreshToken: string
    ) {
        if (!refreshToken) {
            throw new HttpException('Missing refresh token', StatusCode.BAD_REQUEST);
        }
        const { access_token, refresh_token } = await this.authService.refresh(refreshToken);

        response.cookie('refresh_token', refresh_token, {
            httpOnly: true,
            secure: false,
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        return {
            data: {
                access_token,
            }
        };
    }

    @Post('logout')
    @UseGuards(AuthGuard('jwt'))
    @ApiOperation({ summary: 'Đăng xuất' })
    @ApiBearerAuth('access-token')
    @ApiCookieAuth('refresh_token')
    async logout(
        @Res({ passthrough: true }) response: Response,
        @Cookies('refresh_token') refreshToken: string,
        @Req() req: AuthRequest
    ) {
        if (!refreshToken) {
            throw new HttpException('Missing refresh token', StatusCode.BAD_REQUEST);
        }
        const tokenToUse = refreshToken

        if (!tokenToUse) {
            throw new HttpException('Missing refresh token', StatusCode.BAD_REQUEST);
        }

        const authHeader = req.headers.authorization;
        const accessToken = authHeader?.split(' ')[1];

        if (!accessToken) {
            throw new HttpException('Missing access token', StatusCode.BAD_REQUEST);
        }

        await this.authService.logout(accessToken, tokenToUse);

        response.clearCookie('refresh_token', {
            httpOnly: true,
            secure: false,
            sameSite: 'lax',
        });

        return {
            message: 'Đăng xuất thành công'
        };
    }

    @Get('me')
    @UseGuards(AuthGuard('jwt'))
    @ApiOperation({ summary: 'Lấy thông tin người dùng hiện tại' })
    @ApiBearerAuth('access-token')
    async getMe(@Req() req: AuthRequest) {
        if (!req.user) {
            throw new HttpException('Unauthorized', StatusCode.UNAUTHORIZED);
        }

        const data = await this.authService.me(req.user.userId)
        
        return {
            data: data
        };
    }

    @Post('change-password')
    @UseGuards(AuthGuard('jwt'))
    @HttpCode(200)
    @ApiOperation({ summary: 'Thay đổi mật khẩu' })
    @ApiBearerAuth('access-token')
    @ApiBody({ type: String })
    async changePassword (
        @Body() body: ChangePasswordRequest,
        @Req() req: AuthRequest
    ) {
        const { currentPassword, newPassword, confirmPassword } = body;

        if (newPassword !== confirmPassword) {
            throw new HttpException('New password and confirm password do not match', StatusCode.BAD_REQUEST);
        }

        const userId = req.user.userId;
        const result = await this.authService.changePassword(userId, currentPassword, newPassword);

        return {
            message: result.message
        }
    }

    @Put('update-profile')
    @UseGuards(AuthGuard('jwt'))
    @HttpCode(200)
    @ApiOperation({ summary: 'Cập nhật thông tin người dùng' })
    @ApiBearerAuth('access-token')
    @ApiConsumes('multipart/form-data')
    @ApiBody({ type: UpdateProfileRequest })
    @UseInterceptors(FileInterceptor('avatar'))
    async updateProfile (
        @Body() body: UpdateProfileRequest,
        @UploadedFile() avatar: Express.Multer.File,
        @Req() req: AuthRequest
    ) {
        const userId = req.user.userId;
        const data = {
            ...body,
            avatar
        };
        const user = await this.authService.updateProfile(userId, data);

        return {
            data: {
                user
            }
        }
    }
}
