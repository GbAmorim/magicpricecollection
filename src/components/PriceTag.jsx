import React from "react";
import { formatMoney, safeNumber } from "../utils/money";

export default function PriceTag({ prices, finish, usdToBrl }) {
    // Scryfall: prices.usd, prices.usd_foil, prices.usd_etched
    const pickUsd = () => {
        if (!prices) return null;
        if (finish === "foil") return safeNumber(prices.usd_foil);
        if (finish === "etched") return safeNumber(prices.usd_etched);
        return safeNumber(prices.usd);
    };

    const usd = pickUsd();
    const brl = usd != null && usdToBrl != null ? usd * usdToBrl : null;

    return (
        <div className="flex items-baseline gap-3">
            <div className="text-sm font-semibold text-slate-900">
                {formatMoney(usd, "USD")}
            </div>
            <div className="text-xs text-slate-600">
                {formatMoney(brl, "BRL")}
            </div>
        </div>
    );
}
