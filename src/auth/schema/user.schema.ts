import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Model } from "mongoose";
import * as bcrypt from "bcrypt";

export enum Role {
    ADMIN = 'admin',
    USER = 'user',
}

export type UserDocument = User & Document & {
    comparePassword(candidatePassword: string): Promise<boolean>;
};

export type UserModel = Model<UserDocument>;

@Schema({
    timestamps: true,
    toJSON: {
        transform: (doc, ret) => {
            delete ret.password;
            return ret;
        }
    }
})
export class User {
    @Prop({ required: true })
    username: string;

    @Prop({ required: true, unique: true })
    email: string;

    @Prop({ required: true, minlength: 6 })
    password: string;

    @Prop({ type: String, default: Role.USER, enum: Role })
    role: Role;

    @Prop({ default: false })
    isVerified: boolean;

    @Prop({ required: false, nullable: true })
    avartarUrl: string;
}

export const UserSchema = SchemaFactory.createForClass(User);

// Thêm phương thức comparePassword vào schema
UserSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
    try {
        return await bcrypt.compare(candidatePassword, this.password);
    } catch (error) {
        throw error;
    }
};

// Middleware tự động hash password trước khi lưu
UserSchema.pre('save', async function(next) {
    const user = this;
    
    // Chỉ hash password nếu nó được sửa đổi hoặc là document mới
    if (!user.isModified('password')) {
        return next();
    }

    try {
        // Tạo salt và hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(user.password, salt);
        
        // Gán password đã hash vào document
        user.password = hashedPassword;
        next();
    } catch (error) {
        next(error);
    }
});