import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { Home, Proposal } from "./pages";
import { ConnectButton, Logo, Row } from "web3uikit";
import { spacings } from "./theme";

const App = (): JSX.Element => {
  return (
    <Row justifyItems={"center"}>
      <Row.Col span={20}>
        <>
          <div style={{ marginBottom: spacings["2"] }}>
            <Row justifyItems={"space-between"} alignItems={"center"}>
              <Row.Col span={2}>
                <div>
                  <Logo color="blue" theme="icon" size={"small"} />
                </div>
              </Row.Col>
              <Row.Col span={2}>
                <ConnectButton />
              </Row.Col>
            </Row>
          </div>
          <Routes>
            <Route path={"/"} element={<Home />} />
            <Route path={"/proposal"} element={<Proposal />} />
            <Route path={"*"} element={<Navigate to={"/"} replace />} />
          </Routes>
        </>
      </Row.Col>
    </Row>
  );
};

export default App;
