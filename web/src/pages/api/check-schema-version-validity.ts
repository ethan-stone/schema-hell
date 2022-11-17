import type { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";
import { checkSchemaVersionValidity } from "../../backend/check-schema-version-validity";

const ReqBody = z.object({
  format: z.enum(["JSON", "AVRO", "PROTOBUFF"]),
  definition: z.string(),
});

type ReqBody = z.infer<typeof ReqBody>;

type ValidationErrors = z.inferFormattedError<typeof ReqBody>;

type ValidationErrorRes<Errors> = {
  code: "VALIDATION_ERROR";
  message: string;
  errors: Errors;
};

type ResBody =
  | {
      isValid: boolean;
    }
  | ValidationErrorRes<ValidationErrors>;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResBody>
) {
  const parsedBody = await ReqBody.spa(req.body);
  if (!parsedBody.success) {
    return res.status(400).json({
      code: "VALIDATION_ERROR",
      message: "Provided an invalid format and/or definition",
      errors: parsedBody.error.format(),
    });
  }
  const result = await checkSchemaVersionValidity(parsedBody.data);
  return res.status(200).json(result);
}
