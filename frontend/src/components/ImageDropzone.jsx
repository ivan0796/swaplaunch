import React, { useCallback, useState } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { Button } from './ui/button';

const ImageDropzone = ({ onImageSelect, maxSize = 2, required = false }) => {
  const [preview, setPreview] = useState(null);
  const [fileName, setFileName] = useState('');
  const [error, setError] = useState('');
  const [isDragging, setIsDragging] = useState(false);

  const validateFile = (file) => {
    // Check file type
    const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setError('Please upload PNG, JPG, or WEBP image');
      return false;
    }

    // Check file size (in MB)
    const maxSizeBytes = maxSize * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      setError(`Image must be smaller than ${maxSize}MB`);
      return false;
    }

    return true;
  };

  const handleFile = (file) => {
    if (!validateFile(file)) return;

    setError('');
    setFileName(file.name);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
      onImageSelect(reader.result, file);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, []);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleFileInput = (e) => {
    const file = e.target.files[0];
    if (file) handleFile(file);
  };

  const handleRemove = () => {
    setPreview(null);
    setFileName('');
    setError('');
    onImageSelect(null, null);
  };

  return (
    <div className="w-full">
      <label className="block text-sm font-medium mb-2 dark:text-white">
        Token Logo {required && <span className="text-red-500">*</span>}
      </label>

      {!preview ? (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all ${
            isDragging
              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
              : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
          }`}
        >
          <input
            type="file"
            accept="image/png,image/jpeg,image/jpg,image/webp"
            onChange={handleFileInput}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            required={required}
          />

          <div className="flex flex-col items-center gap-3">
            <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
              <Upload className="w-8 h-8 text-gray-400" />
            </div>

            <div>
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Drop your logo here, or click to browse
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                PNG, JPG or WEBP • Max {maxSize}MB • Recommended: 512×512px
              </p>
            </div>

            <Button type="button" variant="outline" size="sm">
              <ImageIcon className="w-4 h-4 mr-2" />
              Choose File
            </Button>
          </div>

          {error && (
            <p className="text-xs text-red-600 dark:text-red-400 mt-2">
              {error}
            </p>
          )}
        </div>
      ) : (
        <div className="relative border-2 border-gray-300 dark:border-gray-600 rounded-xl p-4">
          <div className="flex items-center gap-4">
            <img
              src={preview}
              alt="Token logo preview"
              className="w-20 h-20 rounded-lg object-cover border-2 border-gray-200 dark:border-gray-700"
            />

            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-900 dark:text-white">
                {fileName}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Logo uploaded successfully
              </p>
            </div>

            <Button
              type="button"
              onClick={handleRemove}
              variant="outline"
              size="sm"
              className="text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageDropzone;
