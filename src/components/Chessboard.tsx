import React, { useRef, useState } from "react";
import Tile from "../tile/tile";
import "./Chessboard.css";
import Referee from "../refree/Refree";
import {
  Haxis,
  Vaxis,
  GRID_SIZE,
  Piece,
  PieceType,
  TeamType,
  initialBoardState,
  Position,
  samePosition,
} from "../Constant";

export default function Chessboard() {
  const [activePiece, setActivepiece] = useState<HTMLElement | null>(null);
  const [promotionPawn, setPromotionPawn] = useState<Piece>();
  const [grabPosition, setGrabPosition] = useState<Position>({ x: -1, y: -1 });
  const [pieces, setPieces] = useState<Piece[]>(initialBoardState);
  const chessboardRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const referee = new Referee(); //declaring Refree object

  function grabpiece(e: React.MouseEvent) {
    const element = e.target as HTMLElement;
    const chessboard = chessboardRef.current;

    if (element.classList.contains("chess-piece") && chessboard) {
      const grabX = Math.floor((e.clientX - chessboard.offsetLeft) / GRID_SIZE);
      const grabY = Math.abs(
        Math.ceil((e.clientY - chessboard.offsetTop - 800) / GRID_SIZE)
      );
      setGrabPosition({ x: grabX, y: grabY });

      const x = e.clientX - GRID_SIZE / 2;
      const y = e.clientY - GRID_SIZE / 2;

      element.style.position = "absolute";
      element.style.left = `${x}px`;
      element.style.top = `${y}px`;

      setActivepiece(element);
    }
  }

  function movePiece(e: React.MouseEvent) {
    const chessboard = chessboardRef.current;

    if (activePiece && chessboard) {
      const minX = chessboard.offsetLeft - 28;
      const minY = chessboard.offsetTop - 28;
      const maxX = chessboard.offsetLeft + chessboard.clientWidth - 75;
      const maxY = chessboard.offsetTop + chessboard.clientHeight - 75;

      const x = e.clientX - 50;
      const y = e.clientY - 50;

      activePiece.style.position = "absolute";
      if (x < minX) {
        activePiece.style.left = `${minX}px`;
      }
      // if x is greater than  the minimum amount
      else if (x > maxX) {
        activePiece.style.left = `${maxX}px`;
      }
      // if x remain in constrain
      else {
        activePiece.style.left = `${x}px`;
      }

      // if y is samller than tha mininum of y
      if (y < minY) {
        activePiece.style.top = `${minY}px`;
      }
      // if y is greater than  the maximum amount
      else if (y > maxY) {
        activePiece.style.top = `${maxY}px`;
      }
      // if Y remain in constrain
      else {
        activePiece.style.top = `${y}px`;
      }
    }
  }

  function dropPiece(e: React.MouseEvent) {
    const chessboard = chessboardRef.current;
    if (activePiece && chessboard) {
      const x = Math.floor((e.clientX - chessboard.offsetLeft) / GRID_SIZE);
      const y = Math.abs(
        Math.ceil((e.clientY - chessboard.offsetTop - 800) / GRID_SIZE)
      );

      const currentPiece = pieces.find((p) =>
        samePosition(p.position, grabPosition)
      );

      if (currentPiece) {
        const validMove = referee.isValidMove(
          grabPosition,
          { x, y },
          currentPiece.type,
          currentPiece.team,
          pieces
        );

        const isEnPassantMove = referee.isEnPassantMove(
          grabPosition,
          { x, y },
          currentPiece.type,
          currentPiece.team,
          pieces
        );

        const pawnDirection = currentPiece.team === TeamType.OUR ? 1 : -1;

        if (isEnPassantMove) {
          const updatedPieces = pieces.reduce((results, piece) => {
            if (samePosition(piece.position, grabPosition)) {
              piece.enPassant = false;
              piece.position.x = x;
              piece.position.y = y;
              results.push(piece);
            } else if (
              !samePosition(piece.position, { x, y: y - pawnDirection })
            ) {
              if (piece.type === PieceType.PAWN) {
                piece.enPassant = false;
              }
              results.push(piece);
            }
            return results;
          }, [] as Piece[]);

          setPieces(updatedPieces);
        } else if (validMove) {
          //UPDATES THE PIECE POSITION
          //AND IF A PIECE IS ATTACKED, REMOVES IT
          const updatedPieces = pieces.reduce((results, piece) => {
            if (samePosition(piece.position, grabPosition)) {
              //SPECIAL MOVE
              piece.enPassant =
                Math.abs(grabPosition.y - y) === 2 &&
                piece.type === PieceType.PAWN;

              piece.position.x = x;
              piece.position.y = y;

              let promotionRow = piece.team === TeamType.OUR ? 7 : 0;

              if (y === promotionRow && piece.type === PieceType.PAWN) {
                modalRef.current?.classList.remove("hidden");
                setPromotionPawn(piece);
              }
              results.push(piece);
            } else if (!samePosition(piece.position, { x, y })) {
              if (piece.type === PieceType.PAWN) {
                piece.enPassant = false;
              }
              results.push(piece);
            }

            return results;
          }, [] as Piece[]);

          setPieces(updatedPieces);
        } else {
          // reset the piece location
          activePiece.style.position = "relative";
          activePiece.style.removeProperty("top"); //to correct is relative position
          activePiece.style.removeProperty("left");
        }
      }
      setActivepiece(null);
    }
  }

  function promotePawn(pieceType: PieceType) {
    if (promotionPawn === undefined) {
      return;
    }

    const updatedPieces = pieces.reduce((results, piece) => {
      if (samePosition(piece.position, promotionPawn.position)) {
        piece.type = pieceType;
        const teamType = piece.team === TeamType.OUR ? "w" : "b";
        let image = "";
        switch (pieceType) {
          case PieceType.ROOK: {
            image = "rook";
            break;
          }
          case PieceType.BISHOP: {
            image = "bishop";
            break;
          }
          case PieceType.KNIGHT: {
            image = "knight";
            break;
          }
          case PieceType.QUEEN: {
            image = "queen";
            break;
          }
        }
        piece.image = `assets/${image}-${teamType}.png`;
      }
      results.push(piece);
      return results;
    }, [] as Piece[]);

    setPieces(updatedPieces);

    modalRef.current?.classList.add("hidden");
  }

  function promotionTeamType() {
    return promotionPawn?.team === TeamType.OUR ? "w" : "b";
  }

  let board = [];

  for (let j = Vaxis.length - 1; j >= 0; j--) {
    for (let i = 0; i < Haxis.length; i++) {
      const number = j + i + 2;
      const piece = pieces.find((p) =>
        samePosition(p.position, { x: i, y: j })
      );
      let image = piece ? piece.image : undefined;

      board.push(<Tile key={`${j},${i}`} image={image} number={number} />);
    }
  }

  return (
    <>
      <div id="pawn-promotion-modal" className="hidden" ref={modalRef}>
        <div className="modal-body">
          <img
            onClick={() => promotePawn(PieceType.ROOK)}
            src={`/assets/rook-${promotionTeamType()}.png`}
            alt=" "
          />
          <img
            onClick={() => promotePawn(PieceType.BISHOP)}
            src={`/assets/bishop-${promotionTeamType()}.png`}
            alt=" "
          />
          <img
            onClick={() => promotePawn(PieceType.KNIGHT)}
            src={`/assets/knight-${promotionTeamType()}.png`}
            alt=" "
          />
          <img
            onClick={() => promotePawn(PieceType.QUEEN)}
            src={`/assets/queen-${promotionTeamType()}.png`}
            alt=" "
          />
        </div>
      </div>
      <div
        onMouseMove={(e) => movePiece(e)}
        onMouseDown={(e) => grabpiece(e)}
        onMouseUp={(e) => dropPiece(e)}
        id="Chessboard"
        ref={chessboardRef}
      >
        {board}
      </div>
    </>
  );
}
