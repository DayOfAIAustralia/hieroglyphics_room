import useSound from "use-sound";
import spinSound from "../../../assets/sounds/spin.wav";
import bookOpenSound from "../../../assets/sounds/bookOpen.wav";
import bookCloseSound from "../../../assets/sounds/bookClose.wav";
import swooshSound from "../../../assets/sounds/swoosh.wav";
import tileSound from "../../../assets/sounds/tile.wav";
import hornSound from "../../../assets/sounds/confetti.wav";
import dingSound from "../../../assets/sounds/ding.wav";
import wrongSound from "../../../assets/sounds/wrong.wav";

export default function useSoundEffects() {
  const [playSpin] = useSound(spinSound);
  const [playBookOpen] = useSound(bookOpenSound);
  const [playBookClose] = useSound(bookCloseSound);
  const [playSwoosh] = useSound(swooshSound);
  const [playTile] = useSound(tileSound);
  const [playHorn] = useSound(hornSound);
  const [playDing] = useSound(dingSound);
  const [playWrong] = useSound(wrongSound);

  return {
    playSpin,
    playBookOpen,
    playBookClose,
    playSwoosh,
    playTile,
    playHorn,
    playDing,
    playWrong,
  };
}
