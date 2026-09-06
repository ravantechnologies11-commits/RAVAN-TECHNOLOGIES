import { 
  Founder, 
  LeadershipMember, 
  ServiceItem, 
  SolutionItem, 
  ProjectItem, 
  HackathonItem, 
  LearningProgram, 
  EcosystemItem, 
  MediaItem, 
  ContactEnquiry, 
  SiteSettings, 
  SEOSettings,
  AuditLog,
  NavigationItem,
  GalleryAlbum,
  BlogPost,
  EventItem,
  TestimonialItem,
  PartnerItem,
  ClientItem,
  RoleItem,
  AIMLModel
} from '../types';

export const initialFounder: Founder = {
  id: 'founder-001',
  name: 'V ABISHEK',
  designation: 'Founder of RAVAN TECHNOLOGIES',
  company_branch: 'Ravan Technologies',
  bio: 'Architecting sovereign digital infrastructure and enterprise software platforms.',
  vision: 'To engineer self-reliant technology ecosystems that empower institutional autonomy.',
  quote: 'We are not merely building software; we are constructing the digital infrastructure that will dictate the next century of enterprise efficiency. Sovereign Intelligence is the mandate.',
  quote_author_tag: 'Executive Address',
  image_url: 'https://iecesxahkbkkafzmzwcd.supabase.co/storage/v1/object/public/avatars/founder/1788068046599_4p0eqd.jpg',
  display_order: 1,
  status: 'published',
  slug: 'v-abishek',
  short_intro: 'Architecting sovereign digital infrastructure and enterprise software platforms.',
  focus_areas: [
    'Enterprise Architecture',
    'Sovereign AI Models',
    'Global Tech Strategy',
    'Decentralized Infrastructure'
  ],
  tenure_years: '2 Years',
  achievements: [
    'Pioneered Sovereign Intelligence framework for enterprise AI model governance.',
    'Established Ravan Tech Park spanning dedicated R&D infrastructure.',
    'Founded Ravan Hackathon series engaging engineering builders globally.'
  ],
  custom_sections: [
    {
      id: 'custom-1788551949892',
      title: 'SKILLS',
      content: '• Programming Languages – Python, JavaScript, C, C++\n• Web Development – HTML, CSS, JavaScript\n• Machine Learning – ML Models, Data Processing\n• Artificial Intelligence – AI Applications, LLM Integration\n• Full-Stack Development – Frontend & Backend\n• Database – MySQL, Firebase, Supabase\n• API Development – REST APIs, API Integration\n• Project Development – Real-World Projects & Applications\n• Git & GitHub – Version Control & Collaboration\n• Deployment – Vercel, Hosting & Deployment\n• UI/UX – Web Interface Design\n• Problem Solving – Debugging & Optimization'
    }
  ],
  education: [],
  projects: [],
  experience_records: [],
  structured_skills: [],
  public_email: 'founder@ravantechnologies.com',
  social_links: {
    linkedin: 'https://linkedin.com/company/ravantechnologies',
    twitter: 'https://twitter.com/ravantech',
    email: 'founder@ravantechnologies.com'
  },
  seo_title: 'V ABISHEK — Founder & Architect | Ravan Technologies',
  seo_description: 'Discover the visionary leadership and engineering philosophy behind Ravan Technologies.',
  canonical_url: '/team/v-abishek',
  og_image: 'https://iecesxahkbkkafzmzwcd.supabase.co/storage/v1/object/public/avatars/founder/1788068046599_4p0eqd.jpg',
  updated_at: new Date().toISOString()
};

export const initialFounders: Founder[] = [initialFounder];

export const initialLeadership: LeadershipMember[] = [
  {
    id: 'lead-001',
    name: 'A. BERRY SUGANDH SURYA',
    designation: 'Co-Founder & Chief Operating Officer',
    company_branch: 'Ravan Technologies',
    bio: 'Oversees engineering execution, edge computing, distributed software architectures, and institutional partnerships.',
    image_url: '',
    display_order: 1,
    status: 'published',
    slug: 'a-berry-sugandh-surya',
    social_links: {
      linkedin: 'https://linkedin.com/in/berrysugandh-surya-a-68650b396',
      github: 'https://github.com/Berry1924',
      twitter: 'https://x.com/BerrySugandh19',
      whatsapp: 'https://wa.me/916380698291'
    }
  },
  {
    id: 'lead-002',
    name: 'SIBI RAJ U',
    designation: 'CEO — Ravan Technologies',
    company_branch: 'Ravan Tech Park',
    bio: 'Drives enterprise software strategy, core platform delivery, and high-concurrency client architectures.',
    image_url: 'https://iecesxahkbkkafzmzwcd.supabase.co/storage/v1/object/public/avatars/leadership/1788253631161_ho62j1.jpg',
    display_order: 2,
    status: 'published',
    slug: 'sibi-raj-u',
    social_links: {
      linkedin: 'https://linkedin.com',
      twitter: 'https://twitter.com'
    }
  },
  {
    id: 'lead-003',
    name: 'V.VINOTHKUMAR',
    designation: 'MANAGER',
    company_branch: 'Ravan Technologies',
    bio: 'Leads physical campus innovation, advanced supercomputing clusters, hardware testbeds, and university R&D partnerships.',
    image_url: 'https://iecesxahkbkkafzmzwcd.supabase.co/storage/v1/object/public/avatars/leadership/1788492358087_n1lya4.jpg',
    display_order: 3,
    status: 'published',
    slug: 'v-vinothkumar',
    social_links: {
      linkedin: 'https://www.linkedin.com/in/vinoth-kumar-396180382'
    }
  },
  {
    id: 'lead-004',
    name: 'MITHRA.S',
    designation: 'MANAGER',
    company_branch: 'Ravan Technologies',
    bio: 'Pioneering real-time virtual production pipelines, generative media workflows, and cinematic storytelling.',
    image_url: 'https://iecesxahkbkkafzmzwcd.supabase.co/storage/v1/object/public/avatars/leadership/1788515381289_jbldgw.jpg',
    display_order: 4,
    status: 'published',
    slug: 'mithra-s',
    social_links: {
      linkedin: 'https://www.linkedin.com/in/mithra-s-engg-592708382'
    }
  }
];

