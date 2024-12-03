import { NextRequest, NextResponse } from "next/server";
import { getSafeBalances } from "@bitteprotocol/agent-sdk";
import { Address } from "viem";
import { validateRequest } from "../util";
import {
  addressField,
  FieldParser,
  numberField,
  validateInput,
} from "@bitteprotocol/agent-sdk";

interface Input {
  chainId: number;
  safeAddress: Address;
}

const parsers: FieldParser<Input> = {
  chainId: numberField,
  safeAddress: addressField,
};

export async function GET(req: NextRequest): Promise<NextResponse> {
  const headerError = await validateRequest(req);
  if (headerError) return headerError;

  const search = req.nextUrl.searchParams;
  console.log("Request: balances/", search);
  try {
    const { chainId, safeAddress } = validateInput<Input>(search, parsers);
    const balances = await getSafeBalances(chainId, safeAddress);
    console.log(`Retrieved ${balances.length} balances for ${safeAddress}`);
    return NextResponse.json(balances, { status: 200 });
  } catch (error: unknown) {
    const message =
      error instanceof Error
        ? error.message
        : `Unknown error occurred ${String(error)}`;
    return NextResponse.json({ ok: false, message }, { status: 400 });
  }
}
