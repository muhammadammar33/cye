export const EVENT = {
  name: "Capital Youth Expo 2026",
  shortName: "CYE 2026",
  tagline: "ENGAGE | ENCOURAGE | EMPOWER",
  date: "18 November 2026",
  isoDate: "2026-11-18",
  venue: "Pak-China Friendship Center",
  city: "Islamabad",
  organizers: ["SAFE", "Youth Insight (YI)"],
  poweredBy: "Youth Insight",
  director: "Hashir Ijaz Abbasi",
  website: "capitalyouthexpo.com",
  quote: "Together, We Empower the Next Generation.",
};

export const COMMUNITY = [
  { value: 105, suffix: "", label: "Fully committed core team members" },
  { value: 90, suffix: "", label: "Associate members driving operations, outreach & participant engagement" },
  { value: 3000, suffix: "+", label: "Volunteers mobilized across educational institutions throughout the Islamabad Region" },
];

export const AUDIENCE = [
  { value: "1 Million", label: "Students" },
  { value: "700+", label: "Institutions" },
  { value: "2.4 Million", label: "Target Population" },
];

export const VERTICALS = [
  { name: "TechNexus", subtitle: "Engineering & Technology",
    desc: "Where Pakistan's future engineers, developers, and innovators converge. TechNexus hosts cutting-edge project exhibitions, hackathons, and sessions on emerging technology that draw some of the sharpest technical minds in the country." },
  { name: "Spectrum", subtitle: "Social Sciences, Art, Design & Humanities",
    desc: "A platform for creative and critical thinkers. Spectrum explores the disciplines that shape culture, communication, and society through design showcases, debates, and dialogue with leading voices in the field." },
  { name: "VentureX", subtitle: "Finance & Business",
    desc: "Pakistan's next generation of entrepreneurs and business leaders take the stage. VentureX brings together startup pitches, business case competitions, and conversations about the economy, investment, and the future of enterprise." },
  { name: "BioNova", subtitle: "Biology, Agriculture & Medicine",
    desc: "Dedicated to the sciences that sustain life. BioNova engages students in biology, medicine, and agriculture through research exhibitions, expert sessions, and competitions that spotlight Pakistan's scientific community." },
  { name: "Talent Fiesta", subtitle: "School Competitions & Activities",
    desc: "The youngest voices on the CYE stage. Talent Fiesta showcases school-level talent through competitions, creative activities, and recognition ceremonies, building the pipeline of future CYE participants." },
];

export const ACTIVITIES = [
  "Competitions", "Sessions", "Workshops", "Panel Discussion",
  "Job Fair", "Career Counselling", "Project Exhibition", "Talk Show",
];

export const ACHIEVEMENTS = [
  { year: 2015, visitors: 5000 },
  { year: 2016, visitors: 8000 },
  { year: 2018, visitors: 10000 },
  { year: 2019, visitors: 15000 },
  { year: 2023, visitors: 20000 },
  { year: 2024, visitors: 22000 },
];

