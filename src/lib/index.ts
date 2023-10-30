import {RawNodeDatum} from "react-d3-tree";
import {ChainInfo, Transaction} from "./types";
import {ethers, JsonRpcProvider} from "ethers";


const formatRpcUrl = (slug: string) => "https://{{slug}}.s.chainbase.com/v1/2XLh8wLw6X7KMW5DhD28r2HgHr1".replace("{{slug}}", slug);
export const chainsMapping = {
    1: {name: "Ethereum", rpc: formatRpcUrl("ethereum-mainnet"), symbol: "ETH", explorer: "https://etherscan.io"},
    8453: {name: "Base", rpc: formatRpcUrl("base-mainnet"), symbol: "ETH", explorer: "https://basescan.org"},
    250: {name: "Fantom", rpc: formatRpcUrl("fantom-mainnet"), symbol: "FTM", explorer: "https://ftmscan.com"},
    137: {name: "Polygon", rpc: formatRpcUrl("polygon-mainnet"), symbol: "MATIC", explorer: "https://polygonscan.com"},
    10: {name: "Optimism", rpc: formatRpcUrl("optimism-mainnet"), symbol: "ETH", explorer: "https://optimistic.etherscan.io"},
    42161: {name: "Arbitrum One", rpc: formatRpcUrl("arbitrum-mainnet"), symbol: "ETH", explorer: "https://arbiscan.io"},
    43114: {name: "Avalanche C-Chain", rpc: formatRpcUrl("avalanche-mainnet"), symbol: "AVAX", explorer: "https://subnets.avax.network/c-chain"},
} as { [x: string]: Omit<ChainInfo, "chainId"> }

export const fetchTransactions = async ({address, count, chainId}: { address: string, count: number, chainId: string }) => {
    let url = `https://api.chainbase.online/v1/account/txs?`
    url += `&chain_id=${chainId}&address=${address}&from_block=0`
    url += `&page=1&limit=${count}`

    const headers = {'x-api-key': '2XLh8wLw6X7KMW5DhD28r2HgHr1'}
    const response = await fetch(url, {method: 'GET', headers})
    if (response.status === 429) {
        throw new Error("Rate limited! Too many requests, Please try again later")
    }

    const json = await response.json()
    return json.data || []
}

export const fromWei = (amount: string) => {
    return ethers.formatEther(amount).toString()
}

export const formatDecimals = (value: string, decimals: number) => {
    return ethers.formatUnits(value, decimals).toString()
}

export const truncateAddress = (inputString: string) => {
    if (inputString.length < 8) {
        throw new Error("Invalid Address");
    }

    const f = inputString.substring(0, 4);
    const l = inputString.substring(inputString.length - 4);
    return `${f}...${l}`
}

export const createChild = (tx: Transaction) => {
    return {
        name: truncateAddress(tx.from_address),
        id: tx.transaction_hash,
        attributes: {from: tx.from_address.toLowerCase(), to: tx.to_address.toLowerCase()},
        children: []
    } as RawNodeDatum;
}

export const resolveEns = (domain: string) => {
    const provider = new JsonRpcProvider(chainsMapping[1].rpc)
    return provider.resolveName(domain)
}