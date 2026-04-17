import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Register service worker for push notification support
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch(() => {
      // SW registration failure is non-fatal
    });
  });
}

createRoot(document.getElementById("root")!).render(<App />);
