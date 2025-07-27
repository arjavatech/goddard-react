import React from 'react';

const FormItem = ({ item, sectionKey, formStatus, onItemClick,isSelected }) => {
console.log(formStatus)
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
  

  

  // Debug: Log authorization items for troubleshooting
  if (sectionKey) {
    console.log("formStatus[itemKey]", formStatus[itemKey])
    const isCompleted = formStatus[itemKey]?.completed === true;
    const imageSrc = isCompleted ? "/image/tick.png" : "/image/circle-with.png";
    console.log(`Authorization FormItem - Item: "${item}", Key: "${itemKey}", Status:`, formStatus[itemKey], 'Completed:', formStatus[itemKey]?.completed, 'Will show image:', imageSrc);
  }
  if (sectionKey === "parentHandbook") {
    const isCompleted = formStatus[itemKey]?.completed === true;
    const imageSrc = isCompleted ? "/image/tick.png" : "/image/circle-with.png";
    console.log(`Parent Handbook FormItem - Item: "${item}", Key: "${itemKey}", Status:`, formStatus[itemKey], 'Completed:', formStatus[itemKey]?.completed, 'Will show image:', imageSrc);
  }

  

  const handleItemClick = () => {
    if (onItemClick) {
      onItemClick(sectionKey, item);
    }
  };

  return (
    <div 
    className={`flex justify-between items-center px-3 py-1 border-b-2 border-[#0F2D52] last:border-none ${
      isSelected ? "bg-[#0F2D52] text-white" : "bg-[#E2F1FF]"
    } hover:bg-[#0F2D52] hover:text-white cursor-pointer`}
    onClick={handleItemClick}
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
  );
};

export default FormItem;