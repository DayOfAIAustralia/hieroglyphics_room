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
import { arrayMove } from "@dnd-kit/sortable";
import { restrictToWindowEdges } from "@dnd-kit/modifiers";
import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useContext,
  useLayoutEffect,
  createRef,
} from "react";
import { v4 as newId } from "uuid";
import { Wheel } from "react-custom-roulette-r19";

import useSound from "use-sound";
import spinSound from "../../assets/sounds/spin.wav";
import bookOpenSound from "../../assets/sounds/bookOpen.wav";
import bookCloseSound from "../../assets/sounds/bookClose.wav";
import swooshSound from "../../assets/sounds/swoosh.wav";
import tileSound from "../../assets/sounds/tile.wav";
import hornSound from "../../assets/sounds/confetti.wav";

import DictionaryUI from "./DictionaryUI.jsx";
import SplitPaper from "./SplitPaper.jsx";
import RuleBook from "./RuleBook.jsx";
import { LevelContext } from "../Context.jsx";

import dingSound from "../../assets/sounds/ding.wav";
import wrongSound from "../../assets/sounds/wrong.wav";

const characterContainer = {
  DICTIONARY: 0,
  PAPER: 1,
};

export default function Desk() {
  const [playSpin] = useSound(spinSound);
  const [playBookOpen] = useSound(bookOpenSound);
  const [playBookClose] = useSound(bookCloseSound);
  const [playSwoosh] = useSound(swooshSound);
  const [playTile] = useSound(tileSound);
  const [playHorn] = useSound(hornSound);
  const [playDing] = useSound(dingSound);
  const [playWrong] = useSound(wrongSound);

  const [tutorialState, setTutorialState] =
    useContext(LevelContext).tutorialState;
  const [startUpdate, setStartUpdate] = useContext(LevelContext).startUpdate;
  const [currentlyPlaying, setCurrentlyPlaying] =
    useContext(LevelContext).currentlyPlaying;
  const [level, setLevel] = useContext(LevelContext).level;
  const [xpStartLocation, setXpStartLocation] =
    useContext(LevelContext).xpStartLocation;
  const [isTutorial] = useContext(LevelContext).isTutorial;

  const [wheelPresent, setWheelPresent] = useState(false);
  const [wheelData, setWheelData] = useState({});
  const [winningNumber, setWinningNumber] = useState();
  const [activeId, setActiveId] = useState(null);
  const [parentDisabled, setParentDisabled] = useState(false);

  // New state for split paper order system
  const [activeOrder, setActiveOrder] = useState(null);
  const [orderAnimationPhase, setOrderAnimationPhase] = useState("idle");
  // Phases: 'idle' | 'sliding-in' | 'placing-tiles' | 'ready' | 'submitting'
  const [questionTiles, setQuestionTiles] = useState([]);

  const dictionaryUIRef = useRef(null);
  const dictionaryImg = useRef(null);
  const ruleBookUIRef = useRef(null);
  const ruleBookImg = useRef(null);
  const consideredRule = useRef();

  const [isDictionaryHovered, setIsDictionaryHovered] = useState(false);
  const [isRuleBookHovered, setIsRuleBookHovered] = useState(false);

  const [mustSpin, setMustSpin] = useState(false);

  // Dictionary comes preloaded with all potential values
  const [characters, setCharacters] = useState([
    {
      id: "dictionary",
      items: [
        { id: "1", character: "𓀀" },
        { id: "2", character: "𓁹" },
        { id: "3", character: "𓂀" },
        { id: "4", character: "𓂝" },
        { id: "5", character: "𓂧" },
        { id: "6", character: "𓂻" },
        { id: "7", character: "𓃭" },
        { id: "8", character: "𓃹" },
        { id: "9", character: "𓃾" },
        { id: "10", character: "𓃒" },
        { id: "11", character: "𓅃" },
        { id: "12", character: "𓅓" },
        { id: "13", character: "𓅱" },
        { id: "14", character: "𓅨" },
        { id: "15", character: "𓆓" },
        { id: "16", character: "𓆤" },
        { id: "17", character: "𓆣" },
        { id: "18", character: "𓆛" },
        { id: "19", character: "𓆰" },
        { id: "20", character: "𓆼" },
        { id: "21", character: "𓇋" },
        { id: "22", character: "𓇳" },
        { id: "23", character: "𓇼" },
        { id: "24", character: "𓈖" },
        { id: "25", character: "𓈗" },
        { id: "26", character: "𓈟" },
        { id: "27", character: "𓉐" },
        { id: "28", character: "𓊖" },
        { id: "29", character: "𓊏" },
        { id: "30", character: "𓊪" },
        { id: "31", character: "𓋹" },
        { id: "32", character: "𓊽" },
        { id: "33", character: "𓎼" },
        { id: "34", character: "𓌟" },
        { id: "35", character: "𓍿" },
        { id: "36", character: "𓌳" },
        { id: "37", character: "𓌰" },
        { id: "38", character: "𓋴" },
        { id: "39", character: "𓎛" },
        { id: "40", character: "𓏏" },
        { id: "41", character: "𓏠" },
        { id: "42", character: "𓏲" },
        { id: "43", character: "𓏛" },
        { id: "44", character: "𓀭" },
        { id: "45", character: "𓁐" },
        { id: "46", character: "𓄿" },
        { id: "47", character: "𓅆" },
        { id: "48", character: "𓅨" },
        { id: "49", character: "𓆙" },
        { id: "50", character: "𓆟" },
        { id: "51", character: "𓇯" },
        { id: "52", character: "𓈌" },
        { id: "53", character: "𓉻" },
        { id: "54", character: "𓊃" },
        { id: "55", character: "𓋔" },
        { id: "56", character: "𓌄" },
        { id: "57", character: "𓊽" },
        { id: "58", character: "𓎛" },
        { id: "59", character: "𓏐" },
        { id: "60", character: "𓐍" },
      ],
    },
    {
      id: "paper",
      items: [],
    },
  ]);

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
  const [seenRules, setSeenRules] = useState([]);

  const [dictionaryZIndex, setDictionaryZIndex] = useState(10);
  const [rulebookZIndex, setRulebookZIndex] = useState(10);

  // ORDER FUNCTIONS -----------------------------------------------------

  // Fills the rulebook with new rules once the tutorial ends
  useEffect(() => {
    if (!startUpdate) return;
    // Removes tutorial example
    setRules((prev) => {
      return { inactive: prev.inactive, active: [] };
    });
    moveInactiveRulesToActive();
  }, [startUpdate]);

  // Instantly creates an order after a new level starts
  useEffect(() => {
    if (currentlyPlaying === true) {
      generateNewOrder();
    }
  }, [currentlyPlaying]);

  // Creates the order slips the user interacts with, ensures no duplicate orders will be generated
  // until all options are exhausted
  const generateNewOrder = useCallback(() => {
    if (!rules.active?.length) return;

    // Only generate if no active order exists
    if (activeOrder !== null) return;

    let currentSeenRules = seenRules;

    if (seenRules.length >= rules.active.length) {
      currentSeenRules = [];
      setSeenRules([]); // Schedule the UI update for the reset
    }

    // Finds all the rules that are seen and not seen
    const allIndices = rules.active.map((item) => item.id);
    const seenIndices = currentSeenRules.map((item) => item.id);

    let availableIndices = allIndices.filter((i) => !seenIndices.includes(i));

    if (availableIndices.length === 0) {
      currentSeenRules = [];
      setSeenRules([]);
      availableIndices = allIndices; // Reset available pool
    }

    const randomIndex = Math.floor(Math.random() * availableIndices.length);
    const selectedRuleId = availableIndices[randomIndex];
    const selectedRule = rules.active.find(
      (elem) => elem.id === selectedRuleId,
    );

    // safety to prevent crash
    if (!selectedRule) {
      console.error("Could not find rule with ID:", selectedRuleId);
      return;
    }

    playSwoosh();

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
        },
        tiles.length * 150 + 300,
      ); // Wait for all tile animations
    }, 800); // Time for slip to slide in

    // Update Seen Rules
    setSeenRules((prev) => {
      if (currentSeenRules.length === 0) {
        return [selectedRule];
      }
      return [...prev, selectedRule];
    });
  }, [rules.active, activeOrder, seenRules]);

  // Generate initial tutorial order when isTutorial becomes true (Step 1)
  useEffect(() => {
    // Only generate when: isTutorial is true, no active order yet, and rules exist
    if (
      isTutorial &&
      !startUpdate &&
      activeOrder === null &&
      rules.active?.length > 0
    ) {
      generateNewOrder();
    }
  }, [isTutorial, startUpdate, activeOrder, rules.active, generateNewOrder]);

  const savedCallback = useRef(generateNewOrder);

  useLayoutEffect(() => {
    savedCallback.current = generateNewOrder;
  }, [generateNewOrder]);

  // ORDER DELAY TIMER - only trigger when no active order
  const orderDelay = 3 * 1000; // 3 seconds

  // Handle submit button click
  const handleSubmit = useCallback(
    (e) => {
      if (!activeOrder || orderAnimationPhase !== "ready") return;

      const paperString = collectCharacters(
        characters[characterContainer.PAPER].items,
      );
      if (!paperString) return;

      setOrderAnimationPhase("submitting");

      const question = rules.active.find(
        (rule) => rule.order === activeOrder.text,
      );
      const xpGainedPerOrder = 30;

      // Check if answer is correct
      if (question && question.answer === paperString) {
        playDing();
        if (e) {
          setXpStartLocation({ x: e.clientX, y: e.clientY });
        }
        setLevel((prev) => ({
          ...prev,
          xp: prev.xp + xpGainedPerOrder,
        }));

        // Clear order and reset for next one
        setTimeout(() => {
          setActiveOrder(null);
          setQuestionTiles([]);
          setOrderAnimationPhase("idle");
          resetPaper();
        }, 500);
      } else {
        playWrong();
        // Wrong answer - just clear the paper, keep the order
        setTimeout(() => {
          resetPaper();
          setOrderAnimationPhase("ready");
        }, 500);
      }

      setTutorialState("stapled-response");
    },
    [activeOrder, orderAnimationPhase, characters, rules.active],
  );

  // END ORDER FUNCTIONS -----------------------------------------------------

  // RULE FUNCTIONS -----------------------------------------------------

  useEffect(() => {
    if (!currentlyPlaying) return;
    // Only run timer when no active order
    if (activeOrder !== null) return;

    // This function wrapper calls whatever is currently in the ref
    const tick = () => {
      savedCallback.current();
    };

    const interval = setInterval(tick, orderDelay);

    return () => clearInterval(interval);
  }, [currentlyPlaying, orderDelay, activeOrder]);

  useEffect(() => {
    if (level.level === 0) return;
    moveInactiveRulesToActive();
    if (level.level === 2) {
      // reset playing field for new level
      setActiveOrder(null);
      setQuestionTiles([]);
      setOrderAnimationPhase("idle");
      resetPaper();
    }
  }, [level.level]);

  function moveInactiveRulesToActive() {
    setRules((prev) => {
      const count = Math.min(4, prev.inactive.length);
      const take = prev.inactive.slice(0, count);
      const rest = prev.inactive.slice(count);
      if (level.level < 2) {
        return {
          active: [...prev.active, ...take],
          inactive: rest,
        };
      } else if (level.level >= 2) {
        const emptyTake = take.map((rule) => {
          return { id: rule.id, order: rule.order, answer: "???" };
        });
        return {
          inactive: rest,
          active: [...emptyTake],
        };
      }
    });
  }

  // END RULE FUNCTIONS -----------------------------------------------------

  // SPIN WHEEL FUNCTIONS ---------------------------------------------------
  function finishSpinning() {
    playHorn();
    setTimeout(() => {
      setMustSpin(false);
      setWheelPresent(false);
      setRules((prev) => {
        return {
          ...prev,
          active: prev.active.map((rule) => {
            if (rule.order === consideredRule.current) {
              return { ...rule, answer: wheelData[winningNumber].option };
            } else return rule;
          }),
        };
      });
    }, 2 * 1000);
  }

  function updateRule(order) {
    let data = [];
    for (let i = 0; i < 10; i++) {
      let prizeChars = [];
      for (let j = 0; j < 3; j++) {
        const randInd = Math.floor(
          Math.random() *
            characters[characterContainer.DICTIONARY].items.length,
        );
        prizeChars.push(
          characters[characterContainer.DICTIONARY].items[randInd].character,
        );
      }
      data.push({ option: prizeChars.join("") });
    }
    consideredRule.current = order;
    setWheelData(data);
    setWinningNumber(Math.floor(Math.random() * data.length));
    setWheelPresent(true);
    playSpin();

    requestAnimationFrame(() => {
      setMustSpin(true);
    });
  }
  // END SPIN WHEEL FUNCTIONS ---------------------------------------------------

  function closeDictionary() {
    playBookClose();
    dictionaryUIRef.current.style.visibility = "hidden";
    dictionaryImg.current.src = "dictionary.png";
  }

  function closeRuleBook() {
    playBookClose();
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

      playBookOpen();
      dictionaryEl.style.visibility = "visible";
      dictionaryImg.current.src = "dictionaryOpen.png";
    }
  }

  // DESK OBJECT INTERACTIONS ---------------------------------------------------
  function openRuleBook() {
    if (!startUpdate && tutorialState != "order-received") return;

    const ruleBookEl = ruleBookUIRef.current;
    if (
      !ruleBookEl.style.visibility ||
      ruleBookEl.style.visibility === "hidden"
    ) {
      setTutorialState("rulebook-open");

      playBookOpen();
      ruleBookEl.style.visibility = "visible";
      ruleBookImg.current.src = "rulesOpen.png";
    }
  }

  function findCharacterContainerId(itemId) {
    if (characters.some((container) => container.id === itemId)) {
      return itemId;
    }
    return characters.find((container) =>
      container.items.some((item) => item.id === itemId),
    )?.id;
  }

  // END DESK OBJECT INTERACTIONS ---------------------------------------------------

  // Gets currently held object by user
  const getActiveItem = () => {
    let item;
    for (const container of characters) {
      item = container.items.find((item) => item.id === activeId);
      if (item) return item;
    }
    return null;
  };

  // Removes all tiles from the paper
  function resetPaper() {
    setCharacters((containers) => {
      return containers.map((container) => {
        if (container.id === "paper") {
          return {
            id: "paper",
            items: [],
          };
        } else return container;
      });
    });
  }

  // Helper function to turn paper tiles into a readable string
  function collectCharacters(items) {
    const charList = items.map((item) => item.character);
    return charList.join("");
  }

  // Non drag method for moving tiles between dictionary and paper
  const handleTileClick = (id = NULL, character, type) => {
    type === "dictionary" ? playTile() : playSwoosh();

    setCharacters((prev) =>
      prev.map((c) => {
        // 1. Create a shallow copy of the container to avoid mutation
        if (type === "dictionary") {
          if (c.id === "paper") {
            if (c.items.length >= 1) {
              setTutorialState("filled-paper");
            }
            return {
              ...c,
              items: [...c.items, { id: id, character: character }],
            };
          } else {
            const oldCharIndex = c.items.findIndex((char) => char.id === id);
            if (oldCharIndex === -1) return c; // Guard clause
            const newDic = {
              ...c,
              items: [
                ...c.items.slice(0, oldCharIndex),
                { id: newId(), character: character }, // Use new ID to make a clone
                ...c.items.slice(oldCharIndex + 1),
              ],
            };
            return normaliseDictionary(newDic);
          }
        } else {
          if (c.id === "paper") {
            return {
              ...c,
              items: c.items.filter((tile) => tile.id !== id),
            };
          }
        }
        return c;
      }),
    );
  };

  // DnD KIT DRAG FUNCTIONALITY --------------------------------------------------

  function handleDragStart(event) {
    setActiveId(event.active.id);
    if (event.active.id === "rulebook-handle") {
      setRulebookZIndex(dictionaryZIndex + 1);
    } else if (event.active.id === "dictionary-handle") {
      setDictionaryZIndex(rulebookZIndex + 1);
    }
    document.body.classList.add("dragging-cursor");
  }

  function handleDragOver(event) {
    const { active, over } = event;

    // If the user has the object in empty space
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    // No drag over events for dictionary or rulebook (only tiles)
    if (active.id === "dictionary-handle" || active.id === "rulebook-handle")
      return;

    const activeContainerId = findCharacterContainerId(activeId);
    const overContainerId = findCharacterContainerId(overId);
    const activeContainerIndex = characters.findIndex(
      (c) => c.id === activeContainerId,
    );

    const activeObj = characters[activeContainerIndex].items.find(
      (item) => item.id === activeId,
    );

    if (!activeContainerId || !overContainerId) return;

    if (activeContainerId === overContainerId) return;

    setCharacters((prev) => {
      const activeContainer = prev.find((c) => c.id === activeContainerId);
      if (!activeContainer) return prev;

      const activeItem = activeContainer.items.find(
        (item) => item.id === activeId,
      );
      if (!activeItem) return prev;

      const newContainers = prev.map((container) => {
        if (container.id === activeContainerId) {
          if (container.id === "dictionary") {
            const currItemIndex = container.items.findIndex(
              (item) => item.id === activeId,
            );
            if (currItemIndex === -1) return container;

            const newDic = {
              ...container,
              items: [
                ...container.items.slice(0, currItemIndex),
                { ...activeObj, id: newId() },
                ...container.items.slice(currItemIndex + 1),
              ],
            };
            return newDic;
          } else {
            return {
              ...container,
              items: container.items.filter((item) => item.id !== activeId),
            };
          }
        }
        if (container.id === overContainerId) {
          if (overContainerId === "dictionary") {
            const newDic = {
              ...container,
              items: [
                ...container.items.filter(
                  (char) => char.character !== activeObj.character,
                ),
                activeObj,
              ],
            };
            return newDic;
          }
          if (overId === overContainerId) {
            return {
              ...container,
              items: [...container.items, activeItem],
            };
          }
        }

        const overItemIndex = container.items.findIndex(
          (item) => item.id === overId,
        );
        if (overItemIndex !== -1) {
          return {
            ...container,
            items: [
              ...container.items.slice(0, overItemIndex + 1),
              activeItem,
              ...container.items.slice(overItemIndex + 1),
            ],
          };
        }

        return container;
      });
      return newContainers;
    });
  }

  function handleCharacterDragEnd(event) {
    document.body.classList.remove("dragging-cursor");
    const { active, over } = event;
    if (!over) {
      setActiveId(null);
      return;
    }

    const prevContainer = findCharacterContainerId(active.id);
    const newContainer = findCharacterContainerId(over.id);
    if (!prevContainer || !newContainer) return;

    playTile();

    if (prevContainer === newContainer && active.id !== over.id) {
      const containerIndex = characters.findIndex(
        (c) => c.id === prevContainer,
      );

      if (containerIndex === -1) {
        setActiveId(null);
        return;
      }
      const container = characters[containerIndex];
      const activeIndex = container.items.findIndex(
        (item) => item.id === active.id,
      );
      const overIndex = container.items.findIndex(
        (item) => item.id === over.id,
      );

      if (activeIndex !== -1 && overIndex !== -1) {
        const newItems = arrayMove(container.items, activeIndex, overIndex);

        setCharacters((container) => {
          return container.map((c, i) => {
            if (i === containerIndex) {
              return { ...c, items: newItems };
            } else {
              return c;
            }
          });
        });
      }
    }

    if (newContainer === "dictionary") {
      setCharacters((prev) => {
        return prev.map((c) => {
          if (c.id === "dictionary") {
            return normaliseDictionary(c);
          } else {
            return c;
          }
        });
      });
    }
    setActiveId(null);

    if (characters[characterContainer.PAPER].items.length == 2) {
      setTutorialState("filled-paper");
    }
  }

  // END DnD KIT DRAG FUNCTIONALITY --------------------------------------------------

  // Removes duplicate tiles in a dictionary that may be obtained by returning tiles
  // from the paper
  function normaliseDictionary(c) {
    const seen = new Set();
    const charsSet = c.items.filter((char) => {
      if (!seen.has(char.character)) {
        seen.add(char.character);
        return true;
      } else {
        return false;
      }
    });
    return {
      ...c,
      items: charsSet,
    };
  }

  // Overlay for what is shown while holding a tile
  function CharacterOverlay({ children, className }) {
    return (
      <div className={className}>
        <span className="character">{children}</span>
      </div>
    );
  }

  // Opaque pixel hover detection - Ensures that buttons can only be clicked where the visible
  // pixels are, rather than the whole box the image takes up
  useEffect(() => {
    const setupPixelHover = (imgRef, canvasRef, setHovered) => {
      const image = imgRef.current;
      if (!image) return;

      const handleImageLoad = () => {
        const canvas = document.createElement("canvas");
        canvas.width = image.naturalWidth;
        canvas.height = image.naturalHeight;
        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        ctx.drawImage(image, 0, 0);
        canvasRef.current = canvas;
      };

      if (image.complete) {
        handleImageLoad();
      } else {
        image.addEventListener("load", handleImageLoad);
      }

      const isOverOpaquePixel = (e) => {
        const canvas = canvasRef.current;
        if (!image || !canvas) return false;

        const rect = image.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const scaleX = image.naturalWidth / rect.width;
        const scaleY = image.naturalHeight / rect.height;

        const ctx = canvas.getContext("2d");
        const pixel = ctx.getImageData(x * scaleX, y * scaleY, 1, 1).data;
        return pixel[3] > 0;
      };

      const handleMouseMove = (e) => {
        if (isOverOpaquePixel(e)) {
          setHovered(true);
        } else {
          setHovered(false);
        }
      };

      const handleMouseLeave = () => {
        setHovered(false);
      };

      image.addEventListener("mousemove", handleMouseMove);
      image.addEventListener("mouseleave", handleMouseLeave);

      return () => {
        image.removeEventListener("load", handleImageLoad);
        image.removeEventListener("mousemove", handleMouseMove);
        image.removeEventListener("mouseleave", handleMouseLeave);
      };
    };

    const dictionaryCanvasRef = createRef();
    const ruleBookCanvasRef = createRef();

    const cleanupDic = setupPixelHover(
      dictionaryImg,
      dictionaryCanvasRef,
      setIsDictionaryHovered,
    );
    const cleanupRule = setupPixelHover(
      ruleBookImg,
      ruleBookCanvasRef,
      setIsRuleBookHovered,
    );

    return () => {
      if (cleanupDic) cleanupDic();
      if (cleanupRule) cleanupRule();
    };
  }, []);

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
      {wheelPresent && wheelData.length > 0 && (
        <div className="spinner-wheel">
          <Wheel
            mustStartSpinning={mustSpin}
            prizeNumber={winningNumber}
            data={wheelData}
            fontSize={24}
            backgroundColors={["#4bc1f5", "#f6cb69"]}
            textColors={["#000000ff"]}
            onStopSpinning={finishSpinning}
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
          onDragStart={(event) => {
            event.active.data.current.type === "character"
              ? setParentDisabled(true)
              : null;
            handleDragStart(event);
          }}
          onDragOver={handleDragOver}
          onDragEnd={({ active, over }) => {
            setParentDisabled(false);
            handleCharacterDragEnd({ active, over });
          }}
        >
          {/* Empty Space where orders used to slide in */}
          <div className="orders"></div>

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
              updateRule={updateRule}
              zIndex={rulebookZIndex}
              onClose={closeRuleBook}
            />
          </button>

          {/* Paper Space - Split into question and answer zones */}
          <div className="workspace">
            <SplitPaper
              questionTiles={questionTiles}
              answerContainer={characters.find(
                (container) => container.id === "paper",
              )}
              handleTileClick={handleTileClick}
              onSubmit={handleSubmit}
              orderAnimationPhase={orderAnimationPhase}
              activeOrder={activeOrder}
              canSubmit={
                orderAnimationPhase === "ready" &&
                characters[characterContainer.PAPER].items.length > 0
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
              dictionary={characters.find(
                (container) => container.id === "dictionary",
              )}
              ref={dictionaryUIRef}
              rules={rules}
              zIndex={dictionaryZIndex}
              handleTileClick={handleTileClick}
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
            {activeId && getActiveItem() !== null ? (
              <CharacterOverlay className="draggable">
                {getActiveItem()?.character}
              </CharacterOverlay>
            ) : null}
          </DragOverlay>
        </DndContext>
      </section>
    </>
  );
}
