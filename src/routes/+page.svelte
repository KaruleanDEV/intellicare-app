<script lang="ts">
  import { onMount } from "svelte";
  import {
    BookText,
    AlertTriangle,
    Lightbulb,
    ChevronDown,
  } from "@lucide/svelte";

  let isScrolled = false;
  let currentImageIndex = 0;
  const images = ["/wallpaper/1.png", "/wallpaper/2.png", "/wallpaper/3.png"];

  onMount(() => {
    // Set currentImageIndex to a random value when the component mounts
    currentImageIndex = Math.floor(Math.random() * images.length);

    const handleScroll = () => {
      isScrolled = window.scrollY > 0;
    };
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  });

  // Animation on scroll
  onMount(() => {
    const revealElements = document.querySelectorAll(".reveal");
    const revealOnScroll = () => {
      revealElements.forEach((el) => {
        const rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight - 100) {
          el.classList.add("visible");
        } else {
          el.classList.remove("visible");
        }
      });
    };

    window.addEventListener("scroll", revealOnScroll);
    revealOnScroll(); // Initial check

    return () => {
      window.removeEventListener("scroll", revealOnScroll);
    };
  });
</script>

<nav
  class="fixed left-0 top-0 w-full transition-all duration-300 z-[1000] {isScrolled
    ? 'shadow-md'
    : ''}"
  style="background-color: {isScrolled ? 'white' : 'transparent'};"
>
  <div
    class="navbar container mx-auto px-4 py-3"
    style="color: {isScrolled ? 'black' : 'white'};"
  >
    <div class="navbar-start">
      <a
        href="/"
        class="flex items-center text-xl font-semibold"
        style="color: inherit;"
      >
        <img src="/logo.png" alt="Intellicare Logo" class="mr-2 h-7 w-7" />
        Intellicare
      </a>
    </div>
    <div class="navbar-end space-x-2">
      <a
        href="/"
        class="btn btn-ghost text-base font-normal"
        style="color: inherit;">Home</a
      >
      <a
        href="/login"
        class="btn btn-ghost text-base font-normal"
        style="color: inherit;">Login</a
      >
    </div>
  </div>
</nav>

