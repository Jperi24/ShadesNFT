import { ConnectButton } from "web3uikit";

export default function Header() {
  return (
    <div id="totoRight">
      <ConnectButton moralisAuth={false} />
    </div>
  );
}
