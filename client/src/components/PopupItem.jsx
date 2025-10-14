import { useEffect, useContext, useState } from 'react'
import { TutorialContext, LevelContext } from './Context'
import axios from "axios"
import useSound from 'use-sound';

import swooshSound from '../assets/sounds/swoosh.wav'


export default function PopupItem({text, buttons, updateDialogue, actions, orderAnswerArr, help=false}) {
    const [orderAnswer, setOrderAnswer] = orderAnswerArr
    const [isTutorial, setIsTutorial] = useContext(TutorialContext)
    const [position, setPosition] = useState({})
    const [helpVisible, setHelpVisible] = useState(false)
    const [helpData, setHelpData] = useState('')
    const [helpDisabled, setHelpDisabled] = useState(false)
    const [playSwoosh] = useSound(swooshSound)
    const [speaksChinese, setSpeaksChinese] = useContext(LevelContext).speaksChinese
    const [startAPICall, setStartAPICall] = useContext(LevelContext).startAPICall
    const [appliedFetchedOnce, setAppliedFetchedOnce] = useContext(LevelContext).fetched;
    const [startUpdate, setStartUpdate] = useContext(LevelContext).startUpdate;
    const [key, setKey] = useState(0)

    useEffect(() => {
        setKey(prev => prev + 1);
    }, [appliedFetchedOnce])

    useEffect(() => {
        if (actions === -1) {
            setIsTutorial(true)
            setPosition({top: "50%", left: "50%", right: "auto", bottom: "auto"})
        } else if (actions === 0) {
            playSwoosh()
            const newOrder = {
                id: 0,
                text: "𓊽𓉐𓉐",
                type: 'orders'
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
        } else if (actions === 1) {
            setPosition({top: "30%", left: "auto", right: "0", bottom: "auto"})
        } else if (actions === 2) {
            setPosition({top: "30%", left: "auto", right: "5%", bottom: "auto"})
        } else if (actions === 3) {
            setPosition({top: "30%", left: "auto", right: "30%", bottom: "auto"})
        } else if (actions === 4) {
            setPosition({top: "30%", left: "auto", right: "25%", bottom: "auto"})
        } else if (actions === 5) {
            setPosition({top: "30%", left: "0", right: "auto", bottom: "auto"})
        } else if (actions === 6) {
            setPosition({top: "30%", left: "auto", right: "0", bottom: "auto"})
        } else if (actions === 7) {
            setSpeaksChinese(true)
            setStartAPICall(true)
        } else if (actions === 8) {
            setSpeaksChinese(false)
            setStartAPICall(true)
        } else if (actions === 9) {
            setStartUpdate(true)
        }
    }, [actions])

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

    async function requestHelp(data) {
        const host = import.meta.env.VITE_HOST;
        setHelpVisible(true)
        setHelpDisabled(true)
        const response = await axios.post(`${host}/requesthelp`, {data: data})
        setHelpData(response.data)
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
        <div className="popup" key={'dialogue-box'} style={popupStyle}>
            <section className="popup-data" style={dataStyle} key={key}>
                <div className="popup-text">
                    {text}

                </div>
                <div className={`popup-btns ${btnClass}`}>
                    {(appliedFetchedOnce || buttons[0].goto != null) ? buttonElements : <div>Please wait for loading to complete...</div>}
                </div>
                {help &&
                <button className="popup-help" onClick={() => requestHelp(text)} disabled={helpDisabled}>
                    <img src="question.png" alt="question button"></img>
                </button>
                }
            </section>
            {helpVisible &&
                <div className="help-box">
                    {helpData ?
                    <>
                        <h2>AI Help:</h2>
                        <p>{helpData}</p>
                        <div className="popup-btns" >
                            <button onClick={closeHelp}>Close</button>

                        </div>
                    </>
                    : <p>Loading...</p>
                    }
                </div>
            }
        </div>
    )
}
