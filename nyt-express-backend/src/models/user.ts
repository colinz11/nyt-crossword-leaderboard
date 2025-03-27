import { Document, Schema, model } from 'mongoose';

export interface UserDocument extends Document {
    userID: number;
    name: string;
    cookie: string;
    expirationDate: Date;
}

const userSchema = new Schema<UserDocument>({
    userID: { type: Number, required: true, unique: true },
    name: { type: String, required: true },
    cookie: { type: String, required: true },
    expirationDate: { type: Date, required: true }
});

export const User = model<UserDocument>('User', userSchema);