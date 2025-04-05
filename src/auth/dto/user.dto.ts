import { IsEmail, IsNotEmpty, IsString, MinLength, ValidateIf } from "class-validator";

export class RegisterRequest {
    @IsNotEmpty({ message: "Username không được để trống" })
    @IsString({ message: "Username phải là chuỗi" })
    readonly username: string;

    @IsNotEmpty({ message: "Email không được để trống" })
    @IsEmail({}, { message: "Email không hợp lệ" })
    readonly email: string;

    @IsNotEmpty({ message: "Mật khẩu không được để trống" })
    @IsString({ message: "Mật khẩu phải là chuỗi" })
    @MinLength(6, { message: "Mật khẩu phải có ít nhất 6 ký tự" })
    readonly password: string;

    @IsNotEmpty({ message: "Xác nhận mật khẩu không được để trống" })
    @IsString({ message: "Xác nhận mật khẩu phải là chuỗi" })
    readonly confirmPassword: string;
}

export class LoginRequest {
    @IsNotEmpty({ message: "Email không được để trống" })
    @IsEmail({}, { message: "Email không hợp lệ" })
    readonly email: string;

    @IsNotEmpty({ message: "Mật khẩu không được để trống" })
    @IsString({ message: "Mật khẩu phải là chuỗi" })
    readonly password: string;
}

export class ResendVerificationEmailRequest {
    @IsNotEmpty({ message: "Email không được để trống" })
    @IsEmail({}, { message: "Email không hợp lệ" })
    readonly email: string;
}

export class SendResetPasswordEmailRequest {
    @IsNotEmpty({ message: "Email không được để trống" })
    @IsEmail({}, { message: "Email không hợp lệ" })
    readonly email: string;
}

export class ResetPasswordRequest {
    @IsNotEmpty({ message: "Email không được để trống" })
    @IsEmail({}, { message: "Email không hợp lệ" })
    readonly email: string;

    @IsNotEmpty({ message: "Mật khẩu không được để trống" })
    @IsString({ message: "Mật khẩu phải là chuỗi" })
    @MinLength(6, { message: "Mật khẩu phải có ít nhất 6 ký tự" })
    readonly newPassword: string;

    @IsNotEmpty({ message: "Xác nhận mật khẩu không được để trống" })
    @IsString({ message: "Xác nhận mật khẩu phải là chuỗi" })
    readonly confirmPassword: string;
}

export class ChangePasswordRequest {
    @IsNotEmpty({ message: "Mật khẩu hiện tại không được để trống" })
    @IsString({ message: "Mật khẩu hiện tại phải là chuỗi" })
    readonly currentPassword: string;

    @IsNotEmpty({ message: "Mật khẩu mới không được để trống" })
    @IsString({ message: "Mật khẩu mới phải là chuỗi" })
    @MinLength(6, { message: "Mật khẩu mới phải có ít nhất 6 ký tự" })
    readonly newPassword: string;

    @IsNotEmpty({ message: "Xác nhận mật khẩu không được để trống" })
    @IsString({ message: "Xác nhận mật khẩu phải là chuỗi" })
    readonly confirmPassword: string;
}

export class UpdateProfileRequest {
    @IsString({ message: "Username phải là chuỗi" })
    @ValidateIf((o) => o.username !== undefined)
    readonly username?: string;
    
    avatar?: Express.Multer.File;
}

export class VefifyEmailRequest {
    @IsNotEmpty({ message: "Email không được để trống" })
    @IsEmail({}, { message: "Email không hợp lệ" })
    readonly email: string;
}