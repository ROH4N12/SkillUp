import { createRoot } from "react-dom/client";
import { GoogleOAuthProvider } from "@react-oauth/google";
import App from "./app/App.jsx";
import "./styles/index.css";
import { ThemeProvider } from "./app/contexts/ThemeContext";
import { ToastProvider } from "./app/contexts/ToastContext";

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "YOUR_GOOGLE_CLIENT_ID_HERE";


createRoot(document.getElementById("root")).render(
  <ThemeProvider>
    <ToastProvider>
      <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
        <App />
        
      </GoogleOAuthProvider>
    </ToastProvider>
  </ThemeProvider>
);