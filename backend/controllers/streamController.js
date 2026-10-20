import asyncHandler from "../middleware/asyncHandler.js";

import Stream from "../models/streamModel.js";
import School from "../models/schoolModel.js";


const getUserSchool = (req, requestedSchool) => {
  if (req.user.role === "SUPER_ADMIN") {
    return requestedSchool || null;
  }

  return req.schoolId;
};


const validateStreamAccess = (
  req,
  stream,
  message,
) => {
  if (req.user.role === "SUPER_ADMIN") {
    return;
  }

  if (
    !req.schoolId ||
    stream.school.toString() !==
      req.schoolId.toString()
  ) {
    res.status(403);
    throw new Error(
      message || "Not authorized to access this stream",
    );
  }
};


const validateSchool = async (schoolId) => {
  const school = await School.findById(schoolId);

  if (!school) {
    return {
      error: "School not found",
    };
  }

  if (!school.isActive) {
    return {
      error: "School is inactive",
    };
  }

  return {
    school,
  };
};


const validateIsActiveQuery = (
  value,
) => {
  if (
    value !== "true" &&
    value !== "false"
  ) {
    return null;
  }

  return value === "true";
};


const populateStream = (query) =>
  query.populate(
    "school",
    "name code",
  );


/*
  Create Stream
*/
export const createStream = asyncHandler(
  async (req, res) => {
    const {
      name,
      code,
      description,
    } = req.body;

    if (!name || !code) {
      res.status(400);
      throw new Error(
        "Stream name and code are required",
      );
    }

    const school = req.schoolId;

    if (!school) {
      res.status(400);
      throw new Error(
        "School could not be determined for this user",
      );
    }

    const schoolValidation =
      await validateSchool(school);

    if (schoolValidation.error) {
      res.status(400);
      throw new Error(
        schoolValidation.error,
      );
    }

    if (
      typeof name !== "string" ||
      typeof code !== "string"
    ) {
      res.status(400);
      throw new Error(
        "Stream name and code must be strings",
      );
    }

    const normalizedName =
      name.trim();

    const normalizedCode =
      code.trim().toUpperCase();

    if (!normalizedName) {
      res.status(400);
      throw new Error(
        "Stream name cannot be empty",
      );
    }

    if (!normalizedCode) {
      res.status(400);
      throw new Error(
        "Stream code cannot be empty",
      );
    }

    const existingStream =
      await Stream.findOne({
        school,
        code: normalizedCode,
      });

    if (existingStream) {
      res.status(400);
      throw new Error(
        "Stream code already exists in this school",
      );
    }

    const stream =
      await Stream.create({
        school,
        name: normalizedName,
        code: normalizedCode,
        description,
      });

    const populatedStream =
      await populateStream(
        Stream.findById(
          stream._id,
        ),
      );

    res.status(201).json(
      await populatedStream,
    );
  },
);

/*
  Get Streams
*/
export const getStreams = asyncHandler(
  async (req, res) => {
    const {
      school: requestedSchool,
      isActive,
      code,
    } = req.query;

    const school = getUserSchool(
      req,
      requestedSchool,
    );

    const filter = {};

    if (
      req.user.role === "SUPER_ADMIN"
    ) {
      if (school) {
        const schoolValidation =
          await validateSchool(school);

        if (schoolValidation.error) {
          res.status(400);
          throw new Error(
            schoolValidation.error,
          );
        }

        filter.school = school;
      }
    } else {
      filter.school = req.schoolId;
    }

    if (isActive !== undefined) {
      const activeValue =
        validateIsActiveQuery(
          isActive,
        );

      if (activeValue === null) {
        res.status(400);
        throw new Error(
          "isActive must be true or false",
        );
      }

      filter.isActive =
        activeValue;
    }

    if (code) {
      filter.code =
        code.trim().toUpperCase();
    }

    const streams =
      await populateStream(
        Stream.find(filter).sort({
          code: 1,
        }),
      );

    res.status(200).json(
      await streams,
    );
  },
);


/*
  Get Stream by ID
*/
export const getStreamById =
  asyncHandler(async (req, res) => {
    const stream =
      await populateStream(
        Stream.findById(
          req.params.id,
        ),
      );

    if (!stream) {
      res.status(404);
      throw new Error(
        "Stream not found",
      );
    }

    if (
      req.user.role !== "SUPER_ADMIN" &&
      (
        !req.schoolId ||
        stream.school._id.toString() !==
          req.schoolId.toString()
      )
    ) {
      res.status(403);
      throw new Error(
        "Not authorized to access this stream",
      );
    }

    res.status(200).json(
      stream,
    );
  });


