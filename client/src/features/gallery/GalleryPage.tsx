import { useState, useRef } from 'react';
import { usePhotos, useUploadPhoto, useDeletePhoto } from '../../hooks/usePhoto';
import { useToast } from '../../components/Toast';
import { Modal } from '../../components/Modal';
import { formatRelativeTime } from '../../utils/date';

export function GalleryPage() {
  const [caption, setCaption] = useState('');
  const [previewSrc, setPreviewSrc] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const { data, isLoading } = usePhotos();
  const uploadPhoto = useUploadPhoto();
  const deletePhoto = useDeletePhoto();
  const { showToast } = useToast();

  const handleUpload = () => {
    const files = fileRef.current?.files;
    if (!files?.length) return showToast('请先选择照片！', 'error');

    const formData = new FormData();
    Array.from(files).forEach((f) => formData.append('file', f));
    if (caption.trim()) formData.append('caption', caption.trim());

    uploadPhoto.mutate(formData, {
      onSuccess: () => {
        setCaption('');
        if (fileRef.current) fileRef.current.value = '';
        showToast('照片已上传 📸');
      },
      onError: () => showToast('上传失败', 'error'),
    });
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (fileRef.current && e.dataTransfer.files.length) {
      fileRef.current.files = e.dataTransfer.files;
      showToast(`已选择 ${e.dataTransfer.files.length} 张照片`);
    }
  };

  const photos = data?.data ?? [];

  return (
    <section className="max-w-6xl mx-auto py-12 px-4">
      <h2 className="text-3xl font-bold text-center text-primary mb-10">📸 我们的相册</h2>
      <div className="grid md:grid-cols-3 gap-8">
        {/* Upload */}
        <div className="bg-white rounded-card shadow p-6">
          <h3 className="text-lg font-semibold text-primary mb-4">上传照片</h3>
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => fileRef.current?.click()}
            className="border-2 border-dashed border-love-border rounded-card p-8 text-center cursor-pointer hover:border-primary hover:bg-love-bg transition-colors mb-4"
          >
            <span className="text-4xl">📤</span>
            <p className="text-sm text-gray-500 mt-2">点击或拖拽上传照片</p>
            <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" />
          </div>
          <input
            type="text"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="写下这张照片的故事..."
            className="w-full px-4 py-2.5 border-2 border-love-border rounded-card focus:border-primary focus:outline-none mb-4 transition-colors"
          />
          <button
            onClick={handleUpload}
            disabled={uploadPhoto.isPending}
            className="w-full bg-primary text-white py-2.5 rounded-card hover:bg-primary-dark transition-colors disabled:opacity-50"
          >
            {uploadPhoto.isPending ? '上传中...' : '上传 📸'}
          </button>
        </div>

        {/* Grid */}
        <div className="md:col-span-2">
          {isLoading ? (
            <p className="text-gray-400 text-center py-12">加载中...</p>
          ) : photos.length === 0 ? (
            <p className="text-gray-400 text-center py-12">还没有照片哦~</p>
          ) : (
            <div className="columns-2 lg:columns-3 gap-4 space-y-4">
              {photos.map((photo) => (
                <div key={photo.id} className="break-inside-avoid bg-white rounded-card shadow overflow-hidden group">
                  <img
                    src={photo.thumbnailPath ?? photo.filePath}
                    alt={photo.caption ?? ''}
                    className="w-full object-cover cursor-pointer hover:opacity-90 transition-opacity"
                    onClick={() => setPreviewSrc(photo.filePath)}
                  />
                  <div className="p-3">
                    <div className="flex justify-between items-start">
                      <p className="text-sm text-gray-700 flex-1">{photo.caption}</p>
                      <button
                        onClick={() => deletePhoto.mutate(photo.id)}
                        className="text-gray-300 hover:text-red-500 transition-colors text-xs ml-2"
                      >
                        删除
                      </button>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">{formatRelativeTime(photo.createdAt)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Lightbox */}
      <Modal open={!!previewSrc} onClose={() => setPreviewSrc(null)}>
        {previewSrc && (
          <img src={previewSrc} alt="" className="w-full rounded-card" />
        )}
      </Modal>
    </section>
  );
}