export const initialServices: ServiceItem[] = [
  {
    id: 'srv-001',
    slug: 'software-engineering',
    title: 'Software Engineering',
    code: '01 // CORE INFRASTRUCTURE',
    short_description: 'High-performance, fault-tolerant enterprise architectures built on modern, secure stacks. We engineer for the next decade, not just the next release.',
    full_description: 'Bespoke, enterprise-grade software development focused on scalability, security, and maintainability. We build the foundational systems that power complex operational workflows and high-concurrency transactions with sub-millisecond precision.',
    icon: 'integration_instructions',
    image_url: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1200&q=80',
    metric_value: '99.999%',
    metric_label: 'UPTIME SLA',
    features: [
      {
        title: 'Systems Architecture',
        description: 'Designing robust topologies for high-availability distributed environments.',
        icon: 'architecture'
      },
      {
        title: 'API & Integration Gateways',
        description: 'Seamlessly connecting disparate legacy systems into unified networks.',
        icon: 'hub'
      },
      {
        title: 'Immutable Data Layer',
        description: 'Zero-loss audit trails with cryptographic state guarantees.',
        icon: 'verified_user'
      }
    ],
    technologies: ['Rust', 'Go', 'TypeScript', 'PostgreSQL', 'Kafka', 'Kubernetes'],
    cta_text: 'VIEW SPECIFICATIONS',
    display_order: 1,
    status: 'published'
  },
  {
    id: 'srv-002',
    slug: 'applied-ai-ml',
    title: 'Applied AI & Machine Learning',
    code: '02 // SOVEREIGN INTELLIGENCE',
    short_description: 'Deploying sovereign intelligence models that automate complex reasoning, optimize logistics, and extract structured insight from chaotic enterprise data lakes.',
    full_description: 'Custom-trained large language models and reinforcement learning agents tailored to institutional data, executing complex reasoning under strict privacy and cryptographic governance.',
    icon: 'psychology',
    image_url: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=1200&q=80',
    metric_value: '99.8%',
    metric_label: 'MODEL ACCURACY',
    features: [
      {
        title: 'Predictive Analytics',
        description: 'Forecasting market trends and operational bottlenecks before they occur.',
        icon: 'trending_up'
      },
      {
        title: 'On-Premise LLM Deployment',
        description: 'Sovereign AI models operating completely isolated within your private security perimeter.',
        icon: 'memory'
      },
      {
        title: 'Neural Data Processing',
        description: 'Converting unstructured documents, audio, and visual streams into clean structured tensors.',
        icon: 'analytics'
      }
    ],
    technologies: ['PyTorch', 'TensorFlow', 'CUDA', 'LangChain', 'vLLM', 'Ray'],
    cta_text: 'EXPLORE MODELS',
    display_order: 2,
    status: 'published'
  },
  {
    id: 'srv-003',
    slug: 'web-development',
    title: 'Web Development',
    code: '03 // DIGITAL PRESENCE',
    short_description: 'Crafting high-fidelity, performant web applications that serve as the digital storefront for enterprise operations. We prioritize speed, accessibility, and immaculate design.',
    full_description: 'From mission-critical internal operations portals to executive investor dashboards, we build responsive, accessible, lightning-fast web applications designed for scale.',
    icon: 'web',
    image_url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80',
    metric_value: '100/100',
    metric_label: 'PERFORMANCE SCORE',
    features: [
      {
        title: 'High-Density Dashboards',
        description: 'Real-time telemetry and data rendering without UI lag.',
        icon: 'dashboard'
      },
      {
        title: 'Progressive Web Platforms',
        description: 'Offline-first, installable, ultra-fast client applications.',
        icon: 'devices'
      }
    ],
    technologies: ['React', 'Next.js', 'Tailwind CSS', 'WebSockets', 'Vite'],
    cta_text: 'VIEW CAPABILITIES',
    display_order: 3,
    status: 'published'
  },
  {
    id: 'srv-004',
    slug: 'digital-platforms',
    title: 'Digital Platforms',
    code: '04 // ECOSYSTEM ENGINE',
    short_description: 'End-to-end platform ecosystems designed for high-concurrency environments, integrating seamless API gateways with immutable data structures.',
    full_description: 'Multi-tenant enterprise platforms engineered to orchestrate massive participant networks, transactional settlements, and continuous operational intelligence.',
    icon: 'schema',
    image_url: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1200&q=80',
    metric_value: '50M+',
    metric_label: 'DAILY EVENTS',
    features: [
      {
        title: 'Multi-Tenant Isolation',
        description: 'Hardened tenant boundaries with shared elastic compute.',
        icon: 'security'
      },
      {
        title: 'Event-Driven Backbone',
        description: 'Sub-millisecond pub/sub streaming architecture.',
        icon: 'bolt'
      }
    ],
    technologies: ['Kafka', 'gRPC', 'Redis', 'Docker', 'Terraform'],
    cta_text: 'PLATFORM ARCHITECTURE',
    display_order: 4,
    status: 'published'
  },
  {
    id: 'srv-005',
    slug: 'technology-consulting',
    title: 'Technology Consulting',
    code: '05 // STRATEGIC DIRECTIVE',
    short_description: 'Executive advisory services for digital transformation, modernization of legacy architecture, and sovereign cloud migration strategies.',
    full_description: 'C-suite strategic roadmapping that aligns architectural rigor with long-term commercial goals, eliminating technical debt and future-proofing core IT assets.',
    icon: 'support_agent',
    image_url: 'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1200&q=80',
    metric_value: '40%+',
    metric_label: 'OPEX REDUCTION',
    features: [
      {
        title: 'Legacy Modernization',
        description: 'Deconstructing monolithic bottlenecks into modular microservices.',
        icon: 'transform'
      },
      {
        title: 'Security Audits',
        description: 'Zero-trust architecture verification and penetration testing.',
        icon: 'shield'
      }
    ],
    technologies: ['Cloud Architecture', 'Zero Trust', 'FinOps', 'DevSecOps'],
    cta_text: 'REQUEST CONSULTATION',
    display_order: 5,
    status: 'published'
  },
  {
    id: 'srv-006',
    slug: 'automation',
    title: 'Intelligent Automation',
    code: '06 // OPERATIONAL VELOCITY',
    short_description: 'Eliminating repetitive friction across enterprise workflows through cognitive robotic process automation and AI orchestrators.',
    full_description: 'Autonomous agents that monitor pipelines, trigger remediations, generate documentation, and reconcile complex data streams in real time.',
    icon: 'smart_toy',
    image_url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80',
    metric_value: '10x',
    metric_label: 'SPEED TO RESOLUTION',
    features: [
      {
        title: 'Self-Healing Infrastructure',
        description: 'Automated anomaly detection and instant failover execution.',
        icon: 'healing'
      },
      {
        title: 'Workflow Orchestration',
        description: 'End-to-end pipeline automation across multi-cloud environments.',
        icon: 'account_tree'
      }
    ],
    technologies: ['Temporal', 'Airflow', 'Python', 'Webhooks', 'Docker'],
    cta_text: 'EXPLORE AUTOMATION',
    display_order: 6,
    status: 'published'
  },
  {
    id: 'srv-007',
    slug: 'hackathon-solutions',
    title: 'Hackathon Solutions',
    code: '07 // RAPID INNOVATION',
    short_description: 'Designing, hosting, and executing high-stakes competitive engineering hackathons for Fortune 500 enterprises and government agencies.',
    full_description: 'From problem formulation to custom judge scoring engines and deployment sandboxes, we turn hackathons into production-grade IP generators.',
    icon: 'emoji_events',
    image_url: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=1200&q=80',
    metric_value: '500+',
    metric_label: 'SOLUTIONS BUILT',
    features: [
      {
        title: 'Problem Formulation',
        description: 'Curating real, measurable technical bottlenecks for top builders.',
        icon: 'assignment'
      },
      {
        title: 'Judging Sandbox',
        description: 'Automated benchmark evaluation and test suite runners.',
        icon: 'fact_check'
      }
    ],
    technologies: ['Hackathon OS', 'Judge Sandbox', 'Docker Testbeds'],
    cta_text: 'HOST A HACKATHON',
    display_order: 7,
    status: 'published'
  },
  {
    id: 'srv-008',
    slug: 'learning-solutions',
    title: 'Learning Solutions',
    code: '08 // ACADEMY & WORKFORCE',
    short_description: 'Comprehensive software engineering and AI/ML upskilling programs built for developers, engineering teams, and institutional partners.',
    full_description: 'Curriculums centered on our 4-phase methodology (Learn -> Build -> Compete -> Solve) to transform theoretical knowledge into battle-tested capabilities.',
    icon: 'school',
    image_url: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80',
    metric_value: '1,200+',
    metric_label: 'ENGINEERS TRAINED',
    features: [
      {
        title: 'Project-Based Labs',
        description: 'Hands-on coding inside cloud-provisioned IDE workspaces.',
        icon: 'terminal'
      },
      {
        title: 'Industry Mentorship',
        description: 'Direct code reviews from senior enterprise architects.',
        icon: 'groups'
      }
    ],
    technologies: ['Interactive Sandbox', 'AI Code Reviewer', 'LMS'],
    cta_text: 'EXPLORE ACADEMY',
    display_order: 8,
    status: 'published'
  }
];

