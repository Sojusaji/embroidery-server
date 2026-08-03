import { Octokit } from "@octokit/rest";
import { throttling } from "@octokit/plugin-throttling";
import AppError from "../utils/appError.js";
import { generateFileName } from "../utils/uuidGenerator.js";
import { convertImage } from "../utils/processImage.js";

const MyOctokit = Octokit.plugin(throttling);

class GithubServices {
  constructor() {
    if (!process.env.GITHUB_TOKEN || !process.env.GITHUB_OWNER || !process.env.GITHUB_REPO) {
      throw new AppError("GitHub configuration is missing from environment variables.", 500);
    }

    this.owner = process.env.GITHUB_OWNER;
    this.repo = process.env.GITHUB_REPO;
    this.allowedFolders = ['embroidery', 'stitching', 'ornaments'];

    this.octokit = new MyOctokit({
      auth: process.env.GITHUB_TOKEN,
      request: {
        timeout: 30000,
      },
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
    if (!image) throw new AppError("No image data provided.", 400);

    const { data: processedImage } = await convertImage(image);

    console.log('processedImage:', processedImage);

    if (!this.allowedFolders.includes(folder.toLowerCase())) {
      throw new AppError("Invalid folder destination.", 400);
    }

    const fileName = generateFileName();
    const filePath = `${folder}/${fileName}`;

    try {
      const contentEncoded = Buffer.from(processedImage).toString("base64");
      console.log('contentencoded', contentEncoded);
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
        imageUrl: response.data.content.download_url,
        sha: response.data.content.sha,
        filePath,
      };
    } catch (error) {
      throw new AppError(`GitHub Upload Error: ${error.message}`, error.status || 500);
    }
  }

  async deleteImage(sha, filePath) {
    if (!filePath || !sha) {
      throw new AppError('Data Is Missing', 400);
    }
    try {
      const response = await this.octokit.rest.repos.deleteFile({
        owner: this.owner,
        repo: this.repo,
        path: filePath,
        message: 'chore: delete image',
        sha: sha
      })
      console.log('response after deleting image:', response);
      return {
        success: true,
        message: 'Image deleted successfully'
      }
    } catch (error) {
      console.log('error from image delete script:', error);
      throw new AppError(`GitHub Fetch Error:${error.message}`, error.status || 500);
    }
  }

  async updateImage(image, oldSha, oldFilePath, folder) {
    if (!image || !oldSha || !oldFilePath || !folder) {
      throw new AppError('Data Is Missing for image update', 400);
    }

    if (!this.allowedFolders.includes(folder.toLowerCase())) {
      throw new AppError("Invalid folder destination.", 400);
    }

    const { data: processedImage } = await convertImage(image);
    const contentEncoded = Buffer.from(processedImage).toString("base64");

    const newFileName = generateFileName();
    const newFilePath = `${folder}/${newFileName}`;

    try {
      const uploadResponse = await this.octokit.rest.repos.createOrUpdateFileContents({
        owner: this.owner,
        repo: this.repo,
        message: `feat: add updated image ${newFileName}`,
        content: contentEncoded,
        path: newFilePath,
      })
      try {
        await this.octokit.rest.repos.deleteFile({
          owner: this.owner,
          repo: this.repo,
          path: oldFilePath,
          message: `chore: cleanup old image ${oldFilePath}`,
          sha: oldSha,
        })
      } catch (deleteError) {
        console.warn('Warning: Failed to delete old image file during update:', deleteError.message);
      }

      return {
        success: true,
        imageUrl: uploadResponse.data.content.download_url,
        sha: uploadResponse.data.content.sha,
        filePath: newFilePath,
      }
    } catch (error) {
      throw new AppError(`GitHub Fetch Error:${error.message}`, error.status || 500);
    }
  }
}

export default new GithubServices();