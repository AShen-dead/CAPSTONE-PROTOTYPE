import { animate, stagger, createTimeline } from 'animejs';

// Respect user accessibility preference
const isReducedMotion = () => {
  return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

/**
 * Animate page container & staggered child elements on mount/tab transition
 */
export const animatePageEntrance = (containerElement, childSelector = '.dashboard-header, .controls-row, .filter-tabs, .recent-activity-panel, .report-controls-card, .submit-form-panel, .faculty-profile-header-card, .settings-grid') => {
  if (!containerElement || isReducedMotion()) return;

  const targets = containerElement.querySelectorAll(childSelector);
  if (!targets || targets.length === 0) {
    animate(containerElement, {
      opacity: [0, 1],
      translateY: [16, 0],
      duration: 350,
      ease: 'outCubic'
    });
    return;
  }

  animate(containerElement, {
    opacity: [0, 1],
    duration: 200,
    ease: 'outCubic'
  });

  animate(Array.from(targets), {
    opacity: [0, 1],
    translateY: [18, 0],
    duration: 400,
    delay: stagger(60),
    ease: 'outCubic'
  });
};

/**
 * Animate StatCards staggered upward entrance
 */
export const animateStatCards = (cardsContainer) => {
  if (!cardsContainer || isReducedMotion()) return;

  const cards = cardsContainer.querySelectorAll('.dashboard-card');
  if (!cards || cards.length === 0) return;

  animate(Array.from(cards), {
    opacity: [0, 1],
    translateY: [24, 0],
    scale: [0.97, 1],
    duration: 480,
    delay: stagger(75),
    ease: 'outQuart'
  });
};

/**
 * Animate numbers counting up smoothly (e.g. ₱ 0 -> ₱ 28,500.00 or 0 -> 6)
 */
export const animateNumberCounter = (element, targetValue) => {
  if (!element || isReducedMotion()) return;

  const numericString = String(targetValue).replace(/[^0-9.]/g, '');
  const finalNum = parseFloat(numericString);
  if (isNaN(finalNum)) return;

  const prefix = String(targetValue).startsWith('₱') ? '₱ ' : '';
  const isCurrency = String(targetValue).includes('₱') || String(targetValue).includes('.');

  const counterObj = { val: 0 };

  animate(counterObj, {
    val: finalNum,
    duration: 800,
    ease: 'outExpo',
    onUpdate: () => {
      if (isCurrency) {
        element.innerHTML = `${prefix}${counterObj.val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
      } else {
        element.innerHTML = `${prefix}${Math.round(counterObj.val)}`;
      }
    }
  });
};

/**
 * Animate table row entrance with subtle stagger
 */
export const animateTableRows = (tableElement) => {
  if (!tableElement || isReducedMotion()) return;

  const rows = tableElement.querySelectorAll('tbody tr');
  if (!rows || rows.length === 0) return;

  animate(Array.from(rows), {
    opacity: [0, 1],
    translateY: [10, 0],
    duration: 320,
    delay: stagger(30),
    ease: 'outCubic'
  });
};

/**
 * Animate Modal Opening: Overlay fade-in -> Modal popup
 */
export const animateModalOpen = (modalContentElement, overlayElement) => {
  if (isReducedMotion()) return;

  if (overlayElement) {
    animate(overlayElement, {
      opacity: [0, 1],
      duration: 200,
      ease: 'linear'
    });
  }

  if (modalContentElement) {
    animate(modalContentElement, {
      opacity: [0, 1],
      scale: [0.93, 1],
      translateY: [20, 0],
      duration: 380,
      ease: 'outExpo'
    });
  }
};

/**
 * Animate Modal Closing smoothly before state dismissal
 */
export const animateModalClose = (modalContentElement, overlayElement, onComplete) => {
  if (isReducedMotion()) {
    if (onComplete) onComplete();
    return;
  }

  if (modalContentElement) {
    animate(modalContentElement, {
      opacity: [1, 0],
      scale: [1, 0.94],
      translateY: [0, 12],
      duration: 180,
      ease: 'inCubic',
      onComplete: () => {
        if (overlayElement) {
          animate(overlayElement, {
            opacity: [1, 0],
            duration: 120,
            onComplete: () => {
              if (onComplete) onComplete();
            }
          });
        } else if (onComplete) {
          onComplete();
        }
      }
    });
  } else if (onComplete) {
    onComplete();
  }
};

/**
 * Animate Notification Dropdown Menu slide-down & scale
 */
export const animateNotificationDropdown = (dropdownElement) => {
  if (!dropdownElement || isReducedMotion()) return;

  animate(dropdownElement, {
    opacity: [0, 1],
    scale: [0.95, 1],
    translateY: [-10, 0],
    duration: 280,
    ease: 'outQuart'
  });
};

/**
 * Animate Button Click Feedback
 */
export const animateButtonPress = (buttonElement) => {
  if (!buttonElement || isReducedMotion()) return;

  animate(buttonElement, {
    scale: [0.96, 1],
    duration: 160,
    ease: 'outQuad'
  });
};