export const initialSolutions: SolutionItem[] = [
  {
    id: 'sol-001',
    slug: 'sovereign-ai-governance',
    title: 'Sovereign AI & Data Governance Framework',
    category: 'Applied AI',
    description: 'An air-gapped enterprise cognitive computing framework that guarantees proprietary institutional data never leaves the organization.',
    architecture_details: 'Runs isolated open-weights LLMs on dedicated GPU clusters with differential privacy layers and cryptographic validation of model inferences.',
    benefits: [
      'Absolute data sovereignty and zero third-party telemetry exposure',
      'Compliance with strict financial and defense sector regulations',
      'Deterministic output auditing and prompt leakage prevention'
    ],
    image_url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
    display_order: 1,
    status: 'published'
  },
  {
    id: 'sol-002',
    slug: 'high-concurrency-fintech-core',
    title: 'Ultra-Low Latency Settlement Engine',
    category: 'Distributed Systems',
    description: 'High-throughput transactional engine capable of processing 250,000+ orders per second with deterministic sub-millisecond execution.',
    architecture_details: 'Engineered in bare-metal Rust utilizing memory-mapped ring buffers, lock-free data structures, and kernel-bypass networking.',
    benefits: [
      'Sub-50 microsecond execution latency',
      'Zero garbage collection pauses or thread contention',
      'Immutable cryptographic ledger synchronization'
    ],
    image_url: 'https://images.unsplash.com/photo-1642543492481-44e81e3914a7?auto=format&fit=crop&w=1200&q=80',
    display_order: 2,
    status: 'published'
  },
  {
    id: 'sol-003',
    slug: 'decentralized-logistics-mesh',
    title: 'Decentralized Logistics & Supply Chain Mesh',
    category: 'Supply Chain',
    description: 'Predictive digital twin topology providing end-to-end multi-modal cargo visibility and automated route rebalancing.',
    architecture_details: 'Combines geospatial graph neural networks with IoT telemetry gateways to dynamically compute route efficiency.',
    benefits: [
      '42% reduction in shipment transit delays',
      'Real-time automated customs documentation reconciliation',
      'Proactive temperature and integrity monitoring for sensitive cargo'
    ],
    image_url: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1200&q=80',
    display_order: 3,
    status: 'published'
  }
];

