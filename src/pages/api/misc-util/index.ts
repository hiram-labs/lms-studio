import type { APIRoute } from "astro";
import C from "../../../libs/config";

import { logger } from "@it-astro:logger";
import { getCookieFromRequest } from "../../../libs/utils";
import resendTraineeEmail from "./resend-trainee-email";
import addTrainees from "./add-trainees";
import recordDeviceOnboarding from "./record-device-onboarding";

const miscUtilFuncMap: Record<
  TMiscUtilReqPayloadFunctions,
  (
    cookie: TApiReqCookie,
    data: TMiscUtilReqPayloadData[TMiscUtilReqPayloadFunctions]
  ) => Promise<string>
> = {
  "resend-trainee-email": resendTraineeEmail as any,
  "add-trainees": addTrainees as any,
  "record-device-onboarding": recordDeviceOnboarding as any,
};

export const POST: APIRoute = async ({ params, request }) => {
  try {
    const ORG = getCookieFromRequest(request, C.COOKIE_KEY_USER_ORG_ID);
    const ROLE = getCookieFromRequest(request, C.COOKIE_KEY_USER_ROLE_NAME);
    const TOKEN = getCookieFromRequest(request, C.COOKIE_KEY_USER_STATIC_TOKEN);
    if (!ORG || !ROLE || !TOKEN)
      throw new Error(
        "Missing required authentication cookies: Organization ID and/or User Token and/or User Role."
      );

    const payload: TMiscUtilReqPayload = await request.json();

    if (!miscUtilFuncMap[payload.function]) {
      throw new Error(`Unsupported function name: '${payload.function}'.`);
    }

    const responsePayload = await miscUtilFuncMap[payload.function](
      { ORG, ROLE, TOKEN },
      payload.data
    );

    return new Response(responsePayload, {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    let errors: any = {};
    errors = (error as any)?.errors || [
      { message: (error as any).message || error },
    ];
    errors.forEach((error: any) => {
      logger.error(error.message);
    });

    const errorPayload = JSON.stringify({
      errors: errors.map(({ message }: any) => ({ message })),
    });
    return new Response(errorPayload, {
      status: 404,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }
};

export const prerender = false;
