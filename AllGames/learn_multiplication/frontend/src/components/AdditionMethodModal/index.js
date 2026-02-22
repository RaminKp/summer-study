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
import "./AdditionMethodModal.css";

const AdditionMethodModal = ({ isOpen, onOpen, onClose, num1, num2 }) => {
  const handleModalClose = () => {
    onClose();
  };

  return (
    <Modal size={"5xl"} isOpen={isOpen} onClose={handleModalClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalCloseButton />
        <ModalBody className="AdditionMethodModal__container">
          <div className="AdditionMethodModal">
            <h2>
              {`${num1} X ${num2}`} = Adding {num1}, {num2} times:
            </h2>
            <div className="AdditionMethodModal__steps">
              {new Array(num2).fill(num1).map((value, index) => (
                <div key={index} className="AdditionMethodModal__step">
                  {`${value} ${index !== num2 - 1 ? " + " : " = ?"}`}
                </div>
              ))}
            </div>
            
          </div>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default AdditionMethodModal;
