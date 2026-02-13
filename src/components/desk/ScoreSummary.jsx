import { motion, AnimatePresence } from "framer-motion";
import "../popups/Popup.css";

export default function ScoreSummary({
  visible,
  ordersCorrect,
  ordersAttempted,
  points,
  onContinue,
}) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="popups"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <div className="popup">
            <motion.section
              className="popup-data score-summary"
              initial={{ opacity: 0, scale: 0.2 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.25 }}
            >
              <h2 className="score-title">All Orders Complete!</h2>
              <div className="score-stats">
                <div className="score-stat">
                  <span className="score-label">Orders Correct</span>
                  <span className="score-value">
                    {ordersCorrect} / {ordersAttempted}
                  </span>
                </div>
                <div className="score-stat">
                  <span className="score-label">Final Score</span>
                  <span className="score-value score-points">{points}</span>
                </div>
              </div>
              <div className="popup-btns popup-btns-bottom">
                <button onClick={onContinue}>Continue</button>
              </div>
            </motion.section>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
