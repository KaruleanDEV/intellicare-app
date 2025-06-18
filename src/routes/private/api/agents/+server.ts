// src/routes/private/api/agents/+server.ts


// Prototype: SvelteKit API route to handle requests for the Intellicare AI agent
// This route interacts with the Ollama AI model to process user requests and perform actions like scheduling appointments or querying patient records.
// Use N8N for advanced workflows and task automation instead. This code is a basic prototype and should be extended with proper error handling, security, and validation for production use.
import { json, type RequestHandler } from "@sveltejs/kit";
import { Ollama } from "ollama";
import type { PatientRecord } from "$lib/types";
import type { SupabaseClient } from "@supabase/supabase-js";

const ollama = new Ollama({ host: "http://localhost:11434" });
const ai_model = "qwen3:4b";

const SYSTEM_PROMPT = `
You are Intellicare-AI a hospital administration AI agent. You're always interacting with a system. You have the ability to do function calls.
Your response must be in JSON format.

Here are the rules for your JSON response:
1. If your response is a direct message to the user:
   Set "to": "user".
   Provide a plain text message in the "message" field.
   The "function_call" field MUST NOT be present.
   Example: {"to": "user", "message": "Hello! How can I help you schedule an appointment today?"}

2. If you need to perform an action by calling a function through the system:
   Set "to": "system".
   The "message" field MUST NOT be present.
   Provide a "function_call" object with "function" (name of the function) and "arguments" (an array of argument values).
   You must strictly follow the json format.
   Example: {"to": "system", "function_call": {"function": "check_appointment_availability", "arguments": ["2025-06-01T10:00:00Z"]}}

Available functions:

function name - check_appointment_availability
arguments - datetime (ISO 8601 format, UTC timezone)

function name - schedule_appointment
arguments - datetime (ISO 8601 format, UTC timezone), name (String), email (string)

function name - delete_appointment
arguments - datetime (ISO 8601 format, UTC timezone), name (String), email (string)

function name - query_patient_records
arguments - query (String, optional: A general search string for patient details like 'John Doe' or '123'. Do NOT use 'key:value' format like 'first_name:John'. Leave empty if no specific query is given by the user and you just want a list.)

function name - execute_sql_query
description - Generates and runs a PostgreSQL SELECT query directly on the database to retrieve specific patient data.
arguments - sql_code (String: The full PostgreSQL SELECT query to execute. MUST ONLY be a SELECT statement. DO NOT include INSERT, UPDATE, DELETE, or DDL commands. ONLY query tables you have knowledge of, such as 'medical_records.patients'. Example: 'SELECT first_name, last_name FROM medical_records.patients WHERE gender = ''Male'' LIMIT 5;')
- If this function returns data, summarize it clearly to the user, ideally using a Markdown code block for raw query results or a Markdown list for structured data.
- If the user explicitly asks for a "SQL query", or to "run a query", or to "fetch specific data" not covered by other functions, suggest using this function.
- IMPORTANT: Before generating SQL, remind the user that you can only run SELECT queries and cannot modify the database. If they ask for something that modifies data, tell them you cannot do it.

You can use Markdown formatting (e.g., **bold**, *italics*, lists, and code blocks) to make your responses clearer and easier to read.

Here are some additional instructions for your behavior:
- You must be able to understand that users might be from a different time zone. Always use their timezone while chatting about times and dates to the user.
- You can query patient records if the user asks for information about a patient. If the user asks for a patient by name or ID, use the 'query' argument. If they just say "show patient records", you can call it without arguments to see some recent ones.
- If function name - query_patient_records return nothing, you can use function name - execute_sql_query instead to further search.
`;

// Helper function to check if a string is a valid UUID format
function isValidUUID(uuidString: string): boolean {
  const uuidRegex =
    /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
  return uuidRegex.test(uuidString);
}

