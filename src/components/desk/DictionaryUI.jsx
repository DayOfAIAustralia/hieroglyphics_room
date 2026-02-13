import {
  SortableContext,
  horizontalListSortingStrategy,
} from "@dnd-kit/sortable";
import SortableDraggable from "../base_dnd/SortableDraggable";
import Droppable from "../base_dnd/Droppable";
export default function DictionaryUI({
  dictionary,
  ref,
  rules,
  zIndex,
  handleTileClick,
}) {
  // Creates all the tiles for use in the dictionary, ensures they are all unique and
  // only includes tiles that are being used in currently valid rules
  const characterElements = dictionary.items
    .map((char) => {
      if (
        !rules.active.find((rule) =>
          Array.from(rule.answer).includes(char.character),
        )
      )
        return null;
      return (
        <SortableDraggable
          layoutId={`tile-${char.character}-${char.id}`}
          key={char.id}
          id={char.id}
          className="character"
          type="character"
          onClick={() => handleTileClick(char.id, char.character, "dictionary")}
        >
          {char.character}
        </SortableDraggable>
      );
    })
    .filter(Boolean);

  const mid = Math.min(12, characterElements.length);
  const firstHalf = characterElements.slice(0, mid);
  const secondHalf = characterElements.slice(mid);

  return (
    <div
      id="dictionary-handle"
      ref={ref}
      className="dictionary-ui"
      style={{ zIndex: zIndex }}
    >
      <div className="book-tab" style={{ marginBottom: "8px" }}>
        <h4>Dictionary</h4>
      </div>
      <Droppable id={dictionary.id} className="dictionary-items">
        <SortableContext
          items={dictionary.items.map((item) => item.id)}
          strategy={horizontalListSortingStrategy}
        >
          <div className="dictionary-column">{firstHalf}</div>
          <div className="dictionary-column" style={{ marginLeft: "28px" }}>
            {secondHalf}
          </div>
        </SortableContext>
      </Droppable>
    </div>
  );
}
