import React, { useEffect } from "react";
import "./App.css";
import "@shoelace-style/shoelace/dist/themes/light.css";
import { setBasePath } from "@shoelace-style/shoelace/dist/utilities/base-path";
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import Header from "./components/Header";
import Main from "./pages/Main";
import Collctions from "./pages/Collections";
import { useAppDispatch, useAppSelector } from "./app/hooks";
import { deleteAccount } from "./features/accounts/accountsSlice";

import "react-toastify/dist/ReactToastify.css";
import 'bootstrap/dist/css/bootstrap.min.css';

setBasePath(
  "https://cdn.jsdelivr.net/npm/@shoelace-style/shoelace@2.0.0-beta.64/dist/"
);
function App() {
  const dispatch = useAppDispatch();
  const account = useAppSelector((state) => state.accounts.keplrAccount);
  useEffect(() => {
    // remove existing account
    if (account) {
      dispatch(deleteAccount(account.address));
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="main">
      <BrowserRouter>
        <Header />
        <Switch>
          <Route exact path="/">
            <Main />
          </Route>
          <Route exact path="/collections">
            <Collctions />
          </Route>
        </Switch>
      </BrowserRouter>
    </div>
  );
}

export default App;