export const initialProjects: ProjectItem[] = [
  {
    id: 'proj-001',
    slug: 'nexus-liquidity-protocol',
    project_number: 'PROJECT 01',
    title: 'Nexus Liquidity Protocol',
    category: 'FINTECH',
    problem: 'Institutional traders faced highly fragmented liquidity pools across decentralized exchanges, resulting in prohibitive slippage on high-volume transactions.',
    solution: 'An intelligent routing engine leveraging zero-knowledge proofs to aggregate liquidity across 18 protocols while maintaining absolute trade confidentiality.',
    technologies: ['Rust', 'Solidity', 'Apache Kafka', 'PostgreSQL', 'ZK-SNARKs'],
    outcome_metric: '$2.4B',
    outcome_label: 'Vol. Processed',
    image_url: 'https://images.unsplash.com/photo-1642543492481-44e81e3914a7?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1642543492481-44e81e3914a7?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80'
    ],
    featured: true,
    display_order: 1,
    status: 'published'
  },
  {
    id: 'proj-002',
    slug: 'aegis-supply-chain-core',
    project_number: 'PROJECT 02',
    title: 'Aegis Supply Chain Core',
    category: 'LOGISTICS',
    problem: 'Global logistics networks operated in data silos, causing a 14% average delay in critical manufacturing component deliveries and opaque shipment tracking.',
    solution: 'A predictive digital twin of the entire supply chain, utilizing reinforcement learning to dynamically re-route shipments around geopolitical and weather anomalies.',
    technologies: ['Python', 'TensorFlow', 'Go', 'GraphQL', 'TimescaleDB'],
    outcome_metric: '-42%',
    outcome_label: 'Latency Reduction',
    image_url: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1200&q=80'
    ],
    featured: true,
    display_order: 2,
    status: 'published'
  },
  {
    id: 'proj-003',
    slug: 'sovereign-ai-knowledge-mesh',
    project_number: 'PROJECT 03',
    title: 'Sovereign AI Knowledge Mesh',
    category: 'AI / ML',
    problem: 'An international healthcare consortium needed automated diagnostic assistance across 40 hospitals without exposing patient records to external cloud APIs.',
    solution: 'Engineered air-gapped on-premise neural inference clusters with federated learning pipelines, indexing 12M+ clinical records with strict HIPAA compliance.',
    technologies: ['PyTorch', 'vLLM', 'CUDA', 'FastAPI', 'Qdrant Vector DB'],
    outcome_metric: '99.8%',
    outcome_label: 'Diagnostic Accuracy',
    image_url: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1200&q=80',
    gallery: [],
    featured: true,
    display_order: 3,
    status: 'published'
  },
  {
    id: 'proj-004',
    slug: 'apex-cloud-orchestrator',
    project_number: 'PROJECT 04',
    title: 'Apex Cloud Orchestrator',
    category: 'INFRASTRUCTURE',
    problem: 'Legacy bare-metal and hybrid cloud resources were underutilized by 65%, resulting in millions in wasted server capacity annually.',
    solution: 'An elastic scheduling orchestrator utilizing predictive workload modeling to pack and migrate microservices with zero application downtime.',
    technologies: ['Kubernetes', 'Go', 'Prometheus', 'eBPF', 'Terraform'],
    outcome_metric: '58%',
    outcome_label: 'Cloud Cost Savings',
    image_url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80',
    gallery: [],
    featured: false,
    display_order: 4,
    status: 'published'
  }
];

