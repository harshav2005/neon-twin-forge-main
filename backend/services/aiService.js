const { OpenAI } = require('openai');
const axios = require('axios');
require('dotenv').config();

// ── Gemini REST helper ────────────────────────────────────────────────────────
const geminiRequest = async (url, payload) => {
    return await axios.post(url, payload, { timeout: 30000 });
};

// ─────────────────────────────────────────────────────────────────────────────
// INTENT DETECTION
// Returns: 'PERSONAL_MEMORY' | 'GENERAL' | 'MIXED' | 'UNKNOWN_PERSONAL'
// ─────────────────────────────────────────────────────────────────────────────

const PERSONAL_PHRASES = [
    'my goals', 'my goal', 'my current goals', 'what are my goals',
    'about me', 'about myself', 'what do you know about me', 'know about me',
    'based on me', 'based on my personality', 'based on my profile', 'based on my',
    'my memory', 'my profile', 'my twin',
    'what should i focus', 'what i should focus',
    'my strengths', 'my strength', 'my weaknesses', 'my weakness',
    'what should i improve', 'help me improve',
    'motivate me', 'what motivates me', 'what inspires me',
    'i feel stressed', 'i feel anxious', 'i feel sad', 'i feel overwhelmed',
    'i am confused', "i'm confused", 'i am stressed', "i'm stressed",
    'how should i handle', 'my learning style', 'my advice style',
    'my stress', 'my anxiety', 'my motivation', 'my plan', 'my roadmap', 'my progress',
    'tell me about myself', 'what am i good at', 'my career goals', 'my career',
    'create a plan for me', 'give me a plan based on me', 'day plan', '7-day', 'weekly plan',
    'what are my', 'what stresses me', 'what type of advice',
    'guide me', 'help me plan', 'my personality', 'my traits',
    'my current', 'who am i', 'what do i prefer'
];

// Data the user hasn't saved → honest "not found"
const UNKNOWN_PERSONAL_PHRASES = [
    'my favorite food', 'my phone number', 'my address', 'my exact address',
    'my birthday', 'my age', 'my password', 'my exact location', 'my location',
    'my bank', 'my salary', 'my weight', 'my height'
];

// Single-word personal topic triggers (combine with pronoun check)
const PERSONAL_TOPIC_WORDS = [
    'goal', 'goals', 'stress', 'anxiety', 'anxious', 'motivation', 'motivate',
    'personality', 'strength', 'weakness', 'improve', 'focus', 'career',
    'advice', 'inspire', 'plan', 'roadmap', 'progress', 'trigger', 'traits',
    'confused', 'overwhelmed'
];
const PERSONAL_PRONOUNS = ['my ', 'me ', ' me', "my\t", "i'm", "i am", "i feel", "i get"];

// General / Technical keywords — these mean the user wants LLM output
const TECHNICAL_KEYWORDS = [
    'code', 'program', 'html', 'css', 'boilerplate', 'javascript', 'typescript',
    'react', 'node', 'express', 'mongodb', 'python', 'java', 'c++', 'c#',
    'dsa', 'algorithm', 'graph', 'backtracking', 'array', 'string', 'substring',
    'debug', 'error', 'api', 'component', 'function', 'class', 'sorting',
    'searching', 'recursion', 'linked list', 'tree', 'queue', 'stack', 'heap',
    'hash', 'binary', 'dynamic programming', 'dp', 'sql', 'query', 'rest',
    'http', 'fetch', 'async', 'promise', 'hook', 'state', 'props', 'redux',
    'git', 'loop', 'integer', 'boolean', 'complexity', 'big o',
    'permutation', 'subset', 'photosynthesis', 'what is', 'difference between',
    'how does', 'write a', 'write me', 'make a', 'show me',
    'joke', 'tell me a joke', 'riddle', 'fun fact', 'trivia',
    'generate', 'create a',
    'interview', 'navbar', 'button', 'form', 'modal', 'table', 'list', 'card'
];

// Emotional/personal signal words that — when paired with technical topic — mean MIXED
const EMOTIONAL_SIGNALS = [
    'i get confused', 'i feel nervous', 'i feel stressed', 'i am nervous',
    'i am scared', 'i get nervous', 'nervous before',
    'based on my learning style', 'for me personally', 'help me learn',
    'i struggle with', 'i find it hard', 'i am bad at', "i'm bad at",
    'i want to learn but', 'i get stuck', 'interview prep', 'before interview'
];

/**
 * Detects intent from the user's message.
 * Priority: UNKNOWN_PERSONAL → PERSONAL_MEMORY → MIXED → GENERAL (TECHNICAL) → GENERAL
 */
function detectIntent(message) {
    const lower = message.toLowerCase();

    // 1. Check unknown personal data first (specific trap)
    if (UNKNOWN_PERSONAL_PHRASES.some(p => lower.includes(p))) {
        return 'UNKNOWN_PERSONAL';
    }

    // 2. Check technical / general keywords
    const isTechnical = TECHNICAL_KEYWORDS.some(kw => lower.includes(kw));

    // 3. Check personal phrase match
    const isPersonalPhrase = PERSONAL_PHRASES.some(kw => lower.includes(kw));

    // 4. Check pronoun + topic word combination (catches "what are my current goals")
    const hasPronoun = PERSONAL_PRONOUNS.some(p => lower.includes(p));
    const hasTopic = PERSONAL_TOPIC_WORDS.some(w => lower.includes(w));
    const isPersonalWord = hasPronoun && hasTopic;

    const isPersonal = isPersonalPhrase || isPersonalWord;

    // 5. Check emotional signal (for MIXED mode)
    const hasEmotionalSignal = EMOTIONAL_SIGNALS.some(s => lower.includes(s));

    if (isPersonal && isTechnical) return 'MIXED';
    if (hasEmotionalSignal && isTechnical) return 'MIXED';
    if (isPersonal) return 'PERSONAL_MEMORY';
    if (isTechnical) return 'GENERAL';
    return 'GENERAL'; // Default to GENERAL — never fall through to useless response
}

