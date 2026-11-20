import { useState, useEffect } from "react";
import "./App.css";
import { jsPDF } from "jspdf";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid
} from "recharts";


 function App() {
const [statistics, setStatistics] = useState({
  totalScans: 0,
  messageScans : 0,
  urlScans : 0,
  highRisk: 0,
  mediumRisk: 0,
  lowRisk: 0,
  invalidScans: 0
});
const [lastUpdated, setLastUpdated] = useState(null);
const [serverStatus, setServerStatus] = useState("Checking...");
  // Scan History Search
const [historySearch, setHistorySearch] = useState("");
const [riskFilter, setRiskFilter] = useState("All");
const [historySort, setHistorySort] =useState("newest");
const [currentPage, setCurrentPage] = useState(1);
const scansPerPage = 5;
const [scanTypeFilter, setScanTypeFilter] = useState("All");
const [recentActivityFilter, setRecentActivityFilter] = useState("All");
  const [message, setMessage] = useState("");
const [result, setResult] = useState(null);
const [loading, setLoading] = useState(false);
const [error, setError] = useState("");
const [scans, setScans] = useState([]);
const [historyLoading, setHistoryLoading] = useState(false);

// URL Scanner States
const [url, setUrl] = useState("");
const [urlResult, setUrlResult] = useState(null);
const [urlLoading, setUrlLoading] = useState(false);
const [urlError, setUrlError] = useState("");
const [selectedScan, setSelectedScan] = useState(null);
const [assistantExplanation, setAssistantExplanation] = useState("");
// Quiz Tracking States
const [currentQuestion, setCurrentQuestion] = useState(0);
const [quizAnswer, setQuizAnswer] = useState("");
const [quizSubmitted, setQuizSubmitted] = useState(false);
const [quizScore, setQuizScore] = useState(0);
const [quizFinished, setQuizFinished] = useState(false);

const quizQuestions = [
  {
    question: "1. You receive a message asking for your bank OTP. What should you do?",
    options: [
      "Share the OTP",
      "Ignore the warning",
      "Never share the OTP",
      "Forward it to a friend"
    ],
    correctAnswer: "Never share the OTP",
    explanation: "An OTP is a private verification code. Sharing it can allow someone else to access your account."
  },
  {
    question: "2. Which password is generally the strongest?",
    options: [
      "123456",
      "password",
      "Garima123",
      "T9@kL#82pQ!"
    ],
    correctAnswer: "T9@kL#82pQ!",
    explanation: "A strong password should be unique and difficult to guess. Avoid using personal information."
  },
  {
    question: "3. What should you do before clicking an unfamiliar link?",
    options: [
      "Click immediately",
      "Verify its destination",
      "Share it publicly",
      "Enter your password"
    ],
    correctAnswer: "Verify its destination",
    explanation: "Checking an unfamiliar link before using it helps you avoid phishing and misleading websites."
  },
  {
    question: "4. What does HTTPS indicate?",
    options: [
      "A secured connection",
      "A guaranteed safe website",
      "A free website",
      "A government website"
    ],
    correctAnswer: "A secured connection",
    explanation: "HTTPS encrypts the connection between your browser and a website, but it does not guarantee that the website itself is trustworthy."
  },
  {
    question: "5. What should you do if you receive an unexpected prize message?",
    options: [
      "Pay the processing fee",
      "Share your bank details",
      "Verify the offer independently",
      "Share the message with everyone"
    ],
    correctAnswer: "Verify the offer independently",
    explanation: "Unexpected prize messages may be scams. Verify offers through the organization's official channels."
  }
];

  const handleScan = async (e) => {
  e.preventDefault();

  if (!message.trim()) {
    alert("Please enter a message to scan!");
    return;
  }

  setLoading(true);
  setResult(null);
  setError("");

  try {
    const response = await fetch("http://localhost:5000/api/scan", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ message })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Scan failed.");
    }

    setResult(data.scan);
    fetchHistory();
fetchStatistics();

  } catch (err) {
    setError(err.message || "Unable to connect to the server.");
  } finally {
    setLoading(false);
  }
  };


// Fetch Scan History
  const fetchHistory = async () => {
    setHistoryLoading(true);

    try {
      const response = await fetch("http://localhost:5000/api/scans");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to load history.");
      }

      setScans(data.scans);
      setLastUpdated(new Date());

    } catch (err) {
      console.error("History Error:", err);
    } finally {
      setHistoryLoading(false);
    }
  };
// Fetch Dashboard Statistics
const fetchStatistics = async () => {
  try {
    const response = await fetch("http://localhost:5000/api/statistics");
    const data = await response.json();

    if (data.success) {
      setStatistics(data.statistics);
      setLastUpdated(new Date());
    }
  } catch (error) {
    console.error("Statistics Error:", error);
  }
};
// Check Backend Server Status
const checkServerStatus = async () => {
  try {
    const response = await fetch("http://localhost:5000/api/health");

    if (response.ok) {
      setServerStatus("Online");
    } else {
      setServerStatus("Offline");
    }
  } catch (error) {
    setServerStatus("Offline");
  }
};

  // Download Scan Report as PDF
