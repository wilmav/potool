import React, { useState } from 'react';

// Icons 
const Icons = {
    Grid: () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="7" height="7" x="3" y="3" rx="1" /><rect width="7" height="7" x="14" y="3" rx="1" /><rect width="7" height="7" x="14" y="14" rx="1" /><rect width="7" height="7" x="3" y="14" rx="1" /></svg>,
    Layout: () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2" /><line x1="3" x2="21" y1="9" y2="9" /><line x1="9" x2="9" y1="21" y2="9" /></svg>,
    Presentation: () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h20" /><path d="M21 3v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V3" /><path d="m7 21 5-5 5 5" /></svg>,
    Settings: () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.1a2 2 0 0 1-1-1.74v-.47a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" /><circle cx="12" cy="12" r="3" /></svg>,
    Plus: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="M12 5v14" /></svg>
};

const BrowserTab = ({ title, isActive, color, onClick, icon: Icon }) => {
    // "Playful" Browser Tab Style
    // Floating pill shape, bouncy hover, bright active state

    return (
        <button
            onClick={onClick}
            className={`
        relative group flex items-center gap-2 px-5 py-2.5 rounded-full font-medium transition-all duration-300 ease-out
        ${isActive
                    ? 'shadow-lg shadow-black/20 scale-105'
                    : 'hover:bg-white/10 hover:scale-105 active:scale-95 opacity-70 hover:opacity-100'
                }
      `}
            style={{
                backgroundColor: isActive ? color : 'transparent',
                color: isActive ? '#000' : 'white', // Dark text on active colored tab for contrast
            }}
        >
            <div className={`p-1 rounded-full ${isActive ? 'bg-black/10' : 'bg-white/10 group-hover:bg-white/20'}`}>
                {Icon && <Icon />}
            </div>
            <span>{title}</span>
        </button>
    );
};

const Widget = ({ title, size, color, children }) => {
    const sizeClasses = {
        small: 'col-span-1 row-span-1',
        medium: 'col-span-2 row-span-1',
        large: 'col-span-2 row-span-2',
        tall: 'col-span-1 row-span-2',
        wide: 'col-span-3 row-span-1',
    };

    return (
        <div className={`bg-[#2a2a2a] rounded-3xl p-5 border border-white/5 shadow-xl hover:shadow-2xl hover:scale-[1.01] transition-all duration-300 flex flex-col gap-3 ${sizeClasses[size || 'small']}`}>
            <div className="flex items-center justify-between text-xs uppercase tracking-wider font-bold opacity-70" style={{ color: color }}>
                <span>{title}</span>
                <button className="hover:bg-white/10 p-1.5 rounded-full transition-colors"><Icons.Settings /></button>
            </div>
            <div className="flex-1 overflow-auto custom-scrollbar">
                {children}
            </div>
        </div>
    );
};

