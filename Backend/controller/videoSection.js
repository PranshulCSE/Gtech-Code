const cloudinary = require('cloudinary').v2;
const Problem = require("../model/PS");
const User = require("../model/User");
const SolutionVideo = require("../model/solutionVideo");
const { sanitizeFilter } = require('mongoose');
require('dotenv').config();

const cloudName = process.env.CLOUDINARY_CLOUD_NAME?.trim();
const cloudApiKey = process.env.CLOUDINARY_API_KEY?.trim();
const cloudApiSecret = process.env.CLOUDINARY_API_SECRET?.trim();


cloudinary.config({
  cloud_name: cloudName,
  api_key: cloudApiKey,
  api_secret: cloudApiSecret
});

const generateUploadSignature = async (req, res) => {
  try {
    const { problemId } = req.params;

    const userId = req.user?._id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized access' });
    }
    // Verify problem exists
    const problem = await Problem.findById(problemId);
    if (!problem) {
      return res.status(404).json({ error: 'Problem not found' });
    }

    // Generate unique public_id for the video
    const timestamp = Math.round(new Date().getTime() / 1000);
    const publicId = `gtech-code-solutions/${problemId}/${userId}_${timestamp}`;

    // Upload parameters
    const uploadParams = {
      timestamp: timestamp,
      public_id: publicId,
    };

    // Generate signature
    const signature = cloudinary.utils.api_sign_request(
      uploadParams,
      cloudApiSecret
    );

    res.json({
      signature,
      timestamp,
      public_id: publicId,
      api_key: cloudApiKey,
      cloud_name: cloudName,
      upload_url: `https://api.cloudinary.com/v1_1/${cloudName}/video/upload`,
    });

  } catch (error) {
    console.error('Error generating upload signature:', error);
    res.status(500).json({ error: 'Failed to generate upload credentials' });
  }
};


const saveVideoMetadata = async (req, res) => {
  try {
    const {
      problemId,
      cloudinaryPublicId,
      secureUrl,
      duration,
    } = req.body;

    const userId = req.user?._id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized access' });
    }

    // Verify the upload with Cloudinary
    const cloudinaryResource = await cloudinary.api.resource(
      cloudinaryPublicId,
      { resource_type: 'video' }
    );

    if (!cloudinaryResource) {
      return res.status(400).json({ error: 'Video not found on Cloudinary' });
    }

    // Check if video already exists for this problem and user
    const existingVideo = await SolutionVideo.findOne({
      problemId,
      userId,
      cloudinaryPublicId
    });

    if (existingVideo) {
      return res.status(409).json({ error: 'Video already exists' });
    }

    const thumbnailUrl = cloudinary.url(cloudinaryResource.public_id, {
      resource_type: 'image',
      transformation: [
        { width: 400, height: 225, crop: 'fill' },
        { quality: 'auto' },
        { start_offset: 'auto' }
      ],
      format: 'jpg'
    });

    // Create video solution record
    const videoSolution = await SolutionVideo.create({
      problemId,
      userId,
      cloudinaryPublicId,
      secureUrl,
      duration: cloudinaryResource.duration || duration,
      thumbnailUrl
    });


    res.status(201).json({
      message: 'Video solution saved successfully',
      videoSolution: {
        id: videoSolution._id,
        thumbnailUrl: videoSolution.thumbnailUrl,
        duration: videoSolution.duration,
        uploadedAt: videoSolution.createdAt
      }
    });

  } catch (error) {
    console.error('Error saving video metadata:', error);
    res.status(500).json({ error: 'Failed to save video metadata' });
  }
};


const deleteVideo = async (req, res) => {
  try {
    const { videoId } = req.params;
    const video = await SolutionVideo.findOneAndDelete({
      $or: [
        { problemId: videoId },
        { _id: videoId }
      ]
    });

    if (!video) {
      return res.status(404).json({ error: 'Video not found' });
    }

    await cloudinary.uploader.destroy(video.cloudinaryPublicId, { resource_type: 'video', invalidate: true });

    res.json({ message: 'Video deleted successfully' });

  } catch (error) {
    console.error('Error deleting video:', error);
    res.status(500).json({ error: 'Failed to delete video' });
  }
};

module.exports = { generateUploadSignature, saveVideoMetadata, deleteVideo };