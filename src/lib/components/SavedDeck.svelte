<script lang="ts">
	import SVG_edit from '$lib/svg/edit.svelte';
	import SVG_copy from '$lib/svg/copy.svelte';
	import SVG_share from '$lib/svg/share.svelte';
	import SVG_delete from '$lib/svg/delete.svelte';
	import { store_savedDecks, type Deck, store_buildDeck } from '$lib/utils/stores';
	import { goto } from '$app/navigation';
	import { encode } from '$lib/utils/Share.js';
	import { toast } from '$lib/utils/toast.js';

	export let deck: Deck;
	export let index: number;

	let extended = false;

	const copy = () => {
		store_buildDeck.set({ ...$store_savedDecks[index] });
		goto('/build');
	};

	const share = () => {
		navigator.clipboard.writeText(encode(deck));
		toast.success('Deck Code copied to clipboard');
	};
</script>

<div class="m-4 flex flex-col gap-4 rounded-2xl border-2 border-color_accent px-4 pb-4">
	<div class="grid grid-cols-[70%,30%]">
		<div class="flex flex-col pr-2">
			<div class="grid grid-cols-[15%,85%] py-2">
				<div class="w-6"><SVG_edit /></div>
				<input type="text" class="bg-transparent text-xl" bind:value={deck.name} on:change={() => store_savedDecks.save()} />
			</div>
			<button on:click={() => (extended = !extended)} class="flex gap-2">
				{#each deck.cards.characters as card}
					<div>
						<img src="/cards/{card.id}.webp" alt={card.name} />
					</div>
				{/each}
			</button>
		</div>
		<div class="flex flex-col justify-between pt-4 pl-2">
			<button on:click={copy} class="flex items-center rounded-lg bg-color_primary px-2 py-1">
				<div class="w-6"><SVG_copy /></div>
				<div class="m-auto">Copy</div>
			</button>
			<button on:click={share} class="flex items-center rounded-lg bg-color_primary px-2 py-1">
				<div class="w-6"><SVG_share /></div>
				<div class="m-auto">Share</div>
			</button>
			<button on:click={() => store_savedDecks.remove(index)} class="flex items-center rounded-lg bg-red-600 px-2 py-1">
				<div class="w-6"><SVG_delete /></div>
				<div class="m-auto">Delete</div>
			</button>
		</div>
	</div>
	{#if extended}
		<button on:click={() => (extended = !extended)} class="grid grid-cols-6 gap-2">
			{#each deck.cards.actions as card}
				<div>
					<img src="/cards/{card.id}.webp" alt={card.name} />
				</div>
			{/each}
		</button>
	{/if}
</div>
