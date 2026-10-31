/**
 * Contrações do inglês → forma expandida (minúsculas, apóstrofo reto).
 * Para estender, basta adicionar uma linha. Ambíguas (he's, I'd…) usam a leitura mais comum.
 */
export const CONTRACTIONS: Readonly<Record<string, string>> = {
  "i'm": 'i am',
  "you're": 'you are',
  "we're": 'we are',
  "they're": 'they are',
  "he's": 'he is',
  "she's": 'she is',
  "it's": 'it is',
  "that's": 'that is',
  "there's": 'there is',
  "here's": 'here is',
  "what's": 'what is',
  "where's": 'where is',
  "who's": 'who is',
  "how's": 'how is',
  "let's": 'let us',
  "i've": 'i have',
  "you've": 'you have',
  "we've": 'we have',
  "they've": 'they have',
  "i'll": 'i will',
  "you'll": 'you will',
  "he'll": 'he will',
  "she'll": 'she will',
  "it'll": 'it will',
  "we'll": 'we will',
  "they'll": 'they will',
  "that'll": 'that will',
  "i'd": 'i would',
  "you'd": 'you would',
  "he'd": 'he would',
  "she'd": 'she would',
  "we'd": 'we would',
  "they'd": 'they would',
  "isn't": 'is not',
  "aren't": 'are not',
  "wasn't": 'was not',
  "weren't": 'were not',
  "don't": 'do not',
  "doesn't": 'does not',
  "didn't": 'did not',
  "haven't": 'have not',
  "hasn't": 'has not',
  "hadn't": 'had not',
  "won't": 'will not',
  "wouldn't": 'would not',
  "can't": 'can not',
  cannot: 'can not',
  "couldn't": 'could not',
  "shouldn't": 'should not',
  "mustn't": 'must not',
  "ain't": 'is not',
  "'cause": 'because',
  "'til": 'until',
  "'em": 'them',
  "c'mon": 'come on',
  "y'all": 'you all',
  gonna: 'going to',
  wanna: 'want to',
  gotta: 'got to',
  lemme: 'let me',
  gimme: 'give me',
  kinda: 'kind of',
  outta: 'out of',
}

/** Sem apóstrofo, estas formas são palavras reais: não podem valer como contração. */
const COLLIDING = new Set([
  'ill',
  'well',
  'hell',
  'shell',
  'wed',
  'id',
  'shed',
  'hed',
  'its',
  'were',
  'lets',
  'cant',
  'wont',
  'cause',
  'til',
  'em',
])

/** Mapa usado na normalização: as contrações + as variantes sem apóstrofo que não colidem. */
export const CONTRACTION_MAP: ReadonlyMap<string, string> = (() => {
  const map = new Map(Object.entries(CONTRACTIONS))
  for (const [contraction, expanded] of Object.entries(CONTRACTIONS)) {
    const bare = contraction.replaceAll("'", '')
    if (bare !== contraction && !COLLIDING.has(bare) && !map.has(bare)) map.set(bare, expanded)
  }
  return map
})()
