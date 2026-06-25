require("dotenv").config();
const express = require("express");
const axios = require("axios");
const mysql = require("mysql2");
const cors = require("cors");
const multer = require("multer");
const QRCode = require("qrcode");
const crypto = require("crypto");
const path = require("path");
const fs = require("fs");
const bodyParser = require("body-parser");

const app = express();
app.use(cors({
  origin: [
    "http://127.0.0.1:3000",
    "http://127.0.0.1:3001",
    "http://localhost:3000",
    "http://localhost:3001",
    "https://luxurytravelshow.in",
    "https://www.luxurytravelshow.in",
    "https://api.luxurytravelshow.in",
    "https://luxurytravelshow.saitechnosolutions.com",
    "https://luxurydashboard.saitechnosolutions.com"
  ],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());

const nodemailer = require("nodemailer");
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const EMAIL_LOGO_CID = "lts-logo152";
const emailLogoPath = path.join(__dirname, "logo152.png");
const emailLogoHtml = (title, titleStyle = "") => `
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse; margin: 0 auto; text-align: center;">
    <tr>
      <td align="center" style="padding: 0;">
        <table role="presentation" cellpadding="0" cellspacing="0" style="border-collapse: collapse; margin: 0 auto; max-width: 100%;">
          <tr>
            <td style="padding: 0 10px 0 0; vertical-align: middle; width: 44px;">
              <img src="cid:${EMAIL_LOGO_CID}" width="40" height="40" alt="Luxury Travel Show" style="display: block; width: 40px; height: 40px; max-width: 40px; border: 0; outline: none; text-decoration: none;" />
            </td>
            <td style="vertical-align: middle; text-align: left;">
              <div style="${titleStyle}">${title}</div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
`;
const emailLogoAttachment = () => ({
  filename: "logo152.png",
  path: emailLogoPath,
  cid: EMAIL_LOGO_CID,
});
const withEmailLogo = (attachments = []) => (
  fs.existsSync(emailLogoPath) ? [emailLogoAttachment(), ...attachments] : attachments
);

const EMAIL_IMG1_CID = "lts-img1";
const EMAIL_IMG2_CID = "lts-img2";
const EMAIL_IMG3_CID = "lts-img3";
const EMAIL_IMG4_CID = "lts-img4";

const emailImg1Path = path.join(__dirname, "img1.jpeg");
const emailImg2Path = path.join(__dirname, "img2.png");
const emailImg3Path = path.join(__dirname, "img3.png");
const emailImg4Path = path.join(__dirname, "img4.png");

const getEmailAttachments = (qrAttachment = null) => {
  const attachments = [];
  if (fs.existsSync(emailLogoPath)) {
    attachments.push({
      filename: "logo152.png",
      path: emailLogoPath,
      cid: EMAIL_LOGO_CID,
    });
  }
  if (fs.existsSync(emailImg1Path)) {
    attachments.push({
      filename: "img1.jpeg",
      path: emailImg1Path,
      cid: EMAIL_IMG1_CID,
    });
  }
  if (fs.existsSync(emailImg2Path)) {
    attachments.push({
      filename: "img2.png",
      path: emailImg2Path,
      cid: EMAIL_IMG2_CID,
    });
  }
  if (fs.existsSync(emailImg3Path)) {
    attachments.push({
      filename: "img3.png",
      path: emailImg3Path,
      cid: EMAIL_IMG3_CID,
    });
  }
  if (fs.existsSync(emailImg4Path)) {
    attachments.push({
      filename: "img4.png",
      path: emailImg4Path,
      cid: EMAIL_IMG4_CID,
    });
  }
  if (qrAttachment) {
    attachments.push(qrAttachment);
  }
  return attachments;
};

// Serve uploaded files
app.use("/uploads", express.static("uploads"));
app.use("/qrcodes", express.static("uploads/qrcodes"));
app.use('/qrcodes', express.static(path.join(__dirname, 'qrcodes')));
app.use("/uploads/brochure", express.static(path.join(__dirname, "uploads/brochure"), {
  setHeaders: (res, filePath) => {
    if (filePath.endsWith(".pdf")) {
      res.setHeader("Content-Type", "application/pdf");
    }
  }
}));

// DB connection
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

// MULTER CONFIG
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const brochureDir = path.join(__dirname, "uploads", "brochure");
if (!fs.existsSync(brochureDir)) {
  fs.mkdirSync(brochureDir, { recursive: true });
}

const voucherStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "uploads", "brochure"));
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});
const uploadVoucher = multer({ storage: voucherStorage, limits: { fileSize: 50 * 1024 * 1024 } });

const visitorStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/visitors");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

const visitorUpload = multer({
  storage: visitorStorage,
  fileFilter: function (req, file, cb) {
    const allowedTypes = /jpeg|jpg|png|pdf/;
    const ext = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mime = allowedTypes.test(file.mimetype);
    if (ext && mime) {
      cb(null, true);
    } else {
      cb(new Error("Only PNG, JPG, JPEG, PDF allowed"));
    }
  }
});

