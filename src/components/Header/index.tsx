import React from "react";
import { Link } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { setKeplrAccount } from "../../features/accounts/accountsSlice";
import { useKeplr } from "../../features/accounts/useKeplr";
import website from "../../assets/website.png";
import connectButton from "../../assets/connect.png";
import mycollection from "../../assets/mycollection.png";
import mainpage from "../../assets/mint-page.png";
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
        <a href="https://Secret-Steampunks.com">
          <img src={website} alt="website" className="header-img" />
        </a>
        <div className="header-button-container">
          {/* {
            account?.address === "juno1d6f4qyjay29qjtfnuchel0nzrff54qzds43mkz" && 
            <Link to = "/admin" className="header-admin">Admin</Link>
          } */}
          <Link to="/admin">
            <div className="header-admin">Admin</div>
          </Link>
          <Link to="/">
            <img src={mainpage} alt="website" className="header-img mg-left" />
          </Link>
          <Link to="/collections">
            <img
              src={mycollection}
              alt="mycollecton"
              className="header-img mg-left"
            />
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
