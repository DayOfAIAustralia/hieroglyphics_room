import { useState, useEffect } from 'react'
import { LevelContext } from './components/Context'
import {  AnimatePresence, motion } from 'framer-motion'

import ChineseRoom from './components/room/ChineseRoom'
import Desk from './components/desk/Desk'
import Popups from './components/popups/Popups'

import './components/room/ChineseRoom.css'
import './components/desk/Desk.css'

import "./components/popups/Popup.css"

function App() {

  const [level, setLevel] = useState({
    level: 0, // can change to skip to later levels
    xp: 0,
    xpRequired: 90
  })

  // Global context values needed across components
  const [tutorialState, setTutorialState] = useState(null)

  const [currentlyPlaying, setCurrentlyPlaying] = useState(false)

  const [startUpdate, setStartUpdate] = useState(false)

  const [isLoading, setIsLoading] = useState(true)

  const [gameOver, setGameOver] = useState(false)

  const [xpStartLocation, setXpStartLocation] = useState({x: 0, y: 0})

  // Preloading work
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500); // 1.5 second loading screen to ensure assets are downloaded

    return () => clearTimeout(timer);
  }, []);

  // Preloads images to prevent game stuttering
  useEffect(() => {
    const imagesToPreload = [
      '/arrow.png',
      '/question.png',
      '/dictionaryOpen.png',
      '/rulesOpen.png',
      '/staplerCursor.png',
      '/slip.png',
    ];

    imagesToPreload.forEach((image) => new Image().src = image);
  }, []);

  // Contains the orders that are added throughout the game
  const [orders, setOrders] = useState([])


  return (
    <>
      {/* Warning to use landscape mode */}
      <div className="popups rotate-device-overlay" style={{backgroundImage: 'url("/desk.jpg")', zIndex: 9999}}>
          <div className="popup">
          <section className="popup-data" style={{fontSize: "30px"}}>
              <div className="popup-text" style={{textAlign: "center"}}>
                  This game can only be played in landscape mode. 

              </div>
              <div className="popup-text" style={{textAlign: "center"}}>
                  Please rotate your device to continue!
                  
              </div>
          </section>
          
        </div>
      </div>

      {/* Loading screen */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            key="loading-screen"
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              backgroundColor: '#c2b280',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              zIndex: 9999
            }}
            exit={{ opacity: 0, transition: { duration: 0.5 } }}
          >
            <svg width="60" height="60" viewBox="0 0 60 60">
              <circle
                cx="30"
                cy="30"
                r="25"
                stroke="#fff"
                strokeWidth="5"
                fill="transparent"
              />
              <motion.circle
                cx="30"
                cy="30"
                r="25"
                stroke="#3498db"
                strokeWidth="5"
                fill="transparent"
                strokeDasharray={157}
                strokeDashoffset={157}
                transform="rotate(-90 30 30)"
                animate={{ strokeDashoffset: 0 }}
                transition={{
                  duration: 1.5,
                  ease: "linear"
                }}
              />
            </svg>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Game context and components */}
      <LevelContext value={{level: [level, setLevel], currentlyPlaying: [currentlyPlaying, setCurrentlyPlaying], startUpdate: [startUpdate, setStartUpdate], tutorialState: [tutorialState, setTutorialState], xpStartLocation: [xpStartLocation, setXpStartLocation]
      }}>
        <Popups orders={[orders, setOrders]} setGameOver={setGameOver}/>
        <ChineseRoom gameOver={gameOver}/>
        <Desk ordersObj={[orders, setOrders]}/>
      </LevelContext>

    </>
  )
}

export default App
