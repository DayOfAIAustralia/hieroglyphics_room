export default function TimerDisplay({
  timerActive,
  timeRemaining,
  totalPoints,
  visible,
  showTimer = true,
  showPoints = true,
}) {
  if (!visible) return null;

  const seconds = timerActive && timeRemaining !== null ? timeRemaining : 0;
  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");
  const isCritical =
    timerActive && timeRemaining !== null && timeRemaining <= 5;

  return (
    <div className="level-timer">
      {showTimer && (
        <div className={`timer-display${isCritical ? " timer-critical" : ""}`}>
          <span>
            {mm}:{ss}
          </span>
        </div>
      )}
      {showPoints && (
        <div className="points-display">
          <span>{totalPoints} pts</span>
        </div>
      )}
    </div>
  );
}