export const initialHackathon: HackathonItem = {
  id: 'hack-001',
  title: 'Ravan Hackathon Vol. IV',
  edition: 'Vol. IV',
  event_date: 'OCTOBER 24, 2026',
  status: 'upcoming',
  focus_statement: 'Focus: Decentralized Logistics Optimization & Sovereign Compute',
  description: 'Theory is insufficient. Our hackathon ecosystem is the crucible where theoretical engineering meets the uncompromising demands of actual enterprise bottlenecks. We convene top-tier talent to forge robust solutions under pressure.',
  image_url: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1200&q=80',
  solutions_deployed_count: '500+',
  tracks: [
    {
      id: 'track-1',
      track_number: 'Track 01',
      title: 'Sustainable Compute',
      description: 'Optimizing algorithmic efficiency to reduce the carbon footprint of large-scale AI training models and decentralized networks.',
      image_url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80',
      teams_registered: 32,
      badge_color: 'primary'
    },
    {
      id: 'track-2',
      track_number: 'Track 02',
      title: 'Urban Mobility Graph',
      description: 'Real-time multi-agent pathfinding for autonomous electric fleet coordination across congested metropolitan grids.',
      image_url: 'https://images.unsplash.com/photo-1508873696983-2df5293cb32b?auto=format&fit=crop&w=800&q=80',
      teams_registered: 46,
      badge_color: 'secondary'
    },
    {
      id: 'track-3',
      track_number: 'Track 03',
      title: 'Sovereign Security & ZK Proofs',
      description: 'Zero-knowledge identity attestation and privacy-preserving verification for institutional transactions.',
      image_url: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=800&q=80',
      teams_registered: 28,
      badge_color: 'tertiary'
    }
  ],
  problem_statements: [
    {
      title: 'Dynamic Energy-Aware Model Quantization',
      domain: 'AI / Green Tech',
      description: 'Develop an automated compiler that quantizes neural weights based on real-time grid energy availability without degrading output quality below 98% baseline.'
    },
    {
      title: 'Sub-second Cross-Border Logistics Clearing',
      domain: 'Logistics / FinTech',
      description: 'Build an immutable peer-to-peer manifest verification pipeline that executes automated escrow settlement upon sensor verified delivery.'
    }
  ],
  winning_solutions: [
    {
      rank: '1st Place — Vol. III',
      project_name: 'Helios Grid Allocator',
      team_name: 'Team Apex',
      description: 'Reinforcement learning system for microgrid battery storage arbitrage, now in pilot testing across 12 commercial sites.'
    },
    {
      rank: '2nd Place — Vol. III',
      project_name: 'CipherMesh ZK Validator',
      team_name: 'ZK Labs',
      description: 'High-speed zero-knowledge verifier executed directly on edge nodes with 80% lower memory footprint.'
    }
  ]
};

export const initialLearningPrograms: LearningProgram[] = [
  {
    id: 'learn-001',
    slug: 'enterprise-software-engineering',
    title: 'Enterprise Software Architecture',
    track_name: 'Sovereign Intelligence Track',
    badge: 'CORE TRACK',
    description: 'Master high-performance distributed systems, fault-tolerant patterns, and scalable microservices architecture in Rust and Go.',
    enrolled_count: '1,240+',
    image_url: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80',
    methodology_phase: '01 Learn',
    curriculum: [
      {
        id: 'mod-1',
        title: 'Distributed Systems & Consensus Topologies',
        level: 'Advanced',
        duration: '4 Weeks',
        topics: ['Raft & Paxos consensus', 'Event sourcing', 'CQRS architecture', 'CAP theorem trade-offs']
      },
      {
        id: 'mod-2',
        title: 'High-Concurrency Concurrency in Rust & Go',
        level: 'Advanced',
        duration: '4 Weeks',
        topics: ['Memory safety without GC', 'Lock-free structures', 'Async I/O with Tokio', 'Channels & Goroutines']
      }
    ],
    prerequisites: ['Proficiency in at least one systems programming language', 'Data structures & algorithms'],
    display_order: 1,
    status: 'published'
  },
  {
    id: 'learn-002',
    slug: 'applied-ai-ml-engineering',
    title: 'Applied AI & Neural Model Deployment',
    track_name: 'AI Engineering Track',
    badge: 'AI SPECIALIZATION',
    description: 'From PyTorch training loops to high-throughput vLLM inference clusters, learn to deploy sovereign AI models on enterprise infrastructure.',
    enrolled_count: '980+',
    image_url: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=800&q=80',
    methodology_phase: '02 Build',
    curriculum: [
      {
        id: 'mod-1',
        title: 'Custom Transformer Fine-Tuning & Quantization',
        level: 'Intermediate - Advanced',
        duration: '3 Weeks',
        topics: ['LoRA & QLoRA techniques', 'GGUF & AWQ formats', 'Evaluation benchmarks']
      },
      {
        id: 'mod-2',
        title: 'Vector Databases & Hybrid Search Pipelines',
        level: 'Intermediate',
        duration: '3 Weeks',
        topics: ['HNSW indexing', 'Reranking algorithms', 'Agentic tool calling frameworks']
      }
    ],
    prerequisites: ['Python proficiency', 'Linear algebra & calculus fundamentals'],
    display_order: 2,
    status: 'published'
  },
  {
    id: 'learn-003',
    slug: 'fullstack-web-architecture',
    title: 'High-Performance Web Platforms',
    track_name: 'Web Engineering Track',
    badge: 'WEB TRACK',
    description: 'Architecting modern web applications with sub-second page loads, real-time WebSockets, and state synchronization.',
    enrolled_count: '1,450+',
    image_url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80',
    methodology_phase: '01 Learn',
    curriculum: [
      {
        id: 'mod-1',
        title: 'Next.js 14 & Server Component Paradigms',
        level: 'Intermediate',
        duration: '3 Weeks',
        topics: ['Server Actions', 'Streaming SSR', 'Edge rendering', 'Caching layers']
      }
    ],
    prerequisites: ['JavaScript/TypeScript basics', 'HTML & CSS familiarity'],
    display_order: 3,
    status: 'published'
  },
  {
    id: 'learn-004',
    slug: 'hackathon-mastery',
    title: 'Rapid Prototyping & Hackathon Mastery',
    track_name: 'Innovation Track',
    badge: 'COMPETITION',
    description: 'Learn how to ideate, architect, and deliver award-winning MVPs in 48-hour sprints.',
    enrolled_count: '760+',
    image_url: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=800&q=80',
    methodology_phase: '03 Compete',
    curriculum: [
      {
        id: 'mod-1',
        title: '48-Hour Sprint Frameworks',
        level: 'All Levels',
        duration: '2 Weeks',
        topics: ['Scoping feasibility', 'Pitch deck structuring', 'Demo video creation']
      }
    ],
    prerequisites: ['Basic coding literacy'],
    display_order: 4,
    status: 'published'
  }
];

