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

function AdmissionForm({selectedSubForm, initialFormData = null, childId = null}) {
  return (
    <div>

       
        {(() => {
    switch (selectedSubForm) {
        case 'Child Information':
            return <ChildInfo initialFormData={initialFormData} childId={childId} />
      case 'Child and Family History':
        return <ChildandFamilyHistory initialFormData={initialFormData} childId={childId} />;
      case 'Immunization':
        return <ImmunizationInstructions initialFormData={initialFormData} childId={childId} />;
      case 'Child Profile':
        return <ChildProfileForm initialFormData={initialFormData} childId={childId} />;
   case 'Photo/Video Permission':
    return <VideoPermission initialFormData={initialFormData} childId={childId} />
      case 'Pick-up Password':
        return <PickUpPassword initialFormData={initialFormData} childId={childId} /> ;
       case 'Security & Policy':
        return <SecurityPolicy initialFormData={initialFormData} childId={childId} />
        case 'Medical Transportation':
            return <MedicalTransportationWaiver initialFormData={initialFormData} childId={childId} />
        case 'Health Policies':
          return <HealthPolicies initialFormData={initialFormData} childId={childId} />
        case 'Outside Engagements':
          return <OutsideEngagements initialFormData={initialFormData} childId={childId} />
        case 'Social Media Approval':
          return <SocialMediaReleaseForm initialFormData={initialFormData} childId={childId} />
        case 'Admin Signature':
          return <AdminSign initialFormData={initialFormData} childId={childId} />
        case 'Parent Signature':
          return <ParentSign initialFormData={initialFormData} childId={childId} />
      default:
        return null;
    }
  })()}
    </div>
  )
}

export default AdmissionForm