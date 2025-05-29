<script lang="ts">
  import { Button } from '$lib/components/ui/button';
  import { Input } from '$lib/components/ui/input';
  import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
  import { ScrollArea } from '$lib/components/ui/scroll-area';
  import { Separator } from '$lib/components/ui/separator';
  import type { PageData } from "./$types";

  let userInput = $state('');
  // Simplified chatMessages structure to align with agent's direct output
  let chatMessages = $state<Array<{ role: 'user' | 'assistant'; content: string }>>([]);
  let isLoading = $state(false);
  let { data }: { data: PageData } = $props(); // If you're still using PageData for something

  // Automatically detect user's timezone and current time
  let userTimeZone: string;
  let userCurrentTime: string;

  // Automatically detect user's timezone and current time
  // This block runs once when the component is initialized
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

    const currentUserInput = userInput; // Capture current input
    userInput = ''; // Clear input immediately
    isLoading = true;

    // Add user's message to chat history
    chatMessages = [...chatMessages, { role: 'user', content: currentUserInput }];

    try {
      // Prepare chat history for the agent.
      // The system prompt is added by the backend, so we only send user/assistant messages.
      const serializedChatHistory = chatMessages.map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      const requestPayload = {
        message: currentUserInput, // The user's current message
        chatHistory: serializedChatHistory,
        userTimeZone: userTimeZone, // Send user's detected timezone
        userCurrentTime: userCurrentTime, // Send user's detected current time
      };

      const response = await fetch("/private/api/agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestPayload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to get response from AI agent.');
      }

      // The agent API returns a single JSON object, not a stream.
      const responseData = await response.json();

      if (responseData.message) {
        // Add the agent's direct message to chat history
        chatMessages = [...chatMessages, { role: 'assistant', content: responseData.message }];
      } else if (responseData.error) {
        // Handle errors returned by the agent
        chatMessages = [...chatMessages, { role: 'assistant', content: `Error from agent: ${responseData.error}` }];
      } else {
        // Fallback for unexpected response structure
        chatMessages = [...chatMessages, { role: 'assistant', content: 'Received an unexpected response from the AI.' }];
      }

      // After a successful exchange, optionally update chatHistory with the backend's full history
      // This is crucial if the backend's chatHistory array includes internal tool calls
      // that you might not want to display directly to the user but need for the LLM context.
      // If you only want to display user-facing messages, filter responseData.chatHistory
      // or stick to updating `chatMessages` with `responseData.message` as above.
      // For this example, we'll keep it simple and just add the assistant's final reply.

    } catch (error: any) {
      console.error('Error sending message:', error);
      chatMessages = [...chatMessages, { role: 'assistant', content: `Error: ${error.message}` }];
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