import DraggableAnywhere from "../base_dnd/DraggableAnywhere"
import { useState, useContext, useEffect } from 'react'
import { useWindowHeight, useWindowWidth } from '@react-hook/window-size'
import { LevelContext } from "../Context"

import useSound from 'use-sound';
import ruleMoveSound from '../../assets/sounds/ruleMove.wav'

export default function RuleBook({ref, rules, updateRule=null}) {
    const [playRuleMove] = useSound(ruleMoveSound)
    const [level, setLevel] = useContext(LevelContext).level


    const [currPage, setCurrPage] = useState(1);
    const rulesPerPage = 4;

    const lastIndex = currPage * rulesPerPage;
    const firstIndex = lastIndex - rulesPerPage;

    const currRules = rules.active.slice(firstIndex, lastIndex)

    useEffect(() => {
        setCurrPage(1)
    }, [rules])

    const rulesElements = currRules.map(rule => {
        if (level.level < 2) {
            return (
            <div className='rule' key={rule.id}>
                <span>They say: {rule.order}</span>
                <span>Then you say: {rule.answer}</span>
            </div>
            )
        }
        
        return (
            <div className='rule' key={rule.id}>
                <span>They say: {rule.order}</span>
                <span>Then you say: {rule.answer}</span>
                <button onClick={() => updateRule(rule.order)}>Generate</button>
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
            startPos={{x: useWindowWidth() * 0.75, y: useWindowHeight() / 2 - 120}} 
            className='rulebook-ui'
            type='container'
            off={true}
        >
            {rulesElements}
            <div className="rulebook-btns">
                {pageButtons}
            </div>
        </DraggableAnywhere>
    )
}