const employeeForm = document.getElementById("employeeForm");
const employeeId = document.getElementById("employeeId");
const employeeName = document.getElementById("employeeName");
const employeeEmail = document.getElementById("employeeEmail");
const employeeBranch = document.getElementById("employeeBranch");
const employeeRole = document.getElementById("employeeRole");
const employeePhoto = document.getElementById("employeePhoto");
const employeeActive = document.getElementById("employeeActive");
const refreshEmployees = document.getElementById("refreshEmployees");
const clearEmployeeForm = document.getElementById("clearEmployeeForm");
const employeeGrid = document.getElementById("employeeGrid");
const adminStatus = document.getElementById("adminStatus");
const adminTabs = document.querySelectorAll("[data-admin-tab]");
const staffSection = document.getElementById("staffSection");
const externalSection = document.getElementById("externalSection");
const externalSettingsForm = document.getElementById("externalSettingsForm");
const uploadUrl = document.getElementById("uploadUrl");
const supabaseUrl = document.getElementById("supabaseUrl");
const supabaseKey = document.getElementById("supabaseKey");
const supabaseBucket = document.getElementById("supabaseBucket");
const branchSite = document.getElementById("branchSite");
const emailFunctionUrl = document.getElementById("emailFunctionUrl");

let employees = [];

const SETTINGS = {
  uploadUrl: "dtr-upload-url",
  supabaseUrl: "dtr-supabase-url",
  supabaseKey: "dtr-supabase-key",
  supabaseBucket: "dtr-supabase-bucket",
  branchSite: "dtr-branch-site",
  emailFunctionUrl: "dtr-email-function-url",
};

function setAdminStatus(message) {
  adminStatus.textContent = message;
}

function getSupabaseConfig() {
  const url = (localStorage.getItem("dtr-supabase-url") || "").replace(/\/$/, "");
  const key = localStorage.getItem("dtr-supabase-key") || "";
  const bucket = localStorage.getItem("dtr-supabase-bucket") || "attendance-evidence";

  if (!url || !key || !bucket) {
    throw new Error("Missing Supabase URL, anon key, or bucket. Save them in External Link first.");
  }

  return { url, key, bucket };
}

function showAdminTab(tab) {
  adminTabs.forEach((button) => button.classList.toggle("active", button.dataset.adminTab === tab));
  staffSection.classList.toggle("active", tab === "staff");
  externalSection.classList.toggle("active", tab === "external");
}

function loadExternalSettings() {
  uploadUrl.value = localStorage.getItem(SETTINGS.uploadUrl) || "";
  supabaseUrl.value = localStorage.getItem(SETTINGS.supabaseUrl) || "";
  supabaseKey.value = localStorage.getItem(SETTINGS.supabaseKey) || "";
  supabaseBucket.value = localStorage.getItem(SETTINGS.supabaseBucket) || "attendance-evidence";
  branchSite.value = localStorage.getItem(SETTINGS.branchSite) || "";
  emailFunctionUrl.value = localStorage.getItem(SETTINGS.emailFunctionUrl) || "";
}

function saveExternalSettings(event) {
  event.preventDefault();
  localStorage.setItem(SETTINGS.uploadUrl, uploadUrl.value.trim());
  localStorage.setItem(SETTINGS.supabaseUrl, supabaseUrl.value.trim());
  localStorage.setItem(SETTINGS.supabaseKey, supabaseKey.value.trim());
  localStorage.setItem(SETTINGS.supabaseBucket, supabaseBucket.value.trim() || "attendance-evidence");
  localStorage.setItem(SETTINGS.branchSite, branchSite.value.trim());
  localStorage.setItem(SETTINGS.emailFunctionUrl, emailFunctionUrl.value.trim());
  setAdminStatus("External links saved. Scanner timestamp and GPS location are automatic.");
}

