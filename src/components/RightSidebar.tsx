import { Calendar, TrendingUp, Heart } from "lucide-react";
import { Button } from "./ui/button";
import { useEffect, useRef } from "react";

interface RightSidebarProps {
  onPageChange: (page: string) => void;
  currentPage?: string;
  filterContent?: React.ReactNode;
}

export function RightSidebar({ onPageChange, currentPage, filterContent }: RightSidebarProps) {
  const popularTopicsRef = useRef<HTMLDivElement>(null);
  const eventsRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const supportBlockRef = useRef<HTMLDivElement>(null);
  const mainContainerRef = useRef<HTMLDivElement>(null);

  const popularTopics = [
    { name: "Искусственный интеллект", count: 234 },
    { name: "Стартапы", count: 189 },
    { name: "Блокчейн", count: 156 },
    { name: "Финтех", count: 142 },
    { name: "EdTech", count: 128 },
  ];

  const events = [
    {
      id: 1,
      title: "TechCrunch Disrupt 2025",
      date: "15-17 ноября",
      location: "Алматы",
    },
    {
      id: 2,
      title: "Startup Weekend",
      date: "22-24 ноября",
      location: "Астана",
    },
    {
      id: 3,
      title: "AI Conference",
      date: "5-7 декабря",
      location: "Онлайн",
    },
  ];

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      
      // Use absolute scroll value for smoother behavior on small pages
      // Internal scroll completes after scrolling 500px
      const scrollDistance = Math.min(scrollTop / 500, 1);

      // Sync popular topics scroll
      if (popularTopicsRef.current) {
        const maxScroll = popularTopicsRef.current.scrollHeight - popularTopicsRef.current.clientHeight;
        if (maxScroll > 0) {
          popularTopicsRef.current.scrollTop = maxScroll * scrollDistance;
        }
      }

      // Sync events scroll
      if (eventsRef.current) {
        const maxScroll = eventsRef.current.scrollHeight - eventsRef.current.clientHeight;
        if (maxScroll > 0) {
          eventsRef.current.scrollTop = maxScroll * scrollDistance;
        }
      }

      // Sync container scroll
      if (containerRef.current) {
        const maxScroll = containerRef.current.scrollHeight - containerRef.current.clientHeight;
        if (maxScroll > 0) {
          containerRef.current.scrollTop = maxScroll * scrollDistance;
        }
      }

      // Move entire right sidebar up so "Поддержите нас" bottom aligns with "Контакты" bottom
      if (supportBlockRef.current && mainContainerRef.current) {
        const leftSidebar = document.querySelector('aside');
        const contactsButtons = leftSidebar?.querySelectorAll('button');
        
        if (leftSidebar && contactsButtons && contactsButtons.length > 0) {
          // Find the "Контакты" button (it's the last button in the footer section)
          const contactsButton = contactsButtons[contactsButtons.length - 1];
          
          if (contactsButton) {
            const contactsRect = contactsButton.getBoundingClientRect();
            const supportRect = supportBlockRef.current.getBoundingClientRect();
            
            // Calculate how much we need to move UP (negative value)
            const contactsBottom = contactsRect.bottom;
            const supportBottom = supportRect.bottom;
            const difference = supportBottom - contactsBottom;
            
            // Apply gradual upward movement based on scroll
            if (scrollTop > 0 && difference > 0) {
              // Move up gradually, maxing out when aligned
              const maxMovement = difference;
              const movement = Math.min((scrollTop / 300) * maxMovement, maxMovement);
              mainContainerRef.current.style.transform = `translateY(-${movement}px)`;
            } else {
              mainContainerRef.current.style.transform = 'translateY(0)';
            }
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [currentPage]);

  return (
    <div ref={mainContainerRef} className="sticky top-20 transition-transform duration-300 ease-out">
      <div ref={containerRef} className="space-y-5 pt-6 max-h-[calc(100vh-5rem)] overflow-y-auto scrollbar-hide">
      {/* Filter Content (if provided) */}
      {filterContent && filterContent}

      {/* Popular Topics */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-5 h-5 text-blue-600" />
          <h3 className="text-sm">Популярные темы</h3>
        </div>
        <div ref={popularTopicsRef} className="space-y-3 max-h-[300px] overflow-y-auto scrollbar-hide">
          {popularTopics.map((topic, index) => (
            <button
              key={index}
              onClick={() => onPageChange(`topic-${topic.name}`)}
              className="w-full flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg transition-colors text-left"
            >
              <span className="text-sm text-gray-700">{topic.name}</span>
              <span className="text-xs text-muted-foreground bg-gray-100 px-2 py-0.5 rounded-full">
                {topic.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Events - Hide on exhibitions and events pages */}
      {currentPage !== "exhibitions" && currentPage !== "events" && currentPage !== "upcoming-events" && (
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="w-5 h-5 text-blue-600" />
            <h3 className="text-sm">Ближайшие события</h3>
          </div>
          <div ref={eventsRef} className="space-y-4 max-h-[300px] overflow-y-auto scrollbar-hide">
            {events.map((event) => (
              <button
                key={event.id}
                onClick={() => onPageChange("upcoming-events")}
                className="w-full text-left pb-4 border-b border-gray-100 last:border-0 last:pb-0 hover:bg-gray-50 rounded-lg p-2 -m-2 transition-colors"
              >
                <h4 className="text-sm mb-1">{event.title}</h4>
                <p className="text-xs text-muted-foreground mb-0.5">{event.date}</p>
                <p className="text-xs text-muted-foreground">{event.location}</p>
              </button>
            ))}
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full mt-4"
            onClick={() => onPageChange("upcoming-events")}
          >
            Все события
          </Button>
        </div>
      )}

      {/* Support Us */}
      <div ref={supportBlockRef} className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-5 shadow-sm transition-all duration-300">
        <div className="flex items-center gap-2 mb-3">
          <Heart className="w-5 h-5 text-blue-600" />
          <h3 className="text-sm">Поддержите нас</h3>
        </div>
        <p className="text-xs text-gray-600 mb-4 leading-relaxed">
          YoungWings — независимое издание. Ваша поддержка помогает нам создавать качественный контент.
        </p>
        <Button className="w-full bg-blue-600 hover:bg-blue-700">
          Поддержать проект
        </Button>
      </div>
    </div>
    </div>
  );
}
