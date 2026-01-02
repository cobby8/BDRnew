"use client";

import {
    Gamepad2,
    Layers,
    LogOut,
    Menu,
    Trophy,
    Users,
    X
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const pathname = usePathname();

    const navigation = [
        { name: "Tournaments", href: "/dashboard/tournaments", icon: Trophy },
        { name: "Divisions", href: "/dashboard/divisions", icon: Layers },
        { name: "Teams", href: "/dashboard/teams", icon: Users },
        { name: "Games", href: "/dashboard/games", icon: Gamepad2 },
    ];

    return (
        <div className="min-h-screen bg-slate-50">
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            <aside
                className={`fixed top-0 left-0 z-50 h-screen w-64 bg-[#111827] text-white transition-transform duration-200 ease-in-out lg:translate-x-0 ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"
                    }`}
            >
                <div className="flex h-16 items-center justify-between px-6 border-b border-gray-800">
                    <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                        BDR Admin
                    </span>
                    <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-gray-400 hover:text-white">
                        <X size={24} />
                    </button>
                </div>

                <nav className="flex flex-col p-4 space-y-2">
                    {navigation.map((item) => {
                        const isActive = pathname.startsWith(item.href);
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                onClick={() => setIsSidebarOpen(false)}
                                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive
                                    ? "bg-blue-600 text-white shadow-md shadow-blue-900/20"
                                    : "text-gray-400 hover:bg-gray-800 hover:text-white"
                                    }`}
                            >
                                <item.icon size={20} />
                                <span className="font-medium">{item.name}</span>
                            </Link>
                        );
                    })}
                </nav>

                <div className="absolute bottom-0 w-full p-4 border-t border-gray-800">
                    <button className="flex items-center gap-3 text-red-400 hover:text-red-300 px-4 py-3 w-full rounded-lg hover:bg-gray-800 transition-colors">
                        <LogOut size={20} />
                        <span className="font-medium">Sign Out</span>
                    </button>
                </div>
            </aside>

            <div className={`transition-all duration-200 lg:ml-64`}>
                <header className="sticky top-0 z-30 flex h-16 items-center justify-between bg-white px-6 shadow-sm border-b border-gray-200 lg:px-8">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setIsSidebarOpen(true)}
                            className={`p-2 rounded-md hover:bg-gray-100 lg:hidden ${isSidebarOpen ? "hidden" : "block"}`}
                        >
                            <Menu size={24} className="text-gray-600" />
                        </button>
                        <h1 className="text-lg font-semibold text-gray-800">
                            {navigation.find(n => pathname.startsWith(n.href))?.name || "Dashboard"}
                        </h1>
                    </div>
                </header>

                <main className="p-6 lg:p-8 max-w-7xl mx-auto">
                    {children}
                </main>
            </div>
        </div>
    );
}
