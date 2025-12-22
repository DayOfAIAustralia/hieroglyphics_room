import PopupItem from "./PopupItem"
import "./Popup.css"
import { LevelContext, TutorialContext } from "../Context"
import popupsJSON from "../../assets/popups.json"

import React, {useEffect, useState, useContext, useRef} from 'react'

// Popup interface
// {id, content, button1, button2}

export default function Popups({orders, setGameOver}) {
    const [popupIndex, setPopupIndex] = useState(0)
    const [currentlyPlaying, setCurrentlyPlaying] = useContext(LevelContext).currentlyPlaying
    const dialogueClosed = useRef(false)
    const [level, setLevel] = useContext(LevelContext).level
    const [isTutorial, setIsTutorial] = useState(false)

    let currentPopup
    if (dialogueClosed.current) {
        currentPopup = null
    } else {
        currentPopup = popupsJSON[level.level].popups;
    }

    // Updates dialogue upon button click leading to goto update, 
    // also turns off tutorial upon first null button
    function updateDialogue(goto) {
        if (goto !== null) {
            setPopupIndex(goto)
        } else {
            dialogueClosed.current = true;
            setCurrentlyPlaying(true)
            setIsTutorial(false)
        }
    }
    
    // Resets dialogue index to 0 upon level up to start new level
    useEffect(() => {
        setPopupIndex(0)
        dialogueClosed.current = false;
        setCurrentlyPlaying(false)
    }, [level.level])

    if (currentPopup === null) return;
    return (
        <TutorialContext value={[isTutorial, setIsTutorial]}>
            <div className={!isTutorial ? "popups" : ""}>
                <PopupItem
                    text={currentPopup[popupIndex].text}
                    buttons={currentPopup[popupIndex].buttons}
                    updateDialogue={updateDialogue}
                    actions={currentPopup[popupIndex]?.actions}
                    ordersObj={orders}
                    help={currentPopup[popupIndex]?.help}
                    setGameOver={setGameOver}
                />
            </div>
        </TutorialContext>
    )
}