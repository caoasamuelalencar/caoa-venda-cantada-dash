"use client";

import { useRef, type PointerEvent as ReactPointerEvent } from "react";

type HorizontalDragState = {
  pointerId: number | null;
  isDragging: boolean;
  hasMoved: boolean;
  startX: number;
  startScrollLeft: number;
};

const dragStartThreshold = 4;

export function useHorizontalDragScroll<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const dragStateRef = useRef<HorizontalDragState>({
    pointerId: null,
    isDragging: false,
    hasMoved: false,
    startX: 0,
    startScrollLeft: 0,
  });

  const resetDragState = (pointerId: number) => {
    const container = ref.current;
    const dragState = dragStateRef.current;

    dragStateRef.current = {
      pointerId: null,
      isDragging: false,
      hasMoved: false,
      startX: 0,
      startScrollLeft: 0,
    };

    if (container && dragState.pointerId === pointerId && container.hasPointerCapture(pointerId)) {
      container.releasePointerCapture(pointerId);
    }
  };

  const onPointerDown = (event: ReactPointerEvent<T>) => {
    if (event.pointerType !== "mouse" || event.button !== 0) {
      return;
    }

    const container = ref.current;
    if (!container || container.scrollWidth <= container.clientWidth) {
      return;
    }

    dragStateRef.current = {
      pointerId: event.pointerId,
      isDragging: true,
      hasMoved: false,
      startX: event.clientX,
      startScrollLeft: container.scrollLeft,
    };
  };

  const onPointerMove = (event: ReactPointerEvent<T>) => {
    const container = ref.current;
    const dragState = dragStateRef.current;

    if (
      !container ||
      !dragState.isDragging ||
      dragState.pointerId !== event.pointerId ||
      event.pointerType !== "mouse"
    ) {
      return;
    }

    const delta = event.clientX - dragState.startX;

    // Não capture o ponteiro nem cancele o comportamento padrão no primeiro
    // toque. Assim, botões dentro de uma área rolável continuam recebendo
    // seus cliques; o arraste só começa após um deslocamento real.
    if (!dragState.hasMoved) {
      if (Math.abs(delta) < dragStartThreshold) {
        return;
      }

      dragState.hasMoved = true;
      container.setPointerCapture(event.pointerId);
    }

    // Reduzir a agressividade do scroll aplicando um fator de amortecimento
    const dampedDelta = delta * 0.65;
    container.scrollLeft = dragState.startScrollLeft - dampedDelta;
    event.preventDefault();
  };

  const onPointerUp = (event: ReactPointerEvent<T>) => {
    if (dragStateRef.current.pointerId === event.pointerId) {
      resetDragState(event.pointerId);
    }
  };

  const onPointerCancel = (event: ReactPointerEvent<T>) => {
    if (dragStateRef.current.pointerId === event.pointerId) {
      resetDragState(event.pointerId);
    }
  };

  return {
    ref,
    onPointerCancel,
    onPointerDown,
    onPointerMove,
    onPointerUp,
  };
}
