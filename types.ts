
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
Ты — ImplantAI, передовая система поддержки принятия клинических решений (CDSS) для имплантологов.
Тон: Профессиональный, академический, лаконичный. Используй медицинскую терминологию (FDI, ITI классификации).

## КЛЮЧЕВЫЕ ЗАДАЧИ:
1. **Анализ КЛКТ/ОПТГ**: Оценка высоты/ширины кости, плотности (Hounsfield units - оценочно), анатомии (N. alveolaris inferior, Sinus maxillaris).
2. **Планирование**: Выбор имплантатов (Roxolid, TiZr, Grade 4), протоколы нагрузки (Immediate, Early, Conventional).
3. **Классификация рисков**: ITI SAC (Straightforward, Advanced, Complex).
4. **Хирургические протоколы**: Разрезы, сверление, торк, GBR/GTR.

## СТРУКТУРА ОТВЕТА:
- Используй Markdown.
- **Bold** для ключевых находок.
- Таблицы для планов лечения.
- Предупреждения (Red flags) выделяй отдельно.
- Ссылайся на современные гайдлайны (ITI, EAO).
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
    id: 'cbct_analysis',
    label: "Анализ КЛКТ среза", 
    prompt: "Проанализируй предоставленный срез КЛКТ. Опиши: 1) Видимые анатомические структуры. 2) Предполагаемую высоту и ширину альвеолярного гребня. 3) Плотность кости (Type D1-D4). 4) Признаки патологии.", 
    icon: "ScanEye",
    category: 'diagnostic'
  },
  { 
    id: 'sac_class',
    label: "SAC Классификация", 
    prompt: "На основе описанной ситуации проведи классификацию сложности по ITI SAC (Straightforward, Advanced, Complex). Обоснуй выбор категории для хирургического и ортопедического этапов.", 
    icon: "Activity",
    category: 'diagnostic'
  },
  
  // SURGICAL
  { 
    id: 'surg_protocol',
    label: "Хирургический протокол", 
    prompt: "Составь пошаговый хирургический протокол для данного случая. Укажи: последовательность фрез, рекомендуемый торк при установке, необходимость и тип костной аугментации (НКР, Синус-лифтинг).", 
    icon: "Syringe",
    category: 'surgical'
  },
  { 
    id: 'complications',
    label: "Анализ осложнений", 
    prompt: "Перечисли возможные интраоперационные и постоперационные осложнения для данной локализации и анатомии. Как их предотвратить?", 
    icon: "AlertTriangle",
    category: 'surgical'
  },

  // PROSTHETIC
  { 
    id: 'loading_protocol',
    label: "Протокол нагрузки", 
    prompt: "Оцени возможность немедленной нагрузки (Immediate Loading) в данном случае. Какие условия должны быть соблюдены (ISQ, торк)?", 
    icon: "Clock",
    category: 'prosthetic'
  },
  
  // GENERAL
  { 
    id: 'patient_memo',
    label: "Памятка пациенту", 
    prompt: "Сгенерируй профессиональную памятку для пациента после операции синус-лифтинга и имплантации. Режим, медикаменты, тревожные симптомы.", 
    icon: "FileText",
    category: 'general'
  }
];