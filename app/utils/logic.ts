import { number } from "zod";

export type Player = {
    ID: number;
    name: string;
    points: number;
    matches: number
}

export type GameState = {
    round: number;
    players: Player[] | undefined;
    currentPlayer: number;
    winner: boolean;
}

export const intitalGameState: GameState = {
    round: 0,
    players: undefined,
    currentPlayer: 0,
    winner: false,

}
export function createPlayer(playerName: string, num: number): Player
{
    return {
        name: playerName,
        points: 0,
        ID: num,
        matches: 0
    };
}