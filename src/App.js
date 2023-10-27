import { useCallback, useEffect, useState } from 'react';
import './App.css';
import { fetchTransactions, toEth } from './libs';
// import {select, selectAll} from "d3";
// import { ForceGraph } from './components/forceGraph';
import data from './data/data.json';
import Tree from 'react-d3-tree';

const nodes = [];
const links = []
const colors = [
  '#FF6633', '#FFB399', '#FF33FF', '#FFFF99', '#00B3E6',
  '#E6B333', '#3366E6', '#999966', '#99FF99', '#B34D4D',
  '#80B300', '#809900', '#E6B3B3', '#6680B3', '#66991A',
  '#FF99E6', '#CCFF1A', '#FF1A66', '#E6331A', '#33FFCC',
  '#66994D', '#B366CC', '#4D8000', '#B33300', '#CC80CC',
  '#66664D', '#991AFF', '#E666FF', '#4DB3FF', '#1AB399',
  '#E666B3', '#33991A', '#CC9999', '#B3B31A', '#00E680',
  '#4D8066', '#809980', '#E6FF80', '#1AFF33', '#999933',
  '#FF3380', '#CCCC00', '#66E64D', '#4D80CC', '#9900B3',
  '#E64D66', '#4DB380', '#FF4D4D', '#99E6E6', '#6666FF'
];

/* 
  - each node should represent eth being transfered at a transaction and links to represent 
  the origin and destination of a transaction or for mutiple transactions within each transaction.
  eg. A sends 3eth to B, then B later sends 0.5eth to Q, in that case we have 2 nodes and 2 links
  node1 = 3eth
  node2 = 0.5eth
  link1 = A-B
  link2 = B-Q

  assuming B is the target address and there were 4 sub transactions within the transaction B-Q
  sub-transaction1 = B-Q
  sub-transaction2 = B-F
  sub-transaction3 = B-A
  sub-transaction4 = B-Y

  we would now have 4 links
  link1 = B-Q
  link2 = B-F
  link3 = B-A
  link4 = B-Y
**/

function App() {
  const [txs, setTxs] = useState([])
  const customData = {}

  const fetchTxs = async () => {
    const res = await fetchTransactions("0x629e7Da20197a5429d30da36E77d06CdF796b71A")
    setTxs(res)
  }

  useEffect(() => {
    fetchTxs()
  }, [])

  useEffect(() => {
    customData.name = `${toEth(txs[0]?.value)}eth`
    const children = []
    for (let index = 1; index < txs.length; index++) {
      const tx = txs[index]
      const data = {}
      const name = tx.from.split('')
      const sentEth = (tx.value)
      const attr = `${toEth(sentEth)}eth`

      data.name = name
      if (parseInt(sentEth) > 0)
        data.attributes = {
          'Sent Eth': attr
        }
      // console.log(toEth(tx.value));
      // nodes.push({ name, color: colors[index] })

      // const source = index === 0 ? index : index - 1
      // const target = index === 19 ? 1 : index + 1
      // const value = Math.floor(Math.random() * 80);
      // links.push({ source, target, value, color: colors[index] })

    }
  }, [txs])

  return (
    <div className="App-header" style={{ width: '100%', height: '100vh' }}>
      <Tree data={data} />
    </div>
  );
}

export default App;
