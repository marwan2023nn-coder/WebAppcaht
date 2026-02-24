export type ImageMode = 
  | 'logo' 
  | 'draw' 
  | 'general' 
  | 'pixel' 
  | 'emoji' 
  | 'vector' 
  | 'text_gold' 
  | 'text_diamond' 
  | 'anime' 
  | 'text_fire';

export interface ImageRequest {
  prompt: string;
  type: ImageMode;
}

export interface ImageResponse {
  image: string;
}