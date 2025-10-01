import type { LoaderFunctionArgs, ActionFunctionArgs } from "react-router";
import { Form, redirect, useLoaderData } from "react-router";
import { auth } from "../utils/auth.server";
import { db } from "../db/client";
import { users } from "../db/auth-schema"; 
import { eq, Placeholder } from "drizzle-orm";
import { useState } from "react";
import { authClient } from "~/utils/auth-client";
import TextType from "~/welcome/TextType"; 
import {useChat} from "@ai-sdk/react";
import Message from "~/Message";
import CameraStream from "~/CameraStream";
import { type GameState, type Player } from "~/utils/logic";


export default function Menu() {

  const {messages, sendMessage} = useChat();
  const [input, setinput] = useState("");

  const [emotion, setEmotion] = useState("");

  const [players, setPlayers] = useState<Player[]>([]);

  const [gameState, setGameState] = useState<GameState>();


  async function handleSignOut() {
    await authClient.signOut({});
    return redirect("/home"); 
  }

  const addPlayer = () => {

    const lastId = players.length > 0 ? Math.max(...players.map(p => p.ID)) : -1;

    const newPlayer: Player = {
      ID: lastId + 1,
      name: "",
      points: 0,
    };

    // Add to state
    setPlayers(prev => [...prev, newPlayer]);
  };

  function renamePlayer(index: number, newName: string) {
  setPlayers(prev =>
    prev.map((player, i) =>
      i === index ? { ...player, name: newName } : player
    )
  );
}

  return (
    <div className="bg-black w-screen h-screen">

      

        <div className="h-screen flex flex-col items-center justify-center gap-5">
        <div className="flex flex-row gap-3">
            <button className="text-white border border-white w-20 pb-2 h-20 justify-center rounded-full text-6xl hover:bg-white hover:text-black animate-pulse"  onClick={() => addPlayer()}>+</button>
            {players.length > 1 && <button
              className="text-white border border-white w-20 pb-2 h-20 justify-center rounded-full text-6xl hover:bg-white hover:text-black animate-pulse"
              onClick={() => setPlayers(players.slice(0, -1))}
            >-</button>}



          </div>

          {players.map((i, index) => (
            <input
              type="text"
              className="border p-4 rounded-3xl text-4xl"
              placeholder="text"
              value={players[index].name}
              onChange={(e) => {
               
                renamePlayer(index, e.target.value);              
              }}
            />
          ))}
        <button className="text-white border border-white w-80 h-30 justify-center rounded-xl text-6xl hover:bg-white hover:text-black animate-pulse" onClick={() =>{

            const tempState = {
              players: players,
              round: 0,
              winner: undefined,
              currentPlayer: 0
            }

            setGameState(tempState);


        }}>Start Game</button>

        </div>
    </div>
  );
}
