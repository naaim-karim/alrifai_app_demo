import { ImageUploadInputProps } from "@/types";
import Image from "next/image";
import React, { useEffect, useState } from "react";

const ImageUploadInput = ({
  name,
  label,
  id,
  value,
  error,
  disabled,
  onChange,
  onBlur,
  elementRef,
}: ImageUploadInputProps) => {
  const [preview, setPreview] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [imageDimensions, setImageDimensions] = useState<{
    width: number;
    height: number;
  } | null>(null);

  useEffect(() => {
    if (value === null || value === undefined) {
      setPreview(null);
      setImageDimensions(null);
    }
  }, [value]);

  const handleFileChange = (file: File | null) => {
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        const img = new window.Image();
        img.src = result;

        img.onload = () => {
          setImageDimensions({ width: img.width, height: img.height });
          setPreview(result);
        };
      };
      reader.readAsDataURL(file);
    } else {
      setPreview(null);
      setImageDimensions(null);
    }

    onChange(file);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    handleFileChange(file);
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

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      handleFileChange(file);
    }
  };

  const removeImage = () => {
    handleFileChange(null);
    if (elementRef.current) {
      elementRef.current.value = "";
    }
  };

  return (
    <div className="mb-4 flex flex-col relative">
      <label htmlFor={id} className="label">
        {label}
      </label>

      <div
        className={`
          border-2 border-dashed rounded-lg p-6 text-center transition-colors
          ${dragActive ? "border-blue-400 bg-blue-50" : "border-gray-300"}
          ${error ? "border-red-300 bg-red-50" : ""}
          ${
            disabled
              ? "opacity-50 cursor-not-allowed"
              : "cursor-pointer hover:border-gray-400"
          }
        `}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => !disabled && elementRef.current?.click()}
      >
        <input
          ref={elementRef as React.RefObject<HTMLInputElement>}
          type="file"
          name={name}
          id={id}
          accept="image/png,image/jpeg,image/webp"
          onChange={handleInputChange}
          onBlur={onBlur}
          className="hidden"
          disabled={disabled}
          aria-required="true"
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : undefined}
        />

        {preview ? (
          <div className="space-y-4">
            <Image
              src={preview}
              width={imageDimensions?.width}
              height={imageDimensions?.height}
              alt="Preview"
              className="mx-auto h-auto max-h-48 w-auto max-w-full rounded-lg shadow-sm"
            />
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                removeImage();
              }}
              className="px-4 py-2 text-sm text-red-600 hover:text-red-800 font-medium cursor-pointer"
              disabled={disabled}
            >
              Remove Image
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="text-gray-500">
              <svg
                className="mx-auto h-12 w-12"
                stroke="currentColor"
                fill="none"
                viewBox="0 0 48 48"
              >
                <path
                  d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <div>
              <p className="text-gray-600">
                <span className="font-medium text-blue-600 hover:text-blue-500">
                  Click to upload
                </span>{" "}
                or drag and drop
              </p>
              <p className="text-sm text-gray-500">PNG, JPG, WebP up to 5MB</p>
            </div>
          </div>
        )}
      </div>

      {error && (
        <p
          className="text-red-500 text-sm mt-1"
          id={`${id}-error`}
          role="alert"
        >
          {error}
        </p>
      )}
    </div>
  );
};

export default ImageUploadInput;
