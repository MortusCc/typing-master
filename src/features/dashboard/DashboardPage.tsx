import { Card } from "../../components/ui/Card.tsx";
import { Button } from "../../components/ui/Button.tsx";
import { Link } from "react-router-dom";

export function DashboardPage() {
  return (
    <div className="space-y-6">
      <div className="text-center py-12">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-3">
          ⌨️ 打字大师
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-lg mb-8">
          提升打字速度，从今天开始
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link to="/word">
            <Button size="lg">开始单词练习</Button>
          </Link>
          <Link to="/article">
            <Button variant="secondary" size="lg">
              开始文章练习
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="text-center">
          <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">0</div>
          <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">今日练习次数</div>
        </Card>
        <Card className="text-center">
          <div className="text-3xl font-bold text-green-600 dark:text-green-400">--</div>
          <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">平均 WPM</div>
        </Card>
        <Card className="text-center">
          <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">--</div>
          <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">平均正确率</div>
        </Card>
      </div>
    </div>
  );
}
