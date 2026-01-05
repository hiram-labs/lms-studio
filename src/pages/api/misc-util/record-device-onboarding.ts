import { directusClientNoAuth } from "../../../libs/directus";
import C from "../../../libs/config";

import { logger } from "@it-astro:logger";
import { createItem, readMe, withToken } from "@directus/sdk";

export default async (
  cookie: TApiReqCookie,
  data: TMiscUtilReqPayloadData["record-device-onboarding"]
): Promise<string> => {
  // Get user ID from the token
  const { id: userId } = await directusClientNoAuth.request(
    withToken(cookie.TOKEN, readMe({ fields: ["id"] }))
  );

  const userResponse = await directusClientNoAuth.request(
    withToken(cookie.TOKEN, createItem("lms_device", {
      device_serial: data.device_serial,
      device_model: data.device_model,
      device_manufacturer: data.device_manufacturer,
      organization_id: cookie.ORG
    }))
  );

  logger.info(`Device ${data.device_serial} onboarding started by user ${userId} in org ${cookie.ORG}`);

  return JSON.stringify({ success: true, device_id: userResponse.id });
};