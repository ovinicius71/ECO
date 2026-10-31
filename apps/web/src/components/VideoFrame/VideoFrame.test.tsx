import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { VideoFrame } from './VideoFrame'

describe('VideoFrame', () => {
  it('mostra o carregamento até o player ficar pronto', () => {
    const { rerender } = render(<VideoFrame videoId="abcdefghijk" status="loading" />)
    expect(screen.getByRole('status')).toHaveTextContent('CARREGANDO VÍDEO…')

    rerender(<VideoFrame videoId="abcdefghijk" status="ready" />)
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
  })

  it('erro mostra a mensagem e o link para o YouTube', () => {
    render(
      <VideoFrame
        videoId="abcdefghijk"
        status="error"
        error="Este vídeo não permite reprodução fora do YouTube."
      />,
    )
    expect(screen.getByRole('alert')).toHaveTextContent('não permite reprodução')
    expect(screen.getByRole('link', { name: /Abrir no YouTube/ })).toHaveAttribute(
      'href',
      'https://www.youtube.com/watch?v=abcdefghijk',
    )
  })
})
