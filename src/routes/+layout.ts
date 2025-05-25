// src/routes/+layout.ts
import { createBrowserClient, createServerClient, isBrowser } from '@supabase/ssr'
import { PUBLIC_SUPABASE_ANON_KEY, PUBLIC_SUPABASE_URL } from '$env/static/public'
import type { LayoutLoad } from './$types'

/**
 * @file Defines the root layout loader for the application.
 * This loader is responsible for initializing the Supabase client and fetching the user session.
 * It configures the Supabase client differently based on whether it's running in the browser or on the server.
 * In the browser, it uses `createBrowserClient`, while on the server, it uses `createServerClient`.
 * The server-side client is configured to use cookies provided in the `LayoutData`.
 *
 * @param {Object} options - The options passed to the loader function.
 * @param {Function} options.fetch - The fetch function to use for making HTTP requests.
 * @param {Object} options.data - The data passed from the server-side layout data.
 * @param {Object} options.data.cookies - The cookies passed from the server.
 * @param {Function} options.depends - A function to declare dependencies for the loader.
 *
 * @returns {Promise<Object>} An object containing the Supabase client and the user session.
 * The Supabase client is used for interacting with the Supabase database.
 * The session object contains information about the currently authenticated user.
 *
 * @remarks
 * The `depends` function is used to invalidate the loader when the 'supabase:auth' dependency changes.
 * The `isBrowser` function is used to determine whether the code is running in the browser or on the server.
 * The `PUBLIC_SUPABASE_URL` and `PUBLIC_SUPABASE_ANON_KEY` environment variables are used to configure the Supabase client.
 */
export const load: LayoutLoad = async ({ fetch, data, depends }) => {
  depends('supabase:auth')

  const supabase = isBrowser()
    ? createBrowserClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, {
        global: {
          fetch,
        },
      })
    : createServerClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, {
        global: {
          fetch,
        },
        cookies: {
          getAll() {
            return data.cookies
          },
        },
      })

  /**
   * It's fine to use `getSession` here, because on the client, `getSession` is
   * safe, and on the server, it reads `session` from the `LayoutData`, which
   * safely checked the session using `safeGetSession`.
   */
  const {
    data: { session },
  } = await supabase.auth.getSession()

  return { supabase, session }
}