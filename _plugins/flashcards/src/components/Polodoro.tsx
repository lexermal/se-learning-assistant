import { useEventEmitter } from '@rimori/client';
import { useEffect, useState, useCallback } from 'react';

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
  { type: 'Relax', duration: 5 },
];

const Pomodoro: React.FC = () => {
  const { on } = useEventEmitter();
  const [currentSessionIndex, setCurrentSessionIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(sessions[0].duration * 60); // in seconds
  const [isActive, setIsActive] = useState(false);

  // Check if all sessions are completed
  const isCompleted = currentSessionIndex >= sessions.length;

  // Get current session or first session if completed
  const currentSession = isCompleted ? sessions[0] : sessions[currentSessionIndex];
  const currentSessionType = currentSession.type;

  const playSound = useCallback(() => {
    const audio = new Audio('pomodoro.wav');
    audio.play().catch(e => {
      console.warn("Error playing audio:", e);
    });
  }, []);

  const resetSession = useCallback(() => {
    setCurrentSessionIndex(0);
    setTimeLeft(sessions[0].duration * 60);
    setIsActive(true);
  }, []);

  const moveToNextSession = useCallback((sound: boolean = true) => {
    sound && playSound();
    const nextIndex = currentSessionIndex + 1;
    setCurrentSessionIndex(nextIndex);

    // If we've reached the end, stop the timer
    if (nextIndex >= sessions.length) {
      setIsActive(false);
    } else {
      setTimeLeft(sessions[nextIndex].duration * 60);
    }
  }, [currentSessionIndex, playSound]);

  const handleStartPause = useCallback(() => {
    if (isCompleted) {
      resetSession();
    } else {
      setIsActive(!isActive);
    }
  }, [isActive, isCompleted, resetSession]);

  // Timer logic
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isActive && !isCompleted) {
      interval = setInterval(() => {
        setTimeLeft(prevTime => {
          if (prevTime <= 1) {
            moveToNextSession();
            return 0; // Will be updated by moveToNextSession if needed
          }
          return prevTime - 1;
        });
      }, 1000); // Update every second
    } else if (interval) {
      clearInterval(interval);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, moveToNextSession, isCompleted]);

  // Event emitter handlers
  useEffect(() => {
    on("pomodoro_start", () => {
      if (isCompleted) {
        resetSession();
      } else {
        if (currentSessionType === "Relax") {
          moveToNextSession(false);
        }
        setIsActive(true);
      }
    });

    on("pomodoro_stop", () => setIsActive(false));

    return () => {
      // Cleanup if needed
    };
  }, [on, currentSessionType, moveToNextSession, isCompleted, resetSession]);

  let displayText = `${currentSessionType} ${Math.ceil(timeLeft / 60)} min`;

  if (isCompleted) {
    displayText = "New study session?";
  } else if (!isActive) {
    displayText = "Continue?";
  }

  return (
    <div className={`rounded-t-md flex flex-row flex-wrap items-center p-1 md:border border-b-0
     border-gray-800 dark:opacity-80 hover:opacity-100 ${(!isActive || isCompleted) ? 'animate-pulse' : ''}`}>
      <h2 className="text-sm md:text-xl mr-1 cursor-pointer" onClick={handleStartPause}>
        {displayText}
      </h2>
    </div>
  );
};

export default Pomodoro;
