import Image from "next/image";
import playerIcon from './img/friends-2.png';
import passwordIcon from './img/lock.png';
import joinIcon from './img/hud-join.png';
import guestIcon from './img/hud-guest.png';

const LoadCharacter = () => {
    return (
        <article id="loadCharacter" className="row text-center">
            <section className="col-md-12 col-lg-7">
                <form method="get" acceptCharset="utf-8">
                    <span className="error message"></span>
                    <div className="form-field">
                        <Image alt="Player Name Icon" src={playerIcon} className="hud-img" />
                        <input type="text" id="loginNameInput" name="player-name" placeholder="Username" maxLength={32} autoComplete="off" autoFocus />
                    </div>
                    <div className="form-field">
                        <Image alt="Password Icon" src={passwordIcon} className="hud-img" />
                        <input type="password" id="loginPasswordInput" name="player-password" placeholder="Password" maxLength={64} autoComplete="off" />
                    </div>
                    <div className="row padding-top">
                        <div className="col-sm-7" id="rememberMeWrapper">
                            <div id="rememberMe" className="check"></div>
                            Remember Me
                        </div>
                        <div className="col-sm-4 text-center">
                            <div className="button green align-center" id="loginButton">Login</div>
                        </div>
                    </div>
                </form>
            </section>
            <section className="col-md-12 col-lg-5">
                <div className="row" id="join_guest">
                <div className="col-6 col-sm-6">
                    <Image alt="Join Icon" src={joinIcon} className="hud-img" />
                    <div className="button red align-center disabled" id="newCharacter">Join</div>
                </div>
                <div className="col-6 col-sm-6">
                    <Image alt="Guest Icon" src={guestIcon} className="hud-img" />
                    <div className="button purple align-center disabled" id="guest">Guest Login</div>
                </div>
                </div>
            </section>
        </article>
    )
}

export default LoadCharacter;