import { schemaRegistry } from "../utils/schema-registry";

type Args = {
  format: "JSON" | "AVRO" | "PROTOBUF";
  definition: string;
};

type Result = {
  isValid: boolean;
  error?: string;
};

export async function checkSchemaVersionValidity(args: Args): Promise<Result> {
  return await schemaRegistry.checkSchemaVersionValidity({
    format: args.format,
    definition: args.definition,
  });
}
