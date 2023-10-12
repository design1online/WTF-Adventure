import Canvas from "../canvas";

const CreateCharacter = () => {
    return (
        <article id="createCharacter">
            <h1>Create An Account</h1>
            <div className="row">
                <div className="col-md-12 col-lg-7">
                    <form method="get" acceptCharset="utf-8">
                        <input type="text" id="registerNameInput" name="player-name" placeholder="Username" maxLength={32} autoComplete="off" />
                        <input type="password" id="registerPasswordInput" name="player-password" placeholder="Password" maxLength={64} autoComplete="off" />
                        <input type="password" id="registerPasswordConfirmationInput" name="player-password2" placeholder="Confirm Password" maxLength={64} autoComplete="off" />
                        <input type="email" id="registerEmailInput" name="player-email" placeholder="Email Address" maxLength={64} autoComplete="off" />
                    </form>
                </div>
                <div className="col-md-12 col-lg-3">
                    <Canvas id="pickCharacter" width="100%" height="100%" />
                </div>
            </div>
            <p>&nbsp;</p>
            <div className="row">
                <div className="col-2"></div>
                <div className="col-4">
                    <div className="button green" id="play">Play</div>
                </div>
                <div className="col-4">
                    <div className="button red" id="cancel">Cancel</div>
                </div>
                <div className="col-2"></div>
            </div>
            <div className="validation-summary"></div>
        </article>
    )
}

export default CreateCharacter;