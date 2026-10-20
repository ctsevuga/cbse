import React from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

const HomeScreen = () => {
  const { userInfo } = useSelector((state) => state.auth);

  const navigate = useNavigate();

  const role = userInfo?.role;

  const isSuperAdmin = role === "SUPER_ADMIN";
  const isSchoolAdmin = role === "SCHOOL_ADMIN";
  const isHM = role === "HM";
  const isTeacher = role === "TEACHER";
  const isStudent = role === "STUDENT";
  const isParent = role === "PARENT";

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="mx-auto max-w-7xl p-6">
        <div className="rounded-2xl bg-white p-8 text-center shadow-lg">
          <h1 className="text-3xl font-bold text-gray-800">
            Welcome, {userInfo?.name}
          </h1>

          <p className="mt-3 text-lg text-gray-600">
            Online Coaching Center Management System
          </p>

          <div className="mt-6 inline-flex items-center rounded-full bg-blue-100 px-5 py-2 font-semibold text-blue-700">
            Logged in as {role}
          </div>
        </div>

        {isSuperAdmin && (
          <div className="mt-10">
            <h2 className="mb-6 text-2xl font-bold text-gray-800">
              Super Administrator Dashboard
            </h2>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              <button
                type="button"
                onClick={() => navigate("/schools")}
                className="rounded-2xl bg-white p-6 text-left shadow-lg transition-all hover:-translate-y-1 hover:shadow-xl"
              >
                <h3 className="text-xl font-bold text-indigo-600">
                  School Management
                </h3>
                <p className="mt-2 text-gray-600">Create and manage schools.</p>
              </button>

              <button
                type="button"
                onClick={() => navigate("/schools/create")}
                className="rounded-2xl bg-white p-6 text-left shadow-lg transition-all hover:-translate-y-1 hover:shadow-xl"
              >
                <h3 className="text-xl font-bold text-purple-600">
                  Create School
                </h3>
                <p className="mt-2 text-gray-600">Create a new school.</p>
              </button>

              <button
                type="button"
                onClick={() => navigate("/streams")}
                className="rounded-2xl bg-white p-6 text-left shadow-lg transition-all hover:-translate-y-1 hover:shadow-xl"
              >
                <h3 className="text-xl font-bold text-violet-600">Streams</h3>
                <p className="mt-2 text-gray-600">
                  View and manage academic streams.
                </p>
              </button>

              <button
                type="button"
                onClick={() => navigate("/subjects")}
                className="rounded-2xl bg-white p-6 text-left shadow-lg transition-all hover:-translate-y-1 hover:shadow-xl"
              >
                <h3 className="text-xl font-bold text-emerald-600">Subjects</h3>
                <p className="mt-2 text-gray-600">
                  Manage the global CBSE subject master.
                </p>
              </button>

              <button
                type="button"
                onClick={() => navigate("/subjects/create")}
                className="rounded-2xl bg-white p-6 text-left shadow-lg transition-all hover:-translate-y-1 hover:shadow-xl"
              >
                <h3 className="text-xl font-bold text-green-600">
                  Create Subject
                </h3>
                <p className="mt-2 text-gray-600">Create a new CBSE subject.</p>
              </button>

              <button
                type="button"
                onClick={() => navigate("/subject-combinations")}
                className="rounded-2xl bg-white p-6 text-left shadow-lg transition-all hover:-translate-y-1 hover:shadow-xl"
              >
                <h3 className="text-xl font-bold text-amber-600">
                  Subject Combinations
                </h3>
                <p className="mt-2 text-gray-600">
                  View standard subject combinations.
                </p>
              </button>

              <button
                type="button"
                onClick={() => navigate("/subject-combinations/create")}
                className="rounded-2xl bg-white p-6 text-left shadow-lg transition-all hover:-translate-y-1 hover:shadow-xl"
              >
                <h3 className="text-xl font-bold text-red-600">
                  Create Subject Combination
                </h3>
                <p className="mt-2 text-gray-600">
                  Create a standard subject combination for a stream.
                </p>
              </button>

              <button
                type="button"
                onClick={() => navigate("/chapters")}
                className="rounded-2xl bg-white p-6 text-left shadow-lg transition-all hover:-translate-y-1 hover:shadow-xl"
              >
                <h3 className="text-xl font-bold text-amber-600">Chapters</h3>
                <p className="mt-2 text-gray-600">View standard Chapters.</p>
              </button>

              <button
                type="button"
                onClick={() => navigate("/chapters/create")}
                className="rounded-2xl bg-white p-6 text-left shadow-lg transition-all hover:-translate-y-1 hover:shadow-xl"
              >
                <h3 className="text-xl font-bold text-red-600">
                  Create Chapter
                </h3>
                <p className="mt-2 text-gray-600">
                  Create a chapter for a subject.
                </p>
              </button>

              <button
                type="button"
                onClick={() => navigate("/topics")}
                className="rounded-2xl bg-white p-6 text-left shadow-lg transition-all hover:-translate-y-1 hover:shadow-xl"
              >
                <h3 className="text-xl font-bold text-amber-600">Topics</h3>
                <p className="mt-2 text-gray-600">View standard Topics.</p>
              </button>

              <button
                type="button"
                onClick={() => navigate("/topics/create")}
                className="rounded-2xl bg-white p-6 text-left shadow-lg transition-all hover:-translate-y-1 hover:shadow-xl"
              >
                <h3 className="text-xl font-bold text-amber-600">
                  Create Topic
                </h3>
                <p className="mt-2 text-gray-600">
                  Create Topic for the Chapter.
                </p>
              </button>

              <button
                type="button"
                onClick={() => navigate("/answer-editor-configurations")}
                className="rounded-2xl bg-white p-6 text-left shadow-lg transition-all hover:-translate-y-1 hover:shadow-xl"
              >
                <h3 className="text-xl font-bold text-amber-600">
                  Answer Editor Configuration List
                </h3>
                <p className="mt-2 text-gray-600">
                  View Answer Editor Configuration List.
                </p>
              </button>

              <button
                type="button"
                onClick={() => navigate("/answer-editor-configurations/create")}
                className="rounded-2xl bg-white p-6 text-left shadow-lg transition-all hover:-translate-y-1 hover:shadow-xl"
              >
                <h3 className="text-xl font-bold text-red-600">
                  Create Answer Editor Configuration
                </h3>
                <p className="mt-2 text-gray-600">
                  Create Answer Editor Configuration
                </p>
              </button>

              <button
                type="button"
                onClick={() => navigate("/question-groups")}
                className="rounded-2xl bg-white p-6 text-left shadow-lg transition-all hover:-translate-y-1 hover:shadow-xl"
              >
                <h3 className="text-xl font-bold text-red-600">
                  Question Group List
                </h3>
                <p className="mt-2 text-gray-600">Question Group List</p>
              </button>

              <button
                type="button"
                onClick={() => navigate("/question-groups/create")}
                className="rounded-2xl bg-white p-6 text-left shadow-lg transition-all hover:-translate-y-1 hover:shadow-xl"
              >
                <h3 className="text-xl font-bold text-red-600">
                  Create Question Group
                </h3>
                <p className="mt-2 text-gray-600">Create Question Group.</p>
              </button>

              <button
                type="button"
                onClick={() => navigate("/questions")}
                className="rounded-2xl bg-white p-6 text-left shadow-lg transition-all hover:-translate-y-1 hover:shadow-xl"
              >
                <h3 className="text-xl font-bold text-red-600">
                  Questions List
                </h3>
                <p className="mt-2 text-gray-600">Questions List</p>
              </button>

              <button
                type="button"
                onClick={() => navigate("/question/create")}
                className="rounded-2xl bg-white p-6 text-left shadow-lg transition-all hover:-translate-y-1 hover:shadow-xl"
              >
                <h3 className="text-xl font-bold text-red-600">
                  Create Question
                </h3>
                <p className="mt-2 text-gray-600">Create Question .</p>
              </button>
            </div>
          </div>
        )}

        {isSchoolAdmin && (
          <div className="mt-10">
            <h2 className="mb-6 text-2xl font-bold text-gray-800">
              School Administrator Dashboard
            </h2>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              <button
                type="button"
                onClick={() => navigate("/my-school")}
                className="rounded-2xl bg-white p-6 text-left shadow-lg transition-all hover:-translate-y-1 hover:shadow-xl"
              >
                <h3 className="text-xl font-bold text-indigo-600">My School</h3>
                <p className="mt-2 text-gray-600">
                  View your school information.
                </p>
              </button>

              <button
                type="button"
                onClick={() => navigate("/academic-years")}
                className="rounded-2xl bg-white p-6 text-left shadow-lg transition-all hover:-translate-y-1 hover:shadow-xl"
              >
                <h3 className="text-xl font-bold text-blue-600">
                  Academic Years
                </h3>
                <p className="mt-2 text-gray-600">
                  Manage academic years for your school.
                </p>
              </button>

              <button
                type="button"
                onClick={() => navigate("/admin/users")}
                className="rounded-2xl bg-white p-6 text-left shadow-lg transition-all hover:-translate-y-1 hover:shadow-xl"
              >
                <h3 className="text-xl font-bold text-purple-600">
                  User Management
                </h3>
                <p className="mt-2 text-gray-600">
                  Manage users in your school.
                </p>
              </button>

              <button
                type="button"
                onClick={() => navigate("/students")}
                className="rounded-2xl bg-white p-6 text-left shadow-lg transition-all hover:-translate-y-1 hover:shadow-xl"
              >
                <h3 className="text-xl font-bold text-green-600">Students</h3>
                <p className="mt-2 text-gray-600">View and manage students.</p>
              </button>

              <button
                type="button"
                onClick={() => navigate("/teachers")}
                className="rounded-2xl bg-white p-6 text-left shadow-lg transition-all hover:-translate-y-1 hover:shadow-xl"
              >
                <h3 className="text-xl font-bold text-orange-600">Teachers</h3>
                <p className="mt-2 text-gray-600">View and manage teachers.</p>
              </button>

              <button
                type="button"
                onClick={() => navigate("/parents")}
                className="rounded-2xl bg-white p-6 text-left shadow-lg transition-all hover:-translate-y-1 hover:shadow-xl"
              >
                <h3 className="text-xl font-bold text-pink-600">Parents</h3>
                <p className="mt-2 text-gray-600">View and manage parents.</p>
              </button>

              <button
                type="button"
                onClick={() => navigate("/classes")}
                className="rounded-2xl bg-white p-6 text-left shadow-lg transition-all hover:-translate-y-1 hover:shadow-xl"
              >
                <h3 className="text-xl font-bold text-cyan-600">Classes</h3>
                <p className="mt-2 text-gray-600">View and manage classes.</p>
              </button>

              <button
                type="button"
                onClick={() => navigate("/sections")}
                className="rounded-2xl bg-white p-6 text-left shadow-lg transition-all hover:-translate-y-1 hover:shadow-xl"
              >
                <h3 className="text-xl font-bold text-teal-600">Sections</h3>
                <p className="mt-2 text-gray-600">View and manage sections.</p>
              </button>

              <button
                type="button"
                onClick={() => navigate("/teacher-assignments")}
                className="rounded-2xl bg-white p-6 text-left shadow-lg transition-all hover:-translate-y-1 hover:shadow-xl"
              >
                <h3 className="text-xl font-bold text-cyan-600">
                  Teacher Assignments
                </h3>
                <p className="mt-2 text-gray-600">
                  View and ManageTeacher Assignments.
                </p>
              </button>

              <button
                type="button"
                onClick={() => navigate("/teacher-assignments/create")}
                className="rounded-2xl bg-white p-6 text-left shadow-lg transition-all hover:-translate-y-1 hover:shadow-xl"
              >
                <h3 className="text-xl font-bold text-teal-600">
                  Create Teacher Assignment
                </h3>
                <p className="mt-2 text-gray-600">Create Teacher Assignment.</p>
              </button>
              <button
                type="button"
                onClick={() => navigate("/chapters")}
                className="rounded-2xl bg-white p-6 text-left shadow-lg transition-all hover:-translate-y-1 hover:shadow-xl"
              >
                <h3 className="text-xl font-bold text-amber-600">Chapters</h3>
                <p className="mt-2 text-gray-600">View standard Chapters.</p>
              </button>

              <button
                type="button"
                onClick={() => navigate("/topics")}
                className="rounded-2xl bg-white p-6 text-left shadow-lg transition-all hover:-translate-y-1 hover:shadow-xl"
              >
                <h3 className="text-xl font-bold text-amber-600">Topics</h3>
                <p className="mt-2 text-gray-600">View standard Topics.</p>
              </button>

              <button
                type="button"
                onClick={() => navigate("/question-groups")}
                className="rounded-2xl bg-white p-6 text-left shadow-lg transition-all hover:-translate-y-1 hover:shadow-xl"
              >
                <h3 className="text-xl font-bold text-red-600">
                  Question Group List
                </h3>
                <p className="mt-2 text-gray-600">Question Group List</p>
              </button>

              <button
                type="button"
                onClick={() => navigate("/questions")}
                className="rounded-2xl bg-white p-6 text-left shadow-lg transition-all hover:-translate-y-1 hover:shadow-xl"
              >
                <h3 className="text-xl font-bold text-red-600">
                  Questions List
                </h3>
                <p className="mt-2 text-gray-600">Questions List</p>
              </button>

              <button
                type="button"
                onClick={() => navigate("/assessments")}
                className="rounded-2xl bg-white p-6 text-left shadow-lg transition-all hover:-translate-y-1 hover:shadow-xl"
              >
                <h3 className="text-xl font-bold text-red-600">
                  Assessment List
                </h3>
                <p className="mt-2 text-gray-600">View Assessment List</p>
              </button>

              <button
                type="button"
                onClick={() => navigate("/assessments/create")}
                className="rounded-2xl bg-white p-6 text-left shadow-lg transition-all hover:-translate-y-1 hover:shadow-xl"
              >
                <h3 className="text-xl font-bold text-red-600">
                  Create Assessment
                </h3>
                <p className="mt-2 text-gray-600">Create Assessment</p>
              </button>

              <button
                type="button"
                onClick={() => navigate("/assessments/my-assessments")}
                className="rounded-2xl bg-white p-6 text-left shadow-lg transition-all hover:-translate-y-1 hover:shadow-xl"
              >
                <h3 className="text-xl font-bold text-red-600">
                  My Assessments
                </h3>
                <p className="mt-2 text-gray-600">My Assessments</p>
              </button>
              <button
                type="button"
                onClick={() => navigate("/assessment-sections")}
                className="rounded-2xl bg-white p-6 text-left shadow-lg transition-all hover:-translate-y-1 hover:shadow-xl"
              >
                <h3 className="text-xl font-bold text-red-600">
                  Assessment Section List
                </h3>
                <p className="mt-2 text-gray-600">
                  View Assessment section List
                </p>
              </button>

              <button
                type="button"
                onClick={() => navigate("/assessment-sections/create")}
                className="rounded-2xl bg-white p-6 text-left shadow-lg transition-all hover:-translate-y-1 hover:shadow-xl"
              >
                <h3 className="text-xl font-bold text-red-600">
                  Create Assessment Section
                </h3>
                <p className="mt-2 text-gray-600">Create Assessment Section</p>
              </button>
              <button
                type="button"
                onClick={() => navigate("/assessment-questions")}
                className="rounded-2xl bg-white p-6 text-left shadow-lg transition-all hover:-translate-y-1 hover:shadow-xl"
              >
                <h3 className="text-xl font-bold text-red-600">
                  Assessment Question List
                </h3>
                <p className="mt-2 text-gray-600">
                  View Assessment question List
                </p>
              </button>

              <button
                type="button"
                onClick={() => navigate("/assessment-questions/create")}
                className="rounded-2xl bg-white p-6 text-left shadow-lg transition-all hover:-translate-y-1 hover:shadow-xl"
              >
                <h3 className="text-xl font-bold text-red-600">
                  Create Assessment Question
                </h3>
                <p className="mt-2 text-gray-600">Create Assessment Question</p>
              </button>
              <button
                type="button"
                onClick={() =>
                  navigate("/student-attempts/assessment/:assessmentId")
                }
                className="rounded-2xl bg-white p-6 text-left shadow-lg transition-all hover:-translate-y-1 hover:shadow-xl"
              >
                <h3 className="text-xl font-bold text-red-600">
                  Assessment List by Assessment
                </h3>
                <p className="mt-2 text-gray-600">
                  Assessment List by Assessment
                </p>
              </button>
              <button
                type="button"
                onClick={() => navigate("/student-attempts/student/:studentId")}
                className="rounded-2xl bg-white p-6 text-left shadow-lg transition-all hover:-translate-y-1 hover:shadow-xl"
              >
                <h3 className="text-xl font-bold text-red-600">
                  Assessment List by Student
                </h3>
                <p className="mt-2 text-gray-600">Assessment List by Student</p>
              </button>
              <button
                type="button"
                onClick={() => navigate("/student-attempts")}
                className="rounded-2xl bg-white p-6 text-left shadow-lg transition-all hover:-translate-y-1 hover:shadow-xl"
              >
                <h3 className="text-xl font-bold text-red-600">
                  Assessment Attempt List 
                </h3>
                <p className="mt-2 text-gray-600">Assessment Attempt List</p>
              </button>
              <button
                type="button"
                onClick={() => navigate("/student-answers")}
                className="rounded-2xl bg-white p-6 text-left shadow-lg transition-all hover:-translate-y-1 hover:shadow-xl"
              >
                <h3 className="text-xl font-bold text-red-600">
                  Assessment Answer List 
                </h3>
                <p className="mt-2 text-gray-600">Assessment Answer List</p>
              </button>
              <button
                type="button"
                onClick={() => navigate("/student-answers/my")}
                className="rounded-2xl bg-white p-6 text-left shadow-lg transition-all hover:-translate-y-1 hover:shadow-xl"
              >
                <h3 className="text-xl font-bold text-red-600">
                  Answer Evaluation List
                </h3>
                <p className="mt-2 text-gray-600"> Answer Evaluation List</p>
              </button>
              <button
                type="button"
                onClick={() => navigate("/results")}
                className="rounded-2xl bg-white p-6 text-left shadow-lg transition-all hover:-translate-y-1 hover:shadow-xl"
              >
                <h3 className="text-xl font-bold text-red-600">
                Result List
                </h3>
                <p className="mt-2 text-gray-600"> Result List</p>
              </button>
              <button
                type="button"
                onClick={() => navigate("/results/assessment/:assessmentId")}
                className="rounded-2xl bg-white p-6 text-left shadow-lg transition-all hover:-translate-y-1 hover:shadow-xl"
              >
                <h3 className="text-xl font-bold text-red-600">
                Assessment Result List
                </h3>
                <p className="mt-2 text-gray-600"> Assessment Result List</p>
              </button>
              <button
                type="button"
                onClick={() => navigate("/results/student/:studentId")}
                className="rounded-2xl bg-white p-6 text-left shadow-lg transition-all hover:-translate-y-1 hover:shadow-xl"
              >
                <h3 className="text-xl font-bold text-red-600">
                Student Result List
                </h3>
                <p className="mt-2 text-gray-600"> Student Result List</p>
              </button>
            </div>
          </div>
        )}

        {isHM && (
          <div className="mt-10">
            <h2 className="mb-6 text-2xl font-bold text-gray-800">
              Headmaster Dashboard
            </h2>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              <button
                type="button"
                onClick={() => navigate("/my-school")}
                className="rounded-2xl bg-white p-6 text-left shadow-lg transition-all hover:-translate-y-1 hover:shadow-xl"
              >
                <h3 className="text-xl font-bold text-indigo-600">My School</h3>
                <p className="mt-2 text-gray-600">
                  View your school information.
                </p>
              </button>

              <button
                type="button"
                onClick={() => navigate("/academic-years")}
                className="rounded-2xl bg-white p-6 text-left shadow-lg transition-all hover:-translate-y-1 hover:shadow-xl"
              >
                <h3 className="text-xl font-bold text-blue-600">
                  Academic Years
                </h3>
                <p className="mt-2 text-gray-600">View academic years.</p>
              </button>

              <button
                type="button"
                onClick={() => navigate("/students")}
                className="rounded-2xl bg-white p-6 text-left shadow-lg transition-all hover:-translate-y-1 hover:shadow-xl"
              >
                <h3 className="text-xl font-bold text-green-600">Students</h3>
                <p className="mt-2 text-gray-600">
                  View students in your school.
                </p>
              </button>

              <button
                type="button"
                onClick={() => navigate("/teachers")}
                className="rounded-2xl bg-white p-6 text-left shadow-lg transition-all hover:-translate-y-1 hover:shadow-xl"
              >
                <h3 className="text-xl font-bold text-orange-600">Teachers</h3>
                <p className="mt-2 text-gray-600">
                  View teachers in your school.
                </p>
              </button>

              <button
                type="button"
                onClick={() => navigate("/parents")}
                className="rounded-2xl bg-white p-6 text-left shadow-lg transition-all hover:-translate-y-1 hover:shadow-xl"
              >
                <h3 className="text-xl font-bold text-pink-600">Parents</h3>
                <p className="mt-2 text-gray-600">
                  View parents in your school.
                </p>
              </button>

              <button
                type="button"
                onClick={() => navigate("/classes")}
                className="rounded-2xl bg-white p-6 text-left shadow-lg transition-all hover:-translate-y-1 hover:shadow-xl"
              >
                <h3 className="text-xl font-bold text-cyan-600">Classes</h3>
                <p className="mt-2 text-gray-600">
                  View classes in your school.
                </p>
              </button>

              <button
                type="button"
                onClick={() => navigate("/sections")}
                className="rounded-2xl bg-white p-6 text-left shadow-lg transition-all hover:-translate-y-1 hover:shadow-xl"
              >
                <h3 className="text-xl font-bold text-teal-600">Sections</h3>
                <p className="mt-2 text-gray-600">
                  View sections in your school.
                </p>
              </button>

              <button
                type="button"
                onClick={() => navigate("/chapters")}
                className="rounded-2xl bg-white p-6 text-left shadow-lg transition-all hover:-translate-y-1 hover:shadow-xl"
              >
                <h3 className="text-xl font-bold text-amber-600">Chapters</h3>
                <p className="mt-2 text-gray-600">View standard Chapters.</p>
              </button>

              <button
                type="button"
                onClick={() => navigate("/topics")}
                className="rounded-2xl bg-white p-6 text-left shadow-lg transition-all hover:-translate-y-1 hover:shadow-xl"
              >
                <h3 className="text-xl font-bold text-amber-600">Topics</h3>
                <p className="mt-2 text-gray-600">View standard Topics.</p>
              </button>

              <button
                type="button"
                onClick={() => navigate("/question-groups")}
                className="rounded-2xl bg-white p-6 text-left shadow-lg transition-all hover:-translate-y-1 hover:shadow-xl"
              >
                <h3 className="text-xl font-bold text-red-600">
                  Question Group List
                </h3>
                <p className="mt-2 text-gray-600">Question Group List</p>
              </button>

              <button
                type="button"
                onClick={() => navigate("/questions")}
                className="rounded-2xl bg-white p-6 text-left shadow-lg transition-all hover:-translate-y-1 hover:shadow-xl"
              >
                <h3 className="text-xl font-bold text-red-600">
                  Questions List
                </h3>
                <p className="mt-2 text-gray-600">Questions List</p>
              </button>

              <button
                type="button"
                onClick={() => navigate("/assessments")}
                className="rounded-2xl bg-white p-6 text-left shadow-lg transition-all hover:-translate-y-1 hover:shadow-xl"
              >
                <h3 className="text-xl font-bold text-red-600">
                  Assessment List
                </h3>
                <p className="mt-2 text-gray-600">View Assessment List</p>
              </button>

              <button
                type="button"
                onClick={() => navigate("/assessments/create")}
                className="rounded-2xl bg-white p-6 text-left shadow-lg transition-all hover:-translate-y-1 hover:shadow-xl"
              >
                <h3 className="text-xl font-bold text-red-600">
                  Create Assessment
                </h3>
                <p className="mt-2 text-gray-600">Create Assessment</p>
              </button>

              <button
                type="button"
                onClick={() => navigate("/assessments/my-assessments")}
                className="rounded-2xl bg-white p-6 text-left shadow-lg transition-all hover:-translate-y-1 hover:shadow-xl"
              >
                <h3 className="text-xl font-bold text-red-600">
                  My Assessments
                </h3>
                <p className="mt-2 text-gray-600">My Assessments</p>
              </button>
              <button
                type="button"
                onClick={() => navigate("/assessment-sections")}
                className="rounded-2xl bg-white p-6 text-left shadow-lg transition-all hover:-translate-y-1 hover:shadow-xl"
              >
                <h3 className="text-xl font-bold text-red-600">
                  Assessment Section List
                </h3>
                <p className="mt-2 text-gray-600">
                  View Assessment section List
                </p>
              </button>

              <button
                type="button"
                onClick={() => navigate("/assessment-sections/create")}
                className="rounded-2xl bg-white p-6 text-left shadow-lg transition-all hover:-translate-y-1 hover:shadow-xl"
              >
                <h3 className="text-xl font-bold text-red-600">
                  Create Assessment Section
                </h3>
                <p className="mt-2 text-gray-600">Create Assessment Section</p>
              </button>
              <button
                type="button"
                onClick={() => navigate("/assessment-questions")}
                className="rounded-2xl bg-white p-6 text-left shadow-lg transition-all hover:-translate-y-1 hover:shadow-xl"
              >
                <h3 className="text-xl font-bold text-red-600">
                  Assessment Question List
                </h3>
                <p className="mt-2 text-gray-600">
                  View Assessment question List
                </p>
              </button>

              <button
                type="button"
                onClick={() => navigate("/assessment-questions/create")}
                className="rounded-2xl bg-white p-6 text-left shadow-lg transition-all hover:-translate-y-1 hover:shadow-xl"
              >
                <h3 className="text-xl font-bold text-red-600">
                  Create Assessment Question
                </h3>
                <p className="mt-2 text-gray-600">Create Assessment Question</p>
              </button>
              <button
                type="button"
                onClick={() =>
                  navigate("/student-attempts/assessment/:assessmentId")
                }
                className="rounded-2xl bg-white p-6 text-left shadow-lg transition-all hover:-translate-y-1 hover:shadow-xl"
              >
                <h3 className="text-xl font-bold text-red-600">
                  Assessment List by Assessment
                </h3>
                <p className="mt-2 text-gray-600">
                  Assessment List by Assessment
                </p>
              </button>
              <button
                type="button"
                onClick={() => navigate("/student-attempts/student/:studentId")}
                className="rounded-2xl bg-white p-6 text-left shadow-lg transition-all hover:-translate-y-1 hover:shadow-xl"
              >
                <h3 className="text-xl font-bold text-red-600">
                  Assessment List by Student
                </h3>
                <p className="mt-2 text-gray-600">Assessment List by Student</p>
              </button>
              <button
                type="button"
                onClick={() => navigate("/student-attempts")}
                className="rounded-2xl bg-white p-6 text-left shadow-lg transition-all hover:-translate-y-1 hover:shadow-xl"
              >
                <h3 className="text-xl font-bold text-red-600">
                  Assessment Attempt List 
                </h3>
                <p className="mt-2 text-gray-600">Assessment Attempt List</p>
              </button>
              <button
                type="button"
                onClick={() => navigate("/student-answers")}
                className="rounded-2xl bg-white p-6 text-left shadow-lg transition-all hover:-translate-y-1 hover:shadow-xl"
              >
                <h3 className="text-xl font-bold text-red-600">
                  Assessment Answer List 
                </h3>
                <p className="mt-2 text-gray-600">Assessment Answer List</p>
              </button>
              <button
                type="button"
                onClick={() => navigate("/student-answers/my")}
                className="rounded-2xl bg-white p-6 text-left shadow-lg transition-all hover:-translate-y-1 hover:shadow-xl"
              >
                <h3 className="text-xl font-bold text-red-600">
                  Answer Evaluation List
                </h3>
                <p className="mt-2 text-gray-600"> Answer Evaluation List</p>
              </button>
              <button
                type="button"
                onClick={() => navigate("/results")}
                className="rounded-2xl bg-white p-6 text-left shadow-lg transition-all hover:-translate-y-1 hover:shadow-xl"
              >
                <h3 className="text-xl font-bold text-red-600">
                Result List
                </h3>
                <p className="mt-2 text-gray-600"> Result List</p>
              </button>
              <button
                type="button"
                onClick={() => navigate("/results/assessment/:assessmentId")}
                className="rounded-2xl bg-white p-6 text-left shadow-lg transition-all hover:-translate-y-1 hover:shadow-xl"
              >
                <h3 className="text-xl font-bold text-red-600">
                Assessment Result List
                </h3>
                <p className="mt-2 text-gray-600"> Assessment Result List</p>
              </button>
              <button
                type="button"
                onClick={() => navigate("/results/student/:studentId")}
                className="rounded-2xl bg-white p-6 text-left shadow-lg transition-all hover:-translate-y-1 hover:shadow-xl"
              >
                <h3 className="text-xl font-bold text-red-600">
                Student Result List
                </h3>
                <p className="mt-2 text-gray-600"> Student Result List</p>
              </button>
              <button
                type="button"
                onClick={() => navigate("/result-details/pending")}
                className="rounded-2xl bg-white p-6 text-left shadow-lg transition-all hover:-translate-y-1 hover:shadow-xl"
              >
                <h3 className="text-xl font-bold text-red-600">
                Evaluation Pending Queue
                </h3>
                <p className="mt-2 text-gray-600"> Evaluation Pending Queue</p>
              </button>
            </div>
          </div>
        )}

        {isTeacher && (
          <div className="mt-10">
            <h2 className="mb-6 text-2xl font-bold text-gray-800">
              Teacher Dashboard
            </h2>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              <button
                type="button"
                onClick={() => navigate("/my-school")}
                className="rounded-2xl bg-white p-6 text-left shadow-lg transition-all hover:-translate-y-1 hover:shadow-xl"
              >
                <h3 className="text-xl font-bold text-indigo-600">My School</h3>
                <p className="mt-2 text-gray-600">
                  View your school information.
                </p>
              </button>

              <button
                type="button"
                onClick={() => navigate("/academic-years")}
                className="rounded-2xl bg-white p-6 text-left shadow-lg transition-all hover:-translate-y-1 hover:shadow-xl"
              >
                <h3 className="text-xl font-bold text-blue-600">
                  Academic Years
                </h3>
                <p className="mt-2 text-gray-600">View academic years.</p>
              </button>

              <button
                type="button"
                onClick={() => navigate("/students")}
                className="rounded-2xl bg-white p-6 text-left shadow-lg transition-all hover:-translate-y-1 hover:shadow-xl"
              >
                <h3 className="text-xl font-bold text-green-600">Students</h3>
                <p className="mt-2 text-gray-600">View students.</p>
              </button>

              <button
                type="button"
                onClick={() => navigate("/teachers/me")}
                className="rounded-2xl bg-white p-6 text-left shadow-lg transition-all hover:-translate-y-1 hover:shadow-xl"
              >
                <h3 className="text-xl font-bold text-orange-600">
                  My Teacher Profile
                </h3>
                <p className="mt-2 text-gray-600">View your teacher profile.</p>
              </button>

              <button
                type="button"
                onClick={() => navigate("/classes")}
                className="rounded-2xl bg-white p-6 text-left shadow-lg transition-all hover:-translate-y-1 hover:shadow-xl"
              >
                <h3 className="text-xl font-bold text-cyan-600">Classes</h3>
                <p className="mt-2 text-gray-600">View classes.</p>
              </button>

              <button
                type="button"
                onClick={() => navigate("/sections")}
                className="rounded-2xl bg-white p-6 text-left shadow-lg transition-all hover:-translate-y-1 hover:shadow-xl"
              >
                <h3 className="text-xl font-bold text-teal-600">Sections</h3>
                <p className="mt-2 text-gray-600">View sections.</p>
              </button>

              <button
                type="button"
                onClick={() => navigate("/chapters")}
                className="rounded-2xl bg-white p-6 text-left shadow-lg transition-all hover:-translate-y-1 hover:shadow-xl"
              >
                <h3 className="text-xl font-bold text-amber-600">Chapters</h3>
                <p className="mt-2 text-gray-600">View standard Chapters.</p>
              </button>

              <button
                type="button"
                onClick={() => navigate("/topics")}
                className="rounded-2xl bg-white p-6 text-left shadow-lg transition-all hover:-translate-y-1 hover:shadow-xl"
              >
                <h3 className="text-xl font-bold text-amber-600">Topics</h3>
                <p className="mt-2 text-gray-600">View standard Topics.</p>
              </button>

              <button
                type="button"
                onClick={() => navigate("/question-groups")}
                className="rounded-2xl bg-white p-6 text-left shadow-lg transition-all hover:-translate-y-1 hover:shadow-xl"
              >
                <h3 className="text-xl font-bold text-red-600">
                  Question Group List
                </h3>
                <p className="mt-2 text-gray-600">Question Group List</p>
              </button>

              <button
                type="button"
                onClick={() => navigate("/questions")}
                className="rounded-2xl bg-white p-6 text-left shadow-lg transition-all hover:-translate-y-1 hover:shadow-xl"
              >
                <h3 className="text-xl font-bold text-red-600">
                  Questions List
                </h3>
                <p className="mt-2 text-gray-600">Questions List</p>
              </button>
              <button
                type="button"
                onClick={() => navigate("/teacher-assignments/my")}
                className="rounded-2xl bg-white p-6 text-left shadow-lg transition-all hover:-translate-y-1 hover:shadow-xl"
              >
                <h3 className="text-xl font-bold text-red-600">
                  My Assignments
                </h3>
                <p className="mt-2 text-gray-600">My Assignments</p>
              </button>

              <button
                type="button"
                onClick={() => navigate("/assessments")}
                className="rounded-2xl bg-white p-6 text-left shadow-lg transition-all hover:-translate-y-1 hover:shadow-xl"
              >
                <h3 className="text-xl font-bold text-red-600">
                  Assessment List
                </h3>
                <p className="mt-2 text-gray-600">View Assessment List</p>
              </button>

              <button
                type="button"
                onClick={() => navigate("/assessments/create")}
                className="rounded-2xl bg-white p-6 text-left shadow-lg transition-all hover:-translate-y-1 hover:shadow-xl"
              >
                <h3 className="text-xl font-bold text-red-600">
                  Create Assessment
                </h3>
                <p className="mt-2 text-gray-600">Create Assessment</p>
              </button>

              <button
                type="button"
                onClick={() => navigate("/assessments/my-assessments")}
                className="rounded-2xl bg-white p-6 text-left shadow-lg transition-all hover:-translate-y-1 hover:shadow-xl"
              >
                <h3 className="text-xl font-bold text-red-600">
                  My Assessments
                </h3>
                <p className="mt-2 text-gray-600">My Assessments</p>
              </button>
              <button
                type="button"
                onClick={() => navigate("/assessment-sections")}
                className="rounded-2xl bg-white p-6 text-left shadow-lg transition-all hover:-translate-y-1 hover:shadow-xl"
              >
                <h3 className="text-xl font-bold text-red-600">
                  Assessment Section List
                </h3>
                <p className="mt-2 text-gray-600">
                  View Assessment section List
                </p>
              </button>

              <button
                type="button"
                onClick={() => navigate("/assessment-sections/create")}
                className="rounded-2xl bg-white p-6 text-left shadow-lg transition-all hover:-translate-y-1 hover:shadow-xl"
              >
                <h3 className="text-xl font-bold text-red-600">
                  Create Assessment Section
                </h3>
                <p className="mt-2 text-gray-600">Create Assessment Section</p>
              </button>
              <button
                type="button"
                onClick={() => navigate("/assessment-questions")}
                className="rounded-2xl bg-white p-6 text-left shadow-lg transition-all hover:-translate-y-1 hover:shadow-xl"
              >
                <h3 className="text-xl font-bold text-red-600">
                  Assessment Question List
                </h3>
                <p className="mt-2 text-gray-600">
                  View Assessment question List
                </p>
              </button>

              <button
                type="button"
                onClick={() => navigate("/assessment-questions/create")}
                className="rounded-2xl bg-white p-6 text-left shadow-lg transition-all hover:-translate-y-1 hover:shadow-xl"
              >
                <h3 className="text-xl font-bold text-red-600">
                  Create Assessment Question
                </h3>
                <p className="mt-2 text-gray-600">Create Assessment Question</p>
              </button>
              <button
                type="button"
                onClick={() =>
                  navigate("/student-attempts/assessment/:assessmentId")
                }
                className="rounded-2xl bg-white p-6 text-left shadow-lg transition-all hover:-translate-y-1 hover:shadow-xl"
              >
                <h3 className="text-xl font-bold text-red-600">
                  Assessment List by Assessment
                </h3>
                <p className="mt-2 text-gray-600">
                  Assessment List by Assessment
                </p>
              </button>
              <button
                type="button"
                onClick={() => navigate("/student-attempts/student/:studentId")}
                className="rounded-2xl bg-white p-6 text-left shadow-lg transition-all hover:-translate-y-1 hover:shadow-xl"
              >
                <h3 className="text-xl font-bold text-red-600">
                  Assessment List by Student
                </h3>
                <p className="mt-2 text-gray-600">Assessment List by Student</p>
              </button>
              <button
                type="button"
                onClick={() => navigate("/student-attempts")}
                className="rounded-2xl bg-white p-6 text-left shadow-lg transition-all hover:-translate-y-1 hover:shadow-xl"
              >
                <h3 className="text-xl font-bold text-red-600">
                  Assessment Attempt List 
                </h3>
                <p className="mt-2 text-gray-600">Assessment Attempt List</p>
              </button>

              <button
                type="button"
                onClick={() => navigate("/student-answers")}
                className="rounded-2xl bg-white p-6 text-left shadow-lg transition-all hover:-translate-y-1 hover:shadow-xl"
              >
                <h3 className="text-xl font-bold text-red-600">
                  Assessment Answer List 
                </h3>
                <p className="mt-2 text-gray-600">Assessment Answer List</p>
              </button>
              <button
                type="button"
                onClick={() => navigate("/student-answers/my")}
                className="rounded-2xl bg-white p-6 text-left shadow-lg transition-all hover:-translate-y-1 hover:shadow-xl"
              >
                <h3 className="text-xl font-bold text-red-600">
                  My Student Assessment Answer List 
                </h3>
                <p className="mt-2 text-gray-600">My Student Assessment Answer List</p>
              </button>
              <button
                type="button"
                onClick={() => navigate("/student-answers/my")}
                className="rounded-2xl bg-white p-6 text-left shadow-lg transition-all hover:-translate-y-1 hover:shadow-xl"
              >
                <h3 className="text-xl font-bold text-red-600">
                  Answer Evaluation List
                </h3>
                <p className="mt-2 text-gray-600"> Answer Evaluation List</p>
              </button>
              <button
                type="button"
                onClick={() => navigate("/answer-evaluations/create")}
                className="rounded-2xl bg-white p-6 text-left shadow-lg transition-all hover:-translate-y-1 hover:shadow-xl"
              >
                <h3 className="text-xl font-bold text-red-600">
                  Create Evaluation
                </h3>
                <p className="mt-2 text-gray-600"> Create Evaluation</p>
              </button>

              <button
                type="button"
                onClick={() => navigate("/answer-evaluations/my")}
                className="rounded-2xl bg-white p-6 text-left shadow-lg transition-all hover:-translate-y-1 hover:shadow-xl"
              >
                <h3 className="text-xl font-bold text-red-600">
                  My Evaluations
                </h3>
                <p className="mt-2 text-gray-600"> My Evaluations</p>
              </button>

              <button
                type="button"
                onClick={() => navigate("/answer-evaluations/pending")}
                className="rounded-2xl bg-white p-6 text-left shadow-lg transition-all hover:-translate-y-1 hover:shadow-xl"
              >
                <h3 className="text-xl font-bold text-red-600">
                 Pending Evaluations
                </h3>
                <p className="mt-2 text-gray-600"> Pending Evaluations</p>
              </button>

              <button
                type="button"
                onClick={() => navigate("/teacher/evaluation-dashboard")}
                className="rounded-2xl bg-white p-6 text-left shadow-lg transition-all hover:-translate-y-1 hover:shadow-xl"
              >
                <h3 className="text-xl font-bold text-red-600">
                Evaluation Dashboard
                </h3>
                <p className="mt-2 text-gray-600"> Evaluation Dashboard</p>
              </button>

              <button
                type="button"
                onClick={() => navigate("/results")}
                className="rounded-2xl bg-white p-6 text-left shadow-lg transition-all hover:-translate-y-1 hover:shadow-xl"
              >
                <h3 className="text-xl font-bold text-red-600">
                Result List
                </h3>
                <p className="mt-2 text-gray-600"> Result List</p>
              </button>
              <button
                type="button"
                onClick={() => navigate("/results/assessment/:assessmentId")}
                className="rounded-2xl bg-white p-6 text-left shadow-lg transition-all hover:-translate-y-1 hover:shadow-xl"
              >
                <h3 className="text-xl font-bold text-red-600">
                Assessment Result List
                </h3>
                <p className="mt-2 text-gray-600"> Assessment Result List</p>
              </button>
              <button
                type="button"
                onClick={() => navigate("/results/student/:studentId")}
                className="rounded-2xl bg-white p-6 text-left shadow-lg transition-all hover:-translate-y-1 hover:shadow-xl"
              >
                <h3 className="text-xl font-bold text-red-600">
                Student Result List
                </h3>
                <p className="mt-2 text-gray-600"> Student Result List</p>
              </button>
              <button
                type="button"
                onClick={() => navigate("/result-details/pending")}
                className="rounded-2xl bg-white p-6 text-left shadow-lg transition-all hover:-translate-y-1 hover:shadow-xl"
              >
                <h3 className="text-xl font-bold text-red-600">
                Evaluation Pending Queue
                </h3>
                <p className="mt-2 text-gray-600"> Evaluation Pending Queue</p>
              </button>
            </div>
          </div>
        )}

        {isStudent && (
          <div className="mt-10">
            <h2 className="mb-6 text-2xl font-bold text-gray-800">
              Student Dashboard
            </h2>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              <button
                type="button"
                onClick={() => navigate("/students/me")}
                className="rounded-2xl bg-white p-6 text-left shadow-lg transition-all hover:-translate-y-1 hover:shadow-xl"
              >
                <h3 className="text-xl font-bold text-blue-600">
                  My Student Profile
                </h3>
                <p className="mt-2 text-gray-600">View your student profile.</p>
              </button>

              <button
                type="button"
                onClick={() => navigate("/student-attempts/start")}
                className="rounded-2xl bg-white p-6 text-left shadow-lg transition-all hover:-translate-y-1 hover:shadow-xl"
              >
                <h3 className="text-xl font-bold text-indigo-600">
                  Start Assessment
                </h3>
                <p className="mt-2 text-gray-600">Start Assessment.</p>
              </button>

              <button
                type="button"
                onClick={() => navigate("/my-school")}
                className="rounded-2xl bg-white p-6 text-left shadow-lg transition-all hover:-translate-y-1 hover:shadow-xl"
              >
                <h3 className="text-xl font-bold text-indigo-600">My School</h3>
                <p className="mt-2 text-gray-600">
                  View your school information.
                </p>
              </button>
              <button
                type="button"
                onClick={() => navigate("/student-attempts/my")}
                className="rounded-2xl bg-white p-6 text-left shadow-lg transition-all hover:-translate-y-1 hover:shadow-xl"
              >
                <h3 className="text-xl font-bold text-indigo-600">
                  My Assessment Attempts
                </h3>
                <p className="mt-2 text-gray-600">My Assessment Attempts.</p>
              </button>
            </div>
          </div>
        )}

        {isParent && (
          <div className="mt-10">
            <h2 className="mb-6 text-2xl font-bold text-gray-800">
              Parent Dashboard
            </h2>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              <button
                type="button"
                onClick={() => navigate("/parents/me")}
                className="rounded-2xl bg-white p-6 text-left shadow-lg transition-all hover:-translate-y-1 hover:shadow-xl"
              >
                <h3 className="text-xl font-bold text-indigo-600">
                  My Parent Profile
                </h3>
                <p className="mt-2 text-gray-600">View your parent profile.</p>
              </button>

              <button
                type="button"
                onClick={() => navigate("/my-school")}
                className="rounded-2xl bg-white p-6 text-left shadow-lg transition-all hover:-translate-y-1 hover:shadow-xl"
              >
                <h3 className="text-xl font-bold text-blue-600">My School</h3>
                <p className="mt-2 text-gray-600">
                  View your school information.
                </p>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HomeScreen;
