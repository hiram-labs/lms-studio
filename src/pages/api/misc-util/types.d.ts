type TMiscUtilReqPayloadFunctions = "resend-trainee-email" | "add-trainees" | "record-device-onboarding" | "subscribe-modules" | "unsubscribe-modules";

interface TMiscUtilReqPayloadData {
  "resend-trainee-email": {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    last_access: string;
    user_id: string;
    pin: string;
  };
  "add-trainees": { first_name: string; last_name: string; email: string }[];
  "record-device-onboarding": {
    device_serial: string;
    device_model: string;
    device_manufacturer: string;
  };
  "subscribe-modules": {
    moduleIds: string[];
  };
  "unsubscribe-modules": {
    assignmentId: string;
  };
}

interface TMiscUtilReqPayload<
  T extends TMiscUtilReqPayloadFunctions = TMiscUtilReqPayloadFunctions,
> {
  function: T;
  data: TMiscUtilReqPayloadData[T];
}
