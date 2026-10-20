import React from "react";

const StudentInfo = ({
  student,

  name,
  studentId,
  email,
  phone,
  avatar,

  size = "md",
  variant = "default",

  showAvatar = true,
  showStudentId = true,
  showEmail = false,
  showPhone = false,

  clickable = false,
  onClick,

  className = "",
}) => {
  const studentData = normalizeStudent({
    student,
    name,
    studentId,
    email,
    phone,
    avatar,
  });

  const displayName =
    studentData.name || "Unknown Student";

  const initials = getInitials(displayName);

  if (variant === "compact") {
    return (
      <CompactStudentInfo
        student={studentData}
        displayName={displayName}
        initials={initials}
        size={size}
        showAvatar={showAvatar}
        showStudentId={showStudentId}
        clickable={clickable}
        onClick={onClick}
        className={className}
      />
    );
  }

  if (variant === "card") {
    return (
      <StudentInfoCard
        student={studentData}
        displayName={displayName}
        initials={initials}
        size={size}
        showAvatar={showAvatar}
        showStudentId={showStudentId}
        showEmail={showEmail}
        showPhone={showPhone}
        clickable={clickable}
        onClick={onClick}
        className={className}
      />
    );
  }

  return (
    <DefaultStudentInfo
      student={studentData}
      displayName={displayName}
      initials={initials}
      size={size}
      showAvatar={showAvatar}
      showStudentId={showStudentId}
      showEmail={showEmail}
      showPhone={showPhone}
      clickable={clickable}
      onClick={onClick}
      className={className}
    />
  );
};

/* -------------------------------------------------------------------------- */
/* Default                                                                    */
/* -------------------------------------------------------------------------- */

