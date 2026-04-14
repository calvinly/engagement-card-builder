import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./oslo/tokens.css";
import "./index.css";
import { ECBuilder } from "./ECBuilder";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ECBuilder />
  </StrictMode>,
);
