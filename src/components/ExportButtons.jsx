import React from "react";
import Button from "./Button";
import { FileText, FileSpreadsheet } from "lucide-react";
import { exportCardsToCsv } from "../utils/exportCsv";
import { exportCardsToPdf } from "../utils/exportPdf";

export default function ExportButtons({
    items = [],
    collectionName = "",
    disabled = false,
}) {
    const hasItems = items.length > 0;

    return (
        <div className="flex flex-col sm:flex-row gap-2">
            <Button
                type="button"
                variant="secondary"
                disabled={disabled || !hasItems}
                className="gap-2"
                onClick={() => exportCardsToCsv(items, "lista-cards.csv")}
            >
                <FileSpreadsheet size={16} />
                Exportar CSV
            </Button>

            <Button
                type="button"
                variant="secondary"
                disabled={disabled || !hasItems}
                className="gap-2"
                onClick={() =>
                    exportCardsToPdf(items, {
                        fileName: "lista-cards.pdf",
                        title: "Relatório de Cards",
                        collectionName,
                    })
                }
            >
                <FileText size={16} />
                Exportar PDF
            </Button>
        </div>
    );
}
