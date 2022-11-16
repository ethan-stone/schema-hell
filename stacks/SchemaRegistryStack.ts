import { StackContext, Stack } from "@serverless-stack/resources";
import * as aws_glue from "aws-cdk-lib/aws-glue";
import * as aws_iam from "aws-cdk-lib/aws-iam";
import { env } from "./env";

type Env = {
  AWS_IAM_WEB_BACKEND_USER_ARN: string;
};

function getEnv(stack: Stack): Env {
  if (stack.stage !== "prod" && stack.stage !== "dev") {
    return process.env as Env;
  }
  return env[stack.stage];
}

export function SchemaRegistryStack({ stack }: StackContext) {
  const webBackendUser = aws_iam.User.fromUserArn(
    stack,
    "WebBackendIAMUser",
    getEnv(stack).AWS_IAM_WEB_BACKEND_USER_ARN
  );

  const schemaRegistry = new aws_glue.CfnRegistry(stack, "SchemaRegistry", {
    name: "SchemaHell"
  });

  webBackendUser.addToPrincipalPolicy(
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

  webBackendUser.addToPrincipalPolicy(
    new aws_iam.PolicyStatement({
      actions: ["glue:CheckSchemaVersionValidity"],
      resources: ["*"]
    })
  );
}
