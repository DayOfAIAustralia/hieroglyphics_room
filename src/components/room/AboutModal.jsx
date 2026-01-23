import { useState } from "react";
import { createPortal } from "react-dom";
import { IoInformationCircleSharp, IoClose } from "react-icons/io5";
import "./AboutModal.css";

export default function AboutModal() {
  const [isOpen, setIsOpen] = useState(false);

  const modal = (
    <div className="popups" onClick={() => setIsOpen(false)}>
      <div className="popup">
        <div className="about-modal" onClick={(e) => e.stopPropagation()}>
          <button className="about-close-btn" onClick={() => setIsOpen(false)}>
            <IoClose size="1.5em" />
          </button>

          <div className="about-logos-container">
            <div
              className="about-text"
              style={{ fontSize: 36, fontWeight: "bold" }}
            >
              About This Game
            </div>
            <div
              className="about-text"
              style={{
                borderBottom: "solid #8b7355 1px",
                paddingBottom: "24px",
              }}
            >
              The Pyramid Puzzle is an educational game inspired by John
              Searle's Chinese Room thought experiment. You play as an intern in
              the Hieroglyph Translation Department, following rules to
              translate Egyptian hieroglyphics (without understanding their
              meaning). Throughout the game, you'll explore the difference
              between syntax (following rules) and semantics (true
              understanding), and discover how this relates to how AI and Large
              Language Models work.
            </div>
            <div>
              The Pyramid Puzzle was created by Day of AI Australia in
              partnership with UNSW Sydney and with the support of Google.org
            </div>
            <div className="about-credits">
              <div>
                <strong>Concept and game design</strong>
                <br />
                Patrick Crown-Milliss
              </div>
              <div>
                <strong>With development support from</strong>
                <br />
                Oliver Xu
              </div>
            </div>
            <div className="about-logos">
              <div className="about-logos-row">
                <img
                  className="about-logo-square"
                  src="/logos/doai-logo.png"
                  alt="Logo Day of AI Australia"
                />
                <img
                  className="about-logo-square"
                  src="/logos/unsw.png"
                  alt="Logo UNSW Sydney"
                />
              </div>
              <div className="about-logos-row">
                <img
                  className="about-logo-rect"
                  src="/logos/googleorg.png"
                  alt="Logo Google.org"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <button
        className="overlay-btn"
        onClick={() => setIsOpen((prev) => !prev)}
      >
        <IoInformationCircleSharp size="3em" />
      </button>
      {isOpen && createPortal(modal, document.body)}
    </>
  );
}
