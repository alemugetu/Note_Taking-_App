import multer from 'multer'
import { cloudinary } from '../config/cloudinary.js'

const storage = multer.memoryStorage()
// const upload = multer({ storage })
// Add file size and type limits

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow images, PDFs, documents
    const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|txt/;
    const extname = allowedTypes.test(file.originalname.toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only images, PDFs, and documents allowed.'));
    }
  }
});

function uploadMiddleware() {
  return upload.single('file')
}

async function uploadFile(req, res) {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' })

      const streamUpload = (buffer) => {
        return Promise.race([
          new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
              { resource_type: 'auto' },
              (error, result) => {
                if (error) reject(error);
                else if (result) resolve(result);
                else reject(new Error('Upload failed: No result'));
              }
            );
            stream.on('error', reject);
            stream.end(buffer);
          }),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Upload timeout after 30 seconds')), 30000)
          )
        ]);
      };

    const result = await streamUpload(req.file.buffer)
    return res.json({ success: true, data: { url: result.secure_url, public_id: result.public_id, raw: result } })
  } catch (err) {
    console.error('Upload error', err)
    return res.status(500).json({ success: false, message: 'Upload failed' })
  }
}

export { uploadMiddleware, uploadFile }