const buildVisitorEmailHtml = (visitor, isForAdmin, status = "Pending", qrCid = null, notes = null, visitorId = null) => {
  const vis = typeof visitor === "string" ? { fullName: visitor } : (visitor || {});
  
  const firstName = vis.first_name || vis.firstName || "";
  const lastName = vis.last_name || vis.lastName || "";
  const fullName = vis.fullName || `${firstName} ${lastName}`.trim() || "Visitor";
  const companyName = vis.company_name || vis.companyName || "";
  const email = vis.email || "";
  const mobileNumber = vis.mobile_number || vis.mobileNumber || "";
  const designation = vis.designation || "";
  const country = vis.country || "";
  const state = vis.state || "";
  const city = vis.city || "";
  const pincode = vis.pincode || "";
  const address1 = vis.address1 || "";
  const address2 = vis.address2 || "";

  // Dynamic status styling
  let statusText = "Registration Pending";
  let statusColor = "#666666";

  const lStatus = status.toLowerCase();
  if (lStatus === "approved") {
    statusText = "Registration Approved";
    statusColor = "#593983"; // Requested color
  } else if (lStatus === "rejected") {
    statusText = "Registration Rejected";
    statusColor = "red"; // Requested color
  } else {
    statusText = "Registration Pending";
    statusColor = "#666666";
  }

  // Address parts and formatting
  const addressParts = [];
  if (address1) addressParts.push(address1);
  if (address2) addressParts.push(address2);
  if (city) addressParts.push(city);
  if (state) addressParts.push(state);
  if (country) addressParts.push(country);
  if (pincode) addressParts.push(pincode);
  const fullAddress = addressParts.join(", ") || "N/A";

  let congratTitle = "";
  let bodyParagraph = "";

  if (isForAdmin) {
    if (lStatus === "approved") {
      congratTitle = "Visitor Registration - Approved";
      bodyParagraph = `We are pleased to inform you that the registration submission for <strong>${fullName}</strong> from <strong>${companyName}</strong> has been approved.`;
    } else if (lStatus === "rejected") {
      congratTitle = "Visitor Registration - Rejected";
      bodyParagraph = `Please note that the registration submission for <strong>${fullName}</strong> from <strong>${companyName}</strong> has been rejected.`;
    } else {
      congratTitle = `Congratulations! You've Received a New Visitor Registration!`;
      bodyParagraph = `We have received a registration submission from <strong>${companyName}</strong> for LTS 2026. The registration is currently under review by the organizing team. Further communication and confirmation will be sent directly to the registered email address upon completion of the evaluation process.`;
    }
  } else {
    if (lStatus === "approved") {
      congratTitle = "Congratulations! Your Registration has been Approved!";
      bodyParagraph = "We are pleased to inform you that your registration submission for LTS 2026 has been successfully reviewed and approved by the organizing team. Your participation has been confirmed, and we look forward to welcoming you to the event. Further details, including event guidelines and schedules, will be shared with you through your registered email address.";
    } else if (lStatus === "rejected") {
      congratTitle = "Registration Status Update";
      bodyParagraph = "Thank you for your interest in participating in LTS 2026. After careful review by the organizing team, we regret to inform you that your registration submission has not been approved at this time. We appreciate the effort taken to submit your application and thank you for your interest in the event. For any further clarification, please feel free to contact the organizing team through the official communication channels.";
    } else {
      congratTitle = "Congratulations! Your Registration has been Received!";
      bodyParagraph = `We have received a registration submission from <strong>${companyName}</strong> for LTS 2026. The registration is currently under review by the organizing team. Further communication and confirmation will be sent directly to the registered email address upon completion of the evaluation process.`;
    }
  }

  return `
    <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
    <html xmlns="http://www.w3.org/1999/xhtml">
    <head>
      <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
      <title>LTS 2026 Registration</title>
      <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
      <style type="text/css">
        body {
          width: 100% !important; 
          -webkit-text-size-adjust: 100%; 
          -ms-text-size-adjust: 100%; 
          margin: 0; 
          padding: 0;
          background-color: #f5f5f5;
        }
        @media only screen and (max-width: 600px) {
          .email-card { 
            width: 100% !important; 
            max-width: 100% !important; 
            border-radius: 0px !important; 
            border-left: 0 !important;
            border-right: 0 !important;
          }
          .email-body { 
            padding: 25px 20px !important; 
          }
          .col-stack { 
            display: block !important; 
            width: 100% !important; 
            max-width: 100% !important; 
            box-sizing: border-box !important; 
            float: none !important; 
            margin-bottom: 15px !important; 
          }
          .sponsors-wrapper { 
            padding: 25px 20px !important; 
          }
        }
      </style>
    </head>
    <body style="margin: 0; padding: 20px 0; background-color: #f5f5f5; font-family: Arial, sans-serif;">
      <table border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed; background-color: #f5f5f5;">
        <tr>
          <td align="center" style="padding: 10px 0;">
            <table class="email-card" border="0" cellpadding="0" cellspacing="0" width="600" style="border-collapse: collapse; background-color: #ffffff; border: 1px solid #e0e0e0; border-radius: 6px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.05);">
              
              <!-- Header Row -->
              <tr>
                <td style="padding: 25px 30px 20px 30px; border-bottom: 1px solid #eeeeee;">
                  <table border="0" cellpadding="0" cellspacing="0" style="border-collapse: collapse;">
                    <tr>
                      <td align="left" width="80" style="vertical-align: middle; padding-right: 15px; width: 80px;">
                        <img src="cid:${EMAIL_LOGO_CID}" width="70" alt="LTS Logo" style="display: block; width: 70px; height: auto; border: 0; outline: none;" />
                      </td>
                      <td align="left" style="vertical-align: middle; font-family: Arial, sans-serif;">
                        <span style="color: #666666; font-size: 18px; font-weight: normal; line-height: 1.2; display: block;">Organized by</span>
                        <span style="color: #d2232a; font-size: 26px; font-weight: bold; line-height: 1.2; display: block;">TAAC</span>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              
              <!-- Body Content Row -->
              <tr>
                <td class="email-body" style="padding: 30px 30px 20px 30px; font-family: Arial, sans-serif; font-size: 14px; color: #333333; line-height: 1.6;">
                  
                  <!-- Title -->
                  <h2 style="color: #d2232a; font-size: 18px; font-weight: bold; margin-top: 0; margin-bottom: 20px; line-height: 1.3;">
                    ${congratTitle}
                  </h2>
                  
                  <!-- Salutation -->
                  <p style="margin-top: 0; margin-bottom: 15px;">
                    Hi <strong style="color: #111111;">${isForAdmin ? 'Admin' : fullName}</strong>,
                  </p>
                  
                  <!-- Main Paragraph -->
                  <p style="margin-top: 0; margin-bottom: 25px; color: #333333;">
                    ${bodyParagraph}
                  </p>
                  
                  <!-- Registration Details -->
                  <h3 style="color: #d2232a; font-size: 15px; font-weight: bold; margin-top: 0; margin-bottom: 10px; text-transform: uppercase; letter-spacing: 0.5px;">
                    Registration Details
                  </h3>
                  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="border-collapse: collapse; margin-bottom: 25px; width: 100%;">
                    <tr>
                      <td valign="top" width="15" style="font-family: Arial, sans-serif; font-size: 14px; color: #333333; line-height: 1.6; padding: 3px 0; width: 15px;">
                        &bull;
                      </td>
                      <td valign="top" width="95" style="font-family: Arial, sans-serif; font-size: 14px; color: #111111; font-weight: bold; line-height: 1.6; padding: 3px 0; width: 95px;">
                        Registrant:
                      </td>
                      <td valign="top" style="font-family: Arial, sans-serif; font-size: 14px; color: #333333; line-height: 1.6; padding: 3px 0;">
                        ${fullName}
                      </td>
                    </tr>
                    <tr>
                      <td valign="top" width="15" style="font-family: Arial, sans-serif; font-size: 14px; color: #333333; line-height: 1.6; padding: 3px 0; width: 15px;">
                        &bull;
                      </td>
                      <td valign="top" width="95" style="font-family: Arial, sans-serif; font-size: 14px; color: #111111; font-weight: bold; line-height: 1.6; padding: 3px 0; width: 95px;">
                        Company:
                      </td>
                      <td valign="top" style="font-family: Arial, sans-serif; font-size: 14px; color: #333333; line-height: 1.6; padding: 3px 0;">
                        ${companyName}
                      </td>
                    </tr>
                    <tr>
                      <td valign="top" width="15" style="font-family: Arial, sans-serif; font-size: 14px; color: #333333; line-height: 1.6; padding: 3px 0; width: 15px;">
                        &bull;
                      </td>
                      <td valign="top" width="95" style="font-family: Arial, sans-serif; font-size: 14px; color: #111111; font-weight: bold; line-height: 1.6; padding: 3px 0; width: 95px;">
                        Status:
                      </td>
                      <td valign="top" style="font-family: Arial, sans-serif; font-size: 14px; color: #111111; font-weight: bold; line-height: 1.6; padding: 3px 0;">
                        Registration ${lStatus === "approved" || lStatus === "approval" ? `<span style="color: #593983;">Approved</span>` : (lStatus === "rejected" || lStatus === "rejection" ? `<span style="color: red;">Rejected</span>` : `<span style="color: #e6b800;">Pending</span>`)}
                      </td>
                    </tr>
                    ${visitorId ? `
                    <tr>
                      <td valign="top" width="15" style="font-family: Arial, sans-serif; font-size: 14px; color: #333333; line-height: 1.6; padding: 3px 0; width: 15px;">
                        &bull;
                      </td>
                      <td valign="top" width="95" style="font-family: Arial, sans-serif; font-size: 14px; color: #111111; font-weight: bold; line-height: 1.6; padding: 3px 0; width: 95px;">
                        Visitor ID:
                      </td>
                      <td valign="top" style="font-family: Arial, sans-serif; font-size: 14px; color: #333333; line-height: 1.6; padding: 3px 0;">
                        ${visitorId}
                      </td>
                    </tr>
                    ` : ""}
                  </table>
                  
                  <!-- Contact Information -->
                  <h3 style="color: #111111; font-size: 14px; font-weight: bold; margin-top: 0; margin-bottom: 10px;">
                    Contact Information:
                  </h3>
                  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="border-collapse: collapse; margin-bottom: 25px; width: 100%;">
                    <tr>
                      <td valign="top" width="15" style="font-family: Arial, sans-serif; font-size: 14px; color: #333333; line-height: 1.6; padding: 3px 0; width: 15px;">
                        &bull;
                      </td>
                      <td valign="top" width="115" style="font-family: Arial, sans-serif; font-size: 14px; color: #111111; font-weight: bold; line-height: 1.6; padding: 3px 0; width: 115px;">
                        Email Address:
                      </td>
                      <td valign="top" style="font-family: Arial, sans-serif; font-size: 14px; color: #333333; line-height: 1.6; padding: 3px 0; word-break: break-all;">
                        ${email}
                      </td>
                    </tr>
                    <tr>
                      <td valign="top" width="15" style="font-family: Arial, sans-serif; font-size: 14px; color: #333333; line-height: 1.6; padding: 3px 0; width: 15px;">
                        &bull;
                      </td>
                      <td valign="top" width="115" style="font-family: Arial, sans-serif; font-size: 14px; color: #111111; font-weight: bold; line-height: 1.6; padding: 3px 0; width: 115px;">
                        Mobile Number:
                      </td>
                      <td valign="top" style="font-family: Arial, sans-serif; font-size: 14px; color: #333333; line-height: 1.6; padding: 3px 0;">
                        ${mobileNumber}
                      </td>
                    </tr>
                    <tr>
                      <td valign="top" width="15" style="font-family: Arial, sans-serif; font-size: 14px; color: #333333; line-height: 1.6; padding: 3px 0; width: 15px;">
                        &bull;
                      </td>
                      <td valign="top" width="115" style="font-family: Arial, sans-serif; font-size: 14px; color: #111111; font-weight: bold; line-height: 1.6; padding: 3px 0; width: 115px;">
                        Designation:
                      </td>
                      <td valign="top" style="font-family: Arial, sans-serif; font-size: 14px; color: #333333; line-height: 1.6; padding: 3px 0;">
                        ${designation}
                      </td>
                    </tr>
                    <tr>
                      <td valign="top" width="15" style="font-family: Arial, sans-serif; font-size: 14px; color: #333333; line-height: 1.6; padding: 3px 0; width: 15px;">
                        &bull;
                      </td>
                      <td valign="top" width="115" style="font-family: Arial, sans-serif; font-size: 14px; color: #111111; font-weight: bold; line-height: 1.6; padding: 3px 0; width: 115px;">
                        Address:
                      </td>
                      <td valign="top" style="font-family: Arial, sans-serif; font-size: 14px; color: #333333; line-height: 1.6; padding: 3px 0;">
                        ${fullAddress}
                      </td>
                    </tr>
                    ${notes ? `
                    <tr>
                      <td valign="top" width="15" style="font-family: Arial, sans-serif; font-size: 14px; color: #333333; line-height: 1.6; padding: 3px 0; width: 15px;">
                        &bull;
                      </td>
                      <td valign="top" width="115" style="font-family: Arial, sans-serif; font-size: 14px; color: #111111; font-weight: bold; line-height: 1.6; padding: 3px 0; width: 115px;">
                        Comments:
                      </td>
                      <td valign="top" style="font-family: Arial, sans-serif; font-size: 14px; color: #333333; line-height: 1.6; padding: 3px 0;">
                        ${notes}
                      </td>
                    </tr>
                    ` : ""}
                  </table>
                  
                  <!-- QR Code (If Approved) -->
                  ${qrCid ? `
                  <div style="margin: 25px 0; text-align: center; padding: 20px; border: 1px solid #eeeeee; border-radius: 8px; background-color: #fafafa;">
                    <div style="color: #d2232a; font-size: 11px; margin-bottom: 12px; text-transform: uppercase; letter-spacing: 1px; font-weight: bold;">
                      Official Visitor QRCode
                    </div>
                    <img src="cid:${qrCid}" alt="QR Code" width="160" height="160" style="border: 1px solid #dddddd; padding: 5px; display: inline-block; background-color: #ffffff;" />
                    <div style="color: #555555; font-size: 13px; margin-top: 10px; font-weight: bold;">
                      Visitor ID: ${visitorId}
                    </div>
                  </div>
                  ` : ""}
                  
                  <!-- Support & Closing -->
                  <p style="margin-top: 25px; margin-bottom: 15px; font-size: 13px; color: #666666;">
                    If you have any questions or need support, feel free to contact us at <a href="mailto:events@taac.org.in" style="color: #d2232a; text-decoration: underline;">events@taac.org.in</a>.
                  </p>
                  
                  <p style="margin-top: 20px; margin-bottom: 5px; font-size: 13px; color: #666666;">
                    Thank you
                  </p>
                  <p style="margin-top: 0; margin-bottom: 15px; font-size: 14px; font-weight: bold; color: #111111;">
                    TEAM LTS2026
                  </p>
                </td>
              </tr>
              
              <!-- Sponsors Section -->
              <tr>
                <td class="sponsors-wrapper" style="padding: 20px 30px; background-color: #ffffff; border-top: 1px solid #eeeeee;">
                  <!--[if mso]>
                  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="width: 100%;">
                    <tr>
                      <td width="260" valign="top" style="width: 260px;">
                  <![endif]-->
                  <table class="col-stack" align="left" border="0" cellpadding="0" cellspacing="0" width="48%" style="border-collapse: collapse; width: 48%; max-width: 260px; border: 1px solid #eeeeee; border-radius: 8px; background-color: #fafafa;">
                    <tr>
                      <td align="center" style="padding: 15px; height: 100px; vertical-align: middle;">
                        <img src="cid:${EMAIL_IMG1_CID}" alt="Team LTS Sponsor" width="130" style="display: block; width: 100%; max-width: 130px; height: auto; border: 0; outline: none;" />
                      </td>
                    </tr>
                    <tr>
                      <td align="center" style="padding: 0 15px 15px 15px; font-family: Arial, sans-serif; font-size: 13px; font-weight: bold; color: #333333; text-transform: uppercase; letter-spacing: 0.5px;">
                        Team LTS
                      </td>
                    </tr>
                  </table>
                  <!--[if mso]>
                      </td>
                      <td width="20" style="width: 20px;">&nbsp;</td>
                      <td width="260" valign="top" style="width: 260px;">
                  <![endif]-->
                  <table class="col-stack" align="right" border="0" cellpadding="0" cellspacing="0" width="48%" style="border-collapse: collapse; width: 48%; max-width: 260px; border: 1px solid #eeeeee; border-radius: 8px; background-color: #fafafa;">
                    <tr>
                      <td align="center" style="padding: 15px; height: 100px; vertical-align: middle;">
                        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="width: 100%;">
                          <tr>
                            <td align="center" width="33%" style="width: 33%; padding: 0 3px; vertical-align: middle;">
                              <img src="cid:${EMAIL_IMG2_CID}" alt="Co-Sponsor 1" width="55" style="display: block; width: 100%; max-width: 55px; height: auto; border: 0; outline: none;" />
                            </td>
                            <td align="center" width="33%" style="width: 33%; padding: 0 3px; vertical-align: middle;">
                              <img src="cid:${EMAIL_IMG3_CID}" alt="Co-Sponsor 2" width="55" style="display: block; width: 100%; max-width: 55px; height: auto; border: 0; outline: none;" />
                            </td>
                            <td align="center" width="33%" style="width: 33%; padding: 0 3px; vertical-align: middle;">
                              <img src="cid:${EMAIL_IMG4_CID}" alt="Co-Sponsor 3" width="55" style="display: block; width: 100%; max-width: 55px; height: auto; border: 0; outline: none;" />
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                    <tr>
                      <td align="center" style="padding: 0 15px 15px 15px; font-family: Arial, sans-serif; font-size: 13px; font-weight: bold; color: #333333; text-transform: uppercase; letter-spacing: 0.5px;">
                        Co-Sponsors
                      </td>
                    </tr>
                  </table>
                  <!--[if mso]>
                      </td>
                    </tr>
                  </table>
                  <![endif]-->
                </td>
              </tr>
              
              <!-- Red Bottom Bar Accent -->
              <tr>
                <td style="background-color: #d2232a; height: 10px; font-size: 1px; line-height: 1px;">
                  &nbsp;
                </td>
              </tr>
              
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
};

const generateUniqueVisitorId = async (dbConnection) => {
  let attempts = 0;
  while (attempts < 100) {
    const randomNum = Math.floor(10000 + Math.random() * 90000); // 5-digit number
    const candidateId = `LTS26${randomNum}`;
    const exists = await new Promise((resolve, reject) => {
      dbConnection.query("SELECT id FROM visitors WHERE visitor_id = ?", [candidateId], (err, rows) => {
        if (err) reject(err);
        else resolve(rows.length > 0);
      });
    });
    if (!exists) {
      return candidateId;
    }
    attempts++;
  }
  throw new Error("Could not generate a unique visitor ID");
};

app.post("/api/upload-profile", upload.single("photo"), (req, res) => {
  try {
    const adminId = req.body.admin_id;
    if (!req.file) {
      return res.status(400).json({ message: "No image uploaded" });
    }
    const MAX_SIZE = 2 * 1024 * 1024;
    if (req.file.size > MAX_SIZE) {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ message: "Photo exceeds 2MB limit" });
    }
    if (!adminId) {
      return res.status(400).json({ message: "Admin ID is missing" });
    }
    const imagePath = `/uploads/${req.file.filename}`;
    db.query(
      "UPDATE admins SET profile_photo=? WHERE id=?",
      [imagePath, adminId],
      (err) => {
        if (err) {
          console.error("DB ERROR:", err);
          return res.status(500).json({ message: "Database error" });
        }
        return res.json({
          message: "Profile updated",
          profile_photo: imagePath,
        });
      }
    );
  } catch (err) {
    console.error("UPLOAD ERROR:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

app.post("/api/login", (req, res) => {
  const { email, password } = req.body;
  const ADMIN_EMAIL = "lts@gmail.com";
  const ADMIN_PASSWORD = "lts@2026";
  if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
    db.query("SELECT * FROM admins WHERE email = ?", [ADMIN_EMAIL], (err, rows) => {
      if (err) {
        return res.status(500).json({ message: "Database error" });
      }
      if (rows.length > 0) {
        const adminData = rows[0];
        return res.json({
          id: adminData.id,
          username: adminData.username || "Admin",
          email: adminData.email,
          profile_photo: adminData.profile_photo
        });
      } else {
        return res.status(404).json({ message: "Admin record not found in database" });
      }
    });
  } else {
    return res.status(401).json({ message: "Invalid email or password" });
  }
});

app.post('/api/upload-voucher', uploadVoucher.single('voucher'), (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No file uploaded.' });
  const protocol = req.protocol;
  const host = req.get('host');
  const fileUrl = `${protocol}://${host}/uploads/brochure/Golden-Travels.pdf`;
  res.status(200).json({ url: fileUrl });
});

app.get('/api/voucher-link', (req, res) => {
  const filePath = path.join(__dirname, "uploads", "brochure", "Golden-Travels.pdf");
  if (fs.existsSync(filePath)) {
    const protocol = req.protocol;
    const host = req.get('host');
    res.json({ url: `${protocol}://${host}/uploads/brochure/Golden-Travels.pdf` });
  } else {
    res.status(404).json({ message: "No voucher found" });
  }
});

const sponsorStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/sponsors/"),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname)
});
const sponsorUpload = multer({ storage: sponsorStorage });

const videoStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/videos/"),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const videoUpload = multer({ storage: videoStorage });

const mapStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/maps/"),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const mapUpload = multer({ storage: mapStorage });

app.get("/api/banner", (req, res) => {
  db.query("SELECT * FROM slides", (err, slidesResult) => {
    if (err) return res.status(500).json(err);
    db.query("SELECT * FROM event_info WHERE id=1", (err2, eventResult) => {
      if (err2) return res.status(500).json(err2);
      res.json({
        slides: slidesResult,
        eventInfo: eventResult[0] || {}
      });
    });
  });
});

app.post("/api/banner", upload.array('slides'), (req, res) => {
  const { title, location, date, time } = req.body;
  const updateEventSql = "UPDATE event_info SET title=?, location=?, date=?, time=? WHERE id=1";
  db.query(updateEventSql, [title, location, date, time], (err) => {
    if (err) return res.status(500).json({ error: "Database error updating info" });
    if (req.files && req.files.length > 0) {
      const slideValues = req.files.map(file => [
        `${process.env.REACT_APP_API_BASE_URL}/uploads/${file.filename}`
      ]);
      const insertSlidesSql = "INSERT INTO slides (image) VALUES ?";
      db.query(insertSlidesSql, [slideValues], (err2) => {
        if (err2) return res.status(500).json({ error: "Database error saving slides" });
        return res.json({ message: "Banner and images updated successfully" });
      });
    } else {
      res.json({ message: "Event info updated successfully" });
    }
  });
});

app.delete("/api/banner/:id", (req, res) => {
  const id = req.params.id;
  db.query("SELECT image FROM slides WHERE id=?", [id], (err, result) => {
    if (err) return res.status(500).json(err);
    if (result.length > 0) {
      const imageUrl = result[0].image;
      const fileName = path.basename(imageUrl);
      const filePath = path.join(__dirname, "uploads", fileName);
      if (fs.existsSync(filePath)) {
        fs.unlink(filePath, (err) => { if (err) console.log(err); });
      }
      db.query("DELETE FROM slides WHERE id=?", [id], (err2) => {
        if (err2) return res.status(500).json(err2);
        res.json({ message: "Image deleted" });
      });
    } else {
      res.status(404).json({ message: "Image not found" });
    }
  });
});

app.get("/api/video", (req, res) => {
  db.query("SELECT * FROM aboutpage_video LIMIT 1", (err, result) => {
    if (err) return res.status(500).json(err);
    if (result.length === 0) return res.json({ videoUrl: "" });
    res.json({
      videoUrl: `${process.env.REACT_APP_API_BASE_URL}/${result[0].video_url}`
    });
  });
});

app.post("/api/video", videoUpload.single("video"), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file uploaded" });
  const filePath = req.file.path;
  db.query("DELETE FROM aboutpage_video", (err) => {
    if (err) return res.status(500).json(err);
    db.query(
      "INSERT INTO aboutpage_video (video_url) VALUES (?)",
      [filePath],
      (err) => {
        if (err) return res.status(500).json(err);
        res.json({
          videoUrl: `${process.env.REACT_APP_API_BASE_URL}/${filePath}`
        });
      }
    );
  });
});

