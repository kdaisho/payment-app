// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		// interface Locals {}
		interface PageData {
			params?: Record<string, unknown>;
			products?: Array<{ id: string; name: string; description?: string; price: number }>;
			ownedProducts?: Array<{ id: string; name: string }>;
			// Optional action form state returned by SvelteKit actions
			form?: unknown;
		}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};
