declare module '$lib/server/data/owned_products.json' {
    // const data: Record<string, unknown>;
    const data: Record<string, { id: string, quantity: number }[]>;
    export default data;
}