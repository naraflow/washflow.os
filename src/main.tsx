import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { testSpriteClient } from "./lib/testsprite";

// Global error handlers untuk TestSprite
window.addEventListener("error", (event) => {
  console.error("Global error:", event.error);
  
  // Log untuk TestSprite inspection
  testSpriteClient.logError({
    type: "global_error",
    message: event.message,
    filename: event.filename,
    lineno: event.lineno,
    colno: event.colno,
    error: event.error?.stack,
    timestamp: new Date().toISOString(),
  });
});

window.addEventListener("unhandledrejection", (event) => {
  console.error("Unhandled promise rejection:", event.reason);
  
  testSpriteClient.logError({
    type: "unhandled_promise_rejection",
    reason: event.reason instanceof Error ? event.reason.message : String(event.reason),
    stack: event.reason instanceof Error ? event.reason.stack : undefined,
    timestamp: new Date().toISOString(),
  });
});

// Unregister any existing service workers in development
if (import.meta.env.DEV && "serviceWorker" in navigator) {
  navigator.serviceWorker.getRegistrations().then((registrations) => {
    registrations.forEach((registration) => {
      registration.unregister();
    });
  });
}

createRoot(document.getElementById("root")!).render(<App />);
