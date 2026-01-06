# DoAI: The Pyramid Puzzle

A web game created to help teach high school students about how AI understands the world, inspired by John Searle’s Chinese Room Argument. The project frames a classic pyramid puzzle within a UI that illustrates the gap between syntax and semantics, and how computers interpret symbols without understanding their meaning.

## Running in Development

To run this project locally, you’ll need **Node.js** and **npm** installed:

```bash
# Clone the repository
git clone https://github.com/DayOfAIAustralia/pyramid-puzzle.git

# Navigate to the project
cd pyramid-puzzle

# Install dependencies
npm install

# Start in development mode
npm run dev
```

### Setting up the AI Assistent

To ensure the AI assistant feature works you will need to go to project settings -> environment variables and then add the key “GOOGLE_GENERATIVE_AI_API_KEY” with a value for a valid key
Note: to test this feature locally, you will need to download the Vercel CLI and link it to the repository so it can correctly run the serverless function `requesthelp.js`

## Documentation

For more detailed technical documentation see: https://docs.google.com/document/d/1-kEmBMTY1VMlWhFfeR2L49ZgocBmLPQBbNnO7DpijmE/edit?tab=t.0
