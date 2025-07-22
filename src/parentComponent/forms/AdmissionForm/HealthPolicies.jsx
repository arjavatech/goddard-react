import React, { useState } from "react";
import CheckboxWithLabel from "./CheckboxWithLabel";

export default function HealthPolicies() {
    const [agreePhotos, setAgreePhotos] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const handleSave = () => {
        setSubmitted(true);
        if (agreePhotos) {
            alert("Form saved successfully!");
        }
    };

    return (
       <div className="flex justify-center px-4 py-6 sm:py-8 md:py-10 lg:py-12 bg-gray-100 min-h-screen">
      <div className="w-full max-w-4xl border-2 border-[#0F2D52] bg-white shadow-md overflow-hidden">
        
        {/* Header */}
         <h4 className="text-center text-white bg-[#0F2D52] py-4 sm:py-5 text-xl sm:text-2xl font-semibold tracking-wide">
      
                    Health Policies
                </h4>
                <div className="px-4 sm:px-6 md:px-10 py-6 space-y-6 text-justify text-base font-medium text-gray-800">
                    <p>
                        The owners and staff at The Goddard School® do all we can to promote a healthy environment for your children. Our teachers make sure children wash their hands before meals, after art projects, after toileting and diapering, after coming in from outside, and after wiping one's nose. Our teachers are required to wash their hands before serving meals or snacks and are sure to wear latex gloves while diapering or assisting a child with toileting and when coming into contact with any bodily fluids. In addition, we disinfect infant and toddler toys on a daily basis. Our preschool toys are disinfected weekly.
                    </p>

                    <p>
                        The health of the children is very important to the staff at The Goddard School®. Children who are ill cannot be appropriately cared for in a childcare setting. A child who is unable to participate due to illness should not be in attendance. The Goddard School® staff understands that it may be difficult to make alternate arrangements when a child may be too ill to attend the program. However, cooperation in keeping a child home when they are showing symptoms of illness will be greatly appreciated by the teachers and all the children who would normally be in contact with that child. By establishing and maintaining a healthy environment and reasonable health policies, all of our children will benefit.
                    </p>

                    <p>
                        If a child does arrive in the morning showing signs of ill health, we will be unable to accept him/her. The exception to this requirement would be that a licensed physician has examined the child and indicated, in writing, that there would be no health risk to your child or others, and the child is capable of participating in all activities, including outdoor play.
                    </p>

                    <h3 className="text-lg font-bold">
                        Examples of health symptoms that require exclusion from the program
                        include, but are not limited to:
                    </h3>
                    <ul className="list-disc list-inside space-y-1">
                        {[
                            "Severe pain or discomfort particularly in joints, abdomen, or ears",
                            "Vomiting or diarrhea (2 or more incidents within a 24 hour period)",
                            "Severe coughing or sore throat",
                            "Temperature of 100° or more and/or accompanied by other symptoms",
                            "Jaundice (yellow) skin or eyes",
                            "Eye discharge or conjunctivitis (pink eye)",
                            "Untreated skin patches or severe itching",
                            "Difficult or rapid breathing",
                            "Skin rashes with fever or itching",
                            "Swollen joints or stiff neck",
                            "Blood/pus from ears, skin, urine, or stool",
                            "Unusual behavior like listlessness or confusion",
                            "Symptoms of chicken pox, lice, scabies, or strep throat",
                        ].map((item, idx) => (
                            <li key={idx}>{item}</li>
                        ))}
                    </ul>
                    <p>If a child becomes ill during the day, a parent will be advised immediately. The child will be given the opportunity to rest or have other activities in a separated, supervised area until a designated release person can pick up the child. If the child is not picked up within one hour from the time of notification, the emergency contact person will be called. Children who are sent home due to illness will not be readmitted to the school until all signs of illness have been gone for 24 hours. Therefore, a child who is sent home ill cannot return to school the following day. The exception to this requirement would be that a licensed physician has examined the child and has indicated in writing that the child does not present a health threat to him/her or others and is able to participate in all school activities, including outdoor play.

                    </p>
                    <p>In cases of certain communicable diseases, The Goddard School® is required to file a report with the Department of Health within 24 hours, so control measures can be used. Parents and staff are reminded to notify The Goddard School® within 24 hours if a child or family member has developed a known or suspected communicable disease. If a child has not been fully immunized for these diseases (due to the child's age, medical condition, or religious belief) they will be excluded from the school during the outbreak of a vaccine-preventable disease, as directed by Washington State Department of Health. Examples of "Reportable Diseases" include (but are not limited to):</p>
                   <div className="overflow-x-auto">
  <table className="w-full table-auto border border-gray-300 text-sm md:text-base">
    <thead className="bg-[#e6f0ff] text-[#0F2D52]">
      <tr>
        <th className="border border-gray-300 p-3 font-semibold">COVID19</th>
        <th className="border border-gray-300 p-3 font-semibold">Spinal Meningitis</th>
        <th className="border border-gray-300 p-3 font-semibold">Hepatitis A</th>
      </tr>
    </thead>
    <tbody>
      <tr className="bg-blue-100">
        <td className="border border-gray-300 p-3">RSV (respiratory syncytial virus)</td>
        <td className="border border-gray-300 p-3">Flu A / Flu B</td>
        <td className="border border-gray-300 p-3">Varicella / Chicken Pox</td>
      </tr>
      <tr className="bg-blue-100">
        <td className="border border-gray-300 p-3">Measles / Mumps / Rubella</td>
        <td className="border border-gray-300 p-3">Pinkeye / Conjunctivitis</td>
        <td className="border border-gray-300 p-3">Giardiasis</td>
      </tr>
      <tr className="bg-blue-100">
        <td className="border border-gray-300 p-3">Strep Throat</td>
        <td className="border border-gray-300 p-3">Salmonellosis</td>
        <td className="border border-gray-300 p-3">Shigellosis</td>
      </tr>
    </tbody>
  </table>
</div>


                    <p>
                        All parents will be informed in writing if a communicable disease is reported. The Goddard School® follows the reporting guidelines as established by Washington State Department of Health. A copy of these guidelines is on file in the Director's office and is available for your review.
                    </p>

                    <p>
                        Please refer to our parent handbook along with the detailed health policies here at 
                        <a
                            href="https://tinyurl.com/5x7c7nwf"
                            className="text-blue-600 underline"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            https://tinyurl.com/5x7c7nwf
                        </a>
                    </p>

                    <CheckboxWithLabel
                        id="agreePhotos"
                        checked={agreePhotos}
                        onChange={setAgreePhotos}
                        label="I agree to the health policies."
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
    );
}
