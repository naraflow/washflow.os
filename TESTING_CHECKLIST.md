# Testing Checklist - Role-Based Workflow Refactoring

## ✅ Perbaikan yang Sudah Dilakukan

### 1. Role Types & Store
- ✅ Menambahkan `supervisor-outlet` dan `supervisor-produksi` ke role types
- ✅ Update `useDashboardStore` untuk mendukung role baru
- ✅ Default role diubah ke `supervisor-outlet`

### 2. Komponen Supervisor Outlet
- ✅ `OutletTaggingView.tsx` - Tagging dengan RFID/QR
- ✅ `OutletSortingView.tsx` - Outlet Sorting dengan Bag Management
- ✅ `SendToCentralView.tsx` - Send to Central dengan manifest validation
- ⏳ `ReceivedFromCentralView.tsx` - Placeholder (belum dibuat)
- ✅ `ReadyView.tsx` - Reuse existing component
- ⏳ `DeliveryView.tsx` - Placeholder (belum dibuat)

### 3. Komponen Supervisor Produksi
- ✅ `ReceiveFromOutletView.tsx` - Receive from Outlet dengan manifest check
- ✅ `SortingView.tsx` - Reuse existing (akan diubah jadi Central Sorting)
- ✅ `WashingView.tsx` - Reuse existing
- ✅ `DryingView.tsx` - Reuse existing
- ✅ `IronView.tsx` - Reuse existing
- ⏳ `QCView.tsx` - Placeholder (belum dibuat)
- ✅ `PackingView.tsx` - Reuse existing
- ⏳ `SendToOutletView.tsx` - Placeholder (belum dibuat)

### 4. Dashboard Conditional Rendering
- ✅ Menu Supervisor Outlet: Tagging, Outlet Sorting, Send to Central, Received from Central, Ready, Delivery
- ✅ Menu Supervisor Produksi: Receive from Outlet, Central Sorting, Washing, Drying, Ironing, QC, Packing, Send to Outlet
- ✅ Legacy Supervisor tetap didukung untuk backward compatibility
- ✅ Default tab selection berdasarkan role
- ✅ Banner dashboard menampilkan pesan sesuai role

### 5. Dashboard Header
- ✅ Role dropdown menampilkan semua role (Kasir, Supervisor Outlet, Supervisor Produksi, Supervisor Legacy, Owner)
- ✅ Role labels sudah diperbarui

### 6. Bug Fixes
- ✅ Import `Tag` icon di `OutletSortingView.tsx`
- ✅ Remove unused imports (`useState` di `SendToCentralView` dan `ReceiveFromOutletView`)
- ✅ Null check untuk `todayRevenue` di `DashboardHeader.tsx`
- ✅ Null check untuk `totalAmount` di berbagai komponen

## 🧪 Testing Checklist

### A. Role Switching
- [ ] Test switch dari Kasir → Supervisor Outlet
- [ ] Test switch dari Supervisor Outlet → Supervisor Produksi
- [ ] Test switch dari Supervisor Produksi → Owner
- [ ] Test switch kembali ke role sebelumnya
- [ ] Verify menu yang muncul sesuai dengan role
- [ ] Verify default tab sesuai dengan role

### B. Supervisor Outlet Workflow
- [ ] **Tagging Tab**
  - [ ] Order yang dibuat kasir muncul di Tagging tab
  - [ ] Badge notifikasi muncul jika ada pending tagging
  - [ ] Modal Tagging bisa dibuka
  - [ ] RFID scan berfungsi (simulated)
  - [ ] Setelah tagging, order pindah ke Outlet Sorting

- [ ] **Outlet Sorting Tab**
  - [ ] Order yang sudah ditag muncul di Outlet Sorting
  - [ ] Filter by service type berfungsi
  - [ ] Filter by express/regular berfungsi
  - [ ] Create new bag berfungsi
  - [ ] Add order to bag berfungsi
  - [ ] Bag capacity warning muncul jika > 20kg
  - [ ] Mark bag as ready berfungsi
  - [ ] Print manifest berfungsi (simulated)

