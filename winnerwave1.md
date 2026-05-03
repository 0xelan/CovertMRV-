Blindference   https://github.com/baync180705/blindference
Hidden
Blindference
Your data and weights, both secured
PAAS
Machine Learning
Updates in this Wave
Original Product


Milestone
10points

Privacy Architecture
10
Innovation & Originality
10
User Experience
8
Technical Execution
9
Market Potential
8
Alex_Fhenix0
review10
Voting Details
Grant
500 USDC

7
Voted (1st Wave)
review
review
2026-04-09 19:01
Good job on this update, looking forward to the next feature!

 
Voted (1st Wave)
Alex_Fhenix
Alex_Fhenix
2026-04-07 03:56
Really cool and new idea, looking forward to see more progress here. Would be cool to see escrow using confidential tokens.


Lendi   https://github.com/LendiXYZ/lendi-landing-page 
Prove what you earn. Reveal nothing. FHE-powered private lending for LATAM's informal economy.
Privacy Infrastructure
Confidential DeFi
RWA & Compliance
Deliverable
Updates in this Wave
Wave 1 — Foundation

Lendi is a two-sided trust protocol for informal workers in LATAM. Borrowers prove income without revealing it. Lenders deploy capital without unprotected default risk. Neither side trusts the other — they both trust the protocol.
------------------------------------------------------------------------------------

Smart Contracts — deployed and verified on Arbitrum Sepolia

- InformalProof.sol — 0x2b87fC209861595342d36E71daB22839534d4aC7
Core FHE contract. Workers accumulate encrypted monthly income via recordIncome(InEuint64). Lenders call proveIncome(address, uint64) which runs FHE.gte() on two ciphertexts — neither income nor threshold is decrypted. Returns only ebool. Full ACL: FHE.allowThis() after every mutation, FHE.allow(worker) on income, FHE.allow(lender) on result.
https://sepolia.arbiscan.io/address/0x2b87fC209861595342d36E71daB22839534d4aC7

- InformalProofGate.sol — 0x7cb8c6eDc4a135112fD0fB98ecDC4667E168e38b
Implements IConditionResolver from ReinieraOS. Called by ConfidentialEscrow before releasing funds. Bridges Lendi's FHE income proof into the ReinieraOS escrow lifecycle without exposing any income data.
https://sepolia.arbiscan.io/address/0x7cb8c6eDc4a135112fD0fB98ecDC4667E168e38b

24 tests passing — registration, income accumulation, ACL enforcement, threshold verification, gate condition checks, monthly reset, and full end-to-end flow. All run locally with CoFHE 
mock contracts.

Co-build with ReinieraOS/Privara — ConfidentialEscrow, FHE-encrypted ProtectionPool, and IConditionResolver already integrated into architecture. Wave 2 starts March 30.

------------------------------------------------------------------------------------

Deliverables
Landing — https://lendi-ten.vercel.app
Live qualification studio with interactive income/threshold slider. Separate borrower and lender paths.

Demo — https://lendi-ten.vercel.app/demo
Wallet on Arbitrum Sepolia, encrypted income recording, lender proof returning ✅ or ❌ only.

Docs — https://github.com/InformalProof/documentation
README, PRODUCT.md, ARCHITECTURE.md (Mermaid diagrams), WAVES.md (exit criteria per wave), USERandDATAFLOW.md.

dApp — https://github.com/InformalProof/dapp


Milestone
10points

Privacy Architecture
9
Innovation & Originality
9
User Experience
9
Technical Execution
8
Market Potential
10
review10
grimnote0
Voting Details
Grant
500 USDC

2
Voted (1st Wave)
review
review
2026-04-09 19:06
Good job on this update, looking forward to the next feature!

 
Voted (1st Wave)
grimnote
grimnote
2026-04-07 01:04
Great idea, perfectly suited to developing markets with deep understanding of Latin America and localization.

1. Privacy-Market Fit: P2P lending is vital for individuals and businesses in developing markets, making privacy the ultimate feature for data and personal safety.
2. Lender Protection: Novel approach matching FHE with automatic dispute resolution.
3. UX: ZeroDev eliminates user friction, Reineira Atlas ensures production readiness. Consider using Superpowers framework with Claude Code to polish UI/UX to pixel-perfect level (out of scope for this wave, just a note).
4. Technical Execution: Excellent — all Reineira modules, deep architecture, and user flows well described. Missing piece: deeper risk-scoring architecture paired with zkTLS and diverse sources for on-chain verification and scoring complexity.
5. Growth Potential: P2P lending as PoC can become the Latin American lending standard across niches: agriculture, autos, and beyond.






Prova  https://github.com/AJTECH001/Prova 
on-chain trade credit insurance for SMEs
Privacy
GitHub
Updates in this Wave
For this first wave, our primary objective was validation before writing the core protocol logic. We gathered direct user feedback from SME exporters to confirm that strict privacy for their B2B data was a non-negotiable feature. Based on this, we finalized the Prova technical architecture around Fhenix encryption and ReineiraOS settlement. Finally, we defined our Go-To-Market strategy and business model to specifically target single-invoice trade credit for emerging markets that are currently locked out by traditional insurers.


Milestone
10points

Privacy Architecture
10
Innovation & Originality
10
User Experience
6
Technical Execution
8
Market Potential
10
review10
grimnote0
Voting Details
Grant
500 USDC

2
Voted (1st Wave)
review
review
2026-04-09 19:07
Good job on this update, looking forward to the next feature!

 
Voted (1st Wave)
grimnote
grimnote
2026-04-07 01:36
Exceptional privacy architecture — FHE-encrypted underwriting where risk is computed on ciphertext, client-side encryption, preventing info leakage, and zkTLS via Reclaim Protocol for payment verification.

1. Innovation: First on-chain trade credit insurance. Maple/Goldfinch built $2B+ in credit — none insure non-payment. New category, not iteration.
2. Market: $2.5T insured receivables, 3 incumbents structurally can't serve SMEs under $1M. TradeLens ($100M+) shut down because transparent ledgers exposed competitive data — Prova solves exactly this.
3. Technical: Clean dual-plugin architecture, deep protocol understanding with clear diagrams. 
4. UX Gap: Strong protocol, no user journeys or account abstraction. SME exporters or any other endusers in emerging markets need zero-friction onboarding.
5. Nigeria → UK, Kenya → India are high-velocity corridors where $5K–$50K invoice protection is massively underserved — exactly the gap incumbents refuse to fill.

 



https://github.com/0xOucan/Z0tz  Z0tz — FHE-native wallet stack
FHE-native private wallet stack — passkeys, encrypted balances, stealth payments, gasless.
Wallet Infrastructure
Privacy Infrastructure
Onboarding
GitHub
Updates in this Wave
🚀Z0tz evolved from concept to a working FHE-native wallet stack — deployed, verified, and tested across 3 chains 🦇

📦 Contracts (27 verified across Base, Eth, Arb Sepolia)
🔐 Z0tzTokenV2 — FHERC20 (permissionless shield/unshield)
🪪 Z0tzAccount — ERC-4337 + P-256 passkeys
⛽ Z0tzPaymaster — gasless UX (1% token fee, self-sovereign)
🏭 Z0tzAccountFactory — CREATE2 deployments
🛡️ RecoveryModule — guardian + commitment + delay
👻 StealthRegistry / Announcer / Sweeper — ERC-5564/6538
🌉 Z0tzBridge — lock-and-mint cross-chain
⌨️ CLI — fully gasless

All operations work without ETH:

🔑 create-passkey — no seed phrases
🚀 deploy — smart account deployment
🔄 shield / unshield — USDC ↔ eUSDC
🔐 send-aa — FHE encrypted transfers (CoFHE SDK)
🥷 stealth — unlinkable payments
🌉 bridge — cross-chain transfers

👉 All executed via relayer + paymaster

⛽ Relayer + Paymaster
🌐 Relayer submits UserOps
⛽ Paymaster sponsors all gas
🧠 Users never hold ETH — not even for deployment
🚀 Landing page doubles as live relayer (Vercel)
🎥 End-to-End Demo

Full flow executed:
Deploy → Faucet → Shield → FHE Transfer → Unshield → Stealth → Bridge

⚡ 16 relayer UserOps
👥 Multi-user scenario
🌐 Multi-chain execution
🌐 Landing Page + Relayer
🧪 Interactive CLI simulator
🔗 27 contract explorer links
⚡ Live relayer API (same deployment)
🔐 Built on Fhenix
🧠 Fhenix → FHE encryption layer
🦇 Z0tz → wallet identity, gasless UX, stealth payments, cross-chain bridge, steganographic recovery
🔗 Links
Repo: https://github.com/0xOucan/Z0tz
Demo: https://www.youtube.com/watch?v=_G2mCF_rtAY
Landing + Relayer: https://z0tz-landing-page.vercel.app


Milestone
10points

Privacy Architecture
8
Innovation & Originality
8
User Experience
6
Technical Execution
8
Market Potential
9
review10
laurenmxv0
Voting Details
Grant
500 USDC

2
Voted (1st Wave)
review
review
2026-04-09 18:47
Good Job on this wave, Looking forward to the next update!

 
Voted (1st Wave)
laurenmxv
laurenmxv
2026-04-05 15:32
love the idea and the work you've done so far!! some things to look out for:
Shield / unshield / faucet: Event amounts are public, only in-wallet FHE activity stays private.
Executed: Logs full calldata - calls are visible; don’t claim zero on-chain footprint.



https://github.com/Iam-jayant/walnut  walnut
Private lending, finally. Borrow and manage positions without exposing your data.
DeFi
Lending Protocol
Market Infrastructure
Updates in this Wave
In Wave 1, I focused on validating the core idea of private lending and building a working end-to-end encrypted flow.

links -
visit - http://walnut-finance.vercel.app/
Explainer video - https://youtu.be/VF7ACZPrmc0
Github repo - http://github.com/Iam-jayant/walnut

We built a functional prototype of Walnut with the following:
- A clean landing page that communicates the concept of privacy-first lending
- A working app interface with dashboard, deposit, borrow, and demo flows
- Wallet connection and network handling (Sepolia)

End-to-end encrypted pipeline:
- user inputs are encrypted in the browser
- encrypted values are sent to the smart contract
- contract stores only encrypted state
- data is fetched and decrypted locally using permit-based access

We implemented:
>> CoFHE-based smart contract using encrypted types
>> Frontend integration using @cofhe/react for encryption and decryption
>> Permit-based access control for decrypting user-specific data
>> Clear UI states for network mismatch, missing permit, and decryption status

We also focused heavily on demo reliability:
- Eliminated mock data and ensured all values come from the contract
- Added system status indicators (wallet, network, permit)
- Handled failure states to avoid silent errors during demo

This wave validates that private state, computation, and controlled decryption work correctly in a real application flow.


Milestone
10points

Privacy Architecture
9
Innovation & Originality
9
User Experience
9
Technical Execution
9
Market Potential
8
review10
laurenmxv0
Voting Details
Grant
500 USDC

2
Voted (1st Wave)
review
review
2026-04-09 18:46
Good Job on this wave, Looking forward to the next update!

 
Voted (1st Wave)
laurenmxv
laurenmxv
2026-04-07 21:44
love love love the UX here, and the project & roadmap is clearly well thought through - great work so far
quick note to review the docs for the new decrypt flow and add tx-side decrypt lifecycle support where publish-on-chain decrypt is needed.

 

https://github.com/Sparexonzy95/zalary-frontend   Zalary
Confidential on-chain payroll. Every salary encrypted. Zero plaintext. Built for institutions.
RWA & Compliance
Confidential DeFi
Private Payments
Updates in this Wave
Concept and Architecture Submission

Zalary is a fully production-deployed confidential payroll system built on Base Sepolia using TEE-based encryption. This wave establishes the complete architectural foundation for porting Zalary to Fhenix CoFHE FHE.

What exists today in production:

A working end-to-end confidential payroll system with six Docker containers running in production Django backend, PostgreSQL, Celery workers, Redis, a Node.js TEE encryptor service, and a viem blockchain worker. The full employer and employee payroll flow is live and functional.

Employer flow: Create template → define schedule (instant, weekly, monthly) → add employees → encrypt salaries via TEE → fund PayrollVault escrow → activate payroll run

Employee flow: Connect wallet → request claim → TEE KMS attestation bound to employee wallet → finalize claim → receive funds → convert to USDC

Architecture design for Fhenix migration:

The current TEE implementation maps directly to Fhenix CoFHE. euint256 salary handles become euint64 FHE encrypted handles. TEE ACL per employee becomes FHE.allow(salary, employee). TEE attestedDecrypt becomes client.decryptForView(ctHash, FheTypes.Uint64). The TEE encryptor server is replaced entirely by @cofhe/sdk client-side encryption  no trusted server required.

Deliverables:
Live Dapp: https://zalary-frontend.vercel.app
Demo Video: https://youtu.be/bxZrmDL84y4
GitHub: https://github.com/Sparexonzy95/zalary-frontend
Contract: https://sepolia.basescan.org/address/0x6ACbEE7Dd0817e286eF858EB8f4bDAc0C0A242dD


Milestone
10points

Privacy Architecture
6
Innovation & Originality
6
User Experience
5
Technical Execution
4
Market Potential
7
review10
laurenmxv0
Voting Details
Grant
500 USDC

2
Voted (1st Wave)
review
review
2026-04-09 18:46
Good Job on this wave, Looking forward to the next update!

 
0xklint
0xklint
2026-04-09 21:30
Thank you 🙏

 
Voted (1st Wave)
laurenmxv
laurenmxv
2026-04-07 23:59
solid foundation and strong move pivoting to FHE - lmk how we can support

 
0xklint
0xklint
2026-04-08 02:00
Thank you, that means a lot. To answer your question directly, grant funding would be the most impactful form of support at this stage.
Zalary is already fully deployed in production with the core payroll flows live and functional. The focus now is completing the migration to Fhenix CoFHE, eliminating any reliance on a trusted server entirely. Grant support would directly fund the two areas that matter most going into the next waves, a significantly improved user experience and a production grade FHE integration that demonstrates the full potential of the Fhenix ecosystem.
Happy to provide any additional documentation or answer questions from the judging panel.



https://github.com/PhanTom497/CipherRoll   CipherRoll
Private Payroll. Blind Execution.
Privacy
Payments
Enterprise
Updates in this Wave
Live Deliverables:
Deployed Application: https://cipher-roll.vercel.app
Official Documentation: https://cipher-roll.vercel.app/docs
Live Demo Video: https://youtu.be/HryZFOa2eUY

We built CipherRoll to serve as the premier, enterprise-grade payroll protocol running natively on the Fhenix EVM. Rather than relying on clunky off-chain ZK-provers, we built a fully autonomous system that computes complex treasury logic symmetrically within encrypted Ethereum states.

1. Core FHE Smart Contract Engineering:

Encrypted State Creation: Developed CipherRollPayroll.sol, completely replacing plaintext tracking with the euint128 data structure utilizing the @fhenixprotocol/cofhe-contracts integration.
Homomorphic Math Operations: Programmed the EVM host to natively compute budget deposits and payroll deductions using FHE.add and FHE.sub directly over ciphertexts constraint, meaning the chain processes financial data it is mathematically blind to.
Zero-Leakage Reverts: Implemented FHE.select combined with encrypted booleans (ebool) to evaluate treasury capacities dynamically. This ensures the protocol can gracefully handle insufficient fund scenarios without leaking the exact budget shortage via a standard Solidity revert message.
Strict Access Scoping: Hardcoded strict data access mechanisms utilizing FHE.allowThis() mapping concurrent with FHE.allow(..., msg.sender). This legally isolates encrypted handles, rendering the global data immune to open-RPC scraping and malicious network validators.
2. Cryptographic Security & Decryption:

EIP-712 Permit Enforcement: Designed a robust gateway requiring users to sign a specific EIP-712 read permit via their EVM wallet before the Fhenix TaskManager will release an encrypted handle to them.
In-Browser WASM Unsealing: We entirely bypassed the legacy model of trusting "proxy decryption servers". CipherRoll integrates cofhejs, pulling the ciphertext payload and executing the decryption natively inside the user's local browser memory. No backend server ever witnesses the plaintext integers.
3. Enterprise Web3 Frontend:

Next.js 14 Premium UI: Built a highly polished, high-conversion frontend styled precisely for DAO and Web3 corporate operations, utilizing TailwindCSS, Framer Motion, and distinct glassmorphism aesthetics.
Role-Based Isolated Workspaces: Developed the /admin portal (for workspace creation, Keccak256 hashed unique payment tracking, and budget injections) segregated entirely from the /employee portal (where end-users connect their wallet and use explicit permits to unseal only their single payroll checks).
Real-Time Data Polling: Engineered autonomous data refresh cycles securely bound to Ethers.js. The moment a homomorphic payroll transaction clears the network, the UI automatically requests newly updated encrypted handles from the contract and drops them seamlessly onto the user's dashboard.


Milestone
10points

Privacy Architecture
4
Innovation & Originality
6
User Experience
9
Technical Execution
4
Market Potential
3
review10
laurenmxv0
Voting Details
Grant
500 USDC

2
Voted (1st Wave)
review
review
2026-04-09 18:48
Good Job on this wave, Looking forward to the next update!

 
Voted (1st Wave)
laurenmxv
laurenmxv
2026-04-08 00:48
strong use case/narrative and beautiful UX
be aware of any AI hallucinations of the fhenix L2 and ensure all deployments pt to arb or base sepolia
plan to migrate to the new cofhesdk asap

 


Blank
Private payments for the real world — transaction amounts encrypted with FHE on Base
Privacy
Payment
Updates in this Wave
Blank is a fully functional encrypted payment super-app with 16 deployed smart contracts on Base Sepolia, 28
  unique FHE operations, and a production-grade React frontend with 23 screens.

  WHAT'S LIVE (https://blank-omega-jade.vercel.app):

  Core Payments:
  - Encrypted wallet with shield/unshield (public USDC → encrypted eUSDC)
  - P2P send with real CoFHE SDK encryption — ZK proofs generated client-side via TFHE WASM Web Workers, verified
  on-chain by TaskManager precompile
  - Payment requests with create/fulfill/cancel flow
  - QR code receive with payment links

  Social Features:
  - Group expense splitting with equal AND custom per-member splits, quadratic encrypted voting, debt settlement
  - Creator tipping with dynamic tier thresholds, supporter dashboard, tier badges from on-chain checkMyTier()
  - Gift envelopes with encrypted shares (equal/random split), expiry dates, auto-claim via embedded envelope IDs
  - Stealth payments with anti-frontrunning claim codes (keccak256(code, claimer)), 30-day refund mechanism,
  auto-decryption polling

  Business Tools:
  - Encrypted invoicing with two-phase payment (payInvoice → payInvoiceFinalize with async FHE match verification)
  - Batch payroll for up to 30 employees with individual encrypted salaries
  - 2-of-2 escrow with arbiter dispute resolution, delivery confirmation, expiry claims
  - P2P exchange with real-time Supabase subscriptions, offer sorting, expiry filtering

  Advanced:
  - Inheritance dead man's switch with vault specification, 7-day challenge period, encrypted fund transfer on
  finalizeClaim
  - Privacy permit management with honest local access tracking
  - Global search, transaction detail deep links, Settings, Help/FAQ

  TECHNICAL DEPTH:

  Smart Contracts (Solidity 0.8.25):
  - All 16 contracts use UUPS upgradeable proxy pattern
  - FHE.select() replaces require() everywhere — reverts would leak "balance insufficient"
  - Cross-contract encrypted transfers via FHE.allowTransient()
  - Redeployed with @fhenixprotocol/cofhe-contracts v0.1.3

  Frontend Architecture:
  - @cofhe/sdk loaded dynamically to avoid MUI/emotion production crash from @cofhe/react
  - Real TFHE WASM encryption with ZK proof generation in Web Workers
  - CoFHE ZK verifier integration (POST /verify) returns signed ciphertext with ECDSA proof
  - Manual 5M gas limits on all FHE transactions (precompile not available in eth_estimateGas simulation)
  - Module-level singleton state for cross-route persistence in send flow
  - 99 aria-labels, WCAG AA contrast, 44px touch targets, keyboard focus indicators

  Data Layer:
  - Supabase as notification/cache layer — blockchain is always source of truth
  - Real-time subscriptions on 8 tables
  - Activity logging AFTER on-chain confirmation (never before)
  - Input validation guards (parseUnits/parseFloat) on all 18 FHE contract calls


Confidential Coupons
What you buy is your business. Not the blockchain's
Privacy
Confidentiality
GitHub
Updates in this Wave
Deliverable
GitHub: https://github.com/vwakesahu/fhe-giftcards

Live on Base Sepolia: full end-to-end private checkout flow running on testnet with real transactions.

What We Built
A complete private gift card checkout system using Fhenix CoFHE (Fully Homomorphic Encryption) on Base Sepolia. A buyer places an encrypted order on-chain, an observer fulfills it by purchasing a real gift card from Reloadly's API, and the gift card code is delivered back to the buyer through hybrid encryption, nobody else can read it.

Architecture: Hybrid Encryption (FHE + AES + IPFS)

The core innovation is a hybrid encryption scheme that combines three technologies:
FHE (Fhenix CoFHE) handles on-chain access control. Product ID and amount are stored as euint64 encrypted values, only the assigned observer can decrypt them. The AES decryption key is stored as euint128, only the buyer can decrypt it. Access is enforced at the protocol level via FHE.allow(handle, address).

AES-128-GCM encrypts the actual gift card code. This removes any length limitation, codes of any size work. The observer generates a random 128-bit key, encrypts the code, and the key goes on-chain via FHE while the ciphertext goes to IPFS.

IPFS (Pinata) stores the AES-encrypted payload. The IPFS CID is stored on-chain in the contract and is publicly visible, but the data at that CID is AES ciphertext, completely useless without the FHE-protected key.

Smart Contract: PrivateCheckout.sol

Deployed on Base Sepolia: https://sepolia.basescan.org/address/0xFD80E75d552c715A50B2D258D557dc732Ff59b43#code

Stores per-order:
euint64 encProductId — what to buy (FHE-encrypted, observer-decryptable)
euint64 encAmount — denomination (FHE-encrypted, observer-decryptable)
euint128 encAesKey — AES key for the gift card code (FHE-encrypted, buyer-only)
string ipfsCid — pointer to AES-encrypted gift card code on IPFS
Observer bonding (0.01 ETH), 10-minute deadline, 50% bond slashing on failure
Scripts
e2e.ts — single-command demo that deploys, registers, places order, buys gift card from Reloadly sandbox, encrypts with AES, uploads to IPFS, FHE-encrypts AES key, fulfills on-chain, buyer decrypts everything. Outputs Basescan tx links and IPFS links.
observer.ts — standalone listener that watches for OrderPlaced events and fulfills orders automatically.
demo.ts — buyer-side script for the two-terminal flow.
crypto.ts — AES-128-GCM encrypt/decrypt helpers.
ipfs.ts — Pinata upload/fetch with public gateway fallback.
giftcard.ts — Reloadly sandbox API integration (free $1000 test balance, returns fake codes).
Test Suite
16 tests passing on local mock FHE environment covering: observer registration, encrypted order placement, fulfillment with ETH transfer, buyer decryption via mocks, access control (non-observer/non-buyer rejections), double-fulfill revert, deadline enforcement, refund with bond slashing.


Buildathons
Hackathons
Products
Showcase Product
devmo
Private By Design dApp Buildathon
17:31:41
Left to Submit
Buildathons
WaveHack
What is WaveHack?
Post
Private By Design dApp Buildathon
Build the Future of Confidential Compute on any EVM
Fhenix
Fhenix

Overview

Judges

Submissions
230

Comments
48

Join a team
1

All Waves
230

3rd Wave
26

2nd Wave
115

1st Wave
186
Search by product name
Search
115 products found.
Confidro
Confidro
On-chain payroll that keeps salaries private — because your earnings shouldn't be public data.
Payroll Protocol
GitHub
Updates in this Wave
Core Encryption & Smart Contract MVP
Goal: Deploy a working FHE payroll contract with encrypted salary storage and basic addition.

✅ What We Accomplished
- Smart Contract Scaffolding - Built ConfidroPayroll.sol using @fhenixprotocol/cofhe-contracts. Implemented euint32 mapping for salaries, euint32 for total payroll accumulator.
- FHE Operations - Successfully used FHE.add() to homomorphically sum encrypted salaries into totalPayroll. Verified that plaintext values are never exposed in contract state or events.
- Access Control (Permits) - Added FHE.allowThis(totalPayroll) and FHE.allowSender(totalPayroll) so both contract and caller can access encrypted values when needed.
- Local Development Environment - Configured Hardhat with cofhe-hardhat-plugin and cofhe-mock-contracts. Achieved sub‑second test iterations without touching testnet.
- Client‑Side Encryption - Integrated @cofhe/sdk into a minimal Next.js frontend. Implemented useEncrypt hook to convert salary numbers into euint32 before submitting to contract.
- First Successful Payroll Run - Encrypted 3 mock salaries (10, 20, 30 USDC), submitted to contract, called processPayroll(), and decrypted the total using useDecrypt — got 60 USDC correctly.

🧩 Challenges & Resolutions
Challenge: Gas costs for FHE.add() were higher than expected when called in a loop.
Resolution: Switched to batched addition using FHE.addMany() (custom accumulator pattern) — reduced gas by ~40%.

Challenge: Decrypting total payroll required a permit that sometimes expired before the transaction was mined.
Resolution: Implemented a retry mechanism with exponential backoff in the SDK wrapper.

Challenge: Mock environment passed all tests, but real testnet failed due to missing FHE.allow() for the coordinator address.
Resolution: Added explicit FHE.allow(address(this), totalPayroll) after each write operation.

📊 Deliverables
✅ Contract deployed to Arbitrum Sepolia
✅ 5 unit tests passing (add employee, process payroll, withdraw, compliance view, overflow protection)
✅ Basic UI that can encrypt, submit, and decrypt
✅ Video demo showing encrypted salary submission and correct total decryption

🔁 What We Learned
“FHE is not just encryption — it’s a new execution model. You have to think in terms of ‘computing on ciphertexts’ from the very first line of code.”
- The cofhe-mock-contracts are a lifesaver for rapid prototyping. Without them, iteration would be 10x slower.
- Always call FHE.allow() immediately after creating an encrypted value — otherwise later decryption fails silently.
- Solidity’s euint32 behaves like a normal uint32 in most ways, but you cannot use + or == — you must use FHE.add() and FHE.eq().


Milestone
0points

Grant
0 USDC

0
test
Hidden
test
test
test
Updates in this Wave
Built and deployed the full VeilDeal protocol:

- Smart contract (ConfidentialDealRoom.sol) with 3 encrypted milestones using Fhenix CoFHE FHE.sol on Base Sepolia
- Decrypt+verify release pattern: threshold network decrypts, contract verifies before releasing funds
- 30 passing tests covering full deal lifecycle
- Frontend deployed at veildeal.com (Next.js + wagmi + @cofhe/sdk)
- Full flow working: create deal → deposit escrow → accept → complete milestone → release funds
- Privacy verified: outsiders cannot decrypt milestone amounts

Live: https://veildeal.com
Contract: 0x9F102242aB63bb4B5f08440A06f3e743F324Ea63
Demo: https://youtu.be/A5Gd3Sore9o


Milestone
0points

Grant
0 USDC

0
ShadowSwap
Hidden
ShadowSwap
Private trading infrastructure powered by Fully Homomorphic Encryption.
Market Infrastructure
DeFi
Privacy
Updates in this Wave
In this wave, we focused on strengthening the core architecture of Shadow Swap while preparing the foundation for advanced swap intelligence and privacy-preserving mechanisms.
Core Improvements
Improved swap engine architecture for modular routing logic
Implemented foundational smart routing framework for optimal liquidity discovery
Designed multi-hop swap structure to support routing across multiple liquidity pools
Began implementing slippage optimization logic for improved execution efficiency
Introduced dynamic fee handling mechanism based on liquidity and volatility conditions
Performance & Optimization
Improved transaction execution efficiency
Reduced potential slippage through early routing simulation
Prepared backend logic for real-time route optimization
Privacy Foundation (Early Phase)
Designed transaction intent obfuscation framework
Began research and experimentation with privacy-preserving swap mechanisms
Started exploration of Zero-Knowledge-based privacy architecture
Designed MEV protection framework (front-running & sandwich attack resistance)
Technical Deliverables
Smart routing architecture (initial implementation)
Multi-hop swap logic (foundation layer)
Dynamic fee model (prototype)
Privacy module architecture (design phase)
This wave primarily focused on strengthening the technical foundation required for intelligent, privacy-first decentralized swaps.


Milestone
0points

Previous Wave Points
1st Wave
0 pt
Grant
0 USDC

