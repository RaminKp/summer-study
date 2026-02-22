import React from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
} from "@chakra-ui/react";
import "./VisualLearningModal.css";

const VisualLearningModal = ({ isOpen, onOpen, onClose, num1, num2 }) => {
  const handleModalClose = () => {
    onClose();
  };

  return (
    <Modal size={"2xl"} isOpen={isOpen} onClose={handleModalClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalCloseButton />
        <ModalBody className="VisualLearningModal__container">
          <div className="VisualLearningModal">
            <div className="VisualLearningModal__question-display">
              {`${num1} X ${num2}`}
            </div>

            <div className="VisualLearningModal__top">
              <div className="VisualLearningModal__block VisualLearningModal__hidden-block">
                
              </div>
              <div className="VisualLearningModal__parentBlockRow">
                
                {new Array(num2).fill("").map(() => {
                  return (
                    <div className="VisualLearningModal__block"></div>
                  );
                })}
              </div>
            </div>

            <div className="VisualLearningModal__parentMain">
              <div className="VisualLearningModal__parentBlockCol">
                
                {new Array(num1).fill("").map(() => {
                  return (
                    <div className="VisualLearningModal__block"></div>
                  );
                })}
              </div>

              <div>
                {new Array(num1).fill("").map((_, idx) => {
                  return (
                    <div
                      className={`${
                        idx === 0
                          ? "VisualLearningModal__parentBlockRow VisualLearningModal__parentBlockRowMain VisualLearningModal__parentBlockRowFirst"
                          : "VisualLearningModal__parentBlockRow VisualLearningModal__parentBlockRowMain"
                      }`}
                    >
                      
                      {new Array(num2).fill("").map(() => {
                        return (
                          <div className="VisualLearningModal__block"></div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default VisualLearningModal;
