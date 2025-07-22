
import React, { useState, useEffect } from 'react';


const MissionStatement = ({ fieldValue, openSection, setOpenSection }) => {
    // Initialize the checkbox state based on fieldValue
  const [isChecked, setIsChecked] = useState(fieldValue == 'on');

  // Optional: convert back to "on"/"off" or boolean
  const handleChange = (e) => {
    setIsChecked(e.target.checked);
    console.log('Updated value:', e.target.checked ? 'on' : 'off');
  };
    const isOpen = openSection === 'missionStatement';

    const headerClasses = `rounded-t-lg border bg-blue-50 px-6 py-4 flex items-center justify-between cursor-pointer 
        hover:bg-slate-700 hover:text-white ${isOpen ? 'bg-slate-700 text-white' : 'text-slate-700'}`;

    return (
        <>
            <div
                className={headerClasses}
                onClick={() => setOpenSection(isOpen ? '' : 'missionStatement')}
            >
                <div className="flex items-center space-x-3">
                    <h2 className="text-lg font-semibold">The Goddard School</h2>
                </div>
                <div className="text-xl transform transition-transform duration-200">
                    {isOpen ? '⌄' : '⌃'}
                </div>
            </div>

            {isOpen && (
                <div className="border p-6 space-y-6 bg-gray-50" onClick={(e) => e.stopPropagation()}>
                    {/* Additional Parent/Legal Guardian Name */}
                    <div
                        className="w-full  h-auto mx-auto p-6 text-left text-justify text-gray-700 font-semibold "
                        style={{ height: "80%", width: "100%", textAlign: "justify" }}
                    >
                        <h1 className="text-2xl font-bold mb-4 text-center">
                            Welcome to The Goddard School<sup>®</sup>
                        </h1>
                        <p className=" text-base leading-relaxed">
                            The early years are a very special time in your child’s development. Great changes occur in this relatively short
                            period of time as children learn to communicate, increase their intellectual awareness, and make great physical
                            strides. In recognition of the crucial importance of these years, The Goddard School<sup>®</sup> has created a program
                            tailored to meet the needs of your child at each stage of development.
                        </p>
                        <p className="mt-4">The Goddard School® philosophy is to provide an atmosphere suited to the development of selfesteem, confidence, and love of learning. By combining the best possible equipment and
                            professionally educated staff in an environment specifically designed for young children, we offer
                            an outstanding program. </p>
                        <p className="mt-4">The educational goal of The Goddard School® is to utilize fun and creativity to foster a love
                            of learning. We challenge our students by promoting inquiry and discovery through exploring
                            the world around them. This instills a sense of confidence in their ability to master new
                            situations and tasks through reasoning. Your child will be exposed to a variety of teaching
                            methods so that he/she will be able to meet success in any elementary school system. </p>
                        <p className="mt-4">You, the parent, are very important to The Goddard staff because you know your child best. We
                            encourage you to contact the school about any questions or concerns you might have. Please
                            review the daily reports highlighting your child’s activities. If there is anything we can do to
                            make your child’s experiences more meaningful, please let us know. </p>
                        <p className="mt-4">We are looking forward to working with you and your child and sharing in his/her growth and
                            development.</p>
                        <p className="mt-5">Many thanks for choosing The Goddard School® located in Redmond, WA.</p>
                        <p className="mt-5">Sincerely,</p>
                        <p className="mt-5">Maanu Muthu, Onsite Owner</p>
                        <p className="mt-5"><i>*The term “parent” is used throughout to represent the primary individual(s) responsible for the child’s care.</i></p>

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
            )}
        </>
    );
};

export default MissionStatement;
