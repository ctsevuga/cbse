import React from "react";
import ReactDOM from "react-dom/client";

import "./assets/styles/bootstrap.custom.css";
import "./assets/styles/index.css";
import "./index.css";

import App from "./App";
import reportWebVitals from "./reportWebVitals";

import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
} from "react-router-dom";

import { HelmetProvider } from "react-helmet-async";
import { Provider, useSelector } from "react-redux";
import store from "./store";

// ======================================================
// Public Screens
// ======================================================

import LoginScreen from "./screens/LoginScreen";
import RegisterScreen from "./screens/RegisterScreen";
import HomeScreen from "./screens/HomeScreen";
import ChangePasswordScreen from "./screens/ChangePasswordScreen";
import Unauthorized from "./screens/Unauthorized";

// ======================================================
// Admin Screens
// ======================================================

import UserListScreen from "./screens/admin/UserListScreen";
import UserEditScreen from "./screens/admin/UserEditScreen";

// ======================================================
// School Screens
// ======================================================

import CreateSchoolScreen from "./screens/school/CreateSchoolScreen";
import MySchoolScreen from "./screens/school/MySchoolScreen";
import SchoolEditScreen from "./screens/school/SchoolEditScreen";
import SchoolListScreen from "./screens/school/SchoolListScreen";
import SchoolUsersScreen from "./screens/school/SchoolUsersScreen";
import SchoolViewScreen from "./screens/school/SchoolViewScreen";

// ======================================================
// Academic Year Screens
// ======================================================

import AcademicYearDetailsScreen from "./screens/AcademicYear/AcademicYearDetailsScreen";
import AcademicYearListScreen from "./screens/AcademicYear/AcademicYearListScreen";
import CreateAcademicYearScreen from "./screens/AcademicYear/CreateAcademicYearScreen";
import EditAcademicYearScreen from "./screens/AcademicYear/EditAcademicYearScreen";

// ======================================================
// Student Screens
// ======================================================

import CreateStudentScreen from "./screens/student/CreateStudentScreen";
import EditStudentParentRelationshipScreen from "./screens/student/EditStudentParentRelationshipScreen";
import MyStudentProfileScreen from "./screens/student/MyStudentProfileScreen";
import StudentDetailsScreen from "./screens/student/StudentDetailsScreen";
import StudentEditScreen from "./screens/student/StudentEditScreen";
import StudentListScreen from "./screens/student/StudentListScreen";

// ======================================================
// Teacher Screens
// ======================================================

import CreateTeacherScreen from "./screens/Teacher/CreateTeacherScreen";
import EditTeacherscreen from "./screens/Teacher/EditTeacherscreen";
import MyTeacherProfilescreen from "./screens/Teacher/MyTeacherProfilescreen";
import TeacherDetailsscreen from "./screens/Teacher/TeacherDetailsscreen";
import TeacherListscreen from "./screens/Teacher/TeacherListscreen";

// ======================================================
// Parent Screens
// ======================================================

import CreateParentScreen from "./screens/Parent/CreateParentScreen";
import EditParentScreen from "./screens/Parent/EditParentScreen";
import MyParentProfileScreen from "./screens/Parent/MyParentProfileScreen";
import ParentDetailsScreen from "./screens/Parent/ParentDetailsScreen";
import ParentListScreen from "./screens/Parent/ParentListScreen";

// ======================================================
// Class Screens
// ======================================================

import ClassDetailsScreen from "./screens/class/ClassDetailsScreen";
import ClassListScreen from "./screens/class/ClassListScreen";
import CreateClassScreen from "./screens/class/CreateClassScreen";
import EditClassScreen from "./screens/class/EditClassScreen";

// ======================================================
// Sections Screens
// ======================================================

import CreateSectionScreen from "./screens/section/CreateSectionScreen";
import EditSectionScreen from "./screens/section/EditSectionScreen";
import SectionDetailsScreen from "./screens/section/SectionDetailsScreen";
import SectionListScreen from "./screens/section/SectionListScreen";

// ======================================================
// Streams Screens
// ======================================================

import CreateStreamScreen from "./screens/Stream/CreateStreamScreen";
import EditStreamScreen from "./screens/Stream/EditStreamScreen";
import StreamDetailsScreen from "./screens/Stream/StreamDetailsScreen";
import StreamListScreen from "./screens/Stream/StreamListScreen";

// ======================================================
// Subject Combination Screens
// ======================================================

import CreateSubjectCombinationScreen from "./screens/subjectCombination/CreateSubjectCombinationScreen";
import SubjectCombinationByStreamScreen from "./screens/subjectCombination/SubjectCombinationByStreamScreen";
import SubjectCombinationListScreen from "./screens/subjectCombination/SubjectCombinationListScreen";
import SubjectCombinationViewScreen from "./screens/subjectCombination/SubjectCombinationViewScreen";

// ======================================================
// Subject Screens
// ======================================================

import CreateSubjectScreen from "./screens/subject/CreateSubjectScreen";
import EditSubjectScreen from "./screens/subject/EditSubjectScreen";
import SubjectDetailsScreen from "./screens/subject/SubjectDetailsScreen";
import SubjectListScreen from "./screens/subject/SubjectListScreen";

// ======================================================
// Chapter Screens
// ======================================================

import ChapterDetailsScreen from "./screens/chapter/ChapterDetailsScreen";
import ChapterListScreen from "./screens/chapter/ChapterListScreen";
import CreateChapterScreen from "./screens/chapter/CreateChapterScreen";
import EditChapterScreen from "./screens/chapter/EditChapterScreen";

// ======================================================
// Topic Screens
// ======================================================

import CreateTopicScreen from "./screens/Topic/CreateTopicScreen";
import EditTopicScreen from "./screens/Topic/EditTopicScreen";
import TopicDetailsScreen from "./screens/Topic/TopicDetailsScreen";
import TopicListScreen from "./screens/Topic/TopicListScreen";

// ======================================================
// Teacher Assignment Screens
// ======================================================

import CreateTeacherAssignmentScreen from "./screens/teacherAssignment/CreateTeacherAssignmentScreen";
import EditTeacherAssignmentScreen from "./screens/teacherAssignment/EditTeacherAssignmentScreen";
import MyTeacherAssignmentsScreen from "./screens/teacherAssignment/MyTeacherAssignmentsScreen";
import TeacherAssignmentDetailsScreen from "./screens/teacherAssignment/TeacherAssignmentDetailsScreen";
import TeacherAssignmentListScreen from "./screens/teacherAssignment/TeacherAssignmentListScreen";

// ======================================================
// Answer Editor Configuration Screens
// ======================================================

import AnswerEditorConfigurationDetailsScreen from "./screens/AnswerEditor/AnswerEditorConfigurationDetailsScreen";
import AnswerEditorConfigurationListScreen from "./screens/AnswerEditor/AnswerEditorConfigurationListScreen";
import AnswerEditorConfigurationScreen from "./screens/AnswerEditor/AnswerEditorConfigurationScreen";
import EditAnswerEditorConfigurationScreen from "./screens/AnswerEditor/EditAnswerEditorConfigurationScreen";

// ======================================================
// Question Group Screens
// ======================================================

import CreateQuestionGroupScreen from "./screens/questionGroup/CreateQuestionGroupScreen";
import QuestionGroupDetailsScreen from "./screens/questionGroup/QuestionGroupDetailsScreen";
import QuestionGroupEditScreen from "./screens/questionGroup/QuestionGroupEditScreen";
import QuestionGroupListScreen from "./screens/questionGroup/QuestionGroupListScreen";

// ======================================================
// Questions Screens
// ======================================================

