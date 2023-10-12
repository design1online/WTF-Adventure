const Notifications = () => {
    return (
        <div id="notifications">
            <div id="notifFade" className="fade"></div>
            <div id="notify">
              <div id="exclamation"></div>
              <div id="notifyDone" className="done"></div>
            </div>
            <div id="confirm">
              <div id="question"></div>
              <div id="confirmDone" className="done"></div>
              <div id="cancel"></div>
            </div>
            <div id="message"></div>
        </div>
    )
}

export default Notifications;