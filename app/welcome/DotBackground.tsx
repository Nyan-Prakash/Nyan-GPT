 import { useEffect, useRef } from "react";

export default function DotBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;

    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    const dots: { x: number; y: number; dx: number; dy: number }[] = [];
    const numDots = 300;

    // Initialize dots
    for (let i = 0; i < numDots; i++) {
        dots.push({
            x: Math.random() * width,
            y: Math.random() * height,
            dx: (Math.random() - 0.5) * 1.2,
            dy: (Math.random() - 0.5) * 1.2
        });
    }

    function draw() {
      ctx.clearRect(0, 0, width, height);

      dots.forEach((dot) => {
        // Move
        dot.x += dot.dx;
        dot.y += dot.dy;

        // Bounce off edges
        if (dot.x < 0 || dot.x > width) dot.dx *= -1;
        if (dot.y < 0 || dot.y > height) dot.dy *= -1;

        // Draw dot
        ctx.beginPath();
        ctx.arc(dot.x, dot.y, 2, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(255,255,255,0.7)";
        ctx.fill();
      });

      requestAnimationFrame(draw);
    }

    draw();

    // Handle resize
    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 -z-10 bg-black"
    />
  );
}