function check_appointment_availability(datetime: string): boolean {
  console.log("[FUNCTION CALL] check_appointment_availability:", datetime);
  return true;
}

function schedule_appointment(
  datetime: string,
  name: string,
  email: string
): boolean {
  console.log("[FUNCTION CALL] schedule_appointment:", datetime, name, email);
  return true;
}

function delete_appointment(
  datetime: string,
  name: string,
  email: string
): boolean {
  console.log("[FUNCTION CALL] delete_appointment:", datetime, name, email);
  return true;
}

async function query_patient_records(
  supabase: SupabaseClient,
  query: string = ""
): Promise<PatientRecord[] | string> {
  console.log(
    "[FUNCTION CALL] query_patient_records with query:",
    `"${query}"`
  );
  console.log("Is supabase client valid in query_patient_records?", !!supabase);

  let dbQuery = supabase
    .schema("medical_records")
    .from("patients")
    .select(
      "id, first_name, last_name, date_of_birth, gender, created_at, nationality, contact_info"
    );

  if (query) {
    const conditions: string[] = [
      `first_name.ilike.%${query}%`,
      `last_name.ilike.%${query}%`,
    ];

    if (isValidUUID(query)) {
      console.log("Query looks like a UUID, adding ID filter.");
      conditions.push(`id.eq.${query}`);
    } else {
      console.log(
        "Query does not look like a UUID, only applying name filters."
      );
    }

    dbQuery = dbQuery.or(conditions.join(","));
    console.log("Applying query filter:", conditions.join(","));
  } else {
    console.log(
      "No specific query given by LLM, fetching recent records without filter."
    );
  }

  dbQuery = dbQuery.order("created_at", { ascending: false }).limit(5);

  const { data: recordData, error: recordError } = await dbQuery;

  console.log("Inside query_patient_records - Raw recordData:", recordData);
  console.log("Inside query_patient_records - Raw recordError:", recordError);

  if (recordError) {
    console.error(
      "Error fetching records from medical_records:",
      recordError.message
    );
    return `Error querying patient records: ${recordError.message}`;
  } else if (recordData) {
    const records = recordData as PatientRecord[];
    console.log(
      "Inside query_patient_records - records.length:",
      records.length
    );
    if (records.length > 0) {
      const formattedRecords = records.map((r) => {
        // Decide what details to show for each patient narrow scope for security reason
        return `- Name: ${r.first_name} ${r.last_name || ""}, DOB: ${
          r.date_of_birth || "N/A"
        }, Gender: ${r.gender || "N/A"}, ID: ${r.id}`;
      });
      return formattedRecords.join("\n");
    } else {
      return "No patient records found matching the query.";
    }
  }
  return "An unexpected error occurred while querying patient records.";
}

//DANGER FOR DEMO ONLY ** ALLOW LLM TO GENERATE SQL AND RUN WITH RLS AS THE SECURITY
async function execute_sql_query(
  supabase: SupabaseClient,
  sql_code: string
): Promise<string> {
  console.log("[FUNCTION CALL] execute_sql_query with SQL:", sql_code);
  console.log("Is supabase client valid in execute_sql_query?", !!supabase);

  try {
    const { data, error } = await supabase
      .schema("medical_records") // Specify the schema
      .rpc("execute_dynamic_query", { sql_text: sql_code });

    if (error) {
      console.error("Error executing dynamic SQL via RPC:", error);
      return `Database error: ${error.message}. Please refine your SQL query.`;
    }

    if (!data || data.length === 0) {
      return "Query executed successfully, but no data was returned.";
    }
    const formattedResults = data
      .map((row: { result_json: Record<string, any> }) => {
        return JSON.stringify(row.result_json);
      })
      .join("\n"); // Each result on a new line

    return `Query results:\n${formattedResults}`;
  } catch (e: any) {
    console.error("Unexpected error in execute_sql_query:", e);
    return `An unexpected error occurred while executing the query: ${e.message}`;
  }
}

