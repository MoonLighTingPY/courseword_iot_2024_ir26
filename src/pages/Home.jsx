import { Link } from "react-router-dom";

const Home = () => {
  return (
    <div className="home-container">
      <div className="button-container">
        <div>
          <h3>Bellman Ford</h3>
          <Link to="/bellman-ford">
            <button>Open</button>
          </Link>
        </div>
        <div>
          <h3>Min Heap</h3>
          <Link to="/min-heap">
            <button>Open</button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Home;
