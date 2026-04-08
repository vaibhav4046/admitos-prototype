export const mockStudent = {
  name: "Alex Chen",
  age: 16,
  year: "Grade 11",
  curriculum: "IB Diploma",
  grades: "42/45 (Predicted)",
  testScores: "SAT 1480",
  targetCountries: ["US", "UK"],
  intendedMajor: "Computer Science",
  readinessScore: 65,
  planTier: "Premium Advisory",
  credits: 150
};

export const mockSchools = [
  { id: 1, name: "Stanford University", country: "US", trackType: "US University", applicationCategory: "Regular Decision", status: "Planning", readinessScore: 45, category: "Reach", fitScore: 75, strengths: ["Computer Science", "Entrepreneurship"], competitiveness: "Extremely High", notes: "Requires highly developed personal narrative." },
  { id: 2, name: "Massachusetts Institute of Technology", country: "US", trackType: "US University", applicationCategory: "Early Action", status: "Drafting", readinessScore: 60, category: "Reach", fitScore: 82, strengths: ["Engineering", "Computer Science"], competitiveness: "Extremely High", notes: "Strong focus on STEM and Maker portfolio." },
  { id: 3, name: "University of Oxford", country: "UK", trackType: "UK University", applicationCategory: "UCAS", status: "Planning", readinessScore: 55, category: "Reach", fitScore: 85, strengths: ["Computer Science", "Mathematics"], competitiveness: "Extremely High", notes: "Requires MAT. Deadline Oct 15." },
  { id: 4, name: "Carnegie Mellon University", country: "US", trackType: "US University", applicationCategory: "Regular Decision", status: "Planning", readinessScore: 70, category: "Target", fitScore: 88, strengths: ["Computer Science", "AI"], competitiveness: "High", notes: "SCS is highly competitive." },
  { id: 5, name: "Phillips Exeter Academy", country: "US", trackType: "US Private School", applicationCategory: "Regular Admission", status: "Submitted", readinessScore: 95, category: "Reach", fitScore: 90, strengths: ["Harkness Method", "STEM"], competitiveness: "High", notes: "Requires SSAT and interview." },
];

export const mockRuns = [
  { id: "run-001", objective: "Build balanced school list", status: "Completed", date: "Oct 12, 2025" },
  { id: "run-002", objective: "Create testing roadmap", status: "Completed", date: "Oct 15, 2025" },
  { id: "run-003", objective: "Draft core admissions narrative", status: "In Progress", date: "Today" },
];

export const mockTasks = [
  { id: 1, title: "Finalize School List Strategy", status: "done", deadline: "Nov 1" },
  { id: 2, title: "Draft Personal Brand Hub Wireframe", status: "in-progress", deadline: "Nov 15" },
  { id: 3, title: "Complete Diagnostic SAT", status: "todo", deadline: "Dec 1" },
  { id: 4, title: "Submit Extracurricular Priority Plan", status: "todo", deadline: "Dec 10" },
];
