import express from 'express';
import multer from 'multer';
import * as trpcExpress from '@trpc/server/adapters/express';
import { initTRPC } from '@trpc/server';
import { z } from 'zod';

// -----------------------------
// tRPC Init
// -----------------------------
const t = initTRPC.create();
const router = t.router;
const publicProcedure = t.procedure;

// -----------------------------
// Mock Classification Logic
// -----------------------------
function randomClassification() {
  const label = Math.random() > 0.5 ? 'cat' : 'dog';
  return {
    label,
    confidence: +(0.5 + Math.random() * 0.5).toFixed(2),
  };
}

// -----------------------------
// tRPC Router
// -----------------------------
const appRouter = router({
  uploadImage: publicProcedure
    .input(z.object({ imageName: z.string() }))
    .mutation(() => randomClassification()),

  uploadImages: publicProcedure
    .input(z.object({ imageNames: z.array(z.string()) }))
    .mutation(({ input }) =>
      input.imageNames.map(() => randomClassification())
    ),
});

export type AppRouter = typeof appRouter;

// -----------------------------
// Express App
// -----------------------------
const app = express();
const upload = multer({ storage: multer.memoryStorage() });

// REST → Single image upload
app.post('/upload', upload.single('image'), (req: express.Request & { file?: any }, res: express.Response) => {
  const file = req.file;
  res.json({ fileName: file?.originalname });
});

// REST → Multiple image upload
app.post('/upload-multiple', upload.array('images', 10), (req: express.Request & { files?: Express.Multer.File[] }, res: express.Response) => {
  const files = (req.files ?? []) as Express.Multer.File[];
  res.json({ fileNames: files.map(f => f.originalname) });
});

// tRPC Middleware
app.use(
  '/trpc',
  trpcExpress.createExpressMiddleware({
    router: appRouter,
  })
);

// -----------------------------
// Server Start
// -----------------------------
app.listen(4000, () => {
  console.log('🚀 Server running at http://localhost:4000');
});
