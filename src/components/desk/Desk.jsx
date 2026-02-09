import {
  closestCenter,
  DndContext,
  useSensor,
  useSensors,
  PointerSensor,
  KeyboardSensor,
  TouchSensor,
  DragOverlay,
} from "@dnd-kit/core";
import { restrictToWindowEdges } from "@dnd-kit/modifiers";
import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useContext,
  useLayoutEffect,
} from "react";
import { Wheel } from "react-custom-roulette-r19";

import DictionaryUI from "./DictionaryUI.jsx";
import SplitPaper from "./SplitPaper.jsx";
import RuleBook from "./RuleBook.jsx";
import ScoreSummary from "./ScoreSummary.jsx";
import TimerDisplay from "./TimerDisplay.jsx";
import OrderStack from "./OrderStack.jsx";
import { LevelContext } from "../Context.jsx";

import useSoundEffects from "./hooks/useSoundEffects.jsx";
import usePixelHover from "./hooks/usePixelHover.jsx";
import useScoring from "./hooks/useScoring.jsx";
import useCharacterDragDrop, {
  characterContainer,
} from "./hooks/useCharacterDragDrop.jsx";
import useSpinWheel from "./hooks/useSpinWheel.jsx";

export default function Desk() {
  const sounds = useSoundEffects();

  const [tutorialState, setTutorialState] =
    useContext(LevelContext).tutorialState;
  const [startUpdate, setStartUpdate] = useContext(LevelContext).startUpdate;
  const [currentlyPlaying, setCurrentlyPlaying] =
    useContext(LevelContext).currentlyPlaying;
  const [level, setLevel] = useContext(LevelContext).level;
  const [xpStartLocation, setXpStartLocation] =
    useContext(LevelContext).xpStartLocation;
  const [isTutorial] = useContext(LevelContext).isTutorial;

  // New state for split paper order system
  const [activeOrder, setActiveOrder] = useState(null);
  const [orderAnimationPhase, setOrderAnimationPhase] = useState("idle");
  // Phases: 'idle' | 'sliding-in' | 'placing-tiles' | 'ready' | 'submitting'
  const [questionTiles, setQuestionTiles] = useState([]);
  const [orderQueue, setOrderQueue] = useState([]);
  const orderQueueRef = useRef([]);
  const completedOrderIdsRef = useRef(new Set());

  // All potential rules for the first few levels are predefined
  const [rules, setRules] = useState({
    inactive: [
      { id: 1, order: "𓂀𓏐𓈖", answer: "𓆓𓃾𓆣" },
      { id: 2, order: "𓇋𓏏𓋹", answer: "𓆤𓆣𓇯" },
      { id: 3, order: "𓃹𓉐𓏠", answer: "𓂧𓀀𓆛" },
      { id: 4, order: "𓆼𓂝𓈟", answer: "𓇯𓆰" },
      { id: 5, order: "𓂻𓈗𓅓", answer: "𓄿𓁹𓅨" },
      { id: 6, order: "𓆣𓅃𓆟", answer: "𓎛𓏲𓏐" },
      { id: 7, order: "𓈌𓊪𓌟", answer: "𓋴𓀭𓇳" },
      { id: 8, order: "𓅱𓉻𓎼", answer: "𓍿𓏛𓊽" },
      { id: 9, order: "𓊏𓌳𓋔", answer: "𓇳𓏐𓈟" },
      { id: 10, order: "𓎛𓊃𓏏", answer: "𓌰𓀁𓇋" },
      { id: 11, order: "𓇼𓆛𓅨", answer: "𓏏𓌄𓉐" },
      { id: 12, order: "𓆰𓊖𓍋", answer: "𓈗𓇯𓋹" },
      { id: 13, order: "𓇋𓂀𓆼", answer: "𓉐𓋴𓆤" },
      { id: 14, order: "𓅓𓎼𓀀", answer: "𓌰𓊽𓏐" },
      { id: 15, order: "𓊪𓃾𓇳", answer: "𓆓𓋹𓇋" },
      { id: 16, order: "𓉻𓅱𓇯", answer: "𓂝𓏐𓆛" },
    ],
    active: [{ id: 6, order: "𓊽𓉐𓉐", answer: "𓃾𓆓" }],
  });
  const [timerPaused, setTimerPaused] = useState(false);
  const [dictionaryZIndex, setDictionaryZIndex] = useState(10);
  const [rulebookZIndex, setRulebookZIndex] = useState(10);

  const dictionaryUIRef = useRef(null);
  const dictionaryImg = useRef(null);
  const ruleBookUIRef = useRef(null);
  const ruleBookImg = useRef(null);

  // --- Hook wiring ---

  const { isDictionaryHovered, isRuleBookHovered } = usePixelHover(
    dictionaryImg,
    ruleBookImg,
  );

  const dragDrop = useCharacterDragDrop({
    sounds,
    setTutorialState,
    dictionaryZIndex,
    rulebookZIndex,
    setDictionaryZIndex,
    setRulebookZIndex,
  });

  // Called by useScoring when the per-order timer reaches 0
  const handleTimerExpired = () => {
    if (!activeOrder) return;
    sounds.playWrong();
    scoring.addSkippedOrder();

    // Mark order as completed so it won't regenerate
    completedOrderIdsRef.current.add(activeOrder.id);

    setTimeout(() => {
      setActiveOrder(null);
      setQuestionTiles([]);
      setOrderAnimationPhase("idle");
      dragDrop.resetPaper();
    }, 500);
  };

  const scoring = useScoring({
    currentlyPlaying,
    onTimerExpired: handleTimerExpired,
    paused: timerPaused,
  });

  const handleSpinComplete = useCallback((order, newAnswer) => {
    setRules((prev) => ({
      ...prev,
      active: prev.active.map((rule) =>
        rule.order === order ? { ...rule, answer: newAnswer } : rule,
      ),
    }));
  }, []);

  const spinWheel = useSpinWheel({
    dictionaryItems: dragDrop.characters[characterContainer.DICTIONARY].items,
    sounds,
    onSpinComplete: handleSpinComplete,
  });

  useEffect(() => {
    setTimerPaused(spinWheel.wheelPresent);
  }, [spinWheel.wheelPresent]);

  // ORDER FUNCTIONS -----------------------------------------------------

  function populateQueue(activeRules) {
    // Filter out already-completed orders
    const pending = activeRules.filter(
      (r) => !completedOrderIdsRef.current.has(r.id),
    );
    const shuffled = [...pending].sort(() => Math.random() - 0.5);
    orderQueueRef.current = shuffled;
    setOrderQueue(shuffled);
    // For Level 0, preserve initial xpRequired (90) which includes the tutorial order
    // For other levels, calculate based on active rules
    if (level.level !== 0) {
      setLevel((prev) => ({ ...prev, xpRequired: activeRules.length * 30 }));
    }
  }

  // Fills the rulebook with new rules once the tutorial ends
  useEffect(() => {
    if (!startUpdate) return;
    moveInactiveRulesToActive(true);
  }, [startUpdate]);

  // Instantly creates an order after a new level starts
  useEffect(() => {
    if (currentlyPlaying === true) {
      generateNewOrder();
    }
  }, [currentlyPlaying]);

  // Shifts the next order off the queue and starts the slip animation
  const generateNewOrder = useCallback(() => {
    if (orderQueueRef.current.length === 0) return;
    if (activeOrder !== null) return;

    const selectedRule = orderQueueRef.current[orderQueueRef.current.length - 1];
    orderQueueRef.current = orderQueueRef.current.slice(0, -1);
    setOrderQueue([...orderQueueRef.current]);

    sounds.playSwoosh();

    const newOrder = {
      id: selectedRule.id,
      text: selectedRule.order,
      type: "orders",
    };

    // Start animation sequence
    setActiveOrder(newOrder);
    setOrderAnimationPhase("sliding-in");

    // After slip slides in, start placing tiles
    setTimeout(() => {
      setOrderAnimationPhase("placing-tiles");

      // Convert order text to individual tiles
      const tiles = [...newOrder.text];
      setQuestionTiles(tiles);

      // After tiles are placed, order is ready
      setTimeout(
        () => {
          setOrderAnimationPhase("ready");
          // Trigger tutorial state when first order is displayed
          if (tutorialState === null) {
            setTutorialState("order-received");
          }
          // Start per-order timer (non-tutorial only)
          if (startUpdate && !isTutorial) {
            scoring.startTimer(level.level);
          }
        },
        tiles.length * 150 + 300,
      ); // Wait for all tile animations
    }, 800); // Time for slip to slide in
  }, [activeOrder, startUpdate, isTutorial, level.level]);

  // Generate initial tutorial order when isTutorial becomes true (Step 1)
  useEffect(() => {
    // Only generate when: isTutorial is true, no active order yet, and rules exist
    if (
      isTutorial &&
      !startUpdate &&
      activeOrder === null &&
      rules.active?.length > 0
    ) {
      // Populate queue ref with tutorial rule so generateNewOrder can shift it
      orderQueueRef.current = [...rules.active];
      generateNewOrder();
    }
  }, [isTutorial, startUpdate, activeOrder, rules.active, generateNewOrder]);

  const savedCallback = useRef(generateNewOrder);

  useLayoutEffect(() => {
    savedCallback.current = generateNewOrder;
  }, [generateNewOrder]);

  // Handle submit button click
  const handleSubmit = useCallback(
    (e) => {
      if (!activeOrder || orderAnimationPhase !== "ready") return;

      const paperString = dragDrop.collectCharacters(
        dragDrop.characters[characterContainer.PAPER].items,
      );
      if (!paperString) return;

      setOrderAnimationPhase("submitting");

      const question = rules.active.find(
        (rule) => rule.order === activeOrder.text,
      );
      const xpGainedPerOrder = 30;

      // Check if answer is correct
      if (question && question.answer === paperString) {
        sounds.playDing();
        if (e) {
          setXpStartLocation({ x: e.clientX, y: e.clientY });
        }
        setLevel((prev) => ({
          ...prev,
          xp: prev.xp + xpGainedPerOrder,
        }));
        scoring.addCorrectOrder(
          scoring.timeRemaining,
          scoring.orderTimerDurationRef.current || 1,
        );

        // Mark order as completed so it won't reappear in queue
        completedOrderIdsRef.current.add(question.id);

        // Clear order and reset for next one
        setTimeout(() => {
          setActiveOrder(null);
          setQuestionTiles([]);
          setOrderAnimationPhase("idle");
          dragDrop.resetPaper();
        }, 500);
      } else {
        sounds.playWrong();
        // Wrong answer - just clear the paper, keep the order
        setTimeout(() => {
          dragDrop.resetPaper();
          setOrderAnimationPhase("ready");
        }, 500);
      }

      setTutorialState("stapled-response");
    },
    [
      activeOrder,
      orderAnimationPhase,
      dragDrop.characters,
      rules.active,
      scoring.timeRemaining,
    ],
  );

  // END ORDER FUNCTIONS -----------------------------------------------------

  // RULE FUNCTIONS -----------------------------------------------------

  // ORDER DELAY TIMER - only trigger when no active order
  const orderDelay = 1.5 * 1000;

  useEffect(() => {
    if (!currentlyPlaying) return;
    if (!startUpdate) return; // Don't run during tutorial
    if (activeOrder !== null) return;

    if (orderQueueRef.current.length === 0) {
      if (rules.inactive.length > 0) {
        moveInactiveRulesToActive();
      } else {
        // All rules exhausted — game over
        scoring.endGame();
        setCurrentlyPlaying(false);
        return;
      }
    }

    const tick = () => {
      savedCallback.current();
    };
    const interval = setInterval(tick, orderDelay);
    return () => clearInterval(interval);
  }, [currentlyPlaying, orderDelay, activeOrder, rules.inactive.length]);

  useEffect(() => {
    if (level.level === 0) return;
    // Clear existing orders and start fresh with correct count for new level
    completedOrderIdsRef.current = new Set();
    moveInactiveRulesToActive(true);
    if (level.level === 2) {
      setActiveOrder(null);
      setQuestionTiles([]);
      setOrderAnimationPhase("idle");
      dragDrop.resetPaper();
    }
  }, [level.level]);

  function moveInactiveRulesToActive(clearExisting = false) {
    const count = Math.min(level.level === 0 ? 2 : 5, rules.inactive.length);
    const take = rules.inactive.slice(0, count);
    const rest = rules.inactive.slice(count);
    const existingActive = clearExisting ? [] : rules.active;
    let newActive;
    if (level.level < 2) {
      newActive = [...existingActive, ...take];
    } else {
      newActive = take.map((rule) => ({
        id: rule.id,
        order: rule.order,
        answer: "???",
      }));
    }
    setRules({ active: newActive, inactive: rest });
    populateQueue(newActive);
  }

  // END RULE FUNCTIONS -----------------------------------------------------

  // DESK OBJECT INTERACTIONS ---------------------------------------------------

  function closeDictionary() {
    sounds.playBookClose();
    dictionaryUIRef.current.style.visibility = "hidden";
    dictionaryImg.current.src = "dictionary.png";
  }

  function closeRuleBook() {
    sounds.playBookClose();
    ruleBookUIRef.current.style.visibility = "hidden";
    ruleBookImg.current.src = "rules.png";
  }

  function openDictionary() {
    if (!startUpdate && tutorialState != "rulebook-open") return;
    const dictionaryEl = dictionaryUIRef.current;
    if (
      !dictionaryEl.style.visibility ||
      dictionaryEl.style.visibility === "hidden"
    ) {
      setTutorialState("dictionary-open");

      sounds.playBookOpen();
      dictionaryEl.style.visibility = "visible";
      dictionaryImg.current.src = "dictionaryOpen.png";
    }
  }

  function openRuleBook() {
    if (!startUpdate && tutorialState != "order-received") return;

    const ruleBookEl = ruleBookUIRef.current;
    if (
      !ruleBookEl.style.visibility ||
      ruleBookEl.style.visibility === "hidden"
    ) {
      setTutorialState("rulebook-open");

      sounds.playBookOpen();
      ruleBookEl.style.visibility = "visible";
      ruleBookImg.current.src = "rulesOpen.png";
    }
  }

  // END DESK OBJECT INTERACTIONS ---------------------------------------------------

  // Sensor used with DnD Kit to allow picking up tiles, dictionary, and rulebook
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor),
    useSensor(TouchSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
  );

  return (
    <>
      {/* Spinwheel for final level */}
      {spinWheel.wheelPresent && spinWheel.wheelData.length > 0 && (
        <div className="spinner-wheel">
          <Wheel
            mustStartSpinning={spinWheel.mustSpin}
            prizeNumber={spinWheel.winningNumber}
            data={spinWheel.wheelData}
            fontSize={24}
            backgroundColors={["#4bc1f5", "#f6cb69"]}
            textColors={["#000000ff"]}
            onStopSpinning={spinWheel.finishSpinning}
            spinDuration={0.45}
            disableInitialAnimation={true}
          />
        </div>
      )}

      {/* Order slips now appear on the paper via SplitPaper component */}

      {/* Desk for paper, and dictionary buttons */}
      <section id="desk">
        <DndContext
          collisionDetection={closestCenter}
          sensors={sensors}
          autoScroll={false}
          modifiers={[restrictToWindowEdges]}
          onDragStart={dragDrop.handleDragStart}
          onDragOver={dragDrop.handleDragOver}
          onDragEnd={dragDrop.handleCharacterDragEnd}
        >
          {/* Order stack */}
          <div className="orders">
            <TimerDisplay
              timerActive={scoring.timerActive}
              timeRemaining={scoring.timeRemaining}
              totalPoints={scoring.totalPoints}
              visible={startUpdate && !isTutorial}
            />
            <OrderStack orderQueue={orderQueue} visible={startUpdate} />
          </div>

          {/* Rulebook Space */}
          <button className="rules" onClick={openRuleBook}>
            <img
              src="rules.png"
              alt="rule book"
              ref={ruleBookImg}
              className={isRuleBookHovered ? "hovered" : ""}
            ></img>
            <RuleBook
              ref={ruleBookUIRef}
              rules={rules}
              updateRule={spinWheel.updateRule}
              zIndex={rulebookZIndex}
              onClose={closeRuleBook}
            />
          </button>

          {/* Paper Space - Split into question and answer zones */}
          <div className="workspace">
            <SplitPaper
              questionTiles={questionTiles}
              answerContainer={dragDrop.characters.find(
                (container) => container.id === "paper",
              )}
              handleTileClick={dragDrop.handleTileClick}
              onSubmit={handleSubmit}
              orderAnimationPhase={orderAnimationPhase}
              activeOrder={activeOrder}
              canSubmit={
                orderAnimationPhase === "ready" &&
                dragDrop.characters[characterContainer.PAPER].items.length > 0
              }
            />
          </div>

          {/* Dictionary Space */}
          <button className="dictionary" onClick={openDictionary}>
            <img
              src="dictionary.png"
              alt="character dictionary"
              ref={dictionaryImg}
              className={isDictionaryHovered ? "hovered" : ""}
            ></img>
            <DictionaryUI
              dictionary={dragDrop.characters.find(
                (container) => container.id === "dictionary",
              )}
              ref={dictionaryUIRef}
              rules={rules}
              zIndex={dictionaryZIndex}
              handleTileClick={dragDrop.handleTileClick}
              onClose={closeDictionary}
            />
          </button>

          {/* Handles what is seen in users hand and on tile droppable locations */}
          <DragOverlay
            dropAnimation={{
              duration: 150,
              easing: "cubic-bezier(0.18, 0.67, 0.6, 1.22)",
            }}
          >
            {dragDrop.activeId && dragDrop.getActiveItem() !== null ? (
              <dragDrop.CharacterOverlay className="draggable">
                {dragDrop.getActiveItem()?.character}
              </dragDrop.CharacterOverlay>
            ) : null}
          </DragOverlay>
        </DndContext>
      </section>

      <ScoreSummary
        visible={scoring.showFinalScore}
        ordersCorrect={scoring.totalOrdersCorrect}
        ordersAttempted={scoring.totalOrdersAttempted}
        points={scoring.totalPoints}
        onContinue={scoring.dismissScore}
      />
    </>
  );
}
