import type { LayoutServerLoad } from './$types'

/**
 * Server-side load function for the root layout.
 *
 * This function retrieves the session and all cookies to be made available to the client.
 *
 * @param {Object} params - The parameters passed to the load function.
 * @param {Object} params.locals - The locals object containing server-side data.
 * @param {Function} params.locals.safeGetSession - A function to safely retrieve the session.
 * @param {Object} params.cookies - The cookies object for accessing and manipulating cookies.
 * @returns {Promise<{ session: any; cookies: Array<Object> }>} An object containing the session and all cookies.
 */
export const load: LayoutServerLoad = async ({ locals: { safeGetSession }, cookies }) => {
  const { session } = await safeGetSession()
  return {
    session,
    cookies: cookies.getAll(),
  }
}