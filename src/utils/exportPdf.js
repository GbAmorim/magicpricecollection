import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export function exportCardsToPdf(
    items,
    {
        fileName = "colecao.pdf",
        title = "Relatório da Coleção",
        collectionName = "",
    } = {},
) {
    const doc = new jsPDF();

    const totalCards = items.reduce(
        (acc, item) => acc + Number(item.quantity || 1),
        0,
    );

    const totalValue = items.reduce((acc, item) => {
        const unitPrice = Number(
            item.card?.prices?.usd ||
                item.card?.prices?.usd_foil ||
                item.card?.prices?.usd_etched ||
                0,
        );

        return acc + unitPrice * Number(item.quantity || 1);
    }, 0);

    doc.setFontSize(16);
    doc.text(title, 14, 18);

    doc.setFontSize(10);
    doc.text(`Coleção: ${collectionName || "Não informada"}`, 14, 28);
    doc.text(`Total de unidades: ${totalCards}`, 14, 34);
    doc.text(`Valor total USD: ${totalValue.toFixed(2)}`, 14, 40);
    doc.text(`Gerado em: ${new Date().toLocaleString("pt-BR")}`, 14, 46);

    autoTable(doc, {
        startY: 54,
        head: [["Qtd", "Nome", "Edição", "Raridade", "Preço USD", "Total USD"]],
        body: items.map((item) => {
            const unitPrice = Number(
                item.card?.prices?.usd ||
                    item.card?.prices?.usd_foil ||
                    item.card?.prices?.usd_etched ||
                    0,
            );

            return [
                item.quantity || 1,
                item.card?.name || item.name || "",
                item.card?.set_name || "",
                item.card?.rarity || "",
                unitPrice.toFixed(2),
                (unitPrice * Number(item.quantity || 1)).toFixed(2),
            ];
        }),
        styles: {
            fontSize: 8,
        },
        headStyles: {
            fillColor: [15, 23, 42],
        },
    });

    doc.save(fileName);
}
