import { useState, useEffect } from "react";
import { NewsCard } from "./NewsCard";
import { Post, postsApi } from "../lib/api";

interface SubsectionPageProps {
  title: string;
  description: string;
}

export function SubsectionPage({ title, description }: SubsectionPageProps) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadPosts();
  }, [title]);

  // Listen for posts updates
  useEffect(() => {
    const handlePostsUpdated = () => {
      loadPosts();
    };
    
    window.addEventListener("postsUpdated", handlePostsUpdated);
    return () => window.removeEventListener("postsUpdated", handlePostsUpdated);
  }, [title]);

  const loadPosts = async () => {
    try {
      setIsLoading(true);
      const response = await postsApi.getAll({ limit: 20 });
      // Filter only published posts from this subsection
      const publishedPosts = response.filter(
        (p) => p.status === "published" && (p.section === title || p.chapter === title)
      );
      setPosts(publishedPosts);
    } catch (error) {
      console.error("Error loading posts:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-3 sm:space-y-6 lg:pt-6 pt-1">
      {/* Header */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-gray-200 rounded-xl p-6">
        <h1 className="mb-2">{title}</h1>
        <p className="text-muted-foreground">{description}</p>
      </div>

      {/* News Feed */}
      <div className="space-y-5">
        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-sm text-gray-500">Загрузка...</p>
          </div>
        ) : posts.length > 0 ? (
          posts.map((post) => (
            <NewsCard 
              key={post.id}
              id={post.id}
              title={post.title}
              excerpt={post.excerpt || ""}
              image={post.imageUrl}
              category={post.category || ""}
              date={new Date(post.publishedAt || "").toLocaleDateString("ru-RU")}
              likes={post.likes || 0}
              comments={post.commentsCount || 0}
              views={post.views || 0}
              readTime={post.readTime || ""}
            />
          ))
        ) : (
          <div className="bg-white border border-gray-200 rounded-xl p-8 text-center">
            <p className="text-muted-foreground">
              Материалы в этом разделе скоро появятся. Следите за обновлениями!
            </p>
          </div>
        )}
      </div>

      {/* Load More */}
      {posts.length > 0 && (
        <div className="text-center py-4">
          <p className="text-sm text-muted-foreground">Загрузка новых публикаций...</p>
        </div>
      )}
    </div>
  );
}
