import dotenv from "dotenv";

import connectDB from "./config/db.js";

import users from "./data/users.js";

import User from "./models/userModel.js";
import CompanyProfile from "./models/CompanyProfileModel.js";

dotenv.config();

connectDB();

const COMPANY_NAME = "Infowisdom Software";

const importData = async () => {
  try {
    // Remove existing users
    await User.deleteMany({});

    // Find company by company name
    const company = await CompanyProfile.findOne({
      companyName: COMPANY_NAME,
    });

    if (!company) {
      throw new Error(
        `Company '${COMPANY_NAME}' not found. Please seed CompanyProfile first.`
      );
    }

    // Attach companyProfile id to every user
    const usersWithCompany = users.map((user) => ({
      ...user,
      companyProfile: company._id,
    }));

    // create() triggers bcrypt middleware
    const createdUsers = await User.create(usersWithCompany);

    console.log("====================================");
    console.log(`Company : ${company.companyName}`);
    console.log(`Inserted ${createdUsers.length} users`);
    console.log("====================================");

    process.exit(0);
  } catch (error) {
    console.error("====================================");
    console.error("Seeding Error");
    console.error("====================================");
    console.error(error.message);

    process.exit(1);
  }
};

importData();