import { useMutation, type UseMutationOptions } from "@tanstack/react-query";
import type {
  ReqBody,
  ErrorResBody,
  SuccessResBody,
} from "../pages/api/schemas/index";
import { request } from "./basic-request";

async function createSchema(args: ReqBody) {
  const res = await request<ReqBody, SuccessResBody, ErrorResBody>(
    "/api/schemas",
    {
      body: args,
      method: "POST",
    }
  );

  if (res.ok) return res.data;
  throw res.data;
}

type Opts = Omit<
  UseMutationOptions<SuccessResBody, ErrorResBody, ReqBody>,
  "mutationFn"
>;

export const useCreateSchema = (opts?: Opts) => {
  return useMutation(createSchema, opts);
};
