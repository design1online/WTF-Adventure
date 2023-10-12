import Image from "next/image";
import chatIcon from "./img/chat.png";
import inventoryIcon from "./img/inventory.png";

const ChatBar = () => {
    return (
        <div id="chat-bar">
            <Image alt="Chat" src={chatIcon} id="hud-chat" />
            <Image alt="Inventory" src={inventoryIcon} id="hud-inventory" />
        </div>
    )
}

export default ChatBar;