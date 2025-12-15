import { createTRPCProxyClient, httpBatchLink } from '@trpc/client';
import type { AppRouter } from './server';

// -----------------------------
// tRPC Client (TypeScript)
// -----------------------------
const client = createTRPCProxyClient<AppRouter>({
  links: [
    httpBatchLink({
      url: 'http://localhost:4000/trpc',
    }),
  ],
});

// -----------------------------
// Upload Single Image
// -----------------------------
async function uploadSingle() {
  console.time('single');

  const res = await client.uploadImage.mutate({
    imageName: 'cat1.png',
  });

  console.timeEnd('single');
  console.log('Single result:', res);
}

// -----------------------------
// Upload Multiple Images
// -----------------------------
async function uploadMultiple() {
  console.time('multiple');

  const res = await client.uploadImages.mutate({
    imageNames: ['1.png', '2.png', '3.png', '4.png', '5.png'],
  });

  console.timeEnd('multiple');
  console.log('Multiple results:', res);
}

// -----------------------------
// Run
// -----------------------------
uploadSingle().then(uploadMultiple);
