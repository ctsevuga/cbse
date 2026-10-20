import React from "react";

const EmptyState = ({
  title = "No data found",
  message = "There is nothing to display here.",

  icon,
  size = "md",
  variant = "default",

  actionLabel,
  onAction,

  secondaryActionLabel,
  onSecondaryAction,

  showIcon = true,

  className = "",
}) => {
  if (variant === "compact") {
    return (
      <CompactEmptyState
        title={title}
        message={message}
        icon={icon}
        size={size}
        actionLabel={actionLabel}
        onAction={onAction}
        showIcon={showIcon}
        className={className}
      />
    );
  }

  if (variant === "card") {
    return (
      <CardEmptyState
        title={title}
        message={message}
        icon={icon}
        size={size}
        actionLabel={actionLabel}
        onAction={onAction}
        secondaryActionLabel={
          secondaryActionLabel
        }
        onSecondaryAction={
          onSecondaryAction
        }
        showIcon={showIcon}
        className={className}
      />
    );
  }

  return (
    <DefaultEmptyState
      title={title}
      message={message}
      icon={icon}
      size={size}
      actionLabel={actionLabel}
      onAction={onAction}
      secondaryActionLabel={
        secondaryActionLabel
      }
      onSecondaryAction={
        onSecondaryAction
      }
      showIcon={showIcon}
      className={className}
    />
  );
};

/* -------------------------------------------------------------------------- */
/* Default                                                                    */
/* -------------------------------------------------------------------------- */

