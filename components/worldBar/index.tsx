import Image from "next/image";
import worldIcon from "./img/world.png";
import achievementIcon from "./img/achievements.png";

const WorldBar = () => {
    return (
        <div id="world-bar">
            <Image alt="world" src={worldIcon} id="hud-world" />
            <Image alt="Achievements" src={achievementIcon} id="hud-achievements" />
        </div>
    )
}

export default WorldBar;