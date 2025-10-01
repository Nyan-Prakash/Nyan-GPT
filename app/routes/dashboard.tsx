import type { LoaderFunctionArgs, ActionFunctionArgs } from "react-router";
import { Form, redirect, useLoaderData } from "react-router";
import { auth } from "../utils/auth.server";
import { db } from "../db/client";
import { users } from "../db/auth-schema";
import { eq, Placeholder } from "drizzle-orm";
import { useState } from "react";
import { authClient } from "~/utils/auth-client";
import TextType from "~/welcome/TextType";
import { useChat } from "@ai-sdk/react";
import Message from "~/Message";
import CameraStream from "~/CameraStream";
import { type GameState, type Player } from "~/utils/logic";

export async function loader({ request }: LoaderFunctionArgs) {
  const session = await auth.api.getSession({ headers: request.headers });

  if (!session) {
    return new Response(null, { status: 302, headers: { Location: "/" } });
  }

  return new Response(JSON.stringify({ user: session.user }), {
    status: 200,
    headers: { "content-type": "application/json" },
  });
}
export async function action({ request }: ActionFunctionArgs) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) throw redirect("/");

  const form = await request.formData();
  const name = String(form.get("name") || "").trim();

  if (name.length < 2) {
    return JSON.stringify({ ok: false, error: "Name too short" });
  }

  await db.update(users).set({ name }).where(eq(users.id, session.user.id));

  return redirect("/dashboard");
}

