import { useWeb3Contract } from "react-moralis";
import abi from "../constants/ABI.json";
import abiMint from "../constants/MintABI.json";
import contractAddresses from "../constants/contractAddresses.json";
import CountdownTimer from "./CountdownTimer";
import { useMoralis } from "react-moralis";
import { useEffect, useState } from "react";
import { getEthPriceNow } from "get-eth-price";

export default function PlaceBid() {
  const {
    chainId: chainIdHex,
    isWeb3Enabled,
    authenticate,
    user,
    account,
    isAuthenticated,
  } = useMoralis();
  const chainId = parseInt(chainIdHex);
  const shadesAddress = "0xfea93c0e0F42482E9FA9F99a68d2B3c83A930f69";
  // chainId in contractAddresses ? contractAddresses[chainId][0] : null;

  const [bid, setBid] = useState();
  const [timeR, setTime] = useState();
  const [highestBidder, setBidder] = useState();
  const [highestBidderAddress, setBidderAddress] = useState();
  const [image, setImg] = useState();
  const [Id, setId] = useState();
  const [userFunds, setUserFunds] = useState();
  const [minBet, setMinBet] = useState();
  const [ethPrice, setEthPrice] = useState();

  const bidInwei = bid * 1000000000000000000;

  const { runContractFunction: enterAuction } = useWeb3Contract({
    abi: abi,
    contractAddress: shadesAddress,
    functionName: "placeBid",
    params: {},
    gasLimit: 12000,
    msgValue: bidInwei,
  });
  const { runContractFunction: getImg } = useWeb3Contract({
    abi: abi,
    contractAddress: shadesAddress,
    functionName: "getImg",
    params: {},
  });
  const { runContractFunction: getId } = useWeb3Contract({
    abi: abi,
    contractAddress: shadesAddress,
    functionName: "Id",
    params: {},
  });

  const { runContractFunction: end, data: enterTxResponse } = useWeb3Contract({
    abi: abi,
    contractAddress: shadesAddress,
    functionName: "timeEnd",
  });

  const { runContractFunction: timeRemaining } = useWeb3Contract({
    abi: abi,
    contractAddress: shadesAddress,
    functionName: "timeRemaining",
    params: {},
  });

  const { runContractFunction: highestBindingBid } = useWeb3Contract({
    abi: abi,
    contractAddress: shadesAddress,
    functionName: "getHighestBid",
  });

  const { runContractFunction: getYourFunds } = useWeb3Contract({
    abi: abi,
    contractAddress: shadesAddress,
    functionName: "getYourFunds",
    params: {},
  });

  const { runContractFunction: getHighestBidderAddress } = useWeb3Contract({
    abi: abi,
    contractAddress: shadesAddress,
    functionName: "getHighestBidder",
  });

  const { runContractFunction: ethPriceAtMint } = useWeb3Contract({
    abi: abi,
    contractAddress: shadesAddress,
    functionName: "ethPriceAtMint",
  });

  async function updateUIValues() {
    const imagee = await getImg();
    const id = await getId();
    const ethprice = await ethPriceAtMint();
    const highestBid = (await highestBindingBid()) / 1000000000000000000;
    const highestBidAddress = await getHighestBidderAddress();
    const funds = (await getYourFunds()) / 1000000000000000000;

    {
      typeof highestBid !== "undefined"
        ? setBidder(highestBid.toString() + "  ETH")
        : console.log(highestBid);
    }
    {
      typeof ethPriceAtMint !== "undefined"
        ? setEthPrice(ethprice.toString())
        : console.log(ethprice);
    }
    {
      typeof highestBid !== "undefined"
        ? setMinBet(highestBid)
        : console.log(highestBid);
    }
    if (typeof highestBid !== "undefined") {
      const YourMinimumBet = highestBid - funds;
      if (YourMinimumBet === 0) {
        setMinBet(0.1 + "Ξ Or More");
      } else {
        setMinBet(`${YourMinimumBet} +.1Ξ Or More`);
      }
    }
    {
      typeof funds !== "undefined"
        ? setUserFunds(funds.toString() + "  ETH")
        : console.log(funds + "your current funds");
    }

    // {
    //   typeof highestBidAddress !== "undefined"
    //     ? setBidderAddress(highestBidAddress1 + "..." + highestBidAddress2)
    //     : console.log(highestBid + "Highest Bidder Address");
    // }
    if (typeof highestBidAddress !== "undefined") {
      const highestBidAddress1 = highestBidAddress.substring(0, 5);
      const highestBidAddress2 = highestBidAddress.substring(
        highestBidAddress.length - 4,
        highestBidAddress.length
      );
      setBidderAddress(highestBidAddress1 + "..." + highestBidAddress2);
    }

    {
      typeof imagee !== "undefined" ? setImg(imagee) : console.log(imagee);
    }
    {
      typeof id !== "undefined" ? setId(id.toString()) : console.log(id);
    }
    console.log(imagee + "image");
    console.log(id + "ID");
    console.log(highestBid + "highestBid");
  }

  async function timeReset() {
    const NOW_IN_MS = new Date().getTime();
    const One = await timeRemaining();
    const dateTimeAfterOneDay = NOW_IN_MS + Number(One);
    console.log(dateTimeAfterOneDay, " datetime one dat");
    setTime(dateTimeAfterOneDay);
  }

  useEffect(() => {
    // const interval = setInterval(() => {

    // }, 1000 * 10);
    if (isWeb3Enabled) {
      updateUIValues();
      timeReset();
    }

    // return () => clearInterval(interval);
  }, [isWeb3Enabled, chainId]);

  const handleSuccess = async (tx) => {
    try {
      const txx = await tx.wait(1);
      console.log(txx.events[0]["event"]);
      if (txx.events[0]["event"] === "Ended") {
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div>
      <input
        type="number"
        id="inputBox"
        placeholder={minBet}
        required
        value={bid}
        onChange={(e) => setBid(e.target.value)}
      ></input>
      <button
        id="enterButton"
        onClick={async () => {
          await enterAuction();
        }}
      >
        Enter
      </button>
      {/* <h2>{userAddress}</h2> */}
      <ul id="toRight_notasmuch">
        <h2>ID: {Id}</h2>
        <h2>Eth Price @ Genesis</h2>
        <h3 id="toRightt">$ {ethPrice}</h3>
      </ul>

      <ul id="toRight" className="linedHorizon">
        <img src={image}></img>
        <ul className="padded">
          <h1>Highest Bid</h1>
          {highestBidder ? <h2>{highestBidder}</h2> : <h2>No Bids Yet</h2>}
        </ul>

        <ul className="padded">
          <h1>Highest Bidder</h1>
          {highestBidderAddress ? (
            <h2>{highestBidderAddress}</h2>
          ) : (
            <h2>No Bids Yet</h2>
          )}
        </ul>
      </ul>
      <ul className="linedHorizon2">
        <h1>Time Remaining</h1>
        <CountdownTimer targetDate={timeR}></CountdownTimer>
      </ul>

      <ul>
        <h1>Your Current Bid</h1>
        <h2>{userFunds}</h2>
      </ul>
    </div>
  );
}
