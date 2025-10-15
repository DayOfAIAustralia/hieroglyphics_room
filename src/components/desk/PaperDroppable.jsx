import SortableDraggable from "../base_dnd/SortableDraggable"
import { SortableContext } from "@dnd-kit/sortable"
import Droppable from "../base_dnd/Droppable"

export default function PaperDroppable({container}) {
    const items = container.items;

    const playedWords = items.map((word) => {
        return <SortableDraggable key={word.id} id={word.id}>
            {word.character}
        </SortableDraggable>
    })

    return (
        <Droppable id={container.id} className='container'>
            <SortableContext
                items={items.map(item => item.id)}
            >
                {playedWords}
            </SortableContext>
        </Droppable>
    )
}