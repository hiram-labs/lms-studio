type TPublicUtilReqPayloadFunctions = "update-pipe-app";

interface TPublicUtilReqPayloadData {
  "update-pipe-app": {
    version_code: number;
    device_model: string;
    device_manufacturer: string;
    android_version: string;
    android_sdk: number;
    android_id: string;
  };
}

interface TPublicUtilReqPayload<
  T extends TPublicUtilReqPayloadFunctions = TPublicUtilReqPayloadFunctions,
> {
  function: T;
  data: TPublicUtilReqPayloadData[T];
}
