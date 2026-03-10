import React, { useState, useEffect } from 'react';
import DashboardLayout from "../../layouts/DashboardLayout";

/* ==========================================================================
   1. CONSTANTS, TOOLTIPS & QUESTIONS
   ========================================================================== */

const TOOLTIP_DATA = {
  aptitude: {
    title: "Aptitude Score",
    meaning: "A measure of your logical reasoning, problem-solving, and mathematical ability.",
    purpose: "Used to gauge your suitability for roles requiring heavy analytical thinking like Data Science or Engineering.",
    example: "If you consistently score high in math and logic puzzles, set this to 80% or above."
  },
  communication: {
    title: "Communication Skills",
    meaning: "Your ability to convey ideas clearly, both verbally and in writing.",
    purpose: "Critical for Management, Consulting, and Team Lead roles where coordination is key.",
    example: "If you are comfortable presenting to groups and writing clear documentation, set this to 85%."
  },
  risk: {
    title: "Risk Tolerance",
    meaning: "How comfortable you are with job uncertainty in exchange for potential high rewards.",
    purpose: "Helps decide if you are better suited for a stable corporate job or a fast-paced Startup.",
    example: "A score of 90% means you are happy to join a new startup with high equity potential despite lower job security."
  }
};

const APTITUDE_QUESTIONS = [
  { id: 1, q: "If a project takes 10 days with 2 developers, how many days for 5 developers?", options: ["2 days", "4 days", "5 days", "25 days"], correct: "4 days" },
  { id: 2, q: "Which number comes next in the series: 2, 4, 8, 16, ...?", options: ["24", "30", "32", "64"], correct: "32" },
  { id: 3, q: "A store offers 20% off on a ₹1000 item. What is the final price?", options: ["800", "850", "900", "200"], correct: "800" },
  { id: 4, q: "Solve: (25 * 4) / 10 + 5", options: ["10", "15", "20", "25"], correct: "15" },
  { id: 5, q: "Find the odd one out: 27, 64, 81, 125", options: ["27", "64", "81", "125"], correct: "81" },
  {
    id: 6,
    q: "A bag contains 5 red and 3 blue balls. If 3 balls are drawn at random, what is the probability that 2 are red and 1 is blue?",
    options: ["15/28", "15/56", "30/56", "10/28"],
    correct: "15/28"
  },
  {
    id: 7,
    q: "A person covers a certain distance at 40 km/hr and returns to the starting point at 60 km/hr. What is his average speed for the whole journey?",
    options: ["48 km/hr", "50 km/hr", "52 km/hr", "45 km/hr"],
    correct: "48 km/hr"
  },
  {
    id: 8,
    q: "In how many ways can the letters of the word 'LEADER' be arranged such that the vowels always come together?",
    options: ["72", "144", "360", "720"],
    correct: "72"
  },
  {
    id: 9,
    q: "What is the angle between the hour hand and the minute hand of a clock when the time is 3:40?",
    options: ["120°", "125°", "130°", "140°"],
    correct: "130°"
  },
  {
    id: 10,
    q: "If the cost price of 20 articles is equal to the selling price of 16 articles, find the profit percentage.",
    options: ["20%", "25%", "30%", "33.33%"],
    correct: "25%"
  },
  {
    id: 11,
    q: "A sum of money at compound interest amounts to thrice itself in 3 years. In how many years will it be 9 times itself?",
    options: ["6 years", "9 years", "12 years", "15 years"],
    correct: "6 years"
  },
  {
    id: 12,
    q: "Find the missing number in the series: 3, 12, 27, 48, 75, 108, ?",
    options: ["147", "162", "183", "192"],
    correct: "147"
  },
  {
    id: 13,
    q: "A and B can do a piece of work in 12 days, B and C in 15 days, and C and A in 20 days. How many days will A alone take to finish the work?",
    options: ["20 days", "30 days", "40 days", "60 days"],
    correct: "30 days"
  },
  {
    id: 14,
    q: "The ratio of the ages of a father and his son is 7:3. After 10 years, the ratio becomes 2:1. What is the father's present age?",
    options: ["60 years", "70 years", "50 years", "80 years"],
    correct: "70 years"
  },
  {
    id: 15,
    q: "If 'WATER' is coded as 'YCVGT', how is 'HJKLN' coded?",
    options: ["FILMP", "GHKLM", "FHLMN", "FHIJM"],
    correct: "FILMP"
  }
];

