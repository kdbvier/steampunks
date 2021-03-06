import React, { useState, useEffect } from "react";
import { useAppSelector } from "../../app/hooks";
import { contractAddresses } from "../../hook/useContract";
import { toast } from "react-toastify";
import "./main.css";
// import {queryNftInfo, queryStateInfo} from "../../util/secretHelpers";

import { SecretNetworkClient, MsgExecuteContract } from "secretjs";

const Main: React.FC = () => {
  // const { runQuery, runExecute } = useContract();
  const account = useAppSelector((state) => state.accounts.keplrAccount);
  const [sale, setSale] = useState(false);

  const mint = async () => {
    if (!window.keplr || !account) {
      toast.error("Connect your wallet");
      return;
    }
    await window.keplr.enable("secret-4");

    const queryJs: any = await SecretNetworkClient.create({
      grpcWebUrl: "https://secret-4.api.trivium.network:9091",
      chainId: "secret-4",
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

    if (Number(state.count) >= Number(state.total_supply)) {
      toast.error("You can not mint any more");
      return;
    }

    if (!state.private_mint && !state.public_mint) {
      toast.error("Mint is not started yet");
      return;
    }

    const secretJs = await SecretNetworkClient.create({
      grpcWebUrl: "https://secret-4.api.trivium.network:9091",
      chainId: "secret-4",
      wallet: window.keplr.getOfflineSignerOnlyAmino("secret-4"),
      walletAddress: account?.address,
      encryptionUtils: window.keplr.getEnigmaUtils("secret-4"),
    });

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
      const tx = await secretJs.tx.broadcast([mintMsg], { gasLimit: 2000_000 });
      console.log(tx);
      if (tx.code !== 0) {
        toast.error("fail");
        return;
      }
      toast.success("Success");
    } catch (err) {
      console.log("error: ", err);
      toast.error("Failed");
    }
  };
  const fetchState = async () => {
    const queryJs: any = await SecretNetworkClient.create({
      grpcWebUrl: "https://secret-4.api.trivium.network:9091",
      chainId: "secret-4",
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
    setSale(result.private_mint);
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
          <img
            src="/assets/Banner_shadow.png"
            alt="banner"
            className="banner-image"
          />
          <div>
            <img
              src="/assets/steampunk-image.png"
              alt="steampunk"
              className="steampunk-image"
            />
            <div className="display-flex main-second-container">
              <div>
                <img
                  src="/assets/collection-size-2100.png"
                  alt="collection"
                  className="price-container"
                />
                {/* <p className="remain-font-size">2100</p> */}
              </div>
              <div>
                {!sale ? (
                  <img
                    src="/assets/mint-price-normal.png"
                    alt="collection"
                    className="price-container"
                  />
                ) : (
                  <img
                    src="/assets/mint-price-wl.png"
                    alt="collection"
                    className="price-container"
                  />
                )}
              </div>
            </div>

            <img
              src="/assets/Mint_Button.png"
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
