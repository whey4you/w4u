'use client';

import { useState, useRef, useCallback } from 'react';

export interface UseFileDropzoneOptions {
  onFilesDrop: (files: File[]) => void | Promise<void>;
  accept?: string[];
  maxSizeMB?: number;
  multiple?: boolean;
  disabled?: boolean;
  onError?: (error: string) => void;
}

export function useFileDropzone({
  onFilesDrop,
  accept,
  maxSizeMB,
  multiple = false,
  disabled = false,
  onError,
}: UseFileDropzoneOptions) {
  const [isDragging, setIsDragging] = useState(false);
  const dragCounter = useRef(0);

  const isFileTypeAllowed = useCallback(
    (file: File): boolean => {
      if (!accept || accept.length === 0) return true;
      return accept.some((rule) => {
        if (rule.endsWith('/*')) {
          const typePrefix = rule.slice(0, -2);
          return file.type.startsWith(typePrefix);
        }
        return file.type === rule;
      });
    },
    [accept]
  );

  const handleDragEnter = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (disabled) return;
      
      const isFileDrag = Array.from(e.dataTransfer.types || []).includes('Files');
      if (!isFileDrag) return;

      dragCounter.current += 1;
      if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
        setIsDragging(true);
      }
    },
    [disabled]
  );

  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (disabled) return;
      const isFileDrag = Array.from(e.dataTransfer.types || []).includes('Files');
      if (!isFileDrag) return;
      e.dataTransfer.dropEffect = 'copy';
    },
    [disabled]
  );

  const handleDragLeave = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (disabled) return;
      const isFileDrag = Array.from(e.dataTransfer.types || []).includes('Files');
      if (!isFileDrag) return;

      dragCounter.current -= 1;
      if (dragCounter.current <= 0) {
        dragCounter.current = 0;
        setIsDragging(false);
      }
    },
    [disabled]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      const isFileDrag = Array.from(e.dataTransfer.types || []).includes('Files');
      if (!isFileDrag) return;

      e.preventDefault();
      e.stopPropagation();
      if (disabled) return;

      dragCounter.current = 0;
      setIsDragging(false);

      const rawFiles = Array.from(e.dataTransfer.files || []);
      if (rawFiles.length === 0) return;

      const filesToProcess = multiple ? rawFiles : [rawFiles[0]];

      const validFiles: File[] = [];
      for (const file of filesToProcess) {
        if (!isFileTypeAllowed(file)) {
          onError?.(`Tệp "${file.name}" không đúng định dạng cho phép.`);
          continue;
        }
        if (maxSizeMB && file.size > maxSizeMB * 1024 * 1024) {
          onError?.(`Tệp "${file.name}" vượt quá dung lượng tối đa ${maxSizeMB}MB.`);
          continue;
        }
        validFiles.push(file);
      }

      if (validFiles.length > 0) {
        onFilesDrop(validFiles);
      }
    },
    [disabled, multiple, isFileTypeAllowed, maxSizeMB, onError, onFilesDrop]
  );

  return {
    isDragging,
    dropzoneProps: {
      onDragEnter: handleDragEnter,
      onDragOver: handleDragOver,
      onDragLeave: handleDragLeave,
      onDrop: handleDrop,
    },
  };
}
