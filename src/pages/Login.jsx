import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Button from "../components/Button";
import googleIcon from "../assets/google.png";

export default function Login() {
    const { loginWithGoogle, user } = useAuth();
    const navigate = useNavigate();

    // Redireciona se já estiver logado
    React.useEffect(() => {
        if (user) navigate("/app");
    }, [user, navigate]);

    const handleLogin = async () => {
        try {
            await loginWithGoogle();
            navigate("/app");
        } catch (error) {
            console.error("Falha na autenticação:", error);
        }
    };

    return (
        <div className="min-h-screen bg-white flex items-center justify-center">
            <div className="max-w-md w-full px-6 py-12 border border-slate-100 rounded-xl shadow-soft text-center">
                <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-2">
                    MTG Price Collection
                </h1>
                <p className="text-slate-600 mb-8">
                    Gestão de cartas e coleções de Magic the Gathering.
                </p>

                <Button
                    onClick={handleLogin}
                    className="w-full py-3 gap-2 cursor-pointer"
                >
                    <img src={googleIcon} width="18" alt="Google" />
                    Entrar com Google
                </Button>
            </div>
        </div>
    );
}
