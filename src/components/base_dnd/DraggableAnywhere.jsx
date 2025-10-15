import Draggable from './Draggable' 
import React from 'react'
import { useDndMonitor } from '@dnd-kit/core';

function DraggableAnywhere({ children, ref=null, className, id, startPos, disabled=false, off=false }) {
    const [pos, setPos] = React.useState({ x: startPos.x, y: startPos.y });

    useDndMonitor({
        onDragEnd({active, delta}) {
            if (active?.id !== id) return; 
            if (!disabled) {
                setPos(p => ({ x: p.x + delta.x, y: p.y + delta.y }));
            }
        }
    })

    return (
        <div ref={ref} className={off ? "default-off" : ""}>
            <Draggable id={id} className={className} pos={pos} disabled={disabled}>
                {children}
            </Draggable>
        </div>
    );
}


export default DraggableAnywhere;
