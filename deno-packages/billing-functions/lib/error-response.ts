import {corsHeaders} from "./cors-headers.ts";

export default function errorResponse(message: string, code: number = 400): Response {
    return new Response(
        JSON.stringify({
            error: message
        }),
        {
            status: code,
            headers: {
                ...corsHeaders,
                "Content-Type": "application/json"
            }
        }
    )
}