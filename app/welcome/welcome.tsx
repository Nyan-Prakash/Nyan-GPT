import { useState } from "react";
import logoDark from "./logo-dark.svg";
import { redirect, useNavigate } from "react-router";
import logoLight from "./logo-light.svg";
import TextType from "./TextType";
import DotBackground from "./DotBackground";
import { authClient, signIn, signUp } from "~/utils/auth-client";

export function Welcome() {
  const [needCreate, setNeedCreate] = useState(false);
  const navigate = useNavigate();


  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassowrd, setConfirmPassword] = useState("");
  const [name, setName] = useState("");

  async function handleSignIn(e: React.FormEvent) {
  e.preventDefault();
  await signIn.email({ email, password, callbackURL: "/dashboard" });
}

async function handleSignUp(e: React.FormEvent) {
  e.preventDefault();
  if (password && confirmPassowrd && password === confirmPassowrd) {
    await signUp.email({ name, email, password, callbackURL: "/dashboard"})

  }
}


  return (
    <main className="relative text-white">
  <DotBackground></DotBackground>

  <section className="relative z-0 min-h-screen flex flex-row items-center justify-center gap-20">
    <div className=" flex flex-rowjustify-center items-center gap-80">
        <div className="flex flex-col">
          <h1 className="text-9xl font-bold mt-10 ">Pathos GPT</h1>
          <TextType
            text={[
              "I understand you",
              "Talk to me",
              "Have a conversation with me",
              "I hope I can help you",
              "I get you",
              "I got you",
            ]}
            typingSpeed={75}
            pauseDuration={1500}
            showCursor={true}
            cursorCharacter="|"
            className="text-2xl mt-2 font-thin "
          />
        </div>

        <div className="flex items-center justify-end">
          {needCreate ? (
            <form
              className={`border border-white w-100 ${(password !== "" && confirmPassowrd !== "" && password !== confirmPassowrd) ? "h-115" : "h-110"} rounded-2xl flex flex-col gap-5 pt-10 items-center`}
              onSubmit={handleSignUp}
            >
              <input
                className="border border-white w-85 p-3 rounded-2xl"
                placeholder="Name"
                type="text"
                value={name} 
                onChange={e=>setName(e.target.value)}
              ></input>
              <input
                className="border border-white w-85 p-3 rounded-2xl"
                placeholder="Email"
                type="text"
                value={email} 
                onChange={e=>setEmail(e.target.value)}
              ></input>
              <input
                className="border border-white w-85 p-3 rounded-2xl"
                placeholder="Password"
                type="password"
                value={password} 
                onChange={e=>setPassword(e.target.value)}
              ></input>

              <input
                className="border border-white w-85 p-3 rounded-2xl"
                placeholder="Confirm Password"
                type="password"
                value={confirmPassowrd}
                onChange={e=>setConfirmPassword(e.target.value)}
              ></input>
              <button
                className="border border-white w-85 p-3 rounded-2xl hover:bg-white hover:text-black"
                type="submit"
              >
                Create Account
              </button>
              <div className="flex flex-col items-center ">
                {(password !== "" && confirmPassowrd !== "" && password !== confirmPassowrd) && (
                  <div className="text-red-500 font-bold">Passwords do not match!</div>
                )}
              <div
                className="text-gray-400 hover:text-white"
                onClick={() => setNeedCreate(false)}
              >
                Already have an account
              </div>
              </div>
              
            </form>
          ) : (
            <form
              className="border border-white w-100 h-95 rounded-2xl flex flex-col gap-5 pt-10 items-center"
              onSubmit={handleSignIn}
            >
                <div className="flex flex-row gap-1">

              <button
                type="button"
                className="flex items-center justify-center border border-white p-3 rounded-2xl hover:bg-white hover:text-black mb-2"
                onClick={() => {
                  authClient.signIn.social({ provider: "google" ,  callbackURL: "/dashboard" })
                }}
              > 
               
                <img src="/googleIcon.png" alt="Google" className="h-6 w-6 mr-2" />
                Google
              </button>
               <button
                type="button"
                className="flex items-center justify-center border border-white p-3 rounded-2xl hover:bg-white hover:text-black mb-2"
                onClick={() => {
                  authClient.signIn.social({ provider: "discord",  callbackURL: "/dashboard"  })
                }}
              >     
                <img src="/discordIcon.png" alt="Discord" className="h-5 w-6 mr-2" />
                Discord
              </button>

              <button
                type="button"
                className="flex items-center justify-center border border-white p-3 rounded-2xl hover:bg-white hover:text-black mb-2"
                onClick={() => {
                  authClient.signIn.social({ provider: "github" ,  callbackURL: "/dashboard" })
                }}
              >     
                <img src="/github-mark.png" alt="Github" className="h-6 w-6 mr-2" />
                Github
              </button>

              
              </div>

              <input
                className="border border-white w-85 p-3 rounded-2xl"
                placeholder="Email"
                type="text"
                value={email} 
                onChange={e=>setEmail(e.target.value)}
              ></input>
              <input
                className="border border-white w-85 p-3 rounded-2xl"
                placeholder="Password"
                type="password"
                value={password} 
                onChange={e=>setPassword(e.target.value)}
              ></input>
              <button
                className="border border-white w-85 p-3 rounded-2xl hover:bg-white hover:text-black"
                type="submit"
              >
                Login
              </button>
              <div
                className="text-gray-400 hover:text-white"
                onClick={() => setNeedCreate(true)}
              >
                Don't have an account
              </div>
            </form>
          )}
        </div>
      </div>
  </section>

</main>

  );
}
