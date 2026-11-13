import { useEffect, useState } from 'react';

// 고른 사진 파일을 <img src>에 넣을 수 있는 주소(data URL)로 읽는다. 파일이 없으면 null.
export function useFileDataUrl(file: File | null | undefined) {
  const [dataUrl, setDataUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!file) return;
    let isActive = true;
    const reader = new FileReader();
    reader.onload = () => {
      if (isActive && typeof reader.result === 'string') setDataUrl(reader.result);
    };
    reader.readAsDataURL(file);
    return () => {
      isActive = false;
      reader.abort();
    };
  }, [file]);

  return file ? dataUrl : null;
}
