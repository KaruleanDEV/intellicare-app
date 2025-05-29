// src/lib/types.ts
import type { SuperForm } from 'sveltekit-superforms';

// Define the PatientRecord
export interface PatientRecord {
    id: string; // UUID
    first_name: string;
    last_name: string;
    date_of_birth: string;
    gender: string;
    created_at: string; // Timestamp
    nationality: string;
    contact_info?: {
        email?: string;
        phone?: string;
    };
}

// Define the shape of patient form data (matching patientSchema in +page.server.ts)
export type PatientFormSchema = {
    first_name: string;
    last_name: string;
    date_of_birth: string;
    gender: 'Male' | 'Female' | 'Other';
    nationality: string;
};

export interface MyPageData {
    records: PatientRecord[];
    form: SuperForm<PatientFormSchema>;
}