const DefaultStudentInfo = ({
  student,
  displayName,
  initials,
  size,
  showAvatar,
  showStudentId,
  showEmail,
  showPhone,
  clickable,
  onClick,
  className,
}) => {
  return (
    <div
      className={[
        "flex min-w-0 items-center gap-3",
        clickable
          ? "cursor-pointer"
          : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      onClick={clickable ? onClick : undefined}
      role={clickable ? "button" : undefined}
    >
      {showAvatar && (
        <StudentAvatar
          name={displayName}
          avatar={student.avatar}
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

        {showStudentId &&
          student.studentId && (
            <p
              className={[
                "mt-0.5 truncate text-gray-400",
                sizeClasses[size].secondary,
              ].join(" ")}
            >
              ID: {student.studentId}
            </p>
          )}

        {showEmail && student.email && (
          <p
            className={[
              "mt-0.5 truncate text-gray-400",
              sizeClasses[size].secondary,
            ].join(" ")}
          >
            {student.email}
          </p>
        )}

        {showPhone && student.phone && (
          <p
            className={[
              "mt-0.5 truncate text-gray-400",
              sizeClasses[size].secondary,
            ].join(" ")}
          >
            {student.phone}
          </p>
        )}
      </div>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* Compact                                                                    */
/* -------------------------------------------------------------------------- */

const CompactStudentInfo = ({
  student,
  displayName,
  initials,
  size,
  showAvatar,
  showStudentId,
  clickable,
  onClick,
  className,
}) => {
  return (
    <div
      className={[
        "inline-flex min-w-0 items-center gap-2",
        clickable
          ? "cursor-pointer"
          : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      onClick={clickable ? onClick : undefined}
      role={clickable ? "button" : undefined}
    >
      {showAvatar && (
        <StudentAvatar
          name={displayName}
          avatar={student.avatar}
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

      {showStudentId &&
        student.studentId && (
          <span
            className={[
              "shrink-0 text-gray-400",
              sizeClasses[size].secondary,
            ].join(" ")}
          >
            ({student.studentId})
          </span>
        )}
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* Card                                                                       */
/* -------------------------------------------------------------------------- */

const StudentInfoCard = ({
  student,
  displayName,
  initials,
  size,
  showAvatar,
  showStudentId,
  showEmail,
  showPhone,
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
        {showAvatar && (
          <StudentAvatar
            name={displayName}
            avatar={student.avatar}
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

          {showStudentId &&
            student.studentId && (
              <p
                className={[
                  "mt-1 text-gray-500",
                  sizeClasses[size].secondary,
                ].join(" ")}
              >
                Student ID:{" "}
                <span className="font-medium text-gray-700">
                  {student.studentId}
                </span>
              </p>
            )}
        </div>
      </div>

      {(showEmail ||
        showPhone ||
        student.className ||
        student.section) && (
        <div className="mt-4 grid gap-2 border-t pt-3 sm:grid-cols-2">
          {showEmail && student.email && (
            <InfoItem
              label="Email"
              value={student.email}
            />
          )}

          {showPhone && student.phone && (
            <InfoItem
              label="Phone"
              value={student.phone}
            />
          )}

          {student.className && (
            <InfoItem
              label="Class"
              value={student.className}
            />
          )}

          {student.section && (
            <InfoItem
              label="Section"
              value={student.section}
            />
          )}
        </div>
      )}
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* Avatar                                                                     */
/* -------------------------------------------------------------------------- */

const StudentAvatar = ({
  name,
  avatar,
  size = "md",
}) => {
  const initials = getInitials(name);

  if (avatar) {
    return (
      <img
        src={avatar}
        alt={name}
        className={[
          "shrink-0 rounded-full object-cover",
          avatarSizes[size],
        ].join(" ")}
        onError={(event) => {
          event.currentTarget.style.display =
            "none";

          const fallback =
            event.currentTarget
              .nextElementSibling;

          if (fallback) {
            fallback.style.display =
              "flex";
          }
        }}
      />
    );
  }

  return (
    <div
      className={[
        "flex shrink-0 items-center justify-center rounded-full",
        "bg-blue-50 font-semibold text-blue-700",
        avatarSizes[size],
        avatarTextSizes[size],
      ].join(" ")}
      aria-label={name}
    >
      {initials}
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* Info Item                                                                  */
/* -------------------------------------------------------------------------- */

const InfoItem = ({
  label,
  value,
}) => {
  return (
    <div className="min-w-0">
      <p className="text-[9px] font-semibold uppercase tracking-wide text-gray-400">
        {label}
      </p>

      <p className="mt-0.5 truncate text-xs text-gray-700">
        {value}
      </p>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* Normalization                                                              */
/* -------------------------------------------------------------------------- */

const normalizeStudent = ({
  student,
  name,
  studentId,
  email,
  phone,
  avatar,
}) => {
  const source =
    student &&
    typeof student === "object"
      ? student
      : {};

  return {
    id:
      source._id ||
      source.id ||
      (typeof student === "string"
        ? student
        : null),

    name:
      name ||
      source.name ||
      source.fullName ||
      source.studentName ||
      getNestedName(source),

    studentId:
      studentId ||
      source.studentId ||
      source.admissionNumber ||
      source.rollNumber ||
      source.registrationNumber,

    email:
      email ||
      source.email ||
      source.emailAddress,

    phone:
      phone ||
      source.phone ||
      source.phoneNumber ||
      source.mobile,

    avatar:
      avatar ||
      source.avatar ||
      source.avatarUrl ||
      source.profileImage ||
      source.profileImageUrl,

    className:
      source.className ||
      source.class?.name ||
      source.standard ||
      source.grade,

    section:
      source.section ||
      source.sectionName,
  };
};

const getNestedName = (student) => {
  const firstName =
    student.firstName || "";

  const lastName =
    student.lastName || "";

  return `${firstName} ${lastName}`.trim();
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

const avatarSizes = {
  sm: "h-7 w-7",
  md: "h-9 w-9",
  lg: "h-12 w-12",
};

const avatarTextSizes = {
  sm: "text-[9px]",
  md: "text-xs",
  lg: "text-sm",
};

export default StudentInfo;
