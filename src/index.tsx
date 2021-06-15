import ReactDOM from "react-dom";
import { ConfirmationServiceProvider } from "./dialog/Service";

import App from "./App";

const rootElement = document.getElementById("root");
ReactDOM.render(
  <ConfirmationServiceProvider>
    <App />
  </ConfirmationServiceProvider>,
  rootElement
);
