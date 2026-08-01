import { Card } from "../../components/ui/Card.tsx";
import { Button } from "../../components/ui/Button.tsx";
import { Link } from "react-router-dom";

export function ArticleTypingPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          文章打字模式
        </h1>
        <Link to="/materials">
          <Button variant="secondary">选择素材</Button>
        </Link>
      </div>
      <Card>
        <div className="text-center py-20 text-gray-400 dark:text-gray-500">
          <p className="text-lg mb-2">Phase 3 — 即将实现</p>
          <p className="text-sm">
            请先在「素材」页面选择或导入文章素材
          </p>
        </div>
      </Card>
    </div>
  );
}
