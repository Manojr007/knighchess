import mongoose, { Document, Schema } from 'mongoose';

export interface IPuzzle extends Document {
    puzzleId: string;
    fen: string;
    moves: string[];
    rating: number;
    themes: string[];
    popularity: number;
}

const puzzleSchema = new Schema<IPuzzle>({
    puzzleId: { type: String, required: true, unique: true },
    fen: { type: String, required: true },
    moves: [{ type: String, required: true }],
    rating: { type: Number, required: true },
    themes: [{ type: String }],
    popularity: { type: Number, default: 0 }
}, {
    timestamps: true
});

export default mongoose.model<IPuzzle>('Puzzle', puzzleSchema);
