const blobToBase64 = (blob: Blob, callback: (base64data: string | undefined) => void): void => {
  const reader = new FileReader();
  reader.onload = function(): void {
    const base64data = reader.result?.toString().split(",")[1];
    callback(base64data);
  };
  reader.readAsDataURL(blob);
};

export { blobToBase64 };