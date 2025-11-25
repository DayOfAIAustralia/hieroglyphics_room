import {useDroppable} from '@dnd-kit/core';

export default function Droppable({children, id, className='', style={}}) {
    const {isOver, setNodeRef} = useDroppable({
        id,
        data: {
            containerId: id
        }
    });
    
    
    return (
        <div ref={setNodeRef} className={className} style={style}>
            {children}
        </div>
    );
}