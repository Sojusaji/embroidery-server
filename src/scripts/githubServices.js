import { Octokit } from "@octokit/rest";
import { throttling } from "@octokit/plugin-throttling";
import AppError from "../utils/appError.js";
import { generateFileName } from "../utils/uuidGenerator.js";
import { convertImage } from "../utils/processImage.js";

const MyOctokit = Octokit.plugin(throttling);

class GithubServices {
  constructor() {
    // Validate required environment variables
    if (!process.env.GITHUB_TOKEN || !process.env.GITHUB_OWNER || !process.env.GITHUB_REPO) {
      throw new AppError("GitHub configuration is missing from environment variables.", 500);
    }

    this.owner = process.env.GITHUB_OWNER;
    this.repo = process.env.GITHUB_REPO;

    this.octokit = new MyOctokit({
      auth: process.env.GITHUB_TOKEN,
      throttle: {
        onRateLimit: (retryAfter, options) => {
          console.warn(`Quota exhausted: ${options.method} ${options.url}. Retrying in ${retryAfter}s`);
          return options.request.retryCount < 2; // Returns true to retry
        },
        onSecondaryRateLimit: (retryAfter, options) => {
          console.warn(`Secondary limit hit: ${options.url}`);
          return false;
        },
      },
    });
  }

  async getFile(path) {
    try {
      const { data } = await this.octokit.rest.repos.getContent({
        owner: this.owner,
        repo: this.repo,
        path,
      });
      return data;
    } catch (error) {
      throw new AppError(`GitHub Fetch Error: ${error.message}`, error.status || 500);
    }
  }

  async uploadImage(image, folder, sha = null) {
    console.log('image recieved at uploadImage:', image);
    if (!image) throw new AppError("No image data provided.", 400);

    const { data: processedImage } = await convertImage(image);

    console.log('processedImage:', processedImage);

    // 2. Generate Path (Simplified Logic)
    const allowedFolders = ['embroidery', 'stitching', 'rolled-gold-ornaments'];

    if (!allowedFolders.includes(folder)) {
      throw new AppError("Invalid folder destination.", 400);
    }

    const fileName = generateFileName();
    const filePath = `${folder}/${fileName}`;

    try {
      // 3. Encode to Base64
      const contentEncoded = Buffer.from(processedImage).toString("base64");
      console.log('contentencoded',contentEncoded);
      // 4. Upload to GitHub
      const response = await this.octokit.rest.repos.createOrUpdateFileContents({
        owner: this.owner,
        repo: this.repo,
        path: filePath,
        message: `feat: upload image to ${folder}`,
        content: contentEncoded,
        sha,
      });
      console.log('response after gitHub upload :', response);
      return {
        success: true,
        data: response.data.content,
        fileName
      };
    } catch (error) {
      throw new AppError(`GitHub Upload Error: ${error.message}`, error.status || 500);
    }
  }
}

export default new GithubServices();