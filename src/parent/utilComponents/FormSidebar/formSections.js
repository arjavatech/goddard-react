const formSections = [
    {
      key: "enrollment",
      title: "Enrollment Agreement",
      items: ["Agreement", "Parent Signature", "Admin Signature"],
    },
    {
      key: "authorization",
      title: "Authorization",
      items: ["Authorization ACH", "Parent Signature", "Admin Signature"]
    },
    {
      key: "parentHandbook",
      title: "Parent Handbook",
      items: ["Policy", "Parent Signature", "Admin Signature"]
    },
    {
      key: "admission",
      title: "Admission Forms",
      items: [
        "Child Information",
        "Child and Family History",
        "Immunization",
        "Child Profile",
        "Pick-up Password",
        "Photo/Video Permission",
        "Security & Policy",
        "Medical Transportation",
        "Health Policies",
        "Outside Engagements",
        "Social Media Approval",
        "Parent Signature",
        "Admin Signature"
      ]
    },
  ];

  // Mapping from API incomplete form names to formSection keys
  // These names are processed from API response: value.replace(/\s+/g, "_").toLowerCase()
  const formNameMapping = {
    'admission_form': 'admission',
    'enrollment_agreement': 'enrollment', 
    'authorization': 'authorization',
    'parent_handbook': 'parentHandbook'
  };
  
  export { formSections, formNameMapping };