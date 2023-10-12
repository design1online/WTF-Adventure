'use client';
import { ChangeEventHandler } from "react";

const SettingsDialog = () => {
    const onChange:ChangeEventHandler<HTMLInputElement> = (e) => {
        return e;
    }

    return (
        <div id="settingsPage" className="page">
            <div id="sliders">
              <input 
                onChange={onChange}
                title="Volume"
                id="volume"
                className="input"
                type="range"
                min="0"
                max="100"
                value="100" />
              <input onChange={onChange} title="SFX" id="sfx" className="input" type="range" min="0" max="100" value="100" />
              <input onChange={onChange} title="Brightness" id="brightness" className="input" type="range" min="0" max="100" value="100" />
              <input onChange={onChange} title="Intensity" id="intensity" className="input" type="range" min="1" max="10" value="1" />
            </div>
            <div id="texts">
              <p>Volume</p>
              <p>SFX</p>
              <p>Brightness</p>
              <p>Sound</p>
              <p>Centred Camera</p>
              <p>Debugging</p>
              <p>Auto Centre</p>
              <p>Names</p>
              <p>Levels</p>
              <p>Intensity</p>
            </div>
            <div id="info"></div>
            <div id="checkMarks">
              <div id="soundCheck" className="check"></div>
              <div id="cameraCheck" className="check"></div>
              <div id="debugCheck" className="check"></div>
              <div id="centreCheck" className="check"></div>
              <div id="nameCheck" className="check"></div>
              <div id="levelCheck" className="check"></div>
            </div>
        </div>
    );
}

export default SettingsDialog;