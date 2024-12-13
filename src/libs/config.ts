export const COOKIE_KEY_USER_ORG_ID = "lms-studio-user-org-id";
export const COOKIE_KEY_USER_STATIC_TOKEN = "lms-studio-user-static-token";

export const LRS_SITE_URL = import.meta.env.PUBLIC_LRS_SITE_URL;
export const LRS_XAPI_ENDPOINT = `${LRS_SITE_URL}/data/xAPI`;

export const DIRECTUS_SITE_URL = import.meta.env.PUBLIC_DIRECTUS_SITE_URL;
export const DIRECTUS_FILE_ASSET_URL_PREFIX = `${DIRECTUS_SITE_URL}/assets/`;

// do not import default values below into a <script> tag as this may leak private details. Use corresponding name exports above
export default {
  URL_QUERY_PARAM_ID: "id",
  LRS_SITE_URL,
  LRS_XAPI_ENDPOINT,
  DIRECTUS_SITE_URL,
  DIRECTUS_FILE_ASSET_URL_PREFIX,
  COOKIE_KEY_USER_ORG_ID,
  COOKIE_KEY_USER_STATIC_TOKEN,
};
