export function exportCardsToTxtList(items, fileName = "lista.txt") {
    const lines = items.map((item) => {
        const quantity = Number(item.quantity || 1);
        const name = item.card?.name || item.name || "";
        return `${quantity} ${name}`.trim();
    });

    const content = lines.join("\n");

    const blob = new Blob([content], { type: "text/plain;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