export const initialEcosystem: EcosystemItem[] = [
  {
    id: 'eco-001',
    name: 'Ravan Tech Park',
    type: 'hub',
    tagline: 'The Sovereign Epicenter for Engineering Excellence',
    description: 'A physical manifestation of our commitment to scalable AI infrastructure, collaborative innovation, and rigorous software architecture. Spanning over 120,000 square feet of state-of-the-art labs, server clusters, and collaborative workspaces.',
    image_url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80',
    metrics: {
      value: '120k+',
      label: 'Sq Ft. Dedicated to R&D',
      sublabel: 'Tier-4 Datacenter Facilities'
    },
    features: [
      {
        title: 'High-Density GPU Clusters',
        description: 'Direct liquid-cooled compute clusters dedicated to sovereign model training.',
        icon: 'memory'
      },
      {
        title: 'Hardware Testbeds',
        description: 'Physical prototyping sandboxes with IoT telemetry testing facilities.',
        icon: 'developer_board'
      },
      {
        title: 'Collaborative Amphitheaters',
        description: 'Modern presentation auditoriums hosting hackathons and global tech summits.',
        icon: 'groups'
      }
    ],
    specifications: [
      '120,000+ sq ft campus footprint',
      'Dual-redundant 100Gbps optical dark fiber links',
      'Dedicated Tier-4 on-premise datacenter',
      '24/7 biometric physical and digital security'
    ],
    status_badge: 'ENTERPRISE HUB'
  },
  {
    id: 'eco-002',
    name: 'Ravan Film Studio',
    type: 'studio',
    tagline: 'Bridging Technical Precision with Visionary Storytelling',
    description: 'High-fidelity digital media production and cinematic narratives engineered for global impact. Equipped with real-time LED volume virtual production stages and 8K workflows.',
    image_url: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=1200&q=80',
    metrics: {
      value: '4K/8K',
      label: 'Virtual Production Pipeline',
      sublabel: 'Real-Time Unreal Engine LED Volume'
    },
    features: [
      {
        title: 'Virtual LED Volume Wall',
        description: 'Real-time in-camera visual effects powered by GPU rendering clusters.',
        icon: 'videocam'
      },
      {
        title: 'Cinematic Storytelling Lab',
        description: 'Creative incubation for short films, digital series, and tech documentaries.',
        icon: 'movie_filter'
      },
      {
        title: 'Post-Production Audio Suites',
        description: 'Dolby Atmos calibrated mixing stages and spatial audio master suites.',
        icon: 'graphic_eq'
      }
    ],
    specifications: [
      '50ft curved LED volume with sub-millimeter pixel pitch',
      'Motion-controlled robotic camera rigs',
      'Multi-terabit NVMe storage network for uncompressed 8K RAW',
      'Color-grading theater with HDR mastering monitors'
    ],
    status_badge: 'CREATIVE VENTURE'
  }
];

export const initialMedia: MediaItem[] = [
  {
    id: 'med-001',
    name: 'Ravan Technologies Logo (Primary)',
    category: 'brand',
    file_type: 'image',
    file_size: '42 KB',
    url: '/images/ravan-logo.png',
    dimensions: '512x512',
    tags: ['logo', 'brand', 'identity'],
    created_at: new Date().toISOString()
  },
  {
    id: 'med-002',
    name: 'Founder Portrait (Studio)',
    category: 'founder',
    file_type: 'image',
    file_size: '280 KB',
    url: '/images/founder-real.jpg',
    dimensions: '1254x1254',
    tags: ['founder', 'portrait', 'leadership'],
    created_at: new Date().toISOString()
  },
  {
    id: 'med-003',
    name: 'Ravan Tech Park Twilight Campus',
    category: 'ecosystem',
    file_type: 'image',
    file_size: '420 KB',
    url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80',
    dimensions: '1920x1080',
    tags: ['tech park', 'campus', 'architecture'],
    created_at: new Date().toISOString()
  },
  {
    id: 'med-004',
    name: 'Film Studio Virtual Production Stage',
    category: 'ecosystem',
    file_type: 'image',
    file_size: '510 KB',
    url: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=1200&q=80',
    dimensions: '1920x1080',
    tags: ['film studio', 'production', 'cinema'],
    created_at: new Date().toISOString()
  },
  {
    id: 'med-005',
    name: 'Hackathon Collaborative Arena',
    category: 'hackathons',
    file_type: 'image',
    file_size: '390 KB',
    url: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1200&q=80',
    dimensions: '1920x1080',
    tags: ['hackathon', 'builders', 'events'],
    created_at: new Date().toISOString()
  }
];

export const initialEnquiries: ContactEnquiry[] = [];