import CreateQuestionScreen from "./screens/question/CreateQuestionScreen";
import QuestionDetailsScreen from "./screens/question/QuestionDetailsScreen";
import QuestionEditScreen from "./screens/question/QuestionEditScreen";
import QuestionListScreen from "./screens/question/QuestionListScreen";

// ======================================================
// Question Blueprint screens
// ======================================================

import CreateQuestionBlueprintScreen from "./screens/questionBluePrint/CreateQuestionBlueprintScreen";
import EditQuestionBlueprintScreen from "./screens/questionBluePrint/EditQuestionBlueprintScreen";
import MyQuestionBlueprintsScreen from "./screens/questionBluePrint/MyQuestionBlueprintsScreen";
import QuestionBlueprintDetailsScreen from "./screens/questionBluePrint/QuestionBlueprintDetailsScreen";
import QuestionBlueprintListScreen from "./screens/questionBluePrint/QuestionBlueprintListScreen";

// ======================================================
// Assessment Screens
// ======================================================

import AssessmentDetailsscreen from "./screens/assessment/AssessmentDetailsscreen";
import AssessmentListScreen from "./screens/assessment/AssessmentListScreen";
import CreateAssessmentScreen from "./screens/assessment/CreateAssessmentScreen";
import EditAssessmentscreen from "./screens/assessment/EditAssessmentscreen";
import MyAssessmentsScreen from "./screens/assessment/MyAssessmentsScreen";

// ======================================================
// Assessment Screens
// ======================================================

import AssessmentSectionDetails from "./screens/AssessmentSection/AssessmentSectionDetails";
import AssessmentSectionListScreen from "./screens/AssessmentSection/AssessmentSectionListScreen";
import CreateAssessmentSectionScreen from "./screens/AssessmentSection/CreateAssessmentSectionScreen";
import EditAssessmentSectionscreen from "./screens/AssessmentSection/EditAssessmentSectionscreen";

// ======================================================
// Assessment Question Screens
// ======================================================

import AssessmentQuestionDetailsScreen from "./screens/AssessmentQuestion/AssessmentQuestionDetailsScreen";

import AssessmentQuestionListScreen from "./screens/AssessmentQuestion/AssessmentQuestionListScreen";
import CreateAssessmentQuestion from "./screens/AssessmentQuestion/CreateAssessmentQuestion";


// ======================================================
// Student Attempt Screens
// ======================================================

import StartStudentAttemptScreen from "./screens/StudentAttempt/StartStudentAttemptScreen";
import StudentAssessmentAttemptScreen from "./screens/StudentAttempt/StudentAssessmentAttemptScreen";
import StudentAttempstByAssessment from "./screens/StudentAttempt/StudentAttempstByAssessment";
import StudentAttemptDetailsScreen from "./screens/StudentAttempt/StudentAttemptDetailsScreen";
import StudentAttemptsByStudentScreen from "./screens/StudentAttempt/StudentAttemptsByStudentScreen";
import StudentAttemptsListScreen from "./screens/StudentAttempt/StudentAttemptsListScreen";
import StudentAttemptsScreen from "./screens/StudentAttempt/StudentAttemptsScreen";

// ======================================================
// Student Answer Screens
// ======================================================

import StudentAnswerDetailsScreen from "./screens/studentAnswer/StudentAnswerDetailsScreen";
import StudentAnswerEvaluationScreen from "./screens/studentAnswer/StudentAnswerEvaluationScreen";
import StudentAnswersScreen from "./screens/studentAnswer/StudentAnswersScreen";
import StudentAssessmentReviewScreen from "./screens/studentAnswer/StudentAssessmentReviewScreen";
import StudentAssessmentScreen from "./screens/studentAnswer/StudentAssessmentScreen";
import StudentAttemptReviewScreen from "./screens/studentAnswer/StudentAttemptReviewScreen";

// ======================================================
//  Answer Evaluation Screens
// ======================================================

import AnswerEvaluationEditScreen from "./screens/answerEvaluation/AnswerEvaluationEditScreen";
import AnswerEvaluationViewScreen from "./screens/answerEvaluation/AnswerEvaluationViewScreen";
import AttemptEvaluationSummaryScreen from "./screens/answerEvaluation/AttemptEvaluationSummaryScreen";
import EvaluationHistoryScreen from "./screens/answerEvaluation/EvaluationHistoryScreen";
import EvaluationManagementScreen from "./screens/answerEvaluation/EvaluationManagementScreen";
import createAnswerEvaluation from "./screens/answerEvaluation/createAnswerEvaluation";
import StudentEvaluationHistoryScreen from "./screens/answerEvaluation/StudentEvaluationHistoryScreen";
import AnswerEvaluationPendingScreen from "./screens/answerEvaluation/AnswerEvaluationPendingScreen";


// ======================================================
//  Result Screens
// ======================================================

import AsssesmentResultsPage from "./screens/results/AsssesmentResultsPage";
import AttemptResultPage from "./screens/results/AttemptResultPage";
import ResultDetailsPage from "./screens/results/ResultDetailsPage";
import ResultListPage from "./screens/results/ResultListPage";
import StudentAssessmentResultPage from "./screens/results/StudentAssessmentResultPage";
import StudentResultsPage from "./screens/results/StudentResultsPage";

// ======================================================
//  Result DetailsScreens
// ======================================================

import AssessmentQuestionResultPage from "./screens/ResultDetails/AssessmentQuestionResultPage";
import EvaluationQueuePage from "./screens/ResultDetails/EvaluationQueuePage";
import QuestionPerformancePage from "./screens/ResultDetails/QuestionPerformancePage";
import ResultDetailPage from "./screens/ResultDetails/ResultDetailPage";
import ResultDetailsByResultPage from "./screens/ResultDetails/ResultDetailsByResultPage";
import ResultDetailsViewPage from "./screens/ResultDetails/ResultDetailsViewPage";
import StudentResultDetailsPage from "./screens/ResultDetails/StudentResultDetailsPage";
import SubjectResultAnalysisPage from "./screens/ResultDetails/SubjectResultAnalysisPage";

// ======================================================
// Route Guards
// ======================================================

import {
  // Authentication
  AuthenticatedRoute,

  // Individual Roles
  SuperAdminRoute,
  SchoolAdminRoute,
  HMRoute,
  TeacherRoute,
  StudentRoute,
  ParentRoute,

  // Combined Roles
  AdminOrSuperAdminRoute,
  HMOrAdminRoute,
  TeacherOrHMRoute,
  TeacherOrHMOrAdminRoute,
} from "./components/guards/RoleGuards";

// ======================================================
// Router Wrapper
// ======================================================

