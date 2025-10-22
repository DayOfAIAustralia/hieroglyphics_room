import { useContext, useEffect, useState } from 'react'
import { LevelContext } from '../Context'

import { MdMusicNote } from "react-icons/md";
import { MdMusicOff } from "react-icons/md";

import useSound from 'use-sound';
import egyptMusic from '../../assets/music/egyptMusic.wav'

export default function ChineseRoom() {
    const [levelData, setLevel] = useContext(LevelContext).level
    const [dialogue, setDialogue] = useContext(LevelContext).dialogue
    const [musicMuted, setMusicMuted] = useState(true)

    const { level, prestige, xp, xpRequired } = levelData
    
    // Music

    const [playMusic, { pause, stop }] = useSound(egyptMusic, {
        loop: true,
    });

    useEffect(() => { musicMuted ? pause() : playMusic(); }, [musicMuted, pause, playMusic]);

    const toggleMusic = () => setMusicMuted(m => !m);

    const musicButton = <button className="music-btn" onClick={toggleMusic}>{musicMuted ? <MdMusicOff size="3em"/> : <MdMusicNote size="3em"/>}</button>

    useEffect(() => {
        // Wait for first user gesture to satisfy autoplay policy
        const unlock = () => {
            playMusic();                 // start playback once
            window.removeEventListener('pointerdown', unlock);
        };
        window.addEventListener('pointerdown', unlock, { once: true });
        return () => window.removeEventListener('pointerdown', unlock);
    }, []);

    // Level-up

    const levelProgress = (xp / xpRequired) * 100;

    const levelProgressStyle = {
        width: `${levelProgress}%`,
        height: '100%',
    }

    useEffect(() => {
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
        setDialogue(prev => prev + 1)
    }

    return (
        <section id='chinese-room'>
            <div className='level-data'>
                <div className='level-number'>
                    <span>Level {level}</span>
                </div>
                <div className='level-bar'>
                    <div className='level-progress' style={levelProgressStyle}>

                    </div>
                </div>
            </div>
            {musicButton}

        </section>
    )
}