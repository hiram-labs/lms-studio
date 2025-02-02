import {
  createDirectus,
  staticToken,
  rest,
  withToken,
  readItems,
  readMe,
} from "@directus/sdk";
import C from "./config";

const TOKEN = import.meta.env.DIRECTUS_ACCESS_TOKEN;
const PROTOCOL = import.meta.env.DIRECTUS_API_PROTOCOL || "http";
const HOST = import.meta.env.DIRECTUS_API_HOST || "localhost";
const PORT = import.meta.env.DIRECTUS_API_PORT || "8055";

const directusUrl = `${PROTOCOL}://${HOST}:${PORT}`;

export const directusClientAuth = createDirectus(directusUrl)
  .with(staticToken(TOKEN))
  .with(rest());

export const directusClientNoAuth = createDirectus(directusUrl).with(rest());

export const fetchAccessibleOrganizations = async (
  token: string,
  role: string
) => {
  let orgResponses;
  if (C.ACCESS_ALL_ORGS_ROLES.includes(role)) {
    orgResponses = await directusClientNoAuth.request(
      withToken(
        token,
        readItems("lms_organization", { fields: ["id", "organization_name"] })
      )
    );
  } else {
    const userId = await directusClientNoAuth.request(
      withToken(token, readMe({ fields: ["id"] }))
    );
    orgResponses = await directusClientNoAuth.request(
      withToken(
        token,
        readItems("lms_actor_access", {
          filter: { user_id: userId },
          fields: ["organization_id.id", "organization_id.organization_name"],
        })
      )
    );
    orgResponses = orgResponses.map((resp) => resp.organization_id);
  }
  return orgResponses;
};
