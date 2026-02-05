import { useState, useCallback } from "react";
import { v4 as newId } from "uuid";
import { arrayMove } from "@dnd-kit/sortable";

export const characterContainer = {
  DICTIONARY: 0,
  PAPER: 1,
};

export default function useCharacterDragDrop({
  sounds,
  setTutorialState,
  dictionaryZIndex,
  rulebookZIndex,
  setDictionaryZIndex,
  setRulebookZIndex,
}) {
  const [activeId, setActiveId] = useState(null);
  const [parentDisabled, setParentDisabled] = useState(false);

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

  function findCharacterContainerId(itemId) {
    if (characters.some((container) => container.id === itemId)) {
      return itemId;
    }
    return characters.find((container) =>
      container.items.some((item) => item.id === itemId),
    )?.id;
  }

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
  const resetPaper = useCallback(() => {
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
  }, []);

  // Helper function to turn paper tiles into a readable string
  const collectCharacters = useCallback((items) => {
    const charList = items.map((item) => item.character);
    return charList.join("");
  }, []);

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

  // Non drag method for moving tiles between dictionary and paper
  const handleTileClick = (id = NULL, character, type) => {
    type === "dictionary" ? sounds.playTile() : sounds.playSwoosh();

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

  // DnD KIT DRAG FUNCTIONALITY

  function handleDragStart(event) {
    if (event.active.data.current.type === "character") {
      setParentDisabled(true);
    }
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
    setParentDisabled(false);
    document.body.classList.remove("dragging-cursor");
    const { active, over } = event;
    if (!over) {
      setActiveId(null);
      return;
    }

    const prevContainer = findCharacterContainerId(active.id);
    const newContainer = findCharacterContainerId(over.id);
    if (!prevContainer || !newContainer) return;

    sounds.playTile();

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

  // Overlay for what is shown while holding a tile
  function CharacterOverlay({ children, className }) {
    return (
      <div className={className}>
        <span className="character">{children}</span>
      </div>
    );
  }

  return {
    characters,
    activeId,
    parentDisabled,
    handleDragStart,
    handleDragOver,
    handleCharacterDragEnd,
    handleTileClick,
    resetPaper,
    collectCharacters,
    getActiveItem,
    CharacterOverlay,
  };
}
