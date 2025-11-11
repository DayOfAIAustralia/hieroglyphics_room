import React, { useState, useRef } from 'react';

function TextHighlighter({children, isHighlighting, setIsHighlighting,
    setHighlightedText
}) {
    if (!isHighlighting) return <>{children}</>;
  
  // A ref to attach to our "box"
  const highlightableBoxRef = useRef(null);

  /**
   * This function runs whenever the user releases their mouse
   * button *inside* the highlightable box.
   */
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
      // Automatically turn off highlighting mode after a successful selection
    }
  };

  /**
   * This is where you would send the data to an API,
   * a parent component, etc.
   */

  return (
    <div>    
      <p>
        {isHighlighting &&
        'Highlight your point of confusion in the box below and then click the mail icon to send it to your AI assistant.'
        }
      </p>

      <div
        ref={highlightableBoxRef}
        onMouseUp={handleMouseUp}
        style={{
          border: `3px solid ${isHighlighting ? 'blue' : '#ccc'}`,
          padding: '1em',
          marginTop: '1em',
          borderRadius: '5px',
          // This CSS prevents text selection when highlighting is *off*
          userSelect: isHighlighting ? 'auto' : 'none',
        }}
      >
        {children}
      </div>

    </div>
  );
}

export default TextHighlighter;