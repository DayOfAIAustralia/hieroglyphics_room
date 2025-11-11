import { useEffect, useContext, useState } from 'react'
import { TutorialContext, LevelContext } from './Context'
import axios from "axios"
import useSound from 'use-sound';
import Markdown from 'react-markdown'
import { motion } from 'framer-motion'
import TextHighlighter from './TextHighlighter';
import swooshSound from '../assets/sounds/swoosh.wav'
import { RiMailSendLine } from "react-icons/ri";

export default function PopupItem({text, buttons, updateDialogue, actions, orderAnswerArr, help=false}) {
    const [orderAnswer, setOrderAnswer] = orderAnswerArr
    const [isTutorial, setIsTutorial] = useContext(TutorialContext)
    const [startUpdate, setStartUpdate] = useContext(LevelContext).startUpdate
    const [position, setPosition] = useState({})
    const [helpVisible, setHelpVisible] = useState(false)
    const [helpData, setHelpData] = useState('')
    const [helpDisabled, setHelpDisabled] = useState(false)
    const [playSwoosh] = useSound(swooshSound)
    const [showTutorialArrow, setShowTutorialArrow] = useState(false);
    const [arrowLocation, setArrowLocation] = useState({})
    const [useButton, setUseButton] = useState(true)
    const [ tutorialState, setTutorialState ] = useContext(LevelContext).tutorialState
    const [isHighlighting, setIsHighlighting] = useState(false);
    const [highlightedText, setHighlightedText] = useState("");
    const [showSendHelp, setShowSendHelp] = useState(false)

    // Non button progression
    useEffect(() => {
        if (actions === 0 && tutorialState === 'paper-dragged') {
            updateDialogue(buttons[0].goto)

        } else if (actions === 1 && tutorialState === 'rulebook-open') {
            updateDialogue(buttons[0].goto)
        
        } else if (actions === 2 && tutorialState === 'dictionary-open') {
            updateDialogue(buttons[0].goto)

        } else if (actions === 3 && tutorialState === 'filled-paper') {
            updateDialogue(buttons[0].goto)
        } else if (actions === 4 && tutorialState === 'slip-created') {
            updateDialogue(buttons[0].goto)
        } else if (actions === 5 && tutorialState === 'stapler-open') {
            updateDialogue(buttons[0].goto)
        // next is out of order because it was added later
        } else if (actions === 7 && tutorialState === 'stapled-response') {
            updateDialogue(buttons[0].goto)
        } else if (actions === 6 && tutorialState === 'finished-response') {
            updateDialogue(buttons[0].goto)

        }
    }, [tutorialState])

    // Button progression
    useEffect(() => {
        if (actions === 0) {
            setIsTutorial(true)
            setUseButton(false)
            
            setShowTutorialArrow(true)
            playSwoosh()
            // create tutorial order
            const newOrder = {
                id: 0,
                text: "𓊽𓉐𓉐",
                type: 'orders',
                initial: true
            }
            setOrderAnswer(prev => {
                return prev.map((c) => {
                    if (c.id === 'orders') {
                        return {
                            ...c,
                            items: [
                                ...c.items,
                                newOrder
                            ]
                        }
                    } else {
                        return c
                    }
                })
            })
            setPosition({top: "30%", left: "0%", right: "auto", bottom: "auto"})
            setArrowLocation({top: "30%", left: "0%", right: "auto", bottom: "auto", transform: "rotate(90deg)"})

        } else if (actions === 1) {
            setPosition({top: "30%", left: "auto", right: "0", bottom: "auto"})
            setArrowLocation({top: "auto", left: "auto", right: "16%", bottom: "20%"})


        } else if (actions === 2) {
            setPosition({top: "30%", left: "auto", right: "5%", bottom: "auto"})
            setArrowLocation({top: "auto", left: "51%", right: "auto", bottom: "20%"})

        } else if (actions === 3) {
            setShowTutorialArrow(false)
            
            setPosition({top: "30%", left: "auto", right: "30%", bottom: "auto"})
        } else if (actions === 4) {
            setShowTutorialArrow(true)
            setArrowLocation({top: "auto", left: "60%", right: "auto", bottom: "38%",  transform: "rotate(180deg)"})

            setPosition({top: "30%", left: "auto", right: "25%", bottom: "auto"})
        } else if (actions === 5) {
            setArrowLocation({top: "auto", left: "12%", right: "auto", bottom: "10%", transform: "rotate(320deg)"})

            setPosition({top: "30%", left: "0", right: "auto", bottom: "auto"})
        } else if (actions === 6) {
            setArrowLocation({top: "auto", left: "auto", right: "22%", bottom: "22%",})

            setPosition({top: "30%", left: "auto", right: "0", bottom: "auto"})
        } else if (actions === 7) {
            // removed
        } else if (actions === 8) {
            // removed
        } else if (actions === 9) {
            setUseButton(true)
            setShowTutorialArrow(false)

            setStartUpdate(true)
        }
    }, [actions])

    const arrow = <motion.img
        src='/arrow.png'
        alt="glowing arrow"
        style={arrowLocation}
        className='tutorial-arrow'
        animate={{
            filter: [
            "drop-shadow(0 0 4px red)",
            "drop-shadow(0 0 8px red)",
            "drop-shadow(0 0 4px red)"
            ]
        }}
        transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
        }}
    />

    let popupStyle
    let dataStyle
    let btnClass
    if (actions !== undefined && actions < 7) {
        btnClass = "popup-btns-side"
        popupStyle = {
            position: "absolute",
            width: "auto",
            height: "auto",
            top: position.top,
            left: position.left,
            right: position.right,
            bottom: position.bottom
        }
        dataStyle = {
            display: "flex",
            flexDirection: "row",
        }
    } else {
        btnClass = "popup-btns-bottom"

    }

    function changeHighlighting() {
        setIsHighlighting(prev => !prev)
        setShowSendHelp(prev => !prev)
    }

    async function requestHelp() {
        setHelpVisible(true)
        setIsHighlighting(false)
        setShowSendHelp(false)
        setHelpDisabled(true)
        const response = await axios.post(`/api/requesthelp`, {context: text, highlight: highlightedText}, { withCredentials: false })
        setHelpData(response.data.text)
    }

    function closeHelp() {
        setHelpData('')
        setHelpData(false)
        setHelpDisabled(false)
        setHelpVisible(false)
    }

    const buttonElements = buttons.map(btn => {
        return <button key={btn.id} disabled={helpDisabled} className={helpDisabled ? 'btn-disabled' : ''} onClick={() => updateDialogue(btn.goto)}>{btn.text}</button>
    })

    return (
        <>
        {showTutorialArrow && arrow}
        <div className="popup" key={'dialogue-box'} style={popupStyle}>
            <section className="popup-data" style={dataStyle}>
                <div className="popup-text">
                    <TextHighlighter isHighlighting={isHighlighting}
                        setIsHighlighting={setIsHighlighting} setHighlightedText={setHighlightedText}>
                        {text}
                    </TextHighlighter>
                </div>
                {useButton && !showSendHelp && <div className={`popup-btns ${btnClass}`}>
                    {buttonElements}
                </div>}
                { help &&
                <button className="popup-help" onClick={changeHighlighting} disabled={helpDisabled}>
                    <img src="question.png" alt="question button"></img>
                </button>
                }
                { showSendHelp &&
                <button className="popup-help-send" onClick={requestHelp}>
                    <RiMailSendLine size="1.5em"/>
                </button>
                }
            </section>
            {helpVisible &&
                <div className="help-box">
                    {helpData ?
                    <>
                        <h2>AI Help:</h2>
                        <Markdown>{helpData.replace(/\n/g, "  \n")}</Markdown>
                        <div className="popup-btns" >
                            <button onClick={closeHelp}>Close</button>

                        </div>
                    </>
                    : <p>Loading...</p>
                    }
                </div>
            }
        </div>
        </>
    )
}
