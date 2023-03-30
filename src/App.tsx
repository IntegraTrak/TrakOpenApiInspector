import { HashRouter, Route, Routes } from "react-router-dom";

import "./App.css";
import Export from "./pages/Export";
import Home from "./pages/Home";
import Import from "./pages/Import";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/Export" element={<Export />} />
      <Route path="/Import" element={<Import />} />
    </Routes>
  );
}

export default function WrappedApp() {
  return (
    <HashRouter>
      <App />
    </HashRouter>
  );
}
