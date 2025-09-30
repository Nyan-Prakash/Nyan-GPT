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

  await db
    .update(users)
    .set({ name })
    .where(eq(users.id, session.user.id));



  return redirect("/dashboard");
}

export default function Dashboard() {
  const { user } = useLoaderData() as {
    user: { id: string; email: string; name?: string | null; image?: string | null };
  };

  const {messages, sendMessage} = useChat();
  const [input, setinput] = useState("");

  const [emotion, setEmotion] = useState("");


  async function handleSignOut() {
    await authClient.signOut({});
    return redirect("/home");
    
    
  }

  const handleSetEmotion = (childMessage: string) => {
    setEmotion(childMessage);
  }

  return (
    <div className="bg-black w-screen h-screen">

      <div className="fixed top-5 right-5 flex flex-row items-center gap-6">
                <div className="font-bold text-3xl" onClick={handleSignOut}>Pathos GPT</div>
                <div className="bg-white w-[1px] h-10"></div>
                <button className="text-white border  border-white w-20 h-10 text-center justify-center rounded-xl hover:bg-white hover:text-black" onClick={handleSignOut}>Sign Out</button>

      </div>

        <div className="flex flex-row items-center justify-center gap-2 pt-100 text-6xl font-thin mb-10">
            <TextType
            text={[
                "Welcome,", 
                "Hi,",
                "Hello,",
                "What's good?",
                "Hey,",
                "Sup,",
                "What's up?",
            ]}
            typingSpeed={100}
            deletingSpeed={100}
            pauseDuration={3000}
            showCursor={true}
            cursorCharacter="|"
            className="font-thin"
            />
            <div className="text-white font-bold justify-center">{user.name}</div>
        </div>

        <div  className=" flex flex-col gap-6 justify-center items-center overflow-y-auto">
          {messages.map(message => (
        <div key={message.id}>
          {message.parts.map((part, i) => {
            switch (part.type) {
              case 'text':
                return <Message body={part.text} role={message.role}  key={`${message.id}-${i}`}></Message>;
            }
          })}
        </div>
      ))}
        </div>
      <div className="fixed top-5 left-5 z-50">
        <CameraStream analysis={emotion} setAnalysis={setEmotion} />
      </div>
      
        <div className="flex justify-center items-center inset-0 sticky pt-60 pb-5">
          <form
            className="flex flex-row gap-2 justify-center items-center"
            onSubmit={(e) => {
              let AddText = "Really treat me like I am very " + emotion +  " " + input;
              e.preventDefault();
              sendMessage({ text: AddText });
              setinput("");
              return;
            }}
          >
            <input
              name="input"
              className="border w-120 h-10 rounded-2xl p-5 border-white text-white bg-transparent"
              type="text"
              value={input}
              placeholder="Start Chatting..."
              onChange={(e) => setinput(e.target.value)}
              autoComplete="off"
            />
            <button
              className="border w-10 h-8 rounded-2xl flex items-center justify-center pt-7 m-0 pb-4 p-5 border-white text-white text-center text-4xl font-bold hover:bg-white hover:text-black"
              title="Send"
              type="submit"
            >
              ^
            </button>
          </form>
        </div>
        
    </div>
  );
}
