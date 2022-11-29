import {
  GlueClient,
  CheckSchemaVersionValidityCommand,
  CreateSchemaCommand,
  RegisterSchemaVersionCommand,
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

type RegisterSchemaVersionArgs = {
  registryName: string;
  schemaName: string;
  definition: string;
};

type Result<Data, Error> =
  | {
      success: true;
      data: Data;
    }
  | {
      success: false;
      reason: Error;
    };

class SchemaRegistry {
  constructor(private glueClient: GlueClient) {}

  async checkSchemaVersionValidity(
    args: CheckSchemaVersionValidity
  ): Promise<
    Result<
      { isValid: boolean; error: string | undefined },
      { code: "UNKNOWN_ERROR"; error: unknown }
    >
  > {
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
        reason: {
          code: "UNKNOWN_ERROR",
          error,
        },
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
          error: unknown;
        }
      | {
          code: "EMPTY_RESPONSE";
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
          reason: {
            code: "EMPTY_RESPONSE",
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
        reason: {
          code: "UNKNOWN_ERROR",
          error,
        },
      };
    }
  }

  async registerSchemaVersion(args: RegisterSchemaVersionArgs): Promise<
    Result<
      {
        versionId: string;
        versionNumber: number;
        status: "AVAILABLE" | "DELETING" | "FAILURE" | "PENDING" | string;
      },
      { code: "UNKNOWN_ERROR"; error: unknown } | { code: "EMPTY_RESPONSE" }
    >
  > {
    try {
      const res = await this.glueClient.send(
        new RegisterSchemaVersionCommand({
          SchemaId: {
            SchemaName: args.schemaName,
            RegistryName: args.registryName,
          },
          SchemaDefinition: args.definition,
        })
      );

      if (!res.VersionNumber || !res.SchemaVersionId || !res.Status)
        return {
          success: false,
          reason: {
            code: "EMPTY_RESPONSE",
          },
        };

      return {
        success: true,
        data: {
          versionId: res.SchemaVersionId,
          versionNumber: res.VersionNumber,
          status: res.Status,
        },
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

const glueClient = new GlueClient({
  region: env.WEB_BACKEND_AWS_REGION,
  credentials: {
    accessKeyId: env.WEB_BACKEND_AWS_ACCESS_KEY_ID,
    secretAccessKey: env.WEB_BACKEND_AWS_SECRET_ACCESS_KEY,
  },
});

export const schemaRegistry = new SchemaRegistry(glueClient);
