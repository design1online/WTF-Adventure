'use client';
import { ChangeEventHandler } from "react";

const ChatInput = () => {

    const onChange:ChangeEventHandler<HTMLInputElement> = (e) => {
        return e;
    }

    return (
        <div id="chat">
            <div id="talk">
                <form method="get" acceptCharset="utf-8">
                <input 
                    onChange={onChange}
                    title="Enter your message!"
                    id="hud-chat-input"
                    className="chatInputData"
                    type="text"
                    maxLength={256}
                />
                </form>
            </div>
            <div id="chatLog"></div>
        </div>
    )
};

export default ChatInput;