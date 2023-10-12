import Image from "next/image";
import coinIcon from "./img/coin.gif";

const Loader = ({ show = true }:{ show:Boolean }) => {
    return show
        ? (<div className="loader col-sm-12 text-center">
                <Image alt="Loading" src={coinIcon} />
                <p className="message">WTF?! is happening...</p>
            </div>)
        : null;
}

export default Loader;