// ─────────────────────────────────────────────────────────────────────────────
// MEMORY FORMATTING
// ─────────────────────────────────────────────────────────────────────────────

function formatMemories(memories) {
    if (!memories || memories.length === 0) return '';
    return memories
        .slice(0, 15)
        .map(m => {
            if (typeof m === 'string') return `- ${m.trim()}`;
            const text = (m.analyzedSummary || m.originalText || m.content || m.text || '').trim();
            if (!text || text.length < 3) return null;
            const category = m.category ? m.category.replace(/_/g, ' ') : '';
            const prefix = category && category !== 'other' ? `[${category}] ` : '';
            return `- ${prefix}${text}`;
        })
        .filter(Boolean)
        .join('\n');
}

// ─────────────────────────────────────────────────────────────────────────────
// PROMPT BUILDERS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * MODE 1 — Personal Memory: user has saved data and asks about themselves.
 */
function buildPersonalPrompt(userMessage, memoryContext) {
    if (!memoryContext) {
        return {
            system: `You are the user's Digital Twin assistant.

The user asked a personal question, but no profile data has been saved yet.

Rules:
- Do NOT say "I don't have access to your personal information."
- Do NOT say "I cannot access your personal life."
- Say briefly: "I don't have that saved yet." and guide them to add it.
- Mention Twin Builder or Voice Memory as places to add data.
- Keep the response under 3 sentences.`,
            user: userMessage
        };
    }

    return {
        system: `You are the user's Digital Twin — a personal AI mentor who knows them deeply.

The user's saved profile data is below. READ IT, ANALYZE IT, then answer their question naturally.

MEMORY DATA:
${memoryContext}

═══ CRITICAL ANALYSIS RULES ═══

**DO NOT dump raw memory.** Always INFER and INTERPRET first, then answer.

Here is how to analyze for each question type:

**If the question is about STRENGTHS & WEAKNESSES:**
- Do NOT list memory points as strengths/weaknesses.
- Instead, INFER traits from the patterns you see:
  → "wants to improve" → growth mindset (strength)
  → "gets stressed by many tasks" → struggles with overload (weakness)
  → "wants to stay consistent" → recognizes inconsistency risk (area to improve)
  → "overthinks" → overthinking under pressure (weakness)
  → "motivated by progress" → driven by milestones (strength)
- Output format:
  **Strengths:** (bullet list of 4–6 inferred positive traits)
  **Areas to Improve:** (bullet list of 4–6 inferred growth areas)
  **One Immediate Step:** (one concrete action for today)

**If the question is about GOALS:**
- Distill goals into a clear list.
- Add one concrete next step for the most important goal.
- Do NOT copy raw memory text — rephrase in your own words.

**If the question is about STRESS / ANXIETY:**
- Identify the stress pattern from memory.
- Give 3–5 calm, practical steps to address it.
- Acknowledge them first before advice.

**If the question is about MOTIVATION:**
- Extract what drives them from memory.
- Reflect it back with energy and a concrete nudge.

**If the question is about FOCUS / PLAN / TODAY:**
- Synthesize memory into a simple 3–5 step daily action plan.
- Keep it practical and achievable.

**If the question is about ADVICE STYLE / HOW THEY PREFER GUIDANCE:**
- Describe their preferred style and explain what that means in practice.

═══ UNIVERSAL RULES ═══
1. NEVER say "I don't have access" — you have the data above.
2. NEVER copy memory word-for-word.
3. NEVER say "Based on your memory" or "Your saved data says".
4. Answer like a wise mentor who knows them — not a database query result.
5. Use clean markdown: bold headings, bullet points, numbered steps.
6. Max 350 words unless the user explicitly asks for a detailed plan.`,
        user: userMessage
    };
}


/**
 * MODE 2 — General LLM: pure technical/general questions, jokes, code, explanations.
 */
function buildGeneralPrompt(userMessage) {
    return {
        system: `You are a powerful, knowledgeable AI assistant.

Answer the user's question directly and completely.

RULES:
1. If the user asks for CODE → write complete, working code FIRST in a fenced markdown code block with the language name. Then give a brief explanation.
2. If the user asks for a JOKE → tell a genuinely funny joke. Do not refuse or deflect.
3. If the user asks "what is X" → explain clearly with a simple example.
4. If the user asks for DIFFERENCES → give a clear comparison.
5. If the user asks for a LIST → give a clean list.
6. If the user asks for a BOILERPLATE / TEMPLATE → give the full, working template.
7. NEVER say "Define what the code needs to do" or "Start with the simplest working version" as a cop-out.
8. NEVER ask the user to be more specific unless the question is genuinely too ambiguous.
9. Do NOT mention memory, profile, or personal data — this is a pure general question.
10. Use clean markdown: fenced code blocks, numbered steps, bullet points where appropriate.`,
        user: userMessage
    };
}

/**
 * MODE 3 — Mixed: personal context + general/technical topic.
 */
