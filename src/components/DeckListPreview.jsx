import React, { useMemo } from "react";

export default function DeckListPreview({ items = [] }) {
    const summary = useMemo(() => {
        const found = items.filter((item) => item.found).length;
        const notFound = items.filter((item) => !item.found).length;
        const totalQty = items.reduce(
            (acc, item) => acc + Number(item.quantity || 1),
            0,
        );

        return { found, notFound, totalQty };
    }, [items]);

    if (!items.length) return null;

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                    <p className="text-xs uppercase text-slate-500 font-semibold">
                        Linhas processadas
                    </p>
                    <p className="text-2xl font-bold text-slate-900">
                        {items.length}
                    </p>
                </div>

                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                    <p className="text-xs uppercase text-slate-500 font-semibold">
                        Encontradas
                    </p>
                    <p className="text-2xl font-bold text-green-600">
                        {summary.found}
                    </p>
                </div>

                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                    <p className="text-xs uppercase text-slate-500 font-semibold">
                        Total de unidades
                    </p>
                    <p className="text-2xl font-bold text-slate-900">
                        {summary.totalQty}
                    </p>
                </div>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-200 ">
                <table className="min-w-full text-sm">
                    <thead className="bg-slate-50">
                        <tr>
                            <th className="px-4 py-3 text-left font-semibold text-slate-700">
                                Qtd
                            </th>
                            <th className="px-4 py-3 text-left font-semibold text-slate-700">
                                Nome digitado
                            </th>
                            <th className="px-4 py-3 text-left font-semibold text-slate-700">
                                Nome encontrado
                            </th>
                            <th className="px-4 py-3 text-left font-semibold text-slate-700">
                                Edição
                            </th>
                            <th className="px-4 py-3 text-left font-semibold text-slate-700">
                                Status
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.map((item) => (
                            <tr
                                key={item.id}
                                className="border-t border-slate-200"
                            >
                                <td className="px-4 py-3 text-slate-900 font-semibold">
                                    {item.quantity}
                                </td>
                                <td className="px-4 py-3 text-slate-700">
                                    {item.name}
                                </td>
                                <td className="px-4 py-3 text-slate-700">
                                    {item.card?.name || "-"}
                                </td>
                                <td className="px-4 py-3 text-slate-700">
                                    {item.card?.set_name || "-"}
                                </td>
                                <td className="px-4 py-3">
                                    {item.found ? (
                                        <span className="inline-flex rounded-full bg-green-50 px-2 py-1 text-xs font-semibold text-green-700">
                                            Encontrado
                                        </span>
                                    ) : (
                                        <span className="inline-flex rounded-full bg-red-50 px-2 py-1 text-xs font-semibold text-red-700">
                                            {item.error || "Não encontrado"}
                                        </span>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
