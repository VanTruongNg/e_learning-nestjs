import { HttpException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './schema/user.schema';
import { StatusCode } from 'src/common/enums/api.enum';
import { LoginRequest, RegisterRequest } from './dto/user.dto';
import { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import { ulid } from 'ulid';

@Injectable()
export class AuthService {
    constructor(
        @InjectModel(User.name) private readonly userSchema: Model<UserDocument>,
        private readonly jwtService: JwtService,
    ){}

    async findAllUsers(page: number, limit: number): Promise<{users: UserDocument[], total: number}> {
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
            return newUser;
        } catch (error) {
            throw error instanceof HttpException ? error : new HttpException("Lỗi không xác định", StatusCode.INTERNAL_SERVER);
        }
    }

    async login(loginRequest: LoginRequest): Promise<{user: UserDocument, access_token: string}> {
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

            const payload = {
                sub: user._id.toString(),
                email: user.email,
                jti: ulid()
            };

            const access_token = this.jwtService.sign(payload);

            return {
                user,
                access_token
            };
        } catch (error) {
            throw error instanceof HttpException ? error : new HttpException("Lỗi không xác định", StatusCode.INTERNAL_SERVER);
        }
    }
}
