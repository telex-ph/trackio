export function getIRReadFlags(status) {
  return {
    isReadByHR:
      ![
        "Pending Review",
        "Respondant Explained",
        "Acknowledged",
      ].includes(status),

    isReadByReporter:
      ![
        "Invalid",
        "MOM Uploaded",
      ].includes(status),

    isReadByRespondant:
      ![
        "NTE",
        "Scheduled for hearing",
        "After Hearing",
        "For Acknowledgement",
      ].includes(status),
  };
}
