export default function TimerDisplay({ timerActive, timeRemaining, totalPoints, visible }) {
  if (!visible) return null;
  return (
    <div className="level-timer">
      {timerActive && timeRemaining !== null && (
        <div
          className={`timer-display${timeRemaining <= 5 ? " timer-critical" : ""}`}
        >
          <span>{timeRemaining}s</span>
        </div>
      )}
      <div className="points-display">
        <span>{totalPoints} pts</span>
      </div>
    </div>
  );
}
