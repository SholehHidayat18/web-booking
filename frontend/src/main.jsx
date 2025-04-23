import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { BrowserRouter } from "react-router-dom";
import { LoadingProvider } from "./components/context/LoadingContext.jsx";
import { DataProvider } from "./components/context/DataContext.jsx";
import { BookingProvider } from "./components/context/BookingContext.jsx";
import { UserProvider } from "./components/context/UserContext.jsx";
import { ToastProvider } from "./components/context/ToastContext.jsx";

createRoot(document.getElementById("root")).render(
  <LoadingProvider>
    <BookingProvider>
      <UserProvider>
        <DataProvider>
          <BrowserRouter>
            <ToastProvider>
              <App />
            </ToastProvider>
          </BrowserRouter>
        </DataProvider>
      </UserProvider>
    </BookingProvider>
  </LoadingProvider>
);
