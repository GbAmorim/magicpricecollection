export function parseDeckList(text) {
    const lines = text
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean);

    return lines.map((line, index) => {
        const match = line.match(/^(\d+)\s+(.+)$/);

        if (!match) {
            return {
                id: `line-${index + 1}`,
                line: index + 1,
                raw: line,
                quantity: 1,
                name: line,
                valid: false,
                found: false,
                card: null,
                error: "Formato inválido. Use: quantidade + nome",
            };
        }

        return {
            id: `line-${index + 1}`,
            line: index + 1,
            raw: line,
            quantity: Number(match[1]),
            name: match[2].trim(),
            valid: true,
            found: false,
            card: null,
            error: null,
        };
    });
}
