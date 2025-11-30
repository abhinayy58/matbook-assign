import { request } from "./client";

const adminFormsBaseKey = ["admin", "forms"];
export const adminFormsKeys = {
  all: adminFormsBaseKey,
  detail: (id) => [...adminFormsBaseKey, id],
  submissions: (id) => [...adminFormsBaseKey, id, "submissions"],
};

export function fetchAdminForms() {
  return request("/admin/forms");
}

export function fetchAdminForm(id) {
  return request(`/admin/forms/${id}`);
}

export function createForm(payload) {
  return request("/admin/forms", {
    method: "POST",
    body: payload,
  });
}

export function updateForm(id, payload) {
  return request(`/admin/forms/${id}`, {
    method: "PATCH",
    body: payload,
  });
}

export function deleteForm(id) {
  return request(`/admin/forms/${id}`, {
    method: "DELETE",
  });
}

export function reorderFormFields(id, order) {
  return request(`/admin/forms/${id}/fields/reorder`, {
    method: "POST",
    body: { order },
  });
}

export function fetchPublicForms() {
  return request("/forms");
}

export function fetchPublicForm(id) {
  return request(`/forms/${id}`);
}

export function submitPublicForm(id, answers, metadata) {
  return request(`/forms/${id}/submissions`, {
    method: "POST",
    body: { answers, metadata },
  });
}

export function fetchSubmissions(id, page = 1, pageSize = 20) {
  const query = new URLSearchParams({
    page: String(page),
    pageSize: String(pageSize),
  });
  return request(`/admin/forms/${id}/submissions?${query.toString()}`);
}

