import React, { useState, useEffect, useRef } from "react";
import "./TicTacToe.css";
import { Button } from "@chakra-ui/react";
import { useDisclosure } from "@chakra-ui/react";
import { Spinner } from "@chakra-ui/react";
import { Input } from "@chakra-ui/react";

import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
} from "@chakra-ui/react";

import { useToast } from "@chakra-ui/react";
import VisualLearningModal from "./VisualLearningModal";
import AdditionMethodModal from "./AdditionMethodModal";
import Speaker from "./Speaker";

import { parseSpeechToNumber } from "./helpers";

const Cell = ({ num, onClick: onCellClick, cells, question }) => {
  const cellValue = cells[num];
  const cellClassName = cellValue ? `cell cell-${cellValue}` : "cell";

  return (
    <td
      className={cellClassName}
      onClick={() => onCellClick(num, question.num1, question.num2)}
    >
      {cellValue ? (
        cellValue
      ) : (
        <div className="question-display">
          {" "}
          {`${question?.num1} X ${question?.num2}`}
        </div>
      )}
    </td>
  );
};

const TicTacToe = () => {
  const [turn, setTurn] = useState("X");
  const [cells, setCells] = useState(Array(9).fill(""));
  const [winner, setWinner] = useState();
  const [isDraw, setIsDraw] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [modalInfo, setModalInfo] = useState({});
  const [currAns, setCurrAns] = useState("");
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [isListening, setIsListening] = useState(false);

  const { isOpen, onOpen, onClose } = useDisclosure();
  const {
    isOpen: isVisualModalOpen,
    onOpen: onVisualModalOpen,
    onClose: onVisualModalClose,
  } = useDisclosure();
  const {
    isOpen: isAddModalOpen,
    onOpen: onAddModalOpen,
    onClose: onAddModalClose,
  } = useDisclosure();

  const toast = useToast();

  const resetSound = useRef(new Audio("/sounds/reset.mp3"));
  const cellSound = useRef(new Audio("/sounds/cell.mp3"));
  const btnSound = useRef(new Audio("/sounds/button.mp3"));
  const successSound = useRef(new Audio("/sounds/success.mp3"));
  const errorSound = useRef(new Audio("/sounds/error.mp3"));
  const backgroundMusic = useRef(new Audio("/sounds/background.mp3"));
  const celebrateSound = useRef(new Audio("/sounds/celebrate.mp3"));

  const checkwinner = (arr) => {
    let combos = {
      across: [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
      ],
      down: [
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
      ],
      diagonal: [
        [0, 4, 8],
        [2, 4, 6],
      ],
    };
    for (let combo in combos) {
      combos[combo].forEach((pattern) => {
        if (
          arr[pattern[0]] === "" ||
          arr[pattern[1]] === "" ||
          arr[pattern[2]] === ""
        ) {
        } else if (
          arr[pattern[0]] === arr[pattern[1]] &&
          arr[pattern[1]] === arr[pattern[2]]
        ) {
          setWinner(arr[pattern[0]]);
          celebrateSound.current.play();
        }
      });
    }
  };

  const handleCellClick = (cellNum, num1, num2) => {
    cellSound.current.play();

    if (winner || cells[cellNum] !== "") return;

    setModalInfo({ cellNum, num1, num2 });
    onOpen();
    speakQuestion(num1, num2);
  };

  const handleCellClaim = (cellNum) => {
    let arr = [...cells];
    if (turn === "X") {
      arr[cellNum] = "X";
      setTurn("O");
    } else {
      arr[cellNum] = "O";
      setTurn("X");
    }
    checkwinner(arr);
    setCells(arr);
    if (!arr.includes("") && !winner) {
      setIsDraw(true);
    }
  };

  const handleReset = () => {
    resetSound.current.play();

    setWinner();
    setIsDraw(false);
    setCells(Array(9).fill(""));

    setTurn("X");

    setIsDraw(false);
    setQuestions([]);
    fetchQuestions();
    setModalInfo({});
  };

  const handleSubmitAns = (num1, num2, currAns) => {
    if (!currAns) return;

    currAns = parseInt(currAns);
    const isCorrect = num1 * num2 === currAns;

    if (isCorrect) {
      successSound.current.play();
      toast({
        title: "Success!",
        description: "Your answer is correct. You have claimed this box.",
        status: "success",
        duration: 5000,
        isClosable: true,
        position: "top-right",
      });

      handleModalClose();
      handleCellClaim(modalInfo.cellNum);
    } else {
      errorSound.current.play();
      toast({
        title: "Incorrect Answer",
        description: "Please try again.",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "top-right",
      });
    }
  };

  const handleModalClose = () => {
    onClose();
    setCurrAns("");
    window.speechSynthesis.cancel();
  };

  const handleVisualModalOpen = () => {
    btnSound.current.play();
    onVisualModalOpen();
  };

  const handleAddModalOpen = () => {
    btnSound.current.play();
    onAddModalOpen();
  };

  const speakQuestion = (num1, num2) => {
    if (!window.speechSynthesis) {
      console.error("Speech Synthesis API is not supported in this browser.");
      return;
    }

    const utterance = new SpeechSynthesisUtterance(
      `What is ${num1} times ${num2}?`
    );
    utterance.lang = "en-US";
    utterance.rate = 1;
    utterance.pitch = 1;
    window.speechSynthesis.speak(utterance);
  };

  const startListening = () => {
    if (!window.SpeechRecognition && !window.webkitSpeechRecognition) {
      console.error("Speech Recognition API is not supported in this browser.");
      return;
    }

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.lang = "en-US"; // Set language
    recognition.interimResults = false; // Only final results
    recognition.maxAlternatives = 1; // Only one result

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event) => {
      const speechResult = event.results[0][0].transcript;
      console.log("Raw speech result:", speechResult);

      const number = parseSpeechToNumber(speechResult, toast);
      if (isNaN(number)) {
        console.error("Invalid input: Could not parse a number.");
        toast({
          title: "Invalid Input",
          description: "Please say a valid number.",
          status: "error",
          duration: 3000,
          isClosable: true,
          position: "top-right",
        });
      } else {
        setCurrAns(number);
        handleSubmitAns(modalInfo.num1, modalInfo.num2, number);
      }

      setIsListening(false);
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start(); // Start listening
  };

  const fetchQuestions = async () => {
    try {
      if (isError) setIsError(false);
      if (!isLoading) setIsLoading(true);

      const response = await fetch(
        `${process.env.REACT_APP_API_SERVER}/api/generate-questions/`
      );
      const data = await response.json();

      setQuestions(data.questions);
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching questions:", error);
      setIsError(true);
      setIsLoading(false);
    }
  };

  const toggleMusic = () => {
    if (isMusicPlaying) {
      backgroundMusic.current.pause();
    } else {
      backgroundMusic.current.volume = 0.1;
      backgroundMusic.current.loop = true;
      backgroundMusic.current.play().catch((error) => {
        console.error("Error resuming background music:", error);
      });
    }
    setIsMusicPlaying(!isMusicPlaying);
  };

  useEffect(() => {
    fetchQuestions();
  }, []);

  useEffect(() => {
    resetSound.current.load();
    cellSound.current.load();
    btnSound.current.load();
    successSound.current.load();
    errorSound.current.load();
    celebrateSound.current.load();

    backgroundMusic.current.volume = 0.1;
    backgroundMusic.current.loop = true;
    // backgroundMusic.current.play().catch((error) => {
    //   console.error("Error playing background music:", error);
    // });

    return () => {
      backgroundMusic.current.pause();
      backgroundMusic.current.currentTime = 0;
    };
  }, []);

  if (isLoading)
    return (
      <div className="TicTacToe__container TicTacToe__loader">
        <Spinner color="teal.500" size="xl" />
      </div>
    );

  if (isError) return <div>Error fetching questions!</div>;

  return (
    <div className="TicTacToe__container">
      <Speaker onClick={toggleMusic} isMusicPlaying={isMusicPlaying} />

      <div className={`winner ${winner || isDraw ? "show" : ""}`}>
        {winner ? `Winner is: ${winner}` : isDraw ? "Its a draw" : ""}
      </div>
      <table>
        <tbody>
          <tr>
            <Cell
              num={0}
              onClick={handleCellClick}
              cells={cells}
              question={questions[0]}
            />
            <Cell
              num={1}
              onClick={handleCellClick}
              cells={cells}
              question={questions[1]}
            />
            <Cell
              num={2}
              onClick={handleCellClick}
              cells={cells}
              question={questions[2]}
            />
          </tr>
          <tr>
            <Cell
              num={3}
              onClick={handleCellClick}
              cells={cells}
              question={questions[3]}
            />
            <Cell
              num={4}
              onClick={handleCellClick}
              cells={cells}
              question={questions[4]}
            />
            <Cell
              num={5}
              onClick={handleCellClick}
              cells={cells}
              question={questions[5]}
            />
          </tr>
          <tr>
            <Cell
              num={6}
              onClick={handleCellClick}
              cells={cells}
              question={questions[6]}
            />
            <Cell
              num={7}
              onClick={handleCellClick}
              cells={cells}
              question={questions[7]}
            />
            <Cell
              num={8}
              onClick={handleCellClick}
              cells={cells}
              question={questions[8]}
            />
          </tr>
        </tbody>
      </table>

      <Button
        className="reset-button"
        colorScheme="teal"
        onClick={handleReset}
        size="lg"
      >
        Reset
      </Button>

      <Modal isOpen={isOpen} onClose={handleModalClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Solve this question to claim the box</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <div className="Modal__question-display">
              {`${modalInfo.num1} X ${modalInfo.num2}`}
              <span> = </span>
              <Input
                value={currAns}
                onChange={(e) => setCurrAns(e.target.value)}
                onKeyDown={(e) => {
                  if (
                    !/[0-9]/.test(e.key) &&
                    e.key !== "Backspace" &&
                    e.key !== "Delete" &&
                    e.key !== "ArrowLeft" &&
                    e.key !== "ArrowRight" &&
                    e.key !== "Enter"
                  ) {
                    e.preventDefault();
                  }

                  if (e.key === "Enter") {
                    handleSubmitAns(modalInfo.num1, modalInfo.num2, e.target.value);
                  }
                }}
              />
              <Button
                colorScheme="teal"
                onClick={startListening}
                isLoading={isListening}
              />
            </div>
            <div className="Modal__ansbtn">
              <Button
                colorScheme="teal"
                onClick={() =>
                  handleSubmitAns(modalInfo.num1, modalInfo.num2, currAns)
                }
              >
                Submit Answer
              </Button>
            </div>

            <div className="Modal__learningbtns">
              <Button
                colorScheme="orange"
                variant={"outline"}
                onClick={handleVisualModalOpen}
              >
                Visual Learning
              </Button>
              <Button
                colorScheme="pink"
                variant={"outline"}
                onClick={handleAddModalOpen}
              >
                Addition Method
              </Button>
            </div>
          </ModalBody>
        </ModalContent>
      </Modal>

      <VisualLearningModal
        isOpen={isVisualModalOpen}
        onOpen={onVisualModalOpen}
        onClose={onVisualModalClose}
        num1={modalInfo.num1}
        num2={modalInfo.num2}
      />

      <AdditionMethodModal
        isOpen={isAddModalOpen}
        onOpen={onAddModalOpen}
        onClose={onAddModalClose}
        num1={modalInfo.num1}
        num2={modalInfo.num2}
      />
    </div>
  );
};

export default TicTacToe;
