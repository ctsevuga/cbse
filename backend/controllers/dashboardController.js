import mongoose from "mongoose";
import asyncHandler from "../middleware/asyncHandler.js";

import Teacher from "../models/teacherModel.js";
import TeacherAssignment from "../models/teacherAssignmentModel.js";
import Student from "../models/studentModel.js";
import Parent from "../models/parentModel.js";
import Assessment from "../models/assessmentModel.js";
import Result from "../models/resultModel.js";
import Subject from "../models/subjectModel.js";
import StudentAttempt from "../models/studentAttemptModel.js";
import StudentParent from "../models/studentParentModel.js";
import Stream from "../models/streamModel.js";
import ClassModel from "../models/classModel.js";
import Section from "../models/sectionModel.js";
import User from "../models/userModel.js";

import {
  requireStudentUser,
  getStudentFromUser,
} from "../utils/studentHelpers.js";

// ======================================================
// GET TEACHER DASHBOARD
// ======================================================

export const getTeacherDashboard = asyncHandler(async (req, res) => {
  const schoolId = req.schoolId;

  // --------------------------------------------------
  // 1. Validate teacher access
  // --------------------------------------------------

  if (req.user.role !== "TEACHER") {
    res.status(403);
    throw new Error("Only teachers can access this dashboard.");
  }

  if (!schoolId) {
    res.status(403);
    throw new Error("Teacher does not belong to a school.");
  }

  const { academicYearId } = req.query;

  if (academicYearId && !mongoose.Types.ObjectId.isValid(academicYearId)) {
    res.status(400);
    throw new Error("Invalid academic year ID.");
  }

  // --------------------------------------------------
  // 2. Find teacher profile
  // --------------------------------------------------

  const teacher = await Teacher.findOne({
    user: req.user._id,
    school: schoolId,
    isActive: true,
  }).select("_id");

  if (!teacher) {
    res.status(404);
    throw new Error("Teacher profile not found.");
  }

  // --------------------------------------------------
  // 2A. Check active CLASS_TEACHER assignment
  //
  // This check is independent of the selected
  // academic year because it is only used to
  // control Class Teacher Dashboard navigation.
  // --------------------------------------------------

  const hasClassTeacherAssignment = await TeacherAssignment.exists({
    school: schoolId,
    teacher: teacher._id,
    assignmentType: "CLASS_TEACHER",
    isActive: true,
  });

  // --------------------------------------------------
  // 3. Find SUBJECT_TEACHER assignments only
  // --------------------------------------------------

  const assignmentFilter = {
    school: schoolId,
    teacher: teacher._id,
    assignmentType: "SUBJECT_TEACHER",
    isActive: true,
  };

  if (academicYearId) {
    assignmentFilter.academicYear = academicYearId;
  }

  const assignments = await TeacherAssignment.find(assignmentFilter)
    .populate("academicYear", "name")
    .populate("class", "name code")
    .populate("section", "name")
    .populate("subject", "name code")
    .lean();

  // --------------------------------------------------
  // 3A. No subject teacher assignments
  // --------------------------------------------------

  if (!assignments.length) {
    return res.json({
      teacherType: "NO_ASSIGNMENT",

      // Used only for Class Teacher Dashboard navigation.
      hasClassTeacherAssignment: !!hasClassTeacherAssignment,

      assignments: [],

      summary: {
        totalStudents: 0,
        totalAssessments: 0,
        totalAttempts: 0,
        totalResults: 0,
        publishedResults: 0,
        pendingEvaluation: 0,
        averagePercentage: 0,
        passPercentage: 0,
      },

      charts: {
        subjectPerformance: [],
        sectionSubjectPerformance: [],
        assessmentPerformance: [],
        performanceDistribution: [],
        performanceTrend: [],
      },

      recentResults: [],
    });
  }

  // --------------------------------------------------
  // 4. Group SUBJECT_TEACHER assignments by
  //    academic year, class and section.
  // --------------------------------------------------

  const scopeMap = new Map();

  assignments.forEach((assignment) => {
    const key = [
      assignment.academicYear._id.toString(),
      assignment.class._id.toString(),
      assignment.section._id.toString(),
    ].join("_");

    if (!scopeMap.has(key)) {
      scopeMap.set(key, {
        academicYear: assignment.academicYear,
        class: assignment.class,
        section: assignment.section,
        subjects: new Map(),
      });
    }

    const scope = scopeMap.get(key);

    if (assignment.subject) {
      scope.subjects.set(
        assignment.subject._id.toString(),
        assignment.subject
      );
    }
  });

  // --------------------------------------------------
  // 5. Construct authorized SUBJECT_TEACHER scopes
  // --------------------------------------------------

  const scopes = Array.from(scopeMap.values()).map((scope) => ({
    academicYear: scope.academicYear,
    class: scope.class,
    section: scope.section,

    assignmentType: "SUBJECT_TEACHER",

    subjects: Array.from(scope.subjects.values()),
  }));

  const teacherType = "SUBJECT_TEACHER";

  // --------------------------------------------------
  // 6. Build assessment and student filters
  // --------------------------------------------------

  const assessmentConditions = [];
  const studentConditions = [];

  scopes.forEach((scope) => {
    const baseCondition = {
      academicYear: scope.academicYear._id,
      class: scope.class._id,
      section: scope.section._id,
    };

    studentConditions.push(baseCondition);

    if (scope.subjects.length) {
      assessmentConditions.push({
        ...baseCondition,
        subject: {
          $in: scope.subjects.map((subject) => subject._id),
        },
      });
    }
  });

  // --------------------------------------------------
  // 6A. Handle assignments without valid subjects
  // --------------------------------------------------

  if (!assessmentConditions.length) {
    return res.json({
      teacherType,

      hasClassTeacherAssignment: !!hasClassTeacherAssignment,

      assignments: scopes,

      summary: {
        totalStudents: 0,
        totalAssessments: 0,
        totalAttempts: 0,
        totalResults: 0,
        publishedResults: 0,
        pendingEvaluation: 0,
        averagePercentage: 0,
        passPercentage: 0,
      },

      charts: {
        subjectPerformance: [],
        sectionSubjectPerformance: [],
        assessmentPerformance: [],
        performanceDistribution: [],
        performanceTrend: [],
      },

      recentResults: [],
    });
  }

  // --------------------------------------------------
  // 7. Find authorized SUBJECT_TEACHER assessments
  // --------------------------------------------------

  const assessments = await Assessment.find({
    school: schoolId,
    $or: assessmentConditions,
  })
    .select(
      "_id title subject assessmentType totalMarks startDate status academicYear class section"
    )
    .populate("subject", "name code")
    .populate("academicYear", "name")
    .populate("class", "name code")
    .populate("section", "name")
    .lean();

  const assessmentIds = assessments.map(
    (assessment) => assessment._id
  );

  // --------------------------------------------------
  // 8. Find distinct students in assigned sections
  // --------------------------------------------------

  const studentIds = await Student.distinct("_id", {
    school: schoolId,
    isActive: true,
    $or: studentConditions,
  });

  // --------------------------------------------------
  // 9. Get attempt and result counts
  // --------------------------------------------------

  const [
    totalAttempts,
    totalResults,
    resultStatusCounts,
  ] = await Promise.all([
    assessmentIds.length
      ? StudentAttempt.countDocuments({
          student: { $in: studentIds },
          assessment: { $in: assessmentIds },
        })
      : 0,

    assessmentIds.length
      ? Result.countDocuments({
          assessment: { $in: assessmentIds },
        })
      : 0,

    assessmentIds.length
      ? Result.aggregate([
          {
            $match: {
              assessment: { $in: assessmentIds },
            },
          },
          {
            $group: {
              _id: "$status",
              count: { $sum: 1 },
            },
          },
        ])
      : [],
  ]);

  const statusCounts = {};

  resultStatusCounts.forEach((item) => {
    statusCounts[item._id] = item.count;
  });

  const publishedResults = statusCounts.PUBLISHED || 0;

  const pendingEvaluation =
    statusCounts.PENDING_EVALUATION || 0;

  // --------------------------------------------------
  // 10. Published result performance summary
  // --------------------------------------------------

  const performanceSummary = assessmentIds.length
    ? await Result.aggregate([
        {
          $match: {
            assessment: { $in: assessmentIds },
            status: "PUBLISHED",
          },
        },
        {
          $group: {
            _id: null,

            averagePercentage: {
              $avg: "$percentage",
            },

            totalObtainedMarks: {
              $sum: "$obtainedMarks",
            },

            totalMaximumMarks: {
              $sum: "$totalMarks",
            },

            passCount: {
              $sum: {
                $cond: [
                  { $gte: ["$percentage", 33] },
                  1,
                  0,
                ],
              },
            },

            failCount: {
              $sum: {
                $cond: [
                  { $lt: ["$percentage", 33] },
                  1,
                  0,
                ],
              },
            },
          },
        },
      ])
    : [];

  const performance = performanceSummary[0] || {};

  const passPercentage = publishedResults
    ? Number(
        (
          ((performance.passCount || 0) / publishedResults) *
          100
        ).toFixed(2)
      )
    : 0;

  // --------------------------------------------------
  // 11. Subject-wise performance chart
  // --------------------------------------------------

  const subjectPerformance = assessmentIds.length
    ? await Assessment.aggregate([
        {
          $match: {
            _id: { $in: assessmentIds },
          },
        },
        {
          $lookup: {
            from: Result.collection.name,
            localField: "_id",
            foreignField: "assessment",
            as: "results",
          },
        },
        {
          $unwind: "$results",
        },
        {
          $match: {
            "results.status": "PUBLISHED",
          },
        },
        {
          $group: {
            _id: "$subject",

            averagePercentage: {
              $avg: "$results.percentage",
            },

            totalResults: {
              $sum: 1,
            },
          },
        },
        {
          $lookup: {
            from: Subject.collection.name,
            localField: "_id",
            foreignField: "_id",
            as: "subject",
          },
        },
        {
          $unwind: "$subject",
        },
        {
          $project: {
            _id: 0,
            subjectId: "$_id",
            subjectName: "$subject.name",
            subjectCode: "$subject.code",

            averagePercentage: {
              $round: ["$averagePercentage", 2],
            },

            totalResults: 1,
          },
        },
        {
          $sort: {
            averagePercentage: -1,
          },
        },
      ])
    : [];

  // --------------------------------------------------
  // 11A. Section-wise and subject-wise performance
  // --------------------------------------------------

  const sectionSubjectPerformanceRaw = assessmentIds.length
    ? await Assessment.aggregate([
        {
          $match: {
            _id: { $in: assessmentIds },
          },
        },
        {
          $lookup: {
            from: Result.collection.name,
            localField: "_id",
            foreignField: "assessment",
            as: "results",
          },
        },
        {
          $unwind: "$results",
        },
        {
          $match: {
            "results.status": "PUBLISHED",
          },
        },
        {
          $group: {
            _id: {
              academicYear: "$academicYear",
              class: "$class",
              section: "$section",
              subject: "$subject",
            },

            averagePercentage: {
              $avg: "$results.percentage",
            },

            studentCount: {
              $addToSet: "$results.student",
            },

            totalResults: {
              $sum: 1,
            },

            passCount: {
              $sum: {
                $cond: [
                  { $gte: ["$results.percentage", 33] },
                  1,
                  0,
                ],
              },
            },

            failCount: {
              $sum: {
                $cond: [
                  { $lt: ["$results.percentage", 33] },
                  1,
                  0,
                ],
              },
            },
          },
        },
        {
          $project: {
            _id: 0,

            academicYearId: "$_id.academicYear",
            classId: "$_id.class",
            sectionId: "$_id.section",
            subjectId: "$_id.subject",

            averagePercentage: {
              $round: ["$averagePercentage", 2],
            },

            studentCount: {
              $size: "$studentCount",
            },

            totalResults: 1,
            passCount: 1,
            failCount: 1,

            passPercentage: {
              $round: [
                {
                  $multiply: [
                    {
                      $cond: [
                        { $gt: ["$totalResults", 0] },
                        {
                          $divide: [
                            "$passCount",
                            "$totalResults",
                          ],
                        },
                        0,
                      ],
                    },
                    100,
                  ],
                },
                2,
              ],
            },

            failPercentage: {
              $round: [
                {
                  $multiply: [
                    {
                      $cond: [
                        { $gt: ["$totalResults", 0] },
                        {
                          $divide: [
                            "$failCount",
                            "$totalResults",
                          ],
                        },
                        0,
                      ],
                    },
                    100,
                  ],
                },
                2,
              ],
            },
          },
        },
        {
          $sort: {
            classId: 1,
            sectionId: 1,
            subjectId: 1,
          },
        },
      ])
    : [];

  // --------------------------------------------------
  // Attach readable names to section performance data
  // --------------------------------------------------

  const classNameById = new Map();
  const sectionNameById = new Map();
  const subjectNameById = new Map();
  const academicYearNameById = new Map();

  assessments.forEach((assessment) => {
    if (assessment.class?._id) {
      classNameById.set(
        assessment.class._id.toString(),
        assessment.class.name || "Class"
      );
    }

    if (assessment.section?._id) {
      sectionNameById.set(
        assessment.section._id.toString(),
        assessment.section.name || "Section"
      );
    }

    if (assessment.subject?._id) {
      subjectNameById.set(
        assessment.subject._id.toString(),
        assessment.subject.name || "Subject"
      );
    }

    if (assessment.academicYear?._id) {
      academicYearNameById.set(
        assessment.academicYear._id.toString(),
        assessment.academicYear.name || "Academic Year"
      );
    }
  });

  const sectionSubjectPerformance =
    sectionSubjectPerformanceRaw.map((item) => ({
      ...item,

      academicYearId: item.academicYearId?.toString(),
      classId: item.classId?.toString(),
      sectionId: item.sectionId?.toString(),
      subjectId: item.subjectId?.toString(),

      academicYearName:
        academicYearNameById.get(
          item.academicYearId?.toString()
        ) || "Academic Year",

      className:
        classNameById.get(item.classId?.toString()) ||
        "Class",

      sectionName:
        sectionNameById.get(item.sectionId?.toString()) ||
        "Section",

      subjectName:
        subjectNameById.get(item.subjectId?.toString()) ||
        "Subject",
    }));

  // --------------------------------------------------
  // 12. Assessment-wise performance chart
  // --------------------------------------------------

  const assessmentPerformance = assessmentIds.length
    ? await Assessment.aggregate([
        {
          $match: {
            _id: { $in: assessmentIds },
          },
        },
        {
          $lookup: {
            from: Result.collection.name,
            localField: "_id",
            foreignField: "assessment",
            as: "results",
          },
        },
        {
          $unwind: "$results",
        },
        {
          $match: {
            "results.status": "PUBLISHED",
          },
        },
        {
          $group: {
            _id: "$_id",

            title: {
              $first: "$title",
            },

            assessmentType: {
              $first: "$assessmentType",
            },

            subject: {
              $first: "$subject",
            },

            averagePercentage: {
              $avg: "$results.percentage",
            },

            totalResults: {
              $sum: 1,
            },
          },
        },
        {
          $lookup: {
            from: Subject.collection.name,
            localField: "subject",
            foreignField: "_id",
            as: "subjectInfo",
          },
        },
        {
          $unwind: "$subjectInfo",
        },
        {
          $project: {
            _id: 1,
            title: 1,
            assessmentType: 1,

            subjectName: "$subjectInfo.name",

            averagePercentage: {
              $round: ["$averagePercentage", 2],
            },

            totalResults: 1,
          },
        },
        {
          $sort: {
            _id: -1,
          },
        },
        {
          $limit: 15,
        },
      ])
    : [];

  // --------------------------------------------------
  // 13. Student performance distribution
  // --------------------------------------------------

  const performanceDistribution = assessmentIds.length
    ? await Result.aggregate([
        {
          $match: {
            assessment: { $in: assessmentIds },
            status: "PUBLISHED",
          },
        },
        {
          $bucket: {
            groupBy: "$percentage",
            boundaries: [0, 33, 50, 60, 75, 90, 101],
            default: "OTHER",
            output: {
              count: { $sum: 1 },
            },
          },
        },
        {
          $project: {
            _id: 0,
            range: "$_id",
            count: 1,
          },
        },
      ])
    : [];

  // --------------------------------------------------
  // 14. Monthly performance trend
  // --------------------------------------------------

  const performanceTrend = assessmentIds.length
    ? await Result.aggregate([
        {
          $match: {
            assessment: { $in: assessmentIds },
            status: "PUBLISHED",
          },
        },
        {
          $group: {
            _id: {
              $dateToString: {
                format: "%Y-%m",
                date: {
                  $ifNull: [
                    "$publishedAt",
                    "$updatedAt",
                  ],
                },
                timezone: "Asia/Kolkata",
              },
            },

            averagePercentage: {
              $avg: "$percentage",
            },

            totalResults: {
              $sum: 1,
            },
          },
        },
        {
          $project: {
            _id: 0,
            month: "$_id",

            averagePercentage: {
              $round: ["$averagePercentage", 2],
            },

            totalResults: 1,
          },
        },
        {
          $sort: {
            month: 1,
          },
        },
      ])
    : [];

  // --------------------------------------------------
  // 15. Recent published results
  // --------------------------------------------------

  const recentResults = assessmentIds.length
    ? await Result.find({
        assessment: { $in: assessmentIds },
        status: "PUBLISHED",
      })
        .sort({
          publishedAt: -1,
          updatedAt: -1,
        })
        .limit(10)
        .populate({
          path: "student",
          select: "admissionNumber user class section",
          populate: {
            path: "user",
            select: "name",
          },
        })
        .populate({
          path: "assessment",
          select:
            "title assessmentType subject totalMarks academicYear class section",
          populate: [
            {
              path: "subject",
              select: "name code",
            },
            {
              path: "academicYear",
              select: "name",
            },
            {
              path: "class",
              select: "name code",
            },
            {
              path: "section",
              select: "name",
            },
          ],
        })
        .lean()
    : [];

  // --------------------------------------------------
  // 16. Final SUBJECT_TEACHER dashboard response
  // --------------------------------------------------

  res.json({
    teacherType,

    // Controls visibility of Class Teacher Dashboard button.
    hasClassTeacherAssignment: !!hasClassTeacherAssignment,

    assignments: scopes,

    summary: {
      totalStudents: studentIds.length,

      totalAssessments: assessments.length,

      totalAttempts,

      totalResults,

      publishedResults,

      pendingEvaluation,

      averagePercentage: Number(
        (performance.averagePercentage || 0).toFixed(2),
      ),

      passPercentage,

      failPercentage: publishedResults
        ? Number(
            (((performance.failCount || 0) / publishedResults) * 100).toFixed(2),
          )
        : 0,
    },

    resultStatusCounts: statusCounts,

    charts: {
      subjectPerformance,
      sectionSubjectPerformance,
      assessmentPerformance,
      performanceDistribution,
      performanceTrend,
    },

    recentResults,
  });
});


