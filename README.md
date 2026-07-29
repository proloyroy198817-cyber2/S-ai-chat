# 🚀 S-AI Chat / ChatGPT PC & Mobile Application

Google AI Studio থেকে প্রজেক্টটি সরাসরি ডাউনলোড/এক্সপোর্ট করে আপনার **পিসি (Windows / Mac / Linux)** অথবা মোবাইলে ইন্সটল এবং ব্যবহার করার সম্পূর্ণ নির্দেশিকা।

---

## 🇧🇩 পিসিতে (PC) কীভাবে ইন্সটল ও চালু করবেন (How to Run/Install on PC)

### ধাপ ১: প্রজেক্ট ডাউনলোড / এক্সপোর্ট করুন (Export Project)
১. **Google AI Studio**-র উপরের ডানপাশের **Settings (⚙️)** বা **Export** মেনুতে যান।
২. **Export to ZIP** অথবা **Export to GitHub** নির্বাচন করে ফাইলগুলো আপনার কম্পিউটারে (PC) ডাউনলোড করুন।
৩. ডাউনলোডকৃত ZIP ফাইলটি Unzip / Extract করুন।

### ধাপ ২: Node.js ইনস্টল করুন (Node.js Requirements)
* আপনার পিসিতে **Node.js** (v18 বা তার নতুন ভার্সন) ইন্সটল করা থাকতে হবে।
* ইন্সটল না থাকলে [nodejs.org](https://nodejs.org) থেকে **LTS Version** ডাউনলোড করে ইন্সটল করে নিন।

### ধাপ ৩: ১-ক্লিকে চালু করুন (1-Click Start)
* **Windows PC ব্যবহারকারীদের জন্য:**
  ফোল্ডারের ভেতরে থাকা `start-pc.bat` ফাইলটিতে ডাবল ক্লিক করুন। এটি নিজে থেকেই প্রয়োজনীয় ফাইল ডিপেনডেন্সি (`npm install`) ইনস্টল করে সার্ভার রান করে দেবে!
* **Mac / Linux ব্যবহারকারীদের জন্য:**
  টার্মিনালে `chmod +x start-pc.sh && ./start-pc.sh` কমান্ডটি চালান।

---

### 🛠️ ম্যানুয়াল কমান্ড (Manual Commands)

ফোল্ডারের ভেতরে CMD / Terminal চালু করে নিচের কমান্ডগুলো দিন:

```bash
# ১. ডিপেনডেন্সি ইনস্টল করুন
npm install

# ২. সার্ভার রান করুন (Development Mode)
npm run dev
```

সার্ভার চালু হলে ব্রাউজারে খুলুন: **`http://localhost:3000`**

---

## 💻 পিসিতে অ্যাপ হিসেবে ইনস্টল করুন (Desktop PWA App Install)
১. **Google Chrome** অথবা **Microsoft Edge** ব্রাউজারে `http://localhost:3000` খুলুন।
২. ব্রাউজারের অ্যাড্রেস বারের ডানপাশে **Install App** বা **App Icon (➕)** দেখতে পাবেন, সেখানে ক্লিক করুন।
৩. এটি আপনার পিসির ডেক্সটপ (Desktop Shortcut) এবং স্টার্ট মেনুতে একটি স্বতন্ত্র সফটওয়্যার/অ্যাপ হিসেবে ইনস্টল হয়ে যাবে!

---

## 🔑 Gemini API Key সেটআপ (Optional)
* অ্যাপটি চালু করে স্ক্রিনের উপরের **Settings (⚙️)** আইকনে ক্লিক করে সরাসরি আপনার **Gemini API Key** বসিয়ে দিতে পারেন।
* অথবা ফোল্ডারে একটি `.env` ফাইল তৈরি করে লিখুন:
  ```env
  GEMINI_API_KEY=your_gemini_api_key_here
  ```

---

## ✨ Features (বৈশিষ্ট্যসমূহ)
* 🤖 **Smart Gemini AI Chat**: Bengali & English natural conversations.
* 🎨 **AI Image Generation**: Text prompt to HD Image using Pollinations AI.
* 🎬 **AI Video Creation**: Text prompt to full motion HD Video preview & download.
* 🌐 **Real-time Web Search**: Real-time Google & Bing search grounding.
* 🔍 **Deep Research Engine**: Multi-step deep query reasoning.
* 📱 **Android Export**: Direct Jetpack Compose Kotlin APK project download & CI/CD.

Enjoy using **S-AI Chat**! 🚀
