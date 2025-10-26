import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Eye, Search } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";
import { Post, postsApi } from "../../lib/api";
import { resolveFileUrl } from "../../lib/files";
import { PostEditor } from "./PostEditor";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";

export function PostsManager() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showEditor, setShowEditor] = useState(false);
  const [editingPostId, setEditingPostId] = useState<string | undefined>();
  const [deletePostId, setDeletePostId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterSection, setFilterSection] = useState<string>("all");

  const sectionOptions = [
    { value: "all", label: "Все разделы" },
    { value: "Бизнес и стартапы", label: "Бизнес и стартапы" },
    { value: "Экономика и финансы", label: "Экономика и финансы" },
    { value: "Рынок и аналитика", label: "Рынок и аналитика" },
    { value: "Технологии и инновации", label: "Технологии и инновации" },
    { value: "Маркетинг и бренды", label: "Маркетинг и бренды" },
    { value: "Потребление и лайфстайл", label: "Потребление и лайфстайл" },
    { value: "Международный бизнес", label: "Международный бизнес" },
    { value: "Медиа и контент", label: "Медиа и контент" },
    { value: "Мнения и аналитика", label: "Мнения и аналитика" },
    { value: "Авто и транспорт", label: "Авто и транспорт" },
  ];

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    try {
      setIsLoading(true);
      const response = await postsApi.getAll({ limit: 1000 });
      setPosts(response.items);
    } catch (error) {
      toast.error("Ошибка загрузки постов");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await postsApi.delete(id);
      toast.success("Пост удален");
      loadPosts();
    } catch (error) {
      toast.error("Ошибка удаления поста");
    }
    setDeletePostId(null);
  };

  const handleEdit = (id: string) => {
    setEditingPostId(id);
    setShowEditor(true);
  };

  const handleCreate = () => {
    setEditingPostId(undefined);
    setShowEditor(true);
  };

  const handleSave = () => {
    setShowEditor(false);
    setEditingPostId(undefined);
    loadPosts();
  };

  const filteredPosts = posts.filter((post) => {
    const lowerQuery = searchQuery.toLowerCase();
    const excerpt = (post.excerpt || post.description || "").toLowerCase();
    const title = (post.title || "").toLowerCase();
    const matchesSearch = title.includes(lowerQuery) || excerpt.includes(lowerQuery);
    const sectionValue = (post.section || post.chapter || "").trim();
    const matchesSection =
      filterSection === "all" ||
      sectionValue.toLowerCase() === filterSection.toLowerCase();
    return matchesSearch && matchesSection;
  });

  if (showEditor) {
    return (
      <PostEditor
        postId={editingPostId}
        onSave={handleSave}
        onCancel={() => setShowEditor(false)}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl">Управление постами</h1>
        <Button className="bg-blue-600 hover:bg-blue-700" onClick={handleCreate}>
          <Plus className="w-4 h-4 mr-2" />
          Создать пост
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Поиск по названию..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <select
            value={filterSection}
            onChange={(e) => setFilterSection(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm"
          >
            {sectionOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Posts List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="text-center py-12 text-gray-500">Загрузка...</div>
        ) : filteredPosts.length === 0 ? (
          <div className="text-center py-12 text-gray-500">Постов не найдено</div>
        ) : (
          filteredPosts.map((post) => {
            const rawImage = post.imageUrl || post.thumbnail || undefined;
            const imageSrc = resolveFileUrl(rawImage) ?? rawImage;
            const description = post.excerpt || post.description || "";
            const sectionLabel = post.section || post.chapter || "";
            const categoryLabel = post.category || post.topic || "—";
            const publishedDate = post.publishedAt || post.createdAt;
            const formattedDate = publishedDate
              ? new Date(publishedDate).toLocaleDateString("ru-RU")
              : "—";
            const status = post.status ?? "draft";

            return (
              <div
                key={post.id}
                className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex gap-4">
                  {imageSrc && (
                    <img
                      src={imageSrc}
                      alt={post.title}
                      className="w-32 h-24 object-cover rounded-lg flex-shrink-0"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div className="flex-1">
                        <h3 className="text-lg mb-1">{post.title}</h3>
                        <p className="text-sm text-gray-600 line-clamp-2">{description}</p>
                      </div>
                      <Badge
                        variant={status === "published" ? "default" : "secondary"}
                        className={
                          status === "published"
                            ? "bg-blue-100 text-blue-600 hover:bg-blue-100"
                            : ""
                        }
                      >
                        {status === "published" ? "Опубликован" : "Черновик"}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                      <span>{sectionLabel}</span>
                      <span>·</span>
                      <span>{categoryLabel}</span>
                      <span>·</span>
                      <span>{formattedDate}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleEdit(post.id)}>
                        <Edit className="w-4 h-4 mr-1" />
                        Редактировать
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => setDeletePostId(post.id)}
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        Удалить
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletePostId} onOpenChange={() => setDeletePostId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Удалить пост?</AlertDialogTitle>
            <AlertDialogDescription>
              Это действие нельзя отменить. Пост будет удален навсегда.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deletePostId && handleDelete(deletePostId)}
              className="bg-red-600 hover:bg-red-700"
            >
              Удалить
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
