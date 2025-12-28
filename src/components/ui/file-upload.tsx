'use client';

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Upload, FileText, X, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FileUploadProps {
    accept?: Record<string, string[]>;
    maxSize?: number; // in bytes
    onFileSelect: (file: File | null) => void;
    value?: File | null;
    label?: string;
    description?: string;
    className?: string;
}

export function FileUpload({
    accept = {
        'application/pdf': ['.pdf'],
        'application/msword': ['.doc'],
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    },
    maxSize = 5 * 1024 * 1024, // 5MB default
    onFileSelect,
    value,
    label = 'Upload File',
    description = 'Drag and drop or click to select',
    className,
}: FileUploadProps) {
    const [uploadProgress, setUploadProgress] = useState(0);
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);


    const onDrop = useCallback((acceptedFiles: File[]) => {
        setError(null);

        if (acceptedFiles.length > 0) {
            const file = acceptedFiles[0];

            // Simulate upload progress
            setIsUploading(true);
            let progress = 0;
            const interval = setInterval(() => {
                progress += 20;
                setUploadProgress(progress);
                if (progress >= 100) {
                    clearInterval(interval);
                    setIsUploading(false);
                    onFileSelect(file);
                }
            }, 100);
        }
    }, [onFileSelect]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept,
        maxSize,
        multiple: false,
    });

    const removeFile = () => {
        onFileSelect(null);
        setUploadProgress(0);
        setError(null);
    };

    const formatFileSize = (bytes: number) => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return Math.round(bytes / 1024) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };

    return (
        <div className={cn('space-y-2', className)}>
            {!value ? (
                <div
                    {...getRootProps()}
                    className={cn(
                        'border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors',
                        isDragActive
                            ? 'border-[#FFB400] bg-[#FFB400]/5'
                            : 'border-gray-300 dark:border-gray-700 hover:border-[#FFB400] hover:bg-[#FFB400]/5',
                        error && 'border-red-500 bg-red-50 dark:bg-red-900/10'
                    )}
                >
                    <input {...getInputProps()} />
                    <Upload className={cn(
                        'h-10 w-10 mx-auto mb-4',
                        isDragActive ? 'text-[#FFB400]' : 'text-gray-400'
                    )} />
                    <p className="font-medium">{label}</p>
                    <p className="text-sm text-muted-foreground mt-1">{description}</p>
                    <p className="text-xs text-muted-foreground mt-2">
                        PDF, DOC, DOCX (max {Math.round(maxSize / 1024 / 1024)}MB)
                    </p>
                </div>
            ) : (
                <div className="border rounded-lg p-4">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-lg bg-green-500/10">
                            <CheckCircle2 className="h-6 w-6 text-green-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{value.name}</p>
                            <p className="text-sm text-muted-foreground">
                                {formatFileSize(value.size)}
                            </p>
                        </div>
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={removeFile}
                            className="text-gray-400 hover:text-red-500"
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            )}

            {isUploading && (
                <div className="space-y-2">
                    <Progress value={uploadProgress} className="h-2" />
                    <p className="text-xs text-muted-foreground text-center">
                        Uploading... {uploadProgress}%
                    </p>
                </div>
            )}

            {error && (
                <p className="text-sm text-red-500">{error}</p>
            )}
        </div>
    );
}
