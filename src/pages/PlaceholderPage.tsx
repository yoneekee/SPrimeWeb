import ERPLayout from "@/components/erp/ERPLayout";

interface PlaceholderPageProps {
  title: string;
  description?: string;
}

const PlaceholderPage = ({ title, description }: PlaceholderPageProps) => {
  return (
    <ERPLayout>
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center space-y-2">
          <h1 className="text-lg font-bold text-foreground">{title}</h1>
          <p className="text-sm text-muted-foreground">{description || "페이지 준비 중입니다."}</p>
        </div>
      </div>
    </ERPLayout>
  );
};

export default PlaceholderPage;