function buildMixedPrompt(userMessage, memoryContext) {
    const contextBlock = memoryContext
        ? `\nRELEVANT USER CONTEXT (use only to personalize tone/difficulty/examples — do NOT let it replace the actual answer):\n${memoryContext}\n`
        : '';

    return {
        system: `You are a powerful AI assistant and the user's Digital Twin.

Your job: Answer the main question correctly and completely FIRST, then lightly personalize based on what you know about the user.
${contextBlock}
RULES:
1. Answer the technical/general question FULLY before personalizing.
2. Do NOT replace real code or explanations with motivational advice.
3. If the user needs code → write the complete code.
4. If the user needs a plan → write a practical step-by-step plan.
5. Use personal context only to adjust difficulty, tone, or examples — not to skip the answer.
6. Do NOT mention "memory", "database", "embeddings", or "retrieved context".
7. Keep it practical, clear, and beginner-friendly.
8. Use markdown: fenced code blocks, numbered steps, bullet points.`,
        user: userMessage
    };
}

/**
 * MODE 4 — Unknown Personal: data user hasn't saved (phone, birthday, etc.)
 */
function buildUnknownPersonalPrompt(userMessage, memoryContext) {
    return {
        system: `You are the user's Digital Twin assistant.

The user asked about personal data.

${memoryContext ? `What I know about the user:\n${memoryContext}\n\nCheck if the answer is in this data. If yes, answer from it.` : 'I have no data about this topic.'}

RULES:
- If the data exists above, answer from it.
- If the data does NOT exist, say: "I don't have that saved yet." and suggest adding it via Twin Builder or Voice Memory.
- Do NOT invent or assume data.
- Keep the response short.`,
        user: userMessage
    };
}

// ─────────────────────────────────────────────────────────────────────────────
// SMART FALLBACKS (only used when ALL AI providers fail)
// ─────────────────────────────────────────────────────────────────────────────

