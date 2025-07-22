import React, { useState } from 'react';

export default function ChildInformation({isOpen, onToggle}) {
//   const [open, setOpen] = useState(true);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    nickName: '',
    dob: '',
    language: '',
    school: '',
    custody: '',
    gender: '',
  });

  const isFilled = (field) => formData[field]?.trim() !== '';
  const inputClass = (field) =>
    `w-full rounded px-3 py-2 border ${isFilled(field) ? 'border-green-500' : 'border-red-500'}`;
  const labelClass = 'block text-sm font-bold mb-1';

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRadioChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const completed = Object.values(formData).every((val) => val && val.trim() !== '');

  const inputFields = [
    { name: 'firstName', label: 'First Name', type: 'text' },
    { name: 'lastName', label: 'Last Name', type: 'text' },
    { name: 'nickName', label: 'Nickname', type: 'text' },
    { name: 'dob', label: 'Birth Date', type: 'date' },
    { name: 'language', label: 'Primary Language', type: 'text' },
    { name: 'school', label: 'School-Age Child’s School', type: 'text' },
  ];

  const radioGroups = [
    {
      name: 'custody',
      label: 'Do Relevant Custody Papers Apply?',
      options: ['yes', 'no'],
    },
    {
      name: 'gender',
      label: 'Gender',
      options: ['male', 'female', 'others'],
    },
  ];

  return (
    <div className="border shadow rounded">
      <button
        className={`w-full px-4 py-3 font-bold flex justify-between items-center ${
            isOpen ? 'bg-blue-900 text-white' : 'bg-blue-200 text-black'
        }`}
        onClick={onToggle}
      >
        <span>Child Details</span>
        <div className="flex items-center gap-2">
          {completed && <img src="/image/tick.png" alt="Completed" className="w-5 h-5" />}
          <span>{isOpen ? '▲' : '▼'}</span>
        </div>
      </button>

      {isOpen && (
        <div className="p-4 bg-white space-y-6">
          {/* Input fields (mapped) */}
          {Array.from({ length: inputFields.length / 2 }, (_, i) => (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4" key={i}>
              {[inputFields[i * 2], inputFields[i * 2 + 1]].map(
                (field) =>
                  field && (
                    <div key={field.name}>
                      <label className={labelClass}>{field.label}</label>
                      <input
                        type={field.type}
                        name={field.name}
                        value={formData[field.name]}
                        onChange={handleChange}
                        className={inputClass(field.name)}
                      />
                    </div>
                  )
              )}
            </div>
          ))}

          {/* Radio groups (mapped) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {radioGroups.map((group) => (
              <div key={group.name}>
                <label className={labelClass}>{group.label}</label>
                <div className="flex gap-6 mt-1">
                  {group.options.map((val) => (
                    <label key={val} className="inline-flex items-center gap-1">
                      <input
                        type="radio"
                        name={group.name}
                        checked={formData[group.name] === val}
                        onChange={() => handleRadioChange(group.name, val)}
                        className="form-radio text-blue-900"
                      />
                      <span className="capitalize">{val}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="text-center pt-4">
            <button className="bg-blue-900 text-white px-6 py-2 rounded hover:bg-blue-800">
              Save
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
