// ResultDetailsPage.jsx

import React, { useState } from "react";
import {
  useGetResultDetailsQuery,
  useDeleteResultDetailMutation,
} from "../../slices/resultDetailApiSlice";

import ResultDetailFilters from "./ResultDetail/ResultDetailFilters";
import ResultDetailTable from "./ResultDetail/ResultDetailTable";
import ResultDetailViewDrawer from "./ResultDetail/ResultDetailViewDrawer";
import ResultDetailDeleteDialog from "./ResultDetail/ResultDetailDeleteDialog";

const ResultDetailsViewPage = () => {
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    result: "",
    subject: "",
    chapter: "",
    topic: "",
    questionType: "",
    evaluationStatus: "",
  });

  const [selectedResultDetailId, setSelectedResultDetailId] =
    useState(null);

  const [deleteResultDetailId, setDeleteResultDetailId] =
    useState(null);

  const {
    data,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useGetResultDetailsQuery(filters);

  const [deleteResultDetail, { isLoading: isDeleting }] =
    useDeleteResultDetailMutation();

  const resultDetails = data?.data || data?.resultDetails || [];

  const pagination = data?.pagination || {
    page: filters.page,
    limit: filters.limit,
    total: resultDetails.length,
    totalPages: 1,
  };

  const handleFilterChange = (name, value) => {
    setFilters((previous) => ({
      ...previous,
      [name]: value,
      page: 1,
    }));
  };

  const handleResetFilters = () => {
    setFilters({
      page: 1,
      limit: 10,
      result: "",
      subject: "",
      chapter: "",
      topic: "",
      questionType: "",
      evaluationStatus: "",
    });
  };

  const handlePageChange = (page) => {
    setFilters((previous) => ({
      ...previous,
      page,
    }));
  };

  const handleView = (resultDetail) => {
    setSelectedResultDetailId(resultDetail._id);
  };

  const handleDeleteRequest = (resultDetail) => {
    setDeleteResultDetailId(resultDetail._id);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteResultDetailId) return;

    try {
      await deleteResultDetail(deleteResultDetailId).unwrap();

      setDeleteResultDetailId(null);
    } catch (error) {
      console.error("Failed to delete result detail:", error);
    }
  };

  const handleCloseView = () => {
    setSelectedResultDetailId(null);
  };

  return (
    <div className="space-y-6 p-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">
            Result Details
          </h1>

          <p className="mt-1 text-sm text-muted-foreground">
            Manage and review question-level result details.
          </p>
        </div>

        <button
          type="button"
          onClick={refetch}
          disabled={isFetching}
          className="rounded-md border px-4 py-2 text-sm"
        >
          {isFetching ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {/* Filters */}
      <ResultDetailFilters
        filters={filters}
        onFilterChange={handleFilterChange}
        onReset={handleResetFilters}
      />

      {/* Error */}
      {isError && (
        <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-600">
          {error?.data?.message ||
            "Failed to load result details."}
        </div>
      )}

      {/* Table */}
      <ResultDetailTable
        resultDetails={resultDetails}
        isLoading={isLoading}
        isFetching={isFetching}
        onView={handleView}
        onDelete={handleDeleteRequest}
      />

      {/* Pagination */}
      {!isLoading && resultDetails.length > 0 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Page {pagination.page} of {pagination.totalPages}
          </p>

          <div className="flex gap-2">
            <button
              type="button"
              disabled={pagination.page <= 1}
              onClick={() =>
                handlePageChange(pagination.page - 1)
              }
              className="rounded-md border px-3 py-2 text-sm disabled:opacity-50"
            >
              Previous
            </button>

            <button
              type="button"
              disabled={
                pagination.page >= pagination.totalPages
              }
              onClick={() =>
                handlePageChange(pagination.page + 1)
              }
              className="rounded-md border px-3 py-2 text-sm disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* View Drawer */}
      <ResultDetailViewDrawer
        resultDetailId={selectedResultDetailId}
        open={Boolean(selectedResultDetailId)}
        onClose={handleCloseView}
      />

      {/* Delete Dialog */}
      <ResultDetailDeleteDialog
        open={Boolean(deleteResultDetailId)}
        resultDetailId={deleteResultDetailId}
        isDeleting={isDeleting}
        onCancel={() => setDeleteResultDetailId(null)}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
};

export default ResultDetailsViewPage;
