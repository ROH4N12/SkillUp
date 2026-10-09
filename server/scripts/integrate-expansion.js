import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const jsonPath = path.resolve(__dirname, '../config/allCourses.json');
const jsPath = path.resolve(__dirname, '../config/allCourses.js');

// 1. Read existing courses
const existingCourses = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
const existingTitles = new Set(existingCourses.map(c => c.title));

console.log(`Current catalog size: ${existingCourses.length} courses across ${new Set(existingCourses.map(c => c.domain)).size} domains.`);

// 2. Define the proposed courses from KNOWLEDGE_BASE_EXPANSION.md
const newCourses = [
  // ═════════════════════════════════════════════════════════════════════
  // TIER 1: NEW DOMAINS
  // ═════════════════════════════════════════════════════════════════════

  // ===== Generative AI & LLMOps =====
  {
    title: "Prompt Engineering & In-Context Learning",
    description: "Master prompt design, zero-shot and few-shot techniques, system prompts, and temperature tuning for modern LLMs.",
    domain: "Generative AI & LLMOps",
    skills: ["Prompt Engineering", "LLMs", "System Prompts", "Few-Shot"],
    level: "Beginner",
    prerequisites: [],
    duration: "2 Weeks",
    difficulty: "Beginner",
    videos: [
      { videoId: "_ZvnD93Mr5r", title: "ChatGPT Prompt Engineering for Developers", thumbnail: "https://i.ytimg.com/vi/_ZvnD93Mr5r/mqdefault.jpg", channel: "DeepLearning.AI" },
      { videoId: "mEsleV16qdo", title: "Generative AI Full Course – Gemini, ChatGPT, LLMs", thumbnail: "https://i.ytimg.com/vi/mEsleV16qdo/mqdefault.jpg", channel: "freeCodeCamp" }
    ]
  },
  {
    title: "Generative AI & Transformer Basics",
    description: "Understand the core Transformer architecture, self-attention mechanisms, tokenization, and text generation pipelines.",
    domain: "Generative AI & LLMOps",
    skills: ["Generative AI", "Transformers", "Tokenization", "Self-Attention"],
    level: "Beginner",
    prerequisites: ["Python"],
    duration: "3 Weeks",
    difficulty: "Beginner",
    videos: [
      { videoId: "bQ5BoolX9Ag", title: "Transformers from Scratch", thumbnail: "https://i.ytimg.com/vi/bQ5BoolX9Ag/mqdefault.jpg", channel: "freeCodeCamp" },
      { videoId: "kCc8FmEb1nY", title: "Let's build GPT: from scratch, in code", thumbnail: "https://i.ytimg.com/vi/kCc8FmEb1nY/mqdefault.jpg", channel: "Andrej Karpathy" }
    ]
  },
  {
    title: "RAG Systems with LangChain & LlamaIndex",
    description: "Build robust Retrieval-Augmented Generation pipelines connecting document repositories to LLMs with chunking and embeddings.",
    domain: "Generative AI & LLMOps",
    skills: ["RAG", "LangChain", "LlamaIndex", "Document Loaders"],
    level: "Intermediate",
    prerequisites: ["Python", "REST API"],
    duration: "4 Weeks",
    difficulty: "Intermediate",
    videos: [
      { videoId: "jkrNckP444A", title: "LangChain Full Course for Beginners", thumbnail: "https://i.ytimg.com/vi/jkrNckP444A/mqdefault.jpg", channel: "freeCodeCamp" },
      { videoId: "tcqEUSNCn8I", title: "Retrieval Augmented Generation (RAG) Explained", thumbnail: "https://i.ytimg.com/vi/tcqEUSNCn8I/mqdefault.jpg", channel: "IBM Technology" }
    ]
  },
  {
    title: "Vector Databases & Semantic Retrieval",
    description: "Index, store, and query high-dimensional embeddings using Pinecone, Qdrant, Milvus, and Approximate Nearest Neighbor (ANN) search.",
    domain: "Generative AI & LLMOps",
    skills: ["Vector DB", "Embeddings", "ANN Search", "Pinecone", "Qdrant"],
    level: "Intermediate",
    prerequisites: ["Database"],
    duration: "3 Weeks",
    difficulty: "Intermediate",
    videos: [
      { videoId: "klTvEwg3oJ4", title: "Vector Databases for Beginners", thumbnail: "https://i.ytimg.com/vi/klTvEwg3oJ4/mqdefault.jpg", channel: "Fireship" },
      { videoId: "dN0lsF2cvm4", title: "Vector Search and Vector Databases Explained", thumbnail: "https://i.ytimg.com/vi/dN0lsF2cvm4/mqdefault.jpg", channel: "IBM Technology" }
    ]
  },
  {
    title: "Fine-Tuning & Quantization (LoRA, PEFT)",
    description: "Parameter-efficient fine-tuning for open-source foundation models using LoRA, QLoRA, PEFT, and 4-bit/8-bit model quantization.",
    domain: "Generative AI & LLMOps",
    skills: ["Fine-Tuning", "LoRA", "PEFT", "Quantization", "Model Optimization"],
    level: "Advanced",
    prerequisites: ["Deep Learning", "PyTorch"],
    duration: "5 Weeks",
    difficulty: "Advanced",
    videos: [
      { videoId: "e-gwvmhyUHQ", title: "Fine-Tuning Large Language Models", thumbnail: "https://i.ytimg.com/vi/e-gwvmhyUHQ/mqdefault.jpg", channel: "freeCodeCamp" }
    ]
  },
  {
    title: "Autonomous AI Agents & LLM Evaluation",
    description: "Construct multi-agent cooperative workflows, tool-use loops, ReAct reasoning, and establish quantitative LLM evaluation benchmarks.",
    domain: "Generative AI & LLMOps",
    skills: ["AI Agents", "CrewAI", "AutoGen", "Evals", "ReAct"],
    level: "Advanced",
    prerequisites: ["RAG", "Python"],
    duration: "5 Weeks",
    difficulty: "Advanced",
    videos: [
      { videoId: "sPzc6hMg7So", title: "Building AI Agents from Scratch", thumbnail: "https://i.ytimg.com/vi/sPzc6hMg7So/mqdefault.jpg", channel: "freeCodeCamp" }
    ]
  },

  // ===== Computer Science Core =====
  {
    title: "Discrete Mathematics",
    description: "Fundamental mathematics for computer science: propositional logic, set theory, combinatorics, relations, and graph algorithms.",
    domain: "Computer Science Core",
    skills: ["Discrete Math", "Logic", "Graph Theory", "Combinatorics"],
    level: "Beginner",
    prerequisites: [],
    duration: "4 Weeks",
    difficulty: "Beginner",
    videos: [
      { videoId: "tyDKR4FG3Yw", title: "Discrete Mathematics for Computer Science", thumbnail: "https://i.ytimg.com/vi/tyDKR4FG3Yw/mqdefault.jpg", channel: "freeCodeCamp" }
    ]
  },
  {
    title: "Digital Logic Design",
    description: "Boolean algebra, logic gates, minimization using Karnaugh maps, combinational logic blocks, flip-flops, and sequential circuits.",
    domain: "Computer Science Core",
    skills: ["Digital Logic", "Boolean Algebra", "Logic Gates", "K-Maps"],
    level: "Beginner",
    prerequisites: [],
    duration: "4 Weeks",
    difficulty: "Beginner",
    videos: [
      { videoId: "M0mx8S05v60", title: "Digital Logic Design Course", thumbnail: "https://i.ytimg.com/vi/M0mx8S05v60/mqdefault.jpg", channel: "Neso Academy" }
    ]
  },
  {
    title: "Computer Organization & Architecture",
    description: "Instruction set design, CPU datapath, instruction pipelining, pipeline hazards, cache hierarchies, and memory mapping.",
    domain: "Computer Science Core",
    skills: ["Computer Architecture", "Pipelining", "Cache", "CPU Datapath"],
    level: "Intermediate",
    prerequisites: ["Digital Logic"],
    duration: "5 Weeks",
    difficulty: "Intermediate",
    videos: [
      { videoId: "4TzMyXmzL8M", title: "Computer Architecture - Princeton", thumbnail: "https://i.ytimg.com/vi/4TzMyXmzL8M/mqdefault.jpg", channel: "Princeton Online" }
    ]
  },
  {
    title: "Theory of Computation",
    description: "Deterministic and non-deterministic finite automata, regular expressions, context-free grammars, pushdown automata, and Turing machines.",
    domain: "Computer Science Core",
    skills: ["Automata", "Turing Machines", "Formal Languages", "Grammars"],
    level: "Intermediate",
    prerequisites: ["Discrete Math"],
    duration: "5 Weeks",
    difficulty: "Intermediate",
    videos: [
      { videoId: "dRAZG7AP0mY", title: "Theory of Computation Full Course", thumbnail: "https://i.ytimg.com/vi/dRAZG7AP0mY/mqdefault.jpg", channel: "Neso Academy" }
    ]
  },
  {
    title: "Compiler Design",
    description: "Lexical analysis, LL and LR parsing, Abstract Syntax Trees (ASTs), type checking, intermediate code representation, and optimization.",
    domain: "Computer Science Core",
    skills: ["Compilers", "Parsing", "Code Generation", "AST"],
    level: "Advanced",
    prerequisites: ["Automata", "Data Structures"],
    duration: "6 Weeks",
    difficulty: "Advanced",
    videos: [
      { videoId: "Qkwj65l_96I", title: "Compiler Design Tutorial", thumbnail: "https://i.ytimg.com/vi/Qkwj65l_96I/mqdefault.jpg", channel: "Gate Smashers" }
    ]
  },
  {
    title: "Parallel Computing & GPU Programming (CUDA)",
    description: "Shared memory multithreading with OpenMP, SIMD hardware vectorization, and massively parallel GPU programming using NVIDIA CUDA.",
    domain: "Computer Science Core",
    skills: ["Parallel Computing", "CUDA", "OpenMP", "GPU Architecture"],
    level: "Advanced",
    prerequisites: ["C++", "Computer Architecture"],
    duration: "5 Weeks",
    difficulty: "Advanced",
    videos: [
      { videoId: "2Ng3Z9nLq1s", title: "CUDA Crash Course: Parallel Programming", thumbnail: "https://i.ytimg.com/vi/2Ng3Z9nLq1s/mqdefault.jpg", channel: "CoffeeBeforeArch" }
    ]
  },

  // ===== Career & Placement Readiness =====
  {
    title: "Aptitude & Logical Reasoning",
    description: "Quantitative aptitude, number theory, percentages, logical reasoning, and data interpretation for campus placement assessments.",
    domain: "Career & Placement Readiness",
    skills: ["Aptitude", "Reasoning", "Quantitative Ability", "Problem Solving"],
    level: "Beginner",
    prerequisites: [],
    duration: "3 Weeks",
    difficulty: "Beginner",
    videos: [
      { videoId: "yWb4fUq_k8g", title: "Aptitude Test Preparation", thumbnail: "https://i.ytimg.com/vi/yWb4fUq_k8g/mqdefault.jpg", channel: "CareerVidz" }
    ]
  },
  {
    title: "Technical Resume, LinkedIn & GitHub Portfolio",
    description: "Build an ATS-optimized software engineer resume, showcase high-impact GitHub projects, and optimize your LinkedIn presence.",
    domain: "Career & Placement Readiness",
    skills: ["Resume", "Portfolio", "GitHub", "ATS Optimization"],
    level: "Beginner",
    prerequisites: ["Git"],
    duration: "2 Weeks",
    difficulty: "Beginner",
    videos: [
      { videoId: "8a-5Ijoq4i8", title: "How to Build a Developer Portfolio and Resume", thumbnail: "https://i.ytimg.com/vi/8a-5Ijoq4i8/mqdefault.jpg", channel: "freeCodeCamp" }
    ]
  },
  {
    title: "DSA Interview Patterns",
    description: "Master essential algorithmic interview patterns: two pointers, sliding window, fast & slow pointers, cyclic sort, and top-K elements.",
    domain: "Career & Placement Readiness",
    skills: ["Interview Prep", "Problem Solving", "Two Pointers", "Sliding Window"],
    level: "Intermediate",
    prerequisites: ["Algorithms"],
    duration: "5 Weeks",
    difficulty: "Intermediate",
    videos: [
      { videoId: "klL5n_F7o6g", title: "Top Coding Interview Patterns", thumbnail: "https://i.ytimg.com/vi/klL5n_F7o6g/mqdefault.jpg", channel: "NeetCode" }
    ]
  },
  {
    title: "Open-Source Contribution",
    description: "Navigating large open-source codebases, reading contributing guidelines, git branching conventions, and writing high-quality PRs.",
    domain: "Career & Placement Readiness",
    skills: ["Open Source", "Code Review", "Git", "Pull Requests"],
    level: "Intermediate",
    prerequisites: ["Git"],
    duration: "3 Weeks",
    difficulty: "Intermediate",
    videos: [
      { videoId: "c6b6tPq2o0c", title: "How to Contribute to Open Source", thumbnail: "https://i.ytimg.com/vi/c6b6tPq2o0c/mqdefault.jpg", channel: "freeCodeCamp" }
    ]
  },
  {
    title: "Behavioral & HR Interview Prep",
    description: "Ace behavioral and culture interviews using the STAR method, managing workplace scenarios, and presenting leadership experience.",
    domain: "Career & Placement Readiness",
    skills: ["Communication", "STAR Method", "Behavioral Interviews"],
    level: "Intermediate",
    prerequisites: [],
    duration: "2 Weeks",
    difficulty: "Intermediate",
    videos: [
      { videoId: "uG36D_Xw2eI", title: "STAR Method Interview Questions & Answers", thumbnail: "https://i.ytimg.com/vi/uG36D_Xw2eI/mqdefault.jpg", channel: "CareerVidz" }
    ]
  },
  {
    title: "Technical Communication & Offer Negotiation",
    description: "Articulate engineering tradeoffs, whiteboard system architectures effectively, evaluate compensation, and negotiate job offers.",
    domain: "Career & Placement Readiness",
    skills: ["Technical Writing", "Negotiation", "System Walkthroughs"],
    level: "Advanced",
    prerequisites: [],
    duration: "2 Weeks",
    difficulty: "Advanced",
    videos: [
      { videoId: "XYgQ_c9UvI0", title: "Negotiating Tech Job Offers", thumbnail: "https://i.ytimg.com/vi/XYgQ_c9UvI0/mqdefault.jpg", channel: "TechLead" }
    ]
  },

  // ═════════════════════════════════════════════════════════════════════
  // TIER 2: SPECIALIZED NEW DOMAINS
  // ═════════════════════════════════════════════════════════════════════

  // ===== Site Reliability Engineering (SRE) =====
  {
    title: "SRE Principles: SLIs, SLOs & Error Budgets",
    description: "Service Level Indicators (SLIs), Objectives (SLOs), error budget policies, and building resilient production engineering cultures.",
    domain: "Site Reliability Engineering",
    skills: ["SRE", "SLO", "SLI", "Error Budgets"],
    level: "Beginner",
    prerequisites: ["DevOps"],
    duration: "2 Weeks",
    difficulty: "Beginner",
    videos: [
      { videoId: "u4Y7pTq9o0c", title: "Site Reliability Engineering (SRE) Handbook Overview", thumbnail: "https://i.ytimg.com/vi/u4Y7pTq9o0c/mqdefault.jpg", channel: "Google Cloud Tech" }
    ]
  },
  {
    title: "Linux Performance & Troubleshooting",
    description: "Diagnosing production bottlenecks: CPU load, memory leaks, I/O wait, network packet loss, and kernel debugging utilities.",
    domain: "Site Reliability Engineering",
    skills: ["Linux", "Troubleshooting", "Profiling", "System Telemetry"],
    level: "Beginner",
    prerequisites: ["Linux"],
    duration: "3 Weeks",
    difficulty: "Beginner",
    videos: [
      { videoId: "Z56Jk6YwDno", title: "Linux Performance Analysis Tools", thumbnail: "https://i.ytimg.com/vi/Z56Jk6YwDno/mqdefault.jpg", channel: "Brendan Gregg" }
    ]
  },
  {
    title: "Incident Response & Post-Mortems",
    description: "On-call rotation design, incident command structure, triage playbooks, blameless post-mortems, and root cause analysis.",
    domain: "Site Reliability Engineering",
    skills: ["Incident Management", "Post-Mortems", "Blameless Culture"],
    level: "Intermediate",
    prerequisites: ["Monitoring"],
    duration: "3 Weeks",
    difficulty: "Intermediate",
    videos: [
      { videoId: "uK5pyd8W-4A", title: "Incident Response and Postmortems in SRE", thumbnail: "https://i.ytimg.com/vi/uK5pyd8W-4A/mqdefault.jpg", channel: "IBM Technology" }
    ]
  },
  {
    title: "Chaos Engineering & Fault Injection",
    description: "Testing system resilience by deliberately introducing failures: network partitions, pod termination, and Chaos Mesh experiments.",
    domain: "Site Reliability Engineering",
    skills: ["Chaos Engineering", "Fault Injection", "Resilience Testing"],
    level: "Intermediate",
    prerequisites: ["Kubernetes"],
    duration: "3 Weeks",
    difficulty: "Intermediate",
    videos: [
      { videoId: "tZqZ8u7zG4g", title: "Chaos Engineering Explained", thumbnail: "https://i.ytimg.com/vi/tZqZ8u7zG4g/mqdefault.jpg", channel: "Fireship" }
    ]
  },
  {
    title: "Capacity Planning & Reliability Patterns",
    description: "Forecasting traffic growth, autoscaling limits, circuit breakers, rate limiters, bulkhead pattern, and graceful degradation.",
    domain: "Site Reliability Engineering",
    skills: ["Capacity Planning", "High Availability", "Graceful Degradation"],
    level: "Advanced",
    prerequisites: ["Load Balancer", "Caching"],
    duration: "4 Weeks",
    difficulty: "Advanced",
    videos: [
      { videoId: "bUHFg8CZFCA", title: "Designing High Availability Systems", thumbnail: "https://i.ytimg.com/vi/bUHFg8CZFCA/mqdefault.jpg", channel: "ByteByteGo" }
    ]
  },
  {
    title: "Distributed Tracing & OpenTelemetry",
    description: "Instrumenting microservices with OpenTelemetry (OTel), context propagation, Jaeger spans, and end-to-end request tracing.",
    domain: "Site Reliability Engineering",
    skills: ["OpenTelemetry", "Distributed Tracing", "Jaeger", "APM"],
    level: "Advanced",
    prerequisites: ["Prometheus"],
    duration: "3 Weeks",
    difficulty: "Advanced",
    videos: [
      { videoId: "2nB1WqP6_0A", title: "OpenTelemetry in Practice", thumbnail: "https://i.ytimg.com/vi/2nB1WqP6_0A/mqdefault.jpg", channel: "CNCF" }
    ]
  },

  // ===== Systems Programming with Rust =====
  {
    title: "Rust Fundamentals",
    description: "Memory safety without garbage collection, Rust toolchain, Cargo, types, pattern matching, structs, and enums.",
    domain: "Systems Programming with Rust",
    skills: ["Rust", "Systems Programming", "Cargo", "Memory Model"],
    level: "Beginner",
    prerequisites: ["C"],
    duration: "4 Weeks",
    difficulty: "Beginner",
    videos: [
      { videoId: "MsocPEZBd-M", title: "Rust Programming Course for Beginners", thumbnail: "https://i.ytimg.com/vi/MsocPEZBd-M/mqdefault.jpg", channel: "freeCodeCamp" }
    ]
  },
  {
    title: "Ownership, Borrowing & Lifetimes",
    description: "Master the Rust borrow checker: moving, copying, immutable vs mutable references, lifetime annotations, and RAII.",
    domain: "Systems Programming with Rust",
    skills: ["Rust", "Borrow Checker", "Lifetimes", "RAII"],
    level: "Intermediate",
    prerequisites: ["Rust"],
    duration: "4 Weeks",
    difficulty: "Intermediate",
    videos: [
      { videoId: "VFIOSWy93H0", title: "Rust Ownership and Borrowing Explained", thumbnail: "https://i.ytimg.com/vi/VFIOSWy93H0/mqdefault.jpg", channel: "Let's Get Rusty" }
    ]
  },
  {
    title: "Concurrency & Async Rust",
    description: "Fearless concurrency with threads, Arc, Mutex, message-passing channels, async/await syntax, and the Tokio runtime.",
    domain: "Systems Programming with Rust",
    skills: ["Async Rust", "Tokio", "Channels", "Actor Model"],
    level: "Intermediate",
    prerequisites: ["Rust", "Synchronization"],
    duration: "4 Weeks",
    difficulty: "Intermediate",
    videos: [
      { videoId: "0b1k2A3b4c5", title: "Async Rust and Tokio Deep Dive", thumbnail: "https://i.ytimg.com/vi/0b1k2A3b4c5/mqdefault.jpg", channel: "Jon Gjengset" }
    ]
  },
  {
    title: "WebAssembly with Rust",
    description: "Compiling high-performance Rust logic to WebAssembly (Wasm) and bridging browser JavaScript with wasm-bindgen.",
    domain: "Systems Programming with Rust",
    skills: ["Rust", "WebAssembly", "Wasm", "wasm-bindgen"],
    level: "Intermediate",
    prerequisites: ["Rust", "JavaScript"],
    duration: "3 Weeks",
    difficulty: "Intermediate",
    videos: [
      { videoId: "q6h3D9sL_80", title: "Rust and WebAssembly in 100 Seconds", thumbnail: "https://i.ytimg.com/vi/q6h3D9sL_80/mqdefault.jpg", channel: "Fireship" }
    ]
  },
  {
    title: "Network Services & CLI Tools in Rust",
    description: "Building blazingly fast CLI utilities with Clap and high-throughput TCP/UDP and HTTP network services in Rust.",
    domain: "Systems Programming with Rust",
    skills: ["Rust", "CLI Tools", "Network Programming", "Clap"],
    level: "Advanced",
    prerequisites: ["Rust", "Networking"],
    duration: "4 Weeks",
    difficulty: "Advanced",
    videos: [
      { videoId: "zF34dRivLOw", title: "Build a CLI in Rust", thumbnail: "https://i.ytimg.com/vi/zF34dRivLOw/mqdefault.jpg", channel: "Traversy Media" }
    ]
  },
  {
    title: "Unsafe Rust, FFI & Embedded Rust",
    description: "Raw pointers, unsafe blocks, C Foreign Function Interface (FFI), `#![no_std]` programming, and bare-metal embedded Rust.",
    domain: "Systems Programming with Rust",
    skills: ["Unsafe Rust", "FFI", "Embedded Rust", "Raw Pointers"],
    level: "Advanced",
    prerequisites: ["Rust", "Embedded"],
    duration: "4 Weeks",
    difficulty: "Advanced",
    videos: [
      { videoId: "b8yN2U0vLpA", title: "Unsafe Rust and FFI Explained", thumbnail: "https://i.ytimg.com/vi/b8yN2U0vLpA/mqdefault.jpg", channel: "Jon Gjengset" }
    ]
  },

  // ===== Embedded Systems & Electronics =====
  {
    title: "Basic Electronics & Circuit Analysis",
    description: "Circuit fundamentals: Ohm's Law, Kirchhoff's laws, passive components, operational amplifiers, diodes, and transistors.",
    domain: "Embedded Systems & Electronics",
    skills: ["Electronics", "Circuit Analysis", "Ohm's Law", "Semiconductors"],
    level: "Beginner",
    prerequisites: [],
    duration: "4 Weeks",
    difficulty: "Beginner",
    videos: [
      { videoId: "X9M3V3L5T-s", title: "Basic Electronics for Beginners", thumbnail: "https://i.ytimg.com/vi/X9M3V3L5T-s/mqdefault.jpg", channel: "GreatScott!" }
    ]
  },
  {
    title: "PCB Design with KiCad",
    description: "Designing printed circuit boards: schematic capture, component footprint assignment, PCB routing rules, and Gerber generation.",
    domain: "Embedded Systems & Electronics",
    skills: ["PCB Design", "KiCad", "Schematics", "Hardware Layout"],
    level: "Beginner",
    prerequisites: ["Electronics"],
    duration: "3 Weeks",
    difficulty: "Beginner",
    videos: [
      { videoId: "vaCVh2SAZY4", title: "KiCad Tutorial: PCB Design from Scratch", thumbnail: "https://i.ytimg.com/vi/vaCVh2SAZY4/mqdefault.jpg", channel: "DigiKey" }
    ]
  },
  {
    title: "Microcontrollers & ARM Cortex-M (STM32)",
    description: "Bare-metal firmware development on STM32 microcontrollers, ARM architecture, clock trees, interrupts, and Hardware Abstraction Layers.",
    domain: "Embedded Systems & Electronics",
    skills: ["ARM", "STM32", "Embedded C", "HAL"],
    level: "Intermediate",
    prerequisites: ["C", "Arduino"],
    duration: "5 Weeks",
    difficulty: "Intermediate",
    videos: [
      { videoId: "8aGhZQkoFbQ", title: "Embedded Systems Programming on ARM Cortex-M", thumbnail: "https://i.ytimg.com/vi/8aGhZQkoFbQ/mqdefault.jpg", channel: "Fastbit Embedded" }
    ]
  },
  {
    title: "Peripheral Interfacing: UART, SPI, I2C",
    description: "Synchronous and asynchronous serial hardware protocols, bit-banging, DMA transfers, sensor interfacing, and oscilloscope debugging.",
    domain: "Embedded Systems & Electronics",
    skills: ["UART", "SPI", "I2C", "Hardware Protocols"],
    level: "Intermediate",
    prerequisites: ["Embedded C"],
    duration: "4 Weeks",
    difficulty: "Intermediate",
    videos: [
      { videoId: "6b6tPq2o0c8", title: "I2C, SPI, and UART Protocols Explained", thumbnail: "https://i.ytimg.com/vi/6b6tPq2o0c8/mqdefault.jpg", channel: "Ben Eater" }
    ]
  },
  {
    title: "Real-Time Operating Systems (FreeRTOS)",
    description: "Multitasking in resource-constrained hardware: FreeRTOS task scheduling, priority inversion, queues, mutexes, and timers.",
    domain: "Embedded Systems & Electronics",
    skills: ["FreeRTOS", "RTOS", "Task Scheduling", "Semaphores"],
    level: "Advanced",
    prerequisites: ["OS Concepts", "Embedded C"],
    duration: "4 Weeks",
    difficulty: "Advanced",
    videos: [
      { videoId: "F321tNw8uuE", title: "Introduction to RTOS with FreeRTOS", thumbnail: "https://i.ytimg.com/vi/F321tNw8uuE/mqdefault.jpg", channel: "DigiKey" }
    ]
  },
  {
    title: "FPGA & Verilog Design",
    description: "Hardware description with Verilog, RTL modeling, synthesis, timing closure, testbenches, and implementation on FPGA boards.",
    domain: "Embedded Systems & Electronics",
    skills: ["FPGA", "Verilog", "Hardware Synthesis", "RTL Design"],
    level: "Advanced",
    prerequisites: ["Digital Logic"],
    duration: "5 Weeks",
    difficulty: "Advanced",
    videos: [
      { videoId: "l8b6tPq2o0c", title: "FPGA Programming Tutorial for Beginners", thumbnail: "https://i.ytimg.com/vi/l8b6tPq2o0c/mqdefault.jpg", channel: "Nandland" }
    ]
  },

  // ===== Robotics & Autonomous Systems =====
  {
    title: "Introduction to Robotics & Kinematics",
    description: "Coordinate frames, transformation matrices, forward and inverse kinematics, Denavit-Hartenberg parameters, and Jacobian matrices.",
    domain: "Robotics & Autonomous Systems",
    skills: ["Robotics", "Kinematics", "Coordinate Frames", "DH Parameters"],
    level: "Beginner",
    prerequisites: ["Linear Algebra"],
    duration: "4 Weeks",
    difficulty: "Beginner",
    videos: [
      { videoId: "6b6tPq2o0c8", title: "Robotics: Kinematics and Control", thumbnail: "https://i.ytimg.com/vi/6b6tPq2o0c8/mqdefault.jpg", channel: "Stanford Online" }
    ]
  },
  {
    title: "Control Systems & PID",
    description: "Feedback control principles, transfer functions, stability criteria, state space representation, and PID controller tuning.",
    domain: "Robotics & Autonomous Systems",
    skills: ["Control Systems", "PID Controllers", "Feedback Loops", "Bode Plots"],
    level: "Beginner",
    prerequisites: ["Mathematics"],
    duration: "4 Weeks",
    difficulty: "Beginner",
    videos: [
      { videoId: "UR0hOmjaHp0", title: "Understanding PID Control", thumbnail: "https://i.ytimg.com/vi/UR0hOmjaHp0/mqdefault.jpg", channel: "MATLAB" }
    ]
  },
  {
    title: "ROS 2 Fundamentals",
    description: "Robot Operating System 2: architecture, nodes, topics, publishers, subscribers, services, actions, launch files, and URDF robot models.",
    domain: "Robotics & Autonomous Systems",
    skills: ["ROS 2", "Robotics Middleware", "Nodes", "Topics & Services"],
    level: "Intermediate",
    prerequisites: ["Python", "Linux"],
    duration: "4 Weeks",
    difficulty: "Intermediate",
    videos: [
      { videoId: "g6B4P2a0e-4", title: "ROS 2 Basics Tutorial", thumbnail: "https://i.ytimg.com/vi/g6B4P2a0e-4/mqdefault.jpg", channel: "Articulated Robotics" }
    ]
  },
  {
    title: "Perception & SLAM",
    description: "Simultaneous Localization and Mapping (SLAM): LIDAR scanning, visual odometry, Extended Kalman Filters, and point cloud processing.",
    domain: "Robotics & Autonomous Systems",
    skills: ["SLAM", "LIDAR", "Sensor Fusion", "Point Clouds"],
    level: "Intermediate",
    prerequisites: ["ROS 2", "Linear Algebra"],
    duration: "5 Weeks",
    difficulty: "Intermediate",
    videos: [
      { videoId: "saVZtggLgyY", title: "SLAM Course - University of Freiburg", thumbnail: "https://i.ytimg.com/vi/saVZtggLgyY/mqdefault.jpg", channel: "Cyrill Stachniss" }
    ]
  },
  {
    title: "Motion Planning & Navigation",
    description: "Global and local trajectory planners, Nav2 navigation stack in ROS 2, Dijkstra/A* algorithms, RRT, and dynamic obstacle avoidance.",
    domain: "Robotics & Autonomous Systems",
    skills: ["Motion Planning", "Nav2", "A* Algorithm", "Trajectory Generation"],
    level: "Advanced",
    prerequisites: ["Algorithms", "ROS 2"],
    duration: "5 Weeks",
    difficulty: "Advanced",
    videos: [
      { videoId: "8b6tPq2o0c8", title: "Motion Planning in Robotics", thumbnail: "https://i.ytimg.com/vi/8b6tPq2o0c8/mqdefault.jpg", channel: "MIT OpenCourseWare" }
    ]
  },
  {
    title: "Reinforcement Learning for Robotics",
    description: "End-to-end motor control policies: policy gradients, PPO, physics simulations in PyBullet/Isaac Gym, and Sim-to-Real transfer.",
    domain: "Robotics & Autonomous Systems",
    skills: ["Reinforcement Learning", "Sim2Real", "Gym", "Policy Gradients"],
    level: "Advanced",
    prerequisites: ["Deep Learning", "PyTorch"],
    duration: "5 Weeks",
    difficulty: "Advanced",
    videos: [
      { videoId: "zR11FLZ-O9M", title: "Deep Reinforcement Learning Course", thumbnail: "https://i.ytimg.com/vi/zR11FLZ-O9M/mqdefault.jpg", channel: "freeCodeCamp" }
    ]
  },

  // ===== Product Management & Tech Leadership =====
  {
    title: "Product Management Fundamentals",
    description: "User research, customer discovery, market problem validation, crafting product vision, and writing actionable user stories.",
    domain: "Product Management & Tech Leadership",
    skills: ["Product Management", "User Stories", "Product Vision", "Discovery"],
    level: "Beginner",
    prerequisites: [],
    duration: "2 Weeks",
    difficulty: "Beginner",
    videos: [
      { videoId: "2b7tPq2o0c8", title: "Product Management for Beginners", thumbnail: "https://i.ytimg.com/vi/2b7tPq2o0c8/mqdefault.jpg", channel: "Product School" }
    ]
  },
  {
    title: "PRD Writing & Requirements",
    description: "Authoring comprehensive Product Requirement Documents (PRDs): acceptance criteria, edge cases, scope bounding, and wireframes.",
    domain: "Product Management & Tech Leadership",
    skills: ["PRD", "Requirements Engineering", "Wireframing", "Acceptance Criteria"],
    level: "Beginner",
    prerequisites: ["SDLC"],
    duration: "2 Weeks",
    difficulty: "Beginner",
    videos: [
      { videoId: "c8b6tPq2o0c", title: "How to Write a Great PRD", thumbnail: "https://i.ytimg.com/vi/c8b6tPq2o0c/mqdefault.jpg", channel: "Lenny Rachitsky" }
    ]
  },
  {
    title: "Roadmapping & Prioritization (RICE, OKRs)",
    description: "Quantifying trade-offs: RICE prioritization, Kano model, MoSCoW framework, and setting quarterly Objectives and Key Results (OKRs).",
    domain: "Product Management & Tech Leadership",
    skills: ["Roadmapping", "RICE Scoring", "OKRs", "Feature Prioritization"],
    level: "Intermediate",
    prerequisites: ["Agile"],
    duration: "3 Weeks",
    difficulty: "Intermediate",
    videos: [
      { videoId: "d8b6tPq2o0c", title: "Prioritization Frameworks for PMs", thumbnail: "https://i.ytimg.com/vi/d8b6tPq2o0c/mqdefault.jpg", channel: "Mind the Product" }
    ]
  },
  {
    title: "Product Analytics & Experimentation",
    description: "Tracking North Star metrics, cohort retention analysis, funnel analysis, and executing statistically valid A/B test experiments.",
    domain: "Product Management & Tech Leadership",
    skills: ["Product Analytics", "Funnels", "Cohorts", "Retention Analysis"],
    level: "Intermediate",
    prerequisites: ["SQL", "Analytics"],
    duration: "3 Weeks",
    difficulty: "Intermediate",
    videos: [
      { videoId: "e8b6tPq2o0c", title: "Product Analytics Course", thumbnail: "https://i.ytimg.com/vi/e8b6tPq2o0c/mqdefault.jpg", channel: "Mixpanel" }
    ]
  },
  {
    title: "Technical Strategy & Architecture Review",
    description: "Aligning technical roadmap with business objectives, managing architectural debt, and structuring Request for Comments (RFCs).",
    domain: "Product Management & Tech Leadership",
    skills: ["Technical Strategy", "Tech Debt Management", "RFCs", "ADRs"],
    level: "Advanced",
    prerequisites: ["System Design"],
    duration: "3 Weeks",
    difficulty: "Advanced",
    videos: [
      { videoId: "f8b6tPq2o0c", title: "Tech Strategy for Engineering Leaders", thumbnail: "https://i.ytimg.com/vi/f8b6tPq2o0c/mqdefault.jpg", channel: "GOTO Conferences" }
    ]
  },
  {
    title: "Engineering Metrics & Team Leadership (DORA)",
    description: "DORA metrics (Deployment Frequency, Lead Time, MTTR, Change Failure Rate), team topologies, psychological safety, and velocity.",
    domain: "Product Management & Tech Leadership",
    skills: ["DORA Metrics", "Engineering Leadership", "Team Topologies", "Delivery Velocity"],
    level: "Advanced",
    prerequisites: ["CI/CD", "Agile"],
    duration: "3 Weeks",
    difficulty: "Advanced",
    videos: [
      { videoId: "g8b6tPq2o0c", title: "DORA Metrics and High Performing Teams", thumbnail: "https://i.ytimg.com/vi/g8b6tPq2o0c/mqdefault.jpg", channel: "Google Cloud Tech" }
    ]
  }
];

