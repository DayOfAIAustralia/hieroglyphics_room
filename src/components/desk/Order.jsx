import DraggableAnywhere from "../base_dnd/DraggableAnywhere"
import { useEffect, useState } from 'react'
import { useWindowHeight } from '@react-hook/window-size'


export default function Order({ children, id }) {
    const [show, setShow] = useState(false)

    useEffect(() => {
        const raf = requestAnimationFrame(() => setShow(true));
        return () => cancelAnimationFrame(raf);
    }, [])

    const windowHeight = useWindowHeight()
    const yStart = (Math.random() * (windowHeight / 2) + windowHeight / 2) - 75;

    return (
        <DraggableAnywhere 
            id={id}
            type='order'
            startPos={{x: 0, y: yStart}}
            className={`paper-ui`}
        >
            
            <article className={`paper order ${!show ? "paper-off-screen" : "paper-on-screen"}`}>
                <span>Please Respond To:</span>
                {children}
            </article>


        </DraggableAnywhere>
        
    )
}
