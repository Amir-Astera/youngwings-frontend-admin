import { useState, useEffect } from "react";
import { Check, X, Trash2, Search } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";
import { Comment, commentsApi } from "../../lib/api";
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

export function CommentsManager() {
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteCommentId, setDeleteCommentId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  useEffect(() => {
    loadComments();
  }, []);

  const loadComments = async () => {
    try {
      setIsLoading(true);
      const data = await commentsApi.getAll();
      setComments(data);
    } catch (error) {
      toast.error("Ошибка загрузки комментариев");
    } finally {
      setIsLoading(false);
    }
  };

  const handleModerate = async (id: string, status: "approved" | "rejected") => {
    try {
      await commentsApi.moderate(id, status);
      toast.success(status === "approved" ? "Комментарий одобрен" : "Комментарий отклонен");
      loadComments();
    } catch (error) {
      toast.error("Ошибка модерации комментария");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await commentsApi.delete(id);
      toast.success("Комментарий удален");
      loadComments();
    } catch (error) {
      toast.error("Ошибка удаления комментария");
    }
    setDeleteCommentId(null);
  };

  const filteredComments = comments.filter((comment) => {
    const matchesSearch =
      comment.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      comment.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
      comment.postTitle.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === "all" || comment.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-blue-100 text-blue-600 hover:bg-blue-100">Одобрен</Badge>;
      case "rejected":
        return <Badge variant="secondary">Отклонен</Badge>;
      default:
        return <Badge variant="outline">На модерации</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl">Модерация комментариев</h1>
        <div className="flex items-center gap-2 text-sm">
          <span className="text-gray-600">
            На модерации: {comments.filter((c) => c.status === "pending").length}
          </span>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Поиск по комментариям..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm"
          >
            <option value="all">Все статусы</option>
            <option value="pending">На модерации</option>
            <option value="approved">Одобрены</option>
            <option value="rejected">Отклонены</option>
          </select>
        </div>
      </div>

      {/* Comments List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="text-center py-12 text-gray-500">Загрузка...</div>
        ) : filteredComments.length === 0 ? (
          <div className="text-center py-12 text-gray-500">Комментариев не найдено</div>
        ) : (
          filteredComments.map((comment) => (
            <div
              key={comment.id}
              className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm"
            >
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-sm">{comment.author}</span>
                    <span className="text-xs text-gray-500">
                      {new Date(comment.createdAt).toLocaleString("ru-RU")}
                    </span>
                    {getStatusBadge(comment.status)}
                  </div>
                  <div className="text-xs text-gray-500 mb-2">
                    Пост: {comment.postTitle}
                  </div>
                  <p className="text-sm text-gray-700">{comment.content}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {comment.status === "pending" && (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-green-600 hover:text-green-700 hover:bg-green-50"
                      onClick={() => handleModerate(comment.id, "approved")}
                    >
                      <Check className="w-4 h-4 mr-1" />
                      Одобрить
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                      onClick={() => handleModerate(comment.id, "rejected")}
                    >
                      <X className="w-4 h-4 mr-1" />
                      Отклонить
                    </Button>
                  </>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  onClick={() => setDeleteCommentId(comment.id)}
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  Удалить
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteCommentId} onOpenChange={() => setDeleteCommentId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Удалить комментарий?</AlertDialogTitle>
            <AlertDialogDescription>
              Это действие нельзя отменить. Комментарий будет удален навсегда.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteCommentId && handleDelete(deleteCommentId)}
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