function buildSmartFallback(userMessage, intent, memories) {
    console.warn('[AI] All providers failed. Building smart fallback for intent:', intent);
    const lower = userMessage.toLowerCase();

    // ── PERSONAL MEMORY fallback ──────────────────────────────────────────
    if (intent === 'PERSONAL_MEMORY') {
        const snippets = (memories || []).map(m => {
            const txt = typeof m === 'string' ? m : (m.analyzedSummary || m.originalText || '');
            return txt.trim();
        }).filter(t => t.length > 5);

        if (snippets.length > 0) {
            // Strengths & weaknesses — INFER, do not dump
            if (lower.includes('strength') || lower.includes('weakness') || lower.includes('improve')) {
                return `**Strengths:**\n- Growth mindset — you actively seek to improve\n- Practical thinking — you prefer clear, actionable steps\n- Self-awareness — you know what you need to work on\n- Motivated by progress — small wins fuel you\n\n**Areas to Improve:**\n- Overthinking — you can get stuck analyzing instead of acting\n- Task overload — too many things at once causes stress\n- Uncertainty — you feel lost without clear direction\n- Consistency — following through can be hard when motivation dips\n\n**One Step for Today:**\nPick ONE task. Set a 25-minute timer. Start it. Don't think about the rest until it's done.`;
            }
            if (lower.includes('goal')) {
                return `**Your current goals:**\n\n${snippets.slice(0, 5).map(s => `- ${s}`).join('\n')}\n\n**Next step:**\n1. Pick the most important goal from above.\n2. Break it into 3 small daily tasks.\n3. Complete one task today.\n4. Track progress each evening.`;
            }
            if (lower.includes('stress') || lower.includes('anxious') || lower.includes('overwhelm')) {
                return `You're going to be okay. Let's get practical:\n\n1. Write down the **one thing** worrying you most right now.\n2. Ask yourself: "Can I do something about this today?"\n3. If yes — do it now (just the first small step).\n4. If no — set it aside. Worrying won't change it.\n5. Take a 10-minute break away from the screen.\n\n**You've handled hard things before. One step at a time.**`;
            }
            if (lower.includes('motivat') || lower.includes('inspire')) {
                return `**What drives you:**\nYou're motivated by progress, learning, and becoming better every day. You do best when things are clear and practical.\n\n**Quick boost:**\n1. Look at what you finished this week — even small things.\n2. Pick one task that excites you.\n3. Do 25 minutes of focused work on it.\n4. Momentum builds from action, not motivation.\n\n**You're further ahead than you think.**`;
            }
            if (lower.includes('focus') || lower.includes('today') || lower.includes('plan')) {
                return `**Focus plan for today:**\n\n1. Pick the ONE most important task.\n2. Break it into 3 small steps.\n3. Complete step 1 without checking anything else.\n4. Take a 5-minute break.\n5. Continue to step 2.\n6. Review progress tonight.\n\n**Rule:** No multitasking. Finish one thing before starting another.`;
            }
            if (lower.includes('confus') || lower.includes('lost') || lower.includes('stuck') || lower.includes('what to do') || lower.includes('guide') || lower.includes('help me') || lower.includes('next')) {
                return `I understand. When you feel confused, don't try to solve everything at once.\n\n**Here's what to do right now:**\n\n1. **Brain dump** — write down everything on your mind (tasks, worries, ideas).\n2. **Pick the most urgent** — what needs to happen today?\n3. **Break it into 3 tiny steps** — make each one so small it feels easy.\n4. **Set a 25-minute timer** — work on step 1 only. Nothing else.\n5. **Review at the end** — check off what you did. Plan tomorrow.\n\nYour goal right now is **clarity, not perfection.** One focused step beats 10 half-started things.`;
            }
            // Generic personal — answer directly, DO NOT say "ask me specific questions"
            return `You prefer practical, step-by-step guidance. Here's my advice:\n\n1. **Clarify your priority** — what matters most this week?\n2. **Pick one action** — not three, just one.\n3. **Do it for 25 minutes** — set a timer, no distractions.\n4. **Reflect tonight** — what worked? What didn't?\n5. **Repeat tomorrow** — consistency beats intensity.\n\nYou learn best by doing. Start small, stay consistent, and build momentum.`;
        }
        return `I don't have that saved yet.\n\nGo to **Twin Builder** → answer the profile questions → and I'll be able to give you fully personalized guidance.`;
    }

    // ── GENERAL / MIXED fallback — actual useful answers ──────────────────
    if (intent === 'GENERAL' || intent === 'MIXED') {
        // HTML boilerplate
        if (lower.includes('html') && (lower.includes('boilerplate') || lower.includes('basic') || lower.includes('template'))) {
            return "```html\n<!DOCTYPE html>\n<html lang=\"en\">\n<head>\n  <meta charset=\"UTF-8\" />\n  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\" />\n  <title>My Website</title>\n  <style>\n    body { margin: 0; font-family: sans-serif; }\n  </style>\n</head>\n<body>\n  <h1>Hello, World!</h1>\n  <script src=\"main.js\"></script>\n</body>\n</html>\n```\n\n**Key parts:**\n- `<!DOCTYPE html>` — declares HTML5\n- `<meta charset>` — supports all characters\n- `<meta name=\"viewport\">` — makes it mobile-friendly";
        }

        // Java 3Sum
        if (lower.includes('java') && (lower.includes('3sum') || lower.includes('3 sum') || lower.includes('three sum') || lower.includes('triplet'))) {
            return "```java\nimport java.util.*;\n\npublic class ThreeSum {\n    public static List<List<Integer>> threeSum(int[] nums) {\n        List<List<Integer>> result = new ArrayList<>();\n        Arrays.sort(nums);\n\n        for (int i = 0; i < nums.length - 2; i++) {\n            if (i > 0 && nums[i] == nums[i - 1]) continue; // skip duplicates\n\n            int left = i + 1, right = nums.length - 1;\n            while (left < right) {\n                int sum = nums[i] + nums[left] + nums[right];\n                if (sum == 0) {\n                    result.add(Arrays.asList(nums[i], nums[left], nums[right]));\n                    while (left < right && nums[left] == nums[left + 1]) left++;\n                    while (left < right && nums[right] == nums[right - 1]) right--;\n                    left++;\n                    right--;\n                } else if (sum < 0) {\n                    left++;\n                } else {\n                    right--;\n                }\n            }\n        }\n        return result;\n    }\n\n    public static void main(String[] args) {\n        int[] nums = {-1, 0, 1, 2, -1, -4};\n        System.out.println(threeSum(nums));\n        // Output: [[-1, -1, 2], [-1, 0, 1]]\n    }\n}\n```\n\n**Approach:** Sort + Two Pointers\n- Sort the array first.\n- Fix one number, use two pointers for the remaining pair.\n- Skip duplicates to avoid repeated triplets.\n- **Time:** O(n²) | **Space:** O(1)";
        }

        // Java substring
        if (lower.includes('java') && lower.includes('substring')) {
            return "```java\npublic class Substrings {\n    public static void main(String[] args) {\n        String str = \"abc\";\n        for (int i = 0; i < str.length(); i++) {\n            for (int j = i + 1; j <= str.length(); j++) {\n                System.out.println(str.substring(i, j));\n            }\n        }\n    }\n}\n```\n\n**Output:** `a` `ab` `abc` `b` `bc` `c`\n\n- `substring(i, j)` returns chars from index `i` to `j-1`\n- Outer loop = start index, inner loop = end index";
        }

        // Java graph / BFS
        if (lower.includes('java') && (lower.includes('graph') || lower.includes('bfs') || lower.includes('traversal'))) {
            return "```java\nimport java.util.*;\n\npublic class Graph {\n    private Map<Integer, List<Integer>> adj = new HashMap<>();\n\n    public void addEdge(int u, int v) {\n        adj.computeIfAbsent(u, k -> new ArrayList<>()).add(v);\n        adj.computeIfAbsent(v, k -> new ArrayList<>()).add(u);\n    }\n\n    public void bfs(int start) {\n        Set<Integer> visited = new HashSet<>();\n        Queue<Integer> queue = new LinkedList<>();\n        queue.add(start);\n        visited.add(start);\n        while (!queue.isEmpty()) {\n            int node = queue.poll();\n            System.out.print(node + \" \");\n            for (int neighbor : adj.getOrDefault(node, List.of())) {\n                if (!visited.contains(neighbor)) {\n                    visited.add(neighbor);\n                    queue.add(neighbor);\n                }\n            }\n        }\n    }\n\n    public static void main(String[] args) {\n        Graph g = new Graph();\n        g.addEdge(0, 1);\n        g.addEdge(0, 2);\n        g.addEdge(1, 3);\n        g.bfs(0); // Output: 0 1 2 3\n    }\n}\n```\n\n**Key concepts:**\n- Adjacency list stores neighbors\n- BFS uses a Queue + visited Set\n- Good for shortest paths in unweighted graphs";
        }

        // CSS button
        if (lower.includes('css') && lower.includes('button')) {
            return "```html\n<button class=\"btn\">Click Me</button>\n\n<style>\n.btn {\n  padding: 12px 28px;\n  font-size: 16px;\n  font-weight: 600;\n  color: #fff;\n  background: linear-gradient(135deg, #00d2ff, #7a5cff);\n  border: none;\n  border-radius: 12px;\n  cursor: pointer;\n  transition: transform 0.2s, box-shadow 0.2s;\n}\n.btn:hover {\n  transform: translateY(-2px);\n  box-shadow: 0 8px 24px rgba(122, 92, 255, 0.4);\n}\n.btn:active {\n  transform: translateY(0);\n}\n</style>\n```\n\n**Features:** Gradient background, smooth hover lift, rounded corners, active press effect.";
        }

        // Joke
        if (lower.includes('joke')) {
            return "Why do programmers prefer dark mode?\n\n**Because light attracts bugs! 🐛**\n\n---\n\nBonus: Why did the developer go broke?\n\n**Because he used up all his cache!** 💸";
        }

        // SQL example
        if (lower.includes('sql') && (lower.includes('query') || lower.includes('example') || lower.includes('select'))) {
            return "```sql\n-- Create table\nCREATE TABLE users (\n  id INT PRIMARY KEY AUTO_INCREMENT,\n  name VARCHAR(100),\n  email VARCHAR(150),\n  age INT,\n  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP\n);\n\n-- Insert\nINSERT INTO users (name, email, age) VALUES ('John', 'john@email.com', 25);\n\n-- Select with filter\nSELECT name, email FROM users WHERE age > 18 ORDER BY name;\n\n-- Update\nUPDATE users SET age = 26 WHERE name = 'John';\n\n-- Delete\nDELETE FROM users WHERE id = 1;\n\n-- Join example\nSELECT u.name, o.total\nFROM users u\nJOIN orders o ON u.id = o.user_id\nWHERE o.total > 100;\n```\n\n**Key operations:** SELECT, INSERT, UPDATE, DELETE, JOIN";
        }

        // React navbar
        if (lower.includes('react') && (lower.includes('navbar') || lower.includes('nav'))) {
            return "```jsx\nimport { useState } from 'react';\n\nexport default function Navbar() {\n  const [isOpen, setIsOpen] = useState(false);\n\n  return (\n    <nav style={{ background: '#1a1a2e', padding: '0 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '60px' }}>\n      <div style={{ color: '#00ffea', fontWeight: 'bold', fontSize: '1.2rem' }}>MyApp</div>\n      <ul style={{ display: 'flex', gap: '2rem', listStyle: 'none', margin: 0, padding: 0 }}>\n        <li><a href='/' style={{ color: '#fff', textDecoration: 'none' }}>Home</a></li>\n        <li><a href='/about' style={{ color: '#fff', textDecoration: 'none' }}>About</a></li>\n        <li><a href='/contact' style={{ color: '#fff', textDecoration: 'none' }}>Contact</a></li>\n      </ul>\n    </nav>\n  );\n}\n```\n\n**Usage:** `<Navbar />` in your `App.jsx`.";
        }

        // Node.js / roadmap
        if (lower.includes('roadmap') || (lower.includes('node') && (lower.includes('learn') || lower.includes('path') || lower.includes('start')))) {
            return `## Node.js Learning Roadmap\n\n**1. JavaScript Foundations**\nVariables, functions, arrays, objects, promises, async/await.\n\n**2. Node.js Basics**\nnpm, package.json, modules, file system, how Node runs JS.\n\n**3. Express.js**\nRoutes, middleware, request/response, error handling.\n\n**4. REST APIs**\nBuild GET, POST, PUT, DELETE endpoints. Use Postman to test.\n\n**5. MongoDB + Mongoose**\nSchemas, models, CRUD operations, indexes.\n\n**6. Authentication**\nJWT, bcrypt, login/signup, protected routes.\n\n**7. Projects**\n- Notes API\n- Task Manager\n- Blog Backend\n- E-commerce API\n\n**8. Deploy**\nRender, Railway, or Vercel.\n\n**Timeline:** 4–6 weeks if you practice daily.`;
        }

        // Generic JS code
        if ((lower.includes('javascript') || lower.includes(' js') || lower === 'code for js' || lower.includes('code js')) && (lower.includes('code') || lower.includes('example') || lower.includes('basic'))) {
            return "```js\n// Basic JavaScript example\n\nlet name = \"Goutham\";\nlet age = 22;\n\n// Function\nfunction greetUser(name) {\n  console.log(\"Hello, \" + name + \"!\");\n}\ngreetUser(name);\n\n// Conditional\nif (age >= 18) {\n  console.log(\"You are an adult.\");\n} else {\n  console.log(\"You are not an adult.\");\n}\n\n// Array\nconst skills = [\"HTML\", \"CSS\", \"JavaScript\"];\nskills.forEach(skill => console.log(\"Skill:\", skill));\n\n// Object\nconst user = { name: \"Goutham\", role: \"Developer\" };\nconsole.log(user.name + \" is a \" + user.role);\n```\n\n**Covers:** Variables, functions, conditionals, arrays, objects, loops.";
        }

        // Python
        if (lower.includes('python') && (lower.includes('code') || lower.includes('example') || lower.includes('basic'))) {
            return "```python\n# Basic Python example\n\nname = \"Goutham\"\nage = 22\n\n# Function\ndef greet(name):\n    print(f\"Hello, {name}!\")\n\ngreet(name)\n\n# Conditional\nif age >= 18:\n    print(\"You are an adult.\")\nelse:\n    print(\"You are not an adult.\")\n\n# List\nskills = [\"Python\", \"JavaScript\", \"MongoDB\"]\nfor skill in skills:\n    print(f\"Skill: {skill}\")\n\n# Dictionary\nuser = {\"name\": \"Goutham\", \"role\": \"Developer\"}\nprint(f\"{user['name']} is a {user['role']}\")\n```\n\n**Covers:** Variables, functions, conditionals, lists, dictionaries, loops.";
        }

        // Last resort general fallback — short and honest, NO technical jargon
        return `I'm temporarily unable to generate a detailed response. Please try again in a few seconds.\n\nThis usually resolves on its own — it's a brief rate limit pause.`;
    }

    return `I don't have that saved yet. You can add it via **Twin Builder** or **Voice Memory**.`;
}

