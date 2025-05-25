<!-- dashboard -->
<script lang="ts">
  import type { PageData } from "./$types";
  import * as Card from "$lib/components/ui/card/index.js";
  import CreditCard from "@lucide/svelte/icons/credit-card";
  import DiamondPlus from "@lucide/svelte/icons/diamond-plus";
  import Activity from "@lucide/svelte/icons/activity";
  import Users from "@lucide/svelte/icons/users";
  import { onMount } from "svelte";
  import { marked } from "marked";
  import { browser } from "$app/environment";

  let { data }: { data: PageData } = $props();
  
  const now = new Date();
  let localdatetime = $state(
    now.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  );
  let localtime = $state(
    new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    })
  );

  let username: string | null = $state(null);
  let aiResponse: string = $state("Loading AI Summary...");
  let isLoadingAI: boolean = $state(false);

  // AI settings from client
  let selectedModel: string = $state("gemma3:12b");
  let useStreaming: boolean = $state(true);

  async function fetchAIResponse() {
    if (!browser || isLoadingAI) return;

    isLoadingAI = true;
    aiResponse = ""; // Clear if applicable

    //AI prompt on client side - NOTE: Should be moved to server side
    interface PatientRecord {
      first_name: string;
      last_name: string;
      // id: string;
      // admitted_date: string;
      // status: string;
    }
    const aiPrompt = `
			You are a Hospital Management AI. Your primary task is to generate a professional, justified summary of the hospital's current status based on the provided data. The summary must be presented using Markdown and offer helpful suggestions and insights. You are strictly to respond with only the summary; do not ask follow-up questions or offer further assistance.

			Given Information:
			User: ${username || "Users"}
			Current date: ${localdatetime}
			Current time: ${localtime}
			Total patients: ${data.records.length}
			Recently admitted patients: ${
        (data.records as PatientRecord[])
          .slice(0, 5)
          .map((record) => `${record.first_name} ${record.last_name}`)
          .join(", ") || "None"
      }
`;

    try {
      // 1. Prepare data to send to your SvelteKit API
      const requestPayload = {
        prompt: aiPrompt,
        model: selectedModel,
        stream: useStreaming,
      };

      // 2. SvelteKit API endpoint llm-ai
      const response = await fetch("/private/api/llm-ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestPayload),
      });

      if (!response.body) {
        aiResponse = "No response body from server.";
        isLoadingAI = false;
        return;
      }

      if (!response.ok) {
        const errorData = await response.json();
        aiResponse = `Error from server: ${errorData.message || "Unknown error"}`;
        isLoadingAI = false;
        return;
      }

      // 3. Handle streaming or non-streaming response
      if (useStreaming) {
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let done = false;
        let buffer = "";

        while (!done) {
          const { value, done: doneReading } = await reader.read();
          done = doneReading;
          if (value) {
            const chunk = decoder.decode(value, { stream: true });
            buffer += chunk;

            let lines = buffer.split("\n");
            buffer = lines.pop() ?? "";

            for (const line of lines) {
              if (!line.trim()) continue;
              try {
                const data = JSON.parse(line);
                if (data.chunk) {
                  aiResponse += data.chunk; // Append directly
                }
              } catch (e) {
                console.warn(
                  "Client: JSON parse error in stream line:",
                  line,
                  e
                );
              }
            }
          }
        }
      } else {
        const result = await response.json();
        aiResponse = result.aiResponse;
      }

      aiResponse = aiResponse.trim() || "No response from AI.";
    } catch (error) {
      console.error(
        "Client: Failed to fetch AI summary from SvelteKit API:",
        error
      );
      aiResponse = "Failed to fetch AI summary.";
    } finally {
      isLoadingAI = false;
    }
  }

  onMount(async () => {
    const { data: userData, error: userError } =
      await data.supabase.auth.getUser();
    if (userError) {
      console.error("Error fetching user data:", userError);
      aiResponse = "Error fetching user data.";
      return;
    }
    if (userData) {
      username = userData.user?.user_metadata?.display_name ?? null;
      if (username) {
        await fetchAIResponse();
      } else {
        aiResponse = "User not logged in or display name not found.";
      }
    } else {
      username = null;
      aiResponse = "No active session found.";
    }
  });
