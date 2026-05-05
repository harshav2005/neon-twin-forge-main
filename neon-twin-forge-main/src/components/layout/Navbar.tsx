// src/components/layout/Navbar.tsx

import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Sun, Moon, Sparkles } from "lucide-react";
import { AnimeButton } from "@/components/ui/anime-button";
import { useTheme } from "@/hooks/useTheme";
import { cn, getAvatarUrl } from "@/lib/utils";
import { ProfileAvatar } from "@/components/ui/ProfileAvatar";
import { NavGate } from "@/components/ui/NavGate";
import { ContactTeamModal } from "@/components/ContactTeamModal";
import authService from "@/services/authService";

// Define the shape of the user object stored in localStorage
interface UserData {
    id: string;
    name: string;
    email: string;
    isAdmin: boolean;
    avatarUrl?: string;
}

// NOTE: This must match the string used in index.js for the default avatar field.
const BACKEND_DEFAULT_AVATAR = "/default-avatar.png";

const navLinks = [
    { href: "/", label: "Home" }, // Public/Open
    { href: "/dashboard", label: "Dashboard" }, // PROTECTED
    { href: "/twin-builder", label: "Twin Builder" }, // PROTECTED
    { href: "/chat", label: "Chat" },
    { href: "/memory", label: "Memory" },
    { href: "/analytics", label: "Analytics" },
];

export function Navbar() {
    const [isOpen, setIsOpen] = useState(false);

    // Initialize user state by checking localStorage once on load
    const [user, setUser] = useState<UserData | null>(() => {
        const storedUser = localStorage.getItem("user");
        return storedUser ? JSON.parse(storedUser) : null;
    });

    const location = useLocation();
    const { theme, toggleTheme } = useTheme();

    // Effect to re-check user state on route change AND fetch fresh data on mount
    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        const token = localStorage.getItem("token");

        if (storedUser && token) {
            try {
                // 1. Set initial state from localStorage (fast)
                const parsedUser = JSON.parse(storedUser) as UserData;
                setUser(parsedUser);

                // 2. Fetch fresh data from backend (background update)
                const syncUser = async () => {
                    try {
                        const freshUser = await authService.getMe();
                        if (freshUser) {
                            // Only update if data changed (simple check)
                            if (JSON.stringify(freshUser) !== JSON.stringify(parsedUser)) {
                                console.log("Syncing fresh user data...", freshUser);
                                localStorage.setItem("user", JSON.stringify(freshUser));
                                setUser(freshUser);
                            }
                        }
                    } catch (err) {
                        console.error("Background sync failed", err);
                    }
                };
                syncUser();

            } catch (e) {
                console.error("Error parsing user data from localStorage:", e);
                setUser(null);
                localStorage.removeItem("user");
                localStorage.removeItem("token");
            }
        } else {
            setUser(null);
        }
    }, [location.pathname]);

    const handleSignOut = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setUser(null);
        setIsOpen(false);
    };

    return (
        <nav className="fixed top-0 left-0 right-0 z-50">
            <div className="glass-card mx-4 mt-4 rounded-2xl">
                <div className="container mx-auto px-4">
                    <div className="flex items-center justify-between h-16">
                        {/* Logo */}
                        {/* Always use standard Link for Home page */}
                        <Link to="/" className="flex items-center gap-2 group">
                            <motion.div
                                className="relative"
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <Sparkles className="w-8 h-8 text-primary" />
                                <motion.div
                                    className="absolute inset-0 bg-primary/30 blur-xl rounded-full"
                                    animate={{ opacity: [0.5, 1, 0.5] }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                />
                            </motion.div>
                            <span className="font-display font-bold text-xl neon-text">
                                DigitalTwin
                            </span>
                        </Link>

                        {/* Desktop Navigation */}
                        <div className="hidden md:flex items-center gap-1">
                            {navLinks.map((link) => (
                                <NavGate // <--- USE NavGate HERE
                                    key={link.href}
                                    to={link.href}
                                    className={cn(
                                        "px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300",
                                        location.pathname === link.href
                                            ? "bg-primary/20 text-primary shadow-glow-sm"
                                            : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                                    )}
                                >
                                    {link.label}
                                </NavGate>
                            ))}
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2">
                            {/* Theme toggle ... */}
                            <AnimeButton
                                variant="ghost"
                                size="icon"
                                onClick={toggleTheme}
                                className="rounded-xl"
                            >
                                {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                            </AnimeButton>

                            {/* Contact Us Team Modal */}
                            <ContactTeamModal />

                            {user ? (
                                // Profile dropdown (visible when logged in)
                                <div className="relative group">
                                    <AnimeButton variant="ghost" size="icon" className="rounded-full">
                                        <ProfileAvatar
                                            src={getAvatarUrl(user.avatarUrl)}
                                            name={user.name}
                                            size="sm"
                                        />
                                    </AnimeButton>
                                    <div className="absolute right-0 mt-2 w-36 bg-card rounded-xl shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Link
                                            to="/memory"
                                            className="block px-4 py-2 text-sm hover:bg-muted/50"
                                        >
                                            Memory Manager
                                        </Link>
                                        <button
                                            onClick={handleSignOut}
                                            className="w-full text-left px-4 py-2 text-sm hover:bg-muted/50 rounded-b-xl"
                                        >
                                            Sign Out
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                // Login/Sign Up buttons (visible when logged out)
                                <div className="hidden md:flex items-center gap-2">
                                    <Link to="/login">
                                        <AnimeButton variant="ghost" size="sm">
                                            Login
                                        </AnimeButton>
                                    </Link>
                                    <Link to="/signup">
                                        <AnimeButton variant="neon" size="sm">
                                            Get Started
                                        </AnimeButton>
                                    </Link>
                                </div>
                            )}

                            {/* Mobile Menu Button */}
                            <AnimeButton
                                variant="ghost"
                                size="icon"
                                className="md:hidden"
                                onClick={() => setIsOpen(!isOpen)}
                            >
                                {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                            </AnimeButton>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="glass-card mx-4 mt-2 rounded-2xl md:hidden overflow-hidden"
                    >
                        <div className="p-4 space-y-2">
                            {navLinks.map((link) => (
                                <NavGate // <--- USE NavGate HERE
                                    key={link.href}
                                    to={link.href}
                                    onClick={() => setIsOpen(false)}
                                    className={cn(
                                        "block px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300",
                                        location.pathname === link.href
                                            ? "bg-primary/20 text-primary"
                                            : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                                    )}
                                >
                                    {link.label}
                                </NavGate>
                            ))}

                            <div className="pt-2 border-t border-border/50 space-y-2">
                                {user ? (
                                    <>
                                        <Link to="/dashboard" onClick={() => setIsOpen(false)}>
                                            <AnimeButton variant="ghost" className="w-full">
                                                Profile
                                            </AnimeButton>
                                        </Link>
                                        <button
                                            onClick={handleSignOut}
                                            className="w-full text-left"
                                        >
                                            <AnimeButton variant="ghost" className="w-full">
                                                Sign Out
                                            </AnimeButton>
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <Link to="/login" onClick={() => setIsOpen(false)}>
                                            <AnimeButton variant="ghost" className="w-full">
                                                Login
                                            </AnimeButton>
                                        </Link>
                                        <Link to="/signup" onClick={() => setIsOpen(false)}>
                                            <AnimeButton variant="neon" className="w-full">
                                                Get Started
                                            </AnimeButton>
                                        </Link>
                                    </>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
}