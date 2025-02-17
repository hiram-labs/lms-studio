import { directusClientAuth } from "../../../libs/directus";
import C from "../../../libs/config";

import { logger } from "@it-astro:logger";
import { readItems } from "@directus/sdk";

export default async (
  data: TPublicUtilReqPayloadData["update-pipe-app"]
): Promise<string> => {
  const resPayload = await directusClientAuth.request(
    readItems("lms_application_attribute_assignment", {
      filter: { application_name: "pipe_application" },
      fields: ["attribute_name", "attribute_text", "attribute_file"],
    })
  );

  const sortedResPayload = Object.fromEntries(
    resPayload.map(({ attribute_name, attribute_text, attribute_file }) => [
      attribute_name,
      attribute_file ?? attribute_text,
    ])
  );
  const latestVersionCode = parseInt(
    sortedResPayload.apk_package_version_code,
    10
  );

  const parsedResPayload = {
    apk_url: `${C.DIRECTUS_FILE_ASSET_URL_PREFIX}${sortedResPayload.apk_file}?download=`,
    is_outdated: data.version_code < latestVersionCode,
  };
  if (parsedResPayload.is_outdated) {
    logger.info(
      `Device ${data.android_id} is running an outdated version (version ${data.version_code}), a newer version is available (version ${latestVersionCode}).`
    );
  }
  return JSON.stringify(parsedResPayload);
};
