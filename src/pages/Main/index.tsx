import React, { useState, useEffect } from "react";
import { useAppSelector } from "../../app/hooks";
import { contractAddresses } from "../../hook/useContract";
import { toast } from "react-toastify";
import "./main.css";
// import {queryNftInfo, queryStateInfo} from "../../util/secretHelpers";
import bannerImg from "../../assets/Banner_shadow.png";
import steampunkImg from "../../assets/steampunk-image.png";
import collectionSize from "../../assets/collection-size-2100.png";
import mintPriceNormal from "../../assets/mint-price-normal.png";
import mintPriceWl from "../../assets/mint-price-wl.png";
import minusButton from "../../assets/Minus_shadow.png";
import plusButton from "../../assets/Plus_shadow.png";
import mintButton from "../../assets/Mint_Button.png";
import { SecretNetworkClient, MsgExecuteContract } from "secretjs";

const Main: React.FC = () => {
  let wl = false;
  // const { runQuery, runExecute } = useContract();
  const [mintValue, setMintValue] = useState(1);
  const account = useAppSelector((state) => state.accounts.keplrAccount);
  console.log("account: ", account);
  const mintContract = useAppSelector(
    (state) => state.accounts.accountList[contractAddresses.MINT_CONTRACT]
  );
  console.log("mintcontract: ", mintContract);
  // const nftContract = useAppSelector(
  //   (state) => state.accounts.accountList[contractAddresses.NFT_CONTRACT]
  // );
  // const minusMint = () => {
  //   if (mintValue > 0 && account) setMintValue(mintValue - 1);
  // };

  // const plusMint = () => {
  //   if (mintValue < 2100 && account) setMintValue(mintValue + 1);
  // };

  const mint = async () => {
    if (!window.keplr || !account) {
      toast.error("Connect your wallet");
      return;
    }
    await window.keplr.enable("pulsar-2");

    const queryJs: any = await SecretNetworkClient.create({
      grpcWebUrl: "https://pulsar-2.api.trivium.network:9091",
      chainId: "pulsar-2",
    });

    let codeHash: any = await queryJs.query.compute.contractCodeHash(
      contractAddresses.MINT_CONTRACT
    );

    let state: any = await queryJs.query.compute.queryContract({
      contractAddress: contractAddresses.MINT_CONTRACT,
      codeHash: codeHash,
      query: {
        get_state_info: {},
      },
    });

    let white_members: any = await queryJs.query.compute.queryContract({
      contractAddress: contractAddresses.MINT_CONTRACT,
      codeHash: codeHash,
      query: {
        get_white_users: {},
      },
    });

    if (state.private_mint) {
      if (!white_members.includes(account.address)) {
        toast.error("You are not whitelisted user");
        return;
      }

      let user_info: any = await queryJs.query.compute.queryContract({
        contractAddress: contractAddresses.MINT_CONTRACT,
        codeHash: codeHash,
        query: {
          get_user_info: {
            address: account.address,
          },
        },
      });

      if (user_info.length > state.maximum_count) {
        toast.error("You exceed your limit");
        return;
      }
    }

    console.log(white_members);

    if (Number(state.count) >= Number(state.total_supply)) {
      toast.error("You can not mint any more");
      return;
    }

    if (!state.private_mint && !state.public_mint) {
      toast.error("Mint is not started yet");
      return;
    }

    const secretJs = await SecretNetworkClient.create({
      grpcWebUrl: "https://pulsar-2.api.trivium.network:9091",
      chainId: "pulsar-2",
      wallet: window.keplr.getOfflineSignerOnlyAmino("pulsar-2"),
      walletAddress: account?.address,
      encryptionUtils: window.keplr.getEnigmaUtils("pulsar-2"),
    });

    console.log(secretJs);

    let msg = {
      find: "123",
    };

    let send_msg = {
      send: {
        recipient: contractAddresses.MINT_CONTRACT,
        recipient_code_hash: codeHash,
        amount: state.private_mint ? state.private_price : state.public_price,
        msg: btoa(JSON.stringify(msg)),
        padding: undefined,
        memo: undefined,
      },
    };
    const mintMsg = new MsgExecuteContract({
      sender: account.address,
      contractAddress: contractAddresses.TOKEN_CONTRACT,
      codeHash: state.token_contract_hash,
      msg: send_msg,
      sentFunds: [],
    });
    try {
      const tx = await secretJs.tx.broadcast([mintMsg], { gasLimit: 500_000 });
      console.log(tx);
      toast.success("Success");
    } catch (err) {
      console.log("error: ", err);
      toast.error("Failed");
    }
  };

  const fetchState = async () => {
    const queryJs: any = await SecretNetworkClient.create({
      grpcWebUrl: "https://pulsar-2.api.trivium.network:9091",
      chainId: "pulsar-2",
    });

    let codeHash: any = await queryJs.query.compute.contractCodeHash(
      contractAddresses.MINT_CONTRACT
    );

    let result = await queryJs.query.compute.queryContract({
      contractAddress: contractAddresses.MINT_CONTRACT,
      codeHash: codeHash,
      query: {
        get_state_info: {},
      },
    });
    setMintValue(result.count);
    console.log(result);
  };

  useEffect(() => {
    // fetchState()
    setInterval(() => {
      // if (account?.address !== owner)
      fetchState();
      // connect();
    }, 3000);
    //fetchNftInfo();
    return clearInterval();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <div className="main-container">
      <div>
        <div className="container display-flex">
          <img src={bannerImg} alt="banner" className="banner-image" />
          <div>
            <img
              src={steampunkImg}
              alt="steampunk"
              className="steampunk-image"
            />
            <div className="display-flex main-second-container">
              <div>
                <img
                  src={collectionSize}
                  alt="collection"
                  className="price-container"
                />
                {/* <p className="remain-font-size">2100</p> */}
              </div>
              <div>
                {wl ? (
                  <img
                    src={mintPriceNormal}
                    alt="collection"
                    className="price-container"
                  />
                ) : (
                  <img
                    src={mintPriceWl}
                    alt="collection"
                    className="price-container"
                  />
                )}
              </div>
            </div>
            <div className="display-flex main-button-container">
              <img
                src={minusButton}
                alt="collection"
                className="main-button-img"
                // onClick={() => minusMint()}
              />
              {account ? (
                <p className="main-mint-number">{mintValue} Minted</p>
              ) : (
                <div className="main-mint-number"></div>
              )}
              <img
                src={plusButton}
                alt="collection"
                className="main-button-img"
                // onClick={() => plusMint()}
              />
            </div>
            <img
              src={mintButton}
              alt="mintButton"
              className="main-mint-button"
              onClick={() => mint()}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Main;
