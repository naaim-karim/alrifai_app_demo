import DesktopNavbar from "./DesktopNavbar";
import MobileNavbar from "./MobileNavbar";

const Navbar = () => {
  return (
    <>
      <header className="shadow">
        <DesktopNavbar />
        <MobileNavbar />
      </header>
    </>
  );
};

export default Navbar;
