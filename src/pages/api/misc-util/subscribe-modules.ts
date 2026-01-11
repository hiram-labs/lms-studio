import { directusClientNoAuth } from "../../../libs/directus";
import { createItems, withToken } from "@directus/sdk";

export default async (
  cookie: TApiReqCookie,
  data: TMiscUtilReqPayloadData["subscribe-modules"]
): Promise<string> => {
  if (!data.moduleIds || !Array.isArray(data.moduleIds) || data.moduleIds.length === 0) {
    throw new Error("No modules selected");
  }

  const assignments = data.moduleIds.map((moduleId: string) => ({
    organization_id: cookie.ORG,
    content_id: moduleId,
  }));

  await directusClientNoAuth.request(
    withToken(
      cookie.TOKEN,
      createItems("lms_organization_content_assignment", assignments)
    )
  );

  return JSON.stringify({ success: true, count: data.moduleIds.length });
};
