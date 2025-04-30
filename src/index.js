import React, { useState } from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import { AppProviders } from "./Global_State/AppProviders";
import { ResetContext } from "./Global_State/ResetContext";

const Root = () => {
  const [key, setKey] = useState(0);

  const handleReset = () => setKey((k) => k + 1);

  return (
    <ResetContext.Provider value={handleReset}>
      <AppProviders key={key}>
        <App />
      </AppProviders>
    </ResetContext.Provider>
  );
};

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <AppProviders>
      <Root />
    </AppProviders>
  </React.StrictMode>
);
