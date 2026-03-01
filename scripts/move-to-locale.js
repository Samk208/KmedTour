const fs = require("fs");
const path = require("path");

const appDir = path.join(__dirname, "../app");
const targetDir = path.join(appDir, "[locale]");

// Create [locale] directory
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir);
}

const itemsToMove = [
  "[city]",
  "about",
  "auth",
  "clinics",
  "contact",
  "content",
  "coordinator",
  "dashboard",
  "favorites",
  "for-clinics",
  "hospitals",
  "how-it-works",
  "landing",
  "patient",
  "patient-intake",
  "privacy",
  "procedures",
  "terms",
  "treatment-advisor",
  "error.tsx",
  "layout.tsx",
  "loading.tsx",
  "not-found.tsx",
  "page.tsx",
];

itemsToMove.forEach((itemName) => {
  const oldPath = path.join(appDir, itemName);
  const newPath = path.join(targetDir, itemName);
  if (fs.existsSync(oldPath)) {
    fs.renameSync(oldPath, newPath);
    console.log(`Moved ${itemName} to [locale]/`);
  } else {
    console.log(`Not found: ${itemName}`);
  }
});

console.log("App structure refactored successfully.");
