type Args = {
  format: "JSON" | "AVRO" | "PROTOBUFF";
  definition: string;
};

type Result = {
  isValid: true;
};

export async function checkSchemaVersionValidity(args: Args): Promise<Result> {
  console.log(args);
  return { isValid: true };
}
