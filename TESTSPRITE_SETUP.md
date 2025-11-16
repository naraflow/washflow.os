# TestSprite Setup Guide

## Setup Environment Variables

Buat file `.env` di root directory dengan konten berikut:

```env
# TestSprite Configuration
VITE_TESTSPRITE_API_KEY=sk-user-nFBcrppFcYh2ZeC8i3quM4ipVJPjwjl5GQ89g-NhRFFkjIucNHDHHckKCLo_XU0EzSR-DJjsKOOJwvIA4Bw1m8M9drBrN_Mz_I39eiuisT_1-CfCWi5E9XkXQNw5z90XtFU
VITE_TESTSPRITE_API_URL=https://api.testsprite.com
```

**Penting:** File `.env` sudah ada di `.gitignore`, jadi tidak akan ter-commit ke git.

## Install Dependencies

Install dependency yang diperlukan untuk testing scripts:

```bash
npm install
```

Script akan menggunakan `tsx` yang sudah ditambahkan ke `devDependencies`.

## Cara Menggunakan

### 1. Error Logging Otomatis

Semua error akan otomatis ter-log ke TestSprite API:
- React component errors (via ErrorBoundary)
- JavaScript runtime errors (via global error handler)
- Unhandled promise rejections
- Query/API errors (via TanStack Query error handler)

### 2. Run Offline Test

Jalankan test offline untuk inspeksi error:

```bash
npm run test:offline
```

Atau dengan custom URL:

```bash
TEST_URL=http://localhost:7000 npm run test:offline
```

### 3. List Errors

Lihat daftar errors yang ter-log:

```bash
npm run test:errors
```

## Setup MCP di Cursor (Opsional)

Untuk menggunakan TestSprite via MCP di Cursor:

1. Buka Cursor Settings → Features → MCP
2. Tambahkan MCP Server baru:
   - **Name:** `TestSprite MCP`
   - **Type:** `stdio`
   - **Command:** `npx -y @testsprite/mcp-server`
   - **Environment Variables:**
     - `TESTSPRITE_API_KEY`: API key Anda (dari .env)

3. Setelah setup, Anda bisa menggunakan MCP tools di Cursor untuk menjalankan test.

## API Client

TestSprite client tersedia di `src/lib/testsprite.ts` dengan methods:

- `testSpriteClient.logError(error)` - Log error ke TestSprite
- `testSpriteClient.runTest(config)` - Jalankan test
- `testSpriteClient.getTestResult(testId)` - Ambil hasil test
- `testSpriteClient.listErrors(filters)` - List semua errors

## Error Types yang Terdeteksi

1. **global_error** - JavaScript runtime errors
2. **unhandled_promise_rejection** - Unhandled promise rejections
3. **query_error** - TanStack Query errors
4. **component_error** - React component errors (via ErrorBoundary)

## Troubleshooting

### API Key tidak terdeteksi

Pastikan:
1. File `.env` ada di root directory
2. Variable name benar: `VITE_TESTSPRITE_API_KEY`
3. Restart dev server setelah menambahkan `.env`

### Test gagal

1. Pastikan aplikasi berjalan di URL yang ditentukan
2. Check API key valid di TestSprite dashboard
3. Check koneksi internet (API calls memerlukan internet)

