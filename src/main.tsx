import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Unregister any existing service workers in development
if (import.meta.env.DEV && "serviceWorker" in navigator) {
  navigator.serviceWorker.getRegistrations().then((registrations) => {
    registrations.forEach((registration) => {
      registration.unregister();
    });
  });
}

createRoot(document.getElementById("root")!).render(<App />);