</script>

<main class="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
  <Card.Root>
    <Card.Header class="flex flex-row items-center justify-between pb-2">
      <Card.Title class="text-xl font-medium">Welcome, {username}.</Card.Title>
    </Card.Header>
    <Card.Content class="pt-0">
      <p class="text-2x1 text-muted-foreground">
        Today is {localdatetime}.
      </p>
    </Card.Content>
  </Card.Root>
  <div class="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
    <Card.Root>
      <Card.Header
        class="flex flex-row items-center justify-between space-y-0 pb-2"
      >
        <Card.Title class="text-sm font-medium">Total Patients</Card.Title>
        <DiamondPlus class="h-4 w-4 text-muted-foreground" />
      </Card.Header>
      <Card.Content>
        <div class="text-2xl font-bold">{data.records.length}</div>
        <p class="text-xs text-muted-foreground">
          {#if data.records.length > 0}
            {((data.records.length - 0) /
              (data.records.length > 0 ? data.records.length : 1)) *
              100}% from last month
          {:else}
            0% from last month
          {/if}
        </p>
      </Card.Content>
    </Card.Root>
    <Card.Root>
      <Card.Header
        class="flex flex-row items-center justify-between space-y-0 pb-2"
      >
        <Card.Title class="text-sm font-medium">ICU patients</Card.Title>
        <Users class="h-4 w-4 text-muted-foreground" />
      </Card.Header>
      <Card.Content>
        <div class="text-2xl font-bold">0</div>
        <p class="text-xs text-muted-foreground">+100% from last month</p>
      </Card.Content>
    </Card.Root>
    <Card.Root>
      <Card.Header
        class="flex flex-row items-center justify-between space-y-0 pb-2"
      >
        <Card.Title class="text-sm font-medium">Discharged</Card.Title>
        <CreditCard class="h-4 w-4 text-muted-foreground" />
      </Card.Header>
      <Card.Content>
        <div class="text-2xl font-bold">0</div>
        <p class="text-xs text-muted-foreground">+0% from last month</p>
      </Card.Content>
    </Card.Root>
    <Card.Root>
      <Card.Header
        class="flex flex-row items-center justify-between space-y-0 pb-2"
      >
        <Card.Title class="text-sm font-medium">Critical cases</Card.Title>
        <Activity class="h-4 w-4 text-muted-foreground" />
      </Card.Header>
      <Card.Content>
        <div class="text-2xl font-bold">0</div>
        <p class="text-xs text-muted-foreground">+0 since last hour</p>
      </Card.Content>
    </Card.Root>
  </div>
  <div class="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-2">
    <Card.Root>
      <Card.Header>
        <Card.Title class="text-lg font-medium">Summary</Card.Title>
      </Card.Header>
      <Card.Content>
        <!-- Render Markdown | Might need to be sanitize/rework |  -->
        {#if aiResponse}
          {@html marked.parse(aiResponse)}
        {:else if isLoadingAI}
          <p>Compiling the summary for you.</p>
        {:else}
          <p>No AI summary available.</p>
        {/if}
      </Card.Content>
    </Card.Root>
    <Card.Root>
      <Card.Header
        class="flex flex-row items-center justify-between space-y-0 pb-2"
      >
        <Card.Title class="text-sm font-medium"
          >Recently Admitted Patients</Card.Title
        >
        <Users class="h-4 w-4 text-muted-foreground" />
      </Card.Header>
      <Card.Content>
        {#if data.records.length > 0}
          <ul class="list-disc list-inside">
            {#each data.records.slice(0, 10) as record (record.id)}
              <li
                class="flex justify-between items-center py-2 border-b last:border-b-0"
              >
                <span>{record.first_name} {record.last_name}</span>
                <span class="text-sm text-gray-500"
                  >{new Date(record.created_at).toLocaleDateString()}
                  {new Date(record.created_at).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: true,
                  })}</span
                >
              </li>
            {/each}
          </ul>
        {:else}
          <p class="text-gray-500">No recently admitted patients.</p>
        {/if}
      </Card.Content>
    </Card.Root>
  </div>
</main>