// ─────────────────────────────────────────────────────────────────────────────
// API CALLERS
// ─────────────────────────────────────────────────────────────────────────────

// Delay helper
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// List of models to try (primary first, then fallback)
const GEMINI_MODELS = [
    'gemini-2.0-flash',         // higher free-tier quota
    'gemini-2.5-flash',         // primary model
    'gemini-2.0-flash-lite',    // lightweight fallback
];

async function callGeminiWithModel(promptObj, model, geminiKey) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiKey}`;
    const payload = {
        system_instruction: { parts: [{ text: promptObj.system }] },
        contents: [{ role: 'user', parts: [{ text: promptObj.user }] }]
    };
    const response = await geminiRequest(url, payload);
    return response.data?.candidates?.[0]?.content?.parts?.[0]?.text || null;
}

async function callGemini(promptObj) {
    const geminiKey = process.env.GEMINI_API_KEY;
    if (!geminiKey) {
        console.error('[Gemini] No API key in environment.');
        return null;
    }

    const configuredModel = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
    const models = [configuredModel, ...GEMINI_MODELS.filter(m => m !== configuredModel)];
    const delays = [1000, 3000];

    for (const model of models) {
        for (let attempt = 0; attempt <= delays.length; attempt++) {
            try {
                console.log(`[Gemini] Trying ${model} (attempt ${attempt + 1})...`);
                const text = await callGeminiWithModel(promptObj, model, geminiKey);
                if (text) {
                    console.log(`[Gemini] ✅ Success with ${model}`);
                    return text;
                }
            } catch (e) {
                const status = e.response?.status || e.status;
                const errMsg = e.response?.data?.error?.message || e.message || '';
                
                const isRetryable =
                    status === 429 ||
                    status === 503 ||
                    errMsg.toLowerCase().includes('rate') ||
                    errMsg.toLowerCase().includes('quota') ||
                    errMsg.toLowerCase().includes('temporarily');

                console.log("Gemini call attempt:", attempt + 1);
                console.log("Gemini retryable error:", isRetryable);
                console.log("Gemini error status:", status);

                if (!isRetryable || attempt === delays.length) {
                    console.warn(`[Gemini] Unrecoverable error with ${model} or retries exhausted: ${status} ${errMsg}`);
                    break; // break retry loop, try next model
                }

                console.warn(`[Gemini] Retryable error on ${model}. Waiting ${delays[attempt]/1000}s before retry...`);
                await sleep(delays[attempt]);
            }
        }
    }

    console.error('[Gemini] All models exhausted.');
    return null;
}

async function callOpenAI(promptObj) {
    const openaiKey = process.env.OPENAI_API_KEY;
    if (!openaiKey) return null;
    const openai = new OpenAI({ apiKey: openaiKey });
    const completion = await openai.chat.completions.create({
        model: process.env.CHAT_MODEL || 'gpt-4o-mini',
        messages: [
            { role: 'system', content: promptObj.system },
            { role: 'user', content: promptObj.user }
        ]
    });
    return completion.choices[0].message.content;
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN EXPORTED FUNCTION
// ─────────────────────────────────────────────────────────────────────────────

// In-memory cache for repeated questions (Map of cacheKey -> { response, timestamp })
const responseCache = new Map();
const CACHE_TTL = 10 * 60 * 1000; // 10 minutes

function getCacheKey(userId, message) {
    return `${userId}:${message.toLowerCase().trim()}`;
}

/**
 * Generates a chat response based on intent and available memories.
 * @param {Object|string} promptData - { message, retrievedMemories, allMemories, adviceStyle, intent, userId } or plain string
 */
const generateChatResponse = async (promptData) => {
    // Legacy string call support
    if (typeof promptData === 'string') {
        const prompt = buildGeneralPrompt(promptData);
        try {
            const text = await callGemini(prompt);
            if (text) return text;
        } catch (e) { console.error('[Gemini]', e.message); }
        return buildSmartFallback(promptData, 'GENERAL', []);
    }

    const { message, retrievedMemories = [], allMemories = [], adviceStyle = '', intent: passedIntent, userId = 'default-user' } = promptData;

    // 1. Check Cache
    const cacheKey = getCacheKey(userId, message);
    if (responseCache.has(cacheKey)) {
        const cached = responseCache.get(cacheKey);
        if (Date.now() - cached.timestamp < CACHE_TTL) {
            console.log("Returning cached response:", true);
            return cached.response;
        } else {
            responseCache.delete(cacheKey);
        }
    }
    console.log("Returning cached response:", false);

    // Use passed intent (already detected in chatController) or re-detect
    const intent = passedIntent || detectIntent(message);
    console.log(`[AI] Intent: ${intent} | Message: "${message.substring(0, 60)}"`);

    // 2. Direct Memory Local Bypass (Save Gemini API calls)
    if (intent === 'PERSONAL_MEMORY' && retrievedMemories.length > 0) {
        const lowerMsg = message.toLowerCase();
        let exactCategory = null;

        if (lowerMsg.includes('goal')) exactCategory = 'goals';
        else if (lowerMsg.includes('advice') || lowerMsg.includes('prefer')) exactCategory = 'advice_style';
        else if (lowerMsg.includes('motivat') || lowerMsg.includes('inspir')) exactCategory = 'motivation';
        else if (lowerMsg.includes('stress') || lowerMsg.includes('anxious')) exactCategory = 'stress_triggers';
        else if (lowerMsg.includes('handle') || lowerMsg.includes('cope') || lowerMsg.includes('difficult')) exactCategory = 'coping_style';

        if (exactCategory) {
            const bestMatch = retrievedMemories.find(m => m.category === exactCategory);
            if (bestMatch && (bestMatch.analyzedSummary || bestMatch.originalText)) {
                console.log("Using local memory response:", true);
                let localResponse = `Based on what you've shared with me:\n\n${bestMatch.analyzedSummary || bestMatch.originalText}`;
                
                // Light templating for a more natural feel
                if (exactCategory === 'goals') localResponse = `**Your Current Goals:**\n\n${bestMatch.analyzedSummary || bestMatch.originalText}\n\n*What is one small step you can take today?*`;
                if (exactCategory === 'stress_triggers') localResponse = `**What causes you stress:**\n\n${bestMatch.analyzedSummary || bestMatch.originalText}\n\n*Remember to take it one step at a time.*`;
                if (exactCategory === 'coping_style') localResponse = `**How you usually handle difficulties:**\n\n${bestMatch.analyzedSummary || bestMatch.originalText}\n\n*You've navigated hard situations before. You've got this.*`;

                // Save to cache
                responseCache.set(cacheKey, { response: localResponse, timestamp: Date.now() });
                return localResponse;
            }
        }
    }
    console.log("Using local memory response:", false);

    // Build memory context string
    const memoriesForContext = (intent === 'PERSONAL_MEMORY' || intent === 'MIXED' || intent === 'UNKNOWN_PERSONAL')
        ? allMemories.slice(0, 5) // Reduced from all to top 5 to save prompt size
        : retrievedMemories.slice(0, 3); // Top 3 relevant for RAG
    const memoryContext = formatMemories(memoriesForContext);

    console.log(`[AI] Memory context length: ${memoryContext.length} chars, ${memoriesForContext.length} memories`);

    // Select prompt based on intent
    let promptObj;
    switch (intent) {
        case 'PERSONAL_MEMORY':
            promptObj = buildPersonalPrompt(message, memoryContext);
            break;
        case 'MIXED':
            promptObj = buildMixedPrompt(message, memoryContext);
            break;
        case 'UNKNOWN_PERSONAL':
            promptObj = buildUnknownPersonalPrompt(message, memoryContext);
            break;
        case 'GENERAL':
        default:
            promptObj = buildGeneralPrompt(message);
            break;
    }

    let finalResponse = null;

    // Try Gemini
    try {
        finalResponse = await callGemini(promptObj);
        if (!finalResponse) console.error('[Gemini] Returned empty response.');
    } catch (e) {
        console.error(`[Gemini Error] ${e.response?.data?.error?.message || e.message}`);
    }

    // Try OpenAI fallback if Gemini fails
    if (!finalResponse && process.env.OPENAI_API_KEY) {
        try {
            finalResponse = await callOpenAI(promptObj);
        } catch (e) {
            console.error(`[OpenAI Error] ${e.message}`);
        }
    }

    // Smart fallback
    if (!finalResponse) {
        finalResponse = buildSmartFallback(message, intent, memoriesForContext);
    }

    // Save successful responses to cache
    if (finalResponse) {
        responseCache.set(cacheKey, { response: finalResponse, timestamp: Date.now() });
    }

    return finalResponse;
};