// `photo` is a file in public/guests/ (omit it to show initials).
export const GUESTS: { name: string; role: string; photo?: string }[] = [
  { name: "Hafiz Naeem ur Rehman", role: "Ameer Jamaat e Islami Pakistan", photo: "hafiz-naeem-ur-rehman" },
  { name: "Wasim Haider", role: "President SAFE", photo: "wasim-haider" },
  { name: "Ahsan Iqbal", role: "Federal Minister for Planning, Development & Special Initiatives", photo: "ahsan-iqbal" },
  { name: "Dr. Wasay Shakir", role: "Brain Health & Neurological Diseases, Agha Khan University", photo: "wasay-shakir" },
  { name: "Wajeeha Qamar", role: "Minister of State, Federal Education & Professional Training", photo: "wajeeha-qamar" },
  { name: "Dr. Mohsin Ansari", role: "Ex President Islamic Circle of North America", photo: "mohsin-ansari" },
  { name: "Saqib Azhar", role: "Co-Founder & CEO, Enablers", photo: "saqib-azhar" },
  { name: "Usman Asif", role: "Founder & CEO, Devsinc", photo: "usman-asif" },
  { name: "Hisham Sarwar", role: "CEO Innovista, Founder of BeingGuru", photo: "hisham-sarwar" },
  { name: "Irfan Malik", role: "Founder & CEO, Xeven Solutions", photo: "irfan-malik" },
  { name: "Nasrullah Randhawa", role: "Ex CTO, PTCL", photo: "nasrullah-randhawa" },
  { name: "Mushahid Hussain Syed", role: "Ex Senator", photo: "mushahid-hussain-syed" },
  { name: "Dr. Anees", role: "VC Riphah University", photo: "anees" },
  { name: "Dr. Niaz Ahmad Akhtar", role: "Chairman, Higher Education Commission", photo: "niaz-ahmad-akhtar" },
  { name: "Kanwal Cheema", role: "Founder & CEO, My Impact Meter", photo: "kanwal-cheema" },
  { name: "Farhan Malik", role: "Founder & CEO, Raftar", photo: "farhan-malik" },
  { name: "Talat Hussain", role: "Senior Journalist, Author & TV Anchor", photo: "talat-hussain" },
  { name: "Mansoor Ali Khan", role: "Journalist, TV Anchor & YouTuber", photo: "mansoor-ali-khan" },
  { name: "Dr. Hafeez ur Rehman", role: "President Alkhidmat Foundation Pakistan", photo: "hafeez-ur-rehman" },
  { name: "Dr. Javed Iqbal", role: "Renowned Surgeon", photo: "javed-iqbal" },
  { name: "Salman Asif Siddiqui", role: "Director ERDC", photo: "salman-asif-siddiqui" },
  { name: "Shoaib Akhtar", role: "Ex Cricketer", photo: "shoaib-akhtar" },
  { name: "Lt. (Retd.) Sohail Ashraf", role: "Chief Commissioner Islamabad", photo: "sohail-ashraf" },
  { name: "Amanullah Khan", role: "Co-Founder, EON Pakistan", photo: "amanullah-khan" },
];

// Order matches the team list supplied by CYE. The first two are shown as featured cards.
export const TEAM = [
  { name: "Hashir Ijaz Abbasi", role: "Director", photo: "hashir-ijaz-abbasi-team" },
  { name: "Siraj Ul Haq", role: "Event Head", photo: "siraj-ul-haq" },
  { name: "Ukasha Alam", role: "Incharge PR & Guests", photo: "ukasha-alam" },
  { name: "Junaid Rashid", role: "Head Finance", photo: "junaid-rashid" },
  { name: "Anas Hussiani", role: "Head Marketing", photo: "anas-hussaini" },
  { name: "Bilal Shehzad", role: "Incharge Stalls", photo: "bilal-shehzad" },
  { name: "Asadullah Mughal", role: "Head Ambassador", photo: "asadullah-mughal" },
  { name: "Asadullah Tahir", role: "Head Media & IT", photo: "asadullah-tahir" },
  { name: "Fuzail Faraz", role: "Incharge TechNexus", photo: "fuzail-faraz" },
  { name: "Sanaullah", role: "Incharge BioNova", photo: "sanaullah" },
  { name: "Ismail Saleem", role: "Incharge Talent Fiesta", photo: "ismail-saleem" },
];

export const ADVISORY_BOARD = [
  { name: "Wahaj Siraj", role: "CEO, Nayatel", photo: "wahaj-siraj",
    bio: "A leading technology entrepreneur and telecommunications professional, Wahaj Siraj brings extensive experience in technology, entrepreneurship, leadership, and youth development. He is the CEO and Co-Founder of Nayatel and has been a Patron-in-Chief of CYE's BizzTech 2024." },
  { name: "Prof. Dr. Mukhtar Ahmed", role: "Former Chairman, Higher Education Commission (HEC)", photo: "mukhtar-ahmed",
    bio: "An eminent educationist and academic leader with over three decades of experience in higher education, policy, research, and institutional development. He has served in senior leadership positions at HEC and has contributed extensively to higher education reforms and university-industry collaboration." },
  { name: "Prof. Dr. Muhammad Iqbal Khan", role: "Vice Chancellor, Shifa Tameer-e-Millat University", photo: "muhammad-iqbal-khan",
    bio: "An accomplished academic and healthcare professional with extensive experience in university leadership, medical education, research, and institutional development. He has held senior academic and administrative positions in Pakistan and the UK." },
  { name: "Tahir Chaudhary", role: "Chairman, Punjab Cash & Carry", photo: "tahir-chaudhary",
    bio: "A prominent business leader with extensive experience in retail, entrepreneurship, and business development. His leadership and entrepreneurial insight add valuable perspective to CYE's advisory board." },
];

