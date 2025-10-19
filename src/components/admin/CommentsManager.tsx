import { useState, useEffect, useCallback } from "react";
import { Check, X, Trash2, Search } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";
import { Comment, DashboardCommentStatus, commentsApi } from "../../lib/api";
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
  const [commentToDelete, setCommentToDelete] = useState<Comment | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedStatuses, setSelectedStatuses] = useState<DashboardCommentStatus[]>([]);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 20;

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 400);

    return () => clearTimeout(handler);
  }, [searchQuery]);

  const loadComments = useCallback(
    async (page: number) => {
      const nextPage = Math.max(1, page);

      try {
        setIsLoading(true);
        const response = await commentsApi.getPage({
          page: nextPage,
          size: PAGE_SIZE,
          q: debouncedSearch || undefined,
          statuses: selectedStatuses.length > 0 ? selectedStatuses : undefined,
          dateFrom: dateFrom || undefined,
          dateTo: dateTo || undefined,
        });

        setComments(response.items);
        setTotal(response.total);
        setCurrentPage(response.page);
      } catch (error) {
        toast.error("Ошибка загрузки комментариев");
      } finally {
        setIsLoading(false);
      }
    },
    [PAGE_SIZE, debouncedSearch, selectedStatuses, dateFrom, dateTo]
  );

  useEffect(() => {
    loadComments(1);
  }, [loadComments]);

  const handleModerate = async (comment: Comment, status: DashboardCommentStatus) => {
    try {
      await commentsApi.updateStatus(comment.postId, comment.id, status);
      toast.success(status === "APPROVED" ? "Комментарий одобрен" : "Комментарий отклонен");
      await loadComments(currentPage);
    } catch (error) {
      toast.error("Ошибка модерации комментария");
    }
  };

  const handleDelete = async (comment: Comment) => {
    try {
      await commentsApi.delete(comment.postId, comment.id);
      toast.success("Комментарий удален");
      await loadComments(currentPage);
    } catch (error) {
      toast.error("Ошибка удаления комментария");
    }
    setCommentToDelete(null);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "APPROVED":
        return <Badge className="bg-blue-100 text-blue-600 hover:bg-blue-100">Одобрен</Badge>;
      case "REJECTED":
        return <Badge variant="secondary">Отклонен</Badge>;
      default:
        return <Badge variant="outline">На модерации</Badge>;
    }
  };

  const toggleStatus = (status: DashboardCommentStatus) => {
    setSelectedStatuses((prev) => {
      if (prev.includes(status)) {
        return prev.filter((item) => item !== status);
      }
      return [...prev, status];
    });
  };

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl">Модерация комментариев</h1>
        <div className="flex items-center gap-2 text-sm">
          <span className="text-gray-600">
            На модерации: {comments.filter((c) => c.status === "PENDING").length}
          </span>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
        <div className="flex flex-col gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Поиск по комментариям..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex flex-col lg:flex-row lg:items-center gap-4">
            <div className="flex flex-wrap items-center gap-3">
              {["PENDING", "APPROVED", "REJECTED"].map((status) => (
                <label key={status} className="flex items-center gap-2 text-sm text-gray-600">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-gray-300"
                    checked={selectedStatuses.includes(status as DashboardCommentStatus)}
                    onChange={() => toggleStatus(status as DashboardCommentStatus)}
                  />
                  {status === "PENDING"
                    ? "На модерации"
                    : status === "APPROVED"
                    ? "Одобрены"
                    : "Отклонены"}
                </label>
              ))}
            </div>
            <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
              <Input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="sm:w-44"
                placeholder="Дата от"
              />
              <Input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="sm:w-44"
                placeholder="Дата до"
              />
              {(searchQuery || selectedStatuses.length > 0 || dateFrom || dateTo) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedStatuses([]);
                    setDateFrom("");
                    setDateTo("");
                  }}
                >
                  Сбросить фильтры
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Comments List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="text-center py-12 text-gray-500">Загрузка...</div>
        ) : comments.length === 0 ? (
          <div className="text-center py-12 text-gray-500">Комментариев не найдено</div>
        ) : (
          comments.map((comment) => (
            <div
              key={comment.id}
              className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm"
            >
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-sm">{comment.authorName}</span>
                    <span className="text-xs text-gray-500">
                      {new Date(comment.createdAt).toLocaleString("ru-RU")}
                    </span>
                    {getStatusBadge(comment.status)}
                  </div>
                  <div className="text-xs text-gray-500 mb-2">ID поста: {comment.postId}</div>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{comment.content}</p>
                  {(comment.likeCount > 0 || comment.dislikeCount > 0) && (
                    <div className="mt-2 text-xs text-gray-500 flex gap-3">
                      {comment.likeCount > 0 && <span>👍 {comment.likeCount}</span>}
                      {comment.dislikeCount > 0 && <span>👎 {comment.dislikeCount}</span>}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {comment.status === "PENDING" && (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-green-600 hover:text-green-700 hover:bg-green-50"
                      onClick={() => handleModerate(comment, "APPROVED")}
                    >
                      <Check className="w-4 h-4 mr-1" />
                      Одобрить
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                      onClick={() => handleModerate(comment, "REJECTED")}
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
                  onClick={() => setCommentToDelete(comment)}
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  Удалить
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

      {total > 0 && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-2">
          <span className="text-sm text-gray-500">
            Страница {currentPage} из {totalPages}. Всего комментариев: {total}.
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === 1 || isLoading}
              onClick={() => loadComments(currentPage - 1)}
            >
              Предыдущая
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage >= totalPages || isLoading}
              onClick={() => loadComments(currentPage + 1)}
            >
              Следующая
            </Button>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <AlertDialog open={!!commentToDelete} onOpenChange={() => setCommentToDelete(null)}>
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
              onClick={() => commentToDelete && handleDelete(commentToDelete)}
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
