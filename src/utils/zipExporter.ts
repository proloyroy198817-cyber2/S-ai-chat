import JSZip from 'jszip';
import { ANDROID_PROJECT_FILES } from '../data/androidFiles';

export async function downloadAndroidProjectZip(): Promise<void> {
  const zip = new JSZip();

  // Add every file to zip
  ANDROID_PROJECT_FILES.forEach((file) => {
    if (file.isBinary) {
      zip.file(file.path, file.content, { base64: true });
    } else {
      zip.file(file.path, file.content);
    }
  });

  // Generate blob and trigger browser download
  const blob = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'ChatGPT_Android_JetpackCompose_App.zip';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
