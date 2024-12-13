import { createDirectus, staticToken, rest } from "@directus/sdk";

const TOKEN = import.meta.env.DIRECTUS_ACCESS_TOKEN;
const PROTOCOL = import.meta.env.DIRECTUS_API_PROTOCOL || "http";
const HOST = import.meta.env.DIRECTUS_API_HOST || "localhost";
const PORT = import.meta.env.DIRECTUS_API_PORT || "8055";

const directusUrl = `${PROTOCOL}://${HOST}:${PORT}`;

export const directusClientAuth = createDirectus(directusUrl)
  .with(staticToken(TOKEN))
  .with(rest());

export const directusClientNoAuth = createDirectus(directusUrl).with(rest());
