import { useMutation } from "@tanstack/react-query";
import type {
  ReqBody,
  SuccessResBody,
  ErrorResBody,
} from "../pages/api/check-schema-version-validity";
import { request } from "./basic-request";

async function checkSchemaVersionValidity(args: ReqBody) {
  const res = await request<ReqBody, SuccessResBody, ErrorResBody>(
    "/api/check-schema-version-validity",
    {
      body: args,
      method: "POST",
    }
  );

  console.log(res);
  if (res.ok) return res.data;
  throw res.data;
}

export const useCheckSchemaVersionValidity = () => {
  return useMutation<SuccessResBody, ErrorResBody, ReqBody>(
    checkSchemaVersionValidity
  );
};
