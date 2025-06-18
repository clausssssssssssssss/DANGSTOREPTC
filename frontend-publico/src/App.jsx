import React from "react";
import { BrowserRouter as Router, Routes, Route, } from "react-router-dom";
import Nav from "./components/Navigation";

// Páginas
import iniciarSesion from './pages/iniciarSesion';
import registro from './pages/registro';
import inicio from './pages/inicio';
import perfil from './pages/perfil';
import recuperarContrasena from './pages/recuperarContrasena';
import recuperarContraseña2 from './pages/recuperarcontraseña2';
import recuperarContraseña3 from './pages/recuperarcontraseña3';
import contacto from './pages/contacto';
import catologo from './pages/catologo';
import encargoPersonalizado from './pages/encargoPersonalizado';
import carritoDeCompras from './pages/carritoDeCompras';
import metododePago from './pages/metodoDePago';


function App() { 

  return (
    <>
      <Router>
      <Routes>
        <Route path="/" element={<inicio />} />
        <Route path="/iniciarSesion" element={<iniciarSesion />} />
        <Route path="/registro" element={<registro />} />
        <Route path="/perfil" element={<perfil />} />
        
      </Routes>
      </Router>
    </>
  );
};


export default App;
