import { StackContext } from "@serverless-stack/resources";
import * as aws_glue from "aws-cdk-lib/aws-glue";
import * as aws_iam from "aws-cdk-lib/aws-iam";

export function SchemaRegistryStack({ stack }: StackContext) {
  const webBackendUser = new aws_iam.User(
    stack,
    "WebBackendSchemaRegistryUser"
  );

  const webBackendAccessKey = new aws_iam.AccessKey(
    stack,
    "WebBackendSchemaRegistryAccessKey",
    {
      user: webBackendUser
    }
  );

  const schemaRegistry = new aws_glue.CfnRegistry(stack, "SchemaRegistry", {
    name: "SchemaHell"
  });

  webBackendUser.addToPolicy(
    new aws_iam.PolicyStatement({
      actions: [
        "glue:CreateSchema",
        "glue:RegisterSchemaVersion",
        "glue:ListSchemas",
        "glue:ListSchemaVersions",
        "glue:GetSchemaVersionsDiff",
        "glue:GetSchemaVersion",
        "glue:GetSchema"
      ],
      resources: [
        `arn:aws:glue:${stack.region}:${stack.account}:registry/${schemaRegistry.name}`,
        `arn:aws:glue:${stack.region}:${stack.account}:schema/*`
      ]
    })
  );

  webBackendUser.addToPolicy(
    new aws_iam.PolicyStatement({
      actions: ["glue:CheckSchemaVersionValidity"],
      resources: ["*"]
    })
  );
}