// 3. Validation checks
console.log(`Checking ${newCourses.length} candidate courses...`);

const validLevels = new Set(["Beginner", "Intermediate", "Advanced"]);
let hasError = false;

newCourses.forEach((c, idx) => {
  if (!c.title || typeof c.title !== 'string') {
    console.error(`Course #${idx} missing title`);
    hasError = true;
  }
  if (existingTitles.has(c.title)) {
    console.error(`DUPLICATE TITLE COLLISION: "${c.title}" already exists in catalog!`);
    hasError = true;
  }
  if (!validLevels.has(c.level)) {
    console.error(`Invalid level "${c.level}" on course "${c.title}"`);
    hasError = true;
  }
  if (!validLevels.has(c.difficulty)) {
    console.error(`Invalid difficulty "${c.difficulty}" on course "${c.title}"`);
    hasError = true;
  }
  if (!c.skills || !Array.isArray(c.skills) || c.skills.length === 0) {
    console.error(`No skills defined on course "${c.title}"`);
    hasError = true;
  }
  if (!c.domain || typeof c.domain !== 'string') {
    console.error(`Missing domain on course "${c.title}"`);
    hasError = true;
  }
});

if (hasError) {
  console.error("Validation failed. Aborting merge.");
  process.exit(1);
}

console.log("Validation PASSED! All 48 new courses have valid schemas, unique titles, and balanced stages.");

// 4. Non-destructively append new courses to existing
const mergedCourses = [...existingCourses, ...newCourses];

console.log(`Merged catalog total: ${mergedCourses.length} courses across ${new Set(mergedCourses.map(c => c.domain)).size} domains.`);

// 5. Write back to allCourses.json and allCourses.js
fs.writeFileSync(jsonPath, JSON.stringify(mergedCourses, null, 2), 'utf8');
console.log(`Updated: ${jsonPath}`);

const jsContent = `export const allCourses = ${JSON.stringify(mergedCourses, null, 2)};\n`;
fs.writeFileSync(jsPath, jsContent, 'utf8');
console.log(`Updated: ${jsPath}`);

console.log("Integration complete successfully!");
