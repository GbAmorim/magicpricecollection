import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { LogOut } from "lucide-react";

export default function TopBar() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate("/login");
    };

    return (
        <header className="border-b border-slate-200 bg-white sticky top-0 z-10">
            <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
                <Link to="/app" className="text-lg font-bold text-slate-900">
                    MTG Price
                </Link>

                <div className="flex items-center gap-6">
                    <nav className="flex gap-4 text-sm font-medium">
                        <NavLink
                            to="/app"
                            end
                            className={({ isActive }) =>
                                isActive ? "text-slate-900" : "text-slate-500"
                            }
                        >
                            Coleções
                        </NavLink>
                        <NavLink
                            to="/app/add"
                            className={({ isActive }) =>
                                isActive ? "text-slate-900" : "text-slate-500"
                            }
                        >
                            Adicionar
                        </NavLink>
                    </nav>

                    <div className="flex items-center gap-3 border-l pl-6 border-slate-200">
                        <img
                            src={user?.photoURL}
                            className="w-8 h-8 rounded-full border border-slate-200"
                            alt="Avatar"
                        />
                        <button
                            onClick={handleLogout}
                            className="text-slate-400 hover:text-red-600 transition-colors cursor-pointer"
                        >
                            <LogOut size={18} />
                        </button>
                    </div>
                </div>
            </div>
        </header>
    );
}
