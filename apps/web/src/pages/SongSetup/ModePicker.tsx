import { useId, useState } from 'react'
import { Button } from '@/components/Button/Button'
import { Segmented } from '@/components/Segmented/Segmented'
import { SelectList } from '@/components/SelectList/SelectList'
import { DEFAULT_MODE_INDEX, MODES } from './modes'
import styles from './SongSetup.module.css'

/** Coluna "02 / MODO DE PRÁTICA" e o detalhe do modo escolhido. */
export function ModePicker() {
  const titleId = useId()
  const [modeIndex, setModeIndex] = useState(DEFAULT_MODE_INDEX)
  const [picks, setPicks] = useState<Record<string, string>>({})
  const mode = MODES[modeIndex] ?? MODES[0]!

  return (
    <>
      <section aria-label="Modo de prática" className={styles.modes}>
        <p className={styles.label}>02 / MODO DE PRÁTICA</p>
        <SelectList
          label="Modo"
          items={MODES}
          defaultIndex={DEFAULT_MODE_INDEX}
          getKey={(m) => m.id}
          onSelectedChange={(_, index) => setModeIndex(index)}
          renderItem={(m, { index }) => (
            <>
              <span className={styles.modeNumber}>{String(index + 1).padStart(2, '0')}</span>
              <span className={styles.modeText}>
                <span className={styles.modeName}>{m.name}</span>
                <span className={styles.modeShort}>{m.short}</span>
              </span>
              <span className={styles.mono}>—</span>
            </>
          )}
        />
      </section>

      <section aria-labelledby={titleId} className={styles.detail}>
        <div className={styles.detailHead}>
          <h2 id={titleId} className={styles.detailTitle}>
            {mode.name}
          </h2>
          <span lang="ja" className={styles.jp}>
            {mode.jp}
          </span>
        </div>
        <p className={styles.detailText}>{mode.long}</p>

        <div className={styles.settings}>
          {mode.settings.map((setting) => {
            const key = `${mode.id}-${setting.label}`
            const fallback = setting.options[setting.defaultIndex ?? 0] ?? ''
            return (
              <div key={key} className={styles.setting}>
                <p className={styles.label} aria-hidden="true">
                  {setting.label}
                </p>
                <Segmented
                  label={setting.label}
                  value={picks[key] ?? fallback}
                  onChange={(value) => setPicks((prev) => ({ ...prev, [key]: value }))}
                  options={setting.options.map((option) => ({ value: option, label: option }))}
                />
              </div>
            )
          })}
        </div>

        <p className={styles.meta}>
          MELHOR: <span className={styles.metaValue}>—</span>
          <span>
            TEMPO: <span className={styles.metaValue}>~{mode.time}</span>
          </span>
        </p>
        <Button disabled icon="arrowRight" className={styles.start}>
          Começar · em breve
        </Button>
        <p className={styles.soon}>Este modo chega na {mode.availableIn}.</p>
      </section>
    </>
  )
}
