### Repr AI bot - your DAO voting representative

Repr AI bot is a DAO voting representative that uses AI to analyze proposals and vote on behalf of the DAO members. The bot is designed to help DAO member make better decisions by providing unbiased, data-driven analysis of proposals.

![Logo](https://github.com/lourenc/mimique-core/assets/6189971/bf4eedfc-871d-4761-8ba8-53ad7666f7c0)

### Prerequisites

To run the project, you need to have to:

1. Install all dependencies:

```bash
yarn
```

2. Create a `.env` file by copying the `.env.example` file and filling in the required values:

```bash
cp .env.example .env
```

3. Run the bot:

```bash
yarn start
```

### Environment Variables

The following environment variables are required to deploy the contract:

| Variable            | Description                      | Example                      |
| ------------------- | -------------------------------- | ---------------------------- |
| `ANTHROPIC_API_KEY` | API Key for Anthropic AI         | `sk-ant-api03...ABkhkGHg`    |
| `TG_BOT_TOKEN`      | RPC URL for the Ethereum network | `7477777479:...AuMVgwer_gya` |
