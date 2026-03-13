import axios from "axios";

export const scryfall = axios.create({
    baseURL: "https://api.scryfall.com",
    timeout: 15000,
});

export async function searchCardsByName(name) {
    try {
        const { data } = await scryfall.get("/cards/search", {
            params: {
                q: name,
                unique: "prints",
                order: "released",
                dir: "desc",
            },
        });

        return { data: data.data || [] };
    } catch (error) {
        if (error.response?.status === 404) {
            return { data: [] };
        }
        throw error;
    }
}

export async function autocompleteCardName(partial) {
    const { data } = await scryfall.get("/cards/autocomplete", {
        params: { q: partial },
    });
    return data;
}

export async function listSets() {
    const { data } = await scryfall.get("/sets");

    return (data.data || []).sort((a, b) => {
        const dateA = a.released_at || "";
        const dateB = b.released_at || "";
        return dateB.localeCompare(dateA);
    });
}

export async function getCardsBySet(setCode) {
    let allCards = [];
    let hasMore = true;
    let pageNum = 1;

    while (hasMore) {
        try {
            const { data } = await scryfall.get("/cards/search", {
                params: {
                    q: `set:${setCode} game:paper`,
                    order: "set",
                    unique: "prints",
                    page: pageNum,
                },
            });

            if (data.data) {
                allCards = [...allCards, ...data.data];
            }

            hasMore = data.has_more || false;
            pageNum++;
        } catch (error) {
            if (error.response?.status === 404) {
                break;
            }
            throw error;
        }
    }

    return allCards;
}

export async function searchCardsByDeckList(items) {
    const results = await Promise.all(
        items.map(async (item) => {
            if (!item.valid) {
                return {
                    ...item,
                    found: false,
                    card: null,
                };
            }

            try {
                const response = await searchCardsByName(item.name);
                const card = response.data?.[0] || null;

                if (!card) {
                    return {
                        ...item,
                        found: false,
                        card: null,
                        error: "Carta não encontrada",
                    };
                }

                return {
                    ...item,
                    found: true,
                    card,
                    error: null,
                };
            } catch (error) {
                return {
                    ...item,
                    found: false,
                    card: null,
                    error: "Erro na busca",
                };
            }
        }),
    );

    return results;
}
