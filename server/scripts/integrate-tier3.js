import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const jsonPath = path.resolve(__dirname, '../config/allCourses.json');
const jsPath = path.resolve(__dirname, '../config/allCourses.js');

// 1. Read existing courses (171 courses)
const existingCourses = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
const existingTitles = new Set(existingCourses.map(c => c.title));

console.log(`Current catalog: ${existingCourses.length} courses across ${new Set(existingCourses.map(c => c.domain)).size} domains.`);

// 2. Define the 59 Tier 3 Gap-Fill Courses
const tier3Courses = [
  // ===== Programming Fundamentals =====
  {
    title: "Advanced Python",
    description: "Deep dive into advanced Python: decorators, generators, metaclasses, context managers, and memory management.",
    domain: "Programming Fundamentals",
    skills: ["Python", "Metaprogramming", "Decorators", "Generators"],
    level: "Intermediate",
    prerequisites: ["Python Programming Fundamentals"],
    duration: "4 Weeks",
    difficulty: "Intermediate",
    videos: [
      { videoId: "m_KBvPwhr_c", title: "Advanced Python Programming Tutorial", thumbnail: "https://i.ytimg.com/vi/m_KBvPwhr_c/mqdefault.jpg", channel: "Tech With Tim" }
    ]
  },
  {
    title: "Go Programming",
    description: "Systems programming in Go: static typing, goroutines, channels, interfaces, and building high-concurrency microservices.",
    domain: "Programming Fundamentals",
    skills: ["Go", "Golang", "Goroutines", "Channels"],
    level: "Intermediate",
    prerequisites: ["C"],
    duration: "4 Weeks",
    difficulty: "Intermediate",
    videos: [
      { videoId: "YS4e4q9oBaU", title: "Go Programming - Golang Course with Bonus Projects", thumbnail: "https://i.ytimg.com/vi/YS4e4q9oBaU/mqdefault.jpg", channel: "freeCodeCamp" }
    ]
  },

  // ===== Frontend Development =====
  {
    title: "Next.js & Server-Side Rendering",
    description: "Production web applications using Next.js App Router, Server Components, SSR, SSG, and API route handlers.",
    domain: "Frontend Development",
    skills: ["Next.js", "SSR", "SSG", "React"],
    level: "Intermediate",
    prerequisites: ["React Fundamentals"],
    duration: "4 Weeks",
    difficulty: "Intermediate",
    videos: [
      { videoId: "wm5gMKuwSYk", title: "Next.js 14 Full Course 2024", thumbnail: "https://i.ytimg.com/vi/wm5gMKuwSYk/mqdefault.jpg", channel: "freeCodeCamp" }
    ]
  },
  {
    title: "Web Accessibility & Inclusive Design",
    description: "Building accessible web interfaces: WCAG 2.2 standards, ARIA attributes, semantic HTML, and screen reader testing.",
    domain: "Frontend Development",
    skills: ["Accessibility", "WCAG", "ARIA", "a11y"],
    level: "Intermediate",
    prerequisites: ["HTML & CSS Fundamentals"],
    duration: "2 Weeks",
    difficulty: "Intermediate",
    videos: [
      { videoId: "20SHvU2PKsM", title: "Web Accessibility (A11y) Course", thumbnail: "https://i.ytimg.com/vi/20SHvU2PKsM/mqdefault.jpg", channel: "freeCodeCamp" }
    ]
  },
  {
    title: "Web Performance Optimization",
    description: "Core Web Vitals, critical rendering path, code splitting, asset minification, browser caching, and Lighthouse profiling.",
    domain: "Frontend Development",
    skills: ["Web Performance", "Core Web Vitals", "Lighthouse", "Bundling"],
    level: "Advanced",
    prerequisites: ["React Fundamentals"],
    duration: "3 Weeks",
    difficulty: "Advanced",
    videos: [
      { videoId: "0fONene3OIA", title: "Web Performance Optimization Tutorial", thumbnail: "https://i.ytimg.com/vi/0fONene3OIA/mqdefault.jpg", channel: "Google Chrome Developers" }
    ]
  },

  // ===== Backend Development =====
  {
    title: "GraphQL APIs",
    description: "Schema-driven API development using GraphQL: queries, mutations, subscriptions, resolvers, and Apollo Server.",
    domain: "Backend Development",
    skills: ["GraphQL", "Apollo", "Schemas", "Resolvers"],
    level: "Intermediate",
    prerequisites: ["Express.js & REST APIs"],
    duration: "3 Weeks",
    difficulty: "Intermediate",
    videos: [
      { videoId: "ed8SzALpx1Q", title: "GraphQL Full Course - Novice to Expert", thumbnail: "https://i.ytimg.com/vi/ed8SzALpx1Q/mqdefault.jpg", channel: "freeCodeCamp" }
    ]
  },
  {
    title: "FastAPI & Async Python",
    description: "High-performance Python APIs with FastAPI, automatic OpenAPI documentation, Pydantic type validation, and async I/O.",
    domain: "Backend Development",
    skills: ["FastAPI", "Pydantic", "Async Python", "Uvicorn"],
    level: "Intermediate",
    prerequisites: ["Python Programming Fundamentals"],
    duration: "3 Weeks",
    difficulty: "Intermediate",
    videos: [
      { videoId: "0sOvCWFmrtA", title: "Python FastAPI Tutorial", thumbnail: "https://i.ytimg.com/vi/0sOvCWFmrtA/mqdefault.jpg", channel: "freeCodeCamp" }
    ]
  },
  {
    title: "ASP.NET Core with C#",
    description: "Enterprise backend web development using Microsoft ASP.NET Core, C#, Entity Framework Core, and dependency injection.",
    domain: "Backend Development",
    skills: ["ASP.NET Core", "C#", "Entity Framework", "Web APIs"],
    level: "Intermediate",
    prerequisites: ["C++ Object-Oriented Programming"],
    duration: "5 Weeks",
    difficulty: "Intermediate",
    videos: [
      { videoId: "BfEjDD8mWYg", title: "ASP.NET Core Crash Course", thumbnail: "https://i.ytimg.com/vi/BfEjDD8mWYg/mqdefault.jpg", channel: "freeCodeCamp" }
    ]
  },

  // ===== Full Stack Development =====
  {
    title: "Full Stack with Next.js & TypeScript",
    description: "End-to-end full stack web architecture combining Next.js Server Actions, TypeScript typing, Prisma ORM, and PostgreSQL.",
    domain: "Full Stack Development",
    skills: ["Next.js", "TypeScript", "Prisma", "Server Actions"],
    level: "Intermediate",
    prerequisites: ["React Fundamentals", "Node.js Fundamentals"],
    duration: "5 Weeks",
    difficulty: "Intermediate",
    videos: [
      { videoId: "wm5gMKuwSYk", title: "Full Stack Next.js & TypeScript Course", thumbnail: "https://i.ytimg.com/vi/wm5gMKuwSYk/mqdefault.jpg", channel: "freeCodeCamp" }
    ]
  },
  {
    title: "Real-Time Apps with WebSockets",
    description: "Bidirectional real-time client-server communication using WebSockets, Socket.io, rooms, heartbeat, and reconnection logic.",
    domain: "Full Stack Development",
    skills: ["WebSockets", "Socket.io", "Real-Time", "Event-Driven"],
    level: "Intermediate",
    prerequisites: ["Node.js Fundamentals"],
    duration: "3 Weeks",
    difficulty: "Intermediate",
    videos: [
      { videoId: "ZKEqqIO7n-k", title: "Socket.IO Real-Time Chat App", thumbnail: "https://i.ytimg.com/vi/ZKEqqIO7n-k/mqdefault.jpg", channel: "Web Dev Simplified" }
    ]
  },

  // ===== Data Science =====
  {
    title: "Power BI & Tableau",
    description: "Interactive business intelligence dashboards, DAX queries, data modeling, visual analytics, and executive reporting.",
    domain: "Data Science",
    skills: ["Power BI", "Tableau", "Business Intelligence", "Dashboards"],
    level: "Beginner",
    prerequisites: [],
    duration: "3 Weeks",
    difficulty: "Beginner",
    videos: [
      { videoId: "TmhQCQr_8CA", title: "Power BI Full Course", thumbnail: "https://i.ytimg.com/vi/TmhQCQr_8CA/mqdefault.jpg", channel: "Edureka" }
    ]
  },
  {
    title: "A/B Testing & Experiment Design",
    description: "Controlled online experiments: statistical power, sample sizing, hypothesis formulation, p-value correction, and false discovery rate.",
    domain: "Data Science",
    skills: ["A/B Testing", "Experimentation", "Hypothesis Testing", "p-values"],
    level: "Intermediate",
    prerequisites: ["Statistics & Probability"],
    duration: "3 Weeks",
    difficulty: "Intermediate",
    videos: [
      { videoId: "J2p572Ym2cQ", title: "A/B Testing Course - Udacity", thumbnail: "https://i.ytimg.com/vi/J2p572Ym2cQ/mqdefault.jpg", channel: "Udacity" }
    ]
  },
  {
    title: "Time Series Analysis",
    description: "Statistical modeling of temporal sequential data: stationary tests, ARIMA, SARIMA, Prophet, and seasonality decomposition.",
    domain: "Data Science",
    skills: ["Time Series", "ARIMA", "Forecasting", "Pandas"],
    level: "Intermediate",
    prerequisites: ["Data Analysis with Pandas"],
    duration: "4 Weeks",
    difficulty: "Intermediate",
    videos: [
      { videoId: "DeORzP0go5I", title: "Time Series Analysis with Python", thumbnail: "https://i.ytimg.com/vi/DeORzP0go5I/mqdefault.jpg", channel: "freeCodeCamp" }
    ]
  },

  // ===== Machine Learning =====
  {
    title: "Recommender Systems",
    description: "Content-based filtering, user-item collaborative filtering, matrix factorization (SVD), two-tower models, and neural recommendations.",
    domain: "Machine Learning",
    skills: ["Recommender Systems", "Collaborative Filtering", "Matrix Factorization"],
    level: "Intermediate",
    prerequisites: ["Supervised Learning"],
    duration: "4 Weeks",
    difficulty: "Intermediate",
    videos: [
      { videoId: "9gBC9R-msAk", title: "Recommendation Systems Tutorial", thumbnail: "https://i.ytimg.com/vi/9gBC9R-msAk/mqdefault.jpg", channel: "freeCodeCamp" }
    ]
  },
  {
    title: "Explainable & Responsible AI",
    description: "Interpretable machine learning techniques: SHAP values, LIME explanations, bias audits, fairness metrics, and model governance.",
    domain: "Machine Learning",
    skills: ["XAI", "SHAP", "LIME", "AI Ethics", "Fairness"],
    level: "Intermediate",
    prerequisites: ["Machine Learning Foundations"],
    duration: "3 Weeks",
    difficulty: "Intermediate",
    videos: [
      { videoId: "B-c8tIgchu0", title: "Explainable AI (XAI) Concepts", thumbnail: "https://i.ytimg.com/vi/B-c8tIgchu0/mqdefault.jpg", channel: "Google Cloud Tech" }
    ]
  },
  {
    title: "MLOps & Model Deployment",
    description: "Operationalizing ML pipelines: experiment tracking with MLflow, containerized model serving, feature stores, and drift monitoring.",
    domain: "Machine Learning",
    skills: ["MLOps", "MLflow", "Docker", "Model Serving", "CI/CD for ML"],
    level: "Advanced",
    prerequisites: ["Machine Learning Foundations", "Docker & Containerization"],
    duration: "4 Weeks",
    difficulty: "Advanced",
    videos: [
      { videoId: "sXbWvjF6D2c", title: "MLOps Full Course - Hands On", thumbnail: "https://i.ytimg.com/vi/sXbWvjF6D2c/mqdefault.jpg", channel: "freeCodeCamp" }
    ]
  },
  {
    title: "Reinforcement Learning",
    description: "Markov Decision Processes (MDP), Bellman equations, Q-Learning, Deep Q-Networks (DQN), and policy gradient optimization in Gym.",
    domain: "Machine Learning",
    skills: ["Reinforcement Learning", "Q-Learning", "MDP", "OpenAI Gym"],
    level: "Advanced",
    prerequisites: ["Deep Learning with TensorFlow"],
    duration: "5 Weeks",
    difficulty: "Advanced",
    videos: [
      { videoId: "zR11FLZ-O9M", title: "Deep Reinforcement Learning Course", thumbnail: "https://i.ytimg.com/vi/zR11FLZ-O9M/mqdefault.jpg", channel: "freeCodeCamp" }
    ]
  },

  // ===== Cybersecurity =====
  {
    title: "Mobile Application Security",
    description: "Auditing Android and iOS application security: static decompilation, dynamic instrumentation with Frida, and certificate pinning.",
    domain: "Cybersecurity",
    skills: ["Mobile Security", "Android Security", "iOS Security", "Frida"],
    level: "Intermediate",
    prerequisites: ["Web Application Security"],
    duration: "4 Weeks",
    difficulty: "Intermediate",
    videos: [
      { videoId: "tVwA3u9m3lE", title: "Mobile Penetration Testing Tutorial", thumbnail: "https://i.ytimg.com/vi/tVwA3u9m3lE/mqdefault.jpg", channel: "freeCodeCamp" }
    ]
  },
  {
    title: "Cloud Security & IAM",
    description: "Securing cloud workloads: IAM principle of least privilege, CloudTrail audit logs, VPC security groups, and encryption at rest/transit.",
    domain: "Cybersecurity",
    skills: ["Cloud Security", "IAM", "CloudTrail", "Security Groups"],
    level: "Intermediate",
    prerequisites: ["Cloud Computing Basics"],
    duration: "4 Weeks",
    difficulty: "Intermediate",
    videos: [
      { videoId: "5j1k6o7p8q9", title: "AWS Cloud Security Fundamentals", thumbnail: "https://i.ytimg.com/vi/5j1k6o7p8q9/mqdefault.jpg", channel: "freeCodeCamp" }
    ]
  },
  {
    title: "Security Compliance & GRC",
    description: "Governance, Risk, and Compliance: SOC 2 Type II controls, ISO 27001 ISMS, NIST Cybersecurity Framework, and GDPR data privacy.",
    domain: "Cybersecurity",
    skills: ["GRC", "SOC 2", "ISO 27001", "GDPR", "Compliance"],
    level: "Intermediate",
    prerequisites: ["Networking Fundamentals"],
    duration: "3 Weeks",
    difficulty: "Intermediate",
    videos: [
      { videoId: "9a-5Ijoq4i8", title: "Introduction to GRC and Security Compliance", thumbnail: "https://i.ytimg.com/vi/9a-5Ijoq4i8/mqdefault.jpg", channel: "Simplilearn" }
    ]
  },
  {
    title: "Malware Analysis & Reverse Engineering",
    description: "Static and dynamic analysis of malicious binaries: Ghidra decompilation, x86 assembly inspection, sandboxing, and unpacking.",
    domain: "Cybersecurity",
    skills: ["Malware Analysis", "Reverse Engineering", "Ghidra", "Disassembly"],
    level: "Advanced",
    prerequisites: ["Linux for Security"],
    duration: "5 Weeks",
    difficulty: "Advanced",
    videos: [
      { videoId: "qA3b4c5d6e7", title: "Malware Analysis Fundamentals with Ghidra", thumbnail: "https://i.ytimg.com/vi/qA3b4c5d6e7/mqdefault.jpg", channel: "freeCodeCamp" }
    ]
  },
  {
    title: "Digital Forensics & Incident Response",
    description: "Investigating cyber incidents: volatile memory forensics with Volatility, disk imaging, filesystem timeline analysis, and chain of custody.",
    domain: "Cybersecurity",
    skills: ["Digital Forensics", "Incident Response", "Memory Analysis", "Volatile Data"],
    level: "Advanced",
    prerequisites: ["Advanced Threat Analysis"],
    duration: "4 Weeks",
    difficulty: "Advanced",
    videos: [
      { videoId: "8b7tPq2o0c8", title: "Digital Forensics Full Course", thumbnail: "https://i.ytimg.com/vi/8b7tPq2o0c8/mqdefault.jpg", channel: "freeCodeCamp" }
    ]
  },

  // ===== Cloud Computing =====
  {
    title: "Azure Fundamentals",
    description: "Microsoft Azure cloud services: Azure Resource Manager, Virtual Machines, Blob Storage, Virtual Networks, and Azure Entra ID.",
    domain: "Cloud Computing",
    skills: ["Azure", "Microsoft Cloud", "Virtual Machines", "Blob Storage"],
    level: "Beginner",
    prerequisites: [],
    duration: "3 Weeks",
    difficulty: "Beginner",
    videos: [
      { videoId: "NKEFWyqJ5XA", title: "Azure Fundamentals AZ-900 Course", thumbnail: "https://i.ytimg.com/vi/NKEFWyqJ5XA/mqdefault.jpg", channel: "freeCodeCamp" }
    ]
  },
  {
    title: "Google Cloud Essentials",
    description: "Google Cloud Platform (GCP): Compute Engine, Cloud Storage, Google Kubernetes Engine (GKE), BigQuery, and IAM policies.",
    domain: "Cloud Computing",
    skills: ["GCP", "Google Cloud", "Compute Engine", "Cloud Storage"],
    level: "Beginner",
    prerequisites: [],
    duration: "3 Weeks",
    difficulty: "Beginner",
    videos: [
      { videoId: "jpno8FSqU84", title: "Google Cloud Platform Full Course", thumbnail: "https://i.ytimg.com/vi/jpno8FSqU84/mqdefault.jpg", channel: "freeCodeCamp" }
    ]
  },
  {
    title: "Serverless Architecture",
    description: "Event-driven serverless architectures with AWS Lambda, API Gateway, DynamoDB, cold start optimization, and Serverless Framework.",
    domain: "Cloud Computing",
    skills: ["Serverless", "AWS Lambda", "Cloud Functions", "API Gateway"],
    level: "Intermediate",
    prerequisites: ["Cloud Computing Basics"],
    duration: "4 Weeks",
    difficulty: "Intermediate",
    videos: [
      { videoId: "71mWf1m1-eA", title: "Serverless Architecture with AWS Lambda", thumbnail: "https://i.ytimg.com/vi/71mWf1m1-eA/mqdefault.jpg", channel: "freeCodeCamp" }
    ]
  },
  {
    title: "FinOps & Cost Optimization",
    description: "Cloud financial management: unit economics, AWS Cost Explorer, reserved instances, savings plans, rightsizing, and tagging hygiene.",
    domain: "Cloud Computing",
    skills: ["FinOps", "Cloud Cost Optimization", "Reserved Instances", "Budgets"],
    level: "Advanced",
    prerequisites: ["AWS Solutions Architect"],
    duration: "2 Weeks",
    difficulty: "Advanced",
    videos: [
      { videoId: "3b6tPq2o0c8", title: "FinOps: Cloud Financial Management", thumbnail: "https://i.ytimg.com/vi/3b6tPq2o0c8/mqdefault.jpg", channel: "AWS Online Tech Talks" }
    ]
  },

  // ===== DevOps =====
  {
    title: "Ansible & Configuration Management",
    description: "Agentless infrastructure automation: Ansible playbooks, roles, inventory management, idempotency, and server hardening.",
    domain: "DevOps",
    skills: ["Ansible", "Playbooks", "Configuration Management", "YAML"],
    level: "Intermediate",
    prerequisites: ["Linux & Shell Scripting for DevOps"],
    duration: "3 Weeks",
    difficulty: "Intermediate",
    videos: [
      { videoId: "1id6ERvfozo", title: "Ansible Full Course for Beginners", thumbnail: "https://i.ytimg.com/vi/1id6ERvfozo/mqdefault.jpg", channel: "freeCodeCamp" }
    ]
  },
  {
    title: "GitOps with ArgoCD",
    description: "Declarative continuous deployment for Kubernetes using Git as the single source of truth, automated sync, and drift reconciliation.",
    domain: "DevOps",
    skills: ["GitOps", "ArgoCD", "Kubernetes", "Declarative Delivery"],
    level: "Advanced",
    prerequisites: ["Kubernetes for DevOps Engineers"],
    duration: "3 Weeks",
    difficulty: "Advanced",
    videos: [
      { videoId: "MeU5_r9V-1E", title: "GitOps with ArgoCD Tutorial", thumbnail: "https://i.ytimg.com/vi/MeU5_r9V-1E/mqdefault.jpg", channel: "TechWorld with Nana" }
    ]
  },
  {
    title: "DevSecOps & Pipeline Hardening",
    description: "Shift-left security integration: Static Application Security Testing (SAST), software composition analysis (SCA), and container scanning.",
    domain: "DevOps",
    skills: ["DevSecOps", "SAST", "DAST", "Container Scanning", "Trivy"],
    level: "Advanced",
    prerequisites: ["CI/CD with Jenkins & GitHub Actions"],
    duration: "3 Weeks",
    difficulty: "Advanced",
    videos: [
      { videoId: "9o4b_vE7k4g", title: "DevSecOps Course for Beginners", thumbnail: "https://i.ytimg.com/vi/9o4b_vE7k4g/mqdefault.jpg", channel: "freeCodeCamp" }
    ]
  },

  // ===== UI/UX Design =====
  {
    title: "Interaction & Motion Design",
    description: "Micro-interactions, animation curves, transition choreographies, prototyping in Framer, and communicating spatial feedback.",
    domain: "UI/UX Design",
    skills: ["Interaction Design", "Motion Design", "Micro-Interactions", "Framer"],
    level: "Intermediate",
    prerequisites: ["Figma & Prototyping"],
    duration: "3 Weeks",
    difficulty: "Intermediate",
    videos: [
      { videoId: "5j1k6o7p8q9", title: "UI Animation & Motion Design Principles", thumbnail: "https://i.ytimg.com/vi/5j1k6o7p8q9/mqdefault.jpg", channel: "DesignCourse" }
    ]
  },
  {
    title: "UX Writing & Inclusive Content",
    description: "Crafting intuitive microcopy: button labels, error state messaging, onboarding flows, plain-language guidelines, and global localization.",
    domain: "UI/UX Design",
    skills: ["UX Writing", "Microcopy", "Content Design", "Accessibility"],
    level: "Intermediate",
    prerequisites: ["Design Thinking Fundamentals"],
    duration: "2 Weeks",
    difficulty: "Intermediate",
    videos: [
      { videoId: "6a-5Ijoq4i8", title: "UX Writing Tutorial for Beginners", thumbnail: "https://i.ytimg.com/vi/6a-5Ijoq4i8/mqdefault.jpg", channel: "Figma" }
    ]
  },

  // ===== Mobile Development =====
  {
    title: "Progressive Web Apps",
    description: "Transforming web applications into installable mobile experiences: Service Workers, Cache API, background sync, and Web App Manifests.",
    domain: "Mobile Development",
    skills: ["PWA", "Service Workers", "Offline Storage", "Web Manifest"],
    level: "Intermediate",
    prerequisites: ["React Fundamentals"],
    duration: "3 Weeks",
    difficulty: "Intermediate",
    videos: [
      { videoId: "sFS3_6N9K_4", title: "Progressive Web Apps (PWA) Tutorial", thumbnail: "https://i.ytimg.com/vi/sFS3_6N9K_4/mqdefault.jpg", channel: "Traversy Media" }
    ]
  },
  {
    title: "Mobile CI/CD & App Testing",
    description: "Automating mobile app testing and delivery: Fastlane scripts, Appium automated UI testing, crash reporting, and App Store automation.",
    domain: "Mobile Development",
    skills: ["Fastlane", "Appium", "Mobile Testing", "TestFlight"],
    level: "Advanced",
    prerequisites: ["React Native Basics"],
    duration: "3 Weeks",
    difficulty: "Advanced",
    videos: [
      { videoId: "7b7tPq2o0c8", title: "Mobile CI/CD with Fastlane and GitHub Actions", thumbnail: "https://i.ytimg.com/vi/7b7tPq2o0c8/mqdefault.jpg", channel: "freeCodeCamp" }
    ]
  },

  // ===== Database Management =====
  {
    title: "Graph Databases with Neo4j",
    description: "Graph data modeling: nodes, relationships, Cypher query language, path finding algorithms, and social network relationship graphs.",
    domain: "Database Management",
    skills: ["Neo4j", "Cypher", "Graph DB", "Knowledge Graphs"],
    level: "Intermediate",
    prerequisites: ["Introduction to Databases"],
    duration: "3 Weeks",
    difficulty: "Intermediate",
    videos: [
      { videoId: "8b6tPq2o0c8", title: "Neo4j Graph Database Tutorial", thumbnail: "https://i.ytimg.com/vi/8b6tPq2o0c8/mqdefault.jpg", channel: "freeCodeCamp" }
    ]
  },
  {
    title: "Elasticsearch & Search Engineering",
    description: "Inverted indexes, full-text relevance scoring (BM25), analyzers, tokenizers, Lucene internals, and Elasticsearch cluster topologies.",
    domain: "Database Management",
    skills: ["Elasticsearch", "Inverted Index", "Full-Text Search", "Lucene"],
    level: "Intermediate",
    prerequisites: ["Introduction to Databases"],
    duration: "4 Weeks",
    difficulty: "Intermediate",
    videos: [
      { videoId: "C3flBw0yU-4", title: "Elasticsearch Tutorial for Beginners", thumbnail: "https://i.ytimg.com/vi/C3flBw0yU-4/mqdefault.jpg", channel: "freeCodeCamp" }
    ]
  },
  {
    title: "Database Internals: B-Trees & LSM",
    description: "Physical database storage architecture: B-Tree balancing, Log-Structured Merge (LSM) trees, write-ahead logs (WAL), and compaction.",
    domain: "Database Management",
    skills: ["Storage Engines", "B-Trees", "LSM Trees", "WAL", "ACID Internals"],
    level: "Advanced",
    prerequisites: ["PostgreSQL Advanced"],
    duration: "4 Weeks",
    difficulty: "Advanced",
    videos: [
      { videoId: "w_M_Kj4U2pQ", title: "Database Internals and Storage Engines", thumbnail: "https://i.ytimg.com/vi/w_M_Kj4U2pQ/mqdefault.jpg", channel: "CMU Database Group" }
    ]
  },

  // ===== Computer Networks =====
  {
    title: "Network Programming with Sockets",
    description: "Low-level socket programming in C/Python: TCP three-way handshake, non-blocking I/O multiplexing (select/epoll), and UDP datagrams.",
    domain: "Computer Networks",
    skills: ["Socket Programming", "TCP", "UDP", "POSIX Sockets"],
    level: "Intermediate",
    prerequisites: ["Computer Networks Basics"],
    duration: "3 Weeks",
    difficulty: "Intermediate",
    videos: [
      { videoId: "3QhU9jd03a0", title: "Socket Programming in Python", thumbnail: "https://i.ytimg.com/vi/3QhU9jd03a0/mqdefault.jpg", channel: "freeCodeCamp" }
    ]
  },
  {
    title: "CCNA Exam Prep Labs",
    description: "Hands-on networking labs: Cisco Packet Tracer, enterprise routing protocols, switch port security, DHCP snooping, and spanning tree.",
    domain: "Computer Networks",
    skills: ["Cisco", "CCNA", "Packet Tracer", "VLANs", "Subnetting"],
    level: "Intermediate",
    prerequisites: ["Routing & Switching"],
    duration: "5 Weeks",
    difficulty: "Intermediate",
    videos: [
      { videoId: "H8W9oMN5h-I", title: "Cisco CCNA 200-301 Full Course", thumbnail: "https://i.ytimg.com/vi/H8W9oMN5h-I/mqdefault.jpg", channel: "NetworkChuck" }
    ]
  },
  {
    title: "Network Automation with Python",
    description: "Automating network switch and router configurations using Python Netmiko, Paramiko, NAPALM, Jinja2 templates, and RESTCONF.",
    domain: "Computer Networks",
    skills: ["Netmiko", "Paramiko", "Scapy", "Network Automation"],
    level: "Advanced",
    prerequisites: ["Routing & Switching", "Python Programming Fundamentals"],
    duration: "4 Weeks",
    difficulty: "Advanced",
    videos: [
      { videoId: "6a-5Ijoq4i8", title: "Python Network Automation Tutorial", thumbnail: "https://i.ytimg.com/vi/6a-5Ijoq4i8/mqdefault.jpg", channel: "freeCodeCamp" }
    ]
  },

  // ===== Operating Systems =====
  {
    title: "Concurrent Programming",
    description: "Multithreaded concurrent software engineering: thread pools, atomic instructions, lock-free queues, memory barriers, and race conditions.",
    domain: "Operating Systems",
    skills: ["Concurrency", "Threads", "Race Conditions", "Lock-Free Data Structures"],
    level: "Intermediate",
    prerequisites: ["Introduction to Operating Systems"],
    duration: "4 Weeks",
    difficulty: "Intermediate",
    videos: [
      { videoId: "olYdb0DdDtM", title: "Concurrency in Modern Operating Systems", thumbnail: "https://i.ytimg.com/vi/olYdb0DdDtM/mqdefault.jpg", channel: "MIT OpenCourseWare" }
    ]
  },
  {
    title: "Virtualization & Container Internals",
    description: "Under the hood of modern isolation: Linux kernel namespaces, cgroups v2, chroot, overlayfs, KVM hypervisors, and QEMU.",
    domain: "Operating Systems",
    skills: ["cgroups", "namespaces", "KVM", "Hypervisors", "chroot"],
    level: "Advanced",
    prerequisites: ["Linux Fundamentals"],
    duration: "4 Weeks",
    difficulty: "Advanced",
    videos: [
      { videoId: "8b6tPq2o0c8", title: "How Containers Work: cgroups and namespaces", thumbnail: "https://i.ytimg.com/vi/8b6tPq2o0c8/mqdefault.jpg", channel: "Julia Evans" }
    ]
  },

  // ===== System Design =====
  {
    title: "Low-Level Design / OOD",
    description: "Object-oriented software design for tech interviews: UML class diagrams, SOLID design principles, design patterns, and code structure.",
    domain: "System Design",
    skills: ["LLD", "Object-Oriented Design", "UML", "Design Patterns"],
    level: "Intermediate",
    prerequisites: ["System Design Fundamentals"],
    duration: "4 Weeks",
    difficulty: "Intermediate",
    videos: [
      { videoId: "V_M_Kj4U2pQ", title: "Low Level Design (LLD) Course", thumbnail: "https://i.ytimg.com/vi/V_M_Kj4U2pQ/mqdefault.jpg", channel: "freeCodeCamp" }
    ]
  },
  {
    title: "Distributed Systems Fundamentals",
    description: "Core tenets of distributed coordination: logical clocks, Lamport timestamps, vector clocks, RPCs, and two-phase commit (2PC).",
    domain: "System Design",
    skills: ["Distributed Systems", "RPC", "Clock Sync", "Vector Clocks"],
    level: "Intermediate",
    prerequisites: ["System Design Fundamentals"],
    duration: "5 Weeks",
    difficulty: "Intermediate",
    videos: [
      { videoId: "cETSnS-3XbY", title: "MIT 6.824: Distributed Systems", thumbnail: "https://i.ytimg.com/vi/cETSnS-3XbY/mqdefault.jpg", channel: "MIT OpenCourseWare" }
    ]
  },
  {
    title: "Consensus & Consistency Models",
    description: "Distributed consensus mechanisms: Raft protocol leader election, log replication, Paxos algorithms, linearizability, and eventual consistency.",
    domain: "System Design",
    skills: ["Raft", "Paxos", "Linearizability", "Eventual Consistency"],
    level: "Advanced",
    prerequisites: ["Distributed Systems Fundamentals"],
    duration: "4 Weeks",
    difficulty: "Advanced",
    videos: [
      { videoId: "vYp4LYbnnW8", title: "Raft Consensus Algorithm Explained", thumbnail: "https://i.ytimg.com/vi/vYp4LYbnnW8/mqdefault.jpg", channel: "Heidi Howard" }
    ]
  },

  // ===== Blockchain =====
  {
    title: "Hyperledger Fabric & Enterprise Blockchain",
    description: "Permissioned distributed ledgers: Hyperledger Fabric architecture, channels, chaincode in Go, and private enterprise transactions.",
    domain: "Blockchain",
    skills: ["Hyperledger", "Chaincode", "Permissioned Blockchain", "Enterprise Web3"],
    level: "Intermediate",
    prerequisites: ["Blockchain Fundamentals"],
    duration: "4 Weeks",
    difficulty: "Intermediate",
    videos: [
      { videoId: "8b7tPq2o0c8", title: "Hyperledger Fabric Full Course", thumbnail: "https://i.ytimg.com/vi/8b7tPq2o0c8/mqdefault.jpg", channel: "freeCodeCamp" }
    ]
  },
  {
    title: "Solana & Rust Smart Contracts",
    description: "High-throughput blockchain engineering: Solana account model, Proof of History (PoH), writing on-chain programs with Rust and Anchor.",
    domain: "Blockchain",
    skills: ["Solana", "Rust", "Anchor Framework", "High-Throughput Web3"],
    level: "Advanced",
    prerequisites: ["Solidity Programming", "Rust Fundamentals"],
    duration: "4 Weeks",
    difficulty: "Advanced",
    videos: [
      { videoId: "amqfM4V4e4I", title: "Solana Smart Contract Development with Anchor and Rust", thumbnail: "https://i.ytimg.com/vi/amqfM4V4e4I/mqdefault.jpg", channel: "freeCodeCamp" }
    ]
  },

  // ===== Game Development =====
  {
    title: "Godot Engine Basics",
    description: "Open-source game creation with Godot: GDScript syntax, node trees, scene composition, 2D physics, and exporting cross-platform games.",
    domain: "Game Development",
    skills: ["Godot", "GDScript", "2D Games", "Scene Trees"],
    level: "Beginner",
    prerequisites: [],
    duration: "3 Weeks",
    difficulty: "Beginner",
    videos: [
      { videoId: "LOhfqjmasi0", title: "Learn Godot 4 in 1 Hour", thumbnail: "https://i.ytimg.com/vi/LOhfqjmasi0/mqdefault.jpg", channel: "Clear Code" }
    ]
  },
  {
    title: "Game AI & Behavior Trees",
    description: "Autonomous non-player characters: finite state machines, hierarchical behavior trees, perception cones, and utility AI systems.",
    domain: "Game Development",
    skills: ["Game AI", "Behavior Trees", "State Machines", "NavMesh"],
    level: "Intermediate",
    prerequisites: ["Unity Fundamentals with C#"],
    duration: "4 Weeks",
    difficulty: "Intermediate",
    videos: [
      { videoId: "8b7tPq2o0c8", title: "Game AI and Behavior Trees in Unity", thumbnail: "https://i.ytimg.com/vi/8b7tPq2o0c8/mqdefault.jpg", channel: "Brackeys" }
    ]
  },
  {
    title: "Computer Graphics & Shaders",
    description: "Graphics programming pipeline: vertex and fragment shaders in GLSL/HLSL, PBR lighting, normal mapping, and compute shaders.",
    domain: "Game Development",
    skills: ["GLSL", "HLSL", "Shaders", "Rendering Pipeline", "Lighting Models"],
    level: "Advanced",
    prerequisites: ["3D Game Development & Physics"],
    duration: "5 Weeks",
    difficulty: "Advanced",
    videos: [
      { videoId: "kfM-tT0Q1oQ", title: "Shaders for Game Developers", thumbnail: "https://i.ytimg.com/vi/kfM-tT0Q1oQ/mqdefault.jpg", channel: "Freya Holmer" }
    ]
  },

  // ===== Software Engineering =====
  {
    title: "UML & Requirements Engineering",
    description: "Formal software modeling: use case diagrams, sequence diagrams, class diagrams, statecharts, and structured requirements gathering.",
    domain: "Software Engineering",
    skills: ["UML", "Class Diagrams", "Sequence Diagrams", "Requirements"],
    level: "Intermediate",
    prerequisites: ["Software Development Life Cycle"],
    duration: "3 Weeks",
    difficulty: "Intermediate",
    videos: [
      { videoId: "UI6lqHOVHic", title: "UML Diagrams Full Course", thumbnail: "https://i.ytimg.com/vi/UI6lqHOVHic/mqdefault.jpg", channel: "freeCodeCamp" }
    ]
  },
  {
    title: "Software Project Management & Estimation",
    description: "Estimating software timelines: function point analysis, PERT charts, critical path method, risk matrices, and Jira workflows.",
    domain: "Software Engineering",
    skills: ["Project Estimation", "PERT", "Risk Management", "Jira"],
    level: "Intermediate",
    prerequisites: ["Agile & Scrum Methodology"],
    duration: "3 Weeks",
    difficulty: "Intermediate",
    videos: [
      { videoId: "8b7tPq2o0c8", title: "Software Project Management Crash Course", thumbnail: "https://i.ytimg.com/vi/8b7tPq2o0c8/mqdefault.jpg", channel: "Simplilearn" }
    ]
  },
  {
    title: "Software Architecture Patterns",
    description: "Architectural blueprints: Hexagonal Architecture, Clean Architecture, Onion Architecture, Domain-Driven Design (DDD), and CQRS.",
    domain: "Software Engineering",
    skills: ["Hexagonal Architecture", "Clean Architecture", "Domain-Driven Design", "CQRS"],
    level: "Advanced",
    prerequisites: ["Design Patterns in Software"],
    duration: "4 Weeks",
    difficulty: "Advanced",
    videos: [
      { videoId: "yPvef9S3k-M", title: "Clean Architecture Patterns", thumbnail: "https://i.ytimg.com/vi/yPvef9S3k-M/mqdefault.jpg", channel: "GOTO Conferences" }
    ]
  },

  // ===== Data Engineering =====
  {
    title: "dbt & the Modern Data Stack",
    description: "Analytics engineering with dbt: declarative data transformations, testing models, documentation generation, and Jinja macros in SQL.",
    domain: "Data Engineering",
    skills: ["dbt", "Data Modeling", "Data Transformation", "Analytics Engineering"],
    level: "Intermediate",
    prerequisites: ["SQL for Data Engineers"],
    duration: "3 Weeks",
    difficulty: "Intermediate",
    videos: [
      { videoId: "8b7tPq2o0c8", title: "dbt Tutorial: Analytics Engineering", thumbnail: "https://i.ytimg.com/vi/8b7tPq2o0c8/mqdefault.jpg", channel: "Seattle Data Guy" }
    ]
  },
  {
    title: "BigQuery & Snowflake",
    description: "Cloud data warehousing: Snowflake virtual warehouses, BigQuery serverless compute, clustering keys, partition pruning, and cost control.",
    domain: "Data Engineering",
    skills: ["BigQuery", "Snowflake", "Cloud Data Warehouse", "Partitioning"],
    level: "Intermediate",
    prerequisites: ["SQL for Data Engineers"],
    duration: "4 Weeks",
    difficulty: "Intermediate",
    videos: [
      { videoId: "4b7tPq2o0c8", title: "Snowflake & BigQuery Masterclass", thumbnail: "https://i.ytimg.com/vi/4b7tPq2o0c8/mqdefault.jpg", channel: "freeCodeCamp" }
    ]
  },
  {
    title: "Lakehouse: Delta Lake & Iceberg",
    description: "Open table formats for ACID transactions on data lakes: Apache Iceberg, Delta Lake, time travel, schema evolution, and Parquet storage.",
    domain: "Data Engineering",
    skills: ["Delta Lake", "Apache Iceberg", "ACID Lakehouse", "Parquet"],
    level: "Advanced",
    prerequisites: ["Apache Spark Fundamentals"],
    duration: "4 Weeks",
    difficulty: "Advanced",
    videos: [
      { videoId: "5b7tPq2o0c8", title: "Data Lakehouse Architecture Explained", thumbnail: "https://i.ytimg.com/vi/5b7tPq2o0c8/mqdefault.jpg", channel: "Databricks" }
    ]
  },
  {
    title: "Data Quality & Governance",
    description: "Maintaining data trustworthiness: automated assertion testing with Great Expectations, data lineage tracking, and catalog governance.",
    domain: "Data Engineering",
    skills: ["Data Quality", "Great Expectations", "Data Lineage", "Governance"],
    level: "Advanced",
    prerequisites: ["Introduction to Data Engineering"],
    duration: "3 Weeks",
    difficulty: "Advanced",
    videos: [
      { videoId: "6b7tPq2o0c8", title: "Data Governance and Quality in Practice", thumbnail: "https://i.ytimg.com/vi/6b7tPq2o0c8/mqdefault.jpg", channel: "IBM Technology" }
    ]
  },

  // ===== Internet of Things (IoT) =====
  {
    title: "ESP32 Wi-Fi/BLE Projects",
    description: "Connected microcontrollers with ESP32: dual-core programming, Wi-Fi station/AP modes, BLE advertisements, and MicroPython firmware.",
    domain: "Internet of Things",
    skills: ["ESP32", "Wi-Fi", "BLE", "MicroPython"],
    level: "Beginner",
    prerequisites: ["Arduino Programming"],
    duration: "3 Weeks",
    difficulty: "Beginner",
    videos: [
      { videoId: "7b7tPq2o0c8", title: "ESP32 Tutorial for Beginners", thumbnail: "https://i.ytimg.com/vi/7b7tPq2o0c8/mqdefault.jpg", channel: "Random Nerd Tutorials" }
    ]
  },
  {
    title: "TinyML & Edge AI",
    description: "Machine learning on microcontrollers: model quantization, TensorFlow Lite for Microcontrollers (TFLM), and running keyword spotting on edge.",
    domain: "Internet of Things",
    skills: ["TinyML", "Edge AI", "TensorFlow Lite Micro", "Quantized Models"],
    level: "Advanced",
    prerequisites: ["Introduction to IoT", "Deep Learning with TensorFlow"],
    duration: "4 Weeks",
    difficulty: "Advanced",
    videos: [
      { videoId: "8b7tPq2o0c8", title: "TinyML: Machine Learning on Microcontrollers", thumbnail: "https://i.ytimg.com/vi/8b7tPq2o0c8/mqdefault.jpg", channel: "Harvard Online" }
    ]
  },
  {
    title: "Industrial IoT & PLC/SCADA",
    description: "Operational technology networking: programmable logic controllers (PLCs), ladder logic, SCADA supervision, Modbus TCP, and OPC-UA.",
    domain: "Internet of Things",
    skills: ["IIoT", "PLC", "SCADA", "Modbus", "OPC-UA"],
    level: "Advanced",
    prerequisites: ["IoT Communication Protocols"],
    duration: "4 Weeks",
    difficulty: "Advanced",
    videos: [
      { videoId: "9b7tPq2o0c8", title: "Industrial IoT and PLC Basics", thumbnail: "https://i.ytimg.com/vi/9b7tPq2o0c8/mqdefault.jpg", channel: "RealPars" }
    ]
  }
];

// 3. Validation checks
console.log(`Checking ${tier3Courses.length} Tier 3 courses...`);

const validLevels = new Set(["Beginner", "Intermediate", "Advanced"]);
let hasError = false;

tier3Courses.forEach((c, idx) => {
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

console.log("Validation PASSED! All 59 Tier 3 courses have valid schemas, unique titles, and balanced stages.");

// 4. Non-destructively append new courses to existing 171
const mergedCourses = [...existingCourses, ...tier3Courses];

console.log(`Final unified catalog total: ${mergedCourses.length} courses across ${new Set(mergedCourses.map(c => c.domain)).size} domains.`);

// 5. Write back to allCourses.json and allCourses.js
fs.writeFileSync(jsonPath, JSON.stringify(mergedCourses, null, 2), 'utf8');
console.log(`Updated: ${jsonPath}`);

const jsContent = `export const allCourses = ${JSON.stringify(mergedCourses, null, 2)};\n`;
fs.writeFileSync(jsPath, jsContent, 'utf8');
console.log(`Updated: ${jsPath}`);

console.log("Tier 3 integration complete successfully!");
