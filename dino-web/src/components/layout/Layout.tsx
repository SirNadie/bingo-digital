import { useNavigate } from "react-router-dom";
import { Me } from "../../types";
import { Button } from "../ui/Button";
import { LogOut } from "lucide-react";

interface LayoutProps {
    children: React.ReactNode;
    user: Me;
    onLogout: () => void;
}

export function Layout({ children, user, onLogout }: LayoutProps) {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-background text-white selection:bg-primary/30">
            {/* Navbar */}
            <header className="fixed top-0 inset-x-0 z-50 h-16 border-b border-white/5 bg-background/80 backdrop-blur-md">
                <div className="container mx-auto h-full px-4 flex items-center justify-between">
                    <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
                        <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center border border-primary/30 text-primary font-bold">
                            D
                        </div>
                        <span className="font-display font-bold text-lg tracking-tight">Dino Bingo</span>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="hidden md:flex flex-col items-end mr-2">
                            <span className="text-sm font-medium">{user.alias}</span>
                            <span className="text-xs text-white/50">{user.email}</span>
                        </div>
                        <div className="h-8 w-px bg-white/10 mx-2" />
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={onLogout}
                            className="text-white/60 hover:text-error hover:bg-error/10"
                        >
                            <LogOut className="w-4 h-4 mr-2" />
                            Salir
                        </Button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="pt-24 pb-12 px-4 container mx-auto">
                {children}
            </main>
        </div>
    );
}