// --------------------------------------------------
// CLASS TEACHER DASHBOARD
// --------------------------------------------------

export const getClassTeacherDashboard = asyncHandler(
  async (req, res) => {
    const schoolId = req.schoolId;

    // --------------------------------------------------
    // 1. Validate access
    // --------------------------------------------------

    if (req.user.role !== "TEACHER") {
      res.status(403);
      throw new Error("Only teachers can access this dashboard.");
    }

    if (!schoolId) {
      res.status(403);
      throw new Error("Teacher does not belong to a school.");
    }

    const { academicYearId } = req.query;

    if (
      academicYearId &&
      !mongoose.Types.ObjectId.isValid(academicYearId)
    ) {
      res.status(400);
      throw new Error("Invalid academic year ID.");
    }

    // --------------------------------------------------
    // 2. Find teacher profile
    // --------------------------------------------------

    const teacher = await Teacher.findOne({
      user: req.user._id,
      school: schoolId,
      isActive: true,
    }).select("_id");

    if (!teacher) {
      res.status(404);
      throw new Error("Teacher profile not found.");
    }

    // --------------------------------------------------
    // 3. Find CLASS_TEACHER assignments only
    // --------------------------------------------------

    const assignmentFilter = {
      school: schoolId,
      teacher: teacher._id,
      assignmentType: "CLASS_TEACHER",
      isActive: true,
    };

    if (academicYearId) {
      assignmentFilter.academicYear = academicYearId;
    }

    const assignments = await TeacherAssignment.find(
      assignmentFilter
    )
      .populate("academicYear", "name")
      .populate("class", "name code")
      .populate("section", "name")
      .lean();

    if (!assignments.length) {
      return res.json({
        teacherType: "NO_CLASS_ASSIGNMENT",
        assignments: [],
        summary: {
          totalStudents: 0,
          totalSubjects: 0,
          totalAssessments: 0,
          totalAttempts: 0,
          totalResults: 0,
          publishedResults: 0,
          pendingEvaluation: 0,
          averagePercentage: 0,
          passPercentage: 0,
          failPercentage: 0,
        },
        resultStatusCounts: {},
        charts: {
          subjectPerformance: [],
          subjectAttemptPerformance: [],
          sectionSubjectPerformance: [],
          assessmentPerformance: [],
          performanceDistribution: [],
          performanceTrend: [],
        },
        recentResults: [],
      });
    }

    // --------------------------------------------------
    // 4. Construct authorized section scopes
    // --------------------------------------------------

    const scopeMap = new Map();

    assignments.forEach((assignment) => {
      const key = [
        assignment.academicYear._id.toString(),
        assignment.class._id.toString(),
        assignment.section._id.toString(),
      ].join("_");

      if (!scopeMap.has(key)) {
        scopeMap.set(key, {
          academicYear: assignment.academicYear,
          class: assignment.class,
          section: assignment.section,
          assignmentType: "CLASS_TEACHER",
        });
      }
    });

    const scopes = Array.from(scopeMap.values());

    const sectionConditions = scopes.map((scope) => ({
      academicYear: scope.academicYear._id,
      class: scope.class._id,
      section: scope.section._id,
    }));

    // --------------------------------------------------
    // 5. Find students belonging to assigned sections
    // --------------------------------------------------

    const studentIds = await Student.distinct("_id", {
      school: schoolId,
      isActive: true,
      $or: sectionConditions,
    });

    // --------------------------------------------------
    // 6. Find all assessments across assigned sections
    // --------------------------------------------------

    const assessments = await Assessment.find({
      school: schoolId,
      $or: sectionConditions,
    })
      .select(
        "_id title subject assessmentType totalMarks startDate status academicYear class section"
      )
      .populate("subject", "name code")
      .populate("academicYear", "name")
      .populate("class", "name code")
      .populate("section", "name")
      .lean();

    const assessmentIds = assessments.map(
      (assessment) => assessment._id
    );

    // --------------------------------------------------
    // 7. Create readable lookup maps
    // --------------------------------------------------

    const subjectNameById = new Map();

    const classNameById = new Map();

    const sectionNameById = new Map();

    const academicYearNameById = new Map();

    assessments.forEach((assessment) => {
      if (assessment.subject?._id) {
        subjectNameById.set(
          assessment.subject._id.toString(),
          assessment.subject.name || "Subject"
        );
      }

      if (assessment.class?._id) {
        classNameById.set(
          assessment.class._id.toString(),
          assessment.class.name || "Class"
        );
      }

      if (assessment.section?._id) {
        sectionNameById.set(
          assessment.section._id.toString(),
          assessment.section.name || "Section"
        );
      }

      if (assessment.academicYear?._id) {
        academicYearNameById.set(
          assessment.academicYear._id.toString(),
          assessment.academicYear.name || "Academic Year"
        );
      }
    });

    // --------------------------------------------------
    // 8. Common filters
    // --------------------------------------------------

    const attemptMatch = {
      assessment: { $in: assessmentIds },
      student: { $in: studentIds },
    };

    const resultMatch = {
      assessment: { $in: assessmentIds },
      student: { $in: studentIds },
    };

    // --------------------------------------------------
    // 9. Total attempts and result counts
    // --------------------------------------------------

    const [
      totalAttempts,
      totalResults,
      resultStatusCounts,
    ] = await Promise.all([
      assessmentIds.length
        ? StudentAttempt.countDocuments(attemptMatch)
        : 0,

      assessmentIds.length
        ? Result.countDocuments(resultMatch)
        : 0,

      assessmentIds.length
        ? Result.aggregate([
            {
              $match: resultMatch,
            },
            {
              $group: {
                _id: "$status",
                count: { $sum: 1 },
              },
            },
          ])
        : [],
    ]);

    const statusCounts = {};

    resultStatusCounts.forEach((item) => {
      statusCounts[item._id] = item.count;
    });

    const publishedResults =
      statusCounts.PUBLISHED || 0;

    const pendingEvaluation =
      statusCounts.PENDING_EVALUATION || 0;

    // --------------------------------------------------
    // 10. Overall published performance
    // --------------------------------------------------

    const performanceSummary = publishedResults
      ? await Result.aggregate([
          {
            $match: {
              ...resultMatch,
              status: "PUBLISHED",
            },
          },
          {
            $group: {
              _id: null,

              averagePercentage: {
                $avg: "$percentage",
              },

              totalObtainedMarks: {
                $sum: "$obtainedMarks",
              },

              totalMaximumMarks: {
                $sum: "$totalMarks",
              },

              passCount: {
                $sum: {
                  $cond: [
                    { $gte: ["$percentage", 33] },
                    1,
                    0,
                  ],
                },
              },

              failCount: {
                $sum: {
                  $cond: [
                    { $lt: ["$percentage", 33] },
                    1,
                    0,
                  ],
                },
              },
            },
          },
        ])
      : [];

    const performance = performanceSummary[0] || {};

    const passPercentage = publishedResults
      ? Number(
          (
            ((performance.passCount || 0) /
              publishedResults) *
            100
          ).toFixed(2)
        )
      : 0;

    const failPercentage = publishedResults
      ? Number(
          (
            ((performance.failCount || 0) /
              publishedResults) *
            100
          ).toFixed(2)
        )
      : 0;

    // --------------------------------------------------
    // 11. Subject-wise published result performance
    // --------------------------------------------------

    const subjectPerformance = publishedResults
      ? await Result.aggregate([
          {
            $match: {
              ...resultMatch,
              status: "PUBLISHED",
            },
          },
          {
            $lookup: {
              from: Assessment.collection.name,
              localField: "assessment",
              foreignField: "_id",
              as: "assessmentInfo",
            },
          },
          {
            $unwind: "$assessmentInfo",
          },
          {
            $group: {
              _id: "$assessmentInfo.subject",

              averagePercentage: {
                $avg: "$percentage",
              },

              totalResults: {
                $sum: 1,
              },

              passCount: {
                $sum: {
                  $cond: [
                    { $gte: ["$percentage", 33] },
                    1,
                    0,
                  ],
                },
              },

              failCount: {
                $sum: {
                  $cond: [
                    { $lt: ["$percentage", 33] },
                    1,
                    0,
                  ],
                },
              },

              studentIds: {
                $addToSet: "$student",
              },

              assessmentIds: {
                $addToSet: "$assessment",
              },
            },
          },
          {
            $project: {
              _id: 0,
              subjectId: "$_id",

              averagePercentage: {
                $round: ["$averagePercentage", 2],
              },

              totalResults: 1,

              totalStudents: {
                $size: "$studentIds",
              },

              totalAssessments: {
                $size: "$assessmentIds",
              },

              passCount: 1,
              failCount: 1,

              passPercentage: {
                $round: [
                  {
                    $multiply: [
                      {
                        $divide: [
                          "$passCount",
                          "$totalResults",
                        ],
                      },
                      100,
                    ],
                  },
                  2,
                ],
              },

              failPercentage: {
                $round: [
                  {
                    $multiply: [
                      {
                        $divide: [
                          "$failCount",
                          "$totalResults",
                        ],
                      },
                      100,
                    ],
                  },
                  2,
                ],
              },
            },
          },
          {
            $sort: {
              averagePercentage: -1,
            },
          },
        ])
      : [];

    // --------------------------------------------------
    // 12. Subject-wise attempt performance
    // --------------------------------------------------

    const subjectAttemptPerformance = assessmentIds.length
      ? await StudentAttempt.aggregate([
          {
            $match: attemptMatch,
          },
          {
            $lookup: {
              from: Assessment.collection.name,
              localField: "assessment",
              foreignField: "_id",
              as: "assessmentInfo",
            },
          },
          {
            $unwind: "$assessmentInfo",
          },
          {
            $group: {
              _id: {
                subject: "$assessmentInfo.subject",
              },

              totalAttempts: {
                $sum: 1,
              },

              totalStudents: {
                $addToSet: "$student",
              },

              inProgressAttempts: {
                $sum: {
                  $cond: [
                    { $eq: ["$status", "IN_PROGRESS"] },
                    1,
                    0,
                  ],
                },
              },

              submittedAttempts: {
                $sum: {
                  $cond: [
                    { $in: ["$status", [
                      "SUBMITTED",
                      "EVALUATING",
                      "EVALUATED",
                    ]] },
                    1,
                    0,
                  ],
                },
              },

              evaluatedAttempts: {
                $sum: {
                  $cond: [
                    { $eq: ["$status", "EVALUATED"] },
                    1,
                    0,
                  ],
                },
              },

              abandonedAttempts: {
                $sum: {
                  $cond: [
                    { $eq: ["$status", "ABANDONED"] },
                    1,
                    0,
                  ],
                },
              },

              expiredAttempts: {
                $sum: {
                  $cond: [
                    { $eq: ["$status", "EXPIRED"] },
                    1,
                    0,
                  ],
                },
              },
            },
          },
          {
            $project: {
              _id: 0,
              subjectId: "$_id.subject",

              totalAttempts: 1,

              totalStudents: {
                $size: "$totalStudents",
              },

              inProgressAttempts: 1,
              submittedAttempts: 1,
              evaluatedAttempts: 1,
              abandonedAttempts: 1,
              expiredAttempts: 1,
            },
          },
          {
            $sort: {
              totalAttempts: -1,
            },
          },
        ])
      : [];

    // --------------------------------------------------
    // 13. Combine subject performance and attempts
    // --------------------------------------------------

    const attemptPerformanceMap = new Map();

    subjectAttemptPerformance.forEach((item) => {
      const id = item.subjectId?.toString();

      if (id) {
        attemptPerformanceMap.set(id, item);
      }
    });

    const subjectIds = new Set([
      ...subjectPerformance.map(
        (item) => item.subjectId?.toString()
      ),
      ...subjectAttemptPerformance.map(
        (item) => item.subjectId?.toString()
      ),
    ]);

    const sectionSubjectPerformance = Array.from(
      subjectIds
    )
      .filter(Boolean)
      .map((subjectId) => {
        const resultData = subjectPerformance.find(
          (item) =>
            item.subjectId?.toString() === subjectId
        );

        const attemptData =
          attemptPerformanceMap.get(subjectId);

        return {
          subjectId,

          subjectName:
            subjectNameById.get(subjectId) || "Subject",

          totalAttempts:
            attemptData?.totalAttempts || 0,

          totalAttemptingStudents:
            attemptData?.totalStudents || 0,

          inProgressAttempts:
            attemptData?.inProgressAttempts || 0,

          submittedAttempts:
            attemptData?.submittedAttempts || 0,

          evaluatedAttempts:
            attemptData?.evaluatedAttempts || 0,

          abandonedAttempts:
            attemptData?.abandonedAttempts || 0,

          expiredAttempts:
            attemptData?.expiredAttempts || 0,

          totalResults:
            resultData?.totalResults || 0,

          totalStudents:
            resultData?.totalStudents || 0,

          totalAssessments:
            resultData?.totalAssessments || 0,

          averagePercentage:
            resultData?.averagePercentage || 0,

          passCount:
            resultData?.passCount || 0,

          failCount:
            resultData?.failCount || 0,

          passPercentage:
            resultData?.passPercentage || 0,

          failPercentage:
            resultData?.failPercentage || 0,
        };
      })
      .sort(
        (a, b) =>
          b.averagePercentage - a.averagePercentage
      );

    // --------------------------------------------------
    // 14. Assessment-wise performance
    // --------------------------------------------------

    const assessmentPerformance = publishedResults
      ? await Result.aggregate([
          {
            $match: {
              ...resultMatch,
              status: "PUBLISHED",
            },
          },
          {
            $group: {
              _id: "$assessment",

              averagePercentage: {
                $avg: "$percentage",
              },

              totalResults: {
                $sum: 1,
              },
            },
          },
          {
            $sort: {
              _id: -1,
            },
          },
          {
            $limit: 30,
          },
        ])
      : [];

    const assessmentMap = new Map(
      assessments.map((assessment) => [
        assessment._id.toString(),
        assessment,
      ])
    );

    const assessmentPerformanceData =
      assessmentPerformance.map((item) => {
        const assessment = assessmentMap.get(
          item._id.toString()
        );

        return {
          assessmentId: item._id,

          title: assessment?.title || "Assessment",

          assessmentType:
            assessment?.assessmentType || "",

          subjectId:
            assessment?.subject?._id || null,

          subjectName:
            assessment?.subject?.name || "Subject",

          averagePercentage: Number(
            item.averagePercentage.toFixed(2)
          ),

          totalResults: item.totalResults,
        };
      });

    // --------------------------------------------------
    // 15. Student performance distribution
    // --------------------------------------------------

    const performanceDistribution = publishedResults
      ? await Result.aggregate([
          {
            $match: {
              ...resultMatch,
              status: "PUBLISHED",
            },
          },
          {
            $bucket: {
              groupBy: "$percentage",

              boundaries: [
                0,
                33,
                50,
                60,
                75,
                90,
                101,
              ],

              default: "OTHER",

              output: {
                count: {
                  $sum: 1,
                },
              },
            },
          },
          {
            $project: {
              _id: 0,
              range: "$_id",
              count: 1,
            },
          },
        ])
      : [];

    // --------------------------------------------------
    // 16. Monthly performance trend
    // --------------------------------------------------

    const performanceTrend = publishedResults
      ? await Result.aggregate([
          {
            $match: {
              ...resultMatch,
              status: "PUBLISHED",
            },
          },
          {
            $group: {
              _id: {
                month: {
                  $dateToString: {
                    format: "%Y-%m",

                    date: {
                      $ifNull: [
                        "$publishedAt",
                        "$updatedAt",
                      ],
                    },

                    timezone: "Asia/Kolkata",
                  },
                },
              },

              averagePercentage: {
                $avg: "$percentage",
              },

              totalResults: {
                $sum: 1,
              },
            },
          },
          {
            $project: {
              _id: 0,

              month: "$_id.month",

              averagePercentage: {
                $round: [
                  "$averagePercentage",
                  2,
                ],
              },

              totalResults: 1,
            },
          },
          {
            $sort: {
              month: 1,
            },
          },
        ])
      : [];

    // --------------------------------------------------
    // 17. Recent published results
    // --------------------------------------------------

    const recentResults = publishedResults
      ? await Result.find({
          ...resultMatch,
          status: "PUBLISHED",
        })
          .sort({
            publishedAt: -1,
            updatedAt: -1,
          })
          .limit(15)
          .populate({
            path: "student",
            select: "admissionNumber user class section",
            populate: {
              path: "user",
              select: "name",
            },
          })
          .populate({
            path: "assessment",
            select:
              "title assessmentType subject totalMarks academicYear class section",
            populate: [
              {
                path: "subject",
                select: "name code",
              },
              {
                path: "academicYear",
                select: "name",
              },
              {
                path: "class",
                select: "name code",
              },
              {
                path: "section",
                select: "name",
              },
            ],
          })
          .lean()
      : [];

    // --------------------------------------------------
    // 18. Final response
    // --------------------------------------------------

    res.json({
      teacherType: "CLASS_TEACHER",

      assignments: scopes,

      summary: {
        totalStudents: studentIds.length,

        totalSubjects: sectionSubjectPerformance.length,

        totalAssessments: assessments.length,

        totalAttempts,

        totalResults,

        publishedResults,

        pendingEvaluation,

        averagePercentage: Number(
          (performance.averagePercentage || 0).toFixed(2)
        ),

        passPercentage,

        failPercentage,
      },

      resultStatusCounts: statusCounts,

      charts: {
        // Subject-wise average percentage
        subjectPerformance,

        // Subject-wise attempt status counts
        subjectAttemptPerformance,

        // Combined section-wide subject performance
        sectionSubjectPerformance,

        // Assessment-wise performance
        assessmentPerformance:
          assessmentPerformanceData,

        // Published student result distribution
        performanceDistribution,

        // Monthly performance trend
        performanceTrend,
      },

      recentResults,
    });
  }
);


