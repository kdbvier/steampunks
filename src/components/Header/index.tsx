import React from "react";
import { Link } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { setKeplrAccount } from "../../features/accounts/accountsSlice";
import { useKeplr } from "../../features/accounts/useKeplr";
import website from "../../assets/website.png";
import connectButton from "../../assets/connect.png";
import mycollection from "../../assets/mycollection.png";
import "./Header.css";
const Header: React.FC = () => {
  const dispatch = useAppDispatch();
  const account = useAppSelector((state) => state.accounts.keplrAccount);
  const { connect } = useKeplr();
  const clickWalletButton = () => {
    if (!account) {
      connect();
    } else {
      dispatch(setKeplrAccount());
    }
  };

  return (
    <div className="header">
      <div className="container header-button-container mg-30">
        <Link to="/">
          <img src={website} alt="website" className="header-img" />
        </Link>
        <div className="header-button-container">
          <Link to="/collections">
            <img src={mycollection} alt="mycollecton" className="header-img" />
          </Link>
          <div onClick={clickWalletButton} className="mg-left">
            {account ? (
              <>
                <p className="header-name">{account.label}</p>
              </>
            ) : (
              <>
                <img src={connectButton} alt="connect" className="header-img" />
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;
