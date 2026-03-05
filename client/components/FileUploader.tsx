import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Image as ImageIcon, X } from 'lucide-react';

interface FileUploaderProps {
  onFileSelect: (file: File | null) => void;
  accept?: string;
  preview?: string;
}

export function FileUploader({ onFileSelect, accept, preview }: FileUploaderProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(preview || null);

  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onFileSelect(file);
      const reader = new FileReader();
      reader.onload = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }, [onFileSelect]);

  const handleClear = useCallback(() => {
    onFileSelect(null);
    setPreviewUrl(null);
  }, [onFileSelect]);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => document.getElementById('file-upload')?.click()}
        >
          <ImageIcon className="w-4 h-4 mr-2" />
          Select File
        </Button>
        {previewUrl && (
          <Button
            type="button"
            variant="outline"
            onClick={handleClear}
            className="text-red-500 hover:text-red-600"
          >
            <X className="w-4 h-4 mr-2" />
            Remove
          </Button>
        )}
      </div>

      <input
        id="file-upload"
        type="file"
        accept={accept}
        onChange={handleFileSelect}
        style={{ display: 'none' }}
      />

      {previewUrl && accept?.startsWith('image/') && (
        <div className="relative aspect-video w-full max-w-sm overflow-hidden rounded-lg border">
          <img
            src={previewUrl}
            alt="Preview"
            className="object-cover"
          />
        </div>
      )}
    </div>
  );
}
