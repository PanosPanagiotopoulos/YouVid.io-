export interface Translation {
  appName: string;
  title: {
    video: string;
    downloader: string;
  };
  search: {
    placeholder: string;
    quality: {
      normal: string;
      enhanced: string;
    };
    download: string;
  };
  footer: {
    terms: string;
    privacy: string;
  };
}

export type Translations = {
  [key in 'en' | 'gr']: Translation;
};