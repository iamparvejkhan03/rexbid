import multer from "multer";

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  // Check file types - UPDATED to include 'serviceRecords', 'logbooks', and 'invoice'
  if (file.fieldname === "image") {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed for profile images"), false);
    }
  } else if (
    file.fieldname === "photos" ||
    file.fieldname === "logbooks" ||
    file.fieldname === "serviceRecords"
  ) {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(
        new Error(
          "Only image files are allowed for photos, logbooks, and service records"
        ),
        false
      );
    }
  } else if (file.fieldname === "icon" || file.fieldname === "image") {
    // For category icons and images
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(
        new Error("Only image files are allowed for category icons and images"),
        false
      );
    }
  } else if (file.fieldname === "documents" || file.fieldname === "invoice") {
    // ADDED 'invoice' here
    // Allow almost all file types for documents and invoices, but exclude executables and scripts
    const forbiddenTypes = [
      "application/x-msdownload", // .exe
      "application/x-ms-installer", // .msi
      "application/x-sh", // shell scripts
      "application/x-bat", // batch files
      "application/x-csh", // cshell scripts
      "application/x-apple-diskimage", // .dmg
      "application/x-ms-application", // .application
      "application/x-ms-manifest", // .manifest
    ];

    // Also check file extensions for extra security
    const forbiddenExtensions = [
      ".exe",
      ".msi",
      ".bat",
      ".cmd",
      ".sh",
      ".dmg",
      ".app",
      ".jar",
    ];
    const fileExtension = file.originalname
      .toLowerCase()
      .slice(file.originalname.lastIndexOf("."));

    if (
      forbiddenTypes.includes(file.mimetype) ||
      forbiddenExtensions.includes(fileExtension)
    ) {
      cb(
        new Error("Executable files are not allowed for security reasons"),
        false
      );
    } else {
      cb(null, true);
    }
  } else {
    cb(new Error(`Unexpected field: ${file.fieldname}`), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 25 * 1024 * 1024, // 25MB limit
    files: 200, // Maximum 200 files total
  },
});

export default upload;
