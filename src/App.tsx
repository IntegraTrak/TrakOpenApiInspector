import { HashRouter, Route, Routes } from "react-router-dom";

import "./App.css";
import OpenApiContextProvider from "./components/OpenApiContext";
import Export from "./pages/Export";
import Home from "./pages/Home";
import Import from "./pages/Import";

function App() {
  return (
    <OpenApiContextProvider>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/Export" element={<Export />} />
        <Route path="/Import" element={<Import />} />
      </Routes>
    </OpenApiContextProvider>
  );
}

export default function WrappedApp() {
  return (
    <HashRouter>
      <App />
    </HashRouter>
  );
}
