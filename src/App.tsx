import React, {useEffect, useState} from 'react';
import Tree, {RawNodeDatum} from 'react-d3-tree';
import {
    Button,
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    Input,
    Select, SelectContent,
    SelectItem,
    SelectTrigger, SelectValue
} from "./components/ui";
import {
    chainsMapping,
    createChild,
    fetchTransactions,
    formatDecimals,
    fromWei,
    resolveEns,
    truncateAddress
} from './lib';
import {ChainInfo, CustomNodeDatum, TokenTransfer, Transaction} from "./lib/types";
import formatRelative from "date-fns/formatRelative"
import {useCenteredTree} from "./lib/hooks";
import {decodeTokenTransfers, tryDecodeTextInput} from "./lib/decode";
import {Arr} from "./components/icons/arr";
import {External} from "./components/icons/external";
import {Back} from "./components/icons/back";
import {useToast} from "./components/ui/use-toast";
import exploitersData from "./data/exploiters.json"
import {Alert, AlertDescription, AlertTitle} from "./components/ui/alert";
import {ExclamationTriangleIcon} from "@radix-ui/react-icons";

const defaultChain = {chainId: "1", name: "Ethereum", symbol: "ETH", explorer: "https://etherscan.io"}
const exploiters: { [key: string]: string } = {}
for (const address in exploitersData) {
    // @ts-ignore
    exploiters[address.toLowerCase()] = exploitersData[address]
}

