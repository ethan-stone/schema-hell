import type { NextApiResponse } from "next";
import { z } from "zod";
import {
  withLogger,
  type NextApiRequestWithLogger,
} from "../../utils/logging/backend-logger";
import type {
  InternalErrorRes,
  InvalidRequestRes,
  ValidationErrorRes,
} from "../../utils/res-errors";
import { schemaRegistry } from "../../utils/schema-registry";

const ReqBody = z.object({
  format: z.enum(["JSON", "AVRO", "PROTOBUF"]),
  definition: z.string(),
});

export type ReqBody = z.infer<typeof ReqBody>;

type ValidationErrors = z.inferFormattedError<typeof ReqBody>;

export type SuccessResBody = { isValid: boolean; error?: string };
export type ErrorResBody =
  | ValidationErrorRes<ValidationErrors>
  | InvalidRequestRes
  | InternalErrorRes;

export type ResBody = SuccessResBody | ErrorResBody;

const supportedMethods = ["POST"];

async function handler(
  req: NextApiRequestWithLogger,
  res: NextApiResponse<ResBody>
) {
  const { method, log, body } = req;
  console.log(typeof body);

  // validate request method
  if (!supportedMethods.includes(method || "")) {
    log.info(`Request made with unsupported method: ${method}`);
    return res.status(400).json({
      code: "INVALID_REQUEST",
      message: `Request method ${method} is not supported`,
    });
  }

  // validate request body
  const parsedBody = await ReqBody.spa(body);
  if (!parsedBody.success) {
    log.info(`Request body validation failed`);
    return res.status(400).json({
      code: "VALIDATION_ERROR",
      message: "Provided an invalid format and/or definition",
      errors: parsedBody.error.format(),
    });
  }
  log.info(`Request body validation passed`);

  // check if schema version is valid
  const result = await schemaRegistry.checkSchemaVersionValidity(
    parsedBody.data
  );

  // return result
  if (!result.success) {
    log.error(`Schema version validity check failed`, {
      reason: result.reason,
    });
    return res.status(500).json({
      code: "INTERNAL_ERROR",
      message: "Unable to check schema version validity",
    });
  }
  log.info(`Schema version validity check ran`);
  return res.status(200).json(result.data);
}

export default withLogger(handler);
