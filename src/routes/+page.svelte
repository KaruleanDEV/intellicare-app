<script>
	import { onMount } from 'svelte';

	let isScrolled = false;

	onMount(() => {
		const handleScroll = () => {
			isScrolled = window.scrollY > 0;
		};
		window.addEventListener('scroll', handleScroll);
		return () => {
			window.removeEventListener('scroll', handleScroll);
		};
	});

	// Animation on scroll
	onMount(() => {
		const revealElements = document.querySelectorAll('.reveal');
		const revealOnScroll = () => {
			revealElements.forEach((el) => {
				const rect = el.getBoundingClientRect();
				if (rect.top < window.innerHeight - 100) {
					el.classList.add('visible');
				} else {
					el.classList.remove('visible');
				}
			});
		};

		window.addEventListener('scroll', revealOnScroll);
		revealOnScroll(); // Initial check

		return () => {
			window.removeEventListener('scroll', revealOnScroll);
		};
	});
</script>


<!--NAVBAR-->
<nav
    class="fixed left-0 top-0 w-full transition-all duration-300"
    style="z-index: 1000; background-color: {isScrolled ? 'white' : 'transparent'};"
>
    <div
        class="container mx-auto flex items-center justify-between px-4 py-3"
        style="color: {isScrolled ? 'black' : 'white'};"
    >
        <a href="/" class="flex items-center text-xl font-semilight" style="color: inherit;">
            <img src="/logo.png" alt="Logo" class="mr-2 h-6 w-6" />
            Intellicare
        </a>
        <div class="flex space-x-6">
            <a href="/" class="transition hover:opacity-75" style="color: inherit;">Home</a>
			<!--UserSession-->
			<a href="/login" class="transition hover:opacity-75" style="color: inherit;" on:click={(event) => {
				event.preventDefault();
				window.location.href = '/login';
			}}>Login</a>
        </div>
    </div>
</nav>

