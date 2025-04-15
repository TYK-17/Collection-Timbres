import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import CollectionPage from "./pages/CollectionPage";
import TimbresPage from "./pages/TimbresPage";

export default function App() {
  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/collection/*" element={<CollectionPage />} />
          <Route path="/album/:albumId" element={<TimbresPage />} />
        </Routes>
      </Router>
    </>
  );
}
