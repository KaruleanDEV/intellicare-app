/**
 * @file Defines the server-side load function for the private layout.
 * This function fetches user data and generates a signed URL for the user's profile image.
 * It handles cases where user data or the profile image is not available.
 */
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals }) => {
    const { data: userData, error: userError } = await locals.supabase.auth.getUser();
    if (userError) {
        console.error('Error fetching user data:', userError.message);
        return {
            profileImageUrl: null
        };
    }
    if (!userData) {
        console.error('No user data found');
        return {
            profileImageUrl: null
        };
    }

    //DECLARE VARIABLES
    let profileImageUrl: string | null = null;
    let records: any = null;

    if (userData.user) {
        const filePath = `${userData.user.id}/avatars/profile-image`;
        const expiresIn = 60 * 60; // URL valid for 1 hour

        // signed URL for the profile image
        const { data: signedUrlData, error } = await locals.supabase.storage
            .from('users-data')
            .createSignedUrl(filePath, expiresIn);

        if (error) {
            console.error('Error creating signed URL for profile image:', error.message);
        } else if (signedUrlData) {
            profileImageUrl = signedUrlData.signedUrl;
        }

        // check patient data note: Migrate to page.server.ts later
        const { data: recordData, error: recordError } = await locals.supabase
            .schema('medical_records')
            .from('patients')
            .select('id, first_name, last_name, date_of_birth, gender, created_at')
            .order('created_at', { ascending: false });

        if (recordError) {
            console.error('Error fetching records:', recordError);
            records = [];
        } else if (recordData) {
            records = recordData || [];
        }
    }

        return {
            profileImageUrl,
            records,
        };
    };