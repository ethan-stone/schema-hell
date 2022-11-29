import type { NextApiResponse } from "next";
import { z } from "zod";
import { withLogger } from "../../../../../utils/logging/backend-logger";
import type { NextApiRequestWithLogger } from "../../../../../utils/logging/backend-logger";
import type {
  InternalErrorRes,
  InvalidRequestRes,
  ValidationErrorRes,
} from "../../../../../utils/res-errors";
import { schemaRegistry } from "../../../../../utils/schema-registry";
import { env } from "../../../../../env/server.mjs";

export type Query = {
  schemaName: string;
};

const ReqBody = z.object({
  definition: z.string(),
});

export type ReqBody = z.infer<typeof ReqBody>;
type ValidationErrors = z.inferFormattedError<typeof ReqBody>;

export type SuccessResBody = {
  versionId: string;
  versionNumber: number;
  status: "AVAILABLE" | "DELETING" | "PENDING" | "FAILURE" | string;
};

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
  const { method, log, body, query } = req;
  const { schemaName } = query as Query;

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

  // register schema version
  const result = await schemaRegistry.registerSchemaVersion({
    definition: parsedBody.data.definition,
    registryName: env.SCHEMA_REGISTRY_NAME,
    schemaName,
  });
  if (!result.success) {
    log.error(`Failed to register schema version`, {
      reason: result.reason,
    });
    return res.status(500).json({
      code: "INTERNAL_ERROR",
      message: "Unable to register schema version",
    });
  }

  // return result
  log.info(`Schema version with ID: ${result.data.versionId} created`);
  return res.status(200).json(result.data);
}

export default withLogger(handler);
