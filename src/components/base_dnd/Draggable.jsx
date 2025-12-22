import {useDraggable} from '@dnd-kit/core';
import {CSS} from '@dnd-kit/utilities';

export default function Draggable({id, disabled=false, children, className, pos={x: 0,y: 0}, type,  passedStyles={}, doDragAnimation=false}) {
    const {attributes, listeners, setNodeRef, transform, isDragging} = useDraggable({
        id,
        data: {
            type
        },
        disabled
    });
    const style = {
        // Outputs `translate3d(x, y, 0)`
        transform: CSS.Translate.toString(transform),
        left: pos.x,
        top: pos.y,
        ...passedStyles
    };

    return (
        <div 
            ref={setNodeRef} 
            style={style} 
            {...listeners} 
            {...attributes} 
            id={id} 
            className={`touchable ${className} ${doDragAnimation && isDragging ? 'dragging' : ''}`}
        >
            {children}
        </div>
    );
}