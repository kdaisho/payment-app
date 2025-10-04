<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionResult } from '@sveltejs/kit';
	import type { PageProps } from './$types';

	let { form }: PageProps = $props();

	$effect(() => {
		console.debug('==>', { form });
	});

	function handleResult() {
		return async ({ result, update }: { result: ActionResult; update: () => object }) => {
			if (result.type === 'failure' && result.data) {
				alert(result.data.error || 'Login failed');
				return;
			}
			update();
		};
	}
</script>

<h1>Login</h1>

<form id="login" action="?/login" method="POST" use:enhance={handleResult}>
	<label for="email">Email:</label>
	<input type="email" id="email" name="email" required />

	<label for="password">Password:</label>
	<input type="password" id="password" name="password" required />

	<button type="submit">Login</button>
</form>

<style>
	#login {
		display: flex;
		flex-direction: column;
		max-width: 300px;
		margin: 0 auto;
	}

	label {
		margin-top: 1rem;
	}

	input {
		padding: 0.5rem;
		font-size: 1rem;
	}

	button {
		margin-top: 1.5rem;
		padding: 0.75rem;
		font-size: 1rem;
		background-color: #0070f3;
		color: white;
		border: none;
		border-radius: 4px;
		cursor: pointer;
	}

	button:hover {
		background-color: #005bb5;
	}
</style>
