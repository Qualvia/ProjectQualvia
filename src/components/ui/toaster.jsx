import { useToast } from "@/components/ui/use-toast";
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast";

export function Toaster() {
  const { toasts, dismiss } = useToast();

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, icon, open, ...props }) {
        return (
          <Toast key={id} data-state={open ? "open" : "closed"} {...props}>
            <div className="flex items-start gap-2.5 w-full">
              {icon && (
                <div className="shrink-0 mt-0.5 w-7 h-7 rounded-lg bg-[#6BB68A]/12 flex items-center justify-center">
                  {icon}
                </div>
              )}
              <div className="grid gap-0.5 flex-1 min-w-0">
                {title && <ToastTitle>{title}</ToastTitle>}
                {description && (
                  <ToastDescription>{description}</ToastDescription>
                )}
              </div>
              {action}
            </div>
            <ToastClose onClick={() => dismiss(id)} />
          </Toast>
        );
      })}
      <ToastViewport />
    </ToastProvider>
  );
}