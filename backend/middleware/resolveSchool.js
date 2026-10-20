import School from "../models/schoolModel.js";

const resolveSchool = async (req, res, next) => {
  try {
    let school = null;

    // ============================================
    // 1. HOST NAME
    // Example:
    // abc.cbseanalytics.com
    // ============================================

    const host = req.hostname
      ?.toLowerCase()
      .replace(/^www\./, "");

    // ============================================
    // 2. SLUG FROM ROUTE PARAM
    // Example:
    // /api/:slug/users/auth
    // ============================================

    const slugFromParams = req.params?.slug
      ?.trim()
      .toLowerCase();

    // ============================================
    // 3. SLUG FROM URL PATH
    // Example:
    // /api/demo-school/users/auth
    //
    // Prefer an explicit route parameter.
    // Only inspect the URL path if no param exists.
    // ============================================

    let slugFromPath = null;

    if (!slugFromParams) {
      const segments = req.originalUrl
        .split("?")[0]
        .split("/")
        .filter(Boolean);

      const ignoredSegments = new Set([
        "api",
        "users",
        "auth",
        "logout",
        "profile",
        "schools",
        "students",
        "teachers",
        "parents",
        "assessments",
        "results",
        "questions",
        "change-password",
        "forgot-password",
        "forgot-password-users",
      ]);

      const apiIndex = segments.findIndex(
        (segment) => segment.toLowerCase() === "api",
      );

      // Only inspect the segment immediately after /api.
      // Do not accidentally treat resource IDs or route
      // names as school slugs.
      if (apiIndex !== -1) {
        const candidate = segments[apiIndex + 1];

        if (
          candidate &&
          !ignoredSegments.has(candidate.toLowerCase())
        ) {
          slugFromPath = candidate.toLowerCase();
        }
      }
    }

    const requestedSlug = slugFromParams || slugFromPath;

    // ============================================
    // 4. LOG
    // ============================================

    console.log("\n========== SCHOOL RESOLUTION ==========");
    console.log("METHOD :", req.method);
    console.log("HOST   :", host);
    console.log("URL    :", req.originalUrl);
    console.log("PARAM  :", slugFromParams);
    console.log("PATH   :", slugFromPath);

    // ============================================
    // 5. RESOLVE BY EXPLICIT SLUG
    //
    // An explicit slug takes precedence over the host.
    // This is useful for localhost and shared domains.
    // ============================================

    if (requestedSlug) {
      school = await School.findOne({
        slug: requestedSlug,
        isActive: true,
      });

      if (!school) {
        return res.status(404).json({
          message: "School not found or inactive",
        });
      }

      console.log("Resolved by SLUG:", school.name);
    }

    // ============================================
    // 6. RESOLVE BY DOMAIN
    //
    // Used when no school slug is supplied.
    // ============================================

    if (!school && host && host !== "localhost") {
      school = await School.findOne({
        domain: host,
        isActive: true,
      });

      if (school) {
        console.log("Resolved by DOMAIN:", school.name);
      }
    }

    // ============================================
    // 7. NO AUTOMATIC LOCALHOST FALLBACK
    //
    // Never select an arbitrary school.
    // The client must provide a valid slug.
    // ============================================

    if (!school) {
      return res.status(400).json({
        message:
          "School could not be identified. Provide a valid school slug or domain.",
      });
    }

    // ============================================
    // 8. ATTACH SCHOOL CONTEXT
    // ============================================

    req.school = school;
    req.schoolId = school._id;

    console.log("School :", school.name);
    console.log("Slug   :", school.slug);
    console.log("ID     :", String(school._id));
    console.log("=======================================\n");

    return next();
  } catch (error) {
    console.error("School resolution error:", error);

    return res.status(500).json({
      message: "Failed to resolve school",
    });
  }
};

export default resolveSchool;