function App() {
    const [address, setAddress] = useState('')
    const [isFetching, setIsFetching] = useState(false)
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [treeData, setTreeData] = useState<RawNodeDatum | undefined>()
    const [transactions, setTransactions] = useState<Transaction[]>([])
    const [transaction, setTransaction] = useState<Transaction | undefined>()
    const [currentChain, setCurrentChain] = useState<Omit<ChainInfo, "rpc">>(defaultChain)
    const [chains, setChains] = useState<Omit<ChainInfo, "rpc">[]>([])

    const {translate, containerRef} = useCenteredTree();
    const toast = useToast()

    useEffect(() => {
        const chains: Omit<ChainInfo, "rpc">[] = []

        for (const chainId in chainsMapping) {
            const chain = chainsMapping[chainId]
            chains.push({chainId, name: chain.name, symbol: chain.symbol, explorer: chain.explorer})
        }

        setChains(chains)
    }, [])

    function handleChainChange(chainId: string) {
        const chain = chains.find(chain => chain.chainId === chainId)
        if (chain) {
            setCurrentChain(() => chain)
        }
    }

    const loadTransactions = async (address: string) => {
        if (!address) {
            throw new Error("Address cannot be empty")
        }

        const transactions = await fetchTransactions({address, chainId: currentChain.chainId, count: 10})
        if (transactions.length < 1) return

        const rootTransaction = transactions.pop()
        const rootNode = createChild(rootTransaction)
        if (!rootNode) return

        for (let i = 0; i < transactions.length; i++) {
            const transaction = transactions[i]
            rootNode.children!.push(createChild(transaction))
        }

        setTreeData(rootNode)
        setTransactions([rootTransaction, ...transactions])
    }

    function addTransactionsToNodeDatum(nodeDatum: RawNodeDatum, transactions: Transaction[]) {
        function internalAddTransactions(currentNodeDatum: RawNodeDatum) {
            if (!currentNodeDatum.children) {
                currentNodeDatum.children = []
            }

            // @ts-expect-error
            if (currentNodeDatum.id == nodeDatum.id) {
                for (let i = 0; i < transactions.length; i++) {
                    const transaction = transactions[i]
                    currentNodeDatum.children.push(createChild(transaction))
                }
            } else {
                for (let i = 0; i < currentNodeDatum.children.length; i++) {
                    internalAddTransactions(currentNodeDatum.children[i])
                }
            }
        }

        if (treeData) {
            const newTreeData = {...treeData}
            internalAddTransactions(newTreeData)

            setTreeData(() => newTreeData)
            setTransactions((prev) => [...prev, ...transactions])
        }
    }

    const handleExploreButtonClick = async () => {
        try {
            setIsFetching(true)
            if (address.endsWith(".eth")) {
                if (currentChain.chainId !== "1") {
                    throw new Error("ENS domains are only available on ethereum")
                }

                const addr = await resolveEns(address);
                if (!addr) {
                    throw new Error("The provided ENS domain is invalid")
                }

                await loadTransactions(addr)
            } else {
                await loadTransactions(address)
            }
        } catch (e) {
            toast.toast({variant: "destructive", title: (e as unknown as Error).message})
        } finally {
            setIsFetching(false)
        }
    }

    const handleNodeClick = async (nodeDatum: CustomNodeDatum, hasChildren: boolean) => {
        try {
            if (nodeDatum.id) {
                const transaction = transactions.find(tx => tx.transaction_hash === nodeDatum.id)
                if (transaction) {
                    setTransaction(() => transaction)
                    setIsDialogOpen(true)

                    if (!hasChildren) {
                        const transactions = await fetchTransactions({address: transaction.to_address, count: 5, chainId: currentChain.chainId})
                        addTransactionsToNodeDatum(nodeDatum, transactions)
                    }

                    return
                }
            }

            throw new Error("Transaction not found")
        } catch (e) {
            toast.toast({variant: "destructive", title: (e as unknown as Error).message})
        }
    }

    const clearState = () => {
        setTreeData(undefined)
        setTransactions([])
    }

    const renderCustomNodeElement = ({nodeDatum}: { nodeDatum: CustomNodeDatum, toggleNode: () => void }) => (
        <g onClick={() => handleNodeClick(nodeDatum, (nodeDatum.children || []).length > 0)}>
            <circle
                r="10"
                // @ts-ignore
                className={nodeDatum.children && nodeDatum.children.length > 0 ? ((!!exploiters[nodeDatum?.attributes.from] || !!exploiters[nodeDatum?.attributes.to]) ? 'fill-destructive' : 'fill-primary') : ((!!exploiters[nodeDatum?.attributes.from] || !!exploiters[nodeDatum?.attributes.to]) ? 'stroke-destructive' : 'stroke-primary') + ' h-6 w-6'}
            />

            <text className='fill-gray-300' x="20">
                {nodeDatum.name}
            </text>
        </g>
    );

    return (
        <div>
            <div className='flex justify-center items-center mt-3'>
                <div className='w-full lg:w-1/2 mx-auto '>
                    <div className='border-b'>
                        <div className='flex justify-between items-center p-3'>
                            {treeData &&
                                <Button variant='ghost' onClick={clearState}>
                                    <Back className='w-4 h-4'/>
                                </Button>}

                            <h4 className='text-md md:text-xl font-semibold'>Chain Visual Explorer</h4>


                            <Select value={currentChain?.chainId} onValueChange={(value) => handleChainChange(value)}>
                                <SelectTrigger className="w-[85px] md:w-[180px]">
                                    <SelectValue placeholder="Select Chain"/>
                                </SelectTrigger>
                                <SelectContent>
                                    {
                                        chains.map(chain => <SelectItem
                                            key={chain.chainId}
                                            value={chain.chainId}>
                                            {chain.name}
                                        </SelectItem>)
                                    }
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {treeData && <div className='mt-5 container md:px-0'>
                        <p className='text-md flex items-center gap-1'>
                            <span>Address: </span>
                            <a
                                target='_blank'
                                href={`${currentChain.explorer}/address/${address}`}
                                className='text-sm text-gray-300'>
                                {address}
                            </a>
                        </p>
                    </div>}
                </div>
            </div>

            {treeData ?
                <div ref={containerRef} className='container w-full h-screen'>
                    <Tree
                        // @ts-expect-error
                        renderCustomNodeElement={renderCustomNodeElement}
                        separation={{siblings: 1.2, nonSiblings: 1.2}}
                        pathClassFunc={() => ['!stroke-white', '!stroke-1'].join(' ')}
                        translate={translate}
                        orientation='vertical'
                        data={treeData}
                        zoom={0.65}
                    />
                </div>
                :
                <div className='container flex h-screen justify-center items-center'>
                    <div className='h-auto w-full md:w-1/2'>
                        <h4 className='text-4xl font-bold text-center mb-10'>Chain Visual Explorer</h4>

                        <Input
                            type="text"
                            value={address}
                            placeholder='Enter an Ethereum address or ENS domain...'
                            onChange={(e) => setAddress(e.target.value)}
                            className="mt-1 py-6 mb-5 w-full"/>

                        <Button
                            className='mt-3 py-6 w-full'
                            onClick={handleExploreButtonClick}
                            disabled={isFetching}>
                            Explore
                        </Button>
                    </div>
                </div>

            }

            <TransactionDialog
                transaction={transaction}
                isOpen={isDialogOpen}
                chain={currentChain}
                toggleOpen={(open: boolean) => setIsDialogOpen(open)}
            />
        </div>
    );
}

