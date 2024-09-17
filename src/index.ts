import 'reflect-metadata';
import express from 'express';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { buildSchema } from 'type-graphql';
import bodyParser from 'body-parser';
import { AddressBookResolver } from './resolvers/AddressBookResolver';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';
import PDFDocument from 'pdfkit';
import path from 'path';
import multer from 'multer';
import fs from 'fs';
import cors from 'cors';

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, 'uploads');
    fs.mkdirSync(uploadDir, { recursive: true }); // Create uploads directory if it doesn't exist
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`); // Generate unique filename
  },
});

const upload = multer({ storage });

(async () => {
  const app = express();
  app.use(cors());

  // GraphQL schema
  const schema = await buildSchema({
    resolvers: [AddressBookResolver],
  });

  // ApolloServer initialization
  const server = new ApolloServer({
    schema,
  });

  await server.start();

  // Apply middleware (manual setup)
  app.use(
    '/graphql',
    bodyParser.json(),
    expressMiddleware(server)
  );

  app.post('/upload', upload.single('file'), (req, res) => {
    if (req.file) {
      const filePath = req.file.path; 
      res.json({ filePath });
    } else {
      res.status(400).send('No file uploaded.');
    }
  });

  app.get('/uploads/:filename', (req, res) => {
    const filename = req.params.filename;
    const filePath = path.join(__dirname, '../../uploads', filename);
    res.download(filePath, (err) => {
      if (err) {
        res.status(404).send('File not found');
      }
    });
  });

  // Setup Swagger documentation
  const swaggerOptions = {
    swaggerDefinition: {
      openapi: '3.0.0',
      info: {
        title: 'Address Book API',
        version: '1.0.0',
        description: 'API Documentation for Address Book',
      },
    },
    apis: ['./src/resolvers/*.ts'],
  };
  const swaggerDocs = swaggerJsdoc(swaggerOptions);
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

  // Start the Express server
  const PORT = process.env.PORT || 4000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`GraphQL: http://localhost:${PORT}/graphql`);
    console.log(`Swagger: http://localhost:${PORT}/api-docs`);
  });
})();