const downloadReport = () => {
  if (!selectedScan) return;

  const doc = new jsPDF();

  doc.setFontSize(20);
  doc.text("CyberShield Scan Report", 20, 20);

  doc.setFontSize(12);

  doc.text(
    `Scan Type: ${selectedScan.url ? "URL Scan" : "Message Scan"}`,
    20, 40
  );

  const content = selectedScan.url || selectedScan.message;

  doc.text("Scanned Content:", 20, 50);

  const contentLines = doc.splitTextToSize(content, 170);
  doc.text(contentLines, 20, 60);

  let y = 60 + contentLines.length * 7;

  doc.text(`Risk Level: ${selectedScan.riskLevel}`, 20, y);
  y += 10;

  doc.text(`Risk Score: ${selectedScan.riskScore}/100`, 20, y);
  y += 15;

  doc.text("Detected Warnings:", 20, y);
  y += 10;

  const warnings = selectedScan.warnings.length
    ? selectedScan.warnings
    : ["No suspicious indicators detected."];

  warnings.forEach((warning) => {
    const lines = doc.splitTextToSize(`- ${warning}`, 170);

    if (y + lines.length * 7 > 270) {
      doc.addPage();
      y = 20;
    }

    doc.text(lines, 20, y);
    y += lines.length * 7;
  });

  y += 10;

  const recommendation = doc.splitTextToSize(
    `Recommendation: ${selectedScan.recommendation}`,
    170
  );

  if (y + recommendation.length * 7 > 270) {
    doc.addPage();
    y = 20;
  }

  doc.text(recommendation, 20, y);

  doc.save("CyberShield-Scan-Report.pdf");
};

// Export Scan History as CSV
const exportScanHistory = () => {
  if (scans.length === 0) {
    alert("No scan history available to export.");
    return;
  }

  const headers = [
    "Date",
    "Scan Type",
    "Scanned Content",
    "Risk Level",
    "Risk Score",
    "Warnings",
    "Recommendation"
  ];

  const rows = scans.map((scan) => [
    new Date(scan.createdAt).toLocaleString(),
    scan.url ? "URL Scan" : "Message Scan",
    scan.url || scan.message,
    scan.riskLevel,
    scan.riskScore,
    scan.warnings.join("; "),
    scan.recommendation
  ]);

 // Prevent spreadsheet formula injection
const escapeCSV = (value) => {
  let text = String(value ?? "");

  if (/^[\s]*[=+\-@]/.test(text)) {
    text = "'" + text;
  }

  return `"${text.replace(/"/g, '""')}"`;
};

// Convert scan history into CSV
const csvContent = [headers, ...rows]
  .map((row) => row.map(escapeCSV).join(","))
  .join("\n");

  const blob = new Blob(["\uFEFF" + csvContent], {
    type: "text/csv;charset=utf-8;"
  });

  const downloadUrl = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = downloadUrl;
  link.download = "CyberShield_Scan_History.csv";
  link.click();

  URL.revokeObjectURL(downloadUrl);
};

// Security Awareness Assistant
const generateExplanation = () => {
  if (!selectedScan) return;

  const risk = selectedScan.riskLevel;
  const warnings = selectedScan.warnings;

  let explanation = "";

  if (risk === "High") {
    explanation =
      "This scan has detected several suspicious indicators. " +
      "Avoid clicking links or sharing personal information. " +
      "Verify the sender or website through official channels.";
  } else if (risk === "Medium") {
    explanation =
      "This scan has detected some warning signs. " +
      "Be careful and independently verify the request " +
      "before taking any action.";
  } else if (risk === "Invalid") {
    explanation =
      "The entered URL could not be validated. " +
      "Check the URL format before proceeding.";
  } else {
    explanation =
      "No major suspicious patterns were detected by these checks. " +
      "However, this does not guarantee that the content is safe. " +
      "Always verify unfamiliar messages and websites.";
  }

  const warningText = warnings.length
    ? warnings.join(", ")
    : "No specific warning indicators detected.";

  setAssistantExplanation(
    `Risk Level: ${risk}\n\n` +
    `Detected Indicators: ${warningText}\n\n` +
    `Explanation: ${explanation}`
  );
};
// Threat Intelligence Analysis
const getThreatIntelligence = () => {
  if (!selectedScan) return [];

  const threatInfo = {
    "Urgent or threatening language detected": {
      title: "Urgency-Based Manipulation",
      details: "The content uses urgency or threats to pressure the recipient.",
      action: "Pause and independently verify the request."
    },

    "Sensitive information requested": {
      title: "Sensitive Information Request",
      details: "The content may be requesting passwords, OTPs or financial details.",
      action: "Never share these details through messages or unverified websites."
    },

    "Unexpected prize or reward language detected": {
      title: "Unexpected Reward Indicator",
      details: "Unexpected prizes or rewards can be used to attract victims.",
      action: "Verify the offer through the organization's official website."
    },

    "Payment pressure detected": {
      title: "Payment Pressure",
      details: "The content creates pressure to make a payment.",
      action: "Verify the payment request independently before proceeding."
    },

    "Message contains a web link": {
      title: "Link Detected",
      details: "The message contains a web link that may require verification.",
      action: "Check the destination carefully. Do not open unfamiliar links."
    },

    "Website does not use HTTPS": {
      title: "HTTPS Not Detected",
      details: "The website uses a connection that does not provide HTTPS encryption.",
      action: "Avoid entering sensitive information on this website."
    },

    "URL uses an IP address instead of a domain name": {
      title: "IP-Based Website Address",
      details: "The website address uses an IP address instead of a conventional domain name.",
      action: "Verify the website through its official source."
    },

    "Potentially misleading words found in domain": {
      title: "Suspicious Domain Wording",
      details: "The domain contains words sometimes used in misleading website addresses.",
      action: "Check the exact domain name before trusting the website."
    },

    "Unusually long URL": {
      title: "Unusually Long URL",
      details: "The URL is longer than the configured detection threshold.",
      action: "Verify the destination before using the link."
    },

    "URL contains potentially misleading user information": {
      title: "Potentially Misleading URL Structure",
      details: "The URL contains user-information syntax that can make its destination confusing.",
      action: "Avoid using the link until its destination is independently verified."
    }
  };

  return selectedScan.warnings.map((warning) => ({
    warning,
    ...(threatInfo[warning] || {
      title: "Unclassified Indicator",
      details: "This indicator needs further review.",
      action: "Verify the content through a trusted source."
    })
  }));
};

 useEffect(() => {
  fetchHistory();
  fetchStatistics();
  checkServerStatus();

  const statusInterval = setInterval(() => {
    checkServerStatus();
  }, 10000);

  return () => clearInterval(statusInterval);
}, []);
  useEffect(() => {
  setCurrentPage(1);
}, [historySearch, riskFilter, scanTypeFilter, historySort]);
  // URL Scan Function
