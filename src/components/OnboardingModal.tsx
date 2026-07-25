import React from 'react';
import { Sparkles, Smartphone, Code, Download, CheckCircle, ArrowRight } from 'lucide-react';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDownloadZip: () => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  isOpen,
  onClose,
  onDownloadZip,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/70 backdrop-blur-xs">
      <div className="w-full max-w-lg bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 rounded-3xl shadow-2xl border border-stone-200 dark:border-stone-800 p-6 space-y-6">
        {/* Welcome Icon */}
        <div className="flex items-center justify-center w-14 h-14 mx-auto rounded-2xl bg-emerald-600 text-white shadow-lg">
          <Sparkles className="w-8 h-8" />
        </div>

        <div className="text-center space-y-1">
          <h2 className="text-xl font-bold tracking-tight">ChatGPT Mobile & Android Repo</h2>
          <p className="text-xs text-stone-500 dark:text-stone-400">
            Full-featured ChatGPT mobile experience & production-ready Kotlin Jetpack Compose app code.
          </p>
        </div>

        {/* Feature List */}
        <div className="space-y-3 text-xs">
          <div className="flex items-start space-x-3 p-3 rounded-2xl bg-stone-50 dark:bg-stone-800/80 border border-stone-200/80 dark:border-stone-700/60">
            <Smartphone className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold block text-stone-900 dark:text-stone-100">Live Mobile ChatGPT Preview</span>
              <span className="text-stone-500 dark:text-stone-400">
                Token-by-token streaming, vision image attachments, conversation search, and dark mode.
              </span>
            </div>
          </div>

          <div className="flex items-start space-x-3 p-3 rounded-2xl bg-stone-50 dark:bg-stone-800/80 border border-stone-200/80 dark:border-stone-700/60">
            <Code className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold block text-stone-900 dark:text-stone-100">Full Jetpack Compose Codebase</span>
              <span className="text-stone-500 dark:text-stone-400">
                Built with MVVM, Hilt DI, Room DB, Retrofit SSE streaming, and EncryptedSharedPreferences.
              </span>
            </div>
          </div>

          <div className="flex items-start space-x-3 p-3 rounded-2xl bg-stone-50 dark:bg-stone-800/80 border border-stone-200/80 dark:border-stone-700/60">
            <Download className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold block text-stone-900 dark:text-stone-100">Codemagic CI/CD Ready</span>
              <span className="text-stone-500 dark:text-stone-400">
                Includes <code className="text-emerald-500 font-mono">codemagic.yaml</code> so you can push directly to GitHub and build APKs instantly.
              </span>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          <button
            onClick={onDownloadZip}
            className="flex items-center justify-center space-x-2 w-full sm:w-auto px-4 py-2.5 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 rounded-xl font-medium text-xs transition-colors"
          >
            <Download className="w-4 h-4 text-emerald-500" />
            <span>Download ZIP Repo</span>
          </button>

          <button
            onClick={onClose}
            className="flex items-center justify-center space-x-2 w-full sm:w-auto px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl text-xs shadow-md transition-colors"
          >
            <span>Start Using App</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
