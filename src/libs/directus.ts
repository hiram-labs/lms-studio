import { createDirectus, staticToken, rest } from "@directus/sdk";

const TOKEN = import.meta.env.DIRECTUS_ACCESS_TOKEN;
const HOST = import.meta.env.DIRECTUS_API_HOST || "localhost";
const PORT = import.meta.env.DIRECTUS_API_PORT || "8055";

const directusUrl = `http://${HOST}:${PORT}`;

export const directus_client_auth = createDirectus(directusUrl)
  .with(staticToken(TOKEN))
  .with(rest());
export const directus_client_no_auth = createDirectus(directusUrl).with(rest());
