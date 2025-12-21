import { DndContext, useSensor, useSensors, PointerSensor, KeyboardSensor, DragOverlay, pointerWithin } from '@dnd-kit/core'
import { restrictToWindowEdges } from '@dnd-kit/modifiers';
import React, { useEffect } from 'react'
import { v4 as newId } from 'uuid';

import { useWindowWidth } from '@react-hook/window-size'

import { LevelContext } from '../Context.jsx';
import Order from './Order.jsx';

import useSound from 'use-sound';
import paperPlaceSound from '../../assets/sounds/paperPlace.wav'
import binSound from '../../assets/sounds/trash.wav'
import dingSound from '../../assets/sounds/ding.wav'
import wrongSound from '../../assets/sounds/wrong.wav'

export default function DeskOverlay({orderAnswerArr, rulesList, staplerModeOnArr, resetPaper, paperString}) {
    const [playWrong] = useSound(wrongSound)
    const [playDing] = useSound(dingSound)
    
    const orderAnswerContainer = {
        ORDER: 0,
    }   
    
    const [ orderAnswer, setOrderAnswer ] = orderAnswerArr;
    const [ staplerModeOn, setStaplerModeOn ] = staplerModeOnArr;
    const [ rules, setRules ] = rulesList
    const [ level, setLevel ] = React.useContext(LevelContext).level
    const [ tutorialState, setTutorialState ] = React.useContext(LevelContext).tutorialState
    
    const [activeId, setActiveId] = React.useState(null)
    const [firstOrderPickup, setFirstOrderPickup] = React.useState(false);


    const [zIndices, setZIndices] = React.useState({});
    const globalZCounter = React.useRef(10);


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

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8
            }
        }),
        useSensor(KeyboardSensor)
    )

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

    function handleNotesDragEnd() {
        setActiveId(null)
        document.body.classList.remove('dragging-cursor');

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
            </div>
        
        </DndContext>
    )
}