import React, {useEffect, useState} from 'react';
import Tree, {RawNodeDatum, TreeNodeDatum} from 'react-d3-tree';
import {Button, Dialog, DialogContent, DialogHeader, DialogTitle, Input} from "./components/ui";
import {createChild, fetchTransactions, fromWei, truncateAddress} from './lib';
import {Transaction} from "./lib/types";
import formatRelative from "date-fns/formatRelative"
import {useCenteredTree} from "./lib/hooks";

// 0xF255161AF38F9ff3596261D91716A55c5345c62b

function App() {
    const [address, setAddress] = useState('')
    const [isFetching, setIsFetching] = useState(false)
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [transaction, setTransaction] = useState<Transaction | undefined>()
    const [treeData, setTreeData] = useState<RawNodeDatum | undefined>()
    const [transactions, setTransactions] = useState<Transaction[]>([])

    const {translate, containerRef} = useCenteredTree();

    const loadTransactions = async (address: string) => {
        if (!address) {
            alert("Adrress is required")
            return
        }

        const res = await fetchTransactions(address, 6)
        setTransactions(res)
    }

    const handleEploreClick = async () => {
        try {
            setIsFetching(true)
            await loadTransactions(address)
        } catch (e) {
            alert((e as unknown as Error).message)
        } finally {
            setIsFetching(false)
        }
    }

    const handleNodeClick = async (data: TreeNodeDatum) => {
        if (data.attributes?.hash) {
            const tx = transactions.find(tx => tx.transaction_hash === data.attributes!.hash)
            if (tx) {
                setTransaction(() => tx)
                setIsDialogOpen(true)
                return
            }
        }

        throw new Error("Transaction not found")
    }

    useEffect(() => {
        if (transactions && transactions.length === 0) return
        const rootData = createChild(transactions[0])

        let index = 1
        const children: RawNodeDatum['children'] = []
        let stillChecking = true

        const interval = setInterval(() => {
            if (!stillChecking) return
            const child = createChild(transactions[index])

            fetchTransactions(transactions[index].to_address, 4).then((res) => {
                let j = 0;

                const intervalId = setInterval(() => {
                    if (j < res.length) {
                        child.children?.push(createChild(res[j]));
                        j++;
                    } else {
                        clearInterval(intervalId); // Stop the interval when all items are processed
                    }
                }, 1000);
            })

            children.push(child)
            index += 1

            if (index >= transactions.length) {
                rootData.children = children

                console.log(rootData)
                setTreeData(rootData);
                stillChecking = false
            }
        }, 1000);

        console.log(stillChecking);
        return () => clearInterval(interval);
    }, [transactions])

    return (
        <div ref={containerRef} className='container flex h-screen justify-center items-center'>
            {treeData ?
                <Tree
                    onNodeClick={(v) => handleNodeClick(v.data)}
                    pathClassFunc={() => ['!stroke-white', '!stroke-1'].join(' ')}
                    translate={translate}
                    orientation='vertical'
                    data={treeData}
                />
                :
                <div className='h-auto w-full md:w-1/2'>
                    <h4 className='text-3xl font-semibold text-center my-8'>Ethereum Visual Explorer</h4>

                    <Input
                        type="text"
                        value={address}
                        placeholder='Enter an Ethereum address or ENS domain...'
                        onChange={(e) => setAddress(e.target.value)}
                        className="mt-1 py-6 mb-3 w-full"/>

                    <Button
                        className='mt-3 py-6 w-full'
                        onClick={handleEploreClick}
                        disabled={isFetching}>
                        Explore
                    </Button>
                </div>

            }

            <TransactionDialog
                transaction={transaction}
                isOpen={isDialogOpen}
                toggleOpen={(open: boolean) => setIsDialogOpen(open)}
            />
        </div>
    );
}

const TransactionDialog = ({transaction, isOpen, toggleOpen}: {
    isOpen: boolean,
    transaction?: Transaction,
    toggleOpen: (open: boolean) => void
}) => {
    return (
        <Dialog open={isOpen} onOpenChange={toggleOpen}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Transaction</DialogTitle>
                </DialogHeader>

                <ul className='divide-y text-sm'>
                    <li className='flex items-center justify-between py-3'>
                        <span>Transaction Hash</span>
                        <span>{transaction?.transaction_hash ? truncateAddress(transaction.transaction_hash) : ''}</span>
                    </li>
                    <li className='flex items-center justify-between py-3'>
                        <span>Chain</span>
                        <span>Ethereum</span>
                    </li>
                    <li className='flex items-center justify-between py-3'>
                        <span>Transaction Date</span>
                        <span>{formatRelative(new Date(transaction?.block_timestamp || "0"), new Date())}</span>
                    </li>
                </ul>

                <div className='text-center'>
                    <h4 className='text-md mb-3 font-semibdold'>Transfer</h4>
                    <h2 className='text-2xl font-semibold'>{fromWei(transaction?.value || "0")} ETH</h2>
                </div>
            </DialogContent>
        </Dialog>
    )
}
export default App;