const handleURLScan = async (e) => {
  e.preventDefault();

  if (!url.trim()) {
    alert("Please enter a URL to scan!");
    return;
  }
// Validate URL format
try {
  const parsedURL = new URL(url.trim());

  if (
    parsedURL.protocol !== "http:" &&
    parsedURL.protocol !== "https:"
  ) {
    throw new Error("Invalid protocol");
  }
} catch {
  alert("Please enter a valid URL starting with http:// or https://");
  return;
}
  setUrlLoading(true);
  setUrlResult(null);
  setUrlError("");

  try {
    const response = await fetch("http://localhost:5000/api/scan-url", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ url })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "URL scan failed.");
    }

    setUrlResult(data.result);
    fetchHistory();
    fetchStatistics();

  } catch (err) {
    setUrlError(err.message || "Unable to connect to the server.");
  } finally {
    setUrlLoading(false);
  }
};

// Dashboard Statistics
// Filter Scan History
const filteredScans = scans.filter((scan) => {
  const searchText = historySearch.toLowerCase();

  const matchesSearch =
    (scan.message || "").toLowerCase().includes(searchText) ||
    (scan.url || "").toLowerCase().includes(searchText) ||
    (scan.riskLevel || "").toLowerCase().includes(searchText);

  const matchesRisk =
    riskFilter === "All" || scan.riskLevel === riskFilter;
    const matchesType =
  scanTypeFilter === "All" ||
  (scanTypeFilter === "Message" && !scan.url) ||
  (scanTypeFilter === "URL" && !!scan.url);
  return matchesSearch && matchesRisk && matchesType;
});
// Sort Scan History
const sortedScans = [...filteredScans].sort((a, b) => {
  const dateA = new Date(a.createdAt);
  const dateB = new Date(b.createdAt);

  return historySort === "newest"
    ? dateB - dateA
    : dateA - dateB;
});
// Pagination Logic
const indexOfLastScan = currentPage * scansPerPage;
const indexOfFirstScan = indexOfLastScan - scansPerPage;

const currentScans = sortedScans.slice(
  indexOfFirstScan,
  indexOfLastScan
);

const totalPages = Math.ceil(
  sortedScans.length / scansPerPage
);
const totalScans = scans.length;

const messageScans = scans.filter((scan) => !scan.url).length;
const urlScans = scans.filter((scan) => scan.url).length;

const highRisk = scans.filter((scan) => scan.riskLevel === "High").length;
const mediumRisk = scans.filter((scan) => scan.riskLevel === "Medium").length;
const lowRisk = scans.filter((scan) => scan.riskLevel === "Low").length;
const invalidScans = scans.filter((scan) => scan.riskLevel === "Invalid").length;
// Chart Data
const scanComparisonData = [
  { name: "Messages", scans: messageScans },
  { name: "URLs", scans: urlScans }
];

const riskDistributionData = [
  { name: "High Risk", value: highRisk },
  { name: "Medium Risk", value: mediumRisk },
  { name: "Low Risk", value: lowRisk },
  { name: "Invalid", value: invalidScans }
];

