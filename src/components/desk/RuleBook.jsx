import DraggableAnywhere from "../base_dnd/DraggableAnywhere"
import { useState, useContext, useEffect } from 'react'
import { useWindowHeight, useWindowWidth } from '@react-hook/window-size'
import { LevelContext } from "../Context"

import useSound from 'use-sound';
import ruleMoveSound from '../../assets/sounds/ruleMove.wav'

export default function RuleBook({ref, rules, updateRule=null}) {
    const [playRuleMove] = useSound(ruleMoveSound)
    const [level, setLevel] = useContext(LevelContext).level
    const [disabled, setDisabled] = useState(false)

    const [currPage, setCurrPage] = useState(1);
    const rulesPerPage = 3;

    const lastIndex = currPage * rulesPerPage;
    const firstIndex = lastIndex - rulesPerPage;

    const currRules = rules.active.slice(firstIndex, lastIndex)

    useEffect(() => {
        setCurrPage(1)
        setDisabled(false)
    }, [rules])

    function handleButtonClick(rule) {
        updateRule(rule.order)
        setDisabled(true);
    }

    const rulesElements = currRules.map(rule => {
        if (level.level < 2) {
            return (
            <div className='rule' key={rule.id}>
                <span>You Receive: <span className="character">{rule.order}</span></span>
                <span>You Respond: <span className="character">{rule.answer}</span></span>
            </div>
            )
        }
        
        return (
            <div className='rule' key={rule.id}>
                <span>You Receive: <span className="character">{rule.order}</span></span>
                <span>You Respond: <span className="character">{rule.answer}</span></span>
                {rule.answer === "???" ? <button disabled={disabled} onClick={() => handleButtonClick(rule)} className="generate-button">Generate</button>: null}
            </div>
        )
    })

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