<div class="min-h-screen bg-gray-50">
    <!-- HERO SECTION -->
    <section class="relative h-screen bg-cover bg-center flex items-center justify-center" style="background-image: url('/loginwp_02.png');">
        <div class="absolute inset-0 bg-black/50"></div>
        <div class="container relative z-10 mx-auto flex flex-col items-center justify-center px-4 py-20 text-center text-white">
            <h1 class="text-5xl font-bold">Transforming Healthcare Management</h1>
            <p class="mt-4 text-lg">
                Intellicare provides innovative solutions for efficient and secure healthcare operations.
            </p>
            <button
                class="mt-6 border-2 border-white-600 px-8 py-4 text-white-600 font-bold shadow hover:bg-black hover:text-white"
                on:click={() => {
                    const servicesElement = document.getElementById('services');
                    if (servicesElement) {
                        servicesElement.scrollIntoView({ behavior: 'smooth' });
                    }
                }}
            >
                Learn More
            </button>
            <div class="mt-6 animate-bounce">
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-8 w-8 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M19 9l-7 7-7-7"
                    />
                </svg>
            </div>
        </div>
    </section>

	<!-- SERVICES SECTION -->
	<section id="services" class="bg-gray-900 py-20">
		<div class="container mx-auto px-6 lg:px-20">
			<h2 class="text-center text-4xl font-extrabold text-white reveal">Our Services</h2>
			<p class="mt-6 text-center text-lg text-gray-300 reveal">
				Empowering healthcare organizations with cutting-edge solutions tailored to your needs.
			</p>
			<div class="mt-16 grid grid-cols-1 gap-12 md:grid-cols-3">
				<div class="rounded-lg bg-gray-800 p-8 text-center shadow-lg reveal hover:shadow-xl transition-shadow duration-300">
					<div class="mb-4 flex items-center justify-center h-16 w-16 mx-auto bg-blue-600 rounded-full">
						<svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 11c0-1.657-1.343-3-3-3s-3 1.343-3 3 1.343 3 3 3 3-1.343 3-3zm0 0c0 2.21-1.79 4-4 4H5c-1.105 0-2 .895-2 2v1h14v-1c0-1.105-.895-2-2-2h-3c-2.21 0-4-1.79-4-4z" />
						</svg>
					</div>
					<h3 class="text-2xl font-semibold text-white">Patient Management</h3>
					<p class="mt-4 text-gray-400">
						Streamline patient records, appointments, and communication with ease.
					</p>
				</div>
				<div class="rounded-lg bg-gray-800 p-8 text-center shadow-lg reveal hover:shadow-xl transition-shadow duration-300">
					<div class="mb-4 flex items-center justify-center h-16 w-16 mx-auto bg-green-600 rounded-full">
						<svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
						</svg>
					</div>
					<h3 class="text-2xl font-semibold text-white">AI-Enhanced Solutions</h3>
					<p class="mt-4 text-gray-400">
						Utilize AI-driven tools to enhance patient care and operational efficiency.
					</p>
				</div>
				<div class="rounded-lg bg-gray-800 p-8 text-center shadow-lg reveal hover:shadow-xl transition-shadow duration-300">
					<div class="mb-4 flex items-center justify-center h-16 w-16 mx-auto bg-purple-600 rounded-full">
						<svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 17l-5-5m0 0l5-5m-5 5h12" />
						</svg>
					</div>
					<h3 class="text-2xl font-semibold text-white">Advanced Analytics</h3>
					<p class="mt-4 text-gray-400">
						Leverage actionable insights to drive better decision-making.
					</p>
				</div>
			</div>
		</div>
	</section>
	<style>
		.reveal {
			opacity: 0;
			transform: translateY(30px);
			transition: opacity 0.6s ease, transform 0.6s ease;
		}
		.reveal.visible {
			opacity: 1;
			transform: translateY(0);
		}
	</style>

	<!-- Analytics SECTION -->
	<section class="py-16">
		<div class="container mx-auto px-4 text-center">
			<h2 class="text-3xl font-bold text-gray-800">Intellicare Analytics</h2>
			<div class="mt-12 grid grid-cols-1 gap-8 md:grid-cols-3">
				<div class="stats shadow bg-white">
					<div class="stat">
						<div class="stat-title">Total Users</div>
						<div class="stat-value text-blue-600">12.5K</div>
						<div class="stat-desc">↗︎ 15% this month</div>
					</div>
				</div>
				<div class="stats shadow bg-white">
					<div class="stat">
						<div class="stat-title">Active Sessions</div>
						<div class="stat-value text-green-600">3.2K</div>
						<div class="stat-desc">↗︎ 8% this week</div>
					</div>
				</div>
				<div class="stats shadow bg-white">
					<div class="stat">
						<div class="stat-title">Healthcare Providers</div>
						<div class="stat-value text-purple-600">1.8K</div>
						<div class="stat-desc">↗︎ 10% this quarter</div>
					</div>
				</div>
			</div>
			<div class="mt-12">
				<canvas id="analyticsChart" class="mx-auto"></canvas>
			</div>
		</div>
	</section>

	<!-- TOOLS SECTION -->
	<section class="py-16 text-white" style="background-color: rgba(21, 20, 23, 1);">
		<div class="container mx-auto px-6 lg:px-20 text-center">
			<h2 class="text-4xl font-extrabold text-gray-100">Our Technology Stack</h2>
			<p class="mt-4 text-lg text-gray-300">
				Empowering innovation with cutting-edge tools and frameworks.
			</p>
			<div class="mt-12 grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-4">
				<div class="flex flex-col items-center text-center bg-gray-800 rounded-lg p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
					<img src="/sveltekit-logo.png" alt="SvelteKit Logo" class="h-20 w-20 mb-6" />
					<h3 class="text-xl font-semibold text-white">SvelteKit</h3>
					<p class="mt-2 text-sm text-gray-400">
						A fast and reactive frontend framework for modern web applications.
					</p>
				</div>
				<div class="flex flex-col items-center text-center bg-gray-800 rounded-lg p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
					<img src="/supabase-logo.png" alt="Supabase Logo" class="h-20 w-20 mb-6" />
					<h3 class="text-xl font-semibold text-white">Supabase</h3>
					<p class="mt-2 text-sm text-gray-400">
						Open-source backend services and database management.
					</p>
				</div>
				<div class="flex flex-col items-center text-center bg-gray-800 rounded-lg p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
					<img src="/tailwindcss-logo.png" alt="TailwindCSS Logo" class="h-20 w-20 mb-6" />
					<h3 class="text-xl font-semibold text-white">TailwindCSS</h3>
					<p class="mt-2 text-sm text-gray-400">
						A utility-first CSS framework for responsive and modern UI design.
					</p>
				</div>
				<div class="flex flex-col items-center text-center bg-gray-800 rounded-lg p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
					<img src="/bun-logo.svg" alt="Bun Logo" class="h-20 w-20 mb-6" />
					<h3 class="text-xl font-semibold text-white">Bun</h3>
					<p class="mt-2 text-sm text-gray-400">
						A fast all-in-one JavaScript runtime for modern web development.
					</p>
				</div>
			</div>
		</div>
	</section>
	<!-- FOOTER -->
	<footer class="bg-gray-900 text-white py-8">
		<div class="container mx-auto px-4">
			<div class="flex flex-col md:flex-row justify-between items-center">
				<div class="mb-4 md:mb-0">
					<a href="/" class="text-xl font-bold text-white hover:text-gray-400">Intellicare</a>
					<p class="mt-2 text-sm text-gray-400">Empowering healthcare innovation @ MSU</p>
				</div>
				<div class="flex space-x-6">
					<a href="/" class="text-gray-400 hover:text-white">Privacy Policy</a>
					<a href="/" class="text-gray-400 hover:text-white">Terms of Service</a>
					<a href="/" class="text-gray-400 hover:text-white">Contact Us</a>
				</div>
			</div>
		</div>
	</footer>
</div>