const chartColors = ["#ef4444", "#f59e0b", "#22c55e", "#64748b"];
const recentActivityScans = scans
  .filter((scan) => {
    if (recentActivityFilter === "Message") {
      return !scan.url;
    }

    if (recentActivityFilter === "URL") {
      return Boolean(scan.url);
    }

    return true;
  })
  .slice(0, 5);
  return (
    <div className="app">

      {/* Navbar */}
      <nav className="navbar">
        <h2>🛡️ CyberShield</h2>

        <div className="nav-links">
  <a href="#home">Home</a>
  <a href="#dashboard">Dashboard</a>
  <a href="#features">Features</a>
  <a href="#scanner">Scanner</a>
  <a href="#url-scanner">URL Scanner</a>
  <a href="#recent-activity">Recent Activity</a>
  <a href="#history">History</a>
  <a href="#learning-center">Learning Center</a>
  <a href="#cyber-quiz">Cyber Quiz</a>
  <a href="#about">About</a>
</div>
        <div className="server-status">
  <span className={`status-dot ${serverStatus === "Online" ? "online" : "offline"}`}></span>
  Server: {serverStatus}
</div>
        <button className="nav-btn">Stay Safe</button>
      </nav>

      {/* Hero Section */}
      <section className="hero" id="home">
        <div className="hero-content">
          <p className="tag">YOUR DIGITAL SAFETY PARTNER</p>

          <h1>
            Think Before You Click.
            <span> Stay Cyber Safe.</span>
          </h1>

          <p>
            Protect yourself from online scams, phishing
            messages and suspicious links with CyberShield,
            your digital safety assistant.
          </p>

          <a href="#scanner" className="main-btn">
            Scan a Message →
          </a>
          <a href="#url-scanner" className="main-btn secondary-btn">
  Scan a URL →
</a>
        </div>

        <div className="hero-icon">
          🛡️
          <h3>Your Safety, Our Priority</h3>
          <p>Secure • Smart • Simple</p>
        </div>
      </section>

      {/* Scanner Section */}
      <section className="scanner" id="scanner">
        <p className="tag">SMART PROTECTION</p>
        <h2>AI Scam Detector</h2>

        <p>
          Paste a suspicious message below to check it.
        </p>

        <form onSubmit={handleScan}>
          <textarea
            placeholder="Paste your suspicious message here..."
            value={message}
            onChange={(e) => {
              setMessage(e.target.value);
              setResult(false);
            }}
          />

          <button
  type="submit"
  className="main-btn"
  disabled={loading}
>
  {loading ? "Analyzing..." : "🔍 Scan Message"}
</button>
        </form>

       {error && (
  <div className="result">
    <h3>Scan Error</h3>
    <p>{error}</p>
  </div>
)}

{result && (
  <div className="result">
    <h3>Scan Completed!</h3>

    <h2>{result.riskLevel} Risk</h2>

    <p>Risk Score: {result.riskScore}/100</p>

    <h4>Warnings:</h4>

    {result.warnings.length > 0 ? (
      <ul>
        {result.warnings.map((warning, index) => (
          <li key={index}>{warning}</li>
        ))}
      </ul>
    ) : (
      <p>No suspicious indicators detected.</p>
    )}

    <h4>Recommendation:</h4>
    <p>{result.recommendation}</p>
  </div>
)}
      </section>
      {/* URL Scanner Section */}
<section className="scanner" id="url-scanner">
  <p className="tag">LINK SAFETY CHECK</p>
  <h2>Advanced URL Scanner</h2>
  <p>Enter a website URL to check for suspicious patterns.</p>

  <form onSubmit={handleURLScan}>
    <input
      type="text"
      placeholder="https://example.com"
      value={url}
      onChange={(e) => {
        setUrl(e.target.value);
        setUrlResult(null);
        setUrlError("");
      }}
       maxLength={2048} required
    />

    <button type="submit" className="main-btn" disabled={urlLoading}>
      {urlLoading ? "Analyzing URL..." : "🔗 Scan URL"}
    </button>
  </form>

  {urlError && (
    <div className="result">
      <h3>URL Scan Error</h3>
      <p>{urlError}</p>
    </div>
  )}

  {urlResult && (
    <div className="result">
      <h3>{urlResult.valid ? "URL Analysis Complete" : "Invalid URL"}</h3>

      {urlResult.valid && (
        <>
          <h2>{urlResult.riskLevel} Risk</h2>
          <p>Risk Score: {urlResult.riskScore}/100</p>
          <div className="risk-meter">
  <div
    className="risk-meter-fill"
    style={{
      width: `${urlResult.riskScore}%`,
      background:
        urlResult.riskLevel === "High"
          ? "#ef4444"
          : urlResult.riskLevel === "Medium"
          ? "#f59e0b"
          : "#22c55e"
    }}
  ></div>
</div>

<p>
  {urlResult.riskScore >= 60
    ? "High risk detected. Avoid interacting with this URL."
    : urlResult.riskScore >= 30
    ? "Some suspicious indicators detected. Verify carefully."
    : "Few suspicious indicators detected by these checks."}
</p>
        </>
      )}

      <h4>Warnings:</h4>
      {urlResult.warnings.length > 0 ? (
        <ul>
          {urlResult.warnings.map((warning, index) => (
            <li key={index}>{warning}</li>
          ))}
        </ul>
      ) : (
        <p>No suspicious patterns detected by these checks.</p>
      )}

      <h4>Recommendation:</h4>
      <p>{urlResult.recommendation}</p>

      <p>
        <strong>Note:</strong> These are basic pattern checks, not a guarantee
        that a website is safe.
      </p>
    </div>
  )}
</section>

 {/* Dashboard Analytics */}
<section className="features" id="dashboard">

  <p className="tag">SECURITY OVERVIEW</p>
  <h2>CyberShield Dashboard</h2>
  <button
  className="main-btn"
  onClick={() => {
    fetchStatistics();
    fetchHistory();
  }}
>
  🔄 Refresh Dashboard
</button>
<p className="last-updated">
  Last Updated:{" "}
  {lastUpdated
    ? lastUpdated.toLocaleString()
    : "Not updated yet"}
</p>

  <div className="feature-grid">

    <div className="feature-card">
      <h3>📊 Total Scans</h3>
      <h2>{statistics.totalScans}</h2>
      <p>Messages analyzed</p>
    </div>
    <div className="feature-card">
  <h3>💬 Message Scans</h3>
  <h2>{statistics.messageScans}</h2>
  <p>Total messages analyzed</p>
</div>

<div className="feature-card">
  <h3>🔗 URL Scans</h3>
  <h2>{statistics.urlScans}</h2>
  <p>Total URLs analyzed</p>
</div>

    <div className="feature-card">
      <h3>🔴 High Risk</h3>
      <h2>{statistics.highRisk}</h2>
      <p>High-risk messages</p>
    </div>

    <div className="feature-card">
      <h3>🟠 Medium Risk</h3>
      <h2>{statistics.mediumRisk}</h2>
      <p>Medium-risk messages</p>
    </div>

    <div className="feature-card">
      <h3>🟢 Low Risk</h3>
      <h2>{statistics.lowRisk}</h2>
      <p>Low-risk messages</p>
    </div>

    <div className="feature-card">
  <h3>⚠️ Invalid URLs</h3>
  <h2>{statistics.invalidScans}</h2>
  <p>Invalid URL entries</p>
</div>

  </div>
<div className="feature-card">
  <h3>📈 Risk Distribution</h3>

  <p>High Risk: {highRisk}</p>
  <div className="risk-bar high-bar"
    style={{
  width: `${statistics.totalScans ? (statistics.highRisk / statistics.totalScans) * 100 : 0}%`
}}>
  </div>

  <p>Medium Risk: {mediumRisk}</p>
  <div className="risk-bar medium-bar"
    style={{ width: `${statistics.totalScans ? (statistics.mediumRisk / statistics.totalScans) * 100 : 0}%` }}>
  </div>

  <p>Low Risk: {lowRisk}</p>
  <div className="risk-bar low-bar"
    style={{ width: `${statistics.totalScans ? (statistics.lowRisk / statistics.totalScans) * 100 : 0}%` }}>
  </div>
</div>
{/* Scan Comparison Chart */}
<div className="feature-card">
  <h3>📊 Message vs URL Scans</h3>

  <ResponsiveContainer width="100%" height={300}>
    <BarChart data={scanComparisonData}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="name" />
      <YAxis allowDecimals={false} />
      <Tooltip />
      <Legend />
      <Bar dataKey="scans" fill="#6366f1" />
    </BarChart>
  </ResponsiveContainer>
</div>

{/* Risk Distribution Pie Chart */}
<div className="feature-card">
  <h3>🥧 Risk Distribution</h3>

  <ResponsiveContainer width="100%" height={300}>
    <PieChart>
      <Pie
        data={riskDistributionData}
        dataKey="value"
        nameKey="name"
        cx="50%"
        cy="50%"
        outerRadius={100}
        label
      >
        {riskDistributionData.map((entry, index) => (
          <Cell
            key={`cell-${index}`}
            fill={chartColors[index]}
          />
        ))}
      </Pie>

      <Tooltip />
      <Legend />
    </PieChart>
  </ResponsiveContainer>
</div>

</section>

{/* Recent Scan Activity */}
<section className="features" id="recent-activity">

  <p className="tag">LATEST UPDATES</p>
  <h2>Recent Scan Activity</h2>
  <p className="activity-count">
  Showing {recentActivityScans.length} recent scan(s)
</p>
  <div className="activity-filters">
  <button
    className={recentActivityFilter === "All" ? "active" : ""}
    onClick={() => setRecentActivityFilter("All")}
  >
    All Scans
  </button>

  <button
    className={recentActivityFilter === "Message" ? "active" : ""}
    onClick={() => setRecentActivityFilter("Message")}
  >
    Message Scans
  </button>

  <button
    className={recentActivityFilter === "URL" ? "active" : ""}
    onClick={() => setRecentActivityFilter("URL")}
  >
    URL Scans
  </button>
  <button
  onClick={() => setRecentActivityFilter("All")}
>
  Clear Filters
</button>
</div>
<button
  className="main-btn"
  onClick={fetchHistory}
  disabled={historyLoading}
>
  {historyLoading ? "Refreshing..." : "↻ Refresh Activity"}
</button>
  <p>View your five most recent security scans.</p>
  {lastUpdated && (
  <small>
    Last refreshed: {lastUpdated.toLocaleTimeString()}
  </small>
)}

  <div className="feature-grid">
   {historyLoading ? (
  <div className="feature-card">
    <p>Loading recent scan activity...</p>
  </div>
) : recentActivityScans.length === 0 ? (
      <div className="feature-card">
       <p>
  {recentActivityFilter === "Message"
    ? "No message scans found."
    : recentActivityFilter === "URL"
    ? "No URL scans found."
    : "No scan activity available yet."}
</p>
      </div>
    ) : (
      
  recentActivityScans.map((scan) => 
    
     (
        <div className="feature-card" key={scan._id}>
          <h3>
            {scan.url ? "🔗 URL Scan" : "💬 Message Scan"}
          </h3>

          <p>
            {scan.url || scan.message || "Scan record"}
          </p>

         <p>
  Risk Level:{" "}
  <span className={`risk-badge ${scan.riskLevel?.toLowerCase()}`}>
    {scan.riskLevel}
  </span>
</p>

          <p>
            Risk Score: {scan.riskScore}/100
          </p>
          <div className="risk-progress">
  <div
    className={`risk-progress-fill ${scan.riskLevel?.toLowerCase()}`}
    style={{ width: `${scan.riskScore}%` }}
  ></div>
</div>
<button
  className="main-btn"
  onClick={() => setSelectedScan(scan)}
>
  View Details
</button>
          <small>
            {scan.createdAt
              ? new Date(scan.createdAt).toLocaleString()
              : "Date unavailable"}
          </small>
        </div>
      ))
    )}
  </div>
<div style={{ textAlign: "center", marginTop: "25px" }}>
  <a href="#history" className="main-btn">
    View All Scans →
  </a>
</div>
</section>

{/* Scan History Section */}
<section className="features" id="history">

  <p className="tag">YOUR ACTIVITY</p>
  <h2>Scan History</h2>

<p className="history-count">
  Showing {filteredScans.length} of {scans.length} scans
</p>
  {/* Scan History Search */}
<input
  type="text"
  className="history-search"
  placeholder="🔍 Search by message, URL or risk level..."
  value={historySearch}
  onChange={(e) => setHistorySearch(e.target.value)}
/>
{/* Risk Level Filter */}
<select
  className="risk-filter"
  value={riskFilter}
  onChange={(e) => setRiskFilter(e.target.value)}
>
  <option value="All">All Risk Levels</option>
  <option value="High">High Risk</option>
  <option value="Medium">Medium Risk</option>
  <option value="Low">Low Risk</option>
  <option value="Invalid">Invalid</option>
</select>
{/* Scan Type Filter */}
<select
  className="scan-type-filter"
  value={scanTypeFilter}
  onChange={(e) => setScanTypeFilter(e.target.value)}
>
  <option value="All">All Scans</option>
  <option value="Message">Message Scans</option>
  <option value="URL">URL Scans</option>
</select>
{/* History Sorting */}
<select
  className="history-sort"
  value={historySort}
  onChange={(e) => setHistorySort(e.target.value)}
>
  <option value="newest">Newest First</option>
  <option value="oldest">Oldest First</option>
</select>
<button
  className="clear-filter-btn"
  onClick={() => {
  setHistorySearch("");
  setRiskFilter("All");
  setScanTypeFilter("All");
  setHistorySort("newest");
}}
>
  Clear Filters
</button>

  <button
    className="main-btn"
    onClick={fetchHistory}
    disabled={historyLoading}
  >
    {historyLoading ? "Loading..." : "🔄 Refresh History"}
  </button>
<button
  className="main-btn"
  onClick={exportScanHistory}
  disabled={scans.length === 0}
>
  📥 Export Scan History (CSV)
</button>

  {filteredScans.length === 0 ? (
    <p>No previous scans found.</p>
  ) : (
    <div className="feature-grid">

      {currentScans.map((scan) => (
        <div className="feature-card" key={scan._id}>

          <h3>{scan.riskLevel} Risk</h3>

          <p>
            <strong>Risk Score:</strong> {scan.riskScore}/100
          </p>

          <p>
  <strong>{scan.url ? "Scanned URL:" : "Message:"}</strong>
  {" "}
  {scan.url || scan.message}
</p>

          <p>
            <strong>Date:</strong>{" "}
            {new Date(scan.createdAt).toLocaleString()}
          </p>
           <button
  className="main-btn"
  onClick={() => setSelectedScan(scan)}>
    
  📄 View Detailed Report
</button>
          <p>
            <strong>Recommendation:</strong>
            {" "}{scan.recommendation}
          </p>

        </div>
      ))}
    {/* Pagination Controls */}
{totalPages > 1 && (
  <div className="pagination-controls">
    <button
      onClick={() =>
        setCurrentPage((prev) => Math.max(prev - 1, 1))
      }
      disabled={currentPage === 1}
    >
      Previous
    </button>

    <span>
      Page {currentPage} of {totalPages}
    </span>

    <button
      onClick={() =>
        setCurrentPage((prev) =>
          Math.min(prev + 1, totalPages)
        )
      }
      disabled={currentPage === totalPages}
    >
      Next
    </button>
  </div>
)}
    </div>
  )}
{/* Detailed Report Modal */}
{selectedScan && (
  <div className="report-modal">
    <div className="report-content">

      <h2>🛡️ CyberShield Scan Report</h2>
      <p>
  <strong>Report ID:</strong> {selectedScan._id}
</p>
<button
  className="main-btn"
  onClick={() => {
    navigator.clipboard.writeText(selectedScan._id);
    alert("Report ID copied!");
  }}
>
  📋 Copy Report ID
</button>
      <p>
        <strong>Scan Type:</strong>{" "}
        {selectedScan.url ? "URL Scan" : "Message Scan"}
      </p>

      <p>
        <strong>Scanned Content:</strong>{" "}
        {selectedScan.url || selectedScan.message}
      </p>
      <button
  className="main-btn"
  onClick={() => {
    navigator.clipboard.writeText(
      selectedScan.url || selectedScan.message
    );
    alert("Scanned content copied!");
  }}
>
  📋 Copy Scanned Content
</button>

      <h3>Risk Assessment</h3>

      

      <p><h2 className={`risk-badge ${selectedScan.riskLevel?.toLowerCase()}`}>
  {selectedScan.riskLevel} Risk
</h2>
        <strong>Risk Score:</strong>{" "}
        {selectedScan.riskScore}/100
      </p>

      <h3>Detected Warnings</h3>

      {selectedScan.warnings.length > 0 ? (
        <ul>
          {selectedScan.warnings.map((warning, index) => (
            <li key={index}>{warning}</li>
          ))}
        </ul>
      ) : (
        <p>No suspicious indicators detected.</p>
      )}
      {/* Threat Intelligence Section */}
<div className="threat-intelligence">
  <h3>🔍 Threat Intelligence Analysis</h3>

  {getThreatIntelligence().length > 0 ? (
    getThreatIntelligence().map((threat, index) => (
      <div className="threat-card" key={index}>
        <h4>{threat.title}</h4>

        <p>
          <strong>Detected Indicator:</strong> {threat.warning}
        </p>

        <p>
          <strong>Analysis:</strong> {threat.details}
        </p>

        <p>
          <strong>Recommended Action:</strong> {threat.action}
        </p>
      </div>
    ))
  ) : (
    <p>No threat indicators were detected by the current rules.</p>
  )}
</div>

      <h3>Security Recommendation</h3>

      <p>{selectedScan.recommendation}</p>
      {/* Security Awareness Assistant */}
<div className="assistant-section">
  <h3>🛡️ Security Awareness Assistant</h3>

  <p>
    Want to understand why this scan received its risk score?
  </p>

  <button
    className="main-btn"
    onClick={generateExplanation}
  >
    🤖 Explain Scan Result
  </button>

  {assistantExplanation && (
    <div className="assistant-result">
      <h4>Scan Explanation</h4>
      <p>{assistantExplanation}</p>
    </div>
  )}
</div>

      <p>
        <strong>Scan Date:</strong>{" "}
        {new Date(selectedScan.createdAt).toLocaleString()}
      </p>
    
    <button
  className="main-btn"
  onClick={downloadReport}
>
  📥 Download PDF Report
</button> 

      <button
        className="main-btn"
        onClick={() => setSelectedScan(null)}
      >
        Close Report
      </button>

    </div>
  </div>
)}
</section>
{/* Security Awareness Learning Center */}
<section id="learning-center" className="learning-section">
  <h2>📚 Security Awareness Learning Center</h2>
  <p>
    Learn how to identify common online threats and stay safe online.
  </p>

  <div className="feature-grid">

    <div className="feature-card">
      <h3>🎣 Phishing Awareness</h3>
      <p>Learn to recognize suspicious messages, fake emails and misleading links.</p>
    </div>

    <div className="feature-card">
      <h3>🔐 Password Safety</h3>
      <p>Understand strong passwords, password reuse and account protection.</p>
    </div>

    <div className="feature-card">
      <h3>🌐 Fake Website Detection</h3>
      <p>Learn how to identify suspicious domains and misleading website addresses.</p>
    </div>

    <div className="feature-card">
      <h3>💳 Payment Safety</h3>
      <p>Understand safe digital payments and common payment-related fraud warnings.</p>
    </div>

    <div className="feature-card">
      <h3>📱 OTP Protection</h3>
      <p>Learn why OTPs and verification codes must remain private.</p>
    </div>

  </div>
  {/* Daily Cybersecurity Tips */}
<div className="security-tips">
  <h3>🛡️ Essential Cybersecurity Tips</h3>

  <div className="tip-card">
    <h4>🔐 Protect Your Accounts</h4>
    <p>Use unique passwords and enable two-factor authentication.</p>
  </div>

  <div className="tip-card">
    <h4>📩 Beware of Phishing</h4>
    <p>Verify unexpected messages before clicking links or sharing information.</p>
  </div>

  <div className="tip-card">
    <h4>🌐 Browse Safely</h4>
    <p>Check website addresses carefully before entering personal information.</p>
  </div>

  <div className="tip-card">
    <h4>💳 Make Safe Payments</h4>
    <p>Never share your OTP, PIN or banking credentials with anyone.</p>
  </div>
</div>
</section>
{/* Cybersecurity Quiz */}
<section id="cyber-quiz" className="quiz-section">
  <h2>🧠 Cybersecurity Knowledge Quiz</h2>

  <div className="quiz-card">

    {!quizFinished ? (
      <>
        <p>
          Question {currentQuestion + 1} of {quizQuestions.length}
        </p>
        <div className="quiz-progress">
  <div
    className="quiz-progress-fill"
    style={{
      width: `${((currentQuestion + 1) / quizQuestions.length) * 100}%`
    }}
  ></div>
</div>

        <h3>{quizQuestions[currentQuestion].question}</h3>

        {quizQuestions[currentQuestion].options.map((option, index) => (
          <button
            key={index}
            className="quiz-option"
            onClick={() => {
              if (!quizSubmitted) setQuizAnswer(option);
            }}
            disabled={quizSubmitted}
            style={{
              border: quizAnswer === option
                ? "2px solid #6366f1"
                : "1px solid #cbd5e1"
            }}
          >
            {option}
          </button>
        ))}

        {!quizSubmitted ? (
          <button
            className="main-btn"
            disabled={!quizAnswer}
            onClick={() => {
              if (
                quizAnswer === quizQuestions[currentQuestion].correctAnswer
              ) {
                setQuizScore(prev => prev + 1);
              }
              setQuizSubmitted(true);
            }}
          >
            Submit Answer
          </button>
        ) : (
          <>
            <p>
              {quizAnswer === quizQuestions[currentQuestion].correctAnswer
                ? "✅ Correct Answer!"
                : `❌ Incorrect! Correct answer: ${quizQuestions[currentQuestion].correctAnswer}`}
            </p>
            <div className="quiz-explanation">
  <h4>💡 Learn More</h4>
  <p>{quizQuestions[currentQuestion].explanation}</p>
</div>

            <button
              className="main-btn"
              onClick={() => {
                if (currentQuestion + 1 < quizQuestions.length) {
                  setCurrentQuestion(prev => prev + 1);
                  setQuizAnswer("");
                  setQuizSubmitted(false);
                } else {
                  setQuizFinished(true);
                }
              }}
            >
              {currentQuestion + 1 === quizQuestions.length
                ? "View Final Score"
                : "Next Question"}
            </button>
          </>
        )}
      </>
    ) : (
      <>
        <h3>🎉 Quiz Completed!</h3>
        <h2>Your Score: {quizScore} / {quizQuestions.length}</h2>

        <p>
          {quizScore === 5
            ? "Excellent! You have strong cybersecurity awareness."
            : "Good effort! Keep learning and improving your cybersecurity knowledge."}
        </p>

        <button
          className="main-btn"
          onClick={() => {
            setCurrentQuestion(0);
            setQuizAnswer("");
            setQuizSubmitted(false);
            setQuizScore(0);
            setQuizFinished(false);
          }}
        >
          Restart Quiz
        </button>
      </>
    )}

  </div>
</section>

      {/* Features */}
      <section className="features" id="features">
        <p className="tag">WHAT WE OFFER</p>
        <h2>Explore CyberShield</h2>

        <div className="feature-grid">
          <div className="feature-card">
            <h3>📩 Scam Detection</h3>
            <p>
              Identify suspicious messages and
              potential online scams.
            </p>
          </div>

          <div className="feature-card">
            <h3>🔗 Link Awareness</h3>
            <p>
              Learn to recognize suspicious
              and potentially unsafe links.
            </p>
          </div>

          <div className="feature-card">
            <h3>🤖 AI Assistant</h3>
            <p>
              Get guidance about online
              security and digital safety.
            </p>
          </div>

          <div className="feature-card">
            <h3>📚 Cyber Learning</h3>
            <p>
              Improve your cybersecurity
              knowledge through learning.
            </p>
          </div>

          <div className="feature-card">
            <h3>📊 Risk Analysis</h3>
            <p>
              Understand risk levels and
              suspicious message indicators.
            </p>
          </div>

          <div className="feature-card">
            <h3>🕒 Scan History</h3>
            <p>
              Keep track of your previous
              security checks.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="about" id="about">
        <h2>How CyberShield Works</h2>

        <div className="steps">
          <div>01 <p>Paste a suspicious message</p></div>
          <div>02 <p>Analyze potential threats</p></div>
          <div>03 <p>Understand the risk</p></div>
          <div>04 <p>Stay protected online</p></div>
        </div>
      </section>

      {/* Footer */}
      <footer>
        <h2>🛡️ CyberShield</h2>
        <p>Think Before You Click. Stay Cyber Safe.</p>
        <p>© 2026 CyberShield | PromptWars Hackathon</p>
      </footer>

    </div>
  );
}

export default App;