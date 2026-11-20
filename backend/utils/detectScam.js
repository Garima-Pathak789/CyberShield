function detectScam(message) {
  let riskScore = 0;
  const warnings = [];

  const text = message.toLowerCase();

  // Urgent language
  if (/urgent|immediately|act now|account blocked/.test(text)) {
    riskScore += 20;
    warnings.push("Urgent or threatening language detected");
  }

  // Requests for sensitive information
  if (/password|otp|pin|cvv|bank details/.test(text)) {
    riskScore += 30;
    warnings.push("Sensitive information requested");
  }

  // Suspicious rewards
  if (/winner|lottery|prize|free gift|claim reward/.test(text)) {
    riskScore += 20;
    warnings.push("Unexpected prize or reward language detected");
  }

  // Suspicious payment requests
  if (/send money|pay now|transfer money/.test(text)) {
    riskScore += 20;
    warnings.push("Payment pressure detected");
  }

  // Links
  if (/https?:\/\/|www\./.test(text)) {
    riskScore += 15;
    warnings.push("Message contains a web link");
  }

  riskScore = Math.min(riskScore, 100);

  let riskLevel = "Low";
  let recommendation = "Stay cautious and verify the sender.";

  if (riskScore >= 60) {
    riskLevel = "High";
    recommendation = "Do not click links or share sensitive information. Verify through official channels.";
  } else if (riskScore >= 30) {
    riskLevel = "Medium";
    recommendation = "Check the sender and verify the request independently.";
  }

  return {
    riskScore,
    riskLevel,
    warnings,
    recommendation
  };
}

module.exports = detectScam;