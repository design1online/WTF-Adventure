const Hud = () => {
    return (
        <div id="hud">
            <div id="hud-bar">
              <div id="hud-bar-right"></div>
              <div id="hud-bar-center"></div>
              <div id="hud-bar-left">
                <div id="attackInfo">
                  <div className="name"></div>
                  <div className="details"></div>
                  <div className="health"></div>
                </div>
              </div>
            </div>
        </div>
    )
}

export default Hud;