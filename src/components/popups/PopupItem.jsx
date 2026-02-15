import { useEffect, useContext, useState } from "react";
import { LevelContext } from "../Context";
import useSound from "use-sound";
import Markdown from "react-markdown";
import { AnimatePresence, motion } from "framer-motion";
import { useWindowWidth, useWindowHeight } from "@react-hook/window-size";
import Confetti from "react-confetti";

import swooshSound from "../../assets/sounds/swoosh.wav";
import confettiSound from "../../assets/sounds/confetti.wav";

export default function PopupItem({
  text,
  buttons,
  updateDialogue,
  actions,
  ordersObj,
  setGameOver,
}) {
  const [orders, setOrders] = ordersObj;
  const [isTutorial, setIsTutorial] = useContext(LevelContext).isTutorial;
  const [startUpdate, setStartUpdate] = useContext(LevelContext).startUpdate;
  const [position, setPosition] = useState({});
  const [showTutorialArrow, setShowTutorialArrow] = useState(false);
  const [arrowLocation, setArrowLocation] = useState({});
  const [useButton, setUseButton] = useState(true);
  const [tutorialState, setTutorialState] =
    useContext(LevelContext).tutorialState;
  const [arrowRotation, setArrowRotation] = useState(0);
  const [arrowMoveDirection, setArrowMoveDirection] = useState("vertical");
  const [key, setKey] = useState(1);
  const [celebration, setCelebration] = useState(false);

  const [playSwoosh] = useSound(swooshSound);
  const [playConfetti] = useSound(confettiSound);

  // Non button progression for tutorial
  useEffect(() => {
    if (actions === 3 && tutorialState === "filled-paper") {
      updateDialogue(buttons[0].goto);
    } else if (actions === 5 && tutorialState === "stapled-response") {
      // User submitted their answer - advance to Tutorial Complete
      updateDialogue(buttons[0].goto);
    }
  }, [tutorialState, actions]);

  // Button progression
  useEffect(() => {
    if (actions === 0) {
      setIsTutorial(true);
      setUseButton(true);

      setShowTutorialArrow(true);
      playSwoosh();
      // Order is now created automatically by Desk.jsx

      setPosition({ top: "25%", left: "10%", right: "auto", bottom: "auto" });
      setArrowLocation({
        top: "auto",
        left: "auto",
        right: "30%",
        bottom: "45%",
      });
      setArrowRotation(180);
      setArrowMoveDirection("horizontal");
    } else if (actions === 1) {
      setUseButton(true);
      setShowTutorialArrow(true);
      playSwoosh();
      setArrowLocation({
        top: "40%",
        left: "5%",
        right: "auto",
        bottom: "auto",
      });
      setArrowRotation(90);
      setArrowMoveDirection("vertical");
      setPosition({ top: "20%", left: "0%", right: "auto", bottom: "40%" });
    } else if (actions === 2) {
      setUseButton(true);
      setShowTutorialArrow(true);
      playSwoosh();
      setArrowLocation({
        top: "auto",
        left: "auto",
        right: "35%",
        bottom: "35%",
      });
      setArrowRotation(0);
      setArrowMoveDirection("horizontal");
      setPosition({ top: "25%", left: "auto", right: "10%", bottom: "auto" });
    } else if (actions === 3) {
      setShowTutorialArrow(false);
      setUseButton(false);
      setPosition({ top: "35%", left: "auto", right: "10%", bottom: "auto" });
    } else if (actions === 4) {
      setShowTutorialArrow(true);
      setArrowLocation({
        top: "auto",
        left: "60%",
        right: "auto",
        bottom: "38%",
      });
      setArrowRotation(180);

      setPosition({ top: "30%", left: "auto", right: "25%", bottom: "auto" });
    } else if (actions === 5) {
      setUseButton(false);
      setArrowLocation({
        top: "auto",
        left: "12%",
        right: "auto",
        bottom: "10%",
      });
      setArrowRotation(320);
      setArrowMoveDirection("north-east");

      setPosition({ top: "35%", left: "0", right: "auto", bottom: "auto" });
    } else if (actions === 6) {
      setArrowLocation({
        top: "auto",
        left: "auto",
        right: "22%",
        bottom: "22%",
      });
      setArrowRotation(0);
      setArrowMoveDirection("horizontal");

      setPosition({ top: "30%", left: "auto", right: "0", bottom: "auto" });
    } else if (actions === 7) {
      // removed
    } else if (actions === 8) {
      // removed
    } else if (actions === 9) {
      setUseButton(true);
      setShowTutorialArrow(false);

      setStartUpdate(true);
    } else if (actions === 10) {
      updateCelebration();
      // Preloading images for dialogue sections
    } else if (actions === 11) {
      new Image().src = "/cpuDiagram.png";
    } else if (actions === 12) {
      new Image().src = "/neuralNetwork.png";
    }
  }, [actions]);

  // Handles movement of arrow during tutorial
  const moveDistance = 15;
  let movementKeyframes;
  switch (arrowMoveDirection) {
    case "vertical":
      movementKeyframes = { y: [0, -moveDistance, 0] }; // Up
      break;
    case "horizontal":
      movementKeyframes = { x: [0, moveDistance, 0] }; // Right
      break;

    case "north-east":
      movementKeyframes = {
        y: [0, -moveDistance, 0], // Moves up
        x: [0, moveDistance, 0], // Moves right
      };
      break;

    default:
      // No movement if direction is unknown
      movementKeyframes = {};
  }

  const handleArrowClick = () => {};

  const arrow = (
    <motion.img
      src="/arrow.png"
      key={arrowRotation}
      alt="glowing arrow"
      style={{
        ...arrowLocation,
        cursor: "default",
      }}
      className="tutorial-arrow"
      onClick={handleArrowClick}
      initial={{
        rotate: arrowRotation,
      }}
      animate={{
        filter: [
          "drop-shadow(0 0 4px red)",
          "drop-shadow(0 0 8px red)",
          "drop-shadow(0 0 4px red)",
        ],
        ...movementKeyframes,
      }}
      transition={{
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    />
  );

  // Changes placement of popup during tutorial
  let popupStyle;
  let dataStyle;
  let btnClass = "popup-btns-bottom";
  if (actions !== undefined && actions < 7) {
    popupStyle = {
      position: "absolute",
      width: "auto",
      height: "auto",
      top: position.top,
      left: position.left,
      right: position.right,
      bottom: position.bottom,
    };
  }

  const fadeVariants = {
    hidden: { opacity: 0, scale: 0.2 }, // Start smaller and invisible
    visible: { opacity: 1, scale: 1, transition: { duration: 0.2 } }, // Fade in, normal size
    exit: { opacity: 0, scale: 0.8, transition: { duration: 0.15 } }, // Fade out, shrink slightly
  };

  const buttonElements = buttons.map((btn) => {
    return (
      <button key={btn.id} onClick={() => updateDialogue(btn.goto)}>
        {btn.text}
      </button>
    );
  });

  // End of game celebration and reset functions
  const confetti = (
    <Confetti width={useWindowWidth()} height={useWindowHeight()} />
  );

  function updateCelebration() {
    setKey((prev) => prev + 1);
    playConfetti();
    setCelebration(true);
    setGameOver(true);
  }

  function resetGame() {
    window.location.reload();
  }

  return (
    <>
      {showTutorialArrow && arrow}
      {celebration && confetti}
      <div className="popup" key={"dialogue-box"} style={popupStyle}>
        <section className="popup-data" style={dataStyle}>
          <div className="popup-text">
            <div className="markdown-text-wrapper">
              <Markdown>{text.replace(/\n/g, "  \n")}</Markdown>
            </div>
          </div>

          {/* Button for final celebration and end of game */}
          {celebration && (
            <motion.div
              key={`end-button-${key}`}
              className={`popup-btns ${btnClass}`}
              variants={fadeVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <button onClick={resetGame}>{"Reset Game 🎮"}</button>
            </motion.div>
          )}

          <AnimatePresence mode="wait">
            {" "}
            {/* 'mode="wait"' ensures one animation finishes before the next starts if both change */}
            {useButton && (
              <motion.div
                key={"help-btn"}
                className={`popup-btns ${btnClass}`}
                variants={fadeVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                {buttonElements}
              </motion.div>
            )}
          </AnimatePresence>
        </section>
      </div>
    </>
  );
}