app.delete("/api/video", (req, res) => {
  db.query("SELECT * FROM aboutpage_video LIMIT 1", (err, result) => {
    if (err) return res.status(500).json(err);
    if (result.length > 0) {
      const filePath = path.join(__dirname, result[0].video_url);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      db.query("DELETE FROM aboutpage_video", () => res.json({ message: "Video deleted" }));
    } else {
      res.json({ message: "No video found" });
    }
  });
});

app.get("/api/map", (req, res) => {
  db.query("SELECT * FROM registerform_map LIMIT 1", (err, result) => {
    if (err) return res.status(500).json(err);
    if (result.length === 0) return res.json({ mapImageUrl: "" });
    res.json({ mapImageUrl: `${process.env.REACT_APP_API_BASE_URL}/${result[0].map_url}` });
  });
});

app.post("/api/map", mapUpload.single("map"), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file uploaded" });
  const filePath = req.file.path;
  db.query("SELECT * FROM registerform_map LIMIT 1", (err, result) => {
    if (err) return res.status(500).json(err);
    if (result.length > 0) {
      const oldPath = path.join(__dirname, result[0].map_url);
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      db.query("DELETE FROM registerform_map");
    }
    db.query("INSERT INTO registerform_map (map_url) VALUES (?)", [filePath], (err) => {
      if (err) return res.status(500).json(err);
      res.json({ mapImageUrl: `${process.env.REACT_APP_API_BASE_URL}/${filePath}` });
    });
  });
});

app.delete("/api/map", (req, res) => {
  db.query("SELECT * FROM registerform_map LIMIT 1", (err, result) => {
    if (err) return res.status(500).json(err);
    if (result.length > 0) {
      const filePath = path.join(__dirname, result[0].map_url);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      db.query("DELETE FROM registerform_map", () => res.json({ message: "Map deleted" }));
    } else {
      res.json({ message: "No map found" });
    }
  });
});

app.get("/api/sponsors/:type", (req, res) => {
  const { type } = req.params;
  db.query(
    "SELECT * FROM sponsor_images WHERE sponsor_type=? ORDER BY id DESC",
    [type],
    (err, result) => {
      if (err) return res.status(500).json(err);
      res.json({
        sponsors: result.map(row => ({
          id: row.id,
          imageUrl: `${process.env.REACT_APP_API_BASE_URL}/${row.image_url.replace(/\\/g, "/")}`
        }))
      });
    }
  );
});

app.post("/api/sponsors", sponsorUpload.array("images", 10), (req, res) => {
  const { type } = req.body;
  if (!req.files || req.files.length === 0)
    return res.status(400).json({ error: "No files uploaded" });
  const values = req.files.map(file => [file.path, type]);
  db.query(
    "INSERT INTO sponsor_images (image_url, sponsor_type) VALUES ?",
    [values],
    (err, result) => {
      if (err) return res.status(500).json(err);
      res.json({ message: "Sponsors uploaded", inserted: result.affectedRows });
    }
  );
});

app.delete("/api/sponsors/:id", (req, res) => {
  const { id } = req.params;
  db.query("DELETE FROM sponsor_images WHERE id=?", [id], (err, result) => {
    if (err) return res.status(500).json(err);
    res.json({ message: "Sponsor deleted successfully" });
  });
});

app.get("/api/registrations", (req, res) => {
  const sql = `
    SELECT r.*, 
           z.name AS zone_name, 
           s.stall_no
    FROM registrations r
    LEFT JOIN zones z ON r.zone = z.id
    LEFT JOIN stalls s ON r.stall = s.id
    ORDER BY r.id DESC
  `;
  db.query(sql, (err, result) => {
    if (err) {
      console.log("FETCH ERROR:", err);
      return res.status(500).json(err);
    }
    res.json(result);
  });
});

