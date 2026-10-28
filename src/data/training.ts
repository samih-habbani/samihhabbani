// ── Verified source data for the /training-expertise page ────
// Every figure, credential, link and program here is sourced directly from:
//  - "Samih Habbani — Corporate AI Trainer Resume.pdf"
//  - "Samih Habbani — Senior Full-Stack Developer Resume.pdf"
//  - "Samih Habbani — Corporate AI Training Catalogue.pdf"
//  - "AI & Finance training.pdf" (AI+ Finance Practitioner™ course outline)
//  - "Microsoft_Copilot_Introduction_4.pptx" (33-slide Copilot training deck,
//     byline "Samih Habbani — Microsoft Copilot & AI Business Trainer (AB-730)")

export const TRAINER_STATS = [
  { value: '7+',     label: 'Years Professional Training' },
  { value: '10+',    label: 'Years in Technology & AI Engineering' },
  { value: '20+',    label: 'Projects Deployed' },
  { value: '5,000+', label: 'Learners Trained' },
  { value: '40+',    label: 'Training Programs Designed' },
  { value: '1,000+', label: 'Educational Videos Produced' },
]

export const CREDENTIALS_OBTAINED = [
  {
    title:       'Microsoft Copilot & AI Business Trainer (AB-730)',
    institution: 'Microsoft Copilot business-adoption training credential',
    year:        '',
  },
  {
    title:       'Microsoft Certified Trainer (MCT)',
    institution: 'Microsoft',
    year:        '',
  },
  {
    title:       'MBA International Management',
    institution: "Saint John's University — New York, United States",
    year:        '2015',
  },
  {
    title:       'Certificate, Web Development',
    institution: 'Web Force 3 — Paris, France',
    year:        '2016',
  },
]

export const LANGUAGES = [
  { lang: 'French',  level: 'Native' },
  { lang: 'Spanish', level: 'Native' },
  { lang: 'English', level: 'Fluent' },
]

export const AUDIENCES = [
  { title: 'Corporate Teams',              desc: 'AI adoption, productivity, automation' },
  { title: 'Managers & Business Professionals', desc: 'AI adoption, business use cases, productivity' },
  { title: 'Professionals',                desc: 'Hands-on technology and digital-skills training' },
  { title: 'Technical Teams',              desc: 'APIs, LLMs, RAG, Python, development' },
  { title: 'Entrepreneurs',                desc: 'AI tools, automation, business workflows' },
]

export const METHODOLOGY_STEPS = [
  { step: 'UNDERSTAND', desc: 'Training needs analysis — business problem and current skill level' },
  { step: 'BUILD',      desc: 'Practical AI solution or exercise, mapped to real workplace tasks' },
  { step: 'PRACTICE',   desc: 'Hands-on labs — participants work on their own use cases' },
  { step: 'PRESENT',    desc: 'Business application — connecting the exercise back to daily work' },
  { step: 'DEPLOY',     desc: 'Reusable deliverable — a prompt library, prototype or workflow to take away' },
]

export const DELIVERY_FORMATS = [
  'Onsite Corporate Training',
  'Virtual Instructor-Led Training (VILT)',
  'Private Team Workshops',
  'Executive Sessions',
  'Hands-on Technical Workshops',
  'Customized Programs',
  'Half Day to Multi-Day',
]

export const LOCATION = {
  virtual:  'Available for international virtual delivery',
  pricing:  'Corporate pricing available upon request',
}

export type Course = {
  id:          string
  title:       string
  duration:    string
  level:       string
  desc:        string
  audience:    string
  format:      string
  outcomes:    string[]
  modules:     string[]
  handsOn:     string
  tools:       string[]
  customization: string
  prerequisites?: string
}

