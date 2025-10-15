import { useState, useEffect } from 'react'
import { LevelContext } from './components/Context'

import ChineseRoom from './components/room/ChineseRoom'
import Desk from './components/desk/Desk'
import Popups from './components/Popups'

import './components/room/ChineseRoom.css'
import './components/desk/Desk.css'

import { isMobile } from 'react-device-detect';
import PopupItem from "./components/Popups"
import "./components/Popup.css"

function App() {

  if (isMobile) {
    return (
        <div className="popups" style={{backgroundImage: 'url("/desk.jpg")'}}>
            <div className="popup">
            <section className="popup-data" style={{fontSize: "30px"}}>
                <div className="popup-text" style={{textAlign: "center"}}>
                    Apologies, this experience only work on laptops and PC's. 

                </div>
                <div className="popup-text" style={{textAlign: "center"}}>
                    Please relaunch through a desktop browser for access to 'The Chinese Room' Philosophy Game
                    
                </div>
            </section>
            
          </div>
        </div>
    )
  }

  const [level, setLevel] = useState({
    level: 0,
    xp: 0,
    prestige: 0,
    xpRequired: 30
  })

  const [dialogue, setDialogue] = useState(0)

  const [currentlyPlaying, setCurrentlyPlaying] = useState(false)

  const [startUpdate, setStartUpdate] = useState(false)

  const [orderAnswer, setOrderAnswer] = useState([
    {
    id: "orders",
    items: []
    },
    {
    id: "answers",
    items: []
    },
    {
    id: "stapler",
    items: []
    },
    {
    id: "responses",
    items: []
    },
    {
    id: "bin",
    items: []
    },
    {
    id: "paper-container",
    items: []
    }
  ])

  return (
    <>
      <LevelContext value={{level: [level, setLevel], dialogue: [dialogue, setDialogue], currentlyPlaying: [currentlyPlaying, setCurrentlyPlaying], startUpdate: [startUpdate, setStartUpdate]
      }}>
        <Popups orderAnswerArr={[orderAnswer, setOrderAnswer]}/>
        <ChineseRoom />
        <Desk orderAnswerArr={[orderAnswer, setOrderAnswer]}/>
      </LevelContext>

    </>
  )
}

export default App