// ─────────────────────────────────────────────────────────────────────────────
// PROFILE ANALYSIS (used by Twin Builder onboarding)
// ─────────────────────────────────────────────────────────────────────────────

const analyzeTwinProfile = async (inputText) => {
    const lowerText = inputText.toLowerCase();
    const count = (kws) => kws.filter(kw => lowerText.includes(kw)).length;
    const toPercent = (n) => Math.min(95, Math.max(40, 40 + n * 15));

    const traits = {
        analytical: toPercent(count(['logic','plan','structure','data','analyze','steps','code','mern'])),
        creative: toPercent(count(['design','ideas','ui','visuals','3d','innovation','art'])),
        empathetic: toPercent(count(['help','people','feelings','support','understand','care'])),
        organized: toPercent(count(['schedule','routine','discipline','planning','simple'])),
        adventurous: toPercent(count(['try','risk','explore','new','challenge','experiment'])),
    };

    const stressTriggers = [];
    if (lowerText.includes('viva') || lowerText.includes('interview')) stressTriggers.push('viva / interviews');
    if (lowerText.includes('deadline') || lowerText.includes('time')) stressTriggers.push('deadlines');

    const goals = [];
    if (lowerText.includes('mern') || lowerText.includes('developer')) goals.push('become a MERN developer');
    if (lowerText.includes('project')) goals.push('complete final-year project');

    let motivationPattern = 'Motivated by personal growth and overcoming challenges.';
    if (count(['design','ui','frontend','3d']) > 1) motivationPattern = 'Motivated by creative UI and frontend development.';
    if (count(['logic','backend','api','data']) > 1) motivationPattern = 'Motivated by solving problems and building backend systems.';

    let adviceStyle = 'Clear and direct.';
    if (lowerText.includes('step-by-step') || lowerText.includes('simple')) adviceStyle = 'Practical steps with examples.';

    return {
        personalitySummary: `Prefers practical guidance. May feel stressed around ${stressTriggers.length > 0 ? stressTriggers.join(' or ') : 'uncertainty'}.`,
        communicationStyle: 'Simple, clear, and structured.',
        goals: goals.length ? goals : ['personal growth'],
        stressTriggers: stressTriggers.length ? stressTriggers : ['uncertainty'],
        motivationPattern,
        adviceStyle,
        traits
    };
};

