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

function AdmissionForm({selectedSubForm, initialFormData = null}) {
  return (
    <div>

       
        {(() => {
    switch (selectedSubForm) {
        case 'Child Information':
            return <ChildInfo initialFormData={initialFormData} />
      case 'Child and Family History':
        return <ChildandFamilyHistory initialFormData={initialFormData} />;
      case 'Immunization':
        return <ImmunizationInstructions initialFormData={initialFormData} />;
      case 'Child Profile':
        return <ChildProfileForm initialFormData={initialFormData} />;
   case 'Photo/Video Permission':
    return <VideoPermission initialFormData={initialFormData} />
      case 'Pick-up Password':
        return <PickUpPassword initialFormData={initialFormData} /> ;
       case 'Security & Policy':
        return <SecurityPolicy initialFormData={initialFormData} />
        case 'Medical Transportation':
            return <MedicalTransportationWaiver initialFormData={initialFormData} />
        case 'Health Policies':
          return <HealthPolicies initialFormData={initialFormData} />
        case 'Outside Engagements':
          return <OutsideEngagements initialFormData={initialFormData} />
        case 'Social Media Approval':
          return <SocialMediaReleaseForm initialFormData={initialFormData} />
        case 'Admin Signature':
          return <AdminSign initialFormData={initialFormData} />
        case 'Parent Signature':
          return <ParentSign initialFormData={initialFormData} />
      default:
        return null;
    }
  })()}
    </div>
  )
}

export default AdmissionForm