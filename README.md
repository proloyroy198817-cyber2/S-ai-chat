# ChatGPT Clone (Android Native & Web Application)

A modern, full-featured ChatGPT Clone application built for both **Android Native (Kotlin, Jetpack Compose, Material 3, Hilt, Room, OkHttp SSE)** and **Web (React, TypeScript, Express, Vite, Tailwind CSS)**.

---

## 📱 Features

- **Jetpack Compose UI**: Modern, fluid, and responsive user interface following Material Design 3 guidelines.
- **Real-Time Streaming**: Streaming response support using Server-Sent Events (SSE) with OkHttp for ultra-fast chat generation.
- **Local Storage & History**: Offline chat history persistence powered by Room Database.
- **Dependency Injection**: Clean architecture with Dagger Hilt for robust dependency management.
- **Device Context Resolver**: Automatic time, date, locale, and device timezone context injection into AI prompts.
- **Web & Cloud Integration**: Full web preview with Express backend proxying Google Gemini API calls securely.
- **CI/CD Ready**: Includes pre-configured `codemagic.yaml` for automated Android APK builds and GitHub Actions workflows.

---

## 📁 Repository Structure

```text
├── app/                          # Android Native App Module
│   ├── src/main/java/com/example/chatgptclone/
│   │   ├── data/                 # Local (Room) and Remote (OkHttp SSE) Data Layer
│   │   ├── di/                   # Dagger Hilt Dependency Injection Modules
│   │   ├── domain/               # Domain Models & Business Logic
│   │   ├── ui/                   # Jetpack Compose Screens & ViewModels
│   │   └── util/                 # Date/Time & Context Resolvers
│   └── build.gradle              # Android App Dependencies & Build Config
├── codemagic.yaml                # Codemagic CI/CD Pipeline
├── src/                          # Web Client (React, TypeScript, Tailwind)
├── server.ts                     # Express Backend Server (Gemini Proxy)
├── build.gradle                  # Root Gradle Build File
└── settings.gradle               # Gradle Settings & Module Inclusions
```

---

## 🚀 Getting Started

### Prerequisites

- **Android Development**: Android Studio Jellyfish or newer, JDK 17, Android SDK 34
- **Web Development**: Node.js 18+ and npm/bun

---

### 🟢 Running the Android App

1. Clone the repository:
   ```bash
   git clone https://github.com/YOUR_USERNAME/ChatGPTClone.git
   cd ChatGPTClone
   ```

2. Open the project in **Android Studio**.

3. Sync Gradle dependencies:
   ```bash
   ./gradlew build
   ```

4. Run on an Emulator or connected Physical Device:
   ```bash
   ./gradlew installDebug
   ```

---

### 🌐 Running the Web Application

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set environment variables in `.env`:
   ```env
   GEMINI_API_KEY="your_gemini_api_key_here"
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open `http://localhost:3000` in your browser.

---

## ⚙️ CI/CD & Automated Builds

This project includes a ready-to-use **Codemagic CI/CD** pipeline (`codemagic.yaml`) that automatically builds debug APKs for every commit:

- **Environment**: Java 17, Mac Mini M1 instance
- **Output Artifacts**: `app/build/outputs/apk/debug/*.apk`

To trigger builds on Codemagic:
1. Connect your GitHub repository to Codemagic.
2. Select the `android-workflow`.
3. Start the build or set up trigger hooks on `push` / `pull_request`.

---

## 🛠 Tech Stack

| Platform | Core Technologies |
| :--- | :--- |
| **Android Native** | Kotlin, Jetpack Compose, Material3, Room DB, Coroutines, Flow, Dagger Hilt, OkHttp SSE |
| **Web** | React 18, TypeScript, Tailwind CSS, Lucide Icons, Vite, Express |
| **AI Integration** | Google Gemini API (`@google/genai`), Server-Sent Events (SSE) Streaming |
| **DevOps & CI** | Gradle 8.7, Codemagic CI/CD, GitHub Actions |

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
