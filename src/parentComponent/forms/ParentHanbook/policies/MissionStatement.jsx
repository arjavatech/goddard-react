
import React, { useState, useEffect } from 'react';
import { DownIcon,UpIcon } from '../../../../components/common/Arrows';

const MissionStatement = ({fieldValue,  openSection, setOpenSection }) => {
    // Initialize the checkbox state based on fieldValue
  const [isChecked, setIsChecked] = useState(fieldValue == 'on');

  // Optional: convert back to "on"/"off" or boolean
  const handleChange = (e) => {
    setIsChecked(e.target.checked);
  };
  
    const isOpen = openSection === 'MissionStatementMissionStatement';

    const headerClasses = `border bg-blue-50 px-6 py-4 flex items-center justify-between cursor-pointer 
        hover:bg-slate-700 hover:text-white ${isOpen ? 'bg-slate-700 text-white' : 'text-slate-700'}`;

    return (
        <>
            <div
                className={headerClasses}
                onClick={() => setOpenSection(isOpen ? '' : 'MissionStatementMissionStatement')}
            >
                <div className="flex items-center space-x-3">
                    <h2 className="text-lg font-semibold">Mission Statement & Children's Bill of Rights</h2>
                </div>
                <div className="text-xl transform transition-transform duration-200">
                    {isOpen ? <DownIcon className="h-5 w-5 text-gray-500" /> : <UpIcon className="h-5 w-5 text-black" />}
                </div>
            </div>

            {isOpen && (
                <div className=" border p-6 space-y-6 bg-gray-50" onClick={(e) => e.stopPropagation()}>
                    {/* Additional Parent/Legal Guardian Name */}
                    <div>
                        <div
                            className="w-full  h-auto mx-auto p-6 text-left text-justify text-gray-700 font-semibold "
                            style={{ height: "80%", width: "100%", textAlign: "justify" }}
                        >
                            <h1 className="text-2xl font-bold mb-4 text-center">
                                Mission Statement
                            </h1>
                            <p className=" text-base leading-relaxed">
                                We are dedicated to giving children a love of learning in a safe and secure environment.
                                Our teachers design and individualize their own lesson plans to help children learn and
                                explore the world at their own pace.
                            </p>


                            <p className="mt-4">Our teachers are loving, nurturing, trained professionals committed to
                                maintaining the highest quality in early childhood education. Through onsite training
                                provided by the Director, as well as Goddard University, our teachers receive ongoing
                                training in order to learn the latest developments within the field of Early Childhood Education. </p>

                            <p className="mt-4">Our school is a safe, secure, clean, and happy environment for
                                children to grow and learn. We will make the transition from home to school a positive experience. </p>

                            <p className="mt-4">Each child is treated as a unique individual. Each child is
                                given individual attention within a group allowing him/her to progress according to
                                his/her own needs and rate of development </p>

                            <p className="mt-4">Communication with parents is the key. It is based upon
                                being open, honest, and respectful - encouraging both involvement and support.
                                Parents are informed daily of their child’s progress and development.</p>

                            <p className="mt-5">We strive to provide the best in child care and development
                                . We are committed to Goddard’s standards of excellence and are continually
                                seeking to improve.</p>

                            <p className="mt-5">Our number one priority is providing every child with a
                                loving and caring atmosphere conducive to the development of self-esteem,
                                confidence, creativity, and a love of learning.</p>

                            <h1 className="text-2xl font-bold mb-4 text-center mt-5">
                                Children’s Bill of Rights
                            </h1>

                            <p className="mt-5">We, the faculty, and staff of The Goddard School<sup>®</sup>,
                                pledge to honor this Children’s Bill of Rights.</p>

                            <p className="mt-5">Every child in our program has the right to be respected as an individual
                                with concern for his or her own interests, challenges, talents, and pace of learning.</p>

                            <p className="mt-5">Every child has the right to a calm, warm, loving, and nurturing
                                environment where affection is freely given so that a child feels valued and secure and
                                is thus able to develop self-confidence.</p>

                            <p className="mt-5">Every child has the right to personal attention, a relaxed atmosphere,
                                and freedom of choice in daily activities that can only be provided in a small group setting.</p>

                            <p className="mt-5">Every child has the right to have all physical needs met, including
                                the need for rest and relaxation throughout the day.</p>

                            <p className="mt-5">Every child has the right to a clean, safe environment in which to
                                spend their day.</p>

                            <p className="mt-5">Every child has the right to experience a variety of activities
                                throughout the day that help them develop a feeling of independence and confidence.
                                These activities provide opportunities for creativity, exploration, and a lifelong love of learning.</p>







                            <label className="flex items-center space-x-2 text-lg font-medium mt-5">
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

export default MissionStatement;
