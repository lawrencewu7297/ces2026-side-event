# Vercel 部署指南 (Deployment Guide)

本專案是一個標準的 React + Vite 應用程式，非常適合部署在 Vercel 上。

## 方法一：透過 GitHub 部署 (推薦)

這是最簡單且標準的做法，可以享受 Vercel 的自動 CI/CD (持續整合/持續部署)。

1. **上傳程式碼**：
   - 將解壓縮後的資料夾內容上傳到您自己的 GitHub (或 GitLab/Bitbucket) 儲存庫。

2. **在 Vercel 匯入專案**：
   - 登入 [Vercel Dashboard](https://vercel.com/dashboard)。
   - 點擊 **"Add New..."** -> **"Project"**。
   - 選擇 **"Import Git Repository"** 並連結您剛剛建立的 GitHub 儲存庫。

3. **設定構建參數 (Build Settings)**：
   - Vercel 通常會自動偵測這是一個 Vite 專案，預設設定通常是正確的：
     - **Framework Preset**: `Vite`
     - **Build Command**: `npm run build` (或 `vite build`)
     - **Output Directory**: `dist`
   - 點擊 **"Deploy"**。

4. **完成**：
   - 等待約 1 分鐘，部署完成後 Vercel 會提供您一個永久的網址 (例如 `your-project.vercel.app`)。

---

## 方法二：使用 Vercel CLI (進階)

如果您熟悉指令列操作，也可以直接從電腦部署。

1. 安裝 Vercel CLI：`npm i -g vercel`
2. 在專案資料夾中開啟終端機 (Terminal)。
3. 執行指令：`vercel`
4. 依照畫面提示操作 (設定專案名稱等)，大部分選擇預設值 (Enter) 即可。
5. 部署完成後，CLI 會顯示 Production 網址。

## 注意事項

- **資料保存 (LocalStorage)**：
  本應用程式使用瀏覽器的 `LocalStorage` 來儲存筆記與狀態。這意味著資料是儲存在「使用者的瀏覽器」中，而非雲端資料庫。
  - 優點：部署簡單，無需設定後端資料庫，隱私性高。
  - 限制：如果您更換裝置或清除瀏覽器快取，資料會重置。請善用「Export Data」功能備份。
