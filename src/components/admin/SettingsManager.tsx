import { useState, useEffect } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { settingsApi } from "../../lib/api";
import { toast } from "sonner";

export function SettingsManager() {
  const [regions, setRegions] = useState<string[]>([]);
  const [spheres, setSpheres] = useState<string[]>([]);
  const [topics, setTopics] = useState<string[]>([]);
  const [newRegion, setNewRegion] = useState("");
  const [newSphere, setNewSphere] = useState("");
  const [newTopic, setNewTopic] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setIsLoading(true);
      const [regionsData, spheresData, topicsData] = await Promise.all([
        settingsApi.getRegions(),
        settingsApi.getSpheres(),
        settingsApi.getTopics(),
      ]);
      setRegions(regionsData);
      setSpheres(spheresData);
      setTopics(topicsData);
    } catch (error) {
      toast.error("Ошибка загрузки настроек");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddRegion = async () => {
    if (!newRegion.trim()) return;
    try {
      await settingsApi.addRegion(newRegion);
      toast.success("Регион добавлен");
      setNewRegion("");
      loadSettings();
    } catch (error) {
      toast.error("Ошибка добавления региона");
    }
  };

  const handleDeleteRegion = async (region: string) => {
    try {
      await settingsApi.deleteRegion(region);
      toast.success("Регион удален");
      loadSettings();
    } catch (error) {
      toast.error("Ошибка удаления региона");
    }
  };

  const handleAddSphere = async () => {
    if (!newSphere.trim()) return;
    try {
      await settingsApi.addSphere(newSphere);
      toast.success("Сфера добавлена");
      setNewSphere("");
      loadSettings();
    } catch (error) {
      toast.error("Ошибка добавления сферы");
    }
  };

  const handleDeleteSphere = async (sphere: string) => {
    try {
      await settingsApi.deleteSphere(sphere);
      toast.success("Сфера удалена");
      loadSettings();
    } catch (error) {
      toast.error("Ошибка удаления сферы");
    }
  };

  const handleAddTopic = async () => {
    if (!newTopic.trim()) return;
    try {
      await settingsApi.addTopic(newTopic);
      toast.success("Тема добавлена");
      setNewTopic("");
      loadSettings();
    } catch (error) {
      toast.error("Ошибка добавления темы");
    }
  };

  const handleDeleteTopic = async (topic: string) => {
    try {
      await settingsApi.deleteTopic(topic);
      toast.success("Тема удалена");
      loadSettings();
    } catch (error) {
      toast.error("Ошибка удаления темы");
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl">Настройки</h1>

      {isLoading ? (
        <div className="text-center py-12 text-gray-500">Загрузка...</div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Regions */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <h3 className="mb-4">Регионы</h3>
            
            <div className="flex gap-2 mb-4">
              <Input
                placeholder="Добавить регион..."
                value={newRegion}
                onChange={(e) => setNewRegion(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleAddRegion()}
              />
              <Button onClick={handleAddRegion} className="bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4" />
              </Button>
            </div>

            <div className="space-y-2">
              {regions.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">Регионов пока нет</p>
              ) : (
                regions.map((region) => (
                  <div
                    key={region}
                    className="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
                  >
                    <span className="text-sm">{region}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteRegion(region)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Spheres */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <h3 className="mb-4">Сферы</h3>
            
            <div className="flex gap-2 mb-4">
              <Input
                placeholder="Добавить сферу..."
                value={newSphere}
                onChange={(e) => setNewSphere(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleAddSphere()}
              />
              <Button onClick={handleAddSphere} className="bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4" />
              </Button>
            </div>

            <div className="space-y-2">
              {spheres.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">Сфер пока нет</p>
              ) : (
                spheres.map((sphere) => (
                  <div
                    key={sphere}
                    className="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
                  >
                    <span className="text-sm">{sphere}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteSphere(sphere)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Topics */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <h3 className="mb-4">Популярные темы</h3>
            
            <div className="flex gap-2 mb-4">
              <Input
                placeholder="Добавить тему..."
                value={newTopic}
                onChange={(e) => setNewTopic(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleAddTopic()}
              />
              <Button onClick={handleAddTopic} className="bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4" />
              </Button>
            </div>

            <div className="space-y-2">
              {topics.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">Тем пока нет</p>
              ) : (
                topics.map((topic) => (
                  <div
                    key={topic}
                    className="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
                  >
                    <span className="text-sm">{topic}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteTopic(topic)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Info Block */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
        <h3 className="mb-2">Информация</h3>
        <p className="text-sm text-gray-600">
          Регионы и сферы используются для фильтрации событий и выставок. Популярные темы отображаются на главной странице сайта в правом сайдбаре. 
          Добавляйте новые значения по мере необходимости.
        </p>
      </div>
    </div>
  );
}
