import type { APIRoute } from "astro";
import C from "../../../libs/config";

import { logger } from "@it-astro:logger";
import { getCookieFromRequest } from "../../../libs/utils";

import dashboardTraineeOverviewTable from "./dashboard-trainee-overview-table";
import dashboardModuleSubscriptionTable from "./dashboard-module-subscription-table";
import dashboardDeviceOverviewTable from "./dashboard-device-overview-table";

const tableIdToFuncMap: Record<
  string,
  (param: TTableDataFuncParam) => Promise<string>
> = {
  "#dashboard-trainee-overview-table": dashboardTraineeOverviewTable,
  "#dashboard-module-subscription-table": dashboardModuleSubscriptionTable,
  "#dashboard-device-overview-table": dashboardDeviceOverviewTable,
};

export const POST: APIRoute = async ({ params, request }) => {
  try {
    const ORG = getCookieFromRequest(request, C.COOKIE_KEY_USER_ORG_ID);
    const ROLE = getCookieFromRequest(request, C.COOKIE_KEY_USER_ROLE_NAME);
    const TOKEN = getCookieFromRequest(request, C.COOKIE_KEY_USER_STATIC_TOKEN);
    if (!ORG || !TOKEN)
      throw new Error(
        "Missing required authentication cookies: Organization ID and/or User Token and/or User Role."
      );

    const {
      id: tableId,
      page: tableCurrentPage,
      size: tablePaginationSize,
      ...rest
    } = await request.json();

    if (!tableId)
      throw new Error(
        "Missing required parameter: 'tableId'. Please provide a valid table identifier."
      );

    if (isNaN(tableCurrentPage) || isNaN(tablePaginationSize)) {
      throw new Error(
        "Invalid parameter: 'page' and 'size' must be valid numbers."
      );
    }

    if (!tableIdToFuncMap[tableId]) {
      throw new Error(`Unsupported tableId: '${tableId}'.`);
    }

    const responsePayload = await tableIdToFuncMap[tableId]({
      ORG,
      TOKEN,
      ROLE,
      tableCurrentPage,
      tablePaginationSize,
      ...rest,
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
