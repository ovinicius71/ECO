import type { ModeId } from '@/types/practice'

export interface ModeSetting {
  label: string
  options: readonly string[]
  defaultIndex?: number
}

export interface PracticeMode {
  id: ModeId
  name: string
  jp: string
  short: string
  long: string
  /** Estimativa exibida em "TEMPO". */
  time: string
  settings: readonly ModeSetting[]
  /** Parte que liga o botão Começar deste modo. */
  availableIn: string
}

const CORRECTION: ModeSetting = { label: 'CORREÇÃO', options: ['Tolerante', 'Estrita'] }
const SPEED: ModeSetting = {
  label: 'VELOCIDADE',
  options: ['0,5×', '0,75×', '1×'],
  defaultIndex: 2,
}
const LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']

// Textos do artboard design/artboards/Setup.dc.html.
export const MODES: readonly PracticeMode[] = [
  {
    id: 'digitar',
    name: 'Digitar Junto',
    jp: '一緒に打つ',
    short: 'Digite as legendas em sincronia',
    long: 'A letra corre com a música e você digita cada verso enquanto ele toca. Treina velocidade e ortografia sem parar o ritmo.',
    time: '4 min',
    settings: [SPEED, CORRECTION, { label: 'TRADUÇÃO', options: ['Mostrar', 'Ocultar'] }],
    availableIn: 'Parte 06',
  },
  {
    id: 'preencher',
    name: 'Preencher',
    jp: '穴埋め',
    short: 'Complete as palavras que faltam',
    long: 'Algumas palavras somem da letra conforme o seu nível. Ouça e complete as lacunas antes do verso acabar.',
    time: '5 min',
    settings: [
      { label: 'NÍVEL DAS LACUNAS', options: LEVELS, defaultIndex: 2 },
      { label: 'DENSIDADE', options: ['10%', '25%', '40%', '50%'], defaultIndex: 1 },
      CORRECTION,
    ],
    availableIn: 'Parte 07',
  },
  {
    id: 'ditado',
    name: 'Ditado',
    jp: '書き取り',
    short: 'Ouça e digite o que ouve',
    long: 'Sem letra na tela. O vídeo pausa no fim de cada verso e você escreve o que ouviu. Repita quantas vezes quiser.',
    time: '8 min',
    settings: [
      { label: 'PAUSA AUTOMÁTICA', options: ['Fim do verso', 'Desligada'] },
      SPEED,
      CORRECTION,
    ],
    availableIn: 'Parte 05',
  },
  {
    id: 'escolha',
    name: 'Múltipla escolha',
    jp: '選択',
    short: 'Escolha a palavra certa',
    long: 'A lacuna vem com opções parecidas no som ou no sentido. Ótimo para começar antes de digitar.',
    time: '4 min',
    settings: [
      { label: 'OPÇÕES', options: ['3', '4'], defaultIndex: 1 },
      { label: 'NÍVEL', options: LEVELS, defaultIndex: 2 },
    ],
    availableIn: 'Parte 11',
  },
  {
    id: 'karaoke',
    name: 'Karaokê',
    jp: 'カラオケ',
    short: 'Cante e treine a pronúncia',
    long: 'Cante junto. O microfone compara sua fala com a letra palavra por palavra e aponta onde a pronúncia escapou.',
    time: '4 min',
    settings: [{ label: 'LETRA NA TELA', options: ['Completa', 'Só o verso atual'] }, SPEED],
    availableIn: 'Parte 12',
  },
  {
    id: 'assistir',
    name: 'Assistir',
    jp: '鑑賞',
    short: 'Apenas assista com legendas',
    long: 'Assista com a letra e a tradução lado a lado. Clique em qualquer palavra para ver o significado e salvar no vocabulário.',
    time: '4 min',
    settings: [{ label: 'TRADUÇÃO', options: ['Abaixo do verso', 'Ao passar o mouse', 'Ocultar'] }],
    availableIn: 'Parte 08',
  },
]

/** O artboard abre com o Ditado selecionado. */
export const DEFAULT_MODE_INDEX = 2
