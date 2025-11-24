import { useAuth } from "../contexts/AuthContext";

const mockHoldings = [
    { label: "Focus Area", value: "Indian Growth" },
    { label: "Risk Profile", value: "Moderate" },
    { label: "Goal", value: "₹5 Cr in 10 years" },
];

const Profile = () => {
    const { user } = useAuth();

    return (
        <main className="min-h-screen bg-[#0f1115] text-white pt-24 pb-16 px-6 lg:px-12 font-['Montserrat']">
            <div className="max-w-5xl mx-auto space-y-8">
                <header className="rounded-3xl border border-white/5 bg-gradient-to-br from-slate-900/90 to-slate-800/70 p-8 shadow-2xl shadow-black/30">
                    <div className="space-y-2">
                        <p className="text-xs uppercase tracking-[0.2em] text-gray-500">Signed in as</p>
                        <h1 className="text-2xl font-semibold text-white">{user?.email ?? "you@thesis.io"}</h1>
                        <p className="text-sm text-gray-300 max-w-xl leading-relaxed">
                            Personalized investor workspace. More controls and KYC-powered insights are on the way.
                        </p>
                    </div>
                </header>
                <section className="rounded-3xl border border-white/5 bg-slate-900/70 p-6 shadow-inner shadow-black/40">
                    <h2 className="text-xl font-semibold mb-4">Snapshot</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {mockHoldings.map((item) => (
                            <div key={item.label} className="rounded-2xl border border-white/10 bg-slate-800/70 p-4">
                                <p className="text-xs uppercase tracking-wide text-gray-400">{item.label}</p>
                                <p className="text-lg font-semibold mt-2">{item.value}</p>
                            </div>
                        ))}
                    </div>
                </section>

                <section className="rounded-3xl border border-dashed border-white/10 bg-slate-900/50 p-6 text-center">
                    <p className="text-sm text-gray-400">Coming Soon</p>
                    <h3 className="text-2xl font-semibold mt-2">Full profile, KYC, and AI nudges</h3>
                    <p className="text-gray-300 mt-3">
                        We’re building timelines, tax summaries, and advisor collaboration tools.
                    </p>
                </section>
            </div>
        </main>
    );
};

export default Profile;