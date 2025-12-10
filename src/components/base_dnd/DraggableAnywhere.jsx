import Draggable from './Draggable' 
import React from 'react'
import { useDndMonitor } from '@dnd-kit/core';

export default function DraggableAnywhere({ children, ref=null, className, id, startPos, disabled=false, off=false, style={}, doDragAnimation}) {
    const [pos, setPos] = React.useState({ x: startPos.x, y: startPos.y });
    // Ref to store the previous window dimensions for comparison
    const prevDimensionsRef = React.useRef({ 
        width: window.innerWidth, 
        height: window.innerHeight 
    });

    useDndMonitor({
        onDragEnd({active, delta}) {
            if (active?.id !== id) return; 
            if (!disabled) {
                setPos(p => ({ x: p.x + delta.x, y: p.y + delta.y }));
            }
        }
    });

    // This effect handles browser zoom/resize
    React.useEffect(() => {
        const handleResize = () => {
            const currentWidth = window.innerWidth;
            const currentHeight = window.innerHeight;

            // Get the dimensions from before the resize
            const { width: prevWidth, height: prevHeight } = prevDimensionsRef.current;

            // Only run if dimensions have actually changed
            if (currentWidth !== prevWidth || currentHeight !== prevHeight) {
                // Calculate the scaling factor
                const scaleX = prevWidth === 0 ? 1 : currentWidth / prevWidth;
                const scaleY = prevHeight === 0 ? 1 : currentHeight / prevHeight;

                // Update the position by scaling it with the same factor as the window
                setPos(p => ({
                    x: p.x * scaleX,
                    y: p.y * scaleY
                }));

                // Update the ref with the new dimensions for the next resize event
                prevDimensionsRef.current = { width: currentWidth, height: currentHeight };
            }
        };

        // Set the initial dimensions in the ref when the component mounts
        prevDimensionsRef.current = { width: window.innerWidth, height: window.innerHeight };

        window.addEventListener('resize', handleResize);

        // Cleanup: remove the event listener when the component unmounts
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []); // Empty dependency array ensures this runs only once on mount

    return (
        <div ref={ref} className={off ? "default-off" : ""}>
            <Draggable id={id} className={className} pos={pos} disabled={disabled} passedStyles={style} doDragAnimation={doDragAnimation}>
                {children}
            </Draggable>
        </div>
    );
}