// ── AI Training Catalogue — 9 programs across 3 tracks ────────
// Source: "Programmes_IT_actualises_ChatGPT_Agents_Copilot.docx".
// Per that document: programs 1–3 (Business Teams track) are refined,
// ready-to-deliver offerings. Programs 4–9 (Developers + Governance
// tracks) are offers to prepare and test before commercialization —
// reflected below in each program's "customization" note.
export const AI_TRACKS: { id: string; label: string; color: string; courses: Course[] }[] = [
  {
    id: 'business-teams', label: 'AI for Business Teams', color: '#00FF94',
    courses: [
      {
        id: 'chatgpt-business',
        title: 'ChatGPT for Business Professionals',
        duration: '2 Days', level: 'Foundation',
        desc: 'Use ChatGPT as a real workspace — drafting, research, analysis and reliable deliverables. Move from one-off prompts to a repeatable method: clear briefs, working from documents and data, custom instructions, Projects, and quality checks before use.',
        audience: 'Managers, project leads, consultants and professionals in support, sales, marketing or communication roles.',
        format: 'Onsite · Virtual · Private Corporate',
        outcomes: [
          'Structure and refine a request',
          'Analyze files and sources',
          'Configure custom instructions and a Project',
          'Formalize a business-specific assistant',
          'Apply quality and confidentiality checks',
        ],
        modules: ['Prompting Fundamentals', 'Working from Documents & Data', 'Research & Verification', 'Custom Instructions & Memory', 'Building a Project', 'Designing a Reusable Assistant', 'Testing & Handover'],
        handsOn: 'Participants build a business Project with real sources and instructions, then design and test a reusable assistant configuration on a new case.',
        tools: ['ChatGPT', 'Custom GPTs (where available)'],
        prerequisites: 'Comfortable with a browser and everyday office tools. ChatGPT account with access to the features used in the workshops; anonymized or approved working files.',
        customization: 'Refined, ready-to-deliver program.',
      },
      {
        id: 'ai-agents-cowork',
        title: 'AI Agents with Claude Cowork & ChatGPT Work',
        duration: '2 Days', level: 'Intermediate',
        desc: 'For users already comfortable with AI assistants who want to delegate a multi-step professional mission. Learn to scope what an agent can access, produce and act on, place human checkpoints correctly, then verify sources, actions and results.',
        audience: 'Non-developer power users, AI champions, consultants, project leads and business function managers.',
        format: 'Onsite · Virtual · Private Corporate',
        outcomes: [
          'Choose a mission suited to delegation',
          'Define resources and permissions',
          'Follow an agentic workflow',
          'Verify outputs and actions',
          'Test failure cases',
          'Document a supervisable method',
        ],
        modules: ['Agentic Workflows vs. Automation', 'Writing a Mission Brief', 'Permissions & Human Checkpoints', 'Running & Monitoring a Workflow', 'Testing Edge Cases & Errors', 'Documenting a Reusable Procedure'],
        handsOn: 'Participants run one real business mission end-to-end in Claude Cowork or ChatGPT Work, then stress-test it and document a reusable, supervised procedure.',
        tools: ['Claude Cowork', 'ChatGPT Work'],
        prerequisites: 'Prior practice with ChatGPT or Claude and contextualized prompting. Approved access to one of the environments studied. No coding required.',
        customization: 'Refined, ready-to-deliver program.',
      },
      {
        id: 'm365-copilot-program',
        title: 'Microsoft 365 Copilot (AB-730)',
        duration: '2 Days', level: 'Foundation to Intermediate',
        desc: 'Use Microsoft 365 Copilot to save time on documents, meetings, messages and analysis — without losing control of sources or access. Alternates hands-on work in Word, Excel, PowerPoint, Outlook and Teams with Copilot Chat, Pages and Notebooks. Backed by a self-authored, 33-slide "Microsoft Copilot, Explained" deck covering grounding, Microsoft Graph, prompt engineering and Responsible AI.',
        audience: 'Microsoft 365 professionals, managers, project leads and Copilot adoption champions.',
        format: 'Onsite · Virtual · Private Corporate',
        outcomes: [
          'Write contextualized requests',
          'Produce and validate content across Microsoft 365 apps',
          'Use Pages, Notebooks and built-in agents',
          'Design a business agent',
          'Apply data-protection rules',
        ],
        modules: ['Copilot Chat, Outlook & Teams', 'Word, Excel & PowerPoint', 'Copilot Pages & Notebooks', 'Grounding & Microsoft Graph', 'Built-in Agents (Facilitator, Researcher, Analyst)', 'Designing an Agent in Copilot Studio', 'Security, Purview & Responsible AI'],
        handsOn: 'Participants build a full business deliverable — meeting notes to decision memo to follow-up email — then design a business agent and review a data-access risk scenario.',
        tools: ['Microsoft 365 Copilot', 'Copilot Studio', 'Microsoft Purview (overview)'],
        prerequisites: 'Everyday use of Microsoft 365. Business account and Microsoft 365 Copilot license suited to the workshops; Teams, SharePoint, Pages, Notebooks and agent access verified beforehand.',
        customization: 'Refined, ready-to-deliver program — credentialed as Microsoft Copilot & AI Business Trainer (AB-730). Covers skills relevant to AB-730 preparation, without guaranteeing exam success.',
      },
    ],
  },
  {
    id: 'finance', label: 'AI for Finance', color: '#00D4FF',
    courses: [
      {
        id: 'ai-finance-practitioner',
        title: 'AI+ Finance Practitioner™',
        duration: '2 Days', level: 'Foundation to Intermediate',
        desc: 'A structured, 8-module program on applying AI across the finance function — from data-driven decision-making to credit scoring, fraud detection, stock forecasting, blockchain and AI strategy.',
        audience: 'Finance professionals, analysts and business teams working with financial data and operations.',
        format: 'Onsite · Virtual · Private Corporate',
        outcomes: [
          'Understand the AI technologies shaping modern finance',
          'Apply AI to credit scoring, lending and fraud detection',
          'Evaluate AI-driven stock market forecasting and its limits',
          'Build a digital-first AI strategy for a finance function',
        ],
        modules: ['Introduction to AI in Finance', 'Data-Driven Decision Making', 'AI in Credit & Loans', 'Fraud Detection with AI', 'Forecasting Stock Markets with AI', 'Blockchain & AI', 'Emerging FinTech Technologies', 'Implementing AI Strategy'],
        handsOn: 'Case-based exercises across each module, from a credit-risk scenario to drafting a digital-first AI strategy for a finance function.',
        tools: ['—'],
        prerequisites: 'Basic understanding of finance, curiosity about how AI impacts financial operations, and willingness to engage with ethical frameworks.',
        customization: "Offer to prepare and test — exercises built around the client's own financial data and use cases.",
      },
    ],
  },
  {
    id: 'developers', label: 'AI for Developers', color: '#4A9EFF',
    courses: [
      {
        id: 'claude-code-devs',
        title: 'Claude Code for Developers',
        duration: '2 Days', level: 'Intermediate',
        desc: 'Learn to delegate scoped tasks on an existing codebase to a coding assistant. Covers exploring a project, planning a change, generating code, testing, and reviewing diffs before merge — saving time while keeping ownership of quality, security and maintainability.',
        audience: 'Full-stack developers, tech leads and product teams with existing coding practice.',
        format: 'Onsite · Virtual · Private Corporate',
        outcomes: [
          'Scope a task clearly',
          'Provide the right context',
          'Drive code changes',
          'Write and run tests',
          'Review generated code and manage permissions',
        ],
        modules: ['Exploring a Codebase', 'Scoping a Task', 'Driving Changes Step by Step', 'Generating & Running Tests', 'Controlled Refactoring', 'Pre-Merge Review & Security Checklist'],
        handsOn: 'Participants diagnose and fix a documented bug, ship a tested feature, refactor existing code with a before/after comparison, and produce a reviewed, security-checked change proposal.',
        tools: ['Claude Code', 'Git'],
        prerequisites: 'Comfortable with Git, a terminal and a software project. Access to Claude Code and a practice repository.',
        customization: 'Offer to prepare and test — priority to build a reproducible demo repository before delivery.',
      },
      {
        id: 'ai-augmented-dev',
        title: 'AI-Augmented Software Development',
        duration: '2 Days', level: 'Intermediate',
        desc: 'Integrate AI assistants into everyday development — from requirement analysis to documentation. Compares usage across the IDE, terminal and code review on a shared mini-project, teaching teams to pick the right task to delegate, measure the result, and keep human validation.',
        audience: 'Developers, tech leads and software engineering teams.',
        format: 'Onsite · Virtual · Private Corporate',
        outcomes: [
          'Break down a request',
          'Use AI to code, test and document',
          'Control quality and security',
          'Formalize team rules',
        ],
        modules: ['Where AI Fits in the Dev Cycle', 'Writing a Well-Scoped Task', 'Building a Feature with an Assistant', 'Testing & Robustness', 'Team Guardrails & Review Checklist'],
        handsOn: 'Participants ship a documented feature increment, fix an issue revealed by tests, then build a team review checklist through a cross-review exercise.',
        tools: ['AI coding assistants', 'Git'],
        prerequisites: 'Programming basics, Git and a working dev environment. Company-approved AI tools.',
        customization: "Offer to prepare and test — adapt tools to the client's licenses and practices.",
      },
      {
        id: 'langchain-rag',
        title: 'AI Applications & Document Search with LangChain',
        duration: '2 Days', level: 'Intermediate',
        desc: 'Build an application that answers from a defined document corpus with verifiable sources. The thread project connects file loading, chunking, retrieval, answer generation and evaluation on real questions. LangChain is the implementation framework; the architecture is taught with concepts independent of any single tool.',
        audience: 'Python developers and teams prototyping internal document-search applications.',
        format: 'Onsite · Virtual · Private Corporate',
        outcomes: [
          'Design a RAG pipeline',
          'Prepare documents',
          'Select a retrieval method',
          'Verify answers, citations, cost and access',
        ],
        modules: ['RAG Architecture', 'Document Loading & Chunking', 'Indexing & Retrieval', 'Grounded Answer Generation', 'Evaluation & Failure Testing', 'From Prototype to Service'],
        handsOn: 'Participants build a working RAG pipeline, test it against a prepared question set, and fix the failures it surfaces.',
        tools: ['Python', 'LangChain'],
        prerequisites: 'Python, APIs and basic data literacy. Practice API keys/services and approved documents.',
        customization: 'Offer to prepare and test before commercialization — build a complete, reproducible prototype first.',
      },
      {
        id: 'ai-agent-engineering',
        title: 'AI Agent Engineering',
        duration: '2 Days', level: 'Advanced',
        desc: 'Design a supervised agent that uses tools to complete a multi-step software or business task. From one thread case, participants build a plan-and-execute loop, constrain access, handle errors and test results. Multi-agent orchestration is covered only where it genuinely improves the scenario.',
        audience: 'Senior developers, application architects and automation teams.',
        format: 'Onsite · Virtual · Private Corporate',
        outcomes: [
          'Design a tool-using agent',
          'Define state and permissions',
          'Add validation and recovery',
          'Evaluate quality and cost',
        ],
        modules: ['Choosing the Right Level of Autonomy', 'Designing Tool Contracts', 'Building a Plan-and-Execute Loop', 'Stress-Testing Failure Cases', 'Single Agent vs. Specialized Roles', 'Evaluation & Deployment Readiness'],
        handsOn: 'Participants build and run an agent prototype end-to-end, then replay failure scenarios (unavailable tool, conflicting data, prompt injection) and fix the weaknesses found.',
        tools: ['Python / JavaScript', 'LLM APIs'],
        prerequisites: 'Python or JavaScript, APIs, testing and LLM basics. Practice environment with controlled tools.',
        customization: 'Offer to prepare and test — deliver against one strong reference case rather than claiming mastery of every framework.',
      },
      {
        id: 'github-agentic-dev',
        title: 'GitHub Agentic Development',
        duration: '2 Days', level: 'Intermediate to Advanced',
        desc: 'Explore delegating development tasks inside a GitHub workflow — from writing an actionable issue to reviewing a generated pull request. Participants learn to scope permissions, verify generated code and tests, and integrate the agent into team contribution rules.',
        audience: 'Developers, repository maintainers, tech leads and software quality leads.',
        format: 'Onsite · Virtual · Private Corporate',
        outcomes: [
          'Delegate a precisely scoped task',
          "Track an agent's actions",
          'Review code, tests and security',
          'Define team governance',
        ],
        modules: ['Writing an Actionable Issue', 'Scoping Permissions & Branch Rules', 'Reviewing Agent-Generated Changes', 'Security & Dependency Checks', 'Team Governance & Audit'],
        handsOn: 'Participants take an issue through to a reviewed, mergeable pull request, then define team rules for who can delegate, approve and audit agent actions.',
        tools: ['GitHub', 'CI'],
        prerequisites: 'Practice with GitHub, branches, pull requests and CI. Access to the agentic features of the practice account.',
        customization: 'Offer to prepare — can be adapted toward GH-600 exam preparation after separate verification against the current official objectives.',
      },
    ],
  },
  {
    id: 'governance', label: 'Governance & Responsible Deployment', color: '#FFB800',
    courses: [
      {
        id: 'ai-governance-act',
        title: 'AI Governance & the EU AI Act',
        duration: '2 Days', level: 'Foundation to Intermediate',
        desc: 'Help teams deploying AI make their usage visible, documented and controllable. Starting from real cases, the program inventories tools, classifies risk, organizes human validation and keeps the evidence governance requires. Introduces EU AI Act concepts and their practical implications — not a substitute for legal advice.',
        audience: 'AI project leads, operations managers, adoption champions, and compliance or security teams (co-facilitation).',
        format: 'Onsite · Virtual · Private Corporate',
        outcomes: [
          'Map AI usage across the organization',
          'Identify data and risk',
          'Define controls, roles and evidence',
          'Prepare an action plan with the right specialists',
        ],
        modules: ['Usage Inventory', 'Risk Assessment', 'Validation Chain & Ownership', 'Evidence & Monitoring Plan'],
        handsOn: 'Participants build a use-case inventory sheet, a risk matrix, a validation procedure for a new use case, and a draft action plan.',
        tools: ['—'],
        prerequisites: 'General awareness of AI usage in the enterprise. Detailed legal interpretation is left to a compliance/legal specialist.',
        customization: 'Best delivered co-facilitated with a legal or compliance specialist for regulatory obligations.',
      },
    ],
  },
]

