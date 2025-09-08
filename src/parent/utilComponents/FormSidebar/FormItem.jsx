import React from 'react';

const FormItem = ({ item, sectionKey, formStatus, onItemClick, isSelected, userEmail }) => {
  // List of admin emails that should have access to admin signatures
  const ADMIN_EMAILS = [
    'goddard01arjava@gmail.com',
    'admin@goddard.com',
    // Add more admin emails here as needed
  ];
  
  // Helper function to check if user is admin
  const isAdminUser = () => {
    if (!userEmail) return false;
    return ADMIN_EMAILS.includes(userEmail.toLowerCase());
  };
  const getItemKey = () => {
    if (item.toLowerCase().includes("ach")) return "authorization_ach";
    if (item.toLowerCase().includes("signature")) {
      if (sectionKey === "authorization") {
        if (item.toLowerCase().includes("parent")) return "authorization_signature";
        if (item.toLowerCase().includes("admin")) return "authorization_admin_signature";
        return "authorization_signature"; // fallback
      }
      
      if (sectionKey === "enrollment") {
        if (item.toLowerCase().includes("parent")) return "enrollment_parent_signature";
        if (item.toLowerCase().includes("admin")) return "enrollment_admin_signature";
        return "enrollment_parent_signature"; // fallback
      }
      
      if (sectionKey === "parentHandbook")
      {
        if (item.toLowerCase().includes("parent")) return "parenthandbook_signature";
        if (item.toLowerCase().includes("admin")) return "parenthandbook_admin_signature";
        return "parenthandbook_signature";
      }
         
      if (sectionKey === "admission")
        {
        if (item.toLowerCase().includes("parent")) return "admission_parentsignature";
        if (item.toLowerCase().includes("admin")) return "admission_adminsignature";
        } return "admission_parentsignature";
    }
    if (item.toLowerCase().includes("agreement") && sectionKey === "enrollment") return "enrollment_agreement";
    if (item.toLowerCase().includes("policy") && sectionKey === "parentHandbook") return "parenthandbook_policy";
    if (item.toLowerCase().includes("child information")) return "admission_childinformation";
    if (item.toLowerCase().includes("child and family history")) return "admission_childandfamilyhistory";
    if (item.toLowerCase().includes("immunization")) return "admission_immunization";
    if (item.toLowerCase().includes("child profile")) return "admission_child_profile";
    if (item.toLowerCase().includes("pick-up password")) return "admission_childpickup_password";
    if (item.toLowerCase().includes("photo/video permission")) return "admission_photo_permission";
    if (item.toLowerCase().includes("security")) return "admission_security";
    if (item.toLowerCase().includes("medical transportation")) return "admission_medical_transportation";
    if (item.toLowerCase().includes("health policies")) return "admission_health_policies";
    if (item.toLowerCase().includes("outside engagements")) return "admission_outside_engagements";
    if (item.toLowerCase().includes("social media")) return "admission_social_media";
    if (item.toLowerCase().includes("admission")) return "admmission";
    return sectionKey;
  };

  const itemKey = getItemKey();
  

  


  

  // Check if parent signature prerequisites are complete
  const areParentSignaturePrerequisitesComplete = () => {
    if (!item.toLowerCase().includes('parent signature')) {
      return true; // Not a parent signature, no restriction needed
    }

    switch (sectionKey) {
      case 'authorization':
        // Parent signature requires ACH to be complete
        return formStatus['authorization_ach']?.completed === true;
        
      case 'enrollment':
        // Parent signature requires Agreement to be complete
        return formStatus['enrollment_agreement']?.completed === true;
        
      case 'parentHandbook':
        // Parent signature requires Policy to be complete
        return formStatus['parenthandbook_policy']?.completed === true;
        
      case 'admission':
        // Parent signature requires all admission form items to be complete
        const admissionItems = [
          'admission_childinformation',
          'admission_childandfamilyhistory', 
          'admission_immunization',
          'admission_child_profile',
          'admission_childpickup_password',
          'admission_photo_permission',
          'admission_security',
          'admission_medical_transportation',
          'admission_health_policies',
          'admission_outside_engagements',
          'admission_social_media'
        ];
        return admissionItems.every(itemKey => formStatus[itemKey]?.completed === true);
        
      default:
        return true;
    }
  };

  const handleItemClick = () => {
    // REMOVED: localStorage dependency - using userEmail prop from Auth0
    
    // Check if user is NOT admin and trying to access Admin Signature
    if (!isAdminUser() && item.toLowerCase().includes('admin signature')) {
      return;
    }
    
    // Check if parent signature prerequisites are complete
    if (item.toLowerCase().includes('parent signature') && !areParentSignaturePrerequisitesComplete()) {
      return;
    }
    
    if (onItemClick) {
      onItemClick(sectionKey, item);
    }
  };

  // Check restrictions - using userEmail prop from Auth0
  const isAdminRestricted = !isAdminUser() && item.toLowerCase().includes('admin signature');
  const isParentSignatureRestricted = item.toLowerCase().includes('parent signature') && !areParentSignaturePrerequisitesComplete();
  
  

  return (
    <div className="relative group">
      <div 
      className={`flex justify-between items-center px-3 py-1 border-b-2 border-[#0F2D52] last:border-none ${
        isSelected ? "bg-[#0F2D52] text-white" : "bg-[#E2F1FF]"
      } ${
        isAdminRestricted 
          ? "opacity-50 cursor-not-allowed bg-gray-200" 
          : "hover:bg-[#0F2D52] hover:text-white cursor-pointer"
      }`}
      onClick={handleItemClick}
      title={
        isAdminRestricted ? "Only admin users can access Admin Signature sections" : ""
      }
    >
        <span>{item}</span>
        <img
          src={
            formStatus[itemKey]?.completed === true ? "/image/tick.png" : "/image/circle-with.png"
          }
          alt={
            formStatus[itemKey]?.completed === true ? "Completed" : 
            formStatus[itemKey] === undefined ? `Debug - Status Unknown for ${itemKey}` : 
            "Incomplete"
          }
          className="w-5 h-5"
        />
      </div>
      
      {/* Red tooltip for parent signature restrictions - shows on hover */}
      {isParentSignatureRestricted && (
        <div className="absolute top-full left-0 right-0 z-10 bg-red-600 text-white text-xs px-2 py-1 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          You have to fill the missing fields.
        </div>
      )}
    </div>
  );
};

export default FormItem;