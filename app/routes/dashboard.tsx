import type { LoaderFunctionArgs, ActionFunctionArgs } from "react-router";
import { Form, redirect, useLoaderData } from "react-router";
import { auth } from "../utils/auth.server";
import { db } from "../db/client";
import { users } from "../db/auth-schema";
import { eq, Placeholder } from "drizzle-orm";
import { useState, useRef, useContext, useEffect } from "react";
import { authClient } from "~/utils/auth-client";
import TextType from "~/welcome/TextType";
import { useChat } from "@ai-sdk/react";
import Message from "~/Message";
import { type GameState, type Player } from "~/utils/logic";
import CountDown from "react-countdown";
import { OpenAI } from "openai";

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

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [loading, setLoading] = useState(false);
  const [errMsg, setErrMsg] = useState<string | null>(null);

  const apiUrl = import.meta.env.VITE_OPENAI_API_KEY;
  const { messages, sendMessage } = useChat();
  const [input, setinput] = useState("");

  const [guess, setGuess] = useState("");

  const [players, setPlayers] = useState<Player[]>([]);

  const [gameover, setGameOver] = useState(false);
  const [gameState, setGameState] = useState<GameState>();

  const [counter, setCounter] = useState<number>();

  const [deadline, setDeadline] = useState<number>(0);
  const [countdownKey, setCountdownKey] = useState<number>();

  const [word, setWord] = useState<string>("");

  const [cameraActive, setCameraActive] = useState(false);

const matchesRef = useRef(0);
const [matches, setMatches] = useState(0);

const gameStateRef = useRef<GameState | undefined>(undefined);
useEffect(() => { gameStateRef.current = gameState; }, [gameState]);

