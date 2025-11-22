import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
    username: string;
    email: string;
    passwordHash: string;
    rating: number;
    games: mongoose.Types.ObjectId[];
    createdAt: Date;
    stats: {
        wins: number;
        losses: number;
        draws: number;
    };
    profile: {
        avatar: string;
        bio: string;
        country: string;
    };
    puzzleStats: {
        solved: number;
        attempted: number;
        rating: number;
    };
}

const UserSchema: Schema = new Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    rating: { type: Number, default: 1200 },
    games: [{ type: Schema.Types.ObjectId, ref: 'Game' }],
    stats: {
        wins: { type: Number, default: 0 },
        losses: { type: Number, default: 0 },
        draws: { type: Number, default: 0 },
    },
    profile: {
        avatar: { type: String, default: '♞' },
        bio: { type: String, default: '' },
        country: { type: String, default: '' },
    },
    puzzleStats: {
        solved: { type: Number, default: 0 },
        attempted: { type: Number, default: 0 },
        rating: { type: Number, default: 1200 },
    },
}, { timestamps: true });

export default mongoose.model<IUser>('User', UserSchema);
