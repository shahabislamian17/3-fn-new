import data from './placeholder-images.json';

type ImagePlaceholder = {
  id: string;
  description: string;
  imageUrl: string;
  imageHint: string;
};

export const placeholderImages: ImagePlaceholder[] = data.placeholderImages;

export function getPlaceholderImage(id: string): ImagePlaceholder {
    const placeholder = placeholderImages.find(p => p.id === id);
    if (!placeholder) {
        // Fallback for missing images
        return {
            id: 'fallback',
            description: 'Fallback image',
            imageUrl: 'https://picsum.photos/seed/fallback/600/400',
            imageHint: 'abstract'
        };
    }
    return placeholder;
}
