<div className="flex flex-col items-center">
        {cameraActive && <div className="text-7xl text-center mt-15 mb-30">{word}</div>}


        <video
          className={`rounded-4xl  border-white ${cameraActive ? "w-170 h-130 border-5" : "w-0 h-0 "}`}
          ref={videoRef}
          autoPlay
          playsInline
        />
        {cameraActive &&
        <div className="">
              <div className="text-7xl text-white text-center mb-6 animate-pulse">
                {text}
              </div>
              <div className="text-9xl text-white text-center animate-pulse">
                {counter}
              </div>
            </div>
        }
        <canvas ref={canvasRef} style={{ display: "none" }} />
        {cameraActive && (
          <div>
            
          </div>
        )}
      </div>