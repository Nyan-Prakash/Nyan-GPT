import React, { useRef, useEffect, useState } from "react";
import { OpenAI } from 'openai';

type CameraStreamProp = {
    analysis: string;
    setAnalysis: (newVale: string) => void;
    word: string;
    round: number;

}

export default function CameraStream({analysis, setAnalysis, word, round}: CameraStreamProp){
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  const apiUrl = import.meta.env.VITE_OPENAI_API_KEY;


  const [loading, setLoading] = useState(false);
  const [errMsg, setErrMsg] = useState<string | null>(null);
  useEffect(() => {
    const start = async () => {
      try {
        const s = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
        setStream(s);
        if (videoRef.current) videoRef.current.srcObject = s;
      } catch (err) {
        console.error(err);
      }
    };

    start();
    return () => {
      stream?.getTracks().forEach(t => t.stop());
    };
  }, []);


useEffect(() => {
    const interval = setInterval(() => {
        captureAndAnalyze();
    }, 5000);
    return () => clearInterval(interval);
}, []);

  async function captureAndAnalyze() {
    setErrMsg(null);
    setLoading(true);
    try {
      const v = videoRef.current;
      const c = canvasRef.current;
      if (!v || !c) throw new Error("Camera not ready.");

      // sync canvas to video frame size
      c.width = v.videoWidth || 640;
      c.height = 480;
      const ctx = c.getContext("2d");
      if (!ctx) throw new Error("Canvas context unavailable.");
      ctx.drawImage(v, 0, 0, c.width, c.height);

      const dataUrl = c.toDataURL("image/png");

      const openai = new OpenAI({
        apiKey: apiUrl,
        dangerouslyAllowBrowser: true,
      });

      const roundInstruction = ["Guess person's action", "Guess the person's emotion", "Guess the sport the person is acting", "Guess what famous person", "Guess the instrument the person is playing"];
      const resp = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "You are playing a guessing game called Charades. Your task is to look at the image and guess, in one word only, what the person is acting out or pretending to be. Respond with a single word answer only, no explanations." },
          {
        role: "user", 
        content: [
          { type: "text", text: roundInstruction[round]+"Respond with only one word." },
          { type: "image_url", image_url: { url: dataUrl, detail: "low" } },
        ],
          },
        ],
        max_tokens: 10,
      });

      const content = resp.choices[0]?.message?.content?.trim();
      setAnalysis(content || "No emotion detected.");
    } catch (e: any) {
        console.log("error");
    } finally {
      setLoading(false);
    }
  }
  return (
    <div className=" ">
      <video className="rounded-4xl border-5 border-white" ref={videoRef} autoPlay playsInline />
      <canvas ref={canvasRef} style={{ display: "none" }} />
      <div></div>
    </div>
  );
}
