# 1inch AI Agent by [Bitte](https://www.bitte.ai/)

This is a [Next.js](https://nextjs.org) project that implements an AI-powered agent for interacting with 1inch Fusion. The agent helps users generate and execute transactions on 1inch Fusion across supported EVM networks.

## Features

- Generate transaction data for 1inch Fusion
- Support for selling native assets (ETH, xDAI, POL, BNB)
- ERC20 token transfers
- WETH wrapping and unwrapping
- Price quotes and fee estimation for trades
- Support for multiple EVM networks

## API Endpoints

The agent exposes several endpoints:

- `/api/tools/1inch`: Quote prices and generate swap transactions
- `/api/tools/erc20`: Generate ERC20 transfer transactions
- `/api/tools/weth/wrap`: Generate WETH wrapping transactions
- `/api/tools/weth/unwrap`: Generate WETH unwrapping transactions

## Local Development

First, install the dependencies:

```bash
bun install
```

Then, run the development server:

```bash
bun dev
bun dev-testnet
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the Swagger UI.

## Environment Setup

The application requires the following environment variables:

- `BITTE_KEY`: JSON containing the account ID

## Learn More

To learn more about the technologies used in this project:

- [1inch Documentation](https://github.com/1inch/fusion-sdk) - Learn about 1inch
- [Bitte Documentation](https://docs.bitte.ai/) - Learn about Bitte and building AI agents
- [Next.js Documentation](https://nextjs.org/docs) - Learn about Next.js features and API

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme).

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.