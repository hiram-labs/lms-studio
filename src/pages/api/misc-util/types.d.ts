type TMiscUtilReqPayloadFunctions = "resend-trainee-email" | "add-trainees";

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
}

interface TMiscUtilReqPayload<
  T extends TMiscUtilReqPayloadFunctions = TMiscUtilReqPayloadFunctions,
> {
  function: T;
  data: TMiscUtilReqPayloadData[T];
}
