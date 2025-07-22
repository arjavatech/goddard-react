import React, { useState } from "react";
import CheckboxWithLabel from "./CheckboxWithLabel";

export default function OutsideEngagements() {
    const [agreePhotos, setAgreePhotos] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const handleSave = () => {
        setSubmitted(true);
        if (agreePhotos) {
            alert("Form saved successfully!");
        }
    };

    return (
        <>
            <h1 className='text-center my-5 py-3 text-3xl text-white headerstyle' style={{ backgroundColor: '#0F2D52' }}>Outside Engagements Release & Waiver</h1>
            <div className="flex justify-center px-4 py-8 sm:py-8 md:py-6 lg:py-4">
                <div className="w-full overflow-hidden">
                    <div className="px-4 sm:px-6 md:px-10 py-6 space-y-6 text-justify text-base font-medium text-gray-800">
                        <p>
                            Parent(s) of student(s) enrolled at The Goddard School, Lynnwood may request one or more employees of the The Goddard School, Lynnwood to provide childcare services (baby-sitting/transportation) outside of school premises and school hours.
                        </p>



                        <h3 className="text-lg font-bold">
                            Parents and employees agree as follows:
                        </h3>
                        <ul className="list-disc list-inside space-y-1">
                            {[
                                "Parents acknowledge that they have requested that Employee provide Babysitting Services/Transportation solely for Parents' convenience and benefit , and not for the convenience or benefit of the School.",
                                "Parents acknowledge that, in providing Transportation and/or Babysitting Services, Employee is acting as an independent contractor and not as an employee of the School. Parents acknowledge that providing Transportation and Babysitting Services is not part of Employee's job with the School and that the School is not requesting that Employee provide these services.",
                                "Parents acknowledge that the School has not reviewed Employee's driving record and makes no representations regarding Employee's driving history or ability or the existence or scope of Employee's insurance.",
                                "Parents interested in hiring a teacher(s) for outside services must ask if the teacher is interested. The admin team will not aid in finding someone to facilitate before/after hour care.",
                                "When hiring for outside engagements, parents ensure that staff work hours at school are not disturbed.",
                                "If there is a matter of contention between the staff hired and the family, management is not liable to mediate or take disciplinary actions against the staff based on what happened outside the school.",
                            ].map((item, idx) => (
                                <li key={idx}>{item}</li>
                            ))}
                        </ul>


                        <CheckboxWithLabel
                            id="agreePhotos"
                            checked={agreePhotos}
                            onChange={setAgreePhotos}
                            label="I have read this agreement and understand its terms."
                        />
                        {submitted && !agreePhotos && (
                            <p className="text-red-600 text-sm">You must agree to continue.</p>
                        )}

                        <div className="text-center pt-6">
                            <button
                                onClick={handleSave}
                                className="bg-[#0F2D52] hover:bg-[#093567] text-white font-semibold px-8 py-2"
                            >
                                Save
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