export const initialSiteSettings: SiteSettings = {
  site_name: 'Ravan Technologies',
  tagline: 'Building Technology. Solving Real Problems.',
  description: 'Architecting sovereign software systems, enterprise intelligence, and physical computing infrastructure for institutional scale.',
  logo_url: 'https://iecesxahkbkkafzmzwcd.supabase.co/storage/v1/object/public/site-assets/branding/ravan-logo.png?v=1788066287989',
  contact_email: 'ravantechnology001@gmail.com',
  contact_phone: '',
  office_address: 'Ravan Technologies Headquarters, Thiruvannamalai, Tamil Nadu, India',
  hq_location: 'Thiruvannamalai, Tamil Nadu, India',
  hq_label: 'Global Headquarters',
  hq_city: 'Thiruvannamalai',
  hq_state: 'Tamil Nadu',
  hq_country: 'India',
  social_links: {
    instagram: 'https://www.instagram.com/ravan__tech?igsi=ZGEyYWU1ODljd3p0'
  },
  maintenance_mode: false,
  hero_image_url: '',
  hero_image_alt: 'Ravan Technologies Sovereign Intelligence Infrastructure',
  hero_image_focal_x: 50,
  hero_image_focal_y: 50,
  hero_image_zoom: 1,
  hero_badge_text: 'SOVEREIGN INTELLIGENCE IN ENTERPRISE ENGINEERING',
  hero_title: 'Building Technology. Solving Real Problems.',
  hero_subtitle: 'Ravan Technologies builds software, AI/ML solutions, learning platforms and innovation programs designed to solve meaningful real-world challenges.'
};

export const initialSEOSettings: SEOSettings = {
  meta_title: 'Ravan Technologies — Sovereign Intelligence in Enterprise Engineering',
  meta_description: 'Ravan Technologies engineers resilient, scalable software, applied AI/ML platforms, hackathon ecosystems, and advanced R&D campuses.',
  focus_keyword: 'Sovereign Intelligence, Enterprise Engineering',
  secondary_keywords: ['Enterprise Software', 'Applied Machine Learning', 'Ravan Tech Park'],
  og_title: 'Ravan Technologies — Building Technology. Solving Real Problems.',
  og_description: 'Sovereign Intelligence in Enterprise Engineering. Software, AI/ML, Hackathons, Tech Park & Film Studio.',
  og_image: '/images/ravan-logo.png',
  canonical_url: 'https://ravantechnologies.com',
  robots_index: true,
  robots_follow: true,
  schema_type: 'Organization'
};

export const initialAuditLogs: AuditLog[] = [];

export const initialNavigation: NavigationItem[] = [
  { id: 'nav-1', title: 'Home', path: '/', position: 'header', display_order: 1, is_active: true },
  { id: 'nav-2', title: 'About', path: '/about', position: 'header', display_order: 2, is_active: true },
  { id: 'nav-3', title: 'Services', path: '/services', position: 'header', display_order: 3, is_active: true },
  { id: 'nav-4', title: 'Solutions', path: '/solutions', position: 'header', display_order: 4, is_active: true },
  { id: 'nav-5', title: 'Hackathons', path: '/hackathons', position: 'header', display_order: 5, is_active: true, badge: 'VOL IV' },
  { id: 'nav-6', title: 'Learning', path: '/learning', position: 'header', display_order: 6, is_active: true },
  { id: 'nav-7', title: 'Projects', path: '/projects', position: 'header', display_order: 7, is_active: true },
  { id: 'nav-8', title: 'Ecosystem', path: '/ecosystem', position: 'header', display_order: 8, is_active: true },
  { id: 'nav-9', title: 'Team', path: '/team', position: 'header', display_order: 9, is_active: true },
  { id: 'nav-10', title: 'Contact', path: '/contact', position: 'header', display_order: 10, is_active: true }
];

export const initialGalleryAlbums: GalleryAlbum[] = [
  {
    id: 'alb-001',
    title: 'Ravan Tech Park Campus & GPU Datacenter',
    slug: 'tech-park-campus',
    description: 'State-of-the-art supercomputing facilities, direct liquid-cooled GPU clusters, and high-tech collaboration amphitheaters.',
    cover_image_url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80',
    category: 'campus',
    items_count: 6,
    status: 'published',
    display_order: 1
  },
  {
    id: 'alb-002',
    title: 'Virtual Production Stage & Soundstage Stills',
    slug: 'film-studio-production',
    description: 'Cinematic LED volume walls in action during real-time in-camera VFX production.',
    cover_image_url: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=1200&q=80',
    category: 'production',
    items_count: 5,
    status: 'published',
    display_order: 2
  },
  {
    id: 'alb-003',
    title: 'Ravan Hackathon Vol. III Arena & Builders',
    slug: 'hackathon-vol-3',
    description: 'High-stakes 48-hour competitive sprint with 500+ builders deploying sovereign compute solutions.',
    cover_image_url: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1200&q=80',
    category: 'hackathon',
    items_count: 8,
    status: 'published',
    display_order: 3
  }
];

