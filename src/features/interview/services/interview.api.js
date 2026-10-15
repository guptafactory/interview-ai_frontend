import axios from "axios";
import { env } from "../../../config/env.js";

const api = axios.create({
  baseURL: env.apiBaseUrl,
  withCredentials: true,
});

/**
 * @description Service to generate interview report based on user self description, resume and job description.
 */
async function generateInterviewReport(
  jobDescription,
  selfDescription,
  resumeFile,
) {
  const formData = new FormData();
  formData.append("jobDescription", jobDescription);
  formData.append("selfDescription", selfDescription);

  if (resumeFile) {
    formData.append("resume", resumeFile);
  }

  const response = await api.post("/interview/report/create", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
}

/**
 * @description Service to get interview report by reportId.
 */
async function getInterviewReportById(reportId) {
  const response = await api.get(`interview/report/${reportId}`);

  return response.data;
}

/**
 * @description Service to get all interview reports of logged in user.
 */
async function getAllInterviewReports() {
  const response = await api.get("/interview/report/all");

  return response.data;
}

/**
 * @description Service to generate resume pdf based on user self description, resume content and job description.
 */
async function generateResumePdf({ interviewReportId }) {
  const response = await api.post(
    `/interview/resume/${interviewReportId}`,
    null,
    {
      responseType: "blob",
    },
  );

  return response.data;
}

export {
  generateInterviewReport,
  getInterviewReportById,
  getAllInterviewReports,
  generateResumePdf,
};
