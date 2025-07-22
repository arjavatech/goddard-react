import React from 'react';


const OutsideEngagement = ({ openSection, setOpenSection }) => {
    const isOpen = openSection === 'OutsideEngagement';

    const headerClasses = `border bg-blue-50 px-6 py-4 flex items-center justify-between cursor-pointer 
        hover:bg-slate-700 hover:text-white ${isOpen ? 'bg-slate-700 text-white' : 'text-slate-700'}`;

    return (
        <>
            <div
                className={headerClasses}
                onClick={() => setOpenSection(isOpen ? '' : 'OutsideEngagement')}
            >
                <div className="flex items-center space-x-3">
                    <h2 className="text-lg font-semibold">Outside Engagements</h2>
                </div>
                <div className="text-xl transform transition-transform duration-200">
                    {isOpen ? '⌄' : '⌃'}
                </div>
            </div>

            {isOpen && (
                <div className="border p-6 space-y-6 bg-gray-50" onClick={(e) => e.stopPropagation()}>
                    {/* Additional Parent/Legal Guardian Name */}
                    <div
                        className="w-full h-auto mx-auto p-6 text-left  text-justify text-gray-700 font-semibold"
                        style={{ height: "80%", width: "100%", textAlign: "justify" }}
                    >
                        <h1 className="text-2xl font-bold mb-4 text-center">
                            OUTSIDE ENGAGEMENTS
                        </h1>

                        <p className="text-base leading-relaxed mt-4">
                            In the event Parents engage employees of the School from time to time for outside child care services
                            (“Outside Engagements”), Parents agree that Outside Engagements are not related to the School,
                            its Owner or Goddard Systems, Inc. With respect to Outside Engagements, Parents release and discharge
                            the School, its Owner and the franchisor of Goddard Schools, Goddard Systems, Inc., a Pennsylvania
                            corporation, and their present or former officers, employees, shareholders, directors, affiliates,
                            heirs, successors and assigns, in their individual and corporate capacities (the “Owner Releases”),
                            from all claims, demands, liabilities, actions or causes of action whatsoever, whether known or
                            unknown, which Parents have, may have or claim to have at any time in the future against the Owner
                            Releases based in whole or in part on or arising out of or related to any Outside Engagements.
                        </p>

                        <h1 className="text-2xl font-bold mb-4 mt-6 text-center">
                            ADDITIONAL DAYS/HOURS
                        </h1>

                        <p className="mt-4">
                            Switching of scheduled days is not allowed. Additional days may be added based on the rates quoted
                            in the enrollment agreement. Parents are required to let the Director or Owner know at least 48
                            hours in advance, if planning to bring a child for an additional day. Additional days are offered
                            based on current enrollment and may not always be available.
                        </p>




                        <label className="flex items-center space-x-2 text-lg font-medium mt-5">
                            <input
                                type="checkbox"
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

export default OutsideEngagement;
