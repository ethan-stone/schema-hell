import { useMutation, type UseMutationOptions } from "@tanstack/react-query";
import type {
  ErrorResBody,
  SuccessResBody,
  ReqBody,
  Query,
} from "../pages/api/schemas/[schemaName]/versions/index";
import { request } from "./basic-request";

async function registerSchemaVersion(args: ReqBody & Query) {
  const res = await request<ReqBody, SuccessResBody, ErrorResBody>(
    `/api/schemas/${args.schemaName}/versions`,
    {
      method: "POST",
      body: {
        definition: args.definition,
      },
    }
  );

  if (res.ok) return res.data;
  throw res.data;
}

type Opts = Omit<
  UseMutationOptions<SuccessResBody, ErrorResBody, ReqBody & Query>,
  "mutationFn"
>;

export const useRegisterSchemaVersion = (opts?: Opts) => {
  return useMutation(registerSchemaVersion, opts);
};
