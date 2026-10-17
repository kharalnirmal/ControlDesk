import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ThemeSwitcher } from "./theme-switcher";

export function SiteHeader() {
  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex items-center gap-1 lg:gap-2 px-4 lg:px-6 w-full">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="data-vertical:self-auto mx-2 h-4"
        />
        <h1 className="font-medium text-base">Documents</h1>
      </div>
      <Separator
        orientation="vertical"
        className="data-vertical:self-auto mx-2 h-4"
      />
      <ThemeSwitcher />
    </header>
  );
}
