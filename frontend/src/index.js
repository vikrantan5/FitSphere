import React from "react";
import ReactDOM from "react-dom/client";
import "@/index.css";
import App from "@/App";
import { AuthProvider } from "./contexts/AuthContext";   // 👈 ADD THIS

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <React.StrictMode>
    <AuthProvider>      {/* 👈 WRAP APP */}
      <App />
    </AuthProvider>
  </React.StrictMode>
);
