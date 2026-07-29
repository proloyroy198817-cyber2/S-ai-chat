import React, { useState } from 'react';
import { X, Laptop, Smartphone, ExternalLink, CheckCircle2, Download, Sparkles, Usb, Cpu, Code2 } from 'lucide-react';
import { downloadAndroidProjectZip } from '../utils/zipExporter';

interface InstallModalProps {
  isOpen: boolean;
  onClose: () => void;
  deferredPrompt: any;
  onTriggerNativeInstall: () => void;
}

export const InstallModal: React.FC<InstallModalProps> = ({
  isOpen,
  onClose,
  deferredPrompt,
  onTriggerNativeInstall,
}) => {
  const [activeTab, setActiveTab] = useState<'usb' | 'pc' | 'apk'>('usb');

  if (!isOpen) return null;

  const handleOpenNewTab = () => {
    window.open(window.location.href, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/70 backdrop-blur-xs animate-fade-in">
      <div className="relative w-full max-w-xl bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 rounded-2xl shadow-2xl border border-stone-200 dark:border-stone-800 overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-stone-100 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-900/50">
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-emerald-600/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400">
              <Usb className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg tracking-tight">
                Phone & PC Install Center (ইনস্টলেশন গাইড)
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                পিসি থেকে ডাটা কেবল দিয়ে ফোনে বা পিসিতে অ্যাপ ইনস্টল করার উপায়
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 rounded-lg hover:bg-stone-200 dark:hover:bg-stone-800 transition-colors"
            id="btn-close-install-modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-stone-200 dark:border-stone-800 bg-stone-100/60 dark:bg-stone-800/40 p-1">
          <button
            onClick={() => setActiveTab('usb')}
            className={`flex-1 flex items-center justify-center space-x-1.5 py-2 px-3 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'usb'
                ? 'bg-white dark:bg-stone-800 text-emerald-600 dark:text-emerald-400 shadow-xs'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
            }`}
            id="tab-install-usb"
          >
            <Usb className="w-4 h-4" />
            <span>১. ইউএসবি কেবল দিয়ে ফোনে (USB)</span>
          </button>

          <button
            onClick={() => setActiveTab('apk')}
            className={`flex-1 flex items-center justify-center space-x-1.5 py-2 px-3 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'apk'
                ? 'bg-white dark:bg-stone-800 text-emerald-600 dark:text-emerald-400 shadow-xs'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
            }`}
            id="tab-install-apk"
          >
            <Cpu className="w-4 h-4" />
            <span>২. APK বিল্ডার (Codemagic/Gradle)</span>
          </button>

          <button
            onClick={() => setActiveTab('pc')}
            className={`flex-1 flex items-center justify-center space-x-1.5 py-2 px-3 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'pc'
                ? 'bg-white dark:bg-stone-800 text-emerald-600 dark:text-emerald-400 shadow-xs'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
            }`}
            id="tab-install-pc"
          >
            <Laptop className="w-4 h-4" />
            <span>৩. পিসি ডেক্সটপ অ্যাপ (PWA)</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4 max-h-[65vh] overflow-y-auto text-sm">
          {/* TAB 1: USB Cable to Phone */}
          {activeTab === 'usb' && (
            <div className="space-y-4">
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl space-y-2">
                <div className="flex items-center space-x-2 text-emerald-800 dark:text-emerald-300 font-semibold">
                  <Smartphone className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  <span>পিসিতে ডাটা কেবল দিয়ে ফোনে APK ইনস্টল করার নিয়ম:</span>
                </div>
                <p className="text-xs text-emerald-700 dark:text-emerald-400 leading-relaxed">
                  আপনার পিসি (PC) এর সাথে ইউএসবি ডাটা কেবল (USB Cable) লাগিয়ে সরাসরি আপনার অ্যান্ড্রেয়েড ফোনে APK পাঠাতে ও ইনস্টল করতে নিচের যেকোনো একটি সহজ পদ্ধতি অনুসরণ করুন:
                </p>
              </div>

              <div className="space-y-3 text-xs">
                {/* Method A */}
                <div className="p-3 bg-stone-50 dark:bg-stone-800/50 rounded-xl border border-stone-200 dark:border-stone-800 space-y-2">
                  <div className="flex items-center justify-between font-bold text-stone-900 dark:text-stone-100">
                    <span className="flex items-center space-x-1.5">
                      <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px]">A</span>
                      <span>পদ্ধতি ১: APK ডাউনলোড করে ডাটা কেবলে পাঠানো (সবচেয়ে সহজ)</span>
                    </span>
                  </div>
                  <ol className="list-decimal list-inside space-y-1 text-stone-600 dark:text-stone-300">
                    <li>প্রথমে অ্যাপের নিচে দেওয়া <strong>Download Android ZIP</strong> বাটনে ক্লিক করে প্রোজেক্ট ফাইলটি পিসিতে ডাউনলোড করুন।</li>
                    <li>পিসির ফাইল এক্সপ্লোরার থেকে ইউএসবি ডাটা কেবল দিয়ে ফোনের <strong>Download</strong> ফোল্ডারে APK বা ZIP ফাইলটি কপি করে নিন।</li>
                    <li>ফোনের ফাইল ম্যানেজার খুলে APK ফাইলটিতে টাচ করে <strong>Install</strong> করে নিন!</li>
                  </ol>
                </div>

                {/* Method B */}
                <div className="p-3 bg-stone-50 dark:bg-stone-800/50 rounded-xl border border-stone-200 dark:border-stone-800 space-y-2">
                  <div className="flex items-center justify-between font-bold text-stone-900 dark:text-stone-100">
                    <span className="flex items-center space-x-1.5">
                      <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px]">B</span>
                      <span>পদ্ধতি ২: ADB Command দিয়ে ১-ক্লিক ডাটা কেবল ইনস্টল</span>
                    </span>
                  </div>
                  <p className="text-stone-600 dark:text-stone-300">
                    ফোনে <strong>Developer Options &gt; USB Debugging</strong> চালু করে পিসি ডাটা কেবলে যুক্ত করুন। তারপর পিসির টার্মিনালে রান করুন:
                  </p>
                  <pre className="p-2 bg-stone-900 text-emerald-400 font-mono text-[11px] rounded-lg overflow-x-auto">
                    adb install app-debug.apk
                  </pre>
                </div>
              </div>

              <button
                onClick={downloadAndroidProjectZip}
                className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl shadow-md transition-all text-sm"
                id="btn-modal-download-zip"
              >
                <Download className="w-4 h-4" />
                <span>Download Android Project & APK Files (.ZIP)</span>
              </button>
            </div>
          )}

          {/* TAB 2: APK Builder */}
          {activeTab === 'apk' && (
            <div className="space-y-4">
              <div className="p-4 bg-stone-100 dark:bg-stone-800/80 rounded-xl space-y-2 border border-stone-200 dark:border-stone-700">
                <div className="flex items-center space-x-2 font-semibold text-stone-800 dark:text-stone-200">
                  <Code2 className="w-5 h-5 text-emerald-500" />
                  <span>অটোমেটিক APK বিল্ডার (Codemagic Cloud CI/CD)</span>
                </div>
                <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
                  এই অ্যাপ্লেটের সাথে ইতিমধ্যেই প্রস্তুতকৃত <strong>`codemagic.yaml`</strong> ও <strong>`build.gradle.kts`</strong> কনফিগারেশন যোগ করা আছে।
                </p>
              </div>

              <div className="p-3 bg-stone-50 dark:bg-stone-800/50 rounded-xl border border-stone-200 dark:border-stone-800 space-y-2 text-xs">
                <h4 className="font-bold text-stone-900 dark:text-stone-100">
                  ১-ক্লিকে বিনামূল্যে অনলাইন APK তৈরি করার ধাপ:
                </h4>
                <ul className="list-disc list-inside space-y-1 text-stone-600 dark:text-stone-300">
                  <li><strong>GitHub:</strong> আপনার AI Studio অ্যাপটিকে GitHub এ push/export করুন।</li>
                  <li><strong>Codemagic:</strong> <a href="https://codemagic.io" target="_blank" rel="noreferrer" className="text-emerald-500 underline">Codemagic.io</a> তে ফ্রি লগইন করে আপনার GitHub রিপোজিটরি যুক্ত করুন।</li>
                  <li><strong>Auto Build:</strong> প্রজেক্টে থাকা `codemagic.yaml` ফাইলটি নিজে থেকেই চিহ্নিত করে ৩ মিনিটের মধ্যে <strong>.APK</strong> বিল্ড করে আপনার ইমেইলে পাঠিয়ে দেবে!</li>
                </ul>
              </div>

              <div className="p-3 bg-stone-50 dark:bg-stone-800/50 rounded-xl border border-stone-200 dark:border-stone-800 space-y-2 text-xs">
                <h4 className="font-bold text-stone-900 dark:text-stone-100">
                  পিসিতে Android Studio বা Gradle দিয়ে APK বিল্ড:
                </h4>
                <p className="text-stone-600 dark:text-stone-300">
                  প্রজেক্টটি ডাউনলোড করে পিসির টার্মিনালে নিচের ফাইল অথবা কমান্ড দিন:
                </p>
                <pre className="p-2 bg-stone-900 text-emerald-400 font-mono text-[11px] rounded-lg overflow-x-auto">
                  ./gradlew assembleDebug
                </pre>
              </div>
            </div>
          )}

          {/* TAB 3: PC Desktop App */}
          {activeTab === 'pc' && (
            <div className="space-y-4">
              {deferredPrompt ? (
                <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl space-y-3">
                  <div className="flex items-start space-x-3">
                    <Sparkles className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-emerald-900 dark:text-emerald-300">
                        ১-ক্লিক ইনস্টলেশন প্রস্তুত (Ready to Install)
                      </h4>
                      <p className="text-xs text-emerald-700 dark:text-emerald-400 mt-0.5">
                        আপনার ব্রাউজার অ্যাপটি ইনস্টল করার জন্য প্রস্তুত। নিচের বাটনে ক্লিক করুন:
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={onTriggerNativeInstall}
                    className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-lg shadow-md transition-all text-sm"
                    id="btn-trigger-native-install-tab"
                  >
                    <Download className="w-4 h-4" />
                    <span>ইনস্টল করুন (Install App Now)</span>
                  </button>
                </div>
              ) : (
                <div className="p-4 bg-stone-100 dark:bg-stone-800/80 rounded-xl space-y-3 border border-stone-200 dark:border-stone-700">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wide text-emerald-600 dark:text-emerald-400">
                      Quick Open & Install
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-stone-200 dark:bg-stone-700 font-medium">
                      PC Chrome / Edge
                    </span>
                  </div>
                  <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
                    Google AI Studio-র প্রিভিউ উইন্ডো (iframe) তে নিরাপত্তা বিধির কারণে ব্রাউজার ইনস্টল ডায়ালগ আটকে থাকে। <strong>নতুন ট্যাবে খুললেই</strong> ব্রাউজারের অ্যাড্রেস বারে ইনস্টল বাটন চলে আসবে!
                  </p>
                  <button
                    onClick={handleOpenNewTab}
                    className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-lg shadow-md transition-all text-sm"
                    id="btn-open-new-tab-install-tab"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>নতুন ট্যাবে খুলুন ও ইনস্টল করুন (Open in New Tab)</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t border-stone-100 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-900/50">
          <div className="flex items-center space-x-1 text-xs text-stone-500">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>USB Cable ADB & Codemagic APK Builder Support</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-stone-200 dark:bg-stone-800 hover:bg-stone-300 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 rounded-lg text-xs font-semibold transition-colors"
            id="btn-close-install-modal-footer"
          >
            বন্ধ করুন (Close)
          </button>
        </div>
      </div>
    </div>
  );
};