- [ ] **Send to Central Tab**
  - [ ] Bag yang sudah ready muncul di Send to Central
  - [ ] Scan RFID untuk setiap item berfungsi
  - [ ] Scan manifest QR berfungsi
  - [ ] Handover to courier berfungsi
  - [ ] Status berubah menjadi "In Transit"

- [ ] **Received from Central Tab**
  - [ ] Placeholder muncul dengan benar
  - [ ] (Fitur belum dibuat)

- [ ] **Ready Tab**
  - [ ] Order yang ready muncul
  - [ ] Mark as picked berfungsi

- [ ] **Delivery Tab**
  - [ ] Order yang ready untuk delivery muncul
  - [ ] (Fitur belum dibuat)

### C. Supervisor Produksi Workflow
- [ ] **Receive from Outlet Tab**
  - [ ] Bag yang sedang in transit muncul
  - [ ] Validate manifest berfungsi
  - [ ] Scan RFID berfungsi
  - [ ] Warning muncul jika ada item tanpa RFID
  - [ ] Receive & Move to Sorting berfungsi
  - [ ] Status berubah menjadi "Central Sorting"

- [ ] **Central Sorting Tab**
  - [ ] Order yang diterima muncul
  - [ ] (Menggunakan SortingView yang ada, perlu disesuaikan)

- [ ] **Washing Tab**
  - [ ] Order di washing stage muncul
  - [ ] Move to drying berfungsi

- [ ] **Drying Tab**
  - [ ] Order di drying stage muncul
  - [ ] Move to next stage berfungsi

- [ ] **Ironing Tab**
  - [ ] Order di ironing stage muncul
  - [ ] Move to packing berfungsi

- [ ] **QC Tab**
  - [ ] Placeholder muncul dengan benar
  - [ ] (Fitur belum dibuat)

- [ ] **Packing Tab**
  - [ ] Order di packing stage muncul
  - [ ] Move to ready berfungsi

- [ ] **Send to Outlet Tab**
  - [ ] Placeholder muncul dengan benar
  - [ ] (Fitur belum dibuat)

### D. Data Flow & State Management
- [ ] Order yang dibuat kasir memiliki `taggingRequired = true` dan `taggingStatus = 'pending'`
- [ ] Setelah tagging, `taggingStatus = 'tagged'` dan `currentStage = 'sorting'`
- [ ] Setelah ditambahkan ke bag, `sortingMetadata.status = 'in_bag'`
- [ ] Setelah bag finalized, `sortingMetadata.status = 'ready_for_pickup'`
- [ ] Setelah handover, `currentStage = 'in-transit-to-central'`
- [ ] Setelah received, `currentStage = 'central-sorting'`
- [ ] Workflow logs tersimpan dengan benar

### E. UI/UX
- [ ] Badge notifikasi muncul dengan benar
- [ ] Badge notifikasi hilang setelah proses selesai
- [ ] Menu tidak overlap antar role
- [ ] Tidak ada menu yang tidak relevan untuk role tertentu
- [ ] Dashboard banner menampilkan pesan yang benar
- [ ] Role dropdown menampilkan semua role dengan benar

### F. Error Handling
- [ ] Tidak ada error di console
- [ ] Null check bekerja dengan benar
- [ ] Empty state ditampilkan dengan benar
- [ ] Loading state (jika ada) bekerja dengan benar

## 🐛 Known Issues / Placeholders

1. **Received from Central** - Masih placeholder, perlu dibuat komponen lengkap dengan Rack Management
2. **Delivery** - Masih placeholder, perlu dibuat komponen lengkap dengan GPS, ETA, foto penyerahan
3. **Central Sorting** - Masih menggunakan SortingView yang ada, perlu dibuat versi khusus untuk central facility
4. **QC** - Masih placeholder, perlu dibuat komponen lengkap dengan checklist dan foto QC
5. **Send to Outlet** - Masih placeholder, perlu dibuat komponen lengkap dengan manifest per outlet

## 📝 Next Steps

1. Test semua workflow yang sudah dibuat
2. Buat komponen yang masih placeholder
3. Implementasi fitur tambahan (Rack System, Enhanced Bag Management, dll)
4. Testing end-to-end workflow
5. Performance testing jika diperlukan

