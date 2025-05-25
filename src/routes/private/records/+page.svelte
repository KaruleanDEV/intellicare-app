<!-- records -->
<script lang="ts">
	import type { PageData } from './$types';
	let { data }: { data: PageData } = $props();
</script>

<main class="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
	<h1 class="scroll-m-20 text-2xl font-semibold tracking-tight">Patient Record Database</h1>
	<p class="text-sm text-muted-foreground">Found {data.records.length} records in database</p>
	<div class="relative w-full overflow-auto">
		<table class="w-full caption-bottom text-sm">
			<thead>
				<tr>
					<th class="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0">
						ID
					</th>
					<th class="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0">
						Name
					</th>
					<th class="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0">
						Date of Birth
					</th>
					<th class="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0">
						Gender
					</th>
				</tr>
			</thead>
			<tbody class="[&_tr:last-child]:border-0">
				{#each data.records as record}
					<tr class="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
						<td class="p-4 align-middle [&:has([role=checkbox])]:pr-0">{record.id}</td>
						<td class="p-4 align-middle [&:has([role=checkbox])]:pr-0">{record.first_name} {record.last_name}</td>
						<td class="p-4 align-middle [&:has([role=checkbox])]:pr-0">{record.date_of_birth}</td>
						<td class="p-4 align-middle [&:has([role=checkbox])]:pr-0">{record.gender}</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
</main>
