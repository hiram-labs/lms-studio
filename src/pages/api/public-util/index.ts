import type { APIRoute } from "astro";
import C from "../../../libs/config";

import { logger } from "@it-astro:logger";
import updatePipeApp from "./update-pipe-app";

const publicUtilFuncMap: Record<
  TPublicUtilReqPayloadFunctions,
  (
    data: TPublicUtilReqPayloadData[TPublicUtilReqPayloadFunctions]
  ) => Promise<string>
> = {
  "update-pipe-app": updatePipeApp,
};

export const POST: APIRoute = async ({ params, request }) => {
  try {
    const payload: TPublicUtilReqPayload = await request.json();

    if (!publicUtilFuncMap[payload.function]) {
      throw new Error(`Unsupported function name: '${payload.function}'.`);
    }

    const responsePayload = await publicUtilFuncMap[payload.function](
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