export const getStudentDashboard = asyncHandler(
  async (req, res) => {

    // --------------------------------------------------
    // 1. Validate student access
    // --------------------------------------------------

    requireStudentUser(req);

    const schoolId = req.schoolId;

    if (!schoolId) {
      res.status(403);
      throw new Error("Student does not belong to a school.");
    }

    const { academicYearId } = req.query;

    if (
      academicYearId &&
      !mongoose.Types.ObjectId.isValid(academicYearId)
    ) {
      res.status(400);
      throw new Error("Invalid academic year ID.");
    }

    // --------------------------------------------------
    // 2. Find student profile
    // --------------------------------------------------

    const student = await getStudentFromUser(req);

    if (!student) {
      res.status(404);
      throw new Error("Student profile not found.");
    }

    if (
      student.school &&
      student.school.toString() !== schoolId.toString()
    ) {
      res.status(403);
      throw new Error("Student does not belong to this school.");
    }

    if (!student.isActive) {
      res.status(403);
      throw new Error("Student account is inactive.");
    }

    if (!student.class) {
      res.status(400);
      throw new Error("Student is not assigned to a class.");
    }

    const studentId = student._id;

    const now = new Date();

    const selectedAcademicYear =
      academicYearId || student.academicYear || null;


    // --------------------------------------------------
    // 3. Build eligible assessment filter
    // --------------------------------------------------

    const assessmentFilter = {
      school: schoolId,

      class: student.class,

      status: {
        $in: [
          "SCHEDULED",
          "ACTIVE",
          "COMPLETED",
        ],
      },

      $and: [
        {
          $or: [
            { section: student.section || null },
            { section: null },
          ],
        },
        {
          $or: [
            { stream: student.stream || null },
            { stream: null },
          ],
        },
      ],
    };

    if (selectedAcademicYear) {
      assessmentFilter.academicYear = selectedAcademicYear;
    }

    // --------------------------------------------------
    // 4. Fetch eligible assessments
    // --------------------------------------------------

    const assessments = await Assessment.find(
      assessmentFilter
    )
      .select(
        "_id title description subject assessmentType durationMinutes totalQuestions totalMarks startDate endDate status academicYear class section stream"
      )
      .populate("subject", "name code")
      .populate("academicYear", "name")
      .populate("class", "name code")
      .populate("section", "name")
      .populate("stream", "name")
      .sort({
        startDate: -1,
        createdAt: -1,
      })
      .lean();

    const assessmentIds = assessments.map(
      (assessment) => assessment._id
    );

    // --------------------------------------------------
    // 5. Fetch student attempts
    // --------------------------------------------------

    const attempts = assessmentIds.length
      ? await StudentAttempt.find({
          student: studentId,
          assessment: {
            $in: assessmentIds,
          },
        })
          .select(
            "_id assessment status attemptNumber totalQuestions attemptedQuestions startedAt submittedAt createdAt updatedAt"
          )
          .populate({
            path: "assessment",
            select:
              "title subject assessmentType totalMarks totalQuestions startDate endDate status",
            populate: {
              path: "subject",
              select: "name code",
            },
          })
          .sort({
            createdAt: -1,
          })
          .lean()
      : [];

    // --------------------------------------------------
    // 6. Latest attempt for each assessment
    // --------------------------------------------------

    const latestAttemptMap = new Map();

    attempts.forEach((attempt) => {
      const assessmentId =
        attempt.assessment?._id?.toString() ||
        attempt.assessment?.toString();

      if (
        assessmentId &&
        !latestAttemptMap.has(assessmentId)
      ) {
        latestAttemptMap.set(
          assessmentId,
          attempt
        );
      }
    });

    // Attach latest attempt to assessment
    const assessmentList = assessments.map(
      (assessment) => ({
        ...assessment,

        latestAttempt:
          latestAttemptMap.get(
            assessment._id.toString()
          ) || null,
      })
    );

    // --------------------------------------------------
    // 7. Fetch student results
    // --------------------------------------------------

    const results = assessmentIds.length
      ? await Result.find({
          student: studentId,
          assessment: {
            $in: assessmentIds,
          },
        })
          .populate({
            path: "assessment",
            select:
              "title assessmentType totalMarks subject",
            populate: {
              path: "subject",
              select: "name code",
            },
          })
          .populate("publishedBy", "name")
          .sort({
            publishedAt: -1,
            updatedAt: -1,
          })
          .lean()
      : [];

    // --------------------------------------------------
    // 8. Result status counts
    // --------------------------------------------------

    const resultStatusCounts = {};

    results.forEach((result) => {
      resultStatusCounts[result.status] =
        (resultStatusCounts[result.status] || 0) + 1;
    });

    const totalResults = results.length;

    const publishedResults =
      resultStatusCounts.PUBLISHED || 0;

    const pendingEvaluation =
      resultStatusCounts.PENDING_EVALUATION || 0;

    const draftResults =
      resultStatusCounts.DRAFT || 0;

    const withdrawnResults =
      resultStatusCounts.WITHDRAWN || 0;

    // --------------------------------------------------
    // 9. Published result performance
    // --------------------------------------------------

    const publishedResultRecords = results.filter(
      (result) => result.status === "PUBLISHED"
    );

    const totalObtainedMarks =
      publishedResultRecords.reduce(
        (sum, result) => sum + (result.obtainedMarks || 0),
        0
      );

    const totalMaximumMarks =
      publishedResultRecords.reduce(
        (sum, result) => sum + (result.totalMarks || 0),
        0
      );

    const averagePercentage = publishedResults
      ? Number(
          (
            publishedResultRecords.reduce(
              (sum, result) => sum + (result.percentage || 0),
              0
            ) / publishedResults
          ).toFixed(2)
        )
      : 0;

    // Using 33% as the provisional pass threshold,
    // consistent with the existing teacher dashboard.

    const passCount = publishedResultRecords.filter(
      (result) => result.percentage >= 33
    ).length;

    const failCount = publishedResults - passCount;

    const passPercentage = publishedResults
      ? Number(
          ((passCount / publishedResults) * 100).toFixed(2)
        )
      : 0;

    const failPercentage = publishedResults
      ? Number(
          ((failCount / publishedResults) * 100).toFixed(2)
        )
      : 0;

    // --------------------------------------------------
    // 10. Assessment status statistics
    // --------------------------------------------------

    const upcomingAssessments = assessments.filter(
      (assessment) =>
        assessment.status === "SCHEDULED" &&
        new Date(assessment.startDate) > now
    );

    const activeAssessments = assessments.filter(
      (assessment) =>
        assessment.status === "ACTIVE" &&
        new Date(assessment.startDate) <= now &&
        new Date(assessment.endDate) >= now
    );

    const completedAssessments = assessments.filter(
      (assessment) =>
        assessment.status === "COMPLETED" ||
        (
          new Date(assessment.endDate) < now &&
          assessment.status !== "CANCELLED"
        )
    );

    // --------------------------------------------------
    // 11. Attempt status statistics
    // --------------------------------------------------

    const attemptStatusCounts = {};

    attempts.forEach((attempt) => {
      attemptStatusCounts[attempt.status] =
        (attemptStatusCounts[attempt.status] || 0) + 1;
    });

    const totalAttempts = attempts.length;

    const inProgressAttempts =
      attemptStatusCounts.IN_PROGRESS || 0;

    const submittedAttempts =
      attemptStatusCounts.SUBMITTED || 0;

    const evaluatedAttempts =
      attemptStatusCounts.EVALUATED || 0;

    const abandonedAttempts =
      attemptStatusCounts.ABANDONED || 0;

    const expiredAttempts =
      attemptStatusCounts.EXPIRED || 0;

    const completedAttempts =
      submittedAttempts + evaluatedAttempts;

    // --------------------------------------------------
    // 12. Assessments not yet attempted
    // --------------------------------------------------

    const notAttemptedAssessments = assessmentList.filter(
      (assessment) => !assessment.latestAttempt
    );

    // --------------------------------------------------
    // 13. Upcoming and active assessment counts
    // --------------------------------------------------

    const assessmentCounts = {
      total: assessments.length,

      upcoming: upcomingAssessments.length,

      active: activeAssessments.length,

      completed: completedAssessments.length,

      notAttempted: notAttemptedAssessments.length,
    };

    // --------------------------------------------------
    // 14. Subject-wise performance
    // --------------------------------------------------

    const subjectPerformanceMap = new Map();

    publishedResultRecords.forEach((result) => {
      const subject = result.assessment?.subject;

      if (!subject?._id) {
        return;
      }

      const subjectId = subject._id.toString();

      if (!subjectPerformanceMap.has(subjectId)) {
        subjectPerformanceMap.set(subjectId, {
          subjectId,
          subjectName: subject.name,
          subjectCode: subject.code || "",

          totalResults: 0,
          totalPercentage: 0,
          totalObtainedMarks: 0,
          totalMaximumMarks: 0,
        });
      }

      const item = subjectPerformanceMap.get(subjectId);

      item.totalResults += 1;

      item.totalPercentage += result.percentage || 0;

      item.totalObtainedMarks += result.obtainedMarks || 0;

      item.totalMaximumMarks += result.totalMarks || 0;
    });

    const subjectPerformance = Array.from(
      subjectPerformanceMap.values()
    )
      .map((item) => ({
        ...item,

        averagePercentage: Number(
          (
            item.totalPercentage /
            item.totalResults
          ).toFixed(2)
        ),
      }))
      .sort(
        (a, b) =>
          b.averagePercentage - a.averagePercentage
      );

    // --------------------------------------------------
    // 15. Monthly performance trend
    // --------------------------------------------------

    const performanceTrendMap = new Map();

    publishedResultRecords.forEach((result) => {
      const date = result.publishedAt || result.updatedAt;

      if (!date) {
        return;
      }

      const resultDate = new Date(date);

      if (Number.isNaN(resultDate.getTime())) {
        return;
      }

      const month = new Intl.DateTimeFormat("en-CA", {
        timeZone: "Asia/Kolkata",
        year: "numeric",
        month: "2-digit",
      }).format(resultDate);

      if (!performanceTrendMap.has(month)) {
        performanceTrendMap.set(month, {
          month,
          totalPercentage: 0,
          totalResults: 0,
        });
      }

      const item = performanceTrendMap.get(month);

      item.totalPercentage += result.percentage || 0;

      item.totalResults += 1;
    });

    const performanceTrend = Array.from(
      performanceTrendMap.values()
    )
      .map((item) => ({
        month: item.month,

        averagePercentage: Number(
          (
            item.totalPercentage /
            item.totalResults
          ).toFixed(2)
        ),

        totalResults: item.totalResults,
      }))
      .sort((a, b) => a.month.localeCompare(b.month));

    // --------------------------------------------------
    // 16. Performance distribution
    // --------------------------------------------------

    const distributionRanges = [
      { label: "0-32", min: 0, max: 33 },
      { label: "33-49", min: 33, max: 50 },
      { label: "50-59", min: 50, max: 60 },
      { label: "60-74", min: 60, max: 75 },
      { label: "75-89", min: 75, max: 90 },
      { label: "90-100", min: 90, max: 101 },
    ];

    const performanceDistribution =
      distributionRanges.map((range) => ({
        range: range.label,

        count: publishedResultRecords.filter(
          (result) =>
            result.percentage >= range.min &&
            result.percentage < range.max
        ).length,
      }));

    // --------------------------------------------------
    // 17. Recent attempts
    // --------------------------------------------------

    const recentAttempts = attempts.slice(0, 10);

    // --------------------------------------------------
    // 18. Recent published results
    // --------------------------------------------------

    const recentResults = publishedResultRecords
      .sort(
        (a, b) =>
          new Date(b.publishedAt || b.updatedAt) -
          new Date(a.publishedAt || a.updatedAt)
      )
      .slice(0, 10);

    // --------------------------------------------------
    // 19. Final student dashboard response
    // --------------------------------------------------

    res.json({
      student: {
        _id: student._id,
        name: student.user?.name || "",
        admissionNumber: student.admissionNumber || "",

        class: student.class,
        section: student.section,
        stream: student.stream,

        academicYear: selectedAcademicYear,
      },

      summary: {
        // Assessment statistics
        totalAssessments: assessmentCounts.total,
        upcomingAssessments: assessmentCounts.upcoming,
        activeAssessments: assessmentCounts.active,
        completedAssessments: assessmentCounts.completed,
        notAttemptedAssessments: assessmentCounts.notAttempted,

        // Attempt statistics
        totalAttempts,
        inProgressAttempts,
        completedAttempts,
        submittedAttempts,
        evaluatedAttempts,
        abandonedAttempts,
        expiredAttempts,

        // Result statistics
        totalResults,
        publishedResults,
        pendingEvaluation,
        draftResults,
        withdrawnResults,

        // Performance
        averagePercentage,
        passPercentage,
        failPercentage,

        totalObtainedMarks,
        totalMaximumMarks,

        passCount,
        failCount,
      },

      assessmentStatusCounts: {
        upcoming: assessmentCounts.upcoming,
        active: assessmentCounts.active,
        completed: assessmentCounts.completed,
        notAttempted: assessmentCounts.notAttempted,
      },

      attemptStatusCounts,

      resultStatusCounts,

      assessments: assessmentList,

      upcomingAssessmentList: upcomingAssessments,

      activeAssessmentList: activeAssessments,

      recentAttempts,

      recentResults,

      charts: {
        subjectPerformance,

        performanceTrend,

        performanceDistribution,
      },
    });
  }
);

