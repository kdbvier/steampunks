import React, { useEffect, useState } from "react";
import "./App.css";
import "@shoelace-style/shoelace/dist/themes/light.css";
import { setBasePath } from "@shoelace-style/shoelace/dist/utilities/base-path";
import { BrowserRouter, Route, Switch } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import Header from "./components/Header";
import Loader from "./components/Spinner";
import Main from "./pages/Main";
import Collctions from "./pages/Collections";
import Admin from "./pages/Admin";
import { useAppDispatch, useAppSelector } from "./app/hooks";
import { deleteAccount } from "./features/accounts/accountsSlice";

import "react-toastify/dist/ReactToastify.css";
import "bootstrap/dist/css/bootstrap.min.css";

setBasePath(
  "https://cdn.jsdelivr.net/npm/@shoelace-style/shoelace@2.0.0-beta.64/dist/"
);

const imgs = [
  "/assets/Banner_shadow.png",
  "/assets/collection-size.png",
  "/assets/collection-size-2100.png",
  "/assets/connect.png",
  "/assets/Mint_Button.png",
  "/assets/mint-page.png",
  "/assets/mint-price-normal.png",
  "/assets/mint-price-wl.png",
  "/assets/Minus_shadow.png",
  "/assets/mycollection.png",
  "/assets/Plus_shadow.png",
  "/assets/sample-button.png",
  "/assets/steampunk-image.png",
  "/assets/steampunksbackground.png",
  "/assets/website.png",
  "./assets/background.png",
  "./assets/paper.png",
];

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const dispatch = useAppDispatch();
  const account = useAppSelector((state) => state.accounts.keplrAccount);
  const cacheImages = async (srcArray: any) => {
    const promises = await srcArray.map((src: string) => {
      return new Promise(function (resolve, reject) {
        const img = new Image();
        img.src = src;
        // @ts-ignore
        img.onload = resolve();
        // @ts-ignore
        img.onerror = reject();
      });
    });
    await Promise.all(promises);
    setIsLoading(false);
  };
  useEffect(() => {
    cacheImages(imgs);
    // remove existing account
    if (account) {
      dispatch(deleteAccount(account.address));
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="main">
      {isLoading ? (
        <Loader />
      ) : (
        <BrowserRouter>
          <Header />
          <Switch>
            <Route exact path="/">
              <Main />
            </Route>
            <Route exact path="/collections">
              <Collctions />
            </Route>
            <Route exact path="/admin">
              <Admin />
            </Route>
          </Switch>
        </BrowserRouter>
      )}

      <ToastContainer
        position="top-right"
        autoClose={5000}
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        hideProgressBar
        newestOnTop
        closeOnClick
        theme="colored"
      />
    </div>
  );
}

export default App;