export const VENUE = {
  name: "Pak-China Friendship Center",
  city: "Islamabad",
  // Direct /maps/embed URL: the older ?output=embed form 301-redirects with X-Frame-Options,
  // which some mobile browsers enforce and block (ERR_BLOCKED_BY_RESPONSE).
  mapEmbed: "https://www.google.com/maps/embed?origin=mfe&pb=!1m3!2m1!1sPak-China+Friendship+Center+Islamabad!6i15",
  mapLink: "https://www.google.com/maps/search/?api=1&query=Pak-China+Friendship+Center+Islamabad",
  floors: [
    {
      name: "Ground Floor",
      image: "/venue/floor-plan-ground.webp",
      width: 1400,
      height: 1031,
      zones: [
        "Entrance with separate male and female registration desks",
        "Open areas on both sides of the entrance",
        "Stalls areas (east and west wings)",
        "Main Auditorium with left and right galleries",
        "Palestine & Kashmir Gallery",
        "Banquet Hall",
        "Ministry of IT area",
        "Building official area",
        "Male and female washrooms",
        "Stairs to the first floor",
      ],
    },
    {
      name: "First Floor",
      image: "/venue/floor-plan-first.webp",
      width: 1400,
      height: 1065,
      zones: [
        "Talent Fiesta Main Hall",
        "Talent Fiesta competition room",
        "Exhibition area for kids",
        "Three competition rooms (two conference rooms and one 144-seat room)",
        "Dedicated room for competitions",
        "Central open area with walking areas",
      ],
    },
  ],
};

export const SPONSORSHIP = [
  { tier: "Titanium", price: "PKR 1,000,000", highlight: true, benefits: [
    "Company logo with CYE", "Spacious booth", "Exclusive presentation time (10 min)",
    "Social media promotion & coverage", "Inclusion in pre-event campaign",
    "Educational institutions publicity", "Comprehensive venue branding" ] },
  { tier: "Gold", price: "PKR 700,000", highlight: false, benefits: [
    "Spacious booth", "Exclusive presentation time (10 min)", "Social media promotion & coverage",
    "Inclusion in pre-event campaign", "Comprehensive venue branding" ] },
  { tier: "Silver", price: "PKR 500,000", highlight: false, benefits: [
    "Spacious booth", "Exclusive presentation time (10 min)",
    "Social media promotion & coverage", "Comprehensive venue branding" ] },
  { tier: "Bronze", price: "PKR 250,000", highlight: false, benefits: [
    "Spacious booth", "Social media promotion & coverage", "Comprehensive venue branding" ] },
];

export const STALLS = [
  { tier: "Gold Stalls", price: "PKR 150,000", benefits: [
    "Prominent location", "Logo on all invitation cards given to dignitaries",
    "Exclusive presentation time (1 min)", "One social media post",
    "Logo on brochures distributed all over Islamabad" ] },
  { tier: "Silver Stalls", price: "PKR 100,000", benefits: [
    "Prime location", "One social media post",
    "Logo on brochures distributed all over Islamabad" ] },
];

// Default notification inboxes (editable in Admin → Settings). Hostinger allows 5 aliases on info@,
// so projects go to competitions@ and visitors/volunteers to the main inbox.
export const EMAILS = {
  info: "info@capitalyouthexpo.com",
  sponsors: "sponsors@capitalyouthexpo.com",
  ambassadors: "ambassadors@capitalyouthexpo.com",
  volunteers: "info@capitalyouthexpo.com",
  competitions: "competitions@capitalyouthexpo.com",
  projects: "competitions@capitalyouthexpo.com",
  startups: "startups@capitalyouthexpo.com",
  visitors: "info@capitalyouthexpo.com",
};

// Flip a flag to false to close that form and show a "registration closed" notice instead.
export const REGISTRATION_OPEN = {
  competitions: true,
  projects: true,
  startups: true,
  visitors: true,
  volunteers: true,
  ambassadors: true,
};

export type NavItem = {
  href: string;
  label: string;
  desc?: string;
};

