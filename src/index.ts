#!/usr/bin/env node

import OpenAI from 'openai';
import { writeFile } from 'fs/promises';
import { join } from 'path';

interface Params {
  prompt: string | null;
  size: string;
  n: number;
  model: string;
}

// Parse command line arguments
function parseArgs(): Params {
  const args = process.argv.slice(2);
  const params: Params = {
    prompt: null,
    size: '1024x1024',
    n: 1,
    model: 'dall-e-3'
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    
    if (arg === '--prompt' && i + 1 < args.length) {
      params.prompt = args[++i];
    } else if (arg === '--size' && i + 1 < args.length) {
      params.size = args[++i];
    } else if (arg === '--n' && i + 1 < args.length) {
      params.n = parseInt(args[++i], 10);
    } else if (arg === '--model' && i + 1 < args.length) {
      params.model = args[++i];
    } else if (arg === '--help' || arg === '-h') {
      printHelp();
      process.exit(0);
    } else if (!params.prompt) {
      // First positional argument is the prompt
      params.prompt = arg;
    }
  }

  return params;
}

function printHelp(): void {
  console.log(`
OpenAI Image CLI - Generate images using DALL-E

Usage:
  openai-image <prompt> [options]
  openai-image --prompt "<prompt>" [options]

Options:
  --prompt <text>     Image generation prompt (required)
  --size <size>       Image size (default: 1024x1024)
                      Valid sizes for dall-e-3: 1024x1024, 1024x1792, 1792x1024
                      Valid sizes for dall-e-2: 256x256, 512x512, 1024x1024
                      Valid sizes for gpt-image: 1024x1024, 1024x1792, 1792x1024
                      Valid sizes for gpt-image-mini: 1024x1024, 1024x1792, 1792x1024
  --n <number>        Number of images to generate (default: 1)
                      Note: dall-e-3, gpt-image, and gpt-image-mini only support n=1
  --model <model>     Model to use: dall-e-3, dall-e-2, gpt-image, or gpt-image-mini (default: dall-e-3)
  --help, -h          Show this help message

Environment Variables:
  OPENAI_API_KEY      Your OpenAI API key (required)

Examples:
  openai-image "A sunset over mountains"
  openai-image --prompt "A cat playing piano" --size 1024x1024 --n 1
  openai-image "Abstract art" --model dall-e-2 --size 512x512 --n 2
  openai-image "Modern design" --model gpt-image --size 1024x1024
  openai-image "Quick sketch" --model gpt-image-mini
`);
}

async function generateImages(params: Params): Promise<void> {
  // Check for API key
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.error('Error: OPENAI_API_KEY environment variable is not set');
    console.error('Please set your OpenAI API key: export OPENAI_API_KEY=your-key-here');
    process.exit(1);
  }

  // Validate prompt
  if (!params.prompt) {
    console.error('Error: Prompt is required');
    console.error('Use --help for usage information');
    process.exit(1);
  }

  // Validate parameters based on model
  if (['dall-e-3', 'gpt-image', 'gpt-image-mini'].includes(params.model) && params.n > 1) {
    console.warn(`Warning: ${params.model} only supports n=1. Setting n to 1.`);
    params.n = 1;
  }

  // Initialize OpenAI client
  const openai = new OpenAI({
    apiKey: apiKey,
  });

  console.log(`Generating ${params.n} image(s) with ${params.model}...`);
  console.log(`Prompt: ${params.prompt}`);
  console.log(`Size: ${params.size}`);

  try {
    // Generate images
    const response = await openai.images.generate({
      model: params.model,
      prompt: params.prompt,
      n: params.n,
      size: params.size as any, // OpenAI types might not include all sizes
    });

    console.log(`\nSuccessfully generated ${response.data?.length || 0} image(s):`);

    // Download and save images
    if (!response.data || response.data.length === 0) {
      console.error('No images were generated');
      process.exit(1);
    }

    for (let i = 0; i < response.data.length; i++) {
      const imageData = response.data[i];
      const imageUrl = imageData.url;
      
      if (!imageUrl) {
        console.error(`Image ${i + 1}: No URL returned`);
        continue;
      }

      console.log(`\nImage ${i + 1}:`);
      console.log(`URL: ${imageUrl}`);
      
      // Download image
      try {
        const imageResponse = await fetch(imageUrl);
        const arrayBuffer = await imageResponse.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        
        // Save to file
        const timestamp = Date.now();
        const filename = `generated_image_${timestamp}_${i + 1}.png`;
        const filepath = join(process.cwd(), filename);
        
        await writeFile(filepath, buffer);
        console.log(`Saved to: ${filepath}`);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error(`Failed to download image ${i + 1}:`, errorMessage);
      }
    }

    console.log('\nDone!');
  } catch (error: any) {
    console.error('\nError generating images:');
    if (error.response) {
      console.error(`Status: ${error.response.status}`);
      console.error(`Message: ${error.response.data?.error?.message || error.message}`);
    } else {
      console.error(error.message);
    }
    process.exit(1);
  }
}

// Main execution
const params = parseArgs();
generateImages(params);
