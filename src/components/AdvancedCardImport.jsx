import React from "react";
import Button from "./Button";
import { Wand2, X } from "lucide-react";

export default function AdvancedCardImport({
    value,
    onChange,
    onSearchList,
    loading = false,
}) {
    const handleSubmit = () => {
        if (!value.trim()) return;
        onSearchList(value);
    };

    const handleClear = () => {
        onChange("");
    };

    return (
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-4">
            <div>
                <h3 className="text-sm font-bold text-slate-900">
                    Busca avançada por lista
                </h3>
                <p className="text-sm text-slate-500">
                    Cole a lista no formato quantidade + nome da carta.
                </p>
            </div>

            <textarea
                className="w-full min-h-[220px] rounded-xl border border-slate-200 p-4 text-sm outline-none focus:border-slate-400 bg-white"
                placeholder={`4 Ragavan, Afanador Ágil\n3 Piromante Experiente\n4 Phlage, Titã da Fúria Ígnea`}
                value={value}
                onChange={(e) => onChange(e.target.value)}
            />

            <div className="flex flex-col sm:flex-row gap-2">
                <Button
                    type="button"
                    className="gap-2"
                    onClick={handleSubmit}
                    disabled={loading || !value.trim()}
                >
                    <Wand2 size={16} />
                    Pesquisar lista
                </Button>

                <Button
                    type="button"
                    variant="secondary"
                    className="gap-2"
                    onClick={handleClear}
                >
                    <X size={16} />
                    Limpar
                </Button>
            </div>
        </div>
    );
}
