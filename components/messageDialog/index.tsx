const MessageDialog = () => {
    return (
        <article id="message">
            <p>
                <span className="left-ornament"></span>
                <span className="title">
                <strong>Am I Dreaming?</strong>
                </span>
                <span className="right-ornament"></span>
            </p>
            <br/>
            <p>Last night you were feeling a bit exhausted from a long day at school. You could hardly keep your eyes open as you munched away at dinner. When you finally dragged yourself up to bed you fell asleep as soon as your head hit the pillow. It was nearly noon when you woke up and jumped out of bed because your alarm hadn&apos;t gone off... only you&apos;re not quite sure where you are. To make matters worse, a creepy guy with a computer is sitting in the corner of your room and you&apos;re still in your pajamas. Yikes!</p>
            <p>&nbsp;</p>
            <p><em>Use the arrow or W A S D keys to move.</em></p>
            <div id="yes">
                <span className="link">He&apos;s cute, maybe I should go talk to him...</span>
            </div>
            <div id="no">
                <span className="link">WTF?!?! Kick him where it hurts!</span>
            </div>
        </article>
    )
}

export default MessageDialog;