// ── Role-Based AI Programs ────────────────────────────────────
export const ROLE_BASED_PROGRAMS = [
  { title: 'AI for HR',                      tag: 'Prior Delivery Experience',   verified: true,  desc: 'Job descriptions · onboarding content · internal communications · meeting summaries' },
  { title: 'AI for Banking / Financial Services', tag: 'Prior Delivery Experience', verified: true, desc: 'Document & executive summaries · meeting preparation · professional emails · responsible AI usage & human validation' },
  { title: 'AI for Real Estate',             tag: 'Prior Delivery Experience',   verified: true,  desc: 'Client follow-up · property/project presentations · client requirement summaries · meeting preparation' },
  { title: 'AI for Sales',                   tag: 'Customizable Program Variant', verified: false, desc: 'Prospect research · emails · meeting preparation · follow-ups & proposals' },
  { title: 'AI for Marketing',               tag: 'Customizable Program Variant', verified: false, desc: 'Campaign ideation · content creation · social media · creative briefs · AI video' },
  { title: 'AI for Managers',                tag: 'Customizable Program Variant', verified: false, desc: 'AI adoption decisions · productivity use cases · team enablement priorities' },
]

// ── Development training — grouped by language/stack ──────────
export type DevGroup = { id: string; title: string; icon: string; topics: string[]; example: string }