app.post("/api/register", async (req, res) => {
  const { name, company, mobile, email, gst, numberOfExhibitors, country, state, city, captcha, zone, stall, stallPrice, pincode, address1, address2 } = req.body;
  if (!captcha) {
    return res.status(400).json({ error: "Captcha is required" });
  }
  try {
    const verifyRes = await axios.post(
      "https://www.google.com/recaptcha/api/siteverify",
      null,
      {
        params: {
          secret: process.env.RECAPTCHA_SECRET_KEY,
          response: captcha,
        },
      }
    );
    if (!verifyRes.data.success) {
      const captchaErrorCodes = verifyRes.data["error-codes"] || [];
      console.log("CAPTCHA VERIFY FAILED:", captchaErrorCodes);
      return res.status(400).json({
        error: "Captcha verification failed",
        captchaErrors: captchaErrorCodes,
      });
    }
  } catch (err) {
    console.log("CAPTCHA VERIFY ERROR:", err.message);
    return res.status(500).json({ error: "Captcha verification error" });
  }
  const mobileCheckSql = `SELECT * FROM registrations WHERE mobile = ?`;
  db.query(mobileCheckSql, [mobile], (mobileErr, mobileResult) => {
    if (mobileErr) {
      return res.status(500).json({ error: "Mobile check error" });
    }
    if (mobileResult.length > 0) {
      return res.status(400).json({
        error: "Contact number is already registered"
      });
    }
    const checkSql = `SELECT * FROM registrations WHERE zone = ? AND stall = ? AND status = 'Confirmed'`;
    db.query(checkSql, [zone, stall], (checkErr, checkResult) => {
      if (checkErr) return res.status(500).json({ error: "Check error" });
      if (checkResult.length > 0) return res.status(400).json({ error: "Stall already booked" });
      const insertSql = `
      INSERT INTO registrations 
      (name, company, mobile, email, gst, numberOfExhibitors, country, state, city, zone, stall, stall_price, pincode, address1, address2, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Pending')
    `;
      const safePrice = stallPrice || 0;
      const safeAddress2 = address2 ? address2 : null;
      db.query(insertSql, [name, company, mobile, email, gst, numberOfExhibitors, country, state, city, zone, stall, safePrice, pincode, address1, safeAddress2], (err, result) => {
        if (err) return res.status(500).json({ error: "Database error" })
        const fetchSql = `
        SELECT z.name AS zone_name, s.stall_no
        FROM zones z
        LEFT JOIN stalls s ON s.id = ?
        WHERE z.id = ?
      `;
        db.query(fetchSql, [stall, zone], (err2, data) => {
          if (err2) return res.json({ message: "Saved (mail failed)" });
          const zoneName = data[0]?.zone_name || zone;
          const stallNo = data[0]?.stall_no || stall;
          db.query("SELECT setting_value FROM exhibitor_settings WHERE setting_key = 'event_title'", async (errSettings, settingResult) => {
            const currentEventTitle = settingResult[0]?.setting_value || "Our Event";
            try {
              await transporter.sendMail({
                from: process.env.EMAIL_USER,
                to: email,
                subject: `Registration Confirmation - ${currentEventTitle}`,
                html: `
                <style>
                  @media only screen and (max-width: 600px) {
                    .lts-register-shell { padding: 12px 0 !important; }
                    .lts-register-card { width: 100% !important; max-width: 100% !important; border-radius: 0 !important; }
                    .lts-register-header { padding: 24px 14px !important; }
                    .lts-register-body { padding: 22px 12px !important; }
                    .lts-register-copy { font-size: 14px !important; line-height: 1.7 !important; }
                    .lts-details-box { padding: 12px !important; margin: 22px 0 !important; }
                    .lts-detail-table td { font-size: 14px !important; word-break: break-word !important; }
                  }
                  @media only screen and (min-width: 601px) and (max-width: 900px) {
                    .lts-register-card { max-width: 560px !important; }
                    .lts-register-body { padding: 25px 18px !important; }
                  }
                </style>
                <div class="lts-register-shell" style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f9f9f9; padding: 20px 0; color: #333;"> <div class="lts-register-card" style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.05);">                 
                  <div class="lts-register-header" style="background-color: #512e8e; padding: 30px; text-align: center;">
                  ${emailLogoHtml(currentEventTitle, "color: #ffffff; margin: 0; font-size: 24px; letter-spacing: 1px; text-transform: uppercase; font-weight: bold; line-height: 1.2;")}
                    <div style="width: 50px; height: 2px; background: #ffffff; margin: 15px auto 0; opacity: 0.5;"></div>
                  </div>
                  <div class="lts-register-body" style="padding: 25px 15px; text-align: center;"> <p style="font-size: 18px; margin-bottom: 10px;">Hello <strong>${name}</strong>,</p>
                    <p class="lts-register-copy" style="color: #666; line-height: 1.6;">Thank you for your interest. We have received your stall registration request for <strong>${currentEventTitle}</strong> and it is currently <strong>under review</strong>.<br /><br />Your exhibitor profile and selected stall details have been recorded for the Luxury Travel Show event. Our team will review your company information, stall preference, and participation details to ensure the best possible event experience.</p>                   
                    <div class="lts-details-box" style="background: #fdfdff; border: 1px solid #eee; border-radius: 8px; padding: 15px; margin: 30px 0; text-align: left;"> <h3 style="color: #512e8e; font-size: 14px; margin: 0 0 20px 0; letter-spacing: 1.5px; text-transform: uppercase;">Reserved Details</h3>                   
                      <div style="margin-top: 20px;">
                      <table class="lts-detail-table" width="100%" style="border-collapse: collapse; margin-bottom: 15px; text-align: left; border: 1px solid #ddd; border-radius: 4px;">
                        <tr style="background: #f8f9fa;">
                          <td style="padding: 10px 12px; border-bottom: 1px solid #eee; font-weight: bold; font-size: 12px; color: #000000; text-transform: uppercase;">Exhibitor Company Name:</td>
                        </tr>
                        <tr>
                          <td style="padding: 12px; font-size: 15px;">${company}</td>
                        </tr>
                      </table>
                      <table class="lts-detail-table" width="100%" style="border-collapse: collapse; margin-bottom: 15px; text-align: left; border: 1px solid #ddd; border-radius: 4px;">
                        <tr style="background: #f8f9fa;">
                          <td style="padding: 10px 12px; border-bottom: 1px solid #eee; font-weight: bold; font-size: 12px; color: #000000; text-transform: uppercase;">No Of Exhibitors:</td>
                        </tr>
                        <tr>
                          <td style="padding: 12px; font-size: 15px;">${numberOfExhibitors}</td>
                        </tr>
                      </table>
                      <table class="lts-detail-table" width="100%" style="border-collapse: collapse; margin-bottom: 15px; text-align: left; border: 1px solid #ddd; border-radius: 4px;">
                        <tr style="background: #f8f9fa;">
                          <td style="padding: 10px 12px; border-bottom: 1px solid #eee; font-weight: bold; font-size: 12px; color: #000000; text-transform: uppercase;">Contact Person Name:</td>
                        </tr>
                        <tr>
                          <td style="padding: 12px; font-size: 15px;">${name}</td>
                        </tr>
                      </table>
                      <table class="lts-detail-table" width="100%" style="border-collapse: collapse; margin-bottom: 15px; text-align: left; border: 1px solid #ddd; border-radius: 4px;">
                        <tr style="background: #f8f9fa;">
                          <td style="padding: 10px 12px; border-bottom: 1px solid #eee; font-weight: bold; font-size: 12px; color: #000000; text-transform: uppercase;">Email Address:</td>
                        </tr>
                        <tr>
                          <td style="padding: 12px; font-size: 15px; color: #512e8e;">${email}</td>
                        </tr>
                      </table>
                      <table class="lts-detail-table" width="100%" style="border-collapse: collapse; margin-bottom: 15px; text-align: left; border: 1px solid #ddd; border-radius: 4px;">
                        <tr style="background: #f8f9fa;">
                          <td style="padding: 10px 12px; border-bottom: 1px solid #eee; font-weight: bold; font-size: 12px; color: #000000; text-transform: uppercase;">Mobile Number:</td>
                        </tr>
                        <tr>
                          <td style="padding: 12px; font-size: 15px;">${mobile}</td>
                        </tr>
                      </table>
                      <table class="lts-detail-table" width="100%" style="border-collapse: collapse; margin-bottom: 15px; text-align: left; border: 1px solid #ddd; border-radius: 4px;">
                        <tr style="background: #f8f9fa;">
                          <td style="padding: 10px 12px; border-bottom: 1px solid #eee; font-weight: bold; font-size: 12px; color: #000000; text-transform: uppercase;">Zone:</td>
                        </tr>
                        <tr>
                          <td style="padding: 12px; font-size: 15px;">${zoneName}</td>
                        </tr>
                      </table>
                      <table class="lts-detail-table" width="100%" style="border-collapse: collapse; margin-bottom: 15px; text-align: left; border: 1px solid #ddd; border-radius: 4px;">
                        <tr style="background: #f8f9fa;">
                          <td style="padding: 10px 12px; border-bottom: 1px solid #eee; font-weight: bold; font-size: 12px; color: #000000; text-transform: uppercase;">Stall Number:</td>
                        </tr>
                        <tr>
                          <td style="padding: 12px; font-size: 15px;">${stallNo}</td>
                        </tr>
                      </table>
                      <table class="lts-detail-table" width="100%" style="border-collapse: collapse; margin-bottom: 15px; text-align: left; border: 1px solid #ddd; border-radius: 4px;">
                        <tr style="background: #f8f9fa;">
                          <td style="padding: 10px 12px; border-bottom: 1px solid #eee; font-weight: bold; font-size: 12px; color: #000000; text-transform: uppercase;">GST Number:</td>
                        </tr>
                        <tr>
                          <td style="padding: 12px; font-size: 15px;">${gst || 'N/A'}</td>
                        </tr>
                      </table>
                      <table class="lts-detail-table" width="100%" style="border-collapse: collapse; margin-bottom: 15px; text-align: left; border: 1px solid #ddd; border-radius: 4px;">
                        <tr style="background: #f8f9fa;">
                          <td style="padding: 10px 12px; border-bottom: 1px solid #eee; font-weight: bold; font-size: 12px; color: #000000; text-transform: uppercase;">Country:</td>
                        </tr>
                        <tr>
                          <td style="padding: 12px; font-size: 15px;">${country}</td>
                        </tr>
                      </table>
                      <table class="lts-detail-table" width="100%" style="border-collapse: collapse; margin-bottom: 15px; text-align: left; border: 1px solid #ddd; border-radius: 4px;">
                        <tr style="background: #f8f9fa;">
                          <td style="padding: 10px 12px; border-bottom: 1px solid #eee; font-weight: bold; font-size: 12px; color: #000000; text-transform: uppercase;">State:</td>
                        </tr>
                        <tr>
                          <td style="padding: 12px; font-size: 15px;">${state}</td>
                        </tr>
                      </table>
                      <table class="lts-detail-table" width="100%" style="border-collapse: collapse; margin-bottom: 15px; text-align: left; border: 1px solid #ddd; border-radius: 4px;">
                        <tr style="background: #f8f9fa;">
                          <td style="padding: 10px 12px; border-bottom: 1px solid #eee; font-weight: bold; font-size: 12px; color: #000000; text-transform: uppercase;">City:</td>
                        </tr>
                        <tr>
                          <td style="padding: 12px; font-size: 15px;">${city}</td>
                        </tr>
                      </table>
                      <table class="lts-detail-table" width="100%" style="border-collapse: collapse; margin-bottom: 15px; text-align: left; border: 1px solid #ddd; border-radius: 4px;">
                        <tr style="background: #f8f9fa;">
                          <td style="padding: 10px 12px; border-bottom: 1px solid #eee; font-weight: bold; font-size: 12px; color: #000000; text-transform: uppercase;">Pincode:</td>
                        </tr>
                        <tr>
                          <td style="padding: 12px; font-size: 15px;">${pincode || 'N/A'}</td>
                        </tr>
                      </table>
                      <table class="lts-detail-table" width="100%" style="border-collapse: collapse; margin-bottom: 15px; text-align: left; border: 1px solid #ddd; border-radius: 4px;">
                        <tr style="background: #f8f9fa;">
                          <td style="padding: 10px 12px; border-bottom: 1px solid #eee; font-weight: bold; font-size: 12px; color: #000000; text-transform: uppercase;">Address Line 1:</td>
                        </tr>
                        <tr>
                          <td style="padding: 12px; font-size: 15px;">${address1 || 'N/A'}</td>
                        </tr>
                      </table>
                      <table width="100%" style="border-collapse: collapse; margin-bottom: 15px; text-align: left; border: 1px solid #ddd; border-radius: 4px;">
                        <tr style="background: #f8f9fa;">
                          <td style="padding: 10px 12px; border-bottom: 1px solid #eee; font-weight: bold; font-size: 12px; color: #000000; text-transform: uppercase;">Address Line 2 (Optional):</td>
                        </tr>
                        <tr>
                          <td style="padding: 12px; font-size: 15px;">${address2 || 'N/A'}</td>
                        </tr>
                      </table>
                    </div>
                    </div>                   
                    <p class="lts-register-copy" style="color: #222; font-size: 14px; line-height: 1.6;">Our coordination team will verify the details and contact you shortly for the next steps.</p>
                  </div>
                  <div style="background: #f4f4f4; padding: 20px; text-align: center; font-size: 12px; color: #999;">
                    &copy; ${new Date().getFullYear()} ${currentEventTitle} 
                  </div>
                </div>
              </div>
              `,
                attachments: withEmailLogo()
              });
              await transporter.sendMail({
                from: process.env.EMAIL_USER,
                to: process.env.ADMIN_EMAIL,
                subject: `New Registration - ${currentEventTitle}`,
                html: `
                <style>
                  @media only screen and (max-width: 600px) {
                    .exhibitor-admin-shell { padding: 15px 5px !important; }
                    .exhibitor-admin-card { width: 100% !important; max-width: 100% !important; border-radius: 0 !important; }
                    .exhibitor-admin-header { padding: 20px 10px !important; }
                    .exhibitor-admin-body { padding: 20px 10px !important; }
                    .exhibitor-admin-body table td { font-size: 13px !important; padding: 8px !important; }
                  }
                  @media only screen and (min-width: 601px) and (max-width: 900px) {
                    .exhibitor-admin-card { max-width: 500px !important; }
                    .exhibitor-admin-body { padding: 25px 20px !important; }
                  }
                </style>
                <div class="exhibitor-admin-shell" style="font-family: Arial, sans-serif; background-color: #f4f4f7; padding: 40px 10px; color: #1a1a1a;">
                  <div class="exhibitor-admin-card" style="max-width: 550px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 20px rgba(0,0,0,0.05); border: 1px solid #e0e0e0;">
                    <div class="exhibitor-admin-header" style="background-color: #512e8e; padding: 30px; text-align: center;">
                      ${emailLogoHtml("Admin Notification", "color: #ffffff; margin: 0; font-size: 22px; font-weight: bold; line-height: 1.2;")}
                    </div>
                    <div class="exhibitor-admin-body" style="padding: 30px;">
                      <p style="font-size: 16px; color: #444; text-align: center;">
                        New Registration Inquiry
                        <br /><br />
                        <strong>${currentEventTitle}</strong>:
                      </p>
                      <table width="100%" style="border-collapse: collapse; margin-bottom: 15px; text-align: left; border: 1px solid #ddd; border-radius: 4px;">
                        <tr style="background: #f8f9fa;">
                          <td style="padding: 10px 12px; border-bottom: 1px solid #eee; font-weight: bold; font-size: 12px; color: #000000; text-transform: uppercase;">Exhibitor Company Name:</td>
                        </tr>
                        <tr>
                          <td style="padding: 12px; font-size: 15px;">${company}</td>
                        </tr>
                      </table>
                      <table width="100%" style="border-collapse: collapse; margin-bottom: 15px; text-align: left; border: 1px solid #ddd; border-radius: 4px;">
                        <tr style="background: #f8f9fa;">
                          <td style="padding: 10px 12px; border-bottom: 1px solid #eee; font-weight: bold; font-size: 12px; color: #000000; text-transform: uppercase;">Number Of Exhibitors:</td>
                        </tr>
                        <tr>
                          <td style="padding: 12px; font-size: 15px;">${numberOfExhibitors}</td>
                        </tr>
                      </table>
                      <table width="100%" style="border-collapse: collapse; margin-bottom: 15px; text-align: left; border: 1px solid #ddd; border-radius: 4px;">
                        <tr style="background: #f8f9fa;">
                          <td style="padding: 10px 12px; border-bottom: 1px solid #eee; font-weight: bold; font-size: 12px; color: #000000; text-transform: uppercase;">Contact Person Name:</td>
                        </tr>
                        <tr>
                          <td style="padding: 12px; font-size: 15px;">${name}</td>
                        </tr>
                      </table>
                      <table width="100%" style="border-collapse: collapse; margin-bottom: 15px; text-align: left; border: 1px solid #ddd; border-radius: 4px;">
                        <tr style="background: #f8f9fa;">
                          <td style="padding: 10px 12px; border-bottom: 1px solid #eee; font-weight: bold; font-size: 12px; color: #000000; text-transform: uppercase;">Email Address:</td>
                        </tr>
                        <tr>
                          <td style="padding: 12px; font-size: 15px; color: #512e8e;">${email}</td>
                        </tr>
                      </table>
                      <table width="100%" style="border-collapse: collapse; margin-bottom: 15px; text-align: left; border: 1px solid #ddd; border-radius: 4px;">
                        <tr style="background: #f8f9fa;">
                          <td style="padding: 10px 12px; border-bottom: 1px solid #eee; font-weight: bold; font-size: 12px; color: #000000; text-transform: uppercase;">Mobile Number:</td>
                        </tr>
                        <tr>
                          <td style="padding: 12px; font-size: 15px;">${mobile}</td>
                        </tr>
                      </table>
                      <table width="100%" style="border-collapse: collapse; margin-bottom: 15px; text-align: left; border: 1px solid #ddd; border-radius: 4px;">
                        <tr style="background: #f8f9fa;">
                          <td style="padding: 10px 12px; border-bottom: 1px solid #eee; font-weight: bold; font-size: 12px; color: #000000; text-transform: uppercase;">Zone:</td>
                        </tr>
                        <tr>
                          <td style="padding: 12px; font-size: 15px;">${zoneName}</td>
                        </tr>
                      </table>
                      <table width="100%" style="border-collapse: collapse; margin-bottom: 15px; text-align: left; border: 1px solid #ddd; border-radius: 4px;">
                        <tr style="background: #f8f9fa;">
                          <td style="padding: 10px 12px; border-bottom: 1px solid #eee; font-weight: bold; font-size: 12px; color: #000000; text-transform: uppercase;">Stall Number:</td>
                        </tr>
                        <tr>
                          <td style="padding: 12px; font-size: 15px;">${stallNo}</td>
                        </tr>
                      </table>
                      <table width="100%" style="border-collapse: collapse; margin-bottom: 15px; text-align: left; border: 1px solid #ddd; border-radius: 4px;">
                        <tr style="background: #f8f9fa;">
                          <td style="padding: 10px 12px; border-bottom: 1px solid #eee; font-weight: bold; font-size: 12px; color: #000000; text-transform: uppercase;">GST Number:</td>
                        </tr>
                        <tr>
                          <td style="padding: 12px; font-size: 15px;">${gst || 'N/A'}</td>
                        </tr>
                      </table>
                      <table width="100%" style="border-collapse: collapse; margin-bottom: 15px; text-align: left; border: 1px solid #ddd; border-radius: 4px;">
                        <tr style="background: #f8f9fa;">
                          <td style="padding: 10px 12px; border-bottom: 1px solid #eee; font-weight: bold; font-size: 12px; color: #000000; text-transform: uppercase;">Country:</td>
                        </tr>
                        <tr>
                          <td style="padding: 12px; font-size: 15px;">${country}</td>
                        </tr>
                      </table>
                      <table width="100%" style="border-collapse: collapse; margin-bottom: 15px; text-align: left; border: 1px solid #ddd; border-radius: 4px;">
                        <tr style="background: #f8f9fa;">
                          <td style="padding: 10px 12px; border-bottom: 1px solid #eee; font-weight: bold; font-size: 12px; color: #000000; text-transform: uppercase;">State:</td>
                        </tr>
                        <tr>
                          <td style="padding: 12px; font-size: 15px;">${state}</td>
                        </tr>
                      </table>
                      <table width="100%" style="border-collapse: collapse; margin-bottom: 15px; text-align: left; border: 1px solid #ddd; border-radius: 4px;">
                        <tr style="background: #f8f9fa;">
                          <td style="padding: 10px 12px; border-bottom: 1px solid #eee; font-weight: bold; font-size: 12px; color: #000000; text-transform: uppercase;">City:</td>
                        </tr>
                        <tr>
                          <td style="padding: 12px; font-size: 15px;">${city}</td>
                        </tr>
                      </table>
                      <table width="100%" style="border-collapse: collapse; margin-bottom: 15px; text-align: left; border: 1px solid #ddd; border-radius: 4px;">
                        <tr style="background: #f8f9fa;">
                          <td style="padding: 10px 12px; border-bottom: 1px solid #eee; font-weight: bold; font-size: 12px; color: #000000; text-transform: uppercase;">Pincode:</td>
                        </tr>
                        <tr>
                          <td style="padding: 12px; font-size: 15px;">${pincode || 'N/A'}</td>
                        </tr>
                      </table>
                      <table width="100%" style="border-collapse: collapse; margin-bottom: 15px; text-align: left; border: 1px solid #ddd; border-radius: 4px;">
                        <tr style="background: #f8f9fa;">
                          <td style="padding: 10px 12px; border-bottom: 1px solid #eee; font-weight: bold; font-size: 12px; color: #000000; text-transform: uppercase;">Address Line 1:</td>
                        </tr>
                        <tr>
                          <td style="padding: 12px; font-size: 15px;">${address1 || 'N/A'}</td>
                        </tr>
                      </table>
                      <table width="100%" style="border-collapse: collapse; margin-bottom: 15px; text-align: left; border: 1px solid #ddd; border-radius: 4px;">
                        <tr style="background: #f8f9fa;">
                          <td style="padding: 10px 12px; border-bottom: 1px solid #eee; font-weight: bold; font-size: 12px; color: #000000; text-transform: uppercase;">Address Line 2: (Optional)</td>
                        </tr>
                        <tr>
                          <td style="padding: 12px; font-size: 15px;">${address2 || 'N/A'}</td>
                        </tr>
                      </table>
                    </div>
                    <div style="background: #f9f9f9; padding: 20px; text-align: center; border-top: 1px solid #eeeeee;">
                      <p style="margin: 0; font-size: 11px; color: #999;">Automated System | ${new Date().toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              `,
                attachments: withEmailLogo()
              });
              res.json({ message: "Registration successful & mail sent" });
            } catch (mailError) {
              console.log("MAIL ERROR:", mailError);
              res.json({ message: "Saved, but mail failed" });
            }
          });
        });
      });
    });
  });
});

app.get("/api/zones", (req, res) => {
  db.query("SELECT * FROM zones", (err, zones) => {
    if (err) return res.status(500).send(err);
    db.query("SELECT * FROM stalls", (err2, stalls) => {
      if (err2) return res.status(500).send(err2);
      db.query("SELECT zone, stall FROM registrations WHERE status='Confirmed'", (err3, regs) => {
        if (err3) return res.status(500).send(err3);
        // Create booked set
        const bookedSet = new Set(
          regs.map(r => `${r.zone}-${r.stall}`)
        );
        const result = zones.map(z => {
          const zoneStalls = stalls
            .filter(s => s.zone_id === z.id)
            .map(s => ({
              ...s,
              price: parseInt(s.price) || 0,
              isBooked: bookedSet.has(`${z.id}-${s.id}`)
            }));
          return {
            ...z,
            stalls: zoneStalls
          };
        });
        res.json(result);
      });
    });
  });
});

app.get("/admin/sections", (req, res) => {
  const sqlZones = "SELECT * FROM zones ORDER BY name ASC";
  const sqlStalls = "SELECT * FROM stalls ORDER BY stall_no ASC";
  db.query(sqlZones, (err, zones) => {
    if (err) return res.status(500).send(err);
    db.query(sqlStalls, (err2, stalls) => {
      if (err2) return res.status(500).send(err2);
      const result = zones.map((z) => ({
        ...z,
        stalls: stalls.filter((s) => s.zone_id === z.id),
      }));
      res.json(result);
    });
  });
});

app.post("/admin/add-section", (req, res) => {
  const { name } = req.body;
  const sql = "INSERT INTO zones (name) VALUES (?)";
  db.query(sql, [name], (err, result) => {
    if (err) return res.status(500).json(err);
    res.json({ message: "Zone added successfully", id: result.insertId });
  });
});

app.delete("/admin/delete-section/:id", (req, res) => {
  const { id } = req.params;
  const sql = "DELETE FROM zones WHERE id = ?";
  db.query(sql, [id], (err) => {
    if (err) return res.status(500).json(err);
    res.json({ message: "Zone deleted successfully" });
  });
});

app.post("/admin/add-stall", (req, res) => {
  const { sectionId, stall_no } = req.body;
  const sql = "INSERT INTO stalls (stall_no, zone_id) VALUES (?, ?)";
  db.query(sql, [stall_no, sectionId], (err, result) => {
    if (err) return res.status(500).json(err);
    res.json({ message: "Stall added successfully", id: result.insertId });
  });
});

app.delete("/admin/delete-stall/:id", (req, res) => {
  const { id } = req.params;
  const sql = "DELETE FROM stalls WHERE id = ?";
  db.query(sql, [id], (err) => {
    if (err) return res.status(500).json(err);
    res.json({ message: "Stall deleted successfully" });
  });
});

