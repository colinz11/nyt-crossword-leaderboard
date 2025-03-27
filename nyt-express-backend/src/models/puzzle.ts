import { Document, Schema, model } from 'mongoose';

export interface PuzzleDocument extends Document {
    puzzleID: number;
    author: string;
    editor: string;
    formatType: string;
    printDate: Date;
    publishType: string;
    title: string;
    version: string;
    percentFilled: number;
    solved: boolean;
    star: number;
}

const puzzleSchema = new Schema<PuzzleDocument>({
    puzzleID: { type: Number, required: true, unique: true },
    author: String,
    editor: String,
    formatType: String,
    printDate: Date,
    publishType: String,
    title: String,
    version: String,
    percentFilled: Number,
    solved: Boolean,
    star: Number
});

export const Puzzle = model<PuzzleDocument>('Puzzle', puzzleSchema);