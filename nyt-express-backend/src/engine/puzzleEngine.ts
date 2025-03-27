import { Model } from 'mongoose';
import { SolutionDocument } from '../models/solution';
import { UserDocument } from '../models/user';

interface UserMap {
    [key: string]: string;
}

interface BoardData {
    username: string;
    solutionData: SolutionDocument;
}

interface BoardDataByUserId {
    [key: string]: BoardData;
}

class PuzzleEngine {
    private solutionModel: Model<SolutionDocument>;
    private userModel: Model<UserDocument>;
    private solutions: SolutionDocument[];
    private userMap: UserMap;

    constructor(solutionModel: Model<SolutionDocument>, userModel: Model<UserDocument>) {
        this.solutionModel = solutionModel;
        this.userModel = userModel;
        this.solutions = [];
        this.userMap = {};
    }

    async getSolutionsByGameId(gameId: string): Promise<SolutionDocument[]> {
        if (!gameId) {
            throw new Error('Missing required parameter: gameId');
        }

        this.solutions = await this.solutionModel.find({ puzzleID: gameId });
        const userIds = this.solutions.map(solution => solution.userID);

        const users = await this.userModel.find({ _id: { $in: userIds } });
        this.userMap = users.reduce((acc: UserMap, user) => {
            acc[user.userID.toString()] = user.name;
            return acc;
        }, {});

        return this.solutions;
    }

    getSolutionDataByUserId(): BoardDataByUserId {
        if (Object.keys(this.userMap).length === 0) {
            return {};
        }

        const sortedSolutions = this.solutions.sort((a, b) => a.calcs.secondsSpentSolving - b.calcs.secondsSpentSolving);
        const topSolutions = sortedSolutions.slice(0, 10);

        const boardDataByUserId = topSolutions.reduce((acc: BoardDataByUserId, solution) => {
            const username = this.userMap[solution.userID];
            if (username) {
                acc[solution.userID] = {
                    username,
                    solutionData: solution
                };
            }
            return acc;
        }, {});

        return boardDataByUserId;
    }
}

export default PuzzleEngine;