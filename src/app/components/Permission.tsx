"use client";
import { useEffect, useRef, useState } from "react";
import Cake from "./Cake";
import Fireworks, { FireworksHandlers } from "@fireworks-js/react";

const Permission = () => {
  const addPermission = () => {
    initializeMicrophone();
  };
  let audioContext: AudioContext;
  let analyser: AnalyserNode;
  let microphone: MediaStreamAudioSourceNode;
  let stream: MediaStream;
  const blowDetectedRef = useRef(false);
  const [blowDetected, setBlowDetected] = useState(false);
  const [isNext, setIsNext] = useState(false);
  const [elementPositions, setElementPositions] = useState<
    { x: number; y: number }[]
  >([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const explosionRef = useRef<HTMLAudioElement | null>(null);
  const ref = useRef<FireworksHandlers>(null);

  const handleBlow = () => {
    blowDetectedRef.current = true;
    audioRef.current?.pause();
    explosionRef.current?.play();

    setBlowDetected(true);
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }
  };

  const initializeMicrophone = async () => {
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });
      audioContext = new window.AudioContext();
      analyser = audioContext.createAnalyser();
      microphone = audioContext.createMediaStreamSource(stream);

      microphone.connect(analyser);

      analyser.fftSize = 256;
      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      setIsNext(true);

      const detectBlow = () => {
        analyser.getByteFrequencyData(dataArray);

        const average =
          dataArray.reduce((acc, val) => acc + val, 0) / bufferLength;

        if (average > 100 && !blowDetectedRef.current) {
          handleBlow();
        }
        requestAnimationFrame(detectBlow);
      };

      detectBlow();
    } catch (error) {
      console.error("Error accessing microphone:", error);
    }
  };

  useEffect(() => {
    addPositionCandle();
    return () => {
      if (audioContext) {
        audioContext.close();
      }
    };
  }, []);
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = 0.5;
      audioRef.current.play();
    }
  }, [isNext]);

  const addPositionCandle = () => {
    const minX = 0;
    const maxX = 300;
    const centerX = (minX + maxX) / 2;
    const number = 27;
    const tens = Math.floor(number / 10);
    const units = number % 10;
    const positions: { x: number; y: number }[] = [];

    if (tens > 0) {
      const stepXTens = tens > 1 ? 40 : 0;
      const startX = centerX - ((tens - 1) / 2) * stepXTens;
      for (let i = 0; i < tens; i++) {
        positions.push({
          x: startX + i * stepXTens,
          y: 40,
        });
      }
    }

    if (units > 0) {
      const stepXUnits = units > 1 ? 40 : 0;
      const startX = centerX - ((units - 1) / 2) * stepXUnits;
      for (let i = 0; i < units; i++) {
        positions.push({
          x: startX + i * stepXUnits,
          y: 0,
        });
      }
    }

    setElementPositions(positions);
  };
  return (
    <>
      {!isNext && (
        <div className="w-[100dvw] h-[100dvh] bg-pink-100 flex items-center justify-center relative">
          <div className=" absolute top-8 text-center ">
            <p className="neon-text text-4xl">Chạm vào hộp quà</p>
          </div>
          <div className="shake cursor-pointer" onClick={addPermission}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 64 64"
              width="100%"
              height="100%"
            >
              <rect x="8" y="24" width="48" height="32" fill="#FF4B4B" />
              <rect x="28" y="24" width="8" height="32" fill="#FFD700" />

              <rect x="4" y="16" width="56" height="10" fill="#FF6F6F" />
              <rect x="30" y="16" width="4" height="10" fill="#FFD700" />

              <path d="M28 16c-4-8-12-8-12-4s8 4 12 4z" fill="#FFD700" />
              <path d="M36 16c4-8 12-8 12-4s-8 4-12 4z" fill="#FFD700" />
            </svg>
          </div>
        </div>
      )}
      {isNext && (
        <div className="w-[100dvw] h-[100dvh] bg-pink-100">
          <audio
            ref={audioRef}
            src={"./sounds/audio.mp3"}
            loop={true}
            style={{ visibility: "hidden" }}
          />
          <audio
            ref={explosionRef}
            src={"./sounds/explosion0.mp3"}
            loop={true}
            style={{ visibility: "hidden" }}
          />

          <Cake
            elementPositions={elementPositions}
            blowDetected={blowDetected}
          />
        </div>
      )}
      {blowDetected && (
        <Fireworks
          ref={ref}
          options={{
            opacity: 1,
          }}
          style={{
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            position: "fixed",
            background: "#000",
            zIndex: 100,
            opacity: 0.9,
          }}
        />
      )}
    </>
  );
};

export default Permission;
