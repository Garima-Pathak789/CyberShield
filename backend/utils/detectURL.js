function detectURL(input) {
  const warnings = [];
  let riskScore = 0;

  let url;

  try {
    const cleanInput = input.trim();

    url = new URL(
      /^https?:\/\//i.test(cleanInput)
        ? cleanInput
        : `https://${cleanInput}`
    );
    
    if (!["http:", "https:"].includes(url.protocol)) {
      throw new Error("Unsupported protocol");
    }
  } catch {
    return {
      valid: false,
      riskScore: 0,
      riskLevel: "Invalid",
      warnings: ["Invalid URL format"],
      recommendation: "Please enter a valid website URL."
    };
  }

  const hostname = url.hostname.toLowerCase();
  const path = url.pathname.toLowerCase();

  // 1. Check HTTPS
  if (url.protocol !== "https:") {
    riskScore += 15;
    warnings.push("Website does not use HTTPS");
  }

  // 2. Check IP address
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(hostname)) {
    riskScore += 25;
    warnings.push("URL uses an IP address instead of a domain name");
  }

  // 3. Check suspicious hostname keywords
  if (/login|verify|secure|account|update|bank|free|gift/.test(hostname)) {
    riskScore += 20;
    warnings.push("Potentially misleading words found in domain");
  }

  // 4. Check suspicious URL paths
  if (/password|credential|wallet|signin|confirm|payment/.test(path)) {
    riskScore += 15;
    warnings.push("Suspicious keywords found in URL path");
  }

  // 5. Check unusually long URLs
  if (url.href.length > 100) {
    riskScore += 10;
    warnings.push("Unusually long URL");
  }

  // 6. Check embedded user information
  if (url.username || url.password || input.includes("@")) {
    riskScore += 20;
    warnings.push("URL contains potentially misleading user information");
  }

  // 7. Check unusually complex subdomains
  const domainParts = hostname.split(".");

  if (domainParts.length >= 5) {
    riskScore += 10;
    warnings.push("Unusually complex subdomain structure");
  }

  // 8. Check unusual combinations of numbers and hyphens
  if (/[0-9].*-|-[0-9]/.test(hostname)) {
    riskScore += 10;
    warnings.push("Domain contains an unusual number and hyphen combination");
  }

  // Keep score between 0 and 100
  riskScore = Math.min(riskScore, 100);

  let riskLevel = "Low";

  let recommendation =
    "No obvious suspicious patterns detected. Still verify the website before sharing information.";

  if (riskScore >= 60) {
    riskLevel = "High";
    recommendation =
      "Avoid entering personal information. Verify the domain through an official source.";
  } else if (riskScore >= 30) {
    riskLevel = "Medium";
    recommendation =
      "Check the website address carefully before proceeding.";
  }

  return {
    valid: true,
    url: input,
    riskScore,
    riskLevel,
    warnings,
    recommendation
  };
}

module.exports = detectURL;