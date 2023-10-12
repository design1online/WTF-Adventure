import Footer from "../footer";
import Logo from "../logo";
import Loader from "../loader";
import DeathDialog from "../deathDialog";
import MessageDialog from "../messageDialog";
import LoadCharacterPage from '../loadCharacter';
import CreateCharacterPage from "../createCharacter";

const SplashPage = () => {
    return (
        <div id="modal" className="container-fluid col-sm-10">
            <section id="wrapper">
                <Logo />
                <section id="content" className="loadCharacter col-sm-11">
                    <Loader show={true} />
                    <LoadCharacterPage />
                    <CreateCharacterPage />
                    <DeathDialog />
                    <MessageDialog />
                </section>
                <Footer />
            </section>
        </div>
    );
}

export default SplashPage;