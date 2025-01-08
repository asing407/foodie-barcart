import { useIsMobile } from "@/hooks/use-mobile";
import { QRCodeSVG } from "qrcode.react";

export const QRCodeSection = () => {
  const isMobile = useIsMobile();
  const currentUrl = window.location.href;

  const handleQrCodeClick = () => {
    if (isMobile) {
      window.open(currentUrl, '_blank');
    }
  };

  return (
    <div className="bg-muted py-12 mb-12">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-center gap-8">
          <div className="text-center md:text-left md:w-1/2">
            <h2 className="text-3xl font-bold mb-4">Quick Access Menu</h2>
            <p className="text-lg text-gray-600 max-w-md">
              {isMobile 
                ? "Tap the QR code to open our menu in a new tab"
                : "Scan this QR code with your phone to instantly access our menu"}
            </p>
          </div>
          <button 
            onClick={handleQrCodeClick}
            className="bg-white p-8 rounded-lg shadow-lg transition-transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <QRCodeSVG 
              value={currentUrl}
              size={128}
              level="H"
              includeMargin={true}
            />
            <p className="mt-4 text-sm text-gray-500">
              {isMobile ? "Tap to open menu" : "Scan to view menu"}
            </p>
          </button>
        </div>
      </div>
    </div>
  );
};