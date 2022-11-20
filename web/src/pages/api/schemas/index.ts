import type { NextApiResponse } from "next";
import {
  withLogger,
  type NextApiRequestWithLogger,
} from "../../../utils/logging/backend-logger";
import { z } from "zod";
import type {
  InternalErrorRes,
  InvalidRequestRes,
  ValidationErrorRes,
} from "../../../utils/res-errors";
import { schemaRegistry } from "../../../utils/schema-registry";

const ReqBody = z.object({
  format: z.enum(["JSON", "AVRO", "PROTOBUF"]),
  definition: z.string(),
  compatibility: z.enum([
    "NONE",
    "DISABLED",
    "BACKWARD",
    "BACKWARD_ALL",
    "FORWARD",
    "FORWARD_ALL",
    "FULL",
    "FULL_ALL",
  ]),
});

type ReqBody = z.infer<typeof ReqBody>;
type ValidationErrors = z.inferFormattedError<typeof ReqBody>;

type ResBody =
  | {
      name: string;
      initialVersionId: string;
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
      message: "Provided an invalid format, definition and/or compatibility",
      errors: parsedBody.error.format(),
    });
  }
  log.info(`Request body validation passed`);

  // create schema
  const result = await schemaRegistry.createSchema(parsedBody.data);
  if (!result.success) {
    log.error(`New schema failed to be created`, {
      reason: result.reason,
    });
    return res.status(500).json({
      code: "INTERNAL_ERROR",
      message: "Unable to create schema",
    });
  }

  // return result
  log.info(`Schema with name: ${result.data.name} created`);
  return res.status(200).json(result.data);
}

export default withLogger(handler);
