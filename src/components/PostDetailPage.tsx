import { useState, useEffect } from "react";
import { ThumbsUp, ThumbsDown, MessageCircle, Share2, Eye, Clock, ArrowLeft } from "lucide-react";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { TipTapRenderer } from "./TipTapRenderer";
import { Post, postsApi } from "../lib/api";
import { navigateTo } from "../Router";
import { toast } from "sonner@2.0.3";

interface PostDetailPageProps {
  postId: string;
}

export function PostDetailPage({ postId }: PostDetailPageProps) {
  const [post, setPost] = useState<Post | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [isDisliked, setIsDisliked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [dislikeCount, setDislikeCount] = useState(0);
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState("");

  useEffect(() => {
    loadPost();
  }, [postId]);

  const loadPost = async () => {
    try {
      setIsLoading(true);
      const data = await postsApi.getById(postId);
      setPost(data);
      setLikeCount(data.likes || 0);
      setDislikeCount(Math.floor((data.likes || 0) * 0.1));
    } catch (error) {
      toast.error("Ошибка загрузки поста");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLike = () => {
    if (isLiked) {
      setLikeCount(likeCount - 1);
      setIsLiked(false);
    } else {
      if (isDisliked) {
        setDislikeCount(dislikeCount - 1);
        setIsDisliked(false);
      }
      setLikeCount(likeCount + 1);
      setIsLiked(true);
    }
  };

  const handleDislike = () => {
    if (isDisliked) {
      setDislikeCount(dislikeCount - 1);
      setIsDisliked(false);
    } else {
      if (isLiked) {
        setLikeCount(likeCount - 1);
        setIsLiked(false);
      }
      setDislikeCount(dislikeCount + 1);
      setIsDisliked(true);
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Ссылка скопирована в буфер обмена");
  };

  const handleSubmitComment = () => {
    if (newComment.trim()) {
      toast.success("Комментарий отправлен на модерацию");
      setNewComment("");
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-5 lg:pt-6 pt-1">
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <div className="h-96 bg-gray-200 animate-pulse" />
          <div className="p-6 space-y-4">
            <div className="h-8 bg-gray-200 animate-pulse rounded" />
            <div className="h-4 bg-gray-200 animate-pulse rounded w-3/4" />
          </div>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Пост не найден</p>
        <Button onClick={() => navigateTo("/")} className="mt-4">
          Вернуться на главную
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-5 lg:pt-6 pt-1">
      {/* Back button */}
      <button
        onClick={() => window.history.back()}
        className="flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="text-sm">Назад</span>
      </button>

      {/* Main post card */}
      <article className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        {/* Image */}
        {post.imageUrl && (
          <div className="relative w-full h-96 overflow-hidden">
            <ImageWithFallback
              src={post.imageUrl}
              alt={post.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Header */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
              {post.category}
            </span>
            {post.tags?.map((tag, index) => (
              <span key={index} className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                {tag}
              </span>
            ))}
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold">{post.title}</h1>

          {/* Meta info */}
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <span>{post.author}</span>
            <span>•</span>
            <span>{new Date(post.publishedAt || "").toLocaleDateString("ru-RU")}</span>
            <span>•</span>
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>{post.readTime}</span>
            </div>
            <span>•</span>
            <div className="flex items-center gap-1">
              <Eye className="w-3 h-3" />
              <span>{post.views}</span>
            </div>
          </div>

          {/* Excerpt */}
          {post.excerpt && (
            <p className="text-gray-700 border-l-4 border-blue-500 pl-4 py-2 bg-blue-50/50">
              {post.excerpt}
            </p>
          )}

          {/* Full content from TipTap */}
          {post.content && (
            <div className="prose prose-sm max-w-none pt-4 border-t border-gray-200">
              <TipTapRenderer content={post.content} />
            </div>
          )}

          {/* Action buttons */}
          <div className="flex items-center gap-2 pt-4 border-t border-gray-100">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLike}
              className={`gap-1 ${isLiked ? "text-blue-600" : "text-gray-600"}`}
            >
              <ThumbsUp className={`w-4 h-4 ${isLiked ? "fill-current" : ""}`} />
              <span className="text-xs">{likeCount}</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDislike}
              className={`gap-1 ${isDisliked ? "text-red-600" : "text-gray-600"}`}
            >
              <ThumbsDown className={`w-4 h-4 ${isDisliked ? "fill-current" : ""}`} />
              <span className="text-xs">{dislikeCount}</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowComments(!showComments)}
              className="gap-1 text-gray-600"
            >
              <MessageCircle className="w-4 h-4" />
              <span className="text-xs">{post.commentsCount || 0}</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleShare}
              className="gap-1 text-gray-600"
            >
              <Share2 className="w-4 h-4" />
            </Button>
          </div>

          {/* Comments section */}
          {showComments && (
            <div className="pt-4 border-t border-gray-200 space-y-4">
              <h3 className="font-medium">Комментарии</h3>
              
              {/* Add comment */}
              <div className="space-y-2">
                <Textarea
                  placeholder="Написать комментарий..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="min-h-20"
                />
                <Button
                  onClick={handleSubmitComment}
                  className="bg-blue-600 hover:bg-blue-700"
                  disabled={!newComment.trim()}
                >
                  Отправить
                </Button>
              </div>

              {/* Comments list placeholder */}
              <div className="text-center py-4 text-gray-500 text-sm">
                Комментариев пока нет
              </div>
            </div>
          )}
        </div>
      </article>
    </div>
  );
}