const TransactionDialog = ({transaction, chain, isOpen, toggleOpen}: {
    isOpen: boolean,
    chain: Omit<ChainInfo, "rpc">,
    transaction?: Transaction,
    toggleOpen: (open: boolean) => void
}) => {
    const [txMsg, setTxMsg] = useState('')
    const [tokenTransfers, setTokenTransfers] = useState<TokenTransfer[]>([])
    const [loadingTransfers, setLoadingTransfers] = useState(false)

    useEffect(() => {
        async function loadTransfers() {
            setLoadingTransfers(true)
            const transfers = await decodeTokenTransfers(transaction!.transaction_hash, chain.chainId)
            if (transfers) {
                setTokenTransfers(() => transfers)
            }

            setLoadingTransfers(false)
        }

        if (transaction) {
            const msg = tryDecodeTextInput(transaction.input)
            if (msg) {
                setTxMsg(msg)
            }

            loadTransfers()
        }
    }, [transaction])

    return (
        <Dialog open={isOpen} onOpenChange={toggleOpen}>
            <DialogContent className="sm:max-w-[425px] overflow-y-scroll max-h-screen">
                <DialogHeader className='mb-5'>
                    <DialogTitle className='text-left'>Transaction</DialogTitle>
                </DialogHeader>

                {/*@ts-ignore*/}
                {(!!exploiters[transaction?.from_address.toLowerCase()] || !!exploiters[transaction?.to_address.toLowerCase()]) &&
                    <Alert variant="destructive">
                        <ExclamationTriangleIcon className="h-4 w-4"/>
                        <AlertDescription>
                            {/*@ts-ignore*/}
                            {`Some addresses involved in this transaction are reported to be associated with ${(exploiters[transaction?.from_address.toLowerCase()]?.toLowerCase() === exploiters[transaction?.to_address.toLowerCase()]?.toLowerCase()) ? exploiters[transaction?.from_address.toLowerCase()] : (exploiters[transaction?.from_address.toLowerCase()] && exploiters[transaction?.from_address.toLowerCase()]) ? exploiters[transaction?.from_address.toLowerCase()] + ' and ' + exploiters[transaction?.to_address.toLowerCase()] : exploiters[transaction?.from_address.toLowerCase()] ? exploiters[transaction?.from_address.toLowerCase()] : exploiters[transaction?.to_address.toLowerCase()]} exploit/hack`}
                        </AlertDescription>
                    </Alert>
                }
                <div className='text-center'>
                    <h4 className='text-md mb-3 font-semibdold'>Transaction Value</h4>
                    <h2 className='text-2xl font-semibold'>{fromWei(transaction?.value || "0")} {chain.symbol}</h2>
                </div>

                <ul className='divide-y text-sm'>
                    <li className='flex items-center justify-between py-3'>
                        <span>Chain</span>
                        <span>{chain.name}</span>
                    </li>

                    <li className='flex items-center justify-between py-3'>
                        <span>Transaction Hash</span>

                        <div className='flex items-center gap-1'>
                            <a
                                href={`${chain.explorer}/tx/${transaction?.transaction_hash}`}
                                className='text-primary'
                                target='_blank'>
                                {transaction?.transaction_hash ? truncateAddress(transaction.transaction_hash) : ''}
                            </a>

                            <External className='w-3 h-3'/>
                        </div>
                    </li>

                    <li className='flex items-center justify-between py-3'>
                        <span>Block Number</span>

                        <div className='flex items-center gap-1'>
                            <a
                                href={`${chain.explorer}/block/${transaction?.block_number}`}
                                className='text-primary'
                                target='_blank'>
                                {transaction?.block_number}
                            </a>

                            <External className='w-3 h-3'/>
                        </div>
                    </li>

                    <li className='flex items-center justify-between py-3'>
                        <span>Transaction Fee</span>
                        <span>{fromWei(transaction?.burnt_fee.toString() || '0')} {chain.symbol}</span>
                    </li>
                    <li className='flex items-center justify-between py-3'>
                        <span>Transaction Date</span>
                        <span>{formatRelative(new Date(transaction?.block_timestamp || "0"), new Date())}</span>
                    </li>
                </ul>

                <div className='mb-3'>
                    <h3 className='text-md font-bold'>Token Transfers</h3>
                    {loadingTransfers ? <p className='my-3 text-xs text-grey-500 text-center'>loading transfers...</p> :
                        <div className=''>
                            <>
                                {tokenTransfers.length > 0 ?
                                    <ul className='divide-y text-sm'>
                                        {tokenTransfers.map((transfer, i) =>
                                            <li key={i} className='py-3'>
                                                <p className='text-sm mb-2'>
                                                    Transferred {formatDecimals(transfer.value, transfer.token.decimals)} {transfer.token.symbol}
                                                </p>

                                                <div className='flex items-center text-xs gap-4'>
                                                    <div className='flex items-center gap-1'>
                                                        <a
                                                            href={`${chain.explorer}/address/${transfer.from}`}
                                                            className='text-primary'
                                                            target='_blank'>
                                                            {truncateAddress(transfer.from)}
                                                        </a>

                                                        <External className='w-3 h-3'/>
                                                    </div>

                                                    <Arr className='w-4 h-4'/>
                                                    <div className='flex items-center gap-1'>
                                                        <a
                                                            href={`${chain.explorer}/address/${transfer.to}`}
                                                            className='text-primary'
                                                            target='_blank'>
                                                            {truncateAddress(transfer.to)}
                                                        </a>

                                                        <External className='w-3 h-3'/>
                                                    </div>
                                                </div>
                                            </li>
                                        )}
                                    </ul>
                                    : <p className='my-3 text-xs text-grey-500 text-center'>No tokens transfer</p>
                                }
                            </>
                        </div>}
                </div>


                {txMsg &&
                    <div className='mb-3 min-w-0'>
                        <h3 className='text-md mb-3 font-bold'>Transaction Message</h3>
                        <span className='text-sm break-words'>{txMsg}</span>
                    </div>
                }
            </DialogContent>
        </Dialog>
    )
}
export default App;