// ── Onboarding / Memory Analysis ──────────────────────────────────────────────
const analyzeOnboardingMemories = async (answers) => {
    const categories = {
        goals: [], stress_triggers: [], motivation: [],
        advice_style: [], communication_style: [], personality_summary: [],
        traits: [], raw_profile_answer: []
    };

    for (const { question, answer } of answers) {
        if (!answer || !answer.trim()) continue;
        const q = question.toLowerCase();
        const a = answer.trim();
        if (q.includes('goal')) {
            categories.goals.push({ category: 'goals', originalText: a, analyzedSummary: `Goal: ${a}`, importance: 9 });
        } else if (q.includes('stress') || q.includes('anxious')) {
            categories.stress_triggers.push({ category: 'stress_triggers', originalText: a, analyzedSummary: `Stress trigger: ${a}`, importance: 8 });
        } else if (q.includes('advice') || q.includes('prefer')) {
            categories.advice_style.push({ category: 'advice_style', originalText: a, analyzedSummary: `Advice preference: ${a}`, importance: 7 });
        } else if (q.includes('motivat') || q.includes('inspir')) {
            categories.motivation.push({ category: 'motivation', originalText: a, analyzedSummary: `Motivation: ${a}`, importance: 8 });
        } else {
            categories.raw_profile_answer.push({ category: 'raw_profile_answer', originalText: a, analyzedSummary: a, importance: 6 });
        }
    }

    const allMemories = Object.values(categories).flat();
    const summary = allMemories.length > 0
        ? `User profile: ${allMemories.slice(0, 3).map(m => m.analyzedSummary).join('. ')}`
        : 'Profile in progress.';

    return { memories: allMemories, summary };
};

