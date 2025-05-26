import type { PageServerLoad, Actions } from "./$types";
import { z } from "zod";
import { zod } from "sveltekit-superforms/adapters";
import { superValidate, message } from "sveltekit-superforms/server";
import { redirect } from "@sveltejs/kit";
import type { PatientRecord, MyPageData, PatientFormSchema } from "$lib/types";
import { patientSchema } from "$lib/schemas/patientSchema";

export const load: PageServerLoad = async ({ locals }) => {
  const { data: userData, error: userError } =
    await locals.supabase.auth.getUser();

  if (userError) {
    console.error("ERROR fetching user:", userError.message);
    throw redirect(303, "/login");
  }

  if (!userData.user) {
    throw redirect(303, "/login");
  }

  let records: PatientRecord[] = [];

  // Fetch records from the 'medical_records' schema
  const { data: recordData, error: recordError } = await locals.supabase
    .schema("medical_records")
    .from("patients")
    .select("id, first_name, last_name, date_of_birth, gender, created_at, nationality, contact_info")
    .order("created_at", { ascending: false });

  if (recordError) {
    console.error("Error fetching records from medical_records:", recordError);
  } else if (recordData) {
    records = recordData as PatientRecord[];
  }

  return {
    records: records,
    form: await superValidate(zod(patientSchema)),
  };
};

export const actions: Actions = {
  addPatient: async ({ request, locals }) => {
    // Use superValidate to parse and validate the form data
    const form = await superValidate(request, zod(patientSchema));

    if (!form.valid) {
      // If validation fails, return the form with errors
      console.error("Form validation failed:", form.errors);
      return message(form, {
        type: "error",
        text: "Invalid form data. Please check your inputs.",
      });
    }

    const { first_name, last_name, date_of_birth, gender, nationality } =
      form.data;

    // Perform the Supabase insert operation
    const { error: insertError, data: newPatient } = await locals.supabase
      .schema("medical_records")
      .from("patients")
      .insert({
        first_name: first_name,
        last_name: last_name,
        gender: gender,
        nationality: nationality,
        date_of_birth: date_of_birth ? new Date(date_of_birth) : null,
      })
      .select(); // return

    if (insertError) {
      console.error("Error adding patient to Supabase:", insertError);
      return message(form, {
        type: "error",
        text: `Failed to add patient: ${insertError.message}`,
      });
    }

    console.log("Patient added successfully:", newPatient);

    return message(form, {
      type: "success",
      text: "Patient added successfully!",
    });
  },
};
