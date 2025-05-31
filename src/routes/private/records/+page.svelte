<!-- records -->
<script lang="ts">
  import type { PageData } from "./$types";
  import * as Sheet from "$lib/components/ui/sheet/index.js";
  import { buttonVariants } from "$lib/components/ui/button/index.js";
  import { Input } from "$lib/components/ui/input/index.js";
  import { Label } from "$lib/components/ui/label/index.js";
  import * as Select from "$lib/components/ui/select/index.js";
  import SuperDebug, { superForm } from "sveltekit-superforms";
  import { toast } from "svelte-sonner";

  let { data }: { data: PageData } = $props();
  let isSheetOpen = $state(false);

  // Handle superform
  const {
    form,
    errors,
    enhance: superformEnchance,
    message,
  } = superForm(data.form, {
    dataType: "json",
    onResult({ result }) {
      if (result.type === "success") {
        toast.success("Patient added successfully!");
        isSheetOpen = false; // Close the sheet on success
      } else if (result.type === "error") {
        toast.error("Failed to add patient.");
      }
    },
  });

  //gender options || enforce server-side validation
  const genders = [
    { gender: "", label: "None" },
    { gender: "Male", label: "Male" },
    { gender: "Female", label: "Female" },
  ];

  const triggerContentGender = $derived(
    genders.find((f) => f.gender === $form.gender)?.label ?? "Select a gender"
  );
  //Nationality options || enforce server-side validation
  const nationalities = [
    { national: "", label: "None" },
    { national: "Malaysian", label: "Malaysian" },
    { national: "Singaporean", label: "Singaporean" },
    { national: "Other", label: "Other" },
  ];

  const triggerContentNationality = $derived(
    nationalities.find((f) => f.national === $form.nationality)?.label ??
      "Select Nationality"
  );
</script>

<main class="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
  <h1 class="scroll-m-20 text-2xl font-semibold tracking-tight">
    Patient Record Database
  </h1>
  <p class="text-sm text-muted-foreground">
    Found {data.records.length} records in database
  </p>
  <!-- START SECTION | Only Staff Should See -->
  <div class="flex justify-end gap-4">
    <Sheet.Root bind:open={isSheetOpen}>
      <Sheet.Trigger class="{buttonVariants({ variant: 'default' })} w-50"
        >+ Add Patient</Sheet.Trigger
      >
      <Sheet.Content side="right">
        <form method="POST" action="?/addPatient" use:superformEnchance class="flex flex-col h-full">
          <Sheet.Header>
            <Sheet.Title>Add Patients</Sheet.Title>
            <Sheet.Description>
              Register new patients to the system
            </Sheet.Description>
          </Sheet.Header>
          <div class="grid flex-1 auto-rows-min gap-6 px-4">
            <div class="grid gap-3">
              <Label for="first_name" class="text-right">First Name</Label>
              <Input
                type="text"
                id="first_name"
                name="first_name"
                bind:value={$form.first_name}
              />
              {#if $errors.first_name}
                <p class="text-red-500 text-sm">{$errors.first_name}</p>
              {/if}
            </div>
            <div class="grid gap-3">
              <Label for="last_name" class="text-right">Last Name</Label>
              <Input
                type="text"
                id="last_name"
                name="last_name"
                bind:value={$form.last_name}
              />
              {#if $errors.last_name}
                <p class="text-red-500 text-sm">{$errors.last_name}</p>
              {/if}
            </div>
            <div class="grid gap-3">
              <Label for="dob" class="text-right">Date Of Birth</Label>
              <input
                type="date"
                id="dob"
                name="date_of_birth"
                bind:value={$form.date_of_birth}
              />
              {#if $errors.date_of_birth}
                <p class="text-red-500 text-sm">{$errors.date_of_birth}</p>
              {/if}
            </div>
            <div class="grid gap-3">
              <Label for="Gender" class="text-right">Gender</Label>
              <Select.Root
                type="single"
                name="gender"
                bind:value={$form.gender}
                onValueChange={(v) => {
                  $form.gender = v as "Male" | "Female" | "Other";
                }}
              >
                <Select.Trigger class="w-[180px]">
                  {triggerContentGender}
                </Select.Trigger>
                <Select.Content>
                  <Select.Group>
                    <Select.Label>Genders</Select.Label>
                    {#each genders as gender (gender.gender)}
                      <Select.Item
                        value={gender.gender}
                        label={gender.label}
                        disabled={gender.gender === "Other" ||
                          gender.gender === ""}
                      >
                        {gender.label}
                      </Select.Item>
                    {/each}
                  </Select.Group>
                </Select.Content>
              </Select.Root>
              {#if $errors.gender}
                <p class="text-red-500 text-sm">{$errors.gender}</p>
              {/if}
            </div>
            <div class="grid gap-3">
              <Label for="nationalities" class="text-right">Nationality</Label>
              <Select.Root
                type="single"
                name="nationality"
                bind:value={$form.nationality}
                onValueChange={(v) => {
                  $form.nationality = v as
                    | "Malaysian"
                    | "Singaporean"
                    | "Other";
                }}
              >
                <Select.Trigger class="w-[180px]">
                  {triggerContentNationality}
                </Select.Trigger>
                <Select.Content>
                  <Select.Group>
                    <Select.Label>Nationality</Select.Label>
                    {#each nationalities as national (national.national)}
                      <Select.Item
                        value={national.national}
                        label={national.label}
                        disabled={national.national === ""}
                      >
                        {national.label}
                      </Select.Item>
                    {/each}
                  </Select.Group>
                </Select.Content>
                {#if $errors.nationality}
                  <p class="text-red-500 text-sm">{$errors.nationality}</p>
                {/if}
              </Select.Root>
            </div>
          </div>
          <Sheet.Footer>
            <button
              type="submit"
              class={buttonVariants({ variant: "outline" })}
            >
              Submit
            </button>
            <Sheet.Close class={buttonVariants({ variant: "destructive" })}
              >Cancel</Sheet.Close
            >
          </Sheet.Footer>
        </form>
      </Sheet.Content>
    </Sheet.Root>
  </div>
  <!-- END SECTION | ONLY STAFF SHOULD SEE -->
  <hr class="border-t border-gray-200" />
  <div class="relative w-full overflow-auto">
    <table class="w-full caption-bottom text-sm">
      <thead>
        <tr>
          <th
            class="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0"
          >
            ID
          </th>
          <th
            class="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0"
          >
            Name
          </th> 
          <th
            class="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0"
          >
            Date of Birth
          </th>
          <th
            class="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0"
          >
            Gender
          </th>
          <th
            class="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0"
          >
            Nationality
          </th>
        </tr>
      </thead>
      <tbody class="[&_tr:last-child]:border-0">
        {#each data.records as record}
          <tr
            class="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
          >
            <td class="p-4 align-middle [&:has([role=checkbox])]:pr-0"
              >{record.id}</td
            >
            <td class="p-4 align-middle [&:has([role=checkbox])]:pr-0"
              >{record.first_name} {record.last_name}</td
            >
            <td class="p-4 align-middle [&:has([role=checkbox])]:pr-0"
              >{record.date_of_birth}</td
            >
            <td class="p-4 align-middle [&:has([role=checkbox])]:pr-0"
              >{record.gender}</td
            >
            <td class="p-4 align-middle [&:has([role=checkbox])]:pr-0"
              >{record.nationality}</td
            >
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
</main>
