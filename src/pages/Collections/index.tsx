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
      grpcWebUrl: "https://secret-4.api.trivium.network:9091",
      chainId: "secret-4",
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


    let user_info: any = await queryJs.query.compute.queryContract({
      contractAddress: contractAddresses.MINT_CONTRACT,
      codeHash: codeHash,
      query: {
        get_user_info: {
          address: account.address,
        },
      },
    });

    let my_nfts: any = [];

    // await user_info?.forEach(async (element: any, index:any,array:any) => {
    //   let nft_info: any = await queryJs.query.compute.queryContract({
    //     contractAddress: contractAddresses.NFT_CONTRACT,
    //     codeHash: state.nft_contract_hash,
    //     query: {
    //       nft_info: {
    //         token_id: element,
    //       },
    //     },
    //   });
    //   // return nft_info;
    //   my_nfts.push(nft_info);
    //   setNftData([...nftData, nft_info]);
    //   // if(index===0) setNftData(my_nfts);
    //   // cc
    // });
    for (let i = 0; i < user_info.length; i++) {
      let nft_info: any = await queryJs.query.compute.queryContract({
        contractAddress: contractAddresses.NFT_CONTRACT,
        codeHash: state.nft_contract_hash,
        query: {
          nft_info: {
            token_id: user_info[i],
          },
        },
      });
      // return nft_info;
      my_nfts.push({...nft_info, id: user_info[i]});
    }
    setNftData(my_nfts);
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
                //   setSelectNFT(index);
                //   handleShow();
                // }}
                key={index}
              >
                <img
                  className="collections-image"
                  alt="img"
                  src={`https://${nft.nft_info.extension.image}`}
                />
                <p className="collections-font">
                  {nft.id}
                </p>
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
