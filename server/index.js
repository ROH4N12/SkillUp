import app from './app.js';
import connectDB from './config/db.js';
import Course from './models/Course.js';
import { autoSeedDatabase } from './config/seedDatabase.js';
import { buildCourseEmbeddings } from './services/embeddingService.js';

const startServer = async () => {
  const PORT = process.env.PORT || 5000;

  try {
    await connectDB();
    await autoSeedDatabase();
    const courses = await Course.find({});
    if (courses.length > 0) {
      console.log('Pre-building course embeddings for semantic search...');
      await buildCourseEmbeddings(courses);
      console.log('Course embeddings ready!');
    }
  } catch (err) {
    console.error('Server initialization warning:', err.message);
  }

  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
};

startServer();
