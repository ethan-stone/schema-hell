import { useMutation, type UseMutationOptions } from "@tanstack/react-query";
import type {
  ReqBody,
  ErrorResBody,
  SuccessResBody,
} from "../pages/api/schemas/index";
import { request } from "./basic-request";

async function createSchema(args: ReqBody) {
  return request<ReqBody, SuccessResBody, ErrorResBody>("/api/schemas", {
    body: args,
    method: "POST",
  });
}

type Result = Awaited<ReturnType<typeof createSchema>>;

type Opts = Omit<UseMutationOptions<Result, unknown, ReqBody>, "mutationFn">;

export const useCreateSchema = (opts?: Opts) => {
  return useMutation(createSchema, opts);
};
