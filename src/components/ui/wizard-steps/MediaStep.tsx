import React, { useState, useRef } from 'react'
import { useLanguage } from '../../../hooks/useLanguage'
import type { DesignFormData } from '../../../types/api'

interface MediaStepProps {
  formData: DesignFormData
  setFormData: (data: DesignFormData | ((prev: DesignFormData) => DesignFormData)) => void
}

const MediaStep: React.FC<MediaStepProps> = ({ formData, setFormData }) => {
  const { t } = useLanguage()
  const [dragOver, setDragOver] = useState<string | null>(null)
  
  const coverImageInputRef = useRef<HTMLInputElement>(null)
  const imagesInputRef = useRef<HTMLInputElement>(null)
  const videoInputRef = useRef<HTMLInputElement>(null)

  // File validation
  const validateFile = (file: File, type: 'image' | 'video') => {
    const maxSize = type === 'image' ? 5 * 1024 * 1024 : 50 * 1024 * 1024 // 5MB for images, 50MB for videos
    const allowedTypes = type === 'image' 
      ? ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
      : ['video/mp4', 'video/avi', 'video/mov', 'video/wmv', 'video/webm']

    if (file.size > maxSize) {
      alert(`حجم الملف كبير جداً. الحد الأقصى ${type === 'image' ? '5' : '50'} ميجابايت`)
      return false
    }

    if (!allowedTypes.includes(file.type)) {
      alert(`نوع الملف غير مدعوم. الأنواع المدعومة: ${allowedTypes.join(', ')}`)
      return false
    }

    return true
  }

  // Handle cover image
  const handleCoverImageChange = (file: File | null) => {
    if (file && validateFile(file, 'image')) {
      setFormData(prev => ({ ...prev, coverImage: file }))
    }
  }

  // Handle additional images
  const handleImagesChange = (files: FileList | null) => {
    if (files) {
      const validFiles: File[] = []
      for (let i = 0; i < Math.min(files.length, 10); i++) {
        if (validateFile(files[i], 'image')) {
          validFiles.push(files[i])
        }
      }
      
      const currentImages = formData.images || []
      const totalImages = [...currentImages, ...validFiles]
      
      if (totalImages.length > 10) {
        alert('يمكن إضافة حد أقصى 10 صور')
        setFormData(prev => ({ ...prev, images: totalImages.slice(0, 10) }))
      } else {
        setFormData(prev => ({ ...prev, images: totalImages }))
      }
    }
  }

  // Handle video
  const handleVideoChange = (file: File | null) => {
    if (file && validateFile(file, 'video')) {
      setFormData(prev => ({ ...prev, video: file }))
    }
  }

  // Remove functions
  const removeCoverImage = () => {
    setFormData(prev => ({ ...prev, coverImage: null }))
  }

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: (prev.images || []).filter((_: File, i: number) => i !== index)
    }))
  }

  const removeVideo = () => {
    setFormData(prev => ({ ...prev, video: null }))
  }

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent, type: string) => {
    e.preventDefault()
    setDragOver(type)
  }

  const handleDragLeave = () => {
    setDragOver(null)
  }

  const handleDrop = (e: React.DragEvent, type: 'cover' | 'images' | 'video') => {
    e.preventDefault()
    setDragOver(null)
    
    const files = e.dataTransfer.files
    if (files.length > 0) {
      if (type === 'cover') {
        handleCoverImageChange(files[0])
      } else if (type === 'images') {
        handleImagesChange(files)
      } else if (type === 'video') {
        handleVideoChange(files[0])
      }
    }
  }

  // Get file size in readable format
  const getFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          {t('designMedia') || 'ملفات التصميم الإعلامية'}
        </h3>
        <p className="text-gray-600">
          {t('uploadDesignMedia') || 'قم بإضافة الصور والفيديوهات التي تعرض التصميم بأفضل شكل'}
        </p>
      </div>

      <div className="max-w-4xl mx-auto space-y-8">
        {/* Cover Image */}
        <div className="space-y-4">
          <h4 className="text-md font-medium text-gray-900 flex items-center gap-2">
            <span className="text-red-500">*</span>
            صورة الغلاف الرئيسية
          </h4>
          
          {!formData.coverImage ? (
            <div
              className={`
                border-2 border-dashed rounded-xl p-8 text-center transition-colors
                ${dragOver === 'cover' 
                  ? 'border-blue-400 bg-blue-50' 
                  : 'border-gray-300 hover:border-gray-400'
                }
              `}
              onDragOver={(e) => handleDragOver(e, 'cover')}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, 'cover')}
            >
              <div className="text-6xl mb-4">🖼️</div>
              <h5 className="text-lg font-medium text-gray-900 mb-2">
                اختر صورة الغلاف الرئيسية
              </h5>
              <p className="text-gray-600 mb-4">
                اسحب الصورة هنا أو انقر للاختيار
              </p>
              <p className="text-sm text-gray-500 mb-4">
                الأنواع المدعومة: JPG, PNG, WEBP • الحد الأقصى: 5MB
              </p>
              
              <input
                ref={coverImageInputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                onChange={(e) => handleCoverImageChange(e.target.files?.[0] || null)}
                className="hidden"
              />
              
              <button
                type="button"
                onClick={() => coverImageInputRef.current?.click()}
                className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                اختيار صورة
              </button>
            </div>
          ) : (
            <div className="relative bg-gray-50 border border-gray-200 rounded-xl p-4">
              <div className="flex items-start gap-4">
                {/* Preview */}
                <div className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center overflow-hidden">
                  <img
                    src={URL.createObjectURL(formData.coverImage)}
                    alt="Cover preview"
                    className="w-full h-full object-cover"
                  />
                </div>
                
                {/* Info */}
                <div className="flex-1">
                  <h6 className="font-medium text-gray-900">{formData.coverImage.name}</h6>
                  <p className="text-sm text-gray-600">{getFileSize(formData.coverImage.size)}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="inline-flex items-center px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded">
                      ✓ تم الرفع
                    </span>
                  </div>
                </div>
                
                {/* Remove */}
                <button
                  onClick={removeCoverImage}
                  className="text-red-500 hover:text-red-700 transition-colors p-1"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Additional Images */}
        <div className="space-y-4">
          <h4 className="text-md font-medium text-gray-900 flex items-center gap-2">
            صور إضافية للتصميم
            <span className="text-sm text-gray-500 font-normal">(اختياري - حد أقصى 10 صور)</span>
          </h4>
          
          {/* Upload Area */}
          <div
            className={`
              border-2 border-dashed rounded-xl p-6 text-center transition-colors
              ${dragOver === 'images' 
                ? 'border-green-400 bg-green-50' 
                : 'border-gray-300 hover:border-gray-400'
              }
            `}
            onDragOver={(e) => handleDragOver(e, 'images')}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, 'images')}
          >
            <div className="text-4xl mb-3">📷</div>
            <p className="text-gray-600 mb-3">
              اسحب الصور هنا أو انقر للاختيار (يمكن اختيار عدة صور)
            </p>
            <p className="text-sm text-gray-500 mb-3">
              الأنواع المدعومة: JPG, PNG, WEBP • الحد الأقصى: 5MB لكل صورة
            </p>
            
            <input
              ref={imagesInputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              multiple
              onChange={(e) => handleImagesChange(e.target.files)}
              className="hidden"
            />
            
            <button
              type="button"
              onClick={() => imagesInputRef.current?.click()}
              className="px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors"
            >
              إضافة صور
            </button>
          </div>

          {/* Images Preview */}
          {formData.images && formData.images.length > 0 && (
            <div className="space-y-3">
              <h5 className="font-medium text-gray-900">
                الصور المضافة ({formData.images.length}/10)
              </h5>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {formData.images.map((image: File, index: number) => (
                  <div key={index} className="relative bg-gray-50 border border-gray-200 rounded-lg p-2">
                    {/* Preview */}
                    <div className="w-full h-24 bg-gray-200 rounded mb-2 overflow-hidden">
                      <img
                        src={URL.createObjectURL(image)}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    
                    {/* Info */}
                    <div className="text-xs">
                      <p className="font-medium text-gray-900 truncate">{image.name}</p>
                      <p className="text-gray-600">{getFileSize(image.size)}</p>
                    </div>
                    
                    {/* Remove */}
                    <button
                      onClick={() => removeImage(index)}
                      className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Video */}
        <div className="space-y-4">
          <h4 className="text-md font-medium text-gray-900 flex items-center gap-2">
            فيديو التصميم
            <span className="text-sm text-gray-500 font-normal">(اختياري)</span>
          </h4>
          
          {!formData.video ? (
            <div
              className={`
                border-2 border-dashed rounded-xl p-6 text-center transition-colors
                ${dragOver === 'video' 
                  ? 'border-purple-400 bg-purple-50' 
                  : 'border-gray-300 hover:border-gray-400'
                }
              `}
              onDragOver={(e) => handleDragOver(e, 'video')}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, 'video')}
            >
              <div className="text-4xl mb-3">🎥</div>
              <h5 className="text-md font-medium text-gray-900 mb-2">
                إضافة فيديو للتصميم
              </h5>
              <p className="text-gray-600 mb-3">
                اسحب الفيديو هنا أو انقر للاختيار
              </p>
              <p className="text-sm text-gray-500 mb-3">
                الأنواع المدعومة: MP4, AVI, MOV, WMV, WEBM • الحد الأقصى: 50MB
              </p>
              
              <input
                ref={videoInputRef}
                type="file"
                accept="video/mp4,video/avi,video/mov,video/wmv,video/webm"
                onChange={(e) => handleVideoChange(e.target.files?.[0] || null)}
                className="hidden"
              />
              
              <button
                type="button"
                onClick={() => videoInputRef.current?.click()}
                className="px-4 py-2 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition-colors"
              >
                اختيار فيديو
              </button>
            </div>
          ) : (
            <div className="relative bg-gray-50 border border-gray-200 rounded-xl p-4">
              <div className="flex items-start gap-4">
                {/* Preview */}
                <div className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center">
                  <div className="text-2xl">🎥</div>
                </div>
                
                {/* Info */}
                <div className="flex-1">
                  <h6 className="font-medium text-gray-900">{formData.video.name}</h6>
                  <p className="text-sm text-gray-600">{getFileSize(formData.video.size)}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="inline-flex items-center px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded">
                      ✓ تم الرفع
                    </span>
                  </div>
                </div>
                
                {/* Remove */}
                <button
                  onClick={removeVideo}
                  className="text-red-500 hover:text-red-700 transition-colors p-1"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
              
              {/* Video Preview */}
              <div className="mt-4">
                <video
                  src={URL.createObjectURL(formData.video)}
                  controls
                  className="w-full max-w-md mx-auto rounded-lg"
                  style={{ maxHeight: '300px' }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Media Summary */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4 text-center">
            📁 ملخص الملفات الإعلامية
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div className="bg-white rounded-lg p-4 border">
              <div className="text-2xl mb-2">🖼️</div>
              <div className="text-lg font-semibold text-gray-900">
                {formData.coverImage ? '1' : '0'}
              </div>
              <div className="text-sm text-gray-600">صورة الغلاف</div>
            </div>
            
            <div className="bg-white rounded-lg p-4 border">
              <div className="text-2xl mb-2">📷</div>
              <div className="text-lg font-semibold text-gray-900">
                {formData.images?.length || 0}
              </div>
              <div className="text-sm text-gray-600">صور إضافية</div>
            </div>
            
            <div className="bg-white rounded-lg p-4 border">
              <div className="text-2xl mb-2">🎥</div>
              <div className="text-lg font-semibold text-gray-900">
                {formData.video ? '1' : '0'}
              </div>
              <div className="text-sm text-gray-600">فيديو</div>
            </div>
          </div>

          {/* Validation Messages */}
          <div className="mt-4 text-center">
            {!formData.coverImage && (
              <div className="text-red-600 text-sm mb-2">
                ⚠️ صورة الغلاف مطلوبة
              </div>
            )}
            {formData.coverImage && (
              <div className="text-green-600 text-sm">
                ✅ جميع الملفات المطلوبة مكتملة
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default MediaStep