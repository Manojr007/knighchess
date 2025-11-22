import mongoose, { Document, Schema } from 'mongoose';

export interface IGame extends Document {
    white: mongoose.Types.ObjectId;
    black: mongoose.Types.ObjectId;
    pgn: string;
    fen: string;
    timeControl: string; // e.g., "10+0", "3+2"
    status: 'active' | 'completed' | 'aborted';
    result: 'white' | 'black' | 'draw' | null;
    winner: mongoose.Types.ObjectId | null;
    moves: string[]; // Array of UCI or SAN moves
    chat: { sender: string; message: string; timestamp: Date }[];
    spectators: mongoose.Types.ObjectId[];
    isBot: boolean;
    botLevel: string;
    createdAt: Date;
    updatedAt: Date;
}

const GameSchema: Schema = new Schema({
    white: { type: Schema.Types.ObjectId, ref: 'User' }, // Made optional for when user plays black vs bot (bot is white)
    black: { type: Schema.Types.ObjectId, ref: 'User' }, // Made optional for open games or bot
    pgn: { type: String, default: '' },
    fen: { type: String, default: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1' },
    timeControl: { type: String, required: true },
    status: { type: String, enum: ['active', 'completed', 'aborted'], default: 'active' },
    result: { type: String, enum: ['white', 'black', 'draw', null], default: null },
    winner: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    moves: [{ type: String }],
    chat: [{
        sender: { type: String, required: true },
        message: { type: String, required: true },
        timestamp: { type: Date, default: Date.now }
    }],
    spectators: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    isBot: { type: Boolean, default: false },
    botLevel: { type: String, default: 'random' },
}, { timestamps: true });

export default mongoose.model<IGame>('Game', GameSchema);
