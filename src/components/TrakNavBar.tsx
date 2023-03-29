import { Navbar } from "flowbite-react";
import { Link } from "react-router-dom";

export default function TrakNavBar() {
  return (
    <div>
      <Navbar fluid rounded>
        <Navbar.Brand>
          <span className="self-center whitespace-nowrap text-xl font-semibold dark:text-white">
            Trak OpenApi Inspector
          </span>
        </Navbar.Brand>
        <Navbar.Toggle />
        <Navbar.Collapse>
          <Link to="/">Home</Link>
          <Link to="/Export">Data Export</Link>
          <Link to="/Import">Data Import</Link>
        </Navbar.Collapse>
      </Navbar>
    </div>
  );
}
