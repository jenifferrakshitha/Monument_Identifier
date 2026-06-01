import React, { useState, useEffect } from "react";
import { User, Monument, DatasetCategory, PredictionHistory } from "./types";
import { STATIC_PREPROCESSING_STEPS, MOCK_STARTER_HISTORY } from "./data/monumentsData";
import {
  Camera,
  FolderOpen,
  Cpu,
  Server,
  Code2,
  Upload,
  Layers,
  History,
  MapPin,
  Clock,
  Ticket,
  Calendar,
  Sparkles,
  RefreshCw,
  User as UserIcon,
  ShieldAlert,
  Compass,
  ArrowRight,
  Landmark,
  X,
  CheckCircle2,
  Lock,
  Eye,
  Info,
  Globe,
  Terminal,
  Plus,
  Search,
  Send,
  MessageSquare,
  Navigation
} from "lucide-react";

const FALLBACK_CATALOG: Monument[] = [
  {
    id: "taj",
    name: "Taj Mahal",
    location: "Agra, Uttar Pradesh, India",
    builtBy: "Emperor Shah Jahan",
    architecture: "Mughal Architecture",
    history: "The Taj Mahal is an ivory-white marble mausoleum on the south bank of the Yamuna river. It was commissioned in 1631 by the Mughal emperor Shah Jahan to house the tomb of his favourite wife, Mumtaz Mahal; it also houses the tomb of Shah Jahan himself.",
    famousFacts: [
      "A national landmark and one of the Seven Wonders of the modern world.",
      "The materials were sourced from all over India and Asia, requiring over 1,000 elephants.",
      "The walls are adorned with intricate Pietra Dura stone inlays."
    ],
    bestTimeToVisit: "October to March (for pleasant weather)",
    ticketPrice: "INR 50 (Indian citizens) / INR 1100 (Foreign nationals)",
    visitingHours: "Sunrise to Sunset (Closed on Fridays)",
    latitude: 27.1751,
    longitude: 78.0421,
    image: "https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&q=80&w=400"
  },
  {
    id: "eiffel",
    name: "Eiffel Tower",
    location: "Champ de Mars, Paris, France",
    builtBy: "Gustave Eiffel & Co.",
    architecture: "Wrought-Iron Lattice Structure",
    history: "Constructed between 1887 and 1889 as the entrance arch for the 1889 World's Fair, the Eiffel Tower was initially criticized by leading French artists but has become a global cultural icon of France and one of the most recognizable structures in the world.",
    famousFacts: [
      "It was originally intended to be a temporary structure dismantled after 20 years.",
      "Due to thermal expansion, its metal structure height increases by up to 15 cm in summer.",
      "It is painted every seven years using 60 tons of custom 'Eiffel Tower Brown' paint."
    ],
    bestTimeToVisit: "June to September (warm weather, beautiful sunsets)",
    ticketPrice: "EUR 11 - EUR 28 depending on elevator levels",
    visitingHours: "09:30 AM to 10:45 PM daily",
    latitude: 48.8584,
    longitude: 2.2945,
    image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&q=80&w=400"
  },
  {
    id: "colosseum",
    name: "Colosseum",
    location: "Piazza del Colosseo, Rome, Italy",
    builtBy: "Emperors Vespasian and Titus",
    architecture: "Ancient Roman Classical Architecture",
    history: "The Colosseum, also known as the Flavian Amphitheatre, is an oval amphitheatre in the centre of the city of Rome, Italy, just east of the Roman Forum. It is the largest ancient amphitheatre ever built, constructed out of travertine limestone, tuff, and brick-faced concrete.",
    famousFacts: [
      "Could hold up to 80,000 spectators for ancient gladiator battles and naval spectacles.",
      "Features a complex subterranean maze of lifts and trapdoors called the hypogeum.",
      "Vandalized by natural disasters like earthquakes and stone thieves over the centuries."
    ],
    bestTimeToVisit: "October to April (cooler temperatures, less crowds)",
    ticketPrice: "EUR 16 (includes Roman Forum & Palatine Hill)",
    visitingHours: "08:30 AM to 07:00 PM daily",
    latitude: 41.8902,
    longitude: 12.4922,
    image: "https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&q=80&w=400"
  },
  {
    id: "india-gate",
    name: "India Gate",
    location: "Rajpath, New Delhi, Delhi, India",
    builtBy: "Edwin Lutyens",
    architecture: "Memorial Triumphal Arch",
    history: "The India Gate is a war memorial located astride the Rajpath, on the eastern edge of the ceremonial axis of New Delhi, formerly called kingsway. It stands as a memorial to 84,000 soldiers of the British Indian Army who died between 1914 and 1921 in the First World War.",
    famousFacts: [
      "Heavily inspired by the iconic Arc de Triomphe in Paris.",
      "Features an eternal flame named 'Amar Jawan Jyoti' to honor unknown martyrs since 1971.",
      "Engraved on the arch are the historic names of over 13,000 fallen soldiers."
    ],
    bestTimeToVisit: "October to March (for cooler evening walks)",
    ticketPrice: "Free Entry",
    visitingHours: "Open 24/7",
    latitude: 28.6129,
    longitude: 77.2295,
    image: "https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&q=80&w=400"
  }
];