export const REGISTER_LINKS: NavItem[] = [
  { href: "/competitions", label: "Competitions", desc: "Enter a competition solo or as a team" },
  { href: "/article-writing", label: "Article Writing", desc: "National Article Writing Competition 2026" },
  { href: "/projects", label: "Project Exhibition", desc: "Showcase your project for the prize pool" },
  { href: "/startups", label: "Startup Arena", desc: "Pitch your startup to investors" },
  { href: "/visitors", label: "Visitor Pass", desc: "Register to attend the expo" },
  { href: "/ambassadors", label: "Campus Ambassador", desc: "Represent CYE at your institution" },
  { href: "/volunteers", label: "Volunteer", desc: "Join the team behind the expo" },
];

export const NAV_LINKS: (NavItem & { children?: NavItem[] })[] = [
  { href: "/#about", label: "About" },
  { href: "/#verticals", label: "Verticals" },
  { href: "/competitions", label: "Register", children: REGISTER_LINKS },
  { href: "/#guests", label: "Guests" },
  { href: "/#team", label: "Team" },
  { href: "/#venue", label: "Venue" },
  { href: "/#sponsorship", label: "Sponsorship" },
  { href: "/contact", label: "Contact" },
];

// Registration fees are confirmed. Team sizes and rule books follow the official CYE competition rule books.
export const COMPETITIONS = [
  { name: "Robo War", vertical: "TechNexus", audience: "University", fee: "PKR 2,500", teamMin: 2, teamMax: 4, rulebook: "/rulebooks/01-robo-war.pdf",
    desc: "Build a combat robot and battle it out in the arena until one bot is left standing." },
  { name: "Line Following Robot", vertical: "TechNexus", audience: "University", fee: "PKR 2,500", teamMin: 1, teamMax: 4, rulebook: "/rulebooks/02-line-following-robot.pdf",
    desc: "Design an autonomous robot that tracks the line and races the course against the clock." },
  { name: "Drone Race", vertical: "TechNexus", audience: "University", fee: "PKR 2,500", teamMin: 1, teamMax: 4, rulebook: "/rulebooks/03-drone-race.pdf",
    desc: "Pilot your drone through a timed obstacle course. Fastest clean run wins." },
  { name: "Hackathon", vertical: "TechNexus", audience: "University", fee: "PKR 2,000", teamMin: 3, teamMax: 5, rulebook: "/rulebooks/04-hackathon.pdf",
    desc: "Build, ship, and pitch a working prototype in a high-energy coding sprint." },
  { name: "Cyber Security (Capture The Flag)", vertical: "TechNexus", audience: "University", fee: "PKR 1,500 / 1,800", teamMin: 2, teamMax: 4, rulebook: "/rulebooks/07-cyber-security-ctf.pdf",
    desc: "Solve jeopardy-style security challenges in web exploitation, cryptography, forensics, reverse engineering and OSINT to capture the most flags." },
  { name: "Speed Programming", vertical: "TechNexus", audience: "University", fee: "PKR 1,500", teamMin: 1, teamMax: 2, rulebook: "/rulebooks/05-speed-programming.pdf",
    desc: "Solve algorithmic problems against the clock in an ICPC-style contest, solo or as a pair." },
  { name: "AI Challenge", vertical: "TechNexus", audience: "University", fee: "PKR 1,500", teamMin: 2, teamMax: 4, rulebook: "/rulebooks/06-ai-challenge.pdf",
    desc: "Train and tune a model on a real dataset and top the leaderboard." },
  { name: "Pitch Your Idea (SparkTank)", vertical: "VentureX", audience: "University", fee: "PKR 1,500", teamMin: 1, teamMax: 4, rulebook: "/rulebooks/08-pitch-your-idea-sparktank.pdf",
    desc: "Pitch your startup idea to founders and investors in a timed, high-stakes round." },
  { name: "Business Innovation", vertical: "VentureX", audience: "University", fee: "PKR 1,500", teamMin: 3, teamMax: 5, rulebook: "/rulebooks/09-business-innovation.pdf",
    desc: "Solve a real business challenge with an innovative strategy and defend it before a jury." },
  { name: "Graphic Design", vertical: "Spectrum", audience: "University", fee: "PKR 1,000", teamMin: 1, teamMax: 2, rulebook: "/rulebooks/10-graphic-design.pdf",
    desc: "Design to a live brief and present your visual work to leading creative voices." },
  { name: "Reel Competition", vertical: "Spectrum", audience: "University", fee: "PKR 1,000", teamMin: 1, teamMax: 3, rulebook: "/rulebooks/11-reel-competition.pdf",
    desc: "Shoot and edit a short-form reel that tells a story and grabs attention." },
  { name: "Youth Parliament", vertical: "Spectrum", audience: "University", fee: "PKR 1,000", teamMin: 1, teamMax: 1, rulebook: "/rulebooks/13-youth-parliament.pdf",
    desc: "Debate national issues in a parliamentary session modelled on the National Assembly." },
  { name: "Debate", vertical: "Literary", audience: "Schools & University", fee: "PKR 500", teamMin: 2, teamMax: 2, rulebook: "/rulebooks/12-debate.pdf",
    desc: "Teams of two argue for or against the motion, with motions announced 30 minutes before each round." },
  { name: "Naat", vertical: "Literary", audience: "Schools & University", fee: "PKR 500", teamMin: 1, teamMax: 1, rulebook: "/rulebooks/16-naat.pdf",
    desc: "Recite a naat in honour of the Prophet (PBUH) before a panel of judges." },
  { name: "Qirat", vertical: "Literary", audience: "Schools & University", fee: "PKR 500", teamMin: 1, teamMax: 1, rulebook: "/rulebooks/17-qirat.pdf",
    desc: "Recite the Holy Quran with tajweed, judged on precision and melody." },
  { name: "Speech (English / Urdu)", vertical: "Literary", audience: "Schools & University", fee: "PKR 500", teamMin: 1, teamMax: 1, rulebook: "/rulebooks/18-speech-declamation.pdf",
    desc: "A declamation contest: deliver a persuasive, prepared speech of up to 5 minutes in English or Urdu, with each language judged separately." },
  { name: "Arts", vertical: "Literary", audience: "Schools & University", fee: "PKR 500", teamMin: 1, teamMax: 1, rulebook: null as string | null,
    desc: "Create an original artwork on the spot around the expo theme." },
];

