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

type ReqBody = z.infer<typeof ReqBody>;

type ValidationErrors = z.inferFormattedError<typeof ReqBody>;

type ResBody =
  | {
      isValid: boolean;
    }
  | ValidationErrorRes<ValidationErrors>
  | InvalidRequestRes
  | InternalErrorRes;

const supportedMethods = ["POST"];

async function handler(
  req: NextApiRequestWithLogger,
  res: NextApiResponse<ResBody>
) {
  const { method, log, body } = req;

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
    log.info(`Schema version validity check failed`, {
      error: result.error,
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
