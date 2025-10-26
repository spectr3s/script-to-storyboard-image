
export enum AppTab {
  Storyboard,
  Chat,
}

export interface Scene {
  id: number;
  description: string;
  image?: string;
  isLoading?: boolean;
  error?: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
}
