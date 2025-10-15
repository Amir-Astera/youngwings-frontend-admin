import { useState, useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Underline from "@tiptap/extension-underline";
import { 
  Bold, 
  Italic,
  Underline as UnderlineIcon,
  List, 
  ListOrdered, 
  Quote, 
  Undo, 
  Redo, 
  Image as ImageIcon,
  Link as LinkIcon,
  Eye,
  Save
} from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Post, postsApi, api } from "../../lib/api";
import { toast } from "sonner";

interface PostEditorProps {
  postId?: string;
  onSave?: () => void;
  onCancel?: () => void;
}

const sections = [
  "Бизнес и стартапы",
  "Экономика и финансы",
  "Рынок и аналитика",
  "Технологии и инновации",
  "Маркетинг и бренды",
  "Потребление и лайфстайл",
  "Международный бизнес",
  "Медиа и контент",
  "Мнения и аналитика",
  "Авто и транспорт",
];

export function PostEditor({ postId, onSave, onCancel }: PostEditorProps) {
  const [showPreview, setShowPreview] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [post, setPost] = useState<Partial<Post>>({
    title: "",
    excerpt: "",
    content: "",
    section: sections[0],
    category: "",
    author: "YoungWings",
    tags: [],
    status: "draft",
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");

  const editor = useEditor({
    extensions: [
      StarterKit,
      Image,
      Link.configure({
        openOnClick: false,
      }),
      Underline,
    ],
    content: post.content || "",
    onUpdate: ({ editor }) => {
      setPost({ ...post, content: editor.getJSON() as any });
    },
  });

  useEffect(() => {
    if (postId) {
      loadPost();
    }
  }, [postId]);

  const loadPost = async () => {
    try {
      const data = await postsApi.getById(postId!);
      setPost(data);
      if (data.imageUrl) {
        setImagePreview(data.imageUrl);
      }
      if (editor && data.content) {
        editor.commands.setContent(data.content);
      }
    } catch (error) {
      toast.error("Ошибка загрузки поста");
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async (status: "draft" | "published") => {
    if (!post.title || !post.excerpt || !post.category) {
      toast.error("Заполните обязательные поля");
      return;
    }

    setIsLoading(true);
    try {
      let imageUrl = post.imageUrl;
      
      if (imageFile) {
        const uploadResult = await api.uploadImage(imageFile);
        imageUrl = uploadResult.url;
      }

      // Serialize TipTap content to JSON string
      const contentJSON = editor?.getJSON();
      const contentString = contentJSON ? JSON.stringify(contentJSON) : "";

      const postData = {
        ...post,
        imageUrl,
        content: contentString,
        status,
        publishedAt: status === "published" ? new Date().toISOString() : post.publishedAt,
        readTime: post.readTime || "5 мин", // Default read time
      };

      if (postId) {
        await postsApi.update(postId, postData);
        toast.success("Пост обновлен");
      } else {
        await postsApi.create(postData);
        if (status === "published") {
          toast.success("Пост опубликован");
        } else {
          toast.success("Пост сохранен как черновик");
        }
      }
      
      onSave?.();
    } catch (error) {
      toast.error("Ошибка сохранения поста");
    } finally {
      setIsLoading(false);
    }
  };

  const addImage = () => {
    const url = prompt("Введите URL изображения:");
    if (url && editor) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  const addLink = () => {
    const url = prompt("Введите URL ссылки:");
    if (url && editor) {
      editor.chain().focus().setLink({ href: url }).run();
    }
  };

  if (!editor) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl">{postId ? "Редактировать пост" : "Создать пост"}</h2>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowPreview(!showPreview)}>
            <Eye className="w-4 h-4 mr-2" />
            {showPreview ? "Редактор" : "Превью"}
          </Button>
          {onCancel && (
            <Button variant="outline" onClick={onCancel}>
              Отмена
            </Button>
          )}
        </div>
      </div>

      {!showPreview ? (
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Editor */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-4">
              <div>
                <Label htmlFor="title">Заголовок *</Label>
                <Input
                  id="title"
                  value={post.title}
                  onChange={(e) => setPost({ ...post, title: e.target.value })}
                  placeholder="Введите заголовок поста..."
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="excerpt">Краткое описание *</Label>
                <Textarea
                  id="excerpt"
                  value={post.excerpt}
                  onChange={(e) => setPost({ ...post, excerpt: e.target.value })}
                  placeholder="Краткое описание для карточки поста..."
                  className="mt-2 h-20"
                />
              </div>

              <div>
                <Label htmlFor="image">Обложка поста</Label>
                <div className="mt-2 space-y-3">
                  <Input
                    id="image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                  />
                  {imagePreview && (
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-48 object-cover rounded-lg"
                    />
                  )}
                </div>
              </div>
            </div>

            {/* TipTap Editor */}
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
              {/* Toolbar */}
              <div className="border-b border-gray-200 p-2 flex flex-wrap gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => editor.chain().focus().toggleBold().run()}
                  className={editor.isActive("bold") ? "bg-gray-100" : ""}
                >
                  <Bold className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => editor.chain().focus().toggleItalic().run()}
                  className={editor.isActive("italic") ? "bg-gray-100" : ""}
                >
                  <Italic className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => editor.chain().focus().toggleUnderline().run()}
                  className={editor.isActive("underline") ? "bg-gray-100" : ""}
                >
                  <UnderlineIcon className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => editor.chain().focus().toggleBulletList().run()}
                  className={editor.isActive("bulletList") ? "bg-gray-100" : ""}
                >
                  <List className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => editor.chain().focus().toggleOrderedList().run()}
                  className={editor.isActive("orderedList") ? "bg-gray-100" : ""}
                >
                  <ListOrdered className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => editor.chain().focus().toggleBlockquote().run()}
                  className={editor.isActive("blockquote") ? "bg-gray-100" : ""}
                >
                  <Quote className="w-4 h-4" />
                </Button>
                <div className="w-px h-6 bg-gray-200 mx-1" />
                <Button variant="ghost" size="sm" onClick={addImage}>
                  <ImageIcon className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={addLink}>
                  <LinkIcon className="w-4 h-4" />
                </Button>
                <div className="w-px h-6 bg-gray-200 mx-1" />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => editor.chain().focus().undo().run()}
                >
                  <Undo className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => editor.chain().focus().redo().run()}
                >
                  <Redo className="w-4 h-4" />
                </Button>
              </div>

              {/* Editor Content */}
              <div className="p-6 min-h-[400px] prose prose-sm max-w-none">
                <EditorContent editor={editor} />
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-4">
              <div>
                <Label htmlFor="section">Раздел *</Label>
                <Select
                  value={post.section}
                  onValueChange={(value) => setPost({ ...post, section: value })}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {sections.map((section) => (
                      <SelectItem key={section} value={section}>
                        {section}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="category">Категория *</Label>
                <Input
                  id="category"
                  value={post.category}
                  onChange={(e) => setPost({ ...post, category: e.target.value })}
                  placeholder="Например: Технологии"
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="tags">Теги (через запятую)</Label>
                <Input
                  id="tags"
                  value={post.tags?.join(", ")}
                  onChange={(e) =>
                    setPost({ ...post, tags: e.target.value.split(",").map((t) => t.trim()) })
                  }
                  placeholder="AI, Стартапы, Инновации"
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="author">Автор</Label>
                <Input
                  id="author"
                  value={post.author}
                  onChange={(e) => setPost({ ...post, author: e.target.value })}
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="readTime">Время чтения</Label>
                <Input
                  id="readTime"
                  value={post.readTime || ""}
                  onChange={(e) => setPost({ ...post, readTime: e.target.value })}
                  placeholder="5 мин"
                  className="mt-2"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-3">
              <Button
                className="w-full bg-blue-600 hover:bg-blue-700"
                onClick={() => handleSave("published")}
                disabled={isLoading}
              >
                <Save className="w-4 h-4 mr-2" />
                Опубликовать
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => handleSave("draft")}
                disabled={isLoading}
              >
                Сохранить черновик
              </Button>
            </div>
          </div>
        </div>
      ) : (
        // Preview using existing NewsCard design
        <div className="max-w-3xl mx-auto">
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
            {imagePreview && (
              <img src={imagePreview} alt={post.title} className="w-full h-64 object-cover" />
            )}
            <div className="p-5 pb-4">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-lg">YW</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-gray-900 mb-0.5">{post.author}</div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>{post.category}</span>
                    <span>·</span>
                    <span>Только что</span>
                  </div>
                </div>
              </div>

              <h2 className="mb-3">{post.title}</h2>
              <p className="text-gray-600 mb-4">{post.excerpt}</p>

              <div className="prose prose-sm max-w-none">
                <EditorContent editor={editor} />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