// Source: https://prize.org.pk/national-article-writing-competition
export const ARTICLE_COMPETITION = {
  title: "National Article Writing Competition 2026",
  organizer: "Policy Research Initiative for Zakat-Based, Interest-Free Economy (PRIZE)",
  organizerShort: "PRIZE",
  source: "https://prize.org.pk/national-article-writing-competition",
  registerUrl: "https://forms.gle/dmaYepw2r2KNk8G67",
  submitUrl: "https://forms.gle/dExtBZyYuj2DZFZM9",
  overview: [
    "The National Article Writing Competition 2026 is a flagship youth initiative of PRIZE, designed to empower the next generation of thinkers, researchers, and leaders. This competition provides a platform for young minds to critically examine today's exploitative financial structures and present innovative, Islamic economic alternatives rooted in justice, equity, and sustainability.",
    "PRIZE envisions a future where zakat-based public finance and interest-free banking serve as pillars of a just and prosperous economy. Through this initiative, the nation's youth are invited to help shape economic thought that safeguards human dignity, eliminates financial crises, and establishes welfare for all.",
  ],
  themes: [
    "A Zakat-Based Fiscal System: Breaking the Trap of Poverty and Unemployment",
    "A Full-Reserve, Interest-Free Money System: Breaking the Trap of Debt and Inflation",
  ],
  eligibility: [
    "University students, researchers, and scholars from recognized colleges, universities, and Islamic institutions across Pakistan.",
    "Especially encouraged: students of Economics, Finance, Business Administration, Public Policy, Political Science, Islamic Studies, and Development Studies.",
    "Open to all disciplines: any student passionate about social justice and Islamic economic reform is welcome to contribute.",
  ],
  languages: ["English", "Urdu"],
  wordCount: "2,000 to 5,000 words",
  dates: [
    { label: "Competition launch", value: "01 September 2026" },
    { label: "Submission deadline", value: "30 December 2026" },
    { label: "Results announcement", value: "March 2027" },
    { label: "Prize distribution ceremonies", value: "June 2027" },
  ],
  closingEvents: [
    { city: "Karachi", venue: "University of Karachi" },
    { city: "Lahore", venue: "University of Management and Technology (UMT)" },
    { city: "Islamabad", venue: "Riphah International University" },
  ],
  prizes: [
    { place: "1st Prize", amount: "Rs. 100,000" },
    { place: "2nd Prize", amount: "Rs. 60,000" },
    { place: "3rd Prize", amount: "Rs. 40,000" },
  ],
  prizeExtras: "Each winner also receives a certificate, national recognition, and article publication.",
  benefits: [
    "National recognition",
    "Publication opportunities on PRIZE platforms",
    "Certificates of distinction",
    "Potential internships and collaborations with PRIZE",
  ],
  rules: [
    "Pre-registration is required before submitting an article.",
    "There is no registration fee.",
    "Word count: 2,000 to 5,000 words, in English or Urdu.",
    "Plagiarism: maximum 20% allowed.",
    "Content must be original; AI-generated submissions will not be accepted.",
    "Use proper citations where applicable.",
    "Submit only through the official submission link.",
  ],
};

