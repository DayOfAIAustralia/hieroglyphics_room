import PopupItem from "./PopupItem"
import "./Popup.css"
import { LevelContext, TutorialContext } from "./Context"
import popupsJSON from "../assets/popups.json"


import React from 'react'

// Popup interface
// {id, content, button1, button2}

export default function Popups({orderAnswerArr, setGameOver}) {
    const [popupIndex, setPopupIndex] = React.useState(0)
    const [currentlyPlaying, setCurrentlyPlaying] = React.useContext(LevelContext).currentlyPlaying
    const dialogueClosed = React.useRef(false)
    const [level, setLevel] = React.useContext(LevelContext).level
    const [isTutorial, setIsTutorial] = React.useState(false)

    let currentPopup
    if (dialogueClosed.current) {
        currentPopup = null
    } else {
        currentPopup = popupsJSON[level.level].popups;
    }

    function updateDialogue(goto) {
        if (goto !== null) {
            setPopupIndex(goto)
        } else {
            dialogueClosed.current = true;
            setCurrentlyPlaying(true)
            setIsTutorial(false)
        }
    }
    
    React.useEffect(() => {
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
                    orderAnswerArr={orderAnswerArr}
                    help={currentPopup[popupIndex]?.help}
                    setGameOver={setGameOver}
                />
            </div>
        </TutorialContext>
    )
}