/**
 * @file api/organization/[org_id]/user/[user_token]/index.ts
 * @description API endpoint to fetch user information, organization details,
 *              and Learning Record Store (LRS) information for a specified
 *              organization and user used by modules on headset to request
 *              access sort of and auth wall.
 *
 * This endpoint accepts two URL parameters:
 * - `org_id`: The unique identifier for the organization.
 * - `user_token`: A token that authenticates the user making the request.
 *
 * Functionality:
 * - Fetches user information, including `id`, `first_name`, `last_name`, and `email`.
 * - Retrieves organization details, such as `id` and `organization_name`.
 * - Obtains organization attributes related to the LRS (e.g., keys, secrets, and tokens).
 * - Combines the above data into a structured JSON response containing:
 *   - `user_info`: User-specific details.
 *   - `org_info`: Organization-specific details.
 *   - `lrs_info`: LRS-specific configuration, including the endpoint and credentials.
 *
 * Successful Response:
 * - Status: 200
 * - Content-Type: application/json
 * - JSON payload:
 *   ```json
 *   {
 *     "user_info": {
 *       "id": "...",
 *       "first_name": "...",
 *       "last_name": "...",
 *       "email": "..."
 *     },
 *     "org_info": {
 *       "id": "...",
 *       "organization_name": "..."
 *     },
 *     "lrs_info": {
 *       "url": "...",
 *       "organization_lrs_key": "...",
 *       "organization_lrs_secret": "...",
 *       "organization_lrs_token": "..."
 *     }
 *   }
 *   ```
 *
 * Error Response:
 * - Status: 404
 * - Content-Type: application/json
 * - JSON payload:
 *   ```json
 *   {
 *     "errors": [
 *       {
 *         "message": "..."
 *       }
 *     ]
 *   }
 *   ```
 *
 * Notes:
 * - Requires a valid `user_token` for authentication.
 * - Uses the Directus SDK to fetch data from a Directus-based backend.
 * - Logs errors using the provided `logger`.
 *
 * Prerendering:
 * - Disabled (`prerender = false`) because the endpoint relies on runtime parameters.
 */

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
