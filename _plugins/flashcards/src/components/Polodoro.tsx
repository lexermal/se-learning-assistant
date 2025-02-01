import React, { useState, useEffect } from 'react';
import { FaPauseCircle, FaPlayCircle, FaStopCircle } from 'react-icons/fa';
import { useEventEmitter } from 'shared-components';

interface Session {
  type: 'Study' | 'Relax';
  duration: number; // in minutes
}

const sessions: Session[] = [
  { type: 'Study', duration: 10 },
  { type: 'Relax', duration: 5 },
  { type: 'Study', duration: 10 },
  { type: 'Relax', duration: 5 },
  { type: 'Study', duration: 10 },
  { type: 'Relax', duration: 10 },
];

const Pomodoro: React.FC = () => {
  const [currentSession, setCurrentSession] = useState<number>(0);
  const [timeLeft, setTimeLeft] = useState<number>(sessions[0].duration * 60);
  const [isPaused, setIsPaused] = useState<boolean>(true); // Start with timer paused
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const { on } = useEventEmitter();

  // Add autostart timer ref
  const autoStartTimerRef = React.useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const handlePomodoroStart = () => {
      // console.log("pomodoro_start");

      if (isCompleted) {
        return;
      }

      if (sessions[currentSession].type === 'Relax') {
        // Start the next Study session
        const nextStudySessionIndex = sessions.findIndex(
          (session, index) => session.type === 'Study' && index > currentSession
        );

        if (nextStudySessionIndex !== -1) {
          setCurrentSession(nextStudySessionIndex);
          setTimeLeft(sessions[nextStudySessionIndex].duration * 60);
          setIsCompleted(false);
          setIsPaused(false); // Start the timer immediately
        } else {
          // If no more Study sessions, reset the timer
          resetTimer();
        }
      } else {
        setIsPaused(false);
      }
    };

    on("pomodoro_start", handlePomodoroStart);
    on("pomodoro_stop", resetTimer);

    // Cleanup the event listener on unmount
    return () => {
      // Assuming 'off' is available to remove the listener
      // Replace with the correct method if different
      // on.off("pomodoro_start", handlePomodoroStart);
    };
  }, [currentSession, isCompleted, on]);

  // Add new effect to handle auto-starting breaks
  useEffect(() => {
    if (isCompleted && !isPaused && sessions[currentSession].type === 'Study') {
      // Clear any existing timer
      if (autoStartTimerRef.current) {
        clearTimeout(autoStartTimerRef.current);
      }

      // Set new timer for auto-starting break
      autoStartTimerRef.current = setTimeout(() => {
        handleStartPause();
      }, 60000); // 1 minute
    }

    return () => {
      if (autoStartTimerRef.current) {
        clearTimeout(autoStartTimerRef.current);
      }
    };
  }, [isCompleted, currentSession]);

  const playSound = () => {
    const audio = new Audio('/plugins/flashcards/pomodoro.wav');
    audio.play().catch(e => {
      console.warn("Error playing audio:", e);
    });
  };

  useEffect(() => {
    let timer: NodeJS.Timeout | undefined;
    if (!isPaused && !isCompleted && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime <= 1) {
            clearInterval(timer);
            setIsCompleted(true);
            playSound();
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isPaused, isCompleted, timeLeft]);

  const handleStartPause = () => {
    if (isCompleted) {
      // Start next session
      if (currentSession < sessions.length - 1) {
        const nextSession = currentSession + 1;
        console.log({ nextSession, obj: sessions[nextSession] })
        setCurrentSession(nextSession);
        setTimeLeft(sessions[nextSession].duration * 60);
        setIsCompleted(false);
        setIsPaused(false); // Start the timer immediately
      } else {
        // All sessions completed
        resetTimer();
      }
    } else {
      // Toggle pause state
      setIsPaused((prevIsPaused) => !prevIsPaused);
    }
  };

  const resetTimer = () => {
    setCurrentSession(0);
    setTimeLeft(sessions[0].duration * 60);
    setIsPaused(true);
    setIsCompleted(false);
  };

  const currentSessionType = sessions[currentSession].type;
  const isStudySession = currentSessionType === 'Study';

  return (
    <div className={`rounded-t-md flex flex-row flex-wrap items-center p-1 md:border border-b-0 border-gray-800 dark:opacity-80 hover:opacity-100`}>
      <h2 className="text-sm md:text-xl mr-1 cursor-pointer" onClick={handleStartPause}>
        {isCompleted ? (
          <span className="animate-pulse">
            {isStudySession ? 'Time for a Break!' : 'Time to Study!'}
          </span>
        ) : (
          `${currentSessionType} ${Math.ceil(timeLeft / 60)} min`
        )}
      </h2>
      <div className="flex space-x-1 items-center">
        <div onClick={handleStartPause} className="cursor-pointer">
          {isCompleted ? (
            <FaPlayCircle size="20px" />
          ) : isPaused ? (
            <FaPlayCircle size="20px" />
          ) : (
            <FaPauseCircle size="20px" />
          )}
        </div>
        <div onClick={resetTimer} className="cursor-pointer">
          <FaStopCircle size="20px" />
        </div>
      </div>
    </div>
  );
};

export default Pomodoro;