<div class="min-h-screen bg-gray-50">
  <section
    class="relative h-screen bg-cover bg-center flex items-center justify-center"
    style="background-image: url('{images[currentImageIndex]}');"
  >
    <div class="absolute inset-0 bg-black/60"></div>
    <div
      class="container relative z-10 mx-auto flex flex-col items-center justify-center px-4 py-20 text-center text-white"
    >
      <h1 class="text-6xl md:text-7xl font-bold leading-tight">
        Transforming Healthcare Management
      </h1>
      <p class="mt-6 text-xl md:text-2xl max-w-2xl">
        Intellicare provides innovative solutions for efficient and secure
        healthcare operations.
      </p>
      <button
        class="mt-10 btn btn-lg btn-outline btn-info border-2 border-white text-white hover:bg-white hover:text-black transition duration-300"
        on:click={() => {
          const servicesElement = document.getElementById("background-section");
          if (servicesElement) {
            servicesElement.scrollIntoView({ behavior: "smooth" });
          }
        }}
      >
        Learn More
      </button>
      <div class="mt-10 animate-bounce">
        <ChevronDown class="h-10 w-10 text-white" />
      </div>
    </div>
  </section>

  <section
    id="background-section"
    class="bg-gradient-to-br from-blue-50 to-indigo-100 py-20"
  >
    <div class="container mx-auto px-6 lg:px-20">
      <h2
        class="text-center text-5xl font-extrabold text-gray-900 mb-16 reveal"
      >
        The Challenge in Healthcare Data
      </h2>

      <div
        class="mb-16 reveal card bg-white shadow-xl hover:shadow-2xl transition-shadow duration-300"
      >
        <div class="card-body p-8">
          <h3 class="text-3xl font-bold text-blue-800 mb-6 flex items-center">
            <BookText class="h-8 w-8 mr-3 text-blue-600" stroke-width="2" />
            Background
          </h3>
          <p class="text-lg text-gray-700 leading-relaxed">
            The healthcare industry is grappling with an overwhelming and
            ever-increasing volume of complex data. This data is often
            unstructured, originating from diverse sources such as medical
            images, clinical notes, sensor readings, and patient records. While
            traditional Database Management Systems (DBMS) excel at handling
            structured information, they are ill-equipped to manage the sheer
            complexity and variety inherent in modern healthcare datasets. This
            critical limitation has spurred significant interest in leveraging
            Artificial Intelligence (AI), including Machine Learning (ML) and
            Natural Language Processing (NLP), to revolutionize how healthcare
            data is analyzed, retrieved, and made accessible. The ultimate goal
            is to achieve more efficient operations, enhance decision-making,
            and deliver more accurate patient care.
          </p>
        </div>
      </div>

      <div
        class="mb-16 reveal card bg-white shadow-xl hover:shadow-2xl transition-shadow duration-300"
      >
        <div class="card-body p-8">
          <h3 class="text-3xl font-bold text-red-800 mb-6 flex items-center">
            <AlertTriangle class="h-8 w-8 mr-3 text-red-600" stroke-width="2" />
            Problem Statement
          </h3>
          <p class="text-lg text-gray-700 leading-relaxed">
            A core issue lies in the current state of healthcare DBMS, which
            often prove cumbersome and inefficient when faced with the vast,
            complex datasets characteristic of contemporary healthcare. This
            inefficiency directly hinders professionals from promptly accessing
            and effectively utilizing critical patient information, potentially
            leading to suboptimal decision-making and compromised patient
            outcomes. While AI integration holds immense promise, its adoption
            is frequently hampered by several perceived barriers: its inherent
            complexity, the requirement for specialized expertise, the
            substantial investment needed for implementation, and paramount
            concerns regarding data privacy and security, especially compliance
            with regulations like HIPAA, GDPR, and PDPA. Consequently, there is
            a significant unmet need for user-friendly AI solutions that can
            seamlessly integrate with existing healthcare systems and deliver
            tangible benefits without imposing an excessive burden on
            organizations.
          </p>
        </div>
      </div>

      <div
        class="reveal card bg-white shadow-xl hover:shadow-2xl transition-shadow duration-300"
      >
        <div class="card-body p-8">
          <h3 class="text-3xl font-bold text-green-800 mb-6 flex items-center">
            <Lightbulb class="h-8 w-8 mr-3 text-green-600" stroke-width="2" />
            Research Objectives (RO) & Research Questions (RQ)
          </h3>

          <h4 class="text-2xl font-semibold text-gray-800 mb-3">
            Research Objectives (RO):
          </h4>
          <ul
            class="list-disc list-inside text-lg text-gray-700 ml-4 mb-8 space-y-2"
          >
            <li>
              To explore how AI can be integrated into traditional healthcare
              DBMS to enhance their efficiency, usability, and accessibility,
              particularly for non-technical users.
            </li>
            <li>
              To investigate effective strategies for AI integration within
              healthcare DBMS, including the application of Large Language
              Models (LLMs) for natural language queries.
            </li>
            <li>
              To identify and propose solutions for overcoming barriers to AI
              integration in healthcare, such as high costs and perceived
              complexity.
            </li>
            <li>
              To develop a proof-of-concept demonstrating practical use cases
              and tangible benefits of AI-powered healthcare database systems.
            </li>
          </ul>

          <h4 class="text-2xl font-semibold text-gray-800 mb-3">
            Research Questions (RQ):
          </h4>
          <ul
            class="list-disc list-inside text-lg text-gray-700 ml-4 mb-8 space-y-2"
          >
            <li>
              How can AI-powered databases improve user experience and
              efficiency in data retrieval in healthcare?
            </li>
            <li>
              What are the challenges of integrating AI into traditional DBMS,
              and how can they be overcome?
            </li>
            <li>
              How can AI-powered database systems improve scalability,
              performance, and cost-effectiveness compared to traditional DBMS?
            </li>
          </ul>

          <h4 class="text-2xl font-semibold text-gray-800 mb-3">
            Methodology:
          </h4>
          <p class="text-lg text-gray-700 ml-4">
            The project will follow an <strong>Agile</strong> methodology, emphasizing
            iterative development, flexibility, and continuous feedback to adapt
            to evolving requirements and deliver effective solutions.
          </p>
        </div>
      </div>
    </div>
  </section>

  <section id="services" class="bg-gray-900 py-20">
    <div class="container mx-auto px-6 lg:px-20">
      <h2 class="text-center text-4xl font-extrabold text-white mb-6 reveal">
        Features
      </h2>
      <p class="mt-6 text-center text-lg text-gray-300 mb-12 reveal">
        Empowering healthcare organizations with cutting-edge solutions tailored
        to your needs.
      </p>
      <div class="mt-16 grid grid-cols-1 gap-12 md:grid-cols-3">
        <div
          class="card bg-gray-800 shadow-xl reveal hover:shadow-2xl transition-shadow duration-300 text-center"
        >
          <div class="card-body items-center p-8">
            <div
              class="mb-4 flex items-center justify-center h-16 w-16 mx-auto bg-blue-600 rounded-full"
            >
              <BookText class="h-8 w-8 text-white" />
            </div>
            <h3 class="text-2xl font-semibold text-white">
              Patient Management
            </h3>
            <p class="mt-4 text-gray-400">
              Streamline patient records, appointments, and communication with
              ease.
            </p>
          </div>
        </div>
        <div
          class="card bg-gray-800 shadow-xl reveal hover:shadow-2xl transition-shadow duration-300 text-center"
        >
          <div class="card-body items-center p-8">
            <div
              class="mb-4 flex items-center justify-center h-16 w-16 mx-auto bg-green-600 rounded-full"
            >
              <Lightbulb class="h-8 w-8 text-white" />
            </div>
            <h3 class="text-2xl font-semibold text-white">
              AI-Enhanced Solutions
            </h3>
            <p class="mt-4 text-gray-400">
              Utilize AI-driven tools to enhance patient care and operational
              efficiency.
            </p>
          </div>
        </div>
        <div
          class="card bg-gray-800 shadow-xl reveal hover:shadow-2xl transition-shadow duration-300 text-center"
        >
          <div class="card-body items-center p-8">
            <div
              class="mb-4 flex items-center justify-center h-16 w-16 mx-auto bg-purple-600 rounded-full"
            >
              <AlertTriangle class="h-8 w-8 text-white" />
            </div>
            <h3 class="text-2xl font-semibold text-white">
              Advanced Analytics
            </h3>
            <p class="mt-4 text-gray-400">
              Leverage actionable insights to drive better decision-making.
            </p>
          </div>
        </div>
      </div>
    </div>
  </section>
  <style>
    .reveal {
      opacity: 0;
      transform: translateY(30px);
      transition:
        opacity 0.6s ease,
        transform 0.6s ease;
    }
    .reveal.visible {
      opacity: 1;
      transform: translateY(0);
    }
    /* Removed custom text-shadow classes for a cleaner look */
  </style>

  <section
    class="py-16 text-white"
    style="background-color: rgba(21, 20, 23, 1);"
  >
    <div class="container mx-auto px-6 lg:px-20 text-center">
      <h2 class="text-4xl font-extrabold text-gray-100 reveal">
        Our Technology Stack
      </h2>
      <p class="mt-4 text-lg text-gray-300 reveal">
        Empowering innovation with cutting-edge tools and frameworks.
      </p>
      <div class="mt-12 grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-4">
        <div
          class="card bg-gray-800 shadow-xl hover:shadow-2xl transition-shadow duration-300"
        >
          <div class="card-body items-center p-6">
            <img
              src="/sveltekit-logo.png"
              alt="SvelteKit Logo"
              class="h-20 w-20 mb-6"
            />
            <h3 class="text-xl font-semibold text-white">SvelteKit</h3>
            <p class="mt-2 text-sm text-gray-400">
              A fast and reactive frontend framework for modern web
              applications.
            </p>
          </div>
        </div>
        <div
          class="card bg-gray-800 shadow-xl hover:shadow-2xl transition-shadow duration-300"
        >
          <div class="card-body items-center p-6">
            <img
              src="/supabase-logo.png"
              alt="Supabase Logo"
              class="h-20 w-20 mb-6"
            />
            <h3 class="text-xl font-semibold text-white">Supabase</h3>
            <p class="mt-2 text-sm text-gray-400">
              Open-source backend services and database management.
            </p>
          </div>
        </div>
        <div
          class="card bg-gray-800 shadow-xl hover:shadow-2xl transition-shadow duration-300"
        >
          <div class="card-body items-center p-6">
            <img
              src="/tailwindcss-logo.png"
              alt="TailwindCSS Logo"
              class="h-20 w-20 mb-6"
            />
            <h3 class="text-xl font-semibold text-white">TailwindCSS</h3>
            <p class="mt-2 text-sm text-gray-400">
              A utility-first CSS framework for responsive and modern UI design.
            </p>
          </div>
        </div>
        <div
          class="card bg-gray-800 shadow-xl hover:shadow-2xl transition-shadow duration-300"
        >
          <div class="card-body items-center p-6">
            <img src="/bun-logo.svg" alt="Bun Logo" class="h-20 w-20 mb-6" />
            <h3 class="text-xl font-semibold text-white">Bun</h3>
            <p class="mt-2 text-sm text-gray-400">
              A fast all-in-one JavaScript runtime for modern web development.
            </p>
          </div>
        </div>
      </div>
    </div>
  </section>
  <footer class="bg-gray-900 text-white py-8">
    <div class="container mx-auto px-4">
      <div class="flex flex-col md:flex-row justify-between items-center">
        <div class="mb-4 md:mb-0">
          <a href="/" class="text-xl font-bold text-white hover:text-gray-400"
            >Intellicare</a
          >
          <p class="mt-2 text-sm text-gray-400">
            Empowering healthcare innovation @ MSU
          </p>
        </div>
        <div class="flex space-x-6">
          <a href="/" class="text-gray-400 hover:text-white">Privacy Policy</a>
          <a href="/" class="text-gray-400 hover:text-white">Terms of Service</a
          >
          <a href="/" class="text-gray-400 hover:text-white">Contact Us</a>
        </div>
      </div>
    </div>
  </footer>
</div>
