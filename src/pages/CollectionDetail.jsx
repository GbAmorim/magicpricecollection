import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
    getUserCollections,
    getCollectionCards,
    updateCardQuantity,
    removeCardFromCollection,
} from "../services/collections";
import { getUsdToBrl } from "../services/fx";
import CardItem from "../components/CardItem";
import ExportButtons from "../components/ExportButtons";
import { Loader2 } from "lucide-react";
import { formatMoney } from "../utils/money";

export default function CollectionDetail() {
    const { collectionId } = useParams();
    const { user } = useAuth();

    const [cards, setCards] = useState([]);
    const [collectionName, setCollectionName] = useState("");
    const [usdToBrl, setUsdToBrl] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            if (!user || !collectionId) return;

            try {
                setLoading(true);

                const [collections, collectionCards, fxRate] =
                    await Promise.all([
                        getUserCollections(user.uid),
                        getCollectionCards(user.uid, collectionId),
                        getUsdToBrl().catch(() => 5.0),
                    ]);

                const currentCollection = collections.find(
                    (item) => item.id === collectionId,
                );

                setCollectionName(currentCollection?.name || "Coleção");
                setCards(collectionCards);
                setUsdToBrl(fxRate);
            } catch (error) {
                console.error("Erro ao carregar coleção:", error);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [user, collectionId]);

    const totalCards = useMemo(() => {
        return cards.reduce((acc, card) => acc + Number(card.quantity || 1), 0);
    }, [cards]);

    const totalValue = useMemo(() => {
        const rate = usdToBrl || 1;

        return cards.reduce((acc, card) => {
            const unitPrice = parseFloat(
                card.prices?.usd ||
                    card.prices?.usd_foil ||
                    card.prices?.usd_etched ||
                    0,
            );

            const quantity = Number(card.quantity || 1);

            return acc + unitPrice * quantity * rate;
        }, 0);
    }, [cards, usdToBrl]);

    const handleRemove = async (card) => {
        if (!user) return;

        const confirmed = window.confirm(
            `Deseja remover "${card.name}" da coleção?`,
        );

        if (!confirmed) return;

        try {
            await removeCardFromCollection(user.uid, collectionId, card.id);

            setCards((prev) => prev.filter((item) => item.id !== card.id));
        } catch (error) {
            console.error("Erro ao remover carta:", error);
            alert("Erro ao remover carta.");
        }
    };

    const handleQuantityChange = async (card, nextQuantity) => {
        if (!user) return;

        if (nextQuantity < 1) {
            const confirmed = window.confirm(
                `Deseja excluir "${card.name}" da coleção?`,
            );

            if (!confirmed) return;

            try {
                await removeCardFromCollection(user.uid, collectionId, card.id);
                setCards((prev) => prev.filter((item) => item.id !== card.id));
            } catch (error) {
                console.error("Erro ao excluir carta:", error);
                alert("Erro ao excluir carta.");
            }

            return;
        }

        try {
            await updateCardQuantity(
                user.uid,
                collectionId,
                card.id,
                nextQuantity,
            );

            setCards((prev) =>
                prev.map((item) =>
                    item.id === card.id
                        ? { ...item, quantity: nextQuantity }
                        : item,
                ),
            );
        } catch (error) {
            console.error("Erro ao atualizar quantidade:", error);
            alert("Erro ao atualizar quantidade.");
        }
    };

    const exportItems = useMemo(() => {
        return cards.map((card) => ({
            quantity: card.quantity || 1,
            name: card.name,
            found: true,
            card: {
                name: card.name,
                set_name: card.setName || card.set_name || "",
                rarity: card.rarity || "",
                prices: card.prices || {},
            },
        }));
    }, [cards]);

    if (loading) {
        return (
            <div className="py-12 flex items-center justify-center text-slate-500">
                <Loader2 className="animate-spin mr-2" size={18} />
                Carregando coleção...
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <header className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">
                        {collectionName}
                    </h1>
                    <p className="text-slate-500 text-sm">
                        Gestão detalhada da coleção.
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 lg:min-w-[360px]">
                    <div className="bg-white border border-slate-200 rounded-xl p-4">
                        <p className="text-xs uppercase tracking-widest text-slate-400 font-bold">
                            Total de unidades
                        </p>
                        <p className="mt-2 text-2xl font-black text-slate-900">
                            {totalCards}
                        </p>
                    </div>

                    <div className="bg-white border border-slate-200 rounded-xl p-4">
                        <p className="text-xs uppercase tracking-widest text-slate-400 font-bold">
                            Patrimônio total
                        </p>
                        <p className="mt-2 text-2xl font-black text-slate-900">
                            {formatMoney(totalValue, "BRL")}
                        </p>
                    </div>
                </div>
            </header>

            <div className="bg-white border border-slate-200 rounded-xl p-4">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 ">
                    <div>
                        <h2 className="text-base font-bold text-slate-900">
                            Exportação
                        </h2>
                        <p className="text-sm text-slate-500">
                            Exporte os dados reais da sua coleção em CSV ou PDF.
                        </p>
                    </div>

                    <ExportButtons
                        items={exportItems}
                        collectionName={collectionName}
                        disabled={!cards.length}
                    />
                </div>
            </div>

            {cards.length === 0 ? (
                <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-slate-500">
                    Nenhuma carta encontrada nesta coleção.
                </div>
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-4 gap-6 ">
                    {cards.map((card) => (
                        <CardItem
                            key={card.id}
                            card={{
                                ...card,
                                set_name: card.setName || card.set_name || "",
                            }}
                            usdToBrl={usdToBrl}
                            onAction={() => handleRemove(card)}
                            onQuantityChange={(qty) =>
                                handleQuantityChange(card, qty)
                            }
                            mode="collection"
                            initialQuantity={card.quantity || 1}
                            collectionTotal={totalValue}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
