import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  ScrollText, 
  FileText, 
  User,
  Shield,
  CheckCircle,
  AlertCircle,
  Save,
  Send,
  Clock,
  Calendar,
  Edit3,
  Info,
  Lock
} from 'lucide-react';
import { toast, Toaster } from 'sonner';
import { useAuth0 } from '@auth0/auth0-react';
import { submitAndCompleteForm } from '@/utils/formSubmission';

const EnrollmentFormNew = ({ selectedSubForm = null, initialFormData = null, childId = null, onSubmitSuccess, onSubFormChange, formStatus = {} }) => {
  const { getAccessTokenSilently, user } = useAuth0();
  
  // Check if Enrollment Agreement prerequisites are complete (enrollment form must be completed)
  const areEnrollmentPrerequisitesComplete = () => {
    // For enrollment form, the agreement section must be completed before signatures
    return formStatus['enrollment_agreement']?.completed === true;
  };
  
  // List of admin emails that should have access to admin signatures
  const ADMIN_EMAILS = [
    'goddard01arjava@gmail.com',
    'admin@goddard.com',
    // Add more admin emails here as needed
  ];
  
  // Check if user is admin - using email-based check like the sidebar
  const isAdmin = user?.email && ADMIN_EMAILS.includes(user.email.toLowerCase());
  const [activeTab, setActiveTab] = useState(selectedSubForm ? getTabFromSubForm(selectedSubForm) : 'enrollment');
  const [formData, setFormData] = useState({
    point_one_field_one: new Date().toISOString().split('T')[0],
    point_one_field_three: '',
    point_two_initial_here: '',
    point_three_initial_here: '',
    point_four_initial_here: '',
    point_five_initial_here: '',
    point_six_initial_here: '',
    point_seven_initial_here: '',
    point_eight_initial_here: '',
    point_nine_initial_here: '',
    point_ten_initial_here: '',
    point_eleven_initial_here: '',
    point_twelve_initial_here: '',
    point_thirteen_initial_here: '',
    point_fourteen_initial_here: '',
    point_fifteen_initial_here: '',
    point_sixteen_initial_here: '',
    point_seventeen_initial_here: '',
    point_eighteen_initial_here: '',
    point_ninteen_initial_here: '', // Keep API spelling
    preferred_start_date: '',
    preferred_schedule: '',
    full_day: false,
    half_day: false,
    parent_sign_enroll: '',
    parent_sign_date_enroll: '',
    admin_sign_enroll: '',
    admin_sign_date_enroll: ''
  });

  // Convert selectedSubForm to tab ID
  function getTabFromSubForm(subForm) {
    if (!subForm) return 'enrollment';
    
    switch (subForm.toLowerCase()) {
      case 'agreement':
        return 'enrollment';
      case 'parent signature':
        return 'parent';
      case 'admin signature':
        return 'admin';
      default:
        return 'enrollment';
    }
  }

  // Convert tab ID back to subForm name for sidebar sync
  function getSubFormFromTab(tabId) {
    switch (tabId) {
      case 'enrollment':
        return 'Agreement';
      case 'parent':
        return 'Parent Signature';
      case 'admin':
        return 'Admin Signature';
      default:
        return 'Agreement';
    }
  }

  // Update activeTab when selectedSubForm prop changes (sidebar navigation)
  useEffect(() => {
    if (selectedSubForm) {
      const newTab = getTabFromSubForm(selectedSubForm);
      setActiveTab(newTab);
    }
  }, [selectedSubForm]);

  // Handle tab change and notify parent for sidebar sync
  const handleTabChange = (tabValue) => {
    setActiveTab(tabValue);
    // Notify parent component to update sidebar selection
    if (onSubFormChange) {
      const subFormName = getSubFormFromTab(tabValue);
      onSubFormChange(subFormName);
    }
  };

  // Use standardized form submission

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSave = async () => {
    if (!childId) {
      toast.error('Error: Child ID is missing');
      return;
    }

    try {
      const saveData = {
        child_id: childId,
        point_one_field_one: formData.point_one_field_one,
        point_one_field_three: formData.point_one_field_three,
        point_two_initial_here: formData.point_two_initial_here,
        point_three_initial_here: formData.point_three_initial_here,
        point_four_initial_here: formData.point_four_initial_here,
        point_five_initial_here: formData.point_five_initial_here,
        point_six_initial_here: formData.point_six_initial_here,
        point_seven_initial_here: formData.point_seven_initial_here,
        point_eight_initial_here: formData.point_eight_initial_here,
        point_nine_initial_here: formData.point_nine_initial_here,
        point_ten_initial_here: formData.point_ten_initial_here,
        point_eleven_initial_here: formData.point_eleven_initial_here,
        point_twelve_initial_here: formData.point_twelve_initial_here,
        point_thirteen_initial_here: formData.point_thirteen_initial_here,
        point_fourteen_initial_here: formData.point_fourteen_initial_here,
        point_fifteen_initial_here: formData.point_fifteen_initial_here,
        point_sixteen_initial_here: formData.point_sixteen_initial_here,
        point_seventeen_initial_here: formData.point_seventeen_initial_here,
        point_eighteen_initial_here: formData.point_eighteen_initial_here,
        point_ninteen_initial_here: formData.point_ninteen_initial_here,
        preferred_start_date: formData.preferred_start_date,
        preferred_schedule: formData.preferred_schedule,
        full_day: formData.full_day == null ? '' : formData.full_day.toString(),
        half_day: formData.half_day == null ? '' : formData.half_day.toString()
      };

      const success = await submitAndCompleteForm(
        childId, 
        saveData, 
        'enrollment', 
        getAccessTokenSilently,
        onSubmitSuccess
      );
      
      if (success) {
        console.log('✅ Enrollment form saved and dashboard will refresh');
      }
    } catch (error) {
      console.error('Failed to save enrollment form:', error);
      toast.error('Error saving enrollment form data. Please try again.');
    }
  };

  const handleSubmit = async (type) => {
    if (!childId) {
      toast.error('Error: Child ID is missing');
      return;
    }

    try {
      if (type === 'parent') {
        if (!formData.parent_sign_enroll || formData.parent_sign_enroll === '') {
          toast.error('Error: Parent signature is missing');
          return;
        }

        const saveData = {
          parent_sign_enroll: formData.parent_sign_enroll,
          parent_sign_date_enroll: new Date().toLocaleDateString('en-CA')
        };

        const success = await submitAndCompleteForm(
          childId, 
          saveData, 
          'enrollment', 
          getAccessTokenSilently,
          onSubmitSuccess
        );
        
        if (success) {
          console.log('✅ Enrollment parent signature submitted and dashboard will refresh');
        }
      } else if (type === 'admin') {
        if (!formData.admin_sign_enroll || formData.admin_sign_enroll === '') {
          toast.error('Error: Admin signature is missing');
          return;
        }

        const epochValue = new Date(formData.admin_sign_date_enroll).getTime();
        const saveData = {
          point_one_field_one: formData.point_one_field_one,
          point_one_field_three: formData.point_one_field_three,
          point_two_initial_here: formData.point_two_initial_here,
          point_three_initial_here: formData.point_three_initial_here,
          point_four_initial_here: formData.point_four_initial_here,
          point_five_initial_here: formData.point_five_initial_here,
          point_six_initial_here: formData.point_six_initial_here,
          point_seven_initial_here: formData.point_seven_initial_here,
          point_eight_initial_here: formData.point_eight_initial_here,
          point_nine_initial_here: formData.point_nine_initial_here,
          point_ten_initial_here: formData.point_ten_initial_here,
          point_eleven_initial_here: formData.point_eleven_initial_here,
          point_twelve_initial_here: formData.point_twelve_initial_here,
          point_thirteen_initial_here: formData.point_thirteen_initial_here,
          point_fourteen_initial_here: formData.point_fourteen_initial_here,
          point_fifteen_initial_here: formData.point_fifteen_initial_here,
          point_sixteen_initial_here: formData.point_sixteen_initial_here,
          point_seventeen_initial_here: formData.point_seventeen_initial_here,
          point_eighteen_initial_here: formData.point_eighteen_initial_here,
          point_ninteen_initial_here: formData.point_ninteen_initial_here,
          preferred_start_date: formData.preferred_start_date,
          preferred_schedule: formData.preferred_schedule,
          full_day: formData.full_day.toString(),
          half_day: formData.half_day.toString(),
          parent_sign_enroll: formData.parent_sign_enroll,
          parent_sign_date_enroll: formData.parent_sign_date_enroll,
          admin_sign_enroll: formData.admin_sign_enroll,
          admin_sign_date_enroll: epochValue
        };

        const success = await submitAndCompleteForm(
          childId, 
          saveData, 
          'enrollment', 
          getAccessTokenSilently,
          onSubmitSuccess
        );
        
        if (success) {
          console.log('✅ Enrollment admin signature submitted and dashboard will refresh');
        }
      }
    } catch (error) {
      console.error('Failed to save form:', error);
      toast.error('Error saving form data. Please try again.');
    }
  };

  useEffect(() => {
    if (initialFormData) {
      setFormData(prevState => ({
        ...prevState,
        ...initialFormData
      }));
    }
  }, [initialFormData]);

  // Holiday schedule data for 2025
  const holidays2025 = [
    { date: "January 1, 2025", reason: "New Year's Day" },
    { date: "February 17, 2025", reason: "Faculty Development Day" },
    { date: "March 7, 2025", reason: "Parent-Teacher Conferences" },
    { date: "April 18, 2025", reason: "Spring Break" },
    { date: "May 26, 2025", reason: "Memorial Day" },
    { date: "June 20, 2025", reason: "Faculty Development Day" },
    { date: "July 4, 2025", reason: "Independence Day" },
    { date: "August 28 & 29, 2025", reason: "2-Day Faculty Development" },
    { date: "September 1, 2025", reason: "Labor Day" },
    { date: "November 11, 2025", reason: "Parent-Teacher Conferences" },
    { date: "November 26, 2025", reason: "Closing @12:30pm" },
    { date: "November 27 & 28, 2025", reason: "Thanksgiving Break" },
    { date: "December 24 – 31, 2025", reason: "Closed for Holidays" }
  ];

  // Holiday schedule data for 2026
  const holidays2026 = [
    { date: "January 1, 2026", reason: "New Year's Day Observance" },
    { date: "January 2, 2026", reason: "Faculty Development Day" },
    { date: "March 6, 2026", reason: "Parent-Teacher Conferences" },
    { date: "April 17, 2026", reason: "Spring Break" },
    { date: "May 25, 2026", reason: "Memorial Day" },
    { date: "June 19, 2026", reason: "Faculty Development Day" },
    { date: "July 3, 2026", reason: "Independence Day" },
    { date: "August 28 & 31, 2026", reason: "2-Day Faculty Development" },
    { date: "September 7, 2026", reason: "Labor Day" },
    { date: "November 11, 2026", reason: "Parent-Teacher Conferences" },
    { date: "November 25, 2026", reason: "Closing @12:30pm" },
    { date: "November 26 & 27, 2026", reason: "Thanksgiving Break" },
    { date: "December 24 – 31, 2026", reason: "Closed for Holidays" }
  ];

  // Calculate progress
  const initialsComplete = [
    formData.point_two_initial_here,
    formData.point_three_initial_here,
    formData.point_four_initial_here,
    formData.point_five_initial_here,
    formData.point_six_initial_here,
    formData.point_seven_initial_here,
    formData.point_eight_initial_here,
    formData.point_nine_initial_here,
    formData.point_ten_initial_here,
    formData.point_eleven_initial_here,
    formData.point_twelve_initial_here,
    formData.point_thirteen_initial_here,
    formData.point_fourteen_initial_here,
    formData.point_fifteen_initial_here,
    formData.point_sixteen_initial_here,
    formData.point_seventeen_initial_here,
    formData.point_eighteen_initial_here,
    formData.point_ninteen_initial_here
  ].filter(initial => initial && initial.trim() !== '').length;

  const totalInitials = 18;
  const progress = (initialsComplete / totalInitials) * 100;

  const renderEnrollmentForm = () => (
    <Card>
      <CardHeader className="bg-[#0F2D52] text-white">
        <CardTitle className="text-xl">Enrollment Agreement</CardTitle>
        <CardDescription className="text-blue-100">
          Review and initial each section of the enrollment agreement
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        {/* Progress indicator */}
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Progress</span>
            <span className="text-sm font-medium text-[#0F2D52]">
              {initialsComplete} of {totalInitials} sections initialed
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Agreement Header */}
        <div className="space-y-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-lg mb-4 text-[#0F2D52]">1. Agreement Details</h3>
            <div className="text-sm space-y-2">
              <p>
                This Enrollment Agreement (the "Agreement"), effective (today's date){' '}
                <Input
                  type="date"
                  name="point_one_field_one"
                  value={formData.point_one_field_one}
                  onChange={handleChange}
                  className="inline-block w-40 mx-1"
                />{' '}
                is between Cool Kidz LLC dba The Goddard School, an independent franchisee operating The Goddard School® located at 4200 228th Ave NE, Redmond, WA pursuant to a license from Goddard Systems, Inc., and{' '}
                <Input
                  type="text"
                  name="point_one_field_three"
                  placeholder="Parent/Guardian Name"
                  value={formData.point_one_field_three}
                  onChange={handleChange}
                  className="inline-block w-48 mx-1"
                />{' '}
                ("Parents").
              </p>
            </div>
          </div>

          {/* Registration Fee */}
          <div className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h4 className="font-semibold mb-2">2. Registration Fee</h4>
                <p className="text-sm text-gray-600">
                  The School's non-refundable registration fee of $300 shall be paid annually in March and at the time of initial application. The fee is $300 for each child.
                </p>
              </div>
              <div className="ml-4 flex items-center gap-2">
                <Label className="text-sm">Initial:</Label>
                <Input
                  type="text"
                  name="point_two_initial_here"
                  value={formData.point_two_initial_here}
                  onChange={handleChange}
                  maxLength={5}
                  placeholder="Initial"
                  className="w-20 text-center"
                />
              </div>
            </div>
          </div>

          {/* New Family Enrollment */}
          <div className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h4 className="font-semibold mb-2">3. New Family Enrollment</h4>
                <p className="text-sm text-gray-600">
                  New Family Enrollment - One full month tuition and non-refundable registration fee are due at time of enrollment, along with this signed agreement. If the deposit is not paid, a place for your child cannot be guaranteed. The first month's tuition is 100% refundable 90 days before the Goddard approved start date and non-refundable thereafter.
                </p>
              </div>
              <div className="ml-4 flex items-center gap-2">
                <Label className="text-sm">Initial:</Label>
                <Input
                  type="text"
                  name="point_three_initial_here"
                  value={formData.point_three_initial_here}
                  onChange={handleChange}
                  maxLength={5}
                  placeholder="Initial"
                  className="w-20 text-center"
                />
              </div>
            </div>
          </div>

          {/* Wait-listed Families */}
          <div className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h4 className="font-semibold mb-2">4. Wait-listed Families</h4>
                <p className="text-sm text-gray-600">
                  Wait-listed Families - For being on our waitlist only the Registration fee is necessary, and it is fully refundable if we are unable to provide you with classroom placement for your desired start date.
                </p>
              </div>
              <div className="ml-4 flex items-center gap-2">
                <Label className="text-sm">Initial:</Label>
                <Input
                  type="text"
                  name="point_four_initial_here"
                  value={formData.point_four_initial_here}
                  onChange={handleChange}
                  maxLength={5}
                  placeholder="Initial"
                  className="w-20 text-center"
                />
              </div>
            </div>
          </div>

          {/* Monthly Tuition */}
          <div className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h4 className="font-semibold mb-2">5. Monthly Tuition</h4>
                <p className="text-sm text-gray-600">
                  Monthly tuition is due on or before the 1st of each month. A $50 late fee shall be charged for any monthly tuition payments received after the 1st of the month. A fee of $75 will be charged for checks returned by the school's bank. If monthly tuition fees (including any applicable late fees) are not received at the School by the 15th of the month, the child will not be readmitted to the program. If the School is compelled to take legal action for tuition payments, Parents agree to pay the School's reasonable attorneys' fees and costs incurred.
                </p>
              </div>
              <div className="ml-4 flex items-center gap-2">
                <Label className="text-sm">Initial:</Label>
                <Input
                  type="text"
                  name="point_five_initial_here"
                  value={formData.point_five_initial_here}
                  onChange={handleChange}
                  maxLength={5}
                  placeholder="Initial"
                  className="w-20 text-center"
                />
              </div>
            </div>
          </div>

          {/* Tuition Changes */}
          <div className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h4 className="font-semibold mb-2">6. Tuition Changes</h4>
                <p className="text-sm text-gray-600">
                  At the time of registration, tuition is quoted for the current rate of the classroom. Tuition is subject to change at the discretion of the school. You will receive notification of any proposed change.
                </p>
              </div>
              <div className="ml-4 flex items-center gap-2">
                <Label className="text-sm">Initial:</Label>
                <Input
                  type="text"
                  name="point_six_initial_here"
                  value={formData.point_six_initial_here}
                  onChange={handleChange}
                  maxLength={5}
                  placeholder="Initial"
                  className="w-20 text-center"
                />
              </div>
            </div>
          </div>

          {/* Non-refundable Tuition */}
          <div className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h4 className="font-semibold mb-2">7. Non-refundable Tuition</h4>
                <p className="text-sm text-gray-600">
                  Monthly tuition fees are non-refundable regardless of holidays, illness, vacation, inclement weather days or School closures resulting from causes beyond the reasonable control of the School or its management including, but not limited to pandemics, government order, public health crisis, fire, floods, civil commotions, strikes, lockouts or other labor disturbances, "Acts of God" or acts, omissions, or delays in acting by any governmental authority. The School and its management will use reasonable efforts to avoid unscheduled closures and will resume operation as soon as feasible. The School will make reasonable efforts to open in inclement weather; however, the School may choose to close at the discretion of the School's owner. Parents will be notified of any school closures via electronic communication.
                </p>
              </div>
              <div className="ml-4 flex items-center gap-2">
                <Label className="text-sm">Initial:</Label>
                <Input
                  type="text"
                  name="point_seven_initial_here"
                  value={formData.point_seven_initial_here}
                  onChange={handleChange}
                  maxLength={5}
                  placeholder="Initial"
                  className="w-20 text-center"
                />
              </div>
            </div>
          </div>

          {/* Holiday Schedule */}
          <div className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h4 className="font-semibold mb-4">8. School Closure Dates</h4>
                <p className="text-sm text-gray-600 mb-4">
                  This School is closed on the following days:
                </p>
                
                {/* Holiday Tables */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-4">
                  {/* 2025 Holidays */}
                  <div> 
                    <h5 className="font-medium text-sm mb-2 text-[#0F2D52]">2025 Schedule</h5>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-xs">Date</TableHead>
                          <TableHead className="text-xs">Reason</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {holidays2025.map((holiday, index) => (
                          <TableRow key={index}>
                            <TableCell className="text-xs py-1">{holiday.date}</TableCell>
                            <TableCell className="text-xs py-1">{holiday.reason}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  {/* 2026 Holidays */}
                  <div>
                    <h5 className="font-medium text-sm mb-2 text-[#0F2D52]">2026 Schedule</h5>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-xs">Date</TableHead>
                          <TableHead className="text-xs">Reason</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {holidays2026.map((holiday, index) => (
                          <TableRow key={index}>
                            <TableCell className="text-xs py-1">{holiday.date}</TableCell>
                            <TableCell className="text-xs py-1">{holiday.reason}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>

                <p className="text-xs text-gray-500 italic">
                  *We reserve the right to adjust hours and closures depending on the needs of the school. We will provide at least 24 hours' notice of changes, should anything be necessary.
                </p>
              </div>
              <div className="ml-4 flex items-center gap-2">
                <Label className="text-sm">Initial:</Label>
                <Input
                  type="text"
                  name="point_eight_initial_here"
                  value={formData.point_eight_initial_here}
                  onChange={handleChange}
                  maxLength={5}
                  placeholder="Initial"
                  className="w-20 text-center"
                />
              </div>
            </div>
          </div>

          {/* Year-Round Program */}
          <div className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h4 className="font-semibold mb-2">9. Year-Round Program</h4>
                <p className="text-sm text-gray-600">
                  The Goddard School is a year-round program. Tuition is payable for all 12 months unless withdrawing from enrollment.
                </p>
              </div>
              <div className="ml-4 flex items-center gap-2">
                <Label className="text-sm">Initial:</Label>
                <Input
                  type="text"
                  name="point_nine_initial_here"
                  value={formData.point_nine_initial_here}
                  onChange={handleChange}
                  maxLength={5}
                  placeholder="Initial"
                  className="w-20 text-center"
                />
              </div>
            </div>
          </div>

          {/* School Hours and Late Fees */}
          <div className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h4 className="font-semibold mb-2">10. School Hours and Late Fees</h4>
                <p className="text-sm text-gray-600">
                  The School will open at 7:00am and close at 6:00pm (from September), however modified school hours may apply in case of any unforeseen circumstances. A fee will be charged for any child not picked up before the School's regular closing time. Full day student late fees begin at 6:01pm. Half Day student late fees begin at 12:46pm. This charge shall be $35 per child for the first 5 minutes and an additional $25 per child per 5-minute period thereafter. Fees for late pick-up are added to tuition; if not paid, the child will not be readmitted to the program. Consistent lateness will be cause for the child's dismissal from the School. Arrival time at school should be no later than 10am without prior approval or notification.
                </p>
              </div>
              <div className="ml-4 flex items-center gap-2">
                <Label className="text-sm">Initial:</Label>
                <Input
                  type="text"
                  name="point_ten_initial_here"
                  value={formData.point_ten_initial_here}
                  onChange={handleChange}
                  maxLength={5}
                  placeholder="Initial"
                  className="w-20 text-center"
                />
              </div>
            </div>
          </div>

          {/* 10-Hour Limit */}
          <div className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h4 className="font-semibold mb-2">11. 10-Hour Daily Limit</h4>
                <p className="text-sm text-gray-600">
                  Our School limits each students day to a maximum of 10 hours. If this 10-hour limit is exceeded a fee of $50 will be charged.
                </p>
              </div>
              <div className="ml-4 flex items-center gap-2">
                <Label className="text-sm">Initial:</Label>
                <Input
                  type="text"
                  name="point_eleven_initial_here"
                  value={formData.point_eleven_initial_here}
                  onChange={handleChange}
                  maxLength={5}
                  placeholder="Initial"
                  className="w-20 text-center"
                />
              </div>
            </div>
          </div>

          {/* Withdrawal Notice */}
          <div className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h4 className="font-semibold mb-2">12. Withdrawal Notice</h4>
                <p className="text-sm text-gray-600">
                  For children over the age of one year, the School requires a minimum of 30-day written notice of withdrawal, and for infants, a minimum of 60-day written notice. Furthermore, the last day must be the end of the month. If no advance notice of withdrawal is provided, the regular tuition fee for that term will be charged.
                </p>
              </div>
              <div className="ml-4 flex items-center gap-2">
                <Label className="text-sm">Initial:</Label>
                <Input
                  type="text"
                  name="point_twelve_initial_here"
                  value={formData.point_twelve_initial_here}
                  onChange={handleChange}
                  maxLength={5}
                  placeholder="Initial"
                  className="w-20 text-center"
                />
              </div>
            </div>
          </div>

          {/* School's Right to Deny/Cancel */}
          <div className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h4 className="font-semibold mb-2">13. School's Right to Deny/Cancel Enrollment</h4>
                <p className="text-sm text-gray-600">
                  The School reserves the right to deny, cancel, sever, or suspend a child's enrollment at any time if the School, in its sole discretion, deems such action to be in the best interest of the child or the School. This should be recorded in an email and in such an event, any unused tuition will be refunded, and no notice period required.
                </p>
              </div>
              <div className="ml-4 flex items-center gap-2">
                <Label className="text-sm">Initial:</Label>
                <Input
                  type="text"
                  name="point_thirteen_initial_here"
                  value={formData.point_thirteen_initial_here}
                  onChange={handleChange}
                  maxLength={5}
                  placeholder="Initial"
                  className="w-20 text-center"
                />
              </div>
            </div>
          </div>

          {/* Illness Policy */}
          <div className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h4 className="font-semibold mb-2">14. Illness Policy</h4>
                <p className="text-sm text-gray-600">
                  Children may not attend School while ill. Children who become ill at school must be picked up immediately – refer to the Parent Handbook health policy and King County Department of Health requirements. If the child will be absent, the absence should be reported to the School by 9 am.
                </p>
              </div>
              <div className="ml-4 flex items-center gap-2">
                <Label className="text-sm">Initial:</Label>
                <Input
                  type="text"
                  name="point_fourteen_initial_here"
                  value={formData.point_fourteen_initial_here}
                  onChange={handleChange}
                  maxLength={5}
                  placeholder="Initial"
                  className="w-20 text-center"
                />
              </div>
            </div>
          </div>

          {/* Immunization Requirements */}
          <div className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h4 className="font-semibold mb-2">15. Immunization Requirements</h4>
                <p className="text-sm text-gray-600">
                  Each child in our childcare facility will be required to have current and up to date immunizations throughout their time in our facility.
                </p>
              </div>
              <div className="ml-4 flex items-center gap-2">
                <Label className="text-sm">Initial:</Label>
                <Input
                  type="text"
                  name="point_fifteen_initial_here"
                  value={formData.point_fifteen_initial_here}
                  onChange={handleChange}
                  maxLength={5}
                  placeholder="Initial"
                  className="w-20 text-center"
                />
              </div>
            </div>
          </div>

          {/* Medical Conditions */}
          <div className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h4 className="font-semibold mb-2">16. Medical Conditions</h4>
                <p className="text-sm text-gray-600">
                  If your student has an allergy, asthma or a medical condition that requires medication, we are required to meet state licensing standards regarding the medication and paperwork. All paperwork MUST be complete prior to enrollment. This includes maintaining unexpired medications and paperwork while enrolled at The Goddard School.
                </p>
              </div>
              <div className="ml-4 flex items-center gap-2">
                <Label className="text-sm">Initial:</Label>
                <Input
                  type="text"
                  name="point_sixteen_initial_here"
                  value={formData.point_sixteen_initial_here}
                  onChange={handleChange}
                  maxLength={5}
                  placeholder="Initial"
                  className="w-20 text-center"
                />
              </div>
            </div>
          </div>

          {/* GSI Access */}
          <div className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h4 className="font-semibold mb-2">17. GSI Access to Files</h4>
                <p className="text-sm text-gray-600">
                  Parents acknowledge and agree that representatives of the School's franchisor, Goddard Systems, Inc. ("GSI") will have access to information in children's files as part of GSI's Quality Assurance reviews and otherwise.
                </p>
              </div>
              <div className="ml-4 flex items-center gap-2">
                <Label className="text-sm">Initial:</Label>
                <Input
                  type="text"
                  name="point_seventeen_initial_here"
                  value={formData.point_seventeen_initial_here}
                  onChange={handleChange}
                  maxLength={5}
                  placeholder="Initial"
                  className="w-20 text-center"
                />
              </div>
            </div>
          </div>

          {/* Employee Hiring */}
          <div className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h4 className="font-semibold mb-2">18. Employee Hiring</h4>
                <p className="text-sm text-gray-600">
                  The School's employees are its most important assets. If Parents hire an employee of the School or a former employee (within 6 months of his/her employment at the School) for at least 20 hours per week, Parents agree to pay the School a placement fee of $10,000, payable upon hiring.
                </p>
              </div>
              <div className="ml-4 flex items-center gap-2">
                <Label className="text-sm">Initial:</Label>
                <Input
                  type="text"
                  name="point_eighteen_initial_here"
                  value={formData.point_eighteen_initial_here}
                  onChange={handleChange}
                  maxLength={5}
                  placeholder="Initial"
                  className="w-20 text-center"
                />
              </div>
            </div>
          </div>

          {/* Outside Engagements */}
          <div className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h4 className="font-semibold mb-2">19. Outside Engagements</h4>
                <p className="text-sm text-gray-600">
                  Parents agree that Outside Engagements are not for the benefit or convenience of the School, its owners or GSI, and Parents hereby irrevocably release and discharge the School, GSI, and their respective present or former owners, employees, officers, directors, agents, parents, subsidiaries, affiliates, heirs, successors and assigns, in their individual and corporate capacities from all claims, demands, liabilities, actions or causes of action whatsoever, arising in law or equity, whether known or unknown, which Parents have, may have or claim to have at any time in the future against the Releases based in whole or in part on, arising out of or related to any Outside Engagements.
                </p>
              </div>
              <div className="ml-4 flex items-center gap-2">
                <Label className="text-sm">Initial:</Label>
                <Input
                  type="text"
                  name="point_ninteen_initial_here"
                  value={formData.point_ninteen_initial_here}
                  onChange={handleChange}
                  maxLength={5}
                  placeholder="Initial"
                  className="w-20 text-center"
                />
              </div>
            </div>
          </div>

          {/* Schedule Preferences */}
          <div className="bg-blue-50 rounded-lg p-4 space-y-4">
            <h4 className="font-semibold text-[#0F2D52]">Schedule Preferences</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="preferred_start_date">Preferred Start Date</Label>
                <Input
                  type="date"
                  id="preferred_start_date"
                  name="preferred_start_date"
                  value={formData.preferred_start_date}
                  onChange={handleChange}
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="preferred_schedule">Preferred Schedule</Label>
                <Select 
                  value={formData.preferred_schedule}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, preferred_schedule: value }))}
                >
                  <SelectTrigger id="preferred_schedule">
                    <SelectValue placeholder="Select schedule" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="two_days">2 Days</SelectItem>
                    <SelectItem value="three_days">3 Days</SelectItem>
                    <SelectItem value="five_days">5 Days</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex gap-6">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="full_day"
                  checked={formData.full_day}
                  onCheckedChange={(checked) => 
                    setFormData(prev => ({ ...prev, full_day: checked }))
                  }
                />
                <Label htmlFor="full_day" className="font-medium">Full-Day</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="half_day"
                  checked={formData.half_day}
                  onCheckedChange={(checked) => 
                    setFormData(prev => ({ ...prev, half_day: checked }))
                  }
                />
                <Label htmlFor="half_day" className="font-medium">Half-Day</Label>
              </div>
            </div>
          </div>

          {/* Final Agreement Text */}
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              The undersigned Parents have received an executed copy of this Agreement and a copy of the Parent Handbook, which includes the school policies and health policy referenced in paragraph 14 and 15. Parents acknowledge that this Agreement is by and between Parents and Cool Kidz LLC d/b/a The Goddard School; GSI is not a party to this Agreement. The undersigned Parents understand the terms of this Agreement and agree to be bound by them.
            </AlertDescription>
          </Alert>

          {/* Save Button */}
          <div className="flex justify-center pt-4">
            <Button 
              onClick={handleSave}
              className="bg-[#0F2D52] hover:bg-[#0F2D52]/90"
              size="lg"
            >
              <Save className="h-4 w-4 mr-2" />
              Save Enrollment Agreement
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderParentSignatureForm = () => {
    if (!areEnrollmentPrerequisitesComplete()) {
      return (
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Lock className="h-12 w-12 text-red-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-700 mb-2">Complete Enrollment Agreement First</h3>
              <p className="text-gray-500 mb-4">Please complete the Enrollment Agreement before accessing the Parent Signature section.</p>
            </div>
          </CardContent>
        </Card>
      );
    }
    return (
      <Card>
        <CardHeader className="bg-[#0F2D52] text-white">
          <CardTitle className="text-xl">Parent Signature</CardTitle>
          <CardDescription className="text-blue-100">
            Parent agreement and authorization
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="parent_sign_enroll">Parent Signature</Label>
            <Input
              type="text"
              id="parent_sign_enroll"
              name="parent_sign_enroll"
              placeholder="Type your full name as signature"
              value={formData.parent_sign_enroll}
              onChange={handleChange}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="parent_sign_date_enroll">Date</Label>
            <Input
              type="date"
              id="parent_sign_date_enroll"
              name="parent_sign_date_enroll"
              value={formData.parent_sign_date_enroll || new Date().toISOString().split('T')[0]}
              onChange={handleChange}
              className="w-full"
              readOnly
            />
          </div>
        </div>

        <Alert className="mt-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            By providing your signature above, you acknowledge that you have read, understood, and agree to all terms and conditions in this enrollment agreement.
          </AlertDescription>
        </Alert>

        <div className="flex justify-center mt-6">
          <Button
            onClick={() => handleSubmit('parent')}
            className="bg-[#0F2D52] hover:bg-[#0F2D52]/90"
            size="lg"
            disabled={!formData.parent_sign_enroll}
          >
            <Send className="h-4 w-4 mr-2" />
            Submit Parent Signature
          </Button>
        </div>
      </CardContent>
    </Card>
    );
  };

  const renderAdminSignatureForm = () => {
    if (!isAdmin) {
      return (
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Lock className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-700 mb-2">Admin Access Required</h3>
              <p className="text-gray-500">This section is only accessible to administrators.</p>
            </div>
          </CardContent>
        </Card>
      );
    }
    if (!areEnrollmentPrerequisitesComplete()) {
      return (
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Lock className="h-12 w-12 text-red-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-700 mb-2">Complete Enrollment Agreement First</h3>
              <p className="text-gray-500 mb-4">Please complete the Enrollment Agreement before accessing the Admin Signature section.</p>
            </div>
          </CardContent>
        </Card>
      );
    }
    return (
      <Card>
        <CardHeader className="bg-[#0F2D52] text-white">
          <CardTitle className="text-xl">Admin Signature</CardTitle>
          <CardDescription className="text-blue-100">
            Administrative approval and verification
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="admin_sign_enroll">Admin Signature</Label>
            <Input
              type="text"
              id="admin_sign_enroll"
              name="admin_sign_enroll"
              placeholder="Type admin name as signature"
              value={formData.admin_sign_enroll}
              onChange={handleChange}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="admin_sign_date_enroll">Date & Time</Label>
            <Input
              type="datetime-local"
              id="admin_sign_date_enroll"
              name="admin_sign_date_enroll"
              value={formData.admin_sign_date_enroll}
              onChange={handleChange}
              className="w-full"
            />
          </div>
        </div>

        <Alert className="mt-6" variant="default">
          <Shield className="h-4 w-4" />
          <AlertDescription>
            This signature confirms administrative review and approval of the enrollment agreement and all associated documentation.
          </AlertDescription>
        </Alert>

        <div className="flex justify-center mt-6">
          <Button
            onClick={() => handleSubmit('admin')}
            className="bg-[#0F2D52] hover:bg-[#0F2D52]/90"
            size="lg"
            disabled={!formData.admin_sign_enroll || !formData.admin_sign_date_enroll}
          >
            <Send className="h-4 w-4 mr-2" />
            Submit Admin Approval
          </Button>
        </div>
      </CardContent>
    </Card>
    );
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <Toaster richColors position="top-center" />
      
      {/* Tab Navigation */}
      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="enrollment" className="flex items-center gap-2">
            <ScrollText className="h-4 w-4" />
            <span className="hidden sm:inline">Enrollment Agreement</span>
            <span className="sm:hidden">Agreement</span>
          </TabsTrigger>
          <TabsTrigger 
            value="parent" 
            className={`flex items-center gap-2 ${
              !areEnrollmentPrerequisitesComplete() ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            disabled={!areEnrollmentPrerequisitesComplete()}
            title={!areEnrollmentPrerequisitesComplete() ? "Complete Enrollment Agreement before accessing Parent Signature" : ""}
          >
            <User className="h-4 w-4" />
            <span className="hidden sm:inline">Parent Signature</span>
            <span className="sm:hidden">Parent</span>
            {!areEnrollmentPrerequisitesComplete() && (
              <Lock className="h-3 w-3 text-red-500" />
            )}
          </TabsTrigger>
          <TabsTrigger 
            value="admin" 
            className={`flex items-center gap-2 ${
              (!isAdmin || !areEnrollmentPrerequisitesComplete()) ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            disabled={!isAdmin || !areEnrollmentPrerequisitesComplete()}
            title={
              !isAdmin ? "Only admin users can access Admin Signature" :
              !areEnrollmentPrerequisitesComplete() ? "Complete Enrollment Agreement before accessing Admin Signature" : ""
            }
          >
            <Shield className="h-4 w-4" />
            <span className="hidden sm:inline">Admin Signature</span>
            <span className="sm:hidden">Admin</span>
            {!isAdmin && (
              <Lock className="h-3 w-3 text-gray-500" />
            )}
            {isAdmin && !areEnrollmentPrerequisitesComplete() && (
              <Lock className="h-3 w-3 text-red-500" />
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="enrollment">
          {renderEnrollmentForm()}
        </TabsContent>
        
        <TabsContent value="parent">
          {renderParentSignatureForm()}
        </TabsContent>
        
        <TabsContent value="admin">
          {renderAdminSignatureForm()}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EnrollmentFormNew;