import Canvas from '@/component/canvas';
import ChatInput from '@/component/chatInput';
import ChatBar from '@/component/chatBar';
import WorldBar from '@/component/worldBar';
import Bubbles from '@/component/bubbles';
import Hud from '@/component/hud';
import ButtonBar from '@/component/buttonBar';
import DropDialog from '@/component/dropDialog';
import Map from '@/component/map';
import ProfileDialog from '@/component/profileDialog';
import SettingsDialog from '@/component/settingsDialog';
import Inventory from '@/component/inventory';
import Bank from '@/component/bank';
import Trade from '@/component/trade';
import Enchant from '@/component/enchant';
import AbilitiesBar from '@/component/abilitiesBar';
import Notifications from '@/component/notifications';
import PlayerActions from '@/component/playerActions';
import ActionsDialog from '@/component/actionsDialog';

const GamePage = () => {
    return (
        <div id="container">
            <div id="border">
                <Bubbles />
                <div id="canvasLayers">
                    <Canvas id="background" />
                    <Canvas id="entities" />
                    <Canvas id="foreground" />
                    <Canvas id="cursor" />
                    <Canvas id="textCanvas" />
                </div>
                <WorldBar />
                <ChatBar />
                <Hud />
                <ButtonBar />
                <ActionsDialog />
                <PlayerActions />
                <DropDialog />
                <ProfileDialog />
                <SettingsDialog />
                <Map />
                <Inventory />
                <Bank />
                <Trade />
                <Enchant />
                <AbilitiesBar />
                <Notifications />
                <ChatInput />
            </div>
        </div>
    );
}

export default GamePage;