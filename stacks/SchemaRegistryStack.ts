import {
  StackContext,
  Stack,
  Queue,
  Config
} from "@serverless-stack/resources";
import * as aws_glue from "aws-cdk-lib/aws-glue";
import * as aws_iam from "aws-cdk-lib/aws-iam";
import { env } from "./env";

type Env = {
  AWS_IAM_WEB_BACKEND_USER_ARN: string;
};

function getEnv(stack: Stack): Env {
  if (stack.stage !== "prod" && stack.stage !== "staging") {
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
    name: `${stack.stage}-SchemaHell`
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

  const QUEUE_URL = new Config.Parameter(stack, "QUEUE_URL", {
    value: schemaRegistry.name
  });

  const queue = new Queue(stack, "Queue", {
    consumer: {
      function: {
        handler: "functions/queueConsumer.main",
        timeout: 30,
        bind: [QUEUE_URL],
        permissions: [
          new aws_iam.PolicyStatement({
            effect: aws_iam.Effect.ALLOW,
            actions: [
              "glue:GetSchemaVersion",
              "glue:GetSchema",
              "glue:DeleteSchema",
              "glue:DeleteSchemaVersions"
            ],
            resources: [
              `arn:aws:glue:${stack.region}:${stack.account}:registry/${schemaRegistry.name}`,
              `arn:aws:glue:${stack.region}:${stack.account}:schema/*`
            ]
          })
        ]
      }
    }
  });

  // TODO: also give KMS permissions https://aws.amazon.com/premiumsupport/knowledge-center/sqs-accessdenied-errors/

  webBackendUser.addToPrincipalPolicy(
    new aws_iam.PolicyStatement({
      effect: aws_iam.Effect.ALLOW,
      actions: ["sqs:SendMessage"],
      resources: [queue.queueArn]
    })
  );
}
