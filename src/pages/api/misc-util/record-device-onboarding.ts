import { directusClientNoAuth } from "../../../libs/directus";

import { createItem, readMe, withToken } from "@directus/sdk";

export default async (
  cookie: TApiReqCookie,
  data: TMiscUtilReqPayloadData["record-device-onboarding"]
): Promise<string> => {

  const userResponse = await directusClientNoAuth.request(
    withToken(cookie.TOKEN, createItem("lms_device", {
      device_serial: data.device_serial,
      device_model: data.device_model,
      device_manufacturer: data.device_manufacturer,
      organization_id: cookie.ORG
    }))
  );

  return JSON.stringify({ success: true, device_id: userResponse.id });
};