import React from 'react';
import{ useState, useEffect } from 'react';

const EnrollmentForm = ({ selectedSubForm = null, initialFormData = null }) => {
    const [formData, setFormData] = useState({
      point_one_field_one : new Date().toISOString().split('T')[0],
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
  
    const handleChange = (e) => {
      const { name, value, type, checked } = e.target;
      setFormData(prevState => ({
        ...prevState,
        [name]: type === 'checkbox' ? checked : value
      }));
    };
  
    const handleSave = () => {
      // Handle save functionality
      // console.log('Saving form data:', formData);
    };
  
    const handleSubmit = (type) => {
      // Handle submit functionality
      // console.log(`Submitting ${type} form data:`, formData);
    };

    useEffect(() => {
      if (initialFormData) {
        setFormData(prevState => ({
          ...prevState,
          ...initialFormData
        }));
      }
    }, [initialFormData]);

  const containerStyle = {
    fontFamily: 'Arial, sans-serif',
  };

  const initila_here = {
    display: "block",
    marginBottom : "50px",
    fontFamily: "oboto, sans-serif"
};

  const cardStyle = {
    border: '1px solid #ddd',
    borderRadius: '0px 8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    padding: '15px',
    backgroundColor: '#fff',
  };

  const titleBgStyle = {
    backgroundColor: '#0056b3', // Updated to blue color for headers
    padding: '10px',
    borderRadius: '5px',
    color: '#fff', // White text for better contrast
    margin: '10px 0',
  };

  const overallBlockStyle = {
    padding: '15px',
  };

  const spinnerStyle = {
    border: '4px solid rgba(0, 0, 0, 0.1)',
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    borderLeft: '4px solid #09f',
    animation: 'spin 1s linear infinite',
    display: 'none', // Hide the spinner by default
  };

  const inputBoxStyle = {
    padding: '8px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    margin: '5px 0',
    width: '100%',
  };

  const initialHereStyle = {
    display: 'block',
    marginBottom: '10px',
  };

  const tableStyle = {
    width: '100%',
    borderCollapse: 'collapse',
  };

   const thhStyle = {
    textAlign: 'left',
  };

  const thStyle = {
    backgroundColor: '#f2f2f2',
    padding: '8px',
    textAlign: 'left',
    border: '1px solid #ddd',
  };

  const tdStyle = {
    backgroundColor: "#D8E9FF",
    padding: '8px',
    border: '1px solid #ddd',
  };

  const formGroupStyle = {
    marginBottom: '15px',
  };

  const formLabelStyle = {
    display: 'block',
    marginBottom: '5px',
    fontWeight: 'bold',
  };

  const formControlStyle = {
    display: 'block',
    width: '100%',
    padding: '0.375rem 0.75rem',
    fontSize: '1rem',
    lineHeight: '1.5',
    color: '#495057',
    backgroundColor: '#fff',
    backgroundClip: 'padding-box',
    border: '1px solid #ced4da',
    borderRadius: '0.25rem',
    transition: 'border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out',
  };

  const checkboxStyle = {
    marginRight: '5px',
  };

  const buttonStyle = {
    backgroundColor: '#28a745', // Green color for buttons
    color: 'white',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '16px',
    margin: '10px',
    fontWeight: 'bold',
  };

  const rowStyle = {
    display: 'flex',
    flexWrap: 'wrap',
    margin: '0 -15px',
  };

  const colStyle = {
    flex: '0 0 50%',
    maxWidth: '50%',
    padding: '0 15px',
  };

  const flexCenterStyle = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '5px',
  };

  // Function to determine which sub-form to show
  const getSubFormToShow = () => {
    if (!selectedSubForm) {
      return 'ach'; // Show first form (ACH) by default instead of 'all'
    }
    
    switch (selectedSubForm.toLowerCase()) {
      case 'enrollment agreement':
        return 'enrollment';
      case 'parent signature':
        return 'parent';
      case 'admin signature':
        return 'admin';
      default:
        return 'enrollment'; // Default to first form
    }
  };

  const currentSubForm = getSubFormToShow();


// Admin Signature Form Component
  const renderEnrollmentForm = () => (
      <div id="childenrollmentagreement" style={containerStyle}>
        <h2 className="text-center bg-[#0F2D52] text-white p-3 rounded-t">Enrollment Agreement</h2>
        <div style={cardStyle}>
          
          <div style={overallBlockStyle}>
            <span id="heading" name="heading"></span>
            <div id="spinner" style={spinnerStyle}></div>
            <ol start={1}>
              <br />
              <span id="apiResponsep1" name="apiResponsep1">
                <li>
                 This Enrollment Agreement (the "Agreement"), effective (today's date){' '}
                  <input
                    id="point_one_field_one"
                    name="point_one_field_one"
                    value={formData.point_one_field_one}
                    onChange={handleChange}
                    type="date"
                    style={{
                      padding: '4px 8px',
                      border: '1px solid #ccc',
                      borderRadius: '4px',
                      width: '200px' // or auto if you prefer
                    }}
                  />{' '}
                  is between Cool Kidz LLC dba The Goddard School, an independent franchisee operating The Goddard School® located at 4200 228th Ave NE, Redmond, WA pursuant to a license from Goddard Systems, Inc., and{' '}
                  <input
                    id="point_one_field_three"
                    name="point_one_field_three"
                    value={formData.point_one_field_three}
                    onChange={handleChange}
                    type="text"
                    style={{
                      padding: '4px 8px',
                      border: '1px solid #ccc',
                      borderRadius: '4px',
                      width: '200px' // or auto if you prefer
                    }}
                  />{' '}
                  ("Parents").
                </li>
              </span>
              <br />

              <div style={{ display: 'flex', justifyContent: 'flex-end', margin: '8px 0' }}>
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px', // optional spacing between text and input
                    margin: '8px 0'
                  }}
                >
                  <b>Initial here</b>
                  <input
                    id="point_two_initial_here"
                    name="point_two_initial_here"
                    value={formData.point_two_initial_here}
                    onChange={handleChange}
                    type="text"
                    style={{
                      padding: '4px 8px',
                      border: '1px solid #ccc',
                      borderRadius: '4px',
                      width: '200px' // or auto if you prefer
                    }}
                  />
                </span>
              </div>
                
              <span id="apiResponsep2" name="apiResponsep2">
                <li>
                  The School's non-refundable registration fee of $300 shall be paid annually in March and at the time of initial application. The fee is $300 for each child.
                </li>
              </span>
              <br/>

              <div style={{ display: 'flex', justifyContent: 'flex-end', margin: '8px 0' }}>
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px', // optional spacing between text and input
                    margin: '8px 0'
                  }}
                >
                  <b>Initial here</b>
                  <input
                    id="point_three_initial_here"
                    name="point_three_initial_here"
                    value={formData.point_three_initial_here}
                    onChange={handleChange}
                    type="text"
                    style={{
                      padding: '4px 8px',
                      border: '1px solid #ccc',
                      borderRadius: '4px',
                      width: '200px' // or auto if you prefer
                    }}
                  />
                </span>
              </div>
              
              
              <span id="apiResponsep3" name="apiResponsep3">
                <li>
                  New Family Enrollment - One full month tuition and non-refundable registration fee are due at time of enrollment, along with this signed agreement. If the deposit is not paid, a place for your child cannot be guaranteed. The first month's tuition is 100% refundable 90 days before the Goddard approved start date and non-refundable thereafter.
                </li>
              </span>
              <br/>

              <div style={{ display: 'flex', justifyContent: 'flex-end', margin: '8px 0' }}>
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px', // optional spacing between text and input
                    margin: '8px 0'
                  }}
                >
                  <b>Initial here</b>
                  <input
                    id="point_four_initial_here"
                    name="point_four_initial_here"
                    value={formData.point_four_initial_here}
                    onChange={handleChange}
                    type="text"
                    style={{
                      padding: '4px 8px',
                      border: '1px solid #ccc',
                      borderRadius: '4px',
                      width: '200px' // or auto if you prefer
                    }}
                  />
                </span>
              </div>
              
              <span id="apiResponsep4" name="apiResponsep4">
                <li>
                  Wait-listed Families - For being on our waitlist only the Registration fee is necessary, and it is fully refundable if we are unable to provide you with classroom placement for your desired start date.
                </li>
              </span>
              <br/>

              <div style={{ display: 'flex', justifyContent: 'flex-end', margin: '8px 0' }}>
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px', // optional spacing between text and input
                    margin: '8px 0'
                  }}
                >
                  <b>Initial here</b>
                  <input
                    id="point_five_initial_here"
                    name="point_five_initial_here"
                    value={formData.point_five_initial_here}
                    onChange={handleChange}
                    type="text"
                    style={{
                      padding: '4px 8px',
                      border: '1px solid #ccc',
                      borderRadius: '4px',
                      width: '200px' // or auto if you prefer
                    }}
                  />
                </span>
              </div>

              <span id="apiResponsep5" name="apiResponsep5">
                <li>
                  Monthly tuition is due on or before the 1st of each month. A $50 late fee shall be charged for any monthly tuition payments received after the 1st of the month. A fee of $75 will be charged for checks returned by the school's bank. If monthly tuition fees (including any applicable late fees) are not received at the School by the 15th of the month, the child will not be readmitted to the program. If the School is compelled to take legal action for tuition payments, Parents agree to pay the School's reasonable attorneys' fees and costs incurred.
                </li>
              </span>
              <br/>

              <div style={{ display: 'flex', justifyContent: 'flex-end', margin: '8px 0' }}>
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px', // optional spacing between text and input
                    margin: '8px 0'
                  }}
                >
                  <b>Initial here</b>
                  <input
                    id="point_six_initial_here"
                    name="point_six_initial_here"
                    value={formData.point_six_initial_here}
                    onChange={handleChange}
                    type="text"
                    style={{
                      padding: '4px 8px',
                      border: '1px solid #ccc',
                      borderRadius: '4px',
                      width: '200px' // or auto if you prefer
                    }}
                  />
                </span>
              </div>
              
             
              <span id="apiResponsep6" name="apiResponsep6">
                <li>
                  At the time of registration, tuition is quoted for the current rate of the classroom. Tuition is subject to change at the discretion of the school. You will receive notification of any proposed change.
                </li>
              </span>
              <br/>

              <div style={{ display: 'flex', justifyContent: 'flex-end', margin: '8px 0' }}>
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px', // optional spacing between text and input
                    margin: '8px 0'
                  }}
                >
                  <b>Initial here</b>
                  <input
                    id="point_seven_initial_here"
                    name="point_seven_initial_here"
                    value={formData.point_seven_initial_here}
                    onChange={handleChange}
                    type="text"
                    style={{
                      padding: '4px 8px',
                      border: '1px solid #ccc',
                      borderRadius: '4px',
                      width: '200px' // or auto if you prefer
                    }}
                  />
                </span>
              </div>
              
              <span id="apiResponsep7" name="apiResponsep7">
                <li>
                  Monthly tuition fees are non-refundable regardless of holidays, illness, vacation, inclement weather days or School closures resulting from causes beyond the reasonable control of the School or its management including, but not limited to pandemics, government order, public health crisis, fire, floods, civil commotions, strikes, lockouts or other labor disturbances, "Acts of God" or acts, omissions, or delays in acting by any governmental authority. The School and its management will use reasonable efforts to avoid unscheduled closures and will resume operation as soon as feasible. The School will make reasonable efforts to open in inclement weather; however, the School may choose to close at the discretion of the School's owner. Parents will be notified of any school closures via electronic communication.
                </li>
              </span>
              <br/>

              <div style={{ display: 'flex', justifyContent: 'flex-end', margin: '8px 0' }}>
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px', // optional spacing between text and input
                    margin: '8px 0'
                  }}
                >
                  <b>Initial here</b>
                  <input
                    id="point_eight_initial_here"
                    name="point_eight_initial_here"
                    value={formData.point_eight_initial_here}
                    onChange={handleChange}
                    type="text"
                    style={{
                      padding: '4px 8px',
                      border: '1px solid #ccc',
                      borderRadius: '4px',
                      width: '200px' // or auto if you prefer
                    }}
                  />
                </span>
              </div>
              
              <span id="apiResponsep8" name="apiResponsep8">
                <li>This School is closed on the following days:</li>
              </span>
              <br></br>
              <div style={rowStyle}>
                <div style={colStyle}>
                  <table style={tableStyle}>
                    <tr>
                      <th style={thhStyle}>Leave Dates</th>
                      <th style={thhStyle}>Leave Reasons</th>
                    </tr>
                    <tr>
                      <td style={tdStyle} id="R1C1">January 1, 2025</td>
                      <td style={tdStyle} id="R1C2">New Year's Day</td>
                    </tr>
                    <tr>
                      <td style={tdStyle} id="R2C1">February 17, 2025</td>
                      <td style={tdStyle} id="R2C2">Faculty Development Day</td>
                    </tr>
                    <tr>
                      <td style={tdStyle} id="R3C1">March 7, 2025</td>
                      <td style={tdStyle} id="R3C2">Parent-Teacher Conferences</td>
                    </tr>
                    <tr>
                      <td style={tdStyle} id="R4C1">April 18, 2025</td>
                      <td style={tdStyle} id="R4C2">Spring Break</td>
                    </tr>
                    <tr>
                      <td style={tdStyle} id="R5C1">May 26, 2025</td>
                      <td style={tdStyle} id="R5C2">Memorial Day</td>
                    </tr>
                    <tr>
                      <td style={tdStyle} id="R6C1">June 20, 2025</td>
                      <td style={tdStyle} id="R6C2">Faculty Development Day</td>
                    </tr>
                    <tr>
                      <td style={tdStyle} id="R7C1">July 4, 2025</td>
                      <td style={tdStyle} id="R7C2">Independence Day</td>
                    </tr>
                    <tr>
                      <td style={tdStyle} id="R8C1">August 28 & 29, 2025</td>
                      <td style={tdStyle} id="R8C2">2-Day Faculty Development</td>
                    </tr>
                    <tr>
                      <td style={tdStyle} id="R9C1">September 1, 2025</td>
                      <td style={tdStyle} id="R9C2">Labor Day</td>
                    </tr>
                    <tr>
                      <td style={tdStyle} id="R10C1">November 11, 2025</td>
                      <td style={tdStyle} id="R10C2">Parent-Teacher Conferences</td>
                    </tr>
                    <tr>
                      <td style={tdStyle} id="R101C1">November 26, 2025</td>
                      <td style={tdStyle} id="R101C2">Closing @12:30pm</td>
                    </tr>
                    <tr>
                      <td style={tdStyle} id="R102C1">November 27 & 28, 2025</td>
                      <td style={tdStyle} id="R102C2">Thanksgiving Break</td>
                    </tr>
                    <tr>
                      <td style={tdStyle} id="R103C1">December 24 – 31, 2025</td>
                      <td style={tdStyle} id="R103C2">Closed for Holidays</td>
                    </tr>
                  </table>
                </div>
                <div style={colStyle}>
                  <table style={tableStyle}>
                    <tr>
                      <th style={thhStyle}>Leave Dates</th>
                      <th style={thhStyle}>Leave Reasons</th>
                    </tr>
                    <tr>
                      <td style={tdStyle} id="R11C1">January 1, 2026</td>
                      <td style={tdStyle} id="R11C2">New Year's Day Observance</td>
                    </tr>
                    <tr>
                      <td style={tdStyle} id="R12C1">January 2, 2026</td>
                      <td style={tdStyle} id="R12C2">Faculty Development Day</td>
                    </tr>
                    <tr>
                      <td style={tdStyle} id="R13C1">March 6, 2026</td>
                      <td style={tdStyle} id="R13C2">Parent-Teacher Conferences</td>
                    </tr>
                    <tr>
                      <td style={tdStyle} id="R14C1">April 17, 2026</td>
                      <td style={tdStyle} id="R14C2">Spring Break</td>
                    </tr>
                    <tr>
                      <td style={tdStyle} id="R15C1">May 25, 2026</td>
                      <td style={tdStyle} id="R15C2">Memorial Day</td>
                    </tr>
                    <tr>
                      <td style={tdStyle} id="R16C1">June 19, 2026</td>
                      <td style={tdStyle} id="R16C2">Faculty Development Day</td>
                    </tr>
                    <tr>
                      <td style={tdStyle} id="R17C1">July 3, 2026</td>
                      <td style={tdStyle} id="R17C2">Independence Day</td>
                    </tr>
                    <tr>
                      <td style={tdStyle} id="R18C1">August 28 & 31, 2026</td>
                      <td style={tdStyle} id="R18C2">2-Day Faculty Development</td>
                    </tr>
                    <tr>
                      <td style={tdStyle} id="R19C1">September 7, 2026</td>
                      <td style={tdStyle} id="R19C2">Labor Day</td>
                    </tr>
                    <tr>
                      <td style={tdStyle} id="R20C1">November 11, 2026</td>
                      <td style={tdStyle} id="R20C2">Parent-Teacher Conferences</td>
                    </tr>
                    <tr>
                      <td style={tdStyle} id="R201C1">November 25, 2026</td>
                      <td style={tdStyle} id="R201C2">Closing @12:30pm</td>
                    </tr>
                    <tr>
                      <td style={tdStyle} id="R202C1">November 26 & 27, 2026</td>
                      <td style={tdStyle} id="R202C2">Thanksgiving Break</td>
                    </tr>
                    <tr>
                      <td style={tdStyle} id="R203C1">December 24 – 31, 2026</td>
                      <td style={tdStyle} id="R203C2">Closed for Holidays</td>
                    </tr>
                  </table>
                </div>
              </div>
              <br />
              <p style={{margin: '10px 0'}}>*We reserve the right to adjust hours and closures depending on the needs of the school. We will provide at least 24 hours' notice of changes, should anything be necessary.</p>
              <br />

              <div style={{ display: 'flex', justifyContent: 'flex-end', margin: '8px 0' }}>
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px', // optional spacing between text and input
                    margin: '8px 0'
                  }}
                >
                  <b>Initial here</b>
                  <input
                    id="point_nine_initial_here"
                    name="point_nine_initial_here"
                    value={formData.point_nine_initial_here}
                    onChange={handleChange}
                    type="text"
                    style={{
                      padding: '4px 8px',
                      border: '1px solid #ccc',
                      borderRadius: '4px',
                      width: '200px' // or auto if you prefer
                    }}
                  />
                </span>
              </div>
              
              <span id="apiResponsep9" name="apiResponsep9">
                <li>The Goddard School is a year-round program. Tuition is payable for all 12 months unless withdrawing from enrollment.</li>
              </span>
              <br/>

              <div style={{ display: 'flex', justifyContent: 'flex-end', margin: '8px 0' }}>
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px', // optional spacing between text and input
                    margin: '8px 0'
                  }}
                >
                  <b>Initial here</b>
                  <input
                    id="point_ten_initial_here"
                    name="point_ten_initial_here"
                    value={formData.point_ten_initial_here}
                    onChange={handleChange}
                    type="text"
                    style={{
                      padding: '4px 8px',
                      border: '1px solid #ccc',
                      borderRadius: '4px',
                      width: '200px' // or auto if you prefer
                    }}
                  />
                </span>
              </div>
              
              <span id="apiResponsep10" name="apiResponsep10">
                <li>
                  The School will open at 7:00am and close at 6:00pm (from September), however modified school hours may apply in case of any unforeseen circumstances. A fee will be charged for any child not picked up before the School's regular closing time. Full day student late fees begin at 6:01pm. Half Day student late fees begin at 12:46pm. This charge shall be $35 per child for the first 5 minutes and an additional $25 per child per 5-minute period thereafter. Fees for late pick-up are added to tuition; if not paid, the child will not be readmitted to the program. Consistent lateness will be cause for the child's dismissal from the School. Arrival time at school should be no later than 10am without prior approval or notification.
                </li>
              </span>
              <br/>

              <div style={{ display: 'flex', justifyContent: 'flex-end', margin: '8px 0' }}>
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px', // optional spacing between text and input
                    margin: '8px 0'
                  }}
                >
                  <b>Initial here</b>
                  <input
                    id="point_eleven_initial_here"
                    name="point_eleven_initial_here"
                    value={formData.point_eleven_initial_here}
                    onChange={handleChange}
                    type="text"
                    style={{
                      padding: '4px 8px',
                      border: '1px solid #ccc',
                      borderRadius: '4px',
                      width: '200px' // or auto if you prefer
                    }}
                  />
                </span>
              </div>
              
              <span id="apiResponsep11" name="apiResponsep11">
                <li>Our School limits each students day to a maximum of 10 hours. If this 10-hour limit is exceeded a fee of $50 will be charged</li>
              </span>
              <br/>

              <div style={{ display: 'flex', justifyContent: 'flex-end', margin: '8px 0' }}>
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px', // optional spacing between text and input
                    margin: '8px 0'
                  }}
                >
                  <b>Initial here</b>
                  <input
                    id="point_twelve_initial_here"
                    name="point_twelve_initial_here"
                    value={formData.point_twelve_initial_here}
                    onChange={handleChange}
                    type="text"
                    style={{
                      padding: '4px 8px',
                      border: '1px solid #ccc',
                      borderRadius: '4px',
                      width: '200px' // or auto if you prefer
                    }}
                  />
                </span>
              </div>
              
              <span id="apiResponsep12" name="apiResponsep12">
                <li>
                  For children over the age of one year, the School requires a minimum of 30-day written notice of withdrawal, and for infants, a minimum of 60-day written notice. Furthermore, the last day must be the end of the month. If no advance notice of withdrawal is provided, the regular tuition fee for that term will be charged.
                </li>
              </span>
              <br/>

              <div style={{ display: 'flex', justifyContent: 'flex-end', margin: '8px 0' }}>
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px', // optional spacing between text and input
                    margin: '8px 0'
                  }}
                >
                  <b>Initial here</b>
                  <input
                    id="point_thirteen_initial_here"
                    name="point_thirteen_initial_here"
                    value={formData.point_thirteen_initial_here}
                    onChange={handleChange}
                    type="text"
                    style={{
                      padding: '4px 8px',
                      border: '1px solid #ccc',
                      borderRadius: '4px',
                      width: '200px' // or auto if you prefer
                    }}
                  />
                </span>
              </div>
              
              <span id="apiResponsep13" name="apiResponsep13">
                <li>
                  The School reserves the right to deny, cancel, sever, or suspend a child's enrollment at any time if the School, in its sole discretion, deems such action to be in the best interest of the child or the School. This should be recorded in an email and in such an event, any unused tuition will be refunded, and no notice period required.
                </li>
              </span>
              <br/>

              <div style={{ display: 'flex', justifyContent: 'flex-end', margin: '8px 0' }}>
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px', // optional spacing between text and input
                    margin: '8px 0'
                  }}
                >
                  <b>Initial here</b>
                  <input
                    id="point_fourteen_initial_here"
                    name="point_fourteen_initial_here"
                    value={formData.point_fourteen_initial_here}
                    onChange={handleChange}
                    type="text"
                    style={{
                      padding: '4px 8px',
                      border: '1px solid #ccc',
                      borderRadius: '4px',
                      width: '200px' // or auto if you prefer
                    }}
                  />
                </span>
              </div>
              
              <span id="apiResponsep14" name="apiResponsep14">
                <li>
                  Children may not attend School while ill. Children who become ill at school must be picked up immediately – refer to the Parent Handbook health policy and King County Department of Health requirements. If the child will be absent, the absence should be reported to the School by 9 am.
                </li>
              </span>
              <br/>

              <div style={{ display: 'flex', justifyContent: 'flex-end', margin: '8px 0' }}>
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px', // optional spacing between text and input
                    margin: '8px 0'
                  }}
                >
                  <b>Initial here</b>
                  <input
                    id="point_fifteen_initial_here"
                    name="point_fifteen_initial_here"
                    value={formData.point_fifteen_initial_here}
                    onChange={handleChange}
                    type="text"
                    style={{
                      padding: '4px 8px',
                      border: '1px solid #ccc',
                      borderRadius: '4px',
                      width: '200px' // or auto if you prefer
                    }}
                  />
                </span>
              </div>
              
              
              <span id="apiResponsep15" name="apiResponsep15">
                <li>Each child in our childcare facility will be required to have current and up to date immunizations throughout their time in our facility.</li>
              </span>
              <br/>

              <div style={{ display: 'flex', justifyContent: 'flex-end', margin: '8px 0' }}>
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px', // optional spacing between text and input
                    margin: '8px 0'
                  }}
                >
                  <b>Initial here</b>
                  <input
                    id="point_sixteen_initial_here"
                    name="point_sixteen_initial_here"
                    value={formData.point_sixteen_initial_here}
                    onChange={handleChange}
                    type="text"
                    style={{
                      padding: '4px 8px',
                      border: '1px solid #ccc',
                      borderRadius: '4px',
                      width: '200px' // or auto if you prefer
                    }}
                  />
                </span>
              </div>
              
              <span id="apiResponsep16" name="apiResponsep16">
                <li>
                  If your student has an allergy, asthma or a medical condition thatrequires medication, we are required to meet state licensing standards regarding the medication and paperwork. All paperwork MUST be complete prior to enrollment. This includes maintaining unexpired medications and paperwork while enrolled at The Goddard School.
                </li>
              </span>
              <br/>

              <div style={{ display: 'flex', justifyContent: 'flex-end', margin: '8px 0' }}>
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px', // optional spacing between text and input
                    margin: '8px 0'
                  }}
                >
                  <b>Initial here</b>
                  <input
                    id="point_seventeen_initial_here"
                    name="point_seventeen_initial_here"
                    value={formData.point_seventeen_initial_here}
                    onChange={handleChange}
                    type="text"
                    style={{
                      padding: '4px 8px',
                      border: '1px solid #ccc',
                      borderRadius: '4px',
                      width: '200px' // or auto if you prefer
                    }}
                  />
                </span>
              </div>
              
              
              <span id="apiResponsep17" name="apiResponsep17">
                <li>
                  Parents acknowledge and agree that representatives of the School's franchisor, Goddard Systems, Inc. ("GSI") will have access to information in children's files as part of GSI's Quality Assurance reviews and otherwise.
                </li>
              </span>
              <br/>

              <div style={{ display: 'flex', justifyContent: 'flex-end', margin: '8px 0' }}>
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px', // optional spacing between text and input
                    margin: '8px 0'
                  }}
                >
                  <b>Initial here</b>
                  <input
                    id="point_eighteen_initial_here"
                    name="point_eighteen_initial_here"
                    value={formData.point_eighteen_initial_here}
                    onChange={handleChange}
                    type="text"
                    style={{
                      padding: '4px 8px',
                      border: '1px solid #ccc',
                      borderRadius: '4px',
                      width: '200px' // or auto if you prefer
                    }}
                  />
                </span>
              </div>
              
             
              <span id="apiResponsep18" name="apiResponsep18">
                <li>
                  The School's employees are its most important assets. If Parents hire an employee of the School or a former employee (within 6 months of his/her employment at the School) for at least 20 hours per week, Parents agree to pay the School a placement fee of $10,000, payable upon hiring.
                </li>
              </span>
              <br/>

              <div style={{ display: 'flex', justifyContent: 'flex-end', margin: '8px 0' }}>
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px', // optional spacing between text and input
                    margin: '8px 0'
                  }}
                >
                  <b>Initial here</b>
                  <input
                    id="point_ninteen_initial_here"
                    name="point_ninteen_initial_here"
                    value={formData.point_ninteen_initial_here}
                    onChange={handleChange}
                    type="text"
                    style={{
                      padding: '4px 8px',
                      border: '1px solid #ccc',
                      borderRadius: '4px',
                      width: '200px' // or auto if you prefer
                    }}
                  />
                </span>
              </div>
              <span id="apiResponsep19" name="apiResponsep19">
                <li>
                  Parents agree that Outside Engagements are not for the benefit or convenience of the School, its owners or GSI, and Parents hereby irrevocably release and discharge the School, GSI, and their respective present or former owners, employees, officers, directors, agents, parents, subsidiaries, affiliates, heirs, successors and assigns, in their individual and corporate capacities from all claims, demands, liabilities, actions or causes of action whatsoever, arising in law or equity, whether known or unknown, which Parents have, may have or claim to have at any time in the future against the Releases based in whole or in part on, arising out of or related to any Outside Engagements.
                </li>
              </span>
              <br /><br />
              
              <p style={{margin: '10px 0'}}>
                The undersigned Parents have received an executed copy of this Agreement and a copy of the Parent Handbook, which includes the school policies and health policy referenced in paragraph 14 and 15. Parents acknowledge that this Agreement is by and between Parents and Cool Kidz LLC d/b/a The Goddard School; GSI is not a party to this Agreement. The undersigned Parents understand the terms of this Agreement and agree to be bound by them.
              </p>
              
              <div style={rowStyle}>
                <div style={{...colStyle, margin: '10px 0'}}>
                  <div style={formGroupStyle}>
                    <label style={formLabelStyle} htmlFor="preferred_start_date">
                      <b>Preferred Start Date</b>
                    </label>
                    <input 
                      type="date" 
                      style={formControlStyle} 
                      id="preferred_start_date"
                      name="preferred_start_date"
                      value={formData.preferred_start_date}
                      onChange={handleChange}
                    />
                  </div>
                </div>
                <div style={{...colStyle, margin: '10px 0'}}>
                  <div style={formGroupStyle}>
                    <label style={formLabelStyle} htmlFor="preferred_schedule">
                      <b>Preferred Schedule</b>
                    </label>
                    <select 
                      style={formControlStyle} 
                      id="preferred_schedule"
                      name="preferred_schedule"
                      value={formData.preferred_schedule}
                      onChange={handleChange}
                    >
                      <option value="">Select</option>
                      <option value="two_days">2 Days</option>
                      <option value="three_days">3 Days</option>
                      <option value="five_days">5 Days</option>
                    </select>
                  </div>
                </div>
              </div>
              
              <div style={flexCenterStyle}>
                <input 
                  type="checkbox" 
                  style={checkboxStyle} 
                  id="full_day" 
                  name="full_day"
                  checked={formData.full_day}
                  onChange={handleChange}
                />
                <label style={{marginRight: '10px'}} htmlFor="full_day">
                  <span><b>Full-Day</b></span>
                </label>
                <input 
                  type="checkbox" 
                  style={checkboxStyle} 
                  id="half_day" 
                  name="half_day"
                  checked={formData.half_day}
                  onChange={handleChange}
                />
                <label htmlFor="half_day">
                  <span><b>Half-Day</b></span>
                </label>
              </div>
            </ol>
            
                      <div className="text-center mt-4">
            <button 
              className="bg-[#0F2D52] text-white py-2 px-6 rounded hover:bg-opacity-90 transition-colors" 
              
            >
              Save
            </button>
          </div>
          </div>
        </div>
      </div>
  );

  const renderParentSignatureForm = () => (
    <div id="authorizationparentsign" className="container tab-pane bg-white shadow-lg rounded my-4">
        <div className="card">
          <h2 className="text-center bg-[#0F2D52] text-white p-3 rounded-t">Parent Signature</h2>
          <div className="flex flex-wrap -mx-3 p-4">
            <div className="w-full md:w-1/2 px-3 mb-4">
              <div className="form-group">
                <label htmlFor="parent_sign_enroll" className="block font-bold mb-2">Parent Signature</label>
                <input 
                  type="text" 
                  className="form-control border border-gray-300 rounded px-3 py-2 w-full" 
                  id="parent_sign_enroll"
                  name="parent_sign_enroll"
                  value={formData.parent_sign_enroll}
                  onChange={handleChange}
                />
              </div>
            </div>
            <div className="w-full md:w-1/2 px-3 mb-4">
              <div className="form-group">
                <label htmlFor="parent_sign_date_enroll" className="block font-bold mb-2">Date</label>
                <input 
                  type="date" 
                  className="form-control border border-gray-300 rounded px-3 py-2 w-full" 
                  id="parent_sign_date_enroll"
                  name="parent_sign_date_enroll"
                  value={formData.parent_sign_date_enroll}
                  onChange={handleChange}
                  readOnly
                />
              </div>
            </div>
          </div>
          <div className="text-center mb-4">
            <button 
              className="bg-[#0F2D52] text-white py-2 px-6 rounded hover:bg-opacity-90 transition-colors" 
              onClick={() => handleSubmit('parent')}
            >
              Submit
            </button>
          </div>
          
        </div>
      </div>
  );

  const renderAdminSignatureForm = () => (
    <div id="authorizationadminsign" className="container tab-pane bg-white shadow-lg rounded mb-4">
        <div className="card">
          <h2 className="text-center bg-[#0F2D52] text-white p-3 rounded-t">Admin Signature</h2>
          <div className="flex flex-wrap -mx-3 p-4">
            <div className="w-full md:w-1/2 px-3 mb-4">
              <div className="form-group">
                <label htmlFor="admin_sign_enroll" className="block font-bold mb-2">Admin Signature</label>
                <input 
                  type="text" 
                  className="form-control border border-gray-300 rounded px-3 py-2 w-full" 
                  id="admin_sign_enroll"
                  name="admin_sign_enroll"
                  value={formData.admin_sign_enroll}
                  onChange={handleChange}
                />
              </div>
            </div>
            <div className="w-full md:w-1/2 px-3 mb-4">
              <div className="form-group">
                <label htmlFor="admin_sign_date_enroll" className="block font-bold mb-2">Date</label>
                <input 
                  type="datetime-local" 
                  className="form-control border border-gray-300 rounded px-3 py-2 w-full" 
                  id="admin_sign_date_enroll"
                  name="admin_sign_date_enroll"
                  value={formData.admin_sign_date_enroll}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>
          <div className="text-center mb-4">
            <button 
              className="bg-[#0F2D52] text-white py-2 px-6 rounded hover:bg-opacity-90 transition-colors" 
              onClick={() => handleSubmit('admin')}
            >
              Submit
            </button>
          </div>
        </div>
      </div>
  );

  return (
    <div style={containerStyle}>

      {currentSubForm === 'enrollment' && renderEnrollmentForm()}
      {currentSubForm === 'parent' && renderParentSignatureForm()}
      {currentSubForm === 'admin' && renderAdminSignatureForm()}

      
      
    </div>
  );
};

export default EnrollmentForm;
