# Directive: Programmatic SEO (pSEO)

## Goal
Generate high-volume, high-quality landing pages for hospitals, procedures, and "City + Procedure" combinations using the Content Hub Data.

## Page Types & Routes
1.  **Hospital Details**
    *   Route: `/hospitals/[slug]` (or existing `/clinics/[slug]`, standardize to one)
    *   Data Source: `lib/data/clinics.json`
    *   Key Content: Name, Description, Accreditation (KAHF), Doctors, Map.

2.  **Procedure Details**
    *   Route: `/procedures/[slug]` (or `/treatments/[slug]`)
    *   Data Source: `lib/data/treatments.json`
    *   Key Content: Cost Range, Duration, Recovery, FAQ.

3.  **City + Procedure (Combinatorial)**
    *   Route: `/[city]/[procedure]` (e.g., `/seoul/rhinoplasty`)
    *   Data Source: Derived from `lib/data/clinics.json` + `mappings.json`.
    *   Logic: Find all clinics in `{city}` that offer `{procedure}`.
    *   Key Content: "Best {Procedure} Clinics in {City}", List of matching clinics, Aggregate price range.

## Execution Workflow
1.  **Data Ingestion**: Run `node execution/seed_content.js` to generate JSONs.
2.  **Mapping Generation**: Ensure `seed_content.js` creates `mappings.json` linking hospitals to procedures.
3.  **Route Implementation**:
    *   Use `generateStaticParams` in Next.js to statically build these pages at build time (or valid dynamic routes for ISR).
    *   Ensure metadata (Title, Description) is dynamically generated from the JSON data.

## SEO Requirements
*   **Metadata**: Unique title/desc for every page.
*   **Sitemap**: All generated pages must be in `sitemap.xml`.
*   **Internal Linking**: Procedures must link to relevant Hospitals, and vice-versa.
