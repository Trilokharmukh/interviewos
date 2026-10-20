export interface Lesson {
  id: string;
  title: string;
  category: string;
  level: string;
  minutes: number;
  summary: string;
  analogy: string;
  takeaways: string[];
  flow: string[];
  sections: { heading: string; body: string }[];
  code: string;
  walkthrough: string[];
  interview: { question: string; answer: string };
  quiz: {
    question: string;
    options: string[];
    correct: number;
    explanation: string;
  };
}
export interface DeepDive {
  intro: string;
  chapters: {
    heading: string;
    paragraphs: string[];
    code?: string;
    steps?: string[];
  }[];
  visual?: {
    title: string;
    frames: {
      caption: string;
      stack?: string[];
      detail: string;
      [key: string]: unknown;
    }[];
  };
  pitfalls: string[];
  questions: { q: string; a: string }[];
  say: string;
}
