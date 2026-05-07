import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";

import Home from "./pages/home";
import Whatwedo from "./pages/whatwedo";
import Project from "./pages/project";
import Contact from "./pages/contact";
import Header from "./components/navbar";
import Footer from "./components/footer";
import PageTitle from "./components/PageTitle";

const App = () => {
  return (
    <Router>
      <AppContent />
    </Router>
  );
};

const AppContent = () => {
  const location = useLocation();
  
  return (
    <>
      <PageTitle pathname={location.pathname} />
      <Header />
      <main>
        <Routes location={location}>
          <Route path="/" element={<Navigate to="/home" replace />} />
          <Route path="/home" element={<Home />} />
          <Route path="/whatwedo" element={<Whatwedo />} />
          <Route path="/project" element={<Project />} />
          <Route path="/contact" element={<Contact />} />
        </Routes>
      </main>
      <Footer />
    </>
  );
};

export default App;
