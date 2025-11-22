import React from 'react';
import { Chessboard } from 'react-chessboard';
import { Chess } from 'chess.js';

interface BoardProps {
    game: Chess;
    onMove: (sourceSquare: string, targetSquare: string, piece: string) => boolean;
    orientation: 'white' | 'black';
    customSquareStyles?: any;
    onPieceDragBegin?: (piece: string, sourceSquare: string) => void;
}

const ChessBoard: React.FC<BoardProps> = ({ game, onMove, orientation, customSquareStyles, onPieceDragBegin }) => {
    function onDrop(sourceSquare: string, targetSquare: string, piece: string) {
        return onMove(sourceSquare, targetSquare, piece);
    }

    return (
        <div className="w-full max-w-[600px] aspect-square">
            <Chessboard
                position={game.fen()}
                onPieceDrop={onDrop}
                onPieceDragBegin={onPieceDragBegin}
                boardOrientation={orientation}
                customDarkSquareStyle={{ backgroundColor: '#779954' }}
                customLightSquareStyle={{ backgroundColor: '#e9edcc' }}
                customSquareStyles={customSquareStyles}
                animationDuration={200}
            />
        </div>
    );
};

export default ChessBoard;
