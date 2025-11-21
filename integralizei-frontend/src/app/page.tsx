"use client";

// Importa a Navbar da pasta dela
import Navbar2 from "../components/Navbar2/Navbar2";

// Importa a HeroSection da raiz de components
import HeroSection from "../components/HeroSection";

export default function Home() {
  return (
    <main>
      <Navbar2 />
      <HeroSection />
    </main>
  );
}