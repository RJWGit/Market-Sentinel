export interface DJTResponse {
  url: string;
  content: string;
  account: {
    username: string;
    avatar: string;
    header: string;
  };
}

export type DJTAllResponses = DJTResponse[];

export interface GeminiResponseDJT {
  marketImpact: number;
  title: string;
  summary: string;
}
