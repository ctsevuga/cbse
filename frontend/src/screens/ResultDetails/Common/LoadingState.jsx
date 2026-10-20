import React from "react";

/**
 * Generic loading state component.
 *
 * Variants:
 * - spinner
 * - skeleton
 * - table
 * - inline
 * - page
 *
 * Examples:
 * <LoadingState />
 * <LoadingState variant="skeleton" />
 * <LoadingState variant="table" rows={5} columns={6} />
 * <LoadingState variant="page" message="Loading result..." />
 */

const LoadingState = ({
  loading = true,

  variant = "spinner",

  message = "Loading...",
  description,

  size = "md",

  rows = 5,
  columns = 4,

  showMessage = true,

  className = "",
}) => {
  if (!loading) {
    return null;
  }

  if (variant === "inline") {
    return (
      <InlineLoadingState
        message={message}
        size={size}
        showMessage={showMessage}
        className={className}
      />
    );
  }

  if (variant === "skeleton") {
    return (
      <SkeletonLoadingState
        rows={rows}
        size={size}
        className={className}
      />
    );
  }

  if (variant === "table") {
    return (
      <TableLoadingState
        rows={rows}
        columns={columns}
        size={size}
        className={className}
      />
    );
  }

  if (variant === "page") {
    return (
      <PageLoadingState
        message={message}
        description={description}
        size={size}
        showMessage={showMessage}
        className={className}
      />
    );
  }

  return (
    <SpinnerLoadingState
      message={message}
      size={size}
      showMessage={showMessage}
      className={className}
    />
  );
};

/* -------------------------------------------------------------------------- */
/* Spinner                                                                    */
/* -------------------------------------------------------------------------- */

