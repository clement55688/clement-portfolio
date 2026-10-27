/**
 * Public facts for grounded AI features (fit checker, and later Q&A).
 * Resume text is from Clement Lin's resume dated 2026-08-25.
 * Repository blurbs are the public GitHub descriptions, plus the Catvolution
 * URL. Phone, email, and home address are intentionally omitted.
 */

export type ProfileLink = {
  label: string;
  href: string;
};

export type ProfileKind = "summary" | "role" | "project" | "repository" | "skill" | "education";

export type ProfileEntry = {
  id: string;
  kind: ProfileKind;
  title: string;
  organization?: string;
  location?: string;
  dates?: string;
  url?: string;
  highlights: string[];
};

export type Profile = {
  name: string;
  links: ProfileLink[];
  entries: ProfileEntry[];
};

export const profile: Profile = {
  name: "Clement Lin",
  links: [
    { label: "GitHub", href: "https://github.com/clement55688" },
    { label: "LinkedIn", href: "https://www.linkedin.com/in/clin0801" },
  ],
  entries: [
    {
      id: "summary",
      kind: "summary",
      title: "Summary",
      highlights: [
        "Full-stack software engineer with 4+ years of experience modernizing legacy platforms into scalable React/FastAPI products, secure APIs, and data systems. Delivered 5x faster validation workflows, 70% faster mission-brief generation, and more reliable releases through reusable UI patterns, CI/CD, testing, and AI-assisted development.",
      ],
    },
    {
      id: "role-rhombus",
      kind: "role",
      title: "Software Engineer, Full Stack",
      organization: "Rhombus Power",
      location: "Palo Alto, CA",
      dates: "Apr 2023 – Jan 2026",
      highlights: [
        "Modernized the DoD's Unified Force Structure Planner from a PHP/CodeIgniter application to a React 18 + FastAPI platform, reducing legacy code footprint by 40% and making data validation workflows 5x faster for 2,500+ planners.",
        "Automated mission-brief generation with a full-stack PPT export engine, linking Mapbox filters, PHP controllers, FastAPI services, and Redis-cached assets to produce decks 70% faster and eliminate manual brief assembly.",
        "Built a secure release foundation with JWT/Redis session fencing, RBAC policies, dockerized React/PHP/FastAPI/NGINX/MySQL/Redis services, and GitLab CI/CD pipelines across DEV/SIT/PROD, reducing deployment time by 25–30% while improving release consistency and environment parity.",
        "Improved backend service quality by hardening FastAPI/PHP authentication, export, and data-validation APIs with stronger request validation, exception handling, and PHPUnit/Jest coverage, reducing post-release defects by 20%.",
        "Leveraged Figma Dev Mode/MCP and AI-assisted workflows to accelerate Figma-to-React page scaffolding, generate PHPUnit/Jest tests for new FastAPI/PHP features, and refactor generated code into review-ready React components aligned with API contracts and reusable UI patterns.",
      ],
    },
    {
      id: "role-ocbridge",
      kind: "role",
      title: "Data Engineer / Software Engineer, Full Stack",
      organization: "OCBridge",
      location: "San Jose, CA",
      dates: "Oct 2021 – Dec 2022",
      highlights: [
        "Designed and maintained scalable ETL pipelines processing 700,000+ candidate profiles with Python, Airflow, AWS S3, MySQL, and Redshift, powering QuickSight analytics dashboards and business reporting workflows.",
        "Automated web scraping and data ingestion workflows with Selenium, Python, AWS Lambda, and scheduled jobs, reducing manual intervention by 80% while improving data lake reliability.",
        "Led a team of 6 engineers while building backend data services with Node.js/Flask APIs, MySQL schemas, PySpark jobs, and third-party integrations, driving feature delivery, debugging, release planning, and stakeholder alignment.",
      ],
    },
    {
      id: "role-trc",
      kind: "role",
      title: "Software Engineer Intern",
      organization: "TRC Robotics",
      location: "San Jose, CA",
      dates: "Jun 2021 – Oct 2021",
      highlights: [
        "Strengthened application reliability by containerizing React/Node.js workloads with Docker/Kubernetes and integrating AWS Lambda workflows, increasing deployment efficiency by 30% and reducing downtime by 25%.",
      ],
    },
    {
      id: "project-inventory-notifier",
      kind: "project",
      title: "PS5/Nintendo Inventory Scraper and Notifier",
      organization: "Personal project",
      highlights: [
        "Built a React/Python inventory alert system on AWS EC2 with Selenium scrapers, proxy rotation, SNS/SES notifications, and CloudWatch logging, achieving 95%+ accuracy and helping 50+ users complete 150+ purchases.",
      ],
    },
    {
      id: "repo-portfolio",
      kind: "repository",
      title: "clement-portfolio",
      url: "https://github.com/clement55688/clement-portfolio",
      highlights: [
        "Public GitHub description: Clement's coding portfolio and project showcase.",
        "This repository is a Next.js and TypeScript portfolio with a scroll-driven homepage, a Snow Signal mountain experiment, a Snake playground, and a guestbook, configured to run on Cloudflare Workers.",
      ],
    },
    {
      id: "repo-arcade",
      kind: "repository",
      title: "clement-arcade",
      url: "https://hoof-game.a2040404.workers.dev/catvolution/",
      highlights: [
        "Public GitHub description: Browser mini games (Catvolution and more), deployed on Cloudflare Workers.",
        "Catvolution is publicly playable at https://hoof-game.a2040404.workers.dev/catvolution/.",
        "Repository: https://github.com/clement55688/clement-arcade",
      ],
    },
    {
      id: "repo-python-interviews",
      kind: "repository",
      title: "python-coding-interview-practice",
      url: "https://github.com/clement55688/python-coding-interview-practice",
      highlights: [
        "Public GitHub description: 31 Python coding interview exercises covering DSA, simulations, machine coding, practical transformations, prompts, and unit tests.",
      ],
    },
    {
      id: "repo-react-oa",
      kind: "repository",
      title: "react-library-oa-practice",
      url: "https://github.com/clement55688/react-library-oa-practice",
      highlights: [
        "Public GitHub description: Browser-ready React frontend OA practice: library catalog, provided book.json, mock APIs, starter code and tests.",
      ],
    },
    {
      id: "skills",
      kind: "skill",
      title: "Skills",
      highlights: [
        "Full-Stack Technologies: Python, TypeScript, JavaScript, PHP, SQL, React, FastAPI, Flask, Django, Node.js, Material UI, Tailwind CSS, Figma Dev Mode/MCP, AWS, S3, EC2, Lambda, Docker, Kubernetes, Selenium.",
        "Data, APIs & Testing: MySQL, MongoDB, Redshift, Redis, REST APIs, JWT, Airflow, PySpark, Jest, PHPUnit.",
        "AI & Developer Tools: Figma, ChatGPT, GitHub Copilot, Cursor, Claude Code, LLM-assisted test generation.",
      ],
    },
    {
      id: "edu-uiuc",
      kind: "education",
      title: "Master of Science in Computer Science",
      organization: "University of Illinois Urbana-Champaign (UIUC)",
      location: "Champaign, IL",
      highlights: ["GPA: 3.9/4.0.", "The resume does not list dates for this degree."],
    },
    {
      id: "edu-sjsu",
      kind: "education",
      title: "Master of Science in Engineering",
      organization: "San José State University (SJSU)",
      location: "San José, CA",
      highlights: ["The resume does not list a GPA or dates for this degree."],
    },
    {
      id: "edu-ntust",
      kind: "education",
      title: "Bachelor of Science in Computer Science",
      organization: "National Taiwan University of Science and Technology (NTUST)",
      location: "Taipei, Taiwan",
      highlights: ["The resume does not list a GPA or dates for this degree."],
    },
  ],
};

export function findEntry(source: Profile, id: string): ProfileEntry | undefined {
  return source.entries.find((entry) => entry.id === id);
}
