import React, { useCallback, useRef, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import TextAlign from '@tiptap/extension-text-align';
import Placeholder from '@tiptap/extension-placeholder';
import {
  Bold, Italic, Underline as UnderlineIcon, Strikethrough, Heading1, Heading2, Heading3, List,
  ListOrdered, Quote, Code, Link as LinkIcon, Image as ImageIcon, Minus, WrapText,
  AlignLeft, AlignCenter, AlignRight, AlignJustify, Upload, Loader2
} from 'lucide-react';
import { Toggle } from '@/components/ui/toggle';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils/cn';
import { supabase } from '@/lib/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { v4 as uuidv4 } from 'uuid';

const Toolbar = ({ editor, onImageUpload }) => {
  const { toast } = useToast();
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [isImagePopoverOpen, setIsImagePopoverOpen] = useState(false);
  const fileInputRef = useRef(null);

  const setLink = useCallback(() => {
    if (!editor) return;
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('URL', previousUrl);
    if (url === null) return;
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  }, [editor]);

  const addImage = useCallback((url) => {
    if (!editor || !url) return;
    editor.chain().focus().setImage({ src: url }).run();
    setImageUrl('');
    setIsImagePopoverOpen(false);
  }, [editor]);

  const handleFileSelect = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: 'Veuillez sélectionner un fichier image.',
      });
      return;
    }

    setIsUploadingImage(true);
    try {
      const url = await onImageUpload(file);
      if (url) {
        addImage(url);
        toast({
          title: 'Succès',
          description: 'Image téléchargée avec succès.',
        });
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: 'Échec du téléchargement de l\'image.',
      });
    } finally {
      setIsUploadingImage(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  if (!editor) return null;

  return (
    <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b p-2 flex flex-wrap items-center gap-1">
      <Toggle size="sm" pressed={editor.isActive('bold')} onPressedChange={() => editor.chain().focus().toggleBold().run()}><Bold className="h-4 w-4" /></Toggle>
      <Toggle size="sm" pressed={editor.isActive('italic')} onPressedChange={() => editor.chain().focus().toggleItalic().run()}><Italic className="h-4 w-4" /></Toggle>
      <Toggle size="sm" pressed={editor.isActive('underline')} onPressedChange={() => editor.chain().focus().toggleUnderline().run()}><UnderlineIcon className="h-4 w-4" /></Toggle>
      <Toggle size="sm" pressed={editor.isActive('strike')} onPressedChange={() => editor.chain().focus().toggleStrike().run()}><Strikethrough className="h-4 w-4" /></Toggle>
      <Separator orientation="vertical" className="h-8" />
      <Toggle size="sm" pressed={editor.isActive('heading', { level: 1 })} onPressedChange={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}><Heading1 className="h-4 w-4" /></Toggle>
      <Toggle size="sm" pressed={editor.isActive('heading', { level: 2 })} onPressedChange={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}><Heading2 className="h-4 w-4" /></Toggle>
      <Toggle size="sm" pressed={editor.isActive('heading', { level: 3 })} onPressedChange={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}><Heading3 className="h-4 w-4" /></Toggle>
      <Separator orientation="vertical" className="h-8" />
      <Toggle size="sm" pressed={editor.isActive({ textAlign: 'left' })} onPressedChange={() => editor.chain().focus().setTextAlign('left').run()}><AlignLeft className="h-4 w-4" /></Toggle>
      <Toggle size="sm" pressed={editor.isActive({ textAlign: 'center' })} onPressedChange={() => editor.chain().focus().setTextAlign('center').run()}><AlignCenter className="h-4 w-4" /></Toggle>
      <Toggle size="sm" pressed={editor.isActive({ textAlign: 'right' })} onPressedChange={() => editor.chain().focus().setTextAlign('right').run()}><AlignRight className="h-4 w-4" /></Toggle>
      <Toggle size="sm" pressed={editor.isActive({ textAlign: 'justify' })} onPressedChange={() => editor.chain().focus().setTextAlign('justify').run()}><AlignJustify className="h-4 w-4" /></Toggle>
      <Separator orientation="vertical" className="h-8" />
      <Toggle size="sm" pressed={editor.isActive('bulletList')} onPressedChange={() => editor.chain().focus().toggleBulletList().run()}><List className="h-4 w-4" /></Toggle>
      <Toggle size="sm" pressed={editor.isActive('orderedList')} onPressedChange={() => editor.chain().focus().toggleOrderedList().run()}><ListOrdered className="h-4 w-4" /></Toggle>
      <Toggle size="sm" pressed={editor.isActive('blockquote')} onPressedChange={() => editor.chain().focus().toggleBlockquote().run()}><Quote className="h-4 w-4" /></Toggle>
      <Toggle size="sm" pressed={editor.isActive('codeBlock')} onPressedChange={() => editor.chain().focus().toggleCodeBlock().run()}><Code className="h-4 w-4" /></Toggle>
      <Separator orientation="vertical" className="h-8" />
      <Button size="sm" variant="ghost" onClick={setLink}><LinkIcon className="h-4 w-4" /></Button>
      <Popover open={isImagePopoverOpen} onOpenChange={setIsImagePopoverOpen}>
        <PopoverTrigger asChild>
          <Button size="sm" variant="ghost" disabled={isUploadingImage}>
            {isUploadingImage ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImageIcon className="h-4 w-4" />}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-96">
          <Tabs defaultValue="upload" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="upload">Télécharger</TabsTrigger>
              <TabsTrigger value="url">URL</TabsTrigger>
            </TabsList>
            <TabsContent value="upload" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="image-upload" className="text-sm font-medium">
                  Sélectionner une image
                </Label>
                <div className="flex flex-col gap-2">
                  <Input
                    id="image-upload"
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    disabled={isUploadingImage}
                    className="cursor-pointer"
                  />
                  <p className="text-xs text-muted-foreground">
                    Formats acceptés : JPG, PNG, GIF, WebP (max 5MB)
                  </p>
                </div>
                {isUploadingImage && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Téléchargement en cours...</span>
                  </div>
                )}
              </div>
              <div className="pt-2 border-t">
                <p className="text-xs text-muted-foreground">
                  💡 Vous pouvez aussi glisser-déposer ou coller une image directement dans l'éditeur
                </p>
              </div>
            </TabsContent>
            <TabsContent value="url" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="image-url" className="text-sm font-medium">
                  URL de l'image
                </Label>
                <Input
                  id="image-url"
                  type="url"
                  placeholder="https://exemple.com/image.jpg"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && imageUrl) {
                      addImage(imageUrl);
                    }
                  }}
                />
                <Button
                  size="sm"
                  onClick={() => addImage(imageUrl)}
                  disabled={!imageUrl}
                  className="w-full"
                >
                  Insérer l'image
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </PopoverContent>
      </Popover>
      <Button size="sm" variant="ghost" onClick={() => editor.chain().focus().setHorizontalRule().run()}><Minus className="h-4 w-4" /></Button>
      <Button size="sm" variant="ghost" onClick={() => editor.chain().focus().setHardBreak().run()}><WrapText className="h-4 w-4" /></Button>
    </div>
  );
};

