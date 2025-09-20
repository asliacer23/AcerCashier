import { ShoppingCart, Package, Menu, X, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import path from "path";

interface NavbarProps {
  cartItemsCount?: number;
}

export const Navbar = ({ cartItemsCount = 0 }: NavbarProps) => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { 
      path: "/", 
      icon: ShoppingCart, 
      label: "Dashboard",
      badge: cartItemsCount > 0 ? cartItemsCount : undefined
    },
    { 
      path: "/pos", 
      icon: ShoppingCart, 
      label: "Cashier",
      badge: cartItemsCount > 0 ? cartItemsCount : undefined
    },
    { path: "/products", icon: Package, label: "Products" },
    {path: "/receipts", icon: FileText, label: "Receipts" }

  ];

  return (
    <nav className="px-6 py-4 flex items-center justify-between border-b">
      {/* Logo / Brand */}

      {/* Desktop Nav */}
      <div className="hidden md:flex items-center space-x-6">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-colors ${
                isActive 
                  ? "bg-gray-200 text-black" 
                  : "text-gray-600 hover:text-black hover:bg-gray-100"
              }`}
            >
              <Icon className="h-4 w-4" />
              <span className="text-sm font-medium">{item.label}</span>
              {item.badge && (
                <span className="bg-black text-white text-xs px-2 py-1 rounded-full">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </div>

      {/* Mobile Hamburger */}
      <div className="md:hidden">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </Button>
      </div>

      {/* Mobile Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-16 left-0 w-full bg-white border-t shadow-md md:hidden z-50">
          <div className="flex flex-col space-y-2 p-4">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-colors ${
                    isActive 
                      ? "bg-gray-200 text-black" 
                      : "text-gray-600 hover:text-black hover:bg-gray-100"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="text-sm font-medium">{item.label}</span>
                  {item.badge && (
                    <span className="bg-black text-white text-xs px-2 py-1 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </nav>
  );
};
