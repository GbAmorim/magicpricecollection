import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../context/AuthContext";
import {
    createCollection,
    deleteCollection,
    getCollectionsWithSummary,
    getGlobalInventory,
} from "../services/collections";
import { getUsdToBrl } from "../services/fx";
import { Plus, Folder, Trash2, Boxes, Wallet, RefreshCw } from "lucide-react";
import { Link } from "react-router-dom";
import Button from "../components/Button";
import Input from "../components/input";
import { formatMoney } from "../utils/money";

export default function Home() {
    const { user } = useAuth();

    const [collections, setCollections] = useState([]);
    const [name, setName] = useState("");
    const [usdToBrl, setUsdToBrl] = useState(5);
    const [loading, setLoading] = useState(false);
    const [globalSummary, setGlobalSummary] = useState({
        totalCards: 0,
        totalValue: 0,
    });

    const load = async () => {
        if (!user) return;

        try {
            setLoading(true);

            const rate = await getUsdToBrl().catch(() => 5);
            setUsdToBrl(rate);

            const [collectionsData, inventoryData] = await Promise.all([
                getCollectionsWithSummary(user.uid, rate),
                getGlobalInventory(user.uid, rate),
            ]);

            setCollections(collectionsData);
            setGlobalSummary({
                totalCards: inventoryData.totalCards,
                totalValue: inventoryData.totalValue,
            });
        } catch (error) {
            console.error("Erro ao carregar coleções:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
    }, [user]);

    const handleCreate = async () => {
        if (!name.trim()) return;

        try {
            await createCollection(user.uid, name.trim());
            setName("");
            load();
        } catch (error) {
            console.error("Erro ao criar coleção:", error);
            alert("Erro ao criar coleção.");
        }
    };

    const handleDelete = async (e, id) => {
        e.preventDefault();

        if (
            window.confirm("Deseja excluir esta coleção e todos os cards nela?")
        ) {
            try {
                await deleteCollection(user.uid, id);
                load();
            } catch (error) {
                console.error("Erro ao excluir coleção:", error);
                alert("Erro ao excluir coleção.");
            }
        }
    };

    const totalCollections = useMemo(() => collections.length, [collections]);

    return (
        <div className="space-y-8">
            <header className="space-y-2">
                <h1 className="text-2xl font-bold text-slate-900">
                    Suas Coleções
                </h1>
                <p className="text-slate-500 text-sm">
                    Gerencie seus cards por categorias, decks e inventário
                    consolidado.
                </p>
            </header>

            <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs uppercase tracking-widest text-slate-400 font-bold">
                                Coleções
                            </p>
                            <p className="mt-2 text-3xl font-black text-slate-900">
                                {totalCollections}
                            </p>
                        </div>
                        <div className="rounded-xl bg-slate-100 p-3">
                            <Folder className="text-slate-700" size={20} />
                        </div>
                    </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs uppercase tracking-widest text-slate-400 font-bold">
                                Total de Cards
                            </p>
                            <p className="mt-2 text-3xl font-black text-slate-900">
                                {globalSummary.totalCards}
                            </p>
                        </div>
                        <div className="rounded-xl bg-slate-100 p-3">
                            <Boxes className="text-slate-700" size={20} />
                        </div>
                    </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs uppercase tracking-widest text-slate-400 font-bold">
                                Patrimônio Total
                            </p>
                            <p className="mt-2 text-3xl font-black text-slate-900">
                                {formatMoney(globalSummary.totalValue, "BRL")}
                            </p>
                        </div>
                        <div className="rounded-xl bg-slate-100 p-3">
                            <Wallet className="text-slate-700" size={20} />
                        </div>
                    </div>
                </div>
            </section>

            <section className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
                <div className="flex gap-2 max-w-md w-full">
                    <Input
                        placeholder="Nome da nova coleção..."
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                    <Button
                        onClick={handleCreate}
                        className="gap-2 cursor-pointer"
                    >
                        <Plus size={18} /> Criar
                    </Button>
                </div>

                <div className="flex gap-2">
                    <Button
                        variant="secondary"
                        onClick={load}
                        className="gap-2 cursor-pointer"
                    >
                        <RefreshCw size={16} />
                        Atualizar
                    </Button>

                    <Link to="/app/inventory">
                        <Button className="gap-2 cursor-pointer">
                            <Boxes size={16} />
                            Inventário Completo
                        </Button>
                    </Link>
                </div>
            </section>

            {loading ? (
                <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-slate-500">
                    Carregando coleções...
                </div>
            ) : collections.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
                    <p className="text-slate-600 font-medium">
                        Você ainda não criou nenhuma coleção.
                    </p>
                    <p className="text-slate-400 text-sm mt-2">
                        Crie a primeira coleção para começar a organizar seus
                        cards.
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5 ">
                    {collections.map((col) => (
                        <div key={col.id} className="relative group">
                            <Link
                                to={`/app/collections/${col.id}`}
                                className="block rounded-2xl border border-slate-200 bg-white p-6 hover:shadow-lg hover:border-slate-300 transition-all"
                            >
                                <div className="mb-5 flex items-start justify-between">
                                    <div className="rounded-xl bg-slate-100 p-3">
                                        <Folder
                                            className="text-slate-700"
                                            size={20}
                                        />
                                    </div>
                                </div>

                                <h3 className="font-bold text-slate-900 text-lg">
                                    {col.name}
                                </h3>

                                <div className="mt-5 grid grid-cols-2 gap-3">
                                    <div className="rounded-xl bg-slate-50 p-3">
                                        <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">
                                            Cards
                                        </p>
                                        <p className="mt-1 text-lg font-black text-slate-900">
                                            {col.totalCards || 0}
                                        </p>
                                    </div>

                                    <div className="rounded-xl bg-slate-50 p-3">
                                        <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">
                                            Valor
                                        </p>
                                        <p className="mt-1 text-lg font-black text-slate-900">
                                            {formatMoney(
                                                col.totalValue || 0,
                                                "BRL",
                                            )}
                                        </p>
                                    </div>
                                </div>

                                <p className="mt-5 text-xs text-slate-400 uppercase tracking-widest font-bold">
                                    Ver detalhes
                                </p>
                            </Link>

                            <button
                                onClick={(e) => handleDelete(e, col.id)}
                                className="absolute top-4 right-4 p-2 text-slate-300 hover:text-red-600 transition-colors cursor-pointer"
                            >
                                <Trash2 size={18} />
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
