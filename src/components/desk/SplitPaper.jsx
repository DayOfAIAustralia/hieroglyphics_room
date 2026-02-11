import { SortableContext } from "@dnd-kit/sortable";
import { motion, AnimatePresence } from "framer-motion";
import Droppable from "../base_dnd/Droppable";
import SortableDraggable from "../base_dnd/SortableDraggable";
import TimerDisplay from "./TimerDisplay.jsx";

export default function SplitPaper({
  questionTiles,
  answerContainer,
  handleTileClick,
  onSubmit,
  orderAnimationPhase,
  activeOrder,
  canSubmit,
  incorrectShake,
  timerActive,
  timeRemaining,
  timerVisible,
}) {
  const answerItems = answerContainer.items;

  // Render the answer tiles (draggable)
  const answerTiles = answerItems.map((word) => {
    return (
      <SortableDraggable
        layoutId={`tile-${word.character}-${word.id}`}
        key={word.id}
        id={word.id}
        className="character"
        type="character"
        onClick={() => handleTileClick(word.id, word.character, "paper")}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        {word.character}
      </SortableDraggable>
    );
  });

  // Render the question tiles (non-draggable, displayed in question zone)
  const questionTileElements = questionTiles.map((tile, index) => (
    <motion.div
      key={`question-${index}`}
      className="question-tile"
      initial={{ opacity: 0, scale: 0.5, y: -20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{
        delay: index * 0.15,
        type: "spring",
        stiffness: 300,
        damping: 25,
      }}
    >
      <span className="character">{tile}</span>
    </motion.div>
  ));

  return (
    <div className={`split-paper ${incorrectShake ? "paper-shake" : ""}`}>
      {/* Order slip animation */}
      <AnimatePresence>
        {(orderAnimationPhase === "sliding-in" ||
          orderAnimationPhase === "placing-tiles") &&
          activeOrder && (
            <motion.div
              className="order-slip-incoming"
              initial={{ x: "-120%", y: "50%", opacity: 1 }}
              animate={{
                x: "5%",
                y: "-150%",
                opacity: orderAnimationPhase === "placing-tiles" ? 0 : 1,
              }}
              exit={{ opacity: 0 }}
              transition={{
                type: "spring",
                stiffness: 100,
                damping: 15,
                opacity: { duration: 0.3 },
              }}
            >
              <div className="slip-content">
                <span className="slip-label">New Order:</span>
                <span className="order-character">{activeOrder.text}</span>
              </div>
            </motion.div>
          )}
      </AnimatePresence>

      {/* Question Zone - Top half */}
      <div className="paper-question-zone">
        <span className="zone-label">Order:</span>
        <div className="question-tiles-container">
          <AnimatePresence>
            {orderAnimationPhase === "ready" && questionTileElements}
          </AnimatePresence>
        </div>
      </div>

      {/* Timer - just above divider */}
      <div className="paper-timer">
        <TimerDisplay
          timerActive={timerActive}
          timeRemaining={timeRemaining}
          visible={timerVisible}
          showPoints={false}
        />
      </div>

      {/* Divider */}
      <div className="zone-divider"></div>

      {/* Answer Zone - Bottom half */}
      <Droppable id={answerContainer.id} className="paper-answer-zone">
        <span className="zone-label">Your Answer:</span>
        <SortableContext items={answerItems.map((item) => item.id)}>
          <div className="answer-tiles-container">{answerTiles}</div>
        </SortableContext>
      </Droppable>

      {/* Submit Button */}
      <button
        className="paper-submit-btn"
        onClick={onSubmit}
        disabled={!canSubmit}
      >
        Submit
      </button>

      <AnimatePresence>
        {incorrectShake && (
          <motion.div
            className="incorrect-feedback"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.2 }}
          >
            Try again!
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
