import { db } from "./firebase";
import {
    collection,
    addDoc,
    getDocs,
    query,
    orderBy,
    deleteDoc,
    doc,
    updateDoc,
    serverTimestamp,
} from "firebase/firestore";

/**
 * CRIAÇÃO E GESTÃO DE COLEÇÕES
 */

export const createCollection = async (userId, name) => {
    const colRef = collection(db, `users/${userId}/collections`);
    return await addDoc(colRef, {
        name,
        createdAt: serverTimestamp(),
    });
};

export const getUserCollections = async (userId) => {
    const colRef = collection(db, `users/${userId}/collections`);
    const q = query(colRef, orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((item) => ({
        id: item.id,
        ...item.data(),
    }));
};

export const updateCollectionName = async (userId, collectionId, newName) => {
    const docRef = doc(db, `users/${userId}/collections`, collectionId);
    return await updateDoc(docRef, { name: newName });
};

export const deleteCollection = async (userId, collectionId) => {
    const cardsRef = collection(
        db,
        `users/${userId}/collections/${collectionId}/cards`,
    );

    const cardsSnapshot = await getDocs(cardsRef);

    const deletePromises = cardsSnapshot.docs.map((cardDoc) =>
        deleteDoc(
            doc(
                db,
                `users/${userId}/collections/${collectionId}/cards`,
                cardDoc.id,
            ),
        ),
    );

    await Promise.all(deletePromises);

    const docRef = doc(db, `users/${userId}/collections`, collectionId);
    return await deleteDoc(docRef);
};

/**
 * GESTÃO DE CARDS DENTRO DAS COLEÇÕES
 */

export const addCardToCollection = async (
    userId,
    collectionId,
    card,
    finish = "nonfoil",
    quantity = 1,
) => {
    const cardsRef = collection(
        db,
        `users/${userId}/collections/${collectionId}/cards`,
    );

    const image =
        card.image ||
        card.image_uris?.normal ||
        card.card_faces?.[0]?.image_uris?.normal ||
        "";

    return await addDoc(cardsRef, {
        scryfallId: card.id,
        name: card.name,
        set: card.set,
        setName: card.set_name || card.setName || "",
        rarity: card.rarity || "",
        finish,
        image,
        prices: card.prices || {},
        quantity,
        addedAt: serverTimestamp(),
    });
};

export const getCollectionCards = async (userId, collectionId) => {
    const cardsRef = collection(
        db,
        `users/${userId}/collections/${collectionId}/cards`,
    );
    const q = query(cardsRef, orderBy("addedAt", "desc"));
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((item) => ({
        id: item.id,
        ...item.data(),
    }));
};

export const removeCardFromCollection = async (
    userId,
    collectionId,
    cardDocId,
) => {
    const cardRef = doc(
        db,
        `users/${userId}/collections/${collectionId}/cards`,
        cardDocId,
    );
    return await deleteDoc(cardRef);
};

export const updateCardQuantity = async (
    userId,
    collectionId,
    cardDocId,
    quantity,
) => {
    const cardRef = doc(
        db,
        `users/${userId}/collections/${collectionId}/cards`,
        cardDocId,
    );
    return await updateDoc(cardRef, { quantity });
};

/**
 * INVENTÁRIO CONSOLIDADO
 */

export const getUserInventoryIds = async (userId) => {
    const collections = await getUserCollections(userId);
    const ownedIds = new Set();

    for (const currentCollection of collections) {
        const cards = await getCollectionCards(userId, currentCollection.id);
        cards.forEach((card) => {
            if (card.scryfallId) {
                ownedIds.add(card.scryfallId);
            }
        });
    }

    return ownedIds;
};

export const getCollectionSummary = async (
    userId,
    collectionId,
    usdToBrl = 1,
) => {
    const cards = await getCollectionCards(userId, collectionId);

    const totalCards = cards.reduce(
        (acc, card) => acc + Number(card.quantity || 1),
        0,
    );

    const totalValue = cards.reduce((acc, card) => {
        const unitPrice = parseFloat(
            card.prices?.usd ||
                card.prices?.usd_foil ||
                card.prices?.usd_etched ||
                0,
        );

        const quantity = Number(card.quantity || 1);
        return acc + unitPrice * quantity * usdToBrl;
    }, 0);

    return {
        totalCards,
        totalValue,
    };
};

export const getCollectionsWithSummary = async (userId, usdToBrl = 1) => {
    const collections = await getUserCollections(userId);

    const enrichedCollections = await Promise.all(
        collections.map(async (col) => {
            const summary = await getCollectionSummary(
                userId,
                col.id,
                usdToBrl,
            );

            return {
                ...col,
                totalCards: summary.totalCards,
                totalValue: summary.totalValue,
            };
        }),
    );

    return enrichedCollections;
};

export const getGlobalInventory = async (userId, usdToBrl = 1) => {
    const collections = await getUserCollections(userId);

    const collectionResults = await Promise.all(
        collections.map(async (col) => {
            const cards = await getCollectionCards(userId, col.id);

            return cards.map((card) => ({
                ...card,
                collectionId: col.id,
                collectionName: col.name,
            }));
        }),
    );

    const allCards = collectionResults.flat();

    const totalCards = allCards.reduce(
        (acc, card) => acc + Number(card.quantity || 1),
        0,
    );

    const totalValue = allCards.reduce((acc, card) => {
        const unitPrice = parseFloat(
            card.prices?.usd ||
                card.prices?.usd_foil ||
                card.prices?.usd_etched ||
                0,
        );

        const quantity = Number(card.quantity || 1);
        return acc + unitPrice * quantity * usdToBrl;
    }, 0);

    return {
        cards: allCards,
        totalCards,
        totalValue,
    };
};
