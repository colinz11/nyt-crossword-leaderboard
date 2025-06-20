import { Schema, model, Document } from 'mongoose';

interface Cell {
    confirmed: boolean;
    guess: string;
    timestamp: Date;
    blank: boolean;
    checked: boolean;
}

interface Board {
    cells: Cell[];
}

interface Calcs {
    percentFilled: number;
    secondsSpentSolving: number;
    solved: boolean;
}

interface Firsts {
    checked: number;
    cleared: number;
    opened: number;
    solved: number;
}

export interface SolveStep {
  cell: { row: number; col: number };
  char: string;
  timestamp: number; // Milliseconds from start of solve session
}

export interface SolutionDocument extends Document {
    board: Board;
    calcs: Calcs;
    firsts: Firsts;
    lastCommitID: string;
    puzzleID: string;
    timestamp: Date;
    userID: string;
    minGuessTime: number;
    lastSolve: Date;
    autocheckEnabled: boolean;
    solvePath?: SolveStep[]; // Optional: not all solutions might have this
}

const solveStepSchema = new Schema<SolveStep>({
  cell: {
    row: { type: Number, required: true },
    col: { type: Number, required: true },
  },
  char: { type: String, required: true },
  timestamp: { type: Number, required: true },
}, {_id: false});

const solutionSchema = new Schema<SolutionDocument>({
    board: {
        cells: [
            {
                confirmed: { type: Boolean, required: true },
                guess: { type: String, required: true },
                timestamp: { type: Date, required: true }, // This is absolute timestamp of cell modification
                blank: { type: Boolean, required: true },
                checked: { type: Boolean, required: true },
            },
        ],
    },
    calcs: {
        percentFilled: { type: Number, required: true },
        secondsSpentSolving: { type: Number, required: true },
        solved: { type: Boolean, required: true },
    },
    firsts: {
        checked: { type: Number },
        cleared: { type: Number },
        opened: { type: Number },
        solved: { type: Number },
    },
    lastCommitID: { type: String, required: true },
    puzzleID: { type: String, required: true },
    timestamp: { type: Date, required: true },
    userID: { type: String, required: true },
    minGuessTime: { type: Number },
    lastSolve: { type: Date },
    autocheckEnabled: { type: Boolean, required: true },
    solvePath: { type: [solveStepSchema], default: undefined },
});

export const Solution = model<SolutionDocument>('Solution', solutionSchema);