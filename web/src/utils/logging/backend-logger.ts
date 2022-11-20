import { withAxiom, type Logger } from "next-axiom";
import type { NextApiRequest } from "next";

export type NextApiRequestWithLogger = NextApiRequest & { log: Logger };

export const withLogger = withAxiom;