export default function App() {
  // Auth state - initialized logged out by default
  const [currentUser, setCurrentUser] = useState<User>({
    username: "",
    isLoggedIn: false,
    isAdmin: false
  });

  const [loginUsername, setLoginUsername] = useState<string>("admin");
  const [loginPassword, setLoginPassword] = useState<string>("password123");
  const [authError, setAuthError] = useState<string | null>(null);
  const [isSigningUp, setIsSigningUp] = useState<boolean>(false);
  const [showLoginModal, setShowLoginModal] = useState<boolean>(false);

  // Active Main Menu Tabs: 'home' | 'detector' | 'about'
  const [activeTab, setActiveTab] = useState<string>("home");

  // Inside "Identify Monument" (detector), we support workspace views so that Checkpoint 0 tools remain perfectly accessible
  const [detectorSubTab, setDetectorSubTab] = useState<string>("scanner"); // 'scanner' | 'dataset' | 'sandbox' | 'metrics' | 'code'

  // Predict outputs
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [imageName, setImageName] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [processingState, setProcessingState] = useState<number>(-1); // step index of preprocessing
  const [predictionResult, setPredictionResult] = useState<Monument | null>(null);
  const [classificationSource, setClassificationSource] = useState<string>("");
  const [conv2dActivations, setConv2dActivations] = useState<any[]>([]);
  const [predictionHistory, setPredictionHistory] = useState<PredictionHistory[]>([]);

  // Database Catalogue states
  const [monumentCatalog, setMonumentCatalog] = useState<Monument[]>([]);
  const [datasetCategories, setDatasetCategories] = useState<DatasetCategory[]>([]);
  const [datasetLoading, setDatasetLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedMonument, setSelectedMonument] = useState<Monument | null>(null);

  // Q&A states
  const [questionText, setQuestionText] = useState<string>("");
  const [qaHistory, setQaHistory] = useState<{ id: string; question: string; answer: string; source: string }[]>([]);
  const [isAskingQuestion, setIsAskingQuestion] = useState<boolean>(false);

  // Preloaded preset landmarks catalog for fast classification testing
  const PRESET_MONUMENTS = [
    {
      name: "Taj Mahal",
      image: "https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&q=80&w=400",
      filename: "taj_mahal_preset.jpg"
    },
    {
      name: "Eiffel Tower",
      image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&q=80&w=400",
      filename: "eiffel_tower_preset.png"
    },
    {
      name: "Colosseum",
      image: "https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&q=80&w=400",
      filename: "colosseum_preset.jpg"
    }
  ];

  // Fetch initial prediction logs history
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await fetch("/api/history");
        const data = await response.json();
        if (data && data.history) {
          setPredictionHistory(data.history);
        } else {
          setPredictionHistory(MOCK_STARTER_HISTORY);
        }
      } catch (e) {
        setPredictionHistory(MOCK_STARTER_HISTORY);
      }
    };
    if (currentUser.isLoggedIn) {
      fetchHistory();
    }
  }, [currentUser.isLoggedIn]);

  // Fetch database catalogue of monuments
  useEffect(() => {
    const fetchMonuments = async () => {
      try {
        const response = await fetch("/api/monuments");
        const data = await response.json();
        if (data && data.monuments) {
          setMonumentCatalog(data.monuments);
        } else {
          setMonumentCatalog(FALLBACK_CATALOG);
        }
      } catch (err) {
        setMonumentCatalog(FALLBACK_CATALOG);
      }
    };
    fetchMonuments();

    const fetchDataset = async () => {
      try {
        const response = await fetch("/api/dataset");
        const data = await response.json();
        if (data && data.categories) {
          setDatasetCategories(data.categories);
        }
      } catch (err) {
        setDatasetCategories([]);
      } finally {
        setDatasetLoading(false);
      }
    };
    fetchDataset();
  }, []);

  // Auth processing form
  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    const url = isSigningUp ? "/api/auth/signup" : "/api/auth/login";

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: loginUsername, password: loginPassword }),
      });
      const data = await response.json();

      if (response.ok && data.success) {
        setCurrentUser({
          username: data.user.username,
          isLoggedIn: true,
          isAdmin: data.user.isAdmin
        });
        setShowLoginModal(false);
      } else {
        setAuthError(data.error || "Authentication failed. Try again.");
      }
    } catch (err) {
      // In case server has not initialized completely, fallback client-side for immediate start!
      if (loginUsername && loginPassword) {
        setCurrentUser({
          username: loginUsername,
          isLoggedIn: true,
          isAdmin: loginUsername === "admin"
        });
        setShowLoginModal(false);
      } else {
        setAuthError("Network credentials mismatch.");
      }
    }
  };

  // Image Drag-and-Drop or direct uploads handler
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageName(file.name);
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = () => {
      setUploadedImage(reader.result as string);
      triggerMlPipeline(reader.result as string, file.type, file.name);
    };
  };

  // Trigger preset select image
  const handlePresetSelect = (preset: typeof PRESET_MONUMENTS[0]) => {
    setUploadedImage(preset.image);
    setImageName(preset.filename);
    triggerMlPipeline(preset.image, "image/jpeg", preset.filename);
  };

  // Simulated OpenCV and predict matrix progression triggers
  const triggerMlPipeline = async (imageBytes: string, mimeType: string, filename: string) => {
    setIsProcessing(true);
    setPredictionResult(null);
    setProcessingState(0);

    // Sequence jumps representing sequential filter effects
    const interval = setInterval(() => {
      setProcessingState((prev) => {
        if (prev < STATIC_PREPROCESSING_STEPS.length - 1) {
          return prev + 1;
        } else {
          clearInterval(interval);
          return prev;
        }
      });
    }, 450);

    try {
      const response = await fetch("/api/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBytes, mimeType, filename }),
      });
      const data = await response.json();

      setTimeout(async () => {
        if (data.success) {
          setPredictionResult(data.prediction);
          setClassificationSource(data.source);
          setConv2dActivations(data.conv2DActivations);

          // Refresh logs
          const histRes = await fetch("/api/history");
          const histData = await histRes.json();
          if (histData && histData.history) {
            setPredictionHistory(histData.history);
          }
        }
        setIsProcessing(false);
        setProcessingState(-1);
      }, 2400);

    } catch (err) {
      console.error(err);
      setIsProcessing(false);
      setProcessingState(-1);
    }
  };

  const getProcessingStateClass = (stepIdx: number) => {
    if (processingState > stepIdx) return "text-emerald-600 font-bold flex items-center gap-1.5";
    if (processingState === stepIdx) return "text-amber-500 font-black animate-pulse flex items-center gap-1.5";
    return "text-slate-400 flex items-center gap-1.5";
  };

  const handleAskQuestionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!questionText.trim()) return;

    setIsAskingQuestion(true);
    const textQuery = questionText;
    setQuestionText("");

    try {
      const response = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageBytes: uploadedImage,
          mimeType: "image/jpeg",
          question: textQuery,
          monumentName: predictionResult?.name || ""
        }),
      });
      const data = await response.json();
      if (data && data.success) {
        setQaHistory((prev) => [
          ...prev,
          {
            id: Math.random().toString(36).substr(2, 9),
            question: textQuery,
            answer: data.answer,
            source: data.source || "Gemini AI"
          }
        ]);
      } else {
        throw new Error(data.error || "Failed to generate answer.");
      }
    } catch (err: any) {
      console.error(err);
      setQaHistory((prev) => [
        ...prev,
        {
          id: Math.random().toString(36).substr(2, 9),
          question: textQuery,
          answer: "Apologies, we encountered an error compiling response details. Please verify your internet connection or check the backend Gemini configurations.",
          source: "Heuristic Error Fallback"
        }
      ]);
    } finally {
      setIsAskingQuestion(false);
    }
  };

  return (
    <div id="monument-system-root" className="min-h-screen bg-[#faf9f6] flex flex-col font-sans text-slate-800 antialiased select-text">
      
      {/* PERFECT NAVBAR REPLICA */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-stone-200/80 px-4 md:px-8 py-3.5 transition-all shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          
          {/* Leftside Branding Column Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#e07a1b] rounded-xl flex items-center justify-center text-white shadow-md shadow-amber-500/10 shrink-0">
              <Landmark className="w-5 h-5" />
            </div>
            <div className="text-left select-none">
              <div className="flex items-center gap-1">
                <span className="font-display font-bold text-stone-900 text-lg md:text-xl tracking-tight leading-none">
                  Monument <span className="text-[#e07a1b]">Identifier</span>
                </span>
              </div>
              <span className="block tracking-[0.16em] text-[8px] sm:text-[9px] leading-none font-bold text-stone-500 uppercase font-mono mt-1 select-none">
                INTELLECTUAL EXPLORATION CORE
              </span>
            </div>
          </div>

          {/* Center Navigation Links matches the screenshot */}
          <nav className="hidden md:flex items-center gap-1 bg-stone-100 p-1 rounded-full border border-stone-200/50">
            <button
              onClick={() => setActiveTab("home")}
              className={`px-4 py-1.5 rounded-full text-xs lg:text-sm font-semibold transition-all cursor-pointer ${
                activeTab === "home"
                  ? "bg-amber-50/90 text-[#e07a1b] shadow-sm font-bold"
                  : "text-stone-600 hover:text-stone-900 hover:bg-stone-200/60"
              }`}
            >
              Home
            </button>
            <button
              onClick={() => {
                setActiveTab("detector");
                setDetectorSubTab("scanner");
              }}
              className={`px-4 py-1.5 rounded-full text-xs lg:text-sm font-semibold transition-all cursor-pointer ${
                activeTab === "detector" && detectorSubTab === "scanner"
                  ? "bg-amber-50/90 text-[#e07a1b] shadow-sm font-bold"
                  : "text-stone-600 hover:text-stone-900 hover:bg-stone-200/60"
              }`}
            >
              Identify Monument
            </button>
            <button
              onClick={() => setActiveTab("about")}
              className={`px-4 py-1.5 rounded-full text-xs lg:text-sm font-semibold transition-all cursor-pointer ${
                activeTab === "about"
                  ? "bg-amber-50/90 text-[#e07a1b] shadow-sm font-bold"
                  : "text-stone-600 hover:text-stone-900 hover:bg-stone-200/60"
              }`}
            >
              About
            </button>
          </nav>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setLoginUsername("admin");
                setLoginPassword("password123");
                setAuthError(null);
                setShowLoginModal(true);
              }}
              className="text-stone-600 hover:text-[#e07a1b] text-xs sm:text-sm font-bold transition-all px-3 py-1.5 cursor-pointer"
            >
              Sign In
            </button>
            <button
              onClick={() => {
                setActiveTab("detector");
                setDetectorSubTab("scanner");
              }}
              className="bg-[#e07a1b] hover:bg-[#c66512] text-white rounded-xl px-4 py-2 text-xs sm:text-sm font-bold transition-colors shadow-sm cursor-pointer hover:shadow-md"
            >
              Get Started
            </button>
          </div>

        </div>
      </header>

      {/* MOBILE COMPACT NAV RAIL FOR QUICK EXPANSION */}
      <div className="md:hidden flex items-center justify-around border-b border-stone-200 bg-stone-50 py-2.5 px-4">
        <button
          onClick={() => setActiveTab("home")}
          className={`flex flex-col items-center gap-0.5 text-[10px] font-bold ${
            activeTab === "home" ? "text-[#e07a1b]" : "text-stone-500"
          }`}
        >
          <Compass className="w-4 h-4" />
          <span>Home</span>
        </button>
        <button
          onClick={() => {
            setActiveTab("detector");
            setDetectorSubTab("scanner");
          }}
          className={`flex flex-col items-center gap-0.5 text-[10px] font-bold ${
            activeTab === "detector" && detectorSubTab === "scanner" ? "text-[#e07a1b]" : "text-stone-500"
          }`}
        >
          <Camera className="w-4 h-4" />
          <span>Scanner</span>
        </button>
        <button
          onClick={() => setActiveTab("about")}
          className={`flex flex-col items-center gap-0.5 text-[10px] font-bold ${
            activeTab === "about" ? "text-[#e07a1b]" : "text-stone-500"
          }`}
        >
          <Info className="w-4 h-4" />
          <span>About</span>
        </button>
      </div>

      {/* MAIN LAYOUT WRAPPER */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-8 flex flex-col gap-8 relative z-10">
        
        {/* TAB 1: HOME (STUNNING SPEC REPLICAS) */}
        {activeTab === "home" && (
          <div className="flex flex-col gap-10 animate-fade-in">
            
            {/* HERO CARD BLOCK COMPLYING WITH IMAGE */}
            <section className="bg-gradient-to-br from-[#1c140e] via-[#100a06] to-[#1a110a] rounded-[32px] p-6 sm:p-10 md:p-16 text-center shadow-2xl relative overflow-hidden border border-amber-950/20">
              
              {/* Radial Glowing Background Orbs */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] h-[340px] bg-amber-500/10 rounded-full blur-[140px] pointer-events-none" />
              
              <div className="relative z-10 flex flex-col items-center">
                
                {/* Initiative Badge */}
                <div className="inline-flex items-center gap-2 bg-[#422006]/35 border border-amber-500/35 px-4 py-2 rounded-full mb-8 select-none backdrop-blur-md">
                  <Landmark className="w-4 h-4 text-amber-400" />
                  <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-[#e0a96d] font-mono">
                    HERITAGE ARCHIVAL & IDENTIFICATION INITIATIVE
                  </span>
                </div>

                {/* Display Header Text */}
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-display font-black text-white leading-tight tracking-tight max-w-4xl mx-auto mb-6">
                  Monument Identifier <br />
                  <span className="text-[#ea580c] bg-gradient-to-r from-amber-400 via-orange-500 to-amber-500 bg-clip-text text-[#e37a1a]">
                    Digital Preservation Project
                  </span>
                </h1>

                {/* Subtitle Paragraph Description */}
                <p className="text-stone-300 text-xs sm:text-sm md:text-base font-medium leading-relaxed max-w-2xl mx-auto mb-10 text-stone-300/90 font-sans">
                  Exploring the intersection of deep convolutional vision networks and historical analysis. 
                  This project is built to identify global landmarks instantly, providing interactive 
                  educational materials and tourism guidance files.
                </p>

                {/* Styled Button Pair */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto">
                  <button
                    onClick={() => {
                      setActiveTab("detector");
                      setDetectorSubTab("scanner");
                    }}
                    className="w-full sm:w-auto bg-[#e07a1b] hover:bg-[#c66512] text-white font-bold px-7 py-4 rounded-2xl text-xs sm:text-sm transition-all shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2.5 cursor-pointer transform hover:-translate-y-0.5"
                  >
                    <Camera className="w-4.5 h-4.5" />
                    <span>Launch Snapshot Scanner</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setActiveTab("about")}
                    className="w-full sm:w-auto border border-stone-850 bg-[#251e18]/50 hover:bg-[#34271e]/75 text-stone-200 font-bold px-7 py-4 rounded-2xl text-xs sm:text-sm transition-all cursor-pointer"
                  >
                    Learn Significance
                  </button>
                </div>

              </div>
            </section>

            {/* DATABASE CATALOGUE OF MONUMENTS */}
            <section className="flex flex-col gap-8 bg-white border border-stone-200/80 rounded-3xl p-6 sm:p-8 shadow-sm">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-stone-100 pb-5">
                <div className="text-left">
                  <span className="text-xs font-bold uppercase tracking-widest text-[#e07a1b] font-mono">Verified Architectural Archives</span>
                  <h2 className="text-2xl font-bold tracking-tight text-stone-900 mt-1">Database Catalogue of Monuments</h2>
                  <p className="text-xs text-stone-500 font-semibold mt-1">Explore verified details, geographical mappings, historical chronicles, and visiting information.</p>
                </div>

                {/* Search Bar & Stats */}
                <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
                  <div className="relative w-full sm:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                    <input
                      type="text"
                      placeholder="Search name, architecture..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-stone-50 border border-stone-200 rounded-xl pl-9 pr-4 py-2 text-xs sm:text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors text-left"
                    />
                  </div>
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="text-xs text-stone-500 hover:text-stone-800 font-bold cursor-pointer underline shrink-0"
                    >
                      Clear
                    </button>
                  )}
                  <div className="text-stone-500 text-xs font-mono shrink-0 bg-stone-50 border border-stone-200 px-3 py-2 rounded-xl">
                    Total: <span className="font-bold text-stone-800">{monumentCatalog.length} Records</span>
                  </div>
                </div>
              </div>

              {/* Grid of Monument Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {(monumentCatalog.length > 0 ? monumentCatalog : FALLBACK_CATALOG)
                  .filter((m) => {
                    const q = searchQuery.toLowerCase();
                    return (
                      m.name.toLowerCase().includes(q) ||
                      m.location.toLowerCase().includes(q) ||
                      m.architecture.toLowerCase().includes(q) ||
                      m.builtBy.toLowerCase().includes(q)
                    );
                  })
                  .map((mon) => (
                    <div
                      key={mon.id}
                      className="group bg-stone-50 rounded-2xl overflow-hidden hover:bg-white text-left flex flex-col justify-between border border-stone-200/50 hover:border-[#e07a1b]/50 hover:shadow-lg transition-all duration-300"
                    >
                      <div>
                        {/* Image wrapper */}
                        <div className="relative h-44 overflow-hidden bg-stone-200">
                          <img
                            src={mon.image}
                            alt={mon.name}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          <div className="absolute top-3 right-3 bg-white/95 backdrop-blur border border-stone-200/50 px-2.5 py-1 rounded-full text-[10px] font-bold text-stone-700 tracking-wide">
                            {mon.architecture}
                          </div>
                        </div>

                        {/* Text Info */}
                        <div className="p-5">
                          <div className="flex items-center gap-1.5 text-stone-500 text-[11px] font-bold tracking-tight">
                            <MapPin className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                            <span className="truncate">{mon.location}</span>
                          </div>
                          
                          <h3 className="font-bold text-stone-900 text-base mt-1.5 group-hover:text-[#e07a1b] transition-colors">
                            {mon.name}
                          </h3>
                          
                          <p className="text-xs text-stone-500 font-semibold line-clamp-3 mt-2 leading-relaxed">
                            {mon.history}
                          </p>
                        </div>
                      </div>

                      {/* Footer Actions */}
                      <div className="px-5 pb-5 pt-2 border-t border-stone-100 flex items-center justify-between">
                        <span className="text-[10px] bg-amber-50 text-[#e07a1b] font-bold px-2 py-1 rounded-md">
                          {mon.visitingHours.includes("Closed") ? "Closed Fridays" : "Open Daily"}
                        </span>
                        
                        <button
                          onClick={() => setSelectedMonument(mon)}
                          className="text-stone-700 hover:text-[#e07a1b] font-bold text-xs flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          <span>Explore Details</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}

                {(monumentCatalog.length > 0 ? monumentCatalog : FALLBACK_CATALOG).filter((m) => {
                  const q = searchQuery.toLowerCase();
                  return (
                    m.name.toLowerCase().includes(q) ||
                    m.location.toLowerCase().includes(q) ||
                    m.architecture.toLowerCase().includes(q) ||
                    m.builtBy.toLowerCase().includes(q)
                  );
                }).length === 0 && (
                  <div className="col-span-full py-12 text-center">
                    <Compass className="w-10 h-10 text-stone-300 mx-auto animate-spin" />
                    <p className="text-stone-500 font-bold text-sm mt-3">No matching landmarks registered under keyword</p>
                    <p className="text-stone-400 text-xs mt-1">Try searching for other terms like 'Mughal', 'Paris', or 'Sandstone'</p>
                  </div>
                )}
              </div>
            </section>

            {/* DETAILED MONUMENT SPECIFICATION MODAL WITH INTEGRATED GOOGLE MAPS */}
            {selectedMonument && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-fade-in">
                <div className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto border border-stone-200">
                  
                  {/* Top Header Card */}
                  <div className="relative h-64 bg-stone-900">
                    <img
                      src={selectedMonument.image}
                      alt={selectedMonument.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover opacity-85"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent" />
                    
                    <button
                      onClick={() => setSelectedMonument(null)}
                      className="absolute top-4 right-4 w-9 h-9 bg-black/60 hover:bg-black/80 rounded-full flex items-center justify-center text-white transition-colors cursor-pointer"
                    >
                      <X className="w-5 h-5" />
                    </button>

                    <div className="absolute bottom-6 left-6 text-left">
                      <span className="text-[10px] font-mono tracking-widest text-[#e0a96d] uppercase bg-amber-950/70 border border-amber-500/30 px-2.5 py-1 rounded-md">
                        {selectedMonument.architecture}
                      </span>
                      <h2 className="text-2xl sm:text-3xl font-display font-bold text-white tracking-tight mt-2.5">
                        {selectedMonument.name}
                      </h2>
                    </div>
                  </div>

                  {/* Body Columns */}
                  <div className="p-6 sm:p-8 flex flex-col gap-6 text-left">
                    
                    {/* General Chronicle Narrative */}
                    <div>
                      <h4 className="text-xs font-bold uppercase text-stone-400 tracking-wider font-mono">Historical Chronicle</h4>
                      <p className="text-[#3a3530] text-sm leading-relaxed font-sans mt-2 font-medium">
                        {selectedMonument.history}
                      </p>
                    </div>

                    {/* Metadata Specs Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-stone-50 border border-stone-200/50 rounded-2xl p-4">
                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] uppercase font-bold text-stone-400 font-mono">Commissioned By</span>
                        <span className="text-xs font-bold text-stone-700">{selectedMonument.builtBy}</span>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] uppercase font-bold text-stone-400 font-mono">Best Visit Season</span>
                        <span className="text-xs font-bold text-stone-700">{selectedMonument.bestTimeToVisit}</span>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] uppercase font-bold text-stone-400 font-mono">Operating Hours</span>
                        <span className="text-xs font-bold text-stone-700">{selectedMonument.visitingHours}</span>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] uppercase font-bold text-stone-400 font-mono">Admissions Charge</span>
                        <span className="text-xs font-bold text-stone-700">{selectedMonument.ticketPrice}</span>
                      </div>
                    </div>

                    {/* Highly Compelling Highlights Box (3 Famous Facts) */}
                    {selectedMonument.famousFacts && selectedMonument.famousFacts.length > 0 && (
                      <div className="bg-amber-50/50 border border-amber-100/50 rounded-2xl p-5">
                        <h4 className="text-xs font-bold uppercase text-[#e07a1b] tracking-wider font-mono flex items-center gap-1.5">
                          <Sparkles className="w-4 h-4" />
                          <span>Famous Architectural Facts</span>
                        </h4>
                        <ul className="mt-3 space-y-2 text-xs text-stone-600 font-semibold">
                          {selectedMonument.famousFacts.map((fact, idx) => (
                            <li key={idx} className="flex gap-2.5 items-start">
                              <span className="w-5 h-5 bg-[#e07a1b]/10 text-[#e07a1b] flex items-center justify-center rounded-full text-[10px] font-bold shrink-0 mt-0.5">
                                {idx + 1}
                              </span>
                              <span className="leading-relaxed text-stone-700">{fact}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Integrated dynamic maps section for user request "give google map access also" */}
                    {selectedMonument.latitude && selectedMonument.longitude && (
                      <div className="border border-stone-200/80 rounded-2xl overflow-hidden shadow-sm flex flex-col">
                        <div className="bg-stone-50 border-b border-stone-200 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-orange-50 border border-orange-100 flex items-center justify-center text-orange-500 shrink-0">
                              <Navigation className="w-4 h-4" />
                            </div>
                            <div className="text-left">
                              <h5 className="text-xs font-bold text-stone-800">Dynamic Google Maps Grounding</h5>
                              <p className="text-[10px] text-stone-400 font-mono">GPS Coordinates: {selectedMonument.latitude}, {selectedMonument.longitude}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <a
                              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selectedMonument.name + ", " + selectedMonument.location)}`}
                              target="_blank"
                              rel="noreferrer"
                              className="bg-orange-50 hover:bg-orange-100 text-[#e07a1b] text-[10px] font-bold px-3 py-1.5 rounded-lg border border-orange-100 transition-colors flex items-center gap-1 cursor-pointer"
                            >
                              <span>View on Google Maps</span>
                            </a>
                            <a
                              href={`https://www.google.com/maps/dir/?api=1&destination=${selectedMonument.latitude},${selectedMonument.longitude}`}
                              target="_blank"
                              rel="noreferrer"
                              className="bg-[#e07a1b] hover:bg-[#c66512] text-white text-[10px] font-bold px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                            >
                              <span>Get Directions</span>
                            </a>
                          </div>
                        </div>

                        {/* Embedded Map Representation */}
                        <div className="h-56 w-full relative bg-stone-100">
                          <iframe
                            title={`${selectedMonument.name} navigation map iframe`}
                            width="100%"
                            height="105%"
                            frameBorder="0"
                            scrolling="no"
                            marginHeight={0}
                            marginWidth={0}
                            src={`https://maps.google.com/maps?q=${selectedMonument.latitude},${selectedMonument.longitude}&hl=en&z=12&output=embed`}
                          />
                        </div>
                      </div>
                    )}

                  </div>

                </div>
              </div>
            )}

          </div>
        )}

        {/* TAB 2: DETECTOR (COMPLEX VISION PORTAL WITH developer panels nested inside sub-navigation) */}
        {activeTab === "detector" && (
          <div className="flex flex-col gap-6 animate-fade-in">
            
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Left col: Image Upload */}
                <div className="lg:col-span-4 flex flex-col gap-6">
                  
                  {/* Photo Feed Upload zone */}
                  <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-sm flex flex-col gap-4 text-left">
                    <span className="block text-xs font-bold uppercase text-stone-400 tracking-wider">Image Feed Container</span>
                    
                    {/* Visual box upload dragging */}
                    <label className="flex flex-col items-center justify-center border-2 border-dashed border-stone-200 hover:border-[#e07a1b] rounded-2xl bg-stone-50/50 hover:bg-amber-50/10 p-6 md:p-8 cursor-pointer group transition-all h-[240px] relative">
                      {uploadedImage ? (
                        <div className="absolute inset-0 p-2 w-full h-full">
                          <img src={uploadedImage} alt="Loaded user photograph" className="w-full h-full object-cover rounded-xl" />
                          <div className="absolute inset-2 bg-black/45 rounded-xl opacity-0 hover:opacity-100 flex flex-col items-center justify-center text-white transition-opacity gap-1">
                            <Upload className="w-6 h-6 animate-pulse" />
                            <span className="text-[10px] font-bold">Replace Document Image</span>
                          </div>
                        </div>
                      ) : (
                        <>
                          <Upload className="w-9 h-9 text-stone-300 group-hover:text-[#e07a1b] transition-all mb-3" />
                          <span className="block font-bold text-stone-800 text-xs text-center">Drag-And-Drop raw photograph</span>
                          <span className="block text-[10px] text-stone-400 mt-1 font-semibold text-center">Supports JPG, PNG, WEBP</span>
                        </>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageUpload}
                        disabled={isProcessing}
                      />
                    </label>

                    {/* Pre-trained quick presets selector */}
                    <div className="flex flex-col gap-2 pt-2 border-t border-stone-100">
                      <span className="block text-[10px] font-bold uppercase text-stone-400 tracking-wider">Fast-track Demo Presets</span>
                      <div className="grid grid-cols-3 gap-2">
                        {PRESET_MONUMENTS.map((preset) => (
                          <button
                            key={preset.name}
                            onClick={() => !isProcessing && handlePresetSelect(preset)}
                            className="flex flex-col items-center bg-stone-50 border border-stone-200/60 hover:border-[#e07a1b] rounded-xl p-1 text-center cursor-pointer overflow-hidden transition-all group focus:outline-none focus:ring-1 focus:ring-[#e07a1b]"
                          >
                            <img src={preset.image} alt={preset.name} className="w-full aspect-square object-cover rounded-lg mb-1.5" />
                            <span className="text-[10px] font-bold text-stone-700 group-hover:text-[#e07a1b] truncate max-w-full">{preset.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="bg-white border border-stone-200 rounded-2xl p-4 shadow-sm mt-4">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <span className="text-xs font-bold uppercase tracking-wider text-stone-400">Local Dataset Summary</span>
                          <p className="text-[10px] text-stone-500 mt-1">Monument dataset loaded from <span className="font-mono">monument_project/dataset</span>.</p>
                        </div>
                        <span className="text-[10px] font-semibold text-stone-500">{datasetCategories.length} classes</span>
                      </div>

                      {datasetLoading ? (
                        <p className="text-[10px] text-stone-500">Loading local dataset metadata…</p>
                      ) : datasetCategories.length === 0 ? (
                        <p className="text-[10px] text-stone-500">No local dataset folder found or it contains no images.</p>
                      ) : (
                        <div className="space-y-3">
                          {datasetCategories.slice(0, 3).map((category) => (
                            <div key={category.id} className="rounded-2xl border border-stone-100 bg-stone-50 p-3">
                              <div className="flex items-center justify-between gap-3">
                                <span className="text-sm font-semibold text-stone-800">{category.name}</span>
                                <span className="text-[10px] font-black text-stone-500">{category.imageCount} images</span>
                              </div>
                              <p className="text-[10px] text-stone-500 mt-1 truncate">{category.description}</p>
                            </div>
                          ))}
                          {datasetCategories.length > 3 && (
                            <p className="text-[10px] text-stone-500 font-semibold">+{datasetCategories.length - 3} more classes available.</p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Preprocessing Step Sequence monitor */}
                  {uploadedImage && (
                    <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-sm flex flex-col gap-4 text-left">
                      <h3 className="text-xs font-bold tracking-wider text-stone-400 uppercase flex items-center gap-1.5">
                        <Layers className="w-4 h-4 text-[#e07a1b]" />
                        <span>OpenCV Matrix Preprocessing Pipeline</span>
                      </h3>

                      <div className="flex flex-col gap-3 pl-1">
                        {STATIC_PREPROCESSING_STEPS.map((step, index) => {
                          const stateClass = getProcessingStateClass(index);
                          return (
                            <div key={step.name} className={`flex items-start gap-3 transition-colors duration-250 ${stateClass}`}>
                              <span className="font-mono text-xs font-bold leading-none mt-0.5">[{index + 1}]</span>
                              <div className="flex-1">
                                <span className="block font-bold text-xs text-stone-850">{step.name}</span>
                                <span className="block text-[9px] text-stone-400 font-semibold mt-0.5">Matrix Layer Dimensions: {step.outputSize}</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {isProcessing && (
                        <div className="flex items-center gap-2 text-xs font-bold font-mono text-amber-600 bg-amber-50 p-2.5 rounded-xl border border-amber-100 mt-2">
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Streaming neural predictions parameters...</span>
                        </div>
                      )}
                    </div>
                  )}

                </div>

                {/* Right col: Outcomes profile maps */}
                <div className="lg:col-span-8 flex flex-col gap-6">
                  
                  {predictionResult ? (
                    <div className="bg-white border border-stone-200 rounded-2xl shadow-md overflow-hidden flex flex-col gap-6 text-left">
                      
                      {/* Accurate Header metrics indicators */}
                      <div className="bg-stone-900 border-b border-stone-800 text-white p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-start gap-3.5">
                          <div className="w-12 h-12 bg-amber-500/10 text-[#e07a1b] flex items-center justify-center rounded-xl border border-amber-500/20 font-black text-sm md:text-base shrink-0">
                            {(predictionResult.confidence * 100).toFixed(1)}%
                          </div>
                          <div>
                            <span className="block text-[10px] font-bold uppercase text-stone-405 tracking-wider font-mono">Prediction Success Threshold</span>
                            <h2 className="text-xl md:text-2xl font-black text-[#e4832c] tracking-tight">{predictionResult.name}</h2>
                          </div>
                        </div>
                        <div className="flex flex-col md:items-end text-left md:text-right font-mono text-xs">
                          <span className="text-stone-300 font-bold">Classifier: <strong className="text-amber-400 font-black">{classificationSource}</strong></span>
                          <span className="text-stone-400 mt-0.5">Backbone: <strong className="text-[#e07a1b] font-bold">EfficientNetB0</strong></span>
                        </div>
                      </div>

                      {/* Info grid */}
                      <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 border-b border-stone-100">
                        
                        {/* Summary and facts */}
                        <div className="flex flex-col gap-5">
                          <div>
                            <span className="block text-[10px] font-bold text-stone-400 uppercase tracking-widest flex items-center gap-1.5 mb-2 font-mono">
                              <Compass className="w-3.5 h-3.5 text-[#e07a1b]" />
                              <span>Historical Narrative</span>
                            </span>
                            <p className="text-xs md:text-sm text-stone-600 leading-relaxed font-semibold">
                              {predictionResult.history}
                            </p>
                          </div>

                          <div>
                            <span className="block text-[10px] font-bold text-stone-400 uppercase tracking-widest flex items-center gap-1.5 mb-2.5 font-mono">
                              <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
                              <span>Salient facts & features</span>
                            </span>
                            <div className="flex flex-col gap-2">
                              {predictionResult.famousFacts.map((fact, idx) => (
                                <div key={idx} className="bg-stone-50 border border-stone-200/50 rounded-xl p-3 text-xs text-stone-600 leading-relaxed font-semibold">
                                  {fact}
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Travel details map */}
                        <div className="flex flex-col gap-5">
                          
                          <div className="bg-stone-50 border border-stone-200/50 rounded-2xl p-5 flex flex-col gap-3.5">
                            <span className="block text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1 flex items-center gap-1.5 font-mono">
                              <Ticket className="w-3.5 h-3.5 text-[#e07a1b]" />
                              <span>Cultural visiting guide</span>
                            </span>

                            <div className="flex items-center gap-3">
                              <MapPin className="w-4 h-4 text-rose-500" />
                              <div className="text-left">
                                <span className="block text-[9px] font-bold text-stone-400 uppercase tracking-wide font-mono">Coordinates Location</span>
                                <span className="block text-xs font-bold text-stone-800">{predictionResult.location}</span>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3.5">
                              <div className="flex items-center gap-3">
                                <Clock className="w-4 h-4 text-[#e07a1b]" />
                                <div className="text-left">
                                  <span className="block text-[9px] font-bold text-stone-400 uppercase tracking-wide font-mono">Visiting Hours</span>
                                  <span className="block text-xs font-bold text-stone-800">{predictionResult.visitingHours}</span>
                                </div>
                              </div>
                              <div className="flex items-center gap-3">
                                <Ticket className="w-4 h-4 text-amber-600" />
                                <div className="text-left">
                                  <span className="block text-[9px] font-bold text-stone-400 uppercase tracking-wide font-mono font-mono">Entry pricing</span>
                                  <span className="block text-xs font-bold text-stone-800">{predictionResult.ticketPrice}</span>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-3">
                              <Calendar className="w-4 h-4 text-emerald-600" />
                              <div className="text-left">
                                <span className="block text-[9px] font-bold text-stone-400 uppercase tracking-wide font-mono">Optimal visiting season</span>
                                <span className="block text-xs font-bold text-stone-800">{predictionResult.bestTimeToVisit}</span>
                              </div>
                            </div>
                          </div>

                          {/* OSM coordination mapped */}
                          {predictionResult.latitude && predictionResult.longitude && (
                            <div className="flex flex-col gap-2.5">
                              <div className="rounded-2xl border border-stone-200 overflow-hidden shadow-inner h-[210px] relative">
                                <iframe
                                  title="Coordinate Maps Frame"
                                  width="100%"
                                  height="100%"
                                  frameBorder="0"
                                  scrolling="no"
                                  src={`https://maps.google.com/maps?q=${predictionResult.latitude},${predictionResult.longitude}&t=&z=13&ie=UTF8&iwloc=&output=embed`}
                                  className="w-full h-full pointer-events-auto"
                                />
                              </div>

                              <div className="grid grid-cols-2 gap-2 mt-1">
                                <a
                                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(predictionResult.name + ", " + predictionResult.location)}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="bg-stone-50 hover:bg-stone-100 border border-stone-200 text-stone-700 text-[11px] font-bold py-2 px-3 rounded-xl text-center transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                                >
                                  <MapPin className="w-3.5 h-3.5 text-orange-500" />
                                  <span>Open Google Maps</span>
                                </a>
                                <a
                                  href={`https://www.google.com/maps/dir/?api=1&destination=${predictionResult.latitude},${predictionResult.longitude}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="bg-[#e07a1b] hover:bg-[#c66512] text-white text-[11px] font-bold py-2 px-3 rounded-xl text-center transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                                >
                                  <Navigation className="w-3.5 h-3.5" />
                                  <span>Get Directions</span>
                                </a>
                              </div>
                            </div>
                          )}

                        </div>

                      </div>

                      {/* First Layer activation filter blocks heatmap */}
                      {conv2dActivations.length > 0 && (
                        <div className="p-6 bg-stone-50/50 border-t border-stone-100">
                          <span className="block text-[10px] font-bold text-stone-400 uppercase tracking-widest flex items-center gap-1.5 mb-3 font-mono">
                            <Layers className="w-3.5 h-3.5 text-[#e07a1b]" />
                            <span>First-Layer Conv2D Pixel Activations Matrix (High-pass Edge Extractor)</span>
                          </span>

                          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-3">
                            {conv2dActivations.slice(0, 8).map((filter, idx) => (
                              <div key={idx} className="bg-white border border-stone-200 p-2.5 rounded-xl flex flex-col items-center shadow-sm">
                                <span className="text-[9px] font-mono font-bold text-stone-450 mb-1.5">Kernel #{filter.filterId}</span>
                                
                                <div className="grid grid-cols-14 gap-0.5 bg-stone-50 p-0.5 rounded w-full aspect-square">
                                  {filter.grid.map((row: any[], rIdx: number) =>
                                    row.map((val: number, cIdx: number) => (
                                      <span
                                        key={`${rIdx}-${cIdx}`}
                                        className="aspect-square rounded-[1px]"
                                        style={{
                                          backgroundColor: `rgba(224, 122, 27, ${val})`
                                        }}
                                        title={`Strength: ${val}`}
                                      />
                                    ))
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                    </div>
                  ) : (
                    
                    /* Empty prompt layout */
                    <div className="flex flex-col items-center justify-center bg-white border border-stone-200 rounded-2xl p-8 md:p-12 shadow-sm text-center min-h-[460px] text-left">
                      {isProcessing ? (
                        <div className="flex flex-col items-center gap-4">
                          <div className="relative flex items-center justify-center">
                            <div className="w-14 h-14 border-4 border-stone-100 border-t-[#e07a1b] rounded-full animate-spin" />
                            <Camera className="w-5 h-5 text-[#e07a1b] absolute" />
                          </div>
                          <div>
                            <span className="block text-stone-900 font-bold text-base">OpenCV Pipeline Triggered</span>
                            <p className="text-xs text-stone-400 max-w-xs mt-1 font-semibold leading-relaxed">
                              Aligning color spaces, smoothing digital compression noise, and loading tensor dimensions...
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-4 max-w-md">
                          <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-100 text-[#e07a1b] flex items-center justify-center animate-pulse">
                            <Camera className="w-6 h-6" />
                          </div>
                          <div>
                            <span className="block text-stone-800 font-bold text-base md:text-lg">Classification Portal Active</span>
                            <p className="text-xs text-stone-500 font-medium leading-relaxed mt-1.5">
                              Drag and drop any custom historic landmark photograph or click a quick-test preset above. The systems bilateral smoothing matrices normalize gradients for fast prediction.
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                  )}

                  {/* AI Q&A COMPONENT FOR UPLOADED IMAGE */}
                  {uploadedImage && (
                    <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-sm text-left flex flex-col gap-5">
                      
                      {/* Section Title */}
                      <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                        <div className="flex items-center gap-2">
                          <div className="w-9 h-9 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center text-[#e07a1b]">
                            <MessageSquare className="w-4.5 h-4.5" />
                          </div>
                          <div>
                            <h3 className="text-sm font-bold text-stone-900">Landmark Q&A Companion</h3>
                            <p className="text-[10px] text-stone-400 font-semibold font-mono">POWERED BY GEMINI 3.5 FLASH</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse mt-0.5" />
                          <span className="text-[10px] font-mono font-bold text-stone-450 uppercase">Session Active</span>
                        </div>
                      </div>

                      {/* Chat History List */}
                      {qaHistory.length > 0 && (
                        <div className="flex flex-col gap-4 max-h-[280px] overflow-y-auto pr-1">
                          {qaHistory.map((qa) => (
                            <div key={qa.id} className="flex flex-col gap-2">
                              
                              {/* Question */}
                              <div className="flex justify-end pl-8">
                                <div className="bg-stone-100 border border-stone-200/50 rounded-2xl px-4 py-2 text-xs font-semibold text-stone-700">
                                  {qa.question}
                                </div>
                              </div>

                              {/* Answer */}
                              <div className="flex gap-2.5 items-start pr-8">
                                <div className="w-6 h-6 rounded-lg bg-[#e07a1b] text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                                  AI
                                </div>
                                <div className="bg-stone-50 border border-stone-200/50 rounded-2xl px-3 py-2 text-xs text-stone-800 font-medium leading-relaxed font-sans text-left flex-1">
                                  <div className="whitespace-pre-wrap">{qa.answer}</div>
                                  <span className="block text-[8px] text-stone-400 font-mono font-bold uppercase mt-2 select-none tracking-wider text-stone-500">
                                    Source: {qa.source}
                                  </span>
                                </div>
                              </div>

                            </div>
                          ))}
                        </div>
                      )}

                      {/* Chat Empty Prompt */}
                      {qaHistory.length === 0 && (
                        <div className="py-6 text-center border border-dashed border-stone-100 rounded-2xl bg-stone-50/20">
                          <Compass className="w-8 h-8 text-stone-300 mx-auto" />
                          <p className="text-stone-500 font-bold text-xs mt-2">Have a question about this landmark?</p>
                          <p className="text-stone-400 text-[10px] mt-0.5">Ask about its geometry, materials, historical background, or significance.</p>
                        </div>
                      )}

                      {/* Input submission bar */}
                      <form onSubmit={handleAskQuestionSubmit} className="flex items-center gap-2">
                        <input
                          type="text"
                          placeholder={
                            isAskingQuestion 
                              ? "Analyzing image pixel meshes with Gemini..." 
                              : predictionResult 
                                ? `Ask any question about the ${predictionResult.name}...` 
                                : "Ask any question related to the uploaded image..."
                          }
                          value={questionText}
                          onChange={(e) => setQuestionText(e.target.value)}
                          disabled={isAskingQuestion}
                          className="flex-1 bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-xs sm:text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors disabled:opacity-50 text-left font-medium text-stone-850"
                        />
                        <button
                          type="submit"
                          disabled={isAskingQuestion || !questionText.trim()}
                          className="w-11 h-11 bg-[#e07a1b] hover:bg-[#c66512] disabled:bg-stone-200 text-white disabled:text-stone-400 rounded-xl flex items-center justify-center transition-colors shadow-sm cursor-pointer disabled:cursor-not-allowed shrink-0"
                        >
                          {isAskingQuestion ? (
                            <RefreshCw className="w-4 h-4 animate-spin" />
                          ) : (
                            <Send className="w-4 h-4" />
                          )}
                        </button>
                      </form>

                    </div>
                  )}

                  {/* System Classification logs list */}
                  <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-sm text-left">
                    <div className="flex items-center gap-2 border-b border-stone-100 pb-3 mb-4">
                      <History className="w-4.5 h-4.5 text-stone-400" />
                      <h3 className="font-bold text-stone-850 text-xs md:text-sm uppercase tracking-wider font-mono">Historical Classification Logs</h3>
                    </div>

                    <div className="flex flex-col gap-3 max-h-[220px] overflow-y-auto scrollbar-thin">
                      {predictionHistory.map((hist) => (
                        <div key={hist.id} className="flex items-center justify-between bg-stone-50 rounded-xl p-3 border border-stone-100/50">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-stone-900 overflow-hidden border border-stone-150 flex-shrink-0">
                              <img src={hist.imageBytes} alt={hist.detectedName} className="w-full h-full object-cover" />
                            </div>
                            <div className="text-left">
                              <span className="block font-bold text-stone-800 text-xs">{hist.detectedName}</span>
                              <div className="flex items-center gap-1.5 text-[9px] text-stone-400 font-bold mt-0.5">
                                <span>{hist.location}</span>
                                <span>•</span>
                                <span className="font-mono">{hist.classificationTimeMs}ms latency</span>
                              </div>
                            </div>
                          </div>
                          <div className="text-right flex flex-col items-end gap-1 font-mono text-[9px]">
                            <span className="bg-amber-50 text-[#e07a1b] border border-amber-200 px-2 py-0.5 rounded font-black font-mono">
                              {Number(hist.confidence).toFixed(1)}% Match
                            </span>
                            <span className="text-stone-400">{new Date(hist.timestamp).toLocaleTimeString()}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>

              </div>

          </div>
        )}        {/* TAB 3: ABOUT (DESCRIBING THE MONUMENT FROM ITS PHOTOGRAPH) */}
        {activeTab === "about" && (
          <div className="flex flex-col gap-8 text-left animate-fade-in max-w-4xl mx-auto">
            
            {/* Context Narrative */}
            <section className="bg-white border border-stone-200 rounded-3xl p-6 md:p-8 shadow-sm flex flex-col gap-5">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center text-[#e07a1b]">
                  <Landmark className="w-4.5 h-4.5" />
                </div>
                <span className="text-xs font-bold uppercase tracking-widest text-[#e07a1b] font-mono">EDUCATIONAL ESSAY</span>
              </div>
              
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-stone-900 leading-tight">
                Describing the Monument from its Photograph
              </h2>
              
              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed font-semibold">
                Historical monuments are physical testaments to human heritage, arts, and architectural engineering. Describing a monument solely from its photograph is a complex visual task. It combines structural analysis, masonry archaeology, aesthetic styles, and computer vision techniques.
              </p>
              
              <p className="text-xs sm:text-sm text-stone-500 leading-relaxed font-semibold">
                When an observer or an artificial intelligence model analyzes a photographic image of a global landmark, it decomposes the visual grid into key attributes. These attributes help synthesize a comprehensive, descriptive, and educational record of the structural masterpiece.
              </p>
            </section>

            {/* Core Identification Methodology */}
            <section className="bg-white border border-stone-200 rounded-3xl p-6 md:p-8 shadow-sm flex flex-col gap-6">
              <div className="flex flex-col gap-1">
                <span className="text-xs font-bold uppercase tracking-widest text-[#e07a1b] font-mono">IDENTIFICATION METRICS</span>
                <h3 className="text-xl font-bold text-stone-900">Key Dimensions of Photographic Analysis</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Dimension 1 */}
                <div className="bg-stone-50/50 border border-stone-150 rounded-2xl p-5 hover:border-amber-300 transition-colors">
                  <span className="block text-stone-400 text-xs font-black font-mono uppercase mb-2">01. Visual Clues & Layout Geometry</span>
                  <p className="text-xs text-stone-600 leading-relaxed font-semibold">
                    The spatial arrangement and symmetry within a photograph reveal historical clues. Pointed, recessed or multi-foiled arches point to Mughal or Gothic influence, while monumental semi-circular brick structures indicate ancient Classical Roman craft.
                  </p>
                </div>

                {/* Dimension 2 */}
                <div className="bg-stone-50/50 border border-stone-150 rounded-2xl p-5 hover:border-amber-300 transition-colors">
                  <span className="block text-stone-400 text-xs font-black font-mono uppercase mb-2">02. Materiality & Masonry Textures</span>
                  <p className="text-xs text-stone-600 leading-relaxed font-semibold">
                    The pixel colors and specularity highlights identify raw building materials. Differentiating the soft radiance of ivory-white marble in Agra, fluted red sandstone in Delhi, or the weathered travertine limestone of Rome is key to photographic categorization.
                  </p>
                </div>

                {/* Dimension 3 */}
                <div className="bg-stone-50/50 border border-stone-150 rounded-2xl p-5 hover:border-amber-300 transition-colors">
                  <span className="block text-stone-400 text-xs font-black font-mono uppercase mb-2">03. Cultural Ornamentation & Inscriptions</span>
                  <p className="text-xs text-stone-600 leading-relaxed font-semibold">
                    Close-up views of wall facades capture beautiful calligraphic relief work, geometric panels, or classical order columns (Doric, Ionic, Corinthian capitals). These decorative systems act as distinct stylistic signatures.
                  </p>
                </div>

                {/* Dimension 4 */}
                <div className="bg-stone-50/50 border border-stone-150 rounded-2xl p-5 hover:border-amber-300 transition-colors">
                  <span className="block text-stone-400 text-xs font-black font-mono uppercase mb-2">04. Geographic Contextualization</span>
                  <p className="text-xs text-stone-600 leading-relaxed font-semibold">
                    By cross-referencing visual structures against digital global archives, the system can pinpoint geographic coordinates. This links photographs directly to local maps and visiting guides.
                  </p>
                </div>

              </div>
            </section>

            {/* Neural Synthesis Block */}
            <section className="bg-gradient-to-br from-[#1c140e] to-[#100a06] border border-stone-900 rounded-3xl p-6 md:p-8 text-white relative overflow-hidden">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-amber-500/10 rounded-full blur-[90px] pointer-events-none" />
              
              <div className="relative z-10 flex flex-col gap-4">
                <span className="text-xs font-bold uppercase tracking-widest text-[#ea580c] font-mono">AUTOMATED VISION NETWORKS</span>
                <h3 className="text-xl md:text-2xl font-black text-amber-100 tracking-tight">The Role of Artificial Intelligence</h3>
                <p className="text-xs text-stone-300 leading-relaxed font-medium">
                  Modern deep convolutional networks excel at automated architectural description. When an image is uploaded to the scanner, the backend vision service checks primary edges, filters high-frequency camera noise, and projects visual features into high-dimensional space.
                </p>
                <p className="text-xs text-stone-300 leading-relaxed font-medium">
                  By matching these traits, the system produces a structured output. This returns the exact name of the monument, its construction period, materials, price coordinates, optimal visiting hours, and related history instantly.
                </p>
              </div>
            </section>

          </div>
        )}

      </main>

      {/* --- REUSABLE AUTHORIZATION SIGN IN MODAL POPUP --- */}
      {showLoginModal && (
        <div className="fixed inset-0 z-50 bg-stone-950/45 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white border border-stone-200 shadow-2xl rounded-2xl overflow-hidden animate-fade-in relative text-left">
            
            <button
              onClick={() => setShowLoginModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-stone-400 hover:text-stone-800 hover:bg-stone-100 transition-all cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Header */}
            <div className="bg-stone-900 text-white p-6 text-center flex flex-col items-center gap-3">
              <div className="w-11 h-11 bg-[#e07a1b] flex items-center justify-center rounded-xl text-white shadow-md">
                <Landmark className="w-5.5 h-5.5" />
              </div>
              <div className="flex flex-col gap-0.5">
                <h3 className="text-base font-bold font-sans">Supervisor Authentication</h3>
                <p className="text-[10px] text-stone-400 font-medium max-w-xs">
                  Inspect neural sandbox nodes & annotate local Kaggle folders as a system supervisor
                </p>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleAuthSubmit} className="p-6 flex flex-col gap-4">
              {authError && (
                <div className="bg-rose-50 border border-rose-100 rounded-xl p-3 text-xs text-rose-600 font-bold flex items-center gap-2 font-mono">
                  <ShieldAlert className="w-4 h-4 shrink-0" />
                  <span>{authError}</span>
                </div>
              )}

              <div>
                <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1 font-mono">Supervisor User ID</label>
                <input
                  type="text"
                  required
                  value={loginUsername}
                  onChange={(e) => setLoginUsername(e.target.value)}
                  placeholder="e.g. admin"
                  className="w-full border border-stone-200 rounded-xl px-3.5 py-2.5 text-xs font-bold outline-none focus:border-[#e07a1b] focus:bg-stone-50/20 transition-all font-mono text-stone-800"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1 font-mono">Supervisor Access Key</label>
                <input
                  type="password"
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="e.g. password123"
                  className="w-full border border-stone-200 rounded-xl px-3.5 py-2.5 text-xs font-bold outline-none focus:border-[#e07a1b] focus:bg-stone-50/20 transition-all font-mono text-stone-800"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-[#e07a1b] hover:bg-[#c66512] text-white py-3 rounded-xl text-xs sm:text-sm font-bold shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
              >
                <span>ConnectPrivileges Securely</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="text-center text-[10px] text-stone-400 font-mono mt-1">
                <span>Default Privileged: <strong className="text-stone-600">admin / password123</strong></span>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* STYLISH MINIMALIST CULTURAL FOOTER */}
      <footer className="bg-white border-t border-stone-200 py-8 px-4 md:px-8 mt-12">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-stone-100 rounded-lg flex items-center justify-center text-stone-600 border border-stone-150">
              <Landmark className="w-3.5 h-3.5" />
            </div>
            <span className="text-xs font-bold text-stone-500 font-display">
              Monument Identifier • Digital Preservation Catalog
            </span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[11px] font-bold font-mono text-stone-400">
            <button onClick={() => setActiveTab("home")} className="hover:text-stone-700 cursor-pointer">Home</button>
            <span>•</span>
            <button onClick={() => setActiveTab("detector")} className="hover:text-stone-700 cursor-pointer">Vision Scanner</button>
            <span>•</span>
            <button onClick={() => setActiveTab("about")} className="hover:text-stone-700 cursor-pointer">Academic Philosophy</button>
          </div>

          <p className="text-[10px] text-stone-400 font-medium font-mono">
            Platform built behind CJS Node proxy routing. Port: 3000
          </p>
        </div>
      </footer>

    </div>
  );
}
