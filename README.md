🛡️ CyberShield – Smart Cybersecurity Awareness & Threat Detection Platform

1. Project Overview

CyberShield is a web-based cybersecurity awareness platform designed to help users identify potentially suspicious messages and URLs.

It analyzes user-submitted content using rule-based detection techniques, assigns a risk score, highlights suspicious indicators, and provides security recommendations.

The platform also includes a dashboard, scan history, threat intelligence explanations, PDF reports, and an interactive cybersecurity quiz.

2. Problem Statement

Cyber threats such as phishing messages, fraudulent links, and misleading online offers can put users' personal information and digital security at risk.

Many users struggle to recognize suspicious content.

CyberShield aims to make basic cybersecurity awareness more accessible through an interactive scanning and educational platform.

3. Key Features

- Message Scanner: Analyzes messages for suspicious patterns.
- URL Scanner: Checks URLs for potentially suspicious characteristics.
- Risk Assessment: Assigns a risk score from 0–100.
- Risk Classification: Categorizes results as Low, Medium, High, or Invalid.
- Dashboard: Displays scan statistics and graphical visualizations.
- Scan History: Stores and retrieves previous scan records.
- Search and Filters: Search, sort, and filter scan records.
- Recent Scan Activity: Displays the latest five scans.
- Threat Intelligence Analysis: Explains detected indicators using predefined rules.
- Security Awareness Assistant: Provides rule-based explanations of scan results.
- PDF Reports: Generates downloadable scan reports.
- Learning Center: Provides cybersecurity awareness information.
- Cyber Quiz: Tests users' cybersecurity knowledge.

4. Technologies Used

Frontend

- React.js
- Vite
- JavaScript
- HTML5
- CSS3
- Recharts
- jsPDF

Backend

- Node.js
- Express.js
- MongoDB
- Mongoose
- REST API
- CORS
- dotenv

5. System Architecture

CyberShield follows a client-server architecture.

1. The user interacts with the React frontend.
2. The frontend sends scan requests to the Express backend.
3. The backend processes the submitted content using detection rules.
4. The backend generates a risk score, risk level, warnings, and recommendations.
5. Scan records are stored in MongoDB.
6. The frontend displays the results and dashboard statistics.

6. Project Structure

CyberShield/
│
├── backend/
│   ├── models/
│   │   └── Scan.js
│   ├── utils/
│   │   ├── detectScam.js
│   │   └── detectURL.js
│   ├── server.js
│   ├── package.json
│   └── .env
│
├── src/
│   ├── App.jsx
│   ├── App.css
│   └── main.jsx
│
├── public/
├── package.json
└── README.md

7. Installation and Setup

Prerequisites

- Node.js and npm
- MongoDB Atlas account or a local MongoDB installation
- Visual Studio Code
- Modern web browser

Step 1: Clone the Repository

git clone YOUR_REPOSITORY_URL
cd CyberShield

Step 2: Install Frontend Dependencies

npm install

Step 3: Install Backend Dependencies

cd backend
npm install

Step 4: Configure Environment Variables

Create a ".env" file inside the backend folder.

Add your own MongoDB connection configuration:

PORT=5000
MONGO_URI=YOUR_MONGODB_CONNECTION_STRING

Never upload your actual database credentials or ".env" file to a public repository.

Step 5: Start the Backend

From the backend folder:

npm run dev

If the development script is unavailable, use:

node server.js

Step 6: Start the Frontend

Open another terminal in the main project folder:

npm run dev

Open the local URL displayed by Vite in your browser.

8. API Endpoints

Method| Endpoint| Purpose
GET| "/"| Backend health check
GET| "/api/health"| Server status
POST| "/api/scan"| Scan a message
POST| "/api/scan-url"| Scan a URL
GET| "/api/scans"| Retrieve scan history
GET| "/api/statistics"| Retrieve dashboard statistics

9. Risk Detection Methodology

CyberShield currently uses rule-based detection.

The message scanner checks for patterns such as:

- Urgency and pressure.
- Requests for sensitive information.
- Suspicious prize or reward claims.
- Payment pressure.
- Links in messages.

The URL scanner checks characteristics such as:

- Non-HTTPS connections.
- IP-based hostnames.
- Suspicious hostname and path terms.
- Unusually long URLs.
- Embedded credentials or unusual hostname patterns.

The application calculates a risk score and assigns a risk category based on predefined thresholds.

10. Important Limitations

CyberShield is an educational cybersecurity awareness tool.

Its rule-based detection system does not guarantee that a website or message is safe or malicious.

It does not currently use a trained machine-learning model, live threat-intelligence feeds, or comprehensive real-time reputation databases.

Users should independently verify suspicious communications and avoid sharing sensitive information.

11. Future Enhancements

- Machine-learning-based threat detection.
- Integration with trusted threat-intelligence services.
- Improved phishing detection.
- User authentication and personalized dashboards.
- Advanced analytics and reporting.
- More comprehensive cybersecurity learning modules.

12. Conclusion

CyberShield aims to improve digital safety awareness by combining message scanning, URL analysis, risk visualization, historical reporting, and cybersecurity education in one platform.

Project Name: CyberShield
Category: Cybersecurity / Web Application
Technology: MERN-based application with React, Express, and MongoDB.