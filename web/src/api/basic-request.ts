export type FetchArgs<Body extends Record<string, unknown>> = {
  method: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
  body: Body;
};

export type Result<T, U> =
  | {
      ok: true;
      status: number;
      data: T;
    }
  | {
      ok: false;
      status: number;
      data: U;
    };

export async function request<
  ReqBody extends Record<string, unknown> = Record<string, unknown>,
  SuccessResBody = unknown,
  ErrorResBody = unknown
>(
  url: string,
  args: FetchArgs<ReqBody>
): Promise<Result<SuccessResBody, ErrorResBody>> {
  const res = await fetch(url, {
    method: args.method,
    body: JSON.stringify(args.body),
    headers: {
      "Content-Type": "application/json",
    },
  });

  const json = await res.json();

  if (!res.ok)
    return {
      ok: false,
      status: res.status,
      data: json as ErrorResBody,
    };

  return {
    ok: true,
    status: res.status,
    data: json as SuccessResBody,
  };
}