const BRANCH_CONFIG = {
  CSE: {
    programming: ["C#", "Python", "Java", "C++", "JavaScript", "SQL", "TypeScript", "Go"],
    technical: ["DSA", "Web Development", "Machine Learning", "Cloud Computing", "Cyber Security", "Blockchain"],
    tools: ["VS Code", "Git", "Docker", "React", "Node.js", "TensorFlow", "Kubernetes"],
    interests: ["Software", "AI", "Data Science", "System Design", "Open Source"]
  },

  IT: {
    programming: ["Java", "Python", "JavaScript", "PHP", "SQL", "C#"],
    technical: ["Database Management", "Networking", "Web Dev", "Cloud Computing", "UI/UX Design"],
    tools: ["AWS", "Azure", "Git", "Postman", "MongoDB", "Figma"],
    interests: ["Software Architecture", "Product Management", "Cybersecurity", "Cloud Solutions"]
  },

  ECE: {
    programming: ["C", "C++", "Python", "MATLAB", "VHDL/Verilog"],
    technical: ["Embedded Systems", "IoT", "VLSI", "Signal Processing", "Communication Systems"],
    tools: ["Arduino", "Raspberry Pi", "Proteus", "Keil", "Xilinx", "MATLAB"],
    interests: ["Robotics", "Hardware Design", "Wireless Communication", "Nanotechnology"]
  },

  EE: {
    programming: ["MATLAB", "C", "Python", "PLC Programming"],
    technical: ["Power Systems", "Control Systems", "Electrical Machines", "Smart Grids", "Renewable Energy"],
    tools: ["Simulink", "LabVIEW", "PSpice", "AutoCAD Electrical", "ETAP"],
    interests: ["Energy Management", "Automation", "Electric Vehicles", "Sustainability"]
  },

  Mechanical: {
    programming: ["Python", "MATLAB", "C", "Fortran"],
    technical: ["CAD", "Thermodynamics", "Robotics", "Manufacturing", "Automobile", "Fluid Mechanics"],
    tools: ["AutoCAD", "SolidWorks", "ANSYS", "CATIA", "Fusion 360", "Mastercam"],
    interests: ["Design", "Aerospace", "Manufacturing", "EV Technology", "R&D"]
  },

  Civil: {
    programming: ["Python", "MATLAB", "Visual Basic"],
    technical: ["Structural Engineering", "Construction Planning", "Surveying", "Geotechnical Engineering", "GIS"],
    tools: ["AutoCAD", "ETABS", "STAAD Pro", "Revit", "Primavera", "ArcGIS"],
    interests: ["Urban Planning", "Infrastructure", "Hydrology", "Project Management"]
  },

  Architecture: {
    programming: ["Grasshopper", "Python (Rhino)"],
    technical: ["3D Modeling", "Urban Design", "Sustainable Design", "Interior Design", "Landscape Architecture"],
    tools: ["SketchUp", "Rhino 3D", "ArchiCAD", "Lumion", "Photoshop", "V-Ray"],
    interests: ["Urbanization", "Green Building", "Heritage Conservation", "Digital Fabrication"]
  },

  BBA: {
    programming: ["SQL", "Python (Basics)"],
    technical: ["Financial Accounting", "Marketing Management", "HR Management", "Business Analytics", "Operations"],
    tools: ["MS Excel (Advanced)", "Tally", "Salesforce", "Tableau", "PowerPoint"],
    interests: ["Entrepreneurship", "Finance", "Strategic Planning", "Brand Management"]
  },

  MBA: {
    programming: ["SQL", "R", "Python for Data Science"],
    technical: ["Corporate Finance", "Market Research", "Supply Chain Management", "Organizational Behavior", "FinTech"],
    tools: ["SAP", "Tableau", "PowerBI", "Oracle ERP", "Bloomberg Terminal"],
    interests: ["Consulting", "Investment Banking", "Leadership", "Venture Capital"]
  },

  Law: {
    programming: ["None"],
    technical: ["Constitutional Law", "Corporate Law", "Intellectual Property", "Legal Research", "Drafting", "Litigation"],
    tools: ["SCC Online", "LexisNexis", "Westlaw", "MS Word"],
    interests: ["Corporate Governance", "Human Rights", "Policy Making", "Arbitration"]
  },

  MBBS: {
    programming: ["None"],
    technical: ["Anatomy", "Physiology", "Pathology", "Clinical Diagnosis", "Pharmacology", "Surgery Basics"],
    tools: ["Stethoscope", "ECG Monitor", "Radiology Software", "Dermoscopy"],
    interests: ["Specialized Surgery", "Public Health", "Medical Research", "Diagnostics", "Cardiology Expert"]
  },

  BCA: {
    programming: ["Java", "C++", "C#", "Python", "SQL", "PHP", "HTML/CSS"],
    technical: ["Software Development", "Database Administration", "System Analysis", "Web Designing", "Data Structures"],
    tools: ["Visual Studio", "XAMPP", "Android Studio", "MySQL Workbench", "Oracle"],
    interests: ["App Development", "Software Testing", "E-commerce", "IT Support"]
  }
};

