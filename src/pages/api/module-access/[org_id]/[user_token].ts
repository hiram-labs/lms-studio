import type { APIRoute } from "astro";
import C from "../../../../libs/config";
import { directusClientNoAuth } from "../../../../libs/directus";

import { readItem, readItems, readMe, withToken } from "@directus/sdk";
import { logger } from "@it-astro:logger";

export const GET: APIRoute = async ({ params, request }) => {
  try {
    const { org_id: ORG = "", user_token: TOKEN = "" } = params;

    const [userData, orgData, orgAttrData] = await Promise.all([
      directusClientNoAuth.request(
        withToken(
          TOKEN,
          readMe({
            fields: ["id", "first_name", "last_name", "email"],
          })
        )
      ),
      directusClientNoAuth.request(
        withToken(
          TOKEN,
          readItem("lms_organization", ORG, {
            fields: ["id", "organization_name"],
          })
        )
      ),
      directusClientNoAuth.request(
        withToken(
          TOKEN,
          readItems("lms_organization_attribute_assignment", {
            filter: { organization_id: ORG },
          })
        )
      ),
    ]);

    const filteredOrgAttrData = Object.assign(
      {},
      ...orgAttrData
        .filter((data) =>
          [
            "organization_lrs_key",
            "organization_lrs_secret",
            "organization_lrs_token",
          ].includes(data.attribute_name)
        )
        .map((data) => ({ [data.attribute_name]: data.attribute_text || "" }))
    );

    const responsePayload = JSON.stringify({
      user_info: { ...userData },
      org_info: { ...orgData },
      lrs_info: {
        url: C.LRS_XAPI_ENDPOINT,
        ...filteredOrgAttrData,
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