// ======================================================
// PARENT DASHBOARD
// ======================================================

export const getParentDashboard = asyncHandler(
  async (req, res) => {

    // --------------------------------------------------
    // 1. Validate parent access
    // --------------------------------------------------

    if (!req.user || req.user.role !== "PARENT") {
      res.status(403);
      throw new Error(
        "Access restricted to parents."
      );
    }

    const schoolId = req.schoolId;

    if (!schoolId) {
      res.status(403);
      throw new Error(
        "Parent does not belong to a school."
      );
    }

    const { studentId, academicYearId } = req.query;

    if (
      studentId &&
      !mongoose.Types.ObjectId.isValid(studentId)
    ) {
      res.status(400);
      throw new Error("Invalid student ID.");
    }

    if (
      academicYearId &&
      !mongoose.Types.ObjectId.isValid(academicYearId)
    ) {
      res.status(400);
      throw new Error("Invalid academic year ID.");
    }

    // --------------------------------------------------
    // 2. Find parent profile
    // --------------------------------------------------

    const parent = await Parent.findOne({
      user: req.user._id,
      school: schoolId,
    });

    if (!parent) {
      res.status(404);
      throw new Error(
        "Parent profile not found."
      );
    }

    // --------------------------------------------------
    // 3. Find all active children linked to parent
    // --------------------------------------------------

    const studentParentRecords =
      await StudentParent.find({
        parent: parent._id,
        isActive: true,
      })
        .populate({
          path: "student",

          match: {
            school: schoolId,
            isActive: true,
          },

          select:
            "_id user admissionNumber class section stream academicYear isActive",

          populate: [
            {
              path: "user",
              select: "name email phone",
            },
            {
              path: "class",
              select: "name code",
            },
            {
              path: "section",
              select: "name",
            },
            {
              path: "stream",
              select: "name",
            },
          ],
        })
        .lean();

    const children = studentParentRecords
      .map((record) => record.student)
      .filter(Boolean);

    // --------------------------------------------------
    // 4. No children linked to parent
    // --------------------------------------------------

    if (!children.length) {
      return res.json({
        parent: {
          _id: parent._id,
          name: req.user.name || "",
        },

        children: [],

        selectedChild: null,

        student: null,

        summary: null,

        assessments: [],
        upcomingAssessmentList: [],
        activeAssessmentList: [],

        recentAttempts: [],
        recentResults: [],

        assessmentStatusCounts: {},
        attemptStatusCounts: {},
        resultStatusCounts: {},

        charts: {
          subjectPerformance: [],
          performanceTrend: [],
          performanceDistribution: [],
        },
      });
    }

    // --------------------------------------------------
    // 5. Validate selected child
    // --------------------------------------------------

    let selectedStudent;

    if (studentId) {
      selectedStudent = children.find(
        (child) =>
          child._id.toString() === studentId
      );

      if (!selectedStudent) {
        res.status(403);
        throw new Error(
          "You are not authorized to access this student's dashboard."
        );
      }
    } else {
      // Default to first linked child.
      // Frontend can pass another studentId
      // when parent changes the dropdown.
      selectedStudent = children[0];
    }

    const student = selectedStudent;

    if (!student.class) {
      res.status(400);
      throw new Error(
        "Selected student is not assigned to a class."
      );
    }

    const selectedAcademicYear =
      academicYearId || student.academicYear || null;

    const now = new Date();

    const selectedStudentId = student._id;

    // --------------------------------------------------
    // 6. Build eligible assessment filter
    // --------------------------------------------------

    const assessmentFilter = {
      school: schoolId,

      class: student.class._id || student.class,

      status: {
        $in: [
          "SCHEDULED",
          "ACTIVE",
          "COMPLETED",
        ],
      },

      $and: [
        {
          $or: [
            {
              section:
                student.section?._id ||
                student.section ||
                null,
            },
            {
              section: null,
            },
          ],
        },
        {
          $or: [
            {
              stream:
                student.stream?._id ||
                student.stream ||
                null,
            },
            {
              stream: null,
            },
          ],
        },
      ],
    };

    if (selectedAcademicYear) {
      assessmentFilter.academicYear =
        selectedAcademicYear._id ||
        selectedAcademicYear;
    }

    // --------------------------------------------------
    // 7. Fetch eligible assessments
    // --------------------------------------------------

    const assessments = await Assessment.find(
      assessmentFilter
    )
      .select(
        "_id title description subject assessmentType durationMinutes totalQuestions totalMarks startDate endDate status academicYear class section stream"
      )
      .populate("subject", "name code")
      .populate("academicYear", "name")
      .populate("class", "name code")
      .populate("section", "name")
      .populate("stream", "name")
      .sort({
        startDate: -1,
        createdAt: -1,
      })
      .lean();

    const assessmentIds = assessments.map(
      (assessment) => assessment._id
    );

    // --------------------------------------------------
    // 8. Fetch selected child's attempts
    // --------------------------------------------------

    const attempts = assessmentIds.length
      ? await StudentAttempt.find({
          student: selectedStudentId,

          assessment: {
            $in: assessmentIds,
          },
        })
          .select(
            "_id assessment status attemptNumber totalQuestions attemptedQuestions startedAt submittedAt createdAt updatedAt"
          )
          .populate({
            path: "assessment",
            select:
              "title subject assessmentType totalMarks totalQuestions startDate endDate status",
            populate: {
              path: "subject",
              select: "name code",
            },
          })
          .sort({
            createdAt: -1,
          })
          .lean()
      : [];

    // --------------------------------------------------
    // 9. Latest attempt for each assessment
    // --------------------------------------------------

    const latestAttemptMap = new Map();

    attempts.forEach((attempt) => {
      const assessmentId =
        attempt.assessment?._id?.toString() ||
        attempt.assessment?.toString();

      if (
        assessmentId &&
        !latestAttemptMap.has(assessmentId)
      ) {
        latestAttemptMap.set(
          assessmentId,
          attempt
        );
      }
    });

    const assessmentList = assessments.map(
      (assessment) => ({
        ...assessment,

        latestAttempt:
          latestAttemptMap.get(
            assessment._id.toString()
          ) || null,
      })
    );

    // --------------------------------------------------
    // 10. Fetch selected child's results
    // --------------------------------------------------

    const results = assessmentIds.length
      ? await Result.find({
          student: selectedStudentId,

          assessment: {
            $in: assessmentIds,
          },
        })
          .populate({
            path: "assessment",
            select:
              "title assessmentType totalMarks subject",
            populate: {
              path: "subject",
              select: "name code",
            },
          })
          .populate("publishedBy", "name")
          .sort({
            publishedAt: -1,
            updatedAt: -1,
          })
          .lean()
      : [];

    // --------------------------------------------------
    // 11. Result status counts
    // --------------------------------------------------

    const resultStatusCounts = {};

    results.forEach((result) => {
      resultStatusCounts[result.status] =
        (resultStatusCounts[result.status] || 0) + 1;
    });

    const totalResults = results.length;

    const publishedResults =
      resultStatusCounts.PUBLISHED || 0;

    const pendingEvaluation =
      resultStatusCounts.PENDING_EVALUATION || 0;

    const draftResults =
      resultStatusCounts.DRAFT || 0;

    const withdrawnResults =
      resultStatusCounts.WITHDRAWN || 0;

    // --------------------------------------------------
    // 12. Published result performance
    // --------------------------------------------------

    const publishedResultRecords = results.filter(
      (result) => result.status === "PUBLISHED"
    );

    const totalObtainedMarks =
      publishedResultRecords.reduce(
        (sum, result) =>
          sum + (result.obtainedMarks || 0),
        0
      );

    const totalMaximumMarks =
      publishedResultRecords.reduce(
        (sum, result) =>
          sum + (result.totalMarks || 0),
        0
      );

    const averagePercentage = publishedResults
      ? Number(
          (
            publishedResultRecords.reduce(
              (sum, result) =>
                sum + (result.percentage || 0),
              0
            ) / publishedResults
          ).toFixed(2)
        )
      : 0;

    // Provisional pass threshold: 33%
    // Same calculation as student dashboard.

    const passCount = publishedResultRecords.filter(
      (result) => result.percentage >= 33
    ).length;

    const failCount =
      publishedResults - passCount;

    const passPercentage = publishedResults
      ? Number(
          (
            (passCount / publishedResults) *
            100
          ).toFixed(2)
        )
      : 0;

    const failPercentage = publishedResults
      ? Number(
          (
            (failCount / publishedResults) *
            100
          ).toFixed(2)
        )
      : 0;

    // --------------------------------------------------
    // 13. Assessment status statistics
    // --------------------------------------------------

    const upcomingAssessments = assessments.filter(
      (assessment) =>
        assessment.status === "SCHEDULED" &&
        new Date(assessment.startDate) > now
    );

    const activeAssessments = assessments.filter(
      (assessment) =>
        assessment.status === "ACTIVE" &&
        new Date(assessment.startDate) <= now &&
        new Date(assessment.endDate) >= now
    );

    const completedAssessments = assessments.filter(
      (assessment) =>
        assessment.status === "COMPLETED" ||
        (
          new Date(assessment.endDate) < now &&
          assessment.status !== "CANCELLED"
        )
    );

    // --------------------------------------------------
    // 14. Attempt status statistics
    // --------------------------------------------------

    const attemptStatusCounts = {};

    attempts.forEach((attempt) => {
      attemptStatusCounts[attempt.status] =
        (attemptStatusCounts[attempt.status] || 0) + 1;
    });

    const totalAttempts = attempts.length;

    const inProgressAttempts =
      attemptStatusCounts.IN_PROGRESS || 0;

    const submittedAttempts =
      attemptStatusCounts.SUBMITTED || 0;

    const evaluatedAttempts =
      attemptStatusCounts.EVALUATED || 0;

    const abandonedAttempts =
      attemptStatusCounts.ABANDONED || 0;

    const expiredAttempts =
      attemptStatusCounts.EXPIRED || 0;

    const completedAttempts =
      submittedAttempts + evaluatedAttempts;

    // --------------------------------------------------
    // 15. Assessments not attempted
    // --------------------------------------------------

    const notAttemptedAssessments =
      assessmentList.filter(
        (assessment) => !assessment.latestAttempt
      );

    const assessmentCounts = {
      total: assessments.length,

      upcoming: upcomingAssessments.length,

      active: activeAssessments.length,

      completed: completedAssessments.length,

      notAttempted: notAttemptedAssessments.length,
    };

    // --------------------------------------------------
    // 16. Subject-wise performance
    // --------------------------------------------------

    const subjectPerformanceMap = new Map();

    publishedResultRecords.forEach((result) => {
      const subject = result.assessment?.subject;

      if (!subject?._id) {
        return;
      }

      const subjectId = subject._id.toString();

      if (!subjectPerformanceMap.has(subjectId)) {
        subjectPerformanceMap.set(subjectId, {
          subjectId,

          subjectName: subject.name,

          subjectCode: subject.code || "",

          totalResults: 0,

          totalPercentage: 0,

          totalObtainedMarks: 0,

          totalMaximumMarks: 0,
        });
      }

      const item =
        subjectPerformanceMap.get(subjectId);

      item.totalResults += 1;

      item.totalPercentage +=
        result.percentage || 0;

      item.totalObtainedMarks +=
        result.obtainedMarks || 0;

      item.totalMaximumMarks +=
        result.totalMarks || 0;
    });

    const subjectPerformance = Array.from(
      subjectPerformanceMap.values()
    )
      .map((item) => ({
        ...item,

        averagePercentage: Number(
          (
            item.totalPercentage /
            item.totalResults
          ).toFixed(2)
        ),
      }))
      .sort(
        (a, b) =>
          b.averagePercentage - a.averagePercentage
      );

    // --------------------------------------------------
    // 17. Monthly performance trend
    // --------------------------------------------------

    const performanceTrendMap = new Map();

    publishedResultRecords.forEach((result) => {
      const date =
        result.publishedAt || result.updatedAt;

      if (!date) {
        return;
      }

      const resultDate = new Date(date);

      if (Number.isNaN(resultDate.getTime())) {
        return;
      }

      const month = new Intl.DateTimeFormat(
        "en-CA",
        {
          timeZone: "Asia/Kolkata",
          year: "numeric",
          month: "2-digit",
        }
      ).format(resultDate);

      if (!performanceTrendMap.has(month)) {
        performanceTrendMap.set(month, {
          month,

          totalPercentage: 0,

          totalResults: 0,
        });
      }

      const item =
        performanceTrendMap.get(month);

      item.totalPercentage +=
        result.percentage || 0;

      item.totalResults += 1;
    });

    const performanceTrend = Array.from(
      performanceTrendMap.values()
    )
      .map((item) => ({
        month: item.month,

        averagePercentage: Number(
          (
            item.totalPercentage /
            item.totalResults
          ).toFixed(2)
        ),

        totalResults: item.totalResults,
      }))
      .sort(
        (a, b) =>
          a.month.localeCompare(b.month)
      );

    // --------------------------------------------------
    // 18. Performance distribution
    // --------------------------------------------------

    const distributionRanges = [
      { label: "0-32", min: 0, max: 33 },
      { label: "33-49", min: 33, max: 50 },
      { label: "50-59", min: 50, max: 60 },
      { label: "60-74", min: 60, max: 75 },
      { label: "75-89", min: 75, max: 90 },
      { label: "90-100", min: 90, max: 101 },
    ];

    const performanceDistribution =
      distributionRanges.map((range) => ({
        range: range.label,

        count: publishedResultRecords.filter(
          (result) =>
            result.percentage >= range.min &&
            result.percentage < range.max
        ).length,
      }));

    // --------------------------------------------------
    // 19. Recent attempts and results
    // --------------------------------------------------

    const recentAttempts = attempts.slice(0, 10);

    const recentResults = [
      ...publishedResultRecords,
    ]
      .sort(
        (a, b) =>
          new Date(
            b.publishedAt || b.updatedAt
          ) -
          new Date(
            a.publishedAt || a.updatedAt
          )
      )
      .slice(0, 10);

    // --------------------------------------------------
    // 20. Selected child details
    // --------------------------------------------------

    const childDetails = {
      _id: student._id,

      name: student.user?.name || "",

      email: student.user?.email || "",

      admissionNumber:
        student.admissionNumber || "",

      class: student.class,

      section: student.section,

      stream: student.stream,

      academicYear: selectedAcademicYear,
    };

    // --------------------------------------------------
    // 21. Final parent dashboard response
    // --------------------------------------------------

    res.json({
      parent: {
        _id: parent._id,

        name: req.user.name || "",
      },

      // All children for frontend dropdown
      children: children.map((child) => ({
        _id: child._id,

        name: child.user?.name || "",

        admissionNumber:
          child.admissionNumber || "",

        class: child.class,

        section: child.section,

        stream: child.stream,

        academicYear: child.academicYear,
      })),

      // Currently selected child
      selectedChild: childDetails,

      // Retained for compatibility with student
      // dashboard frontend structure
      student: childDetails,

      summary: {
        // Assessment statistics
        totalAssessments: assessmentCounts.total,

        upcomingAssessments:
          assessmentCounts.upcoming,

        activeAssessments:
          assessmentCounts.active,

        completedAssessments:
          assessmentCounts.completed,

        notAttemptedAssessments:
          assessmentCounts.notAttempted,

        // Attempt statistics
        totalAttempts,

        inProgressAttempts,

        completedAttempts,

        submittedAttempts,

        evaluatedAttempts,

        abandonedAttempts,

        expiredAttempts,

        // Result statistics
        totalResults,

        publishedResults,

        pendingEvaluation,

        draftResults,

        withdrawnResults,

        // Performance statistics
        averagePercentage,

        passPercentage,

        failPercentage,

        totalObtainedMarks,

        totalMaximumMarks,

        passCount,

        failCount,
      },

      assessmentStatusCounts: {
        upcoming: assessmentCounts.upcoming,

        active: assessmentCounts.active,

        completed: assessmentCounts.completed,

        notAttempted: assessmentCounts.notAttempted,
      },

      attemptStatusCounts,

      resultStatusCounts,

      assessments: assessmentList,

      upcomingAssessmentList:
        upcomingAssessments,

      activeAssessmentList:
        activeAssessments,

      recentAttempts,

      recentResults,

      charts: {
        subjectPerformance,

        performanceTrend,

        performanceDistribution,
      },
    });
  }
);



