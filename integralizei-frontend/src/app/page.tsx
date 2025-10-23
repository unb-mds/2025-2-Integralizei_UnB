import Navbar from "../components/Navbar";
import HeroSection from "../components/HeroSection";

export default function Home() {
  return (
    <>
      <Navbar />
      <main style={{ padding: "40px", textAlign: "center" }}>
        <HeroSection />
      </main>
    </>
  );
}
