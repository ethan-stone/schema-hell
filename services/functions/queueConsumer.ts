import { SQSHandler, SQSRecord } from "aws-lambda";
import { DeleteSchemaCommand, GlueClient } from "@aws-sdk/client-glue";
import { z } from "zod";
import { Config } from "@serverless-stack/node/config";
import { logger } from "../utils/logger";

const glueClient = new GlueClient({});

const MessageBodySchema = z.object({
  schemaName: z.string(),
  versionId: z.string(),
  versionNumber: z.number()
});

type MessageBodyFormattedError = z.inferFormattedError<
  typeof MessageBodySchema
>;

export const main: SQSHandler = async (event) => {
  const failedRecords: {
    record: SQSRecord;
    reason:
      | { code: "VALIDATION_ERROR"; error: MessageBodyFormattedError }
      | { code: "UNKNOWN_ERROR"; error: unknown };
  }[] = [];

  for (const record of event.Records) {
    try {
      const result = await MessageBodySchema.spa(JSON.stringify(record.body));

      if (!result.success) {
        failedRecords.push({
          record: record,
          reason: {
            code: "VALIDATION_ERROR",
            error: result.error.format()
          }
        });
        continue;
      }

      const { schemaName } = result.data;

      await glueClient.send(
        new DeleteSchemaCommand({
          SchemaId: {
            RegistryName: Config.QUEUE_URL,
            SchemaName: schemaName
          }
        })
      );
    } catch (error) {
      failedRecords.push({
        record: record,
        reason: {
          code: "UNKNOWN_ERROR",
          error
        }
      });
    }
  }

  logger.error({ failedRecords }, "Some records failed to be processed");
};
