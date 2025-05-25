<!-- LOGIN PAGE -->

<script lang="ts">
	import { Button } from "$lib/components/ui/button/index.js";
	import { Input } from "$lib/components/ui/input/index.js";
	import { Label } from "$lib/components/ui/label/index.js";
</script>

<div class="w-full lg:grid lg:min-h-[600px] lg:grid-cols-2 xl:min-h-[800px]">
	<div class="flex items-center justify-center py-12">
		<div class="mx-auto grid w-[350px] gap-6">
			<div class="grid gap-2 text-center">
				<h1 class="text-3xl font-bold">Login</h1>
				<p class="text-muted-foreground text-balance">
					Enter your email below to login to your account
				</p>
			</div>
			<form method="POST" action="/auth/?/login" class="grid gap-4">
				<div class="grid gap-2">
					<Label for="email">Email</Label>
					<Input id="email" name="email" type="email" placeholder="users@intellicare.com" required />
				</div>
				<div class="grid gap-2">
					<div class="flex items-center">
						<Label for="password">Password</Label>
					</div>
					<Input id="password" name="password" type="password" required />
					<a href="##" class="ml-auto inline-block text-sm underline"> Forgot your password? </a>
				</div>
				<Button type="submit" class="w-full">Login</Button>
				<Button formaction="auth/?/signup" variant="outline" class="w-full">Login with Google</Button>
			</form>
			<div class="mt-1 text-center">
				<a href="/" class="text-sm underline">Back to Home</a>
			</div>
		</div>
	</div>
	<div class="bg-muted hidden h-screen lg:block">
		<img
			src="\loginwp_02.png"
			alt="wallpaper"
			class="h-full w-full object-cover block dark:brightness-[0.2] dark:grayscale"
		/>
	</div>	
</div>
