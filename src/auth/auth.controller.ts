import { Controller, Get, Post, HttpException, HttpCode, Body, Req, UseGuards, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { StatusCode } from '../common/enums/api.enum';
import { LoginRequest, RegisterRequest } from './dto/user.dto';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiCookieAuth } from '@nestjs/swagger';
import { Response, Request } from 'express';
import { Cookies } from '../common/decorators/cookies.decorator';

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
    async register(@Body() user: RegisterRequest) {
        const newUser = await this.authService.register(user);
        return { data: newUser };
    }

    @Post('login')
    @HttpCode(200)
    @ApiOperation({ summary: 'Đăng nhập' })
    @ApiBody({ type: LoginRequest })
    async login(
        @Res({ passthrough: true }) response: Response,
        @Body() loginRequest: LoginRequest
    ) {
        const { user, access_token, refresh_token } = await this.authService.login(loginRequest);

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

    @Post('refresh')
    @HttpCode(200)
    @ApiOperation({ summary: 'Làm mới access token' })
    @ApiCookieAuth('refresh_token')
    async refresh(
        @Res({ passthrough: true }) response: Response,
        @Cookies('refresh_token') refreshToken: string
    ) {
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
        const tokenToUse = refreshToken || req.body.refresh_token;

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

        const data = req.user.userId ? await this.authService.me(req.user.userId) : null;
        
        return {
            data
        };
    }
}
