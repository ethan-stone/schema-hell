import {
  GlueClient,
  CheckSchemaVersionValidityCommand,
  CreateSchemaCommand,
} from "@aws-sdk/client-glue";
import { env } from "../env/server.mjs";
import { nanoid } from "./nanoid";

type CheckSchemaVersionValidity = {
  format: "JSON" | "AVRO" | "PROTOBUF";
  definition: string;
};

type CreateSchemaArgs = {
  format: "JSON" | "AVRO" | "PROTOBUF";
  definition: string;
  compatibility:
    | "NONE"
    | "DISABLED"
    | "BACKWARD"
    | "BACKWARD_ALL"
    | "FORWARD"
    | "FORWARD_ALL"
    | "FULL"
    | "FULL_ALL";
};

type Result<Data, Error> =
  | {
      success: true;
      data: Data;
    }
  | {
      success: false;
      error: Error;
    };

class SchemaRegistry {
  constructor(private glueClient: GlueClient) {}

  async checkSchemaVersionValidity(
    args: CheckSchemaVersionValidity
  ): Promise<Result<{ isValid: boolean; error: string | undefined }, unknown>> {
    try {
      const res = await this.glueClient.send(
        new CheckSchemaVersionValidityCommand({
          DataFormat: args.format,
          SchemaDefinition: args.definition,
        })
      );

      return {
        success: true,
        data: {
          isValid: res.Valid || false,
          error: res.Error,
        },
      };
    } catch (error) {
      return {
        success: false,
        error,
      };
    }
  }

  async createSchema(args: CreateSchemaArgs): Promise<
    Result<
      {
        name: string;
        initialVersionId: string;
      },
      | {
          code: "UNKNOWN_ERROR";
        }
      | {
          code: "EMPTY_NAME_AND_OR_VERSION_ID";
        }
    >
  > {
    try {
      const res = await this.glueClient.send(
        new CreateSchemaCommand({
          RegistryId: {
            RegistryName: env.SCHEMA_REGISTRY_NAME,
          },
          SchemaName: nanoid(),
          DataFormat: args.format,
          SchemaDefinition: args.definition,
          Compatibility: args.compatibility,
        })
      );

      if (!res.SchemaName || !res.SchemaVersionId)
        return {
          success: false,
          error: {
            code: "EMPTY_NAME_AND_OR_VERSION_ID",
          },
        };

      return {
        success: true,
        data: {
          name: res.SchemaName,
          initialVersionId: res.SchemaVersionId,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: "UNKNOWN_ERROR",
        },
      };
    }
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
