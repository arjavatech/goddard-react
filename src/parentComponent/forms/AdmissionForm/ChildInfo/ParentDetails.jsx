import React, { useState } from 'react';

export default function ParentDetails({isOpen, onToggle}) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    parentName: 'kalai',
    street: 'rajiv nagar',
    city: 'sivagangai',
    state: 'tamilnadu',
    zip: '12345',
    phone: '1(555) 555-1234',
    cell: '1(555) 555-1234',
    email: 'kalai.arjava@gmail.com',
    workName: 'rtyruf',
    workFrom: '10',
    workTo: '10',
    workPhone: '1(555) 555-1234',
  });

  const isFilled = (field) => formData[field]?.trim() !== '';
  const inputClass = (field, readOnly = false) =>
    `w-full rounded px-3 py-2 border ${
      isFilled(field) ? 'border-green-500' : 'border-red-500'
    } ${readOnly ? 'bg-gray-100 cursor-not-allowed' : ''}`;

  const labelClass = 'block text-sm font-bold mb-1';
  const completed = Object.values(formData).every((val) => val && val.trim() !== '');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="border shadow rounded">
      <button
        className={`w-full px-4 py-3 font-bold flex justify-between items-center ${
            isOpen ? 'bg-blue-900 text-white' : 'bg-blue-200 text-black'
        }`}
        onClick={onToggle}
      >
        <span>Parent Details</span>
        <div className="flex items-center gap-2">
          {completed && <img src="/image/tick.png" alt="tick" className="w-5 h-5" />}
          <span>{isOpen ? '▲' : '▼'}</span>
        </div>
      </button>

      {isOpen && (
        <div className="p-4 bg-white space-y-6">
          <div>
            <label className={labelClass}>PARENT’S / LEGAL GUARDIAN’S NAME</label>
            <input
              type="text"
              name="parentName"
              value={formData.parentName}
              onChange={handleChange}
              className={inputClass('parentName')}
            />
          </div>

          <h3 className="font-bold text-center">HOME ADDRESS</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className={labelClass}>STREET</label>
              <input
                type="text"
                name="street"
                value={formData.street}
                onChange={handleChange}
                className={inputClass('street')}
              />
            </div>
            <div>
              <label className={labelClass}>CITY</label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                className={inputClass('city')}
              />
            </div>
            <div>
              <label className={labelClass}>STATE</label>
              <input
                type="text"
                name="state"
                value={formData.state}
                onChange={handleChange}
                className={inputClass('state')}
              />
            </div>
            <div>
              <label className={labelClass}>ZIP</label>
              <input
                type="text"
                name="zip"
                value={formData.zip}
                onChange={handleChange}
                className={inputClass('zip')}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className={labelClass}>TELEPHONE NUMBER</label>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className={inputClass('phone')}
              />
            </div>
            <div>
              <label className={labelClass}>CELL NUMBER</label>
              <input
                type="text"
                name="cell"
                value={formData.cell}
                onChange={handleChange}
                className={inputClass('cell')}
              />
            </div>
            <div>
              <label className={labelClass}>EMAIL ADDRESS</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                readOnly
                className={inputClass('email', true)}
              />
            </div>
          </div>

          <h3 className="font-bold text-center">BUSINESS DETAILS</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className={labelClass}>NAME</label>
              <input
                type="text"
                name="workName"
                value={formData.workName}
                onChange={handleChange}
                className={inputClass('workName')}
              />
            </div>
            <div>
              <label className={labelClass}>WORK HOURS FROM</label>
              <input
                type="text"
                name="workFrom"
                value={formData.workFrom}
                onChange={handleChange}
                className={inputClass('workFrom')}
              />
            </div>
            <div>
              <label className={labelClass}>WORK HOURS TO</label>
              <input
                type="text"
                name="workTo"
                value={formData.workTo}
                onChange={handleChange}
                className={inputClass('workTo')}
              />
            </div>
            <div>
              <label className={labelClass}>TELEPHONE NUMBER</label>
              <input
                type="text"
                name="workPhone"
                value={formData.workPhone}
                onChange={handleChange}
                className={inputClass('workPhone')}
              />
            </div>
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