export default function Dashboard() {
  const { user } = useLoaderData() as {
    user: {
      id: string;
      email: string;
      name?: string | null;
      image?: string | null;
    };
  };

  const { messages, sendMessage } = useChat();
  const [input, setinput] = useState("");

  const [guess, setGuess] = useState("");

  const [players, setPlayers] = useState<Player[]>([]);

  const [gameState, setGameState] = useState<GameState>();

  const [counter, setCounter] = useState<number>();

  const charadesRounds = [
  {
    round: 1,
    category: "Actions",
    words: [
      "Running", "Jumping", "Dancing", "Swimming", "Singing", "Reading", "Writing",
      "Sleeping", "Eating", "Climbing", "Driving", "Cooking", "Drawing", "Laughing", "Crying",
      "Typing", "Shouting", "Walking", "Skipping", "Kneeling", "Balancing", "Sneezing", "Yawning",
      "Stretching", "Hiding", "Pointing", "Kicking", "Pushing", "Pulling", "Throwing", "Catching",
      "Spinning", "Waving", "Shaking hands", "Whistling", "Jumping rope", "Boxing", "Hugging"
    ]
  },
  {
    round: 2,
    category: "Emotions",
    words: [
      "Happy", "Sad", "Angry", "Excited", "Scared", "Surprised", "Confused", "Bored",
      "Tired", "Proud", "Shy", "Embarrassed", "Nervous", "Jealous", "Calm", "Hopeful",
      "Disappointed", "Relieved", "Frustrated", "Curious", "Lonely", "Overwhelmed", "Grateful",
      "Annoyed", "Determined", "Joyful", "Guilty", "Content", "Stressed", "Anxious", "Peaceful",
      "Suspicious", "Optimistic", "Pessimistic", "Impatient", "Ashamed", "Serene", "Playful"
    ]
  },
  {
    round: 3,
    category: "Sports",
    words: [
      "Soccer", "Basketball", "Baseball", "Tennis", "Volleyball", "Golf", "Bowling", "Boxing",
      "Wrestling", "Ping Pong", "Badminton", "Ice Skating", "Skiing", "Surfing", "Archery", "Cricket",
      "Rugby", "American Football", "Field Hockey", "Lacrosse", "Track and Field", "Pole Vaulting",
      "Shot Put", "Javelin", "High Jump", "Long Jump", "Cycling", "Mountain Biking", "Skateboarding",
      "Snowboarding", "Fencing", "Karate", "Judo", "Taekwondo", "Windsurfing", "Rowing", "Canoeing",
      "Kayaking", "Sailing"
    ]
  },
  {
    round: 4,
    category: "Famous People",
    words: [
      "Albert Einstein", "Elvis Presley", "Michael Jackson", "Taylor Swift", "Oprah Winfrey",
      "Barack Obama", "Donald Trump", "Beyoncé", "Lionel Messi", "Serena Williams", "Leonardo da Vinci",
      "Cleopatra", "Elon Musk", "Ariana Grande", "William Shakespeare", "Nelson Mandela",
      "Abraham Lincoln", "George Washington", "Martin Luther King Jr.", "Queen Elizabeth II", "Napoleon Bonaparte",
      "Christopher Columbus",  "Isaac Newton", "Winston Churchill", "John F. Kennedy",
      "Princess Diana", "Steve Jobs", "Bill Gates", "Rihanna",
      "Justin Bieber", "LeBron James", "Muhammad Ali", "Lady Gaga", "Adele"
    ]
  },
  {
    round: 5,
    category: "Instruments",
    words: [
      "Guitar", "Piano", "Drums", "Violin", "Trumpet", "Flute", "Saxophone", "Cello", "Harp",
      "Trombone", "Accordion", "Banjo", "Clarinet", "Ukulele", "Xylophone", "Bass Guitar",
      "Electric Guitar", "Double Bass", "Oboe", "Bassoon", "French Horn", "Tuba", "Mandolin",
      "Sitar", "Tabla", "Bagpipes", "Didgeridoo", "Maracas", "Tambourine", "Triangle",
      "Harmonica",
    ]
  }
];

let word = getRandomWord(gameState?.round ?? 1);


function getRandomWord(round: number) {
  const roundData = charadesRounds.find(r => r.round === round);
  if (!roundData) return "Round not found";

  const { words } = roundData;
  return words[Math.floor(Math.random() * words.length)];
}


  const readyPhrase = [
    "Are you ready, ",
    "I think you got, ",
    "Good luck pal, ",
    "Let's see what you got, ",
    "Everyone is watch. No pressure, ",
    "Don't blink, ",
    "You practiced right? ",
  ];

  const [text, setText] = useState("");

  async function handleSignOut() {
    await authClient.signOut({});
    return redirect("/home");
  }

  const addPlayer = () => {
    const lastId =
      players.length > 0 ? Math.max(...players.map((p) => p.ID)) : -1;

    const newPlayer: Player = {
      ID: lastId + 1,
      name: "",
      points: 0,
    };

    // Add to state
    setPlayers((prev) => [...prev, newPlayer]);
  };

  function renamePlayer(index: number, newName: string) {
    setPlayers((prev) =>
      prev.map((player, i) =>
        i === index ? { ...player, name: newName } : player
      )
    );
  }

  async function startCounter() {
    setCounter(6);

    for (let i = 6; i > 0; i--) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setCounter((prev) => (prev ?? 6) - 1); // use functional update with default value
    }
    setText("");
  }

  function startGame() {
    const tempState = {
      players: players,
      round: 0,
      winner: undefined,
      currentPlayer: 0,
    };
    startCounter();

    setGameState(tempState);
    const randomIndex = Math.floor(Math.random() * readyPhrase.length);
    setText(readyPhrase[randomIndex] + players[tempState.currentPlayer].name);
  }

  return (
    <div className="bg-black w-screen h-screen ">
      <div className="fixed top-5 right-5 flex flex-row items-center gap-6 ">
        <div className="font-bold text-3xl" onClick={handleSignOut}>
          Who is You!
        </div>
        <div className="bg-white w-[1px] h-10"></div>
        <button
          className="text-white border  border-white w-20 h-10 text-center justify-center rounded-xl hover:bg-white hover:text-black"
          onClick={handleSignOut}
        >
          Sign Out
        </button>
      </div>

      {gameState == undefined ? (
        <div className="h-screen flex flex-col items-center justify-center gap-5">
          <div className="flex flex-row gap-3">
            <button
              className="text-white border border-white w-20 pb-2 h-20 justify-center rounded-full text-6xl hover:bg-white hover:text-black animate-pulse"
              onClick={() => addPlayer()}
            >
              +
            </button>
            {players.length > 1 && (
              <button
                className="text-white border border-white w-20 pb-2 h-20 justify-center rounded-full text-6xl hover:bg-white hover:text-black animate-pulse"
                onClick={() => setPlayers(players.slice(0, -1))}
              >
                -
              </button>
            )}
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
          <button
            className="text-white border border-white w-80 h-30 justify-center rounded-xl text-6xl hover:bg-white hover:text-black animate-pulse"
            onClick={startGame}
          >
            Start Game
          </button>
        </div>
      ) : (
        <>
          {counter && counter > 0 ? (
            // COUNTDOWN VIEW
            <div className="min-h-screen flex flex-col items-center justify-center">
              <div className="text-7xl text-white text-center mb-6 animate-pulse">
                {text}
              </div>
              <div className="text-9xl text-white text-center animate-pulse">
                {counter-1}
              </div>
            </div>
          ) : (
            // CAMERA FULLSCREEN VIEW
            <div className="absolute top-1/9 left-1/6 flex flex-col gap-30">
              <div className="text-7xl text-center">{word}</div>
              <div className="flex flex-row items-center gap-50">
                <CameraStream
                word={word}
                round={gameState.round}
                analysis={guess}
                setAnalysis={setGuess}
              />
              <div className="text-6xl">Guess: {guess}</div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
