import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import CollectionPage from "./pages/CollectionPage";
import TimbresPage from "./pages/TimbresPage";
export default function App() {
  return (
    <>
      <div className="bg-green-200 p-4 rounded text-center text-lg font-semibold">
        ✅ Tailwind fonctionne !
      </div>

      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/collection" element={<CollectionPage />} />
          <Route path="/app" element={<TimbresPage />} />
        </Routes>
      </Router>
    </>
  );
}
