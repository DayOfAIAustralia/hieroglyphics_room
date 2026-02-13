import { useState, useContext, useEffect } from "react";
import { LevelContext } from "../Context";
import { FaArrowRight } from "react-icons/fa";
import useSound from "use-sound";
import ruleMoveSound from "../../assets/sounds/ruleMove.wav";

export default function RuleBook({ ref, rules, updateRule = null, zIndex }) {
  const [playRuleMove] = useSound(ruleMoveSound);
  const [level, setLevel] = useContext(LevelContext).level;
  const [currentlyPlaying, setCurrentlyPlaying] =
    useContext(LevelContext).currentlyPlaying;

  const [disabled, setDisabled] = useState(false);

  const [currPage, setCurrPage] = useState(1);
  const rulesPerPage = 3;

  const lastIndex = currPage * rulesPerPage;
  const firstIndex = lastIndex - rulesPerPage;

  const currRules = rules.active.slice(firstIndex, lastIndex);

  // Sets page to 1 whenever rules are updated
  useEffect(() => {
    // Prevents reseting page after spinwheel
    if (currentlyPlaying) return;

    setCurrPage(1);
  }, [rules]);

  // Re-enable generate button after rules update (spin complete)
  useEffect(() => {
    setDisabled(false);
  }, [rules]);

  // Updates rules for when spinwheel is in play and new rules need to be generated
  function handleButtonClick(rule) {
    updateRule(rule.order);
    setDisabled(true);
  }

  // Creates rules and answers for before and after spinwheel
  const rulesElements = currRules.map((rule) => {
    // No spinwheel
    if (level.level < 2) {
      return (
        <div className="rule" key={rule.id}>
          <div className="rule-data">
            <span>You Receive: </span>
            <span className="character">{rule.order}</span>
          </div>
          <div className="rule-data">
            <span>You Respond: </span>
            <span className="character">{rule.answer}</span>
          </div>
        </div>
      );
    }

    // Spinwheel in play
    return (
      <div className="rule" key={rule.id}>
        <div className="rule-data">
          <span>You Receive: </span>
          <span className="character">{rule.order}</span>
        </div>
        <div className="rule-data">
          <span>You Respond: </span>
          {rule.answer === "???" ? (
            <button
              disabled={disabled}
              onClick={() => handleButtonClick(rule)}
              className="generate-button"
            >
              Generate
            </button>
          ) : (
            <span className="character">{rule.answer}</span>
          )}
        </div>
      </div>
    );
  });

  // Calculates the amount of pages needed and creates buttons
  const pageCount = Math.ceil(rules.active.length / rulesPerPage);
  let pageButtons = [];
  for (let i = 1; i < pageCount + 1; i++) {
    pageButtons.push(
      <button
        onClick={() => {
          playRuleMove();
          setCurrPage(i);
        }}
        className={currPage === i ? "active-btn" : ""}
        key={`btn-${i}`}
      >
        {i}
      </button>,
    );
  }

  return (
    <div
      id="rulebook-handle"
      ref={ref}
      className="rulebook-ui"
      style={{ zIndex: zIndex }}
    >
      <div className="book-tab">Rulebook</div>
      <div className="rules-content">{rulesElements}</div>
      <div className="rulebook-btns">{pageButtons}</div>
    </div>
  );
}
