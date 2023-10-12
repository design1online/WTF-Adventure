'use client';
import { ChangeEventHandler } from "react";

const DropDialog = () => {
    const onChange:ChangeEventHandler<HTMLInputElement> = (e) => {
        return e;
    }
    
    return (
        <div id="dropDialog">
            <div id="dropTitle">Input drop count.</div>
            <div className="center">
              <input
                onChange={onChange}
                title="dropCount"
                type="text"
                id="dropCount"
                size={6}
                maxLength={11}
            />
              <span id="dropAccept">&nbsp;Accept&nbsp;</span>
              <span id="dropCancel">&nbsp;Cancel&nbsp;</span>
            </div>
        </div>
    )
}

export default DropDialog;