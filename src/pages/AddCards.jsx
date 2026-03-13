import React, { useEffect, useMemo, useState } from "react";
import { useAuth } from "../context/AuthContext";
import {
    getUserCollections,
    addCardToCollection,
    getUserInventoryIds,
    getCollectionCards,
} from "../services/collections";
import {
    searchCardsByName,
    listSets,
    getCardsBySet,
    searchCardsByDeckList,
} from "../services/scryfall";
import { getUsdToBrl } from "../services/fx";
import CardItem from "../components/CardItem";
import Input from "../components/input";
import Button from "../components/Button";
import AdvancedCardImport from "../components/AdvancedCardImport";
import { parseDeckList } from "../utils/parseDeckList";
import {
    Search,
    Loader2,
    X,
    Filter,
    ChevronDown,
    ChevronUp,
} from "lucide-react";

const COLOR_OPTIONS = [
    { label: "Branca", value: "W" },
    { label: "Azul", value: "U" },
    { label: "Preta", value: "B" },
    { label: "Vermelha", value: "R" },
    { label: "Verde", value: "G" },
    { label: "Incolor", value: "COLORLESS" },
];

const RARITY_OPTIONS = [
    { label: "Comum", value: "common" },
    { label: "Incomum", value: "uncommon" },
    { label: "Rara", value: "rare" },
    { label: "Mítica", value: "mythic" },
    { label: "Especial", value: "special" },
    { label: "Bônus", value: "bonus" },
];

const STORAGE_KEY = "addcards:lastSearchParams";

