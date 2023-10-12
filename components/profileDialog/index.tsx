const ProfileDialog = () => {
    return (
        <div id="profileDialog">
            <div id="statePage" className="page">
              <div id="profileName" className="profileInfo"></div>
              <div id="profileLevel" className="profileInfo"></div>
              <div id="profileExperience" className="profileInfo"></div>
              <div id="weaponSlot" className="profileSlot"></div>
              <div id="armourSlot" className="profileSlot"></div>
              <div id="pendantSlot" className="profileSlot"></div>
              <div id="ringSlot" className="profileSlot"></div>
              <div id="bootsSlot" className="profileSlot"></div>
            </div>
            <div id="questPage" className="page">
              <div id="achievementCount"></div>
              <div id="achievementList">
                <ul></ul>
              </div>
              <div id="questCount"></div>
              <div id="questList">
                <ul></ul>
              </div>
            </div>
            <div id="skillPage" className="page"></div>
            <div id="navigator">
              <div id="previous"></div>
              <div id="next"></div>
            </div>
        </div>
    )
}

export default ProfileDialog;