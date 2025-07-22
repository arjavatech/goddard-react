import React, { useState, useEffect } from 'react';
import FormInput from '../../FormInput';
import FormLabel from '../../FormLabel';

const EnrollmentForm = ({ formData, childId, editID, onAlert }) => {
  const [formState, setFormState] = useState({
    point_one_field_one: '',
    point_one_field_two: '',
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
    point_ninteen_initial_here: '',
    preferred_start_date: '',
    preferred_schedule: '',
    full_day: false,
    half_day: false,
    parent_sign_enroll: '',
    parent_sign_date_enroll: ''
  });

  useEffect(() => {
    if (formData) {
      setFormState(prevState => ({
        ...prevState,
        ...formData,
        point_one_field_one: formData.point_one_field_one || new Date().toISOString().split('T')[0]
      }));
    }
  }, [formData]);

  const handleInputChange = (field, value) => {
    setFormState(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleCheckboxChange = (field, checked) => {
    setFormState(prev => ({
      ...prev,
      [field]: checked
    }));
  };

  const handleSubmit = async (pointer = 28) => {
    try {
      const outputObject = {
        primary_parent_email: editID || localStorage.getItem('logged_in_email'),
        child_id: childId,
        pointer,
        form_year_enroll: new Date().getFullYear().toString(),
        admin_sign_date_enroll: formState.admin_sign_date_enroll ? 
          new Date(formState.admin_sign_date_enroll).getTime() : 
          new Date().getTime(),
        ...formState,
        full_day: formState.full_day ? 'on' : '',
        half_day: formState.half_day ? 'on' : ''
      };

      const apiResponse = await fetch(
        `https://v2bvjzsgrk.execute-api.ap-south-1.amazonaws.com/test/enrollment_form/update/${childId}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(outputObject)
        }
      );

      if (apiResponse.ok) {
        onAlert('success', 'Enrollment form saved successfully!');
        setTimeout(() => {
          sessionStorage.setItem('putcallId', childId);
          window.location.href = `./parent_dashboard.html?id=${editID}`;
        }, 3000);
      } else {
        onAlert('error', 'Failed to save enrollment form!');
      }
    } catch (error) {
      // console.error('Error submitting enrollment form:', error);
      onAlert('error', 'Failed to save enrollment form!');
    }
  };

  return (
    <div className="p-6">
      <h3 className="text-2xl font-bold text-[#0F2D52] mb-6">Enrollment Agreement Form</h3>
      
      <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
        {/* Agreement Points Section */}
        <div className="bg-gray-50 p-4 rounded mb-6">
          <h4 className="text-lg font-semibold mb-4 text-[#0F2D52]">Agreement Points</h4>
          <p className="text-sm text-gray-600 mb-4">Please initial each point to indicate your agreement:</p>
          
          <div className="space-y-4">
            {[
              { key: 'point_two_initial_here', text: 'I understand the enrollment policies' },
              { key: 'point_three_initial_here', text: 'I agree to the tuition and fee structure' },
              { key: 'point_four_initial_here', text: 'I understand the withdrawal policy' },
              { key: 'point_five_initial_here', text: 'I agree to the health and safety requirements' },
              { key: 'point_six_initial_here', text: 'I understand the discipline policy' },
              { key: 'point_seven_initial_here', text: 'I agree to the communication procedures' },
              { key: 'point_eight_initial_here', text: 'I understand the emergency procedures' },
              { key: 'point_nine_initial_here', text: 'I agree to the field trip policy' },
              { key: 'point_ten_initial_here', text: 'I understand the holiday schedule' }
            ].map((point, index) => (
              <div key={point.key} className="flex items-center gap-4">
                <span className="text-sm font-medium w-8">{index + 2}.</span>
                <span className="flex-1 text-sm">{point.text}</span>
                <div className="w-20">
                  <FormInput
                    id={point.key}
                    name={point.key}
                    value={formState[point.key]}
                    onChange={(e) => handleInputChange(point.key, e.target.value)}
                    placeholder="Initial"
                    className="text-center"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Schedule Preferences */}
        <div className="bg-gray-50 p-4 rounded mb-6">
          <h4 className="text-lg font-semibold mb-4 text-[#0F2D52]">Schedule Preferences</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <FormLabel htmlFor="preferred_start_date" required>Preferred Start Date</FormLabel>
              <FormInput
                id="preferred_start_date"
                name="preferred_start_date"
                type="date"
                value={formState.preferred_start_date}
                onChange={(e) => handleInputChange('preferred_start_date', e.target.value)}
                required
              />
            </div>
            
            <div>
              <FormLabel htmlFor="preferred_schedule" required>Preferred Schedule</FormLabel>
              <select
                id="preferred_schedule"
                name="preferred_schedule"
                value={formState.preferred_schedule}
                onChange={(e) => handleInputChange('preferred_schedule', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#0F2D52]"
                required
              >
                <option value="">Select Schedule</option>
                <option value="full_time">Full Time</option>
                <option value="part_time">Part Time</option>
                <option value="drop_in">Drop In</option>
              </select>
            </div>
          </div>

          <div className="mt-4">
            <FormLabel>Schedule Type</FormLabel>
            <div className="flex gap-4 mt-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="full_day"
                  checked={formState.full_day}
                  onChange={(e) => handleCheckboxChange('full_day', e.target.checked)}
                  className="mr-2"
                />
                Full Day
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="half_day"
                  checked={formState.half_day}
                  onChange={(e) => handleCheckboxChange('half_day', e.target.checked)}
                  className="mr-2"
                />
                Half Day
              </label>
            </div>
          </div>
        </div>

        {/* Signature Section */}
        <div className="bg-gray-50 p-4 rounded mb-6">
          <h4 className="text-lg font-semibold mb-4 text-[#0F2D52]">Parent Signature</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <FormLabel htmlFor="parent_sign_enroll" required>Parent Signature</FormLabel>
              <FormInput
                id="parent_sign_enroll"
                name="parent_sign_enroll"
                value={formState.parent_sign_enroll}
                onChange={(e) => handleInputChange('parent_sign_enroll', e.target.value)}
                required
              />
            </div>
            
            <div>
              <FormLabel htmlFor="parent_sign_date_enroll" required>Date</FormLabel>
              <FormInput
                id="parent_sign_date_enroll"
                name="parent_sign_date_enroll"
                type="date"
                value={formState.parent_sign_date_enroll || new Date().toISOString().split('T')[0]}
                onChange={(e) => handleInputChange('parent_sign_date_enroll', e.target.value)}
                required
              />
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-6 py-2 bg-[#0F2D52] text-white rounded hover:opacity-80"
          >
            Save & Submit
          </button>
        </div>
      </form>
    </div>
  );
};

export default EnrollmentForm;