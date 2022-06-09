import React, { useEffect, useState } from "react";
import { SecretNetworkClient } from "secretjs";
import { contractAddresses } from "../../hook/useContract";
import { useAppSelector } from "../../app/hooks";
// import { Modal } from "react-bootstrap";
import "./collections.css";
// import { BsDownload } from "react-icons/bs";

const Collctions: React.FC = () => {
  const account = useAppSelector((state) => state.accounts.keplrAccount);
  const [nftData, setNftData] = useState<any>([]);
  // const [nameList, setNameList] = useState<string[]>([]);
  // const [attributeList, setAttributeList] = useState<any[]>([]);
  // const [show, setShow] = useState(false);
  // const [selectNFT, setSelectNFT] = useState(0);
  // const [showDownloadIcon, setShowDownloadIcon] = useState({ display: "none" });
  const fetchData = async () => {
    if (!account) return;
    const queryJs: any = await SecretNetworkClient.create({
      grpcWebUrl: "https://pulsar-2.api.trivium.network:9091",
      chainId: "pulsar-2",
    });

    let codeHash: any = await queryJs.query.compute.contractCodeHash(
      contractAddresses.MINT_CONTRACT
    );

    let state = await queryJs.query.compute.queryContract({
      contractAddress: contractAddresses.MINT_CONTRACT,
      codeHash: codeHash,
      query: {
        get_state_info: {},
      },
    });

    console.log(state);

    let user_info: any = await queryJs.query.compute.queryContract({
      contractAddress: contractAddresses.MINT_CONTRACT,
      codeHash: codeHash,
      query: {
        get_user_info: {
          address: account.address,
        },
      },
    });
    console.log(user_info);

    let my_nfts: any = [];

    await user_info?.forEach(async (element: any) => {
      let nft_info: any = await queryJs.query.compute.queryContract({
        contractAddress: contractAddresses.NFT_CONTRACT,
        codeHash: state.nft_contract_hash,
        query: {
          nft_info: {
            token_id: element,
          },
        },
      });

      my_nfts.push(nft_info);
      setNftData(nft_info);
    });

    // setMintValue(result.count);
  };
  useEffect(() => {
    fetchData();
    // eslint-disable-next-line
  }, []);

  return (
    <div className="collections-container">
      <div className="collections-item-full-container">
        <div className="collections-show-item-container">
          {nftData?.map((nft: any, index: number) => {
            return (
              <div
                className="collections-each-container"
                // onClick={() => {
                //   console.log(attributeList[index]);
                //   setSelectNFT(index);
                //   handleShow();
                // }}
                key={index}
              >
                <img
                  className="collections-image"
                  alt="img"
                  src={nft.extension.image}
                />
                <p className="collections-font">{nft.extension.name}</p>
              </div>
            );
          })}
        </div>
      </div>
      {/* <Modal show={show} onHide={handleClose}>
        <Modal.Header>
          <Modal.Title>{nameList[selectNFT]}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div
            style={{ position: "relative" }}
            onMouseEnter={(e) => {
              setShowDownloadIcon({ display: "flex" });
            }}
            onMouseLeave={(e) => {
              setShowDownloadIcon({ display: "none" });
            }}
            onClick={() => downloadImage()}
          >
            <img className="modal-image" alt="img" src={imageList[selectNFT]} />
            <div style={showDownloadIcon} className="download-icon">
              <BsDownload />{" "}
              <p
                style={{
                  fontSize: "20px",
                  marginLeft: "20px",
                  marginBottom: "0px",
                }}
              >
                Download Image
              </p>
            </div>
          </div>
          <div className="collections-show-item-container">
            {attributeList.length !== 0 &&
              attributeList[selectNFT].map((attribute: any, index: any) => {
                return (
                  <div className="modal-attribute">
                    <p className="modal-attribute-font">
                      <span className="attribute-title">Trait Type : </span>
                      <span className="attribute-value">
                        {attribute.trait_type}
                      </span>
                    </p>
                    <p className="modal-attribute-font">
                      <span className="attribute-title">Value : </span>
                      <span className="attribute-value">{attribute.value}</span>
                    </p>
                  </div>
                );
              })}
          </div>
        </Modal.Body>
      </Modal> */}
    </div>
  );
};

export default Collctions;
