// src/components/NavBar.jsx
import React from 'react';
import { NavLink } from 'react-router-dom';
import { Search, ShoppingCart, User } from 'lucide-react';
import CarritoDeCompras from '../pages/CarritoDeCompras';

export default function NavBar() {
  return (
    <nav className="fixed top-0 w-full bg-white shadow p-4 flex items-center justify-between">
      <NavLink to="/" className="font-bold text-xl">DANGSTORE</NavLink>
      <div className="space-x-4">
        <NavLink to="/encargo"    className="hover:underline">Encargo</NavLink>
        <NavLink to="/catalogo"   className="hover:underline">Catálogo</NavLink>
        <NavLink to="/contacto"   className="hover:underline">Contacto</NavLink>
        <NavLink to="/acerca"     className="hover:underline">Acerca</NavLink>
        <Link to="/historial-pedidos" className="...">
  Mis Pedidos
</Link>
      </div>
      <div className="space-x-3">
        <NavLink to="/catalogo"><Search size={20}/></NavLink>
        <NavLink to="/CarritoDeCompras"><ShoppingCart size={20}/></NavLink>
        <NavLink to="/perfil"><User size={20}/></NavLink>
      </div>
    </nav>
  );
}
