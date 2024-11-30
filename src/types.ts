export interface CartoonGeneration {
  id?: number;
  input_text: string;
  story_prompt: string;
  image_url: string;
  title: string;
  is_daily: boolean;
  created_at?: string;
}

export interface Prompt {
  id?: number;
  name: string;
  content: string;
  created_at?: string;
}