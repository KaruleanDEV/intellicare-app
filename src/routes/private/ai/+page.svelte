<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import { Input } from "$lib/components/ui/input";
  import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
  } from "$lib/components/ui/card";
  import { ScrollArea } from "$lib/components/ui/scroll-area";
  import { Separator } from "$lib/components/ui/separator";
  import type { PageData } from "./$types";

  let userInput = $state("");
  let chatMessages = $state<
    Array<{
      role: "user" | "assistant";
      content: string;
      thinkingProcess?: { step: string; details: any }[];
    }>
  >([]);
  let isLoading = $state(false);
  let { data }: { data: PageData } = $props();

  // Automatically detect user's timezone and current time
  let userTimeZone: string;
  let userCurrentTime: string;

  userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  userCurrentTime = new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
    hour12: true,
    timeZone: userTimeZone,
  }).format(new Date());

  let scrollableDiv = $state<HTMLElement | null>(null);

  $effect(() => {
    if (scrollableDiv) {
      scrollableDiv.scrollTop = scrollableDiv.scrollHeight;
    }
  });

  async function sendMessage(event: SubmitEvent) {
    event.preventDefault();

    if (!userInput.trim()) {
      return;
    }

    const currentUserInput = userInput;
    userInput = "";
    isLoading = true;

    chatMessages = [
      ...chatMessages,
      { role: "user", content: currentUserInput },
    ];

    try {
      const serializedChatHistory = chatMessages.map((msg) => ({
        role: msg.role,
        content: msg.content,
      }));

      const requestPayload = {
        message: currentUserInput,
        chatHistory: serializedChatHistory,
        userTimeZone: userTimeZone,
        userCurrentTime: userCurrentTime,
      };

      const response = await fetch("/private/api/agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestPayload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || "Failed to get response from AI agent."
        );
      }

      const responseData = await response.json();

      if (responseData.message) {
        chatMessages = [
          ...chatMessages,
          {
            role: "assistant",
            content: responseData.message,
            thinkingProcess: responseData.thinkingProcess,
          },
        ];
      } else if (responseData.error) {
        // Handle errors returned by the agent
        chatMessages = [
          ...chatMessages,
          {
            role: "assistant",
            content: `Error from agent: ${responseData.error}`,
            thinkingProcess: responseData.thinkingProcess,
          },
        ];
      } else {
        // Fallback for unexpected response structure
        chatMessages = [
          ...chatMessages,
          {
            role: "assistant",
            content: "Received an unexpected response from the AI.",
            thinkingProcess: responseData.thinkingProcess,
          },
        ];
      }
    } catch (error: any) {
      console.error("Error sending message:", error);
      chatMessages = [
        ...chatMessages,
        { role: "assistant", content: `Error: ${error.message}` },
      ];
    } finally {
      isLoading = false;
    }
  }
</script>

<main class="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8 overflow-hidden">
  <div class="container mx-auto max-w-2xl flex flex-col h-full">
    <Card class="flex flex-col flex-grow overflow-hidden">
      <CardHeader>
        <CardTitle>Intellicare AI</CardTitle>
      </CardHeader>

      <CardContent class="flex flex-col flex-grow p-0 overflow-hidden">
        <ScrollArea class="flex-grow p-4">
          <div class="space-y-4" bind:this={scrollableDiv}>
            {#each chatMessages as message, i}
              <div
                class="flex {message.role === 'user'
                  ? 'justify-end'
                  : 'justify-start'}"
              >
                <div
                  class="max-w-[70%] rounded-lg p-3 text-sm {message.role ===
                  'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted'}"
                >
                  {message.content}
                </div>
              </div>

              {#if message.role === "assistant" && message.thinkingProcess && message.thinkingProcess.length > 0}
                <div class="flex justify-start">
                  <div
                    class="max-w-[70%] rounded-lg p-3 text-sm bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 mt-2"
                  >
                    <details>
                      <summary class="font-semibold cursor-pointer"
                        >Thinking Process</summary
                      >
                      <div class="mt-2 space-y-2 text-xs">
                        {#each message.thinkingProcess as step}
                          <div
                            class="p-1 rounded-sm bg-gray-50 dark:bg-gray-700"
                          >
                            <strong>{step.step}:</strong>
                            <pre
                              class="whitespace-pre-wrap break-words overflow-x-auto text-gray-700 dark:text-gray-300">
                              {JSON.stringify(step.details, null, 2)}
                            </pre>
                          </div>
                        {/each}
                      </div>
                    </details>
                  </div>
                </div>
              {/if}

              {#if i < chatMessages.length - 1}
                <Separator />
              {/if}
            {/each}
            {#if isLoading}
              <div class="flex justify-start">
                <div
                  class="max-w-[70%] rounded-lg p-3 text-sm bg-muted animate-pulse"
                >
                  Thinking...
                </div>
              </div>
            {/if}
          </div>
        </ScrollArea>

        <div class="p-4 border-t flex flex-col gap-4">
          <form onsubmit={sendMessage} class="flex gap-2">
            <Input
              type="text"
              bind:value={userInput}
              placeholder="Type your request..."
              disabled={isLoading}
              class="flex-grow"
            />
            <Button type="submit" disabled={isLoading}>Send</Button>
          </form>
        </div>
      </CardContent>
    </Card>
  </div>
</main>
