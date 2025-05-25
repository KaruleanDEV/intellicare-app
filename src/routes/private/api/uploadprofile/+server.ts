import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
/**
 * @description Handles the POST request to upload a user's profile picture to Supabase storage.
 *
 * @param {Object} params - Object containing request and locals.
 * @param {Request} params.request - The incoming request object containing the profile picture file.
 * @param {Object} params.locals - Object containing the Supabase client and other server-side configurations.
 * @param {SupabaseClient} params.locals.supabase - The Supabase client instance configured with the user's session.
 *
 * @returns {Promise<Response>} A promise that resolves with a JSON response indicating the success or failure of the upload.
 *
 * @throws {Error} Throws an error if:
 *   - No file is provided.
 *   - The provided file is not an image.
 *   - The user session is invalid or not found.
 *   - There is an error retrieving the user from Supabase.
 *   - There is an error listing existing files in Supabase storage.
 *   - There is an error deleting the old profile picture.
 *   - There is an error uploading the new profile picture.
 *   - Any other unexpected error occurs during the process.
 *
 * @example
 * ```typescript
 * // Example usage (assuming a form with a file input named 'profilePicture')
 * const formData = new FormData();
 * formData.append('profilePicture', fileInput.files[0]);
 *
 * const response = await fetch('/api/uploadprofile', {
 *   method: 'POST',
 *   body: formData
 * });
 *
 * if (response.ok) {
 *   const data = await response.json();
 *   console.log(data.message); // "Profile picture uploaded successfully"
 * } else {
 *   console.error('Failed to upload profile picture');
 * }
 * ```
 */
export const POST: RequestHandler = async ({ request, locals }) => {
    console.log('API: /api/upload-profile-picture POST request received');

    // Access the Supabase client directly from locals
    // This client is already configured with the user's session from hooks.server.ts
    const supabase = locals.supabase;
    const formData = await request.formData();
    const file = formData.get('profilePicture') as File | null;

    if (!file) {
        throw error(400, 'No file provided.');
    }
    if (!file.type.startsWith('image/')) {
        throw error(400, 'Invalid file type. Only images are allowed.');
    }
    const { data: userResponse, error: userError } = await supabase.auth.getUser();
    if (userError) {
        console.error('API Error getting user:', userError.message);
        throw error(500, `Failed to get user: ${userError.message}`);
    }
    const user = userResponse.user;
    if (!user) {
        throw error(401, 'Unauthorized: User session invalid or not found.');
    }
    try {
        // List existing profile images for the user
        const { data: listData, error: listError } = await supabase.storage
            .from('users-data')
            .list(`${user.id}/avatars/`, { search: 'profile-image' });
        if (listError && listError.message !== 'The resource was not found') {
            console.error('API Error listing files:', listError);
            throw error(500, `Failed to list files: ${listError.message}`);
        }
        if (listData && listData.length > 0) {
            // If an old profile image exists, delete it
            const oldFile = listData.find(item => item.name.startsWith('profile-image'));
            if (oldFile) {
                const { error: deleteError } = await supabase.storage
                    .from('users-data')
                    .remove([`${user.id}/avatars/${oldFile.name}`]);

                if (deleteError) {
                    console.error('API Error deleting old profile picture:', deleteError.message);
                    throw error(500, `Failed to delete old picture: ${deleteError.message}`);
                }
                console.log(`API: Old profile picture ${oldFile.name} deleted.`);
            }
        }

        // Upload the new profile picture
        const fileName = 'profile-image';
        const filePath = `${user.id}/avatars/${fileName}`;

        const { error: uploadError } = await supabase.storage
            .from('users-data')
            .upload(filePath, file, {
                cacheControl: '3600', // Cache for 1 hour
                upsert: false // explicitly set to false to avoid overwriting
            });

        if (uploadError) {
            console.error('API Error uploading profile picture:', uploadError.message);
            throw error(500, `Failed to upload picture: ${uploadError.message}`);
        }

        console.log('API: Profile picture uploaded successfully');
        return json({ message: 'Profile picture uploaded successfully' }, { status: 200 });

    } catch (e: any) {
        console.error('API General Error:', e.message);
        throw error(e.status || 500, e.message);
    }
};