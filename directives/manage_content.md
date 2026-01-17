# Directive: Manage Content

## Goal
Import, update, and manage the medical content (Hospitals, Procedures) from the "Content Hub Data" source into the application.

## Source of Truth
*   **Raw Data**: `Content Hub Data/` (CSVs and JSONs provided by researchers).
    *   `verified_hospitals/`
    *   `verified_procedures/`
*   **App Data**: `lib/data/*.json` (Mock/Fallback data) or Supabase (Production).

## Workflow
1.  **Receive New Data**: Place cleaned CSV/JSON files in `Content Hub Data/`.
2.  **Run Translation**: Use the execution script to map raw data to the app's schema.
    *   Command: `node execution/translate_content_data.js`
3.  **Verify**: Check `lib/data/clinics.json` and `treatments.json` for validity.
4.  **Deploy**: Commit the updated JSON files.

## Schema Mapping Rules
*   **Clinics**:
    *   `Hospital_Name` -> `name`
    *   `Region` -> `location`
    *   `Hospital_Type` + `Accreditation` -> `description` or `highlights`
*   **Procedures**:
    *   Map relevant columns to `title`, `priceRange`, `duration`.
