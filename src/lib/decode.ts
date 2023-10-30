import {ethers, JsonRpcProvider} from "ethers";
import {chainsMapping} from "./index";
import {TokenTransfer} from "./types";

const eventInterface = ['event Transfer(address indexed from, address indexed to, uint256 value)'];

const ERC20ABI = [
    {
        "constant": true,
        "inputs": [],
        "name": "decimals",
        "outputs": [
            {
                "name": "",
                "type": "uint8"
            }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    },

    {
        "constant": true,
        "inputs": [],
        "name": "symbol",
        "outputs": [
            {
                "name": "",
                "type": "string"
            }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    },

];


export const decodeTokenTransfers = async (hash: string, chainId: string) => {
    try {
        const provider = new JsonRpcProvider(chainsMapping[chainId].rpc)
        const tokensCache: { [x: string]: TokenTransfer['token'] } = {}
        const receipt = await provider.getTransactionReceipt(hash);
        const iface = new ethers.Interface(eventInterface);
        const transferSignature = ethers.id("Transfer(address,address,uint256)")

        if (!receipt) return

        const transfers: TokenTransfer[] = []
        for (let i = 0; i < receipt.logs.length; i++) {
            const log = receipt.logs[i]
            const hasSignature = log.topics.find(topic => topic === transferSignature)
            if (!!hasSignature) {
                // @ts-ignore
                const parsed = iface.parseLog(log);
                if (parsed) {
                    const data = parsed.args.toObject() as Omit<TokenTransfer, "token">

                    if (!tokensCache[log.address]) {
                        const contract = new ethers.Contract(log.address, ERC20ABI, provider);
                        const [symbol, decimals] = await Promise.all([contract.symbol(), contract.decimals()])

                        tokensCache[log.address] = {symbol, decimals: Number(decimals), address: log.address}
                    }

                    transfers.push({
                        to: data.to,
                        from: data.from,
                        value: data.value,
                        token: tokensCache[log.address]
                    })
                }
            }
        }

        return transfers
    } catch (error) {
        console.log((error as unknown as Error).message)
    }
}

export function tryDecodeTextInput(hex: string) {
    try {
        return ethers.toUtf8String(hex)
    } catch (e) {
        return
    }
}