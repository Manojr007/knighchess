import { Chess } from 'chess.js';

export type BotLevel = 'random' | 'medium' | 'hard';

export class BotEngine {
    async getBestMove(fen: string, level: BotLevel): Promise<string | null> {
        const chess = new Chess(fen);
        const moves = chess.moves();

        if (moves.length === 0) {
            console.log('No legal moves available for bot');
            return null;
        }

        console.log(`Bot (${level}) choosing from ${moves.length} moves`);

        if (level === 'random') {
            const randomMove = moves[Math.floor(Math.random() * moves.length)];
            console.log(`Bot chose random move: ${randomMove}`);
            return randomMove;
        }

        if (level === 'medium') {
            // Simple evaluation: prefer captures
            const captures = moves.filter(m => m.includes('x'));
            if (captures.length > 0) {
                const move = captures[Math.floor(Math.random() * captures.length)];
                console.log(`Bot chose capture: ${move}`);
                return move;
            }
            const move = moves[Math.floor(Math.random() * moves.length)];
            console.log(`Bot chose medium move: ${move}`);
            return move;
        }

        if (level === 'hard') {
            // Use Stockfish
            try {
                const stockfish = require('stockfish/src/stockfish-nnue-16.js');
                return await this.getStockfishMove(stockfish, fen);
            } catch (error) {
                console.error('Stockfish error, falling back to random:', error);
                const move = moves[Math.floor(Math.random() * moves.length)];
                console.log(`Bot chose fallback move: ${move}`);
                return move;
            }
        }

        const move = moves[Math.floor(Math.random() * moves.length)];
        console.log(`Bot chose default move: ${move}`);
        return move;
    }

    private async getStockfishMove(stockfish: any, fen: string): Promise<string> {
        return new Promise((resolve) => {
            const engine = stockfish();
            let bestMove = '';

            engine.onmessage = (event: any) => {
                const message = event.data || event;
                if (typeof message === 'string' && message.startsWith('bestmove')) {
                    bestMove = message.split(' ')[1];
                    engine.terminate();
                    resolve(bestMove);
                }
            };

            engine.postMessage('uci');
            engine.postMessage(`position fen ${fen}`);
            engine.postMessage('go depth 10');

            setTimeout(() => {
                if (!bestMove) {
                    engine.terminate();
                    const chess = new Chess(fen);
                    const moves = chess.moves();
                    resolve(moves[0]);
                }
            }, 3000);
        });
    }
}
