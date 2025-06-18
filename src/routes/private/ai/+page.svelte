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
  import { marked } from "marked"; // Import marked

  let userInput = $state("");
  let chatMessages = $state<
    Array<{
      role: "user" | "assistant";
      content: string;
      thinkingProcess?: { step: string; details: any }[];
    }>
  >([]);
  let isLoading = $state(false);
  let isUploading = $state(false); // New state for file upload
  let selectedFile: File | null = $state(null); // New state for selected file
  let uploadMessage = $state(""); // New state for upload feedback

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

      const response = await fetch("http://192.168.3.56:5678/webhook/d866b9fc-779b-40d7-901a-ea5f3c41114f", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chatInput: currentUserInput }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || "Failed to get response from AI agent."
        );
      }

      const responseData = await response.json();

      let assistantContent = responseData.output || "";
      let thinkingProcess = responseData.thinkingProcess || [];

      // Extract content within <think> tags and clean the main content
      const thinkRegex = /<think>(.*?)<\/think>/gs;
      let match;
      while ((match = thinkRegex.exec(assistantContent)) !== null) {
        thinkingProcess.push({ step: "Thought", details: match[1].trim() });
      }
      assistantContent = assistantContent.replace(thinkRegex, "").trim();


      if (assistantContent || thinkingProcess.length > 0) {
        chatMessages = [
          ...chatMessages,
          {
            role: "assistant",
            content: assistantContent,
            thinkingProcess: thinkingProcess,
          },
        ];
      } else if (responseData.error) {
        chatMessages = [
          ...chatMessages,
          {
            role: "assistant",
            content: `Error from agent: ${responseData.error}`,
            thinkingProcess: responseData.thinkingProcess,
          },
        ];
      } else {
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

  async function handleFileUpload() {
    if (!selectedFile) {
      uploadMessage = "Please select a file to upload.";
      return;
    }

    isUploading = true;
    uploadMessage = "Uploading...";

    const formData = new FormData();
    formData.append("document", selectedFile);

    try {
      // Replace with your actual backend upload endpoint
      const response = await fetch("http://localhost:5678/webhook/28a7827d-72cc-494d-9532-1c42efa8af32", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to upload document.");
      }

      const responseData = await response.json();
      uploadMessage = responseData.message || "Document uploaded successfully!";
      selectedFile = null; // Clear selected file after successful upload
    } catch (error: any) {
      console.error("Error uploading document:", error);
      uploadMessage = `Upload Error: ${error.message}`;
    } finally {
      isUploading = false;
    }
  }

  function handleFileSelection(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      selectedFile = input.files[0];
    } else {
      selectedFile = null;
    }
  }
</script>

<main class="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8 overflow-hidden">
  <div class="container mx-auto max-w-3xl flex flex-col h-90%">
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
                  {@html marked(message.content || "")}
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
          <div class="flex flex-col gap-2">
            <!--
            <h3 class="text-lg font-semibold">Upload Document</h3>
            <div class="flex gap-2">
              <Input
                type="file"
                onchange={handleFileSelection}
                disabled={isUploading}
                class="flex-grow"
              />
              <Button onclick={handleFileUpload} disabled={isUploading}>
                {isUploading ? "Uploading..." : "Upload Document"}
              </Button>
            </div>
          -->
            {#if uploadMessage}
              <p class="text-sm {uploadMessage.startsWith('Error') ? 'text-red-500' : 'text-green-500'}">
                {uploadMessage}
              </p>
            {/if}
          </div>
          <form onsubmit={sendMessage} class="flex gap-2">
            <Input
              type="text"
              bind:value={userInput}
              placeholder="Type your request..."
              disabled={isLoading || isUploading}
              class="flex-grow"
            />
            <Button type="submit" disabled={isLoading || isUploading}>Send</Button>
          </form>
        </div>
      </CardContent>
    </Card>
  </div>
</main>