0
NovaGrid
NovaGrid
Privacy layer for DePIN — ZK compliance, FHE rewards, and encrypted rankings on Fhenix + Aleo.
DePIN
Privacy Infrastructure
FHE
Deliverable
Updates in this Wave
Foundational privacy stack completed and deployed:                                                                                                                                                                                
                                                                                                                                                                                                                                    
  - ZK Compliance (Aleo): Leo program compliance.aleo with three transitions (verify_compliance, verify_device_credentials, compute_node_score). Proof runs entirely in browser via WASM Web Worker. Deployed to Aleo Testnet.      
                                                                                                                                                                                                                                    
  - FHE Rewards (Fhenix): NovaVault.sol stores encrypted euint32 balances with FHE.add, FHE.sub, FHE.gte, FHE.select operations. RewardDistributor.sol uses FHE.mul to apply ZK trust score weighting. Both deployed to Ethereum    
  Sepolia.                                                                                                                                                                                                                          
                                                                                                                                                                                                                                    
  - Web Dashboard: Next.js 15 frontend with ZK proof generation UI, FHE balance display with CoFHE permit-based decryption, and ZK→FHE bridge flow.                                                                                 
                                                                                                                                                                                                                                    
  - Hardware Relayer: Node.js service pushing device telemetry to 0G DA storage.                                                                                                                                                    
                                                                                                                                                                                                                                    
  GitHub: https://github.com/UranusLin/NovaGrid


Milestone
0points

Grant
0 USDC

1
Afrifutures
Afrifutures
First onchain African commodities
Infrastructure
RWA
supply chain privacy
GitHub
Updates in this Wave
Agentic marketplace with mandate.md for security when agent handles cash


Milestone
0points

Previous Wave Points
1st Wave
0 pt
Grant
0 USDC

1
PAYSHIELD
PAYSHIELD
Confidential payroll processing for contractors, built with CoFHE on Arbitrum Sepolia.
Payment Infrastructure
Privacy
GitHub
Updates in this Wave
Wave 2 Updates: Ran Hardhat tests and TypeChain in backend/. All 6 tests passed. PayShieldEscrow handles silent failure and releases payout after employer confirmation. PayShieldPayroll correctly computes encrypted net pay using FHE.mul and marks employer confirmation. PayShieldRegistry manages contractor registration and state transitions. Judge validation added via hre.cofhe.mocks.expectPlaintext() to verify encrypted multiplication without exposing plaintext.


Milestone
0points

Grant
0 USDC

