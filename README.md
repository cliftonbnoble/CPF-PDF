# CHP 108A Inspector

A Next.js web application for automating California Highway Patrol CHP 108A Bus Maintenance & Safety Inspection forms.

## Features

✅ **Quick Toggle All** - Set all months to OK or DEF with one click  
✅ **Auto Date Calculation** - Enter January date, and subsequent months auto-populate (+45 days each)  
✅ **Digital Signature Capture** - Draw signature once, apply to multiple months  
✅ **Sign All** - Apply signature to all months with OK/DEF checked  
✅ **PDF Generation** - Download filled form as PDF  
✅ **Responsive Design** - Works on desktop and tablets  

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **PDF Generation**: pdf-lib (pure JavaScript, no backend needed)
- **Signature Capture**: react-signature-canvas
- **Date Utilities**: date-fns

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn or pnpm

### Installation

```bash
# Clone or copy the project
cd chp108a-inspector

# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Building for Production

```bash
npm run build
npm start
```

## Deployment to Cloudflare Pages

This app is configured for easy deployment to Cloudflare Pages with static export.

### Quick Deploy

1. **Push to Git**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git push
   ```

2. **Deploy on Cloudflare Pages**:
   - Go to [Cloudflare Dashboard](https://dash.cloudflare.com/) → Pages
   - Click **Create a project** → **Connect to Git**
   - Configure build settings:
     - Build command: `npm run build`
     - Build output directory: `out`
   - Click **Save and Deploy**

**📖 For detailed deployment instructions, see [DEPLOYMENT.md](./DEPLOYMENT.md)**

### Alternative Deployment Options

The app can also be deployed to:
- **Vercel**: Push to GitHub and import via Vercel dashboard
- **Netlify**: Connect Git repo with build command `npm run build` and publish directory `out`
- **GitHub Pages**: Upload the `out` folder after running `npm run build`
- **Any Static Host**: Upload contents of `out` folder

## Project Structure

```
chp108a-inspector/
├── src/
│   ├── app/
│   │   ├── globals.css      # Tailwind + custom styles
│   │   ├── layout.tsx       # Root layout
│   │   └── page.tsx         # Main page
│   ├── components/
│   │   ├── InspectionForm.tsx   # Main form orchestration
│   │   ├── MonthControls.tsx    # Month grid with toggle/sign
│   │   ├── SignaturePad.tsx     # Signature capture
│   │   └── VehicleInfoForm.tsx  # Vehicle info inputs
│   ├── lib/
│   │   ├── dateUtils.ts     # +45 day calculations
│   │   └── pdfGenerator.ts  # PDF generation with pdf-lib
│   └── types/
│       ├── inspection.ts    # TypeScript types
│       └── react-signature-canvas.d.ts
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── next.config.js
```

## How It Works

### Date Calculation Logic

When you enter a January inspection date, the app calculates subsequent months by adding 45 days:

```
JAN: 01/10/2026 (entered)
FEB: 02/24/2026 (+45 days)
MAR: 04/10/2026 (+90 days)
APR: 05/25/2026 (+135 days)
... and so on
```

### PDF Generation

The app uses `pdf-lib` to create PDFs entirely client-side:
- No server/backend required
- No external API calls
- Works offline once loaded
- Embeds signature as PNG image

## Customization

### Modify Inspection Items

Edit `src/types/inspection.ts` - the `INSPECTION_ITEMS` array contains all 40 checklist items.

### Change Date Interval

Edit `src/lib/dateUtils.ts` - modify the `45` in `addDays(currentDate, 45)` to change the interval.

### Styling

All styling uses Tailwind CSS classes. Modify component files or `globals.css` for custom styles.

## Using with Cursor IDE

This project is optimized for development in Cursor:

1. Open the project folder in Cursor
2. The TypeScript types provide full autocomplete
3. Tailwind IntelliSense works out of the box
4. Use Cursor's AI features to modify components

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## License

MIT - Use freely for any purpose.

## Reference

- [Official CHP 108A Form](https://www.chp.ca.gov/siteassets/forms/b-chp108a-1.pdf)
- [pdf-lib Documentation](https://pdf-lib.js.org/)
- [Next.js Documentation](https://nextjs.org/docs)
