import { useCallback, useContext, useEffect } from "react";
import { useParams } from "react-router";

import InterviewContext from "../contexts/interview.context.js";
import {
  generateInterviewReport,
  getAllInterviewReports,
  getInterviewReportById,
  generateResumePdf,
} from "../services/interview.api.js";

export function useInterview() {
  const context = useContext(InterviewContext);
  const { reportId } = useParams();

  if (!context) {
    throw new Error("useInterview must be used within an InterviewProvider");
  }

  const { loading, setLoading, report, setReport, reports, setReports } =
    context;

  const generateReport = useCallback(
    async (jobDescription, selfDescription, resumeFile) => {
      setLoading(true);
      try {
        const response = await generateInterviewReport(
          jobDescription,
          selfDescription,
          resumeFile,
        );
        setReport(response.interviewReport);
        return response.interviewReport;
      } catch (error) {
        console.error(error);
        return false;
      } finally {
        setLoading(false);
      }
    },
    [setLoading, setReport],
  );

  const getReportById = useCallback(
    async (id) => {
      setLoading(true);
      try {
        const response = await getInterviewReportById(id);
        setReport(response.interviewReport);
        return response.interviewReport;
      } catch (error) {
        console.error(error);
        return false;
      } finally {
        setLoading(false);
      }
    },
    [setLoading, setReport],
  );

  const getReports = useCallback(async () => {
    setLoading(true);

    try {
      const response = await getAllInterviewReports();
      setReports(response.interviewReports);
      return response.interviewReports;
    } catch (error) {
      console.error(error);
      return [];
    } finally {
      setLoading(false);
    }
  }, [setLoading, setReports]);

  const getResumePdf = useCallback(
    async (interviewReportId) => {
      setLoading(true);

      try {
        const response = await generateResumePdf({ interviewReportId });
        const url = window.URL.createObjectURL(
          new Blob([response], { type: "application/pdf" }),
        );
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", `resume_${interviewReportId}.pdf`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    },
    [setLoading],
  );

  useEffect(() => {
    if (reportId) {
      getReportById(reportId);
    } else {
      getReports();
    }
  }, [reportId, getReportById, getReports]);

  return {
    loading,
    report,
    reports,
    generateReport,
    getReportById,
    getReports,
    getResumePdf,
  };
}