/*
  Get Streams by School
*/
export const getStreamsBySchool =
  asyncHandler(async (req, res) => {
    const {
      schoolId,
    } = req.params;

    if (
      req.user.role !== "SUPER_ADMIN" &&
      (
        !req.schoolId ||
        req.schoolId.toString() !==
          schoolId.toString()
      )
    ) {
      res.status(403);
      throw new Error(
        "Not authorized to access this school",
      );
    }

    const school =
      await School.findById(
        schoolId,
      );

    if (!school) {
      res.status(404);
      throw new Error(
        "School not found",
      );
    }

    const {
      isActive,
    } = req.query;

    const filter = {
      school: schoolId,
    };

    if (isActive !== undefined) {
      const activeValue =
        validateIsActiveQuery(
          isActive,
        );

      if (activeValue === null) {
        res.status(400);
        throw new Error(
          "isActive must be true or false",
        );
      }

      filter.isActive =
        activeValue;
    }

    const streams =
      await populateStream(
        Stream.find(filter).sort({
          code: 1,
        }),
      );

    res.status(200).json(
      await streams,
    );
  });


/*
  Update Stream
*/
export const updateStream =
  asyncHandler(async (req, res) => {
    const stream =
      await Stream.findById(
        req.params.id,
      );

    if (!stream) {
      res.status(404);
      throw new Error(
        "Stream not found",
      );
    }

    if (
      req.user.role !== "SUPER_ADMIN" &&
      (
        !req.schoolId ||
        stream.school.toString() !==
          req.schoolId.toString()
      )
    ) {
      res.status(403);
      throw new Error(
        "Not authorized to update this stream",
      );
    }

    const {
      name,
      code,
      description,
      isActive,
    } = req.body;

    if (name !== undefined) {
      if (
        typeof name !== "string"
      ) {
        res.status(400);
        throw new Error(
          "Stream name must be a string",
        );
      }

      const normalizedName =
        name.trim();

      if (!normalizedName) {
        res.status(400);
        throw new Error(
          "Stream name cannot be empty",
        );
      }

      stream.name =
        normalizedName;
    }

    if (code !== undefined) {
      if (
        typeof code !== "string"
      ) {
        res.status(400);
        throw new Error(
          "Stream code must be a string",
        );
      }

      const normalizedCode =
        code.trim().toUpperCase();

      if (!normalizedCode) {
        res.status(400);
        throw new Error(
          "Stream code cannot be empty",
        );
      }

      const existingStream =
        await Stream.findOne({
          school: stream.school,
          code: normalizedCode,
          _id: {
            $ne: stream._id,
          },
        });

      if (existingStream) {
        res.status(400);
        throw new Error(
          "Stream code already exists in this school",
        );
      }

      stream.code =
        normalizedCode;
    }

    if (description !== undefined) {
      stream.description =
        description;
    }

    if (isActive !== undefined) {
      if (
        typeof isActive !== "boolean"
      ) {
        res.status(400);
        throw new Error(
          "isActive must be true or false",
        );
      }

      stream.isActive =
        isActive;
    }

    const updatedStream =
      await stream.save();

    const populatedStream =
      await populateStream(
        Stream.findById(
          updatedStream._id,
        ),
      );

    res.status(200).json(
      await populatedStream,
    );
  });


/*
  Update Stream Status
*/
export const updateStreamStatus =
  asyncHandler(async (req, res) => {
    const stream =
      await Stream.findById(
        req.params.id,
      );

    if (!stream) {
      res.status(404);
      throw new Error(
        "Stream not found",
      );
    }

    if (
      req.user.role !== "SUPER_ADMIN" &&
      (
        !req.schoolId ||
        stream.school.toString() !==
          req.schoolId.toString()
      )
    ) {
      res.status(403);
      throw new Error(
        "Not authorized to update this stream",
      );
    }

    const {
      isActive,
    } = req.body;

    if (
      typeof isActive !== "boolean"
    ) {
      res.status(400);
      throw new Error(
        "isActive must be true or false",
      );
    }

    stream.isActive =
      isActive;

    await stream.save();

    const populatedStream =
      await populateStream(
        Stream.findById(
          stream._id,
        ),
      );

    res.status(200).json(
      await populatedStream,
    );
  });


/*
  Delete Stream
*/
export const deleteStream =
  asyncHandler(async (req, res) => {
    const stream =
      await Stream.findById(
        req.params.id,
      );

    if (!stream) {
      res.status(404);
      throw new Error(
        "Stream not found",
      );
    }

    if (
      req.user.role !== "SUPER_ADMIN" &&
      (
        !req.schoolId ||
        stream.school.toString() !==
          req.schoolId.toString()
      )
    ) {
      res.status(403);
      throw new Error(
        "Not authorized to delete this stream",
      );
    }

    await stream.deleteOne();

    res.status(200).json({
      message:
        "Stream deleted successfully",
    });
  });