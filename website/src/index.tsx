import * as React from "react";
import { render } from "react-dom";
import { Header } from "./Header";
import { Demo } from "./Demo";

import "./styles.css";

const rootElement = document.getElementById("root");

render(
  <>
    <Header />
    <Demo />
  </>,
  rootElement
);