const RouterWrapper = () => {
  const { userInfo } = useSelector((state) => state.auth);

  const router = createBrowserRouter(
    createRoutesFromElements(
      <Route path="/" element={<App />}>
        {/* ==================================================
            Public Routes
            ================================================== */}
        <Route index element={<LoginScreen />} />
        <Route path="/home" element={<HomeScreen />} />
        <Route path="/register" element={<RegisterScreen />} />
        <Route path="/change-password" element={<ChangePasswordScreen />} />
        <Route path="/unauthorized" element={<Unauthorized />} />
        {/* ==================================================
            SUPER ADMIN Routes
            ================================================== */}
        <Route
          path="/super-admin"
          element={
            <SuperAdminRoute user={userInfo}>
              <HomeScreen />
            </SuperAdminRoute>
          }
        />
        {/* ==================================================
            SCHOOL ADMIN Routes
            ================================================== */}
        <Route
          path="/school-admin"
          element={
            <SchoolAdminRoute user={userInfo}>
              <HomeScreen />
            </SchoolAdminRoute>
          }
        />
        {/* ==================================================
            HM Routes
            ================================================== */}
        <Route
          path="/hm"
          element={
            <HMRoute user={userInfo}>
              <HomeScreen />
            </HMRoute>
          }
        />
        {/* ==================================================
            TEACHER Routes
            ================================================== */}
        <Route
          path="/teacher"
          element={
            <TeacherRoute user={userInfo}>
              <HomeScreen />
            </TeacherRoute>
          }
        />
        {/* ==================================================
            STUDENT Routes
            ================================================== */}
        <Route
          path="/student"
          element={
            <StudentRoute user={userInfo}>
              <HomeScreen />
            </StudentRoute>
          }
        />
        {/* ==================================================
            PARENT Routes
            ================================================== */}
        <Route
          path="/parent"
          element={
            <ParentRoute user={userInfo}>
              <HomeScreen />
            </ParentRoute>
          }
        />
        {/* ==================================================
            Admin + Super Admin
            SCHOOL_ADMIN
            SUPER_ADMIN
            ================================================== */}
        // ====================================================== // SCHOOL
        MANAGEMENT Routes //
        ====================================================== /* * Create
        School * * Backend: * POST /api/schools * * Access: * SUPER_ADMIN only
        */
        <Route
          path="/admin/school/create"
          element={
            <SuperAdminRoute user={userInfo}>
              <CreateSchoolScreen />
            </SuperAdminRoute>
          }
        />
        /* * School List * * Backend: * GET /api/schools * * Access: *
        SUPER_ADMIN only */
        <Route
          path="/schools"
          element={
            <SuperAdminRoute user={userInfo}>
              <SchoolListScreen />
            </SuperAdminRoute>
          }
        />
        /* * My School * * Backend: * GET /api/schools/my-school * * Access: *
        Any authenticated user: * - SUPER_ADMIN * - SCHOOL_ADMIN * - HM * -
        TEACHER * - STUDENT * - PARENT * * The backend determines the school
        associated * with the logged-in user. */
        <Route
          path="/my-school"
          element={
            <AuthenticatedRoute user={userInfo}>
              <MySchoolScreen />
            </AuthenticatedRoute>
          }
        />
        /* * View School * * Backend: * GET /api/schools/:id * * Access: *
        SUPER_ADMIN: * Can view any school. * * Other authenticated school
        users: * Can view only their own school. * * The backend/controller
        handles the * school-scope authorization. */
        <Route
          path="/schools/:id"
          element={
            <AuthenticatedRoute user={userInfo}>
              <SchoolViewScreen />
            </AuthenticatedRoute>
          }
        />
        /* * Edit School * * Backend: * PUT /api/schools/:id * * Access: *
        SUPER_ADMIN only */
        <Route
          path="/schools/:id/edit"
          element={
            <SuperAdminRoute user={userInfo}>
              <SchoolEditScreen />
            </SuperAdminRoute>
          }
        />
        /* * School Users * * Backend: * GET /api/schools/:id/users * * Access:
        * SUPER_ADMIN: * Can access any school's users. * * Other authenticated
        school users: * Can access only their own school's users. * *
        Backend/controller handles the * school-scope authorization. */
        <Route
          path="/schools/:id/users"
          element={
            <AuthenticatedRoute user={userInfo}>
              <SchoolUsersScreen />
            </AuthenticatedRoute>
          }
        />
        // ====================================================== // Academic
        Year Routes // ====================================================== //
        Academic Year List // GET /api/academic-years // Access: Any
        authenticated user
        <Route
          path="/academic-years"
          element={
            <AuthenticatedRoute user={userInfo}>
              <AcademicYearListScreen />
            </AuthenticatedRoute>
          }
        />
        // Create Academic Year // POST /api/academic-years // Access:
        SCHOOL_ADMIN only
        <Route
          path="/academic-years/create"
          element={
            <SchoolAdminRoute user={userInfo}>
              <CreateAcademicYearScreen />
            </SchoolAdminRoute>
          }
        />
        // Academic Year Details // GET /api/academic-years/:id // Access: Any
        authenticated user
        <Route
          path="/academic-years/:id"
          element={
            <AuthenticatedRoute user={userInfo}>
              <AcademicYearDetailsScreen />
            </AuthenticatedRoute>
          }
        />
        // Edit Academic Year // PUT /api/academic-years/:id // Access:
        SCHOOL_ADMIN only
        <Route
          path="/academic-years/:id/edit"
          element={
            <SchoolAdminRoute user={userInfo}>
              <EditAcademicYearScreen />
            </SchoolAdminRoute>
          }
        />
        // ====================================================== // Student
        Routes // ====================================================== //
        Student List // GET /api/students // Access: Any authenticated user
        <Route
          path="/students"
          element={
            <AuthenticatedRoute user={userInfo}>
              <StudentListScreen />
            </AuthenticatedRoute>
          }
        />
        // Create Student // POST /api/students // Access: SCHOOL_ADMIN +
        SUPER_ADMIN
        <Route
          path="/admin/students/create"
          element={
            <AdminOrSuperAdminRoute user={userInfo}>
              <CreateStudentScreen />
            </AdminOrSuperAdminRoute>
          }
        />
        // My Student Profile // GET /api/students/me // Access: Any
        authenticated user
        <Route
          path="/students/me"
          element={
            <AuthenticatedRoute user={userInfo}>
              <MyStudentProfileScreen />
            </AuthenticatedRoute>
          }
        />
        // Student Details // GET /api/students/:id // Access: Any authenticated
        user
        <Route
          path="/admin/students/:id"
          element={
            <AuthenticatedRoute user={userInfo}>
              <StudentDetailsScreen />
            </AuthenticatedRoute>
          }
        />
        // Edit Student // PUT /api/students/:id // Access: SCHOOL_ADMIN +
        SUPER_ADMIN
        <Route
          path="/admin/students/:id/edit"
          element={
            <AdminOrSuperAdminRoute user={userInfo}>
              <StudentEditScreen />
            </AdminOrSuperAdminRoute>
          }
        />
        // Edit Student Parent Relationship // Access: SCHOOL_ADMIN + //
        SUPER_ADMIN //
        <Route
          path="/students/:id/parent-relationship/edit"
          element={
            <AdminOrSuperAdminRoute user={userInfo}>
              <EditStudentParentRelationshipScreen />
            </AdminOrSuperAdminRoute>
          }
        />
        // ====================================================== // Teacher
        Routes // ====================================================== //
        Teacher List // GET /api/teachers // Access: Any authenticated user
        <Route
          path="/teachers"
          element={
            <AuthenticatedRoute user={userInfo}>
              <TeacherListscreen />
            </AuthenticatedRoute>
          }
        />
        // Create Teacher // POST /api/teachers // Access: SCHOOL_ADMIN +
        SUPER_ADMIN
        <Route
          path="/teachers/create"
          element={
            <AdminOrSuperAdminRoute user={userInfo}>
              <CreateTeacherScreen />
            </AdminOrSuperAdminRoute>
          }
        />
        // My Teacher Profile // GET /api/teachers/me // Access: Any
        authenticated user
        <Route
          path="/teachers/me"
          element={
            <AuthenticatedRoute user={userInfo}>
              <MyTeacherProfilescreen />
            </AuthenticatedRoute>
          }
        />
        // Teacher Details // GET /api/teachers/:id // Access: Any authenticated
        user
        <Route
          path="/teachers/:id"
          element={
            <AuthenticatedRoute user={userInfo}>
              <TeacherDetailsscreen />
            </AuthenticatedRoute>
          }
        />
        // Edit Teacher // PUT /api/teachers/:id // Access: SCHOOL_ADMIN +
        SUPER_ADMIN
        <Route
          path="/teachers/:id/edit"
          element={
            <AdminOrSuperAdminRoute user={userInfo}>
              <EditTeacherscreen />
            </AdminOrSuperAdminRoute>
          }
        />
        // ====================================================== // Parent
        Routes // ====================================================== //
        Parent List // GET /api/parents // Access: Any authenticated user
        <Route
          path="/parents"
          element={
            <AuthenticatedRoute user={userInfo}>
              <ParentListScreen />
            </AuthenticatedRoute>
          }
        />
        // Create Parent // POST /api/parents // Access: SCHOOL_ADMIN +
        SUPER_ADMIN
        <Route
          path="/parents/create"
          element={
            <AdminOrSuperAdminRoute user={userInfo}>
              <CreateParentScreen />
            </AdminOrSuperAdminRoute>
          }
        />
        // My Parent Profile // GET /api/parents/me // Access: Any authenticated
        user
        <Route
          path="/parents/me"
          element={
            <AuthenticatedRoute user={userInfo}>
              <MyParentProfileScreen />
            </AuthenticatedRoute>
          }
        />
        // Parent Details // GET /api/parents/:id // Access: Any authenticated
        user
        <Route
          path="/parents/:id"
          element={
            <AuthenticatedRoute user={userInfo}>
              <ParentDetailsScreen />
            </AuthenticatedRoute>
          }
        />
        // Edit Parent // PUT /api/parents/:id // Access: SCHOOL_ADMIN +
        SUPER_ADMIN
        <Route
          path="/parents/:id/edit"
          element={
            <AdminOrSuperAdminRoute user={userInfo}>
              <EditParentScreen />
            </AdminOrSuperAdminRoute>
          }
        />
        // ====================================================== // Class
        Routes // ====================================================== //
        Class List // GET /api/classes // Access: Any authenticated user
        <Route
          path="/classes"
          element={
            <AuthenticatedRoute user={userInfo}>
              <ClassListScreen />
            </AuthenticatedRoute>
          }
        />
        // Create Class // POST /api/classes // Access: SCHOOL_ADMIN +
        SUPER_ADMIN
        <Route
          path="/classes/create"
          element={
            <AdminOrSuperAdminRoute user={userInfo}>
              <CreateClassScreen />
            </AdminOrSuperAdminRoute>
          }
        />
        // Class Details // GET /api/classes/:id // Access: Any authenticated
        user
        <Route
          path="/classes/:id"
          element={
            <AuthenticatedRoute user={userInfo}>
              <ClassDetailsScreen />
            </AuthenticatedRoute>
          }
        />
        // Edit Class // PUT /api/classes/:id // Access: SCHOOL_ADMIN +
        SUPER_ADMIN
        <Route
          path="/classes/:id/edit"
          element={
            <AdminOrSuperAdminRoute user={userInfo}>
              <EditClassScreen />
            </AdminOrSuperAdminRoute>
          }
        />
        // ====================================================== // Section
        Routes // ====================================================== //
        Section List // GET /api/sections // Access: Any authenticated user
        <Route
          path="/sections"
          element={
            <AuthenticatedRoute user={userInfo}>
              <SectionListScreen />
            </AuthenticatedRoute>
          }
        />
        // Create Section // POST /api/sections // Access: SCHOOL_ADMIN +
        SUPER_ADMIN
        <Route
          path="/sections/create"
          element={
            <AdminOrSuperAdminRoute user={userInfo}>
              <CreateSectionScreen />
            </AdminOrSuperAdminRoute>
          }
        />
        // Section Details // GET /api/sections/:id // Access: Any authenticated
        user
        <Route
          path="/sections/:id"
          element={
            <AuthenticatedRoute user={userInfo}>
              <SectionDetailsScreen />
            </AuthenticatedRoute>
          }
        />
        // Edit Section // PUT /api/sections/:id // Access: SCHOOL_ADMIN +
        SUPER_ADMIN
        <Route
          path="/sections/:id/edit"
          element={
            <AdminOrSuperAdminRoute user={userInfo}>
              <EditSectionScreen />
            </AdminOrSuperAdminRoute>
          }
        />
        // ====================================================== // Stream
        Routes // ====================================================== //
        Stream List // GET /api/streams // Access: Any authenticated user
        <Route
          path="/streams"
          element={
            <AuthenticatedRoute user={userInfo}>
              <StreamListScreen />
            </AuthenticatedRoute>
          }
        />
        // Create Stream // POST /api/streams // Access: SCHOOL_ADMIN +
        SUPER_ADMIN
        <Route
          path="/streams/create"
          element={
            <AdminOrSuperAdminRoute user={userInfo}>
              <CreateStreamScreen />
            </AdminOrSuperAdminRoute>
          }
        />
        // Stream Details // GET /api/streams/:id // Access: Any authenticated
        user
        <Route
          path="/streams/:id"
          element={
            <AuthenticatedRoute user={userInfo}>
              <StreamDetailsScreen />
            </AuthenticatedRoute>
          }
        />
        // Edit Stream // PUT /api/streams/:id // Access: SCHOOL_ADMIN +
        SUPER_ADMIN
        <Route
          path="/streams/:id/edit"
          element={
            <AdminOrSuperAdminRoute user={userInfo}>
              <EditStreamScreen />
            </AdminOrSuperAdminRoute>
          }
        />
        // ====================================================== // Subject
        Combination Routes //
        ====================================================== // Subject
        Combination List // GET /api/subject-combinations // Access: Any
        authenticated user
        <Route
          path="/subject-combinations"
          element={
            <AuthenticatedRoute user={userInfo}>
              <SubjectCombinationListScreen />
            </AuthenticatedRoute>
          }
        />
        // Create Subject Combination // POST /api/subject-combinations //
        Access: SUPER_ADMIN only
        <Route
          path="/subject-combinations/create"
          element={
            <SuperAdminRoute user={userInfo}>
              <CreateSubjectCombinationScreen />
            </SuperAdminRoute>
          }
        />
        // Subject Combinations By Stream // GET
        /api/subject-combinations/stream/:streamId // Access: Any authenticated
        user
        <Route
          path="/subject-combinations/stream/:streamId"
          element={
            <AuthenticatedRoute user={userInfo}>
              <SubjectCombinationByStreamScreen />
            </AuthenticatedRoute>
          }
        />
        // Subject Combination Details // GET /api/subject-combinations/:id //
        Access: Any authenticated user
        <Route
          path="/subject-combinations/:id"
          element={
            <AuthenticatedRoute user={userInfo}>
              <SubjectCombinationViewScreen />
            </AuthenticatedRoute>
          }
        />
        // Edit Subject Combination // PUT /api/subject-combinations/:id //
        Access: SUPER_ADMIN only
        <Route
          path="/subject-combinations/:id/edit"
          element={
            <SuperAdminRoute user={userInfo}>
              <SubjectCombinationViewScreen />
            </SuperAdminRoute>
          }
        />
        // ====================================================== // Subject
        Routes // ====================================================== //
        Subject List // GET /api/subjects // Access: Any authenticated user
        <Route
          path="/subjects"
          element={
            <AuthenticatedRoute user={userInfo}>
              <SubjectListScreen />
            </AuthenticatedRoute>
          }
        />
        // Create Subject // POST /api/subjects // Access: SUPER_ADMIN only
        <Route
          path="/subjects/create"
          element={
            <SuperAdminRoute user={userInfo}>
              <CreateSubjectScreen />
            </SuperAdminRoute>
          }
        />
        // Subject Details // GET /api/subjects/:id // Access: Any authenticated
        user
        <Route
          path="/subjects/:id"
          element={
            <AuthenticatedRoute user={userInfo}>
              <SubjectDetailsScreen />
            </AuthenticatedRoute>
          }
        />
        // Edit Subject // PUT /api/subjects/:id // Access: SUPER_ADMIN only
        <Route
          path="/subjects/:id/edit"
          element={
            <SuperAdminRoute user={userInfo}>
              <EditSubjectScreen />
            </SuperAdminRoute>
          }
        />
        {/* ==================================================
    Chapter Routes
    ================================================== */}
        // Chapter List // GET /api/chapters // Access: Any authenticated user
        <Route
          path="/chapters"
          element={
            <AuthenticatedRoute user={userInfo}>
              <ChapterListScreen />
            </AuthenticatedRoute>
          }
        />
        // Create Chapter // POST /api/chapters // Access: SUPER_ADMIN only
        <Route
          path="/chapters/create"
          element={
            <SuperAdminRoute user={userInfo}>
              <CreateChapterScreen />
            </SuperAdminRoute>
          }
        />
        // Chapter Details // GET /api/chapters/:id // Access: Any authenticated
        user
        <Route
          path="/chapters/:id"
          element={
            <AuthenticatedRoute user={userInfo}>
              <ChapterDetailsScreen />
            </AuthenticatedRoute>
          }
        />
        // Edit Chapter // PUT /api/chapters/:id // Access: SUPER_ADMIN only
        <Route
          path="/chapters/:id/edit"
          element={
            <SuperAdminRoute user={userInfo}>
              <EditChapterScreen />
            </SuperAdminRoute>
          }
        />
        {/* ==================================================
    Topic Routes
    ================================================== */}
        // Topic List // GET /api/topics // Access: Any authenticated user
        <Route
          path="/topics"
          element={
            <AuthenticatedRoute user={userInfo}>
              <TopicListScreen />
            </AuthenticatedRoute>
          }
        />
        // Create Topic // POST /api/topics // Access: SUPER_ADMIN only
        <Route
          path="/topics/create"
          element={
            <SuperAdminRoute user={userInfo}>
              <CreateTopicScreen />
            </SuperAdminRoute>
          }
        />
        // Topic Details // GET /api/topics/:id // Access: Any authenticated
        user
        <Route
          path="/topics/:id"
          element={
            <AuthenticatedRoute user={userInfo}>
              <TopicDetailsScreen />
            </AuthenticatedRoute>
          }
        />
        // Edit Topic // PUT /api/topics/:id // Access: SUPER_ADMIN only
        <Route
          path="/topics/:id/edit"
          element={
            <SuperAdminRoute user={userInfo}>
              <EditTopicScreen />
            </SuperAdminRoute>
          }
        />
        {/* ==================================================
    Teacher Assignment Routes
    ================================================== */}
        // Teacher Assignment List // GET /api/teacher-assignments // Access:
        SCHOOL_ADMIN + SUPER_ADMIN
        <Route
          path="/teacher-assignments"
          element={
            <AdminOrSuperAdminRoute user={userInfo}>
              <TeacherAssignmentListScreen />
            </AdminOrSuperAdminRoute>
          }
        />
        // Create Teacher Assignment // POST /api/teacher-assignments // Access:
        SCHOOL_ADMIN + SUPER_ADMIN
        <Route
          path="/teacher-assignments/create"
          element={
            <AdminOrSuperAdminRoute user={userInfo}>
              <CreateTeacherAssignmentScreen />
            </AdminOrSuperAdminRoute>
          }
        />
        // My Teacher Assignments // GET /api/teacher-assignments/my // Access:
        Any authenticated user // Backend returns assignments for the logged-in
        teacher
        <Route
          path="/teacher-assignments/my"
          element={
            <AuthenticatedRoute user={userInfo}>
              <MyTeacherAssignmentsScreen />
            </AuthenticatedRoute>
          }
        />
        // Teacher Assignment Details // GET /api/teacher-assignments/:id //
        Access: Any authenticated user
        <Route
          path="/teacher-assignments/:id"
          element={
            <AuthenticatedRoute user={userInfo}>
              <TeacherAssignmentDetailsScreen />
            </AuthenticatedRoute>
          }
        />
        // Edit Teacher Assignment // PUT /api/teacher-assignments/:id //
        Access: SCHOOL_ADMIN + SUPER_ADMIN
        <Route
          path="/teacher-assignments/:id/edit"
          element={
            <AdminOrSuperAdminRoute user={userInfo}>
              <EditTeacherAssignmentScreen />
            </AdminOrSuperAdminRoute>
          }
        />
        {/* ==================================================
            Answer Editor Configuration Routes
            ================================================== */}
        {/* Answer Editor Configuration List
            GET /api/answer-editor-configurations
            Access: Any authenticated user
        */}
        <Route
          path="/answer-editor-configurations"
          element={
            <AuthenticatedRoute user={userInfo}>
              <AnswerEditorConfigurationListScreen />
            </AuthenticatedRoute>
          }
        />
        {/* Create Answer Editor Configuration
            POST /api/answer-editor-configurations
            Access: SUPER_ADMIN only
        */}
        <Route
          path="/answer-editor-configurations/create"
          element={
            <SuperAdminRoute user={userInfo}>
              <AnswerEditorConfigurationScreen />
            </SuperAdminRoute>
          }
        />
        {/* Answer Editor Configuration Details
            GET /api/answer-editor-configurations/:id
            Access: Any authenticated user
        */}
        <Route
          path="/answer-editor-configurations/:id"
          element={
            <AuthenticatedRoute user={userInfo}>
              <AnswerEditorConfigurationDetailsScreen />
            </AuthenticatedRoute>
          }
        />
        {/* Edit Answer Editor Configuration
            PUT /api/answer-editor-configurations/:id
            Access: SUPER_ADMIN only
        */}
        <Route
          path="/answer-editor-configurations/:id/edit"
          element={
            <SuperAdminRoute user={userInfo}>
              <EditAnswerEditorConfigurationScreen />
            </SuperAdminRoute>
          }
        />
        {/* ==================================================
    Question Group Routes
    ================================================== */}
        // Question Group List // GET /api/question-groups // Access: Any
        authenticated user
        <Route
          path="/question-groups"
          element={
            <AuthenticatedRoute user={userInfo}>
              <QuestionGroupListScreen />
            </AuthenticatedRoute>
          }
        />
        // Create Question Group // POST /api/question-groups // Access:
        SUPER_ADMIN only
        <Route
          path="/question-groups/create"
          element={
            <SuperAdminRoute user={userInfo}>
              <CreateQuestionGroupScreen />
            </SuperAdminRoute>
          }
        />
        // Question Group Details // GET /api/question-groups/:id // Access: Any
        authenticated user
        <Route
          path="/question-groups/:id"
          element={
            <AuthenticatedRoute user={userInfo}>
              <QuestionGroupDetailsScreen />
            </AuthenticatedRoute>
          }
        />
        // Edit Question Group // PUT /api/question-groups/:id // Access:
        SUPER_ADMIN only
        <Route
          path="/question-groups/:id/edit"
          element={
            <SuperAdminRoute user={userInfo}>
              <QuestionGroupEditScreen />
            </SuperAdminRoute>
          }
        />
        {/* ==================================================
    Question Routes
    ================================================== */}
        // Question List // GET /api/questions // Access: Any authenticated user
        <Route
          path="/questions"
          element={
            <AuthenticatedRoute user={userInfo}>
              <QuestionListScreen />
            </AuthenticatedRoute>
          }
        />
        // Create Question // POST /api/questions // Access: SUPER_ADMIN only
        <Route
          path="/questions/create"
          element={
            <SuperAdminRoute user={userInfo}>
              <CreateQuestionScreen />
            </SuperAdminRoute>
          }
        />
        // Question Details // GET /api/questions/:id // Access: Any
        authenticated user
        <Route
          path="/questions/:id"
          element={
            <AuthenticatedRoute user={userInfo}>
              <QuestionDetailsScreen />
            </AuthenticatedRoute>
          }
        />
        // Edit Question // PUT /api/questions/:id // Access: SUPER_ADMIN only
        <Route
          path="/questions/:id/edit"
          element={
            <SuperAdminRoute user={userInfo}>
              <QuestionEditScreen />
            </SuperAdminRoute>
          }
        />
        {/* ==================================================
    Question Blueprint Routes
    ================================================== */}
        // Question Blueprint List // GET /api/question-blueprints // Access:
        Any authenticated user
        <Route
          path="/question-blueprints"
          element={
            <AuthenticatedRoute user={userInfo}>
              <QuestionBlueprintListScreen />
            </AuthenticatedRoute>
          }
        />
        // My Question Blueprints // GET /api/question-blueprints/my-blueprints
        // Access: Any authenticated user // Backend returns blueprints
        belonging to the logged-in user
        <Route
          path="/question-blueprints/my-blueprints"
          element={
            <AuthenticatedRoute user={userInfo}>
              <MyQuestionBlueprintsScreen />
            </AuthenticatedRoute>
          }
        />
        // Create Question Blueprint // POST /api/question-blueprints // Access:
        SUPER_ADMIN only
        <Route
          path="/question-blueprints/create"
          element={
            <SuperAdminRoute user={userInfo}>
              <CreateQuestionBlueprintScreen />
            </SuperAdminRoute>
          }
        />
        // Question Blueprint Details // GET /api/question-blueprints/:id //
        Access: Any authenticated user
        <Route
          path="/question-blueprints/:id"
          element={
            <AuthenticatedRoute user={userInfo}>
              <QuestionBlueprintDetailsScreen />
            </AuthenticatedRoute>
          }
        />
        // Edit Question Blueprint // PUT /api/question-blueprints/:id //
        Access: SUPER_ADMIN only
        <Route
          path="/question-blueprints/:id/edit"
          element={
            <SuperAdminRoute user={userInfo}>
              <EditQuestionBlueprintScreen />
            </SuperAdminRoute>
          }
        />
        {/* ==================================================
    Assessment Routes
    ================================================== */}
        // Assessment List // GET /api/assessments // Access: Any authenticated
        user
        <Route
          path="/assessments"
          element={
            <AuthenticatedRoute user={userInfo}>
              <AssessmentListScreen />
            </AuthenticatedRoute>
          }
        />
        // My Assessments // GET /api/assessments/my-assessments // Access: Any
        authenticated user
        <Route
          path="/assessments/my-assessments"
          element={
            <AuthenticatedRoute user={userInfo}>
              <MyAssessmentsScreen />
            </AuthenticatedRoute>
          }
        />
        // Create Assessment // POST /api/assessments // Access: SCHOOL_ADMIN,
        HM, TEACHER
        <Route
          path="/assessments/create"
          element={
            <TeacherOrHMOrAdminRoute user={userInfo}>
              <CreateAssessmentScreen />
            </TeacherOrHMOrAdminRoute>
          }
        />
        // Assessment Details // GET /api/assessments/:id // Access: Any
        authenticated user
        <Route
          path="/assessments/:id"
          element={
            <AuthenticatedRoute user={userInfo}>
              <AssessmentDetailsscreen />
            </AuthenticatedRoute>
          }
        />
        // Edit Assessment // PUT /api/assessments/:id // Access: SCHOOL_ADMIN,
        HM, TEACHER
        <Route
          path="/assessments/:id/edit"
          element={
            <TeacherOrHMOrAdminRoute user={userInfo}>
              <EditAssessmentscreen />
            </TeacherOrHMOrAdminRoute>
          }
        />
        {/* ==================================================
    Assessment Section Routes
    ================================================== */}
        // Assessment Section List // GET /api/assessment-sections // Access:
        Any authenticated user
        <Route
          path="/assessment-sections"
          element={
            <AuthenticatedRoute user={userInfo}>
              <AssessmentSectionListScreen />
            </AuthenticatedRoute>
          }
        />
        // Create Assessment Section // POST /api/assessment-sections // Access:
        SCHOOL_ADMIN, HM, TEACHER
        <Route
          path="/assessment-sections/create"
          element={
            <TeacherOrHMOrAdminRoute user={userInfo}>
              <CreateAssessmentSectionScreen />
            </TeacherOrHMOrAdminRoute>
          }
        />
        // Assessment Sections by Assessment // GET
        /api/assessment-sections/assessment/:assessmentId // Access: Any
        authenticated user // Reuses the details screen if it supports
        assessmentId, // or replace with a dedicated screen if needed. //
        Assessment Section Details // GET /api/assessment-sections/:id //
        Access: Any authenticated user
        <Route
          path="/assessment-sections/:id"
          element={
            <AuthenticatedRoute user={userInfo}>
              <AssessmentSectionDetails />
            </AuthenticatedRoute>
          }
        />
        // Edit Assessment Section // PUT /api/assessment-sections/:id //
        Access: SCHOOL_ADMIN, HM, TEACHER
        <Route
          path="/assessment-sections/:id/edit"
          element={
            <TeacherOrHMOrAdminRoute user={userInfo}>
              <EditAssessmentSectionscreen />
            </TeacherOrHMOrAdminRoute>
          }
        />
        {/* ==================================================
    Assessment Question Routes
    ================================================== */}
        // Assessment Question List // GET /api/assessment-questions // Access:
        Any authenticated user with an authorized // school role (SCHOOL_ADMIN,
        HM, TEACHER)
        <Route
          path="/assessment-questions"
          element={
            <TeacherOrHMOrAdminRoute user={userInfo}>
              <AssessmentQuestionListScreen />
            </TeacherOrHMOrAdminRoute>
          }
        />
        // Create Assessment Question // POST /api/assessment-questions //
        Access: SCHOOL_ADMIN, HM, TEACHER
        <Route
          path="/assessment-questions/create"
          element={
            <TeacherOrHMOrAdminRoute user={userInfo}>
              <CreateAssessmentQuestion />
            </TeacherOrHMOrAdminRoute>
          }
        />
        // Assessment Question Details // GET /api/assessment-questions/:id //
        Access: SCHOOL_ADMIN, HM, TEACHER
        <Route
          path="/assessment-questions/:id"
          element={
            <TeacherOrHMOrAdminRoute user={userInfo}>
              <AssessmentQuestionDetailsScreen />
            </TeacherOrHMOrAdminRoute>
          }
        />

        
        {/* ==================================================
            Student Attempt Routes
            ================================================== */}

        {/*
          Start Student Attempt
          Backend: POST /api/student-attempts/start
          Access: STUDENT only
        */}
        <Route
          path="/student-attempts/start"
          element={
            <StudentRoute user={userInfo}>
              <StartStudentAttemptScreen />
            </StudentRoute>
          }
        />

        {/*
          My Student Attempts
          Backend: GET /api/student-attempts/my
          Access: STUDENT only
        */}
        <Route
          path="/student-attempts/my"
          element={
            <StudentRoute user={userInfo}>
              <StudentAttemptsScreen />
            </StudentRoute>
          }
        />

        {/*
          Update Activity / Submit Attempt
          Backend:
          PATCH /api/student-attempts/:id/activity
          PATCH /api/student-attempts/:id/submit
          Access: STUDENT only
        */}
        <Route
          path="/student/assessments/attempt/:id"
          element={
            <StudentRoute user={userInfo}>
              <StudentAssessmentAttemptScreen />
            </StudentRoute>
          }
        />

        {/*
          Attempts by Assessment
          Backend: GET /api/student-attempts/assessment/:assessmentId
          Access: Authenticated users
          Backend must enforce student ownership and staff school scope.
        */}
        <Route
          path="/student-attempts/assessment/:assessmentId"
          element={
            <AuthenticatedRoute user={userInfo}>
              <StudentAttempstByAssessment />
            </AuthenticatedRoute>
          }
        />

        {/*
          Attempts by Student
          Backend: GET /api/student-attempts/student/:studentId
          Access: Authenticated users
          Backend must enforce ownership and school scope.
        */}
        <Route
          path="/student-attempts/student/:studentId"
          element={
            <AuthenticatedRoute user={userInfo}>
              <StudentAttemptsByStudentScreen />
            </AuthenticatedRoute>
          }
        />

        {/*
          All Student Attempts
          Backend: GET /api/student-attempts
          Access: Authenticated users
          Backend must filter records according to the user's role.
        */}
        <Route
          path="/student-attempts"
          element={
            <AuthenticatedRoute user={userInfo}>
              <StudentAttemptsListScreen />
            </AuthenticatedRoute>
          }
        />

        {/*
          Single Student Attempt Details
          Backend: GET /api/student-attempts/:id
          Access: Authenticated users
          Backend must enforce ownership and school scope.
        */}
        <Route
          path="/student-attempts/:id"
          element={
            <AuthenticatedRoute user={userInfo}>
              <StudentAttemptDetailsScreen />
            </AuthenticatedRoute>
          }
        />


        
        {/* ==================================================
            Student Answer Routes
            ================================================== */}

        {/*
          Student Assessment Screen
          Backend:
          POST /api/student-answers/save
          GET  /api/student-answers/my
          Access: Authenticated users
          Backend validates student ownership and school scope.
        */}
        <Route
          path="/student-answers"
          element={
            <AuthenticatedRoute user={userInfo}>
              <StudentAnswersScreen />
            </AuthenticatedRoute>
          }
        />

        {/*
          My Student Answers
          Backend: GET /api/student-answers/my
          Access: Authenticated users
          Backend derives student identity from req.user.
        */}
        <Route
          path="/student-answers/my"
          element={
            <AuthenticatedRoute user={userInfo}>
              <StudentAnswersScreen />
            </AuthenticatedRoute>
          }
        />

        {/*
          Answers for an Attempt
          Backend:
          GET   /api/student-answers/attempt/:attemptId
          PATCH /api/student-answers/attempt/:attemptId/submit-all
          Access: Authenticated users
          Backend validates attempt ownership and school scope.
        */}
        <Route
          path="/student-answers/attempt/:attemptId"
          element={
            <AuthenticatedRoute user={userInfo}>
              <StudentAttemptReviewScreen />
            </AuthenticatedRoute>
          }
        />

        {/*
          Assessment Review
          Access: Authenticated users
          Backend must validate access to the assessment and answers.
        */}
        <Route
          path="/student-answers/assessment/:assessmentId/review"
          element={
            <AuthenticatedRoute user={userInfo}>
              <StudentAssessmentReviewScreen />
            </AuthenticatedRoute>
          }
        />

        {/*
          Student Answer Details
          Backend:
          GET /api/student-answers/:id
          PUT /api/student-answers/:id
          Access: Authenticated users
          Backend validates ownership and school scope.
        */}
        <Route
          path="/student-answers/:id"
          element={
            <AuthenticatedRoute user={userInfo}>
              <StudentAnswerDetailsScreen />
            </AuthenticatedRoute>
          }
        />

        {/*
          Student Answer Evaluation
          Backend:
          GET   /api/student-answers/:id
          PATCH /api/student-answers/:id/status
          Access: Teacher, HM, School Admin
          Staff role guard protects the evaluation screen.
        */}
        <Route
          path="/student-answers/:id/evaluate"
          element={
            <TeacherOrHMOrAdminRoute user={userInfo}>
              <StudentAnswerEvaluationScreen />
            </TeacherOrHMOrAdminRoute>
          }
        />


{/* ==================================================
    ANSWER EVALUATION ROUTES
    ================================================== */}

{/*
  Evaluation Management
  Backend: GET /api/answer-evaluations
  Access: Authenticated users
*/}
<Route
  path="/answer-evaluations"
  element={
    <AuthenticatedRoute user={userInfo}>
      <EvaluationManagementScreen />
    </AuthenticatedRoute>
  }
/>

/*
  Create Answer Evaluation
  Backend: POST /api/answer-evaluations
  Access: TEACHER only
*/
<Route
  path="/answer-evaluations/create"
  element={
    <TeacherRoute user={userInfo}>
      <createAnswerEvaluation />
    </TeacherRoute>
  }
/>

{/*
  My Evaluations
  Backend: GET /api/answer-evaluations/my
  Access: TEACHER only
*/}
<Route
  path="/answer-evaluations/my"
  element={
    <TeacherRoute user={userInfo}>
      <EvaluationHistoryScreen />
    </TeacherRoute>
  }
/>

{/*
  Pending Evaluations
  Backend: GET /api/answer-evaluations/pending
  Access: TEACHER only
*/}
<Route
  path="/answer-evaluations/pending"
  element={
    <TeacherRoute user={userInfo}>
      <AnswerEvaluationPendingScreen />
    </TeacherRoute>
  }
/>

<Route
  path="/teacher/answer-evaluation/:studentAnswerId"
  element={
    <TeacherRoute user={userInfo}>
      <createAnswerEvaluation />
    </TeacherRoute>
  }
/>

{/*
  Create Evaluation
  Backend: POST /api/answer-evaluations
  Access: TEACHER only
*/}
<Route
  path="/answer-evaluations/create/:studentAnswerId"
  element={
    <TeacherRoute user={userInfo}>
      <StudentAnswerEvaluationScreen />
    </TeacherRoute>
  }
/>

{/*
  Evaluation by Student Answer
  Backend: GET /api/answer-evaluations/student-answer/:studentAnswerId
  Access: Any authenticated user
*/}
<Route
  path="/answer-evaluations/student-answer/:studentAnswerId"
  element={
    <AuthenticatedRoute user={userInfo}>
      <AnswerEvaluationViewScreen />
    </AuthenticatedRoute>
  }
/>

{/*
  Evaluations by Attempt
  Backend: GET /api/answer-evaluations/attempt/:attemptId
  Access: Any authenticated user
*/}
<Route
  path="/answer-evaluations/attempt/:attemptId"
  element={
    <AuthenticatedRoute user={userInfo}>
      <AttemptEvaluationSummaryScreen />
    </AuthenticatedRoute>
  }
/>

{/*
  Evaluations by Student
  Backend: GET /api/answer-evaluations/student/:studentId
  Access: Any authenticated user
*/}
<Route
  path="/answer-evaluations/student/:studentId"
  element={
    <AuthenticatedRoute user={userInfo}>
      <StudentEvaluationHistoryScreen />
    </AuthenticatedRoute>
  }
/>

{/*
  Evaluation Details
  Backend: GET /api/answer-evaluations/:id
  Access: Any authenticated user
*/}
<Route
  path="/answer-evaluations/:id"
  element={
    <AuthenticatedRoute user={userInfo}>
      <AnswerEvaluationViewScreen />
    </AuthenticatedRoute>
  }
/>

{/*
  Edit / Re-evaluate
  Backend: PUT /api/answer-evaluations/:id
  Access: TEACHER only
*/}
<Route
  path="/answer-evaluations/:id/edit"
  element={
    <TeacherRoute user={userInfo}>
      <AnswerEvaluationEditScreen />
    </TeacherRoute>
  }
/>

{/*
  Teacher Dashboard
  Access: TEACHER only
*/}



{/* ==================================================
    RESULT ROUTES
    ================================================== */}

{/*
  Results List
  Backend: GET /api/results
  Access: Any authenticated user
  Backend filters results according to role and school.
*/}
<Route
  path="/results"
  element={
    <AuthenticatedRoute user={userInfo}>
      <ResultListPage />
    </AuthenticatedRoute>
  }
/>

{/*
  Results by Assessment
  Backend: GET /api/results/assessment/:assessmentId
  Access: Any authenticated user
  Backend enforces school-level access.
*/}
<Route
  path="/results/assessment/:assessmentId"
  element={
    <AuthenticatedRoute user={userInfo}>
      <AsssesmentResultsPage />
    </AuthenticatedRoute>
  }
/>

{/*
  Results by Student
  Backend: GET /api/results/student/:studentId

  Access:
  - Student: Own results only
  - Teacher, HM, School Admin: Students in their school

  Backend validates ownership and school scope.
*/}
<Route
  path="/results/student/:studentId"
  element={
    <AuthenticatedRoute user={userInfo}>
      <StudentResultsPage />
    </AuthenticatedRoute>
  }
/>

{/*
  Result by Assessment and Student
  Backend:
  GET /api/results/assessment/:assessmentId/student/:studentId

  Access:
  - Student: Own results only
  - Teacher, HM, School Admin: Students in their school
*/}
<Route
  path="/results/assessment/:assessmentId/student/:studentId"
  element={
    <AuthenticatedRoute user={userInfo}>
      <StudentAssessmentResultPage />
    </AuthenticatedRoute>
  }
/>

{/*
  Result by Student Attempt
  Backend: GET /api/results/attempt/:attemptId
  Access: Any authenticated user
  Backend validates attempt ownership and school scope.
*/}
<Route
  path="student/assessments/attempt/:attemptId/result"
  element={
    <AuthenticatedRoute user={userInfo}>
      <AttemptResultPage />
    </AuthenticatedRoute>
  }
/>

{/*
  Single Result Details
  Backend: GET /api/results/:id
  Access: Any authenticated user
  Backend validates access to the requested result.
*/}
<Route
  path="/results/:id"
  element={
    <AuthenticatedRoute user={userInfo}>
      <ResultDetailsPage />
    </AuthenticatedRoute>
  }
/>


{/* ==================================================
    RESULT DETAIL ROUTES
    ================================================== */}

/*
  Assessment Question Result
  Backend: GET /api/result-details/assessment-question/:assessmentQuestionId?result=:resultId
  Access: Any authenticated user
  Backend validates result ownership and school scope.
*/
<Route
  path="/result-details/assessment-question/:assessmentQuestionId"
  element={
    <AuthenticatedRoute user={userInfo}>
      <AssessmentQuestionResultPage />
    </AuthenticatedRoute>
  }
/>

/*
  Evaluation Queue / Pending Evaluations
  Backend: GET /api/result-details/pending
  Access: TEACHER, HM, SCHOOL_ADMIN
*/
<Route
  path="/result-details/pending"
  element={
    <TeacherOrHMOrAdminRoute user={userInfo}>
      <EvaluationQueuePage />
    </TeacherOrHMOrAdminRoute>
  }
/>

/*
  Question Performance
  Backend: GET /api/result-details/question/:questionId
  Access: Any authenticated user
  Backend validates school scope.
*/
<Route
  path="/result-details/question/:questionId"
  element={
    <AuthenticatedRoute user={userInfo}>
      <QuestionPerformancePage />
    </AuthenticatedRoute>
  }
/>

/*
  Single Result Detail
  Backend: GET /api/result-details/:id
  Access: Any authenticated user
*/
<Route
  path="/result-details/:id"
  element={
    <AuthenticatedRoute user={userInfo}>
      <ResultDetailPage />
    </AuthenticatedRoute>
  }
/>

/*
  Result Details by Result
  Backend: GET /api/result-details/result/:resultId
  Access: Any authenticated user
*/
<Route
  path="/result-details/result/:resultId"
  element={
    <AuthenticatedRoute user={userInfo}>
      <ResultDetailsByResultPage />
    </AuthenticatedRoute>
  }
/>

/*
  Result Details Overview
  Backend: GET /api/result-details
  Access: Any authenticated user
*/
<Route
  path="/result-details"
  element={
    <AuthenticatedRoute user={userInfo}>
      <ResultDetailsViewPage />
    </AuthenticatedRoute>
  }
/>

/*
  Result Details by Student
  Backend: GET /api/result-details/student/:studentId
  Access: Any authenticated user
  Backend validates student ownership and school scope.
*/
<Route
  path="/result-details/student/:studentId"
  element={
    <AuthenticatedRoute user={userInfo}>
      <StudentResultDetailsPage />
    </AuthenticatedRoute>
  }
/>

/*
  Subject Result Analysis
  Backend: GET /api/result-details/subject/:subjectId
  Access: Any authenticated user
  Backend validates school scope.
*/
<Route
  path="/result-details/subject/:subjectId"
  element={
    <AuthenticatedRoute user={userInfo}>
      <SubjectResultAnalysisPage />
    </AuthenticatedRoute>
  }
/>

/*
  My Result Detail Evaluations
  Backend: GET /api/result-details/my-evaluations
  Access: TEACHER only
  Use this route if EvaluationQueuePage is intended for the
  teacher's personal evaluations instead of pending evaluations.
*/
<Route
  path="/result-details/my-evaluations"
  element={
    <TeacherRoute user={userInfo}>
      <EvaluationQueuePage />
    </TeacherRoute>
  }
/>

/*
  Update Evaluation Status
  Backend: PATCH /api/result-details/:id/status
  Access: TEACHER, HM, SCHOOL_ADMIN
  This API action is handled by the screen; it does not need
  a separate frontend page route.
*/

/*
  Update Result Detail
  Backend: PUT /api/result-details/:id
  Access: TEACHER, HM, SCHOOL_ADMIN
  This API action is handled by the screen; it does not need
  a separate frontend page route.
*/

/*
  Delete Result Detail
  Backend: DELETE /api/result-details/:id
  Access: HM, SCHOOL_ADMIN
  This API action is handled by the screen; it does not need
  a separate frontend page route.
*/


        // Edit Assessment Question // PUT /api/assessment-questions/:id //
        Access: SCHOOL_ADMIN, HM, TEACHER
        <Route
          path="/admin/users"
          element={
            <AdminOrSuperAdminRoute user={userInfo}>
              <UserListScreen />
            </AdminOrSuperAdminRoute>
          }
        />
        <Route
          path="/admin/user/:id/edit"
          element={
            <AdminOrSuperAdminRoute user={userInfo}>
              <UserEditScreen />
            </AdminOrSuperAdminRoute>
          }
        />
        {/* ==================================================
            HM + SCHOOL_ADMIN
            ================================================== */}
        <Route
          path="/staff-management"
          element={
            <HMOrAdminRoute user={userInfo}>
              <HomeScreen />
            </HMOrAdminRoute>
          }
        />
        {/* ==================================================
            TEACHER + HM
            ================================================== */}
        <Route
          path="/teacher-hm-management"
          element={
            <TeacherOrHMRoute user={userInfo}>
              <HomeScreen />
            </TeacherOrHMRoute>
          }
        />
        {/* ==================================================
            TEACHER + HM + SCHOOL_ADMIN
            ================================================== */}
      </Route>,
    ),
  );

  return <RouterProvider router={router} />;
};

// ======================================================
// Mount React App
// ======================================================

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <React.StrictMode>
    <HelmetProvider>
      <Provider store={store}>
        <RouterWrapper />
      </Provider>
    </HelmetProvider>
  </React.StrictMode>,
);

reportWebVitals();
