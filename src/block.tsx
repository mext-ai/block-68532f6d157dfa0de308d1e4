import React, { useState, useEffect, useCallback } from 'react';

interface BlockProps {
  title?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
}

interface Card {
  id: number;
  frogType: string;
  emoji: string;
  isFlipped: boolean;
  isMatched: boolean;
}

const FROG_TYPES = [
  { type: 'tree', emoji: '🐸' },
  { type: 'poison', emoji: '🐸' },
  { type: 'bull', emoji: '🐸' },
  { type: 'glass', emoji: '🐸' },
  { type: 'fire', emoji: '🐸' },
  { type: 'ice', emoji: '🐸' },
  { type: 'golden', emoji: '🐸' },
  { type: 'spotted', emoji: '🐸' }
];

const FROG_COLORS = {
  tree: '#4CAF50',
  poison: '#9C27B0',
  bull: '#795548',
  glass: '#03DAC6',
  fire: '#FF5722',
  ice: '#03A9F4',
  golden: '#FFD700',
  spotted: '#8BC34A'
};

const Block: React.FC<BlockProps> = ({ title = "Frog Memory Game", difficulty = 'medium' }) => {
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [matches, setMatches] = useState(0);
  const [moves, setMoves] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  const [startTime, setStartTime] = useState<number>(0);
  const [elapsedTime, setElapsedTime] = useState(0);

  const getDifficultySettings = () => {
    switch (difficulty) {
      case 'easy': return { pairs: 6, gridCols: 4 };
      case 'hard': return { pairs: 8, gridCols: 4 };
      default: return { pairs: 8, gridCols: 4 };
    }
  };

  const { pairs, gridCols } = getDifficultySettings();

  const shuffleArray = <T,>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const initializeGame = useCallback(() => {
    const selectedFrogs = FROG_TYPES.slice(0, pairs);
    const cardPairs = selectedFrogs.flatMap((frog, index) => [
      {
        id: index * 2,
        frogType: frog.type,
        emoji: frog.emoji,
        isFlipped: false,
        isMatched: false
      },
      {
        id: index * 2 + 1,
        frogType: frog.type,
        emoji: frog.emoji,
        isFlipped: false,
        isMatched: false
      }
    ]);

    setCards(shuffleArray(cardPairs));
    setFlippedCards([]);
    setMatches(0);
    setMoves(0);
    setGameStarted(false);
    setGameWon(false);
    setElapsedTime(0);
  }, [pairs]);

  useEffect(() => {
    initializeGame();
  }, [initializeGame]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (gameStarted && !gameWon) {
      interval = setInterval(() => {
        setElapsedTime(Date.now() - startTime);
      }, 100);
    }
    return () => clearInterval(interval);
  }, [gameStarted, gameWon, startTime]);

  useEffect(() => {
    if (matches === pairs) {
      setGameWon(true);
      // Send completion event
      const completionEvent = {
        type: 'BLOCK_COMPLETION',
        blockId: '68532f6d157dfa0de308d1e4',
        completed: true,
        score: Math.max(1000 - moves * 10 - Math.floor(elapsedTime / 1000), 100),
        maxScore: 1000,
        timeSpent: elapsedTime,
        data: { moves, pairs, difficulty }
      };
      window.postMessage(completionEvent, '*');
      window.parent?.postMessage(completionEvent, '*');
    }
  }, [matches, pairs, moves, elapsedTime, difficulty]);

  const handleCardClick = (cardId: number) => {
    if (!gameStarted) {
      setGameStarted(true);
      setStartTime(Date.now());
    }

    const card = cards.find(c => c.id === cardId);
    if (!card || card.isFlipped || card.isMatched || flippedCards.length >= 2) {
      return;
    }

    const newFlippedCards = [...flippedCards, cardId];
    setFlippedCards(newFlippedCards);

    setCards(prevCards =>
      prevCards.map(c =>
        c.id === cardId ? { ...c, isFlipped: true } : c
      )
    );

    if (newFlippedCards.length === 2) {
      setMoves(prev => prev + 1);
      
      const [firstId, secondId] = newFlippedCards;
      const firstCard = cards.find(c => c.id === firstId);
      const secondCard = cards.find(c => c.id === secondId);

      if (firstCard && secondCard && firstCard.frogType === secondCard.frogType) {
        // Match found!
        setTimeout(() => {
          setCards(prevCards =>
            prevCards.map(c =>
              c.id === firstId || c.id === secondId
                ? { ...c, isMatched: true }
                : c
            )
          );
          setMatches(prev => prev + 1);
          setFlippedCards([]);
        }, 500);
      } else {
        // No match
        setTimeout(() => {
          setCards(prevCards =>
            prevCards.map(c =>
              c.id === firstId || c.id === secondId
                ? { ...c, isFlipped: false }
                : c
            )
          );
          setFlippedCards([]);
        }, 1000);
      }
    }
  };

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    return `${minutes}:${(seconds % 60).toString().padStart(2, '0')}`;
  };

  const getFrogName = (type: string) => {
    return type.charAt(0).toUpperCase() + type.slice(1) + ' Frog';
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #2E7D32 0%, #4CAF50 50%, #81C784 100%)',
      padding: '20px',
      fontFamily: 'Arial, sans-serif',
      color: 'white',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center'
    }}>
      <h1 style={{
        fontSize: '2.5rem',
        textAlign: 'center',
        marginBottom: '10px',
        textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
        color: '#fff'
      }}>
        🐸 {title} 🐸
      </h1>

      <div style={{
        display: 'flex',
        gap: '30px',
        marginBottom: '20px',
        flexWrap: 'wrap',
        justifyContent: 'center'
      }}>
        <div style={{
          background: 'rgba(255,255,255,0.2)',
          padding: '10px 20px',
          borderRadius: '10px',
          backdropFilter: 'blur(10px)'
        }}>
          <strong>Moves: {moves}</strong>
        </div>
        <div style={{
          background: 'rgba(255,255,255,0.2)',
          padding: '10px 20px',
          borderRadius: '10px',
          backdropFilter: 'blur(10px)'
        }}>
          <strong>Matches: {matches}/{pairs}</strong>
        </div>
        <div style={{
          background: 'rgba(255,255,255,0.2)',
          padding: '10px 20px',
          borderRadius: '10px',
          backdropFilter: 'blur(10px)'
        }}>
          <strong>Time: {formatTime(elapsedTime)}</strong>
        </div>
      </div>

      {gameWon && (
        <div style={{
          background: 'linear-gradient(45deg, #FFD700, #FFA000)',
          padding: '20px',
          borderRadius: '15px',
          marginBottom: '20px',
          textAlign: 'center',
          boxShadow: '0 8px 32px rgba(255,215,0,0.3)',
          animation: 'bounce 0.6s ease-in-out'
        }}>
          <h2 style={{ margin: '0 0 10px 0', color: '#2E7D32' }}>🎉 Congratulations! 🎉</h2>
          <p style={{ margin: '5px 0', color: '#2E7D32' }}>
            You completed the game in {moves} moves and {formatTime(elapsedTime)}!
          </p>
          <p style={{ margin: '5px 0', color: '#2E7D32' }}>
            Score: {Math.max(1000 - moves * 10 - Math.floor(elapsedTime / 1000), 100)} points
          </p>
        </div>
      )}

      <div style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${gridCols}, 1fr)`,
        gap: '15px',
        maxWidth: '600px',
        width: '100%',
        marginBottom: '20px'
      }}>
        {cards.map((card) => (
          <div
            key={card.id}
            onClick={() => handleCardClick(card.id)}
            style={{
              width: '120px',
              height: '120px',
              borderRadius: '15px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: card.isMatched ? 'default' : 'pointer',
              transition: 'all 0.3s ease',
              transform: card.isFlipped || card.isMatched ? 'rotateY(0deg)' : 'rotateY(180deg)',
              transformStyle: 'preserve-3d',
              background: card.isFlipped || card.isMatched 
                ? `linear-gradient(135deg, ${FROG_COLORS[card.frogType as keyof typeof FROG_COLORS]}, ${FROG_COLORS[card.frogType as keyof typeof FROG_COLORS]}dd)`
                : 'linear-gradient(135deg, #1B5E20, #2E7D32)',
              border: '3px solid rgba(255,255,255,0.3)',
              boxShadow: card.isMatched 
                ? '0 8px 25px rgba(76,175,80,0.4), inset 0 0 20px rgba(255,255,255,0.2)'
                : '0 4px 15px rgba(0,0,0,0.2)',
              opacity: card.isMatched ? 0.8 : 1,
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            {card.isFlipped || card.isMatched ? (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                color: 'white',
                textShadow: '1px 1px 2px rgba(0,0,0,0.5)'
              }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '5px' }}>
                  {card.emoji}
                </div>
                <div style={{ 
                  fontSize: '0.7rem', 
                  fontWeight: 'bold',
                  textTransform: 'uppercase',
                  letterSpacing: '1px'
                }}>
                  {getFrogName(card.frogType)}
                </div>
              </div>
            ) : (
              <div style={{
                fontSize: '3rem',
                color: 'rgba(255,255,255,0.4)',
                textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
              }}>
                ?
              </div>
            )}
            
            {card.isMatched && (
              <div style={{
                position: 'absolute',
                top: '5px',
                right: '5px',
                background: '#4CAF50',
                borderRadius: '50%',
                width: '20px',
                height: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '12px'
              }}>
                ✓
              </div>
            )}
          </div>
        ))}
      </div>

      <div style={{
        display: 'flex',
        gap: '15px',
        flexWrap: 'wrap',
        justifyContent: 'center'
      }}>
        <button
          onClick={initializeGame}
          style={{
            background: 'linear-gradient(45deg, #FF6B35, #FF8E53)',
            color: 'white',
            border: 'none',
            padding: '12px 24px',
            borderRadius: '25px',
            fontSize: '1rem',
            fontWeight: 'bold',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            boxShadow: '0 4px 15px rgba(255,107,53,0.3)',
            textShadow: '1px 1px 2px rgba(0,0,0,0.3)'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 6px 20px rgba(255,107,53,0.4)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 15px rgba(255,107,53,0.3)';
          }}
        >
          🔄 New Game
        </button>
      </div>

      <div style={{
        marginTop: '30px',
        textAlign: 'center',
        background: 'rgba(255,255,255,0.1)',
        padding: '15px',
        borderRadius: '10px',
        backdropFilter: 'blur(10px)',
        maxWidth: '500px'
      }}>
        <h3 style={{ margin: '0 0 10px 0', color: '#E8F5E8' }}>How to Play:</h3>
        <p style={{ margin: '5px 0', fontSize: '0.9rem', color: '#E8F5E8' }}>
          Click on cards to flip them and find matching pairs of frogs. 
          Try to complete the game with the fewest moves possible!
        </p>
        <p style={{ margin: '5px 0', fontSize: '0.8rem', color: '#C8E6C9' }}>
          Each frog type has its own unique color. Match them all to win! 🏆
        </p>
      </div>

      <style>
        {`
          @keyframes bounce {
            0%, 20%, 53%, 80%, 100% {
              transform: translate3d(0,0,0);
            }
            40%, 43% {
              transform: translate3d(0,-10px,0);
            }
            70% {
              transform: translate3d(0,-5px,0);
            }
            90% {
              transform: translate3d(0,-2px,0);
            }
          }
        `}
      </style>
    </div>
  );
};

export default Block;