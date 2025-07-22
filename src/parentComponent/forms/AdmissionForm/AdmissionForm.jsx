import React from 'react'
import ImmunizationInstructions from './ImmunizationInstructions';
import ChildInfo from './ChildInfo/ChildInfo'
import ChildandFamilyHistory from './Child and Family History/ChildandFamilyHistory';
import PickUpPassword from './Pick-up Password';
import VideoPermission from './VideoPermission';
import SecurityPolicy from './SecurityPolicy';
import SocialMediaReleaseForm from './SocialMedia';
import OutsideEngagements from './OutsideEngagements';
import HealthPolicies from './HealthPolicies';
import MedicalTransportationWaiver from './MedicalTransportationWaiver';
import ChildProfileForm from './ChildProfile/ChildProfile';
import AdminSign from './AdminSign';
import ParentSign from './ParentSign';

function AdmissionForm({selectedSubForm}) {
  // console.log("Selected SubForm:", selectedSubForm);
  return (
    <div>

       
        {(() => {
    switch (selectedSubForm) {
        case 'Child Information':
            return <ChildInfo></ChildInfo>
      case 'Child and Family History':
        return <ChildandFamilyHistory />;
      case 'Immunization':
        return <ImmunizationInstructions />;
      case 'Child Profile':
        return <ChildProfileForm />;
   case 'Photo/Video Permission':
    return <VideoPermission></VideoPermission>
      case 'Pick-up Password':
        return <PickUpPassword></PickUpPassword> ;
       case 'Security & Policy':
        return <SecurityPolicy></SecurityPolicy>
        case 'Medical Transportation':
            return <MedicalTransportationWaiver></MedicalTransportationWaiver>
        case 'Health Policies':
          return <HealthPolicies></HealthPolicies>
        case 'Outside Engagements':
          return <OutsideEngagements></OutsideEngagements>
        case 'Social Media Approval':
          return <SocialMediaReleaseForm></SocialMediaReleaseForm>
        case 'Admin Signature':
          return <AdminSign></AdminSign>
        case 'Parent Signature':
          return <ParentSign></ParentSign>
      default:
        return null;
    }
  })()}
    </div>
  )
}

export default AdmissionForm