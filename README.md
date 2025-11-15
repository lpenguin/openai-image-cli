# openai-image-cli

A command-line interface tool for generating images using OpenAI's DALL-E models (dall-e-3, dall-e-2, gpt-image, and gpt-image-mini).

## Features

- Generate images using DALL-E 3, DALL-E 2, GPT-Image, or GPT-Image Mini
- Customizable image sizes
- Support for multiple image generation (dall-e-2 only)
- Automatic image download and saving
- Simple command-line interface
- Written in TypeScript for type safety

## Installation

### Using npx (Recommended)

Run directly without installation:
```bash
npx openai-image-cli "A sunset over mountains"
```

### Global Installation

```bash
npm install -g openai-image-cli
```

### Local Development

1. Clone the repository:
```bash
git clone https://github.com/lpenguin/openai-image-cli.git
cd openai-image-cli
```

2. Install dependencies:
```bash
npm install
```

3. Build the project:
```bash
npm run build
```

4. Set up your OpenAI API key:
```bash
export OPENAI_API_KEY=your-api-key-here
```

## Usage

### Basic Usage

```bash
npx openai-image-cli "A sunset over mountains"
# or if installed globally
openai-image "A sunset over mountains"
# or if running locally
node dist/index.js "A sunset over mountains"
```

### With Options

```bash
npx openai-image-cli --prompt "A cat playing piano" --size 1024x1024 --n 1
```

### Using Different Models

```bash
# DALL-E 2 with multiple images
npx openai-image-cli "Abstract art" --model dall-e-2 --size 512x512 --n 2

# GPT-Image
npx openai-image-cli "Modern design" --model gpt-image --size 1024x1024

# GPT-Image Mini
npx openai-image-cli "Quick sketch" --model gpt-image-mini
```

### Command-Line Options

- `--prompt <text>` - Image generation prompt (required if not using positional argument or --prompt-file)
- `--prompt-file <path>` - Path to file containing the prompt (alternative to --prompt)
- `--size <size>` - Image size (default: 1024x1024)
  - DALL-E 3 sizes: 1024x1024, 1024x1792, 1792x1024
  - DALL-E 2 sizes: 256x256, 512x512, 1024x1024
  - GPT-Image sizes: 1024x1024, 1024x1792, 1792x1024
  - GPT-Image Mini sizes: 1024x1024, 1024x1792, 1792x1024
- `--n <number>` - Number of images to generate (default: 1)
  - Note: DALL-E 3, GPT-Image, and GPT-Image Mini only support n=1
- `--model <model>` - Model to use: dall-e-3, dall-e-2, gpt-image, or gpt-image-mini (default: dall-e-3)
- `--help, -h` - Show help message

### Environment Variables

- `OPENAI_API_KEY` (required) - Your OpenAI API key

## Examples

Generate a single image with DALL-E 3:
```bash
export OPENAI_API_KEY=sk-...
npx openai-image-cli "A futuristic city at night"
```

Generate an image using a prompt from a file:
```bash
npx openai-image-cli --prompt-file my-prompt.txt --model dall-e-3
```

Generate multiple images with DALL-E 2:
```bash
npx openai-image-cli "A cute robot" --model dall-e-2 --size 512x512 --n 3
```

Generate a wide image with GPT-Image:
```bash
npx openai-image-cli "A panoramic landscape" --model gpt-image --size 1792x1024
```

Use GPT-Image Mini for faster generation:
```bash
npx openai-image-cli "A simple sketch" --model gpt-image-mini
```

## Output

Generated images are automatically downloaded and saved to the current directory with filenames like:
- `generated_image_<timestamp>_1.png`
- `generated_image_<timestamp>_2.png`

## Development

Build the project:
```bash
npm run build
```

The TypeScript source is in `src/` and compiles to `dist/`.

## License

ISC