const sleep = (ms: number) => new Promise(res => setTimeout(res, ms));


  const charadesRounds = [
    {
      round: 0,
      category: "Actions",
      words: [
        "Running",
        "Jumping",
        "Dancing",
        "Swimming",
        "Singing",
        "Reading",
        "Writing",
        "Sleeping",
        "Eating",
        "Climbing",
        "Driving",
        "Cooking",
        "Drawing",
        "Laughing",
        "Crying",
        "Typing",
        "Shouting",
        "Walking",
        "Skipping",
        "Balancing",
        "Yawning",
        "Stretching",
        "Hiding",
        "Pointing",
        "Kicking",
        "Pushing",
        "Pulling",
        "Throwing",
        "Catching",
        "Spinning",
        "Waving",
        "Shaking hands",
        "Boxing",
        "Hugging",
      ],
    },
    {
      round: 1,
      category: "Emotions",
      words: [
        "Happy",
        "Sad",
        "Angry",
        "Excited",
        "Scared",
        "Surprised",
        "Confused",
        "Bored",
        "Tired",
        "Calm",
        "Frustrated",
        "Curious",
        "Lonely",
        "Annoyed",
        "Joyful",
        "Stressed",
        "Anxious",
        "Peaceful",
        "Suspicious",
        "Impatient",
      ],
    },
    {
      round: 2,
      category: "Sports",
      words: [
        "Soccer",
        "Basketball",
        "Baseball",
        "Tennis",
        "Volleyball",
        "Golf",
        "Bowling",
        "Boxing",
        "Wrestling",
        "Ping Pong",
        "Badminton",
        "Ice Skating",
        "Skiing",
        "Surfing",
        "Archery",
        "Cricket",
        "Rugby",
        "American Football",
        "Field Hockey",
        "Lacrosse",
        "Track and Field",
        "Pole Vaulting",
        "Shot Put",
        "Javelin",
        "High Jump",
        "Long Jump",
        "Cycling",
        "Mountain Biking",
        "Skateboarding",
        "Snowboarding",
        "Fencing",
        "Karate",
        "Judo",
        "Taekwondo",
        "Windsurfing",
        "Rowing",
        "Canoeing",
        "Kayaking",
        "Sailing",
      ],
    },
    {
      round: 3,
      category: "Famous People",
      words: [
        "Albert Einstein",
        "Elvis Presley",
        "Michael Jackson",
        "Taylor Swift",
        "Oprah Winfrey",
        "Barack Obama",
        "Donald Trump",
        "Beyoncé",
        "Lionel Messi",
        "Serena Williams",
        "Leonardo da Vinci",
        "Cleopatra",
        "Elon Musk",
        "Ariana Grande",
        "William Shakespeare",
        "Nelson Mandela",
        "Abraham Lincoln",
        "George Washington",
        "Martin Luther King Jr.",
        "Queen Elizabeth II",
        "Napoleon Bonaparte",
        "Christopher Columbus",
        "Isaac Newton",
        "Winston Churchill",
        "John F. Kennedy",
        "Princess Diana",
        "Steve Jobs",
        "Bill Gates",
        "Rihanna",
        "Justin Bieber",
        "LeBron James",
        "Muhammad Ali",
        "Lady Gaga",
        "Adele",
      ],
    },
    {
      round: 4,
      category: "Instruments",
      words: [
        "Guitar",
        "Piano",
        "Drums",
        "Violin",
        "Trumpet",
        "Flute",
        "Saxophone",
        "Cello",
        "Harp",
        "Trombone",
        "Accordion",
        "Banjo",
        "Clarinet",
        "Ukulele",
        "Xylophone",
        "Bass Guitar",
        "Electric Guitar",
        "Double Bass",
        "Oboe",
        "Bassoon",
        "French Horn",
        "Tuba",
        "Mandolin",
        "Sitar",
        "Tabla",
        "Bagpipes",
        "Didgeridoo",
        "Maracas",
        "Tambourine",
        "Triangle",
        "Harmonica",
      ],
    },
  ];

  const roundInstruction = [
    "Rate how closely the person's action matches the word",
    "Rate how accurately the person's emotion matches the word",
    "Rate how closely the person's acting matches the sport",
    "Rate how closely the person's portrayal matches the famous person",
    "Rate how closely the person's acting matches the instrument being played",
  ];

  async function captureAndAnalyze(TheWord: string, round: number) {
  setErrMsg(null);
  setLoading(true);
  try {
    const v = videoRef.current;
    const c = canvasRef.current;
    if (!v || !c) throw new Error("Camera not ready.");

    // sync canvas to video frame size
    c.width = v.videoWidth || 640;
    c.height = v.videoHeight || 480;
    const ctx = c.getContext("2d");
    if (!ctx) throw new Error("Canvas context unavailable.");
    ctx.drawImage(v, 0, 0, c.width, c.height);

    const dataUrl = c.toDataURL("image/png");

    const openai = new OpenAI({
      apiKey: apiUrl,
      dangerouslyAllowBrowser: true,
    });

    const categoryByRound: Record<number, string> = {
      0: "Actions",
      1: "Emotions",
      2: "Sports",
      3: "Famous People",
      4: "Instruments",
    };
    const roundIdx = round;
    const category = categoryByRound[roundIdx] ?? "Actions";

    const systemContent = `
You are a strict judge in a charades game. You will see one image and a TARGET word within a CATEGORY.
Your job is to score how well the image *visually* matches the TARGET, from 0–10 (0 = no match, 10 = perfect match).

RULES
- Do NOT guess the word; the TARGET is provided. Only rate how well the image matches it.
- Consider body pose, hand shapes, facial expression.
- Ignore background noise not relevant to the TARGET.
- Keep reasoning short and visual (no speculation about unseen context).
- Output MUST be valid JSON only, with this schema:
  {
    "score": number (integer 0-10),
    "rationale": string (<= 25 words, one sentence, visual cues only),
    "confidence": number (0.0-1.0),
    "category": string,
    "target": string
  }

SCORING RUBRICS (pick the one that matches CATEGORY)
- Actions: body pose and movement cues (e.g., running stride, jumping posture, cooking gestures).
- Emotions: facial expression (eyes, eyebrows, mouth), posture tension/relaxation.
- Sports: sport-specific posture/gear (e.g., racket swing, ball handling, stance, uniform).
- Famous People: iconic visual traits (hair, outfit, glasses/props, signature pose). Prefer strong iconic cues; rate low if generic.
- Instruments: correct instrument shape/hold/hand placement, posture typical of playing that instrument.

CALIBRATION
- 9–10: Immediately and unambiguously reads as the TARGET.
- 7–8: Mostly right; a few cues off or missing.
- 5–6: Some cues match, but significant ambiguity.
- 3–4: Weak resemblance; isolated or accidental cues.
- 0–2: No meaningful match.

Return JSON only. No extra text.
    `.trim();

    // A couple teeny few-shot anchors (text-only to anchor structure)
    const fewShot = [
      {
        role: "user" as const,
        content: [
          { type: "text", text: "CATEGORY: Emotions\nTARGET: Happy\n(Example, no image)" }
        ]
      },
      {
        role: "assistant" as const,
        content: JSON.stringify({
          score: 9,
          rationale: "Broad smile and relaxed eyes indicate happiness.",
          confidence: 0.9,
          category: "Emotions",
          target: "Happy",
        })
      },
      {
        role: "user" as const,
        content: [
          { type: "text", text: "CATEGORY: Instruments\nTARGET: Violin\n(Example, no image)" }
        ]
      },
      {
        role: "assistant" as const,
        content: JSON.stringify({
          score: 3,
          rationale: "No bow hold or shoulder position suggesting violin.",
          confidence: 0.5,
          category: "Instruments",
          target: "Violin",
        })
      }
    ];

    const userContent = [
      {
        type: "text" as const,
        text:
`CATEGORY: ${category}
TARGET: ${TheWord}
Return JSON only.`
      },
      { type: "image_url" as const, image_url: { url: dataUrl, detail: "high" } },
    ];

    const resp = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.2,
      top_p: 1,
      presence_penalty: 0,
      frequency_penalty: 0,
      // (Optional) If your SDK version supports it, you can enforce JSON:
      // response_format: { type: "json_object" },
      messages: [
        { role: "system", content: systemContent },
        ...fewShot,
        { role: "user", content: userContent as any },
      ],
      max_tokens: 160,
      n: 1,
    });

    const raw = resp.choices?.[0]?.message?.content?.trim() || "";
    let parsed: {
      score?: number;
      rationale?: string;
      confidence?: number;
      category?: string;
      target?: string;
    } = {};

    try {
      parsed = JSON.parse(raw);
    } catch {
      // gentle fallback if the model ever returns stray text around the JSON
      const match = raw.match(/\{[\s\S]*\}$/);
      parsed = match ? JSON.parse(match[0]) : {};
    }

    const scoreText =
      typeof parsed.score === "number" ? String(parsed.score) : "N/A";
    const reasonText = parsed.rationale ?? "No rationale.";
    const confText =
      typeof parsed.confidence === "number"
        ? ` (conf ${parsed.confidence.toFixed(2)})`
        : "";
    setGuess(`${scoreText}/10 — ${reasonText}${confText}`);
    return parsed.score;
  } catch (e: any) {
    console.error(e);
    setErrMsg("Analysis failed. Try again.");
    setGuess("N/A");
  } finally {
    setLoading(false);
  }
}


  useEffect(() => {
    const start = async () => {
      try {
        const s = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
        });
        setStream(s);
        if (videoRef.current) videoRef.current.srcObject = s;
      } catch (err) {
        console.error(err);
      }
    };

    start();
    return () => {
      stream?.getTracks().forEach((t) => t.stop());
    };
  }, []);


  function getRandomWord(round: number) {
    const roundData = charadesRounds.find((r) => r.round === round);
    if (!roundData) return "Round not found";

    const { words } = roundData;
    return words[Math.floor(Math.random() * words.length)];
  }

  const readyPhrase = [
    "Are you ready, ",
    "I think you got this, ",
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
      matches: 0,
    };

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
    setMatches(0)

    for (let i = 6; i > 0; i--) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setCounter((prev) => (prev ?? 6) - 1);
    }   
        setCameraActive(true);
        await startGameCounter()
        setText("");
  }

 async function startGameCounter() {

  const round = gameStateRef.current?.round ?? 0;
  const nextWord = getRandomWord(round);
  setWord(nextWord); 

  matchesRef.current = matchesRef.current + 1;
  setMatches(prev => prev + 1);

  setCounter(5);
  for (let i = 5; i > 0; i--) {
    await sleep(1000);
    setCounter(prev => (prev ?? 5) - 1);
  }
  const score = await captureAndAnalyze(nextWord, round);
  console.log(score);
  setGameState(prev => {
    if (!prev) return prev;
    const updated = prev.players?.map((p, idx) =>
      idx === prev.currentPlayer ? { ...p, matches: (p.matches ?? 0) + 1, points: (p.points ?? 0) + (score || 0) } : p
    );
    return { ...prev, players: updated };
  });

  if (matchesRef.current >= 5) {
        await sleep(3000);

        if (typeof gameState?.currentPlayer === "number" && gameState.currentPlayer + 1 === players.length)
        {
          console.log("DONE");
          startNewRound();
        }
        else
        {
          setGameState(prev => {
                    if (!prev || typeof prev.currentPlayer !== "number") return prev;
                    return { ...prev, currentPlayer: prev.currentPlayer + 1 };
        });
        }
      
        setCameraActive(false);
    return;
  }

  setCameraActive(true);
  await startGameCounter();
}

  function startGame() {

    const tempState = {
      players: players,
      round: 0,
      winner: false,
      currentPlayer: 0,
    };
    setGameState(tempState);
  }

  function startNewRound()
  {
    if (gameState?.round !== undefined && gameState.round > 1)
    {
        setGameState(prev => {
                    if (!prev || typeof prev.currentPlayer !== "number") return prev;
                    return { ...prev, winner: true};
        });
        setCounter(0);
    }
    else
    {
      setCameraActive(false);
      setText("Round " + ((gameState?.round ?? 0) + 1));
      setGameState(prev => {
                    if (!prev || typeof prev.currentPlayer !== "number") return prev;
                    return { ...prev, round: (prev.round ?? 0) + 1, currentPlayer: 0};
        });
    }
  }


    useEffect(() => {
    if (!gameState) return;
    startNewPerson();   // pass the state we want to read
    if (gameState?.players) {
      gameState.players.forEach((player) => {
        console.log(`Player ${player.name}: ${player.points} points`);
      });
    }
  }, [gameState?.currentPlayer]);

  function startNewPerson()
  {
    const randomIndex = Math.floor(Math.random() * readyPhrase.length);
    setText(
      readyPhrase[randomIndex] +
      (gameState?.players && typeof gameState.currentPlayer === "number"
        ? gameState.players[gameState.currentPlayer]?.name ?? ""
        : "")
    )
    matchesRef.current = 0;
    startCounter();
    setMatches(0);
  }

  return (
    <div className="bg-black w-screen h-screen" style={{overflow:"hidden"}}>
      
      <div className="flex flex-col items-center gap-10">
        {cameraActive && <div className="flex flex-col text-center gap-2"><div className="text-7xl text-center mt-10">{word} </div><div className="text-4xl italic">{matches}/5</div></div>}


        <video
          className={`rounded-4xl  border-white ${cameraActive ? "w-170 h-130 border-5" : "w-0 h-0 "}`}
          ref={videoRef}
          autoPlay
          playsInline
        />
        {cameraActive &&
        <div className="flex flex-col items-center justify-center">
              <div className="text-3xl text-white text-center mb-6 animate-pulse">
                {guess}
              </div>
              <div className="text-9xl text-white text-center animate-pulse">
                {(counter ?? 1) - 0}
              </div>
            </div>
        }
        <canvas ref={canvasRef} style={{ display: "none" }} />
         {gameState && gameState.players && (
        <div className="border-3 mt-50 mb-20 border-white bg-black bg-opacity-10 rounded-2xl p-6 shadow-lg">
          <table className="min-w-[320px] text-white text-2xl">
            <thead>
              <tr>
                <th className="px-4 py-2 text-left">Player</th>
                <th className="px-4 py-2 text-left">Points</th>
              </tr>
            </thead>
            <tbody>
              {gameState.players.map((player) => (
                <tr key={player.ID}>
                  <td className="px-4 py-2">{player.name}</td>
                  <td className="px-4 py-2">{player.points}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
        {cameraActive && (
          <div>
            
          </div>
        )}
      </div>
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
              key={index}
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
            {gameState.winner == false && <div className="flex flex-col items-center justify-center">
              <div className="text-7xl text-white text-center mb-6 animate-pulse">
                {text}
              </div>
              <div className="text-9xl text-white text-center animate-pulse">
                {(counter ?? 1) - 1}
              </div>
            </div>
          }
        
        </>
      )}

     
    </div>
  );
}
