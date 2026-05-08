// 相册页面：照片上传 + 瀑布流展示 + 大图预览
import { useState, useRef } from 'react';
import { usePhotos, useUploadPhoto, useDeletePhoto } from '../../hooks/usePhoto';
import { useToast } from '../../components/Toast';
import { PageHeader } from '../../components/PageHeader';
import { ReplySection } from '../../components/ReplySection';
import { EmptyState } from '../../components/EmptyState';
import { LoadingState } from '../../components/LoadingState';
import { Modal } from '../../components/Modal';
import { formatRelativeTime } from '../../utils/date';

export function GalleryPage() {
  const [caption, setCaption] = useState('');
  const [previewSrc, setPreviewSrc] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const { data, isLoading, isError } = usePhotos();
  const uploadPhoto = useUploadPhoto();
  const deletePhoto = useDeletePhoto();
  const { showToast } = useToast();

  const handleUpload = () => {
    const file = fileRef.current?.files?.[0];
    if (!file) return showToast('请先选择照片！', 'error');
    const formData = new FormData();
    formData.append('file', file);
    if (caption.trim()) formData.append('caption', caption.trim());
    uploadPhoto.mutate(formData, {
      onSuccess: () => { setCaption(''); if (fileRef.current) fileRef.current.value = ''; showToast('照片已上传 📸'); },
      onError: () => showToast('上传失败', 'error'),
    });
  };

  const photos = data?.data ?? [];

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      <PageHeader icon="📸" title="甜蜜相册" description="珍藏我们的每张照片" backTo="/" backLabel="回到首页" />
      <div className="grid md:grid-cols-3 gap-8">
        <div className="bg-[var(--color-card)] rounded-card shadow p-6">
          <h3 className="text-lg font-semibold text-primary mb-4">上传照片</h3>
          <div onClick={() => fileRef.current?.click()}
            className="border-2 border-dashed border-love-border rounded-card p-8 text-center cursor-pointer hover:border-primary hover:bg-love-bg transition-colors mb-4">
            <span className="text-4xl">📤</span>
            <p className="text-sm text-[var(--color-text-light)] mt-2">点击选择照片</p>
            <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" />
          </div>
          <input type="text" value={caption} onChange={(e) => setCaption(e.target.value)} placeholder="写下这张照片的故事..."
            className="w-full px-4 py-2.5 border-2 border-love-border rounded-card focus:border-primary focus:outline-none mb-4 transition-colors" />
          <button onClick={handleUpload} disabled={uploadPhoto.isPending}
            className="w-full bg-primary text-white py-2.5 rounded-card hover:bg-primary-dark transition-colors disabled:opacity-50">
            {uploadPhoto.isPending ? '上传中...' : '上传 📸'}
          </button>
        </div>
        <div className="md:col-span-2">
          {isLoading ? <LoadingState /> : isError ? <EmptyState icon="⚠️" message="加载失败，请刷新重试" /> : photos.length === 0 ? <EmptyState icon="📸" message="还没有照片哦~" /> : (
            <div className="columns-2 lg:columns-3 gap-4 space-y-4">
              {photos.map((photo) => (
                <div key={photo.id} className="break-inside-avoid bg-[var(--color-card)] rounded-card shadow overflow-hidden group">
                  <img src={photo.thumbnailPath ?? photo.filePath} alt={photo.caption ?? ''}
                    className="w-full object-cover cursor-pointer hover:opacity-90 transition-opacity" onClick={() => setPreviewSrc(photo.filePath)} />
                  <div className="p-3">
                    <div className="flex justify-between items-start">
                      <p className="text-sm text-[var(--color-text)] flex-1">{photo.caption}</p>
                      <button onClick={() => { if (window.confirm('确定删除这张照片吗？')) deletePhoto.mutate(photo.id); }}
                        className="text-[var(--color-text-muted)] hover:text-red-500 transition-colors text-xs ml-2">删除</button>
                    </div>
                    <p className="text-xs text-[var(--color-text-muted)] mt-1">{formatRelativeTime(photo.createdAt)}</p>
                    <ReplySection targetType="photo" targetId={photo.id} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <Modal open={!!previewSrc} onClose={() => setPreviewSrc(null)}>
        {previewSrc && <img src={previewSrc} alt="" className="w-full rounded-card" />}
      </Modal>
    </div>
  );
}
