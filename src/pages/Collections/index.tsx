import React, { useEffect, useState } from "react";
import { Modal } from "react-bootstrap";
import "./collections.css";
import { BsDownload } from "react-icons/bs";

const Collctions: React.FC = () => {
  const list = [
    "https://arweave.net/7C5LFI4eLv8r-3c95abDd4YiQJp9gG7uF1b8GqaZXgg",
    "https://arweave.net/RRVfd1MEwcFeI9gQLUr34bThgKnKSvRF_b23vuVCMtg",
    "https://arweave.net/vy43KUOlkL-8WBeT651Yf1kgClpffVWly4pBlD_KIKg",
    "https://arweave.net/gPOtOXrMZTbwPZrnLLG1cVhsQ_75xMYFiqFuHtodIFo",
    "https://arweave.net/wjqk3igaN7ygr6mLVkn1IrcExgivQUEPV8H2mJ4BRoE",
    "https://arweave.net/yk6_ILmoPfs5kCUZZRhshmsswd-WqENyw3X1OJwbl98",
    "https://arweave.net/oJnA8GvUsfkaZVh20XXNXLYp_suyk2IJIzDDkqfG9WE",
    "https://arweave.net/2AM1_TAKQRbNbxP400eENVbD23PA54rer4qBRpTdSiU",
    "https://arweave.net/8e7Se6Wdw7BAdLowi64nKdYofi9frOcVVp12HgjLKjw",
    "https://arweave.net/GJe7AoO5CmIV9k4QJghagcI45_KkJKztufRgwzh7cvA",
  ];
  const [imageList, setImageList] = useState<string[]>([]);
  const [nameList, setNameList] = useState<string[]>([]);
  const [attributeList, setAttributeList] = useState<any[]>([]);
  const [show, setShow] = useState(false);
  const [selectNFT, setSelectNFT] = useState(0);
  const [showDownloadIcon, setShowDownloadIcon] = useState({ display: "none" });

  useEffect(() => {
    for (let i = 0; i < list.length; i++) getData(i);
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    console.log(imageList);
    console.log(nameList);
    console.log(attributeList);
  }, [imageList, nameList, attributeList]);

  const getData = (num: number) => {
    console.log(num);
    return fetch(list[num])
      .then((response) => response.json())
      .then((responseJson) => {
        setImageList((imageList) => [...imageList, responseJson.image]);
        setNameList((nameList) => [...nameList, responseJson.name]);
        setAttributeList((attributeList) => [
          ...attributeList,
          responseJson.attributes,
        ]);
      })
      .catch((error) => {
        console.error(error);
      });
  };

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const downloadImage = () => {
    fetch(imageList[selectNFT], {
      method: "GET",
      headers: {},
    })
      .then((response) => {
        response.arrayBuffer().then(function (buffer) {
          const url = window.URL.createObjectURL(new Blob([buffer]));
          const link = document.createElement("a");
          link.href = url;
          link.setAttribute("download", `${nameList[selectNFT]}.png`); //or any other extension
          document.body.appendChild(link);
          link.click();
        });
      })
      .catch((err) => {
        console.log(err);
      });
  };

  return (
    <div className="collections-container">
      <div className="collections-item-full-container">
        <div className="collections-show-item-container">
          {imageList.map((imgValue, index) => {
            return (
              <div
                className="collections-each-container"
                onClick={() => {
                  console.log(attributeList[index]);
                  setSelectNFT(index);
                  handleShow();
                }}
              >
                <img className="collections-image" alt="img" src={imgValue} />
                <p className="collections-font">{nameList[index]}</p>
              </div>
            );
          })}
        </div>
      </div>
      <Modal show={show} onHide={handleClose}>
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
      </Modal>
    </div>
  );
};

export default Collctions;
