import { withAxiom, type Logger } from "next-axiom";
import type { NextRequest } from "next/server";

export type NextRequestWithLogger = NextRequest & { log: Logger };

export const withLogger = withAxiom;
