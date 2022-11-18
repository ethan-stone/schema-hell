import {
  GlueClient,
  CheckSchemaVersionValidityCommand,
} from "@aws-sdk/client-glue";
import { env } from "../env/server.mjs";

type CheckSchemaVersionValidity = {
  format: "JSON" | "AVRO" | "PROTOBUF";
  definition: string;
};

class SchemaRegistry {
  constructor(private glueClient: GlueClient) {}

  async checkSchemaVersionValidity(args: CheckSchemaVersionValidity) {
    const res = await this.glueClient.send(
      new CheckSchemaVersionValidityCommand({
        DataFormat: args.format,
        SchemaDefinition: args.definition,
      })
    );

    return {
      isValid: res.Valid || false,
      error: res.Error,
    };
  }
}

const glueClient = new GlueClient({
  region: env.WEB_BACKEND_AWS_REGION,
  credentials: {
    accessKeyId: env.WEB_BACKEND_AWS_ACCESS_KEY_ID,
    secretAccessKey: env.WEB_BACKEND_AWS_SECRET_ACCESS_KEY,
  },
});

export const schemaRegistry = new SchemaRegistry(glueClient);
