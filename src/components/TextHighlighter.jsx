import React, { useRef } from 'react';
// Import motion and AnimatePresence from framer-motion
import { motion, AnimatePresence } from 'framer-motion';

/**
 * These are "variants" for the helper text.
 * It will animate from hidden (0 height, 0 opacity)
 * to visible (auto height, 1 opacity).
 */
const pVariants = {
  hidden: { opacity: 0, height: 0, y: -20, marginBottom: 0 },
  visible: {
    opacity: 1,
    height: 'auto',
    y: 0,
    marginBottom: '1em', // This was your marginTop
    transition: { duration: 0.3, ease: 'easeInOut' },
  },
};

/**
 * These are variants for the highlightable box.
 * It will animate between these two states.
 */
const boxVariants = {
  // State when NOT highlighting
  inactive: {
    borderColor: 'rgba(204, 204, 204, 0)', // Start transparent
    transform: 'scale(1)',
    boxShadow: '0px 0px 0px rgba(0, 0, 0, 0)',
    userSelect: 'none',
    padding: "0.25em",

  },
  // State WHEN highlighting
  active: {
    borderColor: 'rgba(59, 130, 246, 1)', // A nice blue
    transform: 'scale(1.02)', // "Grow" slightly
    boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
    userSelect: 'auto',
    padding: "1em",
  },
};

function TextHighlighter({
  children,
  isHighlighting,
  // We no longer need setIsHighlighting, the parent controls this
  setHighlightedText,
}) {
  const highlightableBoxRef = useRef(null);

  const handleMouseUp = () => {
    // Do nothing if highlighting mode is off
    if (!isHighlighting) {
      return;
    }

    const selection = window.getSelection();
    const selectedText = selection.toString().trim();

    // Ensure the selection isn't empty and is fully *within* our ref'd box
    if (
      selectedText &&
      highlightableBoxRef.current &&
      selection.anchorNode &&
      highlightableBoxRef.current.contains(selection.anchorNode) &&
      highlightableBoxRef.current.contains(selection.focusNode)
    ) {
      // Save the text
      setHighlightedText(selectedText);
      // You could also have the parent turn off highlighting here
      // by calling a prop like `onHighlightComplete()`
    }
  };

  return (
    <div>
      {/* AnimatePresence handles the "enter" and "exit"
        of the helper text component.
      */}
      <AnimatePresence>
        {isHighlighting && (
          <motion.p
            variants={pVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
          >
            Highlight your point of confusion in the box below...
          </motion.p>
        )}
      </AnimatePresence>

      {/* This motion.div is your main box.
        It doesn't enter/exit, it just animates
        between the "active" and "inactive" states.
      */}
      <motion.div
        ref={highlightableBoxRef}
        onMouseUp={handleMouseUp}
        
        // Tell motion to animate between variants
        variants={boxVariants}
        animate={isHighlighting ? 'active' : 'inactive'}
        transition={{ duration: 0.3, ease: 'easeOut' }}

        style={{
          borderWidth: '3px',
          borderStyle: 'solid',
          borderRadius: '5px',
        }}
      >
        {children}
      </motion.div>
    </div>
  );
}

export default TextHighlighter;