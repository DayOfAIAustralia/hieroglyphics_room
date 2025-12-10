import DraggableAnywhere from "../base_dnd/DraggableAnywhere"

export default function Answer({id, children, active, style}) {
    return (
        <DraggableAnywhere 
            id={id}
            type='answer'
            startPos={{x: 120, y: 120}}
            className={`paper-ui ${active ? "active" : ''}`}
            style={style}
        >
            <article className='paper answer'>
                {children}
            </article>


        </DraggableAnywhere>
        
    )
}