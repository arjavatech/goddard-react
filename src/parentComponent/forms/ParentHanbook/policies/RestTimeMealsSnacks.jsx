import React from 'react';

const RestTimeMealsSnacks = ({ openSection, setOpenSection }) => {
    const isOpen = openSection === 'RestTimeMealsSnacks';

    const headerClasses = `border bg-blue-50 px-6 py-4 flex items-center justify-between cursor-pointer 
      hover:bg-slate-700 hover:text-white ${isOpen ? 'bg-slate-700 text-white' : 'text-slate-700'}`;

    return (
        <>
            <div
                className={headerClasses}
                onClick={() =>
                    setOpenSection(isOpen ? '' : 'RestTimeMealsSnacks')
                }
            >
                <div className="flex items-center space-x-3">
                    <h2 className="text-lg font-semibold">Rest Time Meals and Snacks</h2>
                </div>
                <div className="text-xl transform transition-transform duration-200">
                    {isOpen ? '⌄' : '⌃'}
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
                        <h1 className="text-2xl font-bold mb-4 text-center">
                            REST TIME
                        </h1>

                        <p className="text-base leading-relaxed mt-4">
                            Children in the Toddler and Preschool classes are required to
                            lie quietly on their sleeping mats for approximately 30–45
                            minutes daily. This allows those children who do wish to sleep
                            a quiet length of time in which they may rest. Quiet music is
                            played, the lights are dimmed, and it is a period of relaxation
                            for both nappers and non-nappers. Those children who do not fall
                            asleep during the initial quiet time are given the opportunity
                            to select quiet activities such as books or puzzles to occupy
                            themselves while their classmates rest. The Pre-Kindergarten
                            classrooms are non-napping classes.
                        </p>

                        <p className="mt-4">
                            Although we make every effort to meet each child’s rest needs, it
                            is difficult to guarantee a specific length of nap time, or
                            wake-up time, as a child’s rest needs vary with activity level,
                            sleep patterns the night before, etc. It is equally difficult,
                            and in opposition to our child-centered program, to keep a child
                            awake if he/she wants to rest.
                        </p>

                        <p className="mt-4">
                            Infants will rest on an individual schedule of time and length.
                            Infants who cannot turn over on their own will be placed in the
                            crib lying on their <u>backs only</u> unless a medical reason
                            supported by a written physician’s note states otherwise.
                        </p>

                        {/* --- MEALS AND SNACKS --- */}
                        <h1 className="text-2xl font-bold mt-10 mb-4 text-center">
                            MEALS AND SNACKS
                        </h1>

                        <p className="text-base leading-relaxed mt-4">
                            The Goddard School® has found that parents prefer to provide
                            lunch for their children. This way a parent can send a meal that
                            meets their child’s individual needs and preferences. Children
                            enrolled in the morning preschool program are encouraged to join
                            their classmates for lunch and socialization. After lunch there
                            is a natural break in the day for the morning children to depart,
                            as the full day children prepare for rest time.
                        </p>

                        <p className="mt-4">
                            The Goddard School® provides morning and afternoon snacks on a
                            daily basis. These may include items such as crackers, Cheerios,
                            pretzels, and graham crackers. Fresh fruits and vegetables will
                            also be served on a weekly basis. Beverages may include water,
                            milk or 100% fruit juice. The snack menu is posted in the kitchen
                            and emailed out to parents at the beginning of each month.
                        </p>

                        <p className="mt-4">
                            Parents of infants must send prepared bottles of breast milk or
                            formula that is clearly labeled with the child’s first and last
                            name, contents, and date. Arrangements may be made for mothers
                            who wish to come to the school to breast feed their infant.
                            Instructions regarding a feeding schedule that has been
                            established by the parents must be provided, and these schedules
                            should be updated as necessary when new foods are introduced.
                            Infant bottles will be reheated in a bottle warmer, shaken, and
                            temperature tested before feeding. Any contents remaining in a
                            bottle after a feeding will be discarded after 45 minutes for
                            breastmilk and 1 hour for formula, therefore it is suggested that
                            bottles be filled with the amount the child will drink at each
                            feeding. Small (4 oz.) bottles may be more appropriate for a
                            young infant.
                        </p>


                        <div className="mt-4">
                            As solid foods are introduced, parents are requested to bring labeled containers or small
                            containers of food. For the safety and protection of all our infants, no glass jars are allowed.
                            Please send only plastic containers. All food should be portioned out in clean and sanitized
                            containers. The date should also appear on the label, along with the child’s first and last
                            name. All Infant food should be placed in the refrigerator in the individual box upon arrival.
                            In warm weather, it is recommended that perishable food be transported in an insulated cooler.
                            Any food or beverage not eaten at scheduled mealtimes must be discarded and noted in the child’s
                            daily report. In the case of extra bottles/food for infants, any item that has not been opened
                            will be saved until the end of the day. These bottles and/or food must be taken home at the end
                            of each day.
                        </div>

                      <div className="mt-4">
                      Breakfast from home may be provided for children who arrive prior to 8:00 AM. All food should be 
                      sent ready to serve. If any preparation is required, parents should plan to spend several minutes
                       assisting their children, as the staff will be supervising both eating and play time. Children 
                       who arrive after 8:00 AM should eat breakfast at home, as school activities at this point in the
                        day do not allow for the supervision of children who are eating breakfast. A mid-morning snack 
                        is served between 9:00 AM and 10:00 AM daily.
                      </div>

                      <div className="mt-4">
                      For lunch, sandwiches, yogurt, soup, fruit, crackers, cheese, etc. are recommended so that the children receive a serving from each food group. Please try to avoid foods that contain excessive amounts of sugar, preservatives, artificial flavorings, colors, or caffeine. Lunches should be ready to serve (fruit peeled, soup in a microwave-safe container, etc.). Items that require refrigeration must be labeled with the child’s first and last name and placed in the appropriate tray in the classroom. The trays will then be placed in the refrigerator in the kitchen.
                      </div>

            <div className="mt-4">
            All bibs, bottles, cups, bowls, spoons, etc., must be taken home daily. Washington State Department of Health requirements do not allow us to wash and store these items. All items must be labeled with first and last names (no initials).
            </div>



<div className="mt-4">
Your child will be encouraged to eat the balanced meal that you have provided. However, if a child refuses certain foods, those choices will be respected and will remain in the child’s lunch box if unopened. Please review your child’s daily report for an indication of appetite and food consumption. We are unable to save open food, our teachers do take a picture of their lunch after they are completed so that you can see what was eaten.
</div>



                        {/* Checkbox */}
                        <label className="flex items-center space-x-2 text-lg font-medium mt-6">
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

export default RestTimeMealsSnacks;