const DefaultEmptyState = ({
  title,
  message,
  icon,
  size,
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
  showIcon,
  className,
}) => {
  return (
    <div
      className={[
        "flex w-full flex-col items-center justify-center",
        "py-12 text-center",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      role="status"
    >
      {showIcon && (
        <EmptyIcon
          icon={icon}
          size={size}
        />
      )}

      <h3
        className={[
          "mt-4 font-semibold text-gray-800",
          titleSize[size],
        ].join(" ")}
      >
        {title}
      </h3>

      {message && (
        <p
          className={[
            "mt-1 max-w-md text-gray-500",
            messageSize[size],
          ].join(" ")}
        >
          {message}
        </p>
      )}

      <EmptyActions
        actionLabel={actionLabel}
        onAction={onAction}
        secondaryActionLabel={
          secondaryActionLabel
        }
        onSecondaryAction={
          onSecondaryAction
        }
        size={size}
      />
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* Compact                                                                    */
/* -------------------------------------------------------------------------- */

const CompactEmptyState = ({
  title,
  message,
  icon,
  size,
  actionLabel,
  onAction,
  showIcon,
  className,
}) => {
  return (
    <div
      className={[
        "flex items-center justify-center gap-3",
        "py-6 text-center",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      role="status"
    >
      {showIcon && (
        <EmptyIcon
          icon={icon}
          size="sm"
        />
      )}

      <div className="min-w-0">
        <p
          className={[
            "font-medium text-gray-700",
            titleSize[size],
          ].join(" ")}
        >
          {title}
        </p>

        {message && (
          <p
            className={[
              "mt-0.5 text-gray-400",
              messageSize[size],
            ].join(" ")}
          >
            {message}
          </p>
        )}

        {actionLabel &&
          typeof onAction ===
            "function" && (
            <button
              type="button"
              onClick={onAction}
              className={[
                "mt-2 font-medium text-blue-600",
                "hover:text-blue-700",
                buttonTextSize[size],
              ].join(" ")}
            >
              {actionLabel}
            </button>
          )}
      </div>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* Card                                                                       */
/* -------------------------------------------------------------------------- */

const CardEmptyState = ({
  title,
  message,
  icon,
  size,
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
  showIcon,
  className,
}) => {
  return (
    <div
      className={[
        "flex w-full flex-col items-center justify-center",
        "rounded-xl border border-dashed",
        "bg-gray-50/50 px-6 py-12 text-center",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      role="status"
    >
      {showIcon && (
        <EmptyIcon
          icon={icon}
          size={size}
        />
      )}

      <h3
        className={[
          "mt-4 font-semibold text-gray-800",
          titleSize[size],
        ].join(" ")}
      >
        {title}
      </h3>

      {message && (
        <p
          className={[
            "mt-1 max-w-md text-gray-500",
            messageSize[size],
          ].join(" ")}
        >
          {message}
        </p>
      )}

      <EmptyActions
        actionLabel={actionLabel}
        onAction={onAction}
        secondaryActionLabel={
          secondaryActionLabel
        }
        onSecondaryAction={
          onSecondaryAction
        }
        size={size}
      />
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* Icon                                                                       */
/* -------------------------------------------------------------------------- */

const EmptyIcon = ({
  icon,
  size = "md",
}) => {
  return (
    <div
      className={[
        "flex items-center justify-center rounded-full",
        "bg-gray-100 text-gray-400",
        iconContainerSize[size],
      ].join(" ")}
      aria-hidden="true"
    >
      {icon || (
        <DefaultEmptyIcon
          size={size}
        />
      )}
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* Default Icon                                                               */
/* -------------------------------------------------------------------------- */

const DefaultEmptyIcon = ({
  size = "md",
}) => {
  return (
    <svg
      width={iconSvgSize[size]}
      height={iconSvgSize[size]}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M7 3.5H17C18.1046 3.5 19 4.39543 19 5.5V18.5C19 19.6046 18.1046 20.5 17 20.5H7C5.89543 20.5 5 19.6046 5 18.5V5.5C5 4.39543 5.89543 3.5 7 3.5Z"
        stroke="currentColor"
        strokeWidth="1.5"
      />

      <path
        d="M8.5 8H15.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />

      <path
        d="M8.5 12H15.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />

      <path
        d="M8.5 16H12"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
};

/* -------------------------------------------------------------------------- */
/* Actions                                                                    */
/* -------------------------------------------------------------------------- */

const EmptyActions = ({
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
  size,
}) => {
  const hasPrimaryAction =
    actionLabel &&
    typeof onAction ===
      "function";

  const hasSecondaryAction =
    secondaryActionLabel &&
    typeof onSecondaryAction ===
      "function";

  if (
    !hasPrimaryAction &&
    !hasSecondaryAction
  ) {
    return null;
  }

  return (
    <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
      {hasPrimaryAction && (
        <button
          type="button"
          onClick={onAction}
          className={[
            "rounded-md bg-blue-600 font-medium text-white",
            "transition hover:bg-blue-700",
            "focus:outline-none focus:ring-2",
            "focus:ring-blue-500 focus:ring-offset-2",
            buttonPadding[size],
            buttonTextSize[size],
          ].join(" ")}
        >
          {actionLabel}
        </button>
      )}

      {hasSecondaryAction && (
        <button
          type="button"
          onClick={onSecondaryAction}
          className={[
            "rounded-md border border-gray-300",
            "bg-white font-medium text-gray-700",
            "transition hover:bg-gray-50",
            "focus:outline-none focus:ring-2",
            "focus:ring-gray-300 focus:ring-offset-2",
            buttonPadding[size],
            buttonTextSize[size],
          ].join(" ")}
        >
          {secondaryActionLabel}
        </button>
      )}
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* Sizes                                                                      */
/* -------------------------------------------------------------------------- */

const iconContainerSize = {
  sm: "h-9 w-9",
  md: "h-12 w-12",
  lg: "h-16 w-16",
};

const iconSvgSize = {
  sm: 16,
  md: 22,
  lg: 28,
};

const titleSize = {
  sm: "text-xs",
  md: "text-sm",
  lg: "text-base",
};

const messageSize = {
  sm: "text-[10px]",
  md: "text-xs",
  lg: "text-sm",
};

const buttonTextSize = {
  sm: "text-[10px]",
  md: "text-xs",
  lg: "text-sm",
};

const buttonPadding = {
  sm: "px-2.5 py-1.5",
  md: "px-3.5 py-2",
  lg: "px-4 py-2.5",
};

export default EmptyState;
