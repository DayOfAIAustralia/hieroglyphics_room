import { useState, useEffect, useRef, useCallback, useLayoutEffect } from "react";

function getOrderTimerDuration(level) {
  return Math.max(10, 20 - (level - 1) * 5);
}

export default function useScoring({ currentlyPlaying, onTimerExpired, paused }) {
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [timerActive, setTimerActive] = useState(false);
  const orderTimerDurationRef = useRef(null);

  const [totalPoints, setTotalPoints] = useState(0);
  const [totalOrdersAttempted, setTotalOrdersAttempted] = useState(0);
  const [totalOrdersCorrect, setTotalOrdersCorrect] = useState(0);
  const [showFinalScore, setShowFinalScore] = useState(false);

  // Keep a ref to the latest callback so the timeout effect never goes stale
  const onTimerExpiredRef = useRef(onTimerExpired);
  useLayoutEffect(() => {
    onTimerExpiredRef.current = onTimerExpired;
  }, [onTimerExpired]);

  // Stop timer when not playing
  useEffect(() => {
    if (currentlyPlaying === false) {
      setTimerActive(false);
    }
  }, [currentlyPlaying]);

  // Countdown interval
  useEffect(() => {
    if (!timerActive || timeRemaining === null || timeRemaining <= 0 || paused) return;
    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          setTimerActive(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [timerActive, timeRemaining, paused]);

  // Timeout handler: notify Desk when timer reaches 0
  useEffect(() => {
    if (timeRemaining === 0) {
      onTimerExpiredRef.current();
    }
  }, [timeRemaining]);

  const startTimer = useCallback((level) => {
    const duration = getOrderTimerDuration(level);
    orderTimerDurationRef.current = duration;
    setTimeRemaining(duration);
    setTimerActive(true);
  }, []);

  const stopTimer = useCallback(() => {
    setTimerActive(false);
  }, []);

  const addCorrectOrder = useCallback((currentTimeRemaining, duration) => {
    const points = Math.round((100 * currentTimeRemaining) / duration);
    setTotalPoints((prev) => prev + points);
    setTotalOrdersCorrect((prev) => prev + 1);
    setTotalOrdersAttempted((prev) => prev + 1);
    setTimerActive(false);
  }, []);

  const addSkippedOrder = useCallback(() => {
    setTotalOrdersAttempted((prev) => prev + 1);
  }, []);

  const endGame = useCallback(() => {
    setShowFinalScore(true);
  }, []);

  const dismissScore = useCallback(() => {
    setShowFinalScore(false);
  }, []);

  return {
    timeRemaining,
    timerActive,
    startTimer,
    stopTimer,
    totalPoints,
    totalOrdersAttempted,
    totalOrdersCorrect,
    showFinalScore,
    addCorrectOrder,
    addSkippedOrder,
    endGame,
    dismissScore,
    orderTimerDurationRef,
  };
}
