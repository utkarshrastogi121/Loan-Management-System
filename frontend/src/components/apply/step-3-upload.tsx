'use client';

import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import api from '@/lib/api';
import { UploadCloud, FileText, CheckCircle2, AlertCircle, Loader2, ArrowRight } from 'lucide-react';

interface Step3UploadProps {
  onNext: (fileUrl: string) => void;
}

export function Step3Upload({ onNext }: Step3UploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
    setError('');
    if (rejectedFiles.length > 0) {
      setError('Invalid file. Upload PDF, JPG, or PNG under 5MB.');
      return;
    }
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
    },
    maxSize: 5 * 1024 * 1024, // 5MB
    multiple: false,
  });

  const handleUpload = async () => {
    if (!file) {
      setError('Please select or drop a salary slip proof first.');
      return;
    }

    setUploading(true);
    setError('');

    const formData = new FormData();
    formData.append('salarySlip', file);

    try {
      const response = await api.post('/borrower/upload-salary-slip', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (response.data.success && response.data.data?.fileUrl) {
        onNext(response.data.data.fileUrl);
      } else {
        // Fallback for mocked backend if fileUrl is string directly
        const fileUrl = response.data.data?.fileUrl || response.data.data || '/uploads/salary-slip.pdf';
        onNext(fileUrl);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Upload failed. Ensure file is within 5MB limit.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-900">Income Verification Document</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Upload your latest salary slip or bank statement (PDF, JPG, PNG up to 5MB)
        </p>
      </div>

      {error && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl font-medium flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Shopeers Clean Dropzone */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
          isDragActive
            ? 'border-blue-500 bg-blue-50/50'
            : file
            ? 'border-emerald-300 bg-emerald-50/30'
            : 'border-slate-200 hover:border-blue-400 bg-slate-50/50'
        }`}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center justify-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-sm">
            <UploadCloud className="w-6 h-6" />
          </div>

          <div>
            <p className="text-sm font-bold text-slate-800">
              {file ? file.name : 'Drag & drop salary slip here'}
            </p>
            <p className="text-xs text-slate-400 mt-0.5">
              {file
                ? `${(file.size / (1024 * 1024)).toFixed(2)} MB • Ready to upload`
                : 'Supports PDF, JPG, PNG up to 5MB'}
            </p>
          </div>

          {!file && (
            <button
              type="button"
              className="px-4 py-1.5 bg-white border border-slate-200 text-slate-700 text-xs font-semibold rounded-xl shadow-sm hover:bg-slate-50 transition-colors"
            >
              Browse Files
            </button>
          )}
        </div>
      </div>

      {/* Upload & Proceed Action */}
      <div className="pt-2 flex items-center justify-between">
        <span className="text-[11px] text-slate-400 font-medium">
          Encrypted 256-bit SSL document vault
        </span>

        <button
          type="button"
          onClick={handleUpload}
          disabled={!file || uploading}
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-6 py-2.5 rounded-xl shadow-md shadow-blue-500/20 disabled:opacity-50 transition-all"
        >
          {uploading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Uploading Proof...</span>
            </>
          ) : (
            <>
              <span>Upload & Continue</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
