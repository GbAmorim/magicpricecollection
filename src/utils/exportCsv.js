export function exportCardsToCsv(items, fileName = "colecao.csv") {
    const headers = [
        "Quantidade",
        "Nome",
        "Edição",
        "Raridade",
        "Preço unitário USD",
        "Preço total USD",
    ];

    const rows = items.map((item) => {
        const card = item.card || {};
        const unitPrice = Number(
            card.prices?.usd ||
                card.prices?.usd_foil ||
                card.prices?.usd_etched ||
                0,
        );

        return [
            item.quantity || 1,
            card.name || item.name || "",
            card.set_name || "",
            card.rarity || "",
            unitPrice,
            unitPrice * (item.quantity || 1),
        ];
    });

    const csvContent = [headers, ...rows]
        .map((row) =>
            row
                .map((value) => `"${String(value ?? "").replace(/"/g, '""')}"`)
                .join(";"),
        )
        .join("\n");

    const blob = new Blob([csvContent], {
        type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
