export const COOKIE_KEY_USER_STATIC_TOKEN = "user-static-token";

// do not import default values below into a <script> tag as this may leak private details. Use corresponding name exports above
export default {
  DIRECTUS_FILE_ASSET_URL_PREFIX: `${import.meta.env.DIRECTUS_SITE_URL}/assets/`,
  URL_QUERY_PARAM_ID: "id",
  COOKIE_KEY_USER_STATIC_TOKEN,
};
