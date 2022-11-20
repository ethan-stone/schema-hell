import type { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";
import { checkSchemaVersionValidity } from "../../backend/check-schema-version-validity";
import { log } from "next-axiom";

const ReqBody = z.object({
  format: z.enum(["JSON", "AVRO", "PROTOBUF"]),
  definition: z.string(),
});

type ReqBody = z.infer<typeof ReqBody>;

type ValidationErrors = z.inferFormattedError<typeof ReqBody>;

type ValidationErrorRes<Errors> = {
  code: "VALIDATION_ERROR";
  message: string;
  errors: Errors;
};

type InvalidRequestRes = {
  code: "INVALID_REQUEST";
  message: string;
};

type ResBody =
  | {
      isValid: boolean;
    }
  | ValidationErrorRes<ValidationErrors>
  | InvalidRequestRes;

const supportedMethods = ["POST"];

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResBody>
) {
  if (!supportedMethods.includes(req.method || "")) {
    log.info(`Request made with invalid method: ${req.method}`, {
      request: req,
    });
    return res.status(400).json({
      code: "INVALID_REQUEST",
      message: `Request method ${req.method} is not supported`,
    });
  }
  const parsedBody = await ReqBody.spa(req.body);
  if (!parsedBody.success) {
    log.info(`Request body validation failed`, {
      request: req,
    });
    return res.status(400).json({
      code: "VALIDATION_ERROR",
      message: "Provided an invalid format and/or definition",
      errors: parsedBody.error.format(),
    });
  }
  log.info(`Request body validation passed`, {
    request: req,
  });
  const result = await checkSchemaVersionValidity(parsedBody.data);
  log.info(`Schema version validty check passed`, {
    request: req,
  });
  return res.status(200).json(result);
}
