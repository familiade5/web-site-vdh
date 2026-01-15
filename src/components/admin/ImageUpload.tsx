import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Upload, 
  X, 
  Image as ImageIcon, 
  Link as LinkIcon,
  Plus,
  GripVertical,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ImageUploadProps {
  images: string[];
  onChange: (images: string[]) => void;
  maxImages?: number;
}

export function ImageUpload({ images, onChange, maxImages = 10 }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const handleFileUpload = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    
    setIsUploading(true);
    const newImages: string[] = [];

    try {
      for (const file of Array.from(files)) {
        // Validate file type
        if (!file.type.startsWith('image/')) {
          toast.error(`${file.name} não é uma imagem válida`);
          continue;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          toast.error(`${file.name} é muito grande (máx 5MB)`);
          continue;
        }

        // Generate unique filename
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `properties/${fileName}`;

        // Try to upload to Supabase Storage
        const { data, error } = await supabase.storage
          .from('property-images')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false
          });

        if (error) {
          // If bucket doesn't exist, fall back to object URL (for preview)
          // and show message to user
          console.warn('Storage upload failed:', error.message);
          
          // Create a local preview URL
          const localUrl = URL.createObjectURL(file);
          newImages.push(localUrl);
          toast.info('Usando preview local - configure o Storage do Supabase para persistir');
        } else {
          // Get public URL
          const { data: urlData } = supabase.storage
            .from('property-images')
            .getPublicUrl(filePath);
          
          newImages.push(urlData.publicUrl);
        }
      }

      if (newImages.length > 0) {
        onChange([...images, ...newImages].slice(0, maxImages));
        toast.success(`${newImages.length} imagem(s) adicionada(s)`);
      }
    } catch (err) {
      console.error('Upload error:', err);
      toast.error('Erro ao fazer upload das imagens');
    } finally {
      setIsUploading(false);
    }
  }, [images, onChange, maxImages]);

  const handleUrlAdd = () => {
    if (!urlInput.trim()) return;
    
    // Basic URL validation
    try {
      new URL(urlInput);
      onChange([...images, urlInput.trim()].slice(0, maxImages));
      setUrlInput('');
      setShowUrlInput(false);
      toast.success('Imagem adicionada');
    } catch {
      toast.error('URL inválida');
    }
  };

  const handleRemove = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    onChange(newImages);
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
    
    const newImages = [...images];
    const draggedImage = newImages[draggedIndex];
    newImages.splice(draggedIndex, 1);
    newImages.splice(index, 0, draggedImage);
    onChange(newImages);
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div 
        className="relative border-2 border-dashed border-muted-foreground/25 rounded-xl p-6 transition-colors hover:border-primary/50 hover:bg-muted/30"
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          handleFileUpload(e.dataTransfer.files);
        }}
      >
        <input
          type="file"
          multiple
          accept="image/*"
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          onChange={(e) => handleFileUpload(e.target.files)}
          disabled={isUploading || images.length >= maxImages}
        />
        
        <div className="text-center space-y-3">
          {isUploading ? (
            <>
              <Loader2 className="h-10 w-10 mx-auto text-primary animate-spin" />
              <p className="text-sm text-muted-foreground">Fazendo upload...</p>
            </>
          ) : (
            <>
              <div className="h-12 w-12 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                <Upload className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="font-medium">Arraste fotos aqui ou clique para selecionar</p>
                <p className="text-sm text-muted-foreground mt-1">
                  PNG, JPG ou WEBP até 5MB cada • {images.length}/{maxImages} imagens
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* URL Input */}
      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setShowUrlInput(!showUrlInput)}
          className="gap-2"
        >
          <LinkIcon className="h-4 w-4" />
          Adicionar por URL
        </Button>
      </div>

      <AnimatePresence>
        {showUrlInput && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="flex gap-2"
          >
            <Input
              placeholder="https://exemplo.com/imagem.jpg"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleUrlAdd())}
            />
            <Button type="button" onClick={handleUrlAdd} size="icon">
              <Plus className="h-4 w-4" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Image Preview Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {images.map((image, index) => (
            <motion.div
              key={`${image}-${index}`}
              layout
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragEnd={handleDragEnd}
              className={`relative aspect-video rounded-lg overflow-hidden bg-muted group cursor-move ${
                draggedIndex === index ? 'ring-2 ring-primary opacity-50' : ''
              }`}
            >
              <img
                src={image}
                alt={`Imagem ${index + 1}`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/placeholder.svg';
                }}
              />
              
              {/* Overlay with controls */}
              <div className="absolute inset-0 bg-foreground/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <div className="absolute top-2 left-2 text-white/70">
                  <GripVertical className="h-4 w-4" />
                </div>
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => handleRemove(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Index badge */}
              {index === 0 && (
                <div className="absolute bottom-2 left-2 bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded">
                  Principal
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}

      {images.length === 0 && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 rounded-lg p-3">
          <AlertCircle className="h-4 w-4" />
          Adicione pelo menos uma foto para destacar o imóvel
        </div>
      )}
    </div>
  );
}