import React, { useState, useEffect } from "react";
import { SecretNetworkClient, MsgExecuteContract } from "secretjs";
import { toast } from "react-toastify";
import { contractAddresses } from "../../hook/useContract";
import { useAppSelector } from "../../app/hooks";
import "./admin.css";

const Admin: React.FC = () => {
  const account = useAppSelector((state) => state.accounts.keplrAccount);
  const [mintValue, setMintValue] = useState(0);
  // const [inputValue, setInputValue] = useState("");
  const changeMintOption = async (state: any) => {
    if (!window.keplr || !account) {
      toast.error("Connect your wallet");
      return;
    }
    const queryJs: any = await SecretNetworkClient.create({
      grpcWebUrl: "https://secret-4.api.trivium.network:9091",
      chainId: "secret-4",
    });

    let codeHash: any = await queryJs.query.compute.contractCodeHash(
      contractAddresses.MINT_CONTRACT
    );
    let msg = {
      set_sale_flag: {
        private_mint: state === 1 ? true : false,
        public_mint: state === 2 ? true : false,
      },
    };

    const secretJs = await SecretNetworkClient.create({
      grpcWebUrl: "https://secret-4.api.trivium.network:9091",
      chainId: "secret-4",
      wallet: window.keplr.getOfflineSignerOnlyAmino("secret-4"),
      walletAddress: account?.address,
      encryptionUtils: window.keplr.getEnigmaUtils("secret-4"),
    });

    const mintMsg = new MsgExecuteContract({
      sender: account.address,
      contractAddress: contractAddresses.MINT_CONTRACT,
      codeHash: codeHash,
      msg: msg,
      sentFunds: [],
    });
    try {
      const tx = await secretJs.tx.broadcast([mintMsg], {
        gasLimit: 1_000_000,
      });
      console.log(tx);
      toast.success("Success!");
    } catch (err) {
      console.log("error: ", err);
      toast.error("Error!");
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
    setMintValue(result.count);
  };
  // const handleChange = (e: any) => {
  //   setInputValue(e.target.value);
  // };
  // const handleClick = async () => {
  //   console.log("here: ", inputValue);
  //   if (!window.keplr || !account) {
  //     toast.error("Connect your wallet");
  //     return;
  //   }
  //   const queryJs: any = await SecretNetworkClient.create({
  //     grpcWebUrl: "https://secret-4.api.trivium.network:9091",
  //     chainId: "secret-4",
  //   });

  //   let codeHash: any = await queryJs.query.compute.contractCodeHash(
  //     contractAddresses.MINT_CONTRACT
  //   );
  //   const secretJs = await SecretNetworkClient.create({
  //     grpcWebUrl: "https://secret-4.api.trivium.network:9091",
  //     chainId: "secret-4",
  //     wallet: window.keplr.getOfflineSignerOnlyAmino("secret-4"),
  //     walletAddress: account?.address,
  //     encryptionUtils: window.keplr.getEnigmaUtils("secret-4"),
  //   });
  //   let msg = {
  //     add_white_user: {
  //       member: inputValue,
  //     },
  //   };
  //   let send_msg = {
  //     send: {
  //       recipient: contractAddresses.MINT_CONTRACT,
  //       recipient_code_hash: codeHash,
  //       amount: state.private_mint ? state.private_price : state.public_price,
  //       msg: btoa(JSON.stringify(msg)),
  //       padding: undefined,
  //       memo: undefined,
  //     },
  //   };
  // };
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
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-around",
      }}
    >
      <div className="admin-full-container">
        <div className="admin-container">
          <div className="button-container" onClick={() => changeMintOption(1)}>
            <img
              src="/assets/sample-button.png"
              className="sample-button"
              alt="img"
            />
            <p className="button-letter">Presale</p>
          </div>
          <div className="button-container" onClick={() => changeMintOption(2)}>
            <img
              src="/assets/sample-button.png"
              className="sample-button"
              alt="img"
            />
            <p className="button-letter">Public Sale</p>
          </div>
          <div className="button-container" onClick={() => changeMintOption(3)}>
            <img
              src="/assets/sample-button.png"
              className="sample-button"
              alt="img"
            />
            <p className="button-letter">Stop Sale</p>
          </div>
        </div>
      </div>
      <div className="display-flex main-button-container">
        <img
          src="/assets/Minus_shadow.png"
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
          src="/assets/Plus_shadow.png"
          alt="collection"
          className="main-button-img"
          // onClick={() => plusMint()}
        />
      </div>
      {/* <div className="display-flex main-button-container">
        <input
          className="address-input"
          onChange={handleChange}
          value={inputValue}
        />
        <button className="add-user" onClick={handleClick}>
          Add User
        </button>
      </div> */}
    </div>
  );
};

export default Admin;
