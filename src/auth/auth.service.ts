import { HttpException, Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './schema/user.schema';
import { StatusCode } from 'src/common/enums/api.enum';
import { LoginRequest, RegisterRequest, UpdateProfileRequest } from './dto/user.dto';
import { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import { ulid } from 'ulid';
import { RedisService } from '../redis/redis.service';
import { LoginResponse, SessionData, TokenResponse, UsersResponse } from './interfaces/auth.interface';
import { createSessionKey, createBlacklistKey } from '../config/redis.config';
import { MailService } from 'src/mail/mail.service';
import { Token, TokenDocument, TokenType } from './schema/token.schema';
import { generateToken } from './utils/generate-token.util';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';

@Injectable()
export class AuthService {
    constructor(
        @InjectModel(User.name) private readonly userSchema: Model<UserDocument>,
        @InjectModel(Token.name) private readonly tokenSchema: Model<TokenDocument>,
        @Inject('JWT_ACCESS_SERVICE') private readonly jwtAccessService: JwtService,
        @Inject('JWT_REFRESH_SERVICE') private readonly jwtRefreshService: JwtService,
        private readonly redisService: RedisService,
        private readonly mailService: MailService,
        private readonly cloudinaryService: CloudinaryService,
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
                sub: user._id.toString(),
                type: 'refresh'
            };

            const access_token = this.jwtAccessService.sign(accessPayload);
            const refresh_token = this.jwtRefreshService.sign(refreshPayload);

            const sessionData: SessionData = {
                userId: user._id.toString(),
                refreshToken: refresh_token,
                accessTokenJTI: jti,
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
            const token = await generateToken();

            const newToken = new this.tokenSchema({
                userId: user._id,
                token: token,
                type: TokenType.VERIFICATION,
                createdAt: Date.now(),
                expiresAt: new Date(Date.now() + 15 * 60 * 1000)
            });
            await newToken.save();

            return {
                verificationCode: token
            };
        } catch (error) {
            throw error instanceof HttpException ? error : new HttpException("Lỗi không xác định", StatusCode.INTERNAL_SERVER);
        }
    }

    private async createResetPasswordToken(user: UserDocument): Promise<{resetPasswordCode: string}> {
        try {
            const token = await generateToken();

            const newToken = new this.tokenSchema({
                userId: user._id,
                token: token,
                type: TokenType.RESET_PASSWORD,
                createdAt: Date.now(),
                expiresAt: new Date(Date.now() + 15 * 60 * 1000)
            });
            await newToken.save();

            return {
                resetPasswordCode: token
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

            const user = await this.userSchema.findOne({ email: email });
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
                    StatusCode.BAD_REQUEST
                );
            }

            if (!user.isVerified) {
                throw new HttpException(
                    "Tài khoản chưa được xác thực",
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

    async googleLogin(googleUser: any) {
        try {
            const { email, firstName, lastName, photo } = googleUser;
            let user = await this.userSchema.findOne({ email });
            
            if (!user) {
                user = new this.userSchema({
                    email,
                    username: `${firstName} ${lastName}`,
                    isVerified: true,
                    avatarUrl: photo,
                    password: null,
                });
                await user.save();
            } else {
                if (!user.avatarUrl) {
                    user.avatarUrl = photo;
                }
                if (user.isVerified === false) {
                    user.isVerified = true;
                }
                await user.save();
            }
    
            const tokens = await this.generateTokens(user);
            
            return {
                user,
                ...tokens
            };
        } catch (error) {
            throw error instanceof HttpException 
                ? error 
                : new HttpException("Lỗi không xác định", StatusCode.INTERNAL_SERVER);
        }
    }

    async verifyEmail(email: string, token: string): Promise<{message: string}> {
        try {
            const user = await this.userSchema.findOne({ email });
            if (!user) {
                throw new HttpException(
                    "Người dùng không tồn tại",
                    StatusCode.NOT_FOUND
                );
            }
            if (user.isVerified) {
                throw new HttpException(
                    "Tài khoản đã được xác thực",
                    StatusCode.BAD_REQUEST
                );
            }

            const verificationToken = await this.tokenSchema.findOne({
                userId: user._id,
                token: token,
                type: TokenType.VERIFICATION,
                expiresAt: { $gt: Date.now() }
            });
            if (!verificationToken) {
                throw new HttpException(
                    "Mã xác thực không hợp lệ hoặc đã hết hạn",
                    StatusCode.BAD_REQUEST
                );
            }
            user.isVerified = true;
            await user.save();

            await this.tokenSchema.deleteMany({
                userId: user._id,
                type: TokenType.VERIFICATION,
            });

            return {
                message: "Tài khoản đã được xác thực thành công"
            }
        } catch (error) {
            throw error instanceof HttpException ? error : new HttpException("Lỗi không xác định", StatusCode.INTERNAL_SERVER);
        }
    }

    async resendVerificationEmail(email: string): Promise<{message: string}> {
        try {
            const user = await this.userSchema.findOne({ email });
            if (!user) {
                throw new HttpException(
                    "Người dùng không tồn tại",
                    StatusCode.NOT_FOUND
                );
            }

            if (user.isVerified) {
                throw new HttpException(
                    "Tài khoản đã được xác thực",
                    StatusCode.BAD_REQUEST
                );
            }

            const token = await this.tokenSchema.findOne({
                userId: user._id,
                type: TokenType.VERIFICATION,
                expiresAt: { $gt: Date.now() }
            });

            if (token) {
                await this.mailService.sendVerificationEmail(user.email, {
                    name: user.username,
                    token: token.token,
                });

                return {
                    message: "Email xác thực đã được gửi lại"
                }
            }

            const newToken = await this.createVerificationToken(user);
            await this.mailService.sendVerificationEmail(user.email, {
                name: user.username,
                token: newToken.verificationCode,
            });

            return {
                message: "Email xác thực đã được gửi lại"
            }
        } catch (error) {
            throw error instanceof HttpException ? error : new HttpException("Lỗi không xác định", StatusCode.INTERNAL_SERVER);
        }
    }

    async sendResetPassowrdToken(email: string): Promise<{message: string}> {
        try {
            const user = await this.userSchema.findOne({ email })
            if (!user) {
                throw new HttpException(
                    "Người dùng không tồn tại",
                    StatusCode.NOT_FOUND
                );
            }

            const token = await this.tokenSchema.findOne({
                userId: user._id,
                type: TokenType.RESET_PASSWORD,
                expiresAt: { $gt: Date.now() }
            });

            if (token) {
                await this.mailService.sendResetPasswordEmail(user.email, {
                    name: user.username,
                    token: token.token,
                });

                return {
                    message: "Email đặt lại mật khẩu đã được gửi lại"
                }
            }

            const newToken = await this.createResetPasswordToken(user);
            await this.mailService.sendResetPasswordEmail(user.email, {
                name: user.username,
                token: newToken.resetPasswordCode,
            })

            return {
                message: "Email đặt lại mật khẩu đã được gửi lại"
            }

        } catch (error) {
            throw error instanceof HttpException ? error : new HttpException("Lỗi không xác định", StatusCode.INTERNAL_SERVER);
        }
    }

    async resetPassword( token: string, email: string, newPassword: string): Promise<{message: string}> {
        try {
            const user = await this.userSchema.findOne({ email });
            if (!user) {
                throw new HttpException(
                    "Người dùng không tồn tại",
                    StatusCode.NOT_FOUND
                );
            }

            const resetPasswordToken = await this.tokenSchema.findOne({
                userId: user._id,
                token: token,
                type: TokenType.RESET_PASSWORD,
                expiresAt: { $gt: Date.now() }
            });
            if (!resetPasswordToken) {
                throw new HttpException(
                    "Mã đặt lại mật khẩu không hợp lệ hoặc đã hết hạn",
                    StatusCode.BAD_REQUEST
                );
            }

            const isOldPasswordSame = await user.comparePassword(newPassword);
            if (isOldPasswordSame) {
                throw new HttpException(
                    "Mật khẩu mới không được giống mật khẩu cũ",
                    StatusCode.BAD_REQUEST
                );
            }

            user.password = newPassword;
            user.isVerified = true;
            await user.save();

            await this.tokenSchema.deleteMany({
                userId: user._id,
                type: TokenType.RESET_PASSWORD,
            });

            return {
                message: "Mật khẩu đã được đặt lại thành công"
            }
        } catch (error) {
            throw error instanceof HttpException ? error : new HttpException("Lỗi không xác định", StatusCode.INTERNAL_SERVER);
        }
    }

    async refresh(refreshToken: string): Promise<TokenResponse> {
        try {
            const decoded = this.jwtRefreshService.verify(refreshToken) as { sessionId: string, sub: string };

            if (!decoded?.sessionId) {
                throw new HttpException(
                    "Token không hợp lệ",
                    StatusCode.UNAUTHORIZED
                );
            }
            
            const sessionString = await this.redisService.get(createSessionKey(decoded.sessionId));
            if (!sessionString) {
                throw new HttpException(
                    "Session không hợp lệ hoặc đã hết hạn",
                    StatusCode.UNAUTHORIZED
                );
            }

            const sessionData = typeof sessionString === 'string'
                ? JSON.parse(sessionString)
                : sessionString as SessionData;

            const user = await this.userSchema.findById(sessionData.userId);
            if (!user) {
                throw new HttpException(
                    "Người dùng không tồn tại",
                    StatusCode.UNAUTHORIZED
                );
            }

            const accessTokenExp = 15 * 60;
            await this.redisService.set(
                createBlacklistKey(sessionData.accessTokenJTI),
                'true',
                accessTokenExp
            )

            await this.redisService.del(createSessionKey(decoded.sessionId));
            return await this.generateTokens(user);
        } catch (error) {
            throw error instanceof HttpException ? error : new HttpException("Lỗi không xác định", StatusCode.INTERNAL_SERVER);
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

    async changePassword (userID: string, oldPassword: string, newPassword: string): Promise<{message: string}> {
        try {
            const user = await this.userSchema.findById(userID).exec();
            if (!user) {
                throw new HttpException(
                    "Người dùng không tồn tại",
                    StatusCode.NOT_FOUND
                );
            }

            const isPasswordValid = await user.comparePassword(oldPassword);
            if (!isPasswordValid) {
                throw new HttpException(
                    "Mật khẩu cũ không đúng",
                    StatusCode.UNAUTHORIZED
                );
            }

            user.password = newPassword;
            await user.save();

            return {
                message: "Đổi mật khẩu thành công"
            }
        } catch (error) {
            throw error instanceof HttpException ? error : new HttpException("Lỗi không xác định", StatusCode.INTERNAL_SERVER);
        }
    }

    async updateProfile (userId: string, data: UpdateProfileRequest): Promise<UserDocument> {
        try {
            const user = await this.userSchema.findById(userId).exec();
            if (!user) {
                throw new HttpException(
                    "Người dùng không tồn tại",
                    StatusCode.NOT_FOUND
                );
            }

            if (data.username) {
                user.username = data.username;
            }
            
            if (data.avatar) {
                const url = await this.cloudinaryService.uploadFileAsync(data.avatar, {
                    folder: 'avatars',
                    fileName: userId
                });
                user.avatarUrl = url;
            }

            await user.save();
            return user;
        } catch (error) {
            throw error instanceof HttpException ? error : new HttpException("Lỗi không xác định", StatusCode.INTERNAL_SERVER);
        }
    }
}
