export interface ProConItem {
  id: string;
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
}

export interface FodaItem {
  id: string;
  title: string;
  description: string;
}

export interface FodaBlock {
  fortalezas: FodaItem[];
  oportunidades: FodaItem[];
  debilidades: FodaItem[];
  amenazas: FodaItem[];
}

export interface OptionAnalysis {
  id: string;
  name: string;
  description: string;
  score: number; // 1-10
  scoreExplanation: string;
  pros: ProConItem[];
  cons: ProConItem[];
  foda: FodaBlock;
}

export interface ComparisonCell {
  text: string;
  rating: 'good' | 'neutral' | 'bad';
}

export interface ComparisonRow {
  attribute: string;
  description: string;
  optionValues: { [optionId: string]: ComparisonCell };
}

export interface DecisionResult {
  decision: string;
  options: OptionAnalysis[];
  comparisonMatrix: ComparisonRow[];
  recommendation: {
    recommendedOptionName: string;
    explanation: string;
    nextSteps: string[];
  };
}
