import { useState } from "react";
import { ThumbsUp, ThumbsDown, MessageCircle, Share2, Eye, Clock } from "lucide-react";
import { Button } from "./ui/button";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { toast } from "sonner@2.0.3";
import { navigateTo, routes } from "../Router";

interface NewsCardProps {
  id: string | number;
  title: string;
  excerpt: string;
  image?: string;
  category: string;
  date: string;
  likes: number;
  comments: number;
  views: number;
  readTime: string;
  isAd?: boolean;
}

export function NewsCard({
  id,
  title,
  excerpt,
  image,
  category,
  date,
  likes: initialLikes,
  comments,
  views,
  readTime,
}: NewsCardProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [isDisliked, setIsDisliked] = useState(false);
  const [likeCount, setLikeCount] = useState(initialLikes);
  const [dislikeCount, setDislikeCount] = useState(Math.floor(initialLikes * 0.1));

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
    const postUrl = `${window.location.origin}${routes.post(String(id))}`;
    navigator.clipboard.writeText(postUrl);
    toast.success("Ссылка скопирована в буфер обмена");
  };

  return (
    <article className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300">
      {/* Header */}
      <div className="p-5 pb-4">
        <div className="flex items-start gap-3 mb-3">
          <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-white text-lg">YW</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm text-gray-900 mb-0.5">YoungWings</div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>{category}</span>
              <span>·</span>
              <span>{date}</span>
            </div>
          </div>
        </div>

        <h3 
          className="mb-3 hover:text-primary transition-colors cursor-pointer font-semibold"
          onClick={() => navigateTo(routes.post(String(id)))}
        >
          {title}
        </h3>

        <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
          {excerpt}
        </p>
      </div>

      {/* Image */}
      {image && (
        <div className="px-5 pb-4">
          <div 
            className="relative aspect-[16/9] overflow-hidden rounded-xl cursor-pointer"
            onClick={() => navigateTo(routes.post(String(id)))}
          >
            <ImageWithFallback
              src={image}
              alt={title}
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
            />
          </div>
        </div>
      )}

      {/* Show Full Button */}
      <div className="px-5 pb-4">
        <button
          onClick={() => navigateTo(routes.post(String(id)))}
          className="text-sm text-primary hover:underline"
        >
          Показать полностью
        </button>
      </div>

      {/* Footer */}
      <div className="px-5 pb-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          {/* First row: likes, dislikes, comments */}
          <div className="flex items-center gap-2 sm:gap-4 flex-wrap">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLike}
              className={`gap-1.5 h-8 px-2 hover:bg-primary/5 ${
                isLiked ? "text-blue-600 hover:text-blue-700" : "hover:text-primary"
              }`}
            >
              <ThumbsUp className={`w-4 h-4 ${isLiked ? "fill-blue-600" : ""}`} />
              <span className="text-sm">{likeCount}</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDislike}
              className={`gap-1.5 h-8 px-2 hover:bg-primary/5 ${
                isDisliked ? "text-red-600 hover:text-red-700" : "hover:text-primary"
              }`}
            >
              <ThumbsDown className={`w-4 h-4 ${isDisliked ? "fill-red-600" : ""}`} />
              <span className="text-sm">{dislikeCount}</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigateTo(routes.post(String(id)))}
              className="gap-1.5 h-8 px-2 hover:text-primary hover:bg-primary/5"
            >
              <MessageCircle className="w-4 h-4" />
              <span className="text-sm">{comments}</span>
            </Button>
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Eye className="w-4 h-4" />
              <span className="text-sm">{views}</span>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              className="gap-1.5 h-8 px-2 hover:text-primary hover:bg-primary/5"
              onClick={handleShare}
            >
              <Share2 className="w-4 h-4" />
            </Button>
          </div>

          {/* Second row: read time */}
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Clock className="w-4 h-4" />
            <span>{readTime}</span>
          </div>
        </div>
      </div>
    </article>
  );
}
