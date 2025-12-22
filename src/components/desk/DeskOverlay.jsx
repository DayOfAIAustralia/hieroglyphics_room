import { DndContext, useSensor, useSensors, PointerSensor, KeyboardSensor, TouchSensor, pointerWithin } from '@dnd-kit/core'
import { restrictToWindowEdges } from '@dnd-kit/modifiers';
import React, { useEffect, useContext, useRef, useState } from 'react'
import { v4 as newId } from 'uuid';

import { LevelContext } from '../Context.jsx';
import Order from './Order.jsx';

import useSound from 'use-sound';
import dingSound from '../../assets/sounds/ding.wav'
import wrongSound from '../../assets/sounds/wrong.wav'

export default function DeskOverlay({ordersObj, rulesList, staplerModeOnArr, resetPaper, paperString}) {
    const [playWrong] = useSound(wrongSound)
    const [playDing] = useSound(dingSound)

    const [ tutorialState, setTutorialState ] = useContext(LevelContext).tutorialState
    const [xpStartLocation, setXpStartLocation] = useContext(LevelContext).xpStartLocation
    
    const [ orders, setOrders ] = ordersObj;
    const [ staplerModeOn, setStaplerModeOn ] = staplerModeOnArr;
    const [ rules, setRules ] = rulesList
    const [ level, setLevel ] = useContext(LevelContext).level

    const [activeId, setActiveId] = useState(null)
    const [firstOrderPickup, setFirstOrderPickup] = useState(false);

    const [zIndices, setZIndices] = useState({});
    const globalZCounter = useRef(10);


    // STAPLER FUNCTIONS ----------------------------------------------------
    // Cursor update for activating stapler mode
    useEffect(() => {
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

    const handleOrderClick = (e, item) => {
        // 1. Check if Stapler Mode is active
        if (staplerModeOn) {
            if (!paperString) return;
            // 2. Check if the item is the "correct type" (e.g., paper)
            if (item.type === 'orders') {
                // Perform the stapling action
                console.log("Stapled the item!");
                setStaplerModeOn(false)
                processResponse(e, item)
            } else {
                console.log("You can't staple this! its a " + item.type);
            }
            setTutorialState('stapled-response')
            return; // Stop here so we don't trigger the normal click behavior
        }
    }


    function processResponse(e, order) {
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
            setXpStartLocation({x: e.clientX, y: e.clientY})
            updateLevel(xpGainedPerOrder)
        } else {
            playWrong()
        }

        // Removes selected order from orders items array
        setOrders(prev => {
            return prev.filter(item => item.text != order.text)
        })

        // Removes tiles from paper
        resetPaper()

    }
    // END STAPLER FUNCTIONS ----------------------------------------------------

    // Creates elements of order slips for all the existing orders
    const orderList = orders.map(order => {
        const currentZ = zIndices[order.id] || 10;
        return <Order id={order.id} key={order.id} slide={order.initial} active={order.id === activeId} style={{zIndex: currentZ}} onClick={(e) => handleOrderClick(e, order)} staplerModeOn={staplerModeOn}>
            <span className='order-character'>{order.text}</span>
        </Order>
    })

    
    // Ensures whichever note has been last clicked it top of the stack
    const bringNoteToFront = (id) => {
        // Increment the global counter
        globalZCounter.current += 1;
        
        // Assign this new highest number to the specific order ID
        setZIndices(prev => ({
            ...prev,
            [id]: globalZCounter.current
        }));
    };

    // DnD KIT NOTE DRAG FUNCTIONS ----------------------------------
    function handleNotesDragStart({ active }) {
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

    // END DnD KIT NOTE DRAG FUNCTIONS ----------------------------------

    // Adds xp to level
    function updateLevel(added_xp) {
        setLevel(prev => {
            return {
                ...prev,
                xp: (prev.xp + added_xp)
            }
        })
    }

    // DnD Kit sensors for handling slip movement
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8
            }
        }),
        useSensor(KeyboardSensor),
        useSensor(TouchSensor, {
            activationConstraint: {
                delay: 250, // Time in ms
                tolerance: 5, // Allow slight wobble while pressing
            }
        })
    )

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