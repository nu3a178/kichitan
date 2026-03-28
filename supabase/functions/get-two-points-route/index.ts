// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "@supabase/functions-js/edge-runtime.d.ts";

const keyJson = Deno.env.get("GOOGLE_SERVICE_ACCOUNT_KEY")
  ? JSON.parse(Deno.env.get("GOOGLE_SERVICE_ACCOUNT_KEY")!)
  : null;
const valhallaUrl =
  Deno.env.get("VALHALLA_CLOUD_RUN_URL") ?? Deno.env.get("DEV_VALHALLA_URL");

function pemToArrayBuffer(pem: string): ArrayBuffer {
  const base64 = pem
    .replace(/-----BEGIN PRIVATE KEY-----/, "")
    .replace(/-----END PRIVATE KEY-----/, "")
    .replace(/\n/g, "");
  const binary = atob(base64);
  const buffer = new ArrayBuffer(binary.length);
  const view = new Uint8Array(buffer);
  for (let i = 0; i < binary.length; i++) {
    view[i] = binary.charCodeAt(i);
  }
  return buffer;
}

async function getIdentityToken(
  key: { client_email: string; private_key: string },
  audience: string,
): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const encode = (obj: object) =>
    btoa(JSON.stringify(obj))
      .replace(/=/g, "")
      .replace(/\+/g, "-")
      .replace(/\//g, "_");

  const header = { alg: "RS256", typ: "JWT" };
  const payload = {
    iss: key.client_email,
    sub: key.client_email,
    aud: "https://oauth2.googleapis.com/token",
    iat: now,
    exp: now + 3600,
    target_audience: audience,
  };

  const signingInput = `${encode(header)}.${encode(payload)}`;
  const privateKey = await crypto.subtle.importKey(
    "pkcs8",
    pemToArrayBuffer(key.private_key),
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign(
    "RSASSA-PKCS1-v1_5",
    privateKey,
    new TextEncoder().encode(signingInput),
  );
  const jwt = `${signingInput}.${btoa(
    String.fromCharCode(...new Uint8Array(signature)),
  )
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")}`;

  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`,
  });
  const { id_token } = await tokenRes.json();
  return id_token;
}
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const token = keyJson ? await getIdentityToken(keyJson, valhallaUrl!) : null;
  const json = await req.json();
  const response = await fetch(
    `${valhallaUrl}/optimized_route?json=${encodeURIComponent(JSON.stringify(json))}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    },
  );
  const responseData = await response.json();
  const encodedRoute = responseData.trip.legs[0].shape;
  const time = responseData.trip.legs[0].summary.time;
  return new Response(
    JSON.stringify({ encodedRoute: encodedRoute, time: time }),
    {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    },
  );
});

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/getRootBetweenTwoPoint' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
