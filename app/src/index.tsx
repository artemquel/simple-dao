import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { MoralisProvider } from "react-moralis";
import config from "./config";
import { BrowserRouter } from "react-router-dom";
import DaoProvider from "./context";

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);
root.render(
  <MoralisProvider
    appId={config.moralisAppId}
    serverUrl={config.moralisServerUrl}
  >
    <DaoProvider address={config.daoAddress}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </DaoProvider>
  </MoralisProvider>
);
