require('dotenv').config();
const express = require('express');
const path = require('path');
const compression = require('compression');
const helmet = require('helmet');
const morgan = require('morgan');
const cors = require('cors');
const cloudinary = require('cloudinary').v2;
require('./config/cloudinary.js'); // Initialize cloudinary config
const { verifyToken } = require('./middlewares/authMiddleware.js');
const authRoutes = require('./routes/authRoutes.js');
const courseRoutes = require('./routes/courseRoutes.js');
const lessonRoutes = require('./routes/lessonRoutes.js');
const enrollmentRoutes = require('./routes/enrollmentRoutes.js');
const paymentRoutes = require('./routes/paymentRoutes.js');
const examRoutes = require('./routes/examRoutes.js');
const notificationRoutes = require('./routes/notificationRoutes.js');
const app = express();

// Middleware - CORS PHẢI ĐẶT TRƯỚC
const allowedOrigins = process.env.CORS_ORIGINS 
  ? process.env.CORS_ORIGINS.split(',')
  : ['http://localhost:5173', 'http://81.17.103.180'];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(null, true); // Allow all for now, restrict in production
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// JSON parser - Tăng limit để xử lý hình ảnh base64
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Security and compression
app.use(helmet());
app.use(compression());

// Request logging: use morgan in development only
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('tiny'));
}

// ==================== UPLOAD ENDPOINT ====================
app.post('/api/upload', verifyToken, express.raw({ type: 'application/octet-stream', limit: '50mb' }), async (req, res) => {
  try {
    console.log('📸 Upload request received');
    console.log('Content-Type:', req.get('content-type'));
    
    // Nếu là FormData, cần xử lý khác
    if (req.get('content-type')?.includes('multipart/form-data')) {
      const busboy = require('busboy');
      const bb = busboy({ headers: req.headers });
      
      let fileBuffer = null;

      bb.on('file', (fieldname, file, info) => {
        console.log(`File [${fieldname}]: ${info.filename}`);
        
        const chunks = [];
        file.on('data', (data) => {
          chunks.push(data);
        });
        
        file.on('end', () => {
          fileBuffer = Buffer.concat(chunks);
          console.log(`File size: ${fileBuffer.length} bytes`);
        });
      });

      bb.on('close', async () => {
        if (!fileBuffer) {
          console.error('No file received');
          return res.status(400).json({ status: 'error', message: 'Chưa chọn file' });
        }

        console.log('Uploading to Cloudinary...');
        
        try {
          const uploadStream = cloudinary.uploader.upload_stream(
            {
              resource_type: 'auto',
              folder: 'e-learning',
            },
            (error, result) => {
              if (error) {
                console.error('❌ Cloudinary error:', error);
                return res.status(500).json({ status: 'error', message: 'Lỗi upload lên Cloudinary: ' + error.message });
              }
              console.log('✅ Upload success:', result.secure_url);
              res.json({ status: 'success', url: result.secure_url });
            }
          );

          uploadStream.end(fileBuffer);
        } catch (error) {
          console.error('❌ Stream error:', error);
          res.status(500).json({ status: 'error', message: error.message });
        }
      });

      bb.on('error', (error) => {
        console.error('❌ Busboy error:', error);
        res.status(500).json({ status: 'error', message: error.message });
      });

      req.pipe(bb);
    } else {
      // Nếu là raw binary
      if (!req.body || req.body.length === 0) {
        return res.status(400).json({ status: 'error', message: 'Chưa chọn file' });
      }

      console.log('Uploading to Cloudinary...');
      
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: 'auto',
          folder: 'e-learning',
        },
        (error, result) => {
          if (error) {
            console.error('❌ Cloudinary error:', error);
            return res.status(500).json({ status: 'error', message: 'Lỗi upload lên Cloudinary: ' + error.message });
          }
          console.log('✅ Upload success:', result.secure_url);
          res.json({ status: 'success', url: result.secure_url });
        }
      );

      uploadStream.end(req.body);
    }
  } catch (error) {
    console.error('❌ Upload error:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/lessons', lessonRoutes);
app.use('/api/enrollments',enrollmentRoutes );
app.use('/api/payments', paymentRoutes);
app.use('/api/exams', examRoutes);
app.use('/api/notifications', notificationRoutes);

// Scheduled job: Kiểm tra và tạo thông báo exam mỗi giờ
const notificationController = require('./controllers/notificationController');
setInterval(() => {
  console.log('🕐 Đang kiểm tra exam notifications...');
  // Gọi function mà không cần res (internal call)
  notificationController.checkAndCreateExamNotifications(null);
}, 60 * 60 * 1000); // Mỗi 60 phút

// Chạy ngay khi server start
setTimeout(() => {
  console.log('🕐 Kiểm tra exam notifications lần đầu...');
  notificationController.checkAndCreateExamNotifications(null);
}, 10000); // Sau 10 giây khi server start

const PORT = process.env.PORT || 5001;
// Serve frontend static files in production if available
if (process.env.NODE_ENV === 'production') {
  const staticDir = path.join(__dirname, '..', 'e-learning-app', 'dist');
  app.use(express.static(staticDir, { maxAge: '30d' }));
  app.get('*', (req, res) => {
    res.sendFile(path.join(staticDir, 'index.html'));
  });
}
app.listen(PORT, () => {
  console.log(`🚀 Server chạy ở http://localhost:${PORT}`);
});
