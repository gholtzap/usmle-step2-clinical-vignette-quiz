# usmle-step2-clinical-vignette-quiz

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open your browser and visit [http://localhost:3000](http://localhost:3000)


## Configuration

### Change Number of Questions

To change the number of questions loaded, modify the API call in components/Quiz.tsx:

```typescript
const response = await fetch('/api/questions?limit=50'); // Change 50 to your desired number
```

### Change Question Source

To use a different question bank, update the file path in app/api/questions/route.ts:

```typescript
const filePath = path.join(process.cwd(), 'US_qbank.jsonl');
```