export const DEV_TRAINING: DevGroup[] = [
  {
    id: 'web-frontend',
    title: 'Web & Front-End',
    icon: 'code',
    topics: ['HTML', 'CSS', 'Bootstrap', 'JavaScript', 'React JS'],
    example: 'Build and deploy a responsive, interactive website from scratch.',
  },
  {
    id: 'java',
    title: 'Java',
    icon: 'coffee',
    topics: ['Java SE', 'Java EE', 'Java OOP'],
    example: 'Structure an object-oriented back-end service in Java.',
  },
  {
    id: 'python',
    title: 'Python',
    icon: 'terminal',
    topics: ['Python', 'Python OOP'],
    example: 'Build a Python application using object-oriented design.',
  },
  {
    id: 'php',
    title: 'PHP',
    icon: 'server',
    topics: ['PHP Procedural', 'PHP OOP', 'PHP MVC', 'Build an Online Shop in PHP'],
    example: 'Build a functioning online shop — from procedural PHP to MVC architecture.',
  },
  {
    id: 'sql',
    title: 'Databases',
    icon: 'database',
    topics: ['SQL', 'PostgreSQL'],
    example: 'Design and query a relational database.',
  },
  {
    id: 'github',
    title: 'GitHub',
    icon: 'git',
    topics: ['Git', 'GitHub'],
    example: 'Version a project and collaborate through branches, commits and pull requests.',
  },
  {
    id: 'mobile-flutter',
    title: 'Mobile Development',
    icon: 'mobile',
    topics: ['Flutter'],
    example: 'Build and ship a cross-platform mobile app for iOS and Android.',
  },
  {
    id: 'cms',
    title: 'CMS',
    icon: 'layout',
    topics: ['WordPress'],
    example: 'Build and publish a website using WordPress.',
  },
  {
    id: 'project-management',
    title: 'Project Management',
    icon: 'kanban',
    topics: ['Agile'],
    example: 'Run a development project through Agile ceremonies — backlog, sprints, retrospectives.',
  },
  {
    id: 'ai-dev',
    title: 'AI-Assisted Development',
    icon: 'sparkle',
    topics: ['Claude', 'Codex'],
    example: 'Build and ship a real feature using an AI coding assistant end-to-end.',
  },
  {
    id: 'marketing-tools',
    title: 'Digital Marketing & Analytics',
    icon: 'chart',
    topics: ['Google Ads', 'Google Tag Manager'],
    example: 'Set up a tracked ad campaign with Google Ads and Google Tag Manager.',
  },
]

