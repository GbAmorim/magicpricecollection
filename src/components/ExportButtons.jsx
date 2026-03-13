import React from "react";
import Button from "./Button";
import { FileText, FileSpreadsheet, List } from "lucide-react";
import { exportCardsToCsv } from "../utils/exportCsv";
import { exportCardsToPdf } from "../utils/exportPdf";
import { exportCardsToTxtList } from "../utils/exportList";

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
                onClick={() =>
                    exportCardsToCsv(
                        items,
                        `${collectionName || "colecao"}.csv`,
                    )
                }
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
                        fileName: `${collectionName || "colecao"}.pdf`,
                        title: "Relatório da Coleção",
                        collectionName,
                    })
                }
            >
                <FileText size={16} />
                Exportar PDF
            </Button>

            <Button
                type="button"
                variant="secondary"
                disabled={disabled || !hasItems}
                className="gap-2"
                onClick={() =>
                    exportCardsToTxtList(
                        items,
                        `${collectionName || "colecao"}-lista.txt`,
                    )
                }
            >
                <List size={16} />
                Exportar lista
            </Button>
        </div>
    );
}
