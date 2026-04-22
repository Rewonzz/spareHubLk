import { useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';

/**
 * useAuthGuard
 *
 * Returns a guard function that checks if the user is logged in before
 * running a callback. If not logged in, it opens the AuthGuardModal.
 *
 * Usage:
 *   const { guardAction, AuthGuardModalProps } = useAuthGuard();
 *
 *   // Wrap any protected action:
 *   <button onClick={() => guardAction('add to wishlist', () => handleWishlist())}>
 *     Add to Wishlist
 *   </button>
 *
 *   // Mount the modal somewhere in the tree (usually Navbar or a layout):
 *   <AuthGuardModal {...AuthGuardModalProps} />
 */
export function useAuthGuard() {
  const { isLoggedIn } = useAuth();
  const [modalOpen, setModalOpen] = useState(false);
  const [modalAction, setModalAction] = useState('perform this action');

  const guardAction = useCallback(
    (actionLabel, callback) => {
      if (isLoggedIn) {
        callback?.();
      } else {
        setModalAction(actionLabel || 'perform this action');
        setModalOpen(true);
      }
    },
    [isLoggedIn]
  );

  const closeModal = useCallback(() => setModalOpen(false), []);

  return {
    guardAction,
    AuthGuardModalProps: {
      isOpen: modalOpen,
      onClose: closeModal,
      action: modalAction,
    },
  };
}