async function supabaseFetch(path, options = {}) {
  const config = getSupabaseConfig();
  const response = await fetch(`${config.url}${path}`, {
    ...options,
    headers: {
      apikey: config.key,
      Authorization: `Bearer ${config.key}`,
      ...(options.headers || {}),
    },
  });

  if (!response.ok) {
    throw new Error(await response.text());
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

async function uploadProfilePhoto(idCode, file) {
  if (!file) {
    return "";
  }

  const config = getSupabaseConfig();
  const extension = file.name.split(".").pop() || "jpg";
  const path = `profiles/${idCode}-${Date.now()}.${extension}`;
  const response = await fetch(`${config.url}/storage/v1/object/${config.bucket}/${path}`, {
    method: "POST",
    headers: {
      apikey: config.key,
      Authorization: `Bearer ${config.key}`,
      "Content-Type": file.type || "image/jpeg",
      "x-upsert": "true",
    },
    body: file,
  });

  if (!response.ok) {
    throw new Error(await response.text());
  }

  return `${config.url}/storage/v1/object/public/${config.bucket}/${path}`;
}

async function saveEmployee(event) {
  event.preventDefault();
  const idCode = employeeId.value.trim();
  if (!idCode) {
    setAdminStatus("Employee ID is required.");
    return;
  }

  try {
    setAdminStatus("Saving staff profile...");
    const existing = employees.find((employee) => employee.employee_id === idCode);
    const uploadedPhotoUrl = await uploadProfilePhoto(idCode, employeePhoto.files[0]);
    const payload = {
      employee_id: idCode,
      full_name: employeeName.value.trim(),
      email: employeeEmail.value.trim(),
      branch_site: employeeBranch.value.trim(),
      role: employeeRole.value,
      active: employeeActive.checked,
      registered_photo_url: uploadedPhotoUrl || existing?.registered_photo_url || "",
    };

    await supabaseFetch("/rest/v1/employees?on_conflict=employee_id", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Prefer: "resolution=merge-duplicates,return=minimal",
      },
      body: JSON.stringify(payload),
    });

    setAdminStatus(`${idCode} saved.`);
    employeeForm.reset();
    employeeActive.checked = true;
    await loadEmployees();
  } catch (error) {
    setAdminStatus(`Save failed: ${error.message}`);
  }
}

function editEmployee(employee) {
  employeeId.value = employee.employee_id || "";
  employeeName.value = employee.full_name || "";
  employeeEmail.value = employee.email || "";
  employeeBranch.value = employee.branch_site || "";
  employeeRole.value = employee.role || "staff";
  employeeActive.checked = employee.active !== false;
  setAdminStatus(`Editing ${employee.employee_id}. Choose a new photo only if you want to replace it.`);
}

async function loadEmployees() {
  try {
    setAdminStatus("Loading staff...");
    employees = await supabaseFetch("/rest/v1/employees?select=*&order=created_at.desc");
    renderEmployees();
    setAdminStatus(`${employees.length} staff loaded.`);
  } catch (error) {
    employeeGrid.innerHTML = "";
    setAdminStatus(error.message);
  }
}

function renderEmployees() {
  employeeGrid.innerHTML = employees.map((employee) => `
    <article class="employee-card">
      <img src="${employee.registered_photo_url || ""}" alt="" onerror="this.hidden=true" />
      <div>
        <strong>${employee.full_name || "No name"}</strong>
        <small>${employee.employee_id || ""}</small>
        <small>${employee.email || ""}</small>
        <small>${employee.branch_site || ""}</small>
        <span class="badge ${employee.active ? "" : "failed"}">${employee.active ? "ACTIVE" : "INACTIVE"}</span>
      </div>
      <button type="button" data-employee="${employee.employee_id}">Edit</button>
    </article>
  `).join("");

  employeeGrid.querySelectorAll("[data-employee]").forEach((button) => {
    button.addEventListener("click", () => {
      const employee = employees.find((row) => row.employee_id === button.dataset.employee);
      if (employee) {
        editEmployee(employee);
      }
    });
  });
}

employeeForm.addEventListener("submit", saveEmployee);
refreshEmployees.addEventListener("click", loadEmployees);
externalSettingsForm.addEventListener("submit", saveExternalSettings);
adminTabs.forEach((button) => {
  button.addEventListener("click", () => showAdminTab(button.dataset.adminTab));
});
clearEmployeeForm.addEventListener("click", () => {
  employeeForm.reset();
  employeeActive.checked = true;
  setAdminStatus("Form cleared.");
});

loadExternalSettings();
loadEmployees();
