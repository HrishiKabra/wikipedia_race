import { useRef } from 'react'
import { SetupScreen } from './components/SetupScreen'
import { GameScreen } from './components/GameScreen'
import { FinishedScreen } from './components/FinishedScreen'
import { useGame } from './hooks/useGame'

export default function App() {
  const {
    state,
    isLoading,
    getElapsed,
    shuffle,
    setStartArticle,
    setTargetArticle,
    startGame,
    navigateTo,
    browserBack,
    browserForward,
    giveUp,
    playAgain,
  } = useGame()

  const finalElapsedRef = useRef(0)

  if (state.phase === 'playing') {
    finalElapsedRef.current = getElapsed()
  }

  switch (state.phase) {
    case 'setup':
      return (
        <SetupScreen
          start={state.start}
          target={state.target}
          onStart={startGame}
          onShuffle={shuffle}
          onSetStart={setStartArticle}
          onSetTarget={setTargetArticle}
        />
      )

    case 'playing':
      return (
        <GameScreen
          state={state}
          getElapsed={getElapsed}
          isLoading={isLoading}
          onNavigate={navigateTo}
          onBack={browserBack}
          onForward={browserForward}
          onGiveUp={giveUp}
        />
      )

    case 'finished':
      return (
        <FinishedScreen
          state={state}
          finalElapsed={finalElapsedRef.current}
          onPlayAgain={playAgain}
        />
      )
  }
}
