export interface InfinitiveQuestionData {
  infinitive: string;
}

export interface InfinitiveQuestion extends InfinitiveQuestionData {
  definition: string;
}

export interface ConjugateTenseQuestionData {
  yo_form: string;
  tu_form: string;
  el_form: string;
  nosotros_form: string;
  ellos_form: string;
}

export interface ConjugateTenseQuestion extends ConjugateTenseQuestionData {
  name: string;
  infinitive: string;
  hint?: string;
}

export interface Tense {
  name: string;
  yo_form: string;
  tu_form: string;
  el_form: string;
  nosotros_form: string;
  ellos_form: string;
  hint?: string;
}

export interface SpanishWordInfo {
  infinitive: string;
  definition: string;
  tenses: Tense[];
}
