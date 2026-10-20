import express from "express";

import {
  createSchool,
  getSchools,
  getActiveSchools,
  getSchoolById,
  getMySchool,
  updateSchool,
  deleteSchool,
  updateSchoolStatus,
  getSchoolUsers,
  getSchoolBySlug,
} from "../controllers/schoolController.js";

import {
  protect,
  superAdmin,
} from "../middleware/authMiddleware.js";

const router = express.Router();

/*
==========================================================
Public School / Tenant Routes
==========================================================
*/

/*
 * Get Active Schools
 *
 * Used for public school selection and login.
 */
router.get(
  "/active",
  getActiveSchools,
);

/*
 * Get Active School By Slug
 *
 * Used to identify the school/tenant before login.
 *
 * Example:
 * GET /api/schools/slug/infowisdom-school
 *
 * No authentication is required because the user
 * has not logged in yet.
 */
router.get(
  "/slug/:slug",
  getSchoolBySlug,
);

/*
==========================================================
School Management
==========================================================
*/

/*
 * Create School
 *
 * Only SUPER_ADMIN can create a school.
 *
 * The controller also creates the initial
 * SCHOOL_ADMIN with a temporary password.
 */
router.post(
  "/",
  protect,
  superAdmin,
  createSchool,
);

/*
 * Get All Schools
 *
 * Only SUPER_ADMIN can see all schools.
 */
router.get(
  "/",
  protect,
  superAdmin,
  getSchools,
);

/*
==========================================================
Logged-in User's School
==========================================================
*/

/*
 * Get the school associated with the logged-in user.
 */
router.get(
  "/my-school",
  protect,
  getMySchool,
);

/*
==========================================================
School By ID
==========================================================
*/

/*
 * Get School
 *
 * SUPER_ADMIN:
 *   Can access any school.
 *
 * Other school users:
 *   Can access only their own school.
 */
router.get(
  "/:id",
  protect,
  getSchoolById,
);

/*
 * Update School
 *
 * Only SUPER_ADMIN can update school master data.
 */
router.put(
  "/:id",
  protect,
  superAdmin,
  updateSchool,
);

/*
 * Delete School
 *
 * Only SUPER_ADMIN can delete a school.
 */
router.delete(
  "/:id",
  protect,
  superAdmin,
  deleteSchool,
);

/*
==========================================================
School Status
==========================================================
*/

/*
 * Activate / Deactivate School
 *
 * Only SUPER_ADMIN can change school status.
 */
router.patch(
  "/:id/status",
  protect,
  superAdmin,
  updateSchoolStatus,
);

/*
==========================================================
School Users
==========================================================
*/

/*
 * Get Users belonging to a School
 *
 * SUPER_ADMIN:
 *   Can access any school's users.
 *
 * School-level users:
 *   Can access only their own school's users.
 *
 * Controller handles school-scope authorization.
 */
router.get(
  "/:id/users",
  protect,
  getSchoolUsers,
);

export default router;