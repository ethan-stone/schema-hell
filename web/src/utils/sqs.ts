import { SQSClient } from "@aws-sdk/client-sqs";
import { env } from "../env/server.mjs";
import { SendMessageCommand } from "@aws-sdk/client-sqs";

type Result<Data, Error> =
  | {
      success: true;
      data: Data;
    }
  | {
      success: false;
      reason: Error;
    };

export type SendRegisteredSchemaArgs = {
  registryName: string;
  schemaName: string;
  versionId: string;
  versionNumber: number;
};

class SQS {
  constructor(private sqsClient: SQSClient) {}

  async sendRegisteredSchema(
    queueUrl: string,
    args: SendRegisteredSchemaArgs
  ): Promise<
    Result<Record<string, never>, { code: "UNKNOWN_ERROR"; error: unknown }>
  > {
    try {
      await this.sqsClient.send(
        new SendMessageCommand({
          QueueUrl: queueUrl,
          MessageBody: JSON.stringify(args),
        })
      );

      return {
        success: true,
        data: {},
      };
    } catch (error) {
      return {
        success: false,
        reason: {
          code: "UNKNOWN_ERROR",
          error,
        },
      };
    }
  }
}

const sqsClient = new SQSClient({
  region: env.WEB_BACKEND_AWS_REGION,
  credentials: {
    accessKeyId: env.WEB_BACKEND_AWS_ACCESS_KEY_ID,
    secretAccessKey: env.WEB_BACKEND_AWS_SECRET_ACCESS_KEY,
  },
});

export const sqs = new SQS(sqsClient);