app.put("/api/update-stall-price/:id", (req, res) => {
  const { id } = req.params;
  const { price } = req.body;
  const sql = "UPDATE stalls SET price = ? WHERE id = ?";
  db.query(sql, [price, id], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Failed to update price" });
    }
    res.json({ message: "Price updated successfully" });
  });
});

app.get("/api/dashboard-stats", (req, res) => {
  const stats = {};
  db.query("SELECT COUNT(*) AS total FROM registrations", (err, result) => {
    if (err) return res.status(500).json(err);
    stats.totalRegistrations = result[0].total;
    db.query("SELECT COUNT(*) AS pending FROM registrations WHERE status='Pending'", (err2, result2) => {
      if (err2) return res.status(500).json(err2);
      stats.pendingRequests = result2[0].pending;
      db.query("SELECT COUNT(*) AS confirmed FROM registrations WHERE status='Confirmed'", (err3, result3) => {
        if (err3) return res.status(500).json(err3);
        stats.confirmedBookings = result3[0].confirmed;
        db.query("SELECT COUNT(*) AS totalStalls FROM stalls", (err4, result4) => {
          if (err4) return res.status(500).json(err4);
          const totalStalls = result4[0].totalStalls;
          db.query("SELECT COUNT(*) AS booked FROM registrations WHERE status='Confirmed'", (err5, result5) => {
            if (err5) return res.status(500).json(err5);
            stats.bookedStalls = result5[0].booked;
            stats.availableStalls = totalStalls - stats.bookedStalls;
            db.query("SELECT COUNT(*) AS totalVisitors FROM visitors", (err6, result6) => {
              if (err6) return res.status(500).json(err6);
              stats.totalVisitors = result6[0].totalVisitors;
              db.query("SELECT COUNT(*) AS approvedVisitors FROM visitors WHERE status='approved'", (errA, resultA) => {
                if (errA) return res.status(500).json(errA);
                stats.approvedVisitors = resultA[0].approvedVisitors;
                db.query("SELECT COUNT(*) AS pendingVisitors FROM visitors WHERE status='pending' OR status IS NULL", (errP, resultP) => {
                  if (errP) return res.status(500).json(errP);
                  stats.pendingVisitors = resultP[0].pendingVisitors;
                  db.query("SELECT COUNT(*) AS checkedInVisitors FROM visitors WHERE checked_in = 1", (err7, result7) => {
                    if (err7) return res.status(500).json(err7);
                    stats.checkedInVisitors = result7[0].checkedInVisitors;
                    db.query("SELECT COUNT(*) AS totalContacts FROM contact_enquiries", (err8, result8) => {
                      if (err8) return res.status(500).json(err8);
                      stats.totalContacts = result8[0].totalContacts;
                      return res.json(stats);
                    });
                  });
                });
              });
            });
          });
        });
      });
    });
  });
});

app.put("/api/confirm/:id", (req, res) => {
  const { id } = req.params;
  const { exhibitors = [] } = req.body;
  db.query("SELECT stall, zone FROM registrations WHERE id = ?", [id], (err, initialResult) => {
    if (err || !initialResult[0]) return res.status(500).json({ error: "Registration not found" });
    const { stall, zone } = initialResult[0];
    const waitingSql = "SELECT id FROM registrations WHERE stall = ? AND zone = ? AND waiting_list = 1 AND id != ?";
    db.query(waitingSql, [stall, zone, id], (wErr, waitingListRows) => {
      if (wErr) return res.status(500).json({ error: wErr });
      if (waitingListRows.length > 0) {
        return res.json({
          blocked: true,
          message: "This stall has an exhibitor in WAITING LIST. Reject them first."
        });
      }
      const updateSql = "UPDATE registrations SET status='Confirmed', waiting_list=0 WHERE id=?";
      db.query(updateSql, [id], async (err2) => {
        if (err2) return res.status(500).json({ error: err2 });
        try {
          await new Promise((resolve, reject) => {
            db.query(
              "DELETE FROM exhibitors WHERE registration_id = ?",
              [id],
              (err) => {
                if (err) return reject(err);
                resolve();
              }
            );
          });
          const insertExhibitors = () => {
            if (exhibitors.length === 0) return Promise.resolve();
            const values = exhibitors.map(e => [
              id,
              e.name,
              e.mobile,
              e.email,
              e.company
            ]);
            return new Promise((resolve, reject) => {
              db.query(
                "INSERT INTO exhibitors (registration_id, name, mobile, email, company) VALUES ?",
                [values],
                (err) => {
                  if (err) return reject(err);
                  resolve();
                }
              );
            });
          };
          const updateCount = () => {
            return new Promise((resolve, reject) => {
              db.query(
                "UPDATE registrations SET exhibitor_count = ? WHERE id = ?",
                [exhibitors.length, id],
                (err) => {
                  if (err) return reject(err);
                  resolve();
                }
              );
            });
          };
          const deleteOld = () => {
            return new Promise((resolve, reject) => {
              db.query(
                "DELETE FROM exhibitors WHERE registration_id = ?",
                [id],
                (err) => {
                  if (err) return reject(err);
                  resolve();
                }
              );
            });
          };
          await deleteOld();
          await insertExhibitors();
          await updateCount();
        } catch (e) {
          console.error("Exhibitor Save Error:", e);
          return res.status(500).json({ error: "Failed to save exhibitors" });
        }
        const freshDataSql = `
          SELECT r.*, z.name AS zone_name, 
          COALESCE(s.stall_no, r.stall) AS stall_no
          FROM registrations r
          LEFT JOIN zones z ON r.zone = z.id
          LEFT JOIN stalls s ON r.stall = s.id
          WHERE r.id = ?
        `;
        db.query(freshDataSql, [id], (err3, finalResult) => {
          const user = finalResult[0];
          if (err3 || !user || !user.email) {
            console.error("Data fetch error or missing email:", err3);
            return res.status(500).json({ error: "Could not retrieve user details for email" });
          }
          db.query("SELECT setting_value FROM exhibitor_settings WHERE setting_key = 'event_title'", async (errS, sRes) => {
            const currentEventTitle = sRes[0]?.setting_value || "Our Event";
            try {
              await transporter.sendMail({
                from: process.env.EMAIL_USER,
                to: user.email,
                subject: `Stall Booking Confirmed - ${currentEventTitle}`,
                html: `
                  <div style="font-family: 'Montserrat', sans-serif; background-color: #f4f4f4; padding: 20px;">
                    <div style="max-width: 600px; margin: auto; background: #fff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.1);">
                      <div style="background: #512e8e; color: #fff; padding: 20px; text-align: center;">
                        ${emailLogoHtml(currentEventTitle, "margin: 0; text-transform: uppercase; color: #ffffff; font-size: 22px; font-weight: bold; line-height: 1.2;")}
                      </div>
                      <div style="padding: 30px; text-align: center;">
                        <p style="font-size: 18px;">Congratulations <strong>${user.name}</strong>,</p>
                        <p>Your stall registration has been officially confirmed.</p>
                          <table width="100%" style="border-collapse: collapse; margin-top: 20px; text-align: left; border: 1px solid #ddd; border-radius: 4px;">
                            <tr style="background: #f8f9fa;">
                              <td style="padding: 10px 12px; border-bottom: 1px solid #eee; font-weight: bold; font-size: 13px; color: #000000; text-transform: uppercase;">Exhibitor Company Name:</td>
                            </tr>
                            <tr>
                              <td style="padding: 12px; font-size: 16px; color: #333;">${user.company}</td>
                            </tr>
                          </table>
                          <table width="100%" style="border-collapse: collapse; margin-top: 15px; text-align: left; border: 1px solid #ddd; border-radius: 4px;">
                            <tr style="background: #f8f9fa;">
                              <td style="padding: 10px 12px; border-bottom: 1px solid #eee; font-weight: bold; font-size: 13px; color: #000000; text-transform: uppercase;">Contact Person Name:</td>
                            </tr>
                            <tr>
                              <td style="padding: 12px; font-size: 16px; color: #333;">${user.name}</td>
                            </tr>
                          </table>
                          <table width="100%" style="border-collapse: collapse; margin-top: 15px; text-align: left; border: 1px solid #ddd; border-radius: 4px;">
                            <tr style="background: #f8f9fa;">
                              <td style="padding: 10px 12px; border-bottom: 1px solid #eee; font-weight: bold; font-size: 13px; color: #000000; text-transform: uppercase;">Zone:</td>
                            </tr>
                            <tr>
                              <td style="padding: 12px; font-size: 16px; color: #333;">${user.zone_name || 'Assigned'}</td>
                            </tr>
                          </table>
                          <table width="100%" style="border-collapse: collapse; margin-top: 15px; text-align: left; border: 1px solid #ddd; border-radius: 4px;">
                            <tr style="background: #f8f9fa;">
                              <td style="padding: 10px 12px; border-bottom: 1px solid #eee; font-weight: bold; font-size: 13px; color: #000000; text-transform: uppercase;">Stall Number:</td>
                            </tr>
                            <tr>
                              <td style="padding: 12px; font-size: 16px; color: #333;">${user.stall_no || 'Assigned'}</td>
                            </tr>
                          </table>
                        <p style="color: #666; font-size: 13px; margin-top: 20px;">
                          We looking forward to see you at event! <br/>
                          <span style="font-size: 10px; color: #eee;">&copy; ${new Date().getFullYear()} ${currentEventTitle}</span>
                        </p>
                      </div>
                    </div>
                  </div>
                `,
                attachments: withEmailLogo()
              });
              await transporter.sendMail({
                from: process.env.EMAIL_USER,
                to: process.env.ADMIN_EMAIL,
                subject: `EXHIBITOR CONFIRMED: ${user.company} - ${currentEventTitle}`,
                html: `
                  <div style="font-family: 'Montserrat', sans-serif; background-color: #f4f4f4; padding: 20px;">
                    <div style="max-width: 600px; margin: auto; background: #fff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.1);">
                      <div style="background: #512e8e; color: #fff; padding: 20px; text-align: center;">
                        ${emailLogoHtml(currentEventTitle, "margin: 0; text-transform: uppercase; color: #ffffff; font-size: 22px; font-weight: bold; line-height: 1.2;")}
                      </div>
                      <div style="padding: 30px; text-align: center;">
                        <p style="font-size: 18px;">Admin Notification</p>
                        <p>The registration for <strong>${user.company}</strong> has been confirmed by the system.</p>
                          <table width="100%" style="border-collapse: collapse; margin-top: 20px; text-align: left; border: 1px solid #ddd; border-radius: 4px;">
                            <tr style="background: #f8f9fa;">
                              <td style="padding: 10px 12px; border-bottom: 1px solid #eee; font-weight: bold; font-size: 13px; color: #000000; text-transform: uppercase;">Exhibitor Company Name:</td>
                            </tr>
                            <tr>
                              <td style="padding: 12px; font-size: 16px; color: #333;">${user.company}</td>
                            </tr>
                          </table>
                          <table width="100%" style="border-collapse: collapse; margin-top: 15px; text-align: left; border: 1px solid #ddd; border-radius: 4px;">
                            <tr style="background: #f8f9fa;">
                              <td style="padding: 10px 12px; border-bottom: 1px solid #eee; font-weight: bold; font-size: 13px; color: #000000; text-transform: uppercase;">Contact Person Name:</td>
                            </tr>
                            <tr>
                              <td style="padding: 12px; font-size: 16px; color: #333;">${user.name}</td>
                            </tr>
                          </table>
                          <table width="100%" style="border-collapse: collapse; margin-top: 15px; text-align: left; border: 1px solid #ddd; border-radius: 4px;">
                            <tr style="background: #f8f9fa;">
                              <td style="padding: 10px 12px; border-bottom: 1px solid #eee; font-weight: bold; font-size: 13px; color: #000000; text-transform: uppercase;">Zone:</td>
                            </tr>
                            <tr>
                              <td style="padding: 12px; font-size: 16px; color: #333;">${user.zone_name || 'Assigned'}</td>
                            </tr>
                          </table>
                          <table width="100%" style="border-collapse: collapse; margin-top: 15px; text-align: left; border: 1px solid #ddd; border-radius: 4px;">
                            <tr style="background: #f8f9fa;">
                              <td style="padding: 10px 12px; border-bottom: 1px solid #eee; font-weight: bold; font-size: 13px; color: #000000; text-transform: uppercase;">Stall Number:</td>
                            </tr>
                            <tr>
                              <td style="padding: 12px; font-size: 16px; color: #333;">${user.stall_no || 'Assigned'}</td>
                            </tr>
                          </table>
                      </div>
                    </div>
                  </div>
                `,
                attachments: withEmailLogo()
              });
              db.query("SELECT * FROM exhibitors WHERE registration_id = ?", [id], (err4, exhibitorsData) => {
                if (err4) {
                  console.error("Exhibitor fetch error:", err4);
                  return res.status(500).json({ error: "Failed to fetch exhibitors" });
                }
                user.exhibitors = exhibitorsData || [];
                res.status(200).json({
                  blocked: false,
                  message: "Confirmed + Data Saved",
                  data: user
                });
              }
              );
            } catch (mailErr) {
              console.error("Mail Error:", mailErr);
              db.query("SELECT * FROM exhibitors WHERE registration_id = ?", [id], (err4, exhibitorsData) => {
                user.exhibitors = exhibitorsData || [];
                res.status(200).json({
                  blocked: false,
                  message: "Confirmed but email failed",
                  data: user
                });
              });
            }
          });
        });
      });
    });
  });
});

app.post("/api/exhibitors/add/:id", (req, res) => {
  const { id } = req.params;
  const { exhibitors } = req.body;
  if (!exhibitors || !Array.isArray(exhibitors)) {
    return res.status(400).json({
      success: false,
      message: "Invalid exhibitors data",
    });
  }
  db.query(
    "DELETE FROM exhibitors WHERE registration_id = ?",
    [id],
    (err) => {
      if (err) return res.status(500).json(err);

      if (!exhibitors.length) {
        return res.json({ success: true });
      }
      const values = exhibitors.map((e) => [
        id,
        e.name,
        e.mobile,
        e.email,
        e.company,
      ]);
      db.query(
        "INSERT INTO exhibitors (registration_id, name, mobile, email, company) VALUES ?",
        [values],
        (err2) => {
          if (err2) return res.status(500).json(err2);
          db.query(
            "UPDATE registrations SET exhibitor_count = ? WHERE id = ?",
            [exhibitors.length, id],
            (err3) => {
              if (err3) return res.status(500).json(err3);
              res.json({
                success: true,
                message: "Exhibitors added successfully",
              });
            }
          );
        }
      );
    }
  );
});

app.get("/api/exhibitors/:id", (req, res) => {
  const { id } = req.params;
  db.query(
    "SELECT * FROM exhibitors WHERE registration_id = ?",
    [id],
    (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json([]);
      }
      res.json(result);
    }
  );
});

