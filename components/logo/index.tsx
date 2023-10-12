import Image from "next/image";
import logoImg from './wtfintro.png';

const Logo = () => {
    return (
        <header>
            <Image
                src={logoImg}
                alt="WTF Adventure"
                title="WTF Adventure"
                id="logo"
            />
        </header>
    );
}

export default Logo;