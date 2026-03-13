import axios from "axios";

const fx = axios.create({
    baseURL: "https://api.frankfurter.app",
    timeout: 15000,
});

// Retorna taxa USD->BRL (quando disponível)
export async function getUsdToBrl() {
    // latest?from=USD&to=BRL
    const { data } = await fx.get("/latest", {
        params: { from: "USD", to: "BRL" },
    });
    const rate = data?.rates?.BRL;
    if (!rate) throw new Error("Sem taxa USD->BRL disponível nesta fonte.");
    return rate;
}
