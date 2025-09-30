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


  async function handleSignOut() {
    await authClient.signOut();
    return redirect("/home");
    
    
  }

  return (
    <div className="bg-black w-screen h-screen">
        <button className="text-white border border-white mt-5 w-20 h-10 text-center justify-center rounded-xl absolute right-5 hover:bg-white hover:text-black" onClick={handleSignOut}>Sign Out</button>

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

        <div className="flex justify-center items-center inset-0 sticky pt-60 pb-5">
          <form
            className="flex flex-row gap-2 justify-center items-center"
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage({ text: input });
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
