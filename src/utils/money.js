export function formatMoney(value, currency) {
    if (value == null || Number.isNaN(Number(value))) return "-";
    return new Intl.NumberFormat(currency === "BRL" ? "pt-BR" : "en-US", {
        style: "currency",
        currency,
        maximumFractionDigits: 2,
    }).format(Number(value));
}

export function safeNumber(x) {
    const n = Number(x);
    return Number.isFinite(n) ? n : null;
}
