export const dynamic = 'force-dynamic';

export default function NotFound() {
    return (
        <div className="flex items-center justify-center min-h-screen bg-[#050505] text-white font-mono">
            <div className="text-center">
                <h1 className="text-6xl font-bold mb-4">404</h1>
                <p className="text-gray-400 mb-6">Page not found</p>
                <a href="/" className="text-cyan-400 hover:text-cyan-300 transition-colors">
                    Return to orbit →
                </a>
            </div>
        </div>
    );
}
