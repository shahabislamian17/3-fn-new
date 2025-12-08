
declare global {
  interface Window {
    dataLayer: any[];
  }
}

type GTMEvent = {
  event: string;
  [key: string]: any;
};

export const gtm = {
  push: (data: GTMEvent) => {
    if (typeof window !== "undefined" && window.dataLayer) {
      window.dataLayer.push(data);
    } else {
        console.log('GTM Datalayer not found, event not sent:', data);
    }
  },
};
