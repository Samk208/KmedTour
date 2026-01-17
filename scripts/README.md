# KmedTour Scripts

Automation scripts for the KmedTour project.

---

## Image Generation Script

### `generate-images.js`

Automated image generation for programmatic SEO pages using OpenAI DALL-E 3 API.

#### Prerequisites

```bash
# Install dependencies
npm install

# Set OpenAI API key
export OPENAI_API_KEY=your_openai_api_key_here
```

Get your API key from: https://platform.openai.com/api-keys

#### Usage

```bash
# Generate all images (hospitals + procedures)
npm run generate:images

# Generate only hospital images
npm run generate:hospitals

# Generate only procedure images
npm run generate:procedures

# Direct script execution
node scripts/generate-images.js
node scripts/generate-images.js hospitals
node scripts/generate-images.js procedures
```

#### Configuration

Edit `generate-images.js` to customize:

- **Image size:** Default 1792x1024 (change `CONFIG.imageSize`)
- **Quality:** Default 'hd' (change `CONFIG.quality`)
- **Style:** Default 'natural' (change `CONFIG.style`)
- **Output directories:** `public/images/hospitals/` and `public/images/procedures/`

#### What It Does

1. **Reads hospital/procedure data** from Content Hub Data
2. **Generates AI prompts** tailored to each hospital's specialty
3. **Calls DALL-E 3 API** to generate photorealistic images
4. **Downloads images** to appropriate directories
5. **Handles errors** and rate limiting automatically

#### Prompts

The script includes 10 sample hospital prompts and 20 sample procedure prompts. Examples:

**Hospital (Asan Medical Center):**
```
A modern, world-class hospital building in Seoul, South Korea.
Sleek glass and steel architecture with multiple towers,
featuring the latest medical technology. Bright blue sky,
clean aesthetic, professional medical environment.
Wide-angle architectural photography, photorealistic,
high quality, natural lighting.
```

**Procedure (LASIK Eye Surgery):**
```
State-of-the-art LASIK eye surgery with advanced laser
equipment in modern Korean eye center. High-tech laser
vision correction machine, patient receiving treatment,
professional medical environment. Blue laser lights,
clean sterile setting. Photorealistic medical technology
photography.
```

#### Output

Images are saved as:
- `public/images/hospitals/{hospital-slug}.png`
- `public/images/procedures/{procedure-slug}.png`

Example:
- `/public/images/hospitals/asan-medical-center.png`
- `/public/images/procedures/rhinoplasty.png`

#### Cost & Time

**DALL-E 3 Pricing:**
- Standard: $0.040/image
- HD: $0.080/image (recommended)

**Sample Generation (30 images):**
- Cost: ~$2.40
- Time: ~30 minutes

**Full Generation (144 images):**
- Cost: ~$11.52
- Time: ~2.5 hours (due to rate limiting)

#### Rate Limiting

The script automatically:
- Waits 60 seconds between API calls
- Skips images that already exist
- Shows progress in console

You can pause and resume - it won't regenerate existing images.

#### Error Handling

- **API Errors:** Logged to console, script continues
- **Download Errors:** Retries automatically
- **File Exists:** Skips regeneration
- **Missing API Key:** Exits with clear error message

#### Extending

To add more hospitals or procedures:

1. **Add prompt to the script:**
```javascript
HOSPITAL_PROMPTS['New Hospital Name'] = {
  prompt: 'Your detailed prompt here...',
  specialty: 'SPECIALTY_TYPE'
}
```

2. **Run generation:**
```bash
npm run generate:hospitals
```

3. **Verify output:**
- Check `public/images/hospitals/` for new file
- Visit `/hospitals/{slug}` to see it in action

#### Alternative Methods

If you prefer not to use AI generation:

**1. Use Stock Photos:**
```bash
# Download from Unsplash/Pexels
# Save as: public/images/hospitals/{slug}.png
```

**2. Manual Editing:**
```javascript
// Edit HOSPITAL_PROMPTS in generate-images.js
// Adjust prompts for better results
// Regenerate specific images
```

**3. Replace Individual Images:**
```bash
# Just replace the PNG file directly
# No need to run script
cp my-custom-image.png public/images/hospitals/asan-medical-center.png
```

---

## Future Scripts

Planned automation scripts:

- `seed-database.js` - Import CSV data to Supabase
- `generate-sitemaps.js` - Create XML sitemaps for SEO
- `validate-data.js` - Verify hospital/procedure data quality
- `optimize-images.js` - Compress and convert images

---

## Troubleshooting

### "OPENAI_API_KEY not set"
```bash
export OPENAI_API_KEY=sk-your-key-here
```

### "API error: 429"
- Rate limit exceeded
- Wait a few minutes and retry
- Script already handles this with 60s delays

### "Image not loading on page"
- Check file exists: `ls public/images/hospitals/`
- Verify slug matches: hospital slug → image filename
- Check console for 404 errors
- Clear Next.js cache: `rm -rf .next`

### "Low quality images"
- Change quality to 'hd' in CONFIG
- Adjust prompts for more detail
- Regenerate specific images

---

## Documentation

- **Main Guide:** [../docs/PSEO-IMAGES-GUIDE.md](../docs/PSEO-IMAGES-GUIDE.md)
- **Summary:** [../PSEO-IMPROVEMENTS-SUMMARY.md](../PSEO-IMPROVEMENTS-SUMMARY.md)
- **Content Data:** [../Content Hub Data/START-HERE.md](../Content Hub Data/START-HERE.md)

---

**Ready to generate?** Run `npm run generate:hospitals` to start! 🎨
