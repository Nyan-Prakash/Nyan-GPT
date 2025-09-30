import React, { useRef, useEffect, useState } from "react";
import { OpenAI } from 'openai';

type CameraStreamProp = {
    analysis: string;
    setAnalysis: (newVale: string) => void;

}

export default function CameraStream({analysis, setAnalysis}: CameraStreamProp){
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
    }, 1000);
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
      c.height = v.videoHeight || 480;
      const ctx = c.getContext("2d");
      if (!ctx) throw new Error("Canvas context unavailable.");
      ctx.drawImage(v, 0, 0, c.width, c.height);

      const dataUrl = c.toDataURL("image/png");

      const openai = new OpenAI({
        apiKey: apiUrl,
        dangerouslyAllowBrowser: true,
      });

      const resp = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "You analyze emotions in photos. Be concise." },
          {
            role: "user", 
            content: [
              { type: "text", text: "What emotion does the person show? Respond in one word [Happy, Sad, Mad]" },
              { type: "image_url", image_url: { url: dataUrl, detail: "low" } },
            ],
          },
        ],
        max_tokens: 120,
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
    <div className="relative top-5 left-5 w-80 border-5  border-white bg-amber-50 rounded-4xl">
      <video className="rounded-4xl" ref={videoRef} autoPlay playsInline />
      <canvas ref={canvasRef} style={{ display: "none" }} />
      <div className="text-black p-1 text-center font-bold">{analysis ? analysis : "Normal"}</div>
      <div></div>
    </div>
  );
}
