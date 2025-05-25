<!-- records -->
<script lang="ts">
  import type { PageData } from "./$types";
  import { Button } from "$lib/components/ui/button/index.js";
  import * as Sheet from "$lib/components/ui/sheet/index.js";
  import { buttonVariants } from "$lib/components/ui/button/index.js";
  import { Input } from "$lib/components/ui/input/index.js";
  import { Label } from "$lib/components/ui/label/index.js";
  import { Calendar as CalendarPrimitive } from "bits-ui";
  import {
    DateFormatter,
    getLocalTimeZone,
    today,
    type DateValue,
  } from "@internationalized/date";
  import * as Calendar from "$lib/components/ui/calendar/index.js";
  import * as Select from "$lib/components/ui/select/index.js";
  import { cn } from "$lib/utils.js";

  let value = $state<DateValue>();
  let placeholder = $state<DateValue>();

  const currentDate = today(getLocalTimeZone());

  const monthFmt = new DateFormatter("en-US", {
    month: "long",
  });

  const monthOptions = Array.from({ length: 12 }, (_, i) => {
    const month = currentDate.set({ month: i + 1 });
    return {
      value: month.month,
      label: monthFmt.format(month.toDate(getLocalTimeZone())),
    };
  });

  const yearOptions = Array.from({ length: 100 }, (_, i) => ({
    label: String(new Date().getFullYear() - i),
    value: new Date().getFullYear() - i,
  }));

  const defaultYear = $derived(
    placeholder
      ? { value: placeholder.year, label: String(placeholder.year) }
      : undefined
  );

  const defaultMonth = $derived(
    placeholder
      ? {
          value: placeholder.month,
          label: monthFmt.format(placeholder.toDate(getLocalTimeZone())),
        }
      : undefined
  );

  const monthLabel = $derived(
    monthOptions.find((m) => m.value === defaultMonth?.value)?.label ??
      "Select a month"
  );

  let { data }: { data: PageData } = $props();
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
    <Sheet.Root>
      <Sheet.Trigger class="{buttonVariants({ variant: 'default' })} w-50"
        >+ Add Patient</Sheet.Trigger
      >
      <Sheet.Content side="right">
        <Sheet.Header>
          <Sheet.Title>Add Patients</Sheet.Title>
          <Sheet.Description>
            Register new patients to the system
          </Sheet.Description>
        </Sheet.Header>
        <div class="grid flex-1 auto-rows-min gap-6 px-4">
          <div class="grid gap-3">
            <Label for="first_name" class="text-right">First Name</Label>
            <Input id="first_name" value="" />
          </div>
          <div class="grid gap-3">
            <Label for="last_name" class="text-right">Last Name</Label>
            <Input id="last_name" value="" />
          </div>
          <div class="grid gap-3">
            <Label for="dob" class="text-right">Date Of Birth</Label>
            <CalendarPrimitive.Root
              type="single"
              weekdayFormat="short"
              class={cn("rounded-md border p-3")}
              bind:value
              bind:placeholder
            >
              {#snippet children({ months, weekdays })}
                <Calendar.Header
                  class="flex w-full items-center justify-between gap-2"
                >
                  <Select.Root
                    type="single"
                    value={`${defaultMonth?.value}`}
                    onValueChange={(v) => {
                      if (!placeholder) return;
                      if (v === `${placeholder.month}`) return;
                      placeholder = placeholder.set({
                        month: Number.parseInt(v),
                      });
                    }}
                  >
                    <Select.Trigger aria-label="Select month" class="w-[60%]">
                      {monthLabel}
                    </Select.Trigger>
                    <Select.Content class="max-h-[200px] overflow-y-auto">
                      {#each monthOptions as { value, label } (value)}
                        <Select.Item value={`${value}`} {label} />
                      {/each}
                    </Select.Content>
                  </Select.Root>
                  <Select.Root
                    type="single"
                    value={`${defaultYear?.value}`}
                    onValueChange={(v) => {
                      if (!v || !placeholder) return;
                      if (v === `${placeholder?.year}`) return;
                      placeholder = placeholder.set({
                        year: Number.parseInt(v),
                      });
                    }}
                  >
                    <Select.Trigger aria-label="Select year" class="w-[40%]">
                      {defaultYear?.label ?? "Select year"}
                    </Select.Trigger>
                    <Select.Content class="max-h-[200px] overflow-y-auto">
                      {#each yearOptions as { value, label } (value)}
                        <Select.Item value={`${value}`} {label} />
                      {/each}
                    </Select.Content>
                  </Select.Root>
                </Calendar.Header>
                <Calendar.Months>
                  {#each months as month (month)}
                    <Calendar.Grid>
                      <Calendar.GridHead>
                        <Calendar.GridRow class="flex">
                          {#each weekdays as weekday (weekday)}
                            <Calendar.HeadCell>
                              {weekday.slice(0, 2)}
                            </Calendar.HeadCell>
                          {/each}
                        </Calendar.GridRow>
                      </Calendar.GridHead>
                      <Calendar.GridBody>
                        {#each month.weeks as weekDates (weekDates)}
                          <Calendar.GridRow class="mt-2 w-full">
                            {#each weekDates as date (date)}
                              <Calendar.Cell
                                class="select-none"
                                {date}
                                month={month.value}
                              >
                                <Calendar.Day />
                              </Calendar.Cell>
                            {/each}
                          </Calendar.GridRow>
                        {/each}
                      </Calendar.GridBody>
                    </Calendar.Grid>
                  {/each}
                </Calendar.Months>
              {/snippet}
            </CalendarPrimitive.Root>
          </div>
          <div class="grid gap-3">
            <Label for="Gender" class="text-right">Gender</Label>
            <Input id="Gender" value="dropdownmenu" />
          </div>
          <div class="grid gap-3">
            <Label for="username" class="text-right">Ethnicity</Label>
            <Input id="username" value="ETH" />
          </div>
        </div>
        <Sheet.Footer>
          <Sheet.Close class={buttonVariants({ variant: "outline" })}
            >Save changes</Sheet.Close
          >
        </Sheet.Footer>
      </Sheet.Content>
    </Sheet.Root>
  </div>
  <!-- END SECTION | ONLY STAFF SHOULD SEE -->
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
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
</main>
