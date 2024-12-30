import React, {
    useState,
    useEffect,
    useRef,
    useCallback,
    ReactPortal,
    createPortal,
    ReactNode,
    useMemo,
} from 'react'
import ReactDOM from 'react-dom'
import Button from '@/components/Button'

interface ModalProps {
    isOpen: boolean
    onClose: () => void
    children: ReactNode
    className?: string
}

const Modal: React.FC<ModalProps> = React.memo(({ isOpen, onClose, children, className }) => {
    const [modalRoot, setModalRoot] = useState<HTMLElement | null>(null)
    const modalRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (!isOpen) return;

        let root = document.getElementById('modal-root');
            
        if (!root) {
            root = document.createElement('div');
            root.setAttribute('id', 'modal-root');
            document.body.appendChild(root);
        }
        
        setModalRoot(root);

          const handleKeyDown = (event: KeyboardEvent) => {
                if (event.key === 'Escape' && isOpen) {
                    onClose();
                }
               if (event.key === 'Tab' && isOpen) {
                     handleTabKey(event);
               }
            };

            document.addEventListener('keydown', handleKeyDown);

            return () => {
                  document.removeEventListener('keydown', handleKeyDown)
                if(root) {
                     if (!isOpen && root.children.length === 0) {
                        document.body.removeChild(root);
                    }
                }
               
            };
    }, [isOpen, onClose]);

    const handleTabKey = useCallback((event: KeyboardEvent) => {
          if (!modalRef.current) return;
            const focusableElements = modalRef.current.querySelectorAll(
                'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
            )
            const first = focusableElements[0] as HTMLElement;
            const last = focusableElements[focusableElements.length - 1] as HTMLElement;

            if (!first || !last) return;

            if (event.shiftKey) {
                if (document.activeElement === first) {
                    last.focus();
                    event.preventDefault();
                }
            } else {
                if (document.activeElement === last) {
                    first.focus();
                    event.preventDefault();
                }
            }
    }, []);
    

    const modalContent = useMemo(() => {
            if (!isOpen || !modalRoot) {
                    return null
                }
          
                return (
                  <div
                    ref={modalRef}
                    className={fixed top-0 left-0 w-full h-full bg-gray-900 bg-opacity-75 flex justify-center items-center z-50  ${className}}
                    aria-modal="true"
                    role="dialog"
                  >
                    <div
                        className="bg-white rounded-lg p-6 shadow-xl max-h-[90vh] overflow-y-auto relative outline-none"
                    >
                         <div className="absolute top-2 right-2">
                            <Button onClick={onClose}>Close</Button>
                        </div>
                        {children}
                    </div>
                </div>
              );
      }, [isOpen, modalRoot, children, onClose, className]);
       
    if (!isOpen || !modalRoot) {
        return null;
    }

    try {
         return createPortal(modalContent, modalRoot);
      } catch (error) {
         if (import.meta.env.MODE === 'development') {
               console.error('Error creating modal portal:', error);
         }
            return null;
     }
});

export default Modal