app.put("/api/exhibitors/update/:id", (req, res) => {
  const { id } = req.params;
  const { exhibitors } = req.body;
  db.query(
    "DELETE FROM exhibitors WHERE registration_id = ?",
    [id],
    (err) => {
      if (err) return res.status(500).json(err);
      if (!exhibitors.length) return res.json({ success: true });
      const values = exhibitors.map(e => [
        id,
        e.name,
        e.mobile,
        e.email,
        e.company
      ]);
      db.query(
        "INSERT INTO exhibitors (registration_id, name, mobile, email, company) VALUES ?",
        [values],
        (err2) => {
          if (err2) return res.status(500).json(err2);
          db.query(
            "UPDATE registrations SET exhibitor_count = ? WHERE id = ?",
            [exhibitors.length, id],
            (err3) => {
              if (err3) return res.status(500).json(err3);
              res.json({ success: true });
            }
          );
        }
      );
    }
  );
});

app.get("/api/generate-qr/:id", (req, res) => {
  const { id } = req.params;
  const sql = `
    SELECT r.*, z.name AS zone_name, 
    COALESCE(s.stall_no, r.stall) AS stall_no
    FROM registrations r
    LEFT JOIN zones z ON r.zone = z.id
    LEFT JOIN stalls s ON r.stall = s.id
    WHERE r.id = ?
  `;
  db.query(sql, [id], async (err, result) => {
    if (err || result.length === 0) {
      return res.status(500).json({ error: "Data not found" });
    }
    const user = result[0];
    if (user.status !== "Confirmed") {
      return res.status(400).json({ error: "Not confirmed yet" });
    }
    const qrData = `
      Exhibitor ID: ${user.id}
      Name: ${user.name}
      Company: ${user.company}
      Zone: ${user.zone_name}
      Stall: ${user.stall_no}
    `;
    const fileName = `qr_${user.id}.png`;
    const filePath = path.join(__dirname, "uploads/qrcodes", fileName);
    try {
      if (!fs.existsSync("uploads/qrcodes")) {
        fs.mkdirSync("uploads/qrcodes", { recursive: true });
      }
      await QRCode.toFile(filePath, qrData);
      db.query(
        "UPDATE registrations SET qr_code = ? WHERE id = ?",
        [fileName, id]
      );
      res.json({
        message: "QR Generated",
        file: fileName
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "QR generation failed" });
    }
  });
});

app.put("/api/reject/:id", (req, res) => {
  const { id } = req.params;
  const { reason } = req.body;
  const getSql = `
    SELECT r.*, s.stall_no, z.name AS zone_name
    FROM registrations r
    LEFT JOIN stalls s ON r.stall = s.id
    LEFT JOIN zones z ON r.zone = z.id
    WHERE r.id=?
  `;
  db.query(getSql, [id], (err, result) => {
    if (err) return res.status(500).json(err);
    const user = result[0];
    if (!user) return res.status(404).json({ message: "User not found" });
    const updateSql = "UPDATE registrations SET status='Rejected', waiting_list=0 WHERE id=?";
    db.query(updateSql, [id], (err2) => {
      if (err2) return res.status(500).json(err2);
      db.query("SELECT setting_value FROM exhibitor_settings WHERE setting_key = 'event_title'", async (errS, sRes) => {
        const currentEventTitle = sRes && sRes[0] ? sRes[0].setting_value : "Luxury Travel Expo";
        try {
          await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: user.email,
            subject: `Update Regarding Your Registration | ${currentEventTitle}`,
            html: `
              <div style="background-color: #f8f9fa; padding: 50px 0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #333;">
                <table align="center" border="0" cellpadding="0" cellspacing="0" width="600" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.08);">           
                  <tr>
                    <td align="center" style="background-color: #6a0dad; padding: 40px 20px;">
                     ${emailLogoHtml(currentEventTitle, "color: #ffffff; margin: 0; font-size: 22px; letter-spacing: 2px; text-transform: uppercase; font-weight: 300; line-height: 1.2;")}
                      <div style="width: 50px; height: 2px; background-color: #ffffff; margin-top: 15px; opacity: 0.5;"></div>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 50px 40px;">
                      <p style="font-size: 16px; line-height: 1.6; color: #1a1a1a;">Dear <strong>${user.name}</strong>,</p>                  
                      <p style="font-size: 16px; line-height: 1.8; color: #555;">
                        Thank you for applying to be a part of the <strong>${currentEventTitle}</strong>. Our team has carefully reviewed your registration and company.
                      </p>               
                      <p style="font-size: 16px; line-height: 1.8; color: #555;">
                        Due to the exclusive nature of this year's event and limited floor capacity, we are unable to approve your registration at this time.
                      </p>                
                      <p style="margin: 0 0 8px 0; font-size: 20px; color: #6a0dad; text-transform: uppercase; font-weight: 800; letter-spacing: 2px; display: block;">
                        Status Note:
                      </p>
                      <table width="100%" style="margin-top: 20px; text-align: left;">
                        <tr style="background: #f8f9fa;">
                          <td style="font-weight: bold; font-size: 13px; color: #000000; text-transform: uppercase;">
                            Zone:  ${user.zone_name || 'N/A'}
                          </td>
                        </tr>
                      </table>
                      <table width="100%" style="margin-top: 15px; text-align: left;">
                        <tr style="background: #f8f9fa;">
                          <td style="font-weight: bold; font-size: 13px; color: #000000; text-transform: uppercase;">
                            Stall Number: ${user.stall_no || 'N/A'}
                          </td>
                        </tr> 
                      </table> 
                      <p style="margin-top: 5px; font-size: 18px; line-height: 1.5; color: #222; font-weight: 400;">
                        "${reason || 'Current exhibition criteria not met for this cycle.'}"
                      </p>
                      <p style="font-size: 15px; line-height: 1.6; color: #777;">
                        Your information will remain in our database and we will reach out when suitable opening arise in future.
                      </p>
                      <p style="font-size: 16px; line-height: 1.6; color: #1a1a1a; margin-top: 40px;">
                        Sincerely,<br>
                        <span style="color: #222; font-weight: bold;">The Exhibition Director</span><br>
                        ${currentEventTitle}
                      </p>
                    </td>
                  </tr>
                  <tr>
                    <td style="background: #f4f4f4; padding: 20px; text-align: center; font-size: 12px; color: #999;"> &copy; ${new Date().getFullYear()} ${currentEventTitle}</td>
                  </tr>
                </table>
              </div>
            `,
            attachments: withEmailLogo()
          });
          await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: process.env.ADMIN_EMAIL,
            subject: `Exhibitor Rejection Logged - ${currentEventTitle}`,
            html: `
              <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; border: 1px solid #ddd; border-radius: 8px; overflow: hidden;">
                <div style="background-color: #f8f9fa; padding: 20px; border-bottom: 2px solid #d4af37;">
                  ${emailLogoHtml("Rejection Confirmation", "margin: 0; color: #333; text-align: left; font-size: 18px; font-weight: bold; line-height: 1.2;")}
                  <p style="margin: 5px 0 0; font-size: 14px; color: #666; text-align: center;"><strong>${currentEventTitle}</strong></p>
                </div>
                <div style="padding: 20px;">
                  <p>The following exhibitor registration has been rejected:</p>
                  <table width="100%" style="border-collapse: collapse; margin-top: 15px; border: 1px solid #ddd;">
                    <tr>
                      <td style="padding: 12px; border-bottom: 1px solid #ddd; border-right: 1px solid #ddd; background-color: #f9f9f9; font-weight: bold; width: 35%;">Name</td>
                      <td style="padding: 12px; border-bottom: 1px solid #ddd;">${user.name}</td>
                    </tr>
                    <tr>
                      <td style="padding: 12px; border-bottom: 1px solid #ddd; border-right: 1px solid #ddd; background-color: #f9f9f9; font-weight: bold;">Company</td>
                      <td style="padding: 12px; border-bottom: 1px solid #ddd;">${user.company}</td>
                    </tr>
                    <tr>
                      <td style="padding: 12px; border-bottom: 1px solid #ddd; border-right: 1px solid #ddd; background-color: #f9f9f9; font-weight: bold;">Zone</td>
                      <td style="padding: 12px; border-bottom: 1px solid #ddd;">${user.zone_name}</td>
                    </tr>
                    <tr>
                      <td style="padding: 12px; border-bottom: 1px solid #ddd; border-right: 1px solid #ddd; background-color: #f9f9f9; font-weight: bold;">Stall</td>
                      <td style="padding: 12px; border-bottom: 1px solid #ddd;">${user.stall_no}</td>
                    </tr>
                    <tr>
                      <td style="padding: 12px; border-right: 1px solid #ddd; background-color: #f9f9f9; font-weight: bold;">Reason</td>
                      <td style="padding: 12px; color: #d9534f; font-weight: bold;">${reason}</td>
                    </tr>
                  </table>
                </div>
              </div>
            `,
            attachments: withEmailLogo()
          });
          res.json({ message: "Rejected + Mail Sent" });
        } catch (mailErr) {
          console.error("Mail Error:", mailErr);
          res.json({ message: "Rejected but mail failed" });
        }
      });
    });
  });
});

app.put("/api/waiting-list/:id", (req, res) => {
  const { id } = req.params;
  const sql = "UPDATE registrations SET status='Waiting', waiting_list=1 WHERE id=?";
  db.query(sql, [id], (err) => {
    if (err) return res.status(500).json(err);
    res.json({ id, status: "Waiting", message: "User freezed in waiting list" });
  });
});

app.delete("/api/delete-registration/:id", (req, res) => {
  const { id } = req.params;
  const sql = "DELETE FROM registrations WHERE id=?";
  db.query(sql, [id], (err) => {
    if (err) return res.status(500).json(err);
    res.json({ message: "Registration deleted successfully" });
  });
});

app.put("/api/save-notes/:id", (req, res) => {
  const { id } = req.params;
  const { notes } = req.body;
  const sql = "UPDATE registrations SET notes=? WHERE id=?";
  db.query(sql, [notes, id], (err) => {
    if (err) return res.status(500).json(err);
    res.json({ message: "Notes saved successfully" });
  });
});

app.get("/admin/stall-data", (req, res) => {
  const sql = `
    SELECT 
      s.id,
      s.stall_no,
      s.size,
      s.status,
      z.name AS zone_name,
      r.company
    FROM stalls s
    LEFT JOIN zones z ON s.zone_id = z.id
    LEFT JOIN registrations r 
      ON r.stall = s.id AND r.status='Confirmed'
    ORDER BY z.name, s.stall_no
  `;
  db.query(sql, (err, result) => {
    if (err) return res.status(500).json(err);
    res.json(result);
  });
});

app.put("/admin/update-stall-status/:id", (req, res) => {
  const { status } = req.body;
  db.query(
    "UPDATE stalls SET status=? WHERE id=?",
    [status, req.params.id],
    (err) => {
      if (err) return res.status(500).json(err);
      res.json({ message: "Status updated" });
    }
  );
});

app.put("/admin/release-stall/:id", (req, res) => {
  const stallId = req.params.id;
  const sql = "UPDATE stalls SET status = 'Available' WHERE id = ?";
  db.query(sql, [stallId], (err) => {
    if (err) return res.status(500).json(err);
    res.json({ message: "Stall released and set to Available" });
  });
});

app.put("/admin/update-stall-size/:id", (req, res) => {
  const { size } = req.body;
  const { id } = req.params;
  const sql = "UPDATE stalls SET size=? WHERE id=?";
  db.query(sql, [size, id], (err, result) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json(err);
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Stall not found" });
    }
    res.json({ message: "Size updated successfully" });
  });
});

app.put("/api/destination-text", (req, res) => {
  const { paragraph } = req.body;
  if (!paragraph) {
    return res.status(400).json({ message: "Paragraph is required" });
  }
  const sql = "UPDATE destination_text SET paragraph = ? WHERE id = 1";
  db.query(sql, [paragraph], (err, result) => {
    if (err) {
      console.error("MySQL ERROR:", err);
      return res.status(500).json({ message: "Database error" });
    }
    return res.json({ message: "Paragraph updated successfully" });
  });
});

app.get("/api/destination-text", (req, res) => {
  db.query(
    "SELECT paragraph FROM destination_text WHERE id = 1",
    (err, result) => {
      if (err) {
        console.error(err);
        return res.json({ paragraph: "" });
      }
      if (!result || result.length === 0) {
        return res.json({ paragraph: "" });
      }
      res.json(result[0]);
    }
  );
});

app.put("/api/destination-text", (req, res) => {
  const { paragraph } = req.body;
  if (!paragraph) {
    return res.status(400).json({ message: "Paragraph is required" });
  }
  const sql = "UPDATE destination_text SET paragraph = ? WHERE id = 1";
  db.query(sql, [paragraph], (err, result) => {
    if (err) {
      console.error("MySQL ERROR:", err);
      return res.status(500).json({ message: "Database error" });
    }
    return res.json({ message: "Paragraph updated successfully" });
  });
});

app.post("/api/destinations", upload.single("image"), (req, res) => {
  const { title, description } = req.body;
  const image = req.file.filename;
  db.query(
    "INSERT INTO destinations (title, description, image) VALUES (?, ?, ?)",
    [title, description, image],
    (err, result) => {
      if (err) return res.status(500).json(err);
      res.json({ message: "Destination uploaded successfully" });
    }
  );
});

app.get("/api/destinations", (req, res) => {
  db.query("SELECT * FROM destinations", (err, results) => {
    if (err) return res.status(500).json(err);
    res.json(results);
  });
});

app.post(
  "/api/destination-images",
  upload.array("images", 10),
  (req, res) => {
    const files = req.files;
    const descriptions = JSON.parse(req.body.descriptions || "[]"); // <<< NEW
    if (!files || files.length === 0) {
      return res.status(400).json({ message: "No images uploaded" });
    }
    const values = files.map((file, index) => [
      file.filename,
      descriptions[index] || null,
    ]);
    db.query(
      "INSERT INTO destination_images (image_url, description) VALUES ?",
      [values],
      (err) => {
        if (err) {
          console.error("DB INSERT ERROR:", err);
          return res.status(500).json({ message: "Database error" });
        }
        res.json({ message: "Images uploaded successfully" });
      }
    );
  }
);

app.get("/api/destination-images", (req, res) => {
  db.query("SELECT * FROM destination_images", (err, rows) => {
    if (err) return res.status(500).json(err);
    const formatted = rows.map((row) => ({
      id: row.id,
      image_url: "/uploads/" + row.image_url,
      description: row.description,
    }));
    res.json(formatted);
  });
});

app.put("/api/destination-images/:id", (req, res) => {
  const { id } = req.params;
  const { description } = req.body;
  db.query(
    "UPDATE destination_images SET description = ? WHERE id = ?",
    [description, id],
    (err) => {
      if (err) return res.status(500).json({ message: "Database error" });
      res.json({ message: "Description updated successfully" });
    }
  );
});

