import DraggableAnywhere from "../base_dnd/DraggableAnywhere"
import { useState, useContext, useEffect } from 'react'
import { useWindowHeight, useWindowWidth } from '@react-hook/window-size'
import { LevelContext } from "../Context"
import { FaArrowRight } from "react-icons/fa";

import useSound from 'use-sound';
import ruleMoveSound from '../../assets/sounds/ruleMove.wav'

export default function RuleBook({ref, rules, updateRule=null, zIndex}) {
    const [playRuleMove] = useSound(ruleMoveSound)
    const [level, setLevel] = useContext(LevelContext).level
    const [currentlyPlaying, setCurrentlyPlaying] = useContext(LevelContext).currentlyPlaying
    
    const [disabled, setDisabled] = useState(false)

    const [currPage, setCurrPage] = useState(1);
    const rulesPerPage = 3;

    const lastIndex = currPage * rulesPerPage;
    const firstIndex = lastIndex - rulesPerPage;

    const currRules = rules.active.slice(firstIndex, lastIndex)

    // Sets page to 1 whenever rules are updated
    useEffect(() => {
        // Prevents reseting page after spinwheel
        if (currentlyPlaying) return

        setCurrPage(1)
        setDisabled(false)
    }, [rules])

    // Updates rules for when spinwheel is in play and new rules need to be generated
    function handleButtonClick(rule) {
        updateRule(rule.order)
        setDisabled(true);
    }

    // Creates rules and answers for before and after spinwheel
    const rulesElements = currRules.map(rule => {
        // No spinwheel
        if (level.level < 2) {
            return (
            <div className='rule' key={rule.id}>
                <div className="rule-data">
                    <span>You Receive: </span>
                    <span className="character">{rule.order}</span>

                </div>
                <span className="rule-arrow"><FaArrowRight /></span>
                <div className="rule-data">
                    <span>You Respond: </span>
                    <span className="character">{rule.answer}</span>
                </div>
            </div>
            )
        }
        
        // Spinwheel in play
        return (
            <div className='rule' key={rule.id}>
                <div className="rule-data">
                    <span>You Receive: </span>
                    <span className="character">{rule.order}</span>

                </div>
                <span className="rule-arrow"><FaArrowRight /></span>
                <div className="rule-data">
                    <span>You Respond: </span>
                    {rule.answer === "???" ? <button disabled={disabled} onClick={() => handleButtonClick(rule)} className="generate-button">Generate</button>: <span className="character">{rule.answer}</span>}
                </div>
                
            </div>
        )
    })

    // Calculates the amount of pages needed and creates buttons
    const pageCount = Math.ceil(rules.active.length / rulesPerPage);
    let pageButtons = [];
    for (let i = 1; i < pageCount + 1; i++)  {
        pageButtons.push(
            <button 
                onClick={() => {playRuleMove(); setCurrPage(i)}} 
                className={currPage === i ? "active-btn" : ""}
                key={`btn-${i}`}
            >{i}</button>
        )
    }

    return (
        <DraggableAnywhere 
            id='rulebook-handle'
            ref={ref} 
            startPos={{x: useWindowWidth() * 0.75, y: useWindowHeight() / 2 - 290}} 
            className='rulebook-ui'
            type='container'
            off={true}
            style={{zIndex: zIndex}}
            doDragAnimation={true}
        >
            <div className="book-tab">
                <h4>Rulebook</h4>
            </div>
            <div className="rules-content">
                {rulesElements}
            </div>
            <div className="rulebook-btns">
                {pageButtons}
            </div>
        </DraggableAnywhere>
    )
}