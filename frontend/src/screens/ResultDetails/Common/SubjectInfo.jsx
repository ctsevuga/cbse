import React from "react";

const SubjectInfo = ({
  subject,

  name,
  subjectId,
  code,
  description,
  icon,
  color,

  size = "md",
  variant = "default",

  showIcon = true,
  showCode = true,
  showDescription = false,

  clickable = false,
  onClick,

  className = "",
}) => {
  const subjectData = normalizeSubject({
    subject,
    name,
    subjectId,
    code,
    description,
    icon,
    color,
  });

  const displayName =
    subjectData.name || "Unknown Subject";

  if (variant === "compact") {
    return (
      <CompactSubjectInfo
        subject={subjectData}
        displayName={displayName}
        size={size}
        showIcon={showIcon}
        showCode={showCode}
        clickable={clickable}
        onClick={onClick}
        className={className}
      />
    );
  }

  if (variant === "card") {
    return (
      <SubjectInfoCard
        subject={subjectData}
        displayName={displayName}
        size={size}
        showIcon={showIcon}
        showCode={showCode}
        showDescription={showDescription}
        clickable={clickable}
        onClick={onClick}
        className={className}
      />
    );
  }

  return (
    <DefaultSubjectInfo
      subject={subjectData}
      displayName={displayName}
      size={size}
      showIcon={showIcon}
      showCode={showCode}
      showDescription={showDescription}
      clickable={clickable}
      onClick={onClick}
      className={className}
    />
  );
};

/* -------------------------------------------------------------------------- */
/* Default                                                                    */
/* -------------------------------------------------------------------------- */

