# System Architecture: Browser-Based P2P Empire Simulation

## 1. Core Concept & Constraints
* **Game Type:** Multiplayer Empire Simulation & Diplomacy Roleplay.
* **Player Count:** Up to 4 Human Players + Multiple AI-controlled Nations.
* **Budget Constraint:** $0 operating cost (Free-to-Host, Free-to-Play).
* **Infrastructure:** Client-side compute heavily utilizing WebGPU.

---

## 2. The "Zero-Cost" Tech Stack
| Component | Technology | Rationale |
| :--- | :--- | :--- |
| **Frontend Hosting** | GitHub Pages | Free static hosting for HTML/JS/CSS and game assets. |
| **AI Inference** | WebLLM + WebGPU | Runs the AI directly on the Host's graphics card, eliminating cloud API costs. |
| **Multiplayer Networking** | WebRTC (DataChannels) | Direct Peer-to-Peer (P2P) connection. No central game server required. |
| **Signaling Server** | PeerJS / Supabase (Free Tier) | Facilitates the initial WebRTC "handshake" to connect players. |

---

## 3. Multiplayer Topology: The Host-Client Model
To ensure game state synchronization and manage network/hardware load, the game uses a specific P2P structure.

* **The Host (Player 1):** Acts as the "Game Master." Their browser initializes the LLM and processes all AI nation decisions. They broadcast the resulting state changes to all connected clients.
* **The Clients (Players 2-4):** Act as "Thin Clients." Their machines do not run the LLM. They receive text/state updates from the Host and render the UI.
* **Bandwidth Cap:** Limiting the game to 4 players prevents the Host's upload connection from becoming a bottleneck during state broadcasts.
* **State Preservation:** The Host can export the game state as a Base64 JSON file to their local machine to "Save" the game.# System Architecture: Browser-Based P2P Empire Simulation

## 1. Core Concept & Constraints
* **Game Type:** Multiplayer Empire Simulation & Diplomacy Roleplay.
* **Player Count:** Up to 4 Human Players + Multiple AI-controlled Nations.
* **Budget Constraint:** $0 operating cost (Free-to-Host, Free-to-Play).
* **Infrastructure:** Client-side compute heavily utilizing WebGPU.

---

## 2. The "Zero-Cost" Tech Stack
| Component | Technology | Rationale |
| :--- | :--- | :--- |
| **Frontend UI** | React + Vite | Rich ecosystem for complex diplomacy menus and chat HUDs. Vite ensures fast builds compatible with WebGPU/WASM. |
| **State Management** | Zustand | Lightweight global state store. Prevents the React Virtual DOM from unnecessarily re-rendering the whole app during fast network updates. |
| **Map Rendering** | HTML5 Canvas (PixiJS) | Bypasses React's Virtual DOM to render hundreds of map tiles and units without crashing the browser's memory. |
| **AI Inference** | WebLLM + WebGPU | Runs the AI directly on the Host's graphics card, eliminating cloud API costs. |
| **Networking** | WebRTC (DataChannels) | Direct Peer-to-Peer (P2P) connection. No central game server required. |
| **Signaling Server** | PeerJS / Supabase | Facilitates the initial WebRTC "handshake" to connect players, then disconnects. |

---

## 3. Multiplayer Topology: The Host-Client Model
To ensure game state synchronization and manage network/hardware load, the game uses a specific P2P structure.

* **The Host (Player 1):** Acts as the "Authoritative Server." Their browser holds the master game state, validates all player moves, runs the LLM, and broadcasts the resulting state changes.
* **The Clients (Players 2-4):** Act as "Thin Clients." Their machines do not run the LLM or game rules. They simply send player actions to the Host, receive state updates, and render the UI.
* **Bandwidth Cap:** Limiting the game to 4 players prevents the Host's upload connection from becoming a bottleneck.
* **State Preservation:** The Host can export the game state as a Base64 JSON file to their local machine to "Save" the game.

---

## 4. Application Structure (The "Serverless Backend")
Because there is no traditional backend server, the React application is strictly organized to separate the UI from the Host's authoritative game logic.

| Module / Directory | Role | Executed By |
| :--- | :--- | :--- |
| `/components` | React UI elements (Menus, Modals, Chat). | All Players |
| `/store` | Zustand state (What the user sees right now). | All Players |
| `/network` | WebRTC P2P connection managers. | All Players |
| `/game-engine` | **Master Game Rules.** Validates moves, resolves conflicts, and generates the final turn state. | **Host Only** |
| `/ai-worker` | **The LLM Environment.** Isolated background thread. | **Host Only** |

---

## 5. AI Integration & Prompt Strategy
The LLM integration relies on strict memory management and prompt engineering to function efficiently on consumer hardware.



-------- THIS WILL BE CHANGED SO DON'T DEPEND ON THIS

* **Web Worker Isolation:** The WebLLM instance runs inside a background **Web Worker**. This ensures that while the AI takes 5-10 seconds to generate a diplomacy response, the React UI remains smooth and fully interactive.
* **Zero-Training Required:** The model is not fine-tuned. Instead, it uses **In-Context Learning**. The `/game-engine` dynamically translates the current game state into a text prompt.
* **Dynamic Prompt Injection:** For every AI turn, the system generates a prompt containing:
  1. **Personality:** (e.g., "You are the Iron Empire, a ruthless militaristic state.")
  2. **World State:** (e.g., "You have 500 gold. You border Valoria.")
  3. **Recent Events:** (e.g., "Valoria just broke a trade treaty with you.")
  4. **Action Request:** "Respond strictly in JSON with your next diplomatic or military move."
* **Context Truncation:** To prevent VRAM bloat over a long game, only a summarized history (the last 5 turns) is injected into the prompt, rather than the entire game log.

---

## 6. Network Flow (The Session Lifecycle)
1. **Lobby Creation:** Host starts a session, initializes the WebGPU model, and gets a Room ID from the signaling server.
2. **Joining:** Clients enter the Room ID to exchange SDP handshakes.
3. **P2P Tunnel:** Direct WebRTC DataChannels open between the Host and the 3 Clients.
4. **Game Loop:** * Humans lock in their moves.
   * Host's `/game-engine` messages the `/ai-worker` to generate moves for NPC nations.
   * Host resolves all moves and broadcasts a single JSON state update to all Clients.
   * Zustand stores update across all screens, triggering React/Canvas to re-render.

---

## 7. AI & Memory Management Strategy
Running LLMs in the browser requires strict RAM/VRAM discipline to prevent crashing the user's machine.

* **Singleton Pattern:** The Host loads only **one** LLM into memory. The game swaps the "Prompt Context" depending on which NPC nation is currently taking its turn.
* **Model Selection:** Target a 4-bit quantized model (e.g., Phi-4 Mini or Llama 3.2 1B) to keep total system RAM usage between 4GB and 8GB.
* **Progressive Loading:** Check `navigator.gpu` and available system memory on startup to warn the Host if their hardware might struggle.
* **Context Window Truncation:** Instead of feeding the AI the entire turn history, use a "Summary Memory" system (e.g., passing only the last 5 turns plus a static prompt of current treaties) to prevent VRAM bloat over a long game.

---