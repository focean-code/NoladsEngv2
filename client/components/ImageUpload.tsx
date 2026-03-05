import React, { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { api } from '@/lib/api';
import { Image } from '@shared/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

interface ImageUploadProps {
  onUpload?: (images: Image[]) => void;
  multiple?: boolean;
  entityType?: 'user' | 'service' | 'product' | 'quote';
  entityId?: number;
  maxFiles?: number;
  className?: string;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  onUpload,
  multiple = false,
  entityType,
  entityId,
  maxFiles = 10,
  className = ''
}) => {
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [altTexts, setAltTexts] = useState<{ [key: string]: string }>({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFiles = (files: FileList | null) => {
    if (!files) return;

    const fileArray = Array.from(files);
    const validFiles = fileArray.filter(file => {
      const isValidType = file.type.startsWith('image/');
      const isValidSize = file.size <= 10 * 1024 * 1024; // 10MB
      
      if (!isValidType) {
        toast({
          title: "Invalid file type",
          description: `${file.name} is not a valid image file`,
          variant: "destructive"
        });
        return false;
      }
      
      if (!isValidSize) {
        toast({
          title: "File too large",
          description: `${file.name} exceeds 10MB limit`,
          variant: "destructive"
        });
        return false;
      }
      
      return true;
    });

    if (multiple) {
      const totalFiles = selectedFiles.length + validFiles.length;
      if (totalFiles > maxFiles) {
        toast({
          title: "Too many files",
          description: `Maximum ${maxFiles} files allowed`,
          variant: "destructive"
        });
        return;
      }
      setSelectedFiles(prev => [...prev, ...validFiles]);
    } else {
      setSelectedFiles(validFiles.slice(0, 1));
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    handleFiles(e.dataTransfer.files);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    setAltTexts(prev => {
      const newAltTexts = { ...prev };
      delete newAltTexts[`file-${index}`];
      return newAltTexts;
    });
  };

  const updateAltText = (index: number, altText: string) => {
    setAltTexts(prev => ({
      ...prev,
      [`file-${index}`]: altText
    }));
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;

    setUploading(true);
    try {
      let uploadedImages: Image[] = [];

      if (multiple && selectedFiles.length > 1) {
        const response = await api.images.uploadMultiple(
          selectedFiles,
          entityType,
          entityId
        );
        if (response.data) {
          // Convert URLs to Image objects
          uploadedImages = response.data.map(url => ({
            id: 0, // Temporary ID
            filename: url.split('/').pop() || '',
            original_name: '',
            mime_type: 'image/*',
            size: 0,
            path: url,
            url: url,
            entity_type: entityType,
            entity_id: entityId,
            created_at: new Date().toISOString()
          }));
        }
      } else {
        for (let i = 0; i < selectedFiles.length; i++) {
          const file = selectedFiles[i];
          const altText = altTexts[`file-${i}`];
          const response = await api.images.upload(file, entityType, entityId, altText);
          if (response.data) {
            // Convert URL to Image object
            uploadedImages.push({
              id: 0, // Temporary ID
              filename: response.data.split('/').pop() || '',
              original_name: file.name,
              mime_type: file.type,
              size: file.size,
              path: response.data,
              url: response.data,
              alt_text: altText,
              entity_type: entityType as 'user' | 'service' | 'product' | 'quote',
              entity_id: entityId,
              created_at: new Date().toISOString()
            });
          }
        }
      }

      toast({
        title: "Upload successful",
        description: `${uploadedImages.length} image(s) uploaded successfully`
      });

      onUpload?.(uploadedImages);
      setSelectedFiles([]);
      setAltTexts({});
      
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Upload failed:', error);
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Drop Zone */}
      <div
        className={`
          border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
          ${dragActive ? 'border-primary bg-primary/5' : 'border-gray-300 hover:border-gray-400'}
          ${uploading ? 'opacity-50 cursor-not-allowed' : ''}
        `}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => !uploading && fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple={multiple}
          accept="image/*"
          onChange={handleFileInput}
          className="hidden"
          disabled={uploading}
        />
        
        <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <p className="text-lg font-medium text-gray-900 mb-2">
          {multiple ? 'Upload Images' : 'Upload Image'}
        </p>
        <p className="text-sm text-gray-500">
          Drag and drop {multiple ? 'images' : 'an image'} here, or click to select
        </p>
        <p className="text-xs text-gray-400 mt-2">
          Supports: JPEG, PNG, WebP, GIF (max 10MB each)
          {multiple && ` • Max ${maxFiles} files`}
        </p>
      </div>

      {/* Selected Files */}
      {selectedFiles.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-medium text-gray-900">Selected Files</h4>
          <div className="space-y-2">
            {selectedFiles.map((file, index) => (
              <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <ImageIcon className="h-8 w-8 text-gray-400 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {file.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                  <div className="mt-2">
                    <Label htmlFor={`alt-${index}`} className="text-xs text-gray-600">
                      Alt text (optional)
                    </Label>
                    <Input
                      id={`alt-${index}`}
                      type="text"
                      placeholder="Describe this image..."
                      value={altTexts[`file-${index}`] || ''}
                      onChange={(e) => updateAltText(index, e.target.value)}
                      className="mt-1 text-xs"
                      disabled={uploading}
                    />
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFile(index)}
                  disabled={uploading}
                  className="flex-shrink-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upload Button */}
      {selectedFiles.length > 0 && (
        <div className="flex justify-end">
          <Button
            onClick={handleUpload}
            disabled={uploading || selectedFiles.length === 0}
            className="min-w-[120px]"
          >
            {uploading ? 'Uploading...' : `Upload ${selectedFiles.length} file(s)`}
          </Button>
        </div>
      )}
    </div>
  );
};