const DefaultSubjectInfo = ({
  subject,
  displayName,
  size,
  showIcon,
  showCode,
  showDescription,
  clickable,
  onClick,
  className,
}) => {
  return (
    <div
      className={[
        "flex min-w-0 items-center gap-3",
        clickable ? "cursor-pointer" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      onClick={clickable ? onClick : undefined}
      role={clickable ? "button" : undefined}
    >
      {showIcon && (
        <SubjectIcon
          name={displayName}
          icon={subject.icon}
          color={subject.color}
          size={size}
        />
      )}

      <div className="min-w-0">
        <p
          className={[
            "truncate font-semibold text-gray-800",
            sizeClasses[size].name,
          ].join(" ")}
        >
          {displayName}
        </p>

        {showCode && subject.code && (
          <p
            className={[
              "mt-0.5 truncate text-gray-400",
              sizeClasses[size].secondary,
            ].join(" ")}
          >
            {subject.code}
          </p>
        )}

        {showDescription && subject.description && (
          <p
            className={[
              "mt-0.5 truncate text-gray-400",
              sizeClasses[size].secondary,
            ].join(" ")}
          >
            {subject.description}
          </p>
        )}
      </div>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* Compact                                                                    */
/* -------------------------------------------------------------------------- */

const CompactSubjectInfo = ({
  subject,
  displayName,
  size,
  showIcon,
  showCode,
  clickable,
  onClick,
  className,
}) => {
  return (
    <div
      className={[
        "inline-flex min-w-0 items-center gap-2",
        clickable ? "cursor-pointer" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      onClick={clickable ? onClick : undefined}
      role={clickable ? "button" : undefined}
    >
      {showIcon && (
        <SubjectIcon
          name={displayName}
          icon={subject.icon}
          color={subject.color}
          size={size}
        />
      )}

      <span
        className={[
          "truncate font-medium text-gray-700",
          sizeClasses[size].name,
        ].join(" ")}
      >
        {displayName}
      </span>

      {showCode && subject.code && (
        <span
          className={[
            "shrink-0 text-gray-400",
            sizeClasses[size].secondary,
          ].join(" ")}
        >
          ({subject.code})
        </span>
      )}
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* Card                                                                       */
/* -------------------------------------------------------------------------- */

const SubjectInfoCard = ({
  subject,
  displayName,
  size,
  showIcon,
  showCode,
  showDescription,
  clickable,
  onClick,
  className,
}) => {
  return (
    <div
      className={[
        "rounded-xl border bg-white p-4 shadow-sm",
        clickable
          ? "cursor-pointer transition hover:border-blue-200 hover:shadow"
          : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      onClick={clickable ? onClick : undefined}
      role={clickable ? "button" : undefined}
    >
      <div className="flex items-center gap-3">
        {showIcon && (
          <SubjectIcon
            name={displayName}
            icon={subject.icon}
            color={subject.color}
            size={size === "sm" ? "md" : "lg"}
          />
        )}

        <div className="min-w-0 flex-1">
          <p
            className={[
              "truncate font-semibold text-gray-900",
              sizeClasses[size].name,
            ].join(" ")}
          >
            {displayName}
          </p>

          {showCode && subject.code && (
            <p
              className={[
                "mt-1 text-gray-500",
                sizeClasses[size].secondary,
              ].join(" ")}
            >
              Subject Code:{" "}
              <span className="font-medium text-gray-700">
                {subject.code}
              </span>
            </p>
          )}
        </div>
      </div>

      {showDescription && subject.description && (
        <p
          className={[
            "mt-3 border-t pt-3 text-gray-500",
            sizeClasses[size].secondary,
          ].join(" ")}
        >
          {subject.description}
        </p>
      )}
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* Subject Icon                                                               */
/* -------------------------------------------------------------------------- */

const SubjectIcon = ({
  name,
  icon,
  color,
  size = "md",
}) => {
  const initials = getInitials(name);

  if (icon) {
    return (
      <div
        className={[
          "flex shrink-0 items-center justify-center overflow-hidden rounded-lg",
          getColorClasses(color),
          iconSizes[size],
        ].join(" ")}
      >
        {isImageUrl(icon) ? (
          <img
            src={icon}
            alt=""
            className="h-full w-full object-cover"
          />
        ) : (
          <span
            className={[
              "font-bold",
              iconTextSizes[size],
            ].join(" ")}
          >
            {icon}
          </span>
        )}
      </div>
    );
  }

  return (
    <div
      className={[
        "flex shrink-0 items-center justify-center rounded-lg",
        getColorClasses(color),
        iconSizes[size],
        iconTextSizes[size],
      ].join(" ")}
      aria-label={name}
    >
      {initials}
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* Normalization                                                              */
/* -------------------------------------------------------------------------- */

const normalizeSubject = ({
  subject,
  name,
  subjectId,
  code,
  description,
  icon,
  color,
}) => {
  const source =
    subject && typeof subject === "object"
      ? subject
      : {};

  return {
    id:
      source._id ||
      source.id ||
      (typeof subject === "string"
        ? subject
        : subjectId || null),

    name:
      name ||
      source.name ||
      source.subjectName ||
      source.title,

    code:
      code ||
      source.code ||
      source.subjectCode,

    description:
      description ||
      source.description,

    icon:
      icon ||
      source.icon ||
      source.image ||
      source.imageUrl ||
      source.logo,

    color:
      color ||
      source.color ||
      source.themeColor,
  };
};

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

const getInitials = (name) => {
  if (!name) {
    return "?";
  }

  const words = String(name)
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (words.length === 1) {
    return words[0]
      .slice(0, 2)
      .toUpperCase();
  }

  return `${words[0][0]}${words[words.length - 1][0]}`
    .toUpperCase();
};

const isImageUrl = (value) => {
  if (!value) {
    return false;
  }

  return (
    String(value).startsWith("http://") ||
    String(value).startsWith("https://") ||
    String(value).startsWith("/") ||
    String(value).startsWith("data:image")
  );
};

const getColorClasses = (color) => {
  const colors = {
    blue: "bg-blue-50 text-blue-700",
    green: "bg-green-50 text-green-700",
    purple: "bg-purple-50 text-purple-700",
    orange: "bg-orange-50 text-orange-700",
    teal: "bg-teal-50 text-teal-700",
    pink: "bg-pink-50 text-pink-700",
    red: "bg-red-50 text-red-700",
    yellow: "bg-yellow-50 text-yellow-700",
    indigo: "bg-indigo-50 text-indigo-700",
    gray: "bg-gray-100 text-gray-600",
  };

  if (color && colors[color]) {
    return colors[color];
  }

  return colors.blue;
};

/* -------------------------------------------------------------------------- */
/* Sizes                                                                      */
/* -------------------------------------------------------------------------- */

const sizeClasses = {
  sm: {
    name: "text-xs",
    secondary: "text-[9px]",
  },

  md: {
    name: "text-sm",
    secondary: "text-[10px]",
  },

  lg: {
    name: "text-base",
    secondary: "text-xs",
  },
};

const iconSizes = {
  sm: "h-7 w-7",
  md: "h-9 w-9",
  lg: "h-12 w-12",
};

const iconTextSizes = {
  sm: "text-[9px]",
  md: "text-xs",
  lg: "text-sm",
};

export default SubjectInfo;
