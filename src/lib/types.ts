import {TreeNodeDatum} from "react-d3-tree";

export interface Transaction {
    gas: number,
    value: string,
    burnt_fee: number,
    from_address: string,
    block_number: number,
    block_timestamp: string,
    contract_address: string,
    cumulative_gas_used: number,
    effective_gas_price: number,
    gas_price: number,
    gas_used: number,
    input: string,
    max_fee_per_gas: number,
    max_priority_fee_per_gas: number,
    nonce: number,
    saving_fee: number,
    status: number,
    to_address: string,
    transaction_hash: string,
    transaction_index: number,
    tx_fee: number,
    type: number,
}

export interface ChainInfo {
    rpc: string,
    chainId: string,
    name: string,
    symbol: string
    explorer: string
}

export interface TokenTransfer {
    from: string
    to: string
    value: string
    token: {
        symbol: string
        address: string
        decimals: number
    }
}

export interface CustomNodeDatum extends TreeNodeDatum {
    id: string
}
