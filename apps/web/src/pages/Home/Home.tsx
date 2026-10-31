import styles from './Home.module.css'

export function Home() {
  return (
    <main className={styles.root}>
      <h1 className={styles.logo}>
        ECO <span lang="ja">エコ</span>
      </h1>
      <p className={styles.label}>EM CONSTRUÇÃO</p>
    </main>
  )
}
