import dotenv from "dotenv";

import connectDB from "./config/db.js";
import CompanyProfile from "./models/CompanyProfileModel.js";

dotenv.config();

connectDB();

const importData = async () => {
  try {
    // Remove existing company profile
    await CompanyProfile.deleteMany({});

    // Seed company profile
    const companyProfile = await CompanyProfile.create({
      companyName: "Infowisdom Software",

      email: "ctsevuga@gmail.com",

      phone: "+91 9789911533",

      address:
        "Nachiyar 7th Cross Street, Pari Nagar, Karaikudi, Tamil Nadu - 630106",

      logo:
        "https://res.cloudinary.com/dsoi84tie/image/upload/v1784460913/iws-logo_tajlzx.png",

      electronicSignature:
        "https://res.cloudinary.com/dsoi84tie/image/upload/v1784460967/Signature_wuzvzy.jpg",

      invoicePrefix: "IWS",

      // New required fields
      companyCode: "IWS",

      slug: "infowisdom-software",

      // Optional fields
      status: "active",

      currency: "INR",

      taxNumber: null,

      website: "https://infowisdom.in",

      domain: "infowisdom.in",

      isActive: true,

      // createdBy can be omitted or assigned later
      createdBy: null,
    });

    console.log("=========================================");
    console.log("Company profile seeded successfully");
    console.log("=========================================");
    console.log(companyProfile);

    process.exit(0);
  } catch (error) {
    console.error("=========================================");
    console.error("Seeding Error");
    console.error("=========================================");
    console.error(error);
    process.exit(1);
  }
};

importData();