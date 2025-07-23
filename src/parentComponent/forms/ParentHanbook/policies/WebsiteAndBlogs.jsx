
import React, { useState, useEffect } from 'react';
import { DownIcon,UpIcon } from '../../../../components/common/Arrows';
const WebsiteAndBlog = ({fieldValue,  openSection, setOpenSection }) => {
  // Initialize the checkbox state based on fieldValue
  const [isChecked, setIsChecked] = useState(fieldValue == 'on');

  // Optional: convert back to "on"/"off" or boolean
  const handleChange = (e) => {
    setIsChecked(e.target.checked);
  };

  const isOpen = openSection === 'WebsiteAndBlog';

  const headerClasses = `border bg-blue-50 px-6 py-4 flex items-center justify-between cursor-pointer 
    hover:bg-slate-700 hover:text-white ${isOpen ? 'bg-slate-700 text-white' : 'text-slate-700'}`;

    return (
        <>
            <div
                className={headerClasses}
                onClick={() =>
                    setOpenSection(isOpen ? '' : 'WebsiteAndBlog')
                }
            >
                <div className="flex items-center space-x-3">
                    <h2 className="text-lg font-semibold">Website , Blogs and Security Issues</h2>
                </div>
                <div className="text-xl transform transition-transform duration-200">
                    {isOpen ? <DownIcon className="h-5 w-5 text-gray-500" /> : <UpIcon className="h-5 w-5 text-black" />}
                </div>
            </div>

            {isOpen && (
                <div
                    className="border p-6 space-y-6 bg-gray-50"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div
                        className="w-full h-auto mx-auto p-6 text-left  text-justify text-gray-700 font-semibold"
                        style={{
                            height: '80%',
                            width: '100%',
                            textAlign: 'justify',
                        }}
                    >
                        {/* --- REST TIME --- */}
                        <div>
          <h2 className="text-xl font-bold text-center mb-6 text-gray-800 mt-6">
            WEBSITES, BLOGS, AND SECURITY ISSUES
          </h2>
          
          <p className="text-base">
            Out of concern for child safety, we do not permit the use of The Goddard School name or service mark, including logos, photographs of school grounds, and photographs of any child, parent, or employee of the school, to be posted on a web site, blog, or online social network without written permission from The Goddard School. If you wish to share information about The Goddard School in this manner, please check with your on-site owner or school director. We also have a Social Media Policy if you would like a copy for your information.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-bold text-center mb-6 text-gray-800 mt-6">
            REPORTING OF SUSPECTED CHILD ABUSE OR NEGLECT
          </h2>
          
          <p className="text-base">
            Every school is required by law to notify state authorities if there is knowledge or suspicion of physical or sexual abuse of children in or outside of school. The Goddard School located in Lynnwood, WA complies with this law and cooperates with authorities in investigations.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-bold text-center mb-6 text-gray-800 mt-6">
            BEHAVIOR POLICY
          </h2>
          
          <p className="text-base">
            It is the policy of The Goddard School<sup>®</sup> to keep disciplinary issues minimized and to help children monitor their own behavior. The staff of The Goddard School<sup>®</sup> present and model age-appropriate behavioral guidelines and use reflective communication to encourage children to express their emotions. The staff encourages self-control, self-direction, responsibility, and cooperation. At this time practical and safe, logical, or natural consequences will be presented to the child.
          </p>
        </div>


        <p className="text-base">
          The Goddard School<sup>®</sup> staff are trained in the process of positive discipline. Positive discipline instructs children as to what they should do. For example: "We walk inside the building" vs. "No running!" This philosophy of behavior is in accordance with The Goddard School<sup>®</sup> belief that children learn best in an environment where love, guidance, and encouragement promote the development of self-esteem.
        </p>

        <p className="text-base">
          "Quiet time" may be used selectively for children over 18 months of age who are at risk of harming themselves or others. "Quiet time" is used as a last resort after several attempts of redirection have been made. The period of "quiet time" will be just long enough to enable the child to regain control of him or herself and will never be longer than 1-2 minutes per year of age. During the "quiet time" period, the child will be in an area where they may be visually observed by a teacher/Director.
        </p>

        <p className="text-base">
          Aggressive physical behavior (fighting, hitting, biting, etc.) by a child
           toward another child or staff member is unacceptable. Staff members will 
           intervene immediately should this type of situation occur, in order to protect
            all of the children and encourage more acceptable behavior. Physical restraint
             (a teacher holding a child) will not be used except as necessary to ensure a child
             's safety or that of others, and then only for as long as is necessary for control
              of the situation. Children will be shown positive alternatives rather than just
               being told "no". Parents will be informed if such an incident occurs, and a 
               conference may be requested at any time to discuss an acceptable behavioral plan. 
               If at the discretion of The Goddard School<sup>®</sup> staff, a child's behavior
                is determined to be uncontrollable, extremely disruptive, and/or harmful to t
                hemselves or others, the parent will be called to come and remove the child fro
                m school for the day. Parents will be required to make arrangements for the ch
                ild to be picked up within 45 minutes of the call. Failure to do so may resul
                t in termination of services. The Goddard School<sup>®</sup> reserves the righ
                t to terminate enrollment of children who exhibit behavioral patterns, which are 
                deemed to be harmful to themselves or others. The determination of what is harmful
                 and/or appropriate is at the sole discretion of The Goddard School<sup>®</sup> st
                 disipline aff. Open communication between home and school is considered key to effective
        </p>
   

   <div className="mt-4">
   At no time, at The Goddard School® will a child be subjected to physical corporal punishment (shaking, hitting, biting, pinching, etc.), humiliated, frightened, or verbally abused by our staff. Children will never be disciplined for sleep habits, toileting accidents, food consumption, or lack of participation in scheduled activities. At all times, a child’s age, emotional state, and past experiences will be considered in discipline matters. Any violation of the school’s discipline policy should be brought to the Director or Owner’s attention immediately.
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
            )}
        </>
    );
};

export default WebsiteAndBlog;
