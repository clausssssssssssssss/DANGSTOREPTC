import { useState } from "react";
import { Link, useLocation } from "react-router-dom";

// Ítems del menú
const menuItems = [
  { id: "/", label: "Pago Real", icon: "💳" },
  { id: "/fake", label: "Pago Simulado", icon: "🧪" },
];

const NavBar = () => {
  const location = useLocation();
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setMobileMenuOpen((prev) => !prev);
  };

  const activePath = location.pathname;

  return (
    <nav className="bg-gray-800 shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <div className="text-white text-xl font-bold">Payment Example</div>
          </div>

          {/* Desktop menu */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              {menuItems.map((item) => (
                <Link
                  key={item.id}
                  to={item.id}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                    activePath === item.id
                      ? "bg-blue-700 text-white"
                      : "text-blue-100 hover:bg-blue-500 hover:text-white"
                  }`}
                >
                  <span className="mr-2">{item.icon}</span>
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Mobile menu toggle */}
          <div className="md:hidden">
            <button
              onClick={toggleMobileMenu}
              className="text-blue-100 hover:text-white focus:outline-none text-2xl"
            >
              ☰
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu (dropdown) */}
      {isMobileMenuOpen && (
        <div className="md:hidden px-4 pb-4">
          {menuItems.map((item) => (
            <Link
              key={item.id}
              to={item.id}
              onClick={() => setMobileMenuOpen(false)}
              className={`block px-3 py-2 rounded-md text-base font-medium ${
                activePath === item.id
                  ? "bg-blue-700 text-white"
                  : "text-blue-100 hover:bg-blue-500 hover:text-white"
              }`}
            >
              <span className="mr-2">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
};

export default NavBar;
