import DraggableAnywhere from "../base_dnd/DraggableAnywhere"

export default function Response({id, children, active, style}) {
    return (
        <DraggableAnywhere 
            id={id}
            type='response'
            startPos={{x: 120, y: 120}}
            className={`paper-ui ${active ? "active" : ''}`}
            style={style}
        >
            <article className='response'>

            </article>


        </DraggableAnywhere>
        
    )
}