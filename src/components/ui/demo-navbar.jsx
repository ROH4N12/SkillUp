import { Navbar } from "./mini-navbar";

const DemoOne = () => {
  return (
    <div className="relative min-h-screen bg-[#0a0a0a] text-white font-sans overflow-hidden">
      <div className="absolute inset-0">
        <img
          className="w-full h-full object-cover grayscale"
          src="https://images.unsplash.com/photo-1506318137071-a8e063b4bec0?w=1920&q=80"
          alt="Background Stars"
        />
      </div>

      <Navbar />

      <main className="relative z-10 flex flex-col items-center justify-center h-screen text-center px-4 pt-24">
        <h1 className="text-8xl md:text-9xl font-bold text-white mb-4 tracking-tight drop-shadow-xl">
          MINI NAVBAR
        </h1>
        <div className="flex flex-col sm:flex-row items-center text-xl text-gray-300 mb-8 space-y-2 sm:space-y-0 sm:space-x-2">
          <span>Please support by saving this component</span>
          <button
            className="px-4 py-1 border border-[#333] bg-[rgba(31,31,31,0.62)] rounded-full text-white transition-colors duration-200 cursor-pointer text-base
                       inline-flex items-center justify-center"
          >
            <span>Thank You</span>
          </button>
        </div>
      </main>
    </div>
  );
};

export default DemoOne;
