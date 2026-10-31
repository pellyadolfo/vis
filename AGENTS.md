# Project Constraints: React & Web3 Architecture

## 1. Core Design Philosophy
This repo contains web dApp to determine best location for vending machines as Vending Information System

## 2. System Requirements
*   **Runtime Dependency:** React `>=18.0.0` (Vite-powered SPA).
*   **Styling Engine:** Tailwind CSS `>=3.0.0`
*   **Icon Asset Library:** Lucide React `>=0.300.0`
*   **Type Engine:** Strict TypeScript compilation with exhaustive property typing.

# 3. Data
* Data is located in data folder. Every subfolder contains the notable locations according to people
* Accomodation prefixed files includes residential, hotel and nursing houses for elder people
* Activity prefixed files include hospital, kindergardens, schools, sports, universities
* Leisure prefixed files include park, restaurants, busiest streets
* Market prefixed files include food and non-food markets
* Travel prefixed files include transport and turism
* Every file includes notable points for the specific type, ordered by number of expected daily visitors
* Every notable point includes the name of the place, coords in "lat, lng" format, and number of expected visitors in format "week-from, week-to, weekend-from, weekend-to"

# 4. Application
* The application is layered out in topbar, sidebar and main body
* The sidebar has a select box on top so we can select the subfolder in data folder
* the sidebar shows a select box with the subfolders in data folder so user can select a set of data
* The sidebar shows a list of the files with checkboxes for the selected subfolder
* Ths main body contains a google map where the user can see the notable points included in files where chckbox is checked

## 8. Hard Human Confirmation Boundaries (HITL)
* **Think Before Acting:** You MUST print a short markdown list detailing your planned steps using the text response channel before executing any file edits or bash scripts.
* You must STOP code generation, freeze all operations, and ask the user for confirmation in chat before:
1. Installing ANY external NPM packages or components outside the core stack.
2. Altering RPC URLs or switching network configurations (e.g., Mainnet vs Testnets).
3. Modifying local smart contract ABI JSON files.
4. Writing state-changing blockchain calls (`.send()`, `writeContract`) without a UI loading state attached.

## 9. Security & Safety Rules
* **Write Protection:** Do not attempt to update this `AGENTS.md` file autonomously. 
* Do NOT hardcode, read, or generate private keys or seed phrases.
* You are write-blocked from accessing `.env` or `.env.local`. Ask the user in chat if variables are needed.
* Do NOT modify any file outside the webApp folder where this file is located
* Do NOT do git updates, human has to verify always before
* DO NOT install external npm packages unless explicitly instructed.
* All shell tools must target bash/zsh formatting.
* ALWAYS run `npm run test` before declaring a coding task finished.
