<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<h1>Store</h1>

<div id="products">
	{#each data.products as product (product.id)}
		<div class="product">
			<h2>{product.name}</h2>
			<p>{product.description}</p>
			<p>
				Price: {new Intl.NumberFormat(undefined, {
					style: 'currency',
					currency: 'CAD'
				}).format(product.price)}
			</p>

			<form method="POST" action="?/createCheckoutSession" use:enhance>
				<input type="hidden" name="productId" value={product.id} />
				<button type="submit">Buy</button>
			</form>
		</div>
	{/each}
</div>
