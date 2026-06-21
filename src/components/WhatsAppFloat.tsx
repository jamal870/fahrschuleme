import { useLocation } from "react-router-dom";
import { tenantConfig } from "@/config/tenant";

const WhatsAppIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 32 32" className={className} fill="currentColor" aria-hidden="true">
    <path d="M19.11 17.205c-.372 0-1.088 1.39-1.518 1.39a.63.63 0 0 1-.315-.1c-.802-.402-1.504-.817-2.163-1.447-.545-.516-1.146-1.29-1.46-1.963a.426.426 0 0 1-.073-.215c0-.33.99-.945.99-1.49 0-.143-.73-2.09-.832-2.335-.143-.372-.214-.487-.6-.487-.187 0-.36-.043-.53-.043-.302 0-.53.115-.746.315-.688.645-1.032 1.318-1.06 2.264v.114c-.015.99.472 1.977 1.017 2.78 1.23 1.82 2.506 3.41 4.554 4.34.616.287 2.035.888 2.722.888.817 0 2.15-.515 2.378-1.318.058-.215.115-.444.115-.659 0-.143-.043-.215-.158-.287-.13-.087-1.918-.972-2.32-.972zM16.041 5.5C10.337 5.5 5.5 10.337 5.5 16.041c0 1.954.555 3.819 1.604 5.43L5.5 26.5l5.196-1.578a10.51 10.51 0 0 0 5.345 1.456C21.745 26.378 26.5 21.541 26.5 15.838 26.5 10.135 21.745 5.5 16.041 5.5zm0 19.111c-1.66 0-3.244-.487-4.598-1.404l-.33-.2-3.402 1.06 1.103-3.302-.215-.34a8.692 8.692 0 0 1-1.37-4.683c0-4.812 3.917-8.73 8.73-8.73 4.812 0 8.73 3.918 8.73 8.73 0 4.812-3.918 8.87-8.73 8.87z" />
  </svg>
);

const WhatsAppFloat = () => {
  const { pathname } = useLocation();
  if (pathname.startsWith("/admin")) return null;

  const url = tenantConfig.contact.whatsappUrl;
  if (!url) return null;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Per WhatsApp kontaktieren"
      className="fixed bottom-6 left-6 z-50 flex items-center justify-center w-14 h-14 rounded-full shadow-xl hover:scale-105 transition-transform"
      style={{ backgroundColor: "#25D366" }}
    >
      <WhatsAppIcon className="w-8 h-8 text-white" />
      <span className="sr-only">WhatsApp</span>
    </a>
  );
};

export default WhatsAppFloat;