0
LastVault FHE - Private Inheritance
LastVault FHE - Private Inheritance
Your secrets survive you. Privately. FHE-encrypted digital inheritance.
Privacy
Digital Identity
DeFi
GitHub
Updates in this Wave
Wave 2 was a complete rebuild based on W1 feedback. Went from a 3-operation FHE wrapper to a 12-operation FHE primitive. Every sensitive state that was plaintext in W1 is now encrypted: timestamps (no behavioral profiling), claim attempts (attacker can't count), timeout period (DMS window hidden).

🔗 Contract: https://sepolia.arbiscan.io/address/0x9aB36a8C893830b6c7Ef565d52408f8Bb4d9a052
✅ Verified: https://repo.sourcify.dev/421614/0x9aB36a8C893830b6c7Ef565d52408f8Bb4d9a052
🌐 Portal: https://lastvault.io/fhenix/
🎬 Demo: https://www.youtube.com/watch?v=sZ0X_9jDfdc
📂 GitHub: https://github.com/lastvault-io/lastvault-contracts

WHAT IT IS
LastVault FHE is a private on-chain identity verification primitive on Fhenix CoFHE. Core innovation: encrypted identity matching — contract performs FHE.eq(encryptedClaimant, encryptedHeir) on two ciphertexts, producing a ciphertext boolean. No plaintext identity ever on-chain. Inheritance is the first application; the primitive generalizes to encrypted allowlists, anonymous authorization, private DAO membership.

WHY FHE IS THE ONLY WAY
Traditional encryption requires decrypting to compare — privacy lost at verification. ZK proofs leak brute-forceable hashes. TEE introduces single point of trust. Only FHE: two ciphertexts in, one ciphertext boolean out, no plaintext ever.

12 FHE OPERATIONS
asEaddress, asEuint128, asEuint64, asEuint8 (4 type encryptions) + eq (core) + ne, gte (threshold) + sub (time elapsed) + add (counter) + select (replaces require) + and (compound) + not. Plus allowThis/allow/allowPublic/publishDecryptResult for ACL.

KEY INNOVATIONS
• FHE.select() replaces require() — revert messages leak info, silent updates don't
• Compound FHE.and() — identity match + timeout + attempt limit composed into single opaque boolean; observer can't distinguish which failed
• Encrypted timestamps via FHE.sub + FHE.gte — timeout check runs in ciphertext space
• Proactively migrated to new decrypt flow (publishDecryptResult + decryptForTx via @cofhe/sdk) BEFORE April 13 deprecation

FRONTEND
Full claim portal with interactive spotlight onboarding tour, Owner/Heir/Docs sections, canvas starfield UI, MetaMask detection, live contract binding, LOCKED badges on encrypted state.

DOCS
ACL_LIFECYCLE — zero pre-verification window proof
PRIVACY_MODEL — observer visibility matrix, why FHE beats alternatives
DEPLOYMENT — Arb Sepolia runbook
REINEIRA_BRIDGE — W3 escrow architecture

TESTS
24 Hardhat tests passing: ABI verification, privacy guarantees, FHE operation coverage, state machine, W1→W2 comparison, access control.

TECH STACK
Fhenix CoFHE, @cofhe/sdk (migrated from cofhejs), @fhenixprotocol/cofhe-contracts, Solidity 0.8.25, Hardhat, React 19 + TypeScript + Vite, viem, ethers.js v6.


Milestone
0points

Previous Wave Points
1st Wave
0 pt
Grant
0 USDC

1
fhe-agent-shield
Hidden
fhe-agent-shield
FHE-Agent Shield is a privacy layer for AI agents using Fully Homomorphic Encryption on Fhenix
Infrastructure
Security
OpenClaw
Updates in this Wave
# FHE-Agent Shield — Wave 2 Summary

---

## Wave 2: Core Development ✅ COMPLETE

**Delivered:** 5 contracts, 152 tests, 4 hooks, 3 OpenClaw integrations, demo.

- AgentVault: 19 tests | AgentMemory: 22 | SkillRegistry: 17 | ActionSealer: 25
- Demo: Web app (`frontend/`), script (`demo.sh`), video (`video/FHEDemo.tsx`)
- Docs: README, API, Architecture, Security (15+ files)

---

## Wave 3: Production Hardening ⚠️ IN PROGRESS

| Completed                            | Pending                              |
| ------------------------------------ | ------------------------------------ |
| Gas (10k runs), FHERC20, Multi-chain | Chainlink VRF (6 issues), Python SDK |
| TypeScript SDK 90%, ElizaOS 50%      | Mainnet deploy                       |

**Issue:** H-1 Weak Randomness in ActionSealer, AgentMemory, SkillRegistry.

---



---

## Key Metrics

| Tests | Contracts | Networks    | TypeScript |
| ----- | --------- | ----------- | ---------- |
| 152   | 5         | 3 (testnet) | 90%        |

---

## Problem: AI Agents Are Vulnerable

- 135K+ plaintext API keys exposed
- 91% prompt injection success rate
- 1,184+ malicious skills

**Solution:** FHE-Agent Shield — FHE protection via Fhenix CoFHE.

---

## Links

- GitHub: github.com/developerfred/fhe-agent-shield
- Docs: docs.fhenix.zone

**Status:** Wave 2 ✅ | Wave 3 ⚠️ 60% | Wave 4 🚀


Milestone
0points

Previous Wave Points
1st Wave
0 pt
Grant
0 USDC

1
CipherPay
Hidden
CipherPay
Encrypted invoicing with FHE — amounts and recipients hidden on-chain, only parties can decrypt.
messenger
Updates in this Wave
Anonymous Invoice Claim
The biggest privacy addition this wave. Creator enables anon mode on an invoice — payer pays without their address ever touching on-chain storage.
• Nullifier = keccak256(deviceSecret ‖ invoiceHash) — device secret lives in localStorage, never sent anywhere
• Contract stores only the nullifier hash — no msg.sender, no InvoicePaid event with address
• Double-spend protected without knowing who paid
• Creator sweeps funds via sweepAnonPool() — ETH arrives to creator wallet with zero link to individual payers
• New page: /app/anon-claim

Shielded Balance Pool
Breaks amount correlation on Etherscan. Payer pre-funds a bucket (0.001 / 0.01 / 0.1 ETH), then the actual payment tx has msg.value = 0 — Etherscan shows no ETH transfer.
• depositShielded() → payInvoiceShielded() — contract debits internally
• Invariant enforced: sum(shieldedBalance[users]) == contract.balance — verified by 11 Hardhat tests

Donation Invoice Type
• New invoice type (TYPE_DONATION = 4). No target amount, no FHE.gte threshold — all payments accepted. Creator settles whenever they want.

Checkout Embed
• Merchants add one <script> tag + CipherPay.open() — FHE encryption runs in a sandboxed iframe, parent page sees only cipherpay:paid event. No wallet SDK on the merchant's page.
/checkout/:hash embeddable widget
• Auto-routes to shielded path when shieldedBalance >= bucket
• Live demo on /app/build

Security & Hardening
• Migrated from deprecated FHE.decrypt() → allowPublic + decryptForTx + publishDecryptResult (Fhenix deprecation April 13)
• ACL CI script (audit-acl.cts) — blocks any unauthorized FHE.allowGlobal in CI
T• HREAT_MODEL.md — 6 adversary types, explicit NOT-hidden list
• Permit UX: first-time explainer modal, distinguishes missing / expired / rejected states
• Removed legacy cofhejs@0.3.1 deps


Milestone
0points

Previous Wave Points
1st Wave
0 pt
Grant
0 USDC

1
SCAN — SportsX Confidential Ad-Network
SCAN — SportsX Confidential Ad-Network
Privacy-first advertising protocol for sponsors target fan segment on encrypted data.
B2B
advertising
Privacy
GitHub
Updates in this Wave
GitHub: https://github.com/SportsX-xyz/SCAN
 Live Demo: https://sportsx-xyz.github.io/SCAN/  
 Contracts (Arbitrum Sepolia):  
 - ConfidentialFanProfile: 0x35Bd9f53261AbD0314C6349492397DE0F4d07Ec3
 - SCANCampaign: 0xc2011a5942f12A67C7bdeDD08948C3F26564132e 

  1. SDK Migration — cofhejs → @cofhe/sdk v0.4.0 
Completed before the April 13 EOL deadline. Migrated all contracts and frontend to @cofhe/sdk + @cofhe/hardhat-plugin;
@fhenixprotocol/cofhe-contracts upgraded to v0.1.3. Replaced deprecated FHE.decrypt() with a coprocessor-signed async 
flow: getMatchResultCtHash() returns a ciphertext hash → fan calls decryptForTx(ctHash).execute() off-chain → 
publishMatchResult() verifies the coprocessor signature on-chain via FHE.publishDecryptResult().                      

 2. CPM Ad Delivery Model 
Campaign struct extended with adContentURI (IPFS URI for ad creative), adType (Video / Banner / Link), clubAddress,
costPerImpression, and clickCount. createCampaign() accepts client-side encrypted targeting thresholds and validates
that the budget covers at least one impression.

 3. Three-Way Revenue Split (60 / 30 / 10)
confirmView() triggers atomic on-chain settlement per verified impression: 60% → Club, 30% → Fan, 10% → Protocol. All
three transfers are atomic — any failure reverts the transaction.  

4. ProofOfView Mechanism 
Replaced Wave 1's single claimReward() with a five-step pipeline:
 1. blindMatch() — FHE.gte() + FHE.and() on ciphertexts, result stored as ebool 
2. getMatchResultCtHash() — returns ctHash for off-chain decryption
3. Fan calls decryptForTx(ctHash).execute() off-chain via SDK 
4. publishMatchResult(campaignId, result, signature) — coprocessor signature verified on-chain 
5. confirmView(campaignId) — validates match and budget, executes 60/30/10 split 

recordClick() tracks click-throughs; sponsors see only aggregate clickCount, never individual identities.  

5. Batch Operations 
batchBlindMatch(campaignId, address[] fans) processes a full fan cohort in one transaction. Idempotent — already-processed fans are skipped. 

6. Frontend 
- Club Admin: client-side FHE fan registration via @cofhe/sdk, batch blind match trigger, campaign analytics
- Fan Ad Inbox: view matched campaigns, confirm view to collect 30% reward, click-through tracking 
- Analytics funnel: registered → matched → viewed → clicked (aggregate only, zero individual data exposed)

7. Test Suite: 11/11 Passing (up from 6/6 in Wave 1) 
 - ConfidentialFanProfile: register profile, reject duplicate, reject non-admin (3) 
- Campaign Creation: create with full ad metadata, reject zero budget, reject zero CPI (3) 
- Blind Matching: execute blind match for qualifying fan (1)  
- ProofOfView + Settlement: full end-to-end flow, reject unconfirmed match, reject unmatched fan, deactivation + refund (4)


Milestone
0points

Previous Wave Points
1st Wave
0 pt
Grant
0 USDC

1
HomoVault
Hidden
HomoVault
Private infrastructure for AI agents to spend USDC with FHE-secured policy controls.
Agentic Fintech
Confidential DeFi
Web3 Payment
Updates in this Wave
- Complete the MVP
- Update strategies when using cofhe-sdk


Milestone
0points

Previous Wave Points
1st Wave
0 pt
Grant
0 USDC

1
ShadowDAO
Hidden
ShadowDAO
Private DAO voting on Fhenix FHE. Votes encrypted forever, only totals revealed after deadline.
DAO
Privacy
Governance
Updates in this Wave
Space-Gated Voting
The biggest governance addition this wave. Creator links a proposal to a Space — vote() enforces membership on-chain via cross-contract call to IShadowSpace.isSpaceMember().
• createProposal() takes _spaceId + _spaceGated — calls IShadowSpace.incrementProposalCount(spaceId) on creation
• vote() gate: require(IShadowSpace(shadowSpaceContract).isSpaceMember(proposal.spaceId, msg.sender)) — non-members revert
• getProposalsBySpace(spaceId) — returns all proposal IDs linked to a Space
• Bidirectional wiring via scripts/wire.ts: setShadowSpaceContract() + setShadowVoteContract()

Encrypted On-Chain Analytics
Three new FHE functions — query tallies without revealing counts.
• checkQuorumEncrypted() — FHE.gte(totalVotes, quorum) → quorum check entirely on ciphertext
• getEncryptedMaxTally() — FHE.max(tallies[0], tallies[1]) → leading option without revealing values
• getEncryptedDifferential() — FHE.sub(tallies[A], tallies[B]) → encrypted margin

Cross-Contract ACL
• incrementProposalCount() gated: require(msg.sender == shadowVoteContract) — Wave 1 had no gate
• owner pattern on both contracts — only deployer sets contract references

Spaces Lifecycle
• leaveSpace() — member exits; creator blocked, must archive instead
• archiveSpace() — active = false, emits SpaceArchived, irreversible
• removeMember() fix — swap-and-pop on memberLists[] so getMembers() returns clean data

Frontend
• 5-step proposal creation — new Step 2: Space selector (Global or Space-gated), quorum pre-fills from defaultQuorum
• Space badge on proposal cards: lock icon + CategoryEmoji + Space name. Dropdown filter by Space
• ProposalDetail: membership banner (green = can vote, red = "Join the Space"). Vote button disabled for non-members
• SpaceDetail: live proposal list from getProposalsBySpace() with status, votes, countdown
60 E2E tests on Sepolia, both accounts, cross-contract ACL, FHE analytics


Milestone
0points

Previous Wave Points
1st Wave
0 pt
Grant
0 USDC

1
Cofhe Poker
Hidden
Cofhe Poker
On-chain poker where cards stay encrypted — powered by Fhenix FHE.
DeFi
Privacy
Game
Updates in this Wave
Texas Hold'em PvP

Full 4-round multiplayer poker — each player's hole cards encrypted as euint64, never visible to opponent until showdown.

• Preflop → Flop → Turn → River → Showdown with act(tableId, action) — check / bet / call / raise / fold
• computeShowdownP1() + computeShowdownP2() + resolveShowdown() — 3-step FHE comparison, raw hand values never exposed to the contract
• checkTimeout(tableId) — claim pot if opponent doesn't act within 50 blocks

PvP Lobby + Private Rooms
• createTable(buyIn, isPrivate) → shareable invite link #/room/holdem/{id}:{code}
• joinByInviteCode(tableId, bytes32) — gated entry for private games
• getOpenTables(offset, limit) — paginated lobby with 60s auto-leave timeout

Vault — Real-Money Mode
• depositETH() / depositUSDT() / withdraw(token, amount) — free balance mapping per player per token
• lockForGame() → settleGame(players[], deltaUSD[]) — poker contracts lock funds before hand, settle after
• Live ETH/USD from Chainlink at 0x694A…5306, isPriceStale() flag in UI

On-Chain Friend System
• sendFriendRequest(addr) → acceptFriendRequest(addr) — stored in contract, no off-chain server
• sendGameInvite(to, tableId) — invite friends directly to private tables

FHE Permit & Decrypt Pipeline
• Singleton CoFHE client with Zustand reactive store (isReady / isLoading / error)
• decryptCard(ctHash) — 10 retries, exponential backoff, detects sealOutput / HTTP 5xx
• ensurePermit() — EIP-712 self-permit with state machine: none → signing → active → expired

Visual Overhaul
• Card SVG suit glyphs, holographic winner shimmer, ConfettiParticles (80 CSS particles on win)
• Web Audio synthesis: ascending win fanfare, noise-based shuffle, felt table with felt-breathe keyframe
• AnimatePresence transitions, notification badges, mobile permit dot

E2E On-Chain Test Suite
• scripts/test-contracts.ts — real Sepolia TXs with 2 private keys. 30 tests passing across all 6 contracts: vault deposit/withdraw, PvE game flow, PvP create → join → deal → act → complete, friend system, lobby.iend system, lobby.


Milestone
0points

Previous Wave Points
1st Wave
10 pt
Grant
0 USDC

1
Blank
Hidden
Blank
Private payments for the real world — transaction amounts encrypted with FHE on Base
Privacy
Payment
Updates in this Wave
  Blank is a payments app where the amount you send is encrypted on chain. The ledger shows who paid who, not how
  much. This wave we took it from an early skeleton to something you can actually use — end to end on testnet at
  blank-omega-jade.vercel.app

  PASSKEY WALLETS (BIGGEST CHANGE THIS WAVE)
  You sign up with a passphrase. No extension, no MetaMask. The app creates an ERC-4337 smart account, signs with
  P-256, and our paymaster pays the gas. MetaMask still works for people who want it. Both paths go through one hook
   so we are not maintaining two versions of the app.

  WHAT YOU CAN DO
  Send encrypted payments. Request money. Invoice clients. Run payroll where no employee sees another's pay. Split
  group expenses. Tip creators. Send gifts. Plan inheritance as a dead man's switch. Claim stealth payments with
  one-time codes. Generate proofs that your balance is above some number without revealing the actual number.

  DUAL-CHAIN ON ONE CODEBASE
  Runs on Base Sepolia and Ethereum Sepolia. Explorer links point at the right chain. Activity feeds show each
  transaction on the chain it actually happened on, not the viewer's active chain. Most of the bugs we caught came
  from using the app as a real user with two wallets in two windows.

  AI AGENT PAYMENTS
  The server runs Kimi K2 (Claude as backup) to derive an amount from plain English, then signs that amount with an
  agent private key. On chain, PaymentHub does ecrecover and ties every submission back to the agent that authored
  it. The private key never leaves the server. Signatures expire in ten minutes — replays cannot work.

  VERIFIABLE PROOFS, NO TRUSTED SERVER
  A user generates a proof their balance is above some number and gets a shareable URL. Anyone without a wallet can
  open it, click verify, and the Threshold Network's decrypted answer gets published on chain with a signature
  check. Nobody has to trust our server. The contract does the math.

  UNDER THE HOOD
  Sixteen UUPS-upgradeable contracts, twenty-eight FHE operations, migrated from Fhenix's older testnet to the CoFHE
   v0.4 API. The pattern we are most proud of is transferFromVerified — Hub contracts verify an encrypted input in
  their own context where msg.sender is the user, then pass the verified handle to the vault. Without this,
  cross-contract FHE signature checks fail silently. That one took a long time to figure out.

  WHERE WE ARE
  The migration is done. Every feature that existed before still works, and everything new this wave sits on the
  v0.4 foundation. The product is usable on testnet today. That does not mean it is a real product yet — that gap
  will close in future waves.

  PaymentHub (Base Sepolia):
  sepolia.basescan.org/address/0xF420102Dea1acf437bfc49ded5F4E2f5ed32e831


Milestone
0points

Previous Wave Points
1st Wave
10 pt
Grant
0 USDC

2
Alpaca Invoice
Hidden
Alpaca Invoice
Alpaca Invoice is a B2B invoicing and settlement system designed around the FHE ecosystem.
Privacy Infrastructure
DeFi
Payfi
Updates in this Wave
Live Product URL 🚀: https://alpaca-invoice-web.vercel.app

Contract Addresses
- Invoice Registry / Verifying Contract: 0x84DB85AcD217C153C76f2FD8617EeB737A244B30
- Escrow Contract: 0x3aBeDea99F6B6E610Aa8d06BEEE168EF5f81f8D6
- Dispute Contract: 0xc745283C52E05eE3ee409a165F82dd07e7b2D373

Product Thesis
Alpaca Invoice is a confidential invoice operating layer for FHE-enabled commerce. We did not approach it as a simple “private payment” demo. We designed it as a real B2B workflow product: invoice issuance, lifecycle tracking, settlement coordination, escrow handling, dispute management, and audit-aware disclosure. The core idea is that businesses need both confidentiality and operational clarity. FHE gives us a way to protect sensitive financial state while still keeping the system verifiable and usable.

Architecture
Frontend:
- Next.js application for landing, dashboard, invoice creation, invoice detail, audit views, and dispute flows
- Wallet-connected EVM UX with structured business screens rather than contract-first tooling

Backend:
- Fastify relayer for request validation, persistence, submission orchestration, and reconciliation
- Prisma + Postgres for workflow projections
- Redis-backed worker coordination for background execution safety

Contracts:
- Invoice registry for invoice state and request anchoring
- Escrow layer for protected hold/release workflows
- Dispute layer for escalation and outcome tracking

Completed Modules
1. Confidential invoice creation and typed request flow
2. Invoice registry and lifecycle tracking
3. Escrow and dispute contract surfaces
4. Relayer submission and reconciliation pipeline
5. Audit-oriented data model and verification path
6. Dashboard, invoice list, compose, detail, docs, and supporting product pages

What Can Be Tested Now
- Open the product UI and review the FHE-oriented invoice experience
- Connect wallet-compatible frontend flows
- Create and inspect invoice lifecycle requests
- Verify relayer availability and API health
- Review deployed contract addresses and on-chain structure
- Explore escrow/dispute architecture through the live product surface

Outcome
This version of Alpaca Invoice shows a deliberate product direction for FHE: not just hiding amounts, but building a coherent confidential business workflow around invoices, settlement, escrow, disputes, and controlled auditability.


Milestone
0points

Previous Wave Points
1st Wave
0 pt
Grant
0 USDC

0
Yonder
Yonder
Community-driven transit routes with cryptographic privacy. Navigate affordably like a local.
Privacy
Decentralized Social
Infrastructure
Deliverable
Updates in this Wave
Our git repo was broken due to Nextjs issues, hence we missed out i the first wave.
we've recovered it by rebuilding. Were still in the same spot but now with a live link ready to be developed. our application still maintains its purpose of making geo-location safe, casual and cheap.

*************

imagine you're new in town. You don't know the bus routes, cabs are expensive, and you just need to get somewhere. So you ask for help online. Simple right? Wrong. If that request is on a transparent blockchain, you just told the entire network exactly where you are and where you're going. A stranger in a new city with their location broadcast publicly is not a privacy problem that's a safety problem.

YONDER fixes this. Users pay $1 USDC to post a route request and get answers from locals who know the city. But unlike every other platform, the full content of that request your precise location, your destination, your wallet identity never touches a public ledger in readable form. It gets encrypted on-chain using Fhenix CoFHE fully homomorphic encryption the moment you hit submit. The network can compute on it. Responders can engage with it. AI can validate responses against it. But nobody can read it. That's not a feature we bolted on  that's the architecture.

Wave 1 is the foundation. YonderTicket.sol and YonderResponder.sol are deployed on Fhenix Sepolia. Encrypted ticket state is handled using CoFHE types  euint and ebool  so sensitive content is sealed at the contract level. Fhenix SDK helpers are initialized for client-side encryption and decrypt permits. Privara SDK is wired for USDC payment rails so every payout, stake, and refund settles on-chain. Google Maps API is initialized server-side for the AI route validation layer coming in later waves.

Almost every interaction in YONDER is on-chain. That's not a design choice  that's the privacy guarantee. Wave 2 is where users walk through the door.

*********


Milestone
0points

Previous Wave Points
1st Wave
0 pt
Grant
0 USDC

1
Shadow Credit Network 
Shadow Credit Network
Private, undercollateralized lending via FHE. Encrypted on-chain scores and ZK-verified privacy.
Credit Scoring
privacy scoring
Lending Protocol
GitHub
Updates in this Wave
Wave 2 Updates - Shadow Credit Network
🚀 Live Demo
URL: https://shadow-credit-network-wave2.vercel.app/
Network: Base Sepolia (Chain ID: 84532)
---

The patterns are now correct (InEuint* ciphertexts, eBool resolution).
📦 Deployment Addresses
Contract	Address
SimpleCreditEngine.sol	0x749663A4B343846a7C02d14F7d15c72A2643b02B
PrivateLoanPool.sol	0x0A2AB73CB8311aFD261Ab92137ff70E9Ca268d69
CreditDelegation.sol	0xA97c943555E92b7E8472118A3b058e72edcDC694
---
✨ Major Updates Made

1. Fixed Loan Disbursement (Critical Fix)
Before: Users had to send ETH to get a loan (backwards)  
After: Users receive ETH directly to their wallet when borrowing
// Old (broken)
function requestLoan(...) external payable {
    uint256 totalOwed = msg.value + interestComponent; // User deposits ETH
}
// New (working)
function requestLoan(uint256 _principal, uint256 _duration, RiskPool _riskPool) external {
    uint256 totalOwed = _principal + interestComponent;
    _disburseLoan(_loanId); // Sends ETH to borrower
}
2. Created SimplifiedCreditEngine
Replaced FHE-dependent engine with plaintext version that works on Base Sepolia:
- Credit Score Formula: 300 + PaymentScore + UtilizationScore + AgeScore - DefaultPenalty
- Risk Tiers: Prime (740+), Near Prime (670+), Subprime (580+), Deep

Key Fixes
1. Loan Disbursement Fixed - Borrowers now receive ETH to their wallet (was broken before - users had to deposit ETH to "borrow")
2. Simplified Credit Engine - Works on Base Sepolia (FHE version needs Fhenix infrastructure)
3. Pool State Display - Shows actual liquidity, active loans, default rate
4. My Loans Section - Users can view and repay their loans
5.  Minimum 0.01 ETH - Added to Fund Pool modal to match contract minimum.


Milestone
0points

Previous Wave Points
1st Wave
0 pt
Grant
0 USDC

1
VeilData
VeilData
VeilData is building a confidential data marketplace for sensitive datasets.
data market
GitHub
Updates in this Wave
Add FHE-encrypted sealed-bid auctions for premium datasets — buyers submit encrypted bids that are compared on-chain without revealing amounts. Implement encrypted access control where decryption keys are
  distributed through FHE computation rather than server-side lookup. Add dispute resolution mechanism with encrypted evidence submission. Production hardening, gas optimization, and mainnet preparation.


Milestone
0points

Previous Wave Points
1st Wave
0 pt
Grant
0 USDC

1
VeilDAO
VeilDAO
Encrypted DAO treasury management enforce budget rules on numbers the public never sees.
Privacy Infrastructure
DeFi
DAO Tooling
Deliverable
Updates in this Wave
VeilDAO is a privacy-preserving DAO treasury where operational budgets and spend proposals are mathematically encrypted on-chain. Competitors can see that the DAO is evaluating proposals, but they cannot see the financial amounts, protecting organizational alpha while maintaining internal trust.

This wave, we took VeilDAO from a conceptual architecture to an end-to-end prototype deployed on the Arbitrum Sepolia testnet. Live Prototype:  https://veilda00.vercel.app/
CORE FHE SMART CONTRACT We successfully built, compiled, and deployed the VeilDAO engine (VeilDAO.sol) utilizing the CoFHE v0.4 API. The contract stores all DAO treasury category balances and proposed spend amounts entirely as encrypted euint32 data types.

MATHEMATICAL BUDGET ENFORCEMENT Our proudest technical achievement this wave is the executeSpend logic. We utilized FHE.lte() and FHE.select() to allow the smart contract to autonomously evaluate if a proposed encrypted spend is within the encrypted category budget, and conditionally deduct the funds. The contract strictly enforces DAO financial rules on invisible numbers without ever decrypting them to the public.

STRICT GOVERNOR ACCESS CONTROL We implemented an on-chain role-based access control (RBAC) system. Anyone can be a DAO member and interact with the public dashboard, but only authorized cryptographic Governors assigned by the DAO can trigger threshold approvals or request decryption.

PREMIUM WEB3 DASHBOARD (NEXT.JS) We built and deployed a production-grade, dark-mode minimalist frontend to Vercel. The dashboard connects via MetaMask (ethers.js) directly to our Arbitrum Sepolia deployment. To guarantee judges can fully evaluate the platform, we engineered a local "Governor Bypass" into the React context—allowing evaluators to bypass the strict on-chain role lock and interact with the full suite of tooling.

INTERACTIVE ARCHITECTURE SIMULATOR Because FHE client-side encryption is highly abstract for end-users, we built educational simulator flows directly into the dashboard buttons. Users interacting with the UI are guided through the exact programmatic flow we designed (Plaintext amount -> client-side encryption -> On-Chain FHE Vault) via interactive pop-ups, demonstrating our deep understanding of the required architecture.

WHERE WE ARE The core foundational contract is deployed and stable on Arbitrum Sepolia. The frontend MVP flawlessly reads on-chain states and simulates the complex cryptographic workflows. In upcoming waves, we will bridge the final gap by integrating the cofhejs client-side encryption SDK directly into the React components to replace the simulation layer with live, end-to-end browser encryption.


Github: https://github.com/OtowoSamuel/veildao/
Smart Contract (Arbitrum Sepolia): https://sepolia.arbiscan.io/address/0x5Abcba0F71915a15ae0b2C437F0BC2c503568349


Milestone
0points

Previous Wave Points
1st Wave
0 pt
Grant
0 USDC

1
blind-deal
blind-deal
Confidential P2P Price Negotiation on Fhenix
Market Infrastructure
DeFi
P2P
GitHub
Updates in this Wave
- React frontend with `@cofhe/react` hooks + wagmi wallet connection
- Full deal lifecycle UI: create → submit encrypted prices → finalize → cancel
- FHE price unsealing via `cofheClient.decryptForView()`
- `BlindDealResolver.sol` — condition contract for Privara escrow
- Privara SDK integration (`@reineira-os/sdk`): create → fund → redeem
- Server-side API routes for FHE-encrypted escrow operations
- End-to-end escrow lifecycle verified on Arbitrum Sepolia


Milestone
0points

Previous Wave Points
1st Wave
0 pt
Grant
0 USDC

0
BlindBook
Hidden
BlindBook
Encrypted On-Chain Order Book , Front-Running Is Mathematically Impossible
Confidential DeFi
Market Infrastructure
Encrypted Trading
Updates in this Wave
Wave 2 fixes the one thing that mattered: in wave 1, submitOrder took plaintext uint64 amount and price, so the values were fully visible in mempool calldata before the contract encrypted them. That's privacy theater — an encrypted order book whose orders are readable in the submitting tx does not prevent front-running.

Wave 2 switches submitOrder to take InEuint64 (ciphertext plus ZK proof). Encryption happens in the user's browser via cofhejs before the tx is signed; FHE.asEuint64(InEuint64) on-chain verifies the proof and imports as euint64. Plaintext never enters calldata.

Shipped:

Contract redeployed on Arbitrum Sepolia at 0x9f63726454c6571955b0c17300ace7f9fb5C3F36. Matching engine unchanged: FHE.lte for price check, FHE.min for fill, FHE.select and FHE.sub for conditional remaining amounts.

11/11 tests passing under the CoFHE hardhat mocks, including a new regression that asserts plaintext values do not appear anywhere in the encoded submitOrder calldata.

Frontend on React + wagmi + @cofhe/sdk/web with a per-step encryption progress UI (Init TFHE, Fetch Keys, Pack, Prove, Verify), a proper connection state machine with retry, and friendly handling of Arbitrum Sepolia base-fee races so raw RPC errors never reach the user.

Known gaps, stated up front: matching is still off-chain-driven (a caller proposes the pair); revealFill is currently cooperative rather than proof-backed; no token settlement yet; FHE gas cost is demo-viable but not production-volume. A CoFHE decrypt-oracle handshake for reveal and FHERC-20 settlement are wave 3.

Contract on Arbiscan: https://sepolia.arbiscan.io/address/0x9f63726454c6571955b0c17300ace7f9fb5C3F36


Milestone
0points

Previous Wave Points
1st Wave
0 pt
Grant
0 USDC

0
NixWallet
Hidden
NixWallet
Self-custodial wallet for FHERC20 confidential tokens - powered by Fhenix coFHE
crypto wallet
Confidential
chrome extension
Updates in this Wave
I’m joining the Buildathon in Wave 2 (first submission). This update covers everything shipped for NixWallet to date in one repo: a self-custodial wallet for Fhenix FHERC20 and coFHE on Ethereum Sepolia, plus Hardhat contracts, docs, demo site/slides, and a demo video.

What’s in the repo
Chrome extension: onboarding, encrypted vault, multi-account HD / import, send/receive, wrap/unwrap and batch unwrap, token management (Sepolia-oriented discovery), activity with explorer links, address book, settings (auto-lock, security), EIP-1193 for dApps. coFHE (encrypt, decryptForView, decryptForTx) and ethers.js on Sepolia. FHERC20WrapperRegistry + wrapper Solidity under hardhat/, all in the GitHub repo.

Polish for reviewers
README with video link, LOCAL_SETUP for clone → build → Load unpacked, presentation pages and slide decks, privacy page, manifest/permissions aligned with Chrome guidance, GitHub main up to date.


Milestone
0points

Grant
0 USDC

0
Z0tz — FHE-native wallet stack
Z0tz — FHE-native wallet stack
FHE-native private wallet stack — passkeys, encrypted balances, stealth payments, gasless.
Wallet Infrastructure
Privacy Infrastructure
Onboarding
GitHub
Updates in this Wave
🦇 Z0tz — FHE-native wallet stack

Private wallet infra from day one: passkeys, encrypted balances, stealth payments, fully gasless.

Built on Fhenix CoFHE → encrypted on-chain state + pseudonymous ledger.

🚀 V6.5 Update

Z0tz evolved into a full stack: encrypted ledger + GUI + cross-chain flows. Deployed and tested across 3 chains.

✅ 39 verified contracts (Base, Eth, Arb Sepolia)
✅ End-to-end flows: deploy → cash-in → spend → cashout → bridge
✅ Zero admin keys, fully permissionless

📦 Core Contracts

📒 PrivateLedger — pseudonymous IDs → encrypted balances
🏦 Vault — pooled FHERC20 liquidity (per chain)
🧹 Sweeper — multi-sweep, anonymity set = users
🪪 Account — ERC-4337 + P-256 passkeys
⛽ Paymaster — gasless UX (1% token fee)
🛡️ Recovery — guardian + delay
👻 Stealth — ERC-5564/6538
🌉 CCTP V2 — cross-chain via stealth

🖥️ Electron GUI (shipped)

• Passkey creation (no seed phrase)
• Encrypted balance reveal (gasless)
• Cash-in / spend / cashout / bridge
• History scanner (rebuilt from FHE events)
• Recovery (QR + steganographic PNG)
• Auto-lock (5 min idle)

⌨️ CLI (gasless ops)

🔑 create-passkey → 1 passkey, 3 stealth families
🚀 deploy → CREATE2 smart accounts (3 chains)
💰 cashin → stealth → vault → encrypted ledger
🔐 spend → internal transfer + rotation
🔓 cashout → ledger → stealth → target
🌉 bridge → CCTP V2 + stealth pair
👁️ balance → decrypt via viewer permit

👉 All executed via relayer + paymaster

⛽ Relayer + Paymaster

🌐 Relayer submits UserOps + ledger ops
⛽ Paymaster sponsors all gas (1% fee)
🔐 P-256 passkey auth per request
🧠 Users never hold ETH

Landing page doubles as live relayer (Vercel).

🎥 End-to-End Flow

Deploy → Cash-in → Spend (auto-rotate) → Cashout → Bridge

⚡ Sub-cent cost per op
⚡ Sub-second signatures
🌐 3 chains, 7 operations
👥 Multi-user tested
🔒 Audit phase passed (critical/high fixed)

🔐 Architecture

Fhenix → encrypted computation (FHE)
Z0tz → identity (passkeys), ledger, stealth, cross-chain privacy

Balances never exposed.
Addresses never linked.
Users never touch ETH.

🚀 Links

Repo: github.com/0xOucan/Z0tz
Demo: YouTube
Live: z0tz-landing-page.vercel.app

Fhenix encrypts computation. Z0tz encrypts the user. 🦇


Milestone
0points

Previous Wave Points
1st Wave
10 pt
Grant
0 USDC

2
Noah Protocol
Hidden
Noah Protocol
Verify Once, Use Everywhere
KYC Infrastructure
Updates in this Wave
The backend is powered by a custom registry designed for the Fhenix network, enabling private identity attributes through Fully Homomorphic Encryption.

Encrypted Attribute Storage: We implemented the inEuint32 standard, allowing the SDK to submit encrypted age data that remains ciphertext on the blockchain. Only the authorized Coprocessor can compute over this data.
Identity Nullification System: To prevent Sybil attacks, we implemented a hash-based nullifier system. This ensuring that one physical document cannot be used to register multiple wallet addresses, without ever revealing the document number itself.
Role-Based Issuer Access (RBAC): Using the ISSUER_MANAGER_ROLE, the system enforces a trusted network of identity issuers. Only authorized entities can sign off on identity registrations, ensuring data integrity before it enters the registry.
Coprocessor Integration Hooks: The contracts are pre-wired with hooks like getSealedAge, preparing the protocol for autonomous, confidential compliance checks where a dApp can verify "Over 18" without ever seeing the age itself.
Summary Impact: By bridging high-resilience local OCR with Fhenix-backed confidential smart contracts, Noah provides an end-to-end "Dark KYC" experience that is both remarkably user-friendly and cryptographically private.

We completely refactored the underlying SDK (NoahSDK.ts) to serve as a robust "Universal Extractor."

TD1 & TD3 Processing: The SDK features automatic format detection, seamlessly processing both Standard Passports (TD3: 2 lines of 44 characters) and Identity Cards (TD1: 3 lines of 30 characters) without manual user input.
Aggressive Multi-Length Capture: We intentionally loosened optical line capture constraints to retrieve slightly malformed or noisy lines (capturing lengths between 28-32 or 42-46 characters). It intelligently trims or pads these lines to the precise required dimensions before parsing.


Milestone
0points

Grant
0 USDC

0
Crypto-Geo Sentinel
Crypto-Geo Sentinel
An AI-powered advisor using SoSoValue data to monitor & mitigate crypto geopolitical risk
Infrastructure.
AI-driven risk assessment
Deliverable
Updates in this Wave
Finalized project conceptualization, defined agentic risk-scoring logic, and completed submission documentation for the buildathon


Milestone
0points

Grant
0 USDC

0
LeakProof X
LeakProof X
Privacy-First Whistleblowing Platform on Ethereum
Governance
GitHub
Updates in this Wave
In this wave, we completed the full end-to-end confidential workflow for LeakProof X, moving from a basic on-chain prototype to a fully functional privacy-preserving reporting platform.Key updates delivered:
CoFHE SDK Integration — Integrated Fhenix's CoFHE SDK for true client-side encryption before any data hits the chain. Sensitive report fields (title, description, category, severity, evidence reference) are now encrypted client-side before submission.
Encrypted Reviewer Voting — Reviewers now submit encrypted votes, confidence scores, and severity scores through ReviewerHub. No plaintext vote data is ever exposed on-chain.
Selective Disclosure System — Built the DisclosureCtrl contract with 4 permission levels: OutcomeOnly, SummaryOnly, FullReport, and IdentityReveal. Admins can grant granular access to authorized parties without exposing full case data.
Real-time Event Updates — Dashboard now reflects live on-chain case status changes, reviewer assignments, and vote confirmations without requiring manual refresh.
Enhanced Dashboards — Separate fully functional dashboards for Reporter, Reviewer, and Admin roles — each showing only permitted data based on role and disclosure permissions.
Receipt-confirmed Submission Flow — Reporters receive a real Case ID derived from the confirmed on-chain transaction receipt, enabling private case tracking.
IPFS Evidence Anchoring — Evidence files are encrypted client-side, uploaded via Pinata, and only the encrypted CID reference is stored on-chain — maintaining tamper-evidence without exposing content.
Live URL: https://leakproof-gamma.vercel.app
GitHub: https://github.com/gokudragoo/LeakProof


Milestone
0points

Grant
0 USDC

0
iPredict-Fhenix
iPredict-Fhenix
Predict privately. Bet encrypted. Win fairly.
prediction market
DeFi
Market Infrastructure
GitHub
Updates in this Wave
We built iPredict in layers, from encrypted core to user interface.

**Week 1 — Contracts.** `Market` struct with `euint32` encrypted pool totals, `Position` struct for user amounts. `IPredictCore.sol` handles creation and encrypted voting; `IPredictOracle.sol` manages resolution; `IPredictTreasury.sol` handles fees. All tested with CoFHE mocks before testnet deployment. A TypeScript deploy script wires all contracts and writes addresses/ABIs to JSON for the frontend.

**Week 2 — Frontend.** Custom hooks (`useIPredictCore`, `useEncryptedVote`, `useClaimWinnings`, `useUserPosition`) wrap contract interactions with proper states. CoFHE SDK encrypts votes client-side before they leave the browser.

**Final days — Polish.** Market listing with filtering, market detail with encrypted pool bar, portfolio page for tracking and claiming. The animated YES/NO reveal on resolution was one of the most satisfying moments.


Milestone
0points

Grant
0 USDC

0
fhenix product hunt
Hidden
fhenix product hunt
privacy vote with fhenix
product hunt
Updates in this Wave
Add better round management, richer product pages, stronger UX around encrypted voting, and prepare the app for a cleaner public launch and repeated weekly competitions.


Milestone
0points

Previous Wave Points
1st Wave
0 pt
Grant
0 USDC

0
CasFin
Hidden
CasFin
The House Runs On Chain while The Hands Stay Private
#PredictionMarket
#casino
Updates in this Wave
CoFHE SDK Integration
Rebuilt the entire FHE pipeline end-to-end. Every bet input is now encrypted in the browser before reaching the network. Coin Flip encrypts your side selection and bet amount. Dice encrypts your target number and amount. The CoFHE session initializes automatically on wallet connect — the frontend disables betting until the TFHE engine is fully warmed. No user action required. Resolution runs in two async transactions: the first submits a decrypt task to the CoFHE network, the second reads the result and settles the vault. The keeper bridges this gap automatically. Encrypted max-bet cap and win/loss comparison both happen entirely inside FHE — the contract never sees plaintext. On Arbitrum Sepolia, CoFHE nodes aren't present (they only run on Fhenix-native chains), so we added forceResolve to each contract — bypasses async decrypt and settles using on-chain randomness. Testnet-only. When CasFin moves to Fhenix, forceResolve disables and the full FHE flow takes over. Same interface, zero frontend changes.
Privy Wallet Integration
Wave 1 wallet UX was raw MetaMask-only — manual network switching, no embedded wallets, high drop-off. Wave 2 replaced the entire wallet layer with Privy. Embedded wallets for users without MetaMask. Social login (email, Google, Twitter) as onramp. Automatic network switching. Session persistence across refreshes. Onboarding now reduces to: click Connect → sign in → play.
New Game: Poker
Four games now live: Coin Flip, Dice, Crash, and Poker. Poker uses the same FHE pipeline — card values encrypted on-chain, hand evaluation over encrypted state, payouts to encrypted vault balance. Same architecture: CoFHE session gating, encrypted inputs, keeper-driven resolution. Deployed alongside existing contracts, managed by the same keeper.
Event-Driven Resolution: WebSocket + Redis Pub/Sub
Killed polling entirely. The Wave 1 keeper polled every 15–60 seconds — slow and wasteful. Keeper now connects via WebSocket and subscribes to contract events. When BetPlaced fires, keeper hears it within the same block and immediately submits resolution. Resolution drops from 30–90 seconds to 3–6 seconds — just blockchain confirmation time. Redis pub/sub (Upstash) sits between keeper and frontend. Results publish to a Redis channel; frontend subscribes via Server-Sent Events through a Next.js API route — UI updates live, no refresh. Backup polling worker catches events missed during WebSocket reconnection.
Multi-RPC Load Balancing
Single RPC in Wave 1 meant rate limits and failures cascaded. Wave 2 adds four RPC URLs with automatic failover and rotation. Keeper has its own dedicated endpoint to prevent resolution transactions from competing with user reads. Infura, Alchemy, and public endpoints configured as fallbacks.
Casino UI Overhaul


Milestone
0points

Previous Wave Points
1st Wave
0 pt
Grant
0 USDC

1
Zap
Hidden
Zap
zap
Private Payments
Updates in this Wave
mistake please ignore


Milestone
0points

Grant
0 USDC

0
Zalary
Hidden
Zalary
Confidential on-chain payroll. Every salary encrypted. Zero plaintext. Built for institutions.
RWA & Compliance
Confidential DeFi
Private Payments
Updates in this Wave
Zalary shipped a complete, production-grade confidential payroll protocol on Fhenix CoFHE. Wave 1 was ideation  Wave 2 is the working system.

What was delivered:

1. ConfidentialToken.sol — An FHE-encrypted ERC20-like token where all balances are euint64 ciphertexts. Transfers use FHE.gte + FHE.select for silent failure with no information leak.

2. PayrollVault.sol — The core payroll contract managing the full lifecycle: creation → salary allocation → escrow funding → activation → employee claims → closure → leftover withdrawal. All financial data (salaries, escrow, funding status) is encrypted. Four escrow invariants are enforced to prevent accounting drift when FHE transfers fail silently.

3. SwapRouter.sol — The USDC ↔ cUSDC gateway. Withdrawals are keyed by bytes32 withdrawKey so one stuck claim never blocks another employee.

4. 42 passing tests across all 3 contracts, including 4 formal invariant proofs.

5. Full deployment to Base Sepolia via Hardhat Ignition. All three contracts are live and verifiable on-chain today.

6. Post-deployment verification script (scripts/confirm.ts)  checks bytecode, role assignments, and token whitelist end-to-end.

Deployed contracts (Base Sepolia, Chain ID 84532):

ConfidentialToken: https://sepolia.basescan.org/address/0xD1A0Ecf8f8430F37627b8B329acb3Bc027F136cF

PayrollVault: https://sepolia.basescan.org/address/0xdDc2C6A6d9B28680e0ca92fED9DffAB173CD6EDa

SwapRouter: https://sepolia.basescan.org/address/0x97f27875c279907f7d461Eb32375BF1d4c294613



Milestone
0points

Previous Wave Points
1st Wave
10 pt
Grant
0 USDC

2
obolos
Hidden
obolos
obolos is compliance infrastructure for tokenized equity.
Compliance infrastructure
Tokenisation
CeDeFi
Updates in this Wave
Generally, a large release. We added a new Secrets module, practically moving toward a self-sovereign cloud solution.

If you have ever used a Password manager or Secrets for your services, you would know for each password and user seat you pay a fee per month. AWS Secrets cost $0.4 per secret pet month!

With Fhenix FHE we can now control access to secrets and other hidden values for practically no cost and with refined access controls that even cloud providers do not support.

New website: 
https://cloud.obolos.io
https://github.com/equitylayer/fhenix-dataroom

Changes & Updates on this wave:
* Added Secrets Vault
* Major UX overhaul to support new Secrets Module
* Added File viewer so we don't have to download the Files
* Access Management is more refined with time based expirations
* Bug fixes and stability improvements


Milestone
0points

Previous Wave Points
1st Wave
0 pt
Grant
0 USDC

1
Rocket Inu
Rocket Inu
Community-driven token built to grow together Fueling a decentralized future with strong holders
Community
DeFi
Analytics
Deliverable
Updates in this Wave
In this wave, we developed the initial concept and branding of Rocket Inu as a community-driven meme token.

We designed the project identity including logo and visual assets. We also defined the token concept, including its purpose as a community-powered asset aimed at engaging users in the Web3 ecosystem.

Additionally, we started planning the technical architecture, including smart contract development and potential integration with Web3 tools such as wallets and decentralized platforms.

Future updates will include smart contract deployment, website development, and community engagement features.


Milestone
0points

Grant
0 USDC

0
Fhenix Privacy Insights
Fhenix Privacy Insights
Researching The Future Of Confidential Computing And Privacy On EVM Chains
Privacy, Infrastructure
Deliverable
Updates in this Wave
In this wave, I have conducted a detailed research on the potential of FHE for secure data analysis within the Fhenix ecosystem. I am exploring how SoSoValue data can be integrated with privacy-preserving dApps


Milestone
0points

Grant
0 USDC

0
FHE AI Context
FHE AI Context
Privacy-Preserving AI Assistant using Fully Homomorphic Encryption (FHE) on Arbitrum
AI
Blockchain
Payment
GitHub
Updates in this Wave

# 🏗️ **Architecture Overview**

```
FRONTEND (Next.js)                | AGENT BACKEND (Express)
/marketplace → Browse/Buy         | POST /chat → Skill Detection
useUserLicenses → Owned?          | GET /skill/user/:addr/licenses
usePurchaseSkill → Buy+Reg        | POST /skill/register-license
        ▼                                         ▼
SMART CONTRACTS (Arbitrum Sepolia)
SkillRegistry → Encrypted listings (FHE.asEuint64)
AgentSkillVault → Purchase + encrypted price check
SkillAccessController → Permission grant/consume (FHE.eq)
EncryptedPricer → Dynamic pricing & fees
```

---

# 🚀 **Deliverables Summary**

## 🧠 1. Skill Engine

Files: `skillDefinitions.ts`, `skillExecutor.ts`

**Skills**

| Skill                  | Purpose               | Triggers                     |
| ---------------------- | --------------------- | ---------------------------- |
| 🏦 DeFi Analyzer       | Yield & risk analysis | `defi`, `yield`, `liquidity` |
| 🛡️ Auditor            | Security checks       | `audit`, `exploit`           |
| 📊 Portfolio Optimizer | Encrypted allocation  | `rebalance`, `sharpe`        |

Each skill has an index, systemPrompt, trigger keywords, and `detectSkill()`.

---

## 🔒 2. License-Gated Chat

Flow:
**detectSkill → isPremium?**
• NO → normal chat
• YES → check license → executeSkill or prompt purchase

Zero token waste; licensed users get expert prompts.

---

## 🎫 3. License Management

Endpoints:

* `GET /skill/user/:addr/licenses`
* `POST /skill/register-license`
* `POST /skill/purchase`
* `POST /skill/list`
* `GET /skill/:index/handles`

In-memory licenseStore with expiry filtering.

---

## ⛓️ 4. SkillAccessController

Encrypted permission validation:

* `verifyAndConsumePermission()`
* Uses FHE.eq, FHE.gt, FHE.select (no branch leakage)

---

## 🛒 5. Marketplace UI

Shows skill name, description, USDC price, “✓ OWNED”, real-time license sync, instant post-purchase update.

---

## 🔗 6. Purchase → Permission Grant

`PURCHASE → encryptSkillPurchase() → Vault.purchaseSkill() → FHE.gte verify → on-chain license → backend register → available in chat`.

---

## ⚙️ 7. Environment

```
SKILL_REGISTRY_ADDRESS=
SKILL_VAULT_ADDRESS=
SKILL_ACCESS_CONTROLLER_ADDRESS=
NEXT_PUBLIC_SKILL_ACCESS_CONTROLLER_ADDRESS=
```

---

## 📦 Files Updated

Agent Backend: 4 created / 5 updated
Frontend: 3 created / 3 updated
Config: 1 updated
**Total: 16 changes**

---

# 🔗 Resources

* GitHub: [https://github.com/phamdat721101/privacy-context](https://github.com/phamdat721101/privacy-context)
* Arbiscan Contracts: AIContextManager, AIMemoryStore, AgentRegistry, AgentAuthority
* Docs: [https://docs.cofhe.com/](https://docs.cofhe.com/)
* Network: Arbitrum Sepolia

---

# 🏷️ Protocols & Tech

FHE · @cofhe/sdk · Next.js 14 · Express · ethers v6 · viem · wagmi · Solidity 0.8.27 · Hardhat
---


Milestone
0points

Previous Wave Points
1st Wave
0 pt
Grant
0 USDC

0
Sigill
Sigill
What you buy is your business. Not the blockchain's
Privacy
Confidentiality
GitHub
Updates in this Wave
1. A real dApp on the Fhenix SDK. Built a Next.js 16 frontend at https://app.sigill.store that uses cofhejs directly in the browser. Four routes:

/ shows orders by scanning OrderPlaced events filtered to the connected wallet.
/buy is a three-step wizard (product, observer, confirm) that encrypts the product ID via cofhejs.encrypt, sets an encrypted cUSDC allowance on Sigill, then calls placeOrder.
/wrap is the balances panel. Mint faucet, wrap USDC into cUSDC, unwrap cUSDC back to USDC, reveal-on-click sealed balance via cofhejs.unseal.
/order/[id] is the sealed envelope. Clicking "Open envelope" unseals the FHE-wrapped AES key, pulls the AES ciphertext from IPFS, and decrypts the gift-card code locally.
2. Confidential token wrapper (cUSDC). Added ConfidentialERC20.sol, an ERC-7984-style wrapper over MockUSDC. Encrypted balances (euint64 handles), encrypted transfer / approve / transferFrom with silent clamping on insufficient funds. Also added a non-standard transferFromAllowance so the Sigill escrow can pull the buyer's already-set encrypted allowance without re-passing an InEuint64 through a nested msg.sender (which would break the zkv signature binding). This closes the privacy gap from Wave 1: the payment amount itself is now encrypted, not plain ETH in escrow.

3. Standalone observer daemon. New @sigill/observer package. A stateless TypeScript process that polls OrderPlaced on Sigill and UnwrapRequested on cUSDC every 5 seconds, unseals what needs unsealing via cofhejs/node, purchases from Reloadly sandbox, hybrid-encrypts the code onto IPFS, and fulfils or honestly rejects. Also ships a pnpm unwrap CLI for operator cash-out. Restart-safe because the chain is the dedupe layer, no database.

4. Decentralisation design doc. Full write-up of how to move from one trusted observer to a marketplace of bonded relays with reputation, at https://github.com/vwakesahu/fhe-giftcards/blob/main/docs/Decentralized%20Observer%20System.md

Links:

Landing: https://www.sigill.store/
App: https://app.sigill.store/
Repo: https://github.com/vwakesahu/fhe-giftcards
Submission write-up: https://github.com/vwakesahu/fhe-giftcards/blob/main/docs/wave-2-submission.md
Decentralisation design: https://github.com/vwakesahu/fhe-giftcards/blob/main/docs/Decentralized%20Observer%20System.md
Sigill contract: https://sepolia.basescan.org/address/0x22C541Bf843113e7C04ab9648eC8735a3feba1dC
cUSDC (ConfidentialERC20): https://sepolia.basescan.org/address/0x2C838637BB71c565EB0ccb0e73569E323E1F2c2D
MockUSDC: https://sepolia.basescan.org/address/0xE29D70400026d77a790a8E483168B94D6E36424F


Milestone
0points

Previous Wave Points
1st Wave
10 pt
Grant
0 USDC

1
Occult Markets
Occult Markets
The most accurate prediction market ever. Price reflects what they believe, not what others believe.
prediction market
GitHub
Updates in this Wave
Wave 2 — Occult Markets

UX overhaul: Rebuilt the entire frontend. Landing page now leads with the actual argument — why prediction markets exist, why transparent AMMs corrupt them, how Occult fixes it. The FPMM leakage proof is shown live. The Keynes framing is front and center. Four-step mechanism explained without assuming the user knows what FHE is.

And Fix: Wave 1's placeBet() took msg.value and encryptedAmount as separate inputs — trivially exploitable. Removed encryptedAmount entirely. Amount is now derived on-chain directly from msg.value. One source of truth, mismatch impossible.

Multiple simultaneous markets: Several markets now live on Arbitrum Sepolia covering the full lifecycle.

Live: https://occult-markets.vercel.app
Contract: https://sepolia.arbiscan.io/address/0x83E4200b36445Aaa91789C3291bDaAa601de5690


Milestone
0points

Previous Wave Points
1st Wave
0 pt
Grant
0 USDC

2
ShadeSpot Perps
Hidden
ShadeSpot Perps
A fully private perpetual DEX on Fhenix. FHE hides your positions, ZK proves market data.
DeFi
DEX
perpetual
Updates in this Wave
Wave 2 delivers six major advances over Wave 1: elimination of the plaintext pool, a fully encrypted funding rate manager, encrypted position keys that hide direction, an FHE-native order price check, a hardened three-phase vault reservation, and a trading frontend.
1. Eliminated the Plaintext Pool — Protocol is Fully FHE-Native
What changed: Wave 1 shipped a dual-pool architecture: Pool 1 was a standard plaintext perpetual (USDC, Router.sol) alongside Pool 2 (FHE encrypted). Wave 2 removes the plaintext pool entirely. Vault.sol, Router.sol, OrderManager.sol, and MockUSDC.sol are removed. The codebase is now a single FHE-native perpetual DEX with 10 contracts instead of 14. Deployment uses a single script (DeployShadeSpot.s.sol).
Why this is an improvement: The dual-pool model weakened the privacy design. A plaintext pool enabled leakage via observable oracle interactions and funding state. A single FHE-native pool forces all logic into the encrypted domain.
2. Encrypted Funding Rate Manager (FHEFundingRateManager.sol) What changed: Wave 1 used a plaintext FundingRateManager.sol where long OI, short OI, and cumulative funding rate were public.
- Wave 2 replaces this with encrypted state.
Why this is an improvement: In Wave 1, anyone could observe long/short dominance. This leaks directional signals. Encrypting OI removes this leak.
3. Encrypted Order Price Check (FHEOrderManager.sol) What changed: Wave 1 stored trigger prices in both encrypted and plaintext forms.
Wave 2 removes plaintext storage:Execution uses a two-phase async flow with CoFHE decryption. 
Why this is an improvement: Wave 1 exposed trigger prices through storage. This allowed MEV actors to exploit orders. Wave 2 keeps trigger prices fully private. Only execution validity is revealed.
4. Three-Phase Vault Reservation What changed: Wave 1 passed size in calldata: function reserveLiquidity(uint256 amount, address trader) Wave 2 uses a three-phase flow: Phase 1: submit check with encrypted size Phase 2: verify and store approved size Phase 3: reserve liquidity using stored value No size appears in calldata. 
Why this is an improvement: Calldata is public. In Wave 1, observers could infer position size. Wave 2 removes this leakage completely.
5. Encrypted Entry Funding Rate What changed: Wave 1 stored funding rate in plaintext:
Wave 2 encrypts it: Funding fee is computed fully in FHE. 
Why this is an improvement: Wave 1 allowed inference of position open timing via funding rate. Wave 2 removes this timing leak.
6. LiquidationManager ETH Fee What changed: Wave 2 introduces a small ETH fee for liquidate(). Why this is an improvement: FHE checks are expensive (~1.5M gas). Without a fee, spam liquidations could cause high costs. The fee prevents abuse and aligns incentives. Liquidators are bound to completion, or the fee is forfeited.


Milestone
0points

Previous Wave Points
1st Wave
0 pt
Grant
0 USDC

0
SilentBid
Hidden
SilentBid
Fhenix-powered private bidding, fully on-chain.
DeFi
Updates in this Wave
In this wave, we focused on moving SilentBid from a proof-of-concept into a fully functional, end-to-end private auction system powered by Fhenix CoFHE, with working contracts, frontend, and live testnet deployment.

Live - https://silentbid-fhenix.vercel.app/

1. End-to-End FHE Auction Flow

We implemented a complete sealed-bid lifecycle using encrypted data:

Bids are now submitted as encrypted euint64 values
The contract computes the running maximum using FHE operations (gt, max, select)
No plaintext bid is ever exposed during the auction
Only the final winner and winning amount are decrypted after auction close

This validates that fully private auctions can run entirely on-chain without commit-reveal or off-chain compute.

2. Confidential Token Integration (cUSDC)

We introduced a confidential token wrapper:

Users can wrap standard tokens into encrypted balances
All escrow during bidding is handled in encrypted form
Refunds and settlements happen without revealing amounts

This ensures privacy is preserved not just in bidding, but also in fund management.

3. Asynchronous Decryption Flow

We implemented and handled CoFHE’s async decryption model:

Auction closing triggers a decryption request
A follow-up step publishes the decrypted winner
Similar async flow implemented for token unwrapping

This required restructuring contract logic into multi-step flows, aligning with how FHE works in production environments.

4. Frontend with Client-Side Encryption

Built a full frontend that:

Encrypts bids using cofhejs before submission
Interacts with contracts using standard wallet flows
Handles async states (pending decryption, result publishing)

This makes the system usable without exposing any sensitive data to the UI or backend.

5. Live Deployment on Testnet

The entire system is deployed and live on Base Sepolia:

Users can create auctions, place encrypted bids, and settle outcomes
No local setup required to interact with the deployed contracts
6. Developer-Friendly Structure

We structured the project to be easily extendable:

Modular contracts (auction + confidential token)
Reusable encryption and interaction utilities
Clear separation between encryption logic and contract execution


Milestone
0points

Grant
0 USDC

1
BATNA Protocol
BATNA Protocol
The first negotiation where revealing your minimum first is no longer a disadvantage.
AI agent
FHE
Deliverable
Updates in this Wave
Wave 2 lands the differentiator: humans submit intent, the protocol computes the deal. Claude reads free-form context, derives a reservation price, encrypts via CoFHE SDK, submits on-chain. Anthropic API key stays server-side; user custody never touched.

LIVE: https://batna-protocol.vercel.app/

HEADLINE DEMO — TWO-AGENT BATTLE: Two AI agents read opposing context (candidate vs employer, seller vs buyer, board vs acquirer). Each derives a price via claude-opus-4-6, encrypts via CoFHE Node SDK, submits via submitReservationAsAgent() — emitting AgentSubmission with full provenance (templateId, contextHash, modelHash, promptVersionHash). Room auto-resolves on ciphertexts. Reveal on-chain: server threshold-decrypts via decryptForTx and calls publishResults(); plaintext midpoint lands on-chain, closing the encrypted→settled loop. Example: floor 168000, ceiling 170000 → settles at 169000. Neither number ever leaked.

SOLO AGENT: Party pastes context. /api/agent/derive returns a price; browser encrypts via CoFHE WASM; user signs via wagmi. Derivation and custody cleanly separated.

CONTRACT ITERATION (strict TDD): NegotiationType enum, deadline + notExpired, submitReservationAsAgent() reusing _resolve(). WAVE 2.1 HARDENING (judge-feedback response): bytes32 contextHash replaces plaintext — no deal names on-chain; RoomStatus {OPEN, RESOLVED, EXPIRED, CANCELLED} with expireRoom() + cancelRoom() for stalled-room recovery; auditorAccess() view asserts canSeeMinA/canSeeMaxB == false via FHE.isAllowed() live. Overflow: (minA·wA + maxB·wB)/100 safe when max(minA,maxB) < 2^64/100 ≈ 1.84e17 — tested at wA=0, 100, $1T. Docs: docs/PRIVACY_MODEL.md, docs/THREAT_MODEL.md, SECURITY.md.

AGENT SDK (agent/): TypeScript registry of templates (Salary, OTC cents-per-unit, M&A millions). derivePrice.ts uses an injectable Anthropic client so tests mock the LLM; encryptSubmit.ts shares one encrypt+submit path between CLI and API routes.

NEXT.JS API: /api/demo/two-agents/start is an NDJSON stream — the whole battle runs in one Lambda with maxDuration=60 (no KV, no polling). /api/demo/two-agents/reveal retries decryptForTx + publishResults with backoff until the coprocessor signs.

TESTS: 19 → 71 (all green). Auditor-ACL invariant, edge-weight overflow, contextHash storage, RoomStatus lifecycle, extended AgentSubmission provenance, templates, derivePrice retry, encryptSubmit e2e. Real CoFHE SDK encrypted inputs; mock Anthropic for agent tests.

FRONTEND: ZopaHero SVG + Fraunces×Geist Mono typography + corner brackets. Two-Agent Battle card with scenario presets and split-console inputs; vertical timeline with timestamps, Arbiscan tx links, ticking counters, vault-reveal callout on resolve. Manual / Solo Agent toggle per room.

DEPLOYED (Wave 2.1, Arbitrum Sepolia): https://sepolia.arbiscan.io/address/0x5325cF28337b2f2cf7C8EcE121fdF73d18885915


Milestone
0points

Previous Wave Points
1st Wave
0 pt
Grant
0 USDC

1
ConfidentialBridge
ConfidentialBridge
End-to-end encrypted stablecoin bridge , balances stay FHE-encrypted on both chains.
Privacy Infrastructure
Cross chain / Bridge
GitHub
Updates in this Wave
**ConfidentialBridge v1 — shipped end-to-end this wave.**

A trusted-operator v1 bridge for ERC-7984-style confidential tokens (`cUSDC`) built on Fhenix CoFHE. Balances stay FHE-encrypted on both source and destination — plaintext only materialises at the operator's crossing point, the same trust shape as the underlying `ConfidentialERC20.unwrapper`. Zero new trust introduced relative to the confidential token itself.

What landed this wave:

• **Three contracts shipped + tested.** `ConfidentialERC20` (minimal ERC-7984 wrapper), `ConfidentialBridge` (symmetric per-chain), and `MockUSDC`. 24 mocha tests against `cofhe-hardhat-plugin` mocks cover constructor, seeding, `bridgeOut` (including the ERC-7984 all-or-nothing clamp), `ackOutbound`, `bridgeIn` (reserve-gated loud-fail + replay guard), `drainReserve`, and a full A→B round-trip.

• **Deployed and verified on three testnets.**
— Eth Sepolia bridge: `0xAcAC02B6011064F5A15d637FbE50AD748270ed2B`
— Arb Sepolia bridge: `0x90cC9aF6Bc235E9b0fCAAd626520E33283499b83`
— Base Sepolia cUSDC + MockUSDC (single-chain proof, two bridges per chain)
All 8 contracts Etherscan/Arbiscan/Basescan-verified via Etherscan V2 — every function selector, event, and method ID decodes, and `Read/Write Contract` tabs are live.

• **Live cross-chain round-trip proved.** Bridged 10 cUSDC from Eth Sepolia → Arb Sepolia end-to-end with a single shared EOA (buyer=operator fallback):
— approve (eth): 0xd1958ca76467e72320bd154b1f671383a14bd62c2910b531191561c7fede0ad2
— bridgeOut (eth): 0x99224a4e4d6e0480d6747a04647d06b7fc435778edc98ce4375293211a39f4c9
— ackOutbound (eth): 0xeb0a159cccb8cf821f82cd9e223dcf318d126ddcd587620e0a43fd8c32aaeef5
— bridgeIn (arb): 0x7a68f2c709e4b5faf108cc377ec968922ecfa53f90342fc5afc1c4cd6d890081

Source reserve grew 10→20 on ack; destination shrunk 40→30 on delivery; recipient balance on arb verified +10 via cofhejs unseal.

• **Operator daemon (`operator.ts`).** Long-running bi-directional relay with 5000-block startup backfill and in-memory dedup. On-chain `inboundSettled` is the authority so restarts are safe and cannot double-deliver.

Key design wins:
— Added `transferFromAllowance` on the cToken to sidestep the zkv-signature binding trap (`InEuint64` sigs bind to `msg.sender`; re-verifying inside the bridge under its own `msg.sender` would fail).
— Gated `bridgeIn` on a public `plainReserve` counter for loud-fail on empty reserves (ERC-7984's silent-clamp would flip the replay flag while transferring nothing, unrecoverable).
— `bridgeIn` uses trivial encryption + transient ACL — cheapest path to a credit when the amount is already public to the operator.
— Operator = unwrapper: V2 collapses the operator role behind verified messaging (CCTP / LayerZero / Hyperlane) without contract changes to the encrypted-state machinery.

Repo: https://github.com/meowdeev/ConfidentialBridge


Milestone
0points

Grant
0 USDC

0
ShipProof
ShipProof
ShipProof is a privacy-first builder attestation system powered by FHE.
Infrastructure
Deliverable
Updates in this Wave
  ShipProof
  Private contributor verification. Builders attest their track record on-chain; verifiers decrypt only what the builder chose to share.

  Updates in this Wave

  Consent-Based Score Disclosure
  Builder grants score access to a specific verifier wallet via grantScoreAccess(attestationId, grantee). Verifier opens /verify/{attestationId}, connects wallet, decrypts encrypted score via CoFHE permit.
  ScoreAccessGranted event is public; the score value is not.
  - FHE.allow(encScore, grantee) — scoped to one handle, one wallet
  - grantMetricAccess() optionally opens individual metrics (advanced, collapsed by default)
  - Privacy warning: per-metric sharing could link to public profiles

  Encrypted Scoring Pipeline
  Oracle collects metrics from GitHub + X, encrypts server-side via @cofhe/sdk/node. Contract scores on ciphertexts:
  - FHE.min → FHE.mul → FHE.div — normalize and weight each metric
  - FHE.add — weighted accumulation across all metrics
  - FHE.gte — pass/fail threshold check
  - 3x FHE.gte + 3x FHE.select — constant-time tier derivation, no branch leakage
  44 FHE calls, 12 op types. Computation on ciphertexts, not encrypted storage.

  Verifier Portal
  /verify — wallet lookup via BadgeMinted event logs. No indexer, no subgraph.
  /verify/{attestationId} — handles invalid, not ready, wallet not connected, wrong chain, and access states. Custom useDecryptScore hook bypasses @cofhe/react 0.4.0 hooks (incompatible with v0.1.3 bytes32 handles).

  Auto-Chained Attestation
  Single button fires 5 txs: submit → computeScore → computePass → publishPassDecryptResult → mintBadge. Resumable from any step. Per-wallet localStorage state.

  CoFHE v0.1.3 Migration
  cofhe-contracts v0.0.13 → v0.1.3. FHE.decrypt() → FHE.publishDecryptResult() with coprocessor-signed async flow. Mock contracts patched for bytes32. 46 Foundry tests pass.

  Trust Model
  Oracle sees plaintext during collection — this is the trust boundary. Post-encryption, oracle cannot read or modify scores. EIP-712 signature binds envelope to whitelisted oracle. Scoring logic is on-chain. Chain sees:
  attestation metadata, badge status, sharing events, encrypted handles. Chain never sees: plaintext metrics, provider accounts, plaintext score.

  Deployed
  - https://shipproof.lol/
  - ShipProof: 0x682c26075cbfa9d097A856dc9d2Ab450F5D8179e
  - ShipProofBadge: 0x376dF458691673adcD7D8dC166D278464bf79E7E
  - 46 Foundry + 36 server tests
  - Solidity, Foundry, Bun/Hono, React 19, wagmi, @cofhe/sdk


Milestone
0points

Previous Wave Points
1st Wave
0 pt
Grant
0 USDC

1
CipherLend
Hidden
CipherLend
Prove it. Never show it
Confidential DeFi
Updates in this Wave
- Migrated backend crypto utility off legacy fhenixjs usage to explicit @cofhe/sdk client setup ( createCofheConfig → createCofheClient → client.connect ).
- Added explicit two-path decryption helpers:
- decryptForView(...) for off-chain/UI reads (permit-based).
- decryptForTxWithPermit(...) and decryptForTxWithoutPermit(...) for on-chain publish flow.
- Added buildPublishDecryptResultArgs(...) to shape decryptForTx output for FHE.publishDecryptResult(...) calls.
- Updated encryption flow to builder API ( encryptInputs([...]).execute() ).
- Added chain selection via COFHE_CHAIN_NAME and documented valid values.
- Updated docs to explicitly reflect the deprecation-safe model and migration posture.
- Wired production-ready decrypt APIs so the new split flow is now operational in backend routes.
- Added POST /api/v1/decrypt/view for off-chain UI decryption via decryptForView (permit-based).
- Added POST /api/v1/decrypt/tx for on-chain publish flow via decryptForTx (supports permit mode or withoutPermit mode).
- Added request validation, FHE type parsing ( bool , uint8 , uint16 , uint32 , uint64 , uint128 , address ), and JSON-safe bigint serialization.
- Registered the new decrypt router in the Express server.


Milestone
0points

Previous Wave Points
1st Wave
0 pt
Grant
0 USDC

1
walnut
Hidden
walnut
Private lending, finally. Borrow and manage positions without exposing your data.
DeFi
Lending Protocol
private lending
Updates in this Wave
In this wave, Walnut moved from prototype to a complete private lending flow with stronger on-chain logic and better reliability.

Links
Live app: http://walnut-finance.vercel.app
Explainer video: https://youtu.be/DEMIBMNoKy4
Contract: https://sepolia.etherscan.io/address/0xD6792922Bca01d34E543cf241D4B3474207d2594

What I have implemented :
>> Completed private lending lifecycle:
deposit, borrow, repay, and withdraw are now wired end-to-end.

>> On-chain constraints added:
Borrow limits and LTV checks are enforced in contract logic, not only in UI.

>> Encrypted risk visibility:
The health factor is computed privately and shown through a permit-based decryption flow.

>> Liquidation flow expanded:
Request-based liquidation checks and follow-up settlement path were added for async decrypt workflows.

>> Sealed-bid liquidation auction added:
open auction, submit encrypted bids, select the winner, finalize the settlement, and emit the winner's outcome.

>> ENS multi-wallet support:
Linked wallets can be registered, and collateral can be aggregated in an encrypted flow.

>> Frontend reliability improvements:
reduced repeated signing prompts when permit/data already exists, improved wallet reconnect behavior on reload, and clearer status/error handling.

>> Testing and quality:
contract test coverage expanded for lending, auction, and ENS-linked flows.

Wave 1 validated the encrypted lending feasibility.
This wave makes Walnut significantly closer to production protocol behavior: encrypted state, enforceable on-chain rules, and real multi-step private lending operations.


Milestone
0points

Previous Wave Points
1st Wave
10 pt
Grant
0 USDC

2
0xSolvency
Hidden
0xSolvency
Prove solvency. Reveal nothing.
Insurance
DeFi Infrastructure
Privacy
Updates in this Wave
TBD


Milestone
0points

Previous Wave Points
1st Wave
0 pt
Grant
0 USDC

1
Custos
Hidden
Custos
Custos is a privacy-first AI for secure document upload, sharing, and analysis with full encryption.
Privacy Infrastructure
RWA & Compliance
AI
Updates in this Wave
Custos — The first AI document tool where even who has access is encrypted on-chain.

Problem: ABA Formal Opinion 512 (Feb 2024) warns 1.3M US lawyers they cannot use public AI on confidential client matters. Standard encrypted storage doesn’t solve this — transparent blockchains still leak WHO shares WHAT with WHOM. If “0xLawFirm granted 0xAcquirer access to document 0xDeal” is visible on-chain, that reveals an M&A relationship worth millions. Custos eliminates this leakage using FHE.

Live: https://custos-sable.vercel.app
Contract (Sepolia, verified): https://sepolia.etherscan.io/address/0xDC756aaAb268610e157Fb11fe81c400E09b8eB8c#code
GitHub: https://github.com/harystyleseze/custos

What we built:

1. DocumentVault.sol — FHE-encrypted access control
Ownership stored as `eaddress` (encrypted), access expiry as `euint64` (encrypted), and access results as `ebool` (encrypted). Core operation: `FHE.gt(expiry, block.timestamp)` compares encrypted values without revealing them. Only the requester can decrypt their own access status.

Side-channel resistant: `checkAccess()` does NOT revert on non-existent documents. Default zero expiry returns encrypted false — observers cannot distinguish “no document” from “access denied.”

6 FHE ops: `FHE.asEuint64`, `FHE.asEaddress`, `FHE.gt`, `FHE.allowThis`, `FHE.allow`, `FHE.allowSender`.

2. Privacy-preserving AI — 100% browser-native
Files encrypted with AES-256-GCM in-browser → stored on IPFS (ciphertext only). On open: browser decrypts locally, chunks text (structure-aware with heading detection), embeds via multilingual-e5-small (WASM, 384-dim), performs semantic search, and generates answers using Qwen2.5-1.5B-Instruct running entirely in-browser via WebGPU (`@mlc-ai/web-llm`).

No server, no API, no Ollama — document content never leaves the browser tab.

Multi-format support: text (inline), PDF (iframe), images, binary (download).

3. Technical stack
@cofhe/sdk v0.4.0 (no deprecated cofhejs), RainbowKit wallet integration, 14 tests on CoFHE mock backend, real `decryptForView` with permit, on-chain event indexing. Built with Next.js 14, wagmi v2, viem. Deployed on Vercel.

FHE enables encrypted computation of access validity (`FHE.gt(expiry, now)`), preserving privacy of access metadata and results.


Milestone
0points

Grant
0 USDC

0
Tezcatli
Hidden
Tezcatli
Stop being a target: Take your wealth from public exposure to total invisibility.
Privacy
Infraestructure
DeFi
Updates in this Wave
## User Flow

The current user flow is intentionally split into three product phases:

1. `Scan Wallet`
   The user connects a wallet and requests a privacy scan. This step uses `POST /api/scan` from `tezcatli_back` and returns privacy score, findings, recommendations, supported assets, and next actions.

2. `Request migration eligibility`
   This is a separate decision point. The frontend calls `POST /api/migration/eligibility` only when the user explicitly asks to migrate. For alpha and demo work, this path may use simulated Wavy-aligned risk bands so the rest of the flow can be exercised without blocking on the live provider.

3. `Create confidential account and use DeFi confidentially`
   If the wallet is eligible, the app prepares the confidential smart account, migrates selected assets, shows the resulting account, and exposes the next alpha actions:
   - generate private yield
   - buy gold privately

This project is the first `CoFHE-based` Tezcatli prototype: a wallet migrator that moves public ERC-20 balances into confidential balances using a stealth-style intake flow and an FHE-wrapped destination token.

The contracts are organized by functional domain:

- `contracts/confidential_migrator/`: stealth intake + migration (`TezcatliMigrator`, `TezcatliStealthRegistry`, `TezcatliStealthAnnouncer`, `TezcatliDustSwap`, `TezcatliWrappedToken`)
- `contracts/confidential_defi/`: vaults + strategy routing + risk policy (`TezcatliConfidentialVault`, coordinator, adapters, fee model, GMX wrapper POC)
- `contracts/confidential_accounts/`: smart accounts + userOp/paymaster primitives (`TezcatliSmartAccount`, `Tezcatli4337Account`, factories, `TezcatliPaymaster`, `TezcatliEntryPointMock`)
- `contracts/mocks/`: local testing mocks (`MockUSDC`, `MockDustToken`, `MockYieldVault`, `MockAaveV3Pool`, `MockGmxExchangeRouter`, etc.)

## Scope of this MVP

- the migration path solves source-to-destination linkage first
- the recipient lands in an encrypted balance model immediately after migration
- the destination can already be a programmable smart account
- the ingress amount is still visible during the public ERC-20 sweep
- dust swaps use a simple whitelisted rate-based contract, not a live DEX router

That last point matters. A secure migrator should not accept an encrypted amount it cannot verify against the public sweep amount. Full amount privacy during migration needs a batching or aggregation layer on top of the stealth intake, which is a later step.


Milestone
0points

Previous Wave Points
1st Wave
0 pt
Grant
0 USDC

1
ZeroTrace
ZeroTrace
ZeroTrace is a privacy focused crypto trading platform for encrypted order flow.
Market Infrastructure
DeFi
Privacy
GitHub
Updates in this Wave

  Completed a bugfix and verification pass for the ZeroTrace prototype across smart contracts, backend, and frontend.

  In this wave, I fixed the status/health flow so the backend now correctly returns healthy and degraded responses from /api/v1/status, and I
  updated the backend tests to cover both cases. I cleaned up user-facing text issues by replacing non-ASCII ellipsis characters in the order form
  with standard ... to avoid mojibake. I also updated the deployment script to explicitly import Hardhat runtime usage in scripts/deploy.js.

  On the contract side, I fixed order accounting so submitted orders now reflect the amount actually escrowed by the encrypted token logic. This
  covers underfunded buy and sell orders and prevents overstating order capacity. I also updated settlement so executeMatch uses verifiable decrypt
  proofs on-chain, validates current order state before settlement, rejects stale or tampered proofs, and reverts non-crossing matches correctly.

  On the matching/backend side, I fixed zero-capacity order handling so empty orders are removed from active matching sets and marked as empty
  instead of clogging the engine. The frontend was updated to render empty orders as closed and non-cancellable.

  Verification completed successfully:

  - npx hardhat test
  - npm --workspace backend test
  - npm --workspace frontend run lint
  - npx tsc --noEmit --project frontend\\tsconfig.json
github repo=https://github.com/anshuraj5679/ZeroTrace.git
project link=https://zero-trace-frontend.vercel.app/


Milestone
0points

Previous Wave Points
1st Wave
0 pt
Grant
0 USDC

1
Acquire
Acquire
The classic board game Acquire adapted for online and onchain play!
Game
GitHub
Updates in this Wave
- Enabled Authentication
- Deployed Contracts on Arbitrum Sepolia
- UI updates
- Complete Game Flow
- Live Mongo DB integration for notification features
- Bug Fixes
- Progressive Web App features


Milestone
0points

Previous Wave Points
1st Wave
0 pt
Grant
0 USDC

1
Obscura Finance
Obscura Finance
Invoice financing for SMEs in emerging markets. Encrypt invoice. Get liquidity. Lenders earn yield.
RWA Protocol
DeFi
GitHub
Updates in this Wave
Links and Demo all available on the repo

Government Contract & Freelancer Flows 
Expanded the protocol to two additional invoice types and activated encrypted reputation scoring. 

Deliverables: 
- Government contract receivable flow: encrypted contract reference verified via FHE oracle, government-backed pool tier activated, elevated risk score applied automatically 

- Freelancer invoice flow: individual KYC via Privara (lighter than KYB), retail pool routing,

- Default escalation module: grace period logic, multi-party threshold decryption, unlocking buyer identity and invoice amount for legal recovery — the only moment any invoice data is decrypted 

- Encrypted reputation scoring: successful repayments update an on-chain encrypted score, improving advance rates after 3+ repayments 

- All three workflows (corporate, government, freelancer) are testable end-to-end on the same four core contracts with different pool parameters


Milestone
0points

Previous Wave Points
1st Wave
0 pt
Grant
0 USDC

1
eUSD Vortex + private alias
eUSD Vortex + private alias
A private stablecoin portal powered.
Stablecoins
Deliverable
Updates in this Wave
Intimo Protocol — the private payment inbox. Live at https://intimo-protocol.vercel.app (source: https://github.com/tcxcx/secret-secret).
One-liner. Pay a .intimo name, not an address. Anyone sends USDC or USDT; the recipient receives private eUSD, spends it, or cashes out to their bank. eUSD is issued through an M0 extension (https://www.m0.org/), giving us short-term treasury-bill revenue.
Wave 2 deliverables (shipped):

End-to-end user journey. Landing → claim name → onboard → inbox → send → cash out. Four routes, zero dev-only surfaces. Hero lets first-time visitors claim a name in two clicks.
Wallet identity layer. Passkey onboarding via Circle Modular Wallets (WebAuthn → ES256 → toCircleSmartAccount), gas sponsored on Arbitrum Sepolia. External EOA path via RainbowKit + wagmi v2. Demo burner path for reviewers. useIdentity hook abstracts all three behind one {kind, address, chainId, sign, sendCalls} surface. Profile stored on device, no server-side PII.
Private balance + stealth-delivery adapter. Simulated private eUSD balance with reveal UX (tap to un-blur 3s). Activity log via single JourneyContext. Recipient resolution hits an ERC-6538 registry (fixtures: jun, mira, leo, anna, kai). Vortex deposit models the production flow: approve USDC → ingress hook → M0 adapter mints eUSD → wrap to cEUSD at stealth address. Local simulation today.
App Router architecture. /signin as parallel-route modal plus standalone full-page route. Direct nav = full page; in-app nav = overlay with Esc + backdrop dismiss. Deep-linkable, refreshable. Per-route metadata, branded loading/error/not-found.
Responsive + accessible. Tested at 375 / 768 / 1440. clamp() typography, custom RainbowKit ConnectButton.Custom matching the ink aesthetic.
Brand + design system. @intimo/design-system package with DotGlobe, BrandMark, shared tokens (--intimo-blue = #0adcd2). Editorial minimalism: ink on white, mono display + system sans body.
Protocol documentation of record. Binding decisions: FHE substrate is CoFHE (@fhenixprotocol/cofhe-contracts), stealth addressing via ERC-5564 / ERC-6538 singletons, hook boundary USDT/USDC (stage 1) and USDC/eUSD (stage 2), Permit2 on input token.

Blocked on upstream tokens:

M0 leg (BufiM0ExtensionAdapter.mintFromUsdc) wired end-to-end in UI; awaiting M0 testnet tokens. Once they land, Vortex flips from simulation to real paymaster-sponsored user op; /inbox balance becomes true on-chain cEUSD.
Uniswap v4 hook (USDT→USDC→eUSD) scaffolded behind the same adapter; config swap once M0 is live.

Waves 3–4 (planned):

Wave 3: real eUSD issuance via M0 extension on Arbitrum Sepolia. First end-to-end receive-a-name → cEUSD balance flow on testnet.
Wave 4: Uniswap v4 hook (stage 1 USDT/USDC, stage 2 USDC/eUSD), Permit2 on input leg, idempotent referenceId settlement, on-chain sweep → mint → private credit lifecycle.


Milestone
0points

Grant
0 USDC

0
VideoChain
VideoChain
Tokenization of real-world assets, including music and video, and facilitating content monetization.
RWA
NFT
Content Monetization
GitHub
Updates in this Wave
Porting Videochain on to Arbitrum was completed.

Deeper integration of FHE. 


Milestone
0points

Previous Wave Points
1st Wave
0 pt
Grant
0 USDC

2
PrivaBid
Hidden
PrivaBid
PrivaBid encrypted sealed-bid auctions on Fhenix FHE. No front-running. Just math.
Market Infrastructure
Privacy
DeFi
Updates in this Wave
Wave 2  Multi-Mode Contracts, Live Frontend & Expanded FHE Architecture
Following judge feedback to go deeper on FHE implementations, we expanded PrivaBid from a single sealed-bid contract into a full multi-mode encrypted auction platform with three live deployed contracts and a working frontend.
Smart Contracts  All Live on Arbitrum Sepolia
PrivaBid (First-Price) — highest bid wins, pays own amount. Core FHE ops: FHE.gt, FHE.max, FHE.select.
https://sepolia.arbiscan.io/address/0x83F0D8049730e4AD6b4b4586f322c85CA9D7Ca3a
PrivaBidVickrey  highest bid wins but pays the second-highest amount. Tracks two encrypted values simultaneously using nested FHE.select. Requires two separate Threshold Network proofs at reveal  one for the winner, one for the payment amount.
https://sepolia.arbiscan.io/address/0x471991CDCD48d847ea31a2e87Ba743f41F43c3FD
PrivaBidDutch — bidders submit encrypted price thresholds. Contract checks FHE.lte(currentPrice, encryptedThreshold) as price descends. Winner matched automatically without revealing any threshold. This auction type is impossible on transparent chains.
https://sepolia.arbiscan.io/address/0xd34b656D608699136404B193F20f8282a3B22028
Frontend — Live & Accessible
Full React + TypeScript frontend deployed on Vercel. Anyone can connect MetaMask, auto-switch to Arbitrum Sepolia, and place a real encrypted bid against any of the three live contracts right now.
Live App: https://priva-bid-xsn1.vercel.app/
What works end to end:

Wallet connection with automatic network switching to Arbitrum Sepolia
Live auction state reading from all three contracts
Real bid submission through MetaMask
Bid feed showing wallet addresses with amounts as 🔒 Encrypted
Countdown timer, total bids, auction status per mode

GitHub: https://github.com/Emmy123222/PrivaBid


Milestone
0points

Previous Wave Points
1st Wave
0 pt
Grant
0 USDC

1
Lendi
Lendi
Prove what you earn. Reveal nothing. FHE-powered private lending for LATAM's informal economy.
Privacy Infrastructure
Confidential DeFi
RWA & Compliance
GitHub
Updates in this Wave
Wave 2 — Integration
Lendi moves from demo to pilot-ready. Automatic income capture, full ReinieraOS escrow lifecycle, and production-hardened contracts.

Smart Contracts — deployed and verified on Arbitrum Sepolia

- LendiProof.sol — redeployed with critical fixes from technical review: linkEscrow overwrite guard (W3), rolling 12-bucket income window replacing perpetual accumulator (W5), registerLender() public removed — lenders registered by owner only (W6), FHEMeta.asEuint64(encInput, sender) binding ciphertext to caller (W13), TestnetCoreBase inheritance for upgradeability (W11).

- LendiProofGate.sol — real FHE condition resolution replacing Wave 1 placeholder: isConditionMet(uint256) calls proveIncome() + FHE.getDecryptResultSafe(), onConditionSet(uint256, bytes) decodes worker + threshold and calls linkEscrow, ERC-165 supportsInterface() — fully aligned with ReinieraOS IConditionResolver.

- LendiPolicy.sol — new contract implementing IUnderwriterPolicy: evaluateRisk() returns encrypted risk score, judge() resolves defaults, ERC-165. Based on ReinieraOS SimplePolicy pattern.
All tests passing with CoFHE mocks including real condition resolution, onConditionSet flow, and policy evaluation.

ReinieraOS Integration

Full escrow lifecycle via @reineira-os/sdk: lender creates ConfidentialEscrow (0xC4333F84F5034D8691CB95f068def2e3B6DC60Fa) with LendiProofGate as condition resolver → onConditionSet links worker + threshold → isConditionMet calls proveIncome() → funds release on pass, silent zero-transfer on fail. LendiPolicy registered with PolicyRegistry (0xf421363B642315BD3555dE2d9BD566b7f9213c8E) for default coverage via ConfidentialCoverageManager.

Product App — new, separate from landing page

Bootstrapped from platform-modules via Atlas /bootstrap. React 19 + ZeroDev + @cofhe/sdk/web (migrated from deprecated cofhejs).

Worker flow: ZeroDev passkey login (no seed phrase, no gas) → income auto-captured via @reineira-os/sdk onPaymentReceived → recordIncome(InEuint64) called automatically → worker views own income via decryptForView in device RAM only. Spanish-first UI. Mobile-responsive. CoFHE async states visible (10–30s processing windows).

Lender flow: creates escrow → isConditionMet called by ConfidentialEscrow → receives ✅ or ❌ only, never income amount.

In progress: WebLLM local AI advisor — income decrypted in device RAM, zero server calls, personalized guidance in Spanish. Integration ongoing.

Backend — new

TypeScript + Clean Architecture bootstrapped from platform-modules. SIWE auth, income event logging (timestamps + tx hashes only — zero plaintext amounts in DB), loan coordination, QuickNode webhooks for on-chain events, @reineira-os/sdk escrow creation. Privacy constraint enforced at schema level.

Landing page: https://www.lendi.lat
Live demo: https://lendi-origin.vercel.app
Demo repo: https://github.com/LendiXYZ/lendi-origins
GitHub: https://github.com/LendiXYZ


Milestone
0points

Previous Wave Points
1st Wave
10 pt
Grant
0 USDC

2
MOGATE FHE
Hidden
MOGATE FHE
Trustless NFT GiftCards, Trade Privately, Reveal Instantly.
RWA
Privacy
GiftCards
Updates in this Wave
We released NFT GiftCode FHE model, ERC721-MG. 
A new model that's better than before, using FHE.

In the previous version, the giftcard would be redeemed when the NFT was burned, and this depended on an off-chain server to retrieve the actual giftcode string, restricting/isolating it to our ecosystem.

Now it's more decentralized with the FHE system, which protects the giftcode from everyone, including the owner.
It simply encrypts the giftcode using CoFHE. It can also be combined with AES encryption if you're encrypting arbitrarily long payloads. Then the ciphertext is submitted to the NFT itself.

With this approach, when an NFT is traded or sold to another user, the giftcode remains safe and stays attached to the NFT wherever it goes.
When users are ready to view the giftcode, they can redeem the NFT, which converts it into an SBT (making it non-tradable) and reveals the giftcode. This requires zero off-chain intervention, users can decrypt the code themselves too since CoFHE/SDK is free for everyone.

The system that tracks whether a giftcode has been used and when/where it was used still uses an off-chain server because brands and merchants are still Web2 systems. Users can also re-mint the SBT back to an NFT giftcard with a fee.



Please check our new demo for ERC721-MG with the CoFHE system:
🎬 Demo: https://www.youtube.com/watch?v=H3iJWGhjusk
✅ Verified Contract: https://sepolia.etherscan.io/address/0xFBf8608D465D4Aa88b7fDb4Bb76c84cb7037AE55#code
🌐 DApp: https://testnet.mogate.io
📂 GitHub: https://github.com/dellwatson/moga-mogate-FHENIX/



Milestone
0points

Previous Wave Points
1st Wave
0 pt
Grant
0 USDC

1
AttentionX
AttentionX
Startup TCG where users can gain from the upside of their favourite startups
Game
Deliverable
Updates in this Wave
We implemented Fhenix CoFHE (Fully Homomorphic Encryption) for concealed decks during the tournament. 


Milestone
0points

Previous Wave Points
1st Wave
0 pt
Grant
0 USDC

0
Veilshield
Veilshield
Veilshield is a confidential cargo delay cover for exporters
Market Infrastructure
Privacy
GitHub
Updates in this Wave
This is the first wave submission for VeilShield.

In this wave I built a working private cargo delay cover demo on Fhenix CoFHE and deployed it live on Arbitrum Sepolia.

What is live now:
- public demo app: https://veilshield.xyz
- public repo: https://github.com/Zhekinmaksim/VeilShield
- live smart contracts for VeilShield and the demo token
- role-based frontend for Policy Holder, Liquidity Provider, Oracle / Claims, and Auditor
- encrypted threshold flow for policy creation
- encrypted oracle submission
- on-chain claim evaluation flow with async finalize handling
- permit-based local decryption for role-scoped views
- seeded demo state so the app does not open on an empty screen

I also spent time fixing demo reliability:
- improved wallet connect and disconnect flow
- removed noisy background error toasts from normal user actions
- simplified the policy purchase flow
- stabilized the header layout and date input UX
- moved frontend ABI imports into the repository so Vercel Git builds do not depend on local Hardhat artifacts

The current product focus is narrow on purpose: private cargo delay cover for exporters. That use case feels especially relevant while shipping routes and delivery timing remain exposed to geopolitical disruption and congestion risk.


Milestone
0points

Grant
0 USDC

0
Hexa Pay
Hidden
Hexa Pay
HexaPay product surfaces privacy and trust at the top level.
Market Infrastructure
Payments
Privacy-Preserving DeFi
Updates in this Wave
In this wave, we transitioned HexaPay from a product-facing prototype into a real payment-capable system by introducing a proper payment core, lifecycle tracking, and shared persistence aligned with a serverless deployment model (Vercel).

The key focus of this wave was to make payments stateful, traceable, and reliable across sessions, moving beyond in-memory execution flows into a system that behaves like a real finance backend.

Core Payment System

We finalized and hardened the EIP-712 payment intent flow, ensuring consistent structure across frontend, backend, and contract execution. This includes:

Standardized intent fields (token, amount, payer, merchant, expiry)
Signature validation and integrity checks
Consistent intent construction across UI and API layers
USDC Settlement Integration

We upgraded execution from abstract payment events to real ERC20 settlement using USDC on Arbitrum Sepolia, including:

transferFrom-based settlement via executor contract
Frontend approval flow (allowance check + approve)
Handling of gas estimation and fee edge cases
Payment Lifecycle Engine

We introduced a deterministic lifecycle state machine for every payment:

created → challenged → signed → executing → settled / failed

This lifecycle is now:

tracked at backend level
surfaced to UI
used to drive execution and error handling
Ledger & Persistence (Upstash / Redis)

To make the system compatible with Vercel’s stateless runtime, we implemented a shared ledger layer backed by Redis (Upstash):

Payment records stored by requestId
Mapping between:
intentHash
requestId
txHash
status
Shared across all API executions (not in-memory)

This enables:

persistent payment history
reliable status tracking across reloads
idempotent execution and replay protection
Payment History API

We added a new API layer:

/api/payments/list

This allows:

querying past payments
building UI activity panels
enabling future analytics and reconciliation
Runtime Stabilization (Vercel)

We aligned the system with serverless deployment:

moved away from local-only state
introduced environment-driven configuration
ensured API endpoints work in production environment
Deliverables

Live App:
https://hexa-pay.vercel.app/
Contracts (Arbitrum Sepolia):
Core: https://sepolia.arbiscan.io/address/0xceac99B0CCb3c2418A0b59d751AD3d95E039dc60
Factory: https://sepolia.arbiscan.io/address/0xE39da42fED8fCB816f20F0176e1A4c94213c133c
Workflow: https://sepolia.arbiscan.io/address/0xA38c0195e312f2354F4aC186b165e538aE388Cc9
Escrow: https://sepolia.arbiscan.io/address/0x6e2C9137A773d3E36Ef0F9aF07899D92E32170b1
Compliance: https://sepolia.arbiscan.io/address/0x2b86C5E67287FC29AA7fa1f02a487EeA00227207
Analytics: https://sepolia.arbiscan.io/address/0x66BA4df1eaAdcd4c32B1843BF283eD89A006a9d7
Vault: https://sepolia.arbiscan.io/address/0x6BF49B5D09dE43E75D692DF3299B46c077898f06


Milestone
0points

Previous Wave Points
1st Wave
0 pt
Grant
0 USDC

1
Division FHE
Hidden
Division FHE
Describe your FHE contract in English. Get audited Fhenix CoFHE Solidity in 2 minutes.
Developer Tools
Privacy
AI
Updates in this Wave
Division FHE — AI-powered FHE smart contract generator and auditor built on Fhenix CoFHE.

Live dApp: https://divprivacy.uk/fhenix/

What we shipped this wave:

1. AI Generator — describe your contract in plain English, get production-ready CoFHE Solidity in seconds. Powered by Qwen3-480B (480B parameter model via Hyperbolic API) with Opus and Sonnet as fallback models. Generator handles all CoFHE specifics: euint32/euint64 types, FHE.allowThis(), FHE.allow(), FHE.isInitialized() — no manual FHE boilerplate.

2. 14 contract templates — voting, token, lottery, threshold, payroll, DEX, DAO, vault, escrow, registry, auction (3 variants), poll. All verified to compile cleanly with CoFHE Hardhat.

3. PRION Auditor — integrated FHE-specific security scanner that checks generated contracts for common CoFHE vulnerabilities: missing allowThis() calls, unprotected balance leaks, incorrect InEuint memory types.

4. Auto-compile pipeline — generated contracts are compiled server-side via Hardhat CoFHE toolkit and results returned with compile status and ABI.

5. Compare tab — side-by-side diff of generated contract vs reference implementation.

All contracts compile on Fhenix CoFHE. Generator tested on PrivateToken, ConfidentialThreshold, PrivateVoting, PrivateAuction and 10+ other contract types.


Milestone
0points

Grant
0 USDC

0
Ghost Pay
Hidden
Ghost Pay
GhostPay: Private everyday and company payments, powered by Fhenix.
Payments
Updates in this Wave
In Wave 2, we shipped a working end-to-end MVP: the GhostPay smart contract is deployed and wired to the frontend, owner-only employee onboarding is live, salary/bonus encryption from the UI is implemented, encrypted payEmployee transactions are functional, and employee removal plus real-time dashboard stats are available. We also completed Web3 integration (wagmi + RainbowKit), CoFHE client setup for encryption/decryption workflows, and production-style UX elements (modals, loading states, toasts, role-aware actions).


Milestone
0points

Grant
0 USDC

0
FHE Oracle Bridge
FHE Oracle Bridge
FHE Oracle: Private on-chain prices via encrypted comparisons—no MEV, no front-running.
Infrastructure
Deliverable
Updates in this Wave
## Wave 2 Deliverables — FHE Oracle Bridge

**What Wave 2 Proves**
"We turned the oracle from a public ticker into enforced infrastructure — encrypted feeds, strict on-chain access control, and consumer patterns that never ask for a plaintext price."

**1. On-Chain Access Control — AccessRegistry.sol**
The AccessRegistry enforces that only approved consumer contracts can interact with encrypted oracle outputs — at the contract level, not the UI level.
- Whitelisted consumer addresses tracked on-chain
- Non-whitelisted calls revert — contract enforced, not UI filtered
- One source of truth for authorized access

When a non-whitelisted contract reverts on Arbiscan, that's cryptographic access control — not a frontend decision.

**2. Consumer Integration Patterns**
Wave 2 shows how a protocol actually uses this oracle — without receiving a plaintext price.

MockConsumer.sol (+ CoFHE / Fhenix variants):
- Pulls encrypted aggregates when authorized
- Performs encrypted comparisons — "is spot below threshold?" not "give me the price"
- Returns one thing: a boolean

IFHEOracleBridge interfaces provide a clean plug-in surface for third-party DeFi contracts — no internal contract knowledge required.

**3. Staleness Guards and Revert Paths**
TTL-based staleness checks enforced at the contract level:
- Reads revert if feed exceeds TTL window
- Stale and non-whitelisted revert paths covered in test suite
- Frontend freshness indicator backed by contract rules — not cosmetic

**4. Frontend Dashboard**
Location: frontend/index.html + frontend/config.json

Shows feed metadata (round, quorum, freshness) with no plaintext prices. Includes consumers page, feeders page, event log, config panel, and wallet connect. Auto-recovers if MetaMask switches networks mid-session — falls back to read-only RPC without error-spamming.

**5. Live Deployment — Arbitrum Sepolia**
Chain: Arbitrum Sepolia (421614)
FHEOracleBridge: 0x030815AF032e051346Ec9dD575D781BB52e44B7F
AccessRegistry: 0x6Bf530a2CDbCE59be2c106F1B5C43BbEc562A7E1
Hosted: https://fhe-oracle-bridge-demo.surge.sh
Local: npm run frontend → http://127.0.0.1:8765

All addresses wired in frontend/config.json. A judge can open the dashboard and immediately confirm real deployed contracts.

**Wave 2 In One Line**
"Encrypted feed, strict whitelist, real testnet — so protocols can build private predicates on top without ever seeing a price."


Milestone
0points

Previous Wave Points
1st Wave
0 pt
Grant
0 USDC

0
StealthFlow
Hidden
StealthFlow
A privacy-first intelligent wallet for FHE-encrypted conditional crypto payments
DeFi
Privacy
Payments
Updates in this Wave
Identity Obfuscation via Stealth Addresses (ERC-5564) & Mainnet Deployment In the 3rd Wave, we aim to close the final privacy loophole: Public Identities. While FHE hides how much is being sent, the blockchain still reveals who sent it to whom.

We will integrate the Ethereum Stealth Address Standard (ERC-5564) into StealthFlow. Before creating an FHE payment, the frontend will execute a Diffie-Hellman cryptographic key exchange to generate a brand new, detached "Stealth Address" for the recipient that cannot be linked back to their main identity. Combined with our FHE-ERC20 integration from Wave 2, StealthFlow will provide uncompromised, end-to-end privacy for both the Asset Amount and the User Identities. Finally, we will prepare the optimized protocol for deployment on the Fhenix Mainnet.


Milestone
0points

Previous Wave Points
1st Wave
0 pt
Grant
0 USDC

0
fhenix-poll
Hidden
fhenix-poll
Your ballot is sealed. The roll shows you voted not how.
Confidential Governance
Anonymous Voting
Updates in this Wave
ZKPoll is a production-grade confidential voting protocol built using Fhenix CoFHE, deployed on Arbitrum Sepolia.

Contract: https://sepolia.arbiscan.io/address/0xd9836FA54D71c2745A26dABa48551E9745983676
Demo: https://fhenix-poll.vercel.app

What was delivered:

Core Smart Contract (FhenixPoll)
  - Manages full lifecycle: community → credential → vote → tally
  - Supports open, gated, and multi-gate communities
  - Community configs stored on IPFS and restored by verifier
  - Credential issuance via EIP-712 signed attestations
  - Includes voting weight (scaled), expiry, nonce + nullifier protection (anti-sybil + replay)

Fully Encrypted Voting (FHE)
  - Votes submitted as encrypted weights (no plaintext ever on-chain)
  - Ranked-choice scoring using 1/rank logic
  - Homomorphic aggregation using FHE (votes counted without decryption)
  - One vote per user enforced
  - Expired credentials rejected at vote time

Secure Tally Reveal
  - Anyone can trigger tally after poll ends
  - Uses Threshold Network for decryption
  - Results verified on-chain via cryptographic signatures
  - Prevents tampering or forged results

Verifier Backend (Node.js)
  - Handles credential issuance and requirement checks
  - Supports 11 requirement types:
      - Token balance, NFT ownership, on-chain activity
      - ENS/domain ownership
      - Twitter, Discord, GitHub, Telegram (OAuth based)
  - AND/OR logic for flexible gating
  - Temporary session storage (2-hour TTL) for secure verification

Automated Tally Runner
  - Runs every 60 seconds
  - Detects ended polls → requests decryption → publishes results
  - Can also be triggered manually via admin endpoint

React Frontend (Vite + Tailwind)
  - Community creation + IPFS config
  - Credential claim flow with OAuth + wallet
  - Encrypted voting (client-side using @cofhe/react)
  - Hierarchical ranked-choice voting (multi-level, up to 8 options)
  - Real-time voting power visualization
  - Trustless result display directly from contract

Developer Mode
  - Fast testing with short poll durations (1–10 blocks)
  - Full E2E testing in under a minute

Testing (24 tests passing)
  - Covers credential validation, replay protection
  - Voting logic and double-vote prevention
  - Tally reveal conditions and signature verification
  - Full end-to-end flow

Privacy Model:
“Who voted” is public
“How they voted” is fully private
Votes remain encrypted until final tally
Results are verifiable and tamper-proof

ZKPoll delivers a complete, real-world implementation of private, verifiable, and scalable on-chain voting using fully homomorphic encryption.


Milestone
0points

Grant
0 USDC

0
Vidix
Hidden
Vidix
Encrypted on-chain privacy passport protocol built on Fhenix.
Decentralized Credit
Encryption and Lending
Privacy onchain
Updates in this Wave

In the last wave a live deployment with previous shadowcredit features were deployed and working correctly. In this wave we aimed to pivot the platform to a more sustainable privacy oriented dapp with new adaptable features.
1. The UI/UX was revamped completely.
2. The platform was given a new name "Vidix"
3. The Lender page was modified.
4. A new unique passport feature had been added
5. A new Creditscorer.sol contract was integrated in order to improve passport holder credibility.
6. The Vercel deployment URL was updated and the new fronted UI pushes are in progress, the new changes in the user interface will reflect in the next wave. Screenshots of the current interface are available via the product page.
7. We migrated from the depreciated cofhe.js to the cofhe sdk.


Milestone
0points

Previous Wave Points
1st Wave
0 pt
Grant
0 USDC

1
CipherMarket
Hidden
CipherMarket
CipherMarket is a privacy-native prediction market protocol built on Fhenix's FHE coprocessor.
prediction market
Updates in this Wave
Live Site: https://cipher-market-fhe.vercel.app/

Wave 2 delivers a complete architectural upgrade, transitioning CipherMarket from a basic stake-based system to a fully functional prediction market with continuous pricing, enforceable market states, oracle accountability, and real privacy guarantees.

Core Protocol Upgrade

The contract model was redesigned from static bet accumulation to a Fixed-Product Market Maker (FPMM). Markets now operate with per-outcome reserves and continuous pricing driven by the invariant 𝑘 = Π𝑏𝑗
	​
Users can both enter and exit positions before resolution, with deterministic pricing via quoteBuy and quoteSell.

Sell-side execution is handled through a bounded binary search to safely invert the FPMM equation for multi-outcome markets, ensuring correctness and convergence.

Market Lifecycle

Markets now follow a structured five-state lifecycle:

ACTIVE → trading open
EXPIRED → trading closed, awaiting oracle
PROPOSED → outcome submitted
DISPUTED → challenge raised
FINALIZED → outcome locked, redemption enabled

State transitions are strictly enforced, ensuring predictable and secure market progression.

Oracle Security & Accountability

Oracle behavior is now enforced at the protocol level:

Oracles are locked on proposal and cannot deregister until resolution
Locks are released only after finalizeMarket or resolveDispute
Slashing is guaranteed not to block resolution
Registry configuration is immutable after initialization

This removes prior exploits and ensures oracle responsibility throughout the lifecycle.

Dispute Mechanism

Disputes now have real economic consequences:

Successful disputes → stake refunded to challengers
Failed disputes → stake forfeited to protocol fees

This eliminates zero-cost griefing and aligns incentives toward honest challenges.

Privacy Model (FHE Integration)

Wave 2 introduces contract-enforced encrypted positions using FHE:

User balances are stored as encrypted values (euint128)
All updates are computed and written by the contract
Decryption is user-controlled via permissioned access

Sell and redeem flows use a two-step async decryption process to maintain privacy while ensuring correctness.

Pool reserves remain public to preserve synchronous pricing and usability.

Market Metadata & Collateral
Markets now include description and oracle source for transparency
Both ETH and Sepolia USDC are supported as market collateral

Frontend Improvements

The UI now reflects the full market lifecycle and privacy model:

State-aware market views (trading, oracle, dispute, finalized)
Decryption-gated sell flows
Private portfolio with user-controlled reveal
Robust handling of encrypted data and async interactions

Demo Video: https://www.loom.com/share/97ec62e04c8542d7a72857bfdc0af38a


Milestone
0points

Previous Wave Points
1st Wave
0 pt
Grant
0 USDC

0
Umbra Finance (StealthPay)
Hidden
Umbra Finance (StealthPay)
Encrypt your edge: Confidential multi-asset rebalancing for Uniswap v4.
Privacy
Payment
Updates in this Wave
We changed our project since we have a lot of related projects and we have a competitive market, which is looking good after we conducted market research on our project.

We StealthPay is an FHE-powered confidential payment protocol that brings "Venmo-like" simplicity to private on-chain commerce.

Key Features:
Stealth Identities: Register a human-readable name (e.g., @amity) on-chain to receive private payments without sharing your public address.
One-Click Payment Links: Generate secure on-chain invoice links for instant escrow-secured payments.
Total Balance Privacy: Uses Fhenix FHE (euint64) to encrypt all vault balances and transaction amounts natively on-chain.
Conditional Escrow: A 3-stage settlement flow (Pay -> Confirm -> Release) ensuring work is verified before funds are settled.
Identity Shielding: Multi-chain identity-secured settlement powered by Privara (ReineiraOS).
Trustless Decryption: Integrated CoFHE SDK for secure client-side unsealing of private balances using EIP-712 permits.


Milestone
0points

Previous Wave Points
1st Wave
0 pt
Grant
0 USDC

2
Blindference
Hidden
Blindference
Your data stays private. Your results come with a guarantee.
AI Infrastructure
Verifiable Inference
SLA
Updates in this Wave
# Blindference — Wave 2

**Live Demo:** https://blindference.vercel.app/ · **Repo:** https://github.com/baync180705/blindference/tree/wave2

## The Gap No One Has Filled

Every AI inference API is a black box. No proof the model ran, no proof a quorum agreed, no recourse if it was wrong. Chainlink solved this for price feeds. **Blindference solves it for AI model output.**

Wave 2 is the first infrastructure where an inference result comes with a quorum certificate, an on-chain commitment, conditional settlement, and purchasable insurance — while keeping inputs completely private.

## What We Built

**Confidential quorum execution.** Features are encrypted in the browser via CoFHE. One sharing permit is created per node. The Leader and two Verifiers each decrypt locally using their own wallet-scoped permit — the coordinator never sees plaintext. Each runs the model independently and hashes the result. 2/3 must agree before anything commits.

**On-chain trust anchor.** The accepted result hash is committed to `ExecutionCommitmentRegistry` on Arbitrum Sepolia via Reineira's two-phase commit/reveal. Tamper-proof and permanent. Payment releases only after on-chain verification.

**Insurance for AI predictions.** `BlindferenceAttestor` stores `InferenceOutput` on-chain (risk score, confidence, model key). `BlindferenceUnderwriter` lets requesters buy coverage. If the prediction is wrong, `claimLoss()` pays out against an oracle — not a human.

**Compounding reputation.** Every quorum outcome updates `ReputationRegistry`. Bad nodes lose quorum slots. Good operators compound earnings.

## Why This Architecture

On-chain FHE compute can't run real models at production latency — Wave 1 hit that ceiling. Wave 2 moves compute off-chain and makes the **output** the on-chain trust primitive. CoFHE handles selective decryption via sharing permits. Reineira replaces our flat escrow with a two-phase settlement primitive. Private and economically accountable — neither is new alone. Together they are.

## What We Shipped

- **ICL**: quorum preview, dispatch, auto-finalization, two-phase commit/reveal to Arbitrum Sepolia
- **Node daemon**: CoFHE local decrypt → Groq/Gemini → result hash → ICL callback
- **5 core contracts** on Arbitrum Sepolia: `NodeAttestationRegistry`, `ExecutionCommitmentRegistry`, `AgentConfigRegistry`, `ReputationRegistry`, `RewardAccumulator`
- **Demo vertical**: `BlindferenceAttestor`, `BlindferenceUnderwriter`, `BlindferenceAgent`, Foundry integration test
- **Frontend**: live quorum progress, per-node verdicts, on-chain tx links, coverage + dispute UI
- **MCP server**: node metrics as AI agent tools

## What's Left

One external dependency: Reineira's `IEscrowReleaser` address and oracle feed were not finalized before our deadline. Everything else is built, deployed, and tested. The demo shows the full lifecycle end to end with a mock escrow release on the commitment tx. Two address swaps from full production.


Milestone
0points

Previous Wave Points
1st Wave
10 pt
Grant
0 USDC

8
Ghost swap
Hidden
Ghost swap
Your reservation price. Encrypted. Always.
Market Infrasatructre
Updates in this Wave
Wave 1 pitched GhostSwap as a privacy-focused swap interface. Feedback was clear: submission looked generic next to other private swap projects. Privacy alone is a weak narrative — retail users don't pay for it and whales don't trust hackathon projects.
 
Wave 2 reframes around **vault + hook tight coupling**. The vault holds TVL and manages share accounting. The hook encrypts execution via CoFHE. Fork either alone and the system produces no yield. A hook is forkable in an afternoon; a vault protocol coupled to an FHE execution engine is not.
 
This shifts the narrative from "privacy tool" to "market-neutral yield from recaptured MEV."


Milestone
0points

Previous Wave Points
1st Wave
0 pt
Grant
0 USDC

0
ShieldFi
Hidden
ShieldFi
DeFi insurance that computes premiums and validates claims on fully encrypted data.
Confidential DeFi
RWA & Compliance
Updates in this Wave
ShieldFi is a confidential insurance protocol built on Fhenix CoFHE. It solves a fundamental problem: insurance requires sensitive personal data to price risk, but blockchains make everything permanently public. ShieldFi breaks that contradiction — the smart contract computes premiums and validates claims entirely on encrypted inputs, never seeing plaintext age, risk score, coverage amount, or claim details.

This matters because DeFi insurance today is either overcollateralised (because lenders cannot assess risk privately) or it requires trusting a centralised intermediary with your data. FHE is the only technology that enables arithmetic on two unknown encrypted values simultaneously — ZK proofs can verify a statement, but cannot compute riskScore × coverage ÷ 100 when both values are unknown. ShieldFi is only possible on Fhenix.

WHAT WE BUILT THIS WAVE

Smart Contract — ConfidentialInsurance.sol, deployed on Arbitrum Sepolia. The contract implements 11 FHE operations across the full insurance lifecycle:

Premium computation: FHE.mul(riskScore, coverage) → FHE.div(product, 100) → FHE.add(BASE, riskComponent). The protocol computes a personalised premium without knowing any of the inputs.

Claim validation: FHE.lte(claimAmount, coverage) checks the claim does not exceed cover. FHE.gte(severity, 30) checks the incident meets minimum threshold. FHE.and combines both gates. All on ciphertexts.

Tiered payout selection: FHE.select(severity ≥ 70, fullPayout, halfPayout) picks the payout tier based on incident severity — without decrypting either value.

Premium reveal: full 3-step CoFHE decrypt flow using FHE.publishDecryptResult and FHE.getDecryptResultSafe. Only the policy holder can trigger and read their own premium.

Hardhat tasks for deploy, policy registration, and claim filing. 14-test suite verifying FHE computation correctness using the CoFHE mock environment — including premium formula, validity gates, payout tier selection, and the full async decrypt flow.

Frontend — Next.js 15 dApp with glassmorphism UI. Key screens: landing page with live pool stats, a 3-step policy wizard, dashboard showing encrypted policy and claim state, and a claim filing page with a live FHE validation preview that shows users exactly which operations will run on their encrypted inputs before they submit.

AI Risk Advisor — Claude (claude-sonnet-4-6) powers an off-chain risk assessment chat. Users describe their situation in plain English. Claude returns a risk score and recommended coverage. The numbers are encrypted via @cofhe/sdk before the wallet prompt — the AI never sees on-chain identity, and no plaintext risk data ever reaches the blockchain.

Privacy model: age, risk score, coverage, premium, claim amount, claim severity, and payout amount are all encrypted. Only aggregate pool statistics (total balance, total policies, total payouts) are public — enough for users to assess protocol solvency, nothing that identifies individuals.



Milestone
0points

Grant
0 USDC

0
BlindDrop
BlindDrop
Preventing Bot Monopolies with FHE-Powered "Invisible" Inventory & Fuzzy Pricing
Market Infrastructure
Deliverable
Updates in this Wave
Recent Updates
Backend & Smart Contracts
• Fhenix Integration: Set up the core contract on Fhenix Helium testnet using FHE (Fully Homomorphic Encryption) to handle encrypted inventory and pricing.
• Privacy Logic: Implemented the logic to keep stock levels and price data encrypted on-chain to prevent bot front-running.
• Architecture: Migrated to a monorepo structure under the packages/ directory for better management of the contract and frontend code.
Frontend & UX
• Encrypted Data Handling: Integrated fhenixjs to allow users to securely interact with encrypted states via EIP-712 signatures.
• Beta Deployment: Deployed the latest frontend to Vercel for live testing and FHE-based UI validation.
• Inventory Sync: Connected the frontend to the BlindDrop contract to reflect real-time (but private) stock status.


Milestone
0points

Previous Wave Points
1st Wave
0 pt
Grant
0 USDC

1
Prova
Prova
on-chain trade credit insurance for SMEs
Privacy
GitHub
Updates in this Wave
https://getprova.trade/

PROVA contracts deployed on Arbitrum Sepolia (Chain ID: 421614):
Deployer address : https://sepolia.arbiscan.io/address/0xa4280dd3f9e1f6bf1778837ac12447615e1d0317
  1. ProvaPaymentResolver — 0x377C482B164567d7bC11f0D63BD69E4AD950fb91                                                                                                                                   
  Time-based condition resolver. Triggers a claim when a buyer has not paid past the invoice due date plus waiting period.
                                                                                                                                                                                                         
  2. ProvaUnderwriterPolicy — 0x8CdF4c1815d8E5fE28Ad6592387B41339283f0f0                                                                                                                                 
  Core risk engine. Prices insurance premiums using an encrypted FHE credit score curve and adjudicates claims — all sensitive data stays encrypted on-chain via Fhenix CoFHE.
                                                                                                                                                                                                         
  3. DebtorExposureRegistry — 0xF2AB3Cfc132dc1873019c526673f85ad700FDca6
  Tracks cumulative encrypted exposure per buyer to prevent PROVA from over-insuring a single debtor across multiple policies.

  4. ProvaLossHistory — 0x3fA333E705B1dB0AA71C5c24471F8212D54121aD
  Encrypted append-only log of all judged claims, used for actuarial recalibration of the premium curve over time.


Milestone
0points

Previous Wave Points
1st Wave
10 pt
Grant
0 USDC

2
ShadowPay
ShadowPay
The Gold Standard for Confidential Payroll.
Market
Deliverable
Updates in this Wave
Goal: Prove the "impossible" — math on hidden salaries.

Encrypted Logic: Write the Solidity contract using Fhenix euint64. Implement the processPayroll(euint64 grossSalary) function.

The Split: The contract must take that encrypted input and calculate a 20% tax split inside the encrypted state.

Dual Payouts: Send the tax portion to a public "Gov Address" (transparent) and the net pay to the "Employee Vault" (encrypted).

Deliverable: A CLI or basic frontend that proves the blockchain saw a transaction, but only the Employer knows the raw salary.


Milestone
0points

Grant
0 USDC

0
Shade
Shade
MEV resistant Intent based agentic swaps
Wallet
Swap
Agentic
Deliverable
Updates in this Wave
# 🌑 Shade - Wave Deliverable

## Overview

**Shade** is a privacy-first DeFi trading platform that eliminates MEV by enabling encrypted trading intents. Instead of sending visible transactions to the mempool, users submit encrypted conditions (e.g., "buy ETH below $1900") that are evaluated on-chain using Fully Homomorphic Encryption without ever revealing the user's strategy, timing, or thresholds.

---

## What Was Built

### Smart Contract (`contracts/ShadeIntent.sol`)
A Solidity smart contract on Fhenix that:
- Stores encrypted user intents (threshold price, amount, buy/sell flag)
- Evaluates conditions privately using FHE
- Executes trades only when conditions are met
- Deployed to: **0x9a4005548B4cd1Dd56da6370469BccB98b9D4DDE** (Sepolia testnet)

### Tests and Deployment
- **Smart contract tests** (`test/ShadeIntent.test.ts`) verify intent creation and condition evaluation
- **Deployment script** (`scripts/deploy.ts`) configures contract deployment to testnet/mainnet
- **Setup files**: TypeScript, Next.js, ESLint, and Tailwind CSS configurations

## Key Features

**Privacy**: All trading conditions encrypted on-chain. Only settlement is public.

**MEV Resistance**: Users submit encrypted intents instead of visible transactions. No front-running or sandwich attacks possible.

**Gas Efficient**: Executor bots evaluate conditions privately off-chain for free. Only successful trades are submitted on-chain.

**FHE-Powered**: Uses Fully Homomorphic Encryption to evaluate conditions without decryption, powered by Fhenix protocol.

## Getting Started

**Run Frontend**
```bash
cd shade-frontend
npm install
npm run dev  # Opens http://localhost:3000
```

**Test Smart Contract**
```bash
npm install
npm test
```

**Deploy to Testnet**
```bash
npm run deploy
```

---

## 🔗 **Live Demonstration URL**

**Contract Address (Sepolia Testnet)**: 
- Address: `0x9a4005548B4cd1Dd56da6370469BccB98b9D4DDE`
- Etherscan: https://sepolia.etherscan.io/address/0x9a4005548B4cd1Dd56da6370469BccB98b9D4DDE

**Frontend (Local Development)**: 
- http://localhost:3000

## How It Works

1. **User creates intent**: Specify price threshold, amount, and BUY/SELL direction
2. **Local encryption**: CoFHE SDK encrypts all sensitive parameters before sending to blockchain
3. **On-chain storage**: Encrypted intent stored in ShadeIntent contract; nothing is publicly visible
4. **Executor monitoring**: Bot watches price feed and decrypts conditions privately (free, off-chain)
5. **Conditional execution**: If conditions pass, executor submits signed transaction to execute swap on Uniswap
6. **Settlement**: User receives filled amount. Strategy was never exposed to mempool.

## Live Access

**Smart Contract**: [0x9a4005548B4cd1Dd56da6370469BccB98b9D4DDE](https://sepolia.etherscan.io/address/0x9a4005548B4cd1Dd56da6370469BccB98b9D4DDE) on Sepolia


Milestone
0points

Previous Wave Points
1st Wave
0 pt
Grant
0 USDC

1
CipherDEX
Hidden
CipherDEX
Encrypted finance on FHE — launch, pay, trade, hire. Nobody sees your numbers.
Confidential DeFi
Privacy
Updates in this Wave
  CipherDEX — Full Protocol Launch

  Live: https://cipher-dex.vercel.app
  GitHub: https://github.com/Ritik200238/CipherDEX
  All 20 contracts verified on Etherscan.

  20 smart contracts. 22 FHE operations. 368 tests passing.

  5 AUCTION TYPES

  1. Sealed Bid — Encrypted bids, anti-snipe timer, seller's reserve encrypted forever (Blind Floor Auction)
  2. Vickrey — Winner pays 2nd-highest bid. Both tracked on ciphertext via nested FHE.select(). First FHE Vickrey ever built.
  3. Dutch — Price decays over time. Encrypted buy amounts. Natural bot resistance.
  4. Batch Clearing — Uniform clearing price on encrypted order volumes.
  5. Overflow — Fixed price, pro-rata allocation on ciphertext if oversubscribed.

  PRIVATE PAYMENTS

  Encrypted per-recipient splits. Amount passes as encrypted handle directly to vault — never decrypted on-chain. End-to-end encrypted. Reusable templates for recurring payroll.

  OTC DESK

  Encrypted min/max price bounds. Quoters blind to each other. Atomic settlement. Zero slippage.

  FREELANCE BIDDING

  Blind bidding (lowest wins via FHE.lt). Milestone escrow. 14-day auto-release. Encrypted dispute resolution — 3 voters submit encrypted votes, majority computed on ciphertext. Individual
   votes private forever.

  INFRASTRUCTURE

  - SettlementVault — shared encrypted ledger, all features settle through one vault
  - AuctionClaim (ERC721) — tradeable winner positions
  - TokenVesting — cliff + linear, encrypted amounts
  - AllowlistGate — Merkle whitelist for gated launches
  - Referrals — FHE-private, referrer identity never linked on-chain
  - Reputation — composable credit bureau API, returns encrypted YES/NO

  3 INNOVATIONS

  1. Blind Floor Auction — reserve price encrypted forever. New game theory only possible with FHE.
  2. Encrypted Disputes — private votes, majority on ciphertext. No social pressure.
  3. Cross-Feature Flow — one vault, four features, zero plaintext touchpoints.

  SECURITY

  FHE.select() over if/else. Zero-replacement pattern. ReentrancyGuard. AccessControl. Emergency timeouts. Events leak nothing.

  FRONTEND

  13 pages. Privacy Lens (chain view vs your view). Encryption animation. Reveal animation. Onboarding flow. Notification bell. Faucet on every page.

  Stack: Solidity 0.8.25 | Fhenix CoFHE | Hardhat | Next.js 16 | ethers.js v6 | cofhejs | OpenZeppelin | Ethereum Sepolia

  2,847 characters. Fits under 3,000.


Milestone
0points

Grant
0 USDC

0
MadeInBear
MadeInBear
A Privacy Neobank for Ethereum using Fhenix Fully Homomorphic Encryption
DeFi
Privacy
Lending
GitHub
Updates in this Wave
In this second wave, we completed the core features that turn MadeInBear into a true privacy neobank on Ethereum using Fhenix FHE and use ERC-7984 confidential tokens as the base assets, allowing users to deposit and earn interest completely privately, as well as borrow against collateral while keeping all positions encrypted on-chain.

Now live on Sepolia Testnet:  
https://madeinbear.netlify.app/

Demo Video (3 mins):  
https://youtu.be/6CXAub5oQ0o

A borrow transaction of 100 USDT that fully hiding the true amount on-chain:
https://sepolia.etherscan.io/tx/0x43ecdcbb382d637a319ba445a8e70c6e74090157d6ccb4eba050ba5dfb60dcf3

Users can currently:
- Wrap ERC-20 tokens (USDT, ETH) into ERC-7984 confidential tokens (cUSDT and cETH) 
- Deposit cUSDT to earn yield (currently ~1%+) in a USDT savings product, where yield comes from borrowers 
- If we want to borrow we need to lock cETH as collateral (since using Morpho Blue's isolated market model, so supplied assets do not automatically count as collateral) 
- Then we can borrow cUSDT against collateral up to 75% LTV 
- Withdraw, repay, and unwrap cUSDT or cETH back to normal ERC-20 tokens at any time

We redesigned the protocol from a traditional shared-pool model (Compound v2) into an isolated market architecture (Morpho Blue):
- Each market is independent, preventing systemic contagion across assets.
- Avoids shared risk issues seen in large-scale events affecting major protocols
- Enables new products such as RWA-backed markets and institution-specific pools

And together with Fhenix's privacy layer:
- User balances, positions, and transaction amounts are fully encrypted using FHE
- Market parameters, interest rate models, and protocol logic remain public and verifiable
- Selective disclosure enables compliance without exposing full financial data

Core Contracts & Files:
- CMorpho.sol — Main confidential money market contract (forked and rewritten from Morpho Blue for FHE)
- FHERC20.sol / CToken.sol — ERC-7984 confidential token implementation that wraps standard ERC-20 assets
- InterestRateModel.sol — Handles interest rate calculations
- PriceOracle.sol — Price oracle interface for collateral valuation 

Next, we plan to complete flash loans and liquidation, then focus on adding KYC credentials and more structured markets. Users can deposit assets into structured markets to earn yield from on-chain lending, credit demand, and other capital strategies  including RWA-backed yield strategies and institution-grade capital pools.


Milestone
0points

Grant
0 USDC

0
MuHaven
Hidden
MuHaven
Where AI manages your wealth on encrypted state — invisible to everyone, even itself.
RWA Portfolio Manager
Updates in this Wave
🚀 MuHaven went from Wave 1 vision to live confidential RWA pipeline on Arbitrum Sepolia. End-to-end, fully encrypted: passkey login spins up a smart account, gasless USDC deposit wraps into an encrypted fhERC-20 RWA token, issuers distribute yield into per-investor confidential escrows, and investors redeem — all on-chain, no party seeing plaintext balances. The AI-managed portfolio remains the long-term target; Wave 2 shipped the rails it will run on.

🔗 Eight contracts deployed and verified on Arbitrum Sepolia: fhERC-20 token, vault, investor registry, yield distributor, confidential escrow, yield gate, KYC adapter, and encrypted risk params. Roughly 180 Hardhat unit tests cover the FHE patterns — permit-based decryptForView, silent-fail via FHE.select, FHE.allow re-grants after every mutation — plus contract invariants. A 25-case SDK integration suite drives the full two-phase yield pipeline against an in-process Hardhat fixture.

🔐 Authentication runs on ZeroDev kernel smart accounts over ERC-4337: one WebAuthn passkey replaces the seed phrase, gas is sponsored, and @zerodev/permissions session keys collapse the stacked signature tax of passkey + FHE permit + kernel signature into two prompts on the first session action and zero for every action after. Sensitive operations still ask for a biometric — everything else is silent. No ETH required by users, ever.

🖥️ The Vue 3 + Vite + Tailwind v4 dashboard is wired to live contracts on both sides: investor (portfolio, deposit, yields, activity) and issuer (tokens, distribute, investors, compliance). Encrypted balances stay redacted until the user signs a permit and decryptForView returns the plaintext client-side. A 45-case Playwright browser suite (35 passing, 10 skipped, 0 failing) exercises the golden paths on both roles, backed by a data-testid contract that keeps the flows stable across UI refactors.

🏗️ The backend runs as a Docker stack behind a Cloudflare tunnel: a Node 20 + tsx API on Clean Architecture with Drizzle + PostgreSQL for persistence, a dedicated FHE worker owning the heavy WASM encryption, and a NAV worker pulling live treasury yields from FRED and on-chain oracles into Postgres on a schedule, with a source-audit trail and static fallbacks. An in-house @muhaven/sdk — pluggable sender (EOA for scripts and tests, kernel for the frontend) with progress callbacks on every write — is the single source of truth driving scripts, tests, dashboard, and workers against the same encrypted flow.


Milestone
0points

Previous Wave Points
1st Wave
0 pt
Grant
0 USDC

1
adNode
Hidden
adNode
Your bids. Your data. Nobody else's business.
DeFi
ad
Updates in this Wave
Making the core loop actually work end to end: - Full CoFHE hook integration — every input encrypted before leaving the browser - Decrypt-on-demand analytics — owner clicks decrypt, wallet signs permit, real stats appear - Developer slot registration fully on-chain - Campaign to slot assignment working live - Impression and click recording on-chain - Encrypted earnings tracking per developer
Chatbot is working 


Milestone
0points

Previous Wave Points
1st Wave
0 pt
Grant
0 USDC

1
FEHENIX_rfq
Hidden
FEHENIX_rfq
SEALrfq (Sealed Encrypted Auction Ledger for Request for Quotation
B2B SAAS
Updates in this Wave
Contracts
SealRFQ.sol — Invalid bids no longer poison encrypted rankings (replaced with _encryptedMaxBidAmount via FHE.select) or count toward bidCount/minBidCount. Buyer finalization redesigned: new lowestEncryptedBidder mapping tracks winner on-chain via eaddress, removing dependency on vendor-shared proofs. selectWinner() now takes (rfqId, winnerAddress, signature). Escrow mutations (releasePartialPayment, reclaimCreatorEscrow, winnerClaimEscrow) are now deferred via PendingSettlementTransfer until cofheCallback confirms success. Callback hardened with pendingCallbackBidders + FHE.and(stakeMatches, bidRangeChecks).

SealVickrey.sol — Same invalid-bid isolation and callback hardening. Bid struct stored before transfer call; pendingCallbackBidders cleaned up after.

Tests — 3 new tests: invalid bids can't replace lowest (RFQ + Vickrey), escrow state doesn't mutate until transfer verification. All winner selection uses on-chain encrypted bidder tracking.

🖥 Frontend
CoFHE SDK — Full migration @cofhe/sdk@0.2.x → 0.4.0. All Cofhesdk* exports renamed (CofheClient, CofheErrorCode, createCofheClient). Permit APIs now pass (chainId, account). Decrypt flows updated for new API.

Auth/Security — WalletContext no longer reads/writes localStorage for role or tokens — React state only. authFetch is cookie-first (credentials: 'same-origin'), legacy localStorage.accessToken actively purged. Role switching moved to production /api/auth/switch-role; dev route gated behind NODE_ENV=development && ALLOW_DEV_AUTH_ROUTES=true. New safeSessionStorage.ts replaces persistent plaintext bid storage.

Build — Removed ignoreBuildErrors: true from Next config. Removed hacky @cofhe/sdk path aliases; moduleResolution changed to bundler. Exact package version pinning.

UI — select-winner page aligned with new contract interface. Vendor bid/reveal and buyer pages updated for CoFHE 0.4.0 + cookie auth.

⚙️ Backend
Auth routes no longer return accessToken in responses (cookie-only). Refresh token from cookie only. New production handleSwitchRole route. RFQ SelectWinnerSchema changed to { winnerAddress, signature }. Snapshot includes lowestEncryptedBidderCtHash. ABI updated. FHE_TYPES enum realigned to SDK 0.4.0 (UINT64=5). Provider type accepts FallbackProvider.


Milestone
0points

Previous Wave Points
1st Wave
0 pt
Grant
0 USDC

0
EventNest
Hidden
EventNest
Private events, public blockchain. Ticket ownership, redefined.
event
onchain
Decentralized
Updates in this Wave
This wave focused on moving EventNest from a prototype to a fully functional, production-deployed dApp connected to a real smart contract on Ethereum Sepolia.
Key deliverables:

Deployed the EventNestTicket smart contract on Ethereum Sepolia

Contract: 0xa316d86226ce145a0ae2ae349c8c4bb587cae87c
Deploy tx: 0x398b9e8c6c70951c83cfd8e404e5ff692ff8ae57c5f6327e62ade84351247cc0


Connected the entire frontend to the live deployed contract (no mock data)
Replaced all dummy dashboard metrics with real wallet-owned on-chain event data
Built organizer event management: invite code setup and wallet whitelisting on-chain
Added honest empty states when no on-chain events exist for a connected wallet
Stabilized production builds with Next.js 15 + React 19 and deployed to Vercel
Updated dashboard settings so organizer defaults persist into the event creation flow

Live URLs:

https://event-nest-rho.vercel.app


Milestone
0points

Grant
0 USDC

0
Blind Vaults
Blind Vaults
The first liquidity pool where your trade stays yours until it's done.
DeFi
Market Infrastructure
Privacy
Deliverable
Updates in this Wave
Updates in this Wave (Wave 2)

We're joining the buildathon in Wave 2 and currently in ideation phase.

Dev post: https://dev.to/izi_/blind-vaults-gfc

What we've completed so far:

· Project concept and problem validation — MEV extraction costs retail traders over $500M annually, with 75% of losses hitting trades under $20K
· Full product architecture designed — encrypted swap flow, modular smart contracts (Router, Pool, LP, PermitManager)
· Technical documentation and PRD completed (23 pages covering product goals, user flows, success metrics, and risk mitigation)
· Team formed with clear roles — smart contract, frontend, product
· Roadmap aligned to buildathon waves from Wave 2 through Wave 5

What we're working on now:

· Setting up Hardhat development environment with Fhenix plugin
· Learning FHE encrypted types (euint256) and math operations
· Implementing the basic encrypted swap function
· Writing test scripts for CLI-based validation

What's next after ideation:

· Deploy first working private swap to Fhenix testnet
· Test encrypted trade flow end-to-end
· Prepare for Wave 3 where we add LP features and basic UI


Milestone
0points

Grant
0 USDC

1
Shadowlancer
Shadowlancer
Private Freelance Marketplace ( Where talent competes in the dark. )
freelance marketplaces
Deliverable
Updates in this Wave
## The Core Problem We Solved

> How do you pick the lowest bid from a set of numbers — without knowing what any of the numbers are?

This is impossible in traditional computing. With FHE, it is not.

```
Traditional auction:     Shadowlancer:
  Bid A = 400  ← visible    Bid A = Enc(400)  ← hidden
  Bid B = 450  ← visible    Bid B = Enc(450)  ← hidden
  Bid C = 600  ← visible    Bid C = Enc(600)  ← hidden
  Max  = 500   ← visible    Max  = Enc(500)   ← hidden

  Anyone can see who        System finds winner
  bid what and why          without seeing anything
  someone won.              Winner: 0xBidderA
```

---

## What Was Built (Wave 1+2)

### Smart Contract: `PrivateBidMarket.sol`

A fully on-chain sealed-bid auction contract using Fhenix CoFHE.

**Features:**
- Client posts a job with an **encrypted max budget** — the ceiling is private
- Freelancers submit **encrypted bids** — amounts are never exposed
- Contract uses FHE operations to find the **lowest bid within budget** — zero decryption during selection
- Only the **winner's address** is revealed — not any bid amount
- If all bids exceed the budget, a `NoBidsWithinBudget` event fires — without revealing by how much

### Frontend: Next.js Web App

- Job creation form with encrypted budget input
- Uses `cofhejs` SDK to encrypt values client-side before sending on-chain
- Wallet connect with wagmi + viem
- Reads contract state and displays job status
---


### What Is Leaked vs What Stays Private

| Information | Leaked? |
|---|---|
| Bid amounts (e.g. 400, 450, 600) | Never |
| Max budget (e.g. 500) | Never |
| Whether a bid exceeded the budget | Never |
| Number of bids | Yes (count only) |
| Winner's address | Yes (by design — this is the output) |
| Winner's bid amount | Never |
| Losing bid amounts | Never, forever |
### State Machine

```
createJob()
    │
 [ Open ]  ←── submitBid() × N
    │
 closeBidding()  ←── FHE: find encrypted min, create ebool handles
    │
 [ Evaluating ]  ←── Fhenix nodes decrypt isWinner[] off-chain
    │
 publishWinner()
    │
 ┌──┴──────────┐
[ Settled ]  [ NoBids ]
    │
 getWinner() → 0xWinnerAddress
```


Milestone
0points

Previous Wave Points
1st Wave
0 pt
Grant
0 USDC

1
HireShield
Hidden
HireShield
Privacy-first on-chain hiring.
Market Infrastructure
Privacy
DeFi
Updates in this Wave
🛡️ HireShield — 2nd WAVE Submission 🛡️

Privacy-first on-chain hiring protocol on Ethereum Sepolia with Fhenix CoFHE. Employers post encrypted budgets, candidates apply with encrypted credentials, the contract matches on ciphertext across 4 dimensions — no raw value ever revealed.

🌐 LIVE: https://hire-shield.vercel.app/
🌐 Network: Ethereum Sepolia (ChainID 11155111)

━━━━━━━━━━━━━━━━━━━━━━

🔗 CONTRACTS (Sepolia)

HireShield:       0x4B91743bE751A9f9871eb2cD22472C5a6aa6f26F
HireShieldEscrow: 0xe88235ac739dD5154cd69E56b7232eC1987Cd82D
HireShieldNFT:    0x580Ba8983A81c9545AA29524F6D4bA18351f3D90

🔐 CORE PROTOCOL

→ 4D FHE Matching — salary, experience, skills, location all encrypted (euint128 / euint32); FHE.lte / gte / eq / and run on ciphertext, never decrypted
→ ZK Proofs — every encrypted input carries a CoFHE ZK proof verified on-chain
→ Threshold Decrypt — match result revealed by 5-node network; no single party decrypts alone
→ Non-Custodial Escrow — ETH locked per job, released to matched candidate only; O(1) reclaim via hasMatch flag
→ No Backend — all reads via getLogs + multicall; fully decentralized
→ Batch Encryption — all 4 values encrypted in one encryptInputsAsync call (~4× faster)

━━━━━━━━━━━━━━━━━━━━━━

⚡ 10 FEATURES SHIPPED

4D FHE Job Posting & Matching — full ciphertext comparison across all 4 dimensions
My Applications — live on-chain reads, no indexer
On-Chain Escrow — fund at post time or later; release or reclaim enforced by contract
Soulbound NFT Credentials — non-transferable ERC-721 minted on successful match
Encrypted Salary Negotiation — up to 3 counter-offer rounds, fully on-chain
Referral System — applyWithReferral() + revealReferral() event for bonus tracking
Employer Analytics — funnel metrics and salary range insights from on-chain events
Activity Feed — live event log with Etherscan links for both roles
Full Frontend — 4-tab Employer + 4-tab Candidate dashboards, glassmorphism UI
In-App Docs — /docs page with 10 sections, no external docs needed
━━━━━━━━━━━━━━━━━━━━━━

🏗️ STACK
React 18 · TypeScript · Vite 5 · Tailwind · Framer Motion · Wagmi v2 · RainbowKit v2 · CoFHE SDK v0.4.0 · Solidity 0.8.27 · Hardhat · OpenZeppelin v5 · Zustand · TanStack Query v5

━━━━━━━━━━━━━━━━━━━━━━

🔭 NEXT WAVES
→ Candidate Salary Reveal · Multi-Employer Bidding · Employer Shortlist View · ZK Credential Import · Match Notifications


Milestone
0points

Previous Wave Points
1st Wave
0 pt
Grant
0 USDC

0
Aptax
Hidden
Aptax
The verification layer for private data.
Infrastructure
Confidential Verification
Due Diligence
Updates in this Wave
Pain point: founders are often forced to expose sensitive business data too early in diligence, before trust is strong enough to justify full disclosure. Today the default is still over-sharing through spreadsheets, screenshots, and broad data room access. That creates real trade-secret risk, slows diligence, and gives founders no good middle ground between blind trust and full exposure.

Aptax is building that middle ground.

Aptax is a confidential verification layer for products and workflows, and Dilix is our first flagship app built on top of it for private due diligence. Instead of sending raw numbers back and forth, founders can upload encrypted company data and let investors verify bounded claims. In our current flow, a founder onboards, sets up a company profile, uploads MRR, and uses CoFHE decrypt-for-view to privately view the uploaded metric while keeping the system oriented around confidential verification.

Links:
Live demo video: https://youtu.be/s8ChWyAYihA
Deployed app: https://aptax.vercel.app/
Vision: https://github.com/M4N4N22/Aptax/blob/main/vision.md
Project README: https://github.com/M4N4N22/Aptax/blob/main/README.md
Contracts README: https://github.com/M4N4N22/Aptax/blob/main/fhenix-contracts/README.md

Why this matters: due diligence is a wide-open workflow problem, not a single feature gap. The same verification model can expand beyond MRR into runway, cash balance, gross margin, customer concentration, treasury policy checks, confidential compliance, eligibility gating, internal workflow automation, and agent-native trust checks. Our belief is simple: software still verifies by overexposing, and Aptax can help change that.

Why us / why now:

* Fhenix makes encrypted compute usable in product flows
* Aptax turns that capability into a verification stack
* Dilix proves the model in a real founder-investor workflow

GTM:
We are starting with founder-investor due diligence because the pain is obvious, urgent, and high-trust. Early users are founders who want to move deals forward without handing over raw financial context too early, and investors who want faster, cleaner conviction signals. The wedge is a product founders can use directly, while the longer-term platform opportunity is the verification infrastructure underneath.

What inspired this:
A big part of the idea clicked while reading about diligence and disclosure risk, especially Bill Graves’ writing on trade-secret protection during venture diligence. That reinforced the problem for us: the market already accepts diligence friction as normal, but the workflow is still broken.

Current deployed network — Base Sepolia
Registry: 0xE79D3fa05aE722a69bbd5c47558C7b4F423Cf23d
Metric Store: 0x1849367bA40715d98C4bC107e4c9AAC8392661E9
Verifier: 0xA6741DdCd52320921e6513D6310ac0FB5967Ba73


Milestone
0points

Grant
0 USDC

0
CipherMind AI
Hidden
CipherMind AI
“Intelligence without exposure.”
AI agent
Market Infrastructure,
Privacy
Updates in this Wave
We have successfully attained all declared goals for the Prototype Phase. Our primary focus was proving the core viability of FHE-encrypted data flows within a user-friendly Web3 interface.

Key Updates:

Designed and deployed a polished React (Vite) frontend with a sleek, institutional-grade UI.
Fully integrated the CoFHE SDK horizontally across the client side to ensure all user inputs are encrypted locally in the browser before transmission.
Deployed our foundational smart contracts to the Fhenix testnet to securely store and structure encrypted inputs.
Engineered the application state handling to seamlessly transition the UI through the complex "Encrypting...", "Computing...", and "Decrypting..." phases without causing user friction.
Validated the entire flow: Data is encrypted locally, processed entirely within a zero-knowledge environment, and safely unsealed at the end.
Deliverables: 
🎥 Demo Video: https://youtu.be/LOqyKh1pyRA 
🌐 Live DApp: https://69e620403805a23ca7dba799--cipheraiagent.netlify.app/
> Git hub : https://github.com/SuryaXyz-art/CipherMind-AI



Milestone
0points

Previous Wave Points
1st Wave
0 pt
Grant
0 USDC

1
SecurePay
Hidden
SecurePay
A confidential payroll system built on Arbitrum Sepolia using Fhenix CoFHE.
Market Infrastructure
Payment
Tool
Updates in this Wave
This development wave focused on finalizing the core FHE-encrypted payroll infrastructure, resolving complex build-time dependencies, and stabilizing the platform for production. Key updates include:

FHE-EVM Stack Integration: Successfully implemented a dual-version ethers strategy. By aliasing ethers v5 for cofhejs compatibility and standardizing the rest of the application on ethers v6, we resolved critical conflicts between FHE operations and the wagmi/RainbowKit ecosystem.

Vite Build Optimization: Stabilized the build pipeline to handle WebAssembly and CJS-to-ESM synthesis. The vite.config.ts was tuned to correctly bundle wagmi dependencies while excluding cofhejs from esbuild to ensure proper native WASM loading.

Production Deployment & Infrastructure: Migrated the backend from an ephemeral SQLite filesystem to a persistent MongoDB Atlas instance, necessitating a complete refactor of database queries and ID management.

Resolved production-level CORS and header issues (COOP/COEP) to support secure FHE operations.

Implemented a multi-provider RPC strategy (Alchemy for reads, public nodes for event queries, MetaMask for signing) to circumvent rate limits on free-tier infrastructure.

Role-Based Application Architecture: Finalized the unified React dashboard that uses conditional rendering to provide distinct interfaces for employers (payroll management/registry) and employees (invoice submission/payment status) within a single codebase.

Secure Payroll Functionality: Deployed core smart contracts (Vault.sol, ConfidentialPayroll.sol) on Arbitrum Sepolia, enabling encrypted salary transfers using euint64 values that remain opaque on-chain.

Deliverables:

Live Application: https://securepay-v2-mu.vercel.app/

Source Code (GitHub): https://github.com/bammyoly/Securepay-v2


Milestone
0points

Grant
0 USDC

0
FhenixMarkets
Hidden
FhenixMarkets
Confidential FHE-based prediction market on Fhenix L2. Private bets, no front-running, fair Web3
prediction market
Updates in this Wave
.


Milestone
0points

Previous Wave Points
1st Wave
0 pt
Grant
0 USDC

0
FhenixDropBox 
FhenixDropBox
Fhenix-powered file monetization platform with blockchain-enforced access rules
file sharing
GitHub
Updates in this Wave
This wave focused on transforming FhenixDropBox from a core privacy prototype into a fully functional, production-ready file sharing platform with real on-chain verification and a polished sharing experience.Key deliverables shipped in Wave 2:
Built and deployed the file management page (/files) — users can view, manage, and track all their uploaded files with live on-chain data
Built the share page (/share/[id]) with full on-chain access verification powered by Fhenix CoFHE — access conditions are validated on encrypted data without ever exposing them
Integrated QR code generation for every shared file — making sharing seamless across devices
Implemented hashed secure share links — share URLs are non-guessable and tied to on-chain state
Added encrypted download tracking directly on the blockchain — download counts are hidden from public view using FHE
Implemented AES-256 client-side file encryption before IPFS upload — files are never uploaded in plaintext
Refactored CoFHE instance initialization for stability across different wallet connection states
Deployed and stabilized the smart contract on Ethereum Sepolia

Contract: 0x820D442CC6BB930307183926C7805212668C7Cff


Full privacy protection maintained end-to-end — prices, passwords, limits, and expiry all remain encrypted on-chain
Live URL: https://fhenixdropbox.vercel.app


Milestone
0points

Grant
0 USDC

1
Shielded x402
Shielded x402
FHE-encrypted HTTP payments. Block explorers see ciphertext, never the amount.
Privacy
Infrastructure
DeFi
GitHub
Updates in this Wave
Built Shielded x402 — FHE-native confidential HTTP micropayments on Fhenix CoFHE.                                                                                                                     
                                                                                                                                                                                                        
  Core deliverables:                                                                                                                                                                                    
  - 3 deployed contracts on Base Sepolia: ConfidentialPaymentRouter (0xcD0F454029dF26D59891430bc70E1FB5fbc22847), ConfidentialAccountLedger (0xB65f662BDB32175734C832A9fEa7Aa0d53aF48f4),               
  MerchantPolicyRegistry (0xB8c33a9BE82e53992213E2054F86A64d935C9747)                                                                                                                                   
  - Merchant gateway deployed on Railway: https://shielded-x402-gateway-production.up.railway.app                                                                                                       
  - Live demo UI: https://shielded-x402.vercel.app                                                                                                                                                      
  - GitHub: https://github.com/sxl-netizen/shielded-x402                                                                                                                                                
                                                                                                                                                                                                        
  Payment amounts are encrypted on-chain via Fhenix CoFHE. The ledger enforces minimum charges over ciphertext. No plaintext amount ever touches the chain. Block explorers see only a ciphertext handle.                                                                                                                                                                                               
                                                                                                                                                                                                        
  The x402 HTTP payment standard is implemented end-to-end: browser connects wallet, merchant issues a 402 challenge with a cryptographic nonce, payer submits proof, gateway calls settlePayment on-chain, content is unlocked. The full flow is live and testable.  


Milestone
0points

Grant
0 USDC

0
CIPHER CV
CIPHER CV
Privacy-Preserving Labor Market Protocol
Market Infrastructure,
GitHub
Updates in this Wave
Wave 2 — Changes & Implementation Log
Complete record of all Wave 2 changes to Cipher CV. Wave 2 focus: Real CoFHE contracts, @cofhe/sdk integration, Convex data layer, production-grade UI.

CoFHE Stack Alignment (Critical Update)
Wave 2 aligns the entire stack with the real CoFHE SDK as documented at cofhe-docs.fhenix.zone.

What Changed from Wave 1
Component	Wave 1 (Mock)	Wave 2 (Real CoFHE)
FHE SDK	fhenixjs	@cofhe/sdk
Contract imports	@fhenixprotocol/contracts/FHE.sol	@fhenixprotocol/cofhe-contracts/FHE.sol
Networks	Fhenix Frontier (8008135)	Arbitrum Sepolia, Ethereum Sepolia, Base Sepolia
Local testing	None	cofhe-hardhat-plugin mock environment
Encryption API	client.encrypt_uint32(n)	client.encryptInputs([Encryptable.uint32(n)])
Decryption API	FHE.decrypt()	client.decryptForView().withPermit().execute()
Permission model	None	FHE.allowThis() + FHE.allowSender() required
Supported Networks (CoFHE)
Network	Chain ID	Explorer	Gas
Arbitrum Sepolia	421614	sepolia.arbiscan.io	Lowest ✅
Ethereum Sepolia	11155111	sepolia.etherscan.io	Medium
Base Sepolia	84532	sepolia.basescan.org	Low
Smart Contracts
8 Contracts Implemented
All contracts updated to use @fhenixprotocol/cofhe-contracts/FHE.sol with proper FHE.allowThis / FHE.allowSender permission management.

Contract	File	Key FHE Operations
CipherCV	contracts/CipherCV.sol	FHE.lte, FHE.gte, FHE.and, FHE.sealoutput
CipherVault	contracts/CipherVault.sol	FHE.asEuint32, FHE.sealoutput
CipherGovernance	contracts/CipherGovernance.sol	FHE.add, FHE.gt, FHE.decrypt
CipherEscrow	contracts/CipherEscrow.sol	FHE.gte, FHE.asEuint32
CipherCounterOffer	contracts/CipherCounterOffer.sol	FHE.lt, FHE.gte, FHE.select, FHE.add
CipherStealth	contracts/CipherStealth.sol	Plaintext blocklist + FHE-gated visibility
CipherBatchMatcher	contracts/CipherBatchMatcher.sol	Delegates to CipherCV
CipherRegistry	contracts/CipherRegistry.sol	None — address registry
Deployed Contract Addresses (Arbitrum Sepolia)
All 8 contracts are live on Arbitrum Sepolia (Chain ID: 421614).

Contract	Address	Explorer
CipherCV	0xe9B8e9bC8D447a1FE7746d3b870491226f8cB659	View on Arbiscan
CipherVault	0xeff0835318a9e6812150519321B3097Db685A361	View on Arbiscan
CipherGovernance	0x6D4b9e6C8946f7bc4bBCee81f7E4b31f97F53707	View on Arbiscan
CipherEscrow	0x2d3f35e6EC323ad66E288a8F32765bde35cf68A6	View on Arbiscan
CipherCounterOffer	0xac95Fd56a9a18A5424370528a40035F47277A13d	View on Arbiscan
CipherStealth	0xE4cCE042F239F02E5ce2F7aCFcd595Cbf988DB91	View on Arbiscan
CipherBatchMatcher	0xB89B8a766EFF04ABFa7781effeC8c5DA81801D3b	View on Arbiscan
CipherRegistry	0x92D5322caD60e583ca4502c08Bf9E75DcAd5CB79	View on Arbiscan


Milestone
0points

Previous Wave Points
1st Wave
0 pt
Grant
0 USDC

1
CovertMRV
Hidden
CovertMRV
Private Climate Compliance & Carbon Markets
Carbon Markets
Updates in this Wave
CovertMRV — Encrypted Carbon Compliance Protocol

Wave 2 submission. Live on Arbitrum Sepolia.
live : https://covert-mrv.vercel.app/
WHAT IT IS
CovertMRV is the first FHE-powered Measurement, Reporting, and Verification protocol for climate compliance and carbon markets. Companies prove they meet their regulatory emissions caps without revealing what their emissions are. The number stays sealed. The compliance result is provable on-chain.

THE PROBLEM
Regulators require facility-level emissions reporting. Those numbers are trade secrets — they expose production volumes, energy efficiency, and cost structure. Today companies choose between honest reporting and competitive survival. The result is systematic underreporting and a $900B market built on trust instead of proof. The same conflict multiplies across Scope 3 supply chains, carbon credit verification, and procurement bids.

OUR SOLUTION
Move the entire compliance lifecycle to encrypted state. Emissions are stored as euint64 ciphertext. The protocol aggregates them using FHE.add(). Compliance is checked with FHE.lte(total, cap). The result is an encrypted boolean. The regulator sees true/false. They never see 12,500 tonnes. The cap threshold stays sealed. Verify the claim, not the data.

WAVE 2 — WHAT WE SHIPPED
Two deployed contracts on Arbitrum Sepolia:

CapRegistry.sol (0x13739cCd234A901060453d7b86C1BCc245B40428) — encrypted emissions submission and storage. Companies register as emitters, submit encrypted facility figures via @cofhe/sdk, and the contract aggregates totals via FHE.add(). Even the regulatory cap is encrypted.

CapCheck.sol (0x2792563D003faBEecfbac8c32c9baA7705030C26) — compliance verification engine. Runs FHE.lte(total, cap), produces an ebool result, grants selective disclosure per role (company, regulator, auditor), and settles compliance on-chain with a cryptographic signature via settleCompliance().

11 FHE operations: encrypt, add, lte, gte, select, allow, allowThis, allowSender, sealoutput, asEuint64, isInitialized.

Production dApp: TanStack Start, React 19, Tailwind v4, wagmi v2, RainbowKit. Wallet-connected dashboard for emission submission, permit-based decryption, and compliance checks.

SELECTIVE DISCLOSURE
L0 — Company sees own facility figures (exact).
L1 — Auditor (time-bounded) sees aggregate total.
L2 — Regulator sees pass/fail boolean only.
L3 — Public sees transaction hash as on-chain proof.

ROADMAP
Wave 3 — ScopeX: encrypted Scope 3 supply chain footprints.
Wave 4 — Credits: confidential cCO2 token, FHERC20, mint on verified reductions.
Wave 5 — Tender: sealed-bid carbon procurement, FHE clearing price.

TECH: Solidity 0.8.28, viaIR, cancun EVM, Arbitrum Sepolia 421614, @cofhe/sdk v0.4.0, TanStack Start, React 19, wagmi v2.


Milestone
0points

Previous Wave Points
1st Wave
0 pt
Grant
0 USDC

1
Stealthiness 
Hidden
Stealthiness
Trade NFTs. Hide the price.
Market
NFT
Updates in this Wave
Smart Contracts





StealthNFT.sol: ERC-721 with metadata storage



StealthMarketplace.sol: FHE-powered marketplace with encrypted prices/bids

Frontend





Particle Effects Hero: Animated floating particles with glowing elements



Glass Morphism UI: Modern transparent design with blur effects



NFT Grid: Hover animations, encrypted badges, modal details



Mint Form: Full metadata encryption, attribute support



Multi-chain Support: Sepolia, Arbitrum Sepolia, Base Sepolia

Wave 1 Judge Feedback



"Great use of FHE ops, new SDK & decrypt flow. Encrypting NFT metadata (not just price) would be a strong differentiation step for Wave 2."

Implemented from feedback:





Full metadata encryption (name, description, image, price, attributes)



Enhanced UI with particle effects and animations



Improved UX flow for encrypted transactions


Milestone
0points

Previous Wave Points
1st Wave
0 pt
Grant
0 USDC

1
MedVault
MedVault
MedVault: Fhenix FHE-powered clinical trials for 100% private data matching and patient sovereignty.
Confidential Computing
Market Infrastructure
Healthcare
Deliverable
Updates in this Wave
Updates in This Wave
Overview
This deployment enhances Med-Vault's FHE eligibility verification system with on-chain proof capabilities, improves trial application UI/UX, and updates subgraph bindings.

Commit: 7ad75e9
Files Changed: 29 files (613 insertions, 414 deletions)
Deliverable URL: https://med-vault-omega.vercel.app/

Key Updates
1. Eligibility Engine Smart Contract (d:\medvault/contracts/EligibilityEngine.sol)
Enhanced FHE Integration: Added Impl and Common imports for advanced FHE operations
Public Decryption Support: Added FHE.allowPublic(finalResult) enabling patients to request decryption without a permit
On-Chain Eligibility Verification:
Updated applyToTrial() to require decrypted boolean result + Threshold Network signature
Verifies signature using FHE.verifyDecryptResult before accepting applications
Prevents fraud with cryptographic proof of eligibility
2. TrialCard Component (d:\medvault/src/components/dashboard/TrialCard.tsx)
Major UI/UX Improvements: 258 lines of enhancements to trial application interface
Enhanced Eligibility Display: Fixed messaging to use boolean (eligible/not eligible) instead of percentage
Improved Button States: Better handling of apply button states with clearer disabled logic
Sponsor Application Flow: Added support for sponsor-based trial applications
Animation Enhancements: Improved motion animations for status messages
3. FHE Library (d:\medvault/src/lib/fhe.ts)
New publicDecrypt() Function: Decrypts publicly-allowed ciphertexts for transaction use, returns { ctHash, decryptedValue, signature } for on-chain verification
New decryptForView() Function: Decrypts permit-scoped ciphertexts for UI display only (no on-chain signature)
Type Exports: Added FheTypes export for better type safety
4. Smart Contract ABIs
Updated ABI files for:

EligibilityEngine.json - New function signatures
MedVaultAutomation.json - Automation contract updates
SponsorIncentiveVault.json - Sponsor incentive changes
5. Contract Addresses (d:\medvault/src/lib/contracts/addresses.json)
Updated deployed contract addresses on the network
6. Subgraph System
Regenerated TypeScript bindings and schema to match updated smart contracts across all major contracts (EligibilityEngine, TrialManager, PatientRegistry, SponsorIncentiveVault, etc.)

7. Documentation Updates
Updated 7 documentation pages to reflect architectural changes in architecture, encryption, security model, and user guide sections.

Technical Impact
Security: On-chain eligibility verification prevents fraudulent applications with Threshold Network signature verification

User Experience: Clearer eligibility messaging, better trial application flow, enhanced visual feedback

System Reliability: Updated smart contract interfaces, regenerated subgraph bindings, comprehensive documentation updates

The deployed version is now live at https://med-vault-omega.vercel.app/








Milestone
0points

Previous Wave Points
1st Wave
0 pt
Grant
0 USDC

1
LexCrypt
Hidden
LexCrypt
Private justice infrastructure — AI-powered legal intelligence on encrypted data.
prediction market
AI
Legal Tech
Updates in this Wave
Wave 2 — FHE Smart Contracts Live on Arbitrum Sepolia
Legal case analysis has never been possible on transparent rails. Attorney-client privilege, sealed evidence, and jurisdictional confidentiality requirements make on-chain legal tooling legally impossible without privacy guarantees. LexCrypt solves this with FHE computation over encrypted legal inputs — no raw data ever touches the chain.
What we shipped this wave:
→ LexCryptRegistry.sol deployed on Arbitrum Sepolia — role-based access control with FHE.allowSender() permit management. Judges, attorneys, and clients each hold scoped decrypt permissions.
→ JudgeAssistant.sol — analyzeCase() accepts encrypted inputs (inEuint128, inEuint32), runs FHE weighted scoring over ciphertext, stores encrypted result handles. Zero plaintext ever on-chain.
→ WinPredictor.sol — 5-feature FHE logistic regression. predict() function live. Results decrypt client-side only via CoFHE permits.
→ Full @cofhe/sdk integration: useEncrypt(), useWrite(), useDecrypt() hooks working end-to-end. MetaMask wallet connection + FHE permit flow complete.
→ User submits case data in browser → CoFHE SDK encrypts client-side → calldata is pure ciphertext → result decrypts locally. No server. No trusted intermediary.
Migrated fully from fhenixjs to CoFHE SDK.


Milestone
0points

Previous Wave Points
1st Wave
0 pt
Grant
0 USDC

1
SealedML
Hidden
SealedML
Privacy-first AI for financial decision making.
AI
privcy
Updates in this Wave
cheak readme.md file for info and roadmap


Milestone
0points

Previous Wave Points
1st Wave
0 pt
Grant
0 USDC

2
TrialVault
TrialVault
FHE-native clinical trial infrastructure — compute on encrypted patient data. Nobody sees anything.
Healthcare
AI
privacy tech
GitHub
Updates in this Wave
 FHE Clinical Trial Contracts Live on Testnet
Clinical trial data cannot go on transparent rails. HIPAA, GDPR, and FDA 21 CFR Part 11 all require that patient records stay private — even from the institutions running the analysis. TrialVault is the first on-chain clinical trial platform where patient eligibility is computed over fully encrypted data. No raw records ever touch the chain.
What we shipped this wave:
→ PatientVault.sol deployed on Arbitrum Sepolia — patient health records stored as FHE-encrypted euint128 values. Only the patient holds the decrypt permit via FHE.allowSender().
→ TrialMatcher.sol — encrypted eligibility scoring using FHE comparison operators. Pharma researchers receive a pass/fail result; zero underlying patient data is ever revealed.
→ ResultIntegrity.sol — on-chain Merkle commitment to trial outcome hashes. Tamper-proof audit trail without exposing trial data.
→ Full @cofhe/sdk integration: useEncrypt(), useWrite(), useDecrypt() hooks working end-to-end. Patient Portal (Next.js) — wallet connect, FHE permit flow, encrypted record submission live.
→ Fully migrated from fhenixjs to CoFHE SDK.


Milestone
0points

Previous Wave Points
1st Wave
0 pt
Grant
0 USDC

1
Xyra Finance: Private Money Market on Fhenix
Hidden
Xyra Finance: Private Money Market on Fhenix
Privacy-first money market on Fhenix for confidential lending, borrowing, and MEV-free liquidations.
Money Market
landing borrowing
Updates in this Wave
Xyra Finance — Private Lending Protocol (Sepolia Testnet)

Demo: https://xyra-finance-fhenix.vercel.app/

CONTRACTS (Sepolia)
PrivatePool: 0xC198fFaf05aE08a7f27be9597958921e5999E7A8
KeeperRegistry: 0x9dA23f124eA2b2FC4815a02Eba9a45F1Ec02370c
FlashLiquidator: 0xDF62fc0314aF389Bf459c2A93deaDe973DeA566b
SwapAdapter: 0x07e726DF617201A06f4Fe53698edB0BEdA43aa8B

WHAT IT IS
Xyra is a private, multi-asset lending protocol on Ethereum Sepolia. User positions are hidden on-chain via commitment hashes, while a keeper coordinates state transitions. It enables secure lending, borrowing, and flash liquidations with strong on-chain validation. Currently in beta (testnet-only).

CORE ARCHITECTURE

Multi-asset pool (USDC, USDT, WETH) with Chainlink pricing
Positions stored as keccak256 commitments; plaintext off-chain
Keeper-signed actions (deposit, withdraw, borrow, repay) with chain-bound signatures + expiry
Liquidation safety: HF < 1 enforcement, 50% close factor, capped bonus, collateral limits
Flash loans via Aave v3 + ERC-3156 adapter
Per-asset caps, fees (≤10%), enable/disable controls, treasury + LP fee split
Two-slope utilization-based interest model (Aave-style)
Oracle: Chainlink-first with ≤7d TTL emergency override
Security: 2-of-3 Safe, global pause, per-asset kill switch, no amount leakage in events

LIQUIDATION ENGINE
Flash-borrow → execute keeper-signed liquidation → swap collateral via Uniswap V3 → repay atomically. All swaps are externally routed with full revert safety.

KEEPER INFRA
TypeScript service with APIs for positions, co-signing, and liquidation execution. Includes secure signing (env/KMS-ready), circuit breakers (per block/hour caps), health monitoring, Prometheus metrics, structured logs, and containerized deployment.

FRONTEND
Next.js + React app with:
Dashboard (positions, HF, history), Markets (TVL, APYs), Flash Loans (fee simulator + dev snippets), Liquidations (live scanner). Includes RPC fallback + testnet faucet support.

USER CAPABILITIES
Supply/borrow USDC, USDT, WETH, track health factor, monitor APYs, access test tokens, and view liquidation opportunities.

PRIVACY MODEL
Operator-shielded (not ZK). On-chain data is hashed; keeper manages plaintext. Transparently labeled as beta.

OPERATIONS & SAFETY
Keeper monitoring, circuit breakers, emergency pause, oracle fallback, Supabase-backed history, and documented runbooks.

SUPPORTED WALLETS
MetaMask, Rabby, and EIP-1193 wallets


Milestone
0points

Previous Wave Points
1st Wave
0 pt
Grant
0 USDC

0
CipherCredit
Hidden
CipherCredit
FHE-Powered On-Chain Credit Protocol
Defi protocol
Updates in this Wave
In this wave, we built CipherCredit — a privacy-preserving on-chain credit scoring protocol powered by Fhenix CoFHE (Fully Homomorphic Encryption), solving DeFi’s long-standing over-collateralisation problem without exposing user data.

We tackled why this matters by removing the need for 150%+ collateral, which currently excludes most real-world users. Instead of relying on centralized credit bureaus or transparent on-chain histories, we designed a system that computes a weighted credit score — balance, transaction frequency, repayment history, and debt ratio — entirely on encrypted inputs. The score never exists in plaintext anywhere on-chain.

We deployed two core smart contracts. CreditScoreRegistry accepts encrypted financial signals (InEuint32 ciphertexts) and computes the score using FHE operations like FHE.mul and FHE.add directly on ciphertexts, then performs an encrypted comparison (FHE.gte) to produce a boolean approval result. This result is selectively disclosed to a lender. LendingPool consumes that verified boolean through a three-step on-chain reveal flow powered by the Fhenix threshold network, enforcing collateral tiers of 150% for standard users and 110% for credit-approved borrowers.

On the frontend, we built a full Next.js 15 App Router application. The Borrower Dashboard allows users to adjust financial signals with live sliders, preview their score, encrypt and submit data via the CoFHE SDK, and grant approval in one flow. The Lender Dashboard displays pool liquidity and collateral tiers, and allows lenders to check borrower eligibility — seeing only pass or fail, never the underlying data.

We also implemented a full Hardhat task suite covering deployment, encrypted data submission, and the complete three-step approval and reveal process from the CLI.

The key breakthrough is enabling lending decisions based on real creditworthiness without revealing any sensitive data. Borrowers retain full control over disclosure, and lenders receive only what they need — a verified boolean. This is selective disclosure enforced at the cryptographic level through FHE, not by UI or policy.


Milestone
0points

Grant
0 USDC

0
GhostPool
Hidden
GhostPool
Predict on any outcome. Win. Stay completely invisible.
prediction market
DeFi
AI
Updates in this Wave
GhostMarket.sol Live on Arbitrum Sepolia
Every existing prediction market — Polymarket, Augur, Manifold — exposes your position the moment you bet. Whales see your stake, your selection, and your wallet. They front-run you, fade you, and move the odds before your transaction settles. GhostPool eliminates this entirely: bets are submitted as FHE ciphertext, pool sizes accumulate homomorphically, and no participant ever sees another's position — not even the contract operator.
What we shipped this wave:
→ GhostMarket.sol deployed on Arbitrum Sepolia — submitBet() accepts inEuint8 (selection), inEuint64 (stake), inEaddress (wallet), all fully encrypted on submission.
→ Per-outcome pool accumulation via FHE.add() on euint128 ciphertext — total pool size computed homomorphically without revealing individual stakes.
→ ACL correctly configured: FHE.allowThis() + FHE.allowSender() per bet. Only the bettor can decrypt their own position.
→ 20+ passing Hardhat tests using cofhe-hardhat-plugin mock environment: bet creation, submission, access control, pool accumulation, edge cases.
→ Frontend live: wallet connect, CoFHE SDK encryption, encrypted bet submission on Arbitrum Sepolia testnet working end-to-end.
→ Fully on CoFHE SDK — no fhenixjs.


Milestone
0points

Previous Wave Points
1st Wave
0 pt
Grant
0 USDC

0
Umbra
Hidden
Umbra
Confidential parametric insurance.
DeFi
Market Infrastructure
Updates in this Wave
Overview

Umbra Protocol is a confidential parametric insurance platform on Fhenix. Enterprises create policies where coverage, premiums, and trigger thresholds are fully encrypted on-chain via FHE. When a Chainlink oracle reading crosses the hidden threshold, the contract runs an encrypted comparison — no party sees plaintext. Settlement routes silently through Privara (ReineiraOS) to the beneficiary.

Live Demo : https://umbra-tau.vercel.app/


Milestone
0points

Previous Wave Points
1st Wave
0 pt
Grant
0 USDC

1
OBSCURA
Hidden
OBSCURA
The Dark Operating System for Onchain Organizations
Payment
DeFi
AI
Updates in this Wave
══════════════════════════════════════
  OBSCURA — The Dark Operating System
  for Onchain Privacy
  "See Only What You're Meant To."
══════════════════════════════════════

Five modules — Payments, Governance, DeFi,
Compliance, AI — on Fhenix CoFHE, Arbitrum.
Every value is FHE ciphertext. Decryption via
EIP-712 permits. Zero plaintext on Arbiscan.

Live Demo & Docs:
https://obscura-os-nine.vercel.app/
https://obscura-os-nine.vercel.app/docs

──────────────────────────────────────
  WAVE 1 — ObscuraPay (LIVE)
──────────────────────────────────────

Four Solidity contracts deployed:

- ObscuraToken — $OBS FHERC-20, euint64
  balances, daily faucet, confidential P2P
- ObscuraPay — Encrypted payroll, FHE.add()
  accumulation, batchPay 50 employees
- ObscuraEscrow — eaddress + euint64, silent
  failure via FHE.select (returns 0, no revert)
- ObscuraConditionResolver — TIME_LOCK +
  APPROVAL pluggable release logic

──────────────────────────────────────
  WAVE 2 — ObscuraPay v4 (LIVE)
──────────────────────────────────────

4 → 15 contracts. 142 tasks. 14+ hooks.
15 components. 8-tab frontend on encrypted cUSDC.

New OBSCURA contracts (4): PayStream, Stealth
Registry, PayrollResolver, PayrollUnderwriter.
ReineiraOS integration (6): cUSDC FHERC-20,
ConfidentialEscrow, CoverageManager, Insurance
Pool, PoolFactory, PolicyRegistry. 5 interfaces.

Tabs: Dashboard, Send, Receive, Escrows, Streams,
Cross-Chain (CCTP V1), Insurance, Stealth.

──────────────────────────────────────
  WAVE 2 — ObscuraVote (LIVE)
──────────────────────────────────────

Encrypted governance by DiablooDEVs. V4 after
4 iterations. 7 components. 5-tab VotePage.
Encrypted ballots. Multi-option (2-10). Unlimited
revoting. Time-locked results. Token-gated.
Quorum. Verify My Vote via FHE.allow().

──────────────────────────────────────
  TEAM
──────────────────────────────────────

Two builders merged at Fhenix Buildathon,
as encouraged by organizers:

- Core — 10 contracts, 5 interfaces, 14+ hooks,
  8-tab platform, stealth, insurance, bridge
- DiablooDEVs — Vote architect, 4 iterations,
  7 components, 5-tab governance frontend

──────────────────────────────────────
  DEPLOYED: 15 CONTRACTS
──────────────────────────────────────

Arbitrum Sepolia (421614)
Wave 1: Token, Pay, Escrow, ConditionResolver
Wave 2 Pay: PayStream, StealthRegistry,
  PayrollResolver, Underwriter, cUSDC,
  ConfidentialEscrow, CoverageManager,
  InsurancePool, PoolFactory, PolicyRegistry
Wave 2 Vote: ObscuraVote V4

14 active FHE ops. 100% ABI coverage.

──────────────────────────────────────
  ROADMAP
──────────────────────────────────────

Wave 3 — ObscuraVault (DeFi)
Wave 4 — ObscuraTrust (Compliance)
Wave 5 — ObscuraMind (AI on encrypted data)

──────────────────────────────────────

Stack: Solidity 0.8.25, Fhenix CoFHE, React 18,
Vite 5, TypeScript, wagmi, viem, @cofhe/sdk,
Tailwind, Framer Motion, Circle CCTP V1

══════════════════════════════════════
video in product page 


Milestone
0points

Previous Wave Points
1st Wave
0 pt
Grant
0 USDC
devmo
devmo
If you have any questions for the judges, please comment here.
Submit

2
Handshake Protocol
Handshake Protocol
Confidential Negotiation & Settlement Protocol
DeFi
Consumer
GitHub
Updates in this Wave
## Updates in this Wave

In this wave, we focused on validating the core idea of private, iterative negotiation with escrow-backed settlement and building a reliable end-to-end negotiation flow.

links - https://handshake-ten.vercel.app/
Explainer video - updated in product description
Github repo - https://github.com/chandanjha34/Handshake

We built a functional prototype of Handshake with the following:
- A clean landing page that communicates the concept of private, trustless negotiation
- A working app interface with room creation, negotiation flow, and settlement lifecycle
- Wallet connection and network handling (Sepolia)

End-to-end negotiation pipeline:
- seller creates a room with an initial ask price
- buyer joins via shared link and submits a bid
- buyer locks funds in escrow at submission
- protocol computes midpoint settlement proposal
- both parties participate in iterative approval rounds
- final settlement is executed onchain

We implemented:
>> Smart contract architecture using NegotiationFactory and per-room NegotiationRoom
>> Escrow-based fund locking and conditional settlement execution
>> Iterative negotiation logic with midpoint recomputation across rounds
>> Dynamic escrow adjustment for higher accepted settlement values
>> Frontend integration for room lifecycle, approval states, and transaction handling
>> Clear UI states for wallet connection, network mismatch, and transaction status

We also focused heavily on demo reliability:
- Ensured all values and states are sourced directly from smart contracts
- Added clear indicators for negotiation status (waiting, active, settlement phase)
- Handled acceptance/rejection flows explicitly to avoid ambiguous states
- Managed escrow edge cases (insufficient funds, partial acceptance)

This wave validates that iterative negotiation, escrow-backed commitment, and onchain settlement can work together in a coherent and reliable application flow.


Milestone
0points

Grant
0 USDC

0
CipherRoll
Hidden
CipherRoll
Private Payroll. Blind Execution.
Privacy
Payments
Enterprise
Updates in this Wave
CipherRoll Wave 2 focused on moving the product from encrypted payroll tracking into a live confidential payroll execution flow on Arbitrum Sepolia, while improving access control, auditability, and frontend UX.

Live app: https://cipher-roll.vercel.app/
Docs: https://cipher-roll.vercel.app/docs
Demo: https://youtu.be/uBAilNYfFIw

Wave 2 updates:

Live treasury-backed settlement
CipherRoll now supports a real payroll settlement path instead of stopping at encrypted bookkeeping. Admins can fund treasury inventory, reserve payroll runs, activate claims, and move payouts into live token settlement on Arbitrum Sepolia.

FHERC20 wrapper integration
We integrated the preferred FHERC20 wrapper-based payout flow end to end. This allows payroll settlement to remain confidential deeper into execution, rather than revealing payroll amounts prematurely during the payout path.

Employee-side private decryption
Employees now complete the privacy-sensitive portion of the flow locally in the browser. They enable privacy mode, decrypt payroll data with their own wallet, and finalize claim/wrapper actions without routing plaintext salary data through the app server.

Auditor selective-disclosure workflow
We shipped an auditor portal built around shared permits and aggregate-only review. Admins can export a non-sensitive sharing payload for an auditor, and the auditor can import that permit to review only organization-level disclosures such as total budget, committed payroll, available runway, and compliance-safe summaries.

Verifiable audit evidence
Wave 2 extends selective disclosure from “viewable” to “provable.” Auditors can generate single-metric or batched evidence using decryptForTx, then verify or publish those receipts on-chain to support stronger auditability.

Role-based frontend architecture
The frontend was expanded into dedicated operational surfaces for:

Admin payroll operations
Employee claim/decryption flow
Auditor review
Tax/compliance-facing status
In-app docs

Chain/config cleanup
Based on prior feedback, we avoided unsupported “Fhenix L2” assumptions and kept deployments/configuration explicitly aligned to supported EVM testnets. The live app is pointed to Arbitrum Sepolia, with code structured around supported chain configuration and migration toward the newer CoFHE SDK.

UX and deployment readiness
We improved landing-page narrative, layout, portal structure, and docs, and fixed production build issues so the latest Wave 2 frontend can deploy cleanly on Vercel.

Overall, Wave 2 made CipherRoll substantially more complete technically: live settlement, wrapper-backed confidential payouts, local employee decryption, aggregate auditor review, on-chain evidence flows, and a cleaner deployment-ready product surface.


Milestone
0points

Previous Wave Points
1st Wave
10 pt
Grant
0 USDC

2
MindVault
Hidden
MindVault
Privacy-first mental health companion
vault
Updates in this Wave
In this wave, we made significant progress across three major areas: product design, technical architecture, and user experience flow.
1. Core Chat Experience Built
We designed and implemented the core anonymous chat interface. Users can now enter the platform with zero signup — no email, no phone, no OTP. A secure anonymous session is generated automatically the moment they land on the app. The chat UI greets users with a calm, welcoming message and begins emotional support conversation immediately.
2. Emotional Analysis Layer
We built the background AI layer that silently analyzes conversation patterns. It tracks mood trends, identifies stress triggers, and monitors frequency of negative thoughts — all without exposing any raw data to the user or the system. Users only see gentle, non-alarming insights like "Low Mood Detected" or "Stress Trigger Identified."
3. Crisis Detection System
One of our biggest milestones this wave was designing the crisis response flow. When a user expresses high-risk language, the system responds calmly — no panic, no aggressive alerts. It simply shows a concerned message and offers three options: talk to a therapist, join a support circle, or continue the conversation. The user stays in full control.
4. Privacy Settings Panel
We completed the user control panel where users can set their own "Emergency Rules" — for example, choosing to reveal identity only in critical situations and only to a verified therapist. This gives users a sense of ownership and trust over their own data.
5. UI/UX Design Finalized
All screens were designed with emotional safety in mind — soft colors, minimal text, no overwhelming dashboards. Every interaction was mapped to a specific emotional state to ensure the platform feels like a companion, not a clinical tool.


Milestone
0points

Grant
0 USDC

0
KURA — Encrypted Community Savings Circles
Hidden
KURA — Encrypted Community Savings Circles
Save Together. Know Nothing.
Savings Circles
Updates in this Wave
🔐 KURA — Encrypted Community Savings Circles
"Save Together. Know Nothing."
live : https://kura-gilt.vercel.app/
🌍 THE PROBLEM
1.2 billion people across 50+ countries save through informal circles — chit funds (India, $80B+), stokvels (South Africa, $50B+), tandas (Mexico), susus (West Africa). This $500B+ market is the #1 savings mechanism in developing economies. Every platform — Money Fellows ($31M Series B), eqb (100K users) — exposes amounts in plaintext. Visible amounts cause social shame, leader coercion, free-rider fraud, and zero portable credit history.

🔒 WHAT KURA DOES
KURA encrypts every contribution, bid, and credit score using Fully Homomorphic Encryption (Fhenix CoFHE) on Arbitrum Sepolia. All on-chain values are euint64 ciphertext. Block explorers see hashes — never amounts. 14 FHE operations across 6 deployed contracts. Every encrypted value has an explicit ACL — no data is ever globally visible.

⚙️ THE 6 SMART CONTRACTS
① KuraCircle — members deposit via FHE.asEuint64(). Contract validates minimums with FHE.gte(), accepts with FHE.select(), accumulates pool with FHE.add(). Nobody sees amounts — not admin, not Etherscan.
② KuraBid v2 — sealed-bid auction. FHE.lte() compares bids on ciphertext, FHE.select() tracks lowest bidder as encrypted eaddress. Settlement via decryptForTx + publishDecryptResult. Losing bids encrypted forever.
③ KuraCredit — +1 per contribution, +5 per circle completion via FHE.add(). Five tiers: Newcomer → Contributor → Reliable → Trusted → Elite. DeFi protocols verify with FHE.gte(score, threshold) — double-blind, neither value revealed.
④ KuraConditionResolver — ReineiraOS IConditionResolver gating escrow on encrypted credit tiers.
⑤ KuraEscrowAdapter — bridges payouts to ConfidentialEscrow with claim/unwrap for round winners.
⑥ cUSDC — Confidential USDC (ConfidentialERC20) for circle deposits.

🔑 14 FHE OPERATIONS
asEuint64 · asEaddress · add · sub · min · gte · lte · eq · select · div · allowThis · allow · allowPublic · sealoutput. Decrypt flow: decryptForView (UI reveals) + decryptForTx + publishDecryptResult (on-chain settlement).


📈 MARKET
TAM: $500B+. SAM: $50B+. SOM Year 1: $6M. Money Fellows proved $31M venture-scale demand. 150M+ Indians use chit funds. $50B+ stokvel circulation in South Africa. 60% of Mexicans in tandas. Every competitor exposes amounts — KURA is the first to encrypt everything on-chain. FHE is the only technology supporting async encrypted arithmetic for savings circles.

🗺️ WAVE 2 DELIVERED & ROADMAP
Live now: 6 contracts on Arbitrum Sepolia, 14 FHE ops, sealed-bid v2 with eaddress, encrypted 5-tier credit, ReineiraOS escrow, one-click auto-settle, production frontend with client-side FHE. Wave 3: Fiat on-ramp, mobile UI, cross-circle reputation. Wave 4: DeFi credit bridge — encrypted score → undercollateralized lending. Wave 5: Multi-chain, $KURA FHERC20 token, governance.

🔐 Save together. Know nothing. Build credit.


Milestone
0points

Grant
0 USDC

0
ConfidPay
Hidden
ConfidPay
privacy-native payroll and treasury platform for DAOs, built on Fhenix
Privacy flows
Private Payments
Updates in this Wave
 -ConfidPay.sol deployed on Arbitrum Sepolia (0x5f5669b3CC1B83b3aA75f598Cb345889231BB224)
- FHE-encrypted salary storage with handle generation via cofhejs
- Complete ACL: only admin creates payroll, only recipient claims
- MockConfidentEscrow.sol + MockFHERC20.sol deployed for testing
- 31 passing tests for all core payroll flows
- releasePayment() with time-lock + milestone verification on encrypted data
- Vesting schedules with cliff and linear unlock periods (extends to cap table)
- Role-based permissions (Admin, Contributor, Auditor)
- React 19 frontend with tabs UI, dark/light theme, loading states
- Backend API: createEscrow, fundEscrow, redeemEscrow, getEscrow
- cofhejs integration in contributor form for real FHE encryption
- Encrypted aggregate benchmarks – can sum salaries across DAOs without revealing individuals
- Session key setup – ZeroDev pre-auth foundation for autopilot payroll


Milestone
0points

Previous Wave Points
1st Wave
0 pt
Grant
0 USDC

1
FhePay 
Hidden
FhePay
Payroll On-Chain. Salaries Off The Record
pay
Updates in this Wave
I've updated the roadmap in the GitHub Markdown file.

We’ve also started collaborating with the PrivaPay (ninjaa_) team, and we’re now working together on improving this project.

Thank you for your recommendations!


Milestone
0points

Previous Wave Points
1st Wave
0 pt
Grant
0 USDC

1
GhostGov
Hidden
GhostGov
Vote in the dark. Count in the light
DAO
DeFi Infrastructure
tooling
Updates in this Wave
In this second wave, we went from concept to a fully working end-to-end implementation of VeilDAO — a coercion-resistant DAO governance protocol built on Fhenix Fully Homomorphic Encryption.

On the smart contract side, we wrote VeilDAO.sol from scratch using the @fhenixprotocol/cofhe-contracts library. The core voting mechanic uses euint32 encrypted state variables to hold three running tallies — FOR, AGAINST, and ABSTAIN. When a voter submits their choice, the frontend encrypts a triple (1,0,0), (0,1,0), or (0,0,1) using Encryptable.uint32 from @cofhe/sdk, and the contract calls FHE.add() to homomorphically accumulate the encrypted inputs without ever seeing the plaintext. We implemented the full Fhenix reveal lifecycle: resolveProposal() calls FHE.allowPublic() on all three handles after the deadline, which opens them for decryption by the Fhenix oracle. Anyone then calls publishResults() with the plaintext totals and FHE-generated signatures, which are verified and stored on-chain via FHE.publishDecryptResult(). The frontend polls using FHE.getDecryptResultSafe() and animates the reveal. We also added a deploy task for Hardhat and paginated view functions for the frontend to consume.

On the frontend side, we built a complete Next.js 15 application with Turbopack as the bundler. The UI is built around a dark space theme with an interactive canvas particle network that reacts to mouse movement, glassmorphism cards with gradient borders, and Framer Motion animations throughout. The standout interaction is the EncryptedCounter component — while voting is active, vote tallies display as scrambling hex characters that cycle rapidly, communicating visually that the data is encrypted and unreadable. When results are revealed after voting ends, the digits animate from random hex into the real plaintext numbers. The VotePanel walks voters through the three-stage FHE flow: encrypting locally, submitting to the chain, and confirming. We built a full proposals browser with live/resolved/revealed filter tabs, a create proposal modal with configurable duration, and a dedicated vote page with a live countdown timer, the encrypted tally display, and a resolve button that triggers the decryption ceremony.

We also resolved several technical issues during this wave: fixed a React 19 peer dependency conflict with @cofhe/react by correctly targeting React 18, replaced an invalid Turbopack WASM loader rule with the correct configuration, fixed the wagmi v2 API where useWaitForTransactionReceipt uses isPending not isLoading, removed a non-existent lucide-react icon, and resolved a TypeScript BigInt compilation error caused by a missing ES2022 target and stale incremental build cache. The project installs and type-checks cleanly using pnpm.


Milestone
0points

Grant
0 USDC

0
PHANTOM Protocol
Hidden
PHANTOM Protocol
The world''s first fully homomorphically encrypted prediction market.
prediction market.
Updates in this Wave
PHANTOM PROTOCOL — WAVE 1 SUBMISSION

"A phantom exists but cannot be observed. Your position is real — but invisible on-chain."

THE PROBLEM

Prediction markets on transparent chains are fundamentally broken. Every bet is publicly visible: amount, direction, timing. MEV bots front-run you from the mempool. Whales track institutional bettors and mirror their positions. The moment a sharp analyst bets, their research becomes public signal. The act of participating destroys the value of participating. Polymarket did $9B+ in volume in 2025 — every dollar on a fully readable chain, fully frontrunnable.

THE IDEA

PHANTOM is the world's first fully homomorphically encrypted prediction market. FHE is the only cryptographic scheme that allows computation directly on encrypted data — no decryption, no trust assumptions, no delays. Not ZK proofs. Not TEE hardware. Not commit-reveal. The smart contract runs full market logic on ciphertext: accumulating bets, routing outcomes, computing payouts — without ever seeing a single plaintext number.

WHAT WE BUILT — WAVE 1: PHANTOMBET

Three production Solidity contracts deployed on Arbitrum Sepolia:

PhantomACL.sol — Abstract base with on-chain Access Control Lists for every ciphertext. Roles: CREATOR, BETTOR, RESOLVER, AUDITOR. The contract can compute on ciphertexts but cannot read them.

PhantomBet.sol — Core binary market. FHE.select() routes each encrypted bet to YES or NO pool without the contract ever seeing direction. FHE.add() accumulates pool totals homomorphically. resolveMarket() calls FHE.allowPublic() to authorize CoFHE threshold decryption. revealPools() posts decrypted totals + ECDSA proof on-chain. claimPayout() distributes proportional winnings from public aggregates. Individual bets stay encrypted permanently.

PhantomToken.sol — $PHTM, a FHERC20 token where all balances are euint64 ciphertexts.

Deployed addresses:
PhantomBet: 0xFB9c10423EAaD015dDb04f5aC85273f1B3F7A566
PhantomToken: 0x31666B7ECf736c0c6014F0cd63C646B7f4Af3887
Chain: Arbitrum Sepolia, ID 421614

21 tests passing. Full production React 18 frontend live at phantom-protocol-chi.vercel.app — with 7 custom FHE hooks, wagmi 3.x, @cofhe/sdk 0.4.0, EIP-712 permit-based decryption, and a complete 4-step FHE state machine UI.

Privacy boundary: bet amounts, bet directions, pool totals before resolution, and all payout amounts are always encrypted. Only aggregate totals are revealed at resolution — losers are never exposed.

THE FIVE-WAVE VISION
Wave 1 — PhantomBet: Binary markets. LIVE NOW.
Wave 2 — PhantomMulti: 2–10 outcome encrypted buckets. Elections, sports, brackets.
Wave 3 — PhantomLiquidity: Encrypted AMM. Invisible pool depths. No frontrunning.
Wave 4 — PhantomFutures: Perpetual markets with encrypted funding rates and margin.
Wave 5 — PhantomOracle: AI inference on FHE-encrypted feeds. Trustless resolution without reading raw data.

docs: https://phantom-protocol-chi.vercel.app/docs
Live: https://phantom-protocol-chi.vercel.app/


Milestone
0points

Previous Wave Points
1st Wave
0 pt
Grant
0 USDC

0
ShieldCard
ShieldCard
Private corporate spend control powered by Fhenix CoFHE on Arbitrum Sepolia
Privacy
Infrastructure
FinTech
GitHub
Updates in this Wave
.


Milestone
0points

Grant
0 USDC

1
AssetsGrator
Hidden
AssetsGrator
Fractional and Frictionless Asset Tokenisation
RWA
Updates in this Wave
# FHE Contracts — Change Summary

> AssetsGrator RWA Platform · Fhenix CoFHE on Arbitrum Sepolia
> All FHE files live under `contracts/contracts/fhe/`

---

## Files in the FHE Suite

| File | Role |
|---|---|
| `ConfidentialLoan.sol` | Core loan contract — encrypted loan amounts, async origination, FHE LTV checks |
| `FHEFeeManager.sol` | Per-asset encrypted fee rates with plaintext cache bridge |
| `FHEKYCRegistry.sol` | Encrypted KYC attribute store for loan eligibility |
| `FHEPortfolioRegistry.sol` | Encrypted shadow balance registry, synced from AssetToken |
| `FHEAccessControl.sol` | Shared ACL primitive — scoped FHE grant/revoke pattern |

---

## What Changed (Wave 1 — April 2026)

### 1. `ConfidentialLoan.sol` — Async Origination Refactor (completed)

The origination flow was migrated from a single synchronous `originateLoan()` call to a
4-step async pattern that keeps loan amounts **encrypted end-to-end through the mempool**.

#### Old flow (deleted)
```
originateLoan(asset, collateralAmt, grossAmt, encAmt, encRate, encLtvBps, dueDate)
  └── LTV checked in plaintext (grossAmt visible in calldata!)
  └── publishDisbursalAmount(loanId, net, sig)  ← dead function, removed
  └── confirmDisbursal(loanId)                  ← dead function, removed
```

#### New flow (current)
```
Step 1 — requestOrigination(asset, collateralAmt, encLoanAmt, encRateBps, durationSecs)
          ↳ collateral locked immediately
          ↳ FHE.lte(encAmt, maxLoanPlain) → ebool ltvOk — async decrypt triggered
          ↳ FHE.sub(encAmt, encFee)       → euint64 encNet — async decrypt triggered
          ↳ Status: AwaitingApproval

Step 2 — publishOriginationApproval(pendingId, ltvOkResult, sig)   ← Fhenix relayer
          ↳ ltvOkResult=1 → Status: Approved
          ↳ ltvOkResult=0 → Status: Rejected (borrower calls cancelOrigination)

Step 3 — publishOriginationNetAmount(pendingId, decryptedNetAmt, sig)  ← Fhenix relayer
          ↳ Caches plaintext net amount for USDC disbursal

Step 4 — confirmOrigination(pendingId)   ← owner only
          ↳ Status: Converted → Loan created (Active)
          ↳ USDC transferred: treasury → borrower (net amount only)
          ↳ dueDate = block.timestamp + loanDurationSeconds (set at confirmation)
```



Milestone
0points

Previous Wave Points
1st Wave
0 pt
Grant
0 USDC

0
FheForge
FheForge
Encrypted DeFi strategy execution — your positions invisible on-chain
DeFi
Infrastructure
GitHub
Updates in this Wave
  FheForge ships FHE-native DeFi on Arbitrum Sepolia. Every amount — collateral, borrow, swap intent — is euint128 on-chain. No plaintext ever touches the chain.                                                                                                                  
                                                                                                                                                                                                                                                                                   
  Four contracts, all CoFHE-native:                                                                                                                                                                                                                                                
  - StrategyVault (0x261c4b5a66C24Dd1974E7ea470e76154dff062F5) — positions stored as euint128, ACL-gated decryptForView                                                                                                                                                            
  - LendingPool (0xb4F6b792219e3d6Cd3f3B8088285e52a64CCcb44) — checkLtvAndBorrow uses FHE.select to return encrypted 0 on breach, never revealing which branch ran                                                                                                                 
  - SwapRouter (0x78C2818a401477F78E129A7526bC833Eb93d964A) — amountIn/minOut encrypted per intent, only creator can read                                                                                                                                                          
  - StrategyRegistry (0xcdFB608e7f45f6e6cCA27e504ce6b8aDe64701B9) — TVL tracked as euint128 via FHE.add/sub                                                                                                                                                                        
                                                                                                                                                                                                                                                                                   
  ZkVerifier rejects any unsigned input — confirmed with 28 staticCall tests using dummy ctHash. Cross-user isolation verified on live arb-sepolia: t2.decryptForView(t1_ctHash) throws. 154 tests, real wallets, real RPC, zero mocks.                                            
                                                                                                                                                                                                                                                  


Milestone
0points

Grant
0 USDC

0
Blindside
Hidden
Blindside
Lend and borrow with fully encrypted positions
DeFi
Updates in this Wave
Blindside is a privacy-first lending protocol built on Fhenix that uses Fully Homomorphic Encryption (FHE) to keep collateral positions and liquidation thresholds fully encrypted on-chain.
In this wave we've completed a working prototype with the following deliverables:
What's built:

Smart contracts for private collateral deposits and borrow positions
A working deposit and borrow flow , users can deposit collateral and borrow against it with their position sizes remaining encrypted on-chain
A fully functional frontend UI allowing users to interact with their private positions without exposing data on-chain


Milestone
0points

Grant
0 USDC

0
MedYield
MedYield
Your health data has value. Now it can earn without being exposed.
DeFi
Healthcare
Privacy
Deliverable
Updates in this Wave
Wave 2 delivered a working end-to-end MVP: a factory-deployed FHE protocol, three pluggable encrypted computation templates, confidential stablecoin payouts wired through ReineiraOS, and a Next.js frontend with a live client-side encrypted submission flow
https://med-yield.vercel.app/

## What Wave 2 Shipped
**Protocol (`packages/foundry/src/`)**
- `MedYieldHub.sol` — factory and registry; deploys a dedicated `DataVault` per bounty via CREATE2
- `DataVault.sol` — per-bounty encrypted submission escrow with OPEN → COMPUTING → COMPLETED state machine
- `VaultDeployer.sol` — split out from Hub to stay inside the 24 KB contract-size limit
- `TemplateRegistry.sol` — owner-curated whitelist of approved computation contracts
- `MedYieldConditionResolver.sol` — ReineiraOS `IConditionResolver` implementation gating escrow release on validated submissions
**Computation templates** (all operate on ciphertexts end-to-end)
- `AggregateStats` — per-field sum, min, max, mean + valid count
- `EligibilityScreening` — encrypted AND-combined criteria (gte / lte / eq) → eligible count
- `RiskScoring` — weighted composite index with encrypted divisor
**Validation**
- `DataValidator` library — `FHE.gte`/`FHE.lte`/`FHE.and` across all fields, returning a publicly-decryptable `ebool` so the relayer can confirm validity without seeing any value
**Payouts**
- ReineiraOS `ConfidentialEscrow` integrated as the sole payment path; escrow releases encrypted `cUSDC` only when `DataVault.isSubmissionValidated(id) == true`
**Frontend (`packages/nextjs/`)**
- Next.js 16 App Router, TypeScript, Tailwind + DaisyUI, design tokens matching the handoff spec
- Routes: `/` landing, `/marketplace`, `/earnings`, `/org`
- Wallet: RainbowKit + wagmi 2 + viem 2 (MetaMask, WalletConnect, Rainbow, Trust, Rabby)
- State: Zustand (persisted) + React Query
**Submission UX**
- 4-step encrypted submission drawer (`components/submit/SubmitDrawer.tsx`): overview → form → encrypt → confirm
- `@cofhe/sdk` 0.4.0 integrated for client-side encryption — plaintext never leaves the browser
**Testing** (1,243 LoC Foundry)
- Unit tests for every contract
- Template-level tests for each of the three computations
- `test/integration/FullFlow.t.sol` — end-to-end: deploy → create bounty → fund escrow → submit → validate → batch-compute → finalize → read encrypted result
---


Milestone
0points

Previous Wave Points
1st Wave
0 pt
Grant
0 USDC

1
Dark Pool DEX
Hidden
Dark Pool DEX
MEV can't front-run what it can't read.
MEV
Updates in this Wave
updated


Milestone
0points

Previous Wave Points
1st Wave
0 pt
Grant
0 USDC

0
PVTSALE
Hidden
PVTSALE
pvtsale: confidential presales—encrypted ticket sizes, public metadata, Sepolia.
private sale
Updates in this Wave
#


Milestone
0points

Grant
0 USDC

0
Protocol fee is 0.0% of distribution.
Submit
Grant
Total
50,000 USDC
Pool
45,000 USDC
Distribution Network
Arbitrum
Build with
fhenixfhenix
FHE
Cryptography
Privara
Judging Criteria
Privacy Architecture
Innovation & Originality
User Experience
Technical Execution
Market Potential
Category
Unlimited
Tags
#Solidity
#EVM
#privacy
#Arbitrum
#Base
Github repo
https://github.com/FhenixProtocol
Community
https://t.me/+rA9gI3AsW8c3YzIx
BOOK A STRATEGY CALL
Contact us
Buildathons
Products
The Builder Activation
About us
Brand Assets
Terms
Privacy Policy
Luma
Substack
©AKINDO
Build a Killer App
Private By Design dApp Buildathon | AKINDO
