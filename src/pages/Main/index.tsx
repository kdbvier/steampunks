import React, { useState, useEffect } from "react";
import { MsgExecuteContract } from "secretjs";
// import { toast } from "react-toastify";
import { useAppSelector } from "../../app/hooks";
import { contractAddresses } from "../../hook/useContract";
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
import { SecretNetworkClient } from "secretjs";

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
    if (!window.keplr || !account) return;
    await window.keplr.enable("pulsar-2");

    const queryJs: any = await SecretNetworkClient.create({
      grpcWebUrl: "https://pulsar-2.api.trivium.network:9091",
      chainId: "pulsar-2",
    });

    console.log(account);

    const secretJs = await SecretNetworkClient.create({
      grpcWebUrl: "https://pulsar-2.api.trivium.network:9091",
      chainId: "pulsar-2",
      wallet: window.keplr.getOfflineSignerOnlyAmino("pulsar-2"),
      walletAddress: account?.address,
      encryptionUtils: window.keplr.getEnigmaUtils("pulsar-2"),
    });

    console.log(secretJs);

    let codeHash: any = await queryJs.query.compute.contractCodeHash(
      contractAddresses.MINT_CONTRACT
    );
    let nftCodehash: any = await queryJs.query.compute.contractCodeHash(
      contractAddresses.NFT_CONTRACT
    );
    let tokenCodeHash: any = await queryJs.query.compute.contractCodeHash(
      contractAddresses.TOKEN_CONTRACT
    );

    let send_msg = {
      send: {
        recipient: contractAddresses.MINT_CONTRACT,
        recipient_code_hash: codeHash,
        amount: "600000",
        msg: btoa(
          JSON.stringify({
            tokenId: String(mintValue),
            name: "name",
            description: "desc",
            attributes: [
              {
                value: "value1",
                trait_type: "12",
                display_type: undefined,
                max_value: undefined,
              },
            ],
            image: "image",
            protected_attributes: undefined,
            code_hash: nftCodehash,
          })
        ),
        padding: undefined,
        memo: undefined,
      },
    };
    const mintMsg = new MsgExecuteContract({
      sender: account.address,
      contractAddress: contractAddresses.TOKEN_CONTRACT,
      codeHash: tokenCodeHash,
      msg: send_msg,
      sentFunds: [],
    });
    try {
      const tx = await secretJs.tx.broadcast([mintMsg], {
        gasLimit: 5_000_000,
      });
      console.log(tx);
    } catch (err) {
      console.log("error: ", err);
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

  //   const fetchNftInfo = async () => {
  //     // const queryJs :any = await SecretNetworkClient.create({
  //     //   grpcWebUrl: 'https://pulsar-2.api.trivium.network:9091',
  //     //   chainId: "pulsar-2",
  //     // });

  //     // let codeHash :any= await queryJs.query.compute.contractCodeHash(contractAddresses.MINT_CONTRACT);

  //     // let result = await queryJs.query.compute.queryContract({
  //     //   contractAddress:contractAddresses.MINT_CONTRACT,
  //     //   codeHash:codeHash,
  //     //   query:{
  //     //     get_state_info:{}
  //     //   }
  //     //     });
  //     //   con@sole.log(result)
  //   if(!window.keplr ||!account)return
  //     const permitName = "secretswap.io";
  // const allowedTokens = [contractAddresses.NFT_CONTRACT];
  // const permissions = ["balance" /* , "history", "allowance" */];

  // const { signature } = await window.keplr.signAmino(
  //   "pulsar-2",
  //   account.address,
  //   {
  //     chain_id: "pulsar-2",
  //     account_number: "0", // Must be 0
  //     sequence: "0", // Must be 0
  //     fee: {
  //       amount: [{ denom: "uscrt", amount: "0" }], // Must be 0 uscrt
  //       gas: "1", // Must be 1
  //     },
  //     msgs: [
  //       {
  //         type: "query_permit", // Must be "query_permit"
  //         value: {
  //           permit_name: permitName,
  //           allowed_tokens: allowedTokens,
  //           permissions: permissions,
  //         },
  //       },
  //     ],
  //     memo: "", // Must be empty
  //   },
  //   {
  //     preferNoSetFee: true, // Fee must be 0, so hide it from the user
  //     preferNoSetMemo: true, // Memo must be empty, so hide it from the user
  //   }
  // );

  // const secretJs:any = await SecretNetworkClient.create({
  //   grpcWebUrl: 'https://pulsar-2.api.trivium.network:9091',
  //   chainId: 'pulsar-2',
  //   wallet: window.keplr.getOfflineSignerOnlyAmino('pulsar-2'),
  //   walletAddress: account?.address,
  //   encryptionUtils: window.keplr.getEnigmaUtils('pulsar-2'),
  // });

  // const { balance } = await secretJs.queryContractSmart(
  //   contractAddresses.NFT_CONTRACT,
  //   {
  //     with_permit: {
  //       query: { all_nft_info: {token_id:"10"} },
  //       permit: {
  //         params: {
  //           permit_name: permitName,
  //           allowed_tokens: allowedTokens,
  //           chain_id: "pulsar",
  //           permissions: permissions,
  //         },
  //         signature: signature,
  //       },
  //     },
  //   }
  // // );

  // console.log(balance.amount);
  //   }

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
