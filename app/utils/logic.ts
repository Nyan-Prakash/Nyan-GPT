import { number } from "zod";

export type Player = {
    ID: number;
    name: string;
    points: number;
}

export type GameState = {
    round: number;
    players: Player[] | undefined;
    currentPlayer: number;
    winner: Player | undefined;
}

export function createPlayer(playerName: string, num: number): Player
{
    return {
        name: playerName,
        points: 0,
        ID: num
    };
}