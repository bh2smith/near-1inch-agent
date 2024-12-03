import { parseQuoteRequest } from "@/src/app/api/tools/1inch/util/parse";
import { type NextRequest, NextResponse } from "next/server";
import { orderRequestFlow } from "./util/orderFlow";
import { validateRequest } from "../util";

// Refer to https://api.cow.fi/docs/#/ for Specifics on Quoting and Order posting.

export async function POST(req: NextRequest): Promise<NextResponse> {
  const headerError = await validateRequest(req);
  if (headerError) return headerError;

  try {
    const parsedRequest = await parseQuoteRequest(req);
    console.log("POST Request for quote:", parsedRequest);
    const orderData = await orderRequestFlow(parsedRequest);
    console.log("Responding with", orderData);
    return NextResponse.json(orderData, { status: 200 });
  } catch (e: unknown) {
    const message = JSON.stringify(e);
    console.error(message);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
