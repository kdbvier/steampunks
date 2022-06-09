import React from "react";
import { SecretNetworkClient, MsgExecuteContract } from "secretjs";
import { toast } from "react-toastify";
import { contractAddresses } from "../../hook/useContract";
import { useAppSelector } from "../../app/hooks";
import sampleButton from "../../assets/sample-button.png";
import "./admin.css";

const Admin: React.FC = () => {
  const account = useAppSelector((state) => state.accounts.keplrAccount);
  const changeMintOption = async (state: any) => {
    if (!window.keplr || !account) {
      toast.error("Connect your wallet");
      return;
    }
    const queryJs: any = await SecretNetworkClient.create({
      grpcWebUrl: "https://pulsar-2.api.trivium.network:9091",
      chainId: "pulsar-2",
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
      grpcWebUrl: "https://pulsar-2.api.trivium.network:9091",
      chainId: "pulsar-2",
      wallet: window.keplr.getOfflineSignerOnlyAmino("pulsar-2"),
      walletAddress: account?.address,
      encryptionUtils: window.keplr.getEnigmaUtils("pulsar-2"),
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
  return (
    <div className="admin-full-container">
      <div className="admin-container">
        <div className="button-container" onClick={() => changeMintOption(1)}>
          <img src={sampleButton} className="sample-button" alt="img" />
          <p className="button-letter">Presale</p>
        </div>
        <div className="button-container" onClick={() => changeMintOption(2)}>
          <img src={sampleButton} className="sample-button" alt="img" />
          <p className="button-letter">Public Sale</p>
        </div>
        <div className="button-container" onClick={() => changeMintOption(3)}>
          <img src={sampleButton} className="sample-button" alt="img" />
          <p className="button-letter">Stop Sale</p>
        </div>
      </div>
    </div>
  );
};

export default Admin;
