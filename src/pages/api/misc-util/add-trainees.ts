import { directusClientNoAuth } from "../../../libs/directus";
import C from "../../../libs/config";

import { customEndpoint, readRoles, withToken } from "@directus/sdk";

export default async (
  cookie: TApiReqCookie,
  data: TMiscUtilReqPayloadData["add-trainees"]
): Promise<string> => {
  const [{ id: role }] = await directusClientNoAuth.request(
    withToken(
      cookie.TOKEN,
      readRoles({ filter: { name: C.STUDIO_BASIC_USER_ROLE }, fields: ["id"] })
    )
  );
  const extData = data.map((item) => ({
    ...item,
    role,
    token: crypto.randomUUID(),
    organization_id: cookie.ORG,
  }));
  const responsePayload = await directusClientNoAuth.request(
    withToken(
      cookie.TOKEN,
      customEndpoint({
        path: "/lms-create-actor-pin",
        method: "POST",
        body: JSON.stringify(extData),
      })
    )
  );
  return JSON.stringify(responsePayload);
};
