import type { APIRoute } from "astro";
import { directusClientNoAuth } from "../../../libs/directus";

import { readMe, withToken } from "@directus/sdk";
import { logger } from "@it-astro:logger";

export const GET: APIRoute = async ({ params, request }) => {
  try {
    const TOKEN = params.user_token || "";
    const data = await directusClientNoAuth.request(
      withToken(
        TOKEN,
        readMe({
          fields: ["id", "first_name", "last_name", "email"],
        })
      )
    );

    const responsePayload = JSON.stringify({
      is_user_valid: true,
      user_info: {
        id: data.id,
        name: `${data.first_name} ${data.last_name}`,
        mbox: data.email,
      },
      org_info: {},
      lrs_info: {
        url: "https://lrs.staging.xrtemis.com/data/xAPI",
        key: "d3c47449f156ba680bbe6e6530de1e73e105ee42",
        secret: "5543217f6075cc923cf2866ec0e7a9f539b3b390",
        auth_basic_token:
          "Basic ZDNjNDc0NDlmMTU2YmE2ODBiYmU2ZTY1MzBkZTFlNzNlMTA1ZWU0Mjo1NTQzMjE3ZjYwNzVjYzkyM2NmMjg2NmVjMGU3YTlmNTM5YjNiMzkw",
      },
    });

    return new Response(responsePayload, {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    let errors: any = {};
    errors = (error as any)?.errors || [{ message: error }];
    errors.forEach((error: any) => {
      logger.error(error.message);
    });

    const errorPayload = JSON.stringify({ error: "Resource not found" });
    return new Response(errorPayload, {
      status: 404,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }
};

export const prerender = false;