export const initialBlogPosts: BlogPost[] = [
  {
    id: 'blog-001',
    slug: 'sovereign-ai-governance-next-decade',
    title: 'Sovereign Intelligence: The Mandatory Architecture for Enterprise AI in 2026',
    excerpt: 'Why cloud-dependent cognitive models are an existential vulnerability for institutional computing and how air-gapped sovereign clusters provide deterministic security.',
    content: 'As artificial intelligence transitions from experimental conversational interfaces to mission-critical operational backbones, the question of data sovereignty becomes non-negotiable...',
    cover_image_url: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=1200&q=80',
    author_name: 'V Abishek & AI Architecture Group',
    tags: ['AI Governance', 'Enterprise Architecture', 'Sovereignty'],
    read_time_minutes: 6,
    status: 'published',
    published_at: new Date(Date.now() - 3600000 * 72).toISOString()
  },
  {
    id: 'blog-002',
    slug: 'ultra-low-latency-rust-ring-buffers',
    title: 'Sub-Microsecond Order Routing: Engineering Ring Buffers in Bare-Metal Rust',
    excerpt: 'Deconstructing memory allocation overhead, kernel bypass networking, and zero-copy packet structures for modern high-concurrency clearing systems.',
    content: 'Traditional garbage-collected runtimes introduce non-deterministic tail latencies that cost institutional traders millions in slippage...',
    cover_image_url: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1200&q=80',
    author_name: 'Distributed Systems Team',
    tags: ['Rust', 'FinTech', 'High Performance'],
    read_time_minutes: 8,
    status: 'published',
    published_at: new Date(Date.now() - 3600000 * 140).toISOString()
  }
];

export const initialEvents: EventItem[] = [
  {
    id: 'evt-001',
    title: 'Sovereign Intelligence Global Summit 2026',
    slug: 'sovereign-intelligence-summit-2026',
    event_type: 'summit',
    event_date: 'NOVEMBER 18, 2026',
    location: 'Ravan Tech Park Amphitheater, Thiruvannamalai & Global Livestream',
    description: 'An executive symposium gathering chief architects, distributed systems engineers, and AI researchers to discuss private model governance.',
    image_url: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80',
    registration_link: '/contact',
    status: 'upcoming'
  },
  {
    id: 'evt-002',
    title: 'Ravan Hackathon Vol. IV: Final Prototype Pitch Day',
    slug: 'hackathon-vol-iv-finals',
    event_type: 'workshop',
    event_date: 'OCTOBER 26, 2026',
    location: 'Main Arena, Ravan Tech Park',
    description: 'Top 10 finalist teams present working prototypes to an institutional jury of enterprise investors and tech leaders.',
    image_url: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=1200&q=80',
    registration_link: '/hackathons',
    status: 'upcoming'
  }
];

export const initialTestimonials: TestimonialItem[] = [];

export const initialPartners: PartnerItem[] = [
  { id: 'part-001', name: 'NVIDIA Inception', logo_url: 'https://upload.wikimedia.org/wikipedia/commons/2/21/Nvidia_logo.svg', category: 'technology', display_order: 1, status: 'published' },
  { id: 'part-002', name: 'Linux Foundation', logo_url: 'https://upload.wikimedia.org/wikipedia/commons/b/b5/Linux_Foundation_logo.svg', category: 'technology', display_order: 2, status: 'published' },
  { id: 'part-003', name: 'Indian Institute of Science (IISc)', logo_url: 'https://upload.wikimedia.org/wikipedia/en/thumb/f/f9/Indian_Institute_of_Science_2019_logo.svg/1200px-Indian_Institute_of_Science_2019_logo.svg.png', category: 'academic', display_order: 3, status: 'published' }
];

export const initialClients: ClientItem[] = [];

export const initialRoles: RoleItem[] = [
  { id: 'role-1', name: 'Super Admin', description: 'Unrestricted control across database, settings, users, and audit logs.', permissions: ['*'] },
  { id: 'role-2', name: 'Admin', description: 'Manage content, media, enquiries, and SEO.', permissions: ['content.*', 'media.*', 'enquiries.*', 'seo.*'] },
  { id: 'role-3', name: 'Editor', description: 'Draft and update articles, case studies, and services.', permissions: ['content.edit', 'content.create'] },
  { id: 'role-4', name: 'Media Manager', description: 'Upload and organize media library assets and gallery albums.', permissions: ['media.*', 'gallery.*'] },
  { id: 'role-5', name: 'Viewer', description: 'Read-only access to analytics and audit reports.', permissions: ['read.only'] }
];

export const initialAIMLModels: AIMLModel[] = [
  {
    id: 'aiml-001',
    name: 'Ravan-LLM-70B-Sovereign',
    provider: 'Ravan Technologies',
    model_type: 'Private Fine-Tuned Transformer',
    description: 'On-premise enterprise language model with air-gapped confidential compute and domain fine-tuning.',
    capabilities: ['Confidential Inference', 'Zero Data Retention', 'C++ Runtime Kernel', 'Low-Latency Token Streaming'],
    use_cases: ['Enterprise Knowledge Bases', 'Sovereign Legal/Financial Analysis', 'Mission-Critical Directives'],
    version: 'v3.2-production',
    latency: '12ms / token',
    status: 'published',
    display_order: 1
  },
  {
    id: 'aiml-002',
    name: 'Neural-Graph-Logistics-v3',
    provider: 'Ravan Technologies',
    model_type: 'Reinforcement Learning Graph',
    description: 'High-concurrency graph optimization network recalculating multi-modal logistics routes in sub-millisecond cycles.',
    capabilities: ['Dynamic Re-routing', 'Sub-millisecond Convergence', 'Zero Allocation Rust Engine'],
    use_cases: ['Supply Chain Routing', 'Distributed Power Grid Balancing', 'Physical Fleet Logistics'],
    version: 'v2.8-stable',
    latency: '450us recalculation',
    status: 'published',
    display_order: 2
  }
];
