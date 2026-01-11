import { directusClientNoAuth } from "../../../libs/directus";
import { deleteItem, withToken } from "@directus/sdk";

export default async (
  cookie: TApiReqCookie,
  data: TMiscUtilReqPayloadData["unsubscribe-modules"]
): Promise<string> => {
  if (!data.assignmentId) {
    throw new Error("Assignment ID is required");
  }

  await directusClientNoAuth.request(
    withToken(
      cookie.TOKEN,
      deleteItem("lms_organization_content_assignment", data.assignmentId)
    )
  );

  return JSON.stringify({ success: true });
};
