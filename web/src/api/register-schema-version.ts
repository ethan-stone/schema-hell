import { useMutation, type UseMutationOptions } from "@tanstack/react-query";
import type {
  ErrorResBody,
  SuccessResBody,
  ReqBody,
  Query,
} from "../pages/api/schemas/[schemaName]/versions/index";
import { request } from "./basic-request";

async function registerSchemaVersion(args: ReqBody & Query) {
  return request<ReqBody, SuccessResBody, ErrorResBody>(
    `/api/schemas/${args.schemaName}/versions`,
    {
      method: "POST",
      body: {
        definition: args.definition,
      },
    }
  );
}

type Result = Awaited<ReturnType<typeof registerSchemaVersion>>;

type Opts = Omit<
  UseMutationOptions<Result, unknown, ReqBody & Query>,
  "mutationFn"
>;

export const useRegisterSchemaVersion = (opts?: Opts) => {
  return useMutation(registerSchemaVersion, opts);
};