// --------------------------------------------------
// Validate optional MongoDB ObjectIds
// --------------------------------------------------

const validateFilterId = (value, label) => {
  if (value && !mongoose.Types.ObjectId.isValid(value)) {
    const error = new Error(`Invalid ${label} ID.`);
    error.statusCode = 400;
    throw error;
  }

  return value ? new mongoose.Types.ObjectId(value) : null;
};

// --------------------------------------------------
// Build assessment filters
// --------------------------------------------------

const buildAssessmentFilter = (schoolId, filters = {}) => {
  const query = {
    school: schoolId,
  };

  if (filters.streamId) {
    query.stream = filters.streamId;
  }

  if (filters.classId) {
    query.class = filters.classId;
  }

  if (filters.sectionId) {
    query.section = filters.sectionId;
  }

  if (filters.subjectId) {
    query.subject = filters.subjectId;
  }

  return query;
};

// --------------------------------------------------
// Result aggregation pipeline
// --------------------------------------------------

const getResultPipeline = (schoolId, assessmentFilter) => [
  {
    $lookup: {
      from: Assessment.collection.name,
      localField: "assessment",
      foreignField: "_id",
      as: "assessmentInfo",
    },
  },
  {
    $unwind: "$assessmentInfo",
  },
  {
    $match: {
      "assessmentInfo.school": schoolId,

      ...(assessmentFilter.stream
        ? { "assessmentInfo.stream": assessmentFilter.stream }
        : {}),

      ...(assessmentFilter.class
        ? { "assessmentInfo.class": assessmentFilter.class }
        : {}),

      ...(assessmentFilter.section
        ? { "assessmentInfo.section": assessmentFilter.section }
        : {}),

      ...(assessmentFilter.subject
        ? { "assessmentInfo.subject": assessmentFilter.subject }
        : {}),
    },
  },
  {
    $lookup: {
      from: Student.collection.name,
      localField: "student",
      foreignField: "_id",
      as: "studentInfo",
    },
  },
  {
    $unwind: "$studentInfo",
  },
  {
    $match: {
      "studentInfo.school": schoolId,
    },
  },
];


