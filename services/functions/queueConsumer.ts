import { SQSHandler } from "aws-lambda";
import { GlueClient } from "@aws-sdk/client-glue";

const glueClient = new GlueClient({});

export const main: SQSHandler = async (event) => {};
