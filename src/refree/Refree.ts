import { PieceType, TeamType, Piece, Position } from "../Constant";

import { pawnMove } from "./rules/PawnRules";
import { knightMove } from "./rules/KnightRules";
import { kingMove } from "./rules/KingRule";
import { queenMove } from "./rules/QueenRule";
import { rookMove } from "./rules/RookRules";
import { bishopMove } from "./rules/BihsopRule";




export default class Referee {
  isEnPassantMove(
    initialPosition: Position,
    desiredPosition: Position,
    type: PieceType,
    team: TeamType,
    boardState: Piece[]
  ) {
    const pawnDirection = team === TeamType.OUR ? 1 : -1;

    if (type === PieceType.PAWN) {
      if (
        (desiredPosition.x - initialPosition.x === -1 ||
          desiredPosition.x - initialPosition.x === 1) &&
        desiredPosition.y - initialPosition.y === pawnDirection
      ) {

        const piece = boardState.find(
          (p) =>
            p.position.x === desiredPosition.x &&
            p.position.y === desiredPosition.y - pawnDirection &&
            p.enPassant
        );
        if (piece) {
          return true;
        }
      }
    }

    return false;
  }


  isValidMove(initialPosition: Position, desiredPosition: Position, type: PieceType, team: TeamType, boardState: Piece[]) {
    let validMove = false;
    switch (type) {
      case PieceType.PAWN:
        validMove = pawnMove(initialPosition, desiredPosition, team, boardState);
        break;
      case PieceType.KNIGHT:
        validMove = knightMove(initialPosition, desiredPosition, team, boardState);
        break;
      case PieceType.BISHOP:
        validMove = bishopMove(initialPosition, desiredPosition, team, boardState);
        break;
      case PieceType.ROOK:
        validMove = rookMove(initialPosition, desiredPosition, team, boardState);
        break;
      case PieceType.QUEEN:
        validMove = queenMove(initialPosition, desiredPosition, team, boardState);
        break;
      case PieceType.KING:
        validMove = kingMove(initialPosition, desiredPosition, team, boardState);
    }

    return validMove;
  }
}


