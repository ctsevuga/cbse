import React from "react";

const MarksDisplay = ({
  obtainedMarks = 0,
  maximumMarks,

  showMaximum = true,
  showPercentage = false,

  size = "md",
  layout = "inline",

  color = "default",
  percentage,

  label,

  className = "",
}) => {
  const obtained = toNumber(obtainedMarks);
  const maximum =
    maximumMarks === undefined ||
    maximumMarks === null
      ? null
      : toNumber(maximumMarks);

  const calculatedPercentage =
    percentage !== undefined &&
    percentage !== null
      ? toNumber(percentage)
      : maximum !== null && maximum > 0
        ? (obtained / maximum) * 100
        : null;

  const formattedObtained =
    formatMarks(obtained);

  const formattedMaximum =
    maximum !== null
      ? formatMarks(maximum)
      : null;

  const formattedPercentage =
    calculatedPercentage !== null
      ? `${calculatedPercentage.toFixed(1)}%`
      : null;

  const sizeClasses = getSizeClasses(size);
  const valueColor = getColorClass(
    color,
    calculatedPercentage,
  );

  if (layout === "stacked") {
    return (
      <div
        className={[
          "inline-flex flex-col",
          sizeClasses.container,
          className,
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {label && (
          <span
            className={[
              "text-gray-400",
              sizeClasses.label,
            ].join(" ")}
          >
            {label}
          </span>
        )}

        <div className="flex items-baseline gap-1">
          <span
            className={[
              "font-semibold",
              valueColor,
              sizeClasses.value,
            ].join(" ")}
          >
            {formattedObtained}
          </span>

          {showMaximum &&
            formattedMaximum !== null && (
              <>
                <span
                  className={[
                    "font-normal text-gray-400",
                    sizeClasses.maximum,
                  ].join(" ")}
                >
                  /
                </span>

                <span
                  className={[
                    "font-medium text-gray-500",
                    sizeClasses.maximum,
                  ].join(" ")}
                >
                  {formattedMaximum}
                </span>
              </>
            )}
        </div>

        {showPercentage &&
          formattedPercentage !== null && (
            <span
              className={[
                "font-medium",
                getPercentageColor(
                  calculatedPercentage,
                ),
                sizeClasses.percentage,
              ].join(" ")}
            >
              {formattedPercentage}
            </span>
          )}
      </div>
    );
  }

  if (layout === "card") {
    return (
      <div
        className={[
          "rounded-lg bg-gray-50 px-3 py-2",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {label && (
          <p
            className={[
              "font-semibold uppercase tracking-wide text-gray-400",
              sizeClasses.label,
            ].join(" ")}
          >
            {label}
          </p>
        )}

        <div className="mt-1 flex items-baseline gap-1">
          <span
            className={[
              "font-semibold",
              valueColor,
              sizeClasses.value,
            ].join(" ")}
          >
            {formattedObtained}
          </span>

          {showMaximum &&
            formattedMaximum !== null && (
              <>
                <span
                  className={[
                    "text-gray-400",
                    sizeClasses.maximum,
                  ].join(" ")}
                >
                  /
                </span>

                <span
                  className={[
                    "font-medium text-gray-500",
                    sizeClasses.maximum,
                  ].join(" ")}
                >
                  {formattedMaximum}
                </span>
              </>
            )}
        </div>

        {showPercentage &&
          formattedPercentage !== null && (
            <p
              className={[
                "mt-0.5 font-medium",
                getPercentageColor(
                  calculatedPercentage,
                ),
                sizeClasses.percentage,
              ].join(" ")}
            >
              {formattedPercentage}
            </p>
          )}
      </div>
    );
  }

  return (
    <span
      className={[
        "inline-flex items-baseline gap-1",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {label && (
        <span
          className={[
            "mr-1 text-gray-400",
            sizeClasses.label,
          ].join(" ")}
        >
          {label}
        </span>
      )}

      <span
        className={[
          "font-semibold",
          valueColor,
          sizeClasses.value,
        ].join(" ")}
      >
        {formattedObtained}
      </span>

      {showMaximum &&
        formattedMaximum !== null && (
          <>
            <span
              className={[
                "font-normal text-gray-400",
                sizeClasses.maximum,
              ].join(" ")}
            >
              /
            </span>

            <span
              className={[
                "font-medium text-gray-500",
                sizeClasses.maximum,
              ].join(" ")}
            >
              {formattedMaximum}
            </span>
          </>
        )}

      {showPercentage &&
        formattedPercentage !== null && (
          <span
            className={[
              "ml-1 font-medium",
              getPercentageColor(
                calculatedPercentage,
              ),
              sizeClasses.percentage,
            ].join(" ")}
          >
            ({formattedPercentage})
          </span>
        )}
    </span>
  );
};

/* -------------------------------------------------------------------------- */
/* Size                                                                       */
/* -------------------------------------------------------------------------- */

const getSizeClasses = (size) => {
  const sizes = {
    sm: {
      container: "gap-0.5",
      label: "text-[9px]",
      value: "text-xs",
      maximum: "text-[10px]",
      percentage: "text-[9px]",
    },

    md: {
      container: "gap-0.5",
      label: "text-[10px]",
      value: "text-sm",
      maximum: "text-xs",
      percentage: "text-[10px]",
    },

    lg: {
      container: "gap-1",
      label: "text-xs",
      value: "text-lg",
      maximum: "text-sm",
      percentage: "text-xs",
    },

    xl: {
      container: "gap-1",
      label: "text-sm",
      value: "text-2xl",
      maximum: "text-base",
      percentage: "text-sm",
    },
  };

  return sizes[size] || sizes.md;
};

/* -------------------------------------------------------------------------- */
/* Colors                                                                     */
/* -------------------------------------------------------------------------- */

const getColorClass = (
  color,
  percentage,
) => {
  if (color !== "performance") {
    const colors = {
      default: "text-gray-900",
      green: "text-green-600",
      blue: "text-blue-600",
      red: "text-red-600",
      yellow: "text-yellow-600",
      orange: "text-orange-600",
      purple: "text-purple-600",
    };

    return (
      colors[color] ||
      colors.default
    );
  }

  return getPercentageColor(
    percentage,
  );
};

const getPercentageColor = (
  percentage,
) => {
  if (
    percentage === null ||
    percentage === undefined
  ) {
    return "text-gray-600";
  }

  if (percentage >= 75) {
    return "text-green-600";
  }

  if (percentage >= 40) {
    return "text-blue-600";
  }

  return "text-red-600";
};

/* -------------------------------------------------------------------------- */
/* Formatting                                                                 */
/* -------------------------------------------------------------------------- */

const toNumber = (value) => {
  const number = Number(value);

  return Number.isFinite(number)
    ? number
    : 0;
};

const formatMarks = (value) => {
  if (!Number.isFinite(value)) {
    return "0";
  }

  if (Number.isInteger(value)) {
    return String(value);
  }

  return value.toFixed(2);
};

export default MarksDisplay;
