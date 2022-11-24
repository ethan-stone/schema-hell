import { useMutation } from "@tanstack/react-query";
import type {
  ReqBody,
  SuccessResBody,
  ErrorResBody,
} from "../pages/api/check-schema-version-validity";
import { request } from "./basic-request";

async function checkSchemaVersionValidity(args: ReqBody) {
  return request<ReqBody, SuccessResBody, ErrorResBody>(
    "/api/check-schema-version-validity",
    {
      body: args,
      method: "POST",
    }
  );
}

export const useCheckSchemaVersionValidity = () => {
  return useMutation(checkSchemaVersionValidity);
};