const TiptapEditor = ({ value, onChange, onBlur, disabled, placeholder = 'Commencez à écrire...', articleSlug }) => {
  const { toast } = useToast();

  const handleFileUpload = async (file) => {
    if (!file) return null;

    // Vérifier la taille du fichier (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB en bytes
    if (file.size > maxSize) {
      toast({ 
        variant: 'destructive', 
        title: 'Erreur', 
        description: 'La taille du fichier ne doit pas dépasser 5MB.' 
      });
      return null;
    }

    // Vérifier le type de fichier
    if (!file.type.startsWith('image/')) {
      toast({ 
        variant: 'destructive', 
        title: 'Erreur', 
        description: 'Seuls les fichiers image sont acceptés.' 
      });
      return null;
    }

    const fileExt = file.name.split('.').pop();
    const fileName = `${uuidv4()}.${fileExt}`;
    const filePath = `content/${articleSlug || Date.now()}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('blog-images')
      .upload(filePath, file);

    if (uploadError) {
      toast({ variant: 'destructive', title: 'Erreur d\'upload', description: uploadError.message });
      return null;
    }

    const { data: { publicUrl } } = supabase.storage.from('blog-images').getPublicUrl(filePath);
    return publicUrl;
  };

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Underline,
      Link.configure({ openOnClick: false, autolink: true }),
      Image.configure({
        inline: false, // Allow images to be block elements
      }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Placeholder.configure({ placeholder }),
    ],
    content: value,
    editable: !disabled,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    onBlur: () => {
      onBlur();
    },
    editorProps: {
      attributes: {
        class: 'prose dark:prose-invert prose-sm sm:prose-base lg:prose-lg xl:prose-2xl m-5 focus:outline-none min-h-[300px]',
      },
      handleDrop: (view, event) => {
        event.preventDefault();
        const files = event.dataTransfer?.files;
        if (files && files.length > 0) {
          const file = files[0];
          if (file.type.startsWith('image/')) {
            handleFileUpload(file).then(url => {
              if (url) {
                const { schema } = view.state;
                const coordinates = view.posAtCoords({ left: event.clientX, top: event.clientY });
                const node = schema.nodes.image.create({ src: url });
                const transaction = view.state.tr.insert(coordinates.pos, node);
                view.dispatch(transaction);
              }
            });
            return true;
          }
        }
        return false;
      },
      handlePaste: (view, event) => {
        const items = event.clipboardData?.items;
        if (items) {
          for (let i = 0; i < items.length; i++) {
            if (items[i].type.startsWith('image/')) {
              const file = items[i].getAsFile();
              if (file) {
                 handleFileUpload(file).then(url => {
                    if (url) {
                      const { schema } = view.state;
                      const node = schema.nodes.image.create({ src: url });
                      const transaction = view.state.tr.replaceSelectionWith(node);
                      view.dispatch(transaction);
                    }
                });
                return true;
              }
            }
          }
        }
        return false;
      }
    },
  });

  return (
    <div className={cn('w-full rounded-md border border-input bg-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2', { 'opacity-50 cursor-not-allowed': disabled })}>
      <Toolbar editor={editor} onImageUpload={handleFileUpload} />
      <EditorContent editor={editor} />
    </div>
  );
};

export default TiptapEditor;