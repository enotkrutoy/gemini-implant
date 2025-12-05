
export interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  images?: string[]; // Data URLs (e.g., "data:image/png;base64,...")
  timestamp: number;
  isError?: boolean;
  model?: string; // Tracks which model generated this message
}

export interface ChatState {
  messages: Message[];
  isLoading: boolean;
  model: string;
}

export enum ModelType {
  AUTO = 'auto',
  PRO = 'gemini-2.5-pro',
  FLASH = 'gemini-2.5-flash',
  LITE = 'gemini-2.5-flash-lite'
}

export const MODEL_CONFIGS = [
  { id: ModelType.AUTO, label: "Auto (System Choice)", icon: "Circle", description: "Balanced performance" },
  { id: ModelType.PRO, label: "Pro 2.5", icon: "Gem", description: "Complex reasoning" },
  { id: ModelType.FLASH, label: "Flash 2.5", icon: "Zap", description: "Speed/Reasoning balance" },
  { id: ModelType.LITE, label: "Flash Lite 2.5", icon: "Leaf", description: "Simple/Fast" },
];

export const SYSTEM_INSTRUCTION = `
Ты — ImplantAI, система поддержки принятия клинических решений (CDSS).
Твоя работа строится по строгому алгоритму: **[Проблема] -> [Диагностика] -> [Решение] -> [Фиксация]**.

## СТРУКТУРА ОТВЕТА:

### 1. [Проблема] (Problem Definition)
Четко сформулируй клиническую задачу, отсутствие зубов (FDI), атрофию или эстетический дефект.

### 2. [Диагностика] (Analysis & Risk Assessment)
- **Анализ КЛКТ**: Высота/Ширина кости, Плотность (D1-D4 оценочно).
- **Анатомия**: N. alveolaris inferior, Sinus maxillaris, ментальные отверстия.
- **SAC Классификация**: Straightforward, Advanced или Complex (ITI). Обоснуй риски.

### 3. [Решение] (Treatment Planning)
- **Имплантация**: Выбор имплантата (Тип, Диаметр, Длина). Рекомендации по бренду (например, Straumann/Nobel как референс).
- **Хирургия**: Протокол (Лоскут/Безлоскутный), последовательность фрез, GBR/НКР если нужно.
- **Навигация**: Рекомендация по хирургическому шаблону.

### 4. [Фиксация] (Prosthetic & Retention)
- **Нагрузка**: Immediate, Early или Conventional. Критерии (Торк >35 Ncm, ISQ >70).
- **Ортопедия**: Тип фиксации (Винтовая/Цементная), материал абатмента.
- **Прогноз**: Ключевые факторы успеха.

## СПЕЦИАЛЬНЫЙ РЕЖИМ: ВЕРИФИКАЦИЯ ПРОЕКТА
Если пользователь присылает готовый план лечения:
1. Проведи "Stress Test" плана.
2. Найди несоответствия между [Диагностикой] и [Решением].
3. Укажи на риски, которые не были учтены.

Тон: Профессиональный, академический, директивный. Используй Markdown.
`;

export type ActionCategory = 'diagnostic' | 'surgical' | 'prosthetic' | 'general';

export interface QuickAction {
  id: string;
  label: string;
  prompt: string;
  icon: string;
  category: ActionCategory;
}

export const QUICK_ACTIONS: QuickAction[] = [
  // DIAGNOSTIC
  { 
    id: 'verify_project',
    label: "Верификация проекта", 
    prompt: "Проведи полную верификацию представленного клинического случая по протоколу: [Проблема] -> [Диагностика] -> [Решение] -> [Фиксация]. Критически оцени предложенный план лечения или составь новый, если план не предоставлен.", 
    icon: "ShieldCheck",
    category: 'diagnostic'
  },
  { 
    id: 'cbct_analysis',
    label: "Анализ КЛКТ среза", 
    prompt: "Выполни этап [Диагностика] для этого среза КЛКТ. Оцени объем кости, плотность и анатомические риски. Определи класс сложности SAC.", 
    icon: "ScanEye",
    category: 'diagnostic'
  },
  
  // SURGICAL
  { 
    id: 'surg_protocol',
    label: "Хирургический протокол", 
    prompt: "Сгенерируй этап [Решение]. Опиши последовательность сверления, выбор имплантата и необходимую аугментацию (GBR/Sinus).", 
    icon: "Syringe",
    category: 'surgical'
  },
  { 
    id: 'complications',
    label: "Анализ рисков (SAC)", 
    prompt: "Сфокусируйся на рисках этапов [Диагностика] и [Решение]. Какие осложнения возможны и как их избежать?", 
    icon: "AlertTriangle",
    category: 'surgical'
  },

  // PROSTHETIC
  { 
    id: 'loading_protocol',
    label: "Протокол нагрузки", 
    prompt: "Разработай этап [Фиксация]. Оцени возможность немедленной нагрузки. Выбери тип ортопедической конструкции.", 
    icon: "Clock",
    category: 'prosthetic'
  },
  
  // GENERAL
  { 
    id: 'full_case',
    label: "Полный разбор (4 шага)", 
    prompt: "Проведи полный разбор случая по методологии: [Проблема] -> [Диагностика] -> [Решение] -> [Фиксация].", 
    icon: "FileText",
    category: 'general'
  }
];
