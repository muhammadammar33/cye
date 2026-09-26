export const EVENT = {
  name: "Capital Youth Expo 2026",
  shortName: "CYE 2026",
  tagline: "ENGAGE | ENCOURAGE | EMPOWER",
  date: "18 November 2026",
  isoDate: "2026-11-18",
  venue: "Pak-China Friendship Center",
  city: "Islamabad",
  organizers: ["SAFE", "Youth Insight (YI)"],
  director: "Hashir Ijaz Abbasi",
  website: "capitalyouthexpo.com",
  quote: "Together, We Empower the Next Generation.",
};

export const COMMUNITY = [
  { value: 99, suffix: "", label: "Fully committed core team members" },
  { value: 80, suffix: "", label: "Associate members driving operations & engagement" },
  { value: 2000, suffix: "+", label: "Volunteers across educational institutions" },
];

export const AUDIENCE = [
  { value: "1 Million", label: "Students" },
  { value: "700+", label: "Institutions" },
  { value: "2.4 Million", label: "Target Population" },
];

export const VERTICALS = [
  { name: "TechNexus", subtitle: "Engineering & Technology",
    desc: "Where Pakistan's future engineers, developers, and innovators converge — project exhibitions, hackathons, and sessions on emerging technology." },
  { name: "Spectrum", subtitle: "Social Sciences, Art, Design & Humanities",
    desc: "A platform for creative and critical thinkers — design showcases, debates, and dialogue with leading voices in the field." },
  { name: "VentureX", subtitle: "Finance & Business",
    desc: "Startup pitches, business case competitions, and conversations about the economy, investment, and the future of enterprise." },
  { name: "BioNova", subtitle: "Biology, Agriculture & Medicine",
    desc: "Research exhibitions, expert sessions, and competitions that spotlight Pakistan's scientific community." },
  { name: "Talent Fiesta", subtitle: "School Competitions & Activities",
    desc: "School-level talent through competitions, creative activities, and recognition ceremonies — building the pipeline of future CYE participants." },
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

export const GUESTS = [
  { name: "Hafiz Naeem ur Rehman", role: "Ameer Jamaat e Islami Pakistan" },
  { name: "Ahsan Iqbal", role: "Federal Minister for Planning, Development & Special Initiatives" },
  { name: "Wasim Haider", role: "President Islami Jamiat e Talaba Pakistan" },
  { name: "Dr. Wasay Shakir", role: "Brain Health & Neurological Diseases, Agha Khan University" },
  { name: "Wajeeha Qamar", role: "Member National Assembly of Pakistan" },
  { name: "Dr M. Iqbal Khan", role: "VC Shifa Tameer e Millat University" },
  { name: "Saqib Azhar", role: "Co-Founder & CEO, Enablers" },
  { name: "Usman Asif", role: "Founder & CEO, Devsinc" },
  { name: "Hisham Sarwar", role: "CEO Innovista, Founder of BeingGuru" },
  { name: "Irfan Malik", role: "Founder & CEO, Xeven Solutions" },
  { name: "Nasrullah Randhawa", role: "Ex CTO, PTCL" },
  { name: "Wahaj Siraj", role: "CEO, Nayatel" },
  { name: "Mushahid Hussain Syed", role: "Ex Senator" },
  { name: "Dr. Anees", role: "VC Riphah University" },
  { name: "Dr. Niaz Ahmad Akhtar", role: "Chairman, Higher Education Commission" },
  { name: "Kanwal Cheema", role: "Founder & CEO, My Impact Meter" },
  { name: "Farhan Malik", role: "Founder & CEO, Raftar" },
  { name: "Talat Hussain", role: "Senior Journalist, Author & TV Anchor" },
  { name: "Mansoor Ali Khan", role: "Journalist, TV Anchor & YouTuber" },
  { name: "Dr. Hafeez ur Rehman", role: "President Alkhidmat Foundation Pakistan" },
  { name: "Dr Javed Iqbal", role: "Renowned Surgeon" },
  { name: "Salman Asif Siddiqui", role: "Director ERDC" },
  { name: "Shoaib Akhtar", role: "Ex Cricketer" },
  { name: "Lt. (Retd.) Sohail Ashraf", role: "Chief Commissioner Islamabad" },
  { name: "Amanullah Khan", role: "Co Founder, EON Pakistan" },
];

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

export const EMAILS = {
  info: "info@capitalyouthexpo.com",
  sponsors: "sponsors@capitalyouthexpo.com",
  ambassadors: "ambassadors@capitalyouthexpo.com",
  volunteers: "volunteers@capitalyouthexpo.com",
  competitions: "competitions@capitalyouthexpo.com",
  projects: "projects@capitalyouthexpo.com",
  startups: "startups@capitalyouthexpo.com",
  visitors: "visitors@capitalyouthexpo.com",
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
  { href: "/#sponsorship", label: "Sponsorship" },
  { href: "/contact", label: "Contact" },
];

// PLACEHOLDER: fees and team sizes below are dummy values — replace with confirmed details.
export const COMPETITIONS = [
  { name: "Hackathon", vertical: "TechNexus", audience: "University", fee: "PKR 2,000", teamMin: 2, teamMax: 4,
    desc: "Build, ship, and pitch a working prototype in a high-energy coding sprint." },
  { name: "Speed Programming", vertical: "TechNexus", audience: "University", fee: "PKR 1,000", teamMin: 1, teamMax: 1,
    desc: "Solve algorithmic problems against the clock in a timed individual contest." },
  { name: "Project Exhibition", vertical: "TechNexus", audience: "University", fee: "PKR 2,000", teamMin: 1, teamMax: 4,
    desc: "Showcase engineering and emerging-tech projects to judges, guests, and recruiters." },
  { name: "Robotics Challenge", vertical: "TechNexus", audience: "University", fee: "PKR 2,500", teamMin: 2, teamMax: 4,
    desc: "Design, build, and run a robot through timed obstacle and task rounds." },
  { name: "Debate Championship", vertical: "Spectrum", audience: "University", fee: "PKR 1,500", teamMin: 2, teamMax: 2,
    desc: "Compete in structured debate on culture, policy, and the ideas shaping Pakistan." },
  { name: "Design Showcase", vertical: "Spectrum", audience: "University", fee: "PKR 1,000", teamMin: 1, teamMax: 2,
    desc: "Present visual, product, and conceptual work to leading creative voices." },
  { name: "Startup Pitch", vertical: "VentureX", audience: "University", fee: "PKR 2,000", teamMin: 1, teamMax: 4,
    desc: "Pitch your venture to founders and investors in a timed, high-stakes round." },
  { name: "Business Case Challenge", vertical: "VentureX", audience: "University", fee: "PKR 2,000", teamMin: 2, teamMax: 3,
    desc: "Solve a live business brief and defend your strategy before a jury." },
  { name: "Research Exhibition", vertical: "BioNova", audience: "University", fee: "PKR 1,500", teamMin: 1, teamMax: 3,
    desc: "Exhibit biology, agriculture, and medical research from Pakistan's campuses." },
  { name: "Medical Quiz", vertical: "BioNova", audience: "University", fee: "PKR 1,000", teamMin: 2, teamMax: 2,
    desc: "Rapid-fire rounds on anatomy, clinical cases, and health science." },
  { name: "School Talent Showdown", vertical: "Talent Fiesta", audience: "Schools", fee: "PKR 500", teamMin: 1, teamMax: 4,
    desc: "School-level contests, performances, and recognition that feed the CYE pipeline." },
  { name: "Junior Science Fair", vertical: "Talent Fiesta", audience: "Schools", fee: "PKR 500", teamMin: 1, teamMax: 3,
    desc: "School students present science models and experiments to a panel of judges." },
];

export const EDUCATION_LEVELS = [
  "Grade 9", "Grade 10", "Grade 11 (Intermediate Part 1)", "Grade 12 (Intermediate Part 2)",
  "Undergraduate", "Graduate / Postgraduate", "Other",
];

// PLACEHOLDER: prize amounts are dummy values — replace with confirmed details.
export const PROJECT_PRIZES = {
  pool: "PKR 1,000,000",
  places: [
    { place: "1st Place", amount: "PKR 250,000" },
    { place: "2nd Place", amount: "PKR 150,000" },
    { place: "3rd Place", amount: "PKR 100,000" },
  ],
  extras: [
    { label: "Honorable mentions (4th–10th)", amount: "PKR 50,000 each" },
    { label: "Special awards — Best Design, Innovation, Social Impact, People's Choice", amount: "PKR 25,000 each" },
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

// PLACEHOLDER: phone numbers are dummy values — replace with confirmed contacts.
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