export const getSchoolAdminDashboard = asyncHandler(
  async (req, res) => {

    // ==================================================
    // 1. Validate access
    // ==================================================

    const schoolId = req.schoolId;

    if (!schoolId) {
      res.status(403);
      throw new Error("School information not found.");
    }

    if (
      !["SCHOOL_ADMIN", "HM"].includes(req.user.role)
    ) {
      res.status(403);
      throw new Error(
        "Only SCHOOL_ADMIN and HM can access this dashboard."
      );
    }

    // ==================================================
    // 2. Read dashboard filters
    // ==================================================

    const filters = {
      streamId: validateFilterId(
        req.query.streamId,
        "Stream"
      ),

      classId: validateFilterId(
        req.query.classId,
        "Class"
      ),

      sectionId: validateFilterId(
        req.query.sectionId,
        "Section"
      ),

      subjectId: validateFilterId(
        req.query.subjectId,
        "Subject"
      ),
    };

    const assessmentFilter = buildAssessmentFilter(
      schoolId,
      filters
    );

    // ==================================================
    // 3. Fetch assessments
    // ==================================================

    const assessments = await Assessment.find(
      assessmentFilter
    )
      .select(
        "_id title assessmentType totalMarks startDate endDate status stream class section subject createdBy"
      )
      .populate("stream", "name")
      .populate("class", "name code")
      .populate("section", "name")
      .populate("subject", "name code")
      .lean();

    const assessmentIds = assessments.map(
      (item) => item._id
    );

    // ==================================================
    // 4. Fetch students
    // ==================================================

    const studentFilter = {
      school: schoolId,
      isActive: true,
    };

    if (filters.classId) {
      studentFilter.class = filters.classId;
    }

    if (filters.sectionId) {
      studentFilter.section = filters.sectionId;
    }

    if (filters.streamId) {
      studentFilter.stream = filters.streamId;
    }

    const totalStudents = await Student.countDocuments(
      studentFilter
    );

    // ==================================================
    // 5. Prepare dropdown options
    // ==================================================

    // Each dropdown is populated independently while
    // respecting the other applicable filters.

    const getFilterOptions = async (
      Model,
      field,
      excludedField
    ) => {

      const query = {
        school: schoolId,
      };

      if (
        excludedField !== "stream" &&
        filters.streamId
      ) {
        query.stream = filters.streamId;
      }

      if (
        excludedField !== "class" &&
        filters.classId
      ) {
        query.class = filters.classId;
      }

      if (
        excludedField !== "section" &&
        filters.sectionId
      ) {
        query.section = filters.sectionId;
      }

      if (
        excludedField !== "subject" &&
        filters.subjectId
      ) {
        query.subject = filters.subjectId;
      }

      const ids = await Assessment.distinct(
        field,
        query
      );

      return Model.find({
        _id: { $in: ids },
      })
        .select("name code")
        .sort({ name: 1 })
        .lean();
    };

    const [
      streams,
      classes,
      sections,
      subjects,
    ] = await Promise.all([

      getFilterOptions(
        Stream,
        "stream",
        "stream"
      ),

      getFilterOptions(
        ClassModel,
        "class",
        "class"
      ),

      getFilterOptions(
        Section,
        "section",
        "section"
      ),

      getFilterOptions(
        Subject,
        "subject",
        "subject"
      ),

    ]);

    // ==================================================
    // 6. Empty assessment response
    // ==================================================

    if (!assessmentIds.length) {

      return res.json({

        filters: {
          selected: filters,
          options: {
            streams,
            classes,
            sections,
            subjects,
          },
        },

        summary: {
          totalStudents,
          totalAssessments: 0,
          totalAttempts: 0,
          totalResults: 0,
          publishedResults: 0,
          pendingEvaluation: 0,
          averagePercentage: 0,
          passPercentage: 0,
          failPercentage: 0,
        },

        resultStatusCounts: {},

        attemptStatusCounts: {},

        charts: {
          subjectPerformance: [],
          assessmentPerformance: [],
          performanceDistribution: [],
          performanceTrend: [],
          teacherPerformance: [],
        },

        recentResults: [],
      });
    }

    // ==================================================
    // 7. Common aggregation pipeline
    // ==================================================

    const resultPipeline = getResultPipeline(
      schoolId,
      assessmentFilter
    );

    // ==================================================
    // 8. Attempts and result status counts
    // ==================================================

    const [
      totalAttempts,
      attemptStatusCounts,
      resultStatusCounts,
      totalResults,
    ] = await Promise.all([

      StudentAttempt.countDocuments({
        assessment: { $in: assessmentIds },
      }),

      StudentAttempt.aggregate([
        {
          $match: {
            assessment: { $in: assessmentIds },
          },
        },
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
          },
        },
      ]),

      Result.aggregate([
        ...resultPipeline,
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
          },
        },
      ]),

      Result.countDocuments({
        assessment: { $in: assessmentIds },
      }),

    ]);

    const statusCounts = {};

    resultStatusCounts.forEach((item) => {
      statusCounts[item._id] = item.count;
    });

    const attemptCounts = {};

    attemptStatusCounts.forEach((item) => {
      attemptCounts[item._id] = item.count;
    });

    const publishedResults =
      statusCounts.PUBLISHED || 0;

    const pendingEvaluation =
      statusCounts.PENDING_EVALUATION || 0;

    // ==================================================
    // 9. Overall performance summary
    // ==================================================

    const performanceSummary = await Result.aggregate([

      ...resultPipeline,

      {
        $match: {
          status: "PUBLISHED",
        },
      },

      {
        $group: {
          _id: null,

          averagePercentage: {
            $avg: "$percentage",
          },

          totalObtainedMarks: {
            $sum: "$obtainedMarks",
          },

          totalMaximumMarks: {
            $sum: "$totalMarks",
          },

          passCount: {
            $sum: {
              $cond: [
                { $gte: ["$percentage", 33] },
                1,
                0,
              ],
            },
          },

          failCount: {
            $sum: {
              $cond: [
                { $lt: ["$percentage", 33] },
                1,
                0,
              ],
            },
          },
        },
      },

    ]);

    const performance = performanceSummary[0] || {};

    const passCount = performance.passCount || 0;
    const failCount = performance.failCount || 0;

    const passPercentage = publishedResults
      ? Number(
          (
            (passCount / publishedResults) * 100
          ).toFixed(2)
        )
      : 0;

    const failPercentage = publishedResults
      ? Number(
          (
            (failCount / publishedResults) * 100
          ).toFixed(2)
        )
      : 0;

    // ==================================================
    // 10. Subject-wise performance
    // ==================================================

    const subjectPerformance = await Result.aggregate([

      ...resultPipeline,

      {
        $match: {
          status: "PUBLISHED",
        },
      },

      {
        $group: {
          _id: "$assessmentInfo.subject",

          averagePercentage: {
            $avg: "$percentage",
          },

          totalResults: {
            $sum: 1,
          },

          passCount: {
            $sum: {
              $cond: [
                { $gte: ["$percentage", 33] },
                1,
                0,
              ],
            },
          },

          failCount: {
            $sum: {
              $cond: [
                { $lt: ["$percentage", 33] },
                1,
                0,
              ],
            },
          },

          students: {
            $addToSet: "$student",
          },

          assessments: {
            $addToSet: "$assessment",
          },
        },
      },

      {
        $lookup: {
          from: Subject.collection.name,
          localField: "_id",
          foreignField: "_id",
          as: "subjectInfo",
        },
      },

      {
        $unwind: {
          path: "$subjectInfo",
          preserveNullAndEmptyArrays: true,
        },
      },

      {
        $project: {
          _id: 0,

          subjectId: "$_id",

          subjectName: {
            $ifNull: [
              "$subjectInfo.name",
              "Subject",
            ],
          },

          averagePercentage: {
            $round: ["$averagePercentage", 2],
          },

          totalResults: 1,

          totalStudents: {
            $size: "$students",
          },

          totalAssessments: {
            $size: "$assessments",
          },

          passCount: 1,
          failCount: 1,

          passPercentage: {
            $round: [
              {
                $multiply: [
                  {
                    $divide: [
                      "$passCount",
                      "$totalResults",
                    ],
                  },
                  100,
                ],
              },
              2,
            ],
          },

          failPercentage: {
            $round: [
              {
                $multiply: [
                  {
                    $divide: [
                      "$failCount",
                      "$totalResults",
                    ],
                  },
                  100,
                ],
              },
              2,
            ],
          },
        },
      },

      {
        $sort: {
          averagePercentage: -1,
        },
      },

    ]);

    // ==================================================
    // 11. Assessment-wise performance
    // ==================================================

    const assessmentPerformance = await Result.aggregate([

      ...resultPipeline,

      {
        $match: {
          status: "PUBLISHED",
        },
      },

      {
        $group: {
          _id: "$assessment",

          averagePercentage: {
            $avg: "$percentage",
          },

          totalResults: {
            $sum: 1,
          },
        },
      },

      {
        $sort: {
          _id: -1,
        },
      },

      {
        $limit: 30,
      },

    ]);

    const assessmentMap = new Map(
      assessments.map((item) => [
        item._id.toString(),
        item,
      ])
    );

    const assessmentPerformanceData =
      assessmentPerformance.map((item) => {

        const assessment = assessmentMap.get(
          item._id.toString()
        );

        return {
          assessmentId: item._id,

          title: assessment?.title || "Assessment",

          assessmentType:
            assessment?.assessmentType || "",

          subjectName:
            assessment?.subject?.name || "Subject",

          className:
            assessment?.class?.name || "",

          sectionName:
            assessment?.section?.name || "",

          averagePercentage: Number(
            item.averagePercentage.toFixed(2)
          ),

          totalResults: item.totalResults,
        };
      });

    // ==================================================
    // 12. Student performance distribution
    // ==================================================

    const performanceDistribution = await Result.aggregate([

      ...resultPipeline,

      {
        $match: {
          status: "PUBLISHED",
        },
      },

      {
        $bucket: {
          groupBy: "$percentage",

          boundaries: [
            0,
            33,
            50,
            60,
            75,
            90,
            101,
          ],

          default: "OTHER",

          output: {
            count: {
              $sum: 1,
            },
          },
        },
      },

      {
        $project: {
          _id: 0,
          range: "$_id",
          count: 1,
        },
      },

    ]);

    // ==================================================
    // 13. Monthly performance trend
    // ==================================================

    const performanceTrend = await Result.aggregate([

      ...resultPipeline,

      {
        $match: {
          status: "PUBLISHED",
        },
      },

      {
        $group: {
          _id: {
            month: {
              $dateToString: {
                format: "%Y-%m",

                date: {
                  $ifNull: [
                    "$publishedAt",
                    "$updatedAt",
                  ],
                },

                timezone: "Asia/Kolkata",
              },
            },
          },

          averagePercentage: {
            $avg: "$percentage",
          },

          totalResults: {
            $sum: 1,
          },
        },
      },

      {
        $project: {
          _id: 0,

          month: "$_id.month",

          averagePercentage: {
            $round: [
              "$averagePercentage",
              2,
            ],
          },

          totalResults: 1,
        },
      },

      {
        $sort: {
          month: 1,
        },
      },

    ]);

    // ==================================================
    // 14. Teacher-level assessment creator performance
    // ==================================================

    const teacherPerformance = await Result.aggregate([

      ...resultPipeline,

      {
        $match: {
          status: "PUBLISHED",
          "assessmentInfo.createdBy": {
            $ne: null,
          },
        },
      },

      {
        $group: {
          _id: "$assessmentInfo.createdBy",

          averagePercentage: {
            $avg: "$percentage",
          },

          totalResults: {
            $sum: 1,
          },

          assessmentIds: {
            $addToSet: "$assessment",
          },

          studentIds: {
            $addToSet: "$student",
          },

          passCount: {
            $sum: {
              $cond: [
                { $gte: ["$percentage", 33] },
                1,
                0,
              ],
            },
          },

          failCount: {
            $sum: {
              $cond: [
                { $lt: ["$percentage", 33] },
                1,
                0,
              ],
            },
          },
        },
      },

      {
        $lookup: {
          from: User.collection.name,
          localField: "_id",
          foreignField: "_id",
          as: "teacherInfo",
        },
      },

      {
        $unwind: "$teacherInfo",
      },

      {
        $match: {
          "teacherInfo.role": "TEACHER",
        },
      },

      {
        $project: {
          _id: 0,

          teacherId: "$_id",

          teacherName: "$teacherInfo.name",

          averagePercentage: {
            $round: [
              "$averagePercentage",
              2,
            ],
          },

          totalResults: 1,

          totalAssessments: {
            $size: "$assessmentIds",
          },

          totalStudents: {
            $size: "$studentIds",
          },

          passCount: 1,
          failCount: 1,
        },
      },

      {
        $sort: {
          averagePercentage: -1,
        },
      },

    ]);

    // ==================================================
    // 15. Recently published results
    // ==================================================

    const recentResults = await Result.find({
      assessment: {
        $in: assessmentIds,
      },

      status: "PUBLISHED",
    })

      .sort({
        publishedAt: -1,
        updatedAt: -1,
      })

      .limit(15)

      .populate({
        path: "student",
        select: "admissionNumber user class section",

        populate: {
          path: "user",
          select: "name",
        },
      })

      .populate({
        path: "assessment",
        select:
          "title assessmentType subject totalMarks stream class section",

        populate: [
          {
            path: "stream",
            select: "name",
          },
          {
            path: "subject",
            select: "name code",
          },
          {
            path: "class",
            select: "name code",
          },
          {
            path: "section",
            select: "name",
          },
        ],
      })

      .lean();

    // ==================================================
    // 16. Final dashboard response
    // ==================================================

    res.json({

      filters: {
        selected: filters,

        options: {
          streams,
          classes,
          sections,
          subjects,
        },
      },

      summary: {

        totalStudents,

        totalAssessments: assessments.length,

        totalAttempts,

        totalResults,

        publishedResults,

        pendingEvaluation,

        averagePercentage: Number(
          (performance.averagePercentage || 0).toFixed(2)
        ),

        passPercentage,

        failPercentage,
      },

      resultStatusCounts: statusCounts,

      attemptStatusCounts: attemptCounts,

      charts: {

        subjectPerformance,

        assessmentPerformance:
          assessmentPerformanceData,

        performanceDistribution,

        performanceTrend,

        teacherPerformance,
      },

      recentResults,

    });

  }
);


