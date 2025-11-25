import DraggableAnywhere from "../base_dnd/DraggableAnywhere"

export default function Response({id, children}) {
    return (
        <DraggableAnywhere 
            id={id}
            type='response'
            startPos={{x: 120, y: 120}}
            className='paper-ui'
        >
            <article className='response'>

            </article>


        </DraggableAnywhere>
        
    )
}