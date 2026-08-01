import { useState } from "react";
import { Modal } from "../../components/ui/Modal.tsx";
import { XlsxImporter } from "./XlsxImporter.tsx";
import { TextImporter } from "./TextImporter.tsx";

interface ImportWizardProps {
  open: boolean;
  onClose: () => void;
  onImported: () => void;
}

type ImportType = "select" | "xlsx" | "text";

export function ImportWizard({ open, onClose, onImported }: ImportWizardProps) {
  const [importType, setImportType] = useState<ImportType>("select");

  const handleComplete = () => {
    setImportType("select");
    onImported();
    onClose();
  };

  const handleCancel = () => {
    setImportType("select");
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={handleCancel}
      title="导入素材"
      size="lg"
    >
      {importType === "select" && (
        <div className="space-y-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            选择要导入的素材类型
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              onClick={() => setImportType("xlsx")}
              className="flex flex-col items-center gap-3 p-6 border-2 border-gray-200 dark:border-gray-700 rounded-xl hover:border-blue-400 dark:hover:border-blue-500 transition-colors cursor-pointer text-left"
            >
              <span className="text-3xl">📊</span>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                  Excel 单词表
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  导入 .xlsx 单词表文件
                </p>
              </div>
            </button>
            <button
              onClick={() => setImportType("text")}
              className="flex flex-col items-center gap-3 p-6 border-2 border-gray-200 dark:border-gray-700 rounded-xl hover:border-blue-400 dark:hover:border-blue-500 transition-colors cursor-pointer text-left"
            >
              <span className="text-3xl">📝</span>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                  文本文章
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  导入 .txt / .md 文章文件
                </p>
              </div>
            </button>
          </div>
        </div>
      )}

      {importType === "xlsx" && (
        <XlsxImporter
          onComplete={handleComplete}
          onCancel={() => setImportType("select")}
        />
      )}

      {importType === "text" && (
        <TextImporter
          onComplete={handleComplete}
          onCancel={() => setImportType("select")}
        />
      )}
    </Modal>
  );
}
