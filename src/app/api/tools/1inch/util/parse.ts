import { NextRequest } from "next/server";
import { getAddress, isAddress, parseUnits } from "viem";
import {
  getTokenDetails,
  TokenInfo,
  getSafeBalances,
  TokenBalance,
} from "@bitteprotocol/agent-sdk";
import { NATIVE_ASSET } from "../../util";

export type QuoteParams = {
  fromTokenAddress: string;
  toTokenAddress: string;
  amount: string;
  walletAddress: string;
  enableEstimate?: boolean;
  permit?: string;
  takingFeeBps?: number;
  source?: string;
  isPermit2?: boolean;
};

export interface ParsedQuoteRequest {
  quoteRequest: QuoteParams;
  chainId: number;
}

export async function parseQuoteRequest(
  req: NextRequest,
): Promise<ParsedQuoteRequest> {
  // TODO - Add Type Guard on Request (to determine better if it needs processing below.)
  const requestBody = await req.json();
  console.log("Raw Request Body:", requestBody);
  // TODO: Validate input with new validation tools:
  const {
    fromTokenAddress: sellToken,
    toTokenAddress: buyToken,
    chainId,
    amount: sellAmount,
    walletAddress: sender,
  } = requestBody;

  if (sellAmount === "0") {
    throw new Error("Sell amount cannot be 0");
  }

  const [balances, buyTokenData] = await Promise.all([
    getSafeBalances(chainId, sender),
    getTokenDetails(chainId, buyToken),
  ]);
  const sellTokenData = sellTokenAvailable(balances, sellToken);

  return {
    chainId,
    quoteRequest: {
      fromTokenAddress: sellTokenData.address,
      toTokenAddress: buyTokenData.address,
      amount: parseUnits(sellAmount, sellTokenData.decimals).toString(),
      walletAddress: sender,
    },
  };
}

function sellTokenAvailable(
  balances: TokenBalance[],
  sellTokenSymbolOrAddress: string,
): TokenInfo {
  let balance: TokenBalance | undefined;
  if (isAddress(sellTokenSymbolOrAddress, { strict: false })) {
    balance = balances.find(
      (b) =>
        getAddress(b.tokenAddress || NATIVE_ASSET) ===
        getAddress(sellTokenSymbolOrAddress),
    );
  } else {
    balance = balances.find(
      (b) =>
        b.token?.symbol.toLowerCase() ===
        sellTokenSymbolOrAddress.toLowerCase(),
    );
  }
  if (balance) {
    return {
      address: getAddress(balance.tokenAddress || NATIVE_ASSET),
      decimals: balance.token?.decimals || 18,
      symbol: balance.token?.symbol || "UNKNOWN",
    };
  }
  throw new Error("Sell token not found in balances");
}
