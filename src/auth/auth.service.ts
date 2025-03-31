import { HttpException, Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './schema/user.schema';
import { StatusCode } from 'src/common/enums/api.enum';
import { LoginRequest, RegisterRequest } from './dto/user.dto';
import { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import { ulid } from 'ulid';
import { RedisService } from '../redis/redis.service';
import { LoginResponse, SessionData, TokenResponse, UsersResponse } from './interfaces/auth.interface';
import { createSessionKey, createBlacklistKey } from '../config/redis.config';
import { MailService } from 'src/mail/mail.service';
import { Token, TokenType } from './schema/token.schema';
import { generateVerificationCode } from './utils/generate-token.util';

@Injectable()
export class AuthService {
    constructor(
        @InjectModel(User.name) private readonly userSchema: Model<UserDocument>,
        @InjectModel(Token.name) private readonly tokenSchema: Model<Token>,
        @Inject('JWT_ACCESS_SERVICE') private readonly jwtAccessService: JwtService,
        @Inject('JWT_REFRESH_SERVICE') private readonly jwtRefreshService: JwtService,
        private readonly redisService: RedisService,
        private readonly mailService: MailService,
    ){}

    private async generateTokens(user: UserDocument): Promise<TokenResponse> {
        try {
            const sessionId = ulid();
            const jti = ulid();

            const accessPayload = {
                sub: user._id.toString(),
                email: user.email,
                jti
            };
            
            const refreshPayload = {
                sessionId,
                sub: user._id.toString()
            };

            const access_token = this.jwtAccessService.sign(accessPayload);
            const refresh_token = this.jwtRefreshService.sign(refreshPayload);

            const sessionData: SessionData = {
                userId: user._id.toString(),
                refreshToken: refresh_token,
                createdAt: Date.now()
            };

            await this.redisService.set(
                createSessionKey(sessionId),
                JSON.stringify(sessionData),
                7 * 24 * 60 * 60
            );

            return {
                access_token,
                refresh_token
            };
        } catch (error) {
            throw error instanceof HttpException ? error : new HttpException("Lỗi không xác định", StatusCode.INTERNAL_SERVER);
        }
    }

    private async createVerificationToken(user: UserDocument): Promise<{verificationCode: string}> {
        try {
            const token = await generateVerificationCode();

            const newToken = new this.tokenSchema({
                userId: user._id,
                token: token,
                type: TokenType.VERIFICATION,
                createdAt: Date.now(),
                isUsed: false
            });
            await newToken.save();

            return {
                verificationCode: token
            };
        } catch (error) {
            throw error instanceof HttpException ? error : new HttpException("Lỗi không xác định", StatusCode.INTERNAL_SERVER);
        }
    }

    async findAllUsers(page: number, limit: number): Promise<UsersResponse> {
        try {
            const skip = (page - 1) * limit;
            
            const total = await this.userSchema.countDocuments();
            
            if (total === 0) {
                throw new HttpException(
                    "Không có người dùng nào trong hệ thống",
                    StatusCode.NOT_FOUND
                );
            }
            
            if (skip >= total) {
                throw new HttpException(
                    `Trang ${page} vượt quá số trang hiện có`,
                    StatusCode.BAD_REQUEST
                );
            }

            const users = await this.userSchema.find()
                .skip(skip)
                .limit(limit)
                .select('-password')
                .exec();

            return {
                users,
                total
            };
            
        } catch (error) {
            throw error instanceof HttpException ? error : new HttpException("Lỗi không xác định", StatusCode.INTERNAL_SERVER);
        }
    }

    async register(user: RegisterRequest): Promise<UserDocument> {
        try {
            const { username, password, email } = user;

            const existingUser = await this.userSchema.findOne({ email });
            if (existingUser) {
                throw new HttpException(
                    "Email đã tồn tại",
                    StatusCode.BAD_REQUEST
                );
            }

            const newUser = new this.userSchema({
                username,
                email,
                password,
            });
            
            await newUser.save();

            const token = await this.createVerificationToken(newUser);
            if (!token) {
                throw new HttpException(
                    "Lỗi tạo mã xác thực",
                    StatusCode.INTERNAL_SERVER
                );
            }
            await this.mailService.sendVerificationEmail(newUser.email, {
                name: newUser.username,
                token: token.verificationCode,
            });
            return newUser;
        } catch (error) {
            throw error instanceof HttpException ? error : new HttpException("Lỗi không xác định", StatusCode.INTERNAL_SERVER);
        }
    }

    async login(loginRequest: LoginRequest): Promise<LoginResponse> {
        try {
            const { email, password } = loginRequest;

            const user = await this.userSchema.findOne({ email });
            if (!user) {
                throw new HttpException(
                    "Email hoặc mật khẩu không đúng",
                    StatusCode.NOT_FOUND
                );
            }

            const isPasswordValid = await user.comparePassword(password);
            if (!isPasswordValid) {
                throw new HttpException(
                    "Email hoặc mật khẩu không đúng",
                    StatusCode.UNAUTHORIZED
                );
            }

            const tokens = await this.generateTokens(user);

            return {
                user,
                ...tokens
            };
        } catch (error) {
            throw error instanceof HttpException ? error : new HttpException("Lỗi không xác định", StatusCode.INTERNAL_SERVER);
        }
    }

    async refresh(refreshToken: string): Promise<TokenResponse> {
        try {
            const decoded = this.jwtRefreshService.verify(refreshToken) as { sessionId: string, sub: string };
            
            const sessionString = await this.redisService.get(createSessionKey(decoded.sessionId));
            if (!sessionString || typeof sessionString !== 'string') {
                throw new HttpException(
                    "Session không hợp lệ hoặc đã hết hạn",
                    StatusCode.UNAUTHORIZED
                );
            }

            const sessionData = JSON.parse(sessionString) as SessionData;
            const user = await this.userSchema.findById(sessionData.userId);
            if (!user) {
                throw new HttpException(
                    "Người dùng không tồn tại",
                    StatusCode.UNAUTHORIZED
                );
            }

            await this.redisService.del(createSessionKey(decoded.sessionId));

            return await this.generateTokens(user);
        } catch (error) {
            throw error instanceof HttpException ? error : new HttpException("Token không hợp lệ", StatusCode.UNAUTHORIZED);
        }
    }

    async me (userId: string): Promise<UserDocument> {
        try {
            const user = await this.userSchema.findById(userId).exec();
            if (!user) {
                throw new HttpException(
                    "Người dùng không tồn tại",
                    StatusCode.NOT_FOUND
                );
            }
            return user;
        } catch (error) {
            throw error instanceof HttpException ? error : new HttpException("Lỗi không xác định", StatusCode.INTERNAL_SERVER);
        }
    }

    async logout(accessToken: string, refreshToken: string): Promise<void> {
        try {
            const decoded = this.jwtRefreshService.decode(refreshToken) as { sessionId: string };
            if (!decoded?.sessionId) {
                throw new HttpException(
                    "Token không hợp lệ",
                    StatusCode.BAD_REQUEST
                );
            }

            await this.redisService.del(createSessionKey(decoded.sessionId));

            const { exp, jti } = this.jwtAccessService.decode(accessToken) as { exp: number, jti: string };
            const timeToExp = exp - Math.floor(Date.now() / 1000);

            if (timeToExp > 0) {
                await this.redisService.set(
                    createBlacklistKey(jti),
                    'true',
                    timeToExp
                );
            }
        } catch (error) {
            throw error instanceof HttpException ? error : new HttpException("Lỗi không xác định", StatusCode.INTERNAL_SERVER);
        }
    }
}
