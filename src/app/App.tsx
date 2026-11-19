import { ToastHost } from "@/common/ui-kit/toast";
import { Dashboard } from "@/pages/dashboard";

export function App() {
  return (
    <ToastHost>
      <Dashboard />
    </ToastHost>
  );
}
