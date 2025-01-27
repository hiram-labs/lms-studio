import { directusClientNoAuth } from "../../../libs/directus";

import { customEndpoint, withToken } from "@directus/sdk";

export default async (
  cookie: TApiReqCookie,
  data: TMiscUtilReqPayloadData["resend-trainee-email"]
): Promise<string> => {
  const resPayload = await directusClientNoAuth.request(
    withToken(
      cookie.TOKEN,
      customEndpoint({
        path: "/lms-send-actor-pin-email",
        method: "POST",
        body: JSON.stringify(data),
      })
    )
  );
  return JSON.stringify(resPayload);
};
