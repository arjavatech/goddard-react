// Form submission functions from all_form.js
export const submitForm = (editID, number) => {
  const form = document.getElementById("childInfoAdmission");
  if (!form) return;
  
  const formData = new FormData(form);
  const obj = Object.fromEntries(formData);
  
  const currentDate = new Date(obj.admin_sign_date_admission);
  const epochTime = currentDate.getTime();
  obj.admin_sign_date_admission = parseInt(epochTime, 10);
  
  obj.form_year_admission = new Date().getFullYear().toString();
  obj.pointer = number;
  
  const bottleFedValue = document.querySelector('input[name="bottle_fed"]:checked')?.value || null;
  const breastFedValue = document.querySelector('input[name="breast_fed"]:checked')?.value || null;
  obj.bottle_fed = bottleFedValue;
  obj.breast_fed = breastFedValue;
  
  const response = JSON.parse(localStorage.getItem("responseData") || '{}');
  const outputobject = {
    bottle_fed: obj.bottle_fed,
    breast_fed: obj.breast_fed,
    classid: response.classid
  };
  
  outputobject.primary_parent_email = editID || localStorage.getItem('logged_in_email');
  const child_id_val = localStorage.getItem('child_id');
  if (child_id_val) outputobject.child_id = child_id_val;
  
  Object.keys(obj).forEach(key => {
    if (obj[key] !== response[key] && obj[key] !== "") {
      outputobject[key] = obj[key];
    }
  });
  
  // Build parent info objects
  if (response.primary_parent_info) {
    outputobject.primary_parent_info = {
      parent_id: response.primary_parent_info.parent_id,
      parent_name: obj.parent_name,
      parent_street_address: obj.parent_street_address,
      parent_city_address: obj.parent_city_address,
      parent_state_address: obj.parent_state_address,
      parent_zip_address: obj.parent_zip_address,
      home_telephone_number: obj.home_telephone_number,
      business_name: obj.business_name,
      work_hours_from: obj.work_hours_from,
      work_hours_to: obj.work_hours_to,
      business_telephone_number: obj.business_telephone_number,
      business_cell_number: obj.business_cell_number,
      parent_email: obj.primary_parent_email
    };
  }
  
  // Submit form data
  const xhr = new XMLHttpRequest();
  xhr.onload = () => {
    if (xhr.status === 200) {
      const successMsg = document.querySelector(".success-msg");
      if (successMsg) {
        successMsg.style.display = 'block';
        setTimeout(() => {
          successMsg.style.display = 'none';
          sessionStorage.setItem('putcallId', localStorage.getItem('child_id'));
          window.location.href = `./parent_dashboard.html?id=${editID}`;
        }, 3000);
      }
    } else {
      const errorMsg = document.querySelector(".error-msg");
      if (errorMsg) {
        errorMsg.style.display = 'block';
        setTimeout(() => errorMsg.style.display = 'none', 3000);
      }
    }
  };
  xhr.open("PUT", `https://v2bvjzsgrk.execute-api.ap-south-1.amazonaws.com/test/admission_segment/${child_id_val}`);
  xhr.setRequestHeader("Content-Type", "application/json");
  xhr.send(JSON.stringify(outputobject));
};

export const authorizationSubmitForm = (editID, number) => {
  const form = document.getElementById("childInfoAuthorization");
  if (!form) return;
  
  const formData = new FormData(form);
  const obj = Object.fromEntries(formData);
  
  const currentDate = new Date(obj.admin_sign_date_ach);
  obj.admin_sign_date_ach = parseInt(currentDate.getTime(), 10);
  obj.form_year_ach = new Date().getFullYear().toString();
  obj.pointer = number;
  
  const response = JSON.parse(localStorage.getItem("responseData") || '{}');
  const outputobject = {};
  outputobject.primary_parent_email = editID || localStorage.getItem('logged_in_email');
  const child_id_val = localStorage.getItem('child_id');
  if (child_id_val) outputobject.child_id = child_id_val;
  
  Object.keys(obj).forEach(key => {
    if (obj[key] !== response[key] && obj[key] !== "") {
      outputobject[key] = obj[key];
    }
  });
  
  const xhr = new XMLHttpRequest();
  xhr.onload = () => {
    if (xhr.status === 200) {
      const successMsg = document.querySelector(".success-msg");
      if (successMsg) {
        successMsg.style.display = 'block';
        setTimeout(() => {
          successMsg.style.display = 'none';
          sessionStorage.setItem('putcallId', localStorage.getItem('child_id'));
          window.location.href = `./parent_dashboard.html?id=${editID}`;
        }, 3000);
      }
    } else {
      const errorMsg = document.querySelector(".error-msg");
      if (errorMsg) {
        errorMsg.style.display = 'block';
        setTimeout(() => errorMsg.style.display = 'none', 3000);
      }
    }
  };
  xhr.open("PUT", `https://v2bvjzsgrk.execute-api.ap-south-1.amazonaws.com/test/authorization_form/update/${child_id_val}`);
  xhr.setRequestHeader("Content-Type", "application/json");
  xhr.send(JSON.stringify(outputobject));
};

export const enrollmentSubmitForm = (editID, number) => {
  const form = document.getElementById("childInfoEnrollment");
  if (!form) return;
  
  const formData = new FormData(form);
  const obj = Object.fromEntries(formData);
  
  const currentDate = new Date(obj.admin_sign_date_enroll);
  obj.admin_sign_date_enroll = parseInt(currentDate.getTime(), 10);
  obj.form_year_enroll = new Date().getFullYear().toString();
  obj.pointer = number;
  
  const response = JSON.parse(localStorage.getItem("responseData") || '{}');
  const outputobject = {};
  outputobject.primary_parent_email = editID || localStorage.getItem('logged_in_email');
  const child_id_val = localStorage.getItem('child_id');
  if (child_id_val) outputobject.child_id = child_id_val;
  
  Object.keys(obj).forEach(key => {
    if (obj[key] !== response[key] && obj[key] !== "") {
      outputobject[key] = obj[key];
    }
  });
  
  const xhr = new XMLHttpRequest();
  xhr.onload = () => {
    if (xhr.status === 200) {
      const successMsg = document.querySelector(".success-msg");
      if (successMsg) {
        successMsg.style.display = 'block';
        setTimeout(() => {
          successMsg.style.display = 'none';
          sessionStorage.setItem('putcallId', localStorage.getItem('child_id'));
          window.location.href = `./parent_dashboard.html?id=${editID}`;
        }, 3000);
      }
    } else {
      const errorMsg = document.querySelector(".error-msg");
      if (errorMsg) {
        errorMsg.style.display = 'block';
        setTimeout(() => errorMsg.style.display = 'none', 3000);
      }
    }
  };
  xhr.open("PUT", `https://v2bvjzsgrk.execute-api.ap-south-1.amazonaws.com/test/enrollment_form/update/${child_id_val}`);
  xhr.setRequestHeader("Content-Type", "application/json");
  xhr.send(JSON.stringify(outputobject));
};