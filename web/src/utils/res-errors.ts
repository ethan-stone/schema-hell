export type ValidationErrorRes<Errors> = {
  code: "VALIDATION_ERROR";
  message: string;
  errors: Errors;
};

export type InvalidRequestRes = {
  code: "INVALID_REQUEST";
  message: string;
};

export type InternalErrorRes = {
  code: "INTERNAL_ERROR";
  message: string;
};
