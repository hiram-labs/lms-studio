import { directusClientNoAuth } from "../../../libs/directus";
import C from "../../../libs/config";

import { aggregate, readItems, withToken } from "@directus/sdk";

/**
 * Handles data retrieval and transformation for the trainee overview table on the dashboard.
 *
 * This function retrieves paginated and sorted trainee data from the "lms_actor_access" table,
 * transforms the data to match frontend requirements, and returns the result in a JSON string format.
 *
 * @param param - An object containing the following properties:
 *   - ORG: The organization ID used to filter data.
 *   - TOKEN: Authentication token for API requests.
 *   - tableCurrentPage: The current page number for pagination.
 *   - tablePaginationSize: The number of items per page.
 *   - rest: Additional properties, including sorting options.
 *
 * @returns A Promise that resolves to a JSON string containing:
 *   - `last_page`: The total number of pages based on the data count and pagination size.
 *   - `data`: An array of transformed trainee data objects.
 *
 * The transformed trainee data includes:
 *   - `id`: Unique ID of the trainee data.
 *   - `user_id`: ID of the associated user.
 *   - `first_name`: First name of the user.
 *   - `last_name`: Last name of the user.
 *   - `email`: Email address of the user.
 *   - `last_access`: The last access timestamp of the user.
 *   - `pin`: Access PIN for the trainee.
 *
 * Notes:
 * - Sorting is applied based on the `sort` field in the `rest` parameter. Field mappings are used to
 *   translate frontend field names to backend equivalents.
 * - Pagination and sorting calculations are handled internally.
 *
 * Example Response:
 * ```
 * {
 *   "last_page": 5,
 *   "data": [
 *     {
 *       "id": "1",
 *       "user_id": "123",
 *       "first_name": "John",
 *       "last_name": "Doe",
 *       "email": "john.doe@example.com",
 *       "last_access": "2025-01-17T10:00:00Z",
 *       "pin": "123456"
 *     }
 *   ]
 * }
 * ```
 */
export default async (param: TTableDataFuncParam) => {
  const { ORG, TOKEN, ROLE, tableCurrentPage, tablePaginationSize, ...rest } =
    param;

  const sort: string[] = [];
  const tableSort = (rest as any)?.sort || [];
  if (tableSort.length) {
    const fieldMap: Record<string, string> = {
      user_id: "user_id.id",
      first_name: "user_id.first_name",
      last_name: "user_id.last_name",
      email: "user_id.email",
      last_access: "user_id.last_access",
      pin: "access_pin",
    };
    const [{ field, dir }] = tableSort;
    sort.push(`${dir === "desc" ? "-" : ""}${fieldMap[field] || field}`);
  }

  const [traineeDataCount, traineeData] = await Promise.all([
    directusClientNoAuth.request(
      withToken(
        TOKEN,
        aggregate("lms_actor_access", {
          query: { filter: { organization_id: ORG } },
          aggregate: { count: "*" },
        })
      )
    ),
    directusClientNoAuth.request(
      withToken(
        TOKEN,
        readItems("lms_actor_access", {
          filter: { organization_id: ORG },
          fields: [
            "id",
            "access_pin",
            "user_id.id",
            "user_id.first_name",
            "user_id.last_name",
            "user_id.email",
            "user_id.last_access",
            "user_id.role.name",
          ],
          offset: tableCurrentPage * tablePaginationSize - tablePaginationSize,
          limit: tablePaginationSize,
          sort,
        })
      )
    ),
  ]);

  const [{ count: extractedTraineeDataCount }] = traineeDataCount;
  const filteredTrainees = traineeData.filter(
    (item) => item.user_id.role.name === C.STUDIO_BASIC_USER_ROLE
  );
  const transformedTraineeData = filteredTrainees.map((item) => ({
    ...item.user_id,
    user_id: item.user_id?.id,
    pin: item.access_pin,
    id: item.id,
  }));

  const responsePayload = JSON.stringify({
    last_page: Math.ceil(
      parseInt(extractedTraineeDataCount || "0") / tablePaginationSize
    ),
    data: transformedTraineeData,
  });

  return responsePayload;
};
