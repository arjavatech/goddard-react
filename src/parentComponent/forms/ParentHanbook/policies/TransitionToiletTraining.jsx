import React from 'react';

const TransitionToiletTraining = ({ openSection, setOpenSection }) => {
    const isOpen = openSection === 'TransitionToiletTraining';

    const headerClasses = `border bg-blue-50 px-6 py-4 flex items-center justify-between cursor-pointer 
      hover:bg-slate-700 hover:text-white ${isOpen ? 'bg-slate-700 text-white' : 'text-slate-700'}`;

    return (
        <>
            <div
                className={headerClasses}
                onClick={() =>
                    setOpenSection(isOpen ? '' : 'TransitionToiletTraining')
                }
            >
                <div className="flex items-center space-x-3">
                    <h2 className="text-lg font-semibold">Transition , Toilet Training Philosophy and Fields Trips</h2>
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
                        TRANSITION
                        </h1>

                        <p className="text-base leading-relaxed mt-4">
                        Children grow so fast and before you know, they are ready to move to the next classroom. 
                        The Goddard School® staff is trained to transfer the trust your child has in his/her 
                        current teachers and classrooms, on to the next. Prior to any transition, you will be 
                        notified in writing of your child’s successes and the need to graduate to the next level.
                         When transitions take place, particularly in summer and fall, your child will likely be 
                         in the same class for approximately 9 months if they are Get Set, Toddler, Pre-Toddler or F
                         irst Steps. Preschool and Prekindergarten classes are typically a full year. Periodically
                          there will be a change that takes place in those classes, based on the needs of the building 
                          and you will be notified through a transition letter if that takes place. You are welcome
                           to schedule a conference with either your current teacher(s) or the next classroom’s 
                           staff to discuss your child’s needs. The letter will inform you of how a transition
                            works and how you can lend us a hand in making the experience a successful one. As
                             children transition, their attendance is tracked in both classrooms to assure adult
                              supervision.
                        </p>

   <h1 className="text-2xl font-bold mb-4 mt-6 text-center">
   TOILET TRAINING PHILOSOPHY
                        </h1>

                        <p className="mt-4">
                        Toilet training is one of the many developmental skills children acquire between the ages of 2½ and 3. As a developmental skill, it will be reached in a child’s own time.
                        </p>

                        <p className="mt-4">
                        The Goddard School’s® “Get Set” program has been designed and scheduled to provide ample 
                        opportunities to foster this skill. While focus remains on this developmental milestone,
                         academic activities for older 2’s and young 3’s are presented and reinforced daily. 
                         Children will not transition into the Preschool classroom until they are potty-trained 
                         and wearing underwear “not a pull-up” throughout the whole length of the day. Potty-
                         training includes the ability to fully dress/undress themselves, proper wiping, 
                         communication of bathroom needs to teachers, and control during transitions of the day.
                        </p>

                  <div className="mt-4">
                  During this process, diapers should be replaced by training pants or pull-ups, and then by regular underwear. As accidents are inevitable, a sufficient supply should be on hand, along with season appropriate clothing changes
                  </div>


                        {/* --- MEALS AND SNACKS --- */}
                        <h1 className="text-2xl font-bold mt-10 mb-4 text-center">
                        Potty Training Policy
                        </h1>

                        <div className="max-w-4xl mx-auto p-6 bg-white">
      <div className="space-y-6 text-gray-800 leading-relaxed">
        <p className="text-base">
          Once your child has entered our older toddler classroom, we will begin the potty training process when:
        </p>
        
        <div className="space-y-3 ml-4">
          <p className="text-base">
            <span className="font-semibold">1)</span> Your child begins to show interest typically around the age of 2 1/2 years old. This typically looks like the child wanting to go into the bathroom, using potty words such as "I'm wet", "I'm poopy" being able to dress/undress, indicating a need to eliminate.
          </p>
          
          <p className="text-base">
            <span className="font-semibold">2)</span> Parents are ready to consistently potty train at home.
          </p>
        </div>
        
        <p className="text-base">
          It is essential that parents and the teacher work as a team to create a fun, engaging atmosphere for the potty-training process. We use positive reinforcement by giving big praise, singing songs and other silly rituals such as princess twirls and superhero high fives. We do not use food or physical rewards during the process. It is important that if potty training is happening that communication is consistent.
        </p>
        
        <p className="text-base">
          Potty training begins with a child being interested in going into the bathroom and learning to pull up and down their pants typically around 2 1/2 years old. Most children are not yet ready at 2, however, some exceptions may occur and we will support this only if the child shows the indicators on their own. We then begin asking questions "Are you wet?" and "Are you poopy?" so that they can begin identifying the feeling of each in their diaper. We begin to stand or diaper changing at this time, and we encourage the children to sit on the potty every two hours. We do not force children in any way but encourage them with clapping, high-fives and so on.
        </p>
        
        <div className="text-base">
        It is important that parents model using the potty with the child and encourage the child to try each time the parent goes, before leaving home and reminding children to tell the teacher when they need to use the bathroom. Once potty training begins, it is important that parents are consistent even though it may be difficult at times.
        </div>
        
        <div className="mt-8">
          <h2 className="text-xl font-semibold text-center mb-6 mt-5 text-gray-800">
            Moving from Diapers to Underwear
          </h2>
          
          <p className="text-base mb-6">
            We reserve the right to require a child stay in diapers/pull-ups until they can go multiple hours with a dry diaper and are able to tell us that they need to use the bathroom via clear gestures or verbal interaction. If a child begins wearing underwear, and consistently has 2 or more accidents a day, they are not ready for underwear yet. Some children may choose to wear underwear over their diaper which is acceptable.
          </p>
          
          <p className="text-base mb-8">
            During the potty-training process, it is important that families bring in 2-3 sets of extra clothes including a pair of extra shoes/sneakers. Families are encouraged to take their child to the potty before leaving the classroom for the day. The definition of being fully potty trained includes pulling up and down their own pants/underwear, wiping independently, washing hands independently and being able to let a teacher know they need the bathroom for a minimum period of 2 weeks with no accidents.
          </p>
        </div>
        
        <div className="mt-8">
          <h2 className="text-xl font-bold text-center mb-6 text-gray-800">
            FIELD TRIPS
          </h2>
          
          <p className="text-base">
            As part of The Goddard School<sup>®</sup> program, periodic walking field trips will be planned to provide the children with exposure to learning experiences in our local community. Prior to each trip, information will be sent home outlining the date, time, cost, location, chaperones, etc. A permission slip is required and must be signed by a parent and returned to the supervising teacher by the date requested on the form. No child will be permitted to attend a field trip if the required permission slip is not on file. Children must be four (4) years of age or older to participate in walking field trips. Ratios for field trips are 1 teacher/staff member or chaperone per 5 children.
          </p>
        </div>

        <div className="mt-8">
          <h2 className="text-xl font-bold text-center mb-6 text-gray-800">
            CELEBRATION OF A CHILD'S BIRTHDAY
          </h2>
          
          <p className="text-base mb-6">
            The celebration of a child's birthday at school with their friends can be a wonderful lifetime memory. In planning these moments, please consider the nutritional needs and requirements of all the children in the class. Special treats must be store purchased and arrive at the school in their original store container. Please provide the teacher with advance notice of what will be brought and coordinate the date and time with the teacher. We have a wonderful list of suggestions, please ask the Director or Owner for a copy.
          </p>
          
          <p className="text-base mb-8">
            Please contact the Director or Owner for assistance in any special event planning at the school.
          </p>
        </div>
        
        <div className="mt-8">
          <h2 className="text-xl font-bold text-center mb-6 text-gray-800">
            SMOKING
          </h2>
          
          <p className="text-base">
            It is our desire that the environment around the children be as safe and healthy as possible. Therefore, The Goddard School<sup>®</sup> is a smoke-free environment, both inside the building and on school grounds. Parents, faculty, staff, and visitors are asked to comply with this request.
          </p>
        </div>




      </div>
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

export default TransitionToiletTraining;