/* ==========================================================================
   2. MAIN COMPONENT
   ========================================================================== */

export default function CareerPrediction() {
  // --- A. Main Form State ---
  const [form, setForm] = useState({
    branch: "CSE",
    year: "3rd Year",
    programmingSkills: [],
    technicalSkills: [],
    toolsUsed: [],
    interests: [],
    skillProficiency: "Beginner",
    jobType: "Industry Based",
    aptitude: 50,
    communication: 50,
    risk: 50,
  });

  // --- B. Modal & Feedback State ---
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: '', message: '' });
  const [activeTooltip, setActiveTooltip] = useState(null);

  const [showProficiencyTest, setShowProficiencyTest] = useState(false);
  const [testForm, setTestForm] = useState({ projects: 0, internships: 0, certifications: 0, yearsOfExperience: 0 });

  const [showAptitudeTest, setShowAptitudeTest] = useState(false);
  const [aptitudeAnswers, setAptitudeAnswers] = useState({});

  // ✅ recommendations state (FastAPI response)
  const [recommendations, setRecommendations] = useState([]);

  // ✅ Result UI Enhancements
  const [expandedCareer, setExpandedCareer] = useState(null);
  const [savedCareers, setSavedCareers] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("savedCareers")) || [];
    } catch {
      return [];
    }
  });

  const branchOptions = BRANCH_CONFIG[form.branch] || { programming: [], technical: [], tools: [], interests: [] };

  // --- C. Logic Handlers ---

  const calculateProficiency = () => {
    const score = (parseInt(testForm.projects) * 2) + (parseInt(testForm.internships) * 5) +
      (parseInt(testForm.certifications) * 3) + (parseInt(testForm.yearsOfExperience) * 4);
    let result = score >= 25 ? "Advanced" : score >= 10 ? "Intermediate" : "Beginner";

    setForm(prev => ({ ...prev, skillProficiency: result }));
    setShowProficiencyTest(false);
    showFlashMessage(`Proficiency updated to ${result}!`);
  };

  const calculateAptitudeScore = () => {
    let correctCount = 0;
    APTITUDE_QUESTIONS.forEach(q => { if (aptitudeAnswers[q.id] === q.correct) correctCount++; });
    const finalPercentage = Math.round((correctCount / APTITUDE_QUESTIONS.length) * 100);

    setForm(prev => ({ ...prev, aptitude: finalPercentage }));
    setShowAptitudeTest(false);
    showFlashMessage(`Aptitude Test Complete: ${finalPercentage}%`);
  };

  const showFlashMessage = (msg) => {
    setStatus({ type: 'success', message: msg });
    setTimeout(() => setStatus({ type: '', message: '' }), 3000);
  };

  const toggleSkill = (field, value) => {
    setForm((prev) => {
      const current = prev[field] || [];
      const newList = current.includes(value) ? current.filter((item) => item !== value) : [...current, value];
      return { ...prev, [field]: newList };
    });
  };

  // ✅ Converts your UI form to FastAPI StudentProfile schema
  const buildFastApiPayload = () => {
    const yearMap = {
      "1st Year": 1,
      "2nd Year": 2,
      "3rd Year": 3,
      "4th Year": 4,
    };

    return {
      Branch: form.branch,
      Current_Year: yearMap[form.year] || 3,

      Programming_Languages: (form.programmingSkills || []).join(", "),
      Technical_Skills: (form.technicalSkills || []).join(", "),
      Tools_Frameworks: (form.toolsUsed || []).join(", "),

      Skill_Proficiency: form.skillProficiency,

      Career_Preference: (form.interests || []).join(", "),
      Research_Or_Industry: form.jobType,

      Aptitude_Score: Number(form.aptitude),
      Communication_Skill: Number(form.communication),
      Risk_Tolerance: Number(form.risk),
    };
  };

  const predictCareer = async () => {
    setLoading(true);
    setStatus({ type: '', message: '' });
    setRecommendations([]); // ✅ clear previous results

    try {
      const payload = buildFastApiPayload();

      const response = await fetch("http://127.0.0.1:8000/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error("Connection failed");

      const data = await response.json();

      setRecommendations(data?.top_recommendations || []);
      setStatus({ type: 'success', message: 'Analysis complete!' });
    } catch (error) {
      setStatus({ type: 'error', message: 'Backend server gone on a lunch break.' });
    } finally {
      setLoading(false);
    }
  };

  // --- D. UI Components ---
  const InfoPopup = ({ id }) => {
    if (activeTooltip !== id) return null;
    const info = TOOLTIP_DATA[id];
    return (
      <div className="absolute z-50 bottom-full mb-3 w-72 p-4 bg-slate-900 text-white text-[13px] rounded-xl shadow-2xl animate-in fade-in zoom-in duration-200">
        <h4 className="font-bold text-indigo-400 mb-1 uppercase tracking-tight">{info.title}</h4>
        <p className="mb-2 opacity-90">{info.meaning}</p>
        <div className="pt-2 border-t border-slate-700/50 italic text-indigo-200">Example: {info.example}</div>
        <div className="absolute top-full left-4 w-0 h-0 border-l-[6px] border-r-[6px] border-t-[6px] border-t-slate-900"></div>
      </div>
    );
  };

  const SkillCategory = ({ title, options, selected, field }) => (
    <div className="flex flex-col gap-4">
      <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 ml-1">{title}</label>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => toggleSkill(field, option)}
            className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all duration-200
              ${selected.includes(option) ? "bg-indigo-600 border-indigo-600 text-white shadow-md scale-105" : "bg-white dark:bg-slate-700 border-slate-200 text-slate-600 dark:text-slate-200 hover:bg-indigo-50"}
            `}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <DashboardLayout role="student">
      <div className="p-6 max-w-6xl mx-auto min-h-screen transition-colors duration-300">
        <h1 className="text-3xl font-bold mb-10 text-slate-900 dark:text-white">Smart Career Prediction</h1>

        {/* --- 1. ACADEMIC PROFILE --- */}
        <section className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 mb-10 transition-colors">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-1.5 h-6 bg-blue-600 rounded-full"></div>
            <h2 className="text-xl font-bold text-slate-800 dark:text-white">Academic Profile</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-slate-600 dark:text-slate-300">Department / Branch</label>
              <select value={form.branch} onChange={(e) => setForm({ ...form, branch: e.target.value })} className="w-full h-12 px-4 bg-slate-50 dark:bg-slate-900 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500">
                {Object.keys(BRANCH_CONFIG).map(b => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-slate-600 dark:text-slate-300">Current Year</label>
              <select value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })} className="w-full h-12 px-4 bg-slate-50 dark:bg-slate-900 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500">
                {["1st Year", "2nd Year", "3rd Year", "4th Year"].map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
          </div>
        </section>

        {/* --- 2. SKILLS & PROFICIENCY --- */}
        <section className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 mb-10 overflow-visible transition-colors">

          <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-700 flex items-center gap-3">
            <div className="w-1.5 h-6 bg-indigo-600 rounded-full"></div>
            <h2 className="text-lg font-bold text-slate-800 dark:text-white">Skills & Tools</h2>
          </div>

          <div className="p-8 space-y-10">
            <div className="grid md:grid-cols-3 gap-10">
              <SkillCategory title="Programming" options={branchOptions.programming} selected={form.programmingSkills} field="programmingSkills" />
              <SkillCategory title="Technical" options={branchOptions.technical} selected={form.technicalSkills} field="technicalSkills" />
              <SkillCategory title="Tools" options={branchOptions.tools} selected={form.toolsUsed} field="toolsUsed" />
            </div>

            <div className="pt-8 border-t border-slate-100 dark:border-slate-700 flex flex-col md:flex-row md:items-center gap-6 relative z-20">
              <div className="min-w-[160px]">
                <label className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400 tracking-wider block mb-1">
                  Skill Proficiency
                </label>
                <div className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-2 py-1 rounded inline-block">
                  Current: {form.skillProficiency}
                </div>
              </div>

              <div className="flex-1 flex flex-col sm:flex-row gap-4 items-center">
                <button type="button" onClick={() => setShowProficiencyTest(true)} className="w-full sm:w-auto py-3 px-8 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg transition-all active:scale-95">
                  Test Skill Proficiency
                </button>

                <div className="flex bg-slate-100 dark:bg-slate-900/50 p-1.5 rounded-2xl w-full max-w-sm border border-transparent dark:border-slate-700">
                  {["Beginner", "Intermediate", "Advanced"].map(l => (
                    <div
                      key={l}
                      className={`flex-1 py-2 text-center text-xs font-bold rounded-xl transition-all ${form.skillProficiency === l
                        ? "bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm"
                        : "text-slate-400 dark:text-slate-500"
                        }`}
                    >
                      {l}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CAREER PREFERENCES */}
        <section className="bg-white dark:bg-slate-800 p-8 rounded-2xl mb-10 shadow-sm border border-slate-200 dark:border-slate-700 transition-colors">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-1.5 h-6 bg-emerald-500 rounded-full"></div>
            <h2 className="text-xl font-bold text-slate-800 dark:text-white">Career Preferences</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8 items-start">
            <SkillCategory
              title="Area of Interest"
              options={branchOptions.interests}
              selected={form.interests}
              field="interests"
            />

            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400 tracking-wider">
                Job Type
              </label>
              <select
                value={form.jobType}
                onChange={(e) => setForm({ ...form, jobType: e.target.value })}
                className="w-full h-11 px-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option className="dark:bg-slate-900">Industry Based</option>
                <option className="dark:bg-slate-900">Research Oriented</option>
              </select>
            </div>
          </div>
        </section>

        {/* --- 3. ASSESSMENT SCORES --- */}
        <section className="bg-white dark:bg-slate-800 p-8 rounded-2xl mb-8 shadow-sm border border-slate-200 dark:border-slate-700 overflow-visible">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-1.5 h-6 bg-orange-500 rounded-full"></div>
            <h2 className="text-xl font-bold">Assessment Scores</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-10">
            {['aptitude', 'communication', 'risk'].map((scoreKey) => (
              <div key={scoreKey} className="flex flex-col gap-4 relative">
                <div className="flex justify-between items-center group relative">
                  <label className="text-xs font-bold uppercase text-slate-500 cursor-help" onMouseEnter={() => setActiveTooltip(scoreKey)} onMouseLeave={() => setActiveTooltip(null)}>
                    {scoreKey === 'risk' ? 'Risk Tolerance' : scoreKey}
                  </label>
                  <InfoPopup id={scoreKey} />
                  <span className="text-sm font-bold text-orange-600">{form[scoreKey]}%</span>
                </div>
                {scoreKey === 'aptitude' ? (
                  <button onClick={() => setShowAptitudeTest(true)} className="w-full py-2.5 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold rounded-xl shadow-md transition-all active:scale-95">Take Aptitude Test</button>
                ) : (
                  <input type="range" min="0" max="100" value={form[scoreKey]} onChange={(e) => setForm({ ...form, [scoreKey]: +e.target.value })} className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-orange-500" />
                )}
              </div>
            ))}
          </div>
        </section>

        {/* --- ACTION --- */}
        {status.message && (
          <div className={`mb-6 p-4 rounded-2xl text-center text-sm font-semibold animate-in fade-in duration-300 ${status.type === 'error' ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-700'}`}>
            {status.message}
          </div>
        )}

        <button onClick={predictCareer} disabled={loading} className="w-full py-4 bg-indigo-600 text-white text-xl font-bold rounded-2xl shadow-xl hover:bg-indigo-700 active:scale-95 transition-all disabled:opacity-50">
          {loading ? "Analyzing..." : "Predict My Career Path"}
        </button>

        {/* ✅ PREMIUM RESULTS SECTION */}
        {recommendations.length > 0 && (
          <div className="mt-8 relative overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-xl">

            {/* Background glow effect */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute -top-24 -right-24 w-72 h-72 bg-indigo-500/20 blur-3xl rounded-full" />
              <div className="absolute -bottom-28 -left-20 w-80 h-80 bg-fuchsia-500/10 blur-3xl rounded-full" />
            </div>

            {/* Header */}
            <div className="relative p-6 border-b border-slate-100 dark:border-slate-800 bg-gradient-to-r from-indigo-50 via-white to-white dark:from-slate-900 dark:via-slate-900 dark:to-slate-900">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h3 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                    🚀 Top Career Recommendations
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    AI-powered results based on skills, interests & assessment scores
                  </p>
                </div>

                <div className="hidden sm:flex items-center gap-2">
                  <span className="text-[10px] font-bold px-3 py-1 rounded-full bg-indigo-600 text-white shadow-md">
                    AI Verified
                  </span>

                  <span className="text-[10px] font-bold px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                    Saved: {savedCareers.length}
                  </span>
                </div>
              </div>
            </div>

            {/* Cards */}
            <div className="relative p-6">
              <div className="grid gap-4">
                {recommendations.map((item, idx) => {
                  const score = Number(item.matching_score || 0);
                  const isTop = idx === 0;

                  const rankBadge =
                    idx === 0 ? "🥇" :
                      idx === 1 ? "🥈" :
                        idx === 2 ? "🥉" :
                          `#${idx + 1}`;

                  const confidenceLabel =
                    score >= 70 ? "Strong Match" :
                      score >= 45 ? "Good Match" :
                        "Low Match";

                  const confidenceClass =
                    score >= 70
                      ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30"
                      : score >= 45
                        ? "bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border-indigo-500/30"
                        : "bg-orange-500/15 text-orange-700 dark:text-orange-300 border-orange-500/30";

                  const isExpanded = expandedCareer === idx;

                  const alreadySaved = savedCareers.some(
                    (c) => c?.career?.toLowerCase() === item?.career?.toLowerCase()
                  );

                  const whyThisCareer =
                    score >= 70
                      ? `This career matches your current skill profile strongly. Your selected interests & proficiency indicate you’ll excel here with minimal gaps.`
                      : score >= 45
                        ? `This is a good match based on your interests and tools. With a bit more focused practice, your probability of success increases a lot.`
                        : `This is a lower match right now, but it can still work if you build the required skills and strengthen weak areas gradually.`;

                  return (
                    <div
                      key={idx}
                      className={`group relative overflow-hidden rounded-2xl border transition-all duration-300
                        ${isTop
                          ? "border-indigo-300/60 dark:border-indigo-500/40 bg-gradient-to-r from-indigo-50 to-white dark:from-indigo-500/10 dark:to-slate-900 shadow-lg"
                          : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40"}
                        hover:shadow-2xl hover:-translate-y-[2px]
                      `}
                    >
                      {/* Shine */}
                      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                        <div className="absolute -left-24 top-0 w-40 h-full bg-white/20 blur-xl rotate-12" />
                      </div>

                      <div className="relative p-5 flex flex-col gap-4">

                        {/* Top row */}
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-start gap-3">
                            <div className={`min-w-[44px] h-11 flex items-center justify-center rounded-2xl font-extrabold text-sm
                              ${isTop
                                ? "bg-indigo-600 text-white shadow-md"
                                : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700"}
                            `}>
                              {rankBadge}
                            </div>

                            <div className="flex flex-col">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h4 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white">
                                  {item.career}
                                </h4>

                                {isTop && (
                                  <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-indigo-600 text-white shadow-sm">
                                    BEST FIT
                                  </span>
                                )}

                                <span className={`text-[10px] font-bold px-2 py-1 rounded-full border ${confidenceClass}`}>
                                  {confidenceLabel}
                                </span>

                                {alreadySaved && (
                                  <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-emerald-500 text-white">
                                    Saved ✅
                                  </span>
                                )}
                              </div>

                              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                Match score shows how closely your profile aligns with this career path.
                              </p>
                            </div>
                          </div>

                          {/* Score */}
                          <div className="text-right">
                            <div className="text-2xl font-black text-indigo-700 dark:text-indigo-300 leading-none">
                              {score}%
                            </div>
                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">
                              Match
                            </div>
                          </div>
                        </div>

                        {/* Progress */}
                        <div className="w-full">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                              Confidence Meter
                            </span>
                            <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300">
                              {score >= 70 ? "High" : score >= 45 ? "Medium" : "Low"}
                            </span>
                          </div>

                          <div className="h-2.5 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden border border-slate-200 dark:border-slate-700">
                            <div
                              className={`h-full rounded-full transition-all duration-700 ${isTop ? "bg-indigo-600" : "bg-indigo-500"}`}
                              style={{ width: `${Math.min(Math.max(score, 0), 100)}%` }}
                            />
                          </div>
                        </div>

                        {/* Buttons Row */}
                        <div className="flex flex-col sm:flex-row sm:items-center gap-3 pt-1">

                          {/* Career Roadmap button */}
                          <button
                            type="button"
                            onClick={() => {
                              const query = encodeURIComponent(`${item.career} roadmap skills projects`);
                              window.open(`https://www.google.com/search?q=${query}`, "_blank");
                            }}
                            className="flex-1 py-2.5 rounded-xl font-bold text-xs bg-indigo-600 hover:bg-indigo-700 text-white shadow-md transition-all active:scale-95"
                          >
                            🧭 View Roadmap
                          </button>

                          {/* Expand Why button */}
                          <button
                            type="button"
                            onClick={() => setExpandedCareer(isExpanded ? null : idx)}
                            className="flex-1 py-2.5 rounded-xl font-bold text-xs bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-200/60 dark:hover:bg-slate-700/60 transition-all active:scale-95"
                          >
                            {isExpanded ? "🔽 Hide Why" : "💡 Why This Career?"}
                          </button>

                          {/* Save to dashboard */}
                          <button
                            type="button"
                            disabled={alreadySaved}
                            onClick={() => {
                              const newSaved = [
                                ...savedCareers,
                                {
                                  career: item.career,
                                  matching_score: score,
                                  savedAt: new Date().toISOString(),
                                },
                              ];
                              setSavedCareers(newSaved);
                              localStorage.setItem("savedCareers", JSON.stringify(newSaved));
                              showFlashMessage(`Saved to dashboard ✅: ${item.career}`);
                            }}
                            className={`flex-1 py-2.5 rounded-xl font-bold text-xs shadow-md transition-all active:scale-95
                              ${alreadySaved
                                ? "bg-emerald-500/30 text-emerald-700 dark:text-emerald-300 cursor-not-allowed"
                                : "bg-emerald-600 hover:bg-emerald-700 text-white"}
                            `}
                          >
                            {alreadySaved ? "✅ Saved" : "💾 Save"}
                          </button>
                        </div>

                        {/* Expandable Why */}
                        {isExpanded && (
                          <div className="mt-2 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40 p-4 animate-in fade-in duration-300">
                            <div className="text-xs font-extrabold text-slate-800 dark:text-white mb-2">
                              🧠 Why AI recommended this?
                            </div>

                            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                              {whyThisCareer}
                            </p>

                            <div className="mt-3 grid sm:grid-cols-3 gap-2">
                              <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3">
                                <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">
                                  Strength
                                </div>
                                <div className="text-xs font-extrabold text-slate-800 dark:text-slate-200 mt-1">
                                  {score >= 70 ? "High Alignment" : score >= 45 ? "Balanced Fit" : "Needs Growth"}
                                </div>
                              </div>

                              <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3">
                                <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">
                                  Next Step
                                </div>
                                <div className="text-xs font-extrabold text-slate-800 dark:text-slate-200 mt-1">
                                  {score >= 70 ? "Start Projects" : "Improve Skills"}
                                </div>
                              </div>

                              <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3">
                                <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">
                                  Recommendation
                                </div>
                                <div className="text-xs font-extrabold text-slate-800 dark:text-slate-200 mt-1">
                                  {isTop ? "Priority Career" : "Explore Option"}
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Pro tip */}
              <div className="mt-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40 p-4">
                <div className="text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
                  💡 Pro Tip
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Save your best career and build roadmap step-by-step. Then adjust skills and run prediction again to improve your match score.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* --- MODAL: PROFICIENCY --- */}
        {showProficiencyTest && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
            <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl shadow-2xl p-8 animate-in zoom-in duration-200 border border-transparent dark:border-slate-800">
              <h3 className="text-xl font-bold mb-6 text-slate-800 dark:text-white">Skill Assessment Form</h3>
              <div className="space-y-4 mb-8">
                {['projects', 'internships', 'certifications', 'yearsOfExperience'].map(k => (
                  <div key={k}>
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wide">
                      {k.replace(/([A-Z])/g, ' $1')}
                    </label>
                    <input
                      type="number"
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 outline-none text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 transition-colors"
                      value={testForm[k]}
                      onChange={e => setTestForm({ ...testForm, [k]: e.target.value })}
                    />
                  </div>
                ))}
              </div>
              <button onClick={calculateProficiency} className="w-full py-4 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 transition-all active:scale-95 shadow-lg shadow-indigo-200 dark:shadow-none">
                Submit Assessment
              </button>
              <button onClick={() => setShowProficiencyTest(false)} className="w-full mt-2 py-2 text-slate-400 dark:text-slate-500 text-sm font-medium hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* --- MODAL: APTITUDE --- */}
        {showAptitudeTest && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
            <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl shadow-2xl animate-in zoom-in duration-200 overflow-hidden border border-transparent dark:border-slate-800">
              <div className="p-6 bg-orange-50 dark:bg-orange-900/20 border-b border-orange-100 dark:border-orange-900/30 flex justify-between items-center">
                <h3 className="font-bold text-orange-900 dark:text-orange-400">Aptitude Test</h3>
                <button onClick={() => setShowAptitudeTest(false)} className="text-orange-900/50 dark:text-orange-400/50 hover:text-orange-900 dark:hover:text-orange-400">✕</button>
              </div>

              <div className="p-8 space-y-6 max-h-[60vh] overflow-y-auto">
                {APTITUDE_QUESTIONS.map(q => (
                  <div key={q.id}>
                    <p className="text-sm font-bold mb-3 text-slate-800 dark:text-slate-200">{q.id}. {q.q}</p>
                    <div className="grid grid-cols-2 gap-2">
                      {q.options.map(o => (
                        <button
                          key={o}
                          onClick={() => setAptitudeAnswers({ ...aptitudeAnswers, [q.id]: o })}
                          className={`py-2 text-xs border rounded-lg transition-all ${aptitudeAnswers[q.id] === o
                            ? "bg-orange-500 text-white border-orange-500 shadow-md"
                            : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-orange-50 dark:hover:bg-orange-900/20"
                            }`}
                        >
                          {o}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
                <button
                  onClick={calculateAptitudeScore}
                  disabled={Object.keys(aptitudeAnswers).length < 5}
                  className="w-full py-4 bg-orange-500 text-white font-bold rounded-2xl disabled:opacity-50 disabled:grayscale transition-all active:scale-95 shadow-lg shadow-orange-200 dark:shadow-none"
                >
                  Generate Results
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
}