const SpinnerLoadingState = ({
  message,
  size,
  showMessage,
  className,
}) => {
  return (
    <div
      className={[
        "flex flex-col items-center justify-center py-10",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      role="status"
      aria-live="polite"
    >
      <LoadingSpinner size={size} />

      {showMessage && message && (
        <p
          className={[
            "mt-3 text-gray-500",
            textSize[size],
          ].join(" ")}
        >
          {message}
        </p>
      )}
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* Inline                                                                    */
/* -------------------------------------------------------------------------- */

const InlineLoadingState = ({
  message,
  size,
  showMessage,
  className,
}) => {
  return (
    <span
      className={[
        "inline-flex items-center gap-2",
        "text-gray-500",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      role="status"
      aria-live="polite"
    >
      <LoadingSpinner size={size} />

      {showMessage && message && (
        <span className={textSize[size]}>
          {message}
        </span>
      )}
    </span>
  );
};

/* -------------------------------------------------------------------------- */
/* Page                                                                       */
/* -------------------------------------------------------------------------- */

const PageLoadingState = ({
  message,
  description,
  size,
  showMessage,
  className,
}) => {
  return (
    <div
      className={[
        "flex min-h-[50vh] w-full",
        "items-center justify-center",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      role="status"
      aria-live="polite"
    >
      <div className="flex max-w-sm flex-col items-center text-center">
        <div
          className={[
            "flex items-center justify-center rounded-full",
            "bg-blue-50",
            pageIconSize[size],
          ].join(" ")}
        >
          <LoadingSpinner size={size} />
        </div>

        {showMessage && message && (
          <h3
            className={[
              "mt-5 font-semibold text-gray-800",
              pageTitleSize[size],
            ].join(" ")}
          >
            {message}
          </h3>
        )}

        {description && (
          <p
            className={[
              "mt-2 text-gray-500",
              textSize[size],
            ].join(" ")}
          >
            {description}
          </p>
        )}
      </div>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* Skeleton                                                                   */
/* -------------------------------------------------------------------------- */

const SkeletonLoadingState = ({
  rows,
  size,
  className,
}) => {
  return (
    <div
      className={[
        "w-full animate-pulse space-y-4",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      role="status"
      aria-label="Loading content"
    >
      {Array.from({
        length: rows,
      }).map((_, index) => (
        <div
          key={index}
          className="flex items-center gap-3"
        >
          <div
            className={[
              "shrink-0 rounded-full bg-gray-200",
              skeletonAvatarSize[size],
            ].join(" ")}
          />

          <div className="min-w-0 flex-1 space-y-2">
            <div
              className={[
                "rounded bg-gray-200",
                skeletonTitleWidth[index % 3],
                skeletonHeight[size],
              ].join(" ")}
            />

            <div
              className={[
                "rounded bg-gray-100",
                skeletonDescriptionWidth[
                  index % 3
                ],
                skeletonSmallHeight[size],
              ].join(" ")}
            />
          </div>
        </div>
      ))}
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* Table                                                                      */
/* -------------------------------------------------------------------------- */

const TableLoadingState = ({
  rows,
  columns,
  size,
  className,
}) => {
  return (
    <div
      className={[
        "w-full overflow-hidden rounded-lg border",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      role="status"
      aria-label="Loading table"
    >
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-gray-50">
              {Array.from({
                length: columns,
              }).map((_, index) => (
                <th
                  key={index}
                  className="px-4 py-3"
                >
                  <div
                    className={[
                      "animate-pulse rounded bg-gray-200",
                      tableHeaderWidth[
                        index % 4
                      ],
                      skeletonHeight[size],
                    ].join(" ")}
                  />
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {Array.from({
              length: rows,
            }).map((_, rowIndex) => (
              <tr
                key={rowIndex}
                className="border-b last:border-b-0"
              >
                {Array.from({
                  length: columns,
                }).map((_, columnIndex) => (
                  <td
                    key={columnIndex}
                    className="px-4 py-3"
                  >
                    <div
                      className={[
                        "animate-pulse rounded bg-gray-100",
                        tableCellWidth[
                          columnIndex % 5
                        ],
                        skeletonHeight[size],
                      ].join(" ")}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* Spinner                                                                    */
/* -------------------------------------------------------------------------- */

const LoadingSpinner = ({
  size = "md",
}) => {
  return (
    <span
      className={[
        "inline-block animate-spin rounded-full",
        "border-2 border-gray-200",
        "border-t-blue-600",
        spinnerSize[size],
      ].join(" ")}
      aria-hidden="true"
    />
  );
};

/* -------------------------------------------------------------------------- */
/* Sizes                                                                      */
/* -------------------------------------------------------------------------- */

const spinnerSize = {
  sm: "h-3 w-3",
  md: "h-5 w-5",
  lg: "h-8 w-8",
};

const textSize = {
  sm: "text-[10px]",
  md: "text-xs",
  lg: "text-sm",
};

const pageIconSize = {
  sm: "h-12 w-12",
  md: "h-16 w-16",
  lg: "h-20 w-20",
};

const pageTitleSize = {
  sm: "text-sm",
  md: "text-base",
  lg: "text-lg",
};

const skeletonAvatarSize = {
  sm: "h-6 w-6",
  md: "h-8 w-8",
  lg: "h-10 w-10",
};

const skeletonHeight = {
  sm: "h-2",
  md: "h-2.5",
  lg: "h-3",
};

const skeletonSmallHeight = {
  sm: "h-1.5",
  md: "h-2",
  lg: "h-2.5",
};

/* -------------------------------------------------------------------------- */
/* Skeleton widths                                                            */
/* -------------------------------------------------------------------------- */

const skeletonTitleWidth = [
  "w-2/5",
  "w-3/5",
  "w-1/2",
];

const skeletonDescriptionWidth = [
  "w-3/5",
  "w-2/5",
  "w-4/5",
];

const tableHeaderWidth = [
  "w-16",
  "w-20",
  "w-24",
  "w-14",
];

const tableCellWidth = [
  "w-20",
  "w-24",
  "w-16",
  "w-28",
  "w-12",
];

export default LoadingState;