export default function AddCards() {
    const { user } = useAuth();

    const [collections, setCollections] = useState([]);
    const [selectedCol, setSelectedCol] = useState("");

    const [searchTerm, setSearchTerm] = useState("");
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);

    const [usdToBrl, setUsdToBrl] = useState(null);

    const [sets, setSets] = useState([]);
    const [selectedParentSet, setSelectedParentSet] = useState("");
    const [selectedSet, setSelectedSet] = useState("");
    const [filterYear, setFilterYear] = useState("");
    const [filterName, setFilterName] = useState("");

    const [ownedIds, setOwnedIds] = useState(new Set());
    const [collectionTotal, setCollectionTotal] = useState(0);

    const [mode, setMode] = useState("name");
    const [quantities, setQuantities] = useState({});

    const [selectedColors, setSelectedColors] = useState([]);
    const [selectedRarities, setSelectedRarities] = useState([]);

    const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
    const [advancedSearchText, setAdvancedSearchText] = useState("");
    const [restoringSearch, setRestoringSearch] = useState(true);

    useEffect(() => {
        const loadBaseData = async () => {
            try {
                const [fxRate, setsData] = await Promise.all([
                    getUsdToBrl().catch(() => 5.0),
                    listSets(),
                ]);

                setUsdToBrl(fxRate);
                setSets(setsData);
            } catch (error) {
                console.error("Erro ao carregar dados base:", error);
            }
        };

        loadBaseData();
    }, []);

    useEffect(() => {
        const loadUserData = async () => {
            if (!user) return;

            try {
                const [userCollections, inventoryIds] = await Promise.all([
                    getUserCollections(user.uid),
                    getUserInventoryIds(user.uid),
                ]);

                setCollections(userCollections);
                setOwnedIds(inventoryIds);
            } catch (error) {
                console.error("Erro ao carregar dados do usuário:", error);
            }
        };

        loadUserData();
    }, [user]);

    useEffect(() => {
        const loadCollectionTotal = async () => {
            if (!user || !selectedCol) {
                setCollectionTotal(0);
                return;
            }

            try {
                const cards = await getCollectionCards(user.uid, selectedCol);
                const rate = usdToBrl || 1;

                const total = cards.reduce((acc, c) => {
                    const unitPrice = parseFloat(
                        c.prices?.usd ||
                            c.prices?.usd_foil ||
                            c.prices?.usd_etched ||
                            0,
                    );

                    const qty = Number(c.quantity || 1);
                    return acc + unitPrice * qty * rate;
                }, 0);

                setCollectionTotal(total);
            } catch (error) {
                console.error("Erro ao calcular total da coleção:", error);
                setCollectionTotal(0);
            }
        };

        loadCollectionTotal();
    }, [user, selectedCol, usdToBrl]);

    const clearSavedSearch = () => {
        localStorage.removeItem(STORAGE_KEY);
    };

    const saveSearchParams = (overrides = {}) => {
        const payload = {
            searchTerm,
            selectedCol,
            mode,
            selectedParentSet,
            selectedSet,
            filterYear,
            filterName,
            selectedColors,
            selectedRarities,
            showAdvancedSearch,
            advancedSearchText,
            ...overrides,
        };

        localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    };

    const resetAttributeFilters = () => {
        setSelectedColors([]);
        setSelectedRarities([]);
    };

    const buildInitialQuantities = (cards, customQuantities = null) => {
        const initialQuantities = {};

        cards.forEach((card) => {
            initialQuantities[card.id] = customQuantities?.[card.id] || 1;
        });

        setQuantities(initialQuantities);
    };

    const handleSearch = async (e) => {
        if (e) e.preventDefault();
        if (!searchTerm.trim()) return;

        setMode("name");
        setSelectedParentSet("");
        setSelectedSet("");
        setFilterYear("");
        setFilterName("");
        resetAttributeFilters();
        setAdvancedSearchText("");
        setLoading(true);

        try {
            const data = await searchCardsByName(searchTerm.trim());
            const cards = data.data || [];
            setResults(cards);
            buildInitialQuantities(cards);

            saveSearchParams({
                mode: "name",
                searchTerm: searchTerm.trim(),
                selectedParentSet: "",
                selectedSet: "",
                filterYear: "",
                filterName: "",
                selectedColors: [],
                selectedRarities: [],
                advancedSearchText: "",
            });
        } catch (error) {
            console.error("Erro técnico na busca:", error);
            setResults([]);
            setQuantities({});
        } finally {
            setLoading(false);
        }
    };

    const handleAdvancedSearch = async (text) => {
        if (!text.trim()) return;

        setMode("advanced");
        setSearchTerm("");
        setSelectedParentSet("");
        setSelectedSet("");
        setFilterYear("");
        setFilterName("");
        resetAttributeFilters();
        setAdvancedSearchText(text);
        setLoading(true);

        try {
            const parsed = parseDeckList(text);
            const searched = await searchCardsByDeckList(parsed);

            const foundCards = searched
                .filter((item) => item.found && item.card)
                .map((item) => item.card);

            const quantityMap = {};
            searched.forEach((item) => {
                if (item.found && item.card?.id) {
                    quantityMap[item.card.id] = item.quantity;
                }
            });

            setResults(foundCards);
            buildInitialQuantities(foundCards, quantityMap);

            saveSearchParams({
                mode: "advanced",
                searchTerm: "",
                selectedParentSet: "",
                selectedSet: "",
                filterYear: "",
                filterName: "",
                selectedColors: [],
                selectedRarities: [],
                showAdvancedSearch: true,
                advancedSearchText: text,
            });
        } catch (error) {
            console.error("Erro na busca avançada:", error);
            setResults([]);
            setQuantities({});
        } finally {
            setLoading(false);
        }
    };

    const handleParentSetChange = (e) => {
        const parentCode = e.target.value;
        setSelectedParentSet(parentCode);
        setSelectedSet("");
        setResults([]);
        setQuantities({});
        resetAttributeFilters();
        setSearchTerm("");
        setAdvancedSearchText("");

        saveSearchParams({
            mode: "set",
            searchTerm: "",
            selectedParentSet: parentCode,
            selectedSet: "",
            filterYear,
            filterName,
            selectedColors: [],
            selectedRarities: [],
            advancedSearchText: "",
        });
    };

    const handleSetChange = async (e) => {
        const setCode = e.target.value;
        setSelectedSet(setCode);
        setSearchTerm("");
        setAdvancedSearchText("");

        if (!setCode) {
            setResults([]);
            setQuantities({});
            resetAttributeFilters();
            return;
        }

        setMode("set");
        setLoading(true);
        resetAttributeFilters();

        try {
            const cards = await getCardsBySet(setCode);
            setResults(cards);
            buildInitialQuantities(cards);

            saveSearchParams({
                mode: "set",
                searchTerm: "",
                selectedParentSet,
                selectedSet: setCode,
                filterYear,
                filterName,
                selectedColors: [],
                selectedRarities: [],
                advancedSearchText: "",
            });
        } catch (error) {
            console.error("Erro ao carregar cards do set:", error);
            setResults([]);
            setQuantities({});
        } finally {
            setLoading(false);
        }
    };

    const handleQuantityChange = (cardId, quantity) => {
        setQuantities((prev) => ({
            ...prev,
            [cardId]: quantity < 1 ? 1 : quantity,
        }));
    };

    const handleAdd = async (card, quantityFromCard) => {
        if (!selectedCol) {
            alert("Selecione uma coleção primeiro.");
            return;
        }

        const quantity = quantityFromCard || quantities[card.id] || 1;

        try {
            await addCardToCollection(
                user.uid,
                selectedCol,
                card,
                "nonfoil",
                quantity,
            );

            setOwnedIds((prev) => {
                const next = new Set(prev);
                next.add(card.id);
                return next;
            });

            alert(
                `${card.name} adicionado com sucesso (${quantity} unidade${quantity > 1 ? "s" : ""}).`,
            );
        } catch (error) {
            console.error(error);
            alert("Erro ao adicionar card.");
        }
    };

    useEffect(() => {
        const restoreSearch = async () => {
            const saved = localStorage.getItem(STORAGE_KEY);

            if (!saved) {
                setRestoringSearch(false);
                return;
            }

            try {
                const parsed = JSON.parse(saved);

                setSearchTerm(parsed.searchTerm || "");
                setSelectedCol(parsed.selectedCol || "");
                setMode(parsed.mode || "name");
                setSelectedParentSet(parsed.selectedParentSet || "");
                setSelectedSet(parsed.selectedSet || "");
                setFilterYear(parsed.filterYear || "");
                setFilterName(parsed.filterName || "");
                setSelectedColors(parsed.selectedColors || []);
                setSelectedRarities(parsed.selectedRarities || []);
                setShowAdvancedSearch(parsed.showAdvancedSearch || false);
                setAdvancedSearchText(parsed.advancedSearchText || "");

                if (parsed.mode === "name" && parsed.searchTerm) {
                    setLoading(true);
                    const data = await searchCardsByName(parsed.searchTerm);
                    const cards = data.data || [];
                    setResults(cards);
                    buildInitialQuantities(cards);
                    setLoading(false);
                } else if (parsed.mode === "set" && parsed.selectedSet) {
                    setLoading(true);
                    const cards = await getCardsBySet(parsed.selectedSet);
                    setResults(cards);
                    buildInitialQuantities(cards);
                    setLoading(false);
                } else if (
                    parsed.mode === "advanced" &&
                    parsed.advancedSearchText
                ) {
                    setLoading(true);

                    const parsedList = parseDeckList(parsed.advancedSearchText);
                    const searched = await searchCardsByDeckList(parsedList);

                    const foundCards = searched
                        .filter((item) => item.found && item.card)
                        .map((item) => item.card);

                    const quantityMap = {};
                    searched.forEach((item) => {
                        if (item.found && item.card?.id) {
                            quantityMap[item.card.id] = item.quantity;
                        }
                    });

                    setResults(foundCards);
                    buildInitialQuantities(foundCards, quantityMap);
                    setLoading(false);
                }
            } catch (error) {
                console.error("Erro ao restaurar busca:", error);
            } finally {
                setRestoringSearch(false);
            }
        };

        restoreSearch();
    }, []);

    useEffect(() => {
        if (restoringSearch) return;

        saveSearchParams();
    }, [
        selectedCol,
        selectedColors,
        selectedRarities,
        showAdvancedSearch,
        restoringSearch,
    ]);

    const uniqueYears = useMemo(() => {
        return [...new Set(sets.map((s) => s.released_at?.split("-")[0]))]
            .filter(Boolean)
            .sort((a, b) => b - a);
    }, [sets]);

    const baseFilteredSets = useMemo(() => {
        return sets.filter((s) => {
            const year = s.released_at?.split("-")[0];
            const matchYear = !filterYear || year === filterYear;
            const matchName =
                !filterName ||
                s.name.toLowerCase().includes(filterName.toLowerCase());

            return matchYear && matchName;
        });
    }, [sets, filterYear, filterName]);

    const parentSets = useMemo(() => {
        return baseFilteredSets.filter(
            (set) =>
                !set.parent_set_code &&
                !["token", "art_series", "minigame", "memorabilia"].includes(
                    set.set_type,
                ),
        );
    }, [baseFilteredSets]);

    const childSets = useMemo(() => {
        if (!selectedParentSet) return [];

        return baseFilteredSets.filter(
            (set) =>
                set.code === selectedParentSet ||
                set.parent_set_code === selectedParentSet,
        );
    }, [baseFilteredSets, selectedParentSet]);

    const availableAttributes = useMemo(() => {
        const colors = new Set();
        const rarities = new Set();

        results.forEach((card) => {
            const cardColors = card.color_identity?.length
                ? card.color_identity
                : !card.color_identity?.length && !card.colors?.length
                  ? ["COLORLESS"]
                  : [];

            cardColors.forEach((color) => colors.add(color));

            if (card.rarity) {
                rarities.add(card.rarity);
            }
        });

        return {
            colors,
            rarities,
        };
    }, [results]);

    const filteredResults = useMemo(() => {
        let cards = results;

        if (selectedSet) {
            cards = cards.filter((card) => card.set === selectedSet);
        }

        if (selectedColors.length > 0) {
            cards = cards.filter((card) => {
                const cardColors = card.color_identity?.length
                    ? card.color_identity
                    : !card.color_identity?.length && !card.colors?.length
                      ? ["COLORLESS"]
                      : [];

                return selectedColors.some((color) =>
                    cardColors.includes(color),
                );
            });
        }

        if (selectedRarities.length > 0) {
            cards = cards.filter((card) =>
                selectedRarities.includes(card.rarity),
            );
        }

        return cards;
    }, [results, selectedSet, selectedColors, selectedRarities]);

    const resultLabel = useMemo(() => {
        if (mode === "set" && selectedSet) {
            const currentSet = sets.find((item) => item.code === selectedSet);
            return currentSet ? currentSet.name : "Edição selecionada";
        }

        if (mode === "name" && searchTerm.trim()) {
            return `Resultado para "${searchTerm}"`;
        }

        if (mode === "advanced") {
            return "Resultado da busca avançada";
        }

        return "";
    }, [mode, selectedSet, sets, searchTerm]);

    const toggleColor = (value) => {
        setSelectedColors((prev) =>
            prev.includes(value)
                ? prev.filter((item) => item !== value)
                : [...prev, value],
        );
    };

    const toggleRarity = (value) => {
        setSelectedRarities((prev) =>
            prev.includes(value)
                ? prev.filter((item) => item !== value)
                : [...prev, value],
        );
    };

    return (
        <div className="flex flex-col lg:flex-row gap-8">
            <aside className="w-full lg:w-72 shrink-0">
                <div className="bg-white p-5 border border-slate-200 rounded-xl shadow-soft space-y-6 lg:sticky lg:top-24">
                    <div className="flex items-center gap-2">
                        <Filter size={16} className="text-slate-500" />
                        <h3 className="text-sm font-bold text-slate-900">
                            Filtros Avançados
                        </h3>
                    </div>

                    <div className="space-y-3">
                        <p className="text-xs font-semibold uppercase text-slate-500">
                            Cor
                        </p>

                        <div className="flex flex-wrap gap-2">
                            {COLOR_OPTIONS.map((item) => {
                                const disabled =
                                    !availableAttributes.colors.has(item.value);
                                const active = selectedColors.includes(
                                    item.value,
                                );

                                return (
                                    <button
                                        key={item.value}
                                        type="button"
                                        disabled={disabled}
                                        onClick={() => toggleColor(item.value)}
                                        className={`px-3 py-2 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                                            active
                                                ? "bg-slate-900 text-white border-slate-900"
                                                : "bg-white text-slate-700 border-slate-200"
                                        } ${
                                            disabled
                                                ? "opacity-30 cursor-not-allowed"
                                                : "hover:border-slate-400"
                                        }`}
                                    >
                                        {item.label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div className="space-y-3">
                        <p className="text-xs font-semibold uppercase text-slate-500">
                            Raridade
                        </p>

                        <div className="flex flex-col gap-2">
                            {RARITY_OPTIONS.map((item) => {
                                const disabled =
                                    !availableAttributes.rarities.has(
                                        item.value,
                                    );
                                const active = selectedRarities.includes(
                                    item.value,
                                );

                                return (
                                    <button
                                        key={item.value}
                                        type="button"
                                        disabled={disabled}
                                        onClick={() => toggleRarity(item.value)}
                                        className={`px-3 py-2 rounded-lg text-xs font-semibold border text-left transition-all cursor-pointer ${
                                            active
                                                ? "bg-slate-900 text-white border-slate-900"
                                                : "bg-white text-slate-700 border-slate-200"
                                        } ${
                                            disabled
                                                ? "opacity-30 cursor-not-allowed"
                                                : "hover:border-slate-400"
                                        }`}
                                    >
                                        {item.label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {(selectedColors.length > 0 ||
                        selectedRarities.length > 0) && (
                        <button
                            type="button"
                            onClick={() => {
                                resetAttributeFilters();
                                saveSearchParams({
                                    selectedColors: [],
                                    selectedRarities: [],
                                });
                            }}
                            className="flex items-center gap-2 text-xs font-medium text-slate-500 hover:text-slate-900 transition-colors"
                        >
                            <X size={14} />
                            Limpar filtros laterais
                        </button>
                    )}
                </div>
            </aside>

            <div className="flex-1 space-y-6">
                <div className="bg-white p-6 border border-slate-200 rounded-xl shadow-soft space-y-4">
                    <form
                        onSubmit={handleSearch}
                        className="flex flex-col lg:flex-row gap-4 items-end"
                    >
                        <div className="flex-1 w-full">
                            <Input
                                label="Buscar por nome"
                                placeholder="Ex: Black Lotus"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        <div className="w-full lg:w-72 ">
                            <label className="block text-sm font-medium mb-1 text-slate-700 ">
                                Salvar em:
                            </label>
                            <select
                                className="w-full border border-slate-200 rounded-md p-2 text-sm outline-none focus:border-slate-400 cursor-pointer"
                                value={selectedCol}
                                onChange={(e) => setSelectedCol(e.target.value)}
                            >
                                <option value="">Escolha a coleção...</option>
                                {collections.map((c) => (
                                    <option key={c.id} value={c.id}>
                                        {c.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <Button
                            type="submit"
                            disabled={loading}
                            className="w-full lg:w-auto gap-2"
                        >
                            {loading && mode === "name" ? (
                                <Loader2 className="animate-spin" size={18} />
                            ) : (
                                <Search size={18} />
                            )}
                            Pesquisar
                        </Button>
                    </form>

                    <div className="pt-2">
                        <button
                            type="button"
                            onClick={() =>
                                setShowAdvancedSearch((prev) => !prev)
                            }
                            className="inline-flex items-center gap-2 text-sm font-medium text-slate-700 hover:text-slate-900 cursor-pointer"
                        >
                            {showAdvancedSearch ? (
                                <ChevronUp size={16} />
                            ) : (
                                <ChevronDown size={16} />
                            )}
                            Busca avançada
                        </button>
                    </div>

                    {showAdvancedSearch && (
                        <AdvancedCardImport
                            value={advancedSearchText}
                            onChange={setAdvancedSearchText}
                            onSearchList={handleAdvancedSearch}
                            loading={loading}
                        />
                    )}

                    <div className="border-t border-slate-100 pt-4 space-y-3">
                        <h3 className="text-sm font-bold text-slate-900">
                            Filtrar por edição
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                            <div>
                                <label className="block text-xs font-medium mb-1 text-slate-600 uppercase">
                                    Ano
                                </label>
                                <select
                                    className="w-full border border-slate-200 rounded-md p-2 text-sm outline-none focus:border-slate-400 cursor-pointer"
                                    value={filterYear}
                                    onChange={(e) =>
                                        setFilterYear(e.target.value)
                                    }
                                >
                                    <option value="">Todos os anos</option>
                                    {uniqueYears.map((year) => (
                                        <option key={year} value={year}>
                                            {year}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-medium mb-1 text-slate-600 uppercase">
                                    Nome da edição
                                </label>
                                <Input
                                    placeholder="Ex: Spider-Man"
                                    value={filterName}
                                    onChange={(e) =>
                                        setFilterName(e.target.value)
                                    }
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-medium mb-1 text-slate-600 uppercase">
                                    Edição principal
                                </label>
                                <select
                                    className="w-full border border-slate-200 rounded-md p-2 text-sm outline-none focus:border-slate-400 cursor-pointer"
                                    value={selectedParentSet}
                                    onChange={handleParentSetChange}
                                >
                                    <option value="">Escolha o grupo...</option>
                                    {parentSets.map((set) => (
                                        <option key={set.code} value={set.code}>
                                            {set.name} ({set.code.toUpperCase()}
                                            )
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-medium mb-1 text-slate-600 uppercase">
                                    Subedição
                                </label>
                                <select
                                    className="w-full border border-slate-200 rounded-md p-2 text-sm outline-none focus:border-slate-400 disabled:bg-slate-50 disabled:text-slate-400 cursor-pointer"
                                    value={selectedSet}
                                    onChange={handleSetChange}
                                    disabled={!selectedParentSet}
                                >
                                    <option value="">
                                        Escolha a subedição...
                                    </option>
                                    {childSets.map((set) => (
                                        <option key={set.code} value={set.code}>
                                            {set.name} ({set.code.toUpperCase()}
                                            )
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {(filterYear ||
                            filterName ||
                            selectedParentSet ||
                            selectedSet) && (
                            <button
                                type="button"
                                onClick={() => {
                                    setFilterYear("");
                                    setFilterName("");
                                    setSelectedParentSet("");
                                    setSelectedSet("");
                                    setResults([]);
                                    setQuantities({});
                                    setMode("name");
                                    resetAttributeFilters();
                                    setAdvancedSearchText("");
                                    clearSavedSearch();
                                }}
                                className="flex items-center gap-2 text-xs font-medium text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
                            >
                                <X size={14} />
                                Limpar filtros
                            </button>
                        )}
                    </div>
                </div>

                {resultLabel && (
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-lg font-bold text-slate-900">
                                {resultLabel}
                            </h2>
                            <p className="text-sm text-slate-500">
                                {filteredResults.length} card(s) encontrado(s)
                            </p>
                        </div>
                    </div>
                )}

                {loading ? (
                    <div className="py-12 flex items-center justify-center text-slate-500">
                        <Loader2 className="animate-spin mr-2" size={18} />
                        Carregando cards...
                    </div>
                ) : filteredResults.length === 0 ? (
                    <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-slate-500">
                        Nenhum card encontrado.
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-4 gap-6">
                        {filteredResults.map((card) => {
                            const isOwned = ownedIds.has(card.id);

                            return (
                                <CardItem
                                    key={card.id}
                                    card={card}
                                    usdToBrl={usdToBrl}
                                    onAction={handleAdd}
                                    onQuantityChange={(qty) =>
                                        handleQuantityChange(card.id, qty)
                                    }
                                    mode="add"
                                    isOwned={isOwned}
                                    initialQuantity={quantities[card.id] || 1}
                                    collectionTotal={collectionTotal}
                                />
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
