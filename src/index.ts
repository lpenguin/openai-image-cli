#!/usr/bin/env node

import OpenAI from 'openai';
import { writeFile, readFile } from 'fs/promises';
import { join } from 'path';
import { Command } from 'commander';

interface Params {
  prompt: string | null;
  size: string;
  n: number;
  model: string;
}

// Parse command line arguments
async function parseArgs(): Promise<Params> {
  const program = new Command();
  
  program
    .name('openai-image')
    .description('CLI tool for generating images using OpenAI\'s DALL-E models')
    .version('1.0.0')
    .argument('[prompt]', 'Image generation prompt')
    .option('--prompt <text>', 'Image generation prompt (alternative to positional argument)')
    .option('--prompt-file <path>', 'Path to file containing the prompt')
    .option('--size <size>', 'Image size (default: 1024x1024)', '1024x1024')
    .option('--n <number>', 'Number of images to generate (default: 1)', '1')
    .option('--model <model>', 'Model to use: dall-e-3, dall-e-2, gpt-image, or gpt-image-mini', 'dall-e-3')
    .addHelpText('after', `
Environment Variables:
  OPENAI_API_KEY      Your OpenAI API key (required)

Examples:
  openai-image "A sunset over mountains"
  openai-image --prompt "A cat playing piano" --size 1024x1024 --n 1
  openai-image --prompt-file prompt.txt --model dall-e-2
  openai-image "Abstract art" --model dall-e-2 --size 512x512 --n 2
  openai-image "Modern design" --model gpt-image --size 1024x1024
  openai-image "Quick sketch" --model gpt-image-mini

Valid sizes:
  - DALL-E 3: 1024x1024, 1024x1792, 1792x1024
  - DALL-E 2: 256x256, 512x512, 1024x1024
  - GPT-Image: 1024x1024, 1024x1792, 1792x1024
  - GPT-Image Mini: 1024x1024, 1024x1792, 1792x1024

Note: DALL-E 3, GPT-Image, and GPT-Image Mini only support n=1
`);

  program.parse();

  const options = program.opts();
  const args = program.args;

  let prompt: string | null = null;

  // Priority: positional argument > --prompt > --prompt-file
  if (args.length > 0) {
    prompt = args[0];
  } else if (options.prompt) {
    prompt = options.prompt;
  } else if (options.promptFile) {
    try {
      prompt = (await readFile(options.promptFile, 'utf-8')).trim();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`Error reading prompt file: ${errorMessage}`);
      process.exit(1);
    }
  }

  return {
    prompt,
    size: options.size,
    n: parseInt(options.n, 10),
    model: options.model
  };
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
parseArgs().then(params => {
  generateImages(params);
}).catch(error => {
  console.error('Error parsing arguments:', error.message);
  process.exit(1);
});
