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
  stupidityLevel: number;
  highlights: string;
  marketImpact: number;
  writingLevel: number;
  title: string;
  summary: string;
}