export async function POST({ request, locals }) {
  const supabase = locals.supabase;
  const thinkingProcess: { step: string; details: any }[] = [];
  const current_request_function_map: {
    [key: string]: (...args: any[]) => any;
  } = {
    check_appointment_availability: check_appointment_availability,
    schedule_appointment: schedule_appointment,
    delete_appointment: delete_appointment,
    query_patient_records: async (...args: any[]) => {
      return await query_patient_records(supabase, ...args);
    },
    execute_sql_query: async (sql_code: string) => {
      return await execute_sql_query(supabase, sql_code);
    },
  };

  try {
    const {
      message: userInput,
      chatHistory,
      userTimeZone,
      userCurrentTime,
    } = await request.json();
    const messagesForOllama: Array<{
      role: "user" | "assistant" | "system";
      content: string;
    }> = [
      { role: "system", content: SYSTEM_PROMPT },
      {
        role: "user",
        content: `The user's current timezone is ${userTimeZone} and the current time is ${userCurrentTime}. Keep this in mind for all time-related discussions.`,
      },
      {
        role: "assistant",
        content:
          "Okay, I understand. I will use the user's timezone for all time-related inquiries.",
      },
    ];

    chatHistory.forEach(
      (msg: { role: "user" | "assistant"; content: string }) => {
        messagesForOllama.push({ role: msg.role, content: msg.content });
      }
    );
    messagesForOllama.push({ role: "user", content: userInput });

    console.log("Messages sent to Ollama:", messagesForOllama);

    const response = await ollama.chat({
      model: ai_model,
      messages: messagesForOllama,
      options: {
        temperature: 0.7,
        stop: ["```json", "```"],
      },
      format: "json",
    });

    let llmResponseContent: string = response.message.content.trim();
    console.log("Raw LLM Response:", llmResponseContent);

    let parsedJson;
    try {
      if (llmResponseContent.startsWith("```json")) {
        llmResponseContent = llmResponseContent
          .substring(7, llmResponseContent.lastIndexOf("```"))
          .trim();
      }
      parsedJson = JSON.parse(llmResponseContent);
      console.log("Parsed LLM Response:", parsedJson);
      thinkingProcess.push({
        step: "AI's Raw Decision",
        details: parsedJson,
      });
    } catch (parseError) {
      console.error("Error parsing LLM response as JSON:", parseError);
      console.error("LLM Response that failed to parse:", llmResponseContent);
      return json(
        {
          error:
            "The AI agent provided an unparseable response. Please try again.",
          message:
            "Apologies, I encountered an issue processing my thoughts. Could you please rephrase your request?",
          thinkingProcess, // Include partial process even on error
        },
        { status: 500 }
      );
    }

    if (parsedJson.to === "user") {
      if (typeof parsedJson.message !== "string") {
        console.warn(
          "LLM response for 'user' target missing or invalid 'message' field:",
          parsedJson
        );
        return json(
          {
            error: "The AI agent provided an invalid message for the user.",
            message:
              "I received an unclear message from the AI. Can you please repeat your request?",
            thinkingProcess,
          },
          { status: 500 }
        );
      }

      thinkingProcess.push({
        step: "AI decided to respond directly to user",
        details: parsedJson.message,
      });
      return json({ message: parsedJson.message, thinkingProcess });
    } else if (parsedJson.to === "system") {
      // Function Call
      if (
        !parsedJson.function_call ||
        typeof parsedJson.function_call !== "object" ||
        !parsedJson.function_call.function
      ) {
        console.warn(
          "LLM response for 'system' target missing or invalid 'function_call' structure:",
          parsedJson
        );
        return json(
          {
            error:
              "The AI agent tried to call a function but provided an invalid function call structure.",
            message:
              "I received an unclear instruction from the AI regarding an action. Can you please repeat your request?",
            thinkingProcess,
          },
          { status: 500 }
        );
      }

      const fnName = parsedJson.function_call.function;
      const fnArgs = Array.isArray(parsedJson.function_call.arguments)
        ? parsedJson.function_call.arguments
        : [];

      if (!current_request_function_map[fnName]) {
        console.error(`Attempted to call unknown function: ${fnName}`);
        return json(
          {
            error: `The AI tried to call an unknown function: ${fnName}.`,
            message:
              "Apologies, I tried to perform an action but encountered an unknown command. Could you please clarify?",
            thinkingProcess,
          },
          { status: 500 }
        );
      }

      thinkingProcess.push({
        step: `Executing Function: ${fnName}`,
        details: { arguments: fnArgs },
      });

      const functionExecutionResult = await current_request_function_map[
        fnName
      ](...fnArgs);
      console.log(
        `Function '${fnName}' executed with result (resolved):`,
        functionExecutionResult
      );
      console.log(
        "Value sent to LLM for follow-up (stringified resolved value):",
        JSON.stringify(functionExecutionResult)
      );

      thinkingProcess.push({
        step: `Function Result: ${fnName}`,
        details: functionExecutionResult,
      });

      const followUpMessages = [
        { role: "system", content: SYSTEM_PROMPT },
        ...messagesForOllama,
        { role: "assistant", content: llmResponseContent },
        {
          role: "user",
          content: `The function '${fnName}' returned: ${JSON.stringify(
            functionExecutionResult
          )}. Please respond to the user based on this result in JSON format with "to": "user".`,
        },
      ];

      const followUpResponse = await ollama.chat({
        model: ai_model,
        messages: followUpMessages,
        options: {
          temperature: 0.7,
          stop: ["```json", "```"],
        },
        format: "json",
      });

      let followUpContent = followUpResponse.message.content.trim();
      if (followUpContent.startsWith("```json")) {
        followUpContent = followUpContent
          .substring(7, followUpContent.lastIndexOf("```"))
          .trim();
      }

      let parsedFollowUp;
      try {
        parsedFollowUp = JSON.parse(followUpContent);
        console.log("Parsed Follow-up LLM Response:", parsedFollowUp);

        thinkingProcess.push({
          step: "AI's Follow-up Decision",
          details: parsedFollowUp,
        });
      } catch (followUpParseError) {
        console.error(
          "Error parsing follow-up LLM response as JSON:",
          followUpParseError
        );
        console.error(
          "Follow-up LLM Response that failed to parse:",
          followUpContent
        );
        return json(
          {
            error:
              "The AI agent provided an unparseable follow-up response. Please try again.",
            message:
              "Apologies, I encountered an issue processing my thoughts after an action. Could you please rephrase your request?",
            thinkingProcess,
          },
          { status: 500 }
        );
      }

      if (
        parsedFollowUp.to === "user" &&
        typeof parsedFollowUp.message === "string"
      ) {
        return json({ message: parsedFollowUp.message, thinkingProcess });
      } else {
        console.warn(
          "LLM made an unexpected response after function execution:",
          parsedFollowUp
        );
        return json(
          {
            error:
              "The AI agent made an unexpected turn after performing an action or provided an invalid user message.",
            message:
              "I've completed an action, but there was an unexpected follow-up. How can I assist you further?",
            thinkingProcess,
          },
          { status: 500 }
        );
      }
    } else {
      console.warn(
        "LLM Response 'to' field is missing or invalid:",
        parsedJson
      );
      return json(
        {
          error: "The AI agent provided an invalid 'to' field in its response.",
          message:
            "I received an unclear instruction from the AI. Can you please repeat your request?",
          thinkingProcess,
        },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error("Error in /private/api/agents:", error);
    return json(
      {
        error: error.message || "An unexpected error occurred on the server.",
        message:
          "I'm sorry, I encountered an internal error. Please try again later.",
        thinkingProcess, // Return it if available
      },
      { status: 500 }
    );
  }
}