export const EDUCATION_LEVELS = [
  "Grade 9", "Grade 10", "Grade 11 (Intermediate Part 1)", "Grade 12 (Intermediate Part 2)",
  "Undergraduate", "Graduate / Postgraduate", "Other",
];

// PLACEHOLDER: prize amounts are dummy values; replace with confirmed details.
export const PROJECT_PRIZES = {
  pool: "PKR 1,000,000",
  places: [
    { place: "1st Place", amount: "PKR 250,000" },
    { place: "2nd Place", amount: "PKR 150,000" },
    { place: "3rd Place", amount: "PKR 100,000" },
  ],
  extras: [
    { label: "Honorable mentions (4th–10th)", amount: "PKR 50,000 each" },
    { label: "Special awards: Best Design, Innovation, Social Impact, People's Choice", amount: "PKR 25,000 each" },
  ],
};

export const STARTUP_PERKS = [
  "Pitch to venture capitalists, angel investors, and seed funds",
  "Mentorship sessions with founders and industry leaders",
  "Exhibition space for shortlisted startups on expo day",
  "Visibility across CYE media and partner networks",
];

export const STARTUP_SECTORS = [
  "AgriTech", "EdTech", "FinTech", "HealthTech", "BioTech", "AI / Software",
  "E-commerce", "Climate / Energy", "Social Impact", "Other",
];

export const STARTUP_STAGES = ["Idea", "Prototype / MVP", "Early revenue", "Growth"];

export const VISITOR_PERKS = [
  "Access to all five vertical zones and exhibitions",
  "Sessions, workshops, and panel discussions",
  "Job fair and career counselling desks",
  "Watch live competitions and the talk show",
];

// PLACEHOLDER: phone numbers are dummy values; replace with confirmed contacts.
export const CONTACTS = [
  { label: "General queries", phones: ["+92 300 0000000"], email: "info@capitalyouthexpo.com" },
  { label: "Competitions & projects", phones: ["+92 300 0000001"], email: "competitions@capitalyouthexpo.com" },
  { label: "Sponsorship & stalls", phones: ["+92 300 0000002"], email: "sponsors@capitalyouthexpo.com" },
  { label: "Startups", phones: ["+92 300 0000003"], email: "startups@capitalyouthexpo.com" },
];

// PLACEHOLDER: point these at the official CYE accounts.
export const SOCIAL_LINKS = {
  instagram: "https://instagram.com",
  facebook: "https://facebook.com",
  linkedin: "https://linkedin.com",
  youtube: "https://youtube.com",
};

export const AMBASSADOR_PERKS = [
  "Official CYE Campus Ambassador certificate",
  "Letter of recommendation from CYE leadership",
  "Priority access to sessions and guest meet-ups",
  "Leadership experience running campus outreach",
  "Exclusive ambassador recognition and merch",
];

export const AMBASSADOR_DUTIES = [
  "Represent CYE 2026 at your institution",
  "Drive student, faculty, and stall registrations",
  "Coordinate campus activations and publicity",
  "Amplify the expo across student networks",
];

export const VOLUNTEER_ROLES = [
  { name: "Operations", desc: "Floor management, logistics, and run-of-show on expo day." },
  { name: "Outreach", desc: "Institution coordination and on-ground mobilization." },
  { name: "Hospitality", desc: "Guest reception, protocol, and help desks." },
  { name: "Media & Content", desc: "Coverage, photography coordination, and social posts." },
  { name: "Registration Desk", desc: "Check-in, badges, and attendee support." },
  { name: "Stage Management", desc: "Sessions, competitions, and speaker flow." },
];
