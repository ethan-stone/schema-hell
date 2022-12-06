import { SQSClient } from "@aws-sdk/client-sqs";
export { SendMessageCommand } from "@aws-sdk/client-sqs";

export const sqsClient = new SQSClient({});
