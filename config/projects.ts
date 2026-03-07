import { ValidCategory, ValidExpType, ValidSkills } from "./constants";

interface PagesInfoInterface {
  title: string;
  imgArr: string[];
  description?: string;
}

interface DescriptionDetailsInterface {
  paragraphs: string[];
  bullets: string[];
}

export interface ProjectInterface {
  id: string;
  type: ValidExpType;
  companyName: string;
  category: ValidCategory[];
  shortDescription: string;
  websiteLink?: string;
  githubLink?: string;
  techStack: ValidSkills[];
  startDate: Date;
  endDate: Date;
  // path to a logo/image; should be a string referencing a public asset or imported file
  companyLogoImg: string;
  descriptionDetails: DescriptionDetailsInterface;
  pagesInfoArr: PagesInfoInterface[];
}

export const Projects: ProjectInterface[] = [
  {
    id: "worst-gpt",
    companyName: "WorstGPT",
    type: "Professional",
    category: ["Full Stack", "AI", "Web Dev"],
    shortDescription:
      "A tongue-in-cheek AI chatbot that responds with sarcastic, brutally honest replies. Built with a credit-based freemium system and AI-powered conversations.",
    websiteLink: "https://worstgpt.vercel.app",
    githubLink: "https://github.com/Krishna8665/worstgpt",
    techStack: [
      "React",
      "Vite",
      "Node.js",
      "Express.js",
      "MongoDB",
      "Typescript",
      "Tailwind CSS",
      "Stripe",
    ],
    startDate: new Date("2025-06-01"),
    endDate: new Date("2025-08-01"),
    companyLogoImg: "/projects/worstgpt/homepage.png",
    pagesInfoArr: [
      {
        title: "Landing Page",
        description:
          "Modern landing page introducing the sarcastic AI chatbot with features, pricing plans, and product highlights.",
        imgArr: ["/projects/worstgpt/homepage.png"],
      },
      {
        title: "Chat Interface",
        description:
          "Real-time chat interface where users interact with the AI chatbot and receive sarcastic responses.",
        // chat screenshot not available yet, reuse homepage
        imgArr: ["/projects/worstgpt/homepage.png"],
      },
      {
        title: "Authentication System",
        description:
          "Secure authentication system with JWT and Google OAuth for seamless user login and account management.",
        imgArr: ["/projects/worstgpt/authentication.png"],
      },
    ],
    descriptionDetails: {
      paragraphs: [
        "WorstGPT is a full-stack AI chatbot platform designed to provide humorous and sarcastic responses instead of traditional polite AI replies. The project explores character-driven AI interaction by creating a chatbot personality that delivers brutally honest and entertaining conversations.",

        "The platform is built with a modern full-stack architecture using React and Vite for the frontend and Node.js with Express for the backend. MongoDB manages user accounts, chat usage tracking, and conversation data while Deepseek V3 API powers the AI responses.",

        "To support scalability and monetization, the platform implements a credit-based freemium system where free users receive limited message credits and premium users gain extended access. Stripe subscription integration manages recurring payments, while webhook events automatically update premium user status.",

        "The application also includes JWT authentication, Google OAuth login, API rate limiting, and a usage tracking system that deducts credits based on token usage. Automated cron jobs reset credits monthly to ensure fair usage across the platform.",
      ],
      bullets: [
        "Developed a full-stack AI chatbot platform using React, Node.js, Express, and MongoDB.",
        "Integrated Deepseek V3 API to generate sarcastic and personality-driven AI responses.",
        "Implemented a credit-based freemium system to control AI usage.",
        "Built Stripe subscription integration with webhook-based premium upgrades.",
        "Created JWT authentication with Google OAuth and email login support.",
        "Developed a usage tracking system that deducts credits based on token consumption.",
        "Implemented API rate limiting to prevent abuse and maintain platform stability.",
        "Built cron jobs to automatically reset monthly credits for users.",
      ],
    },
  },
  {
    id: "quiz-app",
    companyName: "Interactive Quiz App",
    type: "Professional",
    category: ["Full Stack", "Web Dev"],
    shortDescription:
      "A full-stack quiz platform that allows users to take category-based quizzes, track scores, and improve knowledge through interactive learning.",
    githubLink: "https://github.com/Krishna8665/quiz-app",
    techStack: [
      "React",
      "Node.js",
      "Express.js",
      "MongoDB",
      "Javascript",
      "Tailwind CSS",
    ],
    startDate: new Date("2024-12-01"),
    endDate: new Date("2025-02-01"),
    companyLogoImg: "/projects/quiz/logo.png",
    pagesInfoArr: [
      {
        title: "Quiz Dashboard",
        description:
          "Main dashboard where users can choose quiz categories and start quiz sessions.",
        imgArr: ["/projects/quiz/dashboard.png"],
      },
      {
        title: "Quiz Questions Interface",
        description:
          "Interactive question interface displaying multiple-choice questions with real-time answer validation.",
        imgArr: ["/projects/quiz/questions.png"],
      },
      {
        title: "Results & Score Tracking",
        description:
          "Score calculation and result display after completing quiz sessions.",
        imgArr: ["/projects/quiz/results.png"],
      },
    ],
    descriptionDetails: {
      paragraphs: [
        "The Quiz App is an interactive web platform designed to help users test their knowledge through engaging quizzes across multiple categories. The goal of the project was to create a simple yet effective learning environment where users can practice questions and receive instant feedback.",

        "The application is built using a full-stack architecture with React on the frontend and Node.js with Express on the backend. MongoDB stores quiz questions, user attempts, and performance statistics, enabling efficient data management.",

        "Users can participate in category-based quizzes where each session dynamically loads questions from the database. The platform automatically calculates scores and provides immediate feedback after quiz completion.",

        "Special attention was given to responsive UI design and smooth navigation to ensure a seamless experience across both mobile and desktop devices while maintaining fast API performance.",
      ],
      bullets: [
        "Developed a full-stack quiz platform using React, Node.js, Express, and MongoDB.",
        "Implemented category-based quizzes with dynamically loaded questions.",
        "Built automatic scoring and performance tracking system.",
        "Designed responsive UI for both desktop and mobile devices.",
        "Created RESTful APIs for quiz management and user results.",
        "Implemented real-time answer validation and result display.",
        "Optimized backend queries for faster question retrieval.",
      ],
    },
  },
  {
    id: "workhub",
    companyName: "WorkHub",
    type: "Personal",
    category: ["Full Stack", "Web Dev", "AI"],
    shortDescription:
      "A freelancing marketplace that lets users play buyer or seller, create gigs, and explore services with AI-powered recommendations – inspired by Fiverr.",
    githubLink: "https://github.com/Krishna8665/workhub",
    techStack: [
      "React",
      "TypeScript",
      "Node.js",
      "Express.js",
      "MongoDB",
      "Python",
      "Tailwind CSS",
    ],
    startDate: new Date("2025-02-01"),
    endDate: new Date("2025-04-01"),
    companyLogoImg: "/projects/workhub/workhub.png",
    pagesInfoArr: [
      {
        title: "Marketplace Overview",
        description:
          "Main marketplace interface displaying available gigs and services where buyers can browse different categories and explore services offered by freelancers.",
        imgArr: ["/projects/workhub/workhub.png"],
      },
      {
        title: "User Login",
        description:
          "Secure login system allowing users to access their accounts to manage gigs, place orders, and interact with other users on the platform.",
        imgArr: ["/projects/workhub/login.png"],
      },
      {
        title: "User Registration & Become Seller",
        description:
          "Registration page where users can create an account and optionally enable the 'Become a Seller' feature to start offering services and publish gigs on the marketplace.",
        imgArr: ["/projects/workhub/register.png"],
      },
    ],
    descriptionDetails: {
      paragraphs: [
        "WorkHub is a full-stack freelancing marketplace designed to connect freelancers with clients looking for digital services. Inspired by platforms like Fiverr, the application allows users to either hire freelancers as buyers or offer services as sellers within a unified platform.",

        "The platform is built using a modern full-stack architecture with React and TypeScript for the frontend and Node.js with Express for the backend. MongoDB is used for managing user accounts, gig listings, and marketplace data, providing scalable and efficient data storage.",

        "Sellers can create and manage gigs by adding service descriptions, pricing tiers, and category tags, while buyers can browse available services, view gig details, and select freelancers that best match their needs.",

        "To enhance user experience and discovery, the platform integrates an AI-based recommendation system developed using Python. This system analyzes user behavior and browsing patterns to recommend relevant gigs and services to buyers, helping them find suitable freelancers more efficiently.",
      ],
      bullets: [
        "Developed a full-stack freelancing marketplace using React, TypeScript, Node.js, and MongoDB.",
        "Implemented dual-role functionality allowing users to act as buyers or sellers.",
        "Built a gig creation and management system for freelancers to publish services.",
        "Designed a responsive UI for browsing gigs and discovering freelance services.",
        "Created RESTful APIs for user authentication, gig management, and marketplace operations.",
        "Integrated a Python-based AI recommendation system to suggest relevant gigs.",
        "Implemented secure authentication and user account management.",
        "Optimized database queries for faster gig retrieval and improved performance.",
      ],
    },
  },
  {
    id: "hamrobus",
    companyName: "HamroBus",
    type: "Personal",
    category: ["Full Stack", "Web Dev"],
    shortDescription:
      "An online bus ticket booking platform where users search routes, view schedules, and reserve seats with ease.",
    githubLink: "https://github.com/Krishna8665/hamrobus",
    techStack: [
      "React",
      "Node.js",
      "Express.js",
      "MongoDB",
      "JavaScript",
      "Tailwind CSS",
    ],
    startDate: new Date("2024-10-01"),
    endDate: new Date("2024-12-01"),
    companyLogoImg: "/projects/hamrobus/hamrobus.png",
    pagesInfoArr: [
      {
        title: "Homepage",
        description:
          "Main landing page where users can search available buses by selecting their departure location, destination, and travel date.",
        imgArr: ["/projects/hamrobus/hamrobus.png"],
      },
      {
        title: "User Registration",
        description:
          "Registration page that allows new users to create an account in order to book bus tickets, manage reservations, and track travel details.",
        imgArr: ["/projects/hamrobus/reg.png"],
      },
      {
        title: "Bus Information",
        description:
          "Bus information page displaying details such as available routes, departure times, seat availability, and pricing for each bus.",
        imgArr: ["/projects/hamrobus/businfo.png"],
      },
    ],
    descriptionDetails: {
      paragraphs: [
        "HamroBus is a full-stack online bus ticket booking system designed to simplify the process of reserving bus seats for travelers. The platform allows users to search available buses, check schedules, and book seats according to their preferred travel time.",

        "The application is built using React for the frontend and Node.js with Express for the backend. MongoDB is used to manage user accounts, bus schedules, and booking data, ensuring efficient storage and retrieval of transportation information.",

        "Users can browse available routes, view detailed bus information including departure times and seat availability, and reserve seats directly through the platform. The system focuses on providing a simple and intuitive user experience for quick ticket booking.",

        "The platform also includes user authentication and booking management features that allow users to register, log in, and manage their travel reservations easily.",
      ],
      bullets: [
        "Developed a full-stack bus ticket booking platform using React, Node.js, Express, and MongoDB.",
        "Implemented bus search functionality based on travel routes and departure times.",
        "Built a seat booking system allowing users to reserve bus seats online.",
        "Created RESTful APIs for managing buses, schedules, and bookings.",
        "Designed a responsive user interface for smooth navigation across devices.",
        "Implemented user authentication for secure account and booking management.",
        "Optimized database queries for efficient bus schedule and seat availability retrieval.",
      ],
    },
  },
];

export const featuredProjects = Projects.slice(0, 3);
