import React from "react";

/**
 * Reusable pagination component.
 *
 * Props:
 * - page: current page (1-based)
 * - totalPages: total number of pages
 * - totalItems: total number of records
 * - pageSize: records per page
 * - onPageChange: callback(page)
 * - onPageSizeChange: callback(pageSize)
 *
 * Example:
 *
 * <Pagination
 *   page={page}
 *   totalPages={totalPages}
 *   totalItems={totalItems}
 *   pageSize={limit}
 *   onPageChange={setPage}
 *   onPageSizeChange={setLimit}
 * />
 */

const Pagination = ({
  page = 1,
  totalPages = 1,
  totalItems = 0,
  pageSize = 10,

  onPageChange,
  onPageSizeChange,

  pageSizeOptions = [10, 20, 50, 100],

  showPageSize = true,
  showSummary = true,
  showFirstLast = true,

  siblingCount = 1,

  size = "md",

  disabled = false,

  className = "",
}) => {
  const safeTotalPages = Math.max(
    Number(totalPages) || 1,
    1,
  );

  const safePage = Math.min(
    Math.max(Number(page) || 1, 1),
    safeTotalPages,
  );

  const safeTotalItems = Math.max(
    Number(totalItems) || 0,
    0,
  );

  const safePageSize = Math.max(
    Number(pageSize) || 1,
    1,
  );

  const canGoPrevious =
    safePage > 1 && !disabled;

  const canGoNext =
    safePage < safeTotalPages &&
    !disabled;

  const pages = createPageRange(
    safePage,
    safeTotalPages,
    siblingCount,
  );

  const startItem =
    safeTotalItems === 0
      ? 0
      : (safePage - 1) *
          safePageSize +
        1;

  const endItem =
    safeTotalItems === 0
      ? 0
      : Math.min(
          safePage * safePageSize,
          safeTotalItems,
        );

  const handlePageChange = (nextPage) => {
    if (
      disabled ||
      typeof onPageChange !== "function"
    ) {
      return;
    }

    const normalizedPage = Math.min(
      Math.max(nextPage, 1),
      safeTotalPages,
    );

    if (
      normalizedPage !== safePage
    ) {
      onPageChange(normalizedPage);
    }
  };

  const handlePageSizeChange = (
    event,
  ) => {
    const nextPageSize = Number(
      event.target.value,
    );

    if (
      typeof onPageSizeChange !==
      "function"
    ) {
      return;
    }

    onPageSizeChange(nextPageSize);
  };

  if (
    safeTotalItems === 0 &&
    !showPageSize
  ) {
    return null;
  }

  return (
    <nav
      className={[
        "flex w-full flex-col gap-3",
        "border-t border-gray-200 bg-white px-4 py-3",
        "sm:flex-row sm:items-center sm:justify-between",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      aria-label="Pagination"
    >
      {/* ------------------------------------------------------------------ */}
      {/* Summary                                                            */}
      {/* ------------------------------------------------------------------ */}

      {showSummary ? (
        <div
          className={[
            "text-gray-500",
            textSize[size],
          ].join(" ")}
        >
          {safeTotalItems > 0 ? (
            <>
              Showing{" "}
              <span className="font-medium text-gray-700">
                {startItem}
              </span>{" "}
              to{" "}
              <span className="font-medium text-gray-700">
                {endItem}
              </span>{" "}
              of{" "}
              <span className="font-medium text-gray-700">
                {safeTotalItems}
              </span>
            </>
          ) : (
            "No results"
          )}
        </div>
      ) : (
        <div />
      )}

      {/* ------------------------------------------------------------------ */}
      {/* Controls                                                           */}
      {/* ------------------------------------------------------------------ */}

      <div className="flex flex-wrap items-center justify-end gap-3">
        {showPageSize && (
          <PageSizeSelector
            value={safePageSize}
            options={pageSizeOptions}
            onChange={handlePageSizeChange}
            disabled={disabled}
            size={size}
          />
        )}

        <div className="flex items-center gap-1">
          {showFirstLast && (
            <PaginationButton
              label="First"
              ariaLabel="Go to first page"
              disabled={!canGoPrevious}
              onClick={() =>
                handlePageChange(1)
              }
              size={size}
            />
          )}

          <PaginationButton
            icon={<PreviousIcon />}
            ariaLabel="Go to previous page"
            disabled={!canGoPrevious}
            onClick={() =>
              handlePageChange(
                safePage - 1,
              )
            }
            size={size}
          />

          <PageNumbers
            pages={pages}
            currentPage={safePage}
            onPageChange={
              handlePageChange
            }
            disabled={disabled}
            size={size}
          />

          <PaginationButton
            icon={<NextIcon />}
            ariaLabel="Go to next page"
            disabled={!canGoNext}
            onClick={() =>
              handlePageChange(
                safePage + 1,
              )
            }
            size={size}
          />

          {showFirstLast && (
            <PaginationButton
              label="Last"
              ariaLabel="Go to last page"
              disabled={!canGoNext}
              onClick={() =>
                handlePageChange(
                  safeTotalPages,
                )
              }
              size={size}
            />
          )}
        </div>
      </div>
    </nav>
  );
};

/* -------------------------------------------------------------------------- */
/* Page Size Selector                                                         */
/* -------------------------------------------------------------------------- */

const PageSizeSelector = ({
  value,
  options,
  onChange,
  disabled,
  size,
}) => {
  return (
    <label
      className={[
        "flex items-center gap-2 whitespace-nowrap",
        "text-gray-500",
        textSize[size],
      ].join(" ")}
    >
      <span>Rows</span>

      <select
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={[
          "rounded-md border border-gray-300",
          "bg-white text-gray-700",
          "focus:border-blue-500 focus:outline-none",
          "focus:ring-2 focus:ring-blue-500/20",
          selectPadding[size],
        ].join(" ")}
        aria-label="Rows per page"
      >
        {options.map((option) => (
          <option
            key={option}
            value={option}
          >
            {option}
          </option>
        ))}
      </select>
    </label>
  );
};

/* -------------------------------------------------------------------------- */
/* Page Numbers                                                               */
/* -------------------------------------------------------------------------- */

const PageNumbers = ({
  pages,
  currentPage,
  onPageChange,
  disabled,
  size,
}) => {
  return (
    <div className="flex items-center gap-1">
      {pages.map((pageItem, index) => {
        if (pageItem === "ellipsis") {
          return (
            <span
              key={`ellipsis-${index}`}
              className={[
                "flex items-center justify-center",
                "text-gray-400",
                pageButtonSize[size],
              ].join(" ")}
              aria-hidden="true"
            >
              ...
            </span>
          );
        }

        const isActive =
          pageItem === currentPage;

        return (
          <button
            key={pageItem}
            type="button"
            disabled={disabled}
            onClick={() =>
              onPageChange(pageItem)
            }
            aria-label={`Go to page ${pageItem}`}
            aria-current={
              isActive
                ? "page"
                : undefined
            }
            className={[
              "flex items-center justify-center rounded-md",
              "font-medium transition",
              pageButtonSize[size],
              isActive
                ? "bg-blue-600 text-white"
                : "text-gray-600 hover:bg-gray-100",
              disabled
                ? "cursor-not-allowed opacity-50"
                : "",
            ]
              .filter(Boolean)
              .join(" ")}
          >
            {pageItem}
          </button>
        );
      })}
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* Pagination Button                                                          */
/* -------------------------------------------------------------------------- */

const PaginationButton = ({
  label,
  icon,
  ariaLabel,
  disabled,
  onClick,
  size,
}) => {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      aria-label={ariaLabel}
      className={[
        "flex items-center justify-center gap-1 rounded-md",
        "border border-gray-300 bg-white",
        "font-medium text-gray-600 transition",
        "hover:bg-gray-50",
        "focus:outline-none focus:ring-2",
        "focus:ring-blue-500/20",
        paginationButtonPadding[size],
        textSize[size],
        disabled
          ? "cursor-not-allowed opacity-40 hover:bg-white"
          : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {icon}

      {label && (
        <span className="hidden sm:inline">
          {label}
        </span>
      )}
    </button>
  );
};

/* -------------------------------------------------------------------------- */
/* Page Range                                                                 */
/* -------------------------------------------------------------------------- */

const createPageRange = (
  currentPage,
  totalPages,
  siblingCount,
) => {
  if (totalPages <= 7) {
    return Array.from(
      { length: totalPages },
      (_, index) => index + 1,
    );
  }

  const siblingPages = Math.max(
    Number(siblingCount) || 1,
    0,
  );

  const firstPage = 1;
  const lastPage = totalPages;

  const leftBoundary = Math.max(
    currentPage - siblingPages,
    2,
  );

  const rightBoundary = Math.min(
    currentPage + siblingPages,
    totalPages - 1,
  );

  const showLeftEllipsis =
    leftBoundary > 2;

  const showRightEllipsis =
    rightBoundary <
    totalPages - 1;

  const pages = [firstPage];

  if (showLeftEllipsis) {
    pages.push("ellipsis");
  } else {
    for (
      let page = 2;
      page < leftBoundary;
      page += 1
    ) {
      pages.push(page);
    }
  }

  for (
    let page = leftBoundary;
    page <= rightBoundary;
    page += 1
  ) {
    pages.push(page);
  }

  if (showRightEllipsis) {
    pages.push("ellipsis");
  } else {
    for (
      let page =
        rightBoundary + 1;
      page < lastPage;
      page += 1
    ) {
      pages.push(page);
    }
  }

  pages.push(lastPage);

  return pages;
};

/* -------------------------------------------------------------------------- */
/* Icons                                                                      */
/* -------------------------------------------------------------------------- */

const PreviousIcon = () => {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M15 18L9 12L15 6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

const NextIcon = () => {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M9 18L15 12L9 6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

/* -------------------------------------------------------------------------- */
/* Sizes                                                                      */
/* -------------------------------------------------------------------------- */

const textSize = {
  sm: "text-[10px]",
  md: "text-xs",
  lg: "text-sm",
};

const pageButtonSize = {
  sm: "h-7 min-w-7 px-1.5 text-[10px]",
  md: "h-8 min-w-8 px-2 text-xs",
  lg: "h-9 min-w-9 px-2.5 text-sm",
};

const paginationButtonPadding = {
  sm: "h-7 px-2",
  md: "h-8 px-2.5",
  lg: "h-9 px-3",
};

const selectPadding = {
  sm: "h-7 px-1.5 text-[10px]",
  md: "h-8 px-2 text-xs",
  lg: "h-9 px-2.5 text-sm",
};

export default Pagination;
