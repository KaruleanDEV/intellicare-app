<script lang="ts">
  import type { Snippet } from "svelte";
  import type { LayoutData } from "./$types";
  import CircleUser from "@lucide/svelte/icons/circle-user";
  import Menu from "@lucide/svelte/icons/menu";
  import Activity from "@lucide/svelte/icons/activity";
  import Search from "@lucide/svelte/icons/search";
  import { Button } from "$lib/components/ui/button/index.js";
  import * as DropdownMenu from "$lib/components/ui/dropdown-menu/index.js";
  import { Input } from "$lib/components/ui/input/index.js";
  import * as Sheet from "$lib/components/ui/sheet/index.js";
  import { page } from "$app/stores";
  import { ModeWatcher, toggleMode } from "mode-watcher";
  import Sun from "@lucide/svelte/icons/sun";
  import Moon from "@lucide/svelte/icons/moon";
  import * as Avatar from "$lib/components/ui/avatar";

  let { data, children }: { data: LayoutData; children: Snippet } = $props();

  // Navigation TAB
  const links = [
    { href: "/private/dashboard", label: "Dashboard" },
    { href: "/private/records", label: "Records" },
    { href: "/private/ai", label: "AI" },
    { href: "/private/analytics", label: "Analytics" },
    { href: "/private/administration", label: "Administration" },
  ];
  const currentRoute = $derived($page.url.pathname);

  // handle user logout & redirect to login page
  async function logout() {
    const { error } = await data.supabase.auth.signOut();
    if (error) {
      console.error("Error logging out:", error.message);
    } else {
      window.location.href = "/login";
    }
  }

  // upload profile picture
  async function handleProfilePictureChange() {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.style.display = "none";
    input.onchange = async (e) => {
      const target = e.target as HTMLInputElement;
      const file = target?.files?.[0];
      console.log("File selected:", file);
      if (file) {
        // Create FormData
        const formData = new FormData();
        formData.append("profilePicture", file);
        try {
          const response = await fetch("/private/api/uploadprofile", {
            method: "POST",
            body: formData,
          });
          if (response.ok) {
            console.log("Profile picture uploaded successfully via API");
            window.location.reload(); // Reload the page
          } else {
            const errorData = await response.json();
            console.error(
              "Error uploading profile picture:",
              errorData.message || "Unknown error"
            );
            alert(
              `Failed to upload picture: ${errorData.message || "Unknown error"}`
            );
          }
        } catch (error) {
          console.error("Network or unexpected error:", error);
          alert("An unexpected error occurred during upload.");
        }
      }
    };

    document.body.appendChild(input);
    input.click();
    // Clean up the input element after use
    document.body.removeChild(input);
  }
</script>

<div class="flex min-h-screen w-full flex-col">
  <header
    class="bg-background sticky top-0 flex h-16 items-center gap-4 border-b px-4 md:px-6"
  >
    <nav
      class="hidden flex-col gap-6 text-lg font-medium md:flex md:flex-row md:items-center md:gap-5 md:text-sm lg:gap-6"
    >
      <a
        href="/private"
        class="flex items-center gap-2 text-lg font-semibold md:text-base"
      >
        <Activity class="h-6 w-6" />
        <span class="sr-only">Intellicare System</span>
      </a>
      {#each links as link}
        <a
          href={link.href}
          class="{currentRoute === link.href
            ? 'text-foreground'
            : 'text-muted-foreground'} transition-colors hover:text-foreground"
        >
          {link.label}
        </a>
      {/each}
    </nav>
    <!-- DESKTOP LAYOUT -->
    <Sheet.Root>
      <Sheet.Trigger>
        {#snippet child({ props })}
          <Button
            {...props}
            variant="outline"
            size="icon"
            class="shrink-0 md:hidden"
          >
            <Menu class="h-5 w-5" />
            <span class="sr-only">Toggle navigation menu</span>
          </Button>
        {/snippet}
      </Sheet.Trigger>
      <Sheet.Content side="left">
        <nav class="grid gap-6 text-lg font-medium">
          <a href="##" class="flex items-center gap-2 text-lg font-semibold">
            <Activity class="h-6 w-6" />
            <span class="sr-only">Intellicare System</span>
          </a>
          {#each links as link}
            <a
              href={link.href}
              class="{currentRoute === link.href
                ? 'text-foreground'
                : 'text-muted-foreground'} transition-colors hover:text-foreground"
            >
              {link.label}
            </a>
          {/each}
        </nav>
      </Sheet.Content>
    </Sheet.Root>
    <div class="flex w-full items-center gap-4 md:ml-auto md:gap-2 lg:gap-4">
      <!-- SEARCH | Not sure what to do yet-->
      <form class="ml-auto flex-1 sm:flex-initial">
        <div class="relative">
          <Search
            class="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground"
          />
          <Input
            type="search"
            placeholder="Search..."
            class="pl-8 sm:w-[300px] md:w-[200px] lg:w-[300px]"
          />
        </div>
      </form>
      <!-- MOBILE LAYOUT -->
      <DropdownMenu.Root>
        <DropdownMenu.Trigger>
          <!-- LIGHT/DARK TOGGLE -->
          {#snippet child({ props })}
            <Button
              {...props}
              variant="secondary"
              size="icon"
              class="rounded-full"
            >
              <Avatar.Root>
                <Avatar.Image src={data.profileImageUrl} alt="avatars" />
                <Avatar.Fallback><CircleUser class="h-5 w-5" /></Avatar.Fallback
                >
              </Avatar.Root>
              <span class="sr-only">Toggle user menu</span>
            </Button>
          {/snippet}
        </DropdownMenu.Trigger>
        <Button onclick={toggleMode} variant="outline" size="icon">
          <Sun
            class="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0"
          />
          <Moon
            class="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100"
          />
          <span class="sr-only">Toggle theme</span>
        </Button>
        <DropdownMenu.Content align="end">
          <DropdownMenu.Label>My Account</DropdownMenu.Label>
          <DropdownMenu.Separator />
          <DropdownMenu.Item onclick={handleProfilePictureChange}>
            Change Picture
          </DropdownMenu.Item>
          <DropdownMenu.Item>Settings</DropdownMenu.Item>
          <DropdownMenu.Item>Support</DropdownMenu.Item>
          <DropdownMenu.Item onclick={logout}>Logout</DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Root>
    </div>
  </header>
  <ModeWatcher />
  <!-- PAGE SLOT -->
  {@render children()}
</div>
