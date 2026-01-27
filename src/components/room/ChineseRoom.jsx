import { useContext, useEffect, useState, useRef } from 'react'
import { LevelContext } from '../Context'

import { MdMusicNote } from "react-icons/md";
import { MdMusicOff } from "react-icons/md";
import { IoHelpCircleSharp } from "react-icons/io5";
import AboutModal from './AboutModal'

import useSound from 'use-sound';
import egyptMusic from '../../assets/music/egyptMusic.wav'

import celebrationMusic from '../../assets/music/victoryMusic.wav'

import { useXpParticles } from './useXpParticles';
import xpSound from '../../assets/sounds/xpPoints.wav'

export default function ChineseRoom({gameOver}) {
    const [levelData, setLevel] = useContext(LevelContext).level
    const [xpStartLocation, setXpStartLocation] = useContext(LevelContext).xpStartLocation
    const [musicMuted, setMusicMuted] = useState(() => {
        const saved = localStorage.getItem('musicMuted')
        return saved === 'true'
    })
    const [tutorialOpen, setTutorialOpen] = useState(false)
    const { burst, Overlay } = useXpParticles();
    const xpIconRef = useRef(null);
    const [isLoadingTutorial, setIsLoadingTutorial] = useState(true);

    const [playXp] = useSound(xpSound)
    const [playCelebration] = useSound(celebrationMusic)

    // Xp particles

    const grantXp = (originEl) => {
        burst(
            originEl || { x: window.innerWidth - 40, y: window.innerHeight - 40 }, // from
            xpIconRef.current || { x: 12, y: 12 },                              // to
            { count: 42, scatter: 120, color: "limegreen", size: 8 }
        );
    };

    const { level, prestige, xp, xpRequired } = levelData
    
    // Music

    const [playMusic, { pause, stop }] = useSound(egyptMusic, {
        loop: true,
    });

    useEffect(() => {
        localStorage.setItem('musicMuted', musicMuted)
    }, [musicMuted])

    useEffect(() => { musicMuted ? pause() : playMusic(); }, [musicMuted, pause, playMusic]);

    const toggleMusic = () => setMusicMuted(m => !m);

    const musicButton = <button className="overlay-btn" onClick={toggleMusic}>{musicMuted ? <MdMusicOff size="3em"/> : <MdMusicNote size="3em"/>}</button>

    useEffect(() => {
        // Wait for first user gesture to satisfy autoplay policy
        const unlock = () => {
            playMusic();                 // start playback once
            window.removeEventListener('pointerdown', unlock);
        };
        window.addEventListener('pointerdown', unlock, { once: true });
        return () => window.removeEventListener('pointerdown', unlock);
    }, []);

    useEffect(() => {
        if (gameOver) {
            setMusicMuted(true)
            playCelebration()
        }
    }, [gameOver])

    // Tutorial revisit

    const tutorialButton = <button className="overlay-btn" onClick={() => setTutorialOpen(prev => !prev)}>{tutorialOpen ? <IoHelpCircleSharp color="white" size="3em"/> : <IoHelpCircleSharp size="3em"/>}</button>

    const tutorialInfo = <div className='popups'>
        <div className='popup'>
            <div className='popup-data'>
                <div className="popup-text" style={{fontSize: 24, fontWeight: "bold"}}>How To Play:</div>
                <div style={{ position: 'relative', width: '600px', minHeight: '337px' }}>
                {/* Loading Text */}
                {isLoadingTutorial && (
                <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)'
                }}>
                    Loading tutorial video...
                </div>
                )}

                <video
                width="600"
                autoPlay
                loop
                muted
                playsInline
                onLoadedData={() => setIsLoadingTutorial(false)} // Hides the text when video data is ready
                style={{ display: isLoadingTutorial ? 'none' : 'block' }} // Keeps layout stable
                >
                    <source src="/tutorialVideo.mp4" type="video/mp4" />
                </video>
            </div>
            </div>
        </div>
    </div>

    // Level-up

    const levelProgress = (xp / xpRequired) * 100;

    const levelProgressStyle = {
        width: `${levelProgress}%`,
        height: '100%',
    }

    useEffect(() => {
        if (xp !== 0) {
            grantXp(xpStartLocation)
            playXp()
        }
        if (xp >= xpRequired) {
            executeLevelUp()
        }
    }, [xp])

    function executeLevelUp() {
        setLevel(prev => {
            return {
                ...prev,
                level: prev.level + 1,
                xp: prev.xp - prev.xpRequired,
            }
        })
    }

    return (
        <>
            <section id='chinese-room'>
                <div className='level-data'>
                    <div className='level-number'>
                        <span>Level {level}</span>
                    </div>
                    <div className='level-bar' ref={xpIconRef}>
                        <div className='level-progress' style={levelProgressStyle}>

                        </div>
                    </div>
                </div>
                <div className='overlay-btn-container'>
                    {tutorialButton}
                    {musicButton}
                    <AboutModal />
                </div>                
                
                <Overlay />
            </section>
            {tutorialOpen && tutorialInfo}
        </>
    )
}