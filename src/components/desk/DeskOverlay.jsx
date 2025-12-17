import { DndContext, useSensor, useSensors, PointerSensor, KeyboardSensor, DragOverlay, pointerWithin } from '@dnd-kit/core'
import { restrictToWindowEdges } from '@dnd-kit/modifiers';
import React, { useEffect } from 'react'
import { v4 as newId } from 'uuid';

import { useWindowWidth } from '@react-hook/window-size'

import { LevelContext } from '../Context.jsx';
import Order from './Order.jsx';
import Answer from './Answer.jsx';
import Droppable from '../base_dnd/Droppable.jsx';
import Response from './Response.jsx'

import useSound from 'use-sound';
import paperPlaceSound from '../../assets/sounds/paperPlace.wav'
import binSound from '../../assets/sounds/trash.wav'
import dingSound from '../../assets/sounds/ding.wav'
import wrongSound from '../../assets/sounds/wrong.wav'

export default function DeskOverlay({orderAnswerArr, rulesList, staplerModeOnArr, resetPaper, paperString}) {
    const [playPaperPlace] = useSound(paperPlaceSound)
    const [playBin] = useSound(binSound)
    const [playWrong] = useSound(wrongSound)
    const [playDing] = useSound(dingSound)
    
    const orderAnswerContainer = {
        ORDER: 0,
    }   
    
    const windowWidth = useWindowWidth();
    const [ orderAnswer, setOrderAnswer ] = orderAnswerArr;
    const [ staplerModeOn, setStaplerModeOn ] = staplerModeOnArr;
    const [ rules, setRules ] = rulesList
    const [ level, setLevel ] = React.useContext(LevelContext).level
    const [ tutorialState, setTutorialState ] = React.useContext(LevelContext).tutorialState
    
    const [key, setKey] = React.useState(0);
    const paperContainerImg = React.useRef(null)
    const binImg = React.useRef(null)
    const outputSidebar = React.useRef(null)
    const staplerUIRef = React.useRef(null)
    const [holdingOutput, setHoldingOutput] = React.useState(false)
    const [showOutput, setShowOutput] = React.useState(false)
    const [hoverDropped, setHoverDropped] = React.useState(false)
    const [hoverDroppedItem, setHoverDroppedItem] = React.useState(null)
    const [startUpdate, setStartUpdate] = React.useContext(LevelContext).startUpdate;
    const [activeId, setActiveId] = React.useState(null)
    const [firstOrderPickup, setFirstOrderPickup] = React.useState(false);


    const [zIndices, setZIndices] = React.useState({});
    const globalZCounter = React.useRef(10);

    // React.useEffect(() => {
    //     if (!startUpdate && tutorialState != "stapled-response") return;

    //     const checkPosition = (e) => {
    //         const clientX = e.clientX ?? e.touches?.[0]?.clientX;

    //         if (clientX === undefined) {
    //             return;
    //         }
    //         if (holdingOutput) {
    //             if (clientX > (windowWidth * 0.6)) {
    //                 setShowOutput(true)
    //             } else {
    //                 setShowOutput(false)
    //             }
    //         }
    //     }
    //     window.addEventListener('mousemove', checkPosition)
    //     window.addEventListener('touchmove', checkPosition);

    //     return () => {
    //         window.removeEventListener('mousemove', checkPosition)
    //         window.removeEventListener('touchmove', checkPosition);
    //         setShowOutput(false)
    //     }
    // }, [holdingOutput])

    React.useEffect(() => {
        // Changes style of the cursor
        if (staplerModeOn) {
            console.log("stapler mode on")
            document.body.classList.add('stapler-cursor');

        } else {
            document.body.classList.remove('stapler-cursor');        
        }

        return () => {
            document.body.classList.remove('stapler-cursor');
        }
    }, [staplerModeOn])

    const handleOrderClick = (item) => {
        // 1. Check if Stapler Mode is active
        if (staplerModeOn) {
            if (!paperString) return;
            // 2. Check if the item is the "correct type" (e.g., paper)
            if (item.type === 'orders') {
                // Perform the stapling action
                console.log("Stapled the item!");
                setStaplerModeOn(false)
                processResponseNoDrag(item)
            } else {
                console.log("You can't staple this! its a " + item.type);
            }
            setTutorialState('stapled-response')
            return; // Stop here so we don't trigger the normal click behavior
        }
    }

    const orderList = orderAnswer.find(container => container.id === 'orders').items.map(order => {
        const currentZ = zIndices[order.id] || 10;
        return <Order id={order.id} key={order.id} slide={order.initial} active={order.id === activeId} style={{zIndex: currentZ}} onClick={() => handleOrderClick(order)} staplerModeOn={staplerModeOn}>
            <span className='order-character'>{order.text}</span>
        </Order>
    })

    // Deprecated answer slips
    // const answerList = orderAnswer.find(container => container.id === 'answers').items.map(answer => {
    //     const currentZ = zIndices[answer.id] || 10;
    //     return <Answer id={answer.id} key={answer.id} active={answer.id === activeId} style={{zIndex: currentZ}}>
    //         <span className='character'>{answer.text}</span>
    //     </Answer>
    // })

    // const responsesList = orderAnswer.find(container => container.id === 'responses').items.map(response => {
    //     const currentZ = zIndices[response.id] || 10;

    //     return <Response id={response.id} key={response.id} active={response.id === activeId} style={{zIndex: currentZ}}/>

    // })

    // Constants to keep track of order and answer items
    // const orderItem = orderAnswer[orderAnswerContainer.STAPLER].items.find(item => item.type === 'orders')
    // const answerItem = orderAnswer[orderAnswerContainer.STAPLER].items.find(item => item.type === 'answers')

    // HTML code for stapler which has been deprecated
    // const staplerItemsElements = (
    //     <>
    //         <div className='stapler-drop'>
    //             {orderItem ? 
    //             <div style={{fontSize: 24}}>{orderItem.text}</div>
    //             : <span>Order's go here!</span>}
    //         </div>
    //         <div className='stapler-drop'>
    //             {answerItem ? 
    //             <div style={{fontSize: 24}}>{answerItem.text}</div>
    //             : <span>Answer's go here!</span>}
    //         </div>
    //         {orderItem && answerItem ? 
    //         <button className='stapler-btn' onClick={createResponseNoDrag}>Send Order</button>
    //         : null}
    //     </>
    // )

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8
            }
        }),
        useSensor(KeyboardSensor)
    )

    // function findPaperContainerId(itemId) {
    //     if (orderAnswer.some(container => container.id === itemId)) {
    //         return itemId
    //     }
    //     return orderAnswer.find(container => 
    //         container.items.some((item) => item.id === itemId)
    //     )?.id;
    // }

    // function createResponse() {
    //     playStaple()
    //     setTutorialState('stapled-response')
    //     setOrderAnswer(prev => {
    //         return prev.map(c => {
    //             if (c.id === 'stapler') {
    //                 return {
    //                     ...c,
    //                     items: []
    //                 }
    //             }
    //             if (c.id === 'responses') {
    //                 return {
    //                     ...c,
    //                     items: [
    //                         {
    //                             id: newId(),
    //                             order: orderItem.text,
    //                             answer: answerItem.text,
    //                             type: 'responses' 
    //                         }
    //                     ]
    //                 }
    //             }
    //             return c
    //         })
    //     })
    // }

    const bringNoteToFront = (id) => {
        // Increment the global counter
        globalZCounter.current += 1;
        
        // Assign this new highest number to the specific order ID
        setZIndices(prev => ({
            ...prev,
            [id]: globalZCounter.current
        }));
    };

    function handleNotesDragStart({ active, over }) {
        // setHoldingOutput(true)

        const activeId = active.id;
        setActiveId(activeId)
        bringNoteToFront(activeId)

        if (!firstOrderPickup) {
            setFirstOrderPickup(true);
            setTimeout(() => {
                setTutorialState("paper-dragged");
            }, 500);
        }
        document.body.classList.add('dragging-cursor');

    }

    // Now unecessary function
    // function handleNotesDragOver(event) {
    //     const { active, over } = event;

    //     const activeId = active.id;
    //     const activeContainerId = findPaperContainerId(activeId)
    //     const activeContainerIndex = orderAnswer.findIndex(c => c.id === activeContainerId)
    //     const activeObj = orderAnswer[activeContainerIndex].items.find(item => item.id === activeId)
        
    //     // Paper container is only interactable with a responses object, not an order or answer slip
    //     // if (over?.id === 'paper-container' && activeObj.type !== 'responses') return;
    //     // if (over?.id === 'stapler' && activeObj.type === 'responses') return;

    //     // remove animation from when it first appeared
    //     if (activeObj.type === 'orders') activeObj.initial = false;

        // if (!over) {
        //     if (hoverDropped) {
        //         setOrderAnswer(prev => {
        //             return prev.map(container => {
        //                 if (activeContainerId === 'stapler' && container.id === 'stapler') {
        //                     const addedItem = container.items.find(item => item.id === activeId)
        //                     let itemList;
        //                     if (hoverDroppedItem) {
        //                         itemList = 
        //                         [...container.items.filter(item => item.id !== addedItem.id),
        //                         hoverDroppedItem
        //                         ]
        //                     } else {
        //                         itemList = [...container.items.filter(item => item.id !== addedItem.id)]
        //                     }
                            
        //                     return  {
        //                         ...container,
        //                         items: itemList
        //                     }
        //                 } 

        //                 if (activeContainerId === 'bin' && container.id === 'bin') {
        //                     binImg.current.style.backgroundImage = 'url(binEmpty.png)'
        //                     return {
        //                         ...container,
        //                         items: [
        //                         ]
        //                     }
        //                 }


        //                 if (activeContainerId === 'paper-container' && container.id === 'paper-container') {
        //                     paperContainerImg.current.style.backgroundImage = 'url(paperContainerEmpty.png)'
        //                     return {
        //                         ...container,
        //                         items: [
        //                         ]
        //                     }
        //                 }

        //                 if (container.id === activeObj.type) {
        //                     let itemList;
                            
        //                     if (hoverDroppedItem) {
        //                         itemList = [...container.items.filter(item => item.id !== hoverDroppedItem.id), activeObj]
        //                     } else {
        //                         itemList = [...container.items, activeObj]
        //                     }
        //                     return {
        //                         ...container,
        //                         items: itemList
        //                     }
                            
        //                 }
        //                 return container;
        //             })

        //         })
        //         setHoverDropped(false)
        //         setHoverDroppedItem(null)

        //     }
        //     return;

        // } 

        // const overId = over.id;

        // const overContainerId = findPaperContainerId(overId)

        // if (!activeContainerId || !overContainerId) return;

        // if (activeContainerId === overContainerId) return;

        // let tempHoverDropped = false;
        // let tempHoverDroppedItem = null;


        // setOrderAnswer(prev => {
        //     return prev.map(container => {
        //         // if (overContainerId === 'stapler' && container.id === 'stapler') {
        //         //     const existingItem = container.items.find(item => item.type === activeContainerId)
        //         //     const itemList = existingItem ? 
        //         //         [...container.items.filter(item => item.id !== existingItem.id),
        //         //             {...activeObj, type: activeContainerId}
        //         //         ]
        //         //         : [...container.items, {...activeObj, type: activeContainerId}]
        //         //     tempHoverDropped=true
        //         //     tempHoverDroppedItem = existingItem
                    
        //         //     return  {
        //         //         ...container,
        //         //         items: itemList
        //         //     }
        //         // } 

        //         // if (overContainerId === 'bin' && container.id === 'bin') {
        //         //     binImg.current.style.backgroundImage = 'url(bin.png)'
        //         //     tempHoverDropped= true
        //         //     tempHoverDroppedItem = null
        //         //     return {
        //         //         ...container,
        //         //         items: [
        //         //             activeObj
        //         //         ]
        //         //     }
        //         // }
        //         // if (overContainerId === 'paper-container' && container.id === 'paper-container') {
        //         //     paperContainerImg.current.style.backgroundImage = 'url(paperContainer.png)'
        //         //     tempHoverDropped=true
        //         //     tempHoverDroppedItem = null
        //         //     return {
        //         //         ...container,
        //         //         items: [
        //         //             activeObj
        //         //         ]
        //         //     }
        //         // }

        //         if (container.id === activeContainerId) {
        //             let existingItem
        //             if (overContainerId === 'stapler') {
        //                 existingItem = prev[orderAnswerContainer.STAPLER].items.find(item => item.type === activeContainerId)
        //             } else {
        //                 existingItem = null
        //             }
                    
        //             const itemList = existingItem ? 
        //                 [...container.items.filter(item => item.id !== activeId),
        //                 existingItem
        //                 ]
        //                 : [...container.items.filter(item => item.id !== activeId)]
        //             return {
        //                 ...container,
        //                 items: itemList
        //             }
                    
        //         }
        //         return container;
        //     })
        // })
        // setHoverDropped(tempHoverDropped)
        // setHoverDroppedItem(tempHoverDroppedItem)
    // }

    function handleNotesDragEnd() {
        // setHoldingOutput(false)
        setActiveId(null)
        // setHoverDropped(false)
        // setHoverDroppedItem(null)
        document.body.classList.remove('dragging-cursor');

        // Deprecated order submission system
        // if (orderAnswer[orderAnswerContainer.BIN].items.length > 0) {
        //     setTutorialState('finished-response')

        //     binImg.current.style.backgroundImage = 'url(binEmpty.png)'
        //     playBin()
        //     setOrderAnswer(prev => {
        //         return prev.map((c) => {
        //             if (c.id === 'bin') {
        //                 return {id: 'bin', items: []}
        //             } else {
        //                 return c
        //             }
        //         })
        //     })
        // }

        // if (orderAnswer[orderAnswerContainer.PAPERCONTAINER].items.length > 0) {
        //     setTutorialState('finished-response')

        //     playPaperPlace()
        //     processResponse()
        //     paperContainerImg.current.style.backgroundImage = 'url(paperContainerEmpty.png)'

        // }

    }
    

    function processResponseNoDrag(order) {
        const receivedResponse = {
                                id: newId(),
                                order: order.text,
                                answer: paperString,
                                type: 'responses' 
                            }
        const question = rules.active.find((rule) => rule.order === receivedResponse.order)
        const xpGainedPerOrder = 30;
        
        // Check if question can be found first (because of tutorial q being deleted)
        if (question && question.answer === receivedResponse.answer) {
            playDing()
            updateLevel(xpGainedPerOrder)
        } else {
            playWrong()
        }
        // reset paper and remove order
        // NEEDS TO ONLY REMOVE SELECTED ORDER
        setOrderAnswer(prev => {
            return prev.map(c => {
                if (c.id === 'orders') {
                    return {
                        ...c,
                        items: c.items.filter(item => item.text != order.text)
                    }
                }
                return c
            })
        })
        // removes tiles from paper
        resetPaper()

    }

    function updateLevel(added_xp) {
        setLevel(prev => {
            return {
                ...prev,
                xp: (prev.xp + added_xp)
            }
        })
    }


    return (
        <DndContext
            collisionDetection={pointerWithin}
            sensors={sensors}
            modifiers={[restrictToWindowEdges]}  
            autoScroll={false}
            onDragStart={handleNotesDragStart}
            onDragEnd={handleNotesDragEnd}
        >
            <div>
                {orderList}

                {/* {answerList} */}

                {/* {responsesList} */}
            </div>
            {/* Deprecated order submission system */}
            {/* <div 
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
                
            </div> */}
            {/* Stapler UI is deprecated */}
            {/* <div className='stapler'>
                <Droppable 
                    id='stapler' 
                    className='stapler-ui' 
                    ref={staplerUIRef}
                    style={staplerOpen ? {} : {display: 'none'}}
                    >
                    {staplerItemsElements}
                </Droppable>
            </div> */}
        
        </DndContext>
    )
}