# openai-image-cli

A command-line interface tool for generating images using OpenAI's DALL-E models (dall-e-3 and dall-e-2).

## Features

- Generate images using DALL-E 3 or DALL-E 2
- Customizable image sizes
- Support for multiple image generation (dall-e-2 only)
- Automatic image download and saving
- Simple command-line interface

## Installation

1. Clone the repository:
```bash
git clone https://github.com/lpenguin/openai-image-cli.git
cd openai-image-cli
```

2. Install dependencies:
```bash
npm install
```

3. Set up your OpenAI API key:
```bash
export OPENAI_API_KEY=your-api-key-here
```

## Usage

### Basic Usage

```bash
node index.js "A sunset over mountains"
```

### With Options

```bash
node index.js --prompt "A cat playing piano" --size 1024x1024 --n 1
```

### Using DALL-E 2 with Multiple Images

```bash
node index.js "Abstract art" --model dall-e-2 --size 512x512 --n 2
```

### Command-Line Options

- `--prompt <text>` - Image generation prompt (required)
- `--size <size>` - Image size (default: 1024x1024)
  - DALL-E 3 sizes: 1024x1024, 1024x1792, 1792x1024
  - DALL-E 2 sizes: 256x256, 512x512, 1024x1024
- `--n <number>` - Number of images to generate (default: 1)
  - Note: DALL-E 3 only supports n=1
- `--model <model>` - Model to use: dall-e-3 or dall-e-2 (default: dall-e-3)
- `--help, -h` - Show help message

### Environment Variables

- `OPENAI_API_KEY` (required) - Your OpenAI API key

## Examples

Generate a single image with DALL-E 3:
```bash
export OPENAI_API_KEY=sk-...
node index.js "A futuristic city at night"
```

Generate multiple images with DALL-E 2:
```bash
node index.js "A cute robot" --model dall-e-2 --size 512x512 --n 3
```

Generate a wide image:
```bash
node index.js "A panoramic landscape" --size 1792x1024
```

## Output

Generated images are automatically downloaded and saved to the current directory with filenames like:
- `generated_image_<timestamp>_1.png`
- `generated_image_<timestamp>_2.png`

## License

ISC