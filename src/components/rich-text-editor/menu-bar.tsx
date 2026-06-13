import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  Heading1,
  Heading2,
  Heading3,
  Highlighter,
  ImagePlus,
  Italic,
  List,
  ListOrdered,
  Strikethrough,
  Loader2,
  RotateCcw,
} from 'lucide-react';
import { Toggle } from '../ui/toggle';
import { Button } from '../ui/button';
import { Editor } from '@tiptap/react';
import { useState } from 'react';

interface MenuBarProps {
  editor: Editor | null;
  onImageClick: () => void;
  isUploading?: boolean;
}

export default function MenuBar({
  editor,
  onImageClick,
  isUploading = false,
}: MenuBarProps) {
  const [showImageControls, setShowImageControls] = useState(false);

  if (!editor) {
    return null;
  }

  const isImageSelected =
    editor.isActive('image') || editor.isActive('resizableImage');

  const resizeImage = (percentage: number) => {
    if (!isImageSelected) return;

    const { state } = editor;
    const { selection } = state;

    let imageNode: any = null;
    let imagePos: any = null;

    state.doc.nodesBetween(selection.from, selection.to, (node, pos) => {
      if (node.type.name === 'image' || node.type.name === 'resizableImage') {
        imageNode = node;
        imagePos = pos;
        return false;
      }
    });

    if (!imageNode || imagePos === null) return;

    const img = new Image();
    img.onload = () => {
      const newWidth = Math.round((img.naturalWidth * percentage) / 100);
      const newHeight = Math.round((img.naturalHeight * percentage) / 100);

      const newAttrs = {
        ...imageNode.attrs,
        width: `${newWidth}px`,
        height: `${newHeight}px`,
      };

      const tr = editor.view.state.tr.setNodeMarkup(imagePos, null, newAttrs);
      editor.view.dispatch(tr);
    };
    img.src = imageNode.attrs.src;
  };

  const resetImageSize = () => {
    if (!isImageSelected) return;

    const { state } = editor;
    const { selection } = state;

    let imagePos: any;

    state.doc.nodesBetween(selection.from, selection.to, (node, pos) => {
      if (node.type.name === 'image' || node.type.name === 'resizableImage') {
        imagePos = pos;
        const newAttrs = {
          ...node.attrs,
          width: null,
          height: null,
        };

        const tr = editor.view.state.tr.setNodeMarkup(pos, null, newAttrs);
        editor.view.dispatch(tr);
        return false;
      }
    });
  };

  const Options = [
    {
      icon: <Heading1 className="size-4" />,
      onClick: () => editor.chain().focus().toggleHeading({ level: 1 }).run(),
      pressed: editor.isActive('heading', { level: 1 }),
      disabled: isUploading,
    },
    {
      icon: <Heading2 className="size-4" />,
      onClick: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
      pressed: editor.isActive('heading', { level: 2 }),
      disabled: isUploading,
    },
    {
      icon: <Heading3 className="size-4" />,
      onClick: () => editor.chain().focus().toggleHeading({ level: 3 }).run(),
      pressed: editor.isActive('heading', { level: 3 }),
      disabled: isUploading,
    },
    {
      icon: <Bold className="size-4" />,
      onClick: () => editor.chain().focus().toggleBold().run(),
      pressed: editor.isActive('bold'),
      disabled: isUploading,
    },
    {
      icon: <Italic className="size-4" />,
      onClick: () => editor.chain().focus().toggleItalic().run(),
      pressed: editor.isActive('italic'),
      disabled: isUploading,
    },
    {
      icon: <Strikethrough className="size-4" />,
      onClick: () => editor.chain().focus().toggleStrike().run(),
      pressed: editor.isActive('strike'),
      disabled: isUploading,
    },
    {
      icon: <AlignLeft className="size-4" />,
      onClick: () => editor.chain().focus().setTextAlign('left').run(),
      pressed: editor.isActive({ textAlign: 'left' }),
      disabled: isUploading,
    },
    {
      icon: <AlignCenter className="size-4" />,
      onClick: () => editor.chain().focus().setTextAlign('center').run(),
      pressed: editor.isActive({ textAlign: 'center' }),
      disabled: isUploading,
    },
    {
      icon: <AlignRight className="size-4" />,
      onClick: () => editor.chain().focus().setTextAlign('right').run(),
      pressed: editor.isActive({ textAlign: 'right' }),
      disabled: isUploading,
    },
    {
      icon: <List className="size-4" />,
      onClick: () => editor.chain().focus().toggleBulletList().run(),
      pressed: editor.isActive('bulletList'),
      disabled: isUploading,
    },
    {
      icon: <ListOrdered className="size-4" />,
      onClick: () => editor.chain().focus().toggleOrderedList().run(),
      pressed: editor.isActive('orderedList'),
      disabled: isUploading,
    },
    {
      icon: <Highlighter className="size-4" />,
      onClick: () => editor.chain().focus().toggleHighlight().run(),
      pressed: editor.isActive('highlight'),
      disabled: isUploading,
    },
  ];

  return (
    <div className="border rounded-md p-1 mb-1 bg-slate-50 space-y-1">
      <div className="flex items-center flex-wrap gap-1">
        {Options.map((option, index) => (
          <Toggle
            key={index}
            pressed={option.pressed}
            onPressedChange={option.disabled ? undefined : option.onClick}
            disabled={option.disabled}
            className="disabled:opacity-50"
          >
            {option.icon}
          </Toggle>
        ))}

        <Button
          variant="ghost"
          size="sm"
          onClick={onImageClick}
          disabled={isUploading}
          className="h-8 w-8 p-0 disabled:opacity-50"
          type="button"
          title={isUploading ? 'Uploading...' : 'Upload image'}
        >
          {isUploading ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <ImagePlus className="size-4" />
          )}
        </Button>

        {isImageSelected && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowImageControls(!showImageControls)}
            className="h-8 px-2 text-xs"
            type="button"
            title="Image controls"
          >
            Image
          </Button>
        )}
      </div>

      {isImageSelected && showImageControls && (
        <div className="flex items-center gap-1 p-2 bg-blue-50 rounded border-t">
          <span className="text-xs text-gray-600 mr-2">Resize:</span>

          <Button
            variant="outline"
            size="sm"
            onClick={() => resizeImage(25)}
            className="h-6 px-2 text-xs"
            type="button"
            title="25% size"
          >
            25%
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => resizeImage(50)}
            className="h-6 px-2 text-xs"
            type="button"
            title="50% size"
          >
            50%
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => resizeImage(75)}
            className="h-6 px-2 text-xs"
            type="button"
            title="75% size"
          >
            75%
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => resizeImage(100)}
            className="h-6 px-2 text-xs"
            type="button"
            title="Original size"
          >
            100%
          </Button>

          <div className="w-px h-4 bg-gray-300 mx-1" />

          <Button
            variant="outline"
            size="sm"
            onClick={resetImageSize}
            className="h-6 w-6 p-0"
            type="button"
            title="Reset size"
          >
            <RotateCcw className="size-3" />
          </Button>
        </div>
      )}
    </div>
  );
}
