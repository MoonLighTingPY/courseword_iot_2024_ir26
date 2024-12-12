import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Home from "./pages/Home";
import BellmanFord from "./pages/BellmanFord";
import MinHeap from "./pages/MinHeap";
import "./App.css";

function App() {
  return (
    <Router>
      <div className="navbar">
        <Link to="/" className="nav-link">Home</Link>
        <Link to="/bellman-ford" className="nav-link">Bellman-Ford</Link>
        <Link to="/min-heap" className="nav-link">Min Heap</Link>
      </div>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/bellman-ford" element={<BellmanFord />} />
        <Route path="/min-heap" element={<MinHeap />} />
      </Routes>
    </Router>
  );
}

export default App;