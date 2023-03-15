import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="App">
      <h1>Trak Open API Inspector</h1>
      <Link to="/Export">Data Export</Link>
      <Link to="/Import">Data Import</Link>
    </div>
  );
}
