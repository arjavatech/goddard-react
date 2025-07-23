
import React, { useState, useEffect } from 'react';
import { DownIcon,UpIcon } from '../../../../components/common/Arrows';
const AddressingIndividualChildConcern = ({fieldValue,  openSection, setOpenSection }) => {
  // Initialize the checkbox state based on fieldValue
  const [isChecked, setIsChecked] = useState(fieldValue == 'on');

  // Optional: convert back to "on"/"off" or boolean
  const handleChange = (e) => {
    setIsChecked(e.target.checked);
  };

    const isOpen = openSection === 'AddressingIndividualChildConcern';

    const headerClasses = `border bg-blue-50 px-6 py-4 flex items-center justify-between cursor-pointer 
      hover:bg-slate-700 hover:text-white ${isOpen ? 'bg-slate-700 text-white' : 'text-slate-700'}`;

    return (
        <>
            <div
                className={headerClasses}
                onClick={() =>
                    setOpenSection(isOpen ? '' : 'AddressingIndividualChildConcern')
                }
            >
                <div className="flex items-center space-x-3">
                    <h2 className="text-lg font-semibold">Addressing Individual Child Concern</h2>
                </div>
                <div className="text-xl transform transition-transform duration-200">
                    {isOpen ? <DownIcon className="h-5 w-5 text-gray-500" /> : <UpIcon className="h-5 w-5 text-black" />}
                </div>
            </div>

            {isOpen && (
                <div
                    className="border my-1 border-b pp-6 space-y-6 bg-gray-50"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div
                        className="w-full h-auto mx-auto p-6 text-left mt-5 text-justify text-gray-700 font-semibold"
                        style={{
                            height: '80%',
                            width: '100%',
                            textAlign: 'justify',
                        }}
                    >
                        {/* --- REST TIME --- */}
                        <h1 className="text-2xl font-bold text-center mb-8">ADDRESSING INDIVIDUAL CHILD CONCERNS</h1>
        
        <div className="space-y-6 text-md leading-relaxed">
          <p>
            The Goddard School® has developed a strong working relationship with Kindering, an early intervention center 
            serving urban East King County. Kindering is the largest intervention center in Washington, one of the three largest 
            in the nation, and notably the most comprehensive. The Educational Consultants at Kindering are committed to 
            providing superior, individualized, family-centered services for children throughout the Eastside.
          </p>
          
          <p>
            Whenever there is a question about a child's development or behavior, our first question is to ask if the 
            environment can be modified to better accommodate the child's needs. Kindering has been very helpful to our staff 
            in making adjustments to our classrooms to better meet children's needs. When the environmental changes are not 
            enough, we then explore individual concerns. If the assessment process informs us of a specific need, the parents 
            meet with the Educational Consultant, as well as the Director and classroom teachers. Our conversation is designed 
            to build a strong partnership between home, school and outside services that may benefit the child.
          </p>
          
          <p>
            Kindering can become a strong support for the family and provide referral services when appropriate. This is a free 
            service, and we are appreciative of the input that Kindering provides and the support they give to our program.
          </p>
        </div>
   
 

      {/* Page 2 - Parent Code of Conduct */}
      <div className="p-8 border-b-2 border-gray-300 min-h-screen">
     
        
        <h1 className="text-2xl font-bold text-center mb-8">PARENT CODE OF CONDUCT</h1>
        
        <p className="text-md leading-relaxed mb-8">
          The Goddard School® expects parents to observe a certain standard of conduct at the center and on its grounds. 
          The following behaviors are not acceptable in the facility or on the grounds:
        </p>
        
        <ul className="space-y-3 text-md leading-relaxed mb-12 ml-6">
          <li className="flex">
            <span className="mr-3">•</span>
            <span>Physical or verbal punishment of their children</span>
          </li>
          <li className="flex">
            <span className="mr-3">•</span>
            <span>Physical or verbal punishment of other children</span>
          </li>
          <li className="flex">
            <span className="mr-3">•</span>
            <span>Threatening or intimidating staff, other parents, or other children</span>
          </li>
          <li className="flex">
            <span className="mr-3">•</span>
            <span>Swearing/cursing or threatening/obscene gestures</span>
          </li>
          <li className="flex">
            <span className="mr-3">•</span>
            <span>Quarreling with other parents or staff</span>
          </li>
          <li className="flex">
            <span className="mr-3">•</span>
            <span>Not following policies designated to protect the safety and security of everyone in the center.</span>
          </li>
        </ul>
        
        <h1 className="text-2xl font-bold text-center mb-8">PARENT COMMUNICATION</h1>
        
        <p className="text-md leading-relaxed mb-8">
          The Goddard School® provides many opportunities for parents to receive information on the progress of their 
          children, as well as details on other general activities occurring from time to time at the school. Examples of the 
          types of communication that parents will receive include:
        </p>
        
        <div className="space-y-6 text-md leading-relaxed">
          <div>
            <h3 className="font-bold mb-2">Kaymbu/The Goddard Family App</h3>
            <p>
              A written daily report for each child in The Goddard School® provides a parent with an overview of the activities in 
              which the child participated, as well as information on meals, sleep, and toileting will be emailed to you via 
              KAYMBU (you can also download the App).
            </p>
          </div>
        </div>
      
  

      {/* Page 3 - Parent Communication Continued */}
      <div className="p-8 min-h-screen">
        <div className="space-y-6 text-md leading-relaxed">
          <div>
            <h3 className="font-bold mb-2">Parent Conferences</h3>
            <p>
              At least twice a year, or more often by parent (or staff) request, a formal parent/teacher conference time is 
              scheduled. Our school is closed for the two scheduled conference dates, sign ups occur for families with siblings 
              first and then open to the remaining classmates. These meetings serve to summarize each child's progress in detail. 
              The parents will be given a written developmental report, which summarizes the teacher's evaluation.
            </p>
          </div>
          
          <div>
            <h3 className="font-bold mb-2">Information Boards</h3>
            <p>
              Boards are located outside each classroom or inside the classroom by the door for your convenience. Information is 
              provided about upcoming school and community events, as well as miscellaneous points of interest. Individual 
              classroom boards will contain lesson plans, class schedules, and staff hours. It is recommended that parents check 
              the boards regularly for updates and new information.
            </p>
          </div>
          
          <div>
            <h3 className="font-bold mb-2">Daily Feedback</h3>
            <p>
              Daily communication will occur between staff and parents in the morning and evening to provide updates on the 
              children's health, disposition, etc. A long dialogue may not be possible at the drop- off or pick-up time, as these are 
              particularly busy times when staff are responsible for supervising all of the children in their care. If you have a 
              concern, a special appointment is advised, or telephone conferences may be arranged.
            </p>
          </div>
          
          <div>
            <h3 className="font-bold mb-2">Newsletters and Monthly Calendars</h3>
            <p>
              Monthly newsletters are emailed out to keep parents posted on all school activities. Monthly calendars will be 
              available on or before the first of each month. These will be emailed out to all families a few days before the new 
              month begins.
            </p>

            </div>
            </div>
            </div>




                        {/* Checkbox */}
                        <label className="flex items-center space-x-2 text-lg font-medium mt-6">
                            <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={handleChange}
                                className="form-checkbox h-4 w-4 text-blue-600 border-gray-300 rounded"
                            />
                            <span>
                                I agree <strong>all the above information</strong>.
                            </span>
                        </label>
                    </div>
                </div>
                </div>
                
            )}
        </>
    );
};

export default AddressingIndividualChildConcern;
