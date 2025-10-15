import {CSS} from '@dnd-kit/utilities';
import { useSortable } from '@dnd-kit/sortable';

export default function SortableDraggable({id, disabled=false, children}){
    const {attributes, listeners, setNodeRef, transform, transition, isDragging} = useSortable({
        id,
        data: {
            type: "character"
        }
    });
    const style = {
        // Outputs `translate3d(x, y, 0)`
        transform: CSS.Translate.toString(transform),
        transition
    };

    return (
        <div 
            ref={setNodeRef}
            style={style} 
            {...listeners} 
            {...attributes} 
            className={isDragging ? "dragging draggable" : 'draggable'}

        >
            {children}
        </div>
    );
}