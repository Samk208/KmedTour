'use client'

import { Progress } from '@/components/ui/progress'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import { AlertCircle, CheckCircle, FileText, Loader2, Upload } from 'lucide-react'
import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { toast } from 'sonner'

interface PatientDocument {
    id: string
    file_name: string
    file_path?: string
    file_size?: number
    created_at: string
    is_verified?: boolean
}

interface DocumentUploaderProps {
    patientId: string
    bookingId?: string
    category?: string
    onUploadComplete?: () => void
    existingDocuments?: PatientDocument[]
}

export function DocumentUploader({
    patientId,
    bookingId,
    category = 'medical_record',
    onUploadComplete,
    existingDocuments = []
}: DocumentUploaderProps) {
    const [uploading, setUploading] = useState(false)
    const [progress, setProgress] = useState(0)

    const onDrop = useCallback(async (acceptedFiles: File[]) => {
        if (acceptedFiles.length === 0) return

        setUploading(true)
        setProgress(0)
        const supabase = createClient()

        try {
            let completed = 0
            const total = acceptedFiles.length

            for (const file of acceptedFiles) {
                // 1. Upload to Storage
                // Path: {patientId}/{category}/{timestamp}_{filename}
                const fileExt = file.name.split('.').pop()
                const fileName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9]/g, '_')}.${fileExt}`
                const filePath = `${patientId}/${category}/${fileName}`

                const { error: uploadError } = await supabase.storage
                    .from('patient-records')
                    .upload(filePath, file)

                if (uploadError) throw uploadError

                // 2. Create DB Record
                const { error: dbError } = await supabase
                    .from('patient_documents')
                    .insert({
                        patient_id: patientId,
                        booking_id: bookingId,
                        file_name: file.name,
                        file_path: filePath,
                        file_type: file.type,
                        file_size: file.size,
                        document_category: category,
                        description: 'Uploaded via Patient Portal'
                    })

                if (dbError) throw dbError

                completed++
                setProgress((completed / total) * 100)
            }

            toast.success(`Successfully uploaded ${total} file(s)`)
            if (onUploadComplete) onUploadComplete()

        } catch (error) {
            const message = error instanceof Error ? error.message : 'Upload failed'
            console.error('Upload failed:', error)
            toast.error('Upload failed: ' + message)
        } finally {
            setUploading(false)
            setProgress(0)
        }
    }, [patientId, bookingId, category, onUploadComplete])

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        maxSize: 10 * 1024 * 1024, // 10MB
        disabled: uploading
    })

    return (
        <div className="space-y-6">
            <div
                {...getRootProps()}
                className={cn(
                    "border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer",
                    isDragActive ? "border-teal-500 bg-teal-50" : "border-gray-200 hover:border-teal-400 hover:bg-gray-50",
                    uploading && "opacity-50 cursor-not-allowed"
                )}
            >
                <input {...getInputProps()} />
                <div className="flex flex-col items-center gap-2">
                    {uploading ? (
                        <Loader2 className="h-10 w-10 text-teal-600 animate-spin" />
                    ) : (
                        <Upload className="h-10 w-10 text-gray-400" />
                    )}
                    <p className="text-sm font-medium text-gray-700">
                        {uploading ? 'Uploading...' : 'Click or Drag files to upload'}
                    </p>
                    <p className="text-xs text-gray-500">
                        Supports PDF, JPG, PNG (Max 10MB)
                    </p>
                </div>
                {uploading && <Progress value={progress} className="mt-4 h-2" />}
            </div>

            {existingDocuments.length > 0 && (
                <div className="space-y-3">
                    <h4 className="text-sm font-medium text-gray-700">Uploaded Documents</h4>
                    <div className="grid gap-2">
                        {existingDocuments.map((doc) => (
                            <div key={doc.id} className="flex items-center justify-between p-3 bg-white border rounded-md shadow-sm">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-teal-100 rounded">
                                        <FileText className="h-4 w-4 text-teal-700" />
                                    </div>
                                    <div className="overflow-hidden">
                                        <p className="text-sm font-medium truncate max-w-[200px]">{doc.file_name}</p>
                                        <p className="text-xs text-gray-500">{new Date(doc.created_at).toLocaleDateString()} • {((doc.file_size ?? 0) / 1024).toFixed(0)} KB</p>
                                    </div>
                                </div>
                                {doc.is_verified ? (
                                    <div className="flex items-center gap-1 text-xs text-green-600 font-medium">
                                        <CheckCircle className="h-3 w-3" /> Verified
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-1 text-xs text-amber-600 font-medium">
                                        <AlertCircle className="h-3 w-3" /> Reviewing
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}
