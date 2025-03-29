import { Controller, Get, Post, Query, HttpException, HttpCode, Body, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { StatusCode } from '../common/enums/api.enum';
import { LoginRequest, RegisterRequest } from './dto/user.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Get('users')
    async getAllUsers(
        @Query('page') page: string = '1',
        @Query('limit') limit: string = '15'
    ) {
        const pageNumber = parseInt(page);
        const limitNumber = parseInt(limit);

        if (isNaN(pageNumber) || isNaN(limitNumber)) {
            throw new HttpException(
                'Page và limit phải là số',
                StatusCode.BAD_REQUEST
            );
        }

        if (pageNumber < 1 || limitNumber < 1) {
            throw new HttpException(
                'Page và limit phải là số nguyên lớn hơn 0',
                StatusCode.BAD_REQUEST
            );
        }

        const { users, total } = await this.authService.findAllUsers(pageNumber, limitNumber);
        return {
            data: users,
            metadata: {
                page: pageNumber,
                limit: limitNumber,
                total,
                totalPages: Math.ceil(total / limitNumber)
            }
        };
    }

    @Post('register')
    @HttpCode(201)
    async register(@Body() user: RegisterRequest) {
        const { password, confirmPassword } = user;

        if (password !== confirmPassword) {
            throw new HttpException(
                'Mật khẩu không khớp',
                StatusCode.BAD_REQUEST
            );
        }

        const newUser = await this.authService.register(user);
        return {
            data: newUser
        };
    }

    @Post('login')
    @HttpCode(200)
    async login(@Body() user: LoginRequest) {
        const result = await this.authService.login(user);
        return {
            data: result
        };
    }

    @Get('me') 
    @UseGuards(AuthGuard()) // Sử dụng AuthGuard để bảo vệ route này
    async getMe(@Req() req: any) {
        const user = req.user;
        if (!user) {
            throw new HttpException(
                'Người dùng không tồn tại',
                StatusCode.UNAUTHORIZED
            );
        }
        return {
            data: user
        };
    }
}
