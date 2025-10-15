import { DndContext, useSensor, useSensors, PointerSensor, KeyboardSensor, DragOverlay, pointerWithin } from '@dnd-kit/core'
import { restrictToWindowEdges } from '@dnd-kit/modifiers';
import React from 'react'
import { v4 as newId } from 'uuid';

import { useWindowWidth } from '@react-hook/window-size'

import { LevelContext } from '../Context.jsx';
import Order from './Order.jsx';
import Answer from './Answer.jsx';
import Droppable from '../base_dnd/Droppable.jsx';
import Response from './Response.jsx'

import useSound from 'use-sound';
import paperPlaceSound from '../../assets/sounds/paperPlace.wav'
import staplerOpenSound from '../../assets/sounds/staplerOpen.wav'
import stapleSound from '../../assets/sounds/stapler.wav'
import binSound from '../../assets/sounds/trash.mp3'
import dingSound from '../../assets/sounds/ding.wav'
import wrongSound from '../../assets/sounds/wrong.mp3'

export default function DeskOverlay({orderAnswerArr, rulesList}) {
    const [playStaple] = useSound(stapleSound)
    const [playOpenStapler] = useSound(staplerOpenSound)
    const [playPaperPlace] = useSound(paperPlaceSound)
    const [playBin] = useSound(binSound)
    const [playWrong] = useSound(wrongSound)
    const [playDing] = useSound(dingSound)

    const orderAnswerContainer = {
    ORDER: 0,
    ANSWER: 1,
    STAPLER: 2,
    RESPONSES: 3,
    BIN: 4,
    PAPERCONTAINER: 5
    }   
    
    const windowWidth = useWindowWidth();
    const [ orderAnswer, setOrderAnswer ] = orderAnswerArr;
    const [ rules, setRules ] = rulesList
    const [ level, setLevel ] = React.useContext(LevelContext).level
    
    const [key, setKey] = React.useState(0);
    const paperContainerImg = React.useRef(null)
    const binImg = React.useRef(null)
    const outputSidebar = React.useRef(null)
    const staplerUIRef = React.useRef(null)
    const [staplerOpen, setStaplerOpen] = React.useState(false)
    const [holdingOutput, setHoldingOutput] = React.useState(false)
    const [showOutput, setShowOutput] = React.useState(false)
    const [hoverDropped, setHoverDropped] = React.useState(false)
    const [hoverDroppedItem, setHoverDroppedItem] = React.useState(null)
    const [activeId, setActiveId] = React.useState(null)
        

    React.useEffect(() => {
        const checkMousePosition = (e) => {
            if (holdingOutput) {

                if (e.clientX > (windowWidth * 0.6)) {
                    setShowOutput(true)
                } else {
                    setShowOutput(false)
                }
            }
        }
        window.addEventListener('mousemove', checkMousePosition)

        return () => {
            window.removeEventListener('mousemove', checkMousePosition)
            setShowOutput(false)

        }
    }, [holdingOutput])

    const orderList = orderAnswer.find(container => container.id === 'orders').items.map(order => {
        return <Order id={order.id} key={order.id} className='paper-off-screen'>
            {order.text}
        </Order>
    })

    const answerList = orderAnswer.find(container => container.id === 'answers').items.map(answer => {
        return <Answer id={answer.id} key={answer.id}>
            {answer.text}
        </Answer>
    })

    const responsesList = orderAnswer.find(container => container.id === 'responses').items.map(response => {
        return <Response id={response.id} key={response.id}  />

    })

    const orderItem = orderAnswer[orderAnswerContainer.STAPLER].items.find(item => item.type === 'orders')
    const answerItem = orderAnswer[orderAnswerContainer.STAPLER].items.find(item => item.type === 'answers')
    const staplerItemsElements = (
        <>
            <div className='stapler-drop'>
                {orderItem ? 
                <div>{orderItem.text}</div>
                : <span>Place your order's here!</span>}
            </div>
            <div className='stapler-drop'>
                {answerItem ? 
                <div>{answerItem.text}</div>
                : <span>Place your answer's here!</span>}
            </div>
            {orderItem && answerItem ? 
            <button className='stapler-btn' onClick={createResponse}>Staple</button>
            : null}
        </>
    )

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8
            }
        }),
        useSensor(KeyboardSensor)
    )

    function findPaperContainerId(itemId) {
        if (orderAnswer.some(container => container.id === itemId)) {
            return itemId
        }
        return orderAnswer.find(container => 
            container.items.some((item) => item.id === itemId)
        )?.id;
    }

    const getActiveItem = () => {
        let item;
        
        for (const container of orderAnswer) {
            item = container.items.find(item => item.id === activeId)
            if (item) return item
        }
        return null
    }
    function PaperOverlay({ children, className }) {
        return (
            <div className={className}>
                {children.type === 'orders' ? <span>Please Respond To:</span>: null}
                {children.type !== 'responses' ? children.text: null}
            </div>
        )
    }

    function createResponse() {
        playStaple()
        setOrderAnswer(prev => {
            return prev.map(c => {
                if (c.id === 'stapler') {
                    return {
                        ...c,
                        items: []
                    }
                }
                if (c.id === 'responses') {
                    return {
                        ...c,
                        items: [
                            ...c.items,
                            {
                                id: newId(),
                                order: orderItem.text,
                                answer: answerItem.text,
                                type: 'responses' 
                            }
                        ]
                    }
                }
                return c
            })
        })
    }

    function handleNotesDragStart({ active, over }) {
        setHoldingOutput(true)

        setActiveId(active.id)
    }

    function handleNotesDragOver(event) {


        const { active, over } = event;

        const activeId = active.id;
        const activeContainerId = findPaperContainerId(activeId)
        const activeContainerIndex = orderAnswer.findIndex(c => c.id === activeContainerId)
        const activeObj = orderAnswer[activeContainerIndex].items.find(item => item.id === activeId)
        
        if (over?.id === 'paper-container' && activeObj.type != 'responses') return;

        if (!over) {
            if (hoverDropped) {
                setOrderAnswer(prev => {
                    return prev.map(container => {
                        if (activeContainerId === 'stapler' && container.id === 'stapler') {
                            const addedItem = container.items.find(item => item.id === activeId)
                            let itemList;
                            if (hoverDroppedItem) {
                                itemList = 
                                [...container.items.filter(item => item.id !== addedItem.id),
                                hoverDroppedItem
                                ]
                            } else {
                                itemList = [...container.items.filter(item => item.id !== addedItem.id)]
                            }
                            
                            return  {
                                ...container,
                                items: itemList
                            }
                        } 

                        if (activeContainerId === 'bin' && container.id === 'bin') {
                            binImg.current.style.backgroundImage = 'url(binEmpty.png)'
                            return {
                                ...container,
                                items: [
                                ]
                            }
                        }


                        if (activeContainerId === 'paper-container' && container.id === 'paper-container') {
                            paperContainerImg.current.style.backgroundImage = 'url(paperContainerEmpty.png)'
                            return {
                                ...container,
                                items: [
                                ]
                            }
                        }

                        if (container.id === activeObj.type) {
                            let itemList;
                            
                            if (hoverDroppedItem) {
                                itemList = [...container.items.filter(item => item.id !== hoverDroppedItem.id), activeObj]
                            } else {
                                itemList = [...container.items, activeObj]
                            }
                            return {
                                ...container,
                                items: itemList
                            }
                            
                        }
                        return container;
                    })

                })
                setHoverDropped(false)
                setHoverDroppedItem(null)

            }
            return;

        } 

        const overId = over.id;

        const overContainerId = findPaperContainerId(overId)

        if (!activeContainerId || !overContainerId) return;

        if (activeContainerId === overContainerId) return;

        let tempHoverDropped = false;
        let tempHoverDroppedItem = null;

        setOrderAnswer(prev => {
            return prev.map(container => {
                if (overContainerId === 'stapler' && container.id === 'stapler') {
                    const existingItem = container.items.find(item => item.type === activeContainerId)
                    const itemList = existingItem ? 
                        [...container.items.filter(item => item.id !== existingItem.id),
                            {...activeObj, type: activeContainerId}
                        ]
                        : [...container.items, {...activeObj, type: activeContainerId}]
                    tempHoverDropped=true
                    tempHoverDroppedItem = existingItem
                    
                    return  {
                        ...container,
                        items: itemList
                    }
                } 

                if (overContainerId === 'bin' && container.id === 'bin') {
                    binImg.current.style.backgroundImage = 'url(bin.png)'
                    tempHoverDropped= true
                    tempHoverDroppedItem = null
                    return {
                        ...container,
                        items: [
                            activeObj
                        ]
                    }
                }
                if (overContainerId === 'paper-container' && container.id === 'paper-container') {
                    paperContainerImg.current.style.backgroundImage = 'url(paperContainer.png)'
                    tempHoverDropped=true
                    tempHoverDroppedItem = null
                    return {
                        ...container,
                        items: [
                            activeObj
                        ]
                    }
                }

                if (container.id === activeContainerId) {
                    let existingItem
                    if (overContainerId === 'stapler') {
                        existingItem = prev[orderAnswerContainer.STAPLER].items.find(item => item.type === activeContainerId)
                    } else {
                        existingItem = null
                    }
                    
                    const itemList = existingItem ? 
                        [...container.items.filter(item => item.id !== activeId),
                        existingItem
                        ]
                        : [...container.items.filter(item => item.id !== activeId)]
                    return {
                        ...container,
                        items: itemList
                    }
                    
                }
                return container;
            })
        })
        setHoverDropped(tempHoverDropped)
        setHoverDroppedItem(tempHoverDroppedItem)

    }

    function handleNotesDragEnd({ active, over }) {
        setHoldingOutput(false)
        setActiveId(null)
        setHoverDropped(false)
        setHoverDroppedItem(null)
        binImg.current.style.backgroundImage = 'url(binEmpty.png)'

        if (orderAnswer[orderAnswerContainer.BIN].items > 0) {
            playBin()
            setOrderAnswer(prev => {
                return prev.map((c) => {
                    if (c.id === 'bin') {
                        return {id: 'bin', items: []}
                    } else {
                        return c
                    }
                })
            })
        }

        if (orderAnswer[orderAnswerContainer.PAPERCONTAINER].items.length > 0) {
            playPaperPlace()
            processResponse()
            paperContainerImg.current.style.backgroundImage = 'url(paperContainerEmpty.png)'

        }

    }

    function processResponse() {
        const receivedResponse = orderAnswer[orderAnswerContainer.PAPERCONTAINER].items[0];
        const question = rules.active.find((rule) => rule.order === receivedResponse.order)
        const xpGainedPerOrder = 30;

        if (question.answer === receivedResponse.answer) {
            playDing()
            updateLevel(xpGainedPerOrder)
        } else {
            playWrong()
        }
        orderAnswer[orderAnswerContainer.PAPERCONTAINER].items = []
    }

    function updateLevel(added_xp) {
        setLevel(prev => {
            return {
                ...prev,
                xp: (prev.xp + added_xp)
            }
        })
    }

    function openStapler() {
        playOpenStapler()
        setStaplerOpen(prev => !prev)
    }

    return (
        <DndContext
            collisionDetection={pointerWithin}
            sensors={sensors}
            modifiers={[restrictToWindowEdges]}  
            autoScroll={false}
            onDragStart={handleNotesDragStart}
            onDragMove={handleNotesDragOver}
            onDragEnd={handleNotesDragEnd}
        >
            <div>
                {orderList}

                {answerList}

                {responsesList}
            </div>
            <div 
                className={`output ${showOutput ? 'output-display' : ''}`} 
                ref={outputSidebar}
                onTransitionEnd={() => setKey(k => k + 1)}
            >
                <div className='bin' ref={binImg}>
                    <Droppable key={`bin-${key}`} id='bin' className='sidebar-container' >

                    </Droppable>
                    
                </div>
                <div className='paper-container' ref={paperContainerImg}>
                    <Droppable key={`paper-${key}`} id='paper-container' className='sidebar-container'>
                        
                    </Droppable>
                    
                </div>
                
            </div>
            <div className='stapler'>
                <button onClick={openStapler}>
                    <img src='stapler.png' alt='stapler button'></img>

                    
                </button>
                <Droppable 
                    id='stapler' 
                    className='stapler-ui' 
                    ref={staplerUIRef}
                    style={staplerOpen ? {} : {display: 'none'}}
                    >
                    {staplerItemsElements}
                </Droppable>
            </div>
            <DragOverlay
                > 
                {activeId && getActiveItem().type !== 'responses' ? (
                <PaperOverlay 
                    className={
                        getActiveItem().type === 'orders' ? 'paper order'
                        : 'paper answer'
                        }>
                    {getActiveItem()}
                </PaperOverlay>
                ): null}
            </DragOverlay>
        
        </DndContext>
    )
}