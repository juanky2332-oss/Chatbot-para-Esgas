import Chatbot from "@/components/Chatbot";
import LeanRobot from "@/components/LeanRobot";

export default function Home() {
    return (
        <main className="flex min-h-screen flex-col items-center justify-center bg-slate-50 relative overflow-hidden">
            {/* Decorative Background Elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-100 rounded-full blur-3xl opacity-50 animate-pulse"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-cyan-100 rounded-full blur-3xl opacity-50 animate-pulse delay-1000"></div>
            </div>

            <div className="z-10 text-center space-y-8">
                <h1 className="text-4xl font-bold text-slate-800 tracking-tighter mb-4">
                    ESGAS <span className="text-[#00D1FF]">AI Assistant</span>
                </h1>
                <p className="text-slate-500 max-w-md mx-auto mb-10">
                    Tu experto en rodamientos, transmisiones de potencia y suministros industriales.
                </p>

                <LeanRobot />
            </div>

            <Chatbot />
        </main>
    );
}
