import { directusClientNoAuth } from "../../../libs/directus";
import C from "../../../libs/config";

import { aggregate, readItems, withToken } from "@directus/sdk";

/**
 * Handles data retrieval and transformation for the device overview table on the dashboard.
 *
 * This function retrieves paginated and sorted device data from the "lms_device" table,
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
 *   - `data`: An array of transformed device data objects.
 *
 * The transformed device data includes:
 *   - `id`: Unique ID of the device record.
 *   - `device_serial`: Serial number of the device.
 *   - `device_model`: Model of the device.
 *   - `device_manufacturer`: Manufacturer of the device.
 *   - `created_by`: User who created the device record.
 *   - `created_at`: Timestamp when the device record was created.
 *
 * Notes:
 * - Sorting is applied based on the `sort` field in the `rest` parameter.
 * - Pagination and sorting calculations are handled internally.
 */
export default async (param: TTableDataFuncParam) => {
  const { ORG, TOKEN, tableCurrentPage, tablePaginationSize, ...rest } = param;

  const sort: string[] = [];
  const tableSort = (rest as any)?.sort || [];
  if (tableSort.length) {
    const [{ field, dir }] = tableSort;
    sort.push(`${dir === "desc" ? "-" : ""}${field}`);
  }

  const [deviceDataCount, deviceData] = await Promise.all([
    directusClientNoAuth.request(
      withToken(
        TOKEN,
        aggregate("lms_device", {
          query: { filter: { organization_id: ORG } },
          aggregate: { count: "*" },
        })
      )
    ),
    directusClientNoAuth.request(
      withToken(
        TOKEN,
        readItems("lms_device", {
          filter: { organization_id: ORG },
          fields: [
            "id",
            "device_serial",
            "device_model",
            "device_manufacturer",
            "created_by.first_name",
            "created_by.last_name",
            "created_at",
          ],
          offset: tableCurrentPage * tablePaginationSize - tablePaginationSize,
          limit: tablePaginationSize,
          sort,
        })
      )
    ),
  ]);

  const [{ count: extractedDeviceDataCount }] = deviceDataCount;
  const transformedDeviceData = deviceData.map((item) => ({
    id: item.id,
    device_serial: item.device_serial,
    device_model: item.device_model,
    device_manufacturer: item.device_manufacturer,
    created_by: item.created_by ? `${item.created_by.first_name} ${item.created_by.last_name}` : 'Unknown',
    created_at: item.created_at,
  }));

  const responsePayload = JSON.stringify({
    last_page: Math.ceil(
      parseInt(extractedDeviceDataCount || "0") / tablePaginationSize
    ),
    data: transformedDeviceData,
  });

  return responsePayload;
};