app.delete("/api/destination-images/:id", (req, res) => {
  const { id } = req.params;
  db.query(
    "SELECT image_url FROM destination_images WHERE id = ?",
    [id],
    (err, result) => {
      if (err) return res.status(500).json({ message: "Database error" });
      if (result.length === 0) return res.status(404).json({ message: "Image not found" });
      const imagePath = path.join(__dirname, "uploads", result[0].image_url);
      db.query("DELETE FROM destination_images WHERE id = ?", [id], (err2) => {
        if (err2) return res.status(500).json({ message: "Database delete error" });
        fs.unlink(imagePath, (unlinkErr) => {
          if (unlinkErr) console.error("File delete error:", unlinkErr);
        });
        res.json({ message: "Image deleted successfully" });
      });
    }
  );
});

app.get("/api/uploads/list", (req, res) => {
  const uploadPath = path.join(__dirname, "uploads");
  fs.readdir(uploadPath, (err, files) => {
    if (err) return res.status(500).json({ message: "Error reading folder" });
    // Only allow images
    const imageFiles = files.filter(file =>
      /\.(jpg|jpeg|png|webp|gif)$/i.test(file)
    );
    res.json(imageFiles);
  });
});

app.get('/api/contact', (req, res) => {
  const query = "SELECT * FROM contact_enquiries ORDER BY created_at DESC";
  db.query(query, (err, results) => {
    if (err) {
      console.error("Fetch Error:", err);
      return res.status(500).json({ message: "Database error" });
    }
    res.json(results);
  });
});

app.post('/api/visitors/register', visitorUpload.single("file"), async (req, res) => {
  const { firstName, lastName, companyName, mobileNumber, designation, email, visitorType, country, state, city, pincode, address1, address2, recaptchaToken } = req.body;
  const filePath = req.file ? req.file.path : null;
  const fileName = req.file ? req.file.filename : null;

  if (!recaptchaToken) {
    return res.status(400).json({ error: "Please verify that you are not a robot." });
  }

  try {
    const verifyUrl = `https://www.google.com/recaptcha/api/siteverify`;
    const response = await axios.post(
      verifyUrl,
      new URLSearchParams({
        secret: process.env.RECAPTCHA_SECRET_KEY,
        response: recaptchaToken
      }).toString(),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );

    if (!response.data.success) {
      return res.status(400).json({ error: "reCAPTCHA verification failed." });
    }
  } catch (verifyError) {
    console.error("reCAPTCHA Verification Error:", verifyError);
    return res.status(500).json({ error: "Failed to verify reCAPTCHA. Please try again." });
  }

  db.query("SELECT * FROM visitor_settings WHERE id = 1", (err, settingsResult) => {
    if (err || settingsResult.length === 0) {
      return res.status(500).json({
        error: "Event configuration missing. Please contact Admin to set Event Title, Venue, and Time."
      });
    }
    const settings = settingsResult[0];
    const checkMobileSql = `SELECT id FROM visitors WHERE mobile_number = ?`;
    db.query(checkMobileSql, [mobileNumber], (checkErr, checkResult) => {
      if (checkErr) {
        return res.status(500).json({ error: checkErr.message });
      }
      if (checkResult.length > 0) {
        return res.status(400).json({
          error: "Mobile Number is already registered"
        });
      }
      const sql = `INSERT INTO visitors (first_name, last_name, email, mobile_number, company_name, designation, visitor_type, country, state, city, pincode, address1, address2, file_path, file_name) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
      db.query(sql, [firstName, lastName, email, mobileNumber, companyName, designation, visitorType, country, state, city, pincode, address1, address2, filePath, fileName || null],
        (err, result) => {
          if (err) return res.status(500).json({ error: err.message });
          const visitor = {
            first_name: firstName,
            last_name: lastName,
            company_name: companyName,
            email: email,
            mobile_number: mobileNumber,
            designation: designation,
            visitor_type: visitorType,
            country: country,
            state: state,
            city: city,
            pincode: pincode,
            address1: address1,
            address2: address2
          };
          const visitorEmailContent = buildVisitorEmailHtml(visitor, false, "Pending");
          const adminEmailContent = buildVisitorEmailHtml(visitor, true, "Pending");

          const visitorMailOptions = {
            from: `"${settings.event_title}" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: `LTS 2026 Visitor Registration - Received`,
            html: visitorEmailContent,
            attachments: getEmailAttachments()
          };
          const adminMailOptions = {
            from: `"System Alert" <${process.env.EMAIL_USER}>`,
            to: process.env.ADMIN_EMAIL,
            subject: `LTS 2026 Visitor Registration - Received`,
            html: adminEmailContent,
            attachments: getEmailAttachments()
          };
          res.status(201).json({ message: "Success", id: result.insertId });
          transporter.sendMail(visitorMailOptions, (vError) => {
            if (vError) {
              console.error("Visitor email failed to send in background:", vError);
            }
            transporter.sendMail(adminMailOptions, (aError) => {
              if (aError) {
                console.error("Admin email failed to send in background:", aError);
              }
            });
          });
        });
    });
  });
});

