import { useState, useRef } from "react";

export default function useSpinWheel({ dictionaryItems, sounds, onSpinComplete }) {
  const [wheelPresent, setWheelPresent] = useState(false);
  const [wheelData, setWheelData] = useState({});
  const [winningNumber, setWinningNumber] = useState();
  const [mustSpin, setMustSpin] = useState(false);
  const consideredRule = useRef();

  function finishSpinning() {
    sounds.playHorn();
    setTimeout(() => {
      setMustSpin(false);
      setWheelPresent(false);
      onSpinComplete(consideredRule.current, wheelData[winningNumber].option);
    }, 2 * 1000);
  }

  function updateRule(order) {
    let data = [];
    for (let i = 0; i < 10; i++) {
      let prizeChars = [];
      for (let j = 0; j < 3; j++) {
        const randInd = Math.floor(
          Math.random() * dictionaryItems.length,
        );
        prizeChars.push(dictionaryItems[randInd].character);
      }
      data.push({ option: prizeChars.join("") });
    }
    consideredRule.current = order;
    setWheelData(data);
    setWinningNumber(Math.floor(Math.random() * data.length));
    setWheelPresent(true);
    sounds.playSpin();

    requestAnimationFrame(() => {
      setMustSpin(true);
    });
  }

  return {
    wheelPresent,
    wheelData,
    winningNumber,
    mustSpin,
    updateRule,
    finishSpinning,
  };
}
