// All site content lives here. Edit this file only.
// Empty strings / empty lists hide that part of the site (and its nav link).
window.PORTFOLIO = {
  name: "Premkumar Mali",
  role: "AI/ML × Full-stack developer",
  location: "", // e.g. "Pune, India"
  pitch: "", // line under the role in the hero (empty = hidden)
  aboutHeading: "About me",
  // About section: one string per paragraph. Wrap words in **double asterisks** to make them bold.
  bio: [
    "I'm a third-year B.Tech student specializing in **Computer Science and Engineering (Artificial Intelligence & Machine Learning)** at **SRM Institute of Science and Technology (SRMIST), Kattankulathur**.",
    "I'm passionate about technology, problem-solving, and exploring how AI and Machine Learning can be used to solve real-world challenges. I enjoy learning new technologies, developing projects, and strengthening my programming and software development skills.",
    "I'm continuously working to expand my knowledge in AI/ML, software development, and emerging technologies while building practical projects that turn ideas into meaningful solutions.",
    "I'm always eager to learn, collaborate with others, and explore opportunities that help me grow as a developer and future AI/ML engineer.",
  ],
  email: "premkumarmali0106@gmail.com", // used for the mailto contact form and the email link
  formspreeId: "", // optional: Formspree form ID (e.g. "xwkgabcd"); takes priority over mailto
  resume: "Premkumar_Mali_Resume.pdf", // e.g. "resume.pdf" (put the file next to index.html)
  photo: "", // image path or URL; empty = initials avatar

  links: {
    linkedin: "https://www.linkedin.com/in/premkumarmali/",
    github: "https://github.com/PremkumarMali",
  },

  skills: [
    { group: "Languages", items: ["Java", "JavaScript", "Python", "HTML", "CSS"] },
    { group: "Frameworks & libraries", items: ["React", "Spring Boot", "Streamlit", "Three.js"] },
    {
      group: "AI & ML",
      items: ["PyTorch", "YOLOv8 (Ultralytics)", "OpenCV", "NumPy", "Pandas", "SciPy", "Gemini API", "Fireworks AI"],
    },
    { group: "Tools & platforms", items: ["MySQL", "Git", "GitHub", "Vercel"] },
  ],

  // featured: true → large card with feature bullets.
  // Others appear in the compact "More projects" grid.
  projects: [
    {
      featured: true,
      title: "BloodLink",
      category: "Full-stack web app for blood donation",
      description:
        "A blood donation platform that connects donors, hospitals and blood banks, with appointment booking and emergency alerts.",
      features: [
        "Time-slotted appointments at any registered hospital or blood bank",
        "Home collection option, with the donor's address shown to staff",
        "One-click emergency SOS that appears on every dashboard",
        "Notification bell with unread count, refreshed every 10 seconds",
      ],
      tech: ["React", "Spring Boot", "Java", "MySQL"],
      repo: "https://github.com/PremkumarMali/Blood_Donation_Project",
      demo: "https://blood-donation-project-two.vercel.app",
    },
    {
      featured: true,
      title: "Video Captioning Studio",
      category: "AI app, built for the AMD Hackathon",
      description:
        "A Streamlit app built for the AMD Hackathon (Track 2) that captions a short video clip in four different voices.",
      features: [
        "OpenCV samples evenly spaced key frames from the clip",
        "Fireworks AI vision model describes the frames, a text model writes the captions",
        "Offline rule-based fallback, so the app never breaks during a demo",
      ],
      tech: ["Python", "Streamlit", "OpenCV", "Fireworks AI"],
      repo: "https://github.com/PremkumarMali/AMD-Hackathon-track2",
      demo: "",
    },
    {
      featured: true,
      title: "SafeVision AI",
      category: "Computer vision for workplace safety, in progress",
      description:
        "A PPE monitoring system that watches video or webcam feeds and flags workers missing a helmet or safety vest, so safety officers don't have to scan CCTV by hand.",
      features: [
        "Custom-trained YOLOv8 model detects people, helmets and safety vests",
        "Logs every violation with a timestamp, type and screenshot",
        "FastAPI backend with image and video detection endpoints",
        "React dashboard to review and filter violations",
      ],
      tech: ["Python", "YOLOv8", "OpenCV", "FastAPI", "React"],
      repo: "https://github.com/PremkumarMali/safevision-ai",
      demo: "",
    },
    {
      title: "Round-Robin Scheduling in 3D",
      category: "Operating systems visualisation",
      description:
        "An interactive 3D model of round-robin CPU scheduling, built to make time slicing easy to see.",
      features: [
        "Adjustable time quantum",
        "Live process table with burst, arrival, remaining and waiting time",
        "Processes move between ready queue, CPU and finished lanes",
        "Step-by-step history log of every scheduling event",
      ],
      tech: ["JavaScript", "Three.js", "GSAP"],
      repo: "https://github.com/PremkumarMali/Round-robin-simulation",
      demo: "",
    },
    {
      title: "Unified Banking System",
      category: "Full-stack banking portal",
      description:
        "A multi-bank aggregator: register once, link accounts from several simulated banks, and deposit, transfer and pay bills from one dashboard with income vs expense charts.",
      tech: ["Java", "Spring Boot", "JWT", "Tailwind CSS", "Chart.js"],
      repo: "https://github.com/PremkumarMali/banking-app",
      demo: "",
    },
    {
      title: "Real-Time Log Anomaly Detector",
      category: "Python service, in progress",
      description: "Tails a growing log, learns a baseline and raises severity-ranked alerts.",
      tech: ["Python", "Docker", "AWS"],
      repo: "https://github.com/PremkumarMali/HackFroge",
      demo: "",
    },
    {
      title: "Smart Ration Box",
      category: "IoT companion app, in progress",
      description:
        "RationBox, a Flutter app that tracks a smart ration container's weight, fill level and battery, with alerts so homes and ration shops can refill before stock runs out.",
      tech: ["Flutter", "Dart", "Material 3"],
      repo: "https://github.com/PremkumarMali/smart-ration-box-app",
      demo: "",
    },
  ],

  // Resume widgets (send these over and they'll be added here).
  // { label, value, detail }  e.g. { label: "CGPA", value: "8.5", detail: "B.Tech, 2022–2026" }

  // Most recent first. { title, company, period, points: ["...", "..."] }
  experience: [],

  // Shown as the card next to the About text. { degree, specialization, school, period }
  education: [
    {
      degree: "B.Tech in Computer Science and Engineering",
      specialization: "Artificial Intelligence and Machine Learning",
      school: "SRM Institute of Science and Technology, Kattankulathur",
      period: "2024 – 2028",
    },
  ],

  // Number boxes under the About section. { value, label }
  aboutStats: [
    { value: "7.99", label: "Current CGPA" },
    { value: "2028", label: "Graduating" },
  ],

  // { name, issuer, year, url }  (url optional)
  certifications: [],
};
