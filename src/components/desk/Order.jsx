import DraggableAnywhere from "../base_dnd/DraggableAnywhere"
import { useEffect, useState, useRef } from 'react'
import { useWindowHeight } from '@react-hook/window-size'


export default function Order({ children, id, slide, active, style }) {
    const [show, setShow] = useState(false)
    const elementRef = useRef(null);

    useEffect(() => {
        if (!slide) return;
        const raf = requestAnimationFrame(() => setShow(true));
        return () => cancelAnimationFrame(raf);
    }, [])

    const windowHeight = useWindowHeight();

    // Define desk boundaries
    const deskTop = windowHeight * 0.5; // Desk starts at 50% from the top
    const estimatedHeight = 80; // Estimated height of the Order component
    const spawnableHeight = windowHeight - deskTop - estimatedHeight;

    const yStart = Math.random() * spawnableHeight + deskTop - 30;
    const start = slide ? {x: 0, y: yStart} : {x: 0, y: 150};
    return (
        <DraggableAnywhere 
            id={id}
            type='order'
            startPos={start}
            className={`paper-ui ${active ? "active" : ''}`}
            style={style}
            ref={elementRef}
        >
            
            <article className={`paper order ${slide ? (!show ? "paper-off-screen" : "paper-on-screen") : ""} `}>
                <span>Please Respond:</span>
                {children}
            </article>


        </DraggableAnywhere>
        
    )
}