app.get('/api/visitors/registrations', (req, res) => {
  db.query("SELECT * FROM visitors ORDER BY id DESC", (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

app.put('/api/visitors/status/:id', (req, res) => {
  const { status, notes } = req.body;
  const visitorId = req.params.id;
  const getVisitorQuery = "SELECT * FROM visitors WHERE id = ?";
  db.query(getVisitorQuery, [visitorId], (err, result) => {
    if (err || result.length === 0) {
      return res.status(500).json({ error: "Visitor not found" });
    }
    const visitor = result[0];
    db.query("SELECT * FROM visitor_settings WHERE id = 1", async (settingsErr, settingsResult) => {
      if (settingsErr || settingsResult.length === 0) {
        return res.status(500).json({
          error: "Event configuration missing. Please contact Admin to set Event Title, Venue, and Time."
        });
      }
      const settings = settingsResult[0];

      let finalVisitorId = visitor.visitor_id;
      if (status === "approved" && !finalVisitorId) {
        try {
          finalVisitorId = await generateUniqueVisitorId(db);
        } catch (genErr) {
          console.error("Visitor ID generation error:", genErr);
          return res.status(500).json({ error: "Failed to generate unique visitor ID" });
        }
      }

      const updateQuery = "UPDATE visitors SET status = ?, visitor_id = ? WHERE id = ?";
      db.query(updateQuery, [status, finalVisitorId || null, visitorId], async (updateErr) => {
        if (updateErr) {
          console.error("UPDATE ERROR:", updateErr);
          return res.status(500).json({ error: updateErr.message });
        }

        let qrFileName = null;
        let qrFilePath = null;
        if (status === "approved") {
          const qrData = `https://luxurytravelshow.in/api/scan-qr/${visitor.id}`;
          qrFileName = `visitor_${visitor.id}.png`;
          qrFilePath = path.join(__dirname, "qrcodes", qrFileName);
          if (!fs.existsSync(path.join(__dirname, "qrcodes"))) {
            fs.mkdirSync(path.join(__dirname, "qrcodes"));
          }
          try {
            await QRCode.toFile(qrFilePath, qrData);
            await new Promise((resolve, reject) => {
              db.query(
                "UPDATE visitors SET qr_code = ? WHERE id = ?",
                [qrFileName, visitorId],
                (dbErr) => {
                  if (dbErr) reject(dbErr);
                  else resolve();
                }
              );
            });
          } catch (qrError) {
            console.error("QR Processing Error:", qrError);
          }
        }

        const displayStatus = status === "approved" ? "Approved" : (status === "rejected" ? "Rejected" : "Pending");
        const subject = `LTS 2026 Visitor Registration - ${displayStatus}`;
        const fullName = `${visitor.first_name} ${visitor.last_name}`.trim();

        const updatedVisitor = {
          ...visitor,
          status: status,
          visitor_id: finalVisitorId || visitor.visitor_id,
          qr_code: qrFileName || visitor.qr_code
        };

        const visitorEmailContent = buildVisitorEmailHtml(updatedVisitor, false, displayStatus, qrFileName ? "visitorqr" : null, notes, finalVisitorId);
        const adminEmailContent = buildVisitorEmailHtml(updatedVisitor, true, displayStatus, qrFileName ? "visitorqr" : null, notes, finalVisitorId);

        const qrAttachment = qrFileName ? {
          filename: qrFileName,
          path: qrFilePath,
          cid: 'visitorqr'
        } : null;

        const mailOptions = {
          from: `"${settings.event_title}" <${process.env.EMAIL_USER}>`,
          to: visitor.email,
          subject,
          html: visitorEmailContent,
          attachments: getEmailAttachments(qrAttachment)
        };
        const adminMailOptions = {
          from: `"System Alert" <${process.env.EMAIL_USER}>`,
          to: process.env.ADMIN_EMAIL,
          subject,
          html: adminEmailContent,
          attachments: getEmailAttachments(qrAttachment)
        };

        if (status !== "waiting list") {
          // Send emails in background safely
          try {
            transporter.sendMail(mailOptions, (error) => {
              if (error) console.error("MAIL ERROR (visitor):", error);
            });
          } catch (mailErr) {
            console.error("Transporter sendMail (visitor) crashed synchronously:", mailErr);
          }
          try {
            transporter.sendMail(adminMailOptions, (adminError) => {
              if (adminError) console.error("MAIL ERROR (admin):", adminError);
            });
          } catch (adminMailErr) {
            console.error("Transporter sendMail (admin) crashed synchronously:", adminMailErr);
          }
        }

        db.query(
          "SELECT qr_code FROM visitors WHERE id = ?",
          [visitorId],
          (errSelect, rows) => {
            if (errSelect) {
              return res.status(500).json({ error: "DB error" });
            }
            return res.json({
              message: `Visitor ${status}`,
              qr_code: qrFileName || null
            });
          }
        );
      });
    });
  });
});


app.delete('/api/visitors/:id', (req, res) => {
  const visitorId = req.params.id;
  db.query("DELETE FROM visitors WHERE id = ?", [visitorId], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Visitor deleted successfully" });
  });
});

app.get("/qr-scanner", (req, res) => {
  res.set({
    "Cache-Control": "no-store, no-cache, must-revalidate, private",
    "Pragma": "no-cache",
    "Expires": "0"
  });
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <title>Luxury Travel Show | Entry Management</title>
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">
      <script src="https://unpkg.com/html5-qrcode"></script>
      <style>
        :root {
          --primary-gold: #c5a059;
          --deep-purple: #4a2c6a;
          --bg-soft: #f8f9fb;
          --glass: rgba(255, 255, 255, 0.85);
          --shadow: 0 15px 35px rgba(0,0,0,0.05);
        }

        body {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          background-color: var(--bg-soft);
          margin: 0;
          padding: 20px;
          color: #2d3436;
          display: flex;
          flex-direction: column;
          align-items: center;
          min-height: 100vh;
        }

        .header-brand {
          margin-bottom: 30px;
          text-align: center;
        }

        #expoTitle {
          font-size: 24px;
          font-weight: 800;
          letter-spacing: -0.5px;
          background: linear-gradient(135deg, #4a2c6a 0%, #c5a059 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          text-transform: uppercase;
        }

        .stats-container {
          width: 100%;
          max-width: 420px;
          display: flex;
          flex-direction: column;   
          align-items: center;      
          gap: 20px;
          margin-bottom: 30px;
        }

        .stat-card {
          width: 100%;
          max-width: 340px;  
          min-height: 140px;
          background: white;
          padding: 25px 20px;
          border-radius: 22px;
          box-shadow: var(--shadow);
          border: 1px solid rgba(255,255,255,0.8);
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          text-align: center;
          transition: transform 0.25s ease, box-shadow 0.25s ease;
        }

        .stat-card:active {
          transform: scale(0.95);
          box-shadow: 0 8px 20px rgba(0,0,0,0.08);
        }

        .stat-label {
          font-size: 20px;
          text-transform: uppercase;
          letter-spacing: 1px;
          color: #333;
          margin-bottom: 8px;
          font-weight: 600;
        }

        .stat-value {
          font-size: 42px;
          font-weight: 800;
          color: var(--deep-purple);
        }

        #reader {
          width: 100%;
          max-width: 400px;
          border: 4px solid white !important;
          border-radius: 30px;
          overflow: hidden;
          box-shadow: 0 20px 40px rgba(0,0,0,0.1);
          background: white;
        }

        #btnWrapper {
          position: fixed;
          bottom: 40px;
          width: 100%;
          display: flex;
          justify-content: center;
          pointer-events: none;
        }

        #startBtn {
          pointer-events: auto;
          background: var(--deep-purple);
          color: white;
          padding: 18px 45px;
          border-radius: 50px;
          border: none;
          font-size: 16px;
          font-weight: 700;
          box-shadow: 0 10px 25px rgba(74, 44, 106, 0.3);
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        #startBtn:active { transform: scale(0.95); }

        .overlay-container {
          display: none;
          position: fixed;
          inset: 0;
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          z-index: 9999;
          justify-content: center;
          align-items: center;
          padding: 20px;
        }

        .modal-card {
          background: white;
          width: 100%;
          max-width: 350px;
          border-radius: 30px;
          padding: 40px 30px;
          text-align: center;
          box-shadow: 0 25px 50px rgba(0,0,0,0.1);
          animation: modalPop 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }

        .success-icon { color: #2ecc71; font-size: 80px; margin-bottom: 20px; }
        .error-icon { color: #e74c3c; font-size: 80px; margin-bottom: 20px; }
        .info-icon { color: #3498db; font-size: 80px; margin-bottom: 20px; }

        @keyframes modalPop {
          from { opacity: 0; transform: scale(0.8) translateY(20px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }

        #modalContent {
          text-align: left;
          background: #fdfdfd;
          padding: 15px;
          border-radius: 15px;
          margin: 20px 0;
          font-size: 14px;
          border: 1px solid #eee;
        }

        .detail-row {
          display: flex;
          justify-content: space-between;
          padding: 8px 0;
          border-bottom: 1px solid #f0f0f0;
        }

        .detail-label { 
          font-weight: 700; 
          color: #666; 
          flex-shrink: 0; 
        }

        .detail-label::after {
          content: ":";
          margin-right: 5px;
        }

        .ok-btn {
          background: #27ae60;
          color: white;
          width: 100%;
          padding: 15px;
          border-radius: 15px;
          border: none;
          font-weight: 700;
          cursor: pointer;
        }
        @media (max-width: 480px) {
          .stat-card {
            max-width: 300px;   
            min-height: 140px;
            padding: 22px 15px;
          }
          .stat-value {
            font-size: 40px;
          }
        }
      </style>
    </head>
    <body>
    <audio id="successSound" src="https://actions.google.com/sounds/v1/cartoon/clang_and_wobble.ogg"></audio>
    <audio id="errorSound" src="https://actions.google.com/sounds/v1/alarms/beep_short.ogg"></audio>
      <div class="header-brand">
        <h2 id="expoTitle">Luxury Travel Show</h2>
        <h3 id="scanTitle" style="display:none; margin-top:10px; font-size:16px; color:#666; font-weight:600;">Scan QR Code</h3>
      </div>
      <div class="stats-container">
        <div class="stat-card">
          <div class="stat-label">Registrations</div>
          <div id="totalRegistrations" class="stat-value">0</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Checked-in</div>
          <div id="totalScanned" class="stat-value" style="color: #27ae60;">0</div>
        </div>
      </div>
      <div id="reader"></div>
      <div id="backBtnWrapper" style="display:none; margin-top:15px;">
        <button onclick="goToInitialPage()" style="
          background:#e74c3c;
          color:white;
          padding:12px 25px;
          border:none;
          border-radius:30px;
          font-weight:600;
        ">
          <i class="fas fa-chevron-left"></i> Back
        </button>
      </div>
      <div id="btnWrapper">
        <button id="startBtn" onclick="startScanner()">
          <i class="fas fa-qrcode"></i> Start Scanner
        </button>
      </div>
      <div id="successTick" class="overlay-container" style="background: rgba(46, 204, 113, 0.1);">
        <div class="modal-card">
          <i class="fas fa-check-circle success-icon"></i>
          <h2 style="margin:0; color: #2ecc71;">VERIFIED</h2>
          <p style="color: #666;">Welcome to the Luxury Travel Show</p>
        </div>
      </div>
      <div id="errorBox" class="overlay-container" style="background: rgba(231, 76, 60, 0.1);">
        <div class="modal-card">
          <i class="fas fa-times-circle error-icon"></i>
          <h2 style="margin:0; color: #e74c3c;">INVALID</h2>
          <p style="color: #666;">Access denied. QR code not recognized.</p>
        </div>
      </div>
      <div id="infoBox" class="overlay-container" style="background: rgba(52, 152, 219, 0.1);">
        <div class="modal-card">
          <i id="infoIcon" class="fas fa-info-circle info-icon"></i>
          <h2 id="infoTitle" style="margin:0; color: #3498db;">NOTICE</h2>
          <p id="infoSub" style="color: #666;"></p>
        </div>
      </div>
      <div id="detailsModal" class="overlay-container">
        <div class="modal-card" style="max-width: 400px;">
          <h3 style="margin-top:0;">Visitor Credentials</h3>
          <div id="modalContent"></div>
          <button class="ok-btn" onclick="closeModal()">CONFIRM & CONTINUE</button>
        </div>
      </div>
      <script>
        let lastScan = "";
        let lastScanTime = 0;
        ["click", "touchstart"].forEach(event => {
          document.body.addEventListener(event, () => {
            const success = document.getElementById("successSound");
            const error = document.getElementById("errorSound");
            [success, error].forEach(audio => {
              audio.muted = true;
              audio.play()
                .then(() => {
                  audio.pause();
                  audio.currentTime = 0;
                  audio.muted = false;
                })
                .catch(() => {});
            });
          }, { once: true });
        });
        function loadEventDetails() {
          fetch(window.location.origin + "/api/visitor-settings")
            .then(res => res.json())
            .then(data => {
              document.getElementById("expoTitle").innerText =
                data.event_title || "Event";
            })
            .catch(() => {
              document.getElementById("expoTitle").innerText = "Event";
            });
        }
        loadEventDetails();
        window.history.pushState({ page: "qr-scanner" }, "", window.location.href);
        window.addEventListener("popstate", function () {
          if (html5QrCode) {
            html5QrCode.stop()
            .then(() => {
              html5QrCode.clear();
              html5QrCode = null;
            })
            .catch(() => {
              html5QrCode = null;
            });
          }
          document.getElementById("btnWrapper").style.display = "flex";
          document.querySelector(".stats-container").style.display = "flex";
          document.getElementById("scanTitle").style.display = "none";
          document.getElementById("backBtnWrapper").style.display = "none";
          window.history.pushState({ page: "qr-scanner" }, "", window.location.href);
        });
        function goToInitialPage() {
          if (html5QrCode) {
            html5QrCode.stop()
              .then(() => {
                html5QrCode.clear();
                html5QrCode = null;
              })
              .catch(() => {
                html5QrCode = null;
              });
          }
          const reader = document.getElementById("reader");
          if (reader) reader.innerHTML = "";
          document.getElementById("btnWrapper").style.display = "flex";
          document.querySelector(".stats-container").style.display = "flex";
          document.getElementById("scanTitle").style.display = "none";
          document.getElementById("backBtnWrapper").style.display = "none";
        }
        function showModal(message) {
          const formatted = message
            .split(/\\r?\\n/)
            .filter(line => line.trim() !== "")
            .map(line => {
              const parts = line.split(":");
              if (parts.length >= 2) {
                return \`<div class="detail-row">
                          <span class="detail-label">\${parts[0].trim()}</span>
                          <span>\${parts.slice(1).join(":").trim()}</span>
                        </div>\`;
              }
              return \`<div style="padding: 8px 0; text-align:center;">\${line}</div>\`;
            })
            .join("");
          document.getElementById("modalContent").innerHTML = formatted;
          document.getElementById("detailsModal").style.display = "flex";
        }
        function closeModal() {
          document.getElementById("detailsModal").style.display = "none";
          goToInitialPage();
        }
        function showInfo(message) {
          const infoEl = document.getElementById("infoBox");
          const infoSub = document.getElementById("infoSub");
          infoSub.innerText = message;
          infoEl.style.display = "flex";
          setTimeout(() => {
            infoEl.style.display = "none";
          }, 2000);
        }
        function showSuccess(message) {
          const el = document.getElementById("successTick");
          const sound = document.getElementById("successSound");
          sound.currentTime = 0;
          sound.play().catch(() => {});
          if (navigator.vibrate) navigator.vibrate(200);
          el.style.display = "flex";
          setTimeout(() => {
            el.style.display = "none";
            showModal(message);
          }, 2000);
        }
        function showError() {
          const el = document.getElementById("errorBox");
          const sound = document.getElementById("errorSound");
          sound.currentTime = 0;
          sound.play().catch(() => {});
          el.style.display = "flex";
          setTimeout(() => el.style.display = "none", 1500);
        }
        let html5QrCode;
        function onScanSuccess(decodedText) {
          const now = Date.now();
          if (decodedText === lastScan && (now - lastScanTime) < 3000) return;
          lastScan = decodedText;
          lastScanTime = now;
          if (!decodedText.startsWith("{") && !decodedText.startsWith("http")) {
            showError();
            return;
          }
          fetch(window.location.origin + "/api/scan-qr", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ qrData: decodedText })
          })
          .then(res => res.json())
          .then(data => {
            if (data.message.startsWith("Visitor Name")) {
              showSuccess(data.message);
              loadStats();
            }
            else if (data.message.startsWith("Already")) {
              showInfo(data.message);
            }
            else {
              showError();
            }
          })
          .catch(() => showError());
        }
        function loadStats() {
          fetch(window.location.origin + "/api/visitor-stats")
            .then(res => res.json())
            .then(data => {
              document.getElementById("totalRegistrations").innerText = data.totalRegistrations || 0;
              document.getElementById("totalScanned").innerText = data.totalScanned || 0;
            })
            .catch(() => {});
        }
        loadStats();
        window.startScanner = function () {
        if (html5QrCode) {
          html5QrCode.stop()
            .then(() => {
              html5QrCode.clear();
              html5QrCode = null; 
            })
            .catch(() => {
              html5QrCode = null; 
            });
        }
          const resultEl = document.getElementById("result");
          document.getElementById("btnWrapper").style.display = "none";
          document.querySelector(".stats-container").style.display = "none";
          document.getElementById("backBtnWrapper").style.display = "block";
          const scanTitle = document.getElementById("scanTitle");
          if (scanTitle) scanTitle.style.display = "block";
          html5QrCode = new Html5Qrcode("reader");
          Html5Qrcode.getCameras()
            .then((devices) => {
              if (devices.length === 0) {
                resultEl.innerText = "No camera found";
                document.getElementById("btnWrapper").style.display = "flex";
                return;
              }
              const backCamera = devices.find(device =>
                device.label.toLowerCase().includes("back")
              );
              const cameraId = backCamera ? backCamera.id : devices[0].id;
              return html5QrCode.start(
                cameraId,
                { fps: 10, qrbox: 250 },
                onScanSuccess
              );
            })
          .catch((err) => {
            console.error(err);
            if (err.name === "NotAllowedError") {
              alert("Camera permission denied. Please allow camera access.");
            } else if (err.name === "NotFoundError") {
              alert("No camera found on this device.");
            } else {
              alert("Camera error: " + err);
            }
            document.getElementById("btnWrapper").style.display = "flex";
          });
        };
      </script>
    </body>
    </html>
  `);
});

app.get("/api/visitor-stats", (req, res) => {
  const totalRegistrationsQuery = "SELECT COUNT(*) AS total FROM visitors";
  const totalScannedQuery = "SELECT COUNT(*) AS total FROM visitors WHERE checked_in = 1";
  db.query(totalRegistrationsQuery, (err1, regResult) => {
    if (err1) return res.status(500).json({ error: err1 });
    db.query(totalScannedQuery, (err2, scanResult) => {
      if (err2) return res.status(500).json({ error: err2 });
      res.json({
        totalRegistrations: regResult[0].total,
        totalScanned: scanResult[0].total
      });
    });
  });
});

app.post("/api/scan-qr", (req, res) => {
  let { qrData } = req.body;
  let visitorId = null;
  try {
    if (!qrData) {
      return res.json({ message: "Invalid QR Code" });
    }
    if (qrData.startsWith("{")) {
      let data;
      try {
        if (qrData.startsWith("http")) {
          const url = new URL(qrData);
          const id = url.searchParams.get("id");
          data = {
            id,
            type: "VISITOR_QR"
          };
        } else {
          data = JSON.parse(qrData);
        }
      } catch (e) {
        return res.json({ message: "Invalid QR Code" });
      }
      if (!data || data.type !== "VISITOR_QR" || !data.id) {
        return res.json({ message: "Invalid QR Code" });
      }
      visitorId = data.id;
    }
    else if (qrData.startsWith("http")) {
      const url = new URL(qrData);
      const parts = url.pathname.split("/");
      visitorId = parts[parts.length - 1];
    }
    else {
      return res.json({ message: "Invalid QR Code" });
    }
  } catch (err) {
    return res.json({ message: "Invalid QR Code" });
  }
  const query = "SELECT * FROM visitors WHERE id = ? AND status = 'approved'";
  db.query(query, [visitorId], (err, result) => {
    if (err || result.length === 0) {
      return res.json({ message: "Invalid QR Code" });
    }
    const visitor = result[0];
    const updateCheckin = `
      UPDATE visitors 
      SET checked_in = 1 
      WHERE id = ? AND (checked_in IS NULL OR checked_in = 0)
    `;
    db.query(updateCheckin, [visitorId], (err2, result2) => {
      if (result2.affectedRows === 0) {
        return res.json({
          message: `Already Checked-in: ${visitor.first_name} ${visitor.last_name}`
        });
      }
      return res.json({
        message: `Visitor Name: ${visitor.first_name} ${visitor.last_name}
        Company Name: ${visitor.company_name}
        Mobile Number: ${visitor.mobile_number}
        Email Address: ${visitor.email}`
      });
    });
  });
});

app.get("/api/scan-qr/:id", (req, res) => {
  const visitorId = req.params.id;
  const query = "SELECT * FROM visitors WHERE id = ? AND status = 'approved'";
  db.query(query, [visitorId], (err, result) => {
    if (err || result.length === 0) {
      return res.send(`
        <h2 style="color:red;text-align:center;margin-top:50px;">Invalid QR Code</h2>
      `);
    }
    const visitor = result[0];
    const updateCheckin = `
      UPDATE visitors 
      SET checked_in = 1 
      WHERE id = ? AND (checked_in IS NULL OR checked_in = 0)
    `;
    db.query(updateCheckin, [visitorId], (err2, result2) => {
      if (result2.affectedRows === 0) {
        return res.send(`
          <h2 style="color:orange;text-align:center;margin-top:50px;">
            Already Checked-in: ${visitor.first_name} ${visitor.last_name}
          </h2>
        `);
      }
      return res.send(`
        <div style="font-family:Arial;text-align:center;margin-top:50px;">
          <h1 style="color:green;">Verified</h1>
          <h2>${visitor.first_name} ${visitor.last_name}</h2>
          <p><b>Company:</b> ${visitor.company_name || "-"}</p>
          <p><b>Email:</b> ${visitor.email}</p>
        </div>
      `);
    });
  });
});

app.get("/api/visitors", (req, res) => {
  db.query(
    "SELECT * FROM visitors WHERE checked_in = 1 ORDER BY id DESC",
    (err, result) => {
      if (err) return res.status(500).json(err);
      res.json(result);
    }
  );
});

app.get("/api/visitor/:id", (req, res) => {
  const id = req.params.id;
  db.query(
    "SELECT * FROM visitors WHERE id = ?",
    [id],
    (err, result) => {
      if (err) return res.status(500).json(err);
      if (result.length === 0) return res.status(404).json({ message: "Not found" });
      res.json(result[0]);
    }
  );
});

app.get('/api/visitor-settings', (req, res) => {
  db.query("SELECT * FROM visitor_settings WHERE id = 1", (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(result.length > 0 ? result[0] : {});
  });
});

app.post('/api/visitor-settings/update', (req, res) => {
  const { event_title, venue, event_time } = req.body;
  const sql = `
        INSERT INTO visitor_settings (id, event_title, venue, event_time) 
        VALUES (1, ?, ?, ?) 
        ON DUPLICATE KEY UPDATE 
        event_title = VALUES(event_title), 
        venue = VALUES(venue), 
        event_time = VALUES(event_time)
    `;
  db.query(sql, [event_title, venue, event_time], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Success" });
  });
});

app.post("/api/settings/event-title", (req, res) => {
  const { title } = req.body;
  if (!title) {
    return res.status(400).json({ error: "Title is required" });
  }
  const sql = `
    INSERT INTO exhibitor_settings (setting_key, setting_value) 
    VALUES ('event_title', ?) 
    ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)
  `;
  db.query(sql, [title], (err, result) => {
    if (err) {
      console.error("DATABASE ERROR:", err);
      return res.status(500).json({ error: "Database save failed" });
    }
    res.json({ message: "Event title saved successfully", title });
  });
});

app.post("/api/settings/event-title", (req, res) => {
  const { title } = req.body;
  const sql = `
    INSERT INTO exhibitor_settings (setting_key, setting_value) 
    VALUES ('event_title', ?) 
    ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)
  `;
  db.query(sql, [title], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Event title saved successfully" });
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
