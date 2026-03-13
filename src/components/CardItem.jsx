import React, { useEffect, useState } from "react";
import PriceTag from "./PriceTag";
import Button from "./Button";
import { Plus, Trash2, Minus } from "lucide-react";
import { formatMoney } from "../utils/money";

export default function CardItem({
    card,
    finish = "nonfoil",
    usdToBrl,
    onAction,
    onQuantityChange,
    mode = "add",
    isOwned,
    initialQuantity = 1,
    collectionTotal,
}) {
    const [isImageHovered, setIsImageHovered] = useState(false);
    const [quantity, setQuantity] = useState(initialQuantity);

    useEffect(() => {
        setQuantity(initialQuantity || 1);
    }, [initialQuantity]);

    const image =
        card?.image ||
        card?.image_uris?.normal ||
        card?.card_faces?.[0]?.image_uris?.normal;

    const largeImage =
        card?.image_uris?.large ||
        card?.card_faces?.[0]?.image_uris?.large ||
        image;

    const unitPrice = parseFloat(
        card?.prices?.usd ||
            card?.prices?.usd_foil ||
            card?.prices?.usd_etched ||
            0,
    );
    const totalPrice = unitPrice * quantity * (usdToBrl || 1);

    const hasPrice = unitPrice > 0;

    const handleDecrease = () => {
        if (mode === "add") {
            if (quantity <= 1) return;
            const next = quantity - 1;
            setQuantity(next);
            if (onQuantityChange) onQuantityChange(next);
            return;
        }

        const next = quantity - 1;
        setQuantity(next < 0 ? 0 : next);
        if (onQuantityChange) onQuantityChange(next);
    };

    const handleIncrease = () => {
        const next = quantity + 1;
        setQuantity(next);
        if (onQuantityChange) onQuantityChange(next);
    };

    return (
        <div className="flex flex-col bg-white border border-slate-200 rounded-xl overflow-hidden transition-all duration-300 hover:shadow-xl">
            <div
                className="aspect-[3/4] w-full bg-slate-100 overflow-hidden cursor-pointer"
                onMouseEnter={() => setIsImageHovered(true)}
                onMouseLeave={() => setIsImageHovered(false)}
            >
                {image ? (
                    <img
                        src={image}
                        alt={card.name}
                        className="h-full w-full object-cover"
                        loading="lazy"
                    />
                ) : (
                    <div className="flex items-center justify-center h-full text-slate-400 text-xs">
                        Sem imagem
                    </div>
                )}

                {isImageHovered && (
                    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-slate-900/70 backdrop-blur-sm pointer-events-none">
                        <div className="animate-in zoom-in-95 duration-200">
                            <img
                                src={largeImage}
                                alt={card.name}
                                className="max-h-[85vh] w-auto rounded-2xl shadow-2xl border-4 border-white/20"
                            />
                        </div>
                    </div>
                )}
            </div>

            <div className="p-3 space-y-3">
                <div className="min-w-0">
                    <h4 className="text-sm font-bold text-slate-900 truncate">
                        {card.name}
                    </h4>
                    <p className="text-[10px] text-slate-500 uppercase font-medium">
                        {card.set_name || card.setName}
                    </p>
                </div>

                <div className="pt-2 border-t border-slate-50">
                    {hasPrice ? (
                        <div className="space-y-1">
                            <div className="flex justify-between items-center">
                                <span className="text-[10px] text-slate-500 font-medium">
                                    Unitário
                                </span>
                                <span className="text-xs font-bold text-slate-900">
                                    {formatMoney(
                                        unitPrice * (usdToBrl || 1),
                                        "BRL",
                                    )}
                                </span>
                            </div>
                            <div className="flex justify-between items-center bg-slate-50 px-2 py-1 rounded">
                                <span className="text-[10px] text-slate-600 font-semibold">
                                    Total ({quantity}x)
                                </span>
                                <span className="text-sm font-black text-blue-600">
                                    {formatMoney(totalPrice, "BRL")}
                                </span>
                            </div>
                        </div>
                    ) : (
                        <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded">
                            Sob consulta
                        </span>
                    )}
                </div>

                <div className="flex items-center justify-between rounded-lg border border-slate-200 px-2 py-2">
                    <span className="text-xs font-semibold text-slate-600">
                        Qtd
                    </span>

                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={handleDecrease}
                            className="flex h-7 w-7 items-center justify-center rounded-md border border-slate-200 text-slate-700 hover:bg-slate-50"
                        >
                            <Minus size={14} />
                        </button>

                        <span className="min-w-[24px] text-center text-sm font-bold text-slate-900">
                            {quantity}
                        </span>

                        <button
                            type="button"
                            onClick={handleIncrease}
                            className="flex h-7 w-7 items-center justify-center rounded-md border border-slate-200 text-slate-700 hover:bg-slate-50"
                        >
                            <Plus size={14} />
                        </button>
                    </div>
                </div>

                <Button
                    variant={mode === "add" ? "primary" : "danger"}
                    className="w-full mt-2 py-1.5 text-xs gap-2"
                    onClick={() => onAction(card, quantity)}
                >
                    {mode === "add" ? <Plus size={14} /> : <Trash2 size={14} />}
                    {mode === "add" ? "Adicionar" : "Remover"}
                </Button>

                {isOwned && (
                    <div className="text-[10px] font-bold text-green-600 text-center uppercase bg-green-50 py-1 rounded">
                        ✓ Na coleção
                    </div>
                )}
            </div>
        </div>
    );
}
