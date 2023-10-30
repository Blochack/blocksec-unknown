# Chain Visual Explorer (CVE)
  A multichain visual explorer which traces the entire history of a transaction on any wallet address and illustrates it  in a tree diagram. 

![image](https://github.com/bytedeveloperr/CVE/assets/66218597/21f9cf07-9b2b-43b0-8936-1e0964acef31)

## Problem We Are Solving
This year, over $1.2 Billion have been lost to Hacks and rug Pulls. 
Companies and Security researchers spend a lot of time struggling to trace the transaction flow to discover the instance where the Hack took place. This is quite a daunting, error-prone and time-consuming experience.

## The Solution
 We present to you CVE (Chain Visual Explorer), a Multichain Visual Explorer that automatically traces and illustrates the entire history and transaction flow of funds of any wallet address. We make use of a tree diagram to illustrate the transaction for a more visual and easy-to-understand experience.
 
![image](https://github.com/bytedeveloperr/CVE/assets/66218597/0f8a7043-03f8-42ec-a582-193d2b582687)


## Benefits of CVE
-   It saves users and companies time by automating the process of tracing funds
-   It reduces the risk of human error in tracing a transaction flows from a wallet.
-   It decodes transaction messages, allowing you to see messages hidden in each transaction.
-   It alerts investors of malicious activity of a wallet such as if an address has been linked with a rug pull contract or HoneyPot Hack.


## Supported chains
- Ethereum
- Base
- Optimism
- Arbitrum One
- Avalanche C-Chain
- Fantom
- Polygon

  
## Technologies Used 
- Chainbase Transactions API
- Chainbabe RPC endpoints
- Ether.js
- React.js
- React D3 Tree
- Tailwind.css + Shadcn UI

## How To Use Chain Visual Explorer
1. Go to [Chain Visual Explorer](https://cve-v1.vercel.app)
2. Select the blockchain.
3. Enter a wallet address or an ENS domain name.
4. To explore addresses connected to each node, click on the node to expand the tree.

##  Video Demo
[Chain Visual Explorer Demo](https://www.loom.com/share/2f6ffa362d2b41648abf87dec38bc1f1?sid=21c9b7bd-c86b-477d-ae76-8af98429cac4)


##  Installation 
To install and run the project, follow these steps:

1. Clone the repository:

```
git clone https://github.com/hackatonbuilders/Ethereum-Visual-Explorer.git
```

2. Install the dependencies:

```
npm install
```

3. Start the project:

```
npm start
```

4. Open a web browser and navigate to

```
http://localhost:3000/
```
6.  Enter the wallet address you want to explore into the search bar and click "Explore"


## License

This project is licensed under the MIT license.



