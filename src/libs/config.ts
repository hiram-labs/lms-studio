export const COOKIE_KEY_USER_STATIC_TOKEN = "user-static-token";
export const DIRECTUS_FILE_ASSET_URL_PREFIX = `${import.meta.env.PUBLIC_DIRECTUS_SITE_URL}/assets/`;

// do not import default values below into a <script> tag as this may leak private details. Use corresponding name exports above
export default {
  URL_QUERY_PARAM_ID: "id",
  DIRECTUS_FILE_ASSET_URL_PREFIX,
  COOKIE_KEY_USER_STATIC_TOKEN,
};
