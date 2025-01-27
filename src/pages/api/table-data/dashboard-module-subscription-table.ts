import { directusClientNoAuth } from "../../../libs/directus";

import { aggregate, readItems, withToken } from "@directus/sdk";

export default async (param: TTableDataFuncParam) => {
  const { ORG, TOKEN, ROLE, tableCurrentPage, tablePaginationSize, ...rest } =
    param;

  const sort: string[] = [];
  const tableSort = (rest as any)?.sort || [];
  if (tableSort.length) {
    const fieldMap: Record<string, string> = {
      content_title: "content_id.content_title",
      content_description: "content_id.content_description",
    };
    const [{ field, dir }] = tableSort;
    sort.push(`${dir === "desc" ? "-" : ""}${fieldMap[field] || field}`);
  }

  const [moduleDataCount, moduleData] = await Promise.all([
    directusClientNoAuth.request(
      withToken(
        TOKEN,
        aggregate("lms_organization_content_assignment", {
          query: { filter: { organization_id: ORG } },
          aggregate: { count: "*" },
        })
      )
    ),
    directusClientNoAuth.request(
      withToken(
        TOKEN,
        readItems("lms_organization_content_assignment", {
          filter: { organization_id: ORG },
          fields: [
            "id",
            "content_id.id",
            "content_id.content_title",
            "content_id.content_description",
          ],
          offset: tableCurrentPage * tablePaginationSize - tablePaginationSize,
          limit: tablePaginationSize,
          sort,
        })
      )
    ),
  ]);

  const [{ count: extractedModuleDataCount }] = moduleDataCount;
  const transformedModuleData = moduleData.map((item) => ({
    ...item.content_id,
    lms_organization_content_assignment_id: item.id,
  }));

  const responsePayload = JSON.stringify({
    last_page: Math.ceil(
      parseInt(extractedModuleDataCount || "0") / tablePaginationSize
    ),
    data: transformedModuleData,
  });

  return responsePayload;
};

// TODO: make sure association are unique so they can not be duplicated use directus extension hook