// ── Verified proof / links ────────────────────────────────────
export const PROOF_LINKS = {
  elearningPlatform: { label: 'Académie WS — My e-Learning Platform', url: 'https://www.academiews.com/', desc: 'Founded and built 2022–2025. Online learning platform with progressive learning paths, from beginner to professional level.' },
  youtube:           { label: 'Discover my YouTube Channel', url: 'https://www.youtube.com/@samih-habbani', desc: '1,000+ educational videos produced across programming and digital-marketing topics.' },
  trainingCatalogue: { label: 'Download Training Catalogue (PDF)', url: '/samih-habbani-training-catalogue.pdf' },
  linkedin:          { label: 'LinkedIn', url: 'https://linkedin.com/in/samih-habbani' },
}

export const TRAINING_ORGANIZATIONS = [
  'M2I Formation', 'AFPA', 'WebForce3', 'IIM Digital School', 'Morgan International', 'Octus Mindz Training', 'OFPPT', 'Logiscool', 'The Kid Space',
]

export const GALLERY_PHOTOS = [
  { src: '/samih-class.webp', caption: 'AI marketing workshop — Académie WS' },
  { src: '/samih-waicf.webp', caption: 'World AI Cannes Festival 2024 — with students' },
]

// ── Student reviews — verified, real quotes from Académie WS's public
// Google Business Profile (accessed 2026-09-30). Not translated: kept in
// the students' original French. Ratings breakdown as published by Google.
export const REVIEWS_SUMMARY = {
  rating:     4.9,
  count:      161,
  source:     'Google avis',
  sourceUrl:  'https://share.google/WUUcbmR8rDbAj3qli',
  breakdown:  { 5: 152, 4: 7, 3: 1, 2: 0, 1: 1 },
}

export const REVIEWS = [
  {
    name:    'Enzo Dominguez',
    rating:  5,
    date:    'Visité en octobre 2024',
    course:  'HTML — Débutant',
    quote:   "J'ai suivi un cours de HTML débutant avec Sami, et je ne peux que le recommander ! Sami est un enseignant exceptionnel qui sait rendre le contenu accessible et engageant. Sa pédagogie est claire, et il prend le temps d'expliquer chaque concept en profondeur. Les cours sont bien structurés, avec un bon équilibre entre théorie et pratique. J'ai particulièrement apprécié les exercices interactifs qui m'ont permis de mettre en pratique ce que j'apprenais. Sami est toujours disponible pour répondre aux questions et offre des conseils utiles pour progresser. Sa passion pour le développement web est contagieuse, ce qui rend les leçons encore plus motivantes.",
  },
  {
    name:    'Thélo Guibert',
    rating:  5,
    date:    'Visité en novembre 2024',
    course:  null,
    quote:   "Formation d'excellente qualité !! Le formateur est clair et extrêmement pédagogue. Que vous soyez débutant ou plus expérimenté, vous trouverez votre bonheur dans cette formation c'est une certitude !!",
    reply:   'Merci Thélo :)',
  },
]
