"use client";
import { useRouter } from "next/navigation";

export default function HeroSection() {
  const router = useRouter();

  const handleRedirect = () => {
    router.push("/upload");
  };

  return (
    <section className="flex flex-col items-center justify-start text-center pt-8 pb-16 px-6 bg-white min-h-screen">
      <h1 className="inline-block text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-700 to-blue-700 mb-8 leading-tight pb-1">
        Integralizei UnB
      </h1>

      <p className="max-w-2xl text-gray-800 mb-10 leading-relaxed text-lg">
        Com apenas o seu histórico, nossa plataforma analisará e preverá qual a sua
        chance aproximada de garantir a vaga com o professor que você tanto quer.
        Assim, em vez de ansiedade, você terá o poder dos dados para planejar seu
        semestre com mais confiança e tranquilidade.
      </p>

      <button
        onClick={handleRedirect}
        className="bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors duration-200 shadow-md"
      >
        Envie seu histórico
      </button>
    </section>
  );
}
