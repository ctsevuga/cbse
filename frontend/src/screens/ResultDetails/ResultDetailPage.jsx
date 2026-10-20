import React from "react";
import { useParams } from "react-router-dom";

import ResultDetailsByResultPage from "./ResultDetailsByResultPage";

/**
 * ResultDetailPage
 *
 * Route-level page for viewing the complete details
 * of a single Result.
 *
 * Example route:
 *
 * /results/:resultId
 *
 * Example:
 *
 * <Route
 *   path="/results/:resultId"
 *   element={<ResultDetailPage />}
 * />
 *
 * Data fetching is delegated to:
 *
 * ResultDetailsByResultPage
 *   └── useGetResultDetailsByResultQuery
 */

const ResultDetailPage = ({
  resultId: providedResultId,
  result,

  showSummary = true,
  showFilters = true,
  showSubjectAnalysis = true,
  showEvaluationQueue = false,
  showActions = true,

  pageSize = 10,

  className = "",
}) => {
  const params = useParams();

  /*
   * Allow the component to work in both situations:
   *
   * 1. <ResultDetailPage />
   *    where resultId comes from the route.
   *
   * 2. <ResultDetailPage resultId="..." />
   *    where the parent explicitly provides it.
   */
  const resultId =
    providedResultId ||
    params.resultId ||
    params.id;

  return (
    <main
      className={[
        "min-h-screen bg-gray-50",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* ============================================================ */}
        {/* Page Header                                                    */}
        {/* ============================================================ */}

        <div className="mb-6">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-gray-900 sm:text-2xl">
              Result Details
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              View question-level performance,
              marks, evaluation status, and
              subject-wise analysis.
            </p>
          </div>
        </div>

        {/* ============================================================ */}
        {/* Result Content                                                 */}
        {/* ============================================================ */}

        <ResultDetailsByResultPage
          resultId={resultId}
          result={result}
          showSummary={showSummary}
          showFilters={showFilters}
          showSubjectAnalysis={
            showSubjectAnalysis
          }
          showEvaluationQueue={
            showEvaluationQueue
          }
          showActions={showActions}
          pageSize={pageSize}
        />
      </div>
    </main>
  );
};

export default ResultDetailPage;
