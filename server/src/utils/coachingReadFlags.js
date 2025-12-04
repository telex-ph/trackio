export function getCoachingReadFlags(status) {
  return {
    isReadByRespondant:
      ![
        "Coaching Log",
        "For Acknowledgement",
      ].includes(status),

    isReadByCoach:
      ![
        "Respondant Explained",
        "Acknowledged",
      ].includes(status),
  };
}
