import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Model, Types } from "mongoose";
import * as bcrypt from "bcrypt";
import { IsEmail, MinLength } from 'class-validator';

export enum Role {
    ADMIN = 'admin',
    USER = 'user',
}

export enum UserStatus {
    ACTIVE = 'active',
    INACTIVE = 'inactive',
    SUSPENDED = 'suspended'
}

export type UserDocument = User & Document & {
    comparePassword(candidatePassword: string): Promise<boolean>;
};

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
    @Prop({ required: true, index: true })
    username: string;

    @Prop({ required: true, unique: true, index: true })
    @IsEmail()
    email: string;

    @Prop({ required: true, minlength: 6 })
    @MinLength(6)
    password: string;

    @Prop({ default: null })
    avatarUrl: string;

    @Prop({ type: String, default: Role.USER, enum: Role })
    role: Role;

    @Prop({ default: false })
    isVerified: boolean;

    @Prop({ type: String, default: UserStatus.ACTIVE, enum: UserStatus })
    status: UserStatus;

    @Prop({ default: 0 })
    balance: number;

    @Prop({ type: [{ type: Types.ObjectId, ref: 'Course' }] })
    enrolledCourses: Types.ObjectId[];

    @Prop({ type: [{ type: Types.ObjectId, ref: 'Course' }] })
    boughtCourses: Types.ObjectId[];

    @Prop({ type: Boolean, default: false })
    isDeleted: boolean;
}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
    try {
        return await bcrypt.compare(candidatePassword, this.password);
    } catch (error) {
        throw error;
    }
};

UserSchema.pre('save', async function(next) {
    const user = this;
    
    if (!user.isModified('password')) {
        return next();
    }

    try {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(user.password, salt);
        
        user.password = hashedPassword;
        next();
    } catch (error) {
        next(error);
    }
});