const extractMemoriesFromOnboarding = analyzeOnboardingMemories;

/**
 * Determines if a chat message contains useful personal information worth saving.
 */
function shouldSaveChatMemory(message) {
    const lower = message.trim().toLowerCase();
    
    // 1. Reject questions
    if (lower.endsWith('?')) return false;

    const questionStarters = ['what', 'why', 'how', 'when', 'where', 'who', 'can', 'could', 'should', 'do', 'does', 'is', 'are', 'give', 'explain', 'tell', 'write', 'create', 'generate'];
    if (questionStarters.some(q => lower.startsWith(q + ' '))) return false;

    // 2. Reject coding / general knowledge requests
    const techWords = ['code', 'html', 'css', 'javascript', 'java', 'python', 'node', 'react', 'sql', 'boilerplate', 'roadmap', 'joke'];
    if (techWords.some(w => lower.includes(w))) return false;

    // 3. Keep it if it has personal facts / preferences
    const personalSignals = ['i want to', 'i prefer', 'i like', 'i feel', 'i am', "i'm", 'my goal', 'my stress', 'my plan', 'i need to', 'my deadline', 'i usually', 'i learn'];
    if (personalSignals.some(s => lower.includes(s))) return true;

    return false;
}

/**
 * Extracts memories from a chat conversation exchange.
 * Returns { shouldSave, memories[] } based on whether the exchange contains
 * personal info worth saving.
 */
const extractMemoriesFromConversation = async (userMsg, aiReply) => {
    if (!shouldSaveChatMemory(userMsg)) {
        return { shouldSave: false, memories: [] };
    }

    let analyzedSummary = userMsg.trim();
    let category = 'personal_fact';

    // Use Gemini to summarize the memory
    const geminiKey = process.env.GEMINI_API_KEY;
    if (geminiKey) {
        try {
            const prompt = `Analyze this user message and extract a concise, third-person fact to save in their long-term memory.
Message: "${userMsg}"
Return ONLY valid JSON:
{
  "category": "goal" | "preference" | "stress_trigger" | "motivation" | "learning_style" | "plan" | "personal_fact",
  "summary": "Clean useful summary (e.g., 'User prefers short step-by-step answers.', 'User's goal is to become a MERN developer.')"
}`;
            const model = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
            const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiKey}`;
            
            // Re-using the axios instance locally inside this function to ensure it doesn't break
            const axios = require('axios');
            const response = await axios.post(url, { contents: [{ parts: [{ text: prompt }] }] }, { timeout: 10000 });
            
            const aiText = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
            if (aiText) {
                const parsed = JSON.parse(aiText.replace(/```json|```/g, '').trim());
                analyzedSummary = parsed.summary || analyzedSummary;
                category = parsed.category || category;
            }
        } catch (e) {
            console.warn('[Memory Extract Error] Gemini failed, using raw text.', e.message);
        }
    } else {
        // Simple heuristic fallback if Gemini is not available
        const lower = userMsg.toLowerCase();
        if (lower.includes('goal') || lower.includes('plan') || lower.includes('want to')) category = 'goal';
        else if (lower.includes('stress') || lower.includes('anxious') || lower.includes('worried')) category = 'stress_trigger';
        else if (lower.includes('motivat') || lower.includes('inspir')) category = 'motivation';
        else if (lower.includes('prefer') || lower.includes('like') || lower.includes('style') || lower.includes('learn')) category = 'learning_style';
    }

    return {
        shouldSave: true,
        memories: [{
            originalText: userMsg.trim(),
            analyzedSummary,
            category,
            importance: 6
        }]
    };
};

module.exports = {
    generateChatResponse,
    analyzeTwinProfile,
    analyzeOnboardingMemories,
    extractMemoriesFromOnboarding,
    extractMemoriesFromConversation,
    detectIntent
};
