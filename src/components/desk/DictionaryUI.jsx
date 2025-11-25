import { SortableContext, horizontalListSortingStrategy } from '@dnd-kit/sortable'
import SortableDraggable from '../base_dnd/SortableDraggable'
import DraggableAnywhere from "../base_dnd/DraggableAnywhere"
import Droppable from '../base_dnd/Droppable'
import { useWindowHeight, useWindowWidth } from '@react-hook/window-size'


export default function DictionaryUI({ dictionary, ref, disabled, rules }) {
    const characterElements = dictionary.items.map(char => {
        if (!rules.active.find(rule => Array.from(rule.answer).includes(char.character))) return null;
        return <SortableDraggable key={char.id} id={char.id} className='character' type='character'>{char.character}</SortableDraggable>        
    })

    return (
        <DraggableAnywhere 
            id='dictionary-handle'
            ref={ref} 
            startPos={{x: useWindowWidth() * 0.55, y: useWindowHeight() / 2 - useWindowHeight() * 0.35}} 
            disabled={disabled} 
            className='dictionary-ui'
            type='container'
            off={true}
        >
            <div className="book-tab" style={{marginBottom: "8px"}}>
                <h4>Dictionary</h4>
            </div>
            <Droppable id={dictionary.id} className='container dictionary-items'>
                <SortableContext 
                    items={dictionary.items.map(item => item.id)}
                    strategy={horizontalListSortingStrategy}
                >
                    {characterElements}
                </SortableContext>
            </Droppable>

        </DraggableAnywhere>
    )
}