const DashboardPlaceholder = () => {
    const [activeTab, setActiveTab] = useState('workspace');

    const tabs = [
        { id: 'workspace', title: 'Oma työtila', color: '#60a5fa', icon: Icons.Grid }, // Blue
        { id: 'team', title: 'Tiimiesitys', color: '#34d399', icon: Icons.Presentation }, // Green
        { id: 'monitoring', title: 'AI & Seuranta', color: '#fbbf24', icon: Icons.Layout }, // Amber
    ];

    return (
        <div className="min-h-screen bg-[#0f0f11] text-white flex flex-col font-sans selection:bg-purple-500/30">

            {/* Playful Floating Navigation Bar */}
            <div className="flex justify-center pt-8 pb-4">
                <div className="flex gap-2 p-1.5 bg-[#1f1f22]/80 border border-white/10 rounded-full shadow-2xl backdrop-blur-xl">
                    {tabs.map(tab => (
                        <BrowserTab
                            key={tab.id}
                            title={tab.title}
                            color={tab.color}
                            isActive={activeTab === tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            icon={tab.icon}
                        />
                    ))}
                    <div className="w-px h-6 bg-white/10 mx-2 self-center"></div>
                    <button className="h-10 w-10 flex items-center justify-center rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-all hover:rotate-90">
                        <Icons.Plus />
                    </button>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 p-8 overflow-y-auto">

                {/* Header Area with specific accent */}
                <div className="flex justify-between items-center mb-10 max-w-7xl mx-auto">
                    <div className="flex items-center gap-4">
                        <div className="box-content p-1 border-2 rounded-full" style={{ borderColor: tabs.find(t => t.id === activeTab)?.color }}>
                            <div className="h-3 w-3 rounded-full" style={{ backgroundColor: tabs.find(t => t.id === activeTab)?.color }}></div>
                        </div>
                        <div>
                            <h1 className="text-4xl font-bold tracking-tight text-white">
                                {tabs.find(t => t.id === activeTab)?.title}
                            </h1>
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <button className="px-5 py-2.5 bg-[#1f1f22] hover:bg-[#2a2a2e] rounded-xl text-sm font-bold transition-all border border-white/10 flex gap-2 items-center hover:shadow-lg active:scale-95">
                            <Icons.Layout /> Jaa näkymä
                        </button>
                        <button className="px-5 py-2.5 bg-white text-black hover:bg-gray-200 rounded-xl text-sm font-bold shadow-[0_0_20px_rgba(255,255,255,0.15)] transition-all hover:-translate-y-1 active:translate-y-0 active:scale-95">
                            + Uusi Widget
                        </button>
                    </div>
                </div>

                {/* Bento Grid Layout */}

                {activeTab === 'workspace' && (
                    <div className="grid grid-cols-4 auto-rows-[200px] gap-6 max-w-7xl mx-auto">
                        <Widget title="Luonnokset" size="medium" color="#60a5fa">
                            <div className="space-y-3">
                                <div className="p-4 bg-white/5 rounded-2xl border border-white/5 hover:border-blue-500/50 hover:bg-blue-500/10 cursor-pointer transition-all">
                                    <h3 className="font-bold text-base">Q1 Roadmap</h3>
                                    <p className="text-xs text-white/40 mt-1">Muokattu 2h sitten</p>
                                </div>
                                <div className="p-4 bg-white/5 rounded-2xl border border-white/5 hover:border-blue-500/50 hover:bg-blue-500/10 cursor-pointer transition-all">
                                    <h3 className="font-bold text-base">Markkinointikampanja</h3>
                                    <p className="text-xs text-white/40 mt-1">Odottaa tarkistusta</p>
                                </div>
                            </div>
                        </Widget>

                        <Widget title="Pikamuistiot (Private)" size="tall" color="#f472b6">
                            <div className="grid grid-cols-1 gap-3">
                                <div className="bg-[#fdf2f8] text-pink-900 p-4 rounded-[2rem] rounded-bl-none shadow-sm rotate-1 text-sm font-medium leading-relaxed">
                                    Muista soittaa Mikolle huomenna!
                                </div>
                                <div className="bg-[#f0fdf4] text-green-900 p-4 rounded-[2rem] rounded-br-none shadow-sm -rotate-1 text-sm font-medium leading-relaxed">
                                    Ideointisessio klo 14
                                </div>
                                <div className="bg-[#eff6ff] text-blue-900 p-4 rounded-[2rem] rounded-tl-none shadow-sm rotate-2 text-sm font-medium leading-relaxed">
                                    Tarkista KPI luvut
                                </div>
                            </div>
                        </Widget>

                        <Widget title="Kalenteri" size="tall" color="#a78bfa">
                            <div className="text-center mt-4">
                                <div className="text-5xl font-black tracking-tighter">23</div>
                                <div className="text-white/50 uppercase text-xs tracking-[0.2em] mb-6 mt-1 font-bold">Tammikuu</div>
                                <div className="space-y-4 text-left px-2">
                                    <div className="text-sm font-medium flex gap-3 items-center bg-white/5 p-3 rounded-xl border-l-4 border-red-500">
                                        <span className="opacity-90">10:00 Daily</span>
                                    </div>
                                    <div className="text-sm font-medium flex gap-3 items-center bg-white/5 p-3 rounded-xl border-l-4 border-blue-500">
                                        <span className="opacity-90">13:00 Review</span>
                                    </div>
                                </div>
                            </div>
                        </Widget>

                        <Widget title="Uutisvirta" size="medium" color="#ef4444">
                            <div className="space-y-4">
                                <div className="flex gap-4 items-center group cursor-pointer p-2 hover:bg-white/5 rounded-2xl transition-colors">
                                    <div className="w-14 h-14 bg-gradient-to-br from-orange-400 to-red-500 rounded-2xl flex-shrink-0 shadow-lg"></div>
                                    <div>
                                        <h4 className="text-sm font-bold leading-tight group-hover:text-blue-400 transition-colors">AI muuttaa tuotekehitystä</h4>
                                        <p className="text-xs text-white/40 mt-1 font-semibold">TechCrunch • 1h sitten</p>
                                    </div>
                                </div>
                                <div className="flex gap-4 items-center group cursor-pointer p-2 hover:bg-white/5 rounded-2xl transition-colors">
                                    <div className="w-14 h-14 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-2xl flex-shrink-0 shadow-lg"></div>
                                    <div>
                                        <h4 className="text-sm font-bold leading-tight group-hover:text-blue-400 transition-colors">Uusi React versio julkaistu</h4>
                                        <p className="text-xs text-white/40 mt-1 font-semibold">React Blog • 3h sitten</p>
                                    </div>
                                </div>
                            </div>
                        </Widget>
                    </div>
                )}

                {activeTab === 'team' && (
                    <div className="grid grid-cols-4 auto-rows-[200px] gap-6 max-w-7xl mx-auto">
                        <Widget title="Sopimukset & Status" size="wide" color="#34d399">
                            <div className="h-full flex flex-col items-center justify-center text-white/20 gap-4">
                                <Icons.Presentation />
                                <span className="font-bold text-lg">[Shared Plan List View Here]</span>
                            </div>
                        </Widget>
                        <Widget title="Tiimin KPI" size="small" color="#34d399">
                            <div className="flex flex-col h-full justify-center items-center">
                                <div className="text-5xl font-black text-green-400 drop-shadow-lg">94%</div>
                                <div className="text-xs font-bold text-white/50 mt-2 uppercase tracking-wide">Sprint Completion</div>
                            </div>
                        </Widget>
                    </div>
                )}

                {activeTab === 'monitoring' && (
                    <div className="grid grid-cols-3 auto-rows-[250px] gap-6 max-w-7xl mx-auto">
                        <Widget title="Hacker News (AI)" size="tall" color="#f97316">
                            <div className="space-y-2 opacity-80">
                                {[1, 2, 3, 4].map(i => (
                                    <div key={i} className="text-sm border-b border-white/5 pb-3">
                                        <span className="block font-bold hover:text-orange-400 cursor-pointer">Show HN: My new AI tool...</span>
                                        <span className="text-xs text-white/30">120 points by user123</span>
                                    </div>
                                ))}
                            </div>
                        </Widget>
                        <Widget title="Reddit (r/MachineLearning)" size="tall" color="#ef4444">
                            <div className="space-y-2 opacity-80">
                                {[1, 2, 3, 4].map(i => (
                                    <div key={i} className="text-sm border-b border-white/5 pb-3">
                                        <span className="block font-bold hover:text-red-400 cursor-pointer">New paper on diffusion models</span>
                                        <span className="text-xs text-white/30">u/researcher • 54 comments</span>
                                    </div>
                                ))}
                            </div>
                        </Widget>
                    </div>
                )}

            </div>
        </div>
    );
};